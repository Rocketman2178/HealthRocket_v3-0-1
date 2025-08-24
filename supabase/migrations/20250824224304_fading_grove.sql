/*
  # Create get_test_users RPC function

  1. New Functions
    - `get_test_users()` - Returns list of users for testing purposes
  
  2. Security
    - Function accessible to authenticated users
    - Returns basic user info needed for testing
    - Bypasses RLS for testing purposes only
*/

-- Create function to get users for testing
CREATE OR REPLACE FUNCTION get_test_users()
RETURNS TABLE (
  id uuid,
  email text,
  user_name text,
  is_admin boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return users for testing purposes
  -- This bypasses RLS to allow test user selection
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.user_name,
    u.is_admin
  FROM users u
  WHERE u.is_active = true
  ORDER BY u.created_at DESC
  LIMIT 20;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_test_users() TO authenticated;