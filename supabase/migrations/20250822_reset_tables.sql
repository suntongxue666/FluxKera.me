-- 删除现有表和函数
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS generations CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 删除函数
DROP FUNCTION IF EXISTS decrement_user_credits(UUID, INT);

-- 创建最小化的users表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  avatar_url TEXT,
  credits INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建RLS策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许认证用户查看自己的信息
CREATE POLICY "用户只能查看自己的信息" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- 允许认证用户更新自己的信息
CREATE POLICY "用户只能更新自己的信息" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- 允许认证用户插入自己的信息
CREATE POLICY "用户只能插入自己的信息" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 为服务端操作创建策略（允许服务端角色操作）
CREATE POLICY "服务端可以操作所有用户数据" 
  ON users FOR ALL 
  USING (auth.role() = 'service_role');

-- 创建简单的积分交易表（可选）
CREATE TABLE credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'credit' 或 'debit'
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建RLS策略
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的积分交易" 
  ON credit_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- 为服务端操作创建策略（允许服务端角色操作）
CREATE POLICY "服务端可以操作所有积分交易" 
  ON credit_transactions FOR ALL 
  USING (auth.role() = 'service_role');