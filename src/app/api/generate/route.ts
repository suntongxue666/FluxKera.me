import { NextRequest, NextResponse } from 'next/server'
import { generateImage, validateParams, normalizeParams, getEstimatedTime } from '@/lib/replicate'
import { supabase } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, negative_prompt, width, height, guidance, num_steps, seed } = body // Add negative_prompt

    // 基本验证
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid prompt is required' },
        { status: 400 }
      )
    }

    // 构建参数对象
    const params = {
      prompt,
      negative_prompt: negative_prompt || undefined, // Add negative_prompt
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      guidance: guidance ? Number(guidance) : undefined,
      num_steps: num_steps ? Number(num_steps) : undefined,
      seed: seed ? Number(seed) : undefined,
    }

    // 验证参数
    const validation = validateParams(params)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      )
    }

    // 标准化参数
    const normalizedParams = normalizeParams(params)

    // 用户认证和积分检查
    const cookieStore = cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // 检查用户是否已登录
    const { data: { session } } = await supabaseServer.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // 获取用户信息
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
      
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // 检查用户积分
    if (user.credits < 10) {
      return NextResponse.json(
        { success: false, error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    // 生成图片
    console.log('Starting image generation...')
    const startTime = Date.now()
    
    let imageUrl;
    
    // 检查是否有有效的API令牌，如果没有则使用示例图像
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === 'r8_dummy_token_for_development_only') {
      console.log('Using sample image (no valid API token)')
      // 使用公开可访问的示例图像URL
      imageUrl = 'https://images.unsplash.com/photo-1682687982501-1e58ab814714';
      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      // 使用实际API生成图像
      imageUrl = await generateImage(normalizedParams)
    }
    
    const generationTime = Date.now() - startTime
    console.log(`Image generated in ${generationTime}ms`)

    // 保存生成记录
    const { error: saveError } = await supabaseServer
      .from('generations')
      .insert({
        user_id: user.id,
        prompt: normalizedParams.prompt,
        image_url: imageUrl,
        credits_used: 10,
        created_at: new Date().toISOString()
      })
      
    if (saveError) {
      console.error('Error saving generation record:', saveError)
    }

    // 使用存储过程扣除用户积分并记录交易
    const { error: creditError } = await supabaseServer.rpc('decrement_user_credits', {
      user_id_param: user.id,
      amount: 10
    })
    
    if (creditError) {
      console.error('Error updating user credits:', creditError)
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      params: normalizedParams,
      generationTime: generationTime,
      estimatedTime: getEstimatedTime(normalizedParams.num_steps!),
      creditsUsed: 10,
      creditsRemaining: user.credits - 10
    })

  } catch (error: any) {
    console.error('Generation error:', error)
    
    // 处理不同类型的错误
    let errorMessage = 'Failed to generate image'
    let statusCode = 500
    
    if (error.message?.includes('Invalid parameters')) {
      errorMessage = error.message
      statusCode = 400
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again later.'
      statusCode = 429
    } else if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient API credits. Please contact support.'
      statusCode = 402
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    )
  }
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    model: 'FLUX.1 Krea Dev',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}