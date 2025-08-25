'use client'

import React, { useState } from 'react'
import { useUser } from '@/lib/user-context'
import { Coins, ChevronDown } from 'lucide-react'

export default function HeaderUserMenu() {
  const { user, credits, loading, signIn, signOut } = useUser()
  const [showDropdown, setShowDropdown] = useState(false)
  
  // 调试信息
  console.log('HeaderUserMenu render:', { 
    user: !!user, 
    credits, 
    loading,
    avatar_url: user?.avatar_url,
    email: user?.email 
  })

  // 获取用户等级
  const getUserLevel = (credits: number) => {
    if (credits >= 1000) return 'Max'
    if (credits >= 100) return 'Pro'
    return 'Free'
  }

  if (loading) {
    // ⏳ 加载中显示 skeleton 占位
    return (
      <div className="w-[120px] h-[40px] bg-gray-200 rounded-lg animate-pulse" />
    )
  }

  if (!user) {
    // 🚪 未登录显示 Google Sign in 按钮样式
    return (
      <button
        onClick={signIn}
        className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        Sign in
      </button>
    )
  }

  // ✅ 已登录显示积分 + 头像（带下拉菜单）
  return (
    <div className="flex items-center gap-3">
      {/* 积分显示 */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <Coins className="w-4 h-4 text-yellow-600" />
        <span className="text-sm font-semibold text-yellow-700">{credits}</span>
      </div>

      {/* 头像和下拉菜单 */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          onMouseEnter={() => setShowDropdown(true)}
          className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.email}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onLoad={() => {
                console.log('Avatar loaded successfully:', user.avatar_url)
              }}
              onError={(e) => {
                console.error('Avatar image failed to load:', user.avatar_url)
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) {
                  fallback.classList.remove('hidden')
                }
              }}
            />
          ) : null}
          <div className={`w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-200 ${user.avatar_url ? 'hidden' : ''}`}>
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {/* 下拉菜单 */}
        {showDropdown && (
          <div 
            className="absolute right-0 top-full mt-2 w-64 bg-black bg-opacity-90 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 z-50"
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div className="p-4">
              {/* 用户信息 */}
              <div className="flex items-center gap-3 mb-4">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.email}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold border-2 border-gray-600">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-white font-medium text-sm truncate max-w-[150px]">
                    {user.email}
                  </div>
                  <div className="text-gray-300 text-xs">
                    Level: <span className={`font-semibold ${
                      getUserLevel(credits) === 'Max' ? 'text-purple-400' :
                      getUserLevel(credits) === 'Pro' ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {getUserLevel(credits)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 分割线 */}
              <div className="border-t border-gray-600 mb-4"></div>

              {/* 积分信息 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">Credits</span>
                </div>
                <span className="text-yellow-400 font-semibold">{credits}</span>
              </div>

              {/* Valid信息 */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-sm">Valid</span>
                <span className="text-green-400 text-sm">∞</span>
              </div>

              {/* 分割线 */}
              <div className="border-t border-gray-600 mb-4"></div>

              {/* Sign out 按钮 */}
              <button
                onClick={() => {
                  setShowDropdown(false)
                  signOut()
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}