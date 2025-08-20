'use client'

import { useState, useId } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, Sparkles, Users, ArrowRight, Check, Download, Star } from 'lucide-react'
import AIGenerator from '@/components/AIGenerator'

// Inline styles to ensure basic styling works
const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  heroSection: {
    position: 'relative',
    backgroundColor: '#000',
    color: '#fff',
    overflow: 'hidden',
    padding: '8rem 1rem',
  },
  heroBackground: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url("/banner.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.7,
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)',
  },
  heroContent: {
    position: 'relative',
    maxWidth: '1200px',
    margin: '0 auto',
    zIndex: 10,
  },
  heading: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: 1.2,
  },
  gradientText: {
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subheading: {
    fontSize: '1.5rem',
    color: '#d1d5db',
    maxWidth: '36rem',
    marginBottom: '2.5rem',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '1rem 2rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  section: {
    padding: '6rem 1rem',
    backgroundColor: 'white',
  },
  sectionAlt: {
    padding: '6rem 1rem',
    backgroundColor: '#f9fafb',
  },
  sectionContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeading: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  sectionSubheading: {
    fontSize: '1.25rem',
    color: '#4b5563',
    maxWidth: '36rem',
    margin: '0 auto 4rem auto',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  featureIcon: {
    width: '4rem',
    height: '4rem',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem auto',
    color: 'white',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.75rem',
    textAlign: 'center',
  },
  featureDescription: {
    color: '#4b5563',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.375rem 1rem',
    backgroundColor: '#e0f2fe',
    color: '#1d4ed8',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '1rem',
  },
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('all')

  const galleryItems = [
    { id: 1, prompt: 'Photo of two beautiful lady having a tea party in a lush garden', imageUrl: 'https://replicate.delivery/xezq/dbf8JwqdSqTYUS5jeCpjnjaVJD7xH0mNjs72xKQf0s8JEewUB/out-0.webp' },
    { id: 2, prompt: 'portrait of a rugged middle-aged man, sharp blue eyes, wavy messy hair, thick beard with touches of gray, wearing casual shirt, cinematic natural lighting, ultra realistic, detailed skin texture, intense gaze.', imageUrl: 'https://replicate.delivery/xezq/mc7jeifqNzuDzUZtffQTwXq63txWHMSxkliGlTPUYRdw58wUB/out-0.webp' },
    { id: 3, prompt: 'Realistic photo of a cat as a pirate, everyday photo on a ship, complex chaotic scene with many details', imageUrl: 'https://replicate.delivery/xezq/aHyZYETbC27KGNotHxIxhxFXY7EJ7FfgWGq8iHad2r5joHmKA/out-0.webp' },
    { id: 4, prompt: 'a tiny astronaut hatching from an egg on the moon', imageUrl: 'https://replicate.delivery/yhqm/QeGlhr8w4CWefov8rFAozycqveU4anxkYuUVxANfolFP710bC/out-0.webp' },
    { id: 5, prompt: 'black forest gateau cake spelling out the words "FLUX SCHNELL", tasty, food photography, dynamic shot', imageUrl: 'https://replicate.delivery/yhqm/hcDDSNf633zeDUz9sWkKfaftcfJLWIvuhn9vfCFWmufxelmemA/out-0.webp' },
    { id: 6, prompt: 'womens street skateboarding final in Paris Olympics 2024', imageUrl: 'https://replicate.delivery/yhqm/pNZ3A6l9B35dB9VxE0eGqkGfBGe401MjUttdOyzvpfWbEb6NB/out-0.webp' },
  ]

  const filteredGallery = galleryItems // Removed activeTab filtering as per request to remove categories

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/banner.jpg')] bg-cover bg-center bg-fixed"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 lg:py-48">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-[60px] font-bold mb-6 leading-tight animate-fadeInUp">
              Create Stunning Images with<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 animate-shine relative">
                FLUX.1 Krea Dev Model
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mb-10 animate-fadeInUp" style={{animationDelay: "0.2s"}}>
              Turn text into stunning, HQ images with Flux.1 Krea Dev — Powered by 12B-Parameter AI model.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp" style={{animationDelay: "0.4s"}}>
              <Link 
                href="/generate"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all btn-3d inline-flex items-center justify-center shadow-lg"
              >
                Start Creating <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/gallery"
                className="glass-premium hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-lg text-lg font-semibold transition-all btn-hover-lift inline-flex items-center justify-center"
              >
                Browse Gallery
              </Link>
            </div>
          </div>
        </div>
        
        {/* Modern Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#f0f7ff" className="drop-shadow-md">
            <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,74.7C960,85,1056,107,1152,112C1248,117,1344,107,1392,101.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* AI Generator Section */}
      <section className="bg-gradient-to-b from-[#eaf1ff] to-[#f0f7ff]" id="generator" style={{padding: "0px 0px"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full flex flex-wrap items-center justify-center gap-3 py-8">
            <span className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md transform transition-transform hover:scale-105" style={{backgroundColor:'#f97316'}}>
              ✅ Free Create
            </span>
            <span className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md transform transition-transform hover:scale-105" style={{backgroundColor:'#22c55e'}}>
              🎉 No-Signup
            </span>
            <span className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md transform transition-transform hover:scale-105" style={{backgroundColor:'#3b82f6'}}>
              🏞️ High-Quality
            </span>
            <span className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md transform transition-transform hover:scale-105" style={{backgroundColor:'#a855f7'}}>
              🥇 Fast&Realistic
            </span>
          </div>
        </div>
        
        {/* AI Generator Component */}
        <AIGenerator />
      </section>

      {/* Features Section */}
      <section className="py-[40px] md:py-[80px] bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              Why Choose FluxKrea
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Experience Unmatched Quality & Control
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by cutting-edge AI technology that delivers exceptional results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center card-hover transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Generate high-quality images in just 28-32 steps. No waiting hours for results.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center card-hover transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Superior Quality</h3>
              <p className="text-gray-600">
                Powered by the 12B parameter FLUX.1 Krea model for exceptional aesthetic control.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center card-hover transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
              <div className="bg-gradient-to-br from-green-400 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy to Use</h3>
              <p className="text-gray-600">
                Simple interface designed for everyone. Just enter your prompt and watch the magic happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-[40px] md:py-[80px] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
              Endless Possibilities
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Explore What's Possible
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              From photorealistic portraits to abstract art, FluxKrea can do it all
            </p>
            
          </div>

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGallery.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden group card-hover transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.prompt} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-0 text-base line-clamp-2">
                    {item.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link 
              href="/gallery"
              className="inline-flex items-center px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-all btn-hover-lift shadow-md hover:shadow-lg"
            >
              View Full Gallery <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-[40px] md:py-[80px] bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Advanced Technology
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Professional-Grade Results
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              FLUX.1 Krea delivers exceptional quality with precise control
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-100 card-hover transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-3 animate-float">12B</div>
              <div className="text-gray-600 font-medium">Parameters</div>
            </div>
            <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-100 card-hover transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-3 animate-float" style={{animationDelay: "0.2s"}}>28-50</div>
              <div className="text-gray-600 font-medium">Steps Range</div>
            </div>
            <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-100 card-hover transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-3 animate-float" style={{animationDelay: "0.4s"}}>1280px</div>
              <div className="text-gray-600 font-medium">Max Resolution</div>
            </div>
            <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-100 card-hover transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-3 animate-float" style={{animationDelay: "0.6s"}}>3.5-5.0</div>
              <div className="text-gray-600 font-medium">Guidance Range</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 inline-flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                <Sparkles className="h-6 w-6" />
              </span>
              Model Features
            </h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="font-semibold text-gray-900 mb-6 text-lg inline-flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Supported Resolutions
                </h4>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>1024×1024 (Square)</span>
                  </li>
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>1280×1024 (Landscape)</span>
                  </li>
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>1024×1280 (Portrait)</span>
                  </li>
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>1280×768 (Widescreen)</span>
                  </li>
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>768×1280 (Tall)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-6 text-lg inline-flex items-center">
                  <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Optimizations
                </h4>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>CFG-distilled Model</span>
                  </li>
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Rectified-flow Architecture</span>
                  </li>
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Post-training Optimization</span>
                  </li>
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Superior Aesthetic Control</span>
                  </li>
                  <li className="flex items-start transform transition-all duration-200 hover:translate-x-1">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1 mr-3 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Compatible with FLUX.1 dev</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-[40px] md:py-[80px] bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Start Free, Upgrade When You Need More
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. Pay only for what you need.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-blue-600">F</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <div className="text-blue-600 font-semibold mb-8">20 Credits</div>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">20 credits upon signup</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Basic image generation</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Community support</span>
                </li>
              </ul>
              <Link 
                href="/pricing"
                className="block w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all text-center shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl border-2 border-blue-600 p-8 shadow-xl relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl -mt-4 pb-12">
              <div className="absolute -top-5 inset-x-0 flex justify-center">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-white">P</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$9.99</div>
              <div className="text-blue-600 font-semibold mb-8">1,000 Credits</div>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">1,000 credits</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Priority generation queue</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">High resolution support</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Commercial license</span>
                </li>
              </ul>
              <Link 
                href="/pricing"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all text-center"
              >
                Choose Pro
              </Link>
            </div>

            {/* Max Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                <span className="text-2xl font-bold text-purple-600">M</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Max</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$29.99</div>
              <div className="text-blue-600 font-semibold mb-8">5,000 Credits</div>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Start Free, Upgrade When You Need More
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. Pay only for what you need.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">F</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <div className="text-blue-600 font-semibold mb-8">20 Credits</div>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">20 credits upon signup</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Basic image generation</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Community support</span>
                </li>
              </ul>
              <Link 
                href="/pricing"
                className="block w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl border-2 border-blue-600 p-8 shadow-xl relative transition-all hover:-translate-y-2 hover:shadow-2xl -mt-4 pb-12">
              <div className="absolute -top-5 inset-x-0 flex justify-center">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">P</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$9.99</div>
              <div className="text-blue-600 font-semibold mb-8">1,000 Credits</div>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">1,000 credits</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Priority generation queue</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">High resolution support</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Commercial license</span>
                </li>
              </ul>
              <Link 
                href="/pricing"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all text-center"
              >
                Choose Pro
              </Link>
            </div>

            {/* Max Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">M</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Max</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$29.99</div>
              <div className="text-blue-600 font-semibold mb-8">5,000 Credits</div>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">5,000 credits</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Fastest generation speed</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">Maximum resolution</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600">API access</span>
                </li>
              </ul>
              <Link 
                href="/pricing"
                className="block w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all text-center"
              >
                Choose Max
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[40px] md:py-[80px] relative overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-[url('/banner.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900"></div>
        
        {/* Content */}
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-12 backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white animate-fadeInUp">
              Ready to Create Amazing Images?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto animate-fadeInUp" style={{animationDelay: "0.2s"}}>
              Join thousands of creators who are already turning their ideas into reality with FluxKrea
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fadeInUp" style={{animationDelay: "0.4s"}}>
              <Link 
                href="/generate"
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center justify-center shadow-lg"
              >
                Start Creating Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/pricing"
                className="bg-transparent border-2 border-white hover:bg-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center justify-center"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}