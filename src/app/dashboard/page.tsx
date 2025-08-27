'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/user-context'
import { Coins, Image, Clock, ChevronRight, CreditCard, Download } from 'lucide-react'
import SubscriptionStatus from '@/components/SubscriptionStatus'

export default function DashboardPage() {
  const { user, credits, loading } = useUser()
  const [generations, setGenerations] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // 如果用户未登录，重定向到首页
      router.push('/')
      return
    }

    if (user) {
      // 加载用户的生成历史
      fetch('/api/generations')
        .then(response => response.json())
        .then(data => {
          if (data.generations) {
            setGenerations(data.generations)
          }
        })
        .catch(error => console.error('Error loading generations:', error))
      
      // 加载用户的积分交易历史
      fetch('/api/credits')
        .then(response => response.json())
        .then(data => {
          if (data.transactions) {
            setTransactions(data.transactions)
          }
        })
        .catch(error => console.error('Error loading transactions:', error))
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            用户仪表盘
          </h1>
          <p className="text-xl text-gray-600">
            管理您的账户、积分和生成历史
          </p>
        </div>

        {/* 用户信息卡片 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {user?.email.split('@')[0]}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center">
                <Coins className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">{credits}</div>
                  <div className="text-xs text-blue-600">可用积分</div>
                </div>
              </div>
              <Link 
                href="/pricing" 
                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                购买积分
              </Link>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">生成图片</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {generations.length}
            </div>
            <p className="text-gray-600 text-sm">
              总共生成的图片数量
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Coins className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">已消费积分</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {generations.length * 10}
            </div>
            <p className="text-gray-600 text-sm">
              用于生成图片的积分
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">账户创建于</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {new Date(user?.created_at || '').toLocaleDateString()}
            </div>
            <p className="text-gray-600 text-sm">
              您的账户注册日期
            </p>
          </div>
        </div>

        {/* 订阅状态组件 */}
        <div className="mb-8">
          <SubscriptionStatus />
        </div>

        {/* 生成历史 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              最近生成
            </h3>
            <Link 
              href="/gallery" 
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
            >
              查看全部 <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {generations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.slice(0, 6).map((gen) => (
                <div key={gen.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative group">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      加载中...
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <Download className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {gen.prompt}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                      <span>{gen.credits_used} 积分</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>您还没有生成任何图片</p>
              <Link 
                href="/generate" 
                className="mt-4 inline-block text-blue-600 hover:text-blue-800"
              >
                开始创建
              </Link>
            </div>
          )}
        </div>

        {/* 积分交易历史 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              积分交易历史
            </h3>
          </div>
          
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 font-medium text-gray-900">日期</th>
                    <th className="pb-3 font-medium text-gray-900">描述</th>
                    <th className="pb-3 font-medium text-gray-900 text-right">金额</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100">
                      <td className="py-3 text-gray-600">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-gray-600">
                        {tx.description}
                      </td>
                      <td className={`py-3 text-right font-medium ${
                        tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>暂无积分交易记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}