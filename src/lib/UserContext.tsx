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
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // 获取认证用户信息（包含元数据）
        const { data: authUser } = await supabase.auth.getUser()
        
        // 获取用户信息和积分
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (data && !error) {
          // 如果数据库中没有头像URL但auth用户有，直接使用auth用户的头像
          if (!data.avatar_url && authUser?.user?.user_metadata) {
            data.avatar_url = authUser.user.user_metadata.avatar_url || 
                             authUser.user.user_metadata.picture;
            
            // 异步更新数据库中的头像URL
            if (data.avatar_url) {
              supabase
                .from('users')
                .update({ avatar_url: data.avatar_url })
                .eq('id', session.user.id)
                .then(() => console.log('头像URL已更新到数据库'))
                .catch(err => console.error('更新头像URL失败:', err));
            }
          }
          
          console.log('用户数据:', data);
          console.log('头像URL:', data.avatar_url);
          
          setUser(data as User)
          setCredits(data.credits)
        } else {
          console.error('Error fetching user data:', error)
        }
      } else {
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
      
      // 直接使用完整的重定向URL，确保正确处理
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('完整重定向URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account', // 强制显示账号选择和授权页面
            // 明确请求用户资料、邮箱和头像
            scope: 'profile email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
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
      async (event) => {
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