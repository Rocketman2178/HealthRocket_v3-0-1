/*
  # Complete User Authentication

  This migration ensures the user clay@healthrocket.life is properly set up in the database
  with all required fields and permissions to run test functions.

  1. User Profile Setup
    - Ensures user exists in users table with proper defaults
    - Sets up all required fields for testing
    - Enables proper permissions

  2. Initial Data
    - Adds some initial FP earnings for testing
    - Sets up proper user state for comprehensive testing
*/

-- Ensure the user exists in the users table with proper setup
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
  health_assessment_available,
  health_assessments_completed,
  plan_name,
  plan_status,
  contest_credits,
  device_token,
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
)
SELECT 
  au.id,
  'clay@healthrocket.life',
  'Clay Test User',
  100,
  2,
  5,
  10,
  250,
  8.2,
  75.5,
  85,
  true,
  1,
  'Preview Access',
  'Trial',
  2,
  null,
  false,
  'UTC',
  '{"sms": false, "push": true, "email": false, "contests": true, "marketing": false, "challenges": true, "achievements": true}'::jsonb,
  true,
  'completed',
  false,
  true,
  now(),
  now(),
  now()
FROM auth.users au 
WHERE au.email = 'clay@healthrocket.life'
ON CONFLICT (id) 
DO UPDATE SET
  user_name = EXCLUDED.user_name,
  fuel_points = EXCLUDED.fuel_points,
  level = EXCLUDED.level,
  burn_streak_days = EXCLUDED.burn_streak_days,
  longest_burn_streak = EXCLUDED.longest_burn_streak,
  lifetime_fp_earned = EXCLUDED.lifetime_fp_earned,
  health_score = EXCLUDED.health_score,
  healthspan_years = EXCLUDED.healthspan_years,
  onboarding_completed = EXCLUDED.onboarding_completed,
  onboarding_step = EXCLUDED.onboarding_step,
  is_active = EXCLUDED.is_active,
  last_active_at = now(),
  updated_at = now();

-- Add some initial FP earnings for testing
INSERT INTO fp_earnings (
  user_id,
  source,
  source_id,
  amount,
  description,
  metadata,
  date,
  user_name
)
SELECT 
  au.id,
  'admin_adjustment',
  'initial_setup',
  100,
  'Initial setup for testing',
  '{"setup": true, "test_user": true}'::jsonb,
  CURRENT_DATE,
  'Clay Test User'
FROM auth.users au 
WHERE au.email = 'clay@healthrocket.life'
ON CONFLICT (user_id, source, source_id, date) DO NOTHING;

-- Add a sample health assessment
INSERT INTO health_assessments (
  user_id,
  mindset_score,
  sleep_score,
  exercise_score,
  nutrition_score,
  biohacking_score,
  overall_health_score,
  healthspan_years,
  expected_lifespan,
  assessment_version,
  responses,
  recommendations,
  fp_earned
)
SELECT 
  au.id,
  8.0,
  7.5,
  8.5,
  7.0,
  6.5,
  7.5,
  75.5,
  85,
  '1.0',
  '{"test_setup": true, "mindset": {"stress_level": 3, "happiness": 8}, "sleep": {"hours": 7.5, "quality": 8}}'::jsonb,
  '{"focus_areas": ["nutrition", "biohacking"], "suggestions": ["Increase omega-3 intake", "Try cold exposure therapy"]}'::jsonb,
  50
FROM auth.users au 
WHERE au.email = 'clay@healthrocket.life'
AND NOT EXISTS (
  SELECT 1 FROM health_assessments ha 
  WHERE ha.user_id = au.id
);

-- Ensure user has proper daily FP summary
INSERT INTO daily_fp_summary (
  user_id,
  date,
  total_fp,
  sources_count,
  first_earn_time,
  last_earn_time
)
SELECT 
  au.id,
  CURRENT_DATE,
  100,
  1,
  now() - interval '2 hours',
  now() - interval '1 hour'
FROM auth.users au 
WHERE au.email = 'clay@healthrocket.life'
ON CONFLICT (user_id, date) 
DO UPDATE SET
  total_fp = EXCLUDED.total_fp,
  sources_count = EXCLUDED.sources_count,
  last_earn_time = EXCLUDED.last_earn_time;

-- Add monthly FP totals for current month
INSERT INTO monthly_fp_totals (
  user_id,
  year,
  month,
  total_fp,
  user_name,
  hero_status,
  legend_status
)
SELECT 
  au.id,
  EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  EXTRACT(MONTH FROM CURRENT_DATE)::integer,
  100,
  'Clay Test User',
  false,
  false
FROM auth.users au 
WHERE au.email = 'clay@healthrocket.life'
ON CONFLICT (user_id, year, month) 
DO UPDATE SET
  total_fp = EXCLUDED.total_fp,
  user_name = EXCLUDED.user_name;