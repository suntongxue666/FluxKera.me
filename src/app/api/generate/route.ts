import { NextRequest, NextResponse } from 'next/server'
import { generateImage, validateParams, normalizeParams, getEstimatedTime } from '@/lib/replicate'
import { createClient } from '@supabase/supabase-js'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 使用服务端密钥创建Supabase客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

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

    // 用户认证 - 仅使用token认证
    console.log('=== GENERATE API AUTH (TOKEN ONLY) ===')
    
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    
    console.log('Auth header present:', !!authHeader)
    console.log('Access token present:', !!accessToken)
    
    if (!accessToken) {
      console.log('No access token provided')
      return NextResponse.json(
        { success: false, error: 'Authentication required - please provide access token' },
        { status: 401 }
      )
    }
    
    // 使用服务端客户端验证token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)
    
    if (authError || !user) {
      console.error('Token authentication failed:', authError?.message)
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }
    
    console.log('User authenticated via token:', user.id, user.email)
    
    // 获取用户信息
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
      
    let finalUser = dbUser
    
    if (userError || !dbUser) {
      console.log('User not found in database, creating new user...', userError?.code)
      
      // 如果用户不存在，创建新用户
      if (userError?.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            google_id: user.user_metadata?.sub || user.id,
            credits: 20, // 新用户获得20积分
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single()
          
        if (createError) {
          console.error('Failed to create user:', createError)
          return NextResponse.json(
            { success: false, error: 'Failed to create user account' },
            { status: 500 }
          )
        }
        
        finalUser = newUser
        console.log('New user created successfully:', newUser.id)
      } else {
        // 其他数据库错误
        console.error('Database error:', userError)
        return NextResponse.json(
          { success: false, error: 'Database error' },
          { status: 500 }
        )
      }
    }
    
    // 检查用户积分
    if (finalUser.credits < 10) {
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
    const { error: saveError } = await supabaseAdmin
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
    const { error: creditError } = await supabaseAdmin
      .from('users')
      .update({ 
        credits: finalUser.credits - 10,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (creditError) {
      console.error('Error updating user credits:', creditError)
    } else {
      console.log(`Successfully deducted 10 credits from user ${user.id}`)
    }
    
    // 记录积分交易
    const { error: transactionError } = await supabaseAdmin
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
    const { data: updatedUser, error: updatedUserError } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()
      
    const creditsRemaining = updatedUser && !updatedUserError ? updatedUser.credits : finalUser.credits - 10

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