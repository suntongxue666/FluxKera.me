import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // 交换授权码获取会话
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
      }
      
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 检查环境变量
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('Missing Supabase environment variables')
          return NextResponse.redirect(new URL('/?error=server_config', request.url))
        }
        
        // 使用服务端客户端绕过RLS策略
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        
        try {
          // 检查用户是否已存在
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          // 检查是否为内测账号需要重置
          const isResetUser = user.email === 'sunwei7482@gmail.com' || user.email === 'tiktreeapp@gmail.com';
          
          // 如果用户不存在或为内测账号需要重置，创建新用户并给予初始积分
          if (!existingUser || isResetUser) {
            // 使用服务端客户端创建用户
            const { data: userData, error: upsertError } = await supabaseAdmin
              .from('users')
              .upsert({
                id: user.id,
                email: user.email || '',
                google_id: user.user_metadata?.sub || user.id,
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                credits: 20, // 新用户或重置用户获得20积分
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'id'
              })
              .select()
              .single()
            
            if (upsertError) {
              console.error('Error creating user:', upsertError)
              return NextResponse.redirect(new URL('/?error=user_creation_failed', request.url))
            }
            
            // 记录积分交易
            const { error: transactionError } = await supabaseAdmin
              .from('credit_transactions')
              .insert({
                user_id: user.id,
                type: 'credit',
                amount: 20,
                description: isResetUser ? '用户积分重置' : '新用户注册奖励',
                created_at: new Date().toISOString()
              })
            
            if (transactionError) {
              console.error('Error creating credit transaction:', transactionError)
            }
          } else {
            // 更新现有用户信息
            const { error: updateError } = await supabaseAdmin
              .from('users')
              .update({
                email: user.email || '',
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)
            
            if (updateError) {
              console.error('Error updating user:', updateError)
            }
          }
        } catch (error) {
          console.error('Unexpected error during user creation/update:', error)
          return NextResponse.redirect(new URL('/?error=server_error', request.url))
        }
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(new URL('/?error=unexpected_error', request.url))
    }
  }

  // 重定向回首页
  return NextResponse.redirect(new URL('/', request.url))
}