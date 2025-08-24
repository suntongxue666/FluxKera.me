import { createClient } from '@supabase/supabase-js'

// 获取环境变量，如果不存在则使用默认值
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// 创建Supabase客户端，确保正确持久化session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// 如果没有设置环境变量，在控制台输出警告
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key not set. Using placeholder values. Some features may not work correctly.')
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          google_id: string
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          google_id: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          google_id?: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string
          prompt: string
          image_url: string
          credits_used: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          image_url: string
          credits_used: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          image_url?: string
          credits_used?: number
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: string
          credits_added: number
          amount: number
          paypal_order_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: string
          credits_added: number
          amount: number
          paypal_order_id: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: string
          credits_added?: number
          amount?: number
          paypal_order_id?: string
          status?: string
          created_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          description?: string
          created_at?: string
        }
      }
    }
  }
}