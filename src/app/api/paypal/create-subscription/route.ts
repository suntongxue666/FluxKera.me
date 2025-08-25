import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// PayPal API 基础URL - 强制使用沙盒环境
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'

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

// 创建订阅计划
async function createSubscriptionPlan(accessToken: string, planName: string, price: number) {
  const planData = {
    product_id: `fluxkrea-${planName.toLowerCase()}`,
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

  return await response.json()
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
      return_url: `https://www.fluxkrea.me/subscription/success`,
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
    
    // 首先尝试创建产品
    const productData = {
      id: `fluxkrea-${planName.toLowerCase()}`,
      name: `FluxKrea ${planName}`,
      description: `FluxKrea ${planName} subscription with ${credits} credits per month`,
      type: 'SERVICE',
      category: 'SOFTWARE',
    }

    try {
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
      console.log('Product creation result:', productResult)
      
      if (!productResponse.ok && productResponse.status !== 409) {
        console.error('Product creation failed:', productResult)
      }
    } catch (error) {
      console.log('Product creation error (might already exist):', error)
    }

    // 创建订阅计划
    console.log('Creating subscription plan...')
    const plan = await createSubscriptionPlan(accessToken, planName, price)
    console.log('Plan creation result:', plan)
    
    if (plan.id) {
      planId = plan.id
    } else if (plan.error) {
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