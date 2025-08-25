'use client'

import { useUser } from '@/lib/user-context'

export default function TestAvatarPage() {
  const { user, loading } = useUser()

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">头像测试页面</h1>
      
      {user ? (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">用户信息:</h2>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Google ID:</strong> {user.google_id}</p>
            <p><strong>积分:</strong> {user.credits}</p>
            <p><strong>头像URL:</strong> {user.avatar_url || '无'}</p>
          </div>
          
          <div className="bg-white border p-4 rounded-lg">
            <h2 className="font-semibold mb-4">头像显示测试:</h2>
            
            {user.avatar_url ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">原始头像 (96x96):</p>
                  <img 
                    src={user.avatar_url} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full border-2 border-gray-300"
                    onLoad={() => console.log('✅ Avatar loaded successfully')}
                    onError={(e) => {
                      console.error('❌ Avatar failed to load')
                      e.currentTarget.style.border = '2px solid red'
                    }}
                  />
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">小头像 (32x32):</p>
                  <img 
                    src={user.avatar_url} 
                    alt="Avatar Small" 
                    className="w-8 h-8 rounded-full border border-gray-300"
                  />
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">直接链接测试:</p>
                  <a 
                    href={user.avatar_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    在新窗口中打开头像
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">无头像，显示首字母:</p>
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">未登录</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回首页登录
          </button>
        </div>
      )}
    </div>
  )
}