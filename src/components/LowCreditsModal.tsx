'use client'

import { useState } from 'react'
import { CreditCard, Zap, Crown } from 'lucide-react'
import CustomSubscriptionButton from './CustomSubscriptionButton'

interface LowCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  credits: number
}

export default function LowCreditsModal({ isOpen, onClose, credits }: LowCreditsModalProps) {
  if (!isOpen) return null

  const subscriptionPlans = [
    {
      name: 'Pro',
      price: 9.9,
      credits: 1000,
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      color: 'border-blue-200 bg-blue-50',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      features: ['1000 积分/月', 'HD 图像质量', '优先生成', '邮件支持']
    },
    {
      name: 'Max',
      price: 29.9,
      credits: 5000,
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      color: 'border-purple-200 bg-purple-50',
      buttonColor: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      popular: true,
      features: ['5000 积分/月', '超高清图像', '最快生成速度', '优先邮件支持']
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">积分不足</h2>
            <p className="text-gray-600">
              您当前剩余 <span className="font-semibold text-orange-600">{credits}</span> 积分，
              需要至少 <span className="font-semibold">10积分</span> 才能生成图片
            </p>
          </div>

          {/* Subscription Plans */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 text-center">选择订阅计划，立即获得积分</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border-2 p-6 ${plan.color} ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        推荐选择
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <div className="flex justify-center mb-2">
                      {plan.icon}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/月</span>
                    </div>
                    <div className="mt-1 text-sm text-green-600 font-semibold">
                      {plan.credits} 积分/月
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <CustomSubscriptionButton
                    planName={plan.name}
                    price={plan.price}
                    credits={plan.credits}
                    onSuccess={() => {
                      onClose()
                    }}
                    onError={(error) => {
                      console.error('订阅失败:', error)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Options */}
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                暂时不需要
              </button>
              <a
                href="/pricing"
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                onClick={onClose}
              >
                查看完整定价
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}