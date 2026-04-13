
-- Allow staff to update students in their assigned sections
CREATE POLICY "Staff can update students in assigned sections"
ON public.students
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'staff'::app_role)
  AND section_id IN (
    SELECT sa.section_id FROM public.staff_assignments sa
    JOIN public.staff s ON s.id = sa.staff_id
    WHERE s.user_id = auth.uid() AND sa.is_active = true AND sa.section_id IS NOT NULL
  )
)
WITH CHECK (
  has_role(auth.uid(), 'staff'::app_role)
  AND section_id IN (
    SELECT sa.section_id FROM public.staff_assignments sa
    JOIN public.staff s ON s.id = sa.staff_id
    WHERE s.user_id = auth.uid() AND sa.is_active = true AND sa.section_id IS NOT NULL
  )
);

-- Also allow admins to manage sections (insert/update/delete)
CREATE POLICY "Admins can manage sections"
ON public.sections
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
