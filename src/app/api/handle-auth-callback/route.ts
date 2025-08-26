import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH CALLBACK API START ===')
    const requestUrl = new URL(request.url)
    console.log('Full callback URL:', requestUrl.toString())
    
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    
    if (error) {
      console.error('OAuth error in callback:', error)
      return NextResponse.redirect(new URL(`/?error=oauth_error&message=${encodeURIComponent(error)}`, request.url))
    }
    
    if (!code) {
      console.error('No authorization code found in URL')
      return NextResponse.redirect(new URL('/?error=no_code', request.url))
    }

    console.log('Authorization code received:', code.substring(0, 10) + '...')

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            console.log('Setting cookie:', name)
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            console.log('Removing cookie:', name)
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    console.log('Exchanging code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(requestUrl.toString())

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(new URL(`/?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`, request.url))
    }

    if (!data.session) {
      console.error('No session received after code exchange')
      return NextResponse.redirect(new URL('/?error=no_session', request.url))
    }

    console.log('Session exchanged successfully for user:', data.session.user.email)
    console.log('Session expires at:', data.session.expires_at)
    console.log('Access token length:', data.session.access_token.length)
    
    const response = NextResponse.redirect(new URL('/?auth=success', request.url))
    console.log('Redirecting to home with auth=success')
    console.log('=== AUTH CALLBACK API END ===')
    
    return response

  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(new URL(`/?error=unexpected_error&message=${encodeURIComponent((error as Error).message)}`, request.url))
  }
}