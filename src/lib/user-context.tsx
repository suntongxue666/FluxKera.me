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
      
      // 获取会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session data:', session)
      console.log('Session error:', sessionError)
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        setUser(null)
        setCredits(0)
        setLoading(false)
        return
      }
      
      if (session && session.user) {
        console.log('Session found for user ID:', session.user.id)
        // 获取用户信息和积分
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        console.log('Database user data:', data)
        console.log('Database user error:', error)
        
        if (data && !error) {
          console.log('User data from database:', data)
          setUser(data as User)
          setCredits(data.credits)
        } else {
          console.error('Error fetching user data from database:', error)
          // 如果获取用户数据失败，尝试从auth.user获取基本信息
          const authUser = session.user
          if (authUser) {
            console.log('Auth user data:', authUser)
            // 尝试重新同步用户数据（在后台）
            await syncUserData(authUser)
            
            // 再次尝试获取用户数据
            const { data: retryData, error: retryError } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .single()
            
            console.log('Retry data:', retryData)
            console.log('Retry error:', retryError)
            
            if (retryData && !retryError) {
              console.log('User data from database (retry):', retryData)
              setUser(retryData as User)
              setCredits(retryData.credits)
            } else {
              console.error('Retry failed:', retryError)
              // 如果仍然失败，创建一个临时的用户对象，包含基本信息
              const tempUser: User = {
                id: authUser.id,
                email: authUser.email || '',
                google_id: authUser.user_metadata?.sub || '',
                avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
                credits: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              setUser(tempUser)
              setCredits(0)
            }
          }
        }
      } else {
        console.log('No session found - user is not logged in')
        setUser(null)
        setCredits(0)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      // 即使出现错误，也要确保状态被正确设置
      setUser(null)
      setCredits(0)
    } finally {
      console.log('=== REFRESH USER END ===')
      console.log('Final user state:', user)
      console.log('Final credits:', credits)
      setLoading(false)
    }
  }

  // 同步用户数据的函数
  const syncUserData = async (authUser: any) => {
    try {
      console.log('Syncing user data for:', authUser.id)
      // 调用API路由来同步用户数据
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: authUser.id,
          email: authUser.email,
          google_id: authUser.user_metadata?.sub,
          avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
        }),
      })
      
      if (response.ok) {
        const userData = await response.json()
        console.log('User data synced successfully:', userData)
        return userData
      } else {
        console.error('Failed to sync user data:', response.statusText)
        return null
      }
    } catch (error) {
      console.error('Error syncing user data:', error)
      return null
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
    
    // 页面加载时立即刷新用户信息
    refreshUser()
    
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
        }
      }
    )
    
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