const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_SECRET
)

async function testSchema() {
  try {
    console.log('Testing database schema...')
    
    // 测试查询users表结构
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error querying users table:', error)
      return
    }
    
    console.log('Users table sample:', data)
    
    if (data && data.length > 0) {
      console.log('Available columns:', Object.keys(data[0]))
    }
    
    // 测试查询特定用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'sunwei7482@gmail.com')
      .single()
    
    if (userError) {
      console.error('Error finding user:', userError)
    } else {
      console.log('Found user:', user)
    }
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

testSchema()