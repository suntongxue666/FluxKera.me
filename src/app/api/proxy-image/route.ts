import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 从URL参数中获取图片URL
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      )
    }
    
    // 获取图片
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      )
    }
    
    // 获取图片数据
    const imageData = await response.arrayBuffer()
    
    // 获取内容类型
    const contentType = response.headers.get('content-type') || 'image/png'
    
    // 返回图片
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error: any) {
    console.error('Error proxying image:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to proxy image' },
      { status: 500 }
    )
  }
}