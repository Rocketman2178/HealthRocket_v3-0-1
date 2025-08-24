import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, userName: string, launchCode?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle user profile creation/updates on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create user profile if it doesn't exist
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            user_name: user.user_metadata?.user_name || user.email?.split('@')[0] || 'User',
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
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
          });

        if (error) {
          console.error('Error creating user profile:', error);
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userName: string, 
    launchCode?: string
  ): Promise<AuthResult> => {
    try {
      // Validate launch code if provided
      if (launchCode?.trim()) {
        const { data: codeValidation } = await supabase.rpc('validate_launch_code', {
          p_code: launchCode.trim().toUpperCase()
        });
        
        if (!codeValidation?.valid) {
          return {
            success: false,
            error: 'Invalid launch code. Please check your code and try again.',
          };
        }
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            user_name: userName.trim(),
            launch_code: launchCode?.trim(),
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Use launch code if provided and user was created
      if (data.user && launchCode?.trim()) {
        await supabase.rpc('use_launch_code', {
          p_user_id: data.user.id,
          p_code: launchCode.trim().toUpperCase(),
        });
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}