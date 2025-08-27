import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  google_id: string
  avatar_url: string | null
  credits: number
  subscription_id?: string | null
  subscription_plan?: string | null
  subscription_status?: string | null
  subscription_expires_at?: string | null
  created_at: string
  updated_at: string
}

export async function signInWithGoogle() {
  if (!supabase || !supabase.auth || typeof supabase.auth.signInWithOAuth !== 'function') {
    console.warn('Supabase auth client not initialized. Cannot sign in with Google.');
    return null;
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export async function signOut() {
  if (!supabase || !supabase.auth || typeof supabase.auth.signOut !== 'function') {
    console.warn('Supabase auth client not initialized. Cannot sign out.');
    return;
  }
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase || !supabase.auth || typeof supabase.auth.getUser !== 'function') {
    console.warn('Supabase auth client not initialized. Cannot get current user.');
    return null;
  }
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Error fetching auth user:', authError);
      return null;
    }
    if (!user) return null
    
    // 特殊处理sunwei7482@gmail.com用户
    const isResetUser = user.email === 'sunwei7482@gmail.com';
    if (isResetUser) {
      console.log('重置用户登录:', user.email);
      return createOrUpdateUser(user);
    }
    
    // Get user data from our users table
    if (!supabase.from || typeof supabase.from !== 'function') {
      console.warn('Supabase client not fully initialized. Cannot fetch user data from table.');
      return null;
    }
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching user data:', error)
      // 如果用户不存在，创建新用户
      if (error.code === 'PGRST116') {
        return createOrUpdateUser(user)
      }
      return null
    }
    
    // 确保用户有Google头像信息和ID
    let needsUpdate = false;
    let updateData: any = {};
    
    if (!userData.google_id && user.user_metadata?.sub) {
      updateData.google_id = user.user_metadata.sub;
      needsUpdate = true;
    }
    
    // 检查并更新头像URL
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    if (avatarUrl && (!userData.avatar_url || userData.avatar_url !== avatarUrl)) {
      updateData.avatar_url = avatarUrl;
      userData.avatar_url = avatarUrl;
      needsUpdate = true;
      console.log('更新用户头像:', avatarUrl);
    }
    
    if (needsUpdate) {
      await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);
    }
    
    return userData
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function createOrUpdateUser(authUser: any): Promise<User | null> {
  if (!supabase || typeof supabase.from !== 'function') {
    console.warn('Supabase client not fully initialized. Cannot create or update user.');
    return null; // Return null if supabase.from is not available
  }
  try {
    // 检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    // 如果是新用户或者是内测账号（需要重置），则设置积分为20
    const isNewUser = checkError || !existingUser;
    const isResetUser = authUser.email === 'sunwei7482@gmail.com' || authUser.email === 'tiktreeapp@gmail.com';
    
    // 获取Google头像URL
    const avatarUrl = authUser.user_metadata?.avatar_url || 
                     authUser.user_metadata?.picture || 
                     null;
    
    console.log('用户元数据:', authUser.user_metadata);
    console.log('头像URL:', avatarUrl);
    
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        email: authUser.email,
        google_id: authUser.user_metadata?.sub || authUser.id,
        avatar_url: avatarUrl,
        credits: (isNewUser || isResetUser) ? 20 : existingUser?.credits || 20, // 新用户或重置用户获得20积分
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    
    // 如果是重置用户，记录一条积分交易
    if (isResetUser && !isNewUser) {
      await supabase.from('credit_transactions').insert({
        user_id: authUser.id,
        type: 'credit',
        amount: 20,
        description: '用户积分重置',
        created_at: new Date().toISOString()
      });
    }
    
    return data as User; // Explicitly cast data to User type
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return null
  }
}

export async function updateUserCredits(userId: string, credits: number): Promise<boolean> {
  if (!supabase || typeof supabase.from !== 'function') {
    console.warn('Supabase client not fully initialized. Cannot update user credits.');
    return false; // Return false if supabase.from is not available
  }
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        credits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating user credits:', error)
    return false
  }
}
