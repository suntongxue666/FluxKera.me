'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = '/'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Subscription Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for subscribing to FluxKrea. Your credits have been added to your account.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700 font-semibold">
            🎉 Your subscription is now active!
          </p>
          <p className="text-green-600 text-sm mt-1">
            You can start creating amazing AI images right away.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Link 
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Creating <ArrowRight className="inline w-4 h-4 ml-1" />
          </Link>
          <Link 
            href="/dashboard"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            View Dashboard
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          Redirecting to home page in {countdown} seconds...
        </p>
      </div>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}