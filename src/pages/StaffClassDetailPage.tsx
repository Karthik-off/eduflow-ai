import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Users, Loader2, Search, Pencil, Save, X,
  GraduationCap, Phone, Mail, Hash, TrendingUp, DollarSign,
  BarChart3, ClipboardList, Plus, Brain, AlertTriangle, BookOpen,
  UserPlus, CheckCircle, XCircle, Eye, QrCode, Calendar, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import QRAttendancePanel from '@/components/attendance/QRAttendancePanel';

interface Student {
  id: string;
  user_id: string;
  roll_number: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cgpa: number | null;
  avatar_url: string | null;
  section_id: string | null;
  attendance_percentage: number | null;
}

interface SectionInfo {
  id: string;
  name: string;
  department_id: string;
  semester_id: string;
  departments: { name: string; code: string } | null;
  semesters: { label: string } | null;
}

interface FeeRecord {
  id: string;
  student_id: string;
  category: string;
  amount: number;
  is_paid: boolean;
  due_date: string | null;
  description: string | null;
}

interface AttendanceDay {
  date: string;
  present: number;
  absent: number;
  total: number;
}

interface MarkRecord {
  id: string;
  student_id: string;
  subject_id: string;
  exam_type: string;
  marks_obtained: number;
  max_marks: number;
  is_locked: boolean;
  subject_name?: string;
  subject_code?: string;
}

