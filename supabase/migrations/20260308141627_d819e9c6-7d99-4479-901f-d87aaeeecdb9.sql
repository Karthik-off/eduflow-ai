
-- Admins need to read staff list
CREATE POLICY "Admins can read all staff" ON public.staff
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins need to insert admin role for themselves during signup
CREATE POLICY "Users can insert admin role for self" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'admin');
