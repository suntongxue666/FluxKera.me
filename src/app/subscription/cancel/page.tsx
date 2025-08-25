'use client'

import { X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Subscription Cancelled
          </h1>
          <p className="text-gray-600">
            Your subscription process was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-orange-700 font-semibold">
            No worries!
          </p>
          <p className="text-orange-600 text-sm mt-1">
            You can still use FluxKrea with free credits or try subscribing again anytime.
          </p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/pricing"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link 
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="inline w-4 h-4 mr-1" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}