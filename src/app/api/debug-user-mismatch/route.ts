import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 使用服务端密钥创建Supabase客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_SECRET!
)

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG USER MISMATCH ===')
    
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token provided'
      })
    }
    
    // 使用服务端客户端验证token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        authError: authError?.message
      })
    }
    
    console.log('Auth user from token:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    })
    
    // 查询数据库中的所有用户，看看是否有匹配的email
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', user.email)
      
    console.log('Users with matching email:', allUsers?.length || 0)
    allUsers?.forEach(dbUser => {
      console.log(`DB User: ${dbUser.email} (ID: ${dbUser.id}) - Credits: ${dbUser.credits}`)
    })
    
    // 查询数据库中是否有匹配ID的用户
    const { data: userById, error: userByIdError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
      
    console.log('User by ID match:', !!userById)
    if (userById) {
      console.log('Matched user:', { id: userById.id, email: userById.email, credits: userById.credits })
    }
    
    return NextResponse.json({
      success: true,
      authUser: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      usersWithMatchingEmail: allUsers?.map(u => ({
        id: u.id,
        email: u.email,
        credits: u.credits,
        created_at: u.created_at
      })) || [],
      userByIdMatch: userById ? {
        id: userById.id,
        email: userById.email,
        credits: userById.credits,
        created_at: userById.created_at
      } : null,
      diagnosis: {
        emailMatches: (allUsers?.length || 0) > 0,
        idMatches: !!userById,
        issue: !userById ? 'ID_MISMATCH' : 'NO_ISSUE'
      }
    })
    
  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}