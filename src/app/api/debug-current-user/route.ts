import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG CURRENT USER ===')
    
    const cookieStore = cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    // 1. 尝试从Authorization header获取token
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    
    let user = null
    let authMethod = ''
    
    // 2. 如果有access_token，优先使用token认证
    if (accessToken) {
      console.log('Attempting token authentication...')
      const { data: { user: tokenUser }, error: tokenError } = await supabaseServer.auth.getUser(accessToken)
      if (tokenError) {
        console.log('Token auth failed:', tokenError.message)
      } else if (tokenUser) {
        user = tokenUser
        authMethod = 'token'
        console.log('Token authentication successful:', user.id)
      }
    }
    
    // 3. 如果token认证失败，fallback到cookie认证
    if (!user) {
      console.log('Attempting cookie authentication...')
      const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession()
      
      if (sessionError) {
        console.log('Cookie auth error:', sessionError.message)
      } else if (session?.user) {
        user = session.user
        authMethod = 'cookie'
        console.log('Cookie authentication successful:', user.id)
      }
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No authenticated user found'
      })
    }
    
    // 4. 查询数据库中的用户
    const { data: dbUser, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
      
    console.log('Auth user:', {
      id: user.id,
      email: user.email,
      method: authMethod
    })
    
    console.log('DB user query result:', {
      found: !!dbUser,
      error: userError?.code,
      errorMessage: userError?.message
    })
    
    if (dbUser) {
      console.log('DB user:', {
        id: dbUser.id,
        email: dbUser.email,
        credits: dbUser.credits
      })
    }
    
    return NextResponse.json({
      success: true,
      authUser: {
        id: user.id,
        email: user.email,
        authMethod
      },
      dbUser: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        credits: dbUser.credits
      } : null,
      dbError: userError ? {
        code: userError.code,
        message: userError.message
      } : null
    })
    
  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}