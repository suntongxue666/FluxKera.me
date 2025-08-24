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

// 创建上下文
const UserContext = createContext<UserContextType | undefined>(undefined)

// 上下文提供者组件
export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // 刷新用户信息
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

      // 🚩 关键修改：如果 session 还没有恢复，就不清空 user，保持 loading=true
      if (!session?.user) {
        console.log('No session found yet - keep loading, wait for SIGNED_IN event')
        return  // ⚠️ 不要走到 finally
      }

      console.log('Session found for user ID:', session.user.id)

      // 从 users 表查
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data && !error) {
        console.log('User data from database:', data)
        setUser(data as User)
        setCredits(data.credits)
        return
      }

      // ⚠️ 数据库里没有用户 → 强制写入
      console.warn('User not found in users table, syncing...')
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
          return
        }
      } else {
        console.error('Failed to sync user data:', await response.text())
      }

      // 兜底逻辑：至少有个临时用户对象，避免 UI 崩溃
      const authUser = session.user
      const tempUser: User = {
        id: authUser.id,
        email: authUser.email || '',
        google_id: authUser.user_metadata?.sub || '',
        avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
        credits: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setUser(tempUser)
      setCredits(0)
    } catch (err) {
      console.error('Error refreshing user:', err)
      setUser(null)
      setCredits(0)
    } finally {
      // 🚩 关键修复：确保在所有情况下都设置loading=false
      console.log('=== REFRESH USER END ===')
      setLoading(false)
    }
  }

  // 登录方法
  const signIn = async () => {
    try {
      console.log('开始Google登录流程...')
      console.log('当前URL:', window.location.href)
      console.log('重定向URL:', `${window.location.origin}/auth/callback`)
      
      // 检查Supabase配置
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Supabase Anon Key是否存在:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) {
        console.error('Google登录错误:', error)
        alert('登录失败: ' + error.message)
      } else {
        console.log('Google登录成功，重定向中...', data)
        // 如果有URL，直接跳转
        if (data?.url) {
          console.log('正在跳转到:', data.url)
          window.location.href = data.url
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('登录过程中发生错误，请查看控制台')
    }
  }

  // 登出方法
  const signOut = async () => {
    try {
      console.log('Signing out...')
      await supabase.auth.signOut()
      setUser(null)
      setCredits(0)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // 初始化和监听认证状态变化
  useEffect(() => {
    console.log('=== USER PROVIDER MOUNTED ===')
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===')
        console.log('Event:', event)
        console.log('Session:', session)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed')
          // 立即刷新用户信息
          await refreshUser()
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setUser(null)
          setCredits(0)
          setLoading(false)
        }
      }
    )
    
    // 页面加载时立即刷新用户信息
    refreshUser()
    
    return () => {
      console.log('=== USER PROVIDER UNMOUNTING ===')
      subscription.unsubscribe()
    }
  }, [])

  // 添加一个useEffect来调试状态变化
  useEffect(() => {
    console.log('=== USER STATE CHANGED ===')
    console.log('User:', user)
    console.log('Credits:', credits)
    console.log('Loading:', loading)
  }, [user, credits, loading])

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