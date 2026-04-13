
-- Drop existing overly-broad admin policies on students
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Admins can read all students" ON public.students;

-- Create a security definer function to get admin's department_id
CREATE OR REPLACE FUNCTION public.get_admin_department_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id FROM public.admin_profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Admins can only read students in their own department
CREATE POLICY "Admins can read dept students"
ON public.students FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND department_id = get_admin_department_id(auth.uid())
);

-- Admins can only manage (insert/update/delete) students in their own department
CREATE POLICY "Admins can manage dept students"
ON public.students FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND department_id = get_admin_department_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND department_id = get_admin_department_id(auth.uid())
);
