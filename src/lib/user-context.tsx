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
    try {
      setLoading(true)
      console.log('=== REFRESH USER START ===', sessionUser ? 'with session' : 'without session')

      let user = sessionUser
      
      // 只有在没有传入session时才调用getSession
      if (!user) {
        console.log('No session provided, calling getSession...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Session from getSession:', session?.user?.email)
        
        if (sessionError) {
          console.error('Error getting session:', sessionError)
          setLoading(false)
          return
        }

        if (!session?.user) {
          console.log('No session user found')
          setLoading(false)
          return
        }
        
        user = session.user
      }

      console.log('Using user for DB query:', user.email)

      // 拉取数据库用户信息
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('DB query result:', { data, error })

      if (data && !error) {
        console.log('Fetched user from DB:', data)
        setUser(data as User)
        setCredits(data.credits)
        localStorage.setItem('app_user', JSON.stringify(data))
        setLoading(false)
        console.log('=== REFRESH USER SUCCESS ===')
        return
      }

      if (error) {
        console.error('DB query error:', error.message, error.code)
      }

      console.warn('User not found in DB, syncing...')
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          google_id: user.user_metadata?.sub,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        }),
      })

      console.log('Sync user API response status:', response.status) // 🔍 增强调试

      if (response.ok) {
        const { user: syncedUser } = await response.json()
        console.log('Sync user API response:', syncedUser) // 🔍 增强调试
        if (syncedUser) {
          console.log('User synced into DB:', syncedUser)
          setUser(syncedUser as User)
          setCredits(syncedUser.credits)
          localStorage.setItem('app_user', JSON.stringify(syncedUser)) // ✅ 使用 app_user 更新缓存
          setLoading(false)
          console.log('=== REFRESH USER SUCCESS (SYNCED) ===')
          return
        }
      } else {
        const errorText = await response.text()
        console.error('Sync user API failed:', response.status, errorText)
      }
    } catch (err) {
      console.error('Error refreshing user:', err)
      // 🚩 不要清空user，保持当前状态，但要设置loading=false
      setLoading(false)
    } finally {
      // 确保loading状态被正确设置
      console.log('=== REFRESH USER END ===')
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