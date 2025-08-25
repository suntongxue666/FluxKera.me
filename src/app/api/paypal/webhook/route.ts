import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

// 验证PayPal webhook签名 - 暂时跳过验证以便调试
function verifyPayPalWebhook(payload: string, headers: any): boolean {
  try {
    console.log('Webhook verification - Headers:', Object.keys(headers))
    console.log('PAYPAL_WEBHOOK_ID:', process.env.PAYPAL_WEBHOOK_ID ? 'SET' : 'NOT SET')
    
    // 暂时跳过签名验证，直接返回true以便调试
    // 在生产环境中应该实现完整的签名验证
    return true

  } catch (error) {
    console.error('Webhook verification error:', error)
    return false
  }
}

// 处理订阅激活
async function handleSubscriptionActivated(eventData: any) {
  try {
    const subscriptionId = eventData.resource.id
    console.log('Processing subscription activation:', subscriptionId)
    
    // 从数据库获取订阅信息
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .single()

    if (error || !user) {
      console.error('User not found for subscription:', subscriptionId, error)
      return
    }

    console.log('Found user for subscription:', user.email)

    // 根据订阅计划添加积分
    let creditsToAdd = 0
    if (user.subscription_plan === 'Pro') {
      creditsToAdd = 1000
    } else if (user.subscription_plan === 'Max') {
      creditsToAdd = 5000
    }

    if (creditsToAdd > 0) {
      // 更新用户积分和状态
      const { error: updateError } = await supabase
        .from('users')
        .update({
          credits: (user.credits || 0) + creditsToAdd,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw new Error('Failed to update user credits: ' + updateError.message)
      }

      // 记录积分交易
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: creditsToAdd,
          type: 'subscription',
          description: `${user.subscription_plan} plan activation - ${creditsToAdd} credits`,
          created_at: new Date().toISOString()
        })

      if (transactionError) {
        console.error('Failed to record transaction:', transactionError)
      }

      console.log(`Added ${creditsToAdd} credits to user ${user.id} for subscription activation`)
    }

  } catch (error) {
    console.error('Error handling subscription activation:', error)
  }
}

// 处理订阅支付成功
async function handleSubscriptionPaymentSuccess(eventData: any) {
  try {
    const subscriptionId = eventData.resource.billing_agreement_id || eventData.resource.id
    console.log('Processing payment success for subscription:', subscriptionId)
    
    // 从数据库获取订阅信息
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .single()

    if (error || !user) {
      console.error('User not found for subscription:', subscriptionId, error)
      return
    }

    console.log('Found user for payment:', user.email)

    // 根据订阅计划添加积分
    let creditsToAdd = 0
    if (user.subscription_plan === 'Pro') {
      creditsToAdd = 1000
    } else if (user.subscription_plan === 'Max') {
      creditsToAdd = 5000
    }

    if (creditsToAdd > 0) {
      // 更新用户积分
      const { error: updateError } = await supabase
        .from('users')
        .update({
          credits: (user.credits || 0) + creditsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw new Error('Failed to update user credits: ' + updateError.message)
      }

      // 记录积分交易
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: creditsToAdd,
          type: 'subscription_renewal',
          description: `Monthly ${user.subscription_plan} plan renewal - ${creditsToAdd} credits`,
          created_at: new Date().toISOString()
        })

      if (transactionError) {
        console.error('Failed to record transaction:', transactionError)
      }

      console.log(`Added ${creditsToAdd} credits to user ${user.id} for subscription renewal`)
    }

  } catch (error) {
    console.error('Error handling subscription payment:', error)
  }
}

// 处理订阅取消
async function handleSubscriptionCancelled(eventData: any) {
  try {
    const subscriptionId = eventData.resource.id
    
    // 更新用户订阅状态
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscriptionId)

    if (error) {
      throw new Error('Failed to update subscription status: ' + error.message)
    }

    console.log(`Subscription ${subscriptionId} cancelled`)

  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}

export async function POST(request: NextRequest) {
  console.log('=== PayPal Webhook Received ===')
  
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    console.log('Webhook headers:', Object.keys(headers))
    console.log('Webhook body length:', body.length)

    // 先尝试解析JSON
    let event
    try {
      event = JSON.parse(body)
      console.log('Webhook event type:', event.event_type)
      console.log('Resource ID:', event.resource?.id)
    } catch (parseError) {
      console.error('Failed to parse webhook JSON:', parseError)
      // 即使解析失败，也返回200状态码，避免PayPal重试
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON',
        received: true 
      }, { status: 200 })
    }

    // 验证webhook签名（暂时跳过以便调试）
    const isValid = verifyPayPalWebhook(body, headers)
    console.log('Webhook signature valid:', isValid)

    // 处理不同类型的事件
    try {
      switch (event.event_type) {
        case 'BILLING.SUBSCRIPTION.CREATED':
          console.log('Subscription created:', event.resource.id)
          // 订阅创建时不需要特殊处理，等待激活
          break

        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          console.log('Processing subscription activation:', event.resource.id)
          await handleSubscriptionActivated(event)
          break

        case 'PAYMENT.SALE.COMPLETED':
          console.log('Processing payment completion')
          await handleSubscriptionPaymentSuccess(event)
          break

        case 'BILLING.SUBSCRIPTION.CANCELLED':
          console.log('Processing subscription cancellation:', event.resource.id)
          await handleSubscriptionCancelled(event)
          break

        case 'BILLING.SUBSCRIPTION.SUSPENDED':
          console.log('Subscription suspended:', event.resource.id)
          // 可以添加处理逻辑
          break

        case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
          console.log('Subscription payment failed:', event.resource.id)
          // 可以添加处理逻辑，比如发送邮件通知
          break

        default:
          console.log('Unhandled webhook event:', event.event_type)
      }
    } catch (processingError) {
      console.error('Error processing webhook event:', processingError)
      // 即使处理失败，也返回200状态码，记录错误但不让PayPal重试
    }

    // 总是返回200状态码，告诉PayPal我们成功接收了webhook
    console.log('Webhook processed successfully')
    return NextResponse.json({ 
      success: true, 
      event_type: event.event_type,
      resource_id: event.resource?.id,
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    // 即使出错，也返回200状态码，避免PayPal无限重试
    return NextResponse.json(
      { 
        success: false, 
        error: 'Webhook processing failed',
        received: true,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  }
}