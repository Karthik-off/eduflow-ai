
-- Allow newly signed up users to insert their own student profile and role
-- We'll use a trigger on auth.users to auto-create role and profile

-- First, allow authenticated users to insert their own student record
CREATE POLICY "Users can insert own student profile" ON public.students
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert their own role
CREATE POLICY "Users can insert own role" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
