'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
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

// 创建上下文
const UserContext = createContext<UserContextType | undefined>(undefined)

// 上下文提供者组件
export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce'
      }
    }
  )
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      // 添加超时保护
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getSession timeout')), 5000)
      )

      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any

      if (sessionError) {
        console.error('Error getting session:', sessionError)
        setUser(null)
        setCredits(0)
        setLoading(false)
        return
      }

      if (!session?.user) {
        // 设置一个超时，如果10秒内没有session，就结束loading
        setTimeout(() => {
          if (loading) {
            setLoading(false)
          }
        }, 10000)
        return
      }

      // 尝试直接查询数据库（应该通过 RLS 策略）
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data && !error) {
        setUser(data as User)
        setCredits(data.credits)
        setLoading(false)
        return
      }

      // 如果数据库查询失败，使用 API 同步
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
          setUser(syncedUser as User)
          setCredits(syncedUser.credits)
          setLoading(false)
          return
        }
      }

      // fallback
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        google_id: session.user.user_metadata?.sub || '',
        avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
        credits: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setCredits(0)
      setLoading(false)

    } catch (err) {
      console.error('Error refreshing user:', err)
      setUser(null)
      setCredits(0)
      setLoading(false)
    }
  }

  // 登录方法
  const signIn = async () => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        try {
          console.log('Starting sign in process...')

          // 获取当前URL信息
          const redirectUrl = `${window.location.origin}/auth/callback`

          console.log('Redirect URL:', redirectUrl)

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              },
              skipBrowserRedirect: false
            }
          })

          if (error) {
            console.error('Google登录错误:', error)
            alert('登录失败: ' + error.message)
            reject(error)
          } else {
            // 如果有URL，直接跳转
            if (data?.url) {
              console.log('Redirecting to:', data.url)
              window.location.href = data.url
              resolve()
            } else {
              const noUrlError = new Error('No redirect URL received from OAuth')
              console.warn(noUrlError.message)
              reject(noUrlError)
            }
          }
        } catch (error) {
          console.error('Sign in error:', error)
          alert('登录过程中发生错误: ' + (error as Error).message)
          reject(error)
        }
      }, 0)
    })
  }

  // 登出方法
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setCredits(0)
      setLoading(false)  // 确保登出后结束loading状态

      // 清除本地存储
      localStorage.clear()
      sessionStorage.clear()

      // 刷新页面确保完全清除状态
      window.location.reload()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }



  // 初始化和监听认证状态变化
  useEffect(() => {
    let isInitialized = false

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') {
          isInitialized = true
          if (session?.user) {
            await refreshUser()
          } else {
            setLoading(false)
          }
        } else if (event === 'SIGNED_IN') {
          await refreshUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setCredits(0)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          // 只有在已经初始化后才刷新，避免重复调用
          if (isInitialized) {
            await refreshUser()
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, credits, loading, refreshUser, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

// 自定义钩子，用于访问上下文
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}