/*  */import Link from 'next/link'
import { Zap, Twitter, Github, Mail, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
          backgroundSize: '100px 100px'
        }}></div>
      </div>
      
      {/* Wave Divider */}
      <div className="absolute top-0 left-0 right-0 transform rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#f9fafb">
          <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,74.7C960,85,1056,107,1152,112C1248,117,1344,107,1392,101.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6 group">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">FluxKrea</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Create stunning AI images with the power of FLUX.1 Krea model. 
              Transform your ideas into beautiful visuals with state-of-the-art technology.
            </p>
            
            <div className="mt-6">
              <Link 
                href="/generate" 
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors group"
              >
                Try it now 
                <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-6 text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-300">Product</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="transform transition-all duration-200 hover:translate-x-1">
                <Link href="/generate" className="hover:text-white transition-colors inline-flex items-center">
                  <span className="bg-blue-900/30 rounded-full w-1.5 h-1.5 mr-2"></span>
                  AI Generator
                </Link>
              </li>
              <li className="transform transition-all duration-200 hover:translate-x-1">
                <Link href="/gallery" className="hover:text-white transition-colors inline-flex items-center">
                  <span className="bg-blue-900/30 rounded-full w-1.5 h-1.5 mr-2"></span>
                  Gallery
                </Link>
              </li>
              <li className="transform transition-all duration-200 hover:translate-x-1">
                <Link href="/pricing" className="hover:text-white transition-colors inline-flex items-center">
                  <span className="bg-blue-900/30 rounded-full w-1.5 h-1.5 mr-2"></span>
                  Pricing
                </Link>
              </li>
              <li className="transform transition-all duration-200 hover:translate-x-1">
                <Link href="/sitemap.xml" className="hover:text-white transition-colors inline-flex items-center">
                  <span className="bg-blue-900/30 rounded-full w-1.5 h-1.5 mr-2"></span>
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-6 text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-300">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="transform transition-all duration-200 hover:translate-x-1">
                <a href="mailto:tiktreeapp@gmail.com" className="hover:text-white transition-colors inline-flex items-center">
                  <span className="bg-purple-900/30 rounded-full w-1.5 h-1.5 mr-2"></span>
                  tiktreeapp@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-6 text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-300">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="transform transition-all duration-200 hover:translate-x-1">
                <Link href="/privacy" className="hover:text-white transition-colors inline-flex items-center">
                  <span className="bg-indigo-900/30 rounded-full w-1.5 h-1.5 mr-2"></span>
                  Privacy Policy
                </Link>
              </li>
              <li className="transform transition-all duration-200 hover:translate-x-1">
                <Link href="/terms" className="hover:text-white transition-colors inline-flex items-center">
                  <span className="bg-indigo-900/30 rounded-full w-1.5 h-1.5 mr-2"></span>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © 2025 FluxKrea. All rights reserved. Powered by FLUX.1 Krea model.
          </div>
          
          <div className="flex space-x-6">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://github.com/krea-ai/flux-krea" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors transform hover:scale-110"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="mailto:contact@fluxkrea.com"
              className="text-gray-400 hover:text-purple-400 transition-colors transform hover:scale-110"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}