'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('Session user ID:', session.user.id)
        // 获取用户信息和积分
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (data && !error) {
          console.log('User data from database:', data)
          setUser(data as User)
          setCredits(data.credits)
        } else {
          console.error('Error fetching user data from database:', error)
          // 如果获取用户数据失败，尝试从auth.user获取基本信息
          const authUser = session.user
          if (authUser) {
            // 尝试创建用户记录
            const { data: userData, error: createError } = await supabase
              .from('users')
              .upsert({
                id: authUser.id,
                email: authUser.email || '',
                google_id: authUser.user_metadata?.sub || '',
                avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
                credits: 20, // 新用户默认20积分
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()
            
            if (userData && !createError) {
              console.log('User created/updated successfully:', userData)
              setUser(userData as User)
              setCredits(userData.credits)
            } else {
              console.error('Error creating user:', createError)
              // 最后的备选方案
              setUser({
                id: authUser.id,
                email: authUser.email || '',
                google_id: authUser.user_metadata?.sub || '',
                avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
                credits: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as User)
              setCredits(0)
            }
          }
        }
      } else {
        console.log('No session found')
        setUser(null)
        setCredits(0)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    } finally {
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
      await supabase.auth.signOut()
      setUser(null)
      setCredits(0)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // 初始化和监听认证状态变化
  useEffect(() => {
    refreshUser()
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user.id)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setCredits(0)
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