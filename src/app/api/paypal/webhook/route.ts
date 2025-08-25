import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

// 验证PayPal webhook签名
function verifyPayPalWebhook(payload: string, headers: any): boolean {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    const certId = headers['paypal-cert-id']
    const signature = headers['paypal-transmission-sig']
    const timestamp = headers['paypal-transmission-time']
    const authAlgo = headers['paypal-auth-algo']

    if (!webhookId || !certId || !signature || !timestamp || !authAlgo) {
      console.error('Missing required webhook headers')
      return false
    }

    // 在生产环境中，你应该验证PayPal的证书和签名
    // 这里为了简化，我们暂时返回true
    // 在实际部署时，请实现完整的签名验证
    return true

  } catch (error) {
    console.error('Webhook verification error:', error)
    return false
  }
}

// 处理订阅支付成功
async function handleSubscriptionPaymentSuccess(eventData: any) {
  try {
    const subscriptionId = eventData.resource.billing_agreement_id || eventData.resource.id
    
    // 从数据库获取订阅信息
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .single()

    if (error || !user) {
      console.error('User not found for subscription:', subscriptionId)
      return
    }

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
          credits: user.credits + creditsToAdd,
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
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // 验证webhook签名
    if (!verifyPayPalWebhook(body, headers)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('PayPal webhook event:', event.event_type)

    // 处理不同类型的事件
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log('Subscription activated:', event.resource.id)
        break

      case 'PAYMENT.SALE.COMPLETED':
        console.log('Payment completed for subscription')
        await handleSubscriptionPaymentSuccess(event)
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.log('Subscription cancelled:', event.resource.id)
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

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}