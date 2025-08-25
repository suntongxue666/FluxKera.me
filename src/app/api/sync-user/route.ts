import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { id, email, google_id, avatar_url } = await request.json()
    
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_SECRET || process.env.SUPABASE_SERVICE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
      console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    // 使用服务端客户端绕过RLS策略
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
    
    // 先检查用户是否存在
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    let userData
    if (existingUser) {
      // 更新现有用户，保持积分不变，只更新头像等信息
      const { data, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: email || existingUser.email,
          google_id: google_id || existingUser.google_id,
          avatar_url: avatar_url || existingUser.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json({ error: 'Failed to update user: ' + updateError.message }, { status: 500 })
      }
      userData = data
    } else {
      // 创建新用户
      const { data, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id,
          email: email || '',
          google_id: google_id || id,
          avatar_url: avatar_url || null,
          credits: 20, // 新用户获得20积分
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error creating user:', insertError)
        return NextResponse.json({ error: 'Failed to create user: ' + insertError.message }, { status: 500 })
      }
      userData = data
      
      // 记录新用户积分交易
      const { error: transactionError } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: id,
          type: 'credit',
          amount: 20,
          description: '新用户注册奖励',
          created_at: new Date().toISOString()
        })
      
      if (transactionError) {
        console.error('Error creating credit transaction:', transactionError)
      }
    }
    
    console.log('User synced successfully:', userData)
    
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Unexpected error in sync user API:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}