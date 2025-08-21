import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('回调URL:', request.url);
  console.log('授权码存在:', !!code);

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // 交换授权码获取会话
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('交换会话失败:', sessionError)
        return NextResponse.redirect(new URL('/?error=auth_session', request.url))
      }
      
      // 获取当前用户
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('获取用户失败:', userError)
        return NextResponse.redirect(new URL('/?error=auth_user', request.url))
      }
      
      if (!user) {
        console.error('用户不存在')
        return NextResponse.redirect(new URL('/?error=no_user', request.url))
      }
      
      console.log('成功获取用户:', user.email)
    
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
      
      // 获取Google头像URL
      const avatarUrl = user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture || 
                       null;
      
      console.log('用户元数据:', user.user_metadata);
      console.log('头像URL:', avatarUrl);
      
      // 如果用户不存在，创建新用户并给予初始积分
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            google_id: user.user_metadata?.sub || user.id,
            avatar_url: avatarUrl,
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
      } else {
        // 如果用户已存在，更新头像URL
        if (avatarUrl && (!existingUser.avatar_url || existingUser.avatar_url !== avatarUrl)) {
          const { error: updateError } = await supabase
            .from('users')
            .update({
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
          
          if (updateError) {
            console.error('Error updating user avatar:', updateError)
          } else {
            console.log('用户头像已更新:', avatarUrl)
          }
        }
      }
    }
  }

  // 重定向回首页
  return NextResponse.redirect(new URL('/', request.url))
}