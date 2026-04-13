-- Create sample staff records for testing
-- This migration creates sample staff members with their auth users

-- First, insert sample staff records
INSERT INTO public.staff (
  id,
  user_id,
  staff_code,
  full_name,
  email,
  phone,
  department_id,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    gen_random_uuid(), -- This will be replaced with actual user_id after auth user creation
    'IT001',
    'John Smith',
    'john.smith@eduflow.com',
    '+1234567890',
    (SELECT id FROM public.departments WHERE name = 'Computer Science' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    gen_random_uuid(), -- This will be replaced with actual user_id after auth user creation
    'IT002',
    'Sarah Johnson',
    'sarah.johnson@eduflow.com',
    '+1234567891',
    (SELECT id FROM public.departments WHERE name = 'Computer Science' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    gen_random_uuid(), -- This will be replaced with actual user_id after auth user creation
    'MATH001',
    'Michael Brown',
    'michael.brown@eduflow.com',
    '+1234567892',
    (SELECT id FROM public.departments WHERE name = 'Mathematics' LIMIT 1),
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    gen_random_uuid(), -- This will be replaced with actual user_id after auth user creation
    'PHY001',
    'Emily Davis',
    'emily.davis@eduflow.com',
    '+1234567893',
    (SELECT id FROM public.departments WHERE name = 'Physics' LIMIT 1),
    NOW(),
    NOW()
  );

-- Note: The actual user_id values will need to be updated after creating auth users
-- This is because Supabase auth.users are created separately through the auth system

-- Create staff roles for the users
-- This will be handled after the auth users are created
