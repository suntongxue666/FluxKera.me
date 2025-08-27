import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// PayPal API 基础URL - 根据环境选择
const PAYPAL_API_BASE = process.env.PAYPAL_ENVIRONMENT === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

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

// 创建订阅计划
async function createSubscriptionPlan(accessToken: string, planName: string, price: number, productId: string) {
  const planData = {
    product_id: productId,
    name: `FluxKrea ${planName} Plan`,
    description: `FluxKrea ${planName} monthly subscription`,
    status: 'ACTIVE',
    billing_cycles: [
      {
        frequency: {
          interval_unit: 'MONTH',
          interval_count: 1,
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 无限循环
        pricing_scheme: {
          fixed_price: {
            value: price.toString(),
            currency_code: 'USD',
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3,
    },
  }

  console.log('Creating subscription plan with data:', planData)

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(planData),
  })

  const result = await response.json()
  console.log('Plan creation response status:', response.status)
  console.log('Plan creation result:', result)

  return result
}

// 创建订阅
async function createSubscription(accessToken: string, planId: string, userEmail: string) {
  const subscriptionData = {
    plan_id: planId,
    subscriber: {
      email_address: userEmail,
    },
    application_context: {
      brand_name: 'FluxKrea',
      locale: 'en-US',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      payment_method: {
        payer_selected: 'PAYPAL',
        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
      },
      return_url: `https://www.fluxkrea.me/subscription/return`,
      cancel_url: `https://www.fluxkrea.me/subscription/cancel`,
    },
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(subscriptionData),
  })

  return await response.json()
}

export async function POST(request: NextRequest) {
  try {
    const { planName, price, credits, userId, userEmail } = await request.json()

    console.log('Creating subscription for:', { planName, price, credits, userId, userEmail })

    // 检查必需的环境变量
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.error('Missing PayPal credentials')
      throw new Error('PayPal configuration error')
    }

    // 获取访问令牌
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      console.error('Failed to get PayPal access token')
      throw new Error('Failed to get PayPal access token')
    }

    console.log('PayPal access token obtained successfully')

    // 创建或获取订阅计划
    let planId = `fluxkrea-${planName.toLowerCase()}-plan`
    
    // 首先尝试创建产品（使用唯一ID避免重复）
    const timestamp = Date.now()
    const productId = `fluxkrea-${planName.toLowerCase()}-${timestamp}`
    
    const productData = {
      id: productId,
      name: `FluxKrea ${planName} Plan`,
      description: `FluxKrea ${planName} subscription with ${credits} credits per month`,
      type: 'SERVICE',
      category: 'SOFTWARE',
    }

    let productCreated = false
    try {
      console.log('Creating product with ID:', productId)
      const productResponse = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      
      const productResult = await productResponse.json()
      console.log('Product creation response status:', productResponse.status)
      console.log('Product creation result:', productResult)
      
      if (productResponse.ok) {
        productCreated = true
        console.log('Product created successfully:', productId)
      } else if (productResponse.status === 409) {
        console.log('Product already exists, continuing...')
        productCreated = true
      } else {
        console.error('Product creation failed:', productResult)
        // 继续执行，使用默认产品ID
      }
    } catch (error) {
      console.log('Product creation error:', error)
      // 继续执行，使用默认产品ID
    }

    // 如果产品创建失败，使用简单的产品ID
    const finalProductId = productCreated ? productId : `fluxkrea-${planName.toLowerCase()}`

    // 创建订阅计划
    console.log('Creating subscription plan...')
    const plan = await createSubscriptionPlan(accessToken, planName, price, finalProductId)
    console.log('Plan creation result:', plan)
    
    if (plan.id) {
      planId = plan.id
    } else if (plan.error || plan.details) {
      console.error('Plan creation failed:', plan)
      throw new Error(`Plan creation failed: ${JSON.stringify(plan)}`)
    }

    // 创建订阅
    console.log('Creating subscription with planId:', planId)
    const subscription = await createSubscription(accessToken, planId, userEmail)
    console.log('Subscription creation result:', subscription)

    if (subscription.id) {
      const approvalUrl = subscription.links?.find((link: any) => link.rel === 'approve')?.href
      console.log('Subscription created successfully:', { id: subscription.id, approvalUrl })
      
      // 保存订阅信息到数据库
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_SECRET!
        )

        console.log('Saving subscription to database:', {
          userId,
          subscriptionId: subscription.id,
          planName,
          price,
          credits,
          userEmail
        })

        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_id: subscription.id,
            subscription_plan: planName, // 确保planName正确传递
            subscription_status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Failed to save subscription to database:', updateError)
          // 不抛出错误，因为订阅已经创建成功
        } else {
          console.log('Subscription saved to database successfully with plan:', planName)
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // 不抛出错误，因为订阅已经创建成功
      }
      
      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        approvalUrl
      })
    } else {
      console.error('Subscription creation failed:', subscription)
      throw new Error('Failed to create subscription: ' + JSON.stringify(subscription))
    }

  } catch (error) {
    console.error('PayPal subscription creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}