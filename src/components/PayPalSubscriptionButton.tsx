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
    if (!user) return

    // 清理之前的按钮
    if (paypalRef.current) {
      paypalRef.current.innerHTML = ''
    }
    buttonsRendered.current = false

    const loadPayPalScript = () => {
      if (window.paypal) {
        renderPayPalButtons()
        return
      }

      // 检查是否已经有PayPal脚本
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]')
      if (existingScript) {
        existingScript.onload = () => renderPayPalButtons()
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`
      script.onload = () => renderPayPalButtons()
      script.onerror = () => console.error('Failed to load PayPal SDK')
      document.body.appendChild(script)
    }

    const renderPayPalButtons = () => {
      if (!window.paypal || !paypalRef.current || buttonsRendered.current) return

      try {
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
            // 显示处理中状态
            const processingMessage = document.createElement('div')
            processingMessage.innerHTML = `
              <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
                <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center; max-width: 400px;">
                  <div style="margin-bottom: 1rem;">
                    <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                  </div>
                  <h3 style="margin: 0 0 1rem 0; color: #333;">Processing Your Subscription</h3>
                  <p style="margin: 0; color: #666;">Please wait while we activate your subscription...</p>
                </div>
              </div>
              <style>
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            `
            document.body.appendChild(processingMessage)

            // 等待一段时间让PayPal webhook处理完成
            await new Promise(resolve => setTimeout(resolve, 3000))

            // 尝试激活订阅，如果失败则重试
            let retryCount = 0
            const maxRetries = 5
            let activationSuccess = false

            while (retryCount < maxRetries && !activationSuccess) {
              try {
                console.log(`Attempting to activate subscription (attempt ${retryCount + 1}/${maxRetries})`)
                
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
                  activationSuccess = true
                  console.log('Subscription activated successfully')
                  break
                } else {
                  console.log(`Activation attempt ${retryCount + 1} failed:`, result.error)
                  retryCount++
                  if (retryCount < maxRetries) {
                    // 等待2秒后重试
                    await new Promise(resolve => setTimeout(resolve, 2000))
                  }
                }
              } catch (error) {
                console.error(`Activation attempt ${retryCount + 1} error:`, error)
                retryCount++
                if (retryCount < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 2000))
                }
              }
            }

            // 移除处理中消息
            document.body.removeChild(processingMessage)

            if (activationSuccess) {
              onSuccess?.(data.subscriptionID)
              // 跳转到成功页面
              window.location.href = `/subscription/success?subscription_id=${data.subscriptionID}&plan=${planName}`
            } else {
              // 即使激活失败，也跳转到成功页面，因为PayPal支付已经成功
              // webhook会在后台处理激活
              console.log('Activation failed, but payment was successful. Redirecting to success page.')
              window.location.href = `/subscription/success?subscription_id=${data.subscriptionID}&plan=${planName}&status=processing`
            }
          } catch (error) {
            console.error('Error in onApprove:', error)
            // 支付成功但激活可能需要时间，跳转到成功页面
            window.location.href = `/subscription/success?subscription_id=${data.subscriptionID}&plan=${planName}&status=processing`
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
      } catch (error) {
        console.error('Error rendering PayPal buttons:', error)
        buttonsRendered.current = false
      }
    }

    loadPayPalScript()

    return () => {
      if (paypalRef.current) {
        paypalRef.current.innerHTML = ''
      }
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