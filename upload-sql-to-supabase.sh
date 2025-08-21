#!/bin/bash

# 确保已安装Supabase CLI
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI未安装，请先安装"
    echo "安装命令: npm install -g supabase"
    exit 1
fi

# 设置Supabase项目ID和密钥
SUPABASE_PROJECT_ID="gdcjvqaqgvcxzufmessy"
echo "请输入Supabase服务密钥(service_role key):"
read -s SUPABASE_SERVICE_KEY

# 上传SQL文件
echo "正在上传SQL函数和RLS策略..."
supabase db push --db-url "postgresql://postgres:${SUPABASE_SERVICE_KEY}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres" ./supabase/migrations/20250821_create_functions.sql

echo "正在添加avatar_url字段..."
supabase db push --db-url "postgresql://postgres:${SUPABASE_SERVICE_KEY}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres" ./supabase/migrations/20250821_add_avatar_url.sql

echo "SQL文件上传完成！"