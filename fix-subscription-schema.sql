-- 简化版订阅schema修复脚本
-- 只包含必要的表结构更新

-- 1. 更新users表，添加订阅相关字段
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT NULL;

-- 2. 更新credit_transactions表，确保支持订阅类型
ALTER TABLE public.credit_transactions 
ALTER COLUMN type TYPE VARCHAR(50);

-- 3. 创建订阅历史表（可选，用于详细记录）
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

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_id ON public.subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 5. 启用RLS（如果需要）
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. 创建RLS策略（分步执行避免语法错误）
DO $$
BEGIN
    -- 删除现有策略
    DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
    
    -- 创建新策略
    CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Policy creation failed, continuing...';
END $$;