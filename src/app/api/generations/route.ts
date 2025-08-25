import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  // 检查用户是否已登录
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  // 获取用户的生成历史
  const { data: generations, error } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching generations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch generations' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({
    success: true,
    generations
  })
}