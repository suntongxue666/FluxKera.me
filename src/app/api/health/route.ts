import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // 检查数据库连接
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Database connection error:', error)
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Database connection failed',
          error: error.message
        },
        { status: 500 }
      )
    }
    
    // 检查认证状态
    const { data: { session } } = await supabase.auth.getSession()
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      hasUsers: data && data.length > 0,
      authenticated: !!session,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Health check failed',
        error: error.message
      },
      { status: 500 }
    )
  }
}