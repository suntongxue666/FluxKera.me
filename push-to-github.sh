#!/bin/bash

# 设置GitHub凭据
git config --global credential.helper store

# 更新远程URL，包含PAT
git remote set-url origin https://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@github.com/suntongxue666/FluxKera.me.git

# 推送到GitHub
echo "正在推送更改到GitHub..."
git push origin main

# 检查推送结果
if [ $? -eq 0 ]; then
  echo "成功推送更改到GitHub！"
else
  echo "推送失败。请检查网络连接或GitHub状态。"
fi