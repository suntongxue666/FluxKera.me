import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 重定向到正确的webhook路径
export async function POST(request: NextRequest) {
  console.log('=== Webhook Redirect Route Called ===')
  
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    console.log('Redirecting webhook to correct path')

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
    console.log('Redirect response:', result)
    
    // 确保返回200状态码
    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Webhook redirect error:', error)
    // 即使出错也返回200状态码
    return NextResponse.json(
      { 
        success: false, 
        error: 'Webhook redirect failed',
        received: true 
      },
      { status: 200 }
    )
  }
}