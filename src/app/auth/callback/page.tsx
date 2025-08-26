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
        // 使用getSessionFromUrl自动解析URL并保存session
        const { data, error: sessionError } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        
        if (sessionError) {
          console.error('Error getting session from URL:', sessionError)
          router.push(`/?error=auth_failed&message=${encodeURIComponent(sessionError.message)}`)
          return
        }

        if (data.session) {
          console.log('Session stored successfully for user:', data.session.user.email)
          router.push('/?auth=success')
        } else {
          console.error('No session found in URL')
          router.push('/?error=no_session')
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err)
        router.push('/?error=unexpected_error')
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