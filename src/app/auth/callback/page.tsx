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

      console.log('Authorization code received, processing...')
      
      try {
        // 对于新版本的Supabase，需要传入完整的URL
        console.log('Attempting to exchange code for session...')
        console.log('Current URL:', window.location.href)
        
        // 添加超时机制
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Exchange timeout')), 10000)
        )
        
        const exchangePromise = supabase.auth.exchangeCodeForSession(window.location.href)
        
        const { data, error: sessionError } = await Promise.race([exchangePromise, timeoutPromise])
        console.log('Exchange result:', { data: data?.session?.user?.email, error: sessionError })
        
        if (sessionError) {
          console.error('Error exchanging code for session:', sessionError)
          router.push(`/?error=auth_failed&message=${encodeURIComponent(sessionError.message)}`)
          return
        }

        if (data.session) {
          console.log('Session created successfully for user:', data.session.user.email)
          console.log('About to redirect to /?auth=success')
          // 清除URL参数并重定向到首页
          router.replace('/?auth=success')
        } else {
          console.error('No session created')
          router.push('/?error=no_session')
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err)
        console.error('Error details:', err)
        
        if (err.message === 'Exchange timeout') {
          router.push('/?error=timeout&message=Authentication timeout')
        } else {
          router.push('/?error=unexpected_error')
        }
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