#!/bin/bash

# 设置变量
USERNAME="tiktreeapp"
TOKEN="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"  # 您的个人访问令牌
COMMIT_MESSAGE="添加Google登录测试页面和调试功能"
REPO="suntongxue666/FluxKera.me.git"

# 设置代理
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890

# 验证代理设置
echo "验证代理设置..."
if curl -s --connect-timeout 5 https://github.com > /dev/null; then
  echo "代理设置正确，可以访问GitHub"
else
  echo "警告：无法通过代理访问GitHub，可能会导致推送失败"
fi

# 添加所有更改
git add .

# 提交更改
git commit -m "$COMMIT_MESSAGE"

# 设置远程URL（包含令牌）
git remote set-url origin "https://$USERNAME:$TOKEN@github.com/$REPO"

# 推送到GitHub
echo "正在推送到GitHub..."
git push origin main

# 重置远程URL（移除令牌）
git remote set-url origin "https://github.com/$REPO"

echo "完成！"