import { supabase } from '../lib/supabase/client';

export interface LaunchCodeValidationResult {
  valid: boolean;
  communityName?: string;
  planName?: string;
  error?: string;
  hasAutoEnroll?: boolean;
  usageCount?: number;
  usageLimit?: number;
}

export async function validateLaunchCode(code: string): Promise<LaunchCodeValidationResult> {
  if (!code || code.trim().length === 0) {
    return {
      valid: false,
      error: 'Launch code is required'
    };
  }

  try {
    // Use the existing RPC function to validate launch codes
    const { data, error } = await supabase.rpc('validate_launch_code', {
      p_code: code.trim().toUpperCase()
    });

    if (error) {
      return {
        valid: false,
        error: 'Unable to validate launch code'
      };
    }

    if (!data) {
      return {
        valid: false,
        error: 'Invalid launch code'
      };
    }

    return {
      valid: data.valid,
      communityName: data.community_name,
      planName: data.default_plan,
      hasAutoEnroll: data.has_community,
      error: data.error
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Network error - please try again'
    };
  }
}

export function getSpecialCodeInfo(code: string): { 
  description: string; 
  benefits: string[]; 
  rarity: 'common' | 'rare' | 'epic' | 'legendary' 
} {
  const upperCode = code.toUpperCase();
  
  // Special codes with enhanced benefits
  const specialCodes: Record<string, any> = {
    'FOUNDERS': {
      description: 'Founding Member Access',
      benefits: [
        'Lifetime premium features',
        'Exclusive founder community',
        '1000 bonus Fuel Points',
        'Priority support',
        'Beta feature access'
      ],
      rarity: 'legendary'
    },
    'LAUNCH100': {
      description: 'Launch Week Special',
      benefits: [
        'Premium access for 6 months',
        '500 bonus Fuel Points',
        'Launch community access',
        'Special launch badge'
      ],
      rarity: 'epic'
    },
    'BETA2024': {
      description: 'Beta Tester Access',
      benefits: [
        'Beta community access',
        '250 bonus Fuel Points',
        'Early feature previews',
        'Beta tester badge'
      ],
      rarity: 'rare'
    },
    'HEALTH100': {
      description: 'Health Enthusiast',
      benefits: [
        'Health community access',
        '100 bonus Fuel Points',
        'Health tracking features'
      ],
      rarity: 'common'
    }
  };

  return specialCodes[upperCode] || {
    description: 'Community Access',
    benefits: ['Community access', 'Standard features'],
    rarity: 'common'
  };
}

export function formatLaunchCode(code: string): string {
  return code.toUpperCase().replace(/\s/g, '');
}

export function isValidLaunchCodeFormat(code: string): boolean {
  // Launch codes should be 3-20 characters, alphanumeric only
  const regex = /^[A-Z0-9]{3,20}$/;
  return regex.test(code.toUpperCase());
}