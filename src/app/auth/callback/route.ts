import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('=== AUTH CALLBACK START ===')
  console.log('Code:', code ? 'present' : 'missing')
  console.log('Request URL:', request.url)

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // 交换授权码获取会话
      console.log('Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/?error=auth_failed&message=' + encodeURIComponent(error.message), request.url))
      }
      
      console.log('Session exchanged successfully:', data)
      
      // 获取当前用户
      console.log('Getting user info...')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        console.log('Authenticated user:', user)
        
        // 检查环境变量
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_SECRET || process.env.SUPABASE_SERVICE_KEY
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('Missing Supabase environment variables')
          console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
          console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET')
          return NextResponse.redirect(new URL('/?error=server_config', request.url))
        }
        
        // 使用服务端客户端绕过RLS策略
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        
        try {
          // 检查是否为内测账号需要重置
          const isResetUser = user.email === 'sunwei7482@gmail.com' || user.email === 'tiktreeapp@gmail.com';
          
          // 使用 upsert 一次性处理用户创建/更新，减少数据库查询
          console.log('Upserting user data...')
          const { data: userData, error: upsertError } = await supabaseAdmin
            .from('users')
            .upsert({
              id: user.id,
              email: user.email || '',
              google_id: user.user_metadata?.sub || user.id,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              credits: isResetUser ? 20 : undefined, // 只有重置用户才强制设置积分
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            })
            .select()
            .single()
          
          if (upsertError) {
            console.error('Error upserting user:', upsertError)
            return NextResponse.redirect(new URL('/?error=user_creation_failed&message=' + encodeURIComponent(upsertError.message), request.url))
          }
          
          console.log('User upserted successfully:', userData)
          
          // 只有在重置用户时才记录积分交易
          if (isResetUser && userData.credits === 20) {
            const { error: transactionError } = await supabaseAdmin
              .from('credit_transactions')
              .insert({
                user_id: user.id,
                type: 'credit',
                amount: 20,
                description: '用户积分重置',
                created_at: new Date().toISOString()
              })
            
            if (transactionError) {
              console.error('Error creating credit transaction:', transactionError)
            }
          }
        } catch (error) {
          console.error('Unexpected error during user creation/update:', error)
          return NextResponse.redirect(new URL('/?error=server_error&message=' + encodeURIComponent((error as Error).message), request.url))
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
  }

  // 重定向回首页，带上成功标识
  console.log('Redirecting to home page with auth success')
  return NextResponse.redirect(new URL('/?auth=success', request.url))
}