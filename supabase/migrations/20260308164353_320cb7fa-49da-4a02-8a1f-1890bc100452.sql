
-- Create notifications table for staff-to-student alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'fee_added', 'marks_updated', 'attendance_updated', 'info'
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.staff(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Students can read their own notifications
CREATE POLICY "Students can read own notifications"
  ON public.notifications FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- Students can update (mark as read) their own notifications
CREATE POLICY "Students can update own notifications"
  ON public.notifications FOR UPDATE
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- Staff can insert notifications
CREATE POLICY "Staff can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role));

-- Staff can read notifications they created
CREATE POLICY "Staff can read notifications"
  ON public.notifications FOR SELECT
  USING (has_role(auth.uid(), 'staff'::app_role));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
