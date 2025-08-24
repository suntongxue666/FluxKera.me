'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@/lib/user-context'

export default function TestSession() {
  const { user, credits, loading, signIn, signOut } = useUser()
  const [sessionInfo, setSessionInfo] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        // 直接检查会话
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Direct session check:', session, error)
        setSessionInfo(session)
        
        if (session && session.user) {
          // 直接检查数据库用户
          const { data, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          console.log('Direct DB user check:', data, dbError)
          setDbUser(data)
        }
      } catch (err) {
        console.error('Error in session check:', err)
      }
    }
    
    checkSession()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">From UserContext:</h2>
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>User: {user ? user.email : 'null'}</p>
        <p>Credits: {credits}</p>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Direct Session Check:</h2>
        <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Direct DB User:</h2>
        <pre>{JSON.stringify(dbUser, null, 2)}</pre>
      </div>
      
      <div className="space-x-2">
        <button 
          onClick={signIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sign In
        </button>
        <button 
          onClick={signOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}