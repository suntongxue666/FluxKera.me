import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

export async function POST(request: NextRequest) {
  try {
    // 获取用户session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('sb-gdcjvqaqgvcxzufmessy-auth-token')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    // 解析session
    const sessionData = JSON.parse(sessionCookie.value)
    const userId = sessionData?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // 清空用户积分（仅用于测试）
    const { data, error } = await supabase
      .from('users')
      .update({ 
        credits: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to clear credits: ' + error.message)
    }

    // 记录测试交易
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -data.credits,
        type: 'test',
        description: 'Test: Clear credits for testing',
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Credits cleared for testing',
      user: data
    })

  } catch (error) {
    console.error('Clear credits error:', error)
    return NextResponse.json(
      { error: 'Failed to clear credits' },
      { status: 500 }
    )
  }
}