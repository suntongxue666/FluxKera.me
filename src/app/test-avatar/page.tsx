'use client'

import { useUser } from '@/lib/UserContext'
import { useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function TestAvatarPage() {
  const { user, refreshUser } = useUser()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    // 页面加载时刷新用户信息
    refreshUser()
    
    // 直接从auth获取用户信息，用于调试
    const getAuthUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        console.log('Auth用户:', data.user)
        console.log('Auth用户元数据:', data.user.user_metadata)
      }
    }
    
    getAuthUser()
  }, [refreshUser, supabase.auth])
  
  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">头像测试页面</h1>
      
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:underline">
          返回首页
        </Link>
      </div>
      
      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <img 
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random`}
                alt="用户头像"
                className="w-20 h-20 rounded-full border-2 border-blue-500"
                onError={(e) => {
                  console.log('头像加载失败，使用默认头像');
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random`;
                }}
              />
              {user.avatar_url ? (
                <span className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              ) : (
                <span className="absolute bottom-0 right-0 bg-yellow-500 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.email}</h2>
              <p className="text-gray-500">积分: {user.credits}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><strong>头像URL:</strong> {user.avatar_url || '未设置'}</p>
            <p><strong>Google ID:</strong> {user.google_id || '未设置'}</p>
            <p><strong>用户ID:</strong> {user.id}</p>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={refreshUser}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              刷新用户信息
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <p className="text-yellow-700">未登录或正在加载用户信息...</p>
          <p className="mt-2">请先<Link href="/" className="text-blue-600 hover:underline">登录</Link>后再访问此页面</p>
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-500">
        <p>如果头像显示正常，但在Header中不显示，可能是因为：</p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Header组件没有正确获取用户信息</li>
          <li>Header组件的CSS样式问题</li>
          <li>浏览器缓存问题（尝试强制刷新页面）</li>
        </ol>
      </div>
    </div>
  )
}