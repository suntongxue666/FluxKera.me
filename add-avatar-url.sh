#!/bin/bash

# 设置Supabase项目ID和密钥
SUPABASE_PROJECT_ID="gdcjvqaqgvcxzufmessy"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkY2p2cWFxZ3ZjeHp1Zm1lc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIwNjY1MSwiZXhwIjoyMDY5NzgyNjUxfQ.LRR6iEw8IGTvLLWC0ZzIgkY1qxaiJ1O7sCA3RQANHmA"

# 检查是否安装了psql
if ! command -v psql &> /dev/null
then
    echo "psql未安装，请先安装PostgreSQL客户端"
    exit 1
fi

# 连接到Supabase数据库并执行SQL命令
echo "正在添加avatar_url字段..."
psql "postgres://postgres:${SUPABASE_SERVICE_KEY}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres" -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;"

echo "字段添加完成！"