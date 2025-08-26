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

  // 刷新用户信息（数据库）
  const refreshUser = async () => {
    try {
      setLoading(true)
      console.log('=== REFRESH USER START ===')

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session from getSession:', session) // ✅ 增强调试
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        setLoading(false)
        return // 🚩 不要清空user，保持当前状态
      }

      if (!session?.user) {
        console.log('No session yet - wait for SIGNED_IN event')
        setLoading(false)
        return // 🚩 不要清空user，但要设置loading=false
      }

      // 拉取数据库用户信息
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      console.log('DB query result:', { data, error }) // 🔍 增强调试

      if (data && !error) {
        console.log('Fetched user from DB:', data)
        setUser(data as User)
        setCredits(data.credits)
        localStorage.setItem('app_user', JSON.stringify(data)) // ✅ 使用 app_user 更新缓存
        setLoading(false)
        console.log('=== REFRESH USER SUCCESS ===')
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
      console.log('Starting Google OAuth login...')
      
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGED ===', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Session available, refreshing user data...')
          await refreshUser()
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing data...')
          setUser(null)
          setCredits(0)
          localStorage.removeItem('app_user')
        } else if (event === 'INITIAL_SESSION') {
          console.log('Initial session event, checking session...')
          // 等待一下让session稳定
          setTimeout(async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession()
            if (currentSession?.user) {
              console.log('Initial session found, refreshing user...')
              await refreshUser()
            } else {
              console.log('No initial session, keeping loading state')
              setLoading(false)
            }
          }, 1000)
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
        await refreshUser()
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