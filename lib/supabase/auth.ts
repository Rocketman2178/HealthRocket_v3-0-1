import React from 'react'
import { supabase } from './client'

export interface AuthResponse {
  success: boolean
  error?: string
  data?: any
}

export async function signUp(
  email: string,
  password: string,
  userName: string,
  launchCode?: string
): Promise<AuthResponse> {
  try {
    // Validate launch code if provided
    if (launchCode?.trim()) {
      const { data: codeValidation } = await supabase.rpc('validate_launch_code', {
        p_code: launchCode
      })
      
      if (!codeValidation?.valid) {
        return {
          success: false,
          error: 'Invalid launch code. Please check your code and try again.'
        }
      }
    }

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: userName,
          launch_code: launchCode
        }
      }
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // Create user profile in public.users table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          user_name: userName,
          fuel_points: 0,
          level: 1,
          burn_streak_days: 0,
          longest_burn_streak: 0,
          lifetime_fp_earned: 0,
          health_score: 7.8,
          healthspan_years: 0.0,
          expected_lifespan: 85,
          plan_name: 'Preview Access',
          plan_status: 'Trial',
          contest_credits: 2,
          biometric_enabled: false,
          timezone: 'UTC',
          notification_preferences: {
            sms: false,
            push: true,
            email: false,
            contests: true,
            marketing: false,
            challenges: true,
            achievements: true
          },
          onboarding_completed: false,
          onboarding_step: 'welcome',
          is_admin: false,
          is_active: true,
          last_active_at: new Date().toISOString()
        })

      if (profileError) {
        return {
          success: false,
          error: `Profile creation failed: ${profileError.message}. Please ensure you have proper permissions or contact support.`
        }
      }
    }

    // If auth user created successfully and has launch code, use it
    if (data.user && launchCode?.trim()) {
      await supabase.rpc('use_launch_code', {
        p_user_id: data.user.id,
        p_code: launchCode
      })
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during signup'
    }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during sign in'
    }
  }
}

export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during sign out'
    }
  }
}

export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'healthrocket://reset-password'
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during password reset'
    }
  }
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Auth hook for React components
export function useAuth() {
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const isMountedRef = React.useRef(true)

  React.useEffect(() => {
    isMountedRef.current = true
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMountedRef.current) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMountedRef.current) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      isMountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}