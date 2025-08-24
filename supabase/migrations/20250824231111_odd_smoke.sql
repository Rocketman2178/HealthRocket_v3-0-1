/*
  # Confirm User Email for Testing

  This migration manually confirms the email for the test user clay@healthrocket.app
  so they can login and run authenticated tests.

  1. Updates auth.users to mark email as confirmed
  2. Sets email_confirmed_at timestamp
  3. Ensures the user can login immediately
*/

-- Confirm the email for the test user
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'clay@healthrocket.app' 
  AND email_confirmed_at IS NULL;

-- Also ensure the user is active and not banned
UPDATE auth.users 
SET 
  banned_until = NULL,
  updated_at = now()
WHERE email = 'clay@healthrocket.app';