'use client'

import { useState, useEffect } from 'react'
import { Wand2, Settings, Loader2, Download, RefreshCw, AlertCircle, LogIn } from 'lucide-react'
import { useUser } from '@/lib/user-context'

// Based on open-source project recommended settings
const FLUX_KREA_SETTINGS = {
  // Supported resolutions (must be multiples of 16)
  resolutions: [
    { label: '512x512', width: 512, height: 512, ratio: '1:1' },
    { label: '1024x1024', width: 1024, height: 1024, ratio: '1:1' },
    { label: '1280x1024', width: 1280, height: 1024, ratio: '5:4' },
    { label: '1024x1280', width: 1024, height: 1280, ratio: '4:5' },
    { label: '1280x768', width: 1280, height: 768, ratio: '5:3' },
    { label: '768x1280', width: 768, height: 1280, ratio: '3:5' }
  ],
  // Recommended guidance strength range
  guidanceRange: { min: 3.5, max: 5.0, default: 4.5 },
  // Recommended steps range
  stepsRange: { min: 20, max: 50, default: 28 },
  // Model specific parameters
  modelParams: {
    y1: 0.5,
    y2: 1.15,
    sigma: 1.0
  }
}

export default function AIGenerator() {
  const { user, credits, signIn, refreshUser } = useUser()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    width: 1024,
    height: 1024,
    guidance: FLUX_KREA_SETTINGS.guidanceRange.default,
    num_steps: FLUX_KREA_SETTINGS.stepsRange.default,
    seed: Math.floor(Math.random() * 1000000)
  })
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // Set random seed on client initialization
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      seed: Math.floor(Math.random() * 1000000)
    }))
  }, [])
  
  const selectedResolution = FLUX_KREA_SETTINGS.resolutions.find(
    r => r.width === settings.width && r.height === settings.height
  ) || FLUX_KREA_SETTINGS.resolutions[0]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.')
      return
    }
    
    // 如果用户未登录，显示登录模态框
    if (!user) {
      setShowLoginModal(true)
      return
    }
    
    // 检查用户积分是否足够
    if (credits < 10) {
      setError('您的积分不足，请充值后再试。')
      return
    }
    
    setError(null)
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          width: settings.width,
          height: settings.height,
          guidance: settings.guidance,
          num_steps: settings.num_steps,
          seed: settings.seed
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 直接使用返回的图片URL
        setGeneratedImage(data.imageUrl)
        
        // 记录图片URL，方便调试
        console.log('Generated image URL:', data.imageUrl)
        
        // 刷新用户积分
        await refreshUser()
      } else {
        setError(data.error || 'Generation failed, please try again later.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Network error, please check your connection.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleRandomSeed = () => {
    setSettings(prev => ({
      ...prev,
      seed: Math.floor(Math.random() * 1000000)
    }))
  }

  const handleResolutionChange = (resolution: typeof FLUX_KREA_SETTINGS.resolutions[0]) => {
    setSettings(prev => ({
      ...prev,
      width: resolution.width,
      height: resolution.height
    }))
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `fluxkrea-${Date.now()}.png`
      link.click()
    }
  }
  
  const handleGoogleLogin = async () => {
    await signIn()
  }
  
  const handleCloseModal = () => {
    setShowLoginModal(false)
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 relative">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            AI Image Generator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by FLUX.1 Krea - Create stunning images from text descriptions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700 mb-3">
                Positive Prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A majestic mountain landscape at sunset with a crystal clear lake reflecting the golden sky..."
                className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {prompt.length}/500
              </div>
            </div>

            {/* Quick Resolution Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Image Size
              </label>
              <select
                value={`${settings.width}x${settings.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  handleResolutionChange({ width, height, label: e.target.selectedOptions[0].text, ratio: '' });
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              >
                {FLUX_KREA_SETTINGS.resolutions.map((resolution) => (
                  <option key={`${resolution.width}x${resolution.height}`} value={`${resolution.width}x${resolution.height}`}>
                    {resolution.label} ({resolution.ratio})
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Settings Panel (Always visible, only Steps) */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steps: {settings.num_steps}
                </label>
                <input
                  type="range"
                  min={FLUX_KREA_SETTINGS.stepsRange.min}
                  max={FLUX_KREA_SETTINGS.stepsRange.max}
                  step="1"
                  value={settings.num_steps}
                  onChange={(e) => setSettings(prev => ({...prev, num_steps: Number(e.target.value)}))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Faster</span>
                  <span>Higher Quality</span>
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" />
                  Generate <span className="text-xs ml-6">-10 Credits</span>
                </>
              )}
            </button>

            <div className="text-center mt-3">
              {!user && (
                <p className="text-blue-600 font-medium">
                  🎁 Sign in to get 20 Credits
                </p>
              )}
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generated Image</h3>
              {generatedImage && (
                <button
                  onClick={handleDownload}
                  className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              )}
            </div>
            
            <div 
              className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 overflow-hidden"
              style={{ aspectRatio: `${selectedResolution.width}/${selectedResolution.height}` }}
            >
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <Wand2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Your masterpiece will appear here</p>
                  <p className="text-sm mt-2">Enter a prompt and click generate</p>
                </div>
              )}
            </div>

            {/* Image Info */}
            {generatedImage && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-2">
                  <div>Size: {selectedResolution.label}</div>
                  <div>Steps: {settings.num_steps}</div>
                  <div>Seed: {settings.seed}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 登录模态框 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-center mb-6">Your luck of 20 Credits</h3>
            <p className="text-gray-600 text-center mb-8">Sign in with Google to get it.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGoogleLogin}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Sign in
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}