const StaffClassDetailPage = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { staffProfile } = useAuthStore();

  const [section, setSection] = useState<SectionInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('students');

  // Edit student
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '', cgpa: '' });
  const [saving, setSaving] = useState(false);

  // Add student
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState({ full_name: '', email: '', password: '', roll_number: '', phone: '' });
  const [addingStudent, setAddingStudent] = useState(false);

  // Fees
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [showAddFee, setShowAddFee] = useState(false);
  const [feeForm, setFeeForm] = useState({ category: 'tuition', amount: '', description: '', due_date: '', student_id: 'all' });
  const [addingFee, setAddingFee] = useState(false);

  // Attendance
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, 'present' | 'absent'>>({});
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [selectedSubjectForAttendance, setSelectedSubjectForAttendance] = useState('');
  const [studentAttendance, setStudentAttendance] = useState<Record<string, { present: number; total: number }>>({});

  // Marks
  const [allMarks, setAllMarks] = useState<MarkRecord[]>([]);
  const [marksLoading, setMarksLoading] = useState(false);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [showEnterMarks, setShowEnterMarks] = useState(false);
  const [marksForm, setMarksForm] = useState<{ subject_id: string; exam_type: string; max_marks: string; entries: Record<string, string> }>({
    subject_id: '', exam_type: 'unit_test', max_marks: '25', entries: {},
  });
  const [savingMarks, setSavingMarks] = useState(false);

  // Student detail view
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [studentFees, setStudentFees] = useState<FeeRecord[]>([]);
  const [studentMarks, setStudentMarks] = useState<MarkRecord[]>([]);
  const [editingCgpa, setEditingCgpa] = useState(false);
  const [cgpaValue, setCgpaValue] = useState('');
  const [savingCgpa, setSavingCgpa] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(false);
  const [attendanceValue, setAttendanceValue] = useState('');
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [editFeeForm, setEditFeeForm] = useState({ amount: '', is_paid: false, category: '', due_date: '' });
  const [savingFee, setSavingFee] = useState(false);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [editMarkValue, setEditMarkValue] = useState('');
  const [savingMark, setSavingMark] = useState(false);
  // Add fee for individual student
  const [showAddStudentFee, setShowAddStudentFee] = useState(false);
  const [studentFeeForm, setStudentFeeForm] = useState({ category: 'tuition', amount: '', description: '', due_date: '' });
  const [addingStudentFee, setAddingStudentFee] = useState(false);
  // Add mark for individual student
  const [showAddStudentMark, setShowAddStudentMark] = useState(false);
  const [studentMarkForm, setStudentMarkForm] = useState({ subject_id: '', exam_type: 'unit_test', max_marks: '25', marks_obtained: '' });
  const [addingStudentMark, setAddingStudentMark] = useState(false);

  // AI
  const [aiLoading, setAiLoading] = useState(false);

  // Timetable
  const [timetableEntries, setTimetableEntries] = useState<{ id: string; day_of_week: number; start_time: string; end_time: string; room: string | null; subject: { name: string; code: string } | null; staff: { full_name: string } | null }[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);

  const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    if (sectionId) {
      fetchSection();
      fetchStudents();
    }
  }, [sectionId]);

  useEffect(() => {
    if (activeTab === 'fees' && students.length > 0) fetchFees();
    if (activeTab === 'attendance') { fetchAttendance(); if (section) fetchMarksAndSubjects(); }
    if (activeTab === 'marks' && section) fetchMarksAndSubjects();
    if (activeTab === 'subjects' && section) fetchMarksAndSubjects();
    if (activeTab === 'timetable') fetchTimetable();
  }, [activeTab, students, section]);

  const fetchSection = async () => {
    const { data } = await supabase
      .from('sections')
      .select('id, name, department_id, semester_id, departments!sections_department_id_fkey(name, code), semesters!sections_semester_id_fkey(label)')
      .eq('id', sectionId!)
      .single();
    setSection(data as unknown as SectionInfo);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('id, user_id, roll_number, full_name, email, phone, cgpa, avatar_url, section_id, attendance_percentage')
      .eq('section_id', sectionId!)
      .order('roll_number', { ascending: true });
    if (error) toast.error('Failed to load students');
    else setStudents((data as Student[]) ?? []);
    setLoading(false);
  };

  const fetchTimetable = async () => {
    setTimetableLoading(true);
    const { data } = await supabase
      .from('timetable_entries')
      .select('id, day_of_week, start_time, end_time, room, subject:subjects(name, code), staff:staff(full_name)')
      .eq('section_id', sectionId!)
      .order('day_of_week')
      .order('start_time');
    setTimetableEntries((data as any) ?? []);
    setTimetableLoading(false);
  };

  // --- NOTIFY STUDENT ---
  const notifyStudent = async (studentId: string, title: string, message: string, type: string) => {
    await supabase.from('notifications').insert({
      student_id: studentId,
      title,
      message,
      type,
      created_by: staffProfile?.id || null,
    } as any);
  };

  const notifyStudents = async (studentIds: string[], title: string, message: string, type: string) => {
    const rows = studentIds.map(sid => ({
      student_id: sid,
      title,
      message,
      type,
      created_by: staffProfile?.id || null,
    }));
    await supabase.from('notifications').insert(rows as any);
  };

  // --- ADD STUDENT ---
  const handleAddStudent = async () => {
    const { full_name, email, password, roll_number } = addStudentForm;
    if (!full_name || !email || !password || !roll_number) {
      toast.error('All fields except phone are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setAddingStudent(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-student', {
        body: {
          email,
          password,
          fullName: full_name,
          rollNumber: roll_number,
          phone: addStudentForm.phone || null,
          sectionId: sectionId,
          departmentId: section?.department_id,
          semesterId: section?.semester_id,
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || 'Failed');
      toast.success(`${full_name} added to class`);
      setShowAddStudent(false);
      setAddStudentForm({ full_name: '', email: '', password: '', roll_number: '', phone: '' });
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    }
    setAddingStudent(false);
  };

  // --- FEES ---
  const fetchFees = async () => {
    setFeesLoading(true);
    const studentIds = students.map(s => s.id);
    const { data } = await supabase
      .from('fees')
      .select('*')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });
    setFees((data as FeeRecord[]) ?? []);
    setFeesLoading(false);
  };

  const handleAddFee = async () => {
    if (!feeForm.amount || parseFloat(feeForm.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setAddingFee(true);
    const targetStudents = feeForm.student_id === 'all' ? students : students.filter(s => s.id === feeForm.student_id);
    const rows = targetStudents.map(s => ({
      student_id: s.id,
      category: feeForm.category,
      amount: parseFloat(feeForm.amount),
      description: feeForm.description || null,
      due_date: feeForm.due_date || null,
    }));

    const { error } = await supabase.from('fees').insert(rows);
    if (error) {
      toast.error('Failed to add fees: ' + error.message);
    } else {
      // Notify students about new fee
      const desc = feeForm.description ? ` (${feeForm.description})` : '';
      const due = feeForm.due_date ? ` — Due by ${new Date(feeForm.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : '';
      await notifyStudents(
        targetStudents.map(s => s.id),
        'New Fee Added',
        `A new ${feeForm.category.charAt(0).toUpperCase() + feeForm.category.slice(1)} fee of ₹${parseFloat(feeForm.amount).toLocaleString('en-IN')}${desc} has been added to your account${due}. Please pay before the due date to avoid penalties.`,
        'fee_added'
      );
      toast.success(`Fee added for ${targetStudents.length} student(s)`);
      setShowAddFee(false);
      setFeeForm({ category: 'tuition', amount: '', description: '', due_date: '', student_id: 'all' });
      fetchFees();
    }
    setAddingFee(false);
  };

  // --- ATTENDANCE ---
  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    const { data: sessions } = await supabase
      .from('attendance_sessions')
      .select('id, session_date')
      .eq('section_id', sectionId!)
      .order('session_date', { ascending: false })
      .limit(30);

    if (!sessions || sessions.length === 0) {
      setAttendanceDays([]);
      setStudentAttendance({});
      setAttendanceLoading(false);
      return;
    }

    const sessionIds = sessions.map(s => s.id);
    const { data: records } = await supabase
      .from('attendance_records')
      .select('session_id, student_id, status')
      .in('session_id', sessionIds);

    const dayMap = new Map<string, AttendanceDay>();
    for (const s of sessions) {
      dayMap.set(s.id, { date: s.session_date, present: 0, absent: 0, total: 0 });
    }

    // Per-student stats
    const studentStats: Record<string, { present: number; total: number }> = {};

    for (const r of records ?? []) {
      const day = dayMap.get(r.session_id);
      if (day) {
        day.total++;
        if (r.status === 'present') day.present++;
        else day.absent++;
      }
      // Track per-student
      if (!studentStats[r.student_id]) {
        studentStats[r.student_id] = { present: 0, total: 0 };
      }
      studentStats[r.student_id].total++;
      if (r.status === 'present') studentStats[r.student_id].present++;
    }

    setStudentAttendance(studentStats);
    setAttendanceDays([...dayMap.values()]);
    setAttendanceLoading(false);
  };

  const openMarkAttendance = () => {
    const initial: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => { initial[s.id] = 'present'; });
    setAttendanceStatus(initial);
    setShowMarkAttendance(true);
  };

  const handleMarkAttendance = async () => {
    if (!selectedSubjectForAttendance) {
      toast.error('Select a subject');
      return;
    }
    setMarkingAttendance(true);
    try {
      // Create session
      const { data: session, error: sessionErr } = await supabase
        .from('attendance_sessions')
        .insert({
          section_id: sectionId!,
          subject_id: selectedSubjectForAttendance,
          staff_id: staffProfile!.id,
          is_active: false,
          session_date: new Date().toISOString().split('T')[0],
        })
        .select('id')
        .single();

      if (sessionErr || !session) throw sessionErr;

      // Insert records
      const records = Object.entries(attendanceStatus).map(([studentId, status]) => ({
        session_id: session.id,
        student_id: studentId,
        status,
      }));
      const { error: recErr } = await supabase.from('attendance_records').insert(records);
      if (recErr) throw recErr;

      // Notify absent students
      const absentStudentIds = Object.entries(attendanceStatus)
        .filter(([_, status]) => status === 'absent')
        .map(([id]) => id);

      if (absentStudentIds.length > 0) {
        const subj = subjects.find(s => s.id === selectedSubjectForAttendance);
        await notifyStudents(
          absentStudentIds,
          'Attendance Marked - Absent',
          `You were marked absent for ${subj?.name || 'a class'} on ${new Date().toLocaleDateString()}.`,
          'attendance_updated'
        );
      }

      toast.success(`Attendance marked for ${students.length} students`);
      setShowMarkAttendance(false);
      fetchAttendance();
    } catch (err: any) {
      toast.error('Failed to mark attendance: ' + (err?.message || 'Unknown error'));
    }
    setMarkingAttendance(false);
  };

  // --- MARKS ---
  const fetchMarksAndSubjects = async () => {
    setMarksLoading(true);
    const { data: subjs } = await supabase
      .from('subjects')
      .select('id, name, code')
      .eq('department_id', section!.department_id)
      .eq('semester_id', section!.semester_id);
    setSubjects((subjs ?? []) as any);

    const studentIds = students.map(s => s.id);
    if (studentIds.length > 0 && subjs && subjs.length > 0) {
      const { data: marks } = await supabase
        .from('marks')
        .select('id, student_id, subject_id, exam_type, marks_obtained, max_marks, is_locked')
        .in('student_id', studentIds)
        .in('subject_id', subjs.map(s => s.id));

      const enriched = (marks ?? []).map(m => {
        const subj = subjs.find(s => s.id === m.subject_id);
        return { ...m, subject_name: subj?.name, subject_code: subj?.code } as MarkRecord;
      });
      setAllMarks(enriched);
    }
    setMarksLoading(false);
  };

  const openEnterMarks = () => {
    const entries: Record<string, string> = {};
    students.forEach(s => { entries[s.id] = ''; });
    setMarksForm({ subject_id: subjects[0]?.id || '', exam_type: 'unit_test', max_marks: '25', entries });
    setShowEnterMarks(true);
  };

  const handleSaveMarks = async () => {
    if (!marksForm.subject_id || !marksForm.max_marks) {
      toast.error('Select subject and set max marks');
      return;
    }
    const maxMarks = parseFloat(marksForm.max_marks);
    const rows: any[] = [];
    for (const [studentId, val] of Object.entries(marksForm.entries)) {
      if (val === '') continue;
      const obtained = parseFloat(val);
      if (isNaN(obtained) || obtained < 0 || obtained > maxMarks) {
        const student = students.find(s => s.id === studentId);
        toast.error(`Invalid marks for ${student?.full_name}: must be 0-${maxMarks}`);
        return;
      }
      rows.push({
        student_id: studentId,
        subject_id: marksForm.subject_id,
        exam_type: marksForm.exam_type,
        marks_obtained: obtained,
        max_marks: maxMarks,
        entered_by: staffProfile?.id,
      });
    }

    if (rows.length === 0) {
      toast.error('Enter marks for at least one student');
      return;
    }

    setSavingMarks(true);
    const { error } = await supabase.from('marks').insert(rows);
    if (error) {
      toast.error('Failed to save marks: ' + error.message);
    } else {
      const subj = subjects.find(s => s.id === marksForm.subject_id);
      await notifyStudents(
        rows.map(r => r.student_id),
        'Marks Published',
        `Your marks for ${subj?.name || 'a subject'} (${subj?.code ? subj.code + ' — ' : ''}${marksForm.exam_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}) have been published. You scored out of ${marksForm.max_marks} marks. Open Academics to view your result.`,
        'marks_updated'
      );
      toast.success(`Marks saved for ${rows.length} students`);
      setShowEnterMarks(false);
      fetchMarksAndSubjects();
    }
    setSavingMarks(false);
  };

  // --- VIEW STUDENT PROFILE ---
  const openStudentProfile = async (student: Student) => {
    setViewStudent(student);
    setEditingCgpa(false);
    setCgpaValue(student.cgpa?.toString() ?? '');
    setEditingAttendance(false);
    setAttendanceValue(student.attendance_percentage?.toString() ?? '0');
    setEditingFeeId(null);
    setEditingMarkId(null);
    setShowAddStudentFee(false);
    setShowAddStudentMark(false);
    // Fetch this student's fees and marks
    const [feesRes, marksRes] = await Promise.all([
      supabase.from('fees').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
      supabase.from('marks').select('id, student_id, subject_id, exam_type, marks_obtained, max_marks, is_locked').eq('student_id', student.id),
    ]);
    setStudentFees((feesRes.data as FeeRecord[]) ?? []);
    const enriched = (marksRes.data ?? []).map((m: any) => {
      const subj = subjects.find(s => s.id === m.subject_id);
      return { ...m, subject_name: subj?.name, subject_code: subj?.code } as MarkRecord;
    });
    setStudentMarks(enriched);
  };

  const handleSaveCgpa = async () => {
    if (!viewStudent) return;
    const val = parseFloat(cgpaValue);
    if (isNaN(val) || val < 0 || val > 10) {
      toast.error('CGPA must be between 0 and 10');
      return;
    }
    setSavingCgpa(true);
    const { error } = await supabase.from('students').update({ cgpa: val }).eq('id', viewStudent.id);
    if (error) toast.error('Failed to update CGPA');
    else {
      toast.success('CGPA updated');
      await notifyStudent(viewStudent.id, 'CGPA Updated', `Your CGPA has been updated to ${val.toFixed(2)} by your class incharge. This reflects your overall academic performance. Open Academics to view your details.`, 'info');
      setViewStudent({ ...viewStudent, cgpa: val });
      setStudents(prev => prev.map(s => s.id === viewStudent.id ? { ...s, cgpa: val } : s));
      setEditingCgpa(false);
    }
    setSavingCgpa(false);
  };

  const handleSaveAttendance = async () => {
    if (!viewStudent) return;
    const val = parseFloat(attendanceValue);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error('Attendance must be between 0 and 100');
      return;
    }
    setSavingAttendance(true);
    const { error } = await supabase.from('students').update({ attendance_percentage: val } as any).eq('id', viewStudent.id);
    if (error) toast.error('Failed to update attendance');
    else {
      toast.success('Attendance updated');
      await notifyStudent(viewStudent.id, 'Attendance Updated', `Your attendance has been updated to ${val}% by your class incharge. ${val < 75 ? '⚠️ Your attendance is below 75%. Please attend classes regularly to meet the minimum requirement.' : val >= 90 ? '🎉 Excellent! Keep maintaining your great attendance.' : '✅ Your attendance is within the acceptable range.'}`, 'attendance_updated');
      setViewStudent({ ...viewStudent, attendance_percentage: val });
      setStudents(prev => prev.map(s => s.id === viewStudent.id ? { ...s, attendance_percentage: val } : s));
      setEditingAttendance(false);
    }
    setSavingAttendance(false);
  };

  const handleSaveStudentFee = async (feeId: string) => {
    setSavingFee(true);
    const { error } = await supabase.from('fees').update({
      amount: parseFloat(editFeeForm.amount),
      is_paid: editFeeForm.is_paid,
      category: editFeeForm.category,
      due_date: editFeeForm.due_date || null,
    }).eq('id', feeId);
    if (error) toast.error('Failed to update fee');
    else {
      toast.success('Fee updated');
      const paidStatus = editFeeForm.is_paid ? ' This fee has been marked as PAID.' : '';
      await notifyStudent(viewStudent!.id, 'Fee Record Updated', `Your ${editFeeForm.category.charAt(0).toUpperCase() + editFeeForm.category.slice(1)} fee has been updated to ₹${parseFloat(editFeeForm.amount).toLocaleString('en-IN')}.${paidStatus} Open Fees & Payments to view your updated records.`, 'fee_added');
      setStudentFees(prev => prev.map(f => f.id === feeId ? { ...f, amount: parseFloat(editFeeForm.amount), is_paid: editFeeForm.is_paid, category: editFeeForm.category, due_date: editFeeForm.due_date || null } : f));
      setEditingFeeId(null);
    }
    setSavingFee(false);
  };

  const handleAddStudentFee = async () => {
    if (!viewStudent || !studentFeeForm.amount || parseFloat(studentFeeForm.amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setAddingStudentFee(true);
    const { data, error } = await supabase.from('fees').insert({
      student_id: viewStudent.id,
      category: studentFeeForm.category,
      amount: parseFloat(studentFeeForm.amount),
      description: studentFeeForm.description || null,
      due_date: studentFeeForm.due_date || null,
    }).select().single();
    if (error) toast.error('Failed to add fee');
    else {
      toast.success('Fee added');
      const dueMsg = studentFeeForm.due_date ? ` — Due by ${new Date(studentFeeForm.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : '';
      const descMsg = studentFeeForm.description ? ` for ${studentFeeForm.description}` : '';
      await notifyStudent(viewStudent.id, 'New Fee Added', `A new ${studentFeeForm.category.charAt(0).toUpperCase() + studentFeeForm.category.slice(1)} fee of ₹${parseFloat(studentFeeForm.amount).toLocaleString('en-IN')}${descMsg} has been added to your account${dueMsg}. Please pay on time to avoid late charges.`, 'fee_added');
      setStudentFees(prev => [data as FeeRecord, ...prev]);
      setShowAddStudentFee(false);
      setStudentFeeForm({ category: 'tuition', amount: '', description: '', due_date: '' });
    }
    setAddingStudentFee(false);
  };

  const handleSaveStudentMark = async (mark: MarkRecord) => {
    const val = parseFloat(editMarkValue);
    if (isNaN(val) || val < 0 || val > mark.max_marks) {
      toast.error(`Marks must be between 0 and ${mark.max_marks}`);
      return;
    }
    setSavingMark(true);
    const { error } = await supabase.from('marks').update({ marks_obtained: val }).eq('id', mark.id);
    if (error) toast.error('Failed to update marks');
    else {
      toast.success('Marks updated');
      await notifyStudent(viewStudent!.id, 'Marks Updated', `Your marks for ${mark.subject_name || 'a subject'}${mark.subject_code ? ` (${mark.subject_code})` : ''} — ${mark.exam_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} have been updated to ${val} out of ${mark.max_marks}. Open Academics to view your full scorecard.`, 'marks_updated');
      setStudentMarks(prev => prev.map(m => m.id === mark.id ? { ...m, marks_obtained: val } : m));
      setEditingMarkId(null);
    }
    setSavingMark(false);
  };

  const handleAddStudentMark = async () => {
    if (!viewStudent) return;
    const { subject_id, exam_type, max_marks, marks_obtained } = studentMarkForm;
    if (!subject_id || !marks_obtained || !max_marks) {
      toast.error('Fill all required fields');
      return;
    }
    const maxVal = parseFloat(max_marks);
    const obtained = parseFloat(marks_obtained);
    if (isNaN(obtained) || obtained < 0 || obtained > maxVal) {
      toast.error(`Marks must be between 0 and ${maxVal}`);
      return;
    }
    setAddingStudentMark(true);
    const { data, error } = await supabase.from('marks').insert({
      student_id: viewStudent.id,
      subject_id,
      exam_type,
      max_marks: maxVal,
      marks_obtained: obtained,
      entered_by: staffProfile?.id,
    }).select().single();
    if (error) toast.error('Failed to add marks: ' + error.message);
    else {
      const subj = subjects.find(s => s.id === subject_id);
      const enriched: MarkRecord = { ...(data as any), subject_name: subj?.name, subject_code: subj?.code };
      setStudentMarks(prev => [enriched, ...prev]);
      toast.success('Marks added');
      await notifyStudent(viewStudent.id, 'Marks Published', `Your marks for ${subj?.name || 'a subject'}${subj?.code ? ` (${subj.code})` : ''} — ${exam_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} have been published: ${obtained} out of ${maxVal}. Open Academics to view your full scorecard.`, 'marks_updated');
      setShowAddStudentMark(false);
      setStudentMarkForm({ subject_id: '', exam_type: 'unit_test', max_marks: '25', marks_obtained: '' });
    }
    setAddingStudentMark(false);
  };


  const openEdit = (s: Student) => {
    setEditStudent(s);
    setEditForm({ full_name: s.full_name, email: s.email ?? '', phone: s.phone ?? '', cgpa: s.cgpa?.toString() ?? '' });
  };

  const handleSave = async () => {
    if (!editStudent) return;
    setSaving(true);
    const { error } = await supabase
      .from('students')
      .update({
        full_name: editForm.full_name,
        email: editForm.email || null,
        phone: editForm.phone || null,
        cgpa: editForm.cgpa ? parseFloat(editForm.cgpa) : null,
      })
      .eq('id', editStudent.id);

    if (error) {
      toast.error('Failed to update student');
    } else {
      await notifyStudent(
        editStudent.id,
        'Profile Updated',
        `Your profile details have been updated by your class incharge. Name: ${editForm.full_name}${editForm.phone ? ` | Phone: ${editForm.phone}` : ''}${editForm.email ? ` | Email: ${editForm.email}` : ''}. If any information is incorrect, please contact your class incharge.`,
        'info'
      );
      toast.success(`${editForm.full_name} updated`);
      setEditStudent(null);
      fetchStudents();
    }
    setSaving(false);
  };

  // --- AI REMINDER ---
  const handleAIReminder = async () => {
    const lowStudents = students.filter(s => (s.cgpa ?? 0) < 5);
    if (lowStudents.length === 0) {
      toast.info('No students below threshold for reminders');
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-academic', {
        body: {
          type: 'parent_reminder',
          studentNames: lowStudents.map(s => s.full_name),
          subject: 'Overall Performance',
          dueType: 'Low CGPA (below 5.0)',
        },
      });
      if (error) throw error;
      toast.success('AI Reminder Generated', { description: data?.message || 'Reminder ready' });
    } catch {
      toast.error('Failed to generate AI reminder');
    }
    setAiLoading(false);
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  const deptName = (section as any)?.departments?.name ?? '';
  const deptCode = (section as any)?.departments?.code ?? '';
  const semLabel = (section as any)?.semesters?.label ?? '';

  const getAttendanceColor = (pct: number) => {
    if (pct >= 90) return 'bg-accent';
    if (pct >= 75) return 'bg-primary';
    if (pct >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-5xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/staff/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold font-display text-foreground truncate">
              {section?.name ?? 'Class'}
            </h1>
            <p className="text-[10px] text-muted-foreground">{deptName} ({deptCode}) · {semLabel}</p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            <Users className="w-3 h-3 mr-1" />{students.length}
          </Badge>
        </div>
      </header>

      <main className="px-4 py-5 max-w-5xl mx-auto space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="students" className="text-xs gap-1">
              <Users className="w-3 h-3" /> Students
            </TabsTrigger>
            <TabsTrigger value="subjects" className="text-xs gap-1">
              <BookOpen className="w-3 h-3" /> Subjects
            </TabsTrigger>
            <TabsTrigger value="fees" className="text-xs gap-1">
              <DollarSign className="w-3 h-3" /> Fees
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs gap-1">
              <BarChart3 className="w-3 h-3" /> Attend
            </TabsTrigger>
            <TabsTrigger value="marks" className="text-xs gap-1">
              <ClipboardList className="w-3 h-3" /> Marks
            </TabsTrigger>
            <TabsTrigger value="timetable" className="text-xs gap-1">
              <Calendar className="w-3 h-3" /> Schedule
            </TabsTrigger>
          </TabsList>

          {/* STUDENTS TAB */}
          <TabsContent value="students" className="space-y-3 mt-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
              <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={() => setShowAddStudent(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
              <Button variant="outline" size="sm" onClick={handleAIReminder} disabled={aiLoading} className="text-xs">
                <Brain className="w-3.5 h-3.5 mr-1" /> {aiLoading ? '...' : 'AI'}
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{search ? 'No students match' : 'No students in this class'}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map(student => (
                  <Card key={student.id} className="shadow-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                          {student.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openStudentProfile(student)}>
                          <h4 className="text-sm font-semibold text-foreground">{student.full_name}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-0.5"><Hash className="w-3 h-3" />{student.roll_number}</span>
                            {student.email && <span className="flex items-center gap-0.5 truncate"><Mail className="w-3 h-3" />{student.email}</span>}
                            {student.cgpa !== null && (
                              <span className={`flex items-center gap-0.5 ${(student.cgpa ?? 0) < 5 ? 'text-destructive font-semibold' : ''}`}>
                                <TrendingUp className="w-3 h-3" />CGPA: {student.cgpa}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => openStudentProfile(student)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => openEdit(student)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* SUBJECTS TAB */}
          <TabsContent value="subjects" className="space-y-3 mt-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-display text-foreground">Class Subjects</h3>
              <Badge variant="secondary" className="text-[10px]">{subjects.length} subjects</Badge>
            </div>

            {marksLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : subjects.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No subjects assigned to this class yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Contact your admin to add subjects</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {subjects.map(subj => (
                  <Card
                    key={subj.id}
                    className="shadow-card border-0 cursor-pointer hover:shadow-elevated transition-all active:scale-[0.98]"
                    onClick={() => navigate(`/staff/subject/${sectionId}/${subj.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold font-display text-foreground">{subj.name}</h4>
                          <p className="text-[10px] text-muted-foreground">{subj.code}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                      <div className="flex gap-3 mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <ClipboardList className="w-3 h-3" /> Marks
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <BookOpen className="w-3 h-3" /> Materials
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Brain className="w-3 h-3" /> AI Recovery
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* FEES TAB */}
          <TabsContent value="fees" className="space-y-3 mt-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-display text-foreground">Fee Management</h3>
              <Button size="sm" className="gradient-accent text-accent-foreground text-xs" onClick={() => setShowAddFee(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Fee
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Card className="shadow-card border-0">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold font-display text-foreground">{fees.length}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-0">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold font-display text-accent">{fees.filter(f => f.is_paid).length}</p>
                  <p className="text-[10px] text-muted-foreground">Paid</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-0">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold font-display text-destructive">{fees.filter(f => !f.is_paid).length}</p>
                  <p className="text-[10px] text-muted-foreground">Unpaid</p>
                </CardContent>
              </Card>
            </div>

            {feesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-2">
                {fees.slice(0, 50).map(fee => {
                  const student = students.find(s => s.id === fee.student_id);
                  return (
                    <Card key={fee.id} className="shadow-card border-0">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{student?.full_name ?? 'Unknown'}</p>
                          <p className="text-[10px] text-muted-foreground">{fee.category} · ₹{fee.amount}{fee.due_date ? ` · Due: ${fee.due_date}` : ''}</p>
                        </div>
                        <Badge variant={fee.is_paid ? 'default' : 'destructive'} className="text-[10px]">
                          {fee.is_paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
                {fees.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">No fee records yet</p>
                )}
              </div>
            )}
          </TabsContent>

          {/* ATTENDANCE TAB */}
          <TabsContent value="attendance" className="space-y-3 mt-3">
            {/* QR Attendance - always shown for class incharge */}
            <QRAttendancePanel
              sectionId={sectionId!}
              staffId={staffProfile!.id}
              studentCount={students.length}
            />

            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-display text-foreground">Attendance History (Last 30)</h3>
            </div>
            {attendanceLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : attendanceDays.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No attendance sessions recorded</p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {attendanceDays.map((day, i) => {
                    const pct = day.total > 0 ? (day.present / day.total) * 100 : 0;
                    return (
                      <div key={i} className="group relative">
                        <div className={`w-8 h-8 rounded ${getAttendanceColor(pct)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`} />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-elevated whitespace-nowrap z-10">
                          {day.date}: {day.present}/{day.total} ({pct.toFixed(0)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent" /> ≥90%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary" /> ≥75%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-warning" /> ≥50%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive" /> &lt;50%</span>
                </div>
              </div>
            )}

            {/* Per-Student Attendance */}
            {!attendanceLoading && students.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold font-display text-foreground">Student Attendance (%)</h3>
                <div className="space-y-1.5">
                  {students.map(s => {
                    const stats = studentAttendance[s.id];
                    const pct = stats && stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
                    const sessionsAttended = stats?.present ?? 0;
                    const totalSessions = stats?.total ?? 0;
                    return (
                      <Card key={s.id} className="shadow-card border-0">
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-[10px] shrink-0">
                            {s.full_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{s.full_name}</p>
                            <p className="text-[10px] text-muted-foreground">{s.roll_number} · {sessionsAttended}/{totalSessions} sessions</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 75 ? 'bg-accent' : pct >= 50 ? 'bg-primary' : 'bg-destructive'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold min-w-[40px] text-right ${pct >= 75 ? 'text-accent' : pct >= 50 ? 'text-primary' : 'text-destructive'}`}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* MARKS TAB */}
          <TabsContent value="marks" className="space-y-3 mt-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-display text-foreground">All Subject Marks</h3>
              {subjects.length > 0 && (
                <Button size="sm" className="gradient-accent text-accent-foreground text-xs" onClick={openEnterMarks}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Enter Marks
                </Button>
              )}
            </div>
            {marksLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : subjects.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No subjects found for this class</p>
            ) : (
              <div className="space-y-4">
                {subjects.map(subj => {
                  const subjectMarks = allMarks.filter(m => m.subject_id === subj.id);
                  const examTypes = [...new Set(subjectMarks.map(m => m.exam_type))];
                  return (
                    <Card key={subj.id} className="shadow-card border-0">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          {subj.name} <span className="text-[10px] text-muted-foreground font-normal">({subj.code})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        {examTypes.length === 0 ? (
                          <p className="text-[10px] text-muted-foreground">No marks entered yet</p>
                        ) : (
                          <div className="space-y-2">
                            {examTypes.map(et => {
                              const etMarks = subjectMarks.filter(m => m.exam_type === et);
                              const avg = etMarks.length > 0
                                ? (etMarks.reduce((s, m) => s + (m.marks_obtained / m.max_marks) * 100, 0) / etMarks.length)
                                : 0;
                              return (
                                <div key={et} className="flex items-center justify-between">
                                  <div>
                                    <Badge variant="secondary" className="text-[10px]">{et.replace('_', ' ')}</Badge>
                                    <span className="text-[10px] text-muted-foreground ml-2">{etMarks.length} students</span>
                                  </div>
                                  <span className={`text-xs font-semibold ${avg < 40 ? 'text-destructive' : avg < 60 ? 'text-warning' : 'text-accent'}`}>
                                    Avg: {avg.toFixed(1)}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TIMETABLE TAB */}
          <TabsContent value="timetable" className="space-y-4 mt-3">
            {timetableLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : timetableEntries.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No timetable configured for this class</p>
                  <p className="text-xs text-muted-foreground mt-1">Contact the admin to set up the class schedule</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(dayNum => {
                  const dayEntries = timetableEntries.filter(e => e.day_of_week === dayNum);
                  if (dayEntries.length === 0) return null;
                  
                  const formatTime = (time: string) => {
                    const [hours, minutes] = time.split(':');
                    const h = parseInt(hours);
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const h12 = h % 12 || 12;
                    return `${h12}:${minutes} ${ampm}`;
                  };

                  return (
                    <Card key={dayNum} className="shadow-card border-0">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">{DAYS[dayNum]}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {dayEntries.map(entry => (
                          <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-xs">
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-foreground">{entry.subject?.name ?? 'Subject'}</span>
                              <span className="text-muted-foreground ml-2">({entry.subject?.code ?? '-'})</span>
                              {entry.room && <span className="text-muted-foreground ml-2">· {entry.room}</span>}
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className="text-muted-foreground">{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
                              {entry.staff?.full_name && (
                                <p className="text-[10px] text-muted-foreground">{entry.staff.full_name}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Student Dialog */}
      <Dialog open={!!editStudent} onOpenChange={(open) => !open && setEditStudent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-accent" /> Edit Student
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Full Name</label>
              <Input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Email</label>
                <Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Phone</label>
                <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">CGPA</label>
              <Input type="number" step="0.01" min="0" max="10" value={editForm.cgpa} onChange={e => setEditForm(f => ({ ...f, cgpa: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditStudent(null)}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleSave} disabled={saving || !editForm.full_name.trim()}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Save</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" /> Add New Student
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Full Name *</label>
              <Input value={addStudentForm.full_name} onChange={e => setAddStudentForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Roll Number *</label>
              <Input value={addStudentForm.roll_number} onChange={e => setAddStudentForm(f => ({ ...f, roll_number: e.target.value }))} placeholder="CS2024001" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Email *</label>
                <Input type="email" value={addStudentForm.email} onChange={e => setAddStudentForm(f => ({ ...f, email: e.target.value }))} placeholder="student@email.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Password *</label>
                <Input type="password" value={addStudentForm.password} onChange={e => setAddStudentForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 chars" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Phone</label>
              <Input value={addStudentForm.phone} onChange={e => setAddStudentForm(f => ({ ...f, phone: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddStudent(false)}>Cancel</Button>
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleAddStudent} disabled={addingStudent}>
                {addingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-1" /> Add Student</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Fee Dialog */}
      <Dialog open={showAddFee} onOpenChange={setShowAddFee}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-accent" /> Add Fee
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Apply To</label>
              <Select value={feeForm.student_id} onValueChange={v => setFeeForm(f => ({ ...f, student_id: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students (Bulk)</SelectItem>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Category</label>
                <Select value={feeForm.category} onValueChange={v => setFeeForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="exam">Exam Fee</SelectItem>
                    <SelectItem value="lab">Lab Fee</SelectItem>
                    <SelectItem value="library">Library Fine</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Amount (₹)</label>
                <Input type="number" min="1" value={feeForm.amount} onChange={e => setFeeForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description</label>
              <Input value={feeForm.description} onChange={e => setFeeForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Due Date</label>
              <Input type="date" value={feeForm.due_date} onChange={e => setFeeForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddFee(false)}>Cancel</Button>
              <Button className="flex-1 gradient-accent text-accent-foreground" onClick={handleAddFee} disabled={addingFee}>
                {addingFee ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Add Fee</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark Attendance Dialog */}
      <Dialog open={showMarkAttendance} onOpenChange={setShowMarkAttendance}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Mark Attendance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Subject *</label>
              <Select value={selectedSubjectForAttendance} onValueChange={setSelectedSubjectForAttendance}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-medium text-foreground">Students</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="text-[10px] h-6" onClick={() => {
                    const all: Record<string, 'present' | 'absent'> = {};
                    students.forEach(s => { all[s.id] = 'present'; });
                    setAttendanceStatus(all);
                  }}>All Present</Button>
                  <Button variant="outline" size="sm" className="text-[10px] h-6" onClick={() => {
                    const all: Record<string, 'present' | 'absent'> = {};
                    students.forEach(s => { all[s.id] = 'absent'; });
                    setAttendanceStatus(all);
                  }}>All Absent</Button>
                </div>
              </div>
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
                      {s.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{s.full_name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.roll_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={attendanceStatus[s.id] === 'present' ? 'default' : 'outline'}
                      className={`h-7 text-[10px] ${attendanceStatus[s.id] === 'present' ? 'bg-accent text-accent-foreground' : ''}`}
                      onClick={() => setAttendanceStatus(prev => ({ ...prev, [s.id]: 'present' }))}
                    >
                      <CheckCircle className="w-3 h-3 mr-0.5" /> P
                    </Button>
                    <Button
                      size="sm"
                      variant={attendanceStatus[s.id] === 'absent' ? 'default' : 'outline'}
                      className={`h-7 text-[10px] ${attendanceStatus[s.id] === 'absent' ? 'bg-destructive text-destructive-foreground' : ''}`}
                      onClick={() => setAttendanceStatus(prev => ({ ...prev, [s.id]: 'absent' }))}
                    >
                      <XCircle className="w-3 h-3 mr-0.5" /> A
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleMarkAttendance} disabled={markingAttendance || !selectedSubjectForAttendance}>
              {markingAttendance ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Attendance'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enter Marks Dialog */}
      <Dialog open={showEnterMarks} onOpenChange={setShowEnterMarks}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-accent" /> Enter Marks
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Subject</label>
                <Select value={marksForm.subject_id} onValueChange={v => setMarksForm(f => ({ ...f, subject_id: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Exam Type</label>
                <Select value={marksForm.exam_type} onValueChange={v => setMarksForm(f => ({ ...f, exam_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit_test">Unit Test</SelectItem>
                    <SelectItem value="mid_term">Mid Term</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Max Marks</label>
                <Input type="number" min="1" value={marksForm.max_marks} onChange={e => setMarksForm(f => ({ ...f, max_marks: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              {students.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{s.full_name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.roll_number}</p>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max={marksForm.max_marks}
                    placeholder="--"
                    className="w-20 h-8 text-sm text-center"
                    value={marksForm.entries[s.id] || ''}
                    onChange={e => setMarksForm(f => ({
                      ...f,
                      entries: { ...f.entries, [s.id]: e.target.value },
                    }))}
                  />
                  <span className="text-[10px] text-muted-foreground">/ {marksForm.max_marks}</span>
                </div>
              ))}
            </div>
            <Button className="w-full gradient-accent text-accent-foreground" onClick={handleSaveMarks} disabled={savingMarks}>
              {savingMarks ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save All Marks'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Profile Dialog */}
      <Dialog open={!!viewStudent} onOpenChange={open => !open && setViewStudent(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" /> {viewStudent?.full_name}
            </DialogTitle>
          </DialogHeader>
          {viewStudent && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Roll:</span> <span className="font-medium text-foreground">{viewStudent.roll_number}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{viewStudent.email || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{viewStudent.phone || 'N/A'}</span></div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">CGPA:</span>
                  {editingCgpa ? (
                    <div className="flex items-center gap-1">
                      <Input type="number" min="0" max="10" step="0.01" value={cgpaValue} onChange={e => setCgpaValue(e.target.value)} className="w-16 h-6 text-xs px-1" />
                      <Button size="icon" variant="ghost" className="h-5 w-5 text-accent" onClick={handleSaveCgpa} disabled={savingCgpa}>
                        {savingCgpa ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground" onClick={() => setEditingCgpa(false)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="font-medium text-foreground cursor-pointer hover:text-primary flex items-center gap-0.5" onClick={() => { setEditingCgpa(true); setCgpaValue(viewStudent.cgpa?.toString() ?? '0'); }}>
                      {viewStudent.cgpa ?? 'N/A'} <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                    </span>
                  )}
                </div>
              </div>

              {/* Attendance Percentage */}
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" /> Attendance
                  </h4>
                  {editingAttendance ? (
                    <div className="flex items-center gap-1">
                      <Input type="number" min="0" max="100" step="0.1" value={attendanceValue} onChange={e => setAttendanceValue(e.target.value)} className="w-16 h-6 text-xs px-1" />
                      <span className="text-xs text-muted-foreground">%</span>
                      <Button size="icon" variant="ghost" className="h-5 w-5 text-accent" onClick={handleSaveAttendance} disabled={savingAttendance}>
                        {savingAttendance ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground" onClick={() => setEditingAttendance(false)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-bold cursor-pointer hover:text-primary flex items-center gap-0.5 ${
                        (viewStudent.attendance_percentage ?? 0) >= 75 ? 'text-accent' : (viewStudent.attendance_percentage ?? 0) >= 50 ? 'text-primary' : 'text-destructive'
                      }`}
                      onClick={() => { setEditingAttendance(true); setAttendanceValue(viewStudent.attendance_percentage?.toString() ?? '0'); }}
                    >
                      {viewStudent.attendance_percentage !== null ? `${viewStudent.attendance_percentage}%` : 'N/A'}
                      <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                    </span>
                  )}
                </div>
                {(() => {
                  const pct = viewStudent.attendance_percentage ?? 0;
                  return (
                    <>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-accent' : pct >= 50 ? 'bg-primary' : 'bg-destructive'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      {pct > 0 && pct < 75 && (
                        <p className="text-[10px] text-destructive mt-1 flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Below 75% threshold
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Student Fees */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Fees ({studentFees.length})
                  </h4>
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setShowAddStudentFee(true)}>
                    <Plus className="w-3 h-3 mr-0.5" /> Add
                  </Button>
                </div>

                {showAddStudentFee && (
                  <div className="p-3 rounded-lg bg-secondary/50 mb-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={studentFeeForm.category} onValueChange={v => setStudentFeeForm(f => ({ ...f, category: v }))}>
                        <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tuition">Tuition</SelectItem>
                          <SelectItem value="exam">Exam Fee</SelectItem>
                          <SelectItem value="lab">Lab Fee</SelectItem>
                          <SelectItem value="library">Library Fine</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" min="1" placeholder="Amount" value={studentFeeForm.amount} onChange={e => setStudentFeeForm(f => ({ ...f, amount: e.target.value }))} className="h-7 text-[10px]" />
                    </div>
                    <Input placeholder="Description (optional)" value={studentFeeForm.description} onChange={e => setStudentFeeForm(f => ({ ...f, description: e.target.value }))} className="h-7 text-[10px]" />
                    <Input type="date" value={studentFeeForm.due_date} onChange={e => setStudentFeeForm(f => ({ ...f, due_date: e.target.value }))} className="h-7 text-[10px]" />
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => setShowAddStudentFee(false)}>Cancel</Button>
                      <Button size="sm" className="h-6 text-[10px] flex-1 gradient-accent text-accent-foreground" onClick={handleAddStudentFee} disabled={addingStudentFee}>
                        {addingStudentFee ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add Fee'}
                      </Button>
                    </div>
                  </div>
                )}

                {studentFees.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">No fees</p>
                ) : (
                  <div className="space-y-1">
                    {studentFees.slice(0, 10).map(f => (
                      <div key={f.id} className="p-2 rounded-lg bg-secondary/50 text-xs">
                        {editingFeeId === f.id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Select value={editFeeForm.category} onValueChange={v => setEditFeeForm(p => ({ ...p, category: v }))}>
                                <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="tuition">Tuition</SelectItem>
                                  <SelectItem value="exam">Exam Fee</SelectItem>
                                  <SelectItem value="lab">Lab Fee</SelectItem>
                                  <SelectItem value="library">Library Fine</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input type="number" min="1" value={editFeeForm.amount} onChange={e => setEditFeeForm(p => ({ ...p, amount: e.target.value }))} className="h-7 text-[10px]" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Input type="date" value={editFeeForm.due_date} onChange={e => setEditFeeForm(p => ({ ...p, due_date: e.target.value }))} className="h-7 text-[10px] flex-1" />
                              <Button size="sm" variant={editFeeForm.is_paid ? 'default' : 'outline'} className="h-7 text-[10px]" onClick={() => setEditFeeForm(p => ({ ...p, is_paid: !p.is_paid }))}>
                                {editFeeForm.is_paid ? 'Paid' : 'Unpaid'}
                              </Button>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => setEditingFeeId(null)}>Cancel</Button>
                              <Button size="sm" className="h-6 text-[10px] flex-1 gradient-primary text-primary-foreground" onClick={() => handleSaveStudentFee(f.id)} disabled={savingFee}>
                                {savingFee ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => { setEditingFeeId(f.id); setEditFeeForm({ amount: f.amount.toString(), is_paid: f.is_paid, category: f.category, due_date: f.due_date || '' }); }}>
                            <span className="text-foreground">{f.category} · ₹{f.amount}</span>
                            <div className="flex items-center gap-1">
                              <Badge variant={f.is_paid ? 'default' : 'destructive'} className="text-[10px]">{f.is_paid ? 'Paid' : 'Unpaid'}</Badge>
                              <Pencil className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Student Marks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5" /> Marks ({studentMarks.length})
                  </h4>
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setShowAddStudentMark(true)}>
                    <Plus className="w-3 h-3 mr-0.5" /> Add
                  </Button>
                </div>

                {showAddStudentMark && (
                  <div className="p-3 rounded-lg bg-secondary/50 mb-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={studentMarkForm.subject_id} onValueChange={v => setStudentMarkForm(f => ({ ...f, subject_id: v }))}>
                        <SelectTrigger className="h-7 text-[10px]"><SelectValue placeholder="Subject" /></SelectTrigger>
                        <SelectContent>
                          {subjects.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={studentMarkForm.exam_type} onValueChange={v => setStudentMarkForm(f => ({ ...f, exam_type: v }))}>
                        <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unit_test">Unit Test</SelectItem>
                          <SelectItem value="mid_term">Mid Term</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="final">Final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" min="0" placeholder="Marks obtained" value={studentMarkForm.marks_obtained} onChange={e => setStudentMarkForm(f => ({ ...f, marks_obtained: e.target.value }))} className="h-7 text-[10px]" />
                      <Input type="number" min="1" placeholder="Max marks" value={studentMarkForm.max_marks} onChange={e => setStudentMarkForm(f => ({ ...f, max_marks: e.target.value }))} className="h-7 text-[10px]" />
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1" onClick={() => setShowAddStudentMark(false)}>Cancel</Button>
                      <Button size="sm" className="h-6 text-[10px] flex-1 gradient-accent text-accent-foreground" onClick={handleAddStudentMark} disabled={addingStudentMark}>
                        {addingStudentMark ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add Marks'}
                      </Button>
                    </div>
                  </div>
                )}

                {studentMarks.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground">No marks</p>
                ) : (
                  <div className="space-y-1">
                    {studentMarks.map(m => (
                      <div key={m.id} className="p-2 rounded-lg bg-secondary/50 text-xs">
                        {editingMarkId === m.id && !m.is_locked ? (
                          <div className="flex items-center gap-2">
                            <span className="text-foreground flex-1 truncate">{m.subject_name || 'Subject'} · {m.exam_type.replace('_', ' ')}</span>
                            <Input type="number" min="0" max={m.max_marks} value={editMarkValue} onChange={e => setEditMarkValue(e.target.value)} className="w-16 h-6 text-xs text-center px-1" />
                            <span className="text-muted-foreground">/{m.max_marks}</span>
                            <Button size="icon" variant="ghost" className="h-5 w-5 text-accent" onClick={() => handleSaveStudentMark(m)} disabled={savingMark}>
                              {savingMark ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground" onClick={() => setEditingMarkId(null)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => { if (!m.is_locked) { setEditingMarkId(m.id); setEditMarkValue(m.marks_obtained.toString()); } }}>
                            <span className="text-foreground">{m.subject_name || 'Subject'} · {m.exam_type.replace('_', ' ')}</span>
                            <div className="flex items-center gap-1">
                              <span className={`font-semibold ${(m.marks_obtained / m.max_marks) < 0.4 ? 'text-destructive' : 'text-accent'}`}>
                                {m.marks_obtained}/{m.max_marks}
                              </span>
                              {m.is_locked ? (
                                <Badge variant="outline" className="text-[8px]">Locked</Badge>
                              ) : (
                                <Pencil className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full" onClick={() => { setViewStudent(null); openEdit(viewStudent); }}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Profile
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffClassDetailPage;
