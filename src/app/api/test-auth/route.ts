import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST AUTH API ===')
    
    const cookieStore = cookies()
    console.log('Available cookies:', cookieStore.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })))
    
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            console.log(`Getting cookie ${name}:`, cookie ? 'found' : 'not found')
            return cookie?.value
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
    
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession()
    
    console.log('Session result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      error: sessionError
    })
    
    if (session?.user) {
      // 尝试查询用户数据
      const { data: userData, error: userError } = await supabaseServer
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      console.log('User data query:', { hasData: !!userData, error: userError })
      
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email
        },
        userData: userData
      })
    }
    
    return NextResponse.json({
      success: true,
      authenticated: false,
      session: null
    })
    
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}