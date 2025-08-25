import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  console.log('=== AUTH CALLBACK START ===')
  console.log('Code:', code ? 'present' : 'missing')
  console.log('Error:', error)
  console.log('Request URL:', request.url)

  // 如果有错误参数，直接重定向
  if (error) {
    console.error('OAuth error from provider:', error)
    return NextResponse.redirect(new URL(`/?error=oauth_error&message=${encodeURIComponent(error)}`, request.url))
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce'
        },
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )
    
    try {
      // 交换授权码获取会话
      console.log('Exchanging code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        // 如果是PKCE错误，尝试重新登录
        if (exchangeError.message.includes('code challenge') || exchangeError.message.includes('code verifier')) {
          console.log('PKCE error detected, redirecting to re-login')
          return NextResponse.redirect(new URL('/?error=pkce_error&message=Please try logging in again', request.url))
        }
        return NextResponse.redirect(new URL('/?error=auth_failed&message=' + encodeURIComponent(exchangeError.message), request.url))
      }
      
      console.log('Session exchanged successfully')
      
      // 获取当前用户
      console.log('Getting user info...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        return NextResponse.redirect(new URL('/?error=user_fetch_failed&message=' + encodeURIComponent(userError.message), request.url))
      }
      
      if (user) {
        console.log('Authenticated user:', user.email)
        
        // 使用API同步用户数据，而不是直接操作数据库
        try {
          const syncResponse = await fetch(`${request.nextUrl.origin}/api/sync-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session?.access_token}`
            },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              google_id: user.user_metadata?.sub,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            }),
          })
          
          if (!syncResponse.ok) {
            console.error('User sync failed:', syncResponse.status)
            // 即使同步失败，也继续登录流程
          } else {
            console.log('User synced successfully')
          }
        } catch (syncError) {
          console.error('Error syncing user:', syncError)
          // 即使同步失败，也继续登录流程
        }
      } else {
        console.log('No user found after session exchange')
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(new URL('/?error=unexpected_error&message=' + encodeURIComponent((error as Error).message), request.url))
    }
  } else {
    console.log('No code found in callback')
    return NextResponse.redirect(new URL('/?error=no_code&message=No authorization code received', request.url))
  }

  // 重定向回首页，带上成功标识
  console.log('Redirecting to home page with auth success')
  return NextResponse.redirect(new URL('/?auth=success', request.url))
}