'use client'

import { useState, useEffect } from 'react'

export default function DebugPlansPage() {
  const [planIds, setPlanIds] = useState<{[key: string]: string}>({})
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const createPlans = async () => {
      try {
        addLog('Starting to create PayPal plans...')
        const plansToCreate = [
          { name: 'Pro', price: 9.9 },
          { name: 'Max', price: 29.9 }
        ]

        const planIdMap: {[key: string]: string} = {}

        // 串行创建计划，避免并发问题
        for (const plan of plansToCreate) {
          try {
            addLog(`Creating plan: ${plan.name}`)
            const response = await fetch('/api/paypal/create-plan', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                planName: plan.name,
                price: plan.price
              }),
            })
            
            const result = await response.json()
            addLog(`Plan ${plan.name} creation result: ${JSON.stringify(result)}`)
            
            if (result.success && result.planId) {
              planIdMap[plan.name] = result.planId
              addLog(`✅ ${plan.name} plan created successfully: ${result.planId}`)
            } else {
              addLog(`❌ Failed to create ${plan.name} plan: ${JSON.stringify(result)}`)
            }
          } catch (planError) {
            addLog(`❌ Error creating ${plan.name} plan: ${planError}`)
          }
        }

        addLog(`Final plan IDs: ${JSON.stringify(planIdMap)}`)
        setPlanIds(planIdMap)
        setLoadingPlans(false)
      } catch (error) {
        addLog(`Error in createPlans: ${error}`)
        setLoadingPlans(false)
      }
    }

    createPlans()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">PayPal Plans Debug</h1>
        
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Plan Creation Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loadingPlans ? 'Yes' : 'No'}</p>
            <p><strong>Pro Plan ID:</strong> {planIds.Pro || 'Not created'}</p>
            <p><strong>Max Plan ID:</strong> {planIds.Max || 'Not created'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Creation Logs</h2>
          <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Test
          </button>
        </div>
      </div>
    </div>
  )
}