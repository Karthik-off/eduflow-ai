import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LiveDateTime from '@/components/common/LiveDateTime';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';
import BackToHomeButton from '@/components/BackToHomeButton';
import SearchBar from '@/components/SearchBar';
import { useDarkMode } from '@/contexts/DarkModeContext';
import {
  LogOut, Briefcase, Users, Building2, ChevronRight, Loader2,
  BookOpen, GraduationCap, ClipboardList, DollarSign, BarChart3,
  FileText, Upload, Brain, AlertTriangle, Calendar, Clock,
  TrendingUp, TrendingDown, UserCheck, AlertCircle, Home, Bell, Bot,
  User, Settings, Sun, Moon, Activity, CalendarDays, MessageSquare,
  QrCode, Wallet, CreditCard, IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  section_id: string | null;
  subject_id: string | null;
  role_type: string;
  section_name: string;
  department_name: string;
  department_code: string;
  semester_label: string;
  subject_name?: string;
  subject_code?: string;
  student_count: number;
}

interface TodayClass {
  id: string;
  subject: string;
  room: string;
  start_time: string;
  end_time: string;
  section_name: string;
  student_count: number;
}

interface TimetableEntry {
  id: string;
  start_time: string;
  end_time: string;
  room: string;
  subjects: { name: string };
  sections: { name: string };
}

interface AttendanceRecord {
  student_id: string;
  section_id: string;
  status: 'present' | 'absent';
}

interface AttendanceSummary {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  averageAttendance: number;
  lowAttendanceSections: number;
}

interface Alert {
  id: string;
  type: 'attendance' | 'performance' | 'fee' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  count?: number;
}

