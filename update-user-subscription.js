const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_SECRET
)

async function updateUserSubscription() {
  try {
    console.log('Updating user subscription info...')
    
    const subscriptionId = 'I-SN317ELSNSJW'
    const userEmail = 'sunwei7482@gmail.com'
    const planName = 'Pro'
    
    // 更新用户订阅信息
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        subscription_plan: planName,
        subscription_id: subscriptionId,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('email', userEmail)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update user subscription:', updateError)
      return
    }

    console.log('✅ User subscription updated successfully:')
    console.log(`- Email: ${updatedUser.email}`)
    console.log(`- Credits: ${updatedUser.credits}`)
    console.log(`- Plan: ${updatedUser.subscription_plan}`)
    console.log(`- Subscription ID: ${updatedUser.subscription_id}`)
    console.log(`- Status: ${updatedUser.subscription_status}`)

  } catch (error) {
    console.error('Update error:', error)
  }
}

updateUserSubscription()