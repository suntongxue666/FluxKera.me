# FluxKrea AI 图片生成网站

基于 FLUX.1 Krea 开源模型的 AI 图片生成平台，集成 Replicate API 实现在线生图功能。

## 🚀 项目特点

### 技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **AI 模型**: FLUX.1 Krea (通过 Replicate API)
- **支付**: PayPal SDK
- **认证**: Google OAuth (通过 Supabase)
- **部署**: Vercel

### 核心功能
1. **AI 图片生成** - 首页集成，基于 FLUX.1 Krea 模型
2. **用户系统** - Google 登录，积分管理
3. **订阅购买** - PayPal 支付，三种套餐
4. **图片画廊** - 社区作品展示
5. **响应式设计** - 支持移动端和桌面端

## 📁 项目结构

```
flux-krea-website/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 首页 (集成 AI 生图)
│   │   ├── pricing/           # 定价页面
│   │   ├── gallery/           # 图片画廊
│   │   └── api/generate/      # AI 生图 API
│   ├── components/            # React 组件
│   │   ├── AIGenerator.tsx    # AI 生图核心组件
│   │   ├── Header.tsx         # 导航栏
│   │   └── Footer.tsx         # 页脚
│   └── lib/                   # 工具库
│       ├── supabase.ts        # 数据库配置
│       ├── replicate.ts       # AI 模型集成
│       └── auth.ts            # 认证功能
├── .env.local                 # 环境变量
└── tailwind.config.js         # 样式配置
```

## 🎨 AI 生图功能

### 模型配置 (基于开源项目)
- **模型**: FLUX.1 Krea Dev (12B 参数)
- **分辨率**: 1024×1024 到 1280×1280 (必须是16的倍数)
- **引导强度**: 3.5 - 5.0 (推荐 4.5)
- **生成步数**: 20 - 50 (推荐 28-32)
- **架构**: CFG-distilled, rectified-flow

### 支持的分辨率
- 1024×1024 (正方形)
- 1280×1024 (横向)
- 1024×1280 (纵向)
- 1280×768 (宽屏)
- 768×1280 (高屏)

## 💳 积分系统

### 积分规则
- 新用户注册: **20 积分**
- 每次生图消耗: **10 积分**
- Pro Plan ($9.99): **+1000 积分**
- Max Plan ($29.99): **+5000 积分**

### 订阅计划
1. **Free** - $0
   - 20 积分
   - 基础生图功能
   - 个人使用

2. **Pro** - $9.99/月
   - 1,000 积分
   - 优先队列
   - 高分辨率
   - 商业许可

3. **Max** - $29.99/月
   - 5,000 积分
   - 最快速度
   - 最高分辨率
   - API 访问

## 🗄️ 数据库设计

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

## 📱 功能特色

### 用户体验
- **首屏生图** - 无需跳转页面，直接在首页生成
- **实时预览** - 参数调整实时反馈
- **响应式设计** - 完美适配各种设备
- **快速生成** - 基于优化的 FLUX.1 Krea 模型

### 技术亮点
- **参数验证** - 基于开源项目的严格参数检查
- **错误处理** - 完善的错误提示和恢复机制
- **性能优化** - 图片懒加载，组件优化
- **SEO 友好** - 服务端渲染，元数据优化

## 🔄 开发流程

### 本地开发
```bash
cd flux-krea-website
npm install
npm run dev
```

### 构建部署
```bash
npm run build
npm start
```

## 📈 后续优化

### 功能扩展
- [ ] 批量生图功能
- [ ] 图片编辑工具
- [ ] 社区评分系统
- [ ] API 接口开放
- [ ] 移动端 App

### 性能优化
- [ ] 图片 CDN 加速
- [ ] 缓存策略优化
- [ ] 数据库查询优化
- [ ] 服务端组件优化

## 📞 技术支持

项目基于开源 FLUX.1 Krea 模型构建，遵循 MIT 开源协议。
如有技术问题，请参考：
- [FLUX.1 Krea 开源项目](https://github.com/krea-ai/flux-krea)
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Replicate 文档](https://replicate.com/docs)