'use client'

import { useUser } from '@/lib/user-context'
import { Calendar, Crown, Zap } from 'lucide-react'

export default function SubscriptionStatus() {
  const { user, credits } = useUser()

  if (!user) return null

  // 检查是否有有效订阅
  const hasActiveSubscription = user.subscription_status === 'active' && user.subscription_expires_at
  
  // 计算剩余天数
  const getDaysRemaining = () => {
    if (!user.subscription_expires_at) return 0
    const expiresAt = new Date(user.subscription_expires_at)
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  // 获取用户等级
  const getUserLevel = () => {
    if (credits >= 1000) return 'Max'
    if (credits >= 100) return 'Pro'
    return 'Free'
  }

  const daysRemaining = getDaysRemaining()
  const userLevel = getUserLevel()
  
  // 根据计划显示不同的图标和颜色
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Max':
        return <Crown className="w-4 h-4 text-purple-500" />
      case 'Pro':
        return <Zap className="w-4 h-4 text-blue-500" />
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Max':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'Pro':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">订阅状态</h3>
      
      {/* 当前等级 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {getPlanIcon(userLevel)}
          <span className="ml-2 font-medium text-gray-700">当前等级</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm font-medium border ${getPlanColor(userLevel)}`}>
          {userLevel}
        </span>
      </div>

      {/* 积分信息 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-700">可用积分</span>
        <span className="font-semibold text-gray-900">{credits}</span>
      </div>

      {/* 订阅信息 */}
      {hasActiveSubscription ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">订阅计划</span>
            <span className={`px-2 py-1 rounded-full text-sm font-medium border ${getPlanColor(user.subscription_plan || 'Free')}`}>
              {user.subscription_plan}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-700">有效期</span>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {daysRemaining > 0 ? `剩余 ${daysRemaining} 天` : '已过期'}
              </div>
              <div className="text-xs text-gray-500">
                到期日期：{new Date(user.subscription_expires_at).toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>
          
          {/* 过期警告 */}
          {daysRemaining <= 7 && daysRemaining > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-700">
                  订阅即将过期，请及时续费以继续享受服务
                </span>
              </div>
            </div>
          )}
          
          {/* 已过期 */}
          {daysRemaining === 0 && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm text-red-700">
                  订阅已过期，请续费以继续享受高级服务
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              当前使用免费版本
            </span>
          </div>
        </div>
      )}

      {/* 升级/续费按钮 */}
      {(!hasActiveSubscription || daysRemaining <= 7) && (
        <div className="mt-4">
          <a
            href="/pricing"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {hasActiveSubscription ? '续费订阅' : '升级到专业版'}
          </a>
        </div>
      )}
    </div>
  )
}