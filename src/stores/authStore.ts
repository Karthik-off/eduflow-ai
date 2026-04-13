import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface StudentProfile {
  id: string;
  roll_number: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  cgpa: number;
  avatar_url: string | null;
  department_id: string | null;
  section_id: string | null;
  current_semester_id: string | null;
  attendance_percentage: number | null;
}

interface StaffProfile {
  id: string;
  staff_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department_id: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  studentProfile: StudentProfile | null;
  staffProfile: StaffProfile | null;
  role: 'admin' | 'student' | 'staff' | null;
  isLoading: boolean;
  isReady: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role?: 'admin' | 'student' | 'staff' | null }>;
  signOut: () => Promise<void>;
  loadUserData: (userId: string) => Promise<'admin' | 'student' | 'staff' | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  studentProfile: null,
  staffProfile: null,
  role: null,
  isLoading: true,
  isReady: false,

  loadUserData: async (userId: string) => {
    console.log('=== LOADING USER DATA ===');
    console.log('User ID:', userId);
    
    // Fetch role
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1);
    
    console.log('Role query result:', { roles, roleError });
    
    const role = (roles?.[0]?.role as AuthState['role']) ?? null;
    console.log('Assigned role:', role);
    set({ role });

    // Fetch profile based on role
    if (role === 'student') {
      console.log('Loading student profile...');
      const { data: profile, error: profileError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .single();
      console.log('Student profile result:', { profile, profileError });
      set({ studentProfile: profile as unknown as StudentProfile });
    } else if (role === 'staff') {
      console.log('Loading staff profile...');
      const { data: profile, error: profileError } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .single();
      console.log('Staff profile result:', { profile, profileError });
      set({ staffProfile: profile as unknown as StaffProfile });
    } else {
      console.log('No role assigned or unknown role');
    }

    // Ensure isReady is set to true after data is loaded
    set({ isReady: true });
    console.log('=== USER DATA LOADING COMPLETE ===');

    return role;
  },

  initialize: async () => {
    // First, get any existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      set({ session, user: session.user });
      await get().loadUserData(session.user.id);
    }
    
    set({ isLoading: false, isReady: true });

    // Then set up listener for future changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user ?? null });
      
      if (event === 'SIGNED_OUT') {
        set({ role: null, studentProfile: null, staffProfile: null });
      }
    });
  },

  signIn: async (email: string, password: string) => {
    console.log('=== SIGN IN ATTEMPT ===');
    console.log('Input:', { email, passwordLength: password.length });
    
    // Check if the input looks like a staff ID (starts with STF or contains only alphanumeric without @)
    const isStaffId = /^[A-Z0-9]+$/.test(email) && (email.startsWith('STF') || email.length <= 10);
    console.log('Is staff ID:', isStaffId);
    
    let actualEmail = email;
    
    // If it's a staff ID, look up the staff member's email
    if (isStaffId) {
      console.log('Looking up staff with code:', email);
      
      // First, let's check what staff records exist
      const { data: allStaff, error: allStaffError } = await supabase
        .from('staff')
        .select('staff_code, full_name, email, user_id')
        .limit(10);
      
      console.log('All staff records:', allStaff, allStaffError);
      
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('email, staff_code, full_name, user_id')
        .eq('staff_code', email)
        .single();
      
      console.log('Staff lookup result:', { staffData, staffError });
      
      if (staffError || !staffData?.email) {
        console.log('Staff lookup failed:', staffError?.message);
        return { error: `Staff ID "${email}" not found. Please check your staff ID and try again. Available staff codes: ${allStaff?.map(s => s.staff_code).join(', ') || 'None'}` };
      }
      
      actualEmail = staffData.email;
      console.log('Found staff email:', actualEmail);
      console.log('Staff user_id:', staffData.user_id);
    }
    
    console.log('Attempting authentication with email:', actualEmail);
    
    // Use the actual email for Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({ email: actualEmail, password });
    
    console.log('Auth result:', { data: data?.user?.id, error: error?.message });
    
    if (error) {
      console.log('Authentication failed:', error.message);
      return { error: error.message };
    }
    
    if (data.user) {
      console.log('Authentication successful, user ID:', data.user.id);
      set({ session: data.session, user: data.user });
      
      // Wait for user data to load before returning
      console.log('Loading user data...');
      const role = await get().loadUserData(data.user.id);
      console.log('User data loaded, role:', role);
      
      console.log('=== SIGN IN COMPLETE ===');
      return { error: null, role };
    }
    
    console.log('=== SIGN IN COMPLETE (NO USER) ===');
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, role: null, studentProfile: null, staffProfile: null });
  },
}));
