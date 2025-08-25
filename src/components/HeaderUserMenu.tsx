'use client'

import React from 'react'
import { useUser } from '@/lib/user-context'

export default function HeaderUserMenu() {
  const { user, credits, loading, signIn, signOut } = useUser()
  
  // 调试信息
  console.log('HeaderUserMenu render:', { user: !!user, credits, loading })

  if (loading) {
    // ⏳ 加载中显示 skeleton 占位
    return (
      <div className="w-[96px] h-[40px] bg-gray-200 rounded-full animate-pulse" />
    )
  }

  if (!user) {
    // 🚪 未登录显示 Sign in 按钮
    return (
      <button
        onClick={signIn}
        className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
      >
        Sign in
      </button>
    )
  }

  // ✅ 已登录显示头像 + 积分 + Sign out 按钮
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.email}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              console.log('Avatar image failed to load:', user.avatar_url)
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs ${user.avatar_url ? 'hidden' : ''}`}>
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium">{credits} pts</span>
      </div>

      <button
        onClick={signOut}
        className="text-sm text-gray-600 hover:text-red-500"
      >
        Sign out
      </button>
    </div>
  )
}