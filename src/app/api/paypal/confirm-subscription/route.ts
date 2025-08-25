import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

// PayPal API 基础URL
const PAYPAL_API_BASE = process.env.PAYPAL_ENVIRONMENT === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

// 获取PayPal访问令牌
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

// 获取订阅详情
async function getSubscriptionDetails(accessToken: string, subscriptionId: string) {
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

// 更新用户积分和订阅状态
async function updateUserSubscription(userId: string, planName: string, credits: number, subscriptionId: string) {
  try {
    // 获取当前用户信息
    const { data: currentUser, error: getUserError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (getUserError) {
      throw new Error('Failed to get current user: ' + getUserError.message)
    }

    // 更新用户积分和订阅信息
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        credits: (currentUser.credits || 0) + credits,
        subscription_plan: planName,
        subscription_id: subscriptionId,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      throw new Error('Failed to update user: ' + updateError.message)
    }

    // 记录积分交易
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: credits,
        type: 'subscription',
        description: `${planName} plan subscription - ${credits} credits`,
        created_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('Failed to record transaction:', transactionError)
      // 不抛出错误，因为主要操作已成功
    }

    return updatedUser

  } catch (error) {
    console.error('Database update error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, userId, planName, credits } = await request.json()

    console.log('Confirming subscription:', { subscriptionId, userId, planName, credits })

    // 获取访问令牌
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      throw new Error('Failed to get PayPal access token')
    }

    // 获取订阅详情以验证状态
    const subscriptionDetails = await getSubscriptionDetails(accessToken, subscriptionId)
    
    if (subscriptionDetails.status !== 'ACTIVE') {
      throw new Error(`Subscription is not active. Status: ${subscriptionDetails.status}`)
    }

    // 更新用户数据库
    const updatedUser = await updateUserSubscription(userId, planName, credits, subscriptionId)

    console.log('Subscription confirmed successfully:', {
      userId,
      planName,
      credits,
      newCredits: updatedUser.credits
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription confirmed successfully',
      user: updatedUser,
      subscriptionDetails: {
        id: subscriptionId,
        status: subscriptionDetails.status,
        planName,
        credits
      }
    })

  } catch (error) {
    console.error('PayPal subscription confirmation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to confirm subscription'
      },
      { status: 500 }
    )
  }
}