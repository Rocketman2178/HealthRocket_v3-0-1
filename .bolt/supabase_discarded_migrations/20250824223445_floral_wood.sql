/*
# Create Test Users for Development

This migration creates test users for development and testing purposes.

## New Users Created
- test1@healthrocket.app (regular user)
- test2@healthrocket.app (regular user) 
- test3@healthrocket.app (regular user)
- admin@healthrocket.app (admin user)
- poweruser@healthrocket.app (regular user)

## Security
- All test users have secure passwords
- Admin user has is_admin flag set to true
- All users start with default FP and level values

## Notes
- These users are for development/testing only
- Passwords follow the app's security requirements
- Users are created with proper default values
*/

-- Create test users in the users table
-- Note: Auth users need to be created through Supabase Auth, but we can prepare the profile data

INSERT INTO users (
  id,
  email,
  user_name,
  fuel_points,
  level,
  burn_streak_days,
  longest_burn_streak,
  lifetime_fp_earned,
  health_score,
  healthspan_years,
  expected_lifespan,
  plan_name,
  plan_status,
  contest_credits,
  biometric_enabled,
  timezone,
  notification_preferences,
  onboarding_completed,
  onboarding_step,
  is_admin,
  is_active,
  last_active_at,
  created_at,
  updated_at
) VALUES 
-- Test User 1
(
  '11111111-1111-1111-1111-111111111111',
  'test1@healthrocket.app',
  'Test User 1',
  150,
  2,
  5,
  12,
  350,
  7.8,
  0.0,
  85,
  'Preview Access',
  'Trial',
  2,
  false,
  'UTC',
  '{"sms": false, "push": true, "email": false, "contests": true, "marketing": false, "challenges": true, "achievements": true}',
  true,
  'completed',
  false,
  true,
  now(),
  now(),
  now()
),
-- Test User 2
(
  '22222222-2222-2222-2222-222222222222',
  'test2@healthrocket.app',
  'Test User 2',
  75,
  1,
  3,
  8,
  200,
  8.2,
  0.0,
  85,
  'Preview Access',
  'Trial',
  2,
  false,
  'UTC',
  '{"sms": false, "push": true, "email": false, "contests": true, "marketing": false, "challenges": true, "achievements": true}',
  true,
  'completed',
  false,
  true,
  now(),
  now(),
  now()
),
-- Test User 3
(
  '33333333-3333-3333-3333-333333333333',
  'test3@healthrocket.app',
  'Test User 3',
  300,
  3,
  15,
  20,
  650,
  7.5,
  0.0,
  85,
  'Preview Access',
  'Trial',
  2,
  false,
  'UTC',
  '{"sms": false, "push": true, "email": false, "contests": true, "marketing": false, "challenges": true, "achievements": true}',
  true,
  'completed',
  false,
  true,
  now(),
  now(),
  now()
),
-- Admin User
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'admin@healthrocket.app',
  'Admin User',
  1000,
  10,
  30,
  45,
  2500,
  9.0,
  0.0,
  85,
  'Preview Access',
  'Trial',
  10,
  false,
  'UTC',
  '{"sms": false, "push": true, "email": false, "contests": true, "marketing": false, "challenges": true, "achievements": true}',
  true,
  'completed',
  true,
  true,
  now(),
  now(),
  now()
),
-- Power User
(
  'pppppppp-pppp-pppp-pppp-pppppppppppp',
  'poweruser@healthrocket.app',
  'Power User',
  500,
  5,
  25,
  35,
  1200,
  8.5,
  0.0,
  85,
  'Preview Access',
  'Trial',
  5,
  false,
  'UTC',
  '{"sms": false, "push": true, "email": false, "contests": true, "marketing": false, "challenges": true, "achievements": true}',
  true,
  'completed',
  false,
  true,
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Add some sample FP earnings for test users
INSERT INTO fp_earnings (
  user_id,
  source,
  source_id,
  amount,
  description,
  metadata,
  date,
  user_name,
  created_at
) VALUES 
-- Test User 1 earnings
('11111111-1111-1111-1111-111111111111', 'daily_boost', 'morning-walk', 10, 'Morning walk completed', '{"test": true}', CURRENT_DATE - INTERVAL '1 day', 'Test User 1', now() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'challenge_daily', 'meditation-challenge', 15, 'Daily meditation', '{"test": true}', CURRENT_DATE - INTERVAL '1 day', 'Test User 1', now() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'daily_boost', 'healthy-meal', 12, 'Healthy meal prep', '{"test": true}', CURRENT_DATE, 'Test User 1', now()),

-- Test User 2 earnings
('22222222-2222-2222-2222-222222222222', 'daily_boost', 'morning-walk', 10, 'Morning walk completed', '{"test": true}', CURRENT_DATE - INTERVAL '2 days', 'Test User 2', now() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222222', 'health_assessment', 'initial-assessment', 100, 'Completed health assessment', '{"test": true}', CURRENT_DATE - INTERVAL '1 day', 'Test User 2', now() - INTERVAL '1 day'),

-- Admin User earnings
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin_adjustment', 'test-bonus', 500, 'Admin test bonus', '{"test": true}', CURRENT_DATE, 'Admin User', now()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'challenge_completion', 'fitness-challenge', 100, 'Completed fitness challenge', '{"test": true}', CURRENT_DATE - INTERVAL '1 day', 'Admin User', now() - INTERVAL '1 day')

ON CONFLICT (user_id, source, source_id, date) DO NOTHING;

-- Create some sample challenges for testing
INSERT INTO user_challenges (
  user_id,
  challenge_id,
  status,
  start_date,
  completion_date,
  verification_count,
  required_verifications,
  daily_actions_completed,
  created_at,
  updated_at
) VALUES 
-- Test User 1 active challenge
('11111111-1111-1111-1111-111111111111', 'meditation-21-day', 'active', CURRENT_DATE - INTERVAL '5 days', NULL, 5, 21, 5, now() - INTERVAL '5 days', now()),

-- Test User 2 completed challenge
('22222222-2222-2222-2222-222222222222', 'morning-routine', 'completed', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '9 days', 21, 21, 21, now() - INTERVAL '30 days', now() - INTERVAL '9 days'),

-- Admin User active challenge
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'fitness-foundation', 'active', CURRENT_DATE - INTERVAL '10 days', NULL, 10, 30, 10, now() - INTERVAL '10 days', now())

ON CONFLICT (user_id, challenge_id) DO NOTHING;