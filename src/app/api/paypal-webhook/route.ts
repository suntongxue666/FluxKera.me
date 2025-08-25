import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 重定向到正确的webhook路径
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // 转发到正确的webhook处理器
    const response = await fetch(`${request.nextUrl.origin}/api/paypal/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body
    })

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })

  } catch (error) {
    console.error('Webhook redirect error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}