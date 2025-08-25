-- 检查当前的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 如果没有策略，创建一个允许用户查询自己数据的策略
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- 如果需要，也允许用户更新自己的数据
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- 确保 RLS 已启用
ALTER TABLE users ENABLE ROW LEVEL SECURITY;