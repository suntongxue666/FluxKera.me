'use client'

import { useState } from 'react'
import { useUser } from '@/lib/user-context'
import { CreditCard, Loader, CheckCircle, XCircle } from 'lucide-react'

interface CustomSubscriptionButtonProps {
  planName: string
  price: number
  credits: number
  onSuccess?: (subscriptionId: string) => void
  onError?: (error: any) => void
}

export default function CustomSubscriptionButton({
  planName,
  price,
  credits,
  onSuccess,
  onError
}: CustomSubscriptionButtonProps) {
  const { user, refreshUser } = useUser()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<'creating' | 'waiting' | 'checking' | 'success' | 'error'>('creating')
  const [subscriptionId, setSubscriptionId] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubscribe = async () => {
    if (!user) {
      // 跳转到登录页面
      window.location.href = '/auth/callback?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    setIsProcessing(true)
    setProcessingStatus('creating')
    setErrorMessage('')

    try {
      // 1. 创建订阅
      setProcessingStatus('creating')
      
      console.log('🔥 创建订阅请求参数:', {
        planName,
        price,
        credits,
        userId: user.id,
        userEmail: user.email
      })
      
      const createResponse = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          price,
          credits,
          userId: user.id,
          userEmail: user.email
        }),
      })

      const createResult = await createResponse.json()
      
      if (!createResult.success || !createResult.subscriptionId) {
        throw new Error(createResult.error || 'Failed to create subscription')
      }

      const subId = createResult.subscriptionId
      setSubscriptionId(subId)

      // 2. 跳转到PayPal支付页面
      if (createResult.approvalUrl) {
        setProcessingStatus('waiting')
        window.location.href = createResult.approvalUrl
        return
      }

      // 3. 如果没有跳转URL，开始轮询检查状态
      setProcessingStatus('checking')
      await pollSubscriptionStatus(subId)

    } catch (error) {
      console.error('Subscription error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
      setProcessingStatus('error')
      onError?.(error)
    }
  }

  const pollSubscriptionStatus = async (subId: string) => {
    const maxAttempts = 30 // 最多轮询30次 (5分钟)
    let attempts = 0

    const poll = async (): Promise<void> => {
      try {
        attempts++
        console.log(`Polling subscription status (${attempts}/${maxAttempts})`)

        const response = await fetch('/api/paypal/check-subscription-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionId: subId,
            userEmail: user.email
          }),
        })

        const result = await response.json()

        if (result.success && result.status === 'active') {
          // 订阅激活成功
          setProcessingStatus('success')
          await refreshUser()
          onSuccess?.(subId)
          
          // 3秒后跳转到成功页面
          setTimeout(() => {
            window.location.href = `/subscription/success?subscription_id=${subId}&plan=${planName}`
          }, 3000)
          return
        }

        if (result.status === 'cancelled' || result.status === 'failed') {
          throw new Error('Subscription was cancelled or failed')
        }

        // 如果还在处理中，继续轮询
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000) // 每10秒轮询一次
        } else {
          throw new Error('Subscription verification timeout')
        }

      } catch (error) {
        console.error('Polling error:', error)
        setErrorMessage(error instanceof Error ? error.message : 'Verification failed')
        setProcessingStatus('error')
        onError?.(error)
      }
    }

    // 开始轮询
    setTimeout(poll, 5000) // 5秒后开始第一次检查
  }

  const getStatusMessage = () => {
    switch (processingStatus) {
      case 'creating':
        return 'Creating subscription...'
      case 'waiting':
        return 'Redirecting to PayPal...'
      case 'checking':
        return 'Verifying payment...'
      case 'success':
        return 'Subscription activated!'
      case 'error':
        return errorMessage || 'Something went wrong'
      default:
        return ''
    }
  }

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'creating':
      case 'waiting':
      case 'checking':
        return <Loader className="w-5 h-5 animate-spin" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <CreditCard className="w-5 h-5" />
    }
  }

  if (isProcessing) {
    return (
      <div className="w-full">
        <div className={`w-full py-3 px-4 rounded-lg text-center border-2 ${
          processingStatus === 'success' ? 'bg-green-50 border-green-200' :
          processingStatus === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-center mb-2">
            {getStatusIcon()}
            <span className={`ml-2 font-semibold ${
              processingStatus === 'success' ? 'text-green-700' :
              processingStatus === 'error' ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {getStatusMessage()}
            </span>
          </div>
          
          {processingStatus === 'checking' && (
            <p className="text-xs text-gray-600">
              This may take a few minutes. Please don't close this page.
            </p>
          )}
          
          {processingStatus === 'success' && (
            <p className="text-xs text-green-600">
              Redirecting to success page...
            </p>
          )}
          
          {processingStatus === 'error' && (
            <button
              onClick={() => {
                setIsProcessing(false)
                setProcessingStatus('creating')
                setErrorMessage('')
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleSubscribe}
      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center ${
        planName === 'Pro' 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
      }`}
    >
      <CreditCard className="w-5 h-5 mr-2" />
      Choose {planName}
    </button>
  )
}