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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
    }
    
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      console.log('Authenticated user:', user)
      
      // 检查用户是否已存在
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
            avatar_url: user.user_metadata?.avatar_url || null,
            full_name: user.user_metadata?.full_name || user.email || '',
            credits: 20, // 新用户获得20积分
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (insertError) {
          console.error('Error creating user:', insertError)
          return NextResponse.redirect(new URL('/?error=user_creation_failed', request.url))
        } else {
          // 记录积分交易
          const { error: transactionError } = await supabase
            .from('credit_transactions')
            .insert({
              user_id: user.id,
              type: 'credit',
              amount: 20,
              description: '新用户注册奖励'
            })
          
          if (transactionError) {
            console.error('Error creating credit transaction:', transactionError)
          }
        }
      } else {
        // 更新现有用户信息
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email: user.email || '',
            avatar_url: user.user_metadata?.avatar_url || null,
            full_name: user.user_metadata?.full_name || user.email || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        if (updateError) {
          console.error('Error updating user:', updateError)
        }
      }
    }
  }

  // 重定向回首页
  return NextResponse.redirect(new URL('/', request.url))
}