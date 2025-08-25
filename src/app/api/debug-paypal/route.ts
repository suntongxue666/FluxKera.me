import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// PayPal API 基础URL - 强制使用沙盒环境
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'

// 获取PayPal访问令牌
async function getPayPalAccessToken() {
  try {
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
    return { success: response.ok, data, status: response.status }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== PayPal Debug Info ===')
    
    // 检查环境变量
    const envCheck = {
      PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID ? 'SET' : 'MISSING',
      PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET ? 'SET' : 'MISSING',
      PAYPAL_ENVIRONMENT: process.env.PAYPAL_ENVIRONMENT || 'NOT SET',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
      API_BASE: PAYPAL_API_BASE
    }

    console.log('Environment variables:', envCheck)

    // 测试PayPal API连接
    const tokenResult = await getPayPalAccessToken()
    console.log('PayPal token test:', tokenResult)

    return NextResponse.json({
      success: true,
      environment: envCheck,
      paypalConnection: tokenResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}