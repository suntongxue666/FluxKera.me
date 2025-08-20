import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // 交换授权码获取会话
    await supabase.auth.exchangeCodeForSession(code)
    
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // 创建或更新用户记录
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError)
      }
      
      // 如果用户不存在，创建新用户并给予初始积分
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            google_id: user.user_metadata?.sub || user.id,
            credits: 20, // 新用户获得20积分
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (insertError) {
          console.error('Error creating user:', insertError)
        } else {
          // 记录积分交易
          await supabase
            .from('credit_transactions')
            .insert({
              user_id: user.id,
              type: 'credit',
              amount: 20,
              description: '新用户注册奖励'
            })
        }
      }
    }
  }

  // 重定向回首页
  return NextResponse.redirect(new URL('/', request.url))
}