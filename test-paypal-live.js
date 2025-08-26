const https = require('https');

// 使用你的Live模式Client ID和Secret
const CLIENT_ID = 'AS21uPHHA2gzwSZMA50Qbmm-xLdV8GPFXWJ_j4R6TcGtahECxCTSc3cjgtcJB71m9z7dRy3VCZKJO-3M';
const CLIENT_SECRET = 'EEh3U_ij4RpJtAThyxk6qxZrSlWcEKx_Fkx0yEDcKFeXoLuSuyB76w6aQVO7amRBxbmjjNoyfxvCmqFm';

const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

const options = {
  hostname: 'api-m.paypal.com',
  path: '/v1/oauth2/token',
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

console.log('Testing PayPal Live API connection...');
console.log('Client ID:', CLIENT_ID);
console.log('API Endpoint: https://api-m.paypal.com/v1/oauth2/token');

const req = https.request(options, (res) => {
  console.log('Response Status Code:', res.statusCode);
  console.log('Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response Data:', jsonData);
      
      if (res.statusCode === 200 && jsonData.access_token) {
        console.log('✅ SUCCESS: PayPal Live API connection successful!');
        console.log('Access Token:', jsonData.access_token.substring(0, 20) + '...');
      } else {
        console.log('❌ FAILED: PayPal API error');
        console.log('Error:', jsonData.error || 'Unknown error');
        console.log('Error Description:', jsonData.error_description || 'No description');
      }
    } catch (error) {
      console.log('❌ FAILED: Error parsing response');
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ FAILED: Network error');
  console.log('Error:', error.message);
});

// 发送请求体
req.write('grant_type=client_credentials');
req.end();