require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Service Key exists:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET')
  process.exit(1)
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUsers() {
  console.log('Checking users in database...')
  
  // 获取所有用户
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('Error fetching users:', error)
    return
  }
  
  console.log('Found', users.length, 'users:')
  users.forEach((user, index) => {
    console.log(`${index + 1}. ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Credits: ${user.credits}`)
    console.log(`   Avatar URL: ${user.avatar_url}`)
    console.log(`   Created: ${user.created_at}`)
    console.log(`   Updated: ${user.updated_at}`)
    console.log('---')
  })
}

// 运行检查
checkUsers().catch(console.error)