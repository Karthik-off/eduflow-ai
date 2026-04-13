-- First drop the existing broad "Staff can manage fees" policy
DROP POLICY IF EXISTS "Staff can manage fees" ON public.fees;

-- Create specific INSERT policy for staff to add fees for students in their assigned sections
CREATE POLICY "Staff can insert fees for assigned students" 
ON public.fees 
FOR INSERT 
TO authenticated 
WITH CHECK (
  has_role(auth.uid(), 'staff'::app_role) 
  AND student_id IN (
    SELECT s.id 
    FROM students s 
    JOIN staff_assignments sa ON sa.section_id = s.section_id 
    JOIN staff st ON st.id = sa.staff_id 
    WHERE st.user_id = auth.uid() 
    AND sa.is_active = true 
    AND sa.section_id IS NOT NULL
  )
);

-- Create specific UPDATE policy for staff to update fees for students in their assigned sections  
CREATE POLICY "Staff can update fees for assigned students" 
ON public.fees 
FOR UPDATE 
TO authenticated 
USING (
  has_role(auth.uid(), 'staff'::app_role) 
  AND student_id IN (
    SELECT s.id 
    FROM students s 
    JOIN staff_assignments sa ON sa.section_id = s.section_id 
    JOIN staff st ON st.id = sa.staff_id 
    WHERE st.user_id = auth.uid() 
    AND sa.is_active = true 
    AND sa.section_id IS NOT NULL
  )
)
WITH CHECK (
  has_role(auth.uid(), 'staff'::app_role) 
  AND student_id IN (
    SELECT s.id 
    FROM students s 
    JOIN staff_assignments sa ON sa.section_id = s.section_id 
    JOIN staff st ON st.id = sa.staff_id 
    WHERE st.user_id = auth.uid() 
    AND sa.is_active = true 
    AND sa.section_id IS NOT NULL
  )
);

-- Create specific DELETE policy for staff to delete fees for students in their assigned sections
CREATE POLICY "Staff can delete fees for assigned students" 
ON public.fees 
FOR DELETE 
TO authenticated 
USING (
  has_role(auth.uid(), 'staff'::app_role) 
  AND student_id IN (
    SELECT s.id 
    FROM students s 
    JOIN staff_assignments sa ON sa.section_id = s.section_id 
    JOIN staff st ON st.id = sa.staff_id 
    WHERE st.user_id = auth.uid() 
    AND sa.is_active = true 
    AND sa.section_id IS NOT NULL
  )
);

-- Create SELECT policy for staff to read fees for students in their assigned sections
CREATE POLICY "Staff can read fees for assigned students" 
ON public.fees 
FOR SELECT 
TO authenticated 
USING (
  has_role(auth.uid(), 'staff'::app_role) 
  AND student_id IN (
    SELECT s.id 
    FROM students s 
    JOIN staff_assignments sa ON sa.section_id = s.section_id 
    JOIN staff st ON st.id = sa.staff_id 
    WHERE st.user_id = auth.uid() 
    AND sa.is_active = true 
    AND sa.section_id IS NOT NULL
  )
);