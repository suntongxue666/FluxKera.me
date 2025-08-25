import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

export async function GET(request: NextRequest) {
  try {
    // 检查最近的webhook日志（如果有的话）
    const logs = {
      timestamp: new Date().toISOString(),
      message: 'Webhook debug endpoint accessed',
      environment: {
        PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        SUPABASE_SERVICE_SECRET: process.env.SUPABASE_SERVICE_SECRET ? 'SET' : 'NOT SET'
      }
    }

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 测试webhook处理
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())
    
    console.log('=== WEBHOOK DEBUG ===')
    console.log('Headers:', headers)
    console.log('Body:', body)
    
    // 尝试解析body
    let event
    try {
      event = JSON.parse(body)
      console.log('Parsed event:', event)
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook debug successful',
      event_type: event.event_type,
      resource_id: event.resource?.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Webhook debug error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}