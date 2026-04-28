import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { Card, CardHeader, CardContent } from '@/components/premium-ui/Card';
import { Button } from '@/components/premium-ui/Button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar,
  FileText,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Award,
  Camera,
  Upload,
  Filter,
  MoreHorizontal,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  CalendarDays,
  BookMarked,
  CreditCard,
  MessageSquare,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Check,
  Sun,
  Moon
} from 'lucide-react';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';

const StudentDashboard = () => {
  const { studentProfile } = useAuthStore();
  const { stats: attendanceStats } = useAttendanceData();
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (studentProfile?.id && mounted) {
      fetchNotifications();
    }
  }, [studentProfile?.id, mounted]);

  const fetchNotifications = async () => {
    if (!studentProfile?.id) return;
    
    setNotificationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', studentProfile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Dynamic student data from auth store
  const studentData = {
    name: studentProfile?.full_name || "Student",
    rollNumber: studentProfile?.roll_number || "STU001",
    semester: studentProfile?.current_semester_id ? 
      (() => {
        try {
          const parts = studentProfile.current_semester_id.split('-');
          return parts[1] ? `${parts[1]} Semester` : "Current Semester";
        } catch (error) {
          return "Current Semester";
        }
      })() : "Current Semester",
    attendance: attendanceStats.percentage,
    cgpa: studentProfile?.cgpa || 0,
    rank: 12,
    department: "Computer Science",
    email: studentProfile?.email || "student@eduflow.com",
    phone: studentProfile?.phone || "+1234567890",
    totalStudents: 120,
    studyHours: 24,
    assignments: 8
  };

  // Dynamic attendance data based on student profile
  const attendanceData = [
    { day: 'Mon', percentage: Math.min(100, Math.max(0, attendanceStats.percentage + Math.random() * 20 - 10)), status: 'present' },
    { day: 'Tue', percentage: Math.min(100, Math.max(0, attendanceStats.percentage + Math.random() * 20 - 10)), status: 'present' },
    { day: 'Wed', percentage: Math.min(100, Math.max(0, attendanceStats.percentage + Math.random() * 20 - 10)), status: 'present' },
    { day: 'Thu', percentage: Math.min(100, Math.max(0, attendanceStats.percentage + Math.random() * 20 - 10)), status: 'present' },
    { day: 'Fri', percentage: Math.min(100, Math.max(0, attendanceStats.percentage + Math.random() * 20 - 10)), status: 'present' },
    { day: 'Sat', percentage: 0, status: 'weekend' },
    { day: 'Sun', percentage: 0, status: 'weekend' }
  ];

  const performanceMetrics = [
    { label: 'Study Hours', value: '24h', change: '+15%', trend: 'up' },
    { label: 'Assignments', value: '8/10', change: '+2', trend: 'up' },
    { label: 'Class Rank', value: `#${studentData.rank}`, change: '+3', trend: 'up' },
    { label: 'Participation', value: '92%', change: '+8%', trend: 'up' }
  ];

  const recentActivities = [
    { id: 1, title: "Attendance Marked", time: "2 hours ago", icon: Calendar, color: "blue", description: "Computer Science - CS301" },
    { id: 2, title: "Assignment Submitted", time: "5 hours ago", icon: FileText, color: "green", description: "Data Structures - Lab 3" },
    { id: 3, title: "Fee Payment Due", time: "1 day ago", icon: DollarSign, color: "orange", description: "Semester 6 fees pending" },
    { id: 4, title: "Exam Results Published", time: "2 days ago", icon: BarChart3, color: "purple", description: "Mid-term results available" },
    { id: 5, title: "Study Material Updated", time: "3 days ago", icon: BookMarked, color: "indigo", description: "New resources added" }
  ];

  const quickActions = [
    { id: 1, title: "Mark Attendance", icon: Camera, color: "blue", description: "Mark your presence" },
    { id: 2, title: "View Assignments", icon: FileText, color: "green", description: "Check pending tasks" },
    { id: 3, title: "Pay Fees", icon: CreditCard, color: "orange", description: "Complete payment" },
    { id: 4, title: "Download Resources", icon: Upload, color: "purple", description: "Access study materials" }
  ];

  const upcomingEvents = [
    { id: 1, title: "Data Structures Exam", date: "2024-04-15", type: "exam", color: "red" },
    { id: 2, title: "Lab Submission", date: "2024-04-18", type: "assignment", color: "blue" },
    { id: 3, title: "Guest Lecture", date: "2024-04-20", type: "lecture", color: "green" },
    { id: 4, title: "Project Presentation", date: "2024-04-22", type: "presentation", color: "purple" }
  ];

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 dark:text-green-400';
      case 'late': return 'text-amber-600 dark:text-amber-400';
      case 'partial': return 'text-blue-600 dark:text-blue-400';
      case 'absent': return 'text-red-600 dark:text-red-400';
      case 'holiday': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getAttendanceBg = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 dark:bg-green-900/30';
      case 'late': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'partial': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'absent': return 'bg-red-100 dark:bg-red-900/30';
      case 'holiday': return 'bg-gray-100 dark:bg-gray-900/30';
      default: return 'bg-gray-100 dark:bg-gray-900/30';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <UnifiedLayout userRole="student" title="Student Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <Card className="hover-lift-enhanced">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {studentData.name}! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {studentData.rollNumber} • {studentData.semester}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current CGPA</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{studentData.cgpa}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Attendance</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{studentData.attendance}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{studentData.totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Study Hours</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{studentData.studyHours}h</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assignments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{studentData.assignments}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Class Rank</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">#{studentData.rank}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications/Alerts */}
        <Card className="hover-lift-enhanced">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications & Alerts</h3>
          </CardHeader>
          <CardContent className="p-6">
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-purple-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'fee_added' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      notification.type === 'marks_updated' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      notification.type === 'attendance_updated' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-gray-100 dark:bg-gray-900/30'
                    }`}>
                      {notification.type === 'fee_added' && <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                      {notification.type === 'marks_updated' && <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                      {notification.type === 'attendance_updated' && <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      {(!notification.type || notification.type === 'info') && <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Chart */}
        <Card className="hover-lift-enhanced">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Attendance</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {attendanceData.map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{day.day}</p>
                  <div className={`w-full h-20 rounded-lg flex items-center justify-center ${getAttendanceBg(day.status)}`}>
                    <p className={`text-lg font-bold ${getAttendanceColor(day.status)}`}>
                      {day.status === 'holiday' ? '-' : `${day.percentage}%`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="hover-lift-enhanced">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                      activity.color === 'orange' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      activity.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-gray-100 dark:bg-gray-900/30'
                    }`}>
                      <activity.icon className={`w-5 h-5 ${
                        activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        activity.color === 'orange' ? 'text-amber-600 dark:text-amber-400' :
                        activity.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover-lift-enhanced">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  className="hover-lift-enhanced h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    action.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    action.color === 'orange' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    'bg-gray-100 dark:bg-gray-900/30'
                  }`}>
                    <action.icon className={`w-6 h-6 ${
                      action.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      action.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      action.color === 'orange' ? 'text-amber-600 dark:text-amber-400' :
                      action.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{action.title}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{action.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="hover-lift-enhanced">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      event.color === 'red' ? 'bg-red-500' :
                      event.color === 'blue' ? 'bg-blue-500' :
                      event.color === 'green' ? 'bg-green-500' :
                      event.color === 'purple' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{event.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.type === 'exam' ? 'bg-red-100 text-red-600' :
                      event.type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                      event.type === 'lecture' ? 'bg-green-100 text-green-600' :
                      event.type === 'presentation' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
};

export default StudentDashboard;
