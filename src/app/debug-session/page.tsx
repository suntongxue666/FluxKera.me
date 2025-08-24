'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DebugSession() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking session...')
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        console.log('Session result:', currentSession, sessionError)
        
        if (sessionError) {
          setError(sessionError.message)
          setLoading(false)
          return
        }
        
        setSession(currentSession)
        
        if (currentSession && currentSession.user) {
          console.log('User from session:', currentSession.user)
          setUser(currentSession.user)
          
          // 尝试获取数据库中的用户数据
          const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentSession.user.id)
            .single()
          
          console.log('Database user:', dbUser, dbError)
        }
      } catch (err) {
        console.error('Error checking session:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  if (loading) {
    return <div className="p-4">Loading session data...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Session Debug Info</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Session Status:</h2>
        {session ? (
          <div className="bg-green-100 p-2 rounded">
            <p>✅ Session exists</p>
            <p>User ID: {session.user?.id}</p>
            <p>User Email: {session.user?.email}</p>
          </div>
        ) : (
          <div className="bg-red-100 p-2 rounded">
            <p>❌ No session found</p>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">User Data:</h2>
        {user ? (
          <div className="bg-blue-100 p-2 rounded">
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        ) : (
          <div className="bg-gray-100 p-2 rounded">
            <p>No user data</p>
          </div>
        )}
      </div>
      
      <button 
        onClick={async () => {
          const { error } = await supabase.auth.signOut()
          if (error) {
            console.error('Sign out error:', error)
          } else {
            window.location.reload()
          }
        }}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  )
}