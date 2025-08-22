'use client'

import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@/lib/auth'

export default function UserStatus() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

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
        setIsLoading(false)
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
          } else if (error) {
            console.error('获取积分错误:', error)
          }
        } else {
          setUser(null)
          setCredits(0)
        }
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
    } catch (error) {
      console.error('登录错误:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setCredits(0)
    } catch (error) {
      console.error('登出错误:', error)
    }
  }

  return (
    <div className="hidden md:flex items-center space-x-4">
      {isLoading ? (
        <div className="w-24 h-10 bg-gray-100 animate-pulse"></div>
      ) : user ? (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="font-medium">{credits}</span>
          </div>
          <div className="relative group">
            <div className="flex items-center cursor-pointer">
              <img 
                src={`https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                alt="User Avatar" 
                className="w-8 h-8"
              />
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg shadow-xl py-2 z-10 hidden group-hover:block transform transition-all duration-300 origin-top-right">
              <div className="p-4 border-b border-gray-700">
                <p className="text-white font-medium truncate">{user.email}</p>
                <p className="text-gray-300 text-sm">Level: Free</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-left text-white hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button 
            onClick={handleSignIn}
            className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Sign In
          </button>
          <button 
            onClick={handleSignIn}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </>
      )}
    </div>
  )
}