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
    
    // 使用 upsert 一次性处理用户创建/更新，减少数据库查询
    const { data: userData, error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id,
        email: email || '',
        google_id: google_id || id,
        avatar_url: avatar_url || null,
        credits: 20, // 新用户获得20积分，现有用户保持原有积分
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single()
    
    if (upsertError) {
      console.error('Error upserting user:', upsertError)
      return NextResponse.json({ error: 'Failed to upsert user: ' + upsertError.message }, { status: 500 })
    }
    
    console.log('User upserted successfully:', userData)
    
    // 如果是新用户（刚创建），记录积分交易
    if (userData.credits === 20) {
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
    
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Unexpected error in sync user API:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}