import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, userEmail, planName, credits } = await request.json()

    console.log('Manually activating subscription:', { subscriptionId, userEmail, planName, credits })

    // 根据邮箱查找用户
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (getUserError || !user) {
      console.error('User not found:', userEmail)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 更新用户订阅信息和积分
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        credits: (user.credits || 0) + credits,
        subscription_plan: planName,
        subscription_id: subscriptionId,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update user:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // 记录积分交易
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: credits,
        type: 'subscription',
        description: `${planName} plan subscription - ${credits} credits`,
        created_at: new Date().toISOString()
      })

    if (transactionError) {
      console.error('Failed to record transaction:', transactionError)
    }

    console.log(`Successfully activated subscription for user ${user.id}:`, {
      oldCredits: user.credits,
      newCredits: updatedUser.credits,
      planName,
      subscriptionId
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        credits: updatedUser.credits,
        subscription_plan: updatedUser.subscription_plan,
        subscription_status: updatedUser.subscription_status
      }
    })

  } catch (error) {
    console.error('Subscription activation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to activate subscription' },
      { status: 500 }
    )
  }
}