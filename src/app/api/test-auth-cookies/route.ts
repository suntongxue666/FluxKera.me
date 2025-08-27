import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== AUTH TEST API ===')
    
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    console.log('All cookies:', allCookies.map(c => ({
      name: c.name,
      hasValue: !!c.value,
      valueLength: c.value?.length || 0,
      domain: c.domain,
      path: c.path
    })))
    
    // Create Supabase server client
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
            console.log(`Setting cookie ${name}`)
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            console.log(`Removing cookie ${name}`)
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    // Try to get session
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession()
    
    const result = {
      timestamp: new Date().toISOString(),
      cookieCount: allCookies.length,
      supabaseCookies: allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-')).length,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      sessionError: sessionError?.message || null,
      cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
    }
    
    console.log('Auth test result:', result)
    
    return NextResponse.json({
      success: true,
      ...result
    })
    
  } catch (error: any) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}