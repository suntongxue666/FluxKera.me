/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在生产构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生产构建时忽略TypeScript错误
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  },
  // 其他配置...
}

module.exports = nextConfig