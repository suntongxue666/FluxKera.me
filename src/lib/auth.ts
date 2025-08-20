import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  google_id: string
  credits: number
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
      return null
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
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        email: authUser.email,
        google_id: authUser.user_metadata?.sub || authUser.id,
        credits: 20, // Default credits for new users
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
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
