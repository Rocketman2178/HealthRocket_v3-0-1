/*
  # Fix Authentication User Setup

  This migration ensures the user clay@healthrocket.app is properly configured
  in the auth system to allow login with the specified credentials.

  1. Updates auth.users table directly
  2. Ensures email is confirmed
  3. Sets proper authentication fields
  4. Removes any login restrictions
*/

-- First, let's check if the user exists and get their ID
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Find the user by email
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'clay@healthrocket.app';
    
    IF user_uuid IS NOT NULL THEN
        -- Update the auth.users record to ensure proper login
        UPDATE auth.users 
        SET 
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            phone_confirmed_at = NULL,
            confirmation_sent_at = COALESCE(confirmation_sent_at, now()),
            recovery_sent_at = NULL,
            email_change_sent_at = NULL,
            last_sign_in_at = NULL,
            banned_until = NULL,
            deleted_at = NULL,
            is_sso_user = false,
            updated_at = now()
        WHERE id = user_uuid;
        
        -- Also update the identities table to ensure password auth works
        UPDATE auth.identities 
        SET 
            updated_at = now()
        WHERE user_id = user_uuid AND provider = 'email';
        
        -- If no identity exists, create one
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        )
        SELECT 
            gen_random_uuid(),
            user_uuid,
            jsonb_build_object(
                'sub', user_uuid::text,
                'email', 'clay@healthrocket.app',
                'email_verified', true
            ),
            'email',
            'clay@healthrocket.app',
            now(),
            now(),
            now()
        WHERE NOT EXISTS (
            SELECT 1 FROM auth.identities 
            WHERE user_id = user_uuid AND provider = 'email'
        );
        
        RAISE NOTICE 'Updated auth user: %', user_uuid;
    ELSE
        RAISE NOTICE 'User clay@healthrocket.app not found in auth.users';
    END IF;
END $$;