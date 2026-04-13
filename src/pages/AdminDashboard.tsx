import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';
import BackToHomeButton from '@/components/BackToHomeButton';
import SearchBar from '@/components/SearchBar';
import { useDarkMode } from '@/contexts/DarkModeContext';
import {
  Shield, LogOut, UserPlus, Users, Loader2, GraduationCap, Trash2,
  BookOpen, Calendar, BarChart3, Bell, Settings, Search, Link2, Check, X, Upload, Download,
  Home, FileText, DollarSign, Bot, User, Sun, Moon, Activity, Clock, CreditCard,
  AlertTriangle, QrCode, CalendarDays, BookMarked, Wallet, TrendingUp, MessageSquare,
  ChevronRight, IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface StaffMember {
  id: string;
  staff_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  department_id: string | null;
}

interface Student {
  id: string;
  roll_number: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department_id: string | null;
  cgpa: number | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface ExcelStudent {
  name: string;
  age: number;
  dept: string;
  phone: string;
}

interface Section {
  id: string;
  name: string;
  department_id: string;
  semester_id: string;
  department: { id: string; name: string; code: string } | null;
  semester: { id: string; label: string; semester_number: number } | null;
}

interface StaffAssignment {
  id: string;
  staff_id: string;
  section_id: string | null;
  role_type: string;
  is_active: boolean;
  section: { id: string; name: string; department: { name: string; code: string } | null; semester: { label: string } | null } | null;
}

const AdminDashboard = () => {
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');

  const [adminDeptId, setAdminDeptId] = useState<string | null>(null);
  const [adminDeptName, setAdminDeptName] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Create staff form
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [creating, setCreating] = useState(false);

  // Search
  const [studentSearch, setStudentSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  // Assign class
  const [assignStaffCode, setAssignStaffCode] = useState('');
  const [foundStaff, setFoundStaff] = useState<StaffMember | null>(null);
  const [staffNotFound, setStaffNotFound] = useState(false);
  const [searchingStaff, setSearchingStaff] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Classes management
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSemId, setNewClassSemId] = useState('');
  const [semesters, setSemesters] = useState<{ id: string; label: string; semester_number: number }[]>([]);
  const [creatingClass, setCreatingClass] = useState(false);

  // Student management
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    age: '',
    department: '',
    phoneNumber: ''
  });
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Class teacher assignment in create class
  const [ctStaffCode, setCtStaffCode] = useState('');
  const [ctFound, setCtFound] = useState<StaffMember | null>(null);
  const [ctSearching, setCtSearching] = useState(false);
  const [ctNotFound, setCtNotFound] = useState(false);
  const [ctAlreadyAssigned, setCtAlreadyAssigned] = useState(false);

  // Subject staff assignments in create class
  const [subjectStaffList, setSubjectStaffList] = useState<{ staffCode: string; staff: StaffMember | null; subjectId: string; searching: boolean; notFound: boolean }[]>([]);
  const [deptSubjects, setDeptSubjects] = useState<{ id: string; name: string; code: string }[]>([]);

  const fetchStaff = async () => {
    const { data } = await supabase
      .from('staff')
      .select('id, staff_code, full_name, email, phone, created_at, department_id')
      .order('created_at', { ascending: false });
    setStaffList((data as StaffMember[]) ?? []);
    setLoadingStaff(false);
  };

  const fetchStudents = async () => {
    try {
      console.log('AdminDashboard: Fetching students from Supabase...');
      const { data, error } = await supabase
        .from('students')
        .select('id, roll_number, full_name, email, phone, department_id, cgpa, created_at, updated_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('AdminDashboard: Error fetching students:', error);
        toast.error('Failed to fetch students: ' + error.message);
        setStudentList([]);
      } else {
        console.log('AdminDashboard: Students fetched successfully:', data);
        setStudentList((data as Student[]) ?? []);
      }
    } catch (error) {
      console.error('AdminDashboard: Exception fetching students:', error);
      toast.error('Error fetching students');
      setStudentList([]);
    }
    setLoadingStudents(false);
  };

  const fetchSections = async () => {
    const { data } = await supabase
      .from('sections')
      .select('id, name, department_id, semester_id, department:departments(id, name, code), semester:semesters(id, label, semester_number)')
      .order('name');
    setSections((data as unknown as Section[]) ?? []);
  };

  const fetchAdminProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('admin_profiles')
      .select('full_name, department_id, department:departments(id, name, code)')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setAdminName(data.full_name || '');
      const dept = data.department as unknown as { id: string; name: string; code: string } | null;
      setAdminDeptId(dept?.id ?? null);
      setAdminDeptName(dept ? `${dept.name} (${dept.code})` : '');
    }
  };

  const fetchSemesters = async () => {
    const { data } = await supabase.from('semesters').select('id, label, semester_number').order('semester_number');
    setSemesters((data as { id: string; label: string; semester_number: number }[]) ?? []);
  };

  const fetchDeptSubjects = async (semesterId: string) => {
    if (!adminDeptId) return;
    const { data } = await supabase
      .from('subjects')
      .select('id, name, code')
      .eq('department_id', adminDeptId)
      .eq('semester_id', semesterId)
      .order('name');
    setDeptSubjects((data as { id: string; name: string; code: string }[]) ?? []);
    setSubjectStaffList([]);
  };

  const handleSemesterChange = (semId: string) => {
    setNewClassSemId(semId);
    fetchDeptSubjects(semId);
  };

  const searchClassTeacher = async () => {
    if (!ctStaffCode.trim()) return;
    setCtSearching(true);
    setCtFound(null);
    setCtNotFound(false);
    setCtAlreadyAssigned(false);

    const { data } = await supabase
      .from('staff')
      .select('id, staff_code, full_name, email, phone, created_at, department_id')
      .eq('staff_code', ctStaffCode.trim())
      .maybeSingle();

    if (data) {
      // Check if staff belongs to a different department — can't be class teacher cross-dept
      if (data.department_id && adminDeptId && data.department_id !== adminDeptId) {
        toast.error('This staff belongs to another department and cannot be Class Teacher here. They can only be a Subject Incharge.');
        setCtNotFound(true);
        setCtSearching(false);
        return;
      }

      // Check if this staff is already a class teacher somewhere
      const { data: existing } = await supabase
        .from('staff_assignments')
        .select('id')
        .eq('staff_id', data.id)
        .eq('role_type', 'class_incharge')
        .eq('is_active', true)
        .limit(1);

      if (existing && existing.length > 0) {
        setCtAlreadyAssigned(true);
        setCtFound(data as StaffMember);
      } else {
        setCtFound(data as StaffMember);
      }
    } else {
      setCtNotFound(true);
    }
    setCtSearching(false);
  };

  const searchSubjectStaff = async (index: number) => {
    const item = subjectStaffList[index];
    if (!item.staffCode.trim()) return;

    const updated = [...subjectStaffList];
    updated[index] = { ...updated[index], searching: true, notFound: false, staff: null };
    setSubjectStaffList(updated);

    const { data } = await supabase
      .from('staff')
      .select('id, staff_code, full_name, email, phone, created_at, department_id')
      .eq('staff_code', item.staffCode.trim())
      .maybeSingle();

    const updated2 = [...subjectStaffList];
    if (data) {
      updated2[index] = { ...updated2[index], staff: data as StaffMember, searching: false, notFound: false };
    } else {
      updated2[index] = { ...updated2[index], staff: null, searching: false, notFound: true };
    }
    setSubjectStaffList(updated2);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !adminDeptId || !newClassSemId) return;
    if (!ctFound) {
      toast.error('Please search and assign a class teacher');
      return;
    }
    if (ctAlreadyAssigned) {
      toast.error('This staff is already a class teacher for another class');
      return;
    }
    setCreatingClass(true);

    // 1. Create the section
    const { data: newSection, error } = await supabase.from('sections').insert({
      name: newClassName,
      department_id: adminDeptId,
      semester_id: newClassSemId,
    }).select('id').single();

    if (error || !newSection) {
      toast.error('Failed to create class: ' + (error?.message ?? 'Unknown error'));
      setCreatingClass(false);
      return;
    }

    // 2. Assign class teacher
    await supabase.from('staff_assignments').insert({
      staff_id: ctFound.id,
      section_id: newSection.id,
      role_type: 'class_incharge',
      is_active: true,
    });

    // 3. Assign subject staff
    for (const ss of subjectStaffList) {
      if (ss.staff && ss.subjectId) {
        await supabase.from('staff_assignments').insert({
          staff_id: ss.staff.id,
          section_id: newSection.id,
          subject_id: ss.subjectId,
          role_type: 'subject_incharge',
          is_active: true,
        });
      }
    }

    toast.success(`Class "${newClassName}" created with staff assignments`);
    setClassDialogOpen(false);
    resetClassForm();
    fetchSections();
    setCreatingClass(false);
  };

  const resetClassForm = () => {
    setNewClassName('');
    setNewClassSemId('');
    setCtStaffCode('');
    setCtFound(null);
    setCtNotFound(false);
    setCtAlreadyAssigned(false);
    setSubjectStaffList([]);
    setDeptSubjects([]);
  };

  const handleDeleteClass = async (sectionId: string, name: string) => {
    try {
      // Delete related records first to avoid foreign key constraint errors
      // 1. Delete attendance records for sessions in this section
      const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('section_id', sectionId);
      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map((s) => s.id);
        await supabase.from('attendance_records').delete().in('session_id', sessionIds);
        await supabase.from('attendance_sessions').delete().eq('section_id', sectionId);
      }

      // 2. Delete timetable entries
      await supabase.from('timetable_entries').delete().eq('section_id', sectionId);

      // 3. Delete staff assignments
      await supabase.from('staff_assignments').delete().eq('section_id', sectionId);

      // 4. Unlink students from this section (set section_id to null)
      await supabase.from('students').update({ section_id: null }).eq('section_id', sectionId);

      // 5. Finally delete the section
      const { error } = await supabase.from('sections').delete().eq('id', sectionId);
      if (error) {
        toast.error('Failed to delete class: ' + error.message);
      } else {
        toast.success(`"${name}" deleted`);
        fetchSections();
      }
    } catch (err: any) {
      toast.error('Failed to delete class: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSearchStaff = async () => {
    if (!assignStaffCode.trim()) return;
    setSearchingStaff(true);
    setFoundStaff(null);
    setStaffNotFound(false);
    setStaffAssignments([]);

    const { data } = await supabase
      .from('staff')
      .select('id, staff_code, full_name, email, phone, created_at, department_id')
      .eq('staff_code', assignStaffCode.trim())
      .maybeSingle();

    if (data) {
      setFoundStaff(data as StaffMember);
      setStaffNotFound(false);
      // fetch existing assignments
      await fetchStaffAssignments(data.id);
    } else {
      setFoundStaff(null);
      setStaffNotFound(true);
    }
    setSearchingStaff(false);
  };

  const fetchStaffAssignments = async (staffId: string) => {
    setLoadingAssignments(true);
    const { data } = await supabase
      .from('staff_assignments')
      .select('id, staff_id, section_id, role_type, is_active, section:sections(id, name, department:departments(name, code), semester:semesters(label))')
      .eq('staff_id', staffId)
      .eq('is_active', true);
    setStaffAssignments((data as unknown as StaffAssignment[]) ?? []);
    setLoadingAssignments(false);
  };

  const handleAssignClass = async () => {
    if (!foundStaff || !selectedSectionId) return;
    setAssigning(true);

    // Staff from another department can't be class teacher here
    if (foundStaff.department_id && adminDeptId && foundStaff.department_id !== adminDeptId) {
      toast.error('This staff belongs to another department and cannot be Class Teacher here.');
      setAssigning(false);
      return;
    }

    // Check if already assigned
    const existing = staffAssignments.find(a => a.section_id === selectedSectionId);
    if (existing) {
      toast.error('Staff is already assigned to this class');
      setAssigning(false);
      return;
    }

    const { error } = await supabase.from('staff_assignments').insert({
      staff_id: foundStaff.id,
      section_id: selectedSectionId,
      role_type: 'class_incharge',
      is_active: true,
    });

    if (error) {
      toast.error('Failed to assign class: ' + error.message);
    } else {
      toast.success('Class assigned successfully');
      setSelectedSectionId('');
      await fetchStaffAssignments(foundStaff.id);
    }
    setAssigning(false);
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from('staff_assignments')
      .update({ is_active: false })
      .eq('id', assignmentId);

    if (error) {
      toast.error('Failed to remove assignment');
    } else {
      toast.success('Assignment removed');
      if (foundStaff) await fetchStaffAssignments(foundStaff.id);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchStudents();
    fetchSections();
    fetchAdminProfile();
    fetchSemesters();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const { data, error } = await supabase.functions.invoke('create-staff', {
      body: {
        email: staffEmail,
        password: staffPassword,
        fullName: staffName,
        staffCode: staffCode,
        phone: staffPhone || null,
        departmentId: adminDeptId,
      },
    });

    if (error) {
      toast.error(error.message || 'Failed to create staff account');
    } else if (data?.error) {
      toast.error(data.error);
    } else {
      toast.success(`Staff account created for ${staffName}`);
      setStaffDialogOpen(false);
      resetStaffForm();
      fetchStaff();
    }
    setCreating(false);
  };

  const resetStaffForm = () => {
    setStaffEmail('');
    setStaffPassword('');
    setStaffName('');
    setStaffCode('');
    setStaffPhone('');
  };

  const handleRemoveStudent = async (studentId: string, name: string) => {
    try {
      console.log('AdminDashboard: Removing student:', studentId, name);
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) {
        console.error('AdminDashboard: Error removing student:', error);
        toast.error('Failed to remove student: ' + error.message);
      } else {
        console.log('AdminDashboard: Student removed successfully');
        toast.success(`${name} has been removed`);
        fetchStudents(); // Refresh the list
      }
    } catch (error) {
      console.error('AdminDashboard: Exception removing student:', error);
      toast.error('Error removing student');
    }
  };

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!studentFormData.name || !studentFormData.age || !studentFormData.department || !studentFormData.phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    const ageNum = parseInt(studentFormData.age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      toast.error('Please enter a valid age between 16 and 100');
      return;
    }

    setCreatingStudent(true);

    try {
      // Create new student (mock implementation - replace with actual API call)
      const newStudent: Student = {
        id: Date.now().toString(),
        roll_number: `STU${Date.now()}`,
        full_name: studentFormData.name,
        email: `${studentFormData.name.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
        phone: studentFormData.phoneNumber,
        department_id: null,
        cgpa: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // For now, add to local state (replace with actual API call)
      setStudentList(prev => [newStudent, ...prev]);
      
      // Show success message
      toast.success(`Student "${studentFormData.name}" added successfully!`);
      
      // Clear form
      setStudentFormData({
        name: '',
        age: '',
        department: '',
        phoneNumber: ''
      });
      
      // Close modal
      setStudentDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add student');
    } finally {
      setCreatingStudent(false);
    }
  };

  const resetStudentForm = () => {
    setStudentFormData({
      name: '',
      age: '',
      department: '',
      phoneNumber: ''
    });
    setStudentDialogOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setUploadingFile(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[0];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate Excel format
      if (!jsonData || jsonData.length === 0) {
        toast.error('Excel file is empty or has invalid format');
        return;
      }

      // Check required columns
      const firstRow = jsonData[0] as Record<string, unknown>;
      const requiredColumns = ['name', 'age', 'dept', 'phone'];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));

      if (missingColumns.length > 0) {
        toast.error(`Excel file is missing required columns: ${missingColumns.join(', ')}`);
        return;
      }

      // Process Excel data
      const newStudents: Student[] = (jsonData as any[]).map((row: any, index) => {
        const student: Student = {
          id: Date.now().toString() + index,
          roll_number: `STU${Date.now()}${index}`,
          full_name: row.name || '',
          email: `${(row.name || '').toLowerCase().replace(/\s+/g, '.')}@student.edu`,
          phone: row.phone || null,
          department_id: null,
          cgpa: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Add department info if available
        if (row.dept) {
          student.department = row.dept;
        }

        return student;
      });

      // Add students to list
      setStudentList(prev => [...newStudents, ...prev]);
      
      toast.success(`Successfully imported ${newStudents.length} students from Excel file`);
      e.target.value = ''; // Clear file input
    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast.error('Failed to process Excel file. Please check the format.');
    } finally {
      setUploadingFile(false);
    }
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      { name: 'John Doe', age: 20, dept: 'Computer Science', phone: '+1234567890' },
      { name: 'Jane Smith', age: 21, dept: 'Electrical Engineering', phone: '+0987654321' },
      { name: 'Mike Johnson', age: 22, dept: 'Mechanical Engineering', phone: '+1122334455' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_import_sample.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Sample Excel file downloaded');
  };

  const handleRemoveStaff = async (staffId: string, name: string) => {
    const { data, error } = await supabase.functions.invoke('remove-staff', {
      body: { staffId },
    });

    if (error || data?.error) {
      toast.error(data?.error || error?.message || 'Failed to remove staff');
    } else {
      toast.success(`${name} has been removed`);
      fetchStaff();
    }
  };

  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const filteredStudents = studentList.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ?? false) ||
    (s.department?.toLowerCase().includes(studentSearch.toLowerCase()) ?? false) ||
    (s.year?.toLowerCase().includes(studentSearch.toLowerCase()) ?? false)
  );

  const filteredStaff = staffList.filter(s =>
    s.full_name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.staff_code.toLowerCase().includes(staffSearch.toLowerCase()) ||
    (s.email?.toLowerCase().includes(staffSearch.toLowerCase()) ?? false)
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Determine greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: location.pathname === '/admin/dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Staff Management', active: location.pathname.includes('/admin/staff'), path: '/admin/staff' },
    { icon: GraduationCap, label: 'Students', active: location.pathname.includes('/admin/students'), path: '/admin/students' },
    { icon: BookOpen, label: 'Classes', active: location.pathname.includes('/admin/classes'), path: '/admin/classes' },
    { icon: Calendar, label: 'Timetable', active: location.pathname.includes('/admin/timetable'), path: '/admin/timetable' },
    { icon: FileText, label: 'Reports', active: location.pathname.includes('/admin/reports'), path: '/admin/reports' },
    { icon: Settings, label: 'Settings', active: location.pathname.includes('/admin/settings'), path: '/admin/settings' },
  ];

  const quickActions = [
    { icon: UserPlus, label: 'Add Staff', color: 'bg-blue-500', path: '/admin/staff' },
    { icon: GraduationCap, label: 'Add Student', color: 'bg-green-500', path: '/admin/students' },
    { icon: BookOpen, label: 'Create Class', color: 'bg-purple-500', path: '/admin/classes' },
    { icon: BarChart3, label: 'Analytics', color: 'bg-orange-500', path: '/admin/reports' },
    { icon: Calendar, label: 'Schedule', color: 'bg-indigo-500', path: '/admin/timetable' },
    { icon: Settings, label: 'System', color: 'bg-pink-500', path: '/admin/settings' },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex`}>
      {/* LEFT SIDEBAR */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 rounded-r-3xl shadow-2xl z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Menu Items */}
        <div className="p-6">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  item.active 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Profile Card */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">{adminName || 'Admin'}</div>
                <div className="text-white/70 text-sm">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-64">
        {/* TOP NAVBAR */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`lg:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <div className={`w-6 h-0.5 ${isDarkMode ? 'bg-gray-300' : 'bg-gray-600'} mb-1`}></div>
                <div className={`w-6 h-0.5 ${isDarkMode ? 'bg-gray-300' : 'bg-gray-600'} mb-1`}></div>
                <div className={`w-6 h-0.5 ${isDarkMode ? 'bg-gray-300' : 'bg-gray-600'}`}></div>
              </button>
              <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {greeting}, {adminName?.split(' ')[0] || 'Admin'} 👋
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block">
                <SearchBar placeholder="Search admin functions..." />
              </div>
              
              
              {/* Theme Toggle */}
              <div 
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </div>
              
              {/* Logout Button */}
              <div 
                onClick={() => setShowLogoutDialog(true)}
                className={`p-2 rounded-lg cursor-pointer ${isDarkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors duration-200`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </div>
              
              {/* Profile Avatar */}
              <div 
                onClick={() => navigate('/admin/dashboard')}
                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
                title="Admin Dashboard"
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-64">
        {/* MAIN DASHBOARD CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Students Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col justify-between min-h-[120px]`}>
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Students</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{studentList.length}</div>
                  <div className="text-xs sm:text-sm text-blue-600">Enrolled</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Total Staff Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col justify-between min-h-[120px]`}>
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Staff</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{staffList.length}</div>
                  <div className="text-xs sm:text-sm text-green-600">Active</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Classes Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col justify-between min-h-[120px]`}>
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Classes</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{sections.length}</div>
                  <div className="text-xs sm:text-sm text-orange-600">Active</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Departments Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex flex-col justify-between min-h-[120px]`}>
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Department</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>{adminDeptName || 'N/A'}</div>
                  <div className="text-xs sm:text-sm text-purple-600">Current</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* AI ASSISTANT BANNER */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/25 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                  <Bot className="w-8 h-8 lg:w-10 lg:h-10 text-white animate-pulse" />
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2 leading-tight">
                    AI Admin Assistant
                  </div>
                  <div className="text-base lg:text-lg text-white/90 font-medium">
                    Get help with administrative tasks
                  </div>
                  <div className="text-sm text-white/70 mt-1 hidden lg:block">
                    • Staff Management • Student Oversight • System Analytics
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/ai-assistant')}
                className="bg-white text-blue-600 px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-3 w-full lg:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 group"
              >
                <span className="text-base lg:text-lg group-hover:text-blue-700 transition-colors">Chat with AI</span>
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* LOWER SECTION - 3 COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Quick Actions */}
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3 sm:mb-4`}>Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-3 sm:p-4 flex flex-col items-center space-y-2 transition-all duration-300 hover:shadow-md cursor-pointer transform hover:scale-105`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                      <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-center font-medium`}>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Staff */}
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3 sm:mb-4`}>Recent Staff</h3>
              {staffList.length === 0 ? (
                <div className="text-center py-8">
                  <Users className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-2`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No staff created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {staffList.slice(0, 4).map((s) => (
                    <div key={s.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {s.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>{s.full_name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{s.staff_code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Status */}
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3 sm:mb-4`}>System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Database</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Storage</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">78% Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>API Status</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Backup</span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABS SECTION */}
          <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'} rounded-xl shadow-md p-4 sm:p-6`}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 h-11">
                <TabsTrigger value="overview" className="text-[11px] font-semibold">Overview</TabsTrigger>
                <TabsTrigger value="staff" className="text-[11px] font-semibold">Staff</TabsTrigger>
                <TabsTrigger value="classes" className="text-[11px] font-semibold">Classes</TabsTrigger>
                <TabsTrigger value="assign" className="text-[11px] font-semibold">Assign</TabsTrigger>
                <TabsTrigger value="students" className="text-[11px] font-semibold">Students</TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Quick Actions */}
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-md p-5 space-y-3`}>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm`}>Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                      variant="outline"
                      className="h-auto py-3 flex-col gap-1.5"
                      onClick={() => { setActiveTab('staff'); setStaffDialogOpen(true); }}
                    >
                      <UserPlus className="w-5 h-5 text-accent" />
                      <span className="text-xs">Add Staff</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex-col gap-1.5"
                      onClick={() => setActiveTab('students')}
                    >
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <span className="text-xs">View Students</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex-col gap-1.5">
                      <BarChart3 className="w-5 h-5 text-warning" />
                      <span className="text-xs">Analytics</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-3 flex-col gap-1.5"
                      onClick={() => setActiveTab('classes')}
                    >
                      <BookOpen className="w-5 h-5 text-accent" />
                      <span className="text-xs">Manage Classes</span>
                    </Button>
                  </div>
                </div>

                  {/* Recent Activity */}
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-md p-5 space-y-3`}>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm`}>Recent Staff</h3>
                    {staffList.length === 0 ? (
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} py-4 text-center`}>No staff created yet</p>
                    ) : (
                      <div className="space-y-2">
                        {staffList.slice(0, 4).map((s) => (
                          <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-600">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                              {s.full_name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>{s.full_name}</p>
                              <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{s.staff_code}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Students */}
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-md p-5 space-y-3`}>
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm`}>Recent Students</h3>
                  {studentList.length === 0 ? (
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} py-4 text-center`}>No students registered yet</p>
                  ) : (
                    <div className="space-y-2">
                      {studentList.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-600">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                            {s.full_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>{s.full_name}</p>
                            <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{s.roll_number} · {s.email}</p>
                          </div>
                          <span className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} hidden sm:block`}>{formatDate(s.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

          {/* STAFF TAB */}
          <TabsContent value="staff" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="Search staff..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="max-w-xs h-10"
              />
              <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary text-primary-foreground gap-2 shrink-0">
                    <UserPlus className="w-4 h-4" />
                    Create Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Staff Account</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateStaff} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Full Name *</label>
                        <Input placeholder="Dr. Sharma" value={staffName} onChange={(e) => setStaffName(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Staff Code *</label>
                        <Input placeholder="STF001" value={staffCode} onChange={(e) => setStaffCode(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Email *</label>
                      <Input type="email" placeholder="staff@institution.edu" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Password *</label>
                        <Input type="password" placeholder="Min 6 chars" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required minLength={6} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Phone</label>
                        <Input placeholder="+91 98765..." value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} />
                      </div>
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={creating}>
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Staff Account'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loadingStaff ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
            ) : filteredStaff.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">{staffSearch ? 'No staff match your search' : 'No staff accounts created yet'}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredStaff.map((staff) => (
                  <Card key={staff.id} className="shadow-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-bold text-sm shrink-0">
                          {staff.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground">{staff.full_name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{staff.staff_code}</span>
                            <span>•</span>
                            <span className="truncate">{staff.email}</span>
                            {staff.phone && <><span className="hidden sm:inline">•</span><span className="hidden sm:inline">{staff.phone}</span></>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground hidden md:block">{formatDate(staff.created_at)}</span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove {staff.full_name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this staff account and all associated data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleRemoveStaff(staff.id, staff.full_name)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CLASSES TAB */}
          <TabsContent value="classes" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display font-bold text-foreground text-sm">All Classes</h3>
              <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary text-primary-foreground gap-2 shrink-0">
                    <UserPlus className="w-4 h-4" />
                    Create Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateClass} className="space-y-4 mt-2">
                     <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1.5">
                         <label className="text-xs font-medium text-foreground">Class Name *</label>
                         <Input placeholder="e.g. 2nd Year A Section" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} required />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-xs font-medium text-muted-foreground">Department</label>
                         <Input value={adminDeptName || 'Loading...'} disabled className="bg-muted" />
                       </div>
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-xs font-medium text-foreground">Semester *</label>
                       <Select value={newClassSemId} onValueChange={handleSemesterChange}>
                         <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                         <SelectContent>
                           {semesters.map((s) => (
                             <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>

                     {/* Class Teacher */}
                     <div className="space-y-2 p-3 rounded-lg border border-border bg-secondary/30">
                       <label className="text-xs font-bold text-foreground">Class Teacher *</label>
                       <p className="text-[10px] text-muted-foreground">A staff can be class teacher of only one class</p>
                       <div className="flex gap-2">
                         <Input
                           placeholder="Enter staff code"
                           value={ctStaffCode}
                           onChange={(e) => { setCtStaffCode(e.target.value); setCtNotFound(false); setCtAlreadyAssigned(false); setCtFound(null); }}
                           onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchClassTeacher())}
                         />
                         <Button type="button" variant="outline" size="sm" onClick={searchClassTeacher} disabled={ctSearching || !ctStaffCode.trim()}>
                           {ctSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                         </Button>
                       </div>
                       {ctNotFound && (
                         <p className="text-[10px] text-destructive flex items-center gap-1"><X className="w-3 h-3" /> Staff not found</p>
                       )}
                       {ctAlreadyAssigned && ctFound && (
                         <p className="text-[10px] text-warning flex items-center gap-1">⚠️ {ctFound.full_name} is already a class teacher elsewhere</p>
                       )}
                       {ctFound && !ctAlreadyAssigned && (
                         <div className="flex items-center gap-2 p-2 rounded-md bg-accent/10">
                           <Check className="w-3.5 h-3.5 text-accent" />
                           <span className="text-xs font-medium text-foreground">{ctFound.full_name}</span>
                           <span className="text-[10px] text-muted-foreground">({ctFound.staff_code})</span>
                         </div>
                       )}
                     </div>

                     {/* Subject Staff */}
                     {deptSubjects.length > 0 && (
                       <div className="space-y-2 p-3 rounded-lg border border-border bg-secondary/30">
                         <div className="flex items-center justify-between">
                           <label className="text-xs font-bold text-foreground">Subject Staff</label>
                           <Button
                             type="button"
                             variant="ghost"
                             size="sm"
                             className="h-6 text-[10px]"
                             onClick={() => setSubjectStaffList([...subjectStaffList, { staffCode: '', staff: null, subjectId: '', searching: false, notFound: false }])}
                           >
                             + Add Subject Staff
                           </Button>
                         </div>
                         {subjectStaffList.map((ss, idx) => (
                           <div key={idx} className="space-y-1.5 p-2 rounded-md bg-background border border-border">
                             <div className="flex gap-2">
                               <Select value={ss.subjectId} onValueChange={(v) => {
                                 const updated = [...subjectStaffList];
                                 updated[idx] = { ...updated[idx], subjectId: v };
                                 setSubjectStaffList(updated);
                               }}>
                                 <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue placeholder="Select subject" /></SelectTrigger>
                                 <SelectContent>
                                   {deptSubjects.map((sub) => (
                                     <SelectItem key={sub.id} value={sub.id}>{sub.name} ({sub.code})</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                               <Button
                                 type="button"
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8 text-destructive"
                                 onClick={() => setSubjectStaffList(subjectStaffList.filter((_, i) => i !== idx))}
                               >
                                 <X className="w-3.5 h-3.5" />
                               </Button>
                             </div>
                             <div className="flex gap-2">
                               <Input
                                 placeholder="Staff code"
                                 className="h-8 text-xs"
                                 value={ss.staffCode}
                                 onChange={(e) => {
                                   const updated = [...subjectStaffList];
                                   updated[idx] = { ...updated[idx], staffCode: e.target.value, notFound: false, staff: null };
                                   setSubjectStaffList(updated);
                                 }}
                                 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchSubjectStaff(idx))}
                               />
                               <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => searchSubjectStaff(idx)} disabled={ss.searching || !ss.staffCode.trim()}>
                                 {ss.searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                               </Button>
                             </div>
                             {ss.notFound && <p className="text-[10px] text-destructive">Staff not found</p>}
                             {ss.staff && (
                               <div className="flex items-center gap-2 p-1.5 rounded bg-accent/10">
                                 <Check className="w-3 h-3 text-accent" />
                                 <span className="text-[10px] font-medium">{ss.staff.full_name} ({ss.staff.staff_code})</span>
                               </div>
                             )}
                           </div>
                         ))}
                         {subjectStaffList.length === 0 && (
                           <p className="text-[10px] text-muted-foreground text-center py-2">No subject staff added yet. Click "+ Add Subject Staff" above.</p>
                         )}
                       </div>
                     )}

                     {newClassSemId && deptSubjects.length === 0 && (
                       <p className="text-[10px] text-muted-foreground text-center">No subjects found for this semester. You can add subjects later.</p>
                     )}

                     <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={creatingClass || !newClassName || !adminDeptId || !newClassSemId || !ctFound || ctAlreadyAssigned}>
                       {creatingClass ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Class'}
                     </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {sections.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No classes created yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Create your first class to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold">{adminDeptName}</Badge>
                  <span className="text-[10px] text-muted-foreground">
                    ({sections.filter((s) => s.department_id === adminDeptId).length} classes)
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {sections
                    .filter((s) => s.department_id === adminDeptId)
                    .map((sec) => (
                       <Card key={sec.id} className="shadow-card border-0">
                         <CardContent className="p-4">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                               <GraduationCap className="w-5 h-5 text-primary" />
                             </div>
                             <div className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/admin/class/${sec.id}`)}>
                               <h4 className="font-semibold text-sm text-foreground">{sec.name}</h4>
                               <p className="text-[10px] text-muted-foreground">
                                 {sec.semester?.label ?? 'No semester'}
                               </p>
                             </div>
                             <div className="flex items-center gap-1">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 text-accent hover:text-accent" 
                                 onClick={() => navigate(`/admin/class/${sec.id}`)}
                                 title="Manage Timetable"
                               >
                                 <Calendar className="w-4 h-4" />
                               </Button>
                               <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                     <Trash2 className="w-4 h-4" />
                                   </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent>
                                   <AlertDialogHeader>
                                     <AlertDialogTitle>Delete "{sec.name}"?</AlertDialogTitle>
                                     <AlertDialogDescription>
                                       This will permanently remove this class and may affect staff assignments and student records.
                                     </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
                                     <AlertDialogAction
                                       className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                       onClick={() => handleDeleteClass(sec.id, sec.name)}
                                     >
                                       Delete
                                     </AlertDialogAction>
                                   </AlertDialogFooter>
                                 </AlertDialogContent>
                               </AlertDialog>
                             </div>
                           </div>
                         </CardContent>
                       </Card>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ASSIGN TAB */}
          <TabsContent value="assign" className="space-y-4 mt-4">
            {/* Search by staff code */}
            <Card className="shadow-card border-0">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-accent" />
                  Assign Class to Staff
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Staff Code (e.g. STF001)"
                    value={assignStaffCode}
                    onChange={(e) => { setAssignStaffCode(e.target.value); setStaffNotFound(false); setFoundStaff(null); }}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchStaff()}
                  />
                  <Button onClick={handleSearchStaff} disabled={searchingStaff || !assignStaffCode.trim()} className="gap-2">
                    {searchingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </Button>
                </div>

                {staffNotFound && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <X className="w-4 h-4" />
                    No staff found with code "{assignStaffCode}"
                  </div>
                )}

                {foundStaff && (
                  <div className="space-y-4">
                    {/* Staff info card */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-bold text-sm shrink-0">
                        {foundStaff.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground">{foundStaff.full_name}</h4>
                          <Badge variant="secondary" className="text-[10px]">
                            <Check className="w-3 h-3 mr-1" /> Found
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{foundStaff.staff_code} · {foundStaff.email ?? 'No email'}</p>
                      </div>
                    </div>

                    {/* Assign section */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">Select Class to Assign</label>
                      <div className="flex gap-2">
                        <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Choose a class..." />
                          </SelectTrigger>
                          <SelectContent>
                            {sections.map((sec) => (
                              <SelectItem key={sec.id} value={sec.id}>
                                {sec.name} — {sec.department?.name ?? 'Unknown Dept'} ({sec.semester?.label ?? 'Sem ?'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAssignClass} disabled={assigning || !selectedSectionId} className="gradient-primary text-primary-foreground gap-2">
                          {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                          Assign
                        </Button>
                      </div>
                    </div>

                    {/* Current assignments */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-foreground">Current Assignments</h4>
                      {loadingAssignments ? (
                        <div className="h-12 rounded-lg bg-muted animate-pulse" />
                      ) : staffAssignments.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-3 text-center">No classes assigned yet</p>
                      ) : (
                        <div className="space-y-2">
                          {staffAssignments.map((a) => (
                            <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground">{a.section?.name ?? 'Unknown'}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {a.section?.department?.name ?? 'Unknown Dept'} ({a.section?.department?.code}) · {a.section?.semester?.label ?? ''}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-[10px] capitalize">{a.role_type.replace('_', ' ')}</Badge>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove assignment?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will unassign {foundStaff.full_name} from {a.section?.name}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleRemoveAssignment(a.id)}
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STUDENTS TAB */}
          <TabsContent value="students" className="space-y-4 mt-4">
            {loadingStudents ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
            ) : filteredStudents.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">{studentSearch ? 'No students match your search' : 'No students registered yet'}</p>
                  <p className="text-muted-foreground text-xs mt-1">Students register themselves via the student signup page.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="shadow-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground">{student.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{student.roll_number}</span>
                            <span>Department: {student.department || 'Not specified'}</span>
                            <span>Year: {student.year || 'Not specified'}</span>
                            <span>Class: 1st</span>
                            <span>Section: A</span>
                            <span>Attendance: 85%</span>
                            <span>CGPA: {student.cgpa || 'N/A'}</span>
                            <span>Phone: {student.phone || 'Not provided'}</span>
                            <span>Email: {student.email || 'Not provided'}</span>
                            <span>Created: {formatDate(student.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground hidden md:block">{formatDate(student.created_at)}</span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove {student.full_name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this student account, their attendance, marks, fees, and all associated data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleRemoveStudent(student.id, student.full_name)}
                                >
                                  Remove Student
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog 
        isOpen={showLogoutDialog} 
        onClose={() => setShowLogoutDialog(false)} 
      />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
