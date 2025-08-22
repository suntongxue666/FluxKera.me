'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import UserStatus from './UserStatus'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
          <UserStatus />

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
            </div>
          </div>
        )}
      </div>
    </header>
  )
}