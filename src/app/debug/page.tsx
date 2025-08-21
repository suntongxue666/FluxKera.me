'use client'

import { useUser } from '@/lib/UserContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DebugPage() {
  const { user, credits, loading, refreshUser } = useUser()
  const [refreshCount, setRefreshCount] = useState(0)
  
  // 自动刷新用户信息
  useEffect(() => {
    const refreshData = async () => {
      await refreshUser()
      setRefreshCount(prev => prev + 1)
    }
    
    refreshData()
  }, [refreshUser])
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">用户登录调试页面</h1>
      
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          返回首页
        </Link>
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">登录状态</h2>
        {loading ? (
          <p>加载中...</p>
        ) : user ? (
          <div>
            <p className="text-green-600 font-medium">已登录</p>
            <button 
              onClick={refreshUser}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              刷新用户信息 (已刷新 {refreshCount} 次)
            </button>
          </div>
        ) : (
          <p className="text-red-600 font-medium">未登录</p>
        )}
      </div>
      
      {user && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">用户信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">基本信息</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 pr-4 text-gray-500">ID</td>
                    <td className="py-2">{user.id}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-500">邮箱</td>
                    <td className="py-2">{user.email}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-500">积分</td>
                    <td className="py-2">{credits}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-500">Google ID</td>
                    <td className="py-2">{user.google_id || '无'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-500">创建时间</td>
                    <td className="py-2">{new Date(user.created_at).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">头像信息</h3>
              <div className="flex items-start space-x-4">
                <div>
                  <p className="mb-2 text-gray-500">头像URL</p>
                  <div className="bg-gray-50 p-2 rounded text-sm break-all max-w-xs">
                    {user.avatar_url || '无头像URL'}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-gray-500">头像预览</p>
                  <div className="border border-gray-200 rounded-lg p-2 bg-white">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt="用户头像" 
                        className="w-16 h-16 rounded-full"
                        onError={(e) => {
                          console.log('头像加载失败');
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.email}&background=random`;
                        }}
                      />
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                        alt="默认头像" 
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2">完整用户对象 (JSON)</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-60">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">调试信息</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>如果您已登录但看不到用户信息，请点击"刷新用户信息"按钮</li>
          <li>如果头像URL存在但不显示，可能是因为URL无效或跨域问题</li>
          <li>如果Google ID存在但头像URL不存在，可能是因为数据库中缺少avatar_url字段</li>
          <li>请检查浏览器控制台是否有错误信息</li>
        </ul>
      </div>
    </div>
  )
}