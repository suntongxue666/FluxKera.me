-- 创建扣除用户积分的存储过程
CREATE OR REPLACE FUNCTION decrement_user_credits(user_id_param UUID, amount INT)
RETURNS VOID AS $$
BEGIN
  -- 更新用户积分
  UPDATE users
  SET credits = credits - amount,
      updated_at = NOW()
  WHERE id = user_id_param;
  
  -- 记录积分交易
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    description,
    created_at
  ) VALUES (
    user_id_param,
    'debit',
    amount,
    '生成图片消费',
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- 创建RLS策略
-- 用户表策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的信息" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的信息" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- 积分交易表策略
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的积分交易" 
  ON credit_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- 生成记录表策略
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的生成记录" 
  ON generations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的生成记录" 
  ON generations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 订阅表策略
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能查看自己的订阅" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);