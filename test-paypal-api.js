// 测试PayPal API连接
const testPayPalAPI = async () => {
  const PAYPAL_CLIENT_ID = "AeiqNbUf4z7-oudEQf2oSL3-rf_xP_dHmED4pvoei4B2eH8TdPK2ajLWXiQSy78Uh3ekjxx14wZEsX-8"
  const PAYPAL_CLIENT_SECRET = "ENlcBlade--RMAM6EWnp16tTsPaw_nDogYdriNgIfI4KSng-kY2YhqO7job-WRa6tDctYFGXAf9MWLzC"
  const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"

  try {
    // 获取访问令牌
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
    
    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const tokenData = await tokenResponse.json()
    console.log('✅ PayPal Token Response:', tokenData.access_token ? 'Success' : 'Failed')
    
    if (tokenData.access_token) {
      console.log('🎉 PayPal API连接成功！')
      console.log('📝 测试步骤：')
      console.log('1. 启动开发服务器: npm run dev')
      console.log('2. 访问: http://localhost:3000/pricing')
      console.log('3. 登录你的Google账户')
      console.log('4. 点击 Choose Pro 或 Choose Max')
      console.log('5. 应该会跳转到PayPal沙盒支付页面')
      console.log('')
      console.log('🔧 PayPal沙盒测试账户信息：')
      console.log('- 买家账户: sb-buyer@personal.example.com')
      console.log('- 密码: 通常是自动生成的，可在PayPal开发者控制台查看')
      console.log('')
      console.log('💡 如果需要创建测试账户，请访问：')
      console.log('https://developer.paypal.com/developer/accounts/')
    } else {
      console.log('❌ PayPal API连接失败')
      console.log('错误信息:', tokenData)
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

testPayPalAPI()