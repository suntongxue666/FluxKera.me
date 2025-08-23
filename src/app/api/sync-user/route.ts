import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { id, email, google_id, avatar_url } = await request.json()
    
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
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
    
    // 检查用户是否已存在
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    // 如果用户不存在，创建新用户
    if (!existingUser) {
      const { data: userData, error: insertError } = await supabaseAdmin
        .from('users')
        .upsert({
          id,
          email: email || '',
          google_id: google_id || id,
          avatar_url: avatar_url || null,
          credits: 20, // 新用户获得20积分
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          returning: 'representation'
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error creating user:', insertError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      
      // 记录积分交易
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
      
      return NextResponse.json({ user: userData })
    } else {
      // 更新现有用户信息
      const { data: userData, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: email || '',
          avatar_url: avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
      }
      
      return NextResponse.json({ user: userData })
    }
  } catch (error) {
    console.error('Unexpected error in sync user API:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}