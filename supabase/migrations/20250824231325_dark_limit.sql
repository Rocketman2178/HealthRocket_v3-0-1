/*
  # Create Test User with Direct Authentication

  1. New User Creation
    - Creates a new test user: testuser@healthrocket.app
    - Sets up proper authentication with known password
    - Creates corresponding profile in users table
  
  2. Authentication Setup
    - Direct password hash creation
    - Email confirmation bypass
    - Proper identity setup
  
  3. Test Data
    - Initial FP and profile data
    - Ready for all test functions
*/

-- First, let's create a test user with a simple password
-- Password will be: TestUser123!

DO $$
DECLARE
    new_user_id uuid;
    password_hash text;
BEGIN
    -- Generate a new UUID for the user
    new_user_id := gen_random_uuid();
    
    -- Create a simple password hash (this is a basic approach for testing)
    -- In production, Supabase handles this automatically
    password_hash := crypt('TestUser123!', gen_salt('bf'));
    
    -- Insert into auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token,
        aud,
        role,
        is_sso_user,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'testuser@healthrocket.app',
        password_hash,
        now(),
        now(),
        now(),
        '',
        '',
        '',
        '',
        'authenticated',
        'authenticated',
        false,
        '{"provider": "email", "providers": ["email"]}',
        '{"user_name": "Test User"}'
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = now(),
        updated_at = now();
    
    -- Get the user ID if it already existed
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'testuser@healthrocket.app';
    
    -- Insert into auth.identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        new_user_id,
        jsonb_build_object(
            'sub', new_user_id::text,
            'email', 'testuser@healthrocket.app',
            'email_verified', true
        ),
        'email',
        now(),
        now(),
        now()
    ) ON CONFLICT (provider, user_id) DO UPDATE SET
        identity_data = EXCLUDED.identity_data,
        last_sign_in_at = now(),
        updated_at = now();
    
    -- Create user profile in public.users
    INSERT INTO public.users (
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
        vital_user_id,
        last_active_at,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'testuser@healthrocket.app',
        'Test User',
        150,
        2,
        5,
        10,
        150,
        8.2,
        2.5,
        87,
        true,
        1,
        'Preview Access',
        'Trial',
        2,
        null,
        false,
        'UTC',
        '{"sms": false, "push": true, "email": false, "contests": true, "marketing": false, "challenges": true, "achievements": true}',
        true,
        'completed',
        false,
        true,
        null,
        now(),
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        user_name = EXCLUDED.user_name,
        fuel_points = EXCLUDED.fuel_points,
        level = EXCLUDED.level,
        onboarding_completed = true,
        is_active = true,
        updated_at = now();
    
    -- Add some test FP earnings
    INSERT INTO public.fp_earnings (
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
    (new_user_id, 'daily_boost', 'morning-walk', 10, 'Morning walk completed', '{"test": true}', CURRENT_DATE, 'Test User', now()),
    (new_user_id, 'challenge_daily', 'hydration-challenge', 15, 'Hydration challenge progress', '{"test": true}', CURRENT_DATE, 'Test User', now()),
    (new_user_id, 'health_assessment', 'initial-assessment', 100, 'Initial health assessment', '{"test": true}', CURRENT_DATE - 1, 'Test User', now() - interval '1 day')
    ON CONFLICT (user_id, source, source_id, date) DO NOTHING;
    
    -- Add health assessment
    INSERT INTO public.health_assessments (
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
        fp_earned,
        completed_at
    ) VALUES (
        new_user_id,
        8.5,
        7.8,
        8.0,
        7.5,
        6.8,
        8.2,
        2.5,
        87,
        '1.0',
        '{"test_user": true, "completed_via": "migration"}',
        '{"focus_areas": ["sleep", "biohacking"], "next_steps": ["optimize_sleep_schedule", "try_cold_therapy"]}',
        100,
        now() - interval '1 day'
    ) ON CONFLICT (user_id, completed_at) DO NOTHING;
    
    RAISE NOTICE 'Test user created successfully: testuser@healthrocket.app with password: TestUser123!';
    RAISE NOTICE 'User ID: %', new_user_id;
    
END $$;