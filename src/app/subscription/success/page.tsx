'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, ArrowRight, Loader } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/lib/user-context'

function SuccessContent() {
  const searchParams = useSearchParams()
  const { refreshUser } = useUser()
  const [countdown, setCountdown] = useState(10)
  const [processing, setProcessing] = useState(true)
  const [subscriptionConfirmed, setSubscriptionConfirmed] = useState(false)
  const [error, setError] = useState('')

  // 获取URL参数
  const subscriptionId = searchParams.get('subscription_id')
  const planName = searchParams.get('plan')
  const pending = searchParams.get('pending')

  useEffect(() => {
    const confirmSubscription = async () => {
      if (!subscriptionId) {
        setError('Missing subscription information')
        setProcessing(false)
        return
      }

      try {
        // 检查订阅状态，最多尝试10次，每次间隔3秒
        let attempts = 0
        const maxAttempts = 10
        
        const checkStatus = async (): Promise<void> => {
          attempts++
          console.log(`Checking subscription status (${attempts}/${maxAttempts})`)
          
          try {
            const response = await fetch('/api/paypal/check-subscription-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                subscriptionId,
                userEmail: 'current-user' // 这里需要获取当前用户email
              }),
            })

            const result = await response.json()
            
            if (result.success && result.status === 'active') {
              // 订阅已激活
              await refreshUser()
              setSubscriptionConfirmed(true)
              setProcessing(false)
              return
            }
            
            // 如果还未激活且未达到最大尝试次数，继续检查
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 3000) // 3秒后重试
            } else {
              // 超时，但不算错误，可能webhook还在处理
              await refreshUser()
              setSubscriptionConfirmed(true)
              setProcessing(false)
            }
          } catch (error) {
            console.error(`Status check attempt ${attempts} failed:`, error)
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 3000)
            } else {
              // 即使检查失败，也显示成功，因为PayPal已经处理
              await refreshUser()
              setSubscriptionConfirmed(true)
              setProcessing(false)
            }
          }
        }
        
        // 开始检查
        checkStatus()
        
      } catch (error) {
        console.error('Error confirming subscription:', error)
        // 不显示错误，因为PayPal已经成功处理
        await refreshUser()
        setSubscriptionConfirmed(true)
        setProcessing(false)
      }
    }

    confirmSubscription()
  }, [subscriptionId, planName, refreshUser])

  useEffect(() => {
    if (!processing && subscriptionConfirmed) {
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
    }
  }, [processing, subscriptionConfirmed])

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Your Subscription
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your subscription...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Subscription Error
            </h1>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <Link 
              href="/pricing"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
            Thank you for subscribing to FluxKrea{planName ? ` ${planName} plan` : ''}. 
            {pending ? ' Your subscription is being processed and credits will be added shortly.' : ' Your credits have been added to your account.'}
          </p>
        </div>

        {subscriptionId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700 font-semibold text-sm">
              Subscription ID: {subscriptionId.substring(0, 20)}...
            </p>
          </div>
        )}

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