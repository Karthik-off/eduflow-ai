
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'staff');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- User roles table (security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Academic years
CREATE TABLE public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label TEXT NOT NULL UNIQUE, -- e.g. '2025-2026'
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

-- Semesters
CREATE TABLE public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id),
  semester_number INT NOT NULL,
  label TEXT NOT NULL, -- e.g. 'Semester 1'
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

-- Sections
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id),
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  name TEXT NOT NULL, -- e.g. 'A', 'B'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Student profiles
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  department_id UUID REFERENCES public.departments(id),
  section_id UUID REFERENCES public.sections(id),
  current_semester_id UUID REFERENCES public.semesters(id),
  cgpa NUMERIC(4,2) DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_students_roll ON public.students(roll_number);
CREATE INDEX idx_students_section ON public.students(section_id);

-- Staff profiles
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Subjects
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id),
  department_id UUID NOT NULL REFERENCES public.departments(id),
  credits INT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Staff assignments (class incharge / subject incharge)
CREATE TABLE public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('class_incharge', 'subject_incharge')),
  section_id UUID REFERENCES public.sections(id),
  subject_id UUID REFERENCES public.subjects(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;

-- Timetable entries
CREATE TABLE public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id),
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  staff_id UUID REFERENCES public.staff(id),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period_number INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

-- Attendance sessions
CREATE TABLE public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  section_id UUID NOT NULL REFERENCES public.sections(id),
  staff_id UUID NOT NULL REFERENCES public.staff(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  qr_secret TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Attendance records
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id),
  student_id UUID NOT NULL REFERENCES public.students(id),
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, student_id)
);
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Marks
CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id),
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  exam_type TEXT NOT NULL CHECK (exam_type IN ('unit_test_1', 'unit_test_2', 'mid_term', 'assignment', 'final')),
  marks_obtained NUMERIC(5,2) NOT NULL,
  max_marks NUMERIC(5,2) NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  entered_by UUID REFERENCES public.staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Fee categories
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id),
  category TEXT NOT NULL CHECK (category IN ('tuition', 'bus', 'exam', 'discretionary')),
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  academic_year_id UUID REFERENCES public.academic_years(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id UUID NOT NULL REFERENCES public.fees(id),
  student_id UUID NOT NULL REFERENCES public.students(id),
  utr_number TEXT,
  amount NUMERIC(10,2) NOT NULL,
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'department', 'section', 'student')),
  target_id UUID,
  posted_by UUID REFERENCES auth.users(id),
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- OTP logs
CREATE TABLE public.otp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'login',
  is_used BOOLEAN NOT NULL DEFAULT false,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.otp_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- User roles: users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Departments: readable by all authenticated
CREATE POLICY "Authenticated can read departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments" ON public.departments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Academic years: readable by all authenticated
CREATE POLICY "Authenticated can read academic_years" ON public.academic_years FOR SELECT TO authenticated USING (true);

-- Semesters: readable by all authenticated
CREATE POLICY "Authenticated can read semesters" ON public.semesters FOR SELECT TO authenticated USING (true);

-- Sections: readable by all authenticated
CREATE POLICY "Authenticated can read sections" ON public.sections FOR SELECT TO authenticated USING (true);

-- Students: can read own profile
CREATE POLICY "Students can read own profile" ON public.students FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can read students" ON public.students FOR SELECT USING (public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff: can read own profile
CREATE POLICY "Staff can read own profile" ON public.staff FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage staff" ON public.staff FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Subjects: readable by all authenticated
CREATE POLICY "Authenticated can read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff assignments: staff can read own, admins manage
CREATE POLICY "Staff can read own assignments" ON public.staff_assignments FOR SELECT USING (
  staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage assignments" ON public.staff_assignments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Timetable: readable by authenticated
CREATE POLICY "Authenticated can read timetable" ON public.timetable_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage timetable" ON public.timetable_entries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Attendance sessions: staff can manage their own, students can read
CREATE POLICY "Staff can manage own sessions" ON public.attendance_sessions FOR ALL USING (
  staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
);
CREATE POLICY "Students can read sessions" ON public.attendance_sessions FOR SELECT USING (public.has_role(auth.uid(), 'student'));

-- Attendance records: students can read own
CREATE POLICY "Students can read own attendance" ON public.attendance_records FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "Staff can manage attendance" ON public.attendance_records FOR ALL USING (public.has_role(auth.uid(), 'staff'));

-- Marks: students can read own
CREATE POLICY "Students can read own marks" ON public.marks FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "Staff can manage marks" ON public.marks FOR ALL USING (public.has_role(auth.uid(), 'staff'));

-- Fees: students can read own
CREATE POLICY "Students can read own fees" ON public.fees FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "Staff can manage fees" ON public.fees FOR ALL USING (public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage fees" ON public.fees FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Transactions: students can read/insert own
CREATE POLICY "Students can read own transactions" ON public.transactions FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "Students can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "Staff can manage transactions" ON public.transactions FOR ALL USING (public.has_role(auth.uid(), 'staff'));

-- Announcements: readable by all authenticated
CREATE POLICY "Authenticated can read announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can create announcements" ON public.announcements FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Audit logs: only admins can read
CREATE POLICY "Admins can read audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- OTP logs: no direct access (handled by edge functions)
CREATE POLICY "No direct otp access" ON public.otp_logs FOR SELECT USING (false);

-- Triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marks_updated_at BEFORE UPDATE ON public.marks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