const StaffDashboard = () => {
  const { staffProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContext, setActiveContext] = useState<string>('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Determine greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (staffProfile?.id) {
      fetchAssignments();
      fetchTodayClasses();
      fetchAttendanceSummary();
      fetchAlerts();
    }
  }, [staffProfile]);

  const fetchTodayClasses = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dayOfWeek = new Date().getDay();
      
      const { data: classes, error } = await supabase
        .from('timetable_entries')
        .select(`
          id, start_time, end_time, room,
          subjects!timetable_entries_subject_id_fkey (name),
          sections!timetable_entries_section_id_fkey (name)
        `)
        .eq('day_of_week', dayOfWeek)
        .order('start_time');

      if (error) throw error;

      const mappedClasses: TodayClass[] = (classes || []).map((cls: any) => ({
        id: cls.id,
        subject: cls.subjects?.name || 'Unknown',
        room: cls.room || 'TBA',
        start_time: cls.start_time,
        end_time: cls.end_time,
        section_name: cls.sections?.name || 'Unknown',
        student_count: 0 // Would need to fetch from assignments
      }));

      setTodayClasses(mappedClasses);
    } catch (error) {
      console.error('Error fetching today classes:', error);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all sections for this staff
      const sectionIds = assignments.map(a => a.section_id).filter(Boolean);
      
      if (sectionIds.length === 0) return;

      // Get today's attendance for all sections
      const { data: attendanceData, error } = await supabase
        .from('attendance_records')
        .select('student_id, section_id, status')
        .eq('date', today)
        .in('section_id', sectionIds);

      if (error) {
        console.error('Error fetching attendance:', error);
        return;
      }

      const totalStudents = assignments.reduce((sum, a) => sum + a.student_count, 0);
      const presentToday = (attendanceData || []).filter((r: any) => r.status === 'present').length;
      const absentToday = (attendanceData || []).filter((r: any) => r.status === 'absent').length;
      const averageAttendance = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
      
      // Check for low attendance sections
      const lowAttendanceSections = assignments.filter(a => {
        const sectionAttendance = (attendanceData || [])
          .filter((r: any) => r.section_id === a.section_id);
        const sectionPresent = sectionAttendance.filter((r: any) => r.status === 'present').length;
        const sectionAverage = a.student_count > 0 ? Math.round((sectionPresent / a.student_count) * 100) : 0;
        return sectionAverage < 75;
      }).length;

      setAttendanceSummary({
        totalStudents,
        presentToday,
        absentToday,
        averageAttendance,
        lowAttendanceSections
      });
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const sectionIds = assignments.map(a => a.section_id).filter(Boolean);
      
      if (sectionIds.length === 0) return;

      // Check for various alerts
      const newAlerts: Alert[] = [];

      // Low attendance alerts
      if (attendanceSummary && attendanceSummary.lowAttendanceSections > 0) {
        newAlerts.push({
          id: 'low-attendance',
          type: 'attendance',
          severity: 'high',
          title: 'Low Attendance Alert',
          message: `${attendanceSummary.lowAttendanceSections} sections have attendance below 75%`,
          count: attendanceSummary.lowAttendanceSections
        });
      }

      // Performance alerts (mock data for now)
      newAlerts.push({
        id: 'performance-1',
        type: 'performance',
        severity: 'medium',
        title: 'Performance Review Due',
        message: '3 subjects pending performance review',
        count: 3
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data: rawAssignments, error } = await supabase
        .from('staff_assignments')
        .select(`
          id, section_id, subject_id, role_type,
          sections!staff_assignments_section_id_fkey (
            id, name, department_id,
            departments!sections_department_id_fkey ( id, name, code ),
            semesters!sections_semester_id_fkey ( label )
          ),
          subjects!staff_assignments_subject_id_fkey ( id, name, code )
        `)
        .eq('staff_id', staffProfile!.id)
        .eq('is_active', true);

      if (error) throw error;

      // Get student counts
      const sectionIds = [...new Set((rawAssignments ?? []).map((a: any) => a.section_id).filter(Boolean))];
      let countMap = new Map<string, number>();
      if (sectionIds.length > 0) {
        const { data: students } = await supabase
          .from('students')
          .select('id, section_id')
          .in('section_id', sectionIds);
        for (const s of students ?? []) {
          if (s.section_id) countMap.set(s.section_id, (countMap.get(s.section_id) ?? 0) + 1);
        }
      }

      const mapped: Assignment[] = (rawAssignments ?? []).map((a: any) => {
        const sec = a.sections;
        const dept = sec?.departments;
        const sem = sec?.semesters;
        const subj = a.subjects;
        return {
          id: a.id,
          section_id: a.section_id,
          subject_id: a.subject_id,
          role_type: a.role_type,
          section_name: sec?.name ?? '',
          department_name: dept?.name ?? '',
          department_code: dept?.code ?? '',
          semester_label: sem?.label ?? '',
          subject_name: subj?.name,
          subject_code: subj?.code,
          student_count: countMap.get(a.section_id) ?? 0,
        };
      });

      setAssignments(mapped);
      if (mapped.length > 0) setActiveContext(mapped[0].id);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const current = useMemo(() => assignments.find(a => a.id === activeContext), [assignments, activeContext]);

  const classInchargeAssignments = assignments.filter(a => a.role_type === 'class_incharge');
  const subjectAssignments = assignments.filter(a => a.role_type === 'subject_incharge');

  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await signOut();
    navigate('/staff/login');
  };

  const getContextLabel = (a: Assignment) => {
    if (a.role_type === 'class_incharge') {
      return `${a.section_name} · Class Incharge`;
    }
    return `${a.section_name} · ${a.subject_name ?? 'Subject'}`;
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true, path: '/staff/dashboard' },
    { icon: Users, label: 'Attendance', active: false, path: '/staff/attendance' },
    { icon: GraduationCap, label: 'Students', active: false, path: '/staff/students' },
    { icon: ClipboardList, label: 'Marks Entry', active: false, path: '/staff/marks' },
    { icon: Calendar, label: 'Calendar', active: false, path: '/staff/calendar' },
    { icon: Clock, label: 'Timetable', active: false, path: '/staff/timetable' },
    { icon: FileText, label: 'Reports', active: false, path: '/staff/reports' },
    { icon: Settings, label: 'Settings', active: false, path: '/staff/settings' },
  ];

  const quickActions = [
    { icon: Users, label: 'Mark Attendance', color: 'bg-blue-500', path: '/staff/attendance' },
    { icon: ClipboardList, label: 'Enter Marks', color: 'bg-green-500', path: '/staff/marks' },
    { icon: Calendar, label: 'View Calendar', color: 'bg-purple-500', path: '/staff/calendar' },
    { icon: Clock, label: 'Timetable', color: 'bg-orange-500', path: '/staff/timetable' },
    { icon: GraduationCap, label: 'Students', color: 'bg-indigo-500', path: '/staff/students' },
    { icon: Brain, label: 'AI Assistant', color: 'bg-pink-500', path: '/ai-assistant' },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex`}>
      {/* LEFT SIDEBAR */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 rounded-r-3xl shadow-2xl z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Menu Items */}
        <div className="p-6">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => item.path && navigate(item.path)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  item.active 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Profile Card */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">{staffProfile?.full_name || 'Staff'}</div>
                <div className="text-white/70 text-sm">{staffProfile?.staff_code || 'Staff Code'}</div>
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
                {greeting}, {staffProfile?.full_name?.split(' ')[0] || 'Staff'} 👋
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block">
                <SearchBar placeholder="Search staff functions..." />
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
                onClick={() => navigate('/staff/profile')}
                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
              >
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* Today's Classes Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Today's Classes</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{todayClasses.length}</div>
                  <div className="text-xs sm:text-sm text-blue-600">Scheduled</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Total Students Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Students</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{assignments.reduce((sum, a) => sum + a.student_count, 0)}</div>
                  <div className="text-xs sm:text-sm text-green-600">Across Classes</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Attendance Rate Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Attendance Rate</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{attendanceSummary?.averageAttendance || 0}%</div>
                  <div className="text-xs sm:text-sm text-orange-600">Average</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Active Alerts Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Active Alerts</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{alerts.length}</div>
                  <div className="text-xs sm:text-sm text-purple-600">Need Attention</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* AI ASSISTANT BANNER */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">AI Staff Assistant</div>
                  <div className="text-sm sm:text-base text-white/80">Get help with teaching and administrative tasks</div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/ai-assistant')}
                className="bg-white text-blue-600 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <span className="text-sm sm:text-base">Chat with AI</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* LOWER SECTION - 3 COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Quick Actions */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
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

            {/* Today's Classes */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3 sm:mb-4`}>Today's Classes</h3>
              {todayClasses.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-2`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No classes today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayClasses.slice(0, 3).map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{cls.subject}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cls.section_name}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cls.room}</p>
                        <p className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{cls.start_time}</p>
                      </div>
                    </div>
                  ))}
                  {todayClasses.length > 3 && (
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                      +{todayClasses.length - 3} more classes
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Attendance Summary */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3 sm:mb-4`}>Attendance Summary</h3>
              {attendanceSummary ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Students</span>
                    <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{attendanceSummary.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Present Today</span>
                    <span className="text-lg font-semibold text-green-600">{attendanceSummary.presentToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Absent Today</span>
                    <span className="text-lg font-semibold text-red-600">{attendanceSummary.absentToday}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Average Attendance</span>
                      <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{attendanceSummary.averageAttendance}%</span>
                    </div>
                    <Progress value={attendanceSummary.averageAttendance} className="h-2" />
                  </div>
                  {attendanceSummary.lowAttendanceSections > 0 && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{attendanceSummary.lowAttendanceSections} sections below 75%</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                </div>
              )}
            </div>
          </div>

          {/* Staff Code and Assignments Info */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6`}>
            <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
              Staff Code: {staffProfile?.staff_code ?? '—'} · {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Staff Assignments Section */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : assignments.length === 0 ? (
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-8 text-center`}>
              <Building2 className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-3`} />
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} text-sm`}>No Assignments</h3>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Contact your administrator for class assignments.</p>
            </div>
          ) : (
            <>
              {/* CLASS INCHARGE Section */}
              {classInchargeAssignments.length > 0 && (
                <div className="space-y-4">
                  <h2 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                    <Users className="w-4 h-4 text-blue-600" /> Class Incharge
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {classInchargeAssignments.map(a => (
                      <div
                        key={a.id}
                        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${activeContext === a.id ? 'ring-2 ring-blue-600' : ''}`}
                        onClick={() => navigate(`/staff/class/${a.section_id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{a.section_name}</h3>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {a.department_code} · {a.semester_label}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {a.student_count} students
                            </span>
                            <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                        </div>
                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>Students</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <BarChart3 className="w-3 h-3" />
                            <span>Attendance</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ClipboardList className="w-3 h-3" />
                            <span>Marks</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBJECT INCHARGE Section */}
              {subjectAssignments.length > 0 && (
                <div className="space-y-4">
                  <h2 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                    <BookOpen className="w-4 h-4 text-green-600" /> Subject Incharge
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {subjectAssignments.map(a => (
                      <div
                        key={a.id}
                        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${activeContext === a.id ? 'ring-2 ring-green-600' : ''}`}
                        onClick={() => navigate(`/staff/subject/${a.section_id}/${a.subject_id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{a.subject_name}</h3>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {a.subject_code} · {a.section_name} · {a.department_code}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {a.student_count} students
                            </span>
                            <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                        </div>
                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ClipboardList className="w-3 h-3" />
                            <span>Marks</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Upload className="w-3 h-3" />
                            <span>Materials</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Brain className="w-3 h-3" />
                            <span>AI Help</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog 
        isOpen={showLogoutDialog} 
        onClose={() => setShowLogoutDialog(false)} 
      />
    </div>
  );
};

const QuickAction = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
    <Icon className="w-3 h-3" />
    <span>{label}</span>
  </div>
);

export default StaffDashboard;
