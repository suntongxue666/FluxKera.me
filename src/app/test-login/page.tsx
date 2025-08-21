'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/UserContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function TestLoginPage() {
  const { user, loading, signIn, signOut, refreshUser } = useUser()
  const [authUser, setAuthUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loginStep, setLoginStep] = useState<string>('初始状态')
  const supabase = createClientComponentClient()
  
  // 获取认证用户信息
  const getAuthUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error('获取认证用户失败:', error)
        setError(`获取认证用户失败: ${error.message}`)
        return null
      }
      
      setAuthUser(data.user)
      return data.user
    } catch (err) {
      console.error('获取认证用户异常:', err)
      setError(`获取认证用户异常: ${err}`)
      return null
    }
  }
  
  // 测试登录流程
  const testLogin = async () => {
    try {
      setLoginStep('开始登录流程')
      setError(null)
      
      // 1. 检查当前会话
      const { data: sessionData } = await supabase.auth.getSession()
      setLoginStep('1. 检查会话: ' + (sessionData.session ? '已有会话' : '无会话'))
      
      // 2. 如果已有会话，先登出
      if (sessionData.session) {
        setLoginStep('2. 发现已有会话，先登出')
        await supabase.auth.signOut()
        setLoginStep('3. 登出完成')
      }
      
      // 3. 开始Google登录
      setLoginStep('4. 开始Google登录')
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('重定向URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account consent',
            scope: 'profile email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
          }
        }
      })
      
      if (error) {
        console.error('Google登录错误:', error)
        setError(`Google登录错误: ${error.message}`)
        setLoginStep('5. 登录失败')
        return
      }
      
      setLoginStep('5. 登录请求成功，等待重定向...')
      console.log('登录数据:', data)
      
      // 4. 如果有URL，直接跳转
      if (data?.url) {
        console.log('正在跳转到:', data.url)
        window.location.href = data.url
      } else {
        setLoginStep('6. 未获取到重定向URL')
        setError('未获取到重定向URL')
      }
    } catch (err) {
      console.error('登录过程异常:', err)
      setError(`登录过程异常: ${err}`)
      setLoginStep('登录过程异常')
    }
  }
  
  // 页面加载时获取用户信息
  useEffect(() => {
    getAuthUser()
  }, [])
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Google登录测试页面</h1>
      
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          返回首页
        </Link>
      </div>
      
      {/* 登录状态 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">登录状态</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">UserContext状态</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {loading ? (
                <p>加载中...</p>
              ) : user ? (
                <div>
                  <p className="text-green-600 font-medium">已登录</p>
                  <p className="text-sm text-gray-500 mt-1">邮箱: {user.email}</p>
                  <p className="text-sm text-gray-500">积分: {user.credits}</p>
                  <p className="text-sm text-gray-500">头像URL: {user.avatar_url || '无'}</p>
                </div>
              ) : (
                <p className="text-red-600 font-medium">未登录</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Auth状态</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {authUser ? (
                <div>
                  <p className="text-green-600 font-medium">已认证</p>
                  <p className="text-sm text-gray-500 mt-1">邮箱: {authUser.email}</p>
                  <p className="text-sm text-gray-500">ID: {authUser.id}</p>
                </div>
              ) : (
                <p className="text-red-600 font-medium">未认证</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 登录测试 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">登录测试</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">当前步骤</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700">{loginStep}</p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="flex space-x-4">
            <button 
              onClick={testLogin}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              测试Google登录
            </button>
            
            <button 
              onClick={refreshUser}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              刷新用户信息
            </button>
            
            {user && (
              <button 
                onClick={signOut}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                登出
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 调试信息 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">调试信息</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">UserContext用户</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-60">
              {user ? JSON.stringify(user, null, 2) : '无用户数据'}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Auth用户</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-60">
              {authUser ? JSON.stringify(authUser, null, 2) : '无认证数据'}
            </pre>
          </div>
        </div>
      </div>
      
      {/* 环境信息 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">环境信息</h2>
        
        <div className="space-y-2">
          <p><strong>当前URL:</strong> {typeof window !== 'undefined' ? window.location.href : '未知'}</p>
          <p><strong>重定向URL:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '未知'}</p>
          <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '未设置'}</p>
          <p><strong>Supabase Anon Key存在:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '是' : '否'}</p>
        </div>
      </div>
    </div>
  )
}