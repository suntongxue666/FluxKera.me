# FluxKrea AI 图片生成网站

基于 FLUX.1 Krea 开源模型的 AI 图片生成平台，集成 Replicate API 实现在线生图功能。

## 🚀 快速开始

### 前提条件

- Node.js 18+ 和 npm
- Python 3.8+ (用于本地测试API)
- Supabase 账号
- Replicate API 密钥
- PayPal 开发者账号
- Google OAuth 凭证

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/flux-krea-website.git
cd flux-krea-website
```

2. 配置环境变量
```bash
cp .env.example .env.local
```
编辑 `.env.local` 文件，填入您的API密钥和配置信息。

3. 使用启动脚本
```bash
./start-dev.sh
```
这将安装依赖、启动本地测试API和Next.js开发服务器。

4. 访问网站
打开浏览器访问 http://localhost:3000

## 🛠️ 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **AI 模型**: FLUX.1 Krea (通过 Replicate API)
- **支付**: PayPal SDK
- **认证**: Google OAuth (通过 Supabase)
- **部署**: Vercel

## 📋 功能列表

- **AI 图片生成** - 基于 FLUX.1 Krea 模型
- **用户系统** - Google 登录，积分管理
- **订阅购买** - PayPal 支付，三种套餐
- **图片画廊** - 社区作品展示
- **响应式设计** - 支持移动端和桌面端

## 💾 数据库设计

### 表结构
1. **users** - 用户信息
   - id, email, google_id, credits, created_at, updated_at

2. **generations** - 生图记录
   - id, user_id, prompt, image_url, credits_used, created_at

3. **subscriptions** - 订阅记录
   - id, user_id, plan_type, credits_added, amount, paypal_order_id, status, created_at

4. **credit_transactions** - 积分交易
   - id, user_id, type, amount, description, created_at

## 🔧 环境配置

### 必需的环境变量
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Replicate API
REPLICATE_API_TOKEN=your_replicate_api_token

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🚀 部署步骤

### 1. 配置 Supabase
1. 创建 Supabase 项目
2. 创建数据库表 (见上方表结构)
3. 配置 Google OAuth 认证
4. 获取 API 密钥

### 2. 配置 Replicate
1. 注册 Replicate 账号
2. 获取 API Token
3. 确认 FLUX.1 Krea 模型可用

### 3. 配置 PayPal
1. 创建 PayPal 开发者账号
2. 创建应用获取 Client ID
3. 配置 Webhook (可选)

### 4. 部署到 Vercel
1. 连接 GitHub 仓库
2. 配置环境变量
3. 部署项目

## 📝 开发指南

### 本地开发
```bash
# 启动开发环境
./start-dev.sh

# 或者手动启动
npm run dev
```

### 构建部署
```bash
npm run build
npm start
```

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🙏 致谢

- [FLUX.1 Krea](https://github.com/krea-ai/flux-krea) - 开源 AI 图像生成模型
- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代品
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Replicate](https://replicate.com/) - AI 模型部署平台