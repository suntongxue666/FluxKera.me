import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      )
    }

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
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )

    console.log('Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.session) {
      console.error('No session received after code exchange')
      return NextResponse.json(
        { error: 'No session received' },
        { status: 400 }
      )
    }

    console.log('Session exchanged successfully for user:', data.session.user.email)
    
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}