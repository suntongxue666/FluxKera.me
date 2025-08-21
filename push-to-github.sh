#!/bin/bash

# 设置Git用户信息为协作者账号
git config user.email "tiktreeapp@gmail.com"
git config user.name "TikTree App"

# 设置GitHub凭据存储
git config --global credential.helper store

# 设置Git使用代理
echo "正在设置代理..."
# 直接使用7890端口，因为我们已经确认它可以工作
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 验证代理设置
echo "验证代理设置..."
curl -I --proxy http://127.0.0.1:7890 https://github.com > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "代理设置正确，可以访问GitHub"
else
  echo "代理设置可能有问题，但我们仍将尝试推送"
fi

# 确保远程URL不包含任何Token
git remote set-url origin https://github.com/suntongxue666/FluxKera.me.git

# 使用环境变量方式处理GitHub凭据，更安全
echo "请输入您的GitHub用户名 (tiktreeapp):"
read -p "> " GH_USERNAME
GH_USERNAME=${GH_USERNAME:-tiktreeapp}

echo "请输入您的GitHub个人访问令牌 (不会显示在屏幕上):"
read -s -p "> " GH_TOKEN
echo ""

if [ -z "$GH_TOKEN" ]; then
  echo "错误: 未提供访问令牌"
  exit 1
fi

# 临时设置远程URL，包含凭据
echo "配置远程仓库URL..."
git remote set-url origin https://${GH_USERNAME}:${GH_TOKEN}@github.com/suntongxue666/FluxKera.me.git

# 添加所有更改
echo "添加所有更改..."
git add .

# 提交更改
echo "提交更改..."
read -p "请输入提交信息: " commit_message
git commit -m "$commit_message"

# 推送到GitHub
echo "正在通过代理推送更改到GitHub..."
git push origin main

# 保存推送结果
push_result=$?

# 推送完成后，取消代理设置
echo "清除代理设置..."
git config --global --unset http.proxy
git config --global --unset https.proxy

# 检查推送结果
if [ $push_result -eq 0 ]; then
  echo "✅ 成功推送更改到GitHub！"
else
  echo "❌ 推送失败。错误代码: $push_result"
  echo "正在获取详细错误信息..."
  
  # 尝试获取更多错误信息
  git fetch origin
  
  echo "请检查以下可能的问题:"
  echo "1. Personal Access Token是否有效且具有正确的权限"
  echo "2. 代理设置是否正确"
  echo "3. 网络连接是否稳定"
  echo "4. 远程仓库是否存在冲突"
  
  # 恢复原始远程URL，不包含令牌
  git remote set-url origin https://github.com/suntongxue666/FluxKera.me.git
fi
