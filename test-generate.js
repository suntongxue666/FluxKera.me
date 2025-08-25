require('dotenv').config({ path: '.env.local' })

async function testGeneration() {
  const token = process.env.REPLICATE_API_TOKEN
  
  console.log('Testing image generation...')
  
  try {
    // 创建预测
    const payload = {
      input: {
        prompt: "a beautiful sunset over mountains",
        width: 1024,
        height: 1024,
        guidance: 4.5,
        num_steps: 28,
        seed: 42,
      },
    };

    console.log('Creating prediction...')
    const createResp = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Create Response Status:', createResp.status)
    
    if (!createResp.ok) {
      const errorText = await createResp.text();
      console.error('Failed to create prediction:', createResp.status, errorText);
      return
    }

    const created = await createResp.json();
    console.log('Prediction created:', {
      id: created.id,
      status: created.status,
      urls: created.urls
    })
    
    const getUrl = created?.urls?.get;
    let status = created?.status;

    // 轮询状态
    let attempts = 0;
    while (status && status !== 'succeeded' && status !== 'failed' && attempts < 10) {
      console.log(`Attempt ${attempts + 1}: Status is ${status}, waiting...`)
      await new Promise(r => setTimeout(r, 2000));
      
      const pollResp = await fetch(getUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!pollResp.ok) {
        console.error('Poll failed:', pollResp.status, await pollResp.text())
        break
      }
      
      const polled = await pollResp.json();
      status = polled?.status;
      
      if (status === 'succeeded') {
        console.log('Generation succeeded!')
        console.log('Output:', polled.output)
        break;
      } else if (status === 'failed') {
        console.error('Generation failed:', polled?.error || 'unknown error');
        break;
      }
      attempts++;
    }

  } catch (error) {
    console.error('Error:', error.message)
  }
}

testGeneration()