import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// PayPal API 基础URL
const PAYPAL_API_BASE = process.env.PAYPAL_ENVIRONMENT === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

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

// 创建产品
async function createProduct(accessToken: string, planName: string) {
  const productData = {
    name: `FluxKrea ${planName} Plan`,
    description: `FluxKrea ${planName} subscription service`,
    type: 'SERVICE',
    category: 'SOFTWARE'
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(productData),
  })

  return await response.json()
}

// 创建订阅计划
async function createSubscriptionPlan(accessToken: string, productId: string, planName: string, price: number) {
  const planData = {
    product_id: productId,
    name: `FluxKrea ${planName} Monthly Plan`,
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
        total_cycles: 0,
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

export async function POST(request: NextRequest) {
  try {
    const { planName, price } = await request.json()

    console.log('Creating PayPal plan:', { planName, price })

    // 获取访问令牌
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      throw new Error('Failed to get PayPal access token')
    }

    // 创建产品（使用时间戳避免重复）
    const timestamp = Date.now()
    const productData = {
      name: `FluxKrea ${planName} Plan ${timestamp}`,
      description: `FluxKrea ${planName} subscription service`,
      type: 'SERVICE',
      category: 'SOFTWARE'
    }

    const productResponse = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(productData),
    })

    const product = await productResponse.json()
    console.log('Product creation result:', product)

    if (!productResponse.ok || !product.id) {
      console.error('Product creation failed:', product)
      throw new Error('Failed to create product: ' + JSON.stringify(product))
    }

    // 创建订阅计划
    const plan = await createSubscriptionPlan(accessToken, product.id, planName, price)
    console.log('Plan creation result:', plan)

    if (!plan.id) {
      console.error('Plan creation failed:', plan)
      throw new Error('Failed to create plan: ' + JSON.stringify(plan))
    }

    return NextResponse.json({
      success: true,
      productId: product.id,
      planId: plan.id,
      planName,
      price
    })

  } catch (error) {
    console.error('Plan creation error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create plan' },
      { status: 500 }
    )
  }
}