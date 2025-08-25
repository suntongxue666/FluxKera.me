const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_SECRET
)

async function manualActivateSubscription() {
  try {
    console.log('Manually activating subscription I-SN317ELSNSJW...')
    
    const subscriptionId = 'I-SN317ELSNSJW'
    const userEmail = 'sunwei7482@gmail.com'
    const planName = 'Pro'
    const credits = 1000
    
    // 1. 查找用户
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (getUserError || !user) {
      console.error('User not found:', userEmail, getUserError)
      return
    }

    console.log('Found user:', { id: user.id, email: user.email, currentCredits: user.credits })

    // 2. 检查是否需要添加订阅字段
    const userColumns = Object.keys(user)
    console.log('User table columns:', userColumns)
    
    if (!userColumns.includes('subscription_id')) {
      console.log('⚠️  Database schema needs to be updated!')
      console.log('Please run the SQL script: update-subscription-schema.sql')
      
      // 暂时只更新积分
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          credits: (user.credits || 0) + credits,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update user credits:', updateError)
        return
      }

      console.log(`✅ Added ${credits} credits to user ${user.id}`)
      console.log(`Credits: ${user.credits} → ${updatedUser.credits}`)
      
      // 记录积分交易
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: credits,
          type: 'subscription',
          description: `${planName} plan manual activation - ${credits} credits (${subscriptionId})`,
          created_at: new Date().toISOString()
        })

      if (transactionError) {
        console.error('Failed to record transaction:', transactionError)
      } else {
        console.log('✅ Transaction recorded successfully')
      }
      
    } else {
      // 完整更新包括订阅信息
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
        return
      }

      console.log(`✅ Subscription activated for user ${user.id}`)
      console.log(`Credits: ${user.credits} → ${updatedUser.credits}`)
      console.log(`Plan: ${updatedUser.subscription_plan}`)
      console.log(`Status: ${updatedUser.subscription_status}`)
    }

  } catch (error) {
    console.error('Manual activation error:', error)
  }
}

manualActivateSubscription()