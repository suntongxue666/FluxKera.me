'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@/lib/user-context'

interface PayPalSubscriptionButtonProps {
  planName: string
  planId: string
  price: number
  credits: number
  onSuccess?: (subscriptionId: string) => void
  onError?: (error: any) => void
}

declare global {
  interface Window {
    paypal?: any
  }
}

export default function PayPalSubscriptionButton({
  planName,
  planId,
  price,
  credits,
  onSuccess,
  onError
}: PayPalSubscriptionButtonProps) {
  const { user } = useUser()
  const paypalRef = useRef<HTMLDivElement>(null)
  const buttonsRendered = useRef(false)

  useEffect(() => {
    if (!user || buttonsRendered.current) return

    const loadPayPalScript = () => {
      if (window.paypal) {
        renderPayPalButtons()
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`
      script.onload = () => renderPayPalButtons()
      document.body.appendChild(script)
    }

    const renderPayPalButtons = () => {
      if (!window.paypal || !paypalRef.current || buttonsRendered.current) return

      buttonsRendered.current = true

      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: async function(data: any, actions: any) {
          try {
            // 使用我们的后端API创建订阅
            const response = await fetch('/api/paypal/create-subscription', {
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

            const result = await response.json()
            
            if (result.success && result.subscriptionId) {
              console.log('Subscription created via backend:', result.subscriptionId)
              return result.subscriptionId
            } else {
              throw new Error(result.error || 'Failed to create subscription')
            }
          } catch (error) {
            console.error('Error creating subscription:', error)
            // 回退到直接使用PayPal SDK
            return actions.subscription.create({
              'plan_id': planId,
              'subscriber': {
                'email_address': user.email
              },
              'application_context': {
                'brand_name': 'FluxKrea',
                'locale': 'en-US',
                'shipping_preference': 'NO_SHIPPING',
                'user_action': 'SUBSCRIBE_NOW',
                'return_url': `${window.location.origin}/subscription/success`,
                'cancel_url': `${window.location.origin}/subscription/cancel`
              }
            })
          }
        },
        onApprove: async function(data: any, actions: any) {
          console.log('Subscription approved:', data.subscriptionID)
          
          try {
            // 调用后端API激活订阅
            const response = await fetch('/api/activate-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                subscriptionId: data.subscriptionID,
                userEmail: user.email,
                planName,
                credits
              }),
            })

            const result = await response.json()
            
            if (result.success) {
              onSuccess?.(data.subscriptionID)
              // 跳转到成功页面
              window.location.href = `/subscription/success?subscription_id=${data.subscriptionID}`
            } else {
              throw new Error(result.error || 'Failed to activate subscription')
            }
          } catch (error) {
            console.error('Error activating subscription:', error)
            onError?.(error)
          }
        },
        onError: function(err: any) {
          console.error('PayPal error:', err)
          onError?.(err)
        },
        onCancel: function(data: any) {
          console.log('Subscription cancelled:', data)
          window.location.href = '/subscription/cancel'
        }
      }).render(paypalRef.current)
    }

    loadPayPalScript()

    return () => {
      buttonsRendered.current = false
    }
  }, [user, planId, planName, credits, onSuccess, onError])

  if (!user) {
    return (
      <button className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg cursor-not-allowed">
        Please sign in to subscribe
      </button>
    )
  }

  return (
    <div>
      <div ref={paypalRef} className="paypal-button-container"></div>
    </div>
  )
}