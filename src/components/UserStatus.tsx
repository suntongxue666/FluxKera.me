'use client'

import { LogOut } from 'lucide-react'
import { useUser } from '@/lib/userContext'
import type { User } from '@/lib/auth'

export default function UserStatus() {
  const { user, credits, loading: isLoading, signIn, signOut } = useUser()

  return (
    <div className="hidden md:flex items-center space-x-4">
      {isLoading ? (
        <div className="w-24 h-10 animate-pulse"></div>
      ) : user ? (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <span className="font-medium">{credits}</span>
          </div>
          <div className="relative group">
            <div className="flex items-center cursor-pointer">
              <img 
                src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || '')}&background=random`} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg shadow-xl py-2 z-10 hidden group-hover:block transform transition-all duration-300 origin-top-right">
              <div className="p-4 border-b border-gray-700">
                <p className="text-white font-medium truncate">{user.email}</p>
                <p className="text-gray-300 text-sm">Level: Free</p>
              </div>
              <button 
                onClick={signOut}
                className="flex items-center w-full px-4 py-2 text-left text-white hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={signIn}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          Sign In
        </button>
      )}
    </div>
  )
}