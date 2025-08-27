const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_SECRET
)

async function debugUserData() {
  console.log('=== 检查用户数据 ===')
  
  // 检查所有用户
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .limit(10)
    
  if (error) {
    console.error('查询用户错误:', error)
    return
  }
  
  console.log('数据库中的用户数量:', users.length)
  users.forEach(user => {
    console.log(`用户: ${user.email} (ID: ${user.id}) - 积分: ${user.credits}`)
  })
  
  // 检查认证用户
  console.log('\n=== 检查认证系统用户 ===')
  const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('查询认证用户错误:', authError)
    return
  }
  
  console.log('认证系统中的用户数量:', authUsers.length)
  authUsers.forEach(user => {
    console.log(`认证用户: ${user.email} (ID: ${user.id})`)
  })
}

debugUserData()