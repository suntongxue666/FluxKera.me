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

    // 暂时注释掉用户认证和积分检查
    // const cookieStore = cookies()
    // const supabaseServer = createServerClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    //   {
    //     cookies: {
    //       get(name: string) {
    //         return cookieStore.get(name)?.value
    //       },
    //       set(name: string, value: string, options: any) {
    //         cookieStore.set({ name, value, ...options })
    //       },
    //       remove(name: string, options: any) {
    //         cookieStore.set({ name, value: '', ...options })
    //       },
    //     },
    //   }
    // )
    
    // // 检查用户是否已登录
    // const { data: { session } } = await supabaseServer.auth.getSession()
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, error: 'Authentication required' },
    //     { status: 401 }
    //   )
    // }
    
    // // 获取用户信息
    // const { data: user, error: userError } = await supabaseServer
    //   .from('users')
    //   .select('*')
    //   .eq('id', session.user.id)
    //   .single()
      
    // if (userError || !user) {
    //   return NextResponse.json(
    //     { success: false, error: 'User not found' },
    //     { status: 404 }
    //   )
    // }
    
    // // 检查用户积分
    // if (user.credits < 10) {
    //   return NextResponse.json(
    //     { success: false, error: 'Insufficient credits' },
    //     { status: 402 }
    //   )
    // }

    // 生成图片
    console.log('Starting image generation...')
    const startTime = Date.now()
    
    const imageUrl = await generateImage(normalizedParams)
    
    const generationTime = Date.now() - startTime
    console.log(`Image generated in ${generationTime}ms`)

    // 暂时注释掉保存生成记录、扣除积分和记录积分交易的逻辑
    // const { error: saveError } = await supabaseServer
    //   .from('generations')
    //   .insert({
    //     user_id: user.id,
    //     prompt: normalizedParams.prompt,
    //     image_url: imageUrl,
    //     credits_used: 10,
    //     settings: {
    //       width: normalizedParams.width,
    //       height: normalizedParams.height,
    //       guidance: normalizedParams.guidance,
    //       num_steps: normalizedParams.num_steps,
    //       seed: normalizedParams.seed,
    //     }
    //   })
      
    // if (saveError) {
    //   console.error('Error saving generation record:', saveError)
    // }

    // // 扣除用户积分
    // const { error: creditError } = await supabaseServer
    //   .from('users')
    //   .update({ 
    //     credits: user.credits - 10,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', user.id)
      
    // if (creditError) {
    //   console.error('Error updating user credits:', creditError)
    // }

    // // 记录积分交易
    // const { error: transactionError } = await supabaseServer
    //   .from('credit_transactions')
    //   .insert({
    //     user_id: user.id,
    //     type: 'debit',
    //     amount: -10,
    //     description: `Image generation: "${normalizedParams.prompt.substring(0, 50)}${normalizedParams.prompt.length > 50 ? '...' : ''}"`
    //   })
      
    // if (transactionError) {
    //   console.error('Error recording credit transaction:', transactionError)
    // }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      params: normalizedParams,
      generationTime: generationTime,
      estimatedTime: getEstimatedTime(normalizedParams.num_steps!),
      creditsUsed: 10
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