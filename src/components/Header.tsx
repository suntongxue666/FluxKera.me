'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Zap, UserIcon, LogOut, Coins } from 'lucide-react'
import { useUser } from '@/lib/UserContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, credits, loading, signIn, signOut } = useUser()

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
            {loading ? (
              <div className="w-24 h-10 bg-gray-100 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{credits}</span>
                </div>
                <div className="relative group">
                  <div className="flex items-center cursor-pointer">
                    <img 
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                      alt="User Avatar" 
                      className="w-8 h-8 rounded-full"
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
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="mr-2">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Sign In
              </button>
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
                      onClick={signOut}
                      className="flex items-center text-left text-gray-700 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={signIn}
                    className="flex items-center text-left text-gray-700 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="mr-2">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                    </svg>
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}