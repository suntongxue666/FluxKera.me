import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 获取用户积分
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
  
  // 获取用户信息
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()
    
  if (userError || !user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    )
  }
  
  // 获取用户积分交易历史
  const { data: transactions, error: transactionError } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (transactionError) {
    console.error('Error fetching transactions:', transactionError)
  }
  
  return NextResponse.json({
    success: true,
    credits: user.credits,
    transactions: transactions || []
  })
}

// 处理积分购买
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, planType, amount, credits } = body
    
    if (!paymentId || !planType || !amount || !credits) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
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
    
    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
      
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // 记录订阅信息
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: planType,
        credits_added: credits,
        amount: amount,
        paypal_order_id: paymentId,
        status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      return NextResponse.json(
        { success: false, error: 'Failed to create subscription' },
        { status: 500 }
      )
    }
    
    // 更新用户积分
    const newCredits = user.credits + credits
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (updateError) {
      console.error('Error updating user credits:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update credits' },
        { status: 500 }
      )
    }
    
    // 记录积分交易
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        type: 'credit',
        amount: credits,
        description: `购买 ${planType} 计划`
      })
    
    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
    }
    
    return NextResponse.json({
      success: true,
      credits: newCredits,
      subscription
    })
    
  } catch (error: any) {
    console.error('Credits API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}