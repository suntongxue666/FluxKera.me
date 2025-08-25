const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

async function testWebhook() {
  try {
    console.log('Testing webhook with subscription activation event...')
    
    // 模拟PayPal webhook事件
    const webhookEvent = {
      id: 'WH-TEST-123',
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: 'I-TEST123456789',
        status: 'ACTIVE',
        subscriber: {
          email_address: 'test@example.com'
        }
      }
    }

    const response = await fetch('https://www.fluxkrea.me/api/paypal/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookEvent)
    })

    const result = await response.text()
    console.log('Webhook response status:', response.status)
    console.log('Webhook response:', result)

  } catch (error) {
    console.error('Test webhook error:', error)
  }
}

testWebhook()