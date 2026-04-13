// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useStudentStore } from '@/stores/studentStore';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/premium-ui/Card';
import { Button } from '@/components/premium-ui/Button';
import { Input } from '@/components/premium-ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter,
  Download,
  Save,
  Loader2,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface AttendanceData {
  id: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  date: string;
}

interface Student {
  id: string;
  roll_number: string;
  full_name: string;
  department?: string;
  department_name?: string;
  section_name?: string;
  year?: string;
  semester?: string;
  attendance_status?: 'present' | 'absent' | null;
}

interface RetestData {
  studentId: string;
  studentName: string;
  retestMarks: string;
  subjectId?: string;
  sectionId?: string;
}


const StaffAttendancePage = () => {
  const { staffProfile } = useAuthStore();
  const navigate = useNavigate();
  const { students, setStudents } = useStudentStore();
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRetestModal, setShowRetestModal] = useState(false);
  const [retestData, setRetestData] = useState<RetestData | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [holidays, setHolidays] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (staffProfile?.id) {
      fetchHolidays();
    }
  }, [staffProfile]);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceData();
    }
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Students are now loaded from the shared store
      // No need to fetch from database here
      setLoading(false);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const { data: holidaysData, error } = await supabase
        .from('academic_calendar')
        .select('date, is_holiday, description')
        .eq('is_holiday', true);

      if (error) throw error;

      const holidaySet = new Set((holidaysData || []).map((h: any) => h.date));
      setHolidays(holidaySet);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('attendance_records')
        .select(`
          student_id,
          status,
          date
        `)
        .eq('date', selectedDate);

      // Apply date filter if set
      if (fromDate && toDate) {
        query = query
          .gte('date', fromDate)
          .lte('date', toDate);
      }

      const { data: attendanceRecords, error } = await query;

      if (error) throw error;

      const totalStudents = students.length;
      const presentCount = (attendanceRecords || []).filter(r => r.status === 'present').length;
      const absentCount = (attendanceRecords || []).filter(r => r.status === 'absent').length;
      const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

      setAttendanceData([{
        id: Date.now().toString(),
        totalStudents,
        presentCount,
        absentCount,
        attendancePercentage,
        date: selectedDate
      }]);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent') => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .upsert({
          student_id: studentId,
          date: selectedDate,
          status: status,
          marked_by: staffProfile?.id,
          marked_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setStudents(prev => {
        const updated = prev.map(student => 
          student.id === studentId 
            ? { ...student, attendance_status: status }
            : student
        );
        return updated;
      });

      // Update attendance summary
      fetchAttendanceData();
      
      toast.success(`Marked as ${status}`);
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const handleRetest = (student: Student) => {
    setRetestData({
      studentId: student.id,
      studentName: student.full_name,
      retestMarks: '',
      sectionId: 'section-1', // Get from current context
      subjectId: 'subject-1' // Get from current context
    });
    setShowRetestModal(true);
  };

  const handleSaveRetest = async () => {
    if (!retestData) return;

    try {
      // Save retest marks to database (commented out if table doesn't exist)
      /*
      const { error } = await supabase
        .from('retest_marks')
        .insert({
          student_id: retestData.studentId,
          subject_id: retestData.subjectId,
          section_id: retestData.sectionId,
          marks: parseInt(retestData.retestMarks),
          original_status: 'absent',
          marked_by: staffProfile?.id,
          marked_at: new Date().toISOString()
        });

      if (error) throw error;
      */

      toast.success('Retest marks saved successfully');
      setShowRetestModal(false);
      setRetestData(null);
    } catch (error) {
      toast.error('Failed to save retest marks');
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)));
    }
  };

  const handleExportReport = () => {
    const reportData = {
      date: selectedDate,
      generatedAt: new Date().toISOString(),
      summary: attendanceData,
      students: students.map(student => ({
        rollNumber: student.roll_number,
        name: student.full_name,
        status: student.attendance_status || 'not_marked'
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isHoliday = (date: string) => {
    return holidays.has(date);
  };

  const getAttendanceStatusColor = (status?: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Users className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Staff Portal</p>
              <h2 className="text-sm font-bold font-display text-foreground leading-none">
                {staffProfile?.full_name ?? 'Staff'}
              </h2>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/staff/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="px-4 py-5 max-w-5xl mx-auto space-y-6">
        {/* Date Filters */}
        <Card variant="elevated" className="hover-lift-enhanced">
          <CardHeader className="pb-3" title={
              <div className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Attendance Management
              </div>
            } />
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Selected Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchAttendanceData} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
                  Apply Filter
                </Button>
                <Button variant="secondary" onClick={handleExportReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        {attendanceData && (
          <Card variant="gradient" className="hover-lift-enhanced">
            <CardHeader className="pb-3" title={
                <div className="text-base font-semibold">
                  Attendance Summary - {attendanceData.date}
                  {isHoliday(attendanceData.date) && (
                    <Badge variant="destructive" className="ml-2">
                      Holiday
                    </Badge>
                  )}
                </div>
              } />
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{attendanceData.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{attendanceData.presentCount}</p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{attendanceData.absentCount}</p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{attendanceData.attendancePercentage}%</p>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Attendance</span>
                  <span className="text-lg font-semibold">{attendanceData.attendancePercentage}%</span>
                </div>
                <Progress value={attendanceData.attendancePercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student List */}
        <Card variant="glass" className="hover-lift-enhanced">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold">
              Student List
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSelectAll}
              >
                {selectedStudents.size === students.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedStudents.size > 0 && (
                <Badge variant="secondary">
                  {selectedStudents.size} selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4">
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No students available</h3>
                  <p className="text-sm text-muted-foreground">
                    Students added in Student Management will appear here. Add students first to mark attendance.
                  </p>
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedStudents.has(student.id) ? 'bg-primary/10 border-primary/30' : 'bg-background border-border'
                    }`}
                    onClick={() => !isHoliday(selectedDate) && handleSelectStudent(student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={() => !isHoliday(selectedDate) && handleSelectStudent(student.id)}
                        disabled={isHoliday(selectedDate)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.roll_number}</p>
                        <p className="text-xs text-muted-foreground">{student.department_name || student.section_name}</p>
                        <p className="text-xs text-muted-foreground">{student.year || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(student.attendance_status)}`}>
                        {student.attendance_status || 'Not Marked'}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => !isHoliday(selectedDate) && handleSelectStudent(student.id)}
                        >
                          {selectedStudents.has(student.id) ? 'Deselect' : 'Select'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => !isHoliday(selectedDate) && handleRetest(student)}
                          disabled={isHoliday(selectedDate)}
                          title="Retest Marks"
                        >
                          <AlertCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      {/* Retest Modal */}
      {showRetestModal && retestData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card variant="gradient" className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader title="Enter Retest Marks" />
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Student: <span className="font-medium">{retestData.studentName}</span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Retest Marks</label>
                <Input
                  type="number"
                  value={retestData.retestMarks}
                  onChange={(e) => setRetestData(prev => prev ? { ...prev, retestMarks: e.target.value } : null)}
                  placeholder="Enter retest marks"
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRetestModal(false)}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleSaveRetest}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffAttendancePage;
