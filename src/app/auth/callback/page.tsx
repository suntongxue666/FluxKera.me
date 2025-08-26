'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('=== CLIENT AUTH CALLBACK START ===')
      
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        router.push('/?error=oauth_error&message=' + encodeURIComponent(error))
        return
      }

      if (!code) {
        console.error('No authorization code found')
        router.push('/?error=no_code&message=No authorization code received')
        return
      }

      console.log('Authorization code received, letting UserProvider handle auth state...')
      
      // 不再在这里处理exchangeCodeForSession，让Supabase自动处理
      // 直接重定向到首页，UserProvider会监听认证状态变化
      setTimeout(() => {
        console.log('Redirecting to home, UserProvider will handle auth state')
        router.replace('/')
      }, 1000) // 给Supabase一点时间处理
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900">Processing authentication...</h2>
        <p className="text-sm text-gray-600 mt-2">Please wait while we complete your login.</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900">Loading authentication...</h2>
          <p className="text-sm text-gray-600 mt-2">Please wait while we prepare your login.</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}