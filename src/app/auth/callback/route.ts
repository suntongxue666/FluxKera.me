import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    console.log('Auth callback received with code:', code ? 'present' : 'missing');
    
    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // 交换授权码获取会话
      console.log('Exchanging code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
      }
      
      // 获取当前用户
      console.log('Getting user info...');
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        console.log('Authenticated user:', user)
        
        // 检查环境变量
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('Missing Supabase environment variables')
          console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
          console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET')
          return NextResponse.redirect(new URL('/?error=server_config', request.url))
        }
        
        // 使用服务端客户端绕过RLS策略
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        })
        
        try {
          // 检查用户是否已存在
          console.log('Checking if user exists in database...');
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError)
          } else {
            console.log('Existing user check result:', existingUser ? 'found' : 'not found');
          }
          
          // 检查是否为内测账号需要重置
          const isResetUser = user.email === 'sunwei7482@gmail.com' || user.email === 'tiktreeapp@gmail.com';
          
          // 如果用户不存在或为内测账号需要重置，创建新用户并给予初始积分
          if (!existingUser || isResetUser) {
            console.log('Creating/updating user with data:', {
              id: user.id,
              email: user.email || '',
              google_id: user.user_metadata?.sub || user.id,
              avatar_url: user.user_metadata?.avatar_url || null,
              credits: 20
            });
            
            // 使用服务端客户端创建用户
            const { data: insertData, error: insertError } = await supabaseAdmin
              .from('users')
              .upsert({
                id: user.id,
                email: user.email || '',
                google_id: user.user_metadata?.sub || user.id,
                avatar_url: user.user_metadata?.avatar_url || null,
                credits: 20, // 新用户或重置用户获得20积分
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'id',
                returning: 'representation'
              })
            
            // 单独处理select查询，因为upsert可能不返回数据
            const { data: selectData, error: selectError } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (insertError) {
              console.error('Error creating user:', insertError)
              // 重定向到首页并携带错误参数
              return NextResponse.redirect(new URL('/?error=user_creation_failed', request.url))
            } else if (selectError) {
              console.error('Error selecting user after upsert:', selectError)
              // 重定向到首页并携带错误参数
              return NextResponse.redirect(new URL('/?error=user_selection_failed', request.url))
            } else {
              console.log('User created/updated successfully:', selectData);
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
              } else {
                console.log('Credit transaction created successfully');
              }
            }
          } else {
            // 更新现有用户信息
            console.log('Updating existing user...');
            // 使用服务端客户端更新用户
            const { data: updateData, error: updateError } = await supabaseAdmin
              .from('users')
              .update({
                email: user.email || '',
                avatar_url: user.user_metadata?.avatar_url || null,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id)
            
            // 单独处理select查询
            const { data: selectData, error: selectError } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (updateError) {
              console.error('Error updating user:', updateError)
            } else if (selectError) {
              console.error('Error selecting user after update:', selectError)
            } else {
              console.log('User updated successfully:', selectData);
            }
          }
        } catch (error) {
          console.error('Unexpected error during user creation/update:', error)
          // 即使出现意外错误，也重定向到首页而不是错误页面
          return NextResponse.redirect(new URL('/?error=server_error', request.url))
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    // 确保任何未捕获的错误都能正确处理
    return NextResponse.redirect(new URL('/?error=unexpected_error', request.url))
  }

  // 重定向回首页
  return NextResponse.redirect(new URL('/', request.url))
}