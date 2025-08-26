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
    const cached = localStorage.getItem('app_user') // ✅ 使用 app_user 避免冲突
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as User
        setUser(parsed)
        setCredits(parsed.credits ?? 0)
        setLoading(false)
        console.log('Loaded cached user from app_user:', parsed)
      } catch (e) {
        console.warn('Failed to parse cached user from app_user')
      }
    }
  }, [])

  // 刷新用户信息（数据库）- 传入session参数避免重复调用getSession
  const refreshUser = async (sessionUser = null) => {
    console.log("=== REFRESH USER START ===", sessionUser ? 'with session' : 'without session')

    try {
      setLoading(true)

      let user = sessionUser
      
      // 只有在没有传入session时才调用getSession
      if (!user) {
        console.log('No session provided, calling getSession...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Session from getSession:', session?.user?.email)
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError)
          setUser(null)
          setLoading(false)
          return
        }

        if (!session?.user) {
          console.log('❌ No session user found')
          setUser(null)
          setLoading(false)
          return
        }
        
        user = session.user
      }

      const email = user?.email
      if (!email) {
        console.error("❌ No email found in sessionUser")
        setUser(null)
        setLoading(false)
        return
      }

      console.log("Using user for DB query:", email)

      // 拉取数据库用户信息
      const { data, error } = await supabase
        .from("users")
        .select("id, email, credits, avatar_url, google_id, created_at, updated_at")
        .eq("id", user.id)  // 使用id查询而不是email，更准确
        .single()

      console.log('DB query result:', { data, error })

      if (error) {
        console.error("❌ Error fetching user from DB:", error.message, error.code)
        
        if (error.code === 'PGRST116') { // 用户不存在
          console.warn("⚠️ No user row found, creating new user...")
          
          // 创建新用户
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              email: user.email,
              google_id: user.user_metadata?.sub || user.id,
              credits: 20, // 新用户获得20积分
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select("id, email, credits, avatar_url, google_id, created_at, updated_at")
            .single()

          if (insertError) {
            console.error("❌ Insert error:", insertError.message)
            setUser(null)
            setLoading(false)
            return
          }

          console.log("✅ New user created:", newUser)
          setUser(newUser as User)
          setCredits(newUser.credits)
          localStorage.setItem('app_user', JSON.stringify(newUser))
          setLoading(false)
          console.log('=== REFRESH USER SUCCESS (NEW USER) ===')
          return
        }

        // 其他数据库错误
        setUser(null)
        setLoading(false)
        return
      }

      if (!data) {
        console.warn("⚠️ No data returned from query")
        setUser(null)
        setLoading(false)
        return
      }

      // ✅ 成功获取用户数据，更新到 state
      console.log("✅ User data loaded:", data)
      setUser(data as User)
      setCredits(data.credits || 0)
      localStorage.setItem('app_user', JSON.stringify(data))
      setLoading(false)
      console.log('=== REFRESH USER SUCCESS ===')

    } catch (err) {
      console.error("❌ Unexpected error in refreshUser:", err)
      setUser(null)
      setLoading(false)
    }
  }

  const signIn = async () => {
    try {
      console.log('=== SIGN IN START ===')
      console.log('Current URL:', window.location.href)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { 
            access_type: 'offline', 
            prompt: 'consent',
            response_type: 'code'
          },
          skipBrowserRedirect: false
        }
      })
      
      console.log('OAuth response:', { data, error })
      
      if (error) {
        console.error('Google OAuth error:', error)
        alert('Login failed: ' + error.message)
      } else if (data?.url) {
        console.log('Redirecting to Google OAuth:', data.url)
        window.location.href = data.url
      } else {
        console.error('No redirect URL received from OAuth')
        alert('Login configuration error. Please try again.')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Login error: ' + (error as Error).message)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setCredits(0)
      localStorage.removeItem('app_user') // ✅ 清除 app_user 缓存
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // 监听认证状态变化
  useEffect(() => {
    console.log('=== USER PROVIDER MOUNTED ===')

    // 检查URL参数是否有认证成功标记
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const authSuccess = urlParams.get('auth')
      const authError = urlParams.get('error')
      
      if (authSuccess === 'success') {
        console.log('Auth success detected in URL, will refresh user data')
        // 清除URL参数
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('auth')
        window.history.replaceState({}, '', newUrl.toString())
      } else if (authError) {
        console.error('Auth error detected in URL:', authError, urlParams.get('message'))
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Session available, refreshing user data...')
          // 传入session.user避免重复调用getSession
          await refreshUser(session?.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing data...')
          setUser(null)
          setCredits(0)
          localStorage.removeItem('app_user')
          setLoading(false)
        } else if (event === 'INITIAL_SESSION') {
          console.log('Initial session event, checking session...')
          if (session?.user) {
            console.log('Initial session found, refreshing user...')
            await refreshUser(session.user)
          } else {
            console.log('No initial session, setting loading to false')
            setLoading(false)
          }
        }
      }
    )

    // 页面首次加载时检查session状态
    const checkInitialSession = async () => {
      console.log('Checking initial session...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Initial session from getSession:', session?.user?.email)
      
      if (session?.user) {
        console.log('Session found on initial load, refreshing user...')
        await refreshUser(session.user) // 传入session.user
      } else {
        console.log('No session on initial load, setting loading to false')
        setLoading(false)
      }
    }

    checkInitialSession()

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