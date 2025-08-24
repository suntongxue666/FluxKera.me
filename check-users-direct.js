// 检查用户数据的脚本
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 从.env.local文件读取环境变量
function loadEnvFromFile() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          const cleanKey = key.trim();
          const cleanValue = value.trim().replace(/"/g, '');
          process.env[cleanKey] = cleanValue;
          console.log(`Loaded env var: ${cleanKey} = ${cleanValue.substring(0, 20)}...`);
        }
      }
    });
  } catch (error) {
    console.error('Error reading .env.local file:', error);
  }
}

loadEnvFromFile();

// Supabase配置
console.log('\n--- Available Supabase env vars ---');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_SECRET:', process.env.SUPABASE_SERVICE_SECRET ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_SECRET || process.env.SUPABASE_SERVICE_KEY;

console.log('\n--- Using ---');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Service Key exists:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser(email) {
  try {
    console.log(`\n=== Checking user with email: ${email} ===`);
    
    // 检查users表
    console.log('\n--- Checking users table ---');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user from users table:', userError);
    } else if (userData) {
      console.log('User data from users table:', userData);
    } else {
      console.log('No user found in users table');
    }
    
    // 检查auth.users表
    console.log('\n--- Checking auth.users table ---');
    const { data: authData, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (authError && authError.code !== 'PGRST116') {
      console.error('Error fetching user from auth.users table:', authError);
    } else if (authData) {
      console.log('User data from auth.users table:', authData);
      console.log('User ID:', authData.id);
      console.log('User email:', authData.email);
      console.log('User created at:', authData.created_at);
    } else {
      console.log('No user found in auth.users table');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// 检查指定用户
checkUser('sunwei7482@gmail.com');