import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    console.log('=== SIMPLE AUTH DEBUG ===')
    console.log('Request URL:', request.url)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value, length: c.value?.length })))
    
    // 检查Supabase相关的cookies
    const supabaseCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'))
    console.log('Supabase cookies:', supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    return NextResponse.json({
      success: true,
      cookieCount: allCookies.length,
      cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      supabaseCookies: supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      headers: Object.fromEntries(request.headers.entries())
    })
    
  } catch (error: any) {
    console.error('Simple debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}