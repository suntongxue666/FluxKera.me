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

# 提示用户输入GitHub用户名和个人访问令牌
echo "请输入您的GitHub用户名："
read GH_USERNAME
echo "请输入您的GitHub个人访问令牌："
read GH_TOKEN

# 临时设置远程URL，包含凭据
git remote set-url origin https://${GH_USERNAME}:${GH_TOKEN}@github.com/suntongxue666/FluxKera.me.git

# 推送到GitHub
echo "正在通过代理推送更改到GitHub..."
git push origin main

# 推送完成后，取消代理设置
git config --global --unset http.proxy
git config --global --unset https.proxy

# 检查推送结果
if [ $? -eq 0 ]; then
  echo "成功推送更改到GitHub！"
else
  echo "推送失败。请检查代理设置或GitHub状态。"
fi
