'use client'

import { Check } from 'lucide-react'

export default function SimplePricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Affordable Pricing (Test Page)
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            This is a simplified test page to verify routing.
          </p>
        </div>

        {/* Simple Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {['Free', 'Pro', 'Max'].map((plan) => (
            <div key={plan} className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan === 'Free' ? '0' : plan === 'Pro' ? '9.9' : '29.9'}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Test Feature</span>
                </li>
              </ul>
              
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold">
                Choose {plan}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}