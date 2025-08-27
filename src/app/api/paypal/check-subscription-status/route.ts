import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// PayPal API 基础URL
const PAYPAL_API_BASE = process.env.PAYPAL_ENVIRONMENT === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

// 获取PayPal访问令牌
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  console.log('Requesting PayPal access token from:', `${PAYPAL_API_BASE}/v1/oauth2/token`)
  console.log('PayPal environment:', process.env.PAYPAL_ENVIRONMENT)
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  console.log('PayPal token response status:', response.status)
  
  const data = await response.json()
  console.log('PayPal token response data:', data)
  
  if (!response.ok) {
    throw new Error(`PayPal token request failed: ${response.status} ${JSON.stringify(data)}`)
  }
  
  return data.access_token
}

// 检查PayPal订阅状态
async function checkPayPalSubscriptionStatus(accessToken: string, subscriptionId: string) {
  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })

  return await response.json()
}

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, userEmail } = await request.json()

    console.log('Checking subscription status:', { subscriptionId, userEmail })

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Missing subscription ID' },
        { status: 400 }
      )
    }

    // 1. 首先检查数据库中的用户状态
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (userError || !user) {
      console.error('User not found:', userEmail, userError)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 2. 检查用户是否已经有这个订阅ID并且状态为active
    if (user.subscription_id === subscriptionId && user.subscription_status === 'active') {
      console.log('Subscription already active in database')
      return NextResponse.json({
        success: true,
        status: 'active',
        message: 'Subscription is already active'
      })
    }

    // 3. 从PayPal API检查订阅状态
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      throw new Error('Failed to get PayPal access token')
    }

    const paypalSubscription = await checkPayPalSubscriptionStatus(accessToken, subscriptionId)
    console.log('PayPal subscription status:', paypalSubscription)

    if (paypalSubscription.status === 'ACTIVE') {
      // 4. 如果PayPal显示激活但数据库未更新，手动激活
      console.log('PayPal subscription is active, updating database...')
      
      // 根据订阅计划确定积分
      let creditsToAdd = 0
      let planName = 'Pro' // 默认
      
      // 从数据库获取已存储的计划信息（优先使用）
      if (user.subscription_plan && ['Pro', 'Max'].includes(user.subscription_plan)) {
        planName = user.subscription_plan
      } else {
        // 如果数据库没有计划信息，根据PayPal信息判断
        console.log('No plan in database, determining from PayPal data...')
        
        // 尝试多个PayPal字段获取金额信息
        const amount = paypalSubscription.billing_info?.last_payment?.amount?.value ||
                      paypalSubscription.billing_info?.outstanding_balance?.value ||
                      paypalSubscription.plan?.pricing_scheme?.fixed_price?.value
                      
        console.log('PayPal amount detected:', amount)
        console.log('PayPal subscription data:', JSON.stringify(paypalSubscription, null, 2))
        
        // 将金额转换为数字进行比较，避免字符串比较问题
        const numAmount = parseFloat(amount || '0')
        
        if (numAmount >= 25) { // 29.9的范围
          planName = 'Max'
          creditsToAdd = 5000
        } else if (numAmount >= 5) { // 9.9的范围  
          planName = 'Pro'
          creditsToAdd = 1000
        } else {
          // 默认Pro计划
          console.warn('Could not determine plan from amount:', amount, 'defaulting to Pro')
          planName = 'Pro'
          creditsToAdd = 1000
        }
      }
      
      // 根据计划名称设置积分
      if (planName === 'Max') {
        creditsToAdd = 5000
      } else if (planName === 'Pro') {
        creditsToAdd = 1000
      }
      
      console.log('Final plan determination:', { planName, creditsToAdd })

      // 更新用户订阅信息和积分
      const { error: updateError } = await supabase
        .from('users')
        .update({
          credits: (user.credits || 0) + creditsToAdd,
          subscription_plan: planName,
          subscription_id: subscriptionId,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to update user:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update user subscription' },
          { status: 500 }
        )
      }

      // 记录积分交易
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: creditsToAdd,
          type: 'subscription',
          description: `${planName} plan activation - ${creditsToAdd} credits`,
          created_at: new Date().toISOString()
        })

      if (transactionError) {
        console.error('Failed to record transaction:', transactionError)
      }

      console.log(`Successfully activated subscription for user ${user.id}`)
      
      return NextResponse.json({
        success: true,
        status: 'active',
        message: 'Subscription activated successfully',
        creditsAdded: creditsToAdd,
        planName
      })
    }

    // 5. 返回当前状态
    const status = paypalSubscription.status?.toLowerCase() || 'pending'
    return NextResponse.json({
      success: true,
      status,
      message: `Subscription status: ${status}`,
      paypalStatus: paypalSubscription.status
    })

  } catch (error) {
    console.error('Check subscription status error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}