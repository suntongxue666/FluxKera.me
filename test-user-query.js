require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testUserQuery() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_SECRET
  
  console.log('Testing user query...')
  console.log('URL:', supabaseUrl)
  console.log('Service key exists:', !!supabaseServiceKey)
  
  // 使用服务端客户端（绕过 RLS）
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // 查询特定用户
    const testUserId = '3e20761e-83a2-4dc2-bfeb-57cc49eee59b' // sunwei7482@gmail.com 的 ID
    
    console.log('Querying user:', testUserId)
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (error) {
      console.error('Query error:', error)
    } else {
      console.log('User data:', data)
    }
    
    // 也测试一下使用匿名客户端
    console.log('\nTesting with anon client...')
    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (anonError) {
      console.error('Anon query error:', anonError)
    } else {
      console.log('Anon user data:', anonData)
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testUserQuery()