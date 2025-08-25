'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    
    setError(errorParam || 'unknown_error')
    setMessage(messageParam || 'An unknown error occurred during authentication')
  }, [searchParams])

  const getErrorTitle = (errorType: string) => {
    switch (errorType) {
      case 'pkce_error':
        return 'Authentication Security Error'
      case 'auth_failed':
        return 'Authentication Failed'
      case 'oauth_error':
        return 'OAuth Provider Error'
      case 'user_fetch_failed':
        return 'User Information Error'
      case 'server_config':
        return 'Server Configuration Error'
      default:
        return 'Authentication Error'
    }
  }

  const getErrorDescription = (errorType: string) => {
    switch (errorType) {
      case 'pkce_error':
        return 'There was a security verification issue. This usually happens when the login process is interrupted or takes too long.'
      case 'auth_failed':
        return 'The authentication process failed. This could be due to a network issue or server problem.'
      case 'oauth_error':
        return 'There was an error with the Google OAuth service. Please try again.'
      case 'user_fetch_failed':
        return 'We were unable to retrieve your user information after authentication.'
      case 'server_config':
        return 'There is a server configuration issue. Please contact support.'
      default:
        return 'An unexpected error occurred during the authentication process.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getErrorTitle(error)}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorDescription(error)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Details</h3>
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-sm text-red-700">
              <strong>Error Code:</strong> {error}
            </p>
            <p className="text-sm text-red-700 mt-1">
              <strong>Message:</strong> {message}
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">What you can do:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Try logging in again</li>
              <li>• Clear your browser cookies and cache</li>
              <li>• Make sure you're using a supported browser</li>
              <li>• Check your internet connection</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Link
            href="/"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}