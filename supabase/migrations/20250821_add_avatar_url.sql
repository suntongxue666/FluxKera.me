-- 添加avatar_url字段到users表
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 更新现有用户的avatar_url（如果有Google用户元数据）
UPDATE users
SET avatar_url = auth.users.raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE users.id::text = auth.users.id::text
  AND auth.users.raw_user_meta_data->>'avatar_url' IS NOT NULL;

-- 如果没有avatar_url但有picture字段，也使用它
UPDATE users
SET avatar_url = auth.users.raw_user_meta_data->>'picture'
FROM auth.users
WHERE users.id::text = auth.users.id::text
  AND users.avatar_url IS NULL
  AND auth.users.raw_user_meta_data->>'picture' IS NOT NULL;
