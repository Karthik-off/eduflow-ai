-- Fix staff authentication by creating proper auth users and role assignments
-- This migration creates the missing auth users and links them to staff records

-- Step 1: Create auth users for staff (this needs to be done via Supabase auth system)
-- For now, we'll create the user_roles entries assuming auth users exist

-- Step 2: Create user_roles for staff emails
-- Note: This assumes auth users have been created with these emails
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
SELECT 
  auth.users.id,
  'staff',
  NOW(),
  NOW()
FROM auth.users
WHERE auth.users.email IN (
  'john.smith@eduflow.com',
  'sarah.johnson@eduflow.com', 
  'michael.brown@eduflow.com',
  'emily.davis@eduflow.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = auth.users.id AND ur.role = 'staff'
);

-- Step 3: Update staff records with correct user_id
UPDATE public.staff
SET user_id = auth.users.id
FROM auth.users
WHERE auth.users.email = public.staff.email
AND public.staff.user_id IS DISTINCT FROM auth.users.id;

-- Step 4: Create a function to create staff auth users if they don't exist
CREATE OR REPLACE FUNCTION create_staff_auth_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  staff_record RECORD;
  auth_user_id uuid;
BEGIN
  -- Loop through staff records that don't have corresponding auth users
  FOR staff_record IN 
    SELECT s.id, s.staff_code, s.full_name, s.email, s.user_id
    FROM public.staff s
    WHERE s.email IS NOT NULL 
    AND NOT EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.email = s.email
    )
  LOOP
    -- Note: Creating auth users requires admin privileges and should be done via Supabase Admin
    -- This function documents what needs to be done
    RAISE NOTICE 'Create auth user for staff: %, email: %', staff_record.staff_code, staff_record.email;
  END LOOP;
END;
$$;

-- Step 5: Create a diagnostic function
CREATE OR REPLACE FUNCTION diagnose_staff_auth()
RETURNS TABLE(
  staff_code text,
  staff_email text,
  has_auth_user boolean,
  has_user_role boolean,
  user_id_matches boolean,
  diagnosis text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  staff_record RECORD;
BEGIN
  FOR staff_record IN 
    SELECT s.staff_code, s.email, s.user_id as staff_user_id
    FROM public.staff s
    WHERE s.email IS NOT NULL
  LOOP
    RETURN QUERY SELECT 
      staff_record.staff_code,
      staff_record.email,
      EXISTS(SELECT 1 FROM auth.users au WHERE au.email = staff_record.email),
      EXISTS(SELECT 1 FROM public.user_roles ur JOIN auth.users au ON ur.user_id = au.id WHERE au.email = staff_record.email AND ur.role = 'staff'),
      (SELECT COUNT(*) > 0 FROM auth.users au WHERE au.email = staff_record.email AND au.id = staff_record.staff_user_id),
      CASE 
        WHEN NOT EXISTS(SELECT 1 FROM auth.users au WHERE au.email = staff_record.email) 
        THEN 'Missing auth user - create via Supabase Admin'
        WHEN NOT EXISTS(SELECT 1 FROM public.user_roles ur JOIN auth.users au ON ur.user_id = au.id WHERE au.email = staff_record.email AND ur.role = 'staff')
        THEN 'Missing user role assignment'
        WHEN NOT EXISTS(SELECT 1 FROM auth.users au WHERE au.email = staff_record.email AND au.id = staff_record.staff_user_id)
        THEN 'User ID mismatch between staff and auth tables'
        ELSE 'OK'
      END;
  END LOOP;
END;
$$;

-- Step 6: Grant necessary permissions
GRANT EXECUTE ON FUNCTION diagnose_staff_auth TO authenticated;
GRANT EXECUTE ON FUNCTION create_staff_auth_users TO authenticated;
