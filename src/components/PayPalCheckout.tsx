'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import React from 'react'

type Props = {
  price: number
  planName: string
  credits: number
  onSuccess?: (details: any) => void
  onError?: (error: any) => void
}

export default function PayPalCheckout({ price, planName, credits, onSuccess, onError }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

  if (!clientId) {
    return (
      <div className="text-sm text-gray-500">
        PayPal is temporarily unavailable. Please configure NEXT_PUBLIC_PAYPAL_CLIENT_ID.
      </div>
    )
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
        }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'USD',
                  value: price.toString(),
                },
                description: `${planName} Plan - ${credits} Credits`,
              },
            ],
          })
        }}
        onApprove={(data, actions) => {
          return actions.order!.capture().then((details) => {
            onSuccess?.(details)
          })
        }}
        onError={(err) => {
          onError?.(err)
        }}
      />
    </PayPalScriptProvider>
  )
}