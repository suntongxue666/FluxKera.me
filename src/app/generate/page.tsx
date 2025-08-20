'use client'

import { useEffect } from 'react'
import AIGenerator from '@/components/AIGenerator'

export default function GeneratePage() {
  // 设置页面标题和元数据
  useEffect(() => {
    document.title = 'AI 图片生成器 | FluxKrea'
  }, [])

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{padding: "0px 0px"}}>
        {/* Removed Chinese title and subtitle as requested */}
      </div>
      
      {/* 引入 AI 生成器组件 */}
      <AIGenerator />
      
      {/* Usage Guide */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Usage Guide
        </h2>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Prompting Tips
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span>Use detailed descriptions, including elements like scene, style, colors, and lighting.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span>Specify art styles, such as "oil painting style," "watercolor," or "pixel art."</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span>Add emotional descriptions, like "serene," "mysterious," or "vibrant."</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span>Mention lighting conditions, such as "dusk," "sunny," or "moonlit."</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-medium mr-2">•</span>
              <span>For more advanced prompting, refer to the official Replicate model page: <a href="https://replicate.com/black-forest-labs/flux-schnell/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FLUX.1 Krea Dev Model on Replicate</a></span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Parameter Explanation
          </h3>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-gray-900">Guidance Scale</dt>
              <dd className="text-gray-700 mt-1">Controls how closely the generated image adheres to the prompt. Lower values produce more creative but potentially less accurate images, while higher values follow the prompt more strictly. Recommended range: 3.5-5.0.</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Steps</dt>
              <dd className="text-gray-700 mt-1">Controls the number of iterations in the generation process. More steps lead to richer details but also longer generation times. Recommended range: 1-4 steps.</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Seed</dt>
              <dd className="text-gray-700 mt-1">Controls the initial value for randomness. Using the same seed and parameters can generate similar images, allowing you to reproduce desired results.</dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resolution Guide
          </h3>
          <p className="text-gray-700 mb-4">
            Choose the resolution that best suits your needs. Higher resolutions generally require more processing time.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded p-3 text-center">
              <div className="font-medium">512×512</div>
              <div className="text-sm text-gray-500">Square (1:1)</div>
            </div>
            <div className="border border-gray-200 rounded p-3 text-center">
              <div className="font-medium">1024×1024</div>
              <div className="text-sm text-gray-500">Square (1:1)</div>
            </div>
            <div className="border border-gray-200 rounded p-3 text-center">
              <div className="font-medium">1280×1024</div>
              <div className="text-sm text-gray-500">Landscape (5:4)</div>
            </div>
            <div className="border border-gray-200 rounded p-3 text-center">
              <div className="font-medium">1024×1280</div>
              <div className="text-sm text-gray-500">Portrait (4:5)</div>
            </div>
            <div className="border border-gray-200 rounded p-3 text-center">
              <div className="font-medium">1280×768</div>
              <div className="text-sm text-gray-500">Widescreen (5:3)</div>
            </div>
            <div className="border border-gray-200 rounded p-3 text-center">
              <div className="font-medium">768×1280</div>
              <div className="text-sm text-gray-500">Tall (3:5)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}