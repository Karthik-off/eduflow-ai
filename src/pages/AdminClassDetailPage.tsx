import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft, Users, Briefcase, GraduationCap, Loader2, BookOpen, Search, Pencil, Check, X, Plus, Calendar, Trash2, Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ClassInfo {
  id: string;
  name: string;
  department_id: string;
  semester_id: string;
  department: { name: string; code: string } | null;
  semester: { label: string } | null;
}

interface StaffAssignment {
  id: string;
  role_type: string;
  subject_id: string | null;
  staff: { id: string; full_name: string; staff_code: string; email: string | null } | null;
  subject: { id: string; name: string; code: string } | null;
}

interface Student {
  id: string;
  user_id?: string;
  full_name: string;
  roll_number: string;
  email: string | null;
  phone: string | null;
  cgpa: number | null;
  attendance_percentage?: number;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  current_semester_id?: string;
  department_id?: string;
  section_id?: string;
  is_graduated?: boolean;
  is_disabled?: boolean;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface StaffMember {
  id: string;
  full_name: string;
  staff_code: string;
  email: string | null;
}

interface TimetableEntry {
  id: string;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject: { id: string; name: string; code: string } | null;
  staff: { id: string; full_name: string; staff_code: string } | null;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const AdminClassDetailPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [activeTab, setActiveTab] = useState('staff');

  // Timetable
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [timetableDialogOpen, setTimetableDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [ttDayOfWeek, setTtDayOfWeek] = useState('');
  const [ttPeriodNumber, setTtPeriodNumber] = useState('');
  const [ttStartTime, setTtStartTime] = useState('');
  const [ttEndTime, setTtEndTime] = useState('');
  const [ttRoom, setTtRoom] = useState('');
  const [ttSubjectId, setTtSubjectId] = useState('');
  const [ttStaffId, setTtStaffId] = useState('');
  const [savingTimetable, setSavingTimetable] = useState(false);

  // Edit subject staff
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deptSubjects, setDeptSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [foundStaff, setFoundStaff] = useState<StaffMember | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Add subject
  const [addSubjectDialogOpen, setAddSubjectDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectCredits, setNewSubjectCredits] = useState('3');
  const [addingSubject, setAddingSubject] = useState(false);

  // Add student
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState({
    full_name: '',
    email: '',
    password: '',
    roll_number: '',
    phone: '',
    year: '1st',
    fees: '',
    is_graduated: false,
    is_disabled: false,
    documents: [] as File[]
  });
  const [addingStudent, setAddingStudent] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);

  useEffect(() => {
    if (sectionId) fetchAll();
  }, [sectionId]);

