-- 更新users表，添加订阅相关字段
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT NULL;

-- 创建订阅历史表
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  paypal_subscription_id VARCHAR(100) NOT NULL,
  plan_name VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  credits_per_month INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建订阅历史表的索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_id ON public.subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 更新credit_transactions表，确保支持订阅类型
ALTER TABLE public.credit_transactions 
ALTER COLUMN type TYPE VARCHAR(50);

-- 添加订阅相关的积分交易类型注释
COMMENT ON COLUMN public.credit_transactions.type IS 'Types: credit, debit, subscription, subscription_renewal, bonus, refund';

-- 创建或更新RLS策略
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的订阅
CREATE POLICY IF NOT EXISTS "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 创建函数来处理订阅续费
CREATE OR REPLACE FUNCTION public.handle_subscription_renewal(
  p_user_id UUID,
  p_plan_name VARCHAR(20),
  p_credits INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 更新用户积分
  UPDATE public.users 
  SET 
    credits = credits + p_credits,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 记录积分交易
  INSERT INTO public.credit_transactions (user_id, type, amount, description, created_at)
  VALUES (
    p_user_id,
    'subscription_renewal',
    p_credits,
    CONCAT('Monthly ', p_plan_name, ' plan renewal - ', p_credits, ' credits'),
    NOW()
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数来取消订阅
CREATE OR REPLACE FUNCTION public.cancel_subscription(
  p_user_id UUID,
  p_subscription_id VARCHAR(100)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 更新用户订阅状态
  UPDATE public.users 
  SET 
    subscription_status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_user_id AND subscription_id = p_subscription_id;
  
  -- 更新订阅记录
  UPDATE public.subscriptions 
  SET 
    status = 'cancelled',
    ended_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND paypal_subscription_id = p_subscription_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;