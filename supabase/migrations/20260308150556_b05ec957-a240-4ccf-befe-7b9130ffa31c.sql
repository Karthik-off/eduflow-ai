-- Admin profiles table to link admin to their department
CREATE TABLE public.admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own profile"
  ON public.admin_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own admin profile"
  ON public.admin_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all admin profiles"
  ON public.admin_profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));