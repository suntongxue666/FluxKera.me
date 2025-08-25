'use client'

import { useState } from 'react'
import { useUser } from '@/lib/user-context'
import Link from 'next/link'

export default function TestPaymentPage() {
  const { user, credits, refreshUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const clearCredits = async () => {
    if (!user) {
      setMessage('Please sign in first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/test-clear-credits', {
        method: 'POST',
        credentials: 'include'
      })

      const result = await response.json()
      if (result.success) {
        setMessage('Credits cleared successfully!')
        await refreshUser()
      } else {
        setMessage('Failed to clear credits: ' + result.error)
      }
    } catch (error) {
      setMessage('Error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">PayPal Payment Testing</h1>
        
        {/* User Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Status</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Credits:</strong> {credits}</p>
              <p><strong>Subscription:</strong> {user.subscription_plan || 'None'}</p>
              <p><strong>Status:</strong> {user.subscription_status || 'None'}</p>
            </div>
          ) : (
            <p className="text-red-600">Please sign in to test payment features</p>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={clearCredits}
              disabled={loading || !user}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Clearing...' : 'Clear Credits (Test Only)'}
            </button>
            
            {message && (
              <div className={`p-3 rounded ${
                message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Test Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Testing Steps</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Make sure you're signed in</li>
            <li>Click "Clear Credits" to set credits to 0</li>
            <li>Go to <Link href="/generate" className="text-blue-600 hover:underline">Generate page</Link></li>
            <li>Try to generate an image (should show insufficient credits message)</li>
            <li>Should auto-redirect to <Link href="/pricing" className="text-blue-600 hover:underline">Pricing page</Link> after 3 seconds</li>
            <li>Select a plan and test PayPal integration</li>
          </ol>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700">
              Home
            </Link>
            <Link href="/generate" className="bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700">
              Generate
            </Link>
            <Link href="/pricing" className="bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700">
              Pricing
            </Link>
            <Link href="/debug-auth" className="bg-orange-600 text-white px-4 py-2 rounded text-center hover:bg-orange-700">
              Debug Auth
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}