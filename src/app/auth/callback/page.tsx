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
      
      try {
        // 首先尝试刷新session（兼容性更好的方法）
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError) {
          console.error('Error refreshing session:', refreshError)
          
          // 如果刷新失败，尝试使用signIn方法处理回调
          const { data: callbackData, error: callbackError } = await supabase.auth.signIn({ 
            refreshToken: true 
          })
          
          if (callbackError) {
            console.error('Error handling auth callback:', callbackError)
            router.push('/?error=auth_failed&message=' + encodeURIComponent(callbackError.message))
            return
          }
          
          if (callbackData?.session) {
            console.log('Session from signIn callback:', callbackData.session.user?.email)
            router.push('/?auth=success')
            return
          }
        }

        if (session) {
          console.log('Session from URL:', session.user?.email)
          router.push('/?auth=success')
          return
        }

        // 如果都没有session，检查是否有错误
        const error = searchParams.get('error')
        if (error) {
          console.error('Auth error from provider:', error)
          router.push('/?error=oauth_error&message=' + encodeURIComponent(error))
          return
        }

        console.log('No session found in URL, checking current session...')
        
        // 检查当前session状态
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (currentSession) {
          console.log('Current session found:', currentSession.user?.email)
          router.push('/?auth=success')
        } else {
          console.log('No session available')
          router.push('/?error=no_session&message=No authentication session found')
        }

      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/?error=unexpected_error&message=' + encodeURIComponent((error as Error).message))
      }
    }

    handleCallback()
  }, [router, searchParams, supabase.auth])

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