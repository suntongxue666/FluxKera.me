export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          样式测试页面
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            如果你能看到这些样式，说明CSS正常工作
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-100 p-4 rounded-lg border border-green-300">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ 成功样式</h3>
              <p className="text-green-700">这是绿色的成功样式</p>
            </div>
            
            <div className="bg-red-100 p-4 rounded-lg border border-red-300">
              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ 错误样式</h3>
              <p className="text-red-700">这是红色的错误样式</p>
            </div>
          </div>
          
          <div className="mt-6">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4">
              蓝色按钮
            </button>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              紫色按钮
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            如果上面的内容有颜色和样式，说明Tailwind CSS正常工作
          </p>
          <a href="/pricing" className="text-blue-600 hover:underline">
            返回Pricing页面测试
          </a>
        </div>
      </div>
    </div>
  )
}