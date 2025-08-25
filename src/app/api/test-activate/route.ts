import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

export async function GET(request: NextRequest) {
  return handleActivation(request)
}

export async function POST(request: NextRequest) {
  return handleActivation(request)
}

async function handleActivation(request: NextRequest) {
  try {
    // 测试激活最新的订阅
    const subscriptionId = 'I-YKFDNCC1CPB5'
    const userEmail = 'sunwei7482@gmail.com'
    const planName = 'Pro'
    const credits = 1000

    console.log('Test activating subscription:', { subscriptionId, userEmail, planName, credits })

    // 根据邮箱查找用户
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (getUserError || !user) {
      console.error('User not found:', userEmail, getUserError)
      return NextResponse.json(
        { success: false, error: 'User not found', details: getUserError },
        { status: 404 }
      )
    }

    console.log('Found user:', { id: user.id, email: user.email, currentCredits: user.credits })

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
        { success: false, error: 'Failed to update user', details: updateError },
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
        description: `${planName} plan subscription - ${credits} credits (test activation)`,
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
      message: 'Test subscription activated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        credits: updatedUser.credits,
        subscription_plan: updatedUser.subscription_plan,
        subscription_status: updatedUser.subscription_status
      },
      changes: {
        creditsAdded: credits,
        oldCredits: user.credits,
        newCredits: updatedUser.credits
      }
    })

  } catch (error) {
    console.error('Test activation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to activate subscription', details: error.message },
      { status: 500 }
    )
  }
}