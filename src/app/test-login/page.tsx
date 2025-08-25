'use client'

import { useUser } from '@/lib/user-context'
import { useEffect } from 'react'

export default function TestLoginPage() {
  const { user, credits, loading, signIn, signOut } = useUser()

  useEffect(() => {
    console.log('User state:', { user, credits, loading })
  }, [user, credits, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">用户登录测试</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">用户状态</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
            <p><strong>Credits:</strong> {credits}</p>
            {user && (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Avatar:</strong> {user.avatar_url || 'None'}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">操作</h2>
          <div className="space-y-4">
            {!user ? (
              <button
                onClick={signIn}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
              >
                登录
              </button>
            ) : (
              <button
                onClick={signOut}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700"
              >
                登出
              </button>
            )}
            
            <a
              href="/pricing"
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 text-center"
            >
              测试Pricing页面
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}