  const fetchAll = async () => {
    if (!sectionId) {
      console.error('No section ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Fetching data for section ID:', sectionId);

    try {
      const { data: sec, error: secError } = await supabase
        .from('sections')
        .select('id, name, department_id, semester_id, department:departments(name, code), semester:semesters(label)')
        .eq('id', sectionId!)
        .single();

      if (secError) {
        console.error('Error fetching section:', secError);
        throw secError;
      }

      console.log('Section data:', sec);
      setClassInfo(sec as unknown as ClassInfo);

      const { data: assignments } = await supabase
        .from('staff_assignments')
        .select('id, role_type, subject_id, staff:staff(id, full_name, staff_code, email), subject:subjects(id, name, code)')
        .eq('section_id', sectionId!)
        .eq('is_active', true);
      setStaffAssignments((assignments as unknown as StaffAssignment[]) ?? []);

      const { data: studs } = await supabase
        .from('students')
        .select('id, full_name, roll_number, email, phone, cgpa')
        .eq('section_id', sectionId!)
        .order('roll_number');
      setStudents((studs as Student[]) ?? []);
      console.log('Students data:', studs);

      // Fetch subjects for this class's department + semester
      if (sec) {
        const s = sec as unknown as ClassInfo;
        const { data: subs } = await supabase
          .from('subjects')
          .select('id, name, code')
          .eq('department_id', s.department_id)
          .eq('semester_id', s.semester_id)
          .order('name');
        setDeptSubjects((subs as Subject[]) ?? []);
        console.log('Subjects data:', subs);
      }

      // Fetch timetable entries
      const { data: tt } = await supabase
        .from('timetable_entries')
        .select('id, day_of_week, period_number, start_time, end_time, room, subject:subjects(id, name, code), staff:staff(id, full_name, staff_code)')
        .eq('section_id', sectionId!)
        .order('day_of_week')
        .order('period_number');
      setTimetableEntries((tt as unknown as TimetableEntry[]) ?? []);
      console.log('Timetable data:', tt);
    } catch (error) {
      console.error('Error in fetchAll:', error);
      toast.error('Failed to load class data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const classTeacher = staffAssignments.find(a => a.role_type === 'class_incharge');
  const subjectStaff = staffAssignments.filter(a => a.role_type === 'subject_incharge');

  // Build a map: subjectId -> assignment for quick lookup
  const subjectAssignmentMap = new Map<string, StaffAssignment>();
  subjectStaff.forEach(a => {
    if (a.subject_id) subjectAssignmentMap.set(a.subject_id, a);
  });

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ?? false)
  );

  const searchStaff = async () => {
    if (!staffCode.trim()) return;
    setSearching(true);
    setFoundStaff(null);
    setNotFound(false);

    const { data } = await supabase
      .from('staff')
      .select('id, full_name, staff_code, email')
      .eq('staff_code', staffCode.trim())
      .maybeSingle();

    if (data) {
      setFoundStaff(data as StaffMember);
    } else {
      setNotFound(true);
    }
    setSearching(false);
  };

  const handleAssignSubjectStaff = async () => {
    if (!foundStaff || !selectedSubjectId || !sectionId) return;
    setAssigning(true);

    // Check if there's already an assignment for this subject in this section
    const existing = subjectAssignmentMap.get(selectedSubjectId);
    if (existing) {
      // Deactivate old assignment
      await supabase.from('staff_assignments').update({ is_active: false }).eq('id', existing.id);
    }

    const { error } = await supabase.from('staff_assignments').insert({
      staff_id: foundStaff.id,
      section_id: sectionId,
      subject_id: selectedSubjectId,
      role_type: 'subject_incharge',
      is_active: true,
    });

    if (error) {
      toast.error('Failed to assign staff: ' + error.message);
    } else {
      toast.success(`${foundStaff.full_name} assigned successfully`);
      resetEditForm();
      fetchAll();
    }
    setAssigning(false);
  };

  const handleRemoveAssignment = async (assignmentId: string, staffName: string) => {
    const { error } = await supabase
      .from('staff_assignments')
      .update({ is_active: false })
      .eq('id', assignmentId);
    if (error) {
      toast.error('Failed to remove assignment');
    } else {
      toast.success(`${staffName} removed from subject`);
      fetchAll();
    }
  };

  const resetEditForm = () => {
    setSelectedSubjectId('');
    setStaffCode('');
    setFoundStaff(null);
    setNotFound(false);
  };

  const openEditDialog = () => {
    resetEditForm();
    setEditDialogOpen(true);
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !newSubjectCode.trim() || !classInfo) return;
    setAddingSubject(true);

    const { error } = await supabase.from('subjects').insert({
      name: newSubjectName.trim(),
      code: newSubjectCode.trim().toUpperCase(),
      credits: parseInt(newSubjectCredits) || 3,
      department_id: classInfo.department_id,
      semester_id: classInfo.semester_id,
    });

    if (error) {
      toast.error('Failed to add subject: ' + error.message);
    } else {
      toast.success(`Subject "${newSubjectName.trim()}" added successfully`);
      setAddSubjectDialogOpen(false);
      setNewSubjectName('');
      setNewSubjectCode('');
      setNewSubjectCredits('3');
      fetchAll();
    }
    setAddingSubject(false);
  };

  const handleAddStudent = async () => {
    if (!addStudentForm.full_name || !addStudentForm.email || !addStudentForm.password || !addStudentForm.roll_number) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!classInfo) {
      toast.error('Class information not available');
      return;
    }

    if (!sectionId) {
      toast.error('Section ID not available');
      return;
    }

    setAddingStudent(true);
    console.log('Starting student creation process...');
    console.log('Form data:', addStudentForm);
    console.log('Class info:', classInfo);
    console.log('Section ID:', sectionId);

    try {
      // Create user first
      console.log('Creating user account...');
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: addStudentForm.email,
        password: addStudentForm.password,
        options: {
          data: {
            full_name: addStudentForm.full_name,
            role: 'student'
          }
        }
      });

