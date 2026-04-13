
-- Study materials table
CREATE TABLE public.study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read study materials
CREATE POLICY "Authenticated can read study materials" ON public.study_materials
FOR SELECT TO authenticated USING (true);

-- Staff can upload materials
CREATE POLICY "Staff can manage study materials" ON public.study_materials
FOR ALL USING (public.has_role(auth.uid(), 'staff'));

-- Admins can manage materials
CREATE POLICY "Admins can manage study materials" ON public.study_materials
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public) VALUES ('study-materials', 'study-materials', true);

-- Storage policies
CREATE POLICY "Anyone can read study materials files" ON storage.objects
FOR SELECT USING (bucket_id = 'study-materials');

CREATE POLICY "Staff can upload study materials files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'study-materials' AND public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can upload study materials files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'study-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can delete study materials files" ON storage.objects
FOR DELETE USING (bucket_id = 'study-materials' AND public.has_role(auth.uid(), 'staff'));

CREATE POLICY "Admins can delete study materials files" ON storage.objects
FOR DELETE USING (bucket_id = 'study-materials' AND public.has_role(auth.uid(), 'admin'));
