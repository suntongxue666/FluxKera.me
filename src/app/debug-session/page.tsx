'use client'

import { useUser } from '@/lib/user-context'
import { useEffect } from 'react'

export default function DebugSession() {
  const { user, credits, loading, refreshUser } = useUser()

  useEffect(() => {
    console.log('=== DEBUG SESSION PAGE ===')
    console.log('User:', user)
    console.log('Credits:', credits)
    console.log('Loading:', loading)
  }, [user, credits, loading])

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Session</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Loading</p>
              <p className="text-lg">{loading ? 'true' : 'false'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">User</p>
              <pre className="text-lg bg-gray-100 p-2 rounded">
                {user ? JSON.stringify(user, null, 2) : 'null'}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Credits</p>
              <p className="text-lg">{credits}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={refreshUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh User Data
        </button>
      </div>
    </div>
  )
}