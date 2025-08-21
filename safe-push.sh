#!/bin/bash

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
echo "请输入提交信息:"
read COMMIT_MESSAGE
git commit -m "$COMMIT_MESSAGE"

# 推送到GitHub
echo "正在推送到GitHub..."
git push origin main

echo "完成！"