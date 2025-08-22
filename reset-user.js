// 重置特定用户的脚本
const { createClient } = require('@supabase/supabase-js');

// 从.env.local文件中读取环境变量
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // 使用匿名密钥

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少必要的环境变量，请确保设置了NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetUser(email) {
  try {
    // 查找用户
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    
    if (findError) {
      console.error('查找用户时出错:', findError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log(`未找到邮箱为 ${email} 的用户`);
      return;
    }
    
    console.log(`找到 ${users.length} 个用户:`);
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Credits: ${user.credits}`);
    });
    
    // 删除用户相关的所有记录
    for (const user of users) {
      // 删除积分交易记录
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .delete()
        .eq('user_id', user.id);
      
      if (transactionError) {
        console.error(`删除用户 ${user.id} 的积分交易记录时出错:`, transactionError);
      } else {
        console.log(`已删除用户 ${user.id} 的积分交易记录`);
      }
      
      // 删除生成记录
      const { error: generationError } = await supabase
        .from('generations')
        .delete()
        .eq('user_id', user.id);
      
      if (generationError) {
        console.error(`删除用户 ${user.id} 的生成记录时出错:`, generationError);
      } else {
        console.log(`已删除用户 ${user.id} 的生成记录`);
      }
      
      // 删除订阅记录
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      if (subscriptionError) {
        console.error(`删除用户 ${user.id} 的订阅记录时出错:`, subscriptionError);
      } else {
        console.log(`已删除用户 ${user.id} 的订阅记录`);
      }
      
      // 删除用户记录
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      
      if (userError) {
        console.error(`删除用户 ${user.id} 时出错:`, userError);
      } else {
        console.log(`已删除用户 ${user.id}`);
      }
    }
    
    console.log(`用户 ${email} 已重置，下次登录时将获得20积分`);
  } catch (error) {
    console.error('重置用户时出错:', error);
  }
}

// 重置指定用户
const userEmail = 'sunwei7482@gmail.com';
resetUser(userEmail);