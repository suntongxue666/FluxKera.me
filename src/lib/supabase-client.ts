import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// 创建Supabase客户端
export const supabase = createClientComponentClient()

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