      console.log('User creation result:', { userData, userError });

      if (userError) {
        console.error('User creation failed:', userError);
        throw new Error(`User creation failed: ${userError.message}`);
      }

      if (!userData.user?.id) {
        throw new Error('User created but no user ID returned');
      }

      // Then create student record
      console.log('Creating student record...');
      const studentRecord = {
        user_id: userData.user.id,
        full_name: addStudentForm.full_name,
        email: addStudentForm.email,
        phone: addStudentForm.phone || null,
        roll_number: addStudentForm.roll_number,
        department_id: classInfo.department_id,
        section_id: sectionId,
        current_semester_id: classInfo.semester_id,
        cgpa: 0,
        attendance_percentage: 0
      };

      console.log('Student record to insert:', studentRecord);

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert([studentRecord])
        .select()
        .single();

      console.log('Student record result:', { studentData, studentError });

      if (studentError) {
        console.error('Student record creation failed:', studentError);
        throw new Error(`Student record creation failed: ${studentError.message}`);
      }

      if (!studentData?.id) {
        throw new Error('Student record created but no ID returned');
      }

      // Add fee record if fees provided
      if (addStudentForm.fees && parseFloat(addStudentForm.fees) > 0) {
        console.log('Adding fee record...');
        const feeRecord = {
          student_id: studentData.id,
          category: 'admission',
          amount: parseFloat(addStudentForm.fees),
          description: 'Admission fees',
          is_paid: false
        };
        
        console.log('Fee record to insert:', feeRecord);
        
        const { error: feeError } = await supabase.from('fees').insert(feeRecord);
        
        if (feeError) {
          console.error('Fee record creation failed:', feeError);
          // Don't throw error for fee failure, just log it
          console.warn('Fee record creation failed but student was created successfully');
        } else {
          console.log('Fee record created successfully');
        }
      }

