import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useStudentData } from '@/hooks/useStudentData';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/layout/DashboardHeader';
import BottomNav from '@/components/layout/BottomNav';
import AttendanceCircle from '@/components/dashboard/AttendanceCircle';
import TodayTimetable from '@/components/dashboard/TodayTimetable';
import QuickStats from '@/components/dashboard/QuickStats';
import AlertModals from '@/components/dashboard/AlertModals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Loader2, Calendar, ChevronDown, ChevronUp, Bot, ArrowRight } from 'lucide-react';
import QRScannerPanel from '@/components/attendance/QRScannerPanel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import StudentPerformanceAnalyzer from '@/components/ai/StudentPerformanceAnalyzer';
import { useNavigate } from 'react-router-dom';

interface TimetableEntry {
  id: string;
  subject: string;
  professor: string;
  room: string;
  startTime: string;
  endTime: string;
  isOngoing?: boolean;
}

interface RawTimetableEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject: { name: string } | null;
  staff: { full_name: string } | null;
}

const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const StudentDashboard = () => {
  const { studentProfile } = useAuthStore();
  const studentData = useStudentData();
  const navigate = useNavigate();
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);
  const [feesDueSoon, setFeesDueSoon] = useState(false);
  const [hasNewMarks, setHasNewMarks] = useState(false);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [todayTimetable, setTodayTimetable] = useState<TimetableEntry[]>([]);
  const [weeklyTimetable, setWeeklyTimetable] = useState<Map<number, TimetableEntry[]>>(new Map());
  const [showFullTimetable, setShowFullTimetable] = useState(false);

  useEffect(() => {
    if (studentProfile?.id) {
      fetchDashboardData();
    }
  }, [studentProfile?.id]);

  const fetchDashboardData = async () => {
    const studentId = studentProfile!.id;
    const sectionId = studentProfile?.section_id;

    // Fetch in parallel: fees, attendance, marks, notifications
    const [feesRes, attendanceRes, marksRes, notifsRes] = await Promise.all([
      supabase.from('fees').select('amount, is_paid, due_date').eq('student_id', studentId),
      supabase.from('attendance_records').select('status').eq('student_id', studentId),
      supabase.from('marks').select('id, created_at').eq('student_id', studentId).order('created_at', { ascending: false }).limit(5),
      supabase.from('notifications').select('id').eq('student_id', studentId).eq('is_read', false),
    ]);

    // Fetch timetable separately if student has a section
    let timetableRes: { data: RawTimetableEntry[] | null } = { data: null };
    if (sectionId) {
      const res = await supabase
        .from('timetable_entries')
        .select('id, day_of_week, start_time, end_time, room, subject:subjects(name), staff:staff(full_name)')
        .eq('section_id', sectionId)
        .order('day_of_week')
        .order('start_time');
      timetableRes = res as { data: RawTimetableEntry[] | null };
    }

    // Fees
    const allFees = feesRes.data ?? [];
    const unpaidFees = allFees.filter((f: any) => !f.is_paid);
    const totalUnpaid = unpaidFees.reduce((sum: number, f: any) => sum + Number(f.amount), 0);
    setPendingFees(totalUnpaid);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const hasDueSoon = unpaidFees.some((f: any) => f.due_date && new Date(f.due_date) <= sevenDaysFromNow);
    setFeesDueSoon(hasDueSoon);

    // Attendance – prefer the manually-set value from staff, fall back to calculated
    if (studentProfile?.attendance_percentage != null) {
      setAttendancePercentage(Math.round(studentProfile.attendance_percentage));
    } else {
      const records = attendanceRes.data ?? [];
      if (records.length > 0) {
        const present = records.filter((r: any) => r.status === 'present').length;
        setAttendancePercentage(Math.round((present / records.length) * 100));
      } else {
        setAttendancePercentage(0);
      }
    }

    // Marks - check if any were added in the last 3 days
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const recentMarks = (marksRes.data ?? []).filter((m: any) => new Date(m.created_at) > threeDaysAgo);
    setHasNewMarks(recentMarks.length > 0);

    // Notifications count
    setNotifCount((notifsRes.data ?? []).length);

    // Subjects count
    if (studentProfile?.current_semester_id && studentProfile?.department_id) {
      const { data: subjs } = await supabase
        .from('subjects')
        .select('id')
        .eq('department_id', studentProfile.department_id)
        .eq('semester_id', studentProfile.current_semester_id);
      setTotalSubjects((subjs ?? []).length);
    }

    // Process timetable
    if (timetableRes.data) {
      const rawEntries = timetableRes.data;
      const currentDay = now.getDay(); // 0=Sunday, 1=Monday, etc.
      
      // Format time for display
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
      };

      // Check if a class is ongoing
      const isOngoing = (startTime: string, endTime: string) => {
        const nowTime = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const start = startH * 60 + startM;
        const end = endH * 60 + endM;
        return nowTime >= start && nowTime < end;
      };

      // Map entries
      const mapEntry = (e: RawTimetableEntry, checkOngoing: boolean): TimetableEntry => ({
        id: e.id,
        subject: e.subject?.name ?? 'Unknown Subject',
        professor: e.staff?.full_name ?? 'TBA',
        room: e.room ?? 'TBA',
        startTime: formatTime(e.start_time),
        endTime: formatTime(e.end_time),
        isOngoing: checkOngoing ? isOngoing(e.start_time, e.end_time) : false,
      });

      // Today's timetable (day_of_week 1=Monday matches JS getDay() 1=Monday)
      const todayEntries = rawEntries
        .filter(e => e.day_of_week === currentDay)
        .map(e => mapEntry(e, true));
      setTodayTimetable(todayEntries);

      // Weekly timetable grouped by day
      const weekly = new Map<number, TimetableEntry[]>();
      for (let day = 1; day <= 5; day++) {
        weekly.set(day, rawEntries.filter(e => e.day_of_week === day).map(e => mapEntry(e, day === currentDay)));
      }
      setWeeklyTimetable(weekly);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <DashboardHeader />
      
      <AlertModals
        attendancePercentage={attendancePercentage}
        hasNewMarks={hasNewMarks}
        pendingFees={pendingFees}
        feesDueSoon={feesDueSoon}
        studentId={studentProfile?.id}
      />

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <Card className="shadow-card border-0 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <AttendanceCircle percentage={attendancePercentage} size={100} />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Roll Number</p>
                  <p className="font-semibold text-sm text-foreground">{studentProfile?.roll_number ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Semester</p>
                  <p className="font-semibold text-sm text-foreground">Current</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <QuickStats cgpa={studentData?.academics?.cgpa ?? studentProfile?.cgpa ?? 0} totalSubjects={studentData?.academics?.subjects ?? totalSubjects} pendingFees={studentData?.fees?.dueFees ?? pendingFees} notifications={notifCount} />

        {/* AI Assistant Quick Access */}
        <Card className="shadow-card border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">EduFlow AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Get help with studies & concepts</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/ai-assistant')}
                className="bg-primary hover:bg-primary/90"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <QRScannerPanel />

        {/* AI Performance Insights */}
        <StudentPerformanceAnalyzer studentData={{
          id: studentProfile?.id || '1',
          name: studentProfile?.full_name || 'Student',
          rollNumber: studentProfile?.roll_number || 'N/A',
          attendancePercentage: attendancePercentage,
          pendingFees: pendingFees,
          recentMarks: studentData?.academics?.marks || [
            { subject: 'Mathematics', marks: 85, totalMarks: 100, percentage: 85, grade: 'A', credit: 4 },
            { subject: 'Computer Science', marks: 92, totalMarks: 100, percentage: 92, grade: 'A+', credit: 4 },
            { subject: 'Physics', marks: 28, totalMarks: 100, percentage: 28, grade: 'D', credit: 3 },
            { subject: 'Chemistry', marks: 58, totalMarks: 100, percentage: 58, grade: 'B', credit: 3 }
          ],
          cgpa: studentData?.academics?.cgpa || studentProfile?.cgpa || 6.8,
          semester: studentData?.academics?.semester || '3rd'
        }} />

        <TodayTimetable entries={todayTimetable} />

        {/* Full Weekly Timetable */}
        <Collapsible open={showFullTimetable} onOpenChange={setShowFullTimetable}>
          <Card className="shadow-card border-0">
            <CardHeader className="pb-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Weekly Timetable
                  </CardTitle>
                  {showFullTimetable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-2">
                {[1, 2, 3, 4, 5].map(dayNum => {
                  const entries = weeklyTimetable.get(dayNum) ?? [];
                  return (
                    <div key={dayNum} className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">{DAYS[dayNum]}</h4>
                      {entries.length === 0 ? (
                        <p className="text-xs text-muted-foreground pl-2">No classes</p>
                      ) : (
                        <div className="space-y-1.5 pl-2">
                          {entries.map(entry => (
                            <div
                              key={entry.id}
                              className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                                entry.isOngoing ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-foreground">{entry.subject}</span>
                                <span className="text-muted-foreground ml-2">({entry.room})</span>
                              </div>
                              <span className="text-muted-foreground shrink-0 ml-2">
                                {entry.startTime} - {entry.endTime}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Upcoming Exams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { subject: 'Data Structures', date: 'Mar 15, 2026', type: 'Mid Term' },
              { subject: 'Database Systems', date: 'Mar 17, 2026', type: 'Unit Test 2' },
            ].map((exam, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{exam.subject}</p>
                  <p className="text-xs text-muted-foreground">{exam.type}</p>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg">
                  {exam.date}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default StudentDashboard;
