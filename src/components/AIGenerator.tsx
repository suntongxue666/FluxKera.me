'use client'

import { useState, useEffect } from 'react'
import { Wand2, Settings, Loader2, Download, RefreshCw, AlertCircle } from 'lucide-react'
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
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    width: 1024,
    height: 1024,
    guidance: FLUX_KREA_SETTINGS.guidanceRange.default,
    num_steps: FLUX_KREA_SETTINGS.stepsRange.default,
    seed: 42
  })
  
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
        setGeneratedImage(data.imageUrl)
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
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
                  Generate
                </>
              )}
            </button>

            <div className="text-center mt-3">
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

        {/* Model Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              Powered by <span className="font-semibold">FLUX.1 Krea</span> - 12B parameter model
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
