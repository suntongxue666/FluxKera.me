# PayPal订阅支付功能实现文档

## 📋 功能概述

实现了完整的PayPal订阅支付系统，支持Pro Plan（$9.9/月，1000积分）和Max Plan（$29.9/月，5000积分）的月度订阅。

## 🏗️ 架构组件

### 1. 前端组件
- **PayPalCheckout.tsx** - PayPal支付按钮组件
- **pricing/page.tsx** - 更新的定价页面，集成PayPal支付
- **subscription/success/page.tsx** - 支付成功页面
- **subscription/cancel/page.tsx** - 支付取消页面

### 2. API路由
- **api/paypal/create-subscription** - 创建PayPal订阅
- **api/paypal/confirm-subscription** - 确认订阅并更新用户积分
- **api/paypal/webhook** - 处理PayPal webhook事件

### 3. 数据库更新
- **update-subscription-schema.sql** - 数据库表结构更新脚本

## 🔧 环境变量配置

已配置的PayPal环境变量：
```env
PAYPAL_CLIENT_ID="AeiqNbUf4z7-oudEQf2oSL3-rf_xP_dHmED4pvoei4B2eH8TdPK2ajLWXiQSy78Uh3ekjxx14wZEsX-8"
PAYPAL_CLIENT_SECRET="ENlcBlade--RMAM6EWnp16tTsPaw_nDogYdriNgIfI4KSng-kY2YhqO7job-WRa6tDctYFGXAf9MWLzC"
PAYPAL_ENVIRONMENT="sandbox"
PAYPAL_WEBHOOK_ID="4M578680BD123783S"
```

## 💳 支付流程

### 用户订阅流程：
1. 用户在定价页面选择Pro或Max计划
2. 点击PayPal支付按钮
3. 跳转到PayPal完成支付
4. 支付成功后返回成功页面
5. 系统自动添加对应积分到用户账户

### 月度续费流程：
1. PayPal自动扣费
2. 发送webhook到系统
3. 系统自动添加月度积分
4. 记录积分交易历史

## 📊 积分规则

- **Pro Plan**: 每月1000积分
- **Max Plan**: 每月5000积分
- **每次生图**: 消耗10积分

## 🗄️ 数据库表结构

### users表新增字段：
- `subscription_plan` - 订阅计划名称
- `subscription_id` - PayPal订阅ID
- `subscription_status` - 订阅状态

### 新增subscriptions表：
- 完整的订阅历史记录
- 支持订阅状态跟踪

### credit_transactions表：
- 支持订阅相关的积分交易类型

## 🔒 安全特性

- PayPal webhook签名验证
- Supabase RLS策略保护
- 用户只能查看自己的订阅信息
- 服务端验证所有支付状态

## 🚀 部署步骤

1. **数据库更新**：
   ```sql
   -- 执行 update-subscription-schema.sql 中的SQL语句
   ```

2. **环境变量**：
   - 确保所有PayPal环境变量已配置
   - 生产环境需要更新为正式的PayPal凭据

3. **Webhook配置**：
   - 在PayPal开发者控制台配置webhook URL
   - URL: `https://your-domain.com/api/paypal/webhook`

## 🧪 测试指南

### 测试用户登录状态问题：
访问 `/debug-auth` 页面监控：
- 用户登录状态变化
- Session有效性
- 积分余额更新

### 测试支付流程：
1. 登录用户账户
2. 访问 `/pricing` 页面
3. 选择Pro或Max计划
4. 使用PayPal沙盒账户测试支付

## 📝 待办事项

1. **生产环境配置**：
   - 更新PayPal为生产环境凭据
   - 配置正式的webhook URL

2. **邮件通知**：
   - 订阅成功邮件
   - 支付失败通知
   - 订阅取消确认

3. **用户仪表板**：
   - 订阅管理页面
   - 积分使用历史
   - 取消订阅功能

## 🔍 调试信息

### 登录状态问题排查：
在浏览器F12中查看：
- **Console**: 查看认证状态变化日志
- **Network**: 检查API请求是否成功
- **Application**: 查看LocalStorage中的session数据

### 常见问题：
1. **积分不足跳转**: 现在会显示英文提示并3秒后跳转到Pricing页面
2. **登录状态丢失**: 已添加定期检查和自动恢复机制
3. **支付失败**: 检查PayPal凭据和网络连接

## 📈 监控指标

建议监控的关键指标：
- 订阅转化率
- 支付成功率
- 用户留存率
- 积分使用情况
- 登录状态稳定性