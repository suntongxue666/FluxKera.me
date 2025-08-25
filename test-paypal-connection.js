// 测试PayPal API连接
require('dotenv').config({ path: '.env.local' })

const PAYPAL_API_BASE = process.env.PAYPAL_ENVIRONMENT === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

async function testPayPalConnection() {
  try {
    console.log('🔍 Testing PayPal API connection...')
    console.log('Environment:', process.env.PAYPAL_ENVIRONMENT)
    console.log('API Base:', PAYPAL_API_BASE)
    console.log('Client ID:', process.env.PAYPAL_CLIENT_ID ? 'Set ✅' : 'Missing ❌')
    console.log('Client Secret:', process.env.PAYPAL_CLIENT_SECRET ? 'Set ✅' : 'Missing ❌')

    // 获取访问令牌
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const data = await response.json()
    
    if (data.access_token) {
      console.log('✅ PayPal API connection successful!')
      console.log('Access token received:', data.access_token.substring(0, 20) + '...')
      console.log('Token type:', data.token_type)
      console.log('Expires in:', data.expires_in, 'seconds')
      return true
    } else {
      console.log('❌ Failed to get access token')
      console.log('Response:', data)
      return false
    }
  } catch (error) {
    console.error('❌ PayPal API connection failed:', error.message)
    return false
  }
}

// 运行测试
testPayPalConnection()