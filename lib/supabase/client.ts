import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Configure storage based on platform
const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
})

// Export types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      fp_earnings: {
        Row: FPEarning
        Insert: Omit<FPEarning, 'id' | 'created_at'>
        Update: Partial<Omit<FPEarning, 'id' | 'created_at'>>
      }
      user_challenges: {
        Row: UserChallenge
        Insert: Omit<UserChallenge, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserChallenge, 'created_at'>>
      }
      challenge_library: {
        Row: Challenge
        Insert: Omit<Challenge, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Challenge, 'created_at'>>
      }
      contests: {
        Row: Contest
        Insert: Omit<Contest, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Contest, 'created_at'>>
      }
      chat_messages: {
        Row: ChatMessage
        Insert: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at'>>
      }
    }
    Functions: {
      earn_fuel_points: {
        Args: {
          p_user_id: string
          p_source: string
          p_amount: number
          p_source_id?: string
          p_metadata?: any
        }
        Returns: {
          success: boolean
          new_total: number
          amount_earned: number
          new_level: number
          level_up: boolean
          burn_streak: number
        }
      }
      get_user_dashboard: {
        Args: { p_user_id: string }
        Returns: any
      }
      complete_daily_boost: {
        Args: {
          p_user_id: string
          p_boost_id: string
          p_verification_data?: any
        }
        Returns: {
          success: boolean
          boost_title: string
          fp_earned: number
          next_available: string
        }
      }
      validate_launch_code: {
        Args: { p_code: string }
        Returns: {
          valid: boolean
          community_id?: string
          community_name?: string
          has_community: boolean
          default_plan: string
          error?: string
        }
      }
      use_launch_code: {
        Args: {
          p_user_id: string
          p_code: string
        }
        Returns: {
          success: boolean
          community_enrolled: boolean
          community_name?: string
        }
      }
    }
  }
}

// Type definitions for your database entities
export interface User {
  id: string
  email: string
  user_name: string
  fuel_points: number
  level: number
  burn_streak_days: number
  longest_burn_streak: number
  lifetime_fp_earned: number
  health_score: number
  healthspan_years: number
  expected_lifespan: number
  plan_name: string
  plan_status: string
  contest_credits: number
  device_token?: string
  biometric_enabled: boolean
  timezone: string
  notification_preferences: any
  onboarding_completed: boolean
  onboarding_step: string
  is_admin: boolean
  is_active: boolean
  vital_user_id?: string
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface FPEarning {
  id: string
  user_id: string
  source: 'daily_boost' | 'challenge_daily' | 'challenge_completion' | 'quest_weekly' | 'quest_completion' | 'health_assessment' | 'contest_verification' | 'boost_code' | 'streak_bonus' | 'level_bonus'
  source_id?: string
  amount: number
  description?: string
  metadata?: any
  date: string
  user_name?: string
  created_at: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  instructions?: string
  duration_days: number
  daily_fp_reward: number
  completion_fp_bonus: number
  tier: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  requires_verification: boolean
  requires_photo: boolean
  requires_device_data: boolean
  verification_instructions?: string
  category: 'Mindset' | 'Sleep' | 'Exercise' | 'Nutrition' | 'Biohacking'
  tags?: string[]
  is_active: boolean
  is_daily: boolean
  min_level: number
  max_level?: number
  created_at: string
  updated_at: string
}

export interface UserChallenge {
  user_id: string
  challenge_id: string
  status: 'active' | 'completed' | 'failed' | 'abandoned'
  start_date: string
  completion_date?: string
  verification_count: number
  required_verifications: number
  daily_actions_completed: number
  last_photo_submission?: string
  offline_progress?: any
  created_at: string
  updated_at: string
}

export interface Contest {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  registration_deadline?: string
  entry_cost: number
  prize_pool: number
  max_participants?: number
  verifications_required: number
  status: 'upcoming' | 'registration_open' | 'active' | 'completed' | 'cancelled'
  participant_count: number
  winner_percentage: number
  prize_distribution?: any
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  chat_id: string
  user_id: string
  user_name: string
  message: string
  message_type: 'text' | 'image' | 'verification' | 'system'
  parent_message_id?: string
  reply_count: number
  is_verification: boolean
  is_system_message: boolean
  is_pinned: boolean
  media_url?: string
  media_type?: 'image' | 'video' | 'document'
  is_deleted: boolean
  is_hidden: boolean
  reported_count: number
  created_at: string
  updated_at: string
}