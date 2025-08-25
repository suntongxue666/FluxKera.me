'use client'

import HeaderUserMenu from '@/components/HeaderUserMenu'

export default function TestUIPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">UI组件测试</h1>
        
        <div className="space-y-8">
          {/* Header User Menu 测试 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">HeaderUserMenu 组件</h2>
            <div className="flex justify-end">
              <HeaderUserMenu />
            </div>
          </div>

          {/* 模拟不同状态 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">不同状态预览</h2>
            
            <div className="space-y-4">
              {/* 未登录状态 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">未登录状态:</span>
                <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Sign in
                </button>
              </div>

              {/* 加载状态 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">加载状态:</span>
                <div className="w-[120px] h-[40px] bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* 设计说明 */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">设计说明</h2>
            <ul className="space-y-2 text-blue-700">
              <li>✅ Sign in按钮采用Google登录样式（白色背景，边框，Google图标）</li>
              <li>✅ 登录后显示积分（左侧，金币图标）+ 头像（右侧）</li>
              <li>✅ 移除了Sign out按钮，放入下拉菜单</li>
              <li>✅ 鼠标悬停头像显示黑色半透明下拉菜单</li>
              <li>✅ 下拉菜单包含：用户名、等级、Valid、Sign out按钮</li>
              <li>✅ 等级根据积分自动计算：Free(&lt;100), Pro(100-999), Max(≥1000)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}