'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from './auth'

// 定义上下文类型
interface UserContextType {
  user: User | null
  credits: number
  loading: boolean
  refreshUser: () => Promise<void>
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // 🚩 从 localStorage 预加载缓存的用户信息（加快页面初始渲染）
  useEffect(() => {
    const cached = localStorage.getItem('user')
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as User
        setUser(parsed)
        setCredits(parsed.credits ?? 0)
        setLoading(false)
        console.log('Loaded cached user:', parsed)
      } catch (e) {
        console.warn('Failed to parse cached user')
      }
    }
  }, [])

  // 刷新用户信息（数据库）
  const refreshUser = async () => {
    try {
      setLoading(true)
      console.log('=== REFRESH USER START ===')

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        setUser(null)
        setCredits(0)
        return
      }

      if (!session?.user) {
        console.log('No session found yet - waiting for SIGNED_IN event')
        return
      }

      // 拉取数据库用户信息
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data && !error) {
        console.log('Fetched user from DB:', data)
        setUser(data as User)
        setCredits(data.credits)
        localStorage.setItem('user', JSON.stringify(data)) // ✅ 更新缓存
        return
      }

      console.warn('User not found in DB, syncing...')
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          google_id: session.user.user_metadata?.sub,
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        }),
      })

      if (response.ok) {
        const { user: syncedUser } = await response.json()
        if (syncedUser) {
          console.log('User synced into DB:', syncedUser)
          setUser(syncedUser as User)
          setCredits(syncedUser.credits)
          localStorage.setItem('user', JSON.stringify(syncedUser)) // ✅ 更新缓存
        }
      }
    } catch (err) {
      console.error('Error refreshing user:', err)
      setUser(null)
      setCredits(0)
    } finally {
      setLoading(false)
      console.log('=== REFRESH USER END ===')
    }
  }

  const signIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      })
      if (error) {
        console.error('Google 登录错误:', error)
        alert('登录失败: ' + error.message)
      } else if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setCredits(0)
      localStorage.removeItem('user') // ✅ 清除缓存
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // 监听认证状态变化
  useEffect(() => {
    console.log('=== USER PROVIDER MOUNTED ===')

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setCredits(0)
          localStorage.removeItem('user')
        }
      }
    )

    // 页面首次加载时强制刷新一次
    refreshUser()

    return () => subscription.unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, credits, loading, refreshUser, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}