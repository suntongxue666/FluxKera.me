import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { width: string; height: string } }
) {
  const width = parseInt(context.params.width || '800')
  const height = parseInt(context.params.height || '600')
  
  // 验证尺寸
  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0 || width > 3000 || height > 3000) {
    return new NextResponse('Invalid dimensions', { status: 400 })
  }

  // 生成SVG占位图
  const svg = generatePlaceholderSVG(width, height)
  
  // 返回SVG图像
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}

function generatePlaceholderSVG(width: number, height: number): string {
  // 生成随机渐变色
  const colors = [
    ['#4F46E5', '#7C3AED'], // 蓝紫
    ['#2563EB', '#7C3AED'], // 蓝紫
    ['#0EA5E9', '#6366F1'], // 蓝色
    ['#0891B2', '#4F46E5'], // 青蓝
    ['#0D9488', '#0EA5E9'], // 青色
    ['#059669', '#0D9488'], // 绿青
    ['#16A34A', '#059669'], // 绿色
    ['#65A30D', '#16A34A'], // 黄绿
    ['#CA8A04', '#65A30D'], // 黄色
    ['#D97706', '#CA8A04'], // 橙黄
    ['#EA580C', '#D97706'], // 橙色
    ['#DC2626', '#EA580C'], // 红橙
    ['#E11D48', '#DC2626'], // 红色
    ['#DB2777', '#E11D48'], // 红粉
    ['#C026D3', '#DB2777'], // 粉紫
    ['#7C3AED', '#C026D3'], // 紫色
  ]
  
  // 随机选择一个渐变色
  const colorPair = colors[Math.floor(Math.random() * colors.length)]
  
  // 生成一些随机形状
  const shapes = []
  const numShapes = Math.floor(Math.random() * 5) + 3
  
  for (let i = 0; i < numShapes; i++) {
    const shapeType = Math.random() > 0.5 ? 'circle' : 'rect'
    
    if (shapeType === 'circle') {
      const cx = Math.floor(Math.random() * width)
      const cy = Math.floor(Math.random() * height)
      const r = Math.floor(Math.random() * Math.min(width, height) * 0.2) + 10
      const opacity = (Math.random() * 0.5 + 0.1).toFixed(2)
      
      shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" opacity="${opacity}" />`)
    } else {
      const x = Math.floor(Math.random() * width)
      const y = Math.floor(Math.random() * height)
      const w = Math.floor(Math.random() * (width - x) * 0.8) + 20
      const h = Math.floor(Math.random() * (height - y) * 0.8) + 20
      const opacity = (Math.random() * 0.5 + 0.1).toFixed(2)
      
      shapes.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" opacity="${opacity}" />`)
    }
  }
  
  // 创建SVG
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorPair[0]}" />
        <stop offset="100%" stop-color="${colorPair[1]}" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#grad)" />
    ${shapes.join('\n    ')}
  </svg>`
}