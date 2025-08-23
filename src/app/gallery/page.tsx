'use client'

import { useState } from 'react'
import { Heart, Download, Eye } from 'lucide-react'

const sampleImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1543857778-c4a1a569e7bd?w=800&h=800&fit=crop',
    prompt: 'Two weird wizards, one old, one younger in different patchwork wizard garb playing chess. They are sitting opposite to each other. The black and white chess pieces  are floating in the air. The wizards are just watching. Background a bookcase with leatherbound magical books. Realistic, detailed, colorful',
    likes: 24,
    downloads: 12
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop',
    prompt: 'Blue hour, Scandinavia. Fashion portrait of a dark skinned model. Lit with a red key light and a visible backlight',
    likes: 18,
    downloads: 8
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1633287387306-f08b4b3671c6?w=800&h=800&fit=crop',
    prompt: 'A fully 4k completely transparent clean glass detailed Star Wars Darth Vader helmet as lush terrarium.',
    likes: 31,
    downloads: 15
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop',
    prompt: 'A deeply emotional, dark fantasy portrait of a tall warrior in dark, weathered plate armor and a delicate angel with large, white feathered wings. They stand in a somber and intimate embrace, with the angel resting her head against the warrior\'s chest, and the warrior bowing his head over hers. The style is hyperrealistic and melancholic, sorrow, or farewell.',
    likes: 42,
    downloads: 22
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1602080858428-57174f943117?w=800&h=800&fit=crop',
    prompt: 'A cinematic, high-resolution photo of a luxurious green crocodile leather handbag placed gently on soft, lush grass at the edge of a calm river. The bag is rich emerald green with a gold clasp, shining subtly in natural sunlight. Around it, delicate light pink wildflowers bloom and reflect in the shallow water nearby. Style: ultra-realistic fashion editorial photography.',
    likes: 28,
    downloads: 14
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1607604276583-19d9937a76d4?w=800&h=800&fit=crop',
    prompt: '35mm photo of a whimsical squirrel playing a violin, wearing a tiny worn vintage hat, standing on a large wide stump in a lush forest',
    likes: 35,
    downloads: 18
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
    prompt: 'Portrait of a young man with curly hair and a thoughtful expression, wearing a vintage leather jacket',
    likes: 29,
    downloads: 16
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=800&fit=crop',
    prompt: 'A surreal landscape with floating islands and waterfalls cascading into the sky',
    likes: 45,
    downloads: 28
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800&h=800&fit=crop',
    prompt: 'Abstract gradient background with vibrant colors transitioning from purple to orange',
    likes: 33,
    downloads: 19
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?w=800&h=800&fit=crop',
    prompt: 'Cyberpunk cityscape at night with neon lights reflecting on wet streets',
    likes: 51,
    downloads: 32
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop',
    prompt: 'Macro shot of water droplets on a spider web in the early morning light',
    likes: 38,
    downloads: 21
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop',
    prompt: 'Minimalist home office setup with a laptop, plants, and natural lighting',
    likes: 26,
    downloads: 14
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
                <img 
                  src={image.url} 
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
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
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.prompt}
                  className="w-full h-full object-cover rounded-lg"
                />
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