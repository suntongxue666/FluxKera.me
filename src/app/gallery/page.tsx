'use client'

import { useState } from 'react'
import { Heart, Download, Eye } from 'lucide-react'

const sampleImages = [
  {
    id: 1,
    url: '/api/placeholder/400/400',
    prompt: 'A beautiful sunset over mountains with a lake reflection',
    likes: 24,
    downloads: 12
  },
  {
    id: 2,
    url: '/api/placeholder/400/400',
    prompt: 'Cyberpunk city at night with neon lights',
    likes: 18,
    downloads: 8
  },
  {
    id: 3,
    url: '/api/placeholder/400/400',
    prompt: 'Abstract art with flowing colors and geometric shapes',
    likes: 31,
    downloads: 15
  },
  {
    id: 4,
    url: '/api/placeholder/400/400',
    prompt: 'Portrait of a wise old wizard with a long beard',
    likes: 42,
    downloads: 22
  },
  {
    id: 5,
    url: '/api/placeholder/400/400',
    prompt: 'Tropical beach with palm trees and crystal clear water',
    likes: 28,
    downloads: 14
  },
  {
    id: 6,
    url: '/api/placeholder/400/400',
    prompt: 'Steampunk mechanical dragon with brass gears',
    likes: 35,
    downloads: 18
  }
]

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [filter, setFilter] = useState('all')

  const filters = [
    { id: 'all', name: 'All Images' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'recent', name: 'Recent' },
    { id: 'trending', name: 'Trending' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Community Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing AI-generated images created by our community using FluxKrea
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filterOption.name}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sampleImages.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center relative group">
                <span className="text-gray-600">Sample Image {image.id}</span>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {image.prompt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {image.likes}
                    </div>
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {image.downloads}
                    </div>
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Load More Images
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Generated Image
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="aspect-square bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-600">Sample Image {selectedImage.id}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Prompt</h4>
                  <p className="text-gray-600">{selectedImage.prompt}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-gray-600">
                      <Heart className="h-5 w-5 mr-2" />
                      {selectedImage.likes} likes
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Download className="h-5 w-5 mr-2" />
                      {selectedImage.downloads} downloads
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Heart className="h-4 w-4 mr-1" />
                      Like
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}