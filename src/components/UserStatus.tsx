'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { useUser } from '@/lib/user-context'
import type { User } from '@/lib/auth'

export default function UserStatus() {
  const { user, credits, loading: isLoading, signIn, signOut } = useUser()

  // UI 必须改成三态
  if (isLoading) {
    // loading状态：显示骨架屏
    return (
      <div className="w-[96px] h-[40px] bg-gray-200 rounded-lg animate-pulse" />
    )
  }

  if (!user) {
    // 未登录状态：显示登录按钮
    return (
      <button
        onClick={signIn}
        className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        Sign in
      </button>
    )
  }

  // 已登录状态：显示用户信息
  return (
    <div className="flex items-center gap-3">
      <img 
        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || '')}&background=random`} 
        alt="User Avatar" 
        className="w-8 h-8 rounded-full object-cover"
        onError={(e) => {
          console.log('Avatar image failed to load, using fallback')
          const target = e.target as HTMLImageElement
          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || '')}&background=random`
        }}
      />
      <span className="font-medium">{credits} 积分</span>
      <button 
        onClick={signOut}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        退出
      </button>
    </div>
  )
}