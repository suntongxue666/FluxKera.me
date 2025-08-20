'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Zap, UserIcon, LogOut, Coins } from 'lucide-react'
import { signInWithGoogle, signOut, getCurrentUser, type User } from '@/lib/auth'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 加载用户信息
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUser()
  }, [])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="bg-white shadow-md backdrop-blur-md bg-white/90 sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">FluxKrea</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/gallery" className="text-gray-700 hover:text-blue-600 transition-colors relative group">
              Gallery
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/generate" className="text-gray-700 hover:text-blue-600 transition-colors relative group">
              Generate
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="w-24 h-10 bg-gray-100 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span className="font-medium">{user.credits}</span>
                </div>
                <div className="relative group">
                  <div className="flex items-center cursor-pointer">
                    <img 
                      src={user.google_id ? `https://ui-avatars.com/api/?name=${user.email}&background=random` : `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                      alt="User Avatar" 
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg shadow-xl py-2 z-10 hidden group-hover:block transform transition-all duration-300 origin-top-right">
                    <div className="p-4 border-b border-gray-700">
                      <p className="text-white font-medium truncate">{user.email}</p>
                      <p className="text-gray-300 text-sm">Level: Free</p>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-left text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={handleSignIn}
                  className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleSignIn}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t animate-scaleIn">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
              >
                Home
              </Link>
              <Link 
                href="/generate"
                onClick={() => setIsMenuOpen(false)}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
              >
                Generate
              </Link>
              <Link 
                href="/pricing" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
              >
                Pricing
              </Link>
              <Link 
                href="/gallery" 
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-50"
              >
                Gallery
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 mb-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <Coins className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700">{user.credits} Credits</span>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center text-left text-gray-700 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleSignIn}
                      className="text-left text-gray-700 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={handleSignIn}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-left"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}