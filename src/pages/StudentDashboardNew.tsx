import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
import { useStudentData } from '@/hooks/useStudentData';
import { useDarkMode } from '@/contexts/DarkModeContext';
import SearchBar from '@/components/SearchBar';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';
import BackToHomeButton from '@/components/BackToHomeButton';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  FileText, 
  DollarSign, 
  Bell, 
  Bot, 
  User, 
  Settings,
  Sun,
  Moon,
  BellDot,
  Activity,
  Clock,
  Users,
  CreditCard,
  AlertTriangle,
  QrCode,
  CalendarDays,
  BookMarked,
  Wallet,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  LogOut
} from 'lucide-react';

const StudentDashboardNew = () => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Use unified student data hook
  const studentData = useStudentData();
  
  // Attendance threshold and notification state
  const [showAttendanceAlert, setShowAttendanceAlert] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const ATTENDANCE_THRESHOLD = 75; // Alert if attendance falls below 75%


  // Determine greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Check attendance threshold and show alert if needed
  useEffect(() => {
    // Use unified attendance data
    if (studentData.attendance.percentage < ATTENDANCE_THRESHOLD) {
      setShowAttendanceAlert(true);
    }
  }, [studentData.attendance.percentage, ATTENDANCE_THRESHOLD]);
  
  const isAttendanceBelowThreshold = studentData.attendance.percentage < ATTENDANCE_THRESHOLD;
  const attendanceStatus = isAttendanceBelowThreshold ? 'Below Threshold' : 'Good';
  const attendanceColor = isAttendanceBelowThreshold ? 'text-red-600' : 'text-green-600';
  const progressColor = isAttendanceBelowThreshold ? 'border-red-500' : 'border-green-500';

  const menuItems = [
    { icon: Home, label: 'Home', active: true, path: '/dashboard' },
    { icon: BookOpen, label: 'Academics', active: false, path: '/academics' },
    { icon: Calendar, label: 'Attendance', active: false, path: '/attendance' },
    { icon: FileText, label: 'Exams', active: false, path: '/exams' },
    { icon: DollarSign, label: 'Fees', active: false, path: '/fees' },
    { icon: Bell, label: 'Alerts', active: false, path: '/alerts' },
    { icon: Bot, label: 'AI Assistant', active: false, badge: 'New', path: '/ai-assistant' },
    { icon: User, label: 'Profile', active: false, path: '/profile' },
    { icon: Settings, label: 'Settings', active: false, path: '/settings' }
  ];

  const quickActions = [
    { icon: QrCode, label: 'Scan Attendance', color: 'bg-blue-500', path: '/attendance' },
    { icon: CalendarDays, label: 'View Timetable', color: 'bg-green-500', path: '/academics' },
    { icon: BookMarked, label: 'Study Material', color: 'bg-purple-500', path: '/academics' },
    { icon: Wallet, label: 'Fee Payment', color: 'bg-orange-500', path: '/fees' },
    { icon: TrendingUp, label: 'Results', color: 'bg-indigo-500', path: '/exams' },
    { icon: MessageSquare, label: 'AI Assistant', color: 'bg-pink-500', path: '/ai-assistant' }
  ];

  const recentActivities = [
    { icon: Calendar, label: 'Attendance marked', time: '2 hours ago', color: 'text-green-500' },
    { icon: FileText, label: 'Assignment submitted', time: '5 hours ago', color: 'text-blue-500' },
    { icon: DollarSign, label: 'Fee payment received', time: '1 day ago', color: 'text-green-500' },
    { icon: Bell, label: 'New alert from professor', time: '2 days ago', color: 'text-orange-500' }
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
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">{studentProfile?.full_name || 'Student'}</div>
                <div className="text-white/70 text-sm">Student</div>
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
                {greeting}, {studentProfile?.full_name?.split(' ')[0] || 'Student'} 👋
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block">
                <SearchBar placeholder="Search pages..." />
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
                onClick={() => navigate('/profile')}
                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
              >
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">

          {/* ATTENDANCE THRESHOLD ALERT */}
          {isAttendanceBelowThreshold && !isAlertDismissed && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200 mb-1 sm:mb-2">
                    Attendance Below Threshold
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-3 sm:mb-4">
                    Your attendance is {studentData.attendance.percentage}%, which is below the required {ATTENDANCE_THRESHOLD}% threshold. 
                    Please improve your attendance to avoid academic penalties.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button 
                      onClick={() => navigate('/attendance')}
                      className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 w-full sm:w-auto"
                    >
                      View Attendance Details
                    </button>
                    <button 
                      onClick={() => setIsAlertDismissed(true)}
                      className="px-3 sm:px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm font-medium transition-colors duration-200 w-full sm:w-auto"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* CGPA Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>CGPA</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{studentData.academics.cgpa || 'N/A'}</div>
                  <div className="text-xs sm:text-sm text-green-600">Excellent</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Subjects Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Subjects</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{studentData.academics.subjects || 0}</div>
                  <div className="text-xs sm:text-sm text-blue-600">Active</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Due Fees Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Due Fees</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>₹{studentData.fees.dueFees.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-orange-600">Remaining</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Alerts Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Alerts</div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{isAttendanceBelowThreshold ? '1' : '0'}</div>
                  <div className="text-xs sm:text-sm text-red-600">New</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* AI ASSISTANT BANNER */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">AI Assistant</div>
                  <div className="text-sm sm:text-base text-white/80">Get instant help with your studies</div>
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
            {/* Attendance Overview */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Attendance Overview</h3>
                <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                  isAttendanceBelowThreshold 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {isAttendanceBelowThreshold ? 'Below 75%' : 'Good'}
                </div>
              </div>
              
              {/* Dynamic Attendance Chart */}
              <div className="h-32 sm:h-40 mb-3 sm:mb-4 relative">
                <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-2">
                  {studentData.attendance.weeklyData.map((day, index) => (
                    <div 
                      key={index} 
                      className={`flex-1 rounded-t ${
                        day.status === 'weekend' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'
                      }`} 
                      style={{height: `${day.percentage}%`}}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{studentData.attendance.totalClasses}</div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Classes</div>
                </div>
                <div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{studentData.attendance.presentClasses}</div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Attended</div>
                </div>
                <div>
                  <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{studentData.attendance.percentage}%</div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Percentage</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
              <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3 sm:mb-4`}>Recent Activity</h3>
              <div className="space-y-3 sm:space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${activity.color} bg-opacity-10`}>
                      <activity.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{activity.label}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
          </div>
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

export default StudentDashboardNew;
