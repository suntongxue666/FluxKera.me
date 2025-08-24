const { createClient } = require('@supabase/supabase-js')

// 手动设置环境变量
const supabaseUrl = 'https://gdcjvqaqgvcxzufmessy.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkY2p2cWFxZ3ZjeHp1Zm1lc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIwNjY1MSwiZXhwIjoyMDY5NzgyNjUxfQ.LRR6iEw8IGTvLLWC0ZzIgkY1qxaiJ1O7sCA3RQANHmA'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Service Key exists:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testUserAccess() {
  console.log('Testing user access...')
  
  // 测试获取特定用户
  const testUserId = '3e20761e-83a2-4dc2-bfeb-57cc49eee59b' // sunwei7482@gmail.com的ID
  console.log('Testing access for user ID:', testUserId)
  
  // 使用服务端客户端获取用户数据
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', testUserId)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return
  }
  
  console.log('User data retrieved:')
  console.log('ID:', user.id)
  console.log('Email:', user.email)
  console.log('Credits:', user.credits)
  console.log('Avatar URL:', user.avatar_url)
  console.log('Created:', user.created_at)
  console.log('Updated:', user.updated_at)
  
  // 测试更新用户数据
  console.log('\nTesting user update...')
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      updated_at: new Date().toISOString()
    })
    .eq('id', testUserId)
    .select()
    .single()
  
  if (updateError) {
    console.error('Error updating user:', updateError)
  } else {
    console.log('User updated successfully')
    console.log('Updated at:', updatedUser.updated_at)
  }
}

// 运行测试
testUserAccess().catch(console.error)