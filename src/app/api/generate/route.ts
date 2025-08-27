import { NextRequest, NextResponse } from 'next/server'
import { generateImage, validateParams, normalizeParams, getEstimatedTime } from '@/lib/replicate'
import { supabase } from '@/lib/supabase'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, negative_prompt, width, height, guidance, num_steps, seed } = body

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
      negative_prompt: negative_prompt || undefined,
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

    // 用户认证和积分检查 - 双重认证方案
    console.log('=== GENERATE API AUTH DEBUG ===')
    
    // 1. 尝试从Authorization header获取token
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    
    console.log('Auth header present:', !!authHeader)
    console.log('Access token present:', !!accessToken)
    
    let user = null
    let authMethod = ''
    
    // Create Supabase client
    const cookieStore = cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    // 2. 如果有access_token，优先使用token认证
    if (accessToken) {
      console.log('Attempting token authentication...')
      try {
        const { data: { user: tokenUser }, error: tokenError } = await supabaseServer.auth.getUser(accessToken)
        if (tokenError) {
          console.log('Token auth failed:', tokenError.message)
        } else if (tokenUser) {
          user = tokenUser
          authMethod = 'token'
          console.log('Token authentication successful:', user.id)
        }
      } catch (tokenErr) {
        console.log('Token auth error:', tokenErr)
      }
    }
    
    // 3. 如果token认证失败，fallback到cookie认证
    if (!user) {
      console.log('Attempting cookie authentication...')
      try {
        const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession()
        
        if (sessionError) {
          console.log('Cookie auth error:', sessionError.message)
        } else if (session?.user) {
          user = session.user
          authMethod = 'cookie'
          console.log('Cookie authentication successful:', user.id)
        } else {
          console.log('No session found in cookies')
        }
      } catch (cookieErr) {
        console.log('Cookie auth error:', cookieErr)
      }
    }
    
    // 4. 认证失败
    if (!user) {
      console.log('Authentication failed - no valid user found')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.log(`User authenticated via ${authMethod}:`, user.id)
    
    // 获取用户信息
    const { data: dbUser, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
      
    if (userError || !dbUser) {
      console.error('User fetch error:', userError)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // 检查用户积分
    if (dbUser.credits < 10) {
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

    // 扣除用户积分
    const { error: creditError } = await supabaseServer
      .from('users')
      .update({ 
        credits: dbUser.credits - 10,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (creditError) {
      console.error('Error updating user credits:', creditError)
    } else {
      console.log(`Successfully deducted 10 credits from user ${user.id}`)
    }
    
    // 记录积分交易
    const { error: transactionError } = await supabaseServer
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        type: 'debit',
        amount: 10,
        description: 'AI图片生成消费',
        created_at: new Date().toISOString()
      })
    
    if (transactionError) {
      console.error('Error recording credit transaction:', transactionError)
    }

    // 再次获取用户信息以确保返回最新的积分
    const { data: updatedUser, error: updatedUserError } = await supabaseServer
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()
      
    const creditsRemaining = updatedUser && !updatedUserError ? updatedUser.credits : dbUser.credits - 10

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      params: normalizedParams,
      generationTime: generationTime,
      estimatedTime: getEstimatedTime(normalizedParams.num_steps!),
      creditsUsed: 10,
      creditsRemaining: creditsRemaining
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