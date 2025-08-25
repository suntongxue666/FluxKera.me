'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { useUser } from '@/lib/user-context'

function ReturnContent() {
  const searchParams = useSearchParams()
  const { user, refreshUser } = useUser()
  const [status, setStatus] = useState<'checking' | 'success' | 'pending' | 'error'>('checking')
  const [message, setMessage] = useState('Processing your subscription...')

  // 获取PayPal返回的参数
  const subscriptionId = searchParams.get('subscription_id')
  const baToken = searchParams.get('ba_token')
  const token = searchParams.get('token')

  useEffect(() => {
    const processReturn = async () => {
      if (!subscriptionId) {
        setStatus('error')
        setMessage('Missing subscription information')
        return
      }

      if (!user) {
        setMessage('Please wait while we load your account...')
        return
      }

      try {
        console.log('Processing PayPal return:', { subscriptionId, baToken, token })

        // 等待一段时间让PayPal的webhook处理完成
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 检查订阅状态
        let attempts = 0
        const maxAttempts = 15 // 最多检查15次，每次3秒，总共45秒

        const checkSubscriptionStatus = async (): Promise<void> => {
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
                userEmail: user.email
              }),
            })

            const result = await response.json()
            console.log('Subscription status check result:', result)

            if (result.success && result.status === 'active') {
              // 订阅已激活
              setStatus('success')
              setMessage('Subscription activated successfully!')
              await refreshUser()
              
              // 3秒后跳转到成功页面
              setTimeout(() => {
                window.location.href = `/subscription/success?subscription_id=${subscriptionId}&plan=${result.planName || 'Pro'}`
              }, 3000)
              return
            }

            if (result.status === 'cancelled' || result.status === 'failed') {
              setStatus('error')
              setMessage('Subscription was cancelled or failed')
              return
            }

            // 继续检查
            if (attempts < maxAttempts) {
              setMessage(`Verifying subscription... (${attempts}/${maxAttempts})`)
              setTimeout(checkSubscriptionStatus, 3000)
            } else {
              // 超时，但可能webhook还在处理
              setStatus('pending')
              setMessage('Subscription is being processed. You will receive credits shortly.')
              
              // 跳转到成功页面，标记为pending
              setTimeout(() => {
                window.location.href = `/subscription/success?subscription_id=${subscriptionId}&pending=true`
              }, 5000)
            }

          } catch (error) {
            console.error(`Status check error (${attempts}):`, error)
            
            if (attempts < maxAttempts) {
              setTimeout(checkSubscriptionStatus, 3000)
            } else {
              setStatus('pending')
              setMessage('Subscription is being processed. You will receive credits shortly.')
              setTimeout(() => {
                window.location.href = `/subscription/success?subscription_id=${subscriptionId}&pending=true`
              }, 3000)
            }
          }
        }

        // 开始检查
        await checkSubscriptionStatus()

      } catch (error) {
        console.error('Error processing return:', error)
        setStatus('error')
        setMessage('An error occurred while processing your subscription')
      }
    }

    if (user) {
      processReturn()
    }
  }, [subscriptionId, baToken, token, user, refreshUser])

  const getIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader className="w-12 h-12 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />
      case 'pending':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (status) {
      case 'checking':
        return 'from-blue-50 to-indigo-50'
      case 'success':
        return 'from-green-50 to-blue-50'
      case 'pending':
        return 'from-yellow-50 to-orange-50'
      case 'error':
        return 'from-red-50 to-pink-50'
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundColor()} flex items-center justify-center py-12 px-4`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'checking' && 'Processing Subscription'}
            {status === 'success' && 'Subscription Successful!'}
            {status === 'pending' && 'Subscription Pending'}
            {status === 'error' && 'Subscription Error'}
          </h1>
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {subscriptionId && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 font-semibold text-sm">
              Subscription ID: {subscriptionId}
            </p>
          </div>
        )}

        {status === 'checking' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm">
              Please don't close this page. We're verifying your payment with PayPal.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/pricing'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SubscriptionReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ReturnContent />
    </Suspense>
  )
}