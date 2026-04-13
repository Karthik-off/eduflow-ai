-- Create staff auth users manually with service role key
-- This migration creates the necessary auth users for staff login

-- NOTE: This migration requires service role privileges to execute
-- Run this manually in Supabase SQL Editor with service role key

-- Insert staff auth users using service role
-- These are the auth users that correspond to staff records

-- Staff user for IT001
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  email_confirmed,
  phone_confirmed
) VALUES
  (
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'john.smith@eduflow.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    NOW(),
    NOW(),
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"staff_code": "IT001", "full_name": "John Smith", "role": "staff"}',
    false,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'sarah.johnson@eduflow.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    NOW(),
    NOW(),
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"staff_code": "IT002", "full_name": "Sarah Johnson", "role": "staff"}',
    false,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'michael.brown@eduflow.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    NOW(),
    NOW(),
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"staff_code": "MATH001", "full_name": "Michael Brown", "role": "staff"}',
    false,
    true,
    false
  ),
  (
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'emily.davis@eduflow.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    NOW(),
    NOW(),
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"staff_code": "PHY001", "full_name": "Emily Davis", "role": "staff"}',
    false,
    true,
    false
  );

-- Update staff records with correct user_id
-- This links the staff records to the newly created auth users
UPDATE public.staff
SET user_id = auth.users.id
FROM auth.users
WHERE auth.users.email = public.staff.email;

-- Create user roles for staff users
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
