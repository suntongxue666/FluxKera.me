'use client'

import { useUser } from '@/lib/user-context'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function DebugAuthPage() {
  const { user, credits, loading } = useUser()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  )

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSessionInfo(session)
      addLog(`Session check - User: ${!!session?.user}, Error: ${!!error}`)
      if (session?.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const minutesLeft = Math.floor((expiresAt.getTime() - now.getTime()) / 60000)
        addLog(`Token expires in ${minutesLeft} minutes`)
      }
    } catch (error) {
      addLog(`Session check error: ${error}`)
    }
  }

  useEffect(() => {
    checkSession()
    const interval = setInterval(checkSession, 10000) // 每10秒检查一次
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    addLog(`User context changed - User: ${!!user}, Loading: ${loading}, Credits: ${credits}`)
  }, [user, loading, credits])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Context Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Context Status</h2>
            <div className="space-y-2">
              <div className={`p-2 rounded ${loading ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
              <div className={`p-2 rounded ${user ? 'bg-green-100' : 'bg-red-100'}`}>
                <strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}
              </div>
              <div className="p-2 rounded bg-blue-100">
                <strong>Credits:</strong> {credits}
              </div>
              {user && (
                <div className="p-2 rounded bg-gray-100">
                  <strong>Email:</strong> {user.email}
                </div>
              )}
            </div>
          </div>

          {/* Session Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Session Status</h2>
            <button 
              onClick={checkSession}
              className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Session Info
            </button>
            {sessionInfo ? (
              <div className="space-y-2">
                <div className="p-2 rounded bg-green-100">
                  <strong>Session:</strong> Active
                </div>
                <div className="p-2 rounded bg-blue-100">
                  <strong>User ID:</strong> {sessionInfo.user?.id?.slice(0, 8)}...
                </div>
                <div className="p-2 rounded bg-blue-100">
                  <strong>Email:</strong> {sessionInfo.user?.email}
                </div>
                {sessionInfo.expires_at && (
                  <div className="p-2 rounded bg-yellow-100">
                    <strong>Expires:</strong> {new Date(sessionInfo.expires_at * 1000).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 rounded bg-red-100">
                <strong>Session:</strong> None
              </div>
            )}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div>No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">如何使用此调试页面：</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>登录后，观察"User Context Status"和"Session Status"是否都显示为已登录</li>
            <li>等待1-3分钟，观察状态是否发生变化</li>
            <li>查看"Activity Logs"中的日志，寻找异常信息</li>
            <li>如果状态变为未登录，检查日志中的错误信息</li>
            <li>页面会每10秒自动检查session状态</li>
          </ol>
        </div>
      </div>
    </div>
  )
}