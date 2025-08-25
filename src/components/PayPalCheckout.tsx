'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@/lib/user-context'

interface PayPalCheckoutProps {
  planName: string
  price: number
  credits: number
  onSuccess: (details: any) => void
  onError: (error: any) => void
}

declare global {
  interface Window {
    paypal: any
  }
}

export default function PayPalCheckout({ planName, price, credits, onSuccess, onError }: PayPalCheckoutProps) {
  const paypalRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()

  useEffect(() => {
    if (!paypalRef.current || !user) return

    // 清理之前的PayPal按钮
    if (paypalRef.current) {
      paypalRef.current.innerHTML = ''
    }

    // 加载PayPal SDK
    const loadPayPalScript = () => {
      return new Promise((resolve, reject) => {
        if (window.paypal) {
          resolve(window.paypal)
          return
        }

        const script = document.createElement('script')
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`
        script.onload = () => resolve(window.paypal)
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    loadPayPalScript()
      .then((paypal: any) => {
        if (!paypalRef.current) return

        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: async (data: any, actions: any) => {
            try {
              // 创建订阅计划
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

              const { subscriptionId } = await response.json()
              return subscriptionId
            } catch (error) {
              console.error('Error creating subscription:', error)
              onError(error)
            }
          },
          onApprove: async (data: any, actions: any) => {
            try {
              // 确认订阅
              const response = await fetch('/api/paypal/confirm-subscription', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  subscriptionId: data.subscriptionID,
                  userId: user.id,
                  planName,
                  credits
                }),
              })

              const result = await response.json()
              if (result.success) {
                onSuccess(result)
              } else {
                onError(result.error)
              }
            } catch (error) {
              console.error('Error confirming subscription:', error)
              onError(error)
            }
          },
          onError: (err: any) => {
            console.error('PayPal error:', err)
            onError(err)
          },
          onCancel: (data: any) => {
            console.log('PayPal subscription cancelled:', data)
          }
        }).render(paypalRef.current)
      })
      .catch((error) => {
        console.error('Failed to load PayPal SDK:', error)
        onError(error)
      })
  }, [user, planName, price, credits, onSuccess, onError])

  if (!user) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Please sign in to subscribe</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div ref={paypalRef} className="paypal-button-container"></div>
    </div>
  )
}