      console.log('Student creation completed successfully');
      toast.success(`Student "${addStudentForm.full_name}" added successfully`);
      setShowAddStudentModal(false);
      setAddStudentForm({
        full_name: '',
        email: '',
        password: '',
        roll_number: '',
        phone: '',
        year: '1st',
        fees: '',
        is_graduated: false,
        is_disabled: false,
        documents: [] as File[]
      });
      fetchAll();
    } catch (error: any) {
      console.error('Complete error in handleAddStudent:', error);
      console.error('Error stack:', error.stack);
      toast.error(`Failed to add student: ${error.message || 'Unknown error'}`);
    } finally {
      setAddingStudent(false);
    }
  };

  // Timetable functions
  const openTimetableDialog = (entry?: TimetableEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setTtDayOfWeek(entry.day_of_week.toString());
      setTtPeriodNumber(entry.period_number.toString());
      setTtStartTime(entry.start_time);
      setTtEndTime(entry.end_time);
      setTtRoom(entry.room || '');
      setTtSubjectId(entry.subject?.id || '');
      setTtStaffId(entry.staff?.id || '');
    } else {
      setEditingEntry(null);
      setTtDayOfWeek('');
      setTtPeriodNumber('');
      setTtStartTime('');
      setTtEndTime('');
      setTtRoom('');
      setTtSubjectId('');
      setTtStaffId('');
    }
    setTimetableDialogOpen(true);
  };

  const handleSaveTimetable = async () => {
    // ttDayOfWeek can be "0" for Monday which is valid, so check length
    if (ttDayOfWeek === '' || !ttPeriodNumber || !ttStartTime || !ttEndTime || !ttSubjectId || !sectionId) {
      console.error('Timetable validation failed:', { ttDayOfWeek, ttPeriodNumber, ttStartTime, ttEndTime, ttSubjectId, sectionId });
      toast.error('Please fill all required fields');
      return;
    }

    setSavingTimetable(true);

    const payload = {
      section_id: sectionId,
      day_of_week: parseInt(ttDayOfWeek),
      period_number: parseInt(ttPeriodNumber),
      start_time: ttStartTime,
      end_time: ttEndTime,
      room: ttRoom || null,
      subject_id: ttSubjectId,
      staff_id: ttStaffId && ttStaffId !== 'none' ? ttStaffId : null,
    };

    console.log('Saving timetable entry:', payload);

    let error;
    if (editingEntry) {
      const { error: updateError } = await supabase
        .from('timetable_entries')
        .update(payload)
        .eq('id', editingEntry.id);
      error = updateError;
    } else {
      const { error: insertError, data } = await supabase.from('timetable_entries').insert(payload).select();
      console.log('Insert result:', { data, error: insertError });
      error = insertError;
    }

    if (error) {
      console.error('Timetable save error:', error);
      toast.error('Failed to save timetable entry: ' + error.message);
    } else {
      toast.success(editingEntry ? 'Timetable entry updated' : 'Timetable entry added');
      setTimetableDialogOpen(false);
      fetchAll();
    }
    setSavingTimetable(false);
  };

  const handleDeleteTimetable = async (entryId: string) => {
    const { error } = await supabase.from('timetable_entries').delete().eq('id', entryId);
    if (error) {
      toast.error('Failed to delete timetable entry');
    } else {
      toast.success('Timetable entry deleted');
      fetchAll();
    }
  };

  // Group timetable by day
  const timetableByDay = DAYS.map((day, dayIndex) => ({
    day,
    dayIndex: dayIndex + 1,
    entries: timetableEntries.filter(e => e.day_of_week === dayIndex + 1).sort((a, b) => a.period_number - b.period_number),
  }));

  // Get all staff for timetable dialog
  const allStaff = staffAssignments.map(a => a.staff).filter(Boolean) as { id: string; full_name: string; staff_code: string; email: string | null }[];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Class Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The class with ID "{sectionId}" was not found in the system.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            This could be because:
          </p>
          <ul className="text-left text-sm text-gray-500 dark:text-gray-500 space-y-1">
            <li>• The class ID doesn't exist</li>
            <li>• The class has been deleted</li>
            <li>• You don't have permission to view this class</li>
          </ul>
          <Button onClick={() => navigate('/admin/dashboard')} className="mt-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Class Details">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 px-4 h-14 max-w-5xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold font-display text-foreground truncate">{classInfo?.name ?? 'Class'}</h1>
              <p className="text-[10px] text-muted-foreground">
                {classInfo?.department?.name} ({classInfo?.department?.code}) · {classInfo?.semester?.label}
              </p>
            </div>
          </div>
        </header>

      <main className="px-4 py-5 max-w-5xl mx-auto space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="shadow-card border-0">
            <CardContent className="p-4 text-center">
              <Briefcase className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-lg font-bold font-display text-foreground">{staffAssignments.length}</p>
              <p className="text-[10px] text-muted-foreground">Staff</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4 text-center">
              <GraduationCap className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold font-display text-foreground">{students.length}</p>
              <p className="text-[10px] text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-5 h-5 text-warning mx-auto mb-1" />
              <p className="text-lg font-bold font-display text-foreground">{deptSubjects.length}</p>
              <p className="text-[10px] text-muted-foreground">Subjects</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4 text-center">
              <Calendar className="w-5 h-5 text-destructive mx-auto mb-1" />
              <p className="text-lg font-bold font-display text-foreground">{timetableEntries.length}</p>
              <p className="text-[10px] text-muted-foreground">Periods</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-11">
            <TabsTrigger value="staff" className="text-[11px] font-semibold">Staff</TabsTrigger>
            <TabsTrigger value="students" className="text-[11px] font-semibold">Students</TabsTrigger>
            <TabsTrigger value="timetable" className="text-[11px] font-semibold">Timetable</TabsTrigger>
          </TabsList>

          {/* STAFF TAB */}
          <TabsContent value="staff" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-foreground text-sm">Staff</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setAddSubjectDialogOpen(true)}>
                  <Plus className="w-3 h-3" />
                  Add Subject
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={openEditDialog}>
                  <Pencil className="w-3 h-3" />
                  Assign Staff
                </Button>
              </div>
            </div>

            {/* Class Teacher */}
            {classTeacher ? (
              <Card className="shadow-card border-0 border-l-4 border-l-accent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
                      {classTeacher.staff?.full_name?.charAt(0) ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground">{classTeacher.staff?.full_name}</h4>
                        <Badge className="text-[10px] bg-accent/10 text-accent border-accent/20">Class Teacher</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{classTeacher.staff?.staff_code} · {classTeacher.staff?.email ?? 'No email'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-xs text-muted-foreground">No class teacher assigned</p>
            )}

            {/* Subjects with assigned staff */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subjects & Staff</h3>
              {deptSubjects.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">No subjects found for this semester</p>
              ) : (
                deptSubjects.map((subject) => {
                  const assignment = subjectAssignmentMap.get(subject.id);
                  return (
                    <Card key={subject.id} className="shadow-card border-0">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-warning" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs text-foreground">{subject.name} ({subject.code})</h4>
                            {assignment ? (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-[8px] font-bold text-primary">{assignment.staff?.full_name?.charAt(0)}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  {assignment.staff?.full_name} ({assignment.staff?.staff_code})
                                </span>
                              </div>
                            ) : (
                              <p className="text-[10px] text-destructive/70 mt-0.5">No staff assigned</p>
                            )}
                          </div>
                          {assignment ? (
                            <Badge variant="outline" className="text-[10px] text-accent border-accent/20 shrink-0">Assigned</Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] text-primary shrink-0"
                              onClick={() => {
                                setSelectedSubjectId(subject.id);
                                setStaffCode('');
                                setFoundStaff(null);
                                setNotFound(false);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-0.5" />
                              Assign
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* STUDENTS TAB */}
          <TabsContent value="students" className="space-y-3 mt-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display font-bold text-foreground text-sm">Students ({students.length})</h2>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="h-8 text-xs gap-1.5 gradient-primary text-primary-foreground" onClick={() => setShowAddStudentModal(true)}>
                  <Plus className="w-3.5 h-3.5" />
                  Add Student
                </Button>
                <div className="relative max-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-6 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-xs">
                    {studentSearch ? 'No students match your search' : 'No students in this class yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-1.5">
                {filteredStudents.map((student, idx) => (
                  <Card key={student.id} className="shadow-card border-0">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs text-foreground">{student.full_name}</h4>
                          <p className="text-[10px] text-muted-foreground">
                            {student.roll_number}
                            {student.email && ` · ${student.email}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {student.cgpa !== null && (
                            <span className="text-xs font-semibold text-foreground">CGPA: {student.cgpa}</span>
                          )}
                          {student.phone && (
                            <p className="text-[10px] text-muted-foreground">{student.phone}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TIMETABLE TAB */}
          <TabsContent value="timetable" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-foreground text-sm">Class Timetable</h2>
              <Button variant="default" size="sm" className="h-8 text-xs gap-1.5 gradient-primary text-primary-foreground" onClick={() => openTimetableDialog()}>
                <Plus className="w-3.5 h-3.5" />
                Add Period
              </Button>
            </div>

            {timetableEntries.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No timetable entries yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Click "Add Period" to create your first timetable entry</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {timetableByDay.map(({ day, dayIndex, entries }) => (
                  <Card key={dayIndex} className="shadow-card border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          {day}
                        </h3>
                        {entries.length > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {entries.length} {entries.length === 1 ? 'period' : 'periods'}
                          </Badge>
                        )}
                      </div>
                      {entries.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No classes scheduled</p>
                      ) : (
                        <div className="space-y-2">
                          {entries.map((entry, idx) => (
                            <div key={entry.id}>
                              <div className="flex items-start justify-between gap-3 group">
                                <div className="flex-1 min-w-0 py-1">
                                  <div className="flex items-baseline gap-2">
                                    <h4 className="font-semibold text-sm text-foreground">
                                      {entry.subject?.name || 'Unknown Subject'}
                                    </h4>
                                    <span className="text-xs text-muted-foreground font-medium">
                                      {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                                    </span>
                                  </div>
                                  {(entry.staff || entry.room) && (
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                      {entry.staff && <span>{entry.staff.full_name}</span>}
                                      {entry.staff && entry.room && <span>•</span>}
                                      {entry.room && <span>Room {entry.room}</span>}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openTimetableDialog(entry)}>
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this timetable entry?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will remove this period from the timetable. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          onClick={() => handleDeleteTimetable(entry.id)}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                              {idx < entries.length - 1 && <div className="h-px bg-border/50 my-1.5" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Subject Staff Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Assign Subject Staff</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Subject selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Subject *</label>
              <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setStaffCode(''); setFoundStaff(null); setNotFound(false); }}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {deptSubjects.map((sub) => {
                    const assigned = subjectAssignmentMap.get(sub.id);
                    return (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code}) {assigned ? `— ${assigned.staff?.full_name}` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedSubjectId && subjectAssignmentMap.has(selectedSubjectId) && (
                <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border">
                  <span className="text-[10px] text-muted-foreground">
                    Currently: <span className="font-medium text-foreground">{subjectAssignmentMap.get(selectedSubjectId)?.staff?.full_name}</span>
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive">
                        <X className="w-3 h-3 mr-0.5" /> Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove staff from this subject?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will unassign {subjectAssignmentMap.get(selectedSubjectId)?.staff?.full_name} from this subject.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => {
                            const a = subjectAssignmentMap.get(selectedSubjectId);
                            if (a) handleRemoveAssignment(a.id, a.staff?.full_name ?? 'Staff');
                          }}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            {/* Staff search */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Search Staff by Code *</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter staff code"
                  value={staffCode}
                  onChange={(e) => { setStaffCode(e.target.value); setNotFound(false); setFoundStaff(null); }}
                  onKeyDown={(e) => e.key === 'Enter' && searchStaff()}
                />
                <Button variant="outline" size="sm" onClick={searchStaff} disabled={searching || !staffCode.trim()}>
                  {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                </Button>
              </div>
              {notFound && (
                <p className="text-[10px] text-destructive flex items-center gap-1"><X className="w-3 h-3" /> Staff not found</p>
              )}
              {foundStaff && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-accent/10">
                  <Check className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-foreground">{foundStaff.full_name}</span>
                  <span className="text-[10px] text-muted-foreground">({foundStaff.staff_code})</span>
                </div>
              )}
            </div>

            <Button
              className="w-full gradient-primary text-primary-foreground"
              disabled={assigning || !selectedSubjectId || !foundStaff}
              onClick={handleAssignSubjectStaff}
            >
              {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign Staff to Subject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Timetable Dialog */}
      <Dialog open={timetableDialogOpen} onOpenChange={setTimetableDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Day *</label>
                <Select value={ttDayOfWeek} onValueChange={setTtDayOfWeek}>
                  <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, idx) => (
                      <SelectItem key={idx} value={(idx + 1).toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Period Number *</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={ttPeriodNumber}
                  onChange={(e) => setTtPeriodNumber(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Start Time *</label>
                <Input
                  type="time"
                  value={ttStartTime}
                  onChange={(e) => setTtStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">End Time *</label>
                <Input
                  type="time"
                  value={ttEndTime}
                  onChange={(e) => setTtEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Subject *</label>
              <Select value={ttSubjectId} onValueChange={setTtSubjectId}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {deptSubjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Staff (Optional)</label>
              <Select value={ttStaffId || "none"} onValueChange={(val) => setTtStaffId(val === "none" ? "" : val)}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {allStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.full_name} ({staff.staff_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Room (Optional)</label>
              <Input
                placeholder="e.g. Room 101, Lab A"
                value={ttRoom}
                onChange={(e) => setTtRoom(e.target.value)}
              />
            </div>

            <Button
              className="w-full gradient-primary text-primary-foreground"
              disabled={savingTimetable}
              onClick={handleSaveTimetable}
            >
              {savingTimetable ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingEntry ? 'Update Entry' : 'Add Entry')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog open={addSubjectDialogOpen} onOpenChange={setAddSubjectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Add New Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Subject Name *</label>
              <Input
                placeholder="e.g. Data Structures"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Subject Code *</label>
                <Input
                  placeholder="e.g. CS301"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Credits</label>
                <Input
                  type="number"
                  placeholder="3"
                  value={newSubjectCredits}
                  onChange={(e) => setNewSubjectCredits(e.target.value)}
                  min="1"
                  max="6"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              This subject will be added to {classInfo?.department?.code} — {classInfo?.semester?.label}
            </p>
            <Button
              className="w-full gradient-primary text-primary-foreground"
              disabled={addingSubject || !newSubjectName.trim() || !newSubjectCode.trim()}
              onClick={handleAddSubject}
            >
              {addingSubject ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Subject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudentModal} onOpenChange={setShowAddStudentModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-foreground">Full Name *</label>
                <Input
                  value={addStudentForm.full_name}
                  onChange={(e) => setAddStudentForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Email *</label>
                <Input
                  type="email"
                  value={addStudentForm.email}
                  onChange={(e) => setAddStudentForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Password *</label>
                <Input
                  type="password"
                  value={addStudentForm.password}
                  onChange={(e) => setAddStudentForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Roll Number *</label>
                <Input
                  value={addStudentForm.roll_number}
                  onChange={(e) => setAddStudentForm(prev => ({ ...prev, roll_number: e.target.value }))}
                  placeholder="Enter roll number"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Phone</label>
                <Input
                  value={addStudentForm.phone}
                  onChange={(e) => setAddStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Year</label>
                <Select value={addStudentForm.year} onValueChange={(value) => setAddStudentForm(prev => ({ ...prev, year: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Year</SelectItem>
                    <SelectItem value="2nd">2nd Year</SelectItem>
                    <SelectItem value="3rd">3rd Year</SelectItem>
                    <SelectItem value="4th">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Fees</label>
                <Input
                  type="number"
                  value={addStudentForm.fees}
                  onChange={(e) => setAddStudentForm(prev => ({ ...prev, fees: e.target.value }))}
                  placeholder="Enter admission fees"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_graduated"
                    checked={addStudentForm.is_graduated}
                    onChange={(e) => setAddStudentForm(prev => ({ ...prev, is_graduated: e.target.checked }))}
                  />
                  <label htmlFor="is_graduated" className="text-xs font-medium text-foreground">Graduated</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_disabled"
                    checked={addStudentForm.is_disabled}
                    onChange={(e) => setAddStudentForm(prev => ({ ...prev, is_disabled: e.target.checked }))}
                  />
                  <label htmlFor="is_disabled" className="text-xs font-medium text-foreground">Disabled</label>
                </div>
              </div>
            </div>
            
            {/* Document Upload */}
            <div>
              <label className="text-xs font-medium text-foreground">Documents</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.doc,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files) {
                      setAddStudentForm(prev => ({ ...prev, documents: [...prev.documents, ...Array.from(e.target.files)] }));
                    }
                  }}
                  disabled={uploadingDocuments}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploadingDocuments ? 'Uploading...' : 'Click to upload documents (PDF, DOC, JPG, PNG)'}
                  </p>
                  {addStudentForm.documents.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {addStudentForm.documents.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddStudentModal(false)}>
                Cancel
              </Button>
              <Button 
                className="gradient-primary text-primary-foreground" 
                onClick={handleAddStudent}
                disabled={addingStudent}
              >
                {addingStudent ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {addingStudent ? 'Adding Student...' : 'Add Student'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminClassDetailPage;
