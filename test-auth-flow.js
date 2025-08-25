require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testAuthFlow() {
  console.log('Testing auth flow...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('URL:', supabaseUrl)
  console.log('Anon key exists:', !!supabaseAnonKey)
  
  try {
    // 创建客户端
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce'
      }
    })
    console.log('Supabase client created successfully')
    
    // 测试OAuth URL生成
    console.log('Testing OAuth URL generation...')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://www.fluxkrea.me/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        },
        skipBrowserRedirect: false
      }
    })
    
    if (error) {
      console.error('OAuth error:', error)
    } else {
      console.log('OAuth URL generated successfully!')
      console.log('URL preview:', data.url?.substring(0, 150) + '...')
      
      // 检查URL参数
      if (data.url) {
        const url = new URL(data.url)
        console.log('Provider:', url.searchParams.get('provider'))
        console.log('Redirect URL:', decodeURIComponent(url.searchParams.get('redirect_to') || ''))
        console.log('Has code challenge:', url.searchParams.has('code_challenge'))
        console.log('Code challenge method:', url.searchParams.get('code_challenge_method'))
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testAuthFlow()