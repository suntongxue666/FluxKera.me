'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type UserContextType = {
  user: any | null
  credits: number
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshCredits: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        // 获取当前用户会话
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // 获取用户积分
          const { data, error } = await supabase
            .from('users')
            .select('credits')
            .eq('id', session.user.id)
            .single()
          
          if (data) {
            setCredits(data.credits)
            console.log('用户积分:', data.credits)
          } else if (error) {
            console.error('获取积分错误:', error)
          }
        }
      } catch (error) {
        console.error('加载用户错误:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('认证状态变化:', event)
        if (session?.user) {
          setUser(session.user)
          
          // 获取用户积分
          const { data, error } = await supabase
            .from('users')
            .select('credits')
            .eq('id', session.user.id)
            .single()
          
          if (data) {
            setCredits(data.credits)
            console.log('用户积分已更新:', data.credits);
          } else if (error) {
            console.error('获取积分错误:', error);
            // 即使获取积分失败，也确保用户信息被设置
            setCredits(0);
          }
        } else {
          console.log('用户已注销');
          setUser(null);
          setCredits(0);
        }
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCredits(0)
  }

  const refreshCredits = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setCredits(data.credits)
      } else if (error) {
        console.error('获取积分错误:', error)
      }
    } catch (error) {
      console.error('刷新积分错误:', error)
    }
  }

  return (
    <UserContext.Provider value={{ user, credits, loading, signIn, signOut, refreshCredits }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}