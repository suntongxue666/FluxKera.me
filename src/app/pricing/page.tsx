'use client'

import { Check, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useUser } from '@/lib/user-context'
import PayPalSubscriptionButton from '@/components/PayPalSubscriptionButton'


const plans = [
  {
    name: 'Free',
    price: 0,
    credits: 20,
    description: 'Perfect for trying out Flux Krea AI',
    features: [
      '2 times creation',
      'Standard image quality',
      'Basic image sizes',
      'No signup required',
      'Commercial use allowed'
    ],
    buttonText: "You've got the luck",
    popular: false,
    highlights: ['20 free credits to start', 'Given to 30 Lucky Users per day.']
  },
  {
    name: 'Pro',
    price: 9.9,
    credits: 1000,
    description: 'Best value for regular users',
    features: [
      '1000 monthly credits',
      'HD image quality',
      'All image sizes',
      'Priority generation',
      'Commercial use allowed',
      'Email support',
      'No Ads'
    ],
    buttonText: 'Choose Pro',
    popular: true,
    highlights: ['1000 credits per month']
  },
  {
    name: 'Max',
    price: 29.9,
    credits: 5000,
    description: 'For power users and professionals',
    features: [
      '5000 monthly credits',
      'Ultra-HD image quality',
      'All image sizes',
      'Fastest generation',
      'Commercial use allowed',
      'Priority email support',
      'No Ads'
    ],
    buttonText: 'Choose Max',
    popular: false,
    highlights: ['5000 credits per month'],
    discountBadge: '40% Discount'
  }
]

export default function PricingPage() {
  const { user, refreshUser } = useUser()
  const [planIds, setPlanIds] = useState<{[key: string]: string}>({})
  const [loadingPlans, setLoadingPlans] = useState(true)

  // 预创建PayPal计划
  useEffect(() => {
    const createPlans = async () => {
      try {
        console.log('Starting to create PayPal plans...')
        
        // 使用最新创建的计划ID
        const fixedPlanIds = {
          'Pro': 'P-41W26469F4549972UNCWIYTQ',
          'Max': 'P-6MX09822GR0319232NCWIY4I'
        }

        console.log('Using fixed plan IDs:', fixedPlanIds)
        setPlanIds(fixedPlanIds)
        setLoadingPlans(false)

        // 可选：验证计划是否存在，如果不存在则创建新的
        // 这里暂时跳过验证，直接使用固定ID
        
      } catch (error) {
        console.error('Error in createPlans:', error)
        setLoadingPlans(false)
      }
    }

    createPlans()
  }, [])

  const handleSubscriptionSuccess = (subscriptionId: string) => {
    console.log('Subscription successful:', subscriptionId)
    refreshUser()
  }

  const handleSubscriptionError = (error: any) => {
    console.error('Subscription error:', error)
    alert('Subscription failed. Please try again.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Affordable Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose and Start creating amazing AI images today with our flexible credit packages.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 ${plan.name === 'Max' ? 'border-orange-400' : 'border-gray-200'} ${plan.popular ? 'ring-2 ring-blue-600 scale-105 border-blue-200' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              {plan.name === 'Max' && plan.discountBadge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {plan.discountBadge}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="text-center mb-6">
                  {plan.name === 'Free' ? (
                    <>
                      <p className="text-green-600 font-semibold">20 free credits to start</p>
                      <p className="text-green-600 font-semibold">Given to 30 Lucky Users per day.</p>
                    </>
                  ) : (
                    <p className="text-green-600 font-semibold">
                      {plan.name === 'Pro' ? '1000 credits per month' : '5000 credits per month'}
                    </p>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                {plan.price === 0 ? (
                  <button className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    {plan.buttonText}
                  </button>
                ) : (
                  <div className="mt-4">
                    {loadingPlans ? (
                      <div className="w-full">
                        <button className="w-full bg-blue-400 text-white py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Setting up PayPal...
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-1">This may take a few seconds</p>
                      </div>
                    ) : planIds[plan.name] ? (
                      <PayPalSubscriptionButton
                        planName={plan.name}
                        planId={planIds[plan.name]}
                        price={plan.price}
                        credits={plan.credits}
                        onSuccess={handleSubscriptionSuccess}
                        onError={handleSubscriptionError}
                      />
                    ) : (
                      <div className="w-full">
                        <button 
                          className="w-full bg-red-500 text-white py-3 px-4 rounded-lg cursor-pointer hover:bg-red-600"
                          onClick={() => window.location.reload()}
                        >
                          Setup Failed - Click to Retry
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-1">PayPal plan creation failed</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do credits work?
              </h3>
              <p className="text-gray-600">
                Each image generation costs 10 credits. Credits never expire and can be used anytime. 
                You can always see your current credit balance in your account dashboard.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. When you upgrade, 
                you'll immediately get access to the new features and credits.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's the difference between plans?
              </h3>
              <p className="text-gray-600">
                Higher plans offer more credits, faster generation speeds, higher resolutions, 
                and additional features like API access and commercial licensing.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, 
                contact our support team for a full refund.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}