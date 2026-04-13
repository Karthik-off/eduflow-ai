
-- Admins need to read all students
CREATE POLICY "Admins can read all students" ON public.students
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
