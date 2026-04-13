// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import StudentLayoutFixed from '@/components/layouts/StudentLayoutFixed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Search,
  Sun,
  Moon,
  BellDot,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  CreditCard,
  Target,
  TrendingUp,
  CalendarDays,
  Activity,
  QrCode,
  BookMarked,
  Wallet,
  MessageSquare
} from 'lucide-react';

const StudentDashboardFixed = () => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [records, setRecords] = useState([
    { status: 'present' },
    { status: 'absent' },
    { status: 'late' },
    { status: 'present' },
    { status: 'present' },
    { status: 'absent' },
    { status: 'late' },
    { status: 'present' },
    { status: 'present' },
    { status: 'absent' },
  ]);

  // Calculate attendance statistics
  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    percentage: records.length > 0 ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100) : 0
  };

  // Determine attendance status and color based on percentage
  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) {
      return { status: 'Good', color: 'text-green-600', bgColor: 'from-green-500 to-green-600' };
    } else if (percentage >= 60) {
      return { status: 'Average', color: 'text-amber-600', bgColor: 'from-amber-500 to-amber-600' };
    } else {
      return { status: 'Poor', color: 'text-red-600', bgColor: 'from-red-500 to-red-600' };
    }
  };

  const attendanceStatus = getAttendanceStatus(stats.percentage);

  // Determine greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard', active: true },
    { icon: BookOpen, label: 'Academics', path: '/academics', active: false },
    { icon: Calendar, label: 'Attendance', path: '/attendance', active: false },
    { icon: FileText, label: 'Exams', path: '/exams', active: false },
    { icon: DollarSign, label: 'Fees', path: '/fees', active: false },
    { icon: Bell, label: 'Alerts', path: '/alerts', active: false },
    { icon: Bot, label: 'AI Assistant', path: '/ai-assistant', active: false, badge: 'New' },
    { icon: User, label: 'Profile', path: '/profile', active: false },
    { icon: Settings, label: 'Settings', path: '/settings', active: false }
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

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <StudentLayoutFixed title="Dashboard">
      <div className="space-y-6">
        {/* TOP ATTENDANCE CARD */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Circular Attendance Progress */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-8 border-green-500 border-t-transparent border-r-transparent transform rotate-45"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${attendanceStatus.color}`}>{attendanceStatus.percentage}%</div>
                    <div className="text-sm text-gray-500">Attendance</div>
                  </div>
                </div>
              </div>
              
              {/* Roll Number and Semester */}
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Roll Number</div>
                  <div className="text-xl font-semibold text-gray-800">21UCS123</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Semester</div>
                  <div className="text-xl font-semibold text-gray-800">Current</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CGPA Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">CGPA</div>
                <div className="text-2xl font-bold text-gray-800">8.5</div>
                <div className="text-sm text-green-600">Excellent</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Subjects Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Subjects</div>
                <div className="text-2xl font-bold text-gray-800">6</div>
                <div className="text-sm text-blue-600">Active</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Due Fees Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Due Fees</div>
                <div className="text-2xl font-bold text-gray-800">Rs. 45,000</div>
                <div className="text-sm text-orange-600">Remaining</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Alerts</div>
                <div className="text-2xl font-bold text-gray-800">3</div>
                <div className="text-sm text-red-600">New</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* AI ASSISTANT BANNER */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">AI Assistant</div>
                <div className="text-white/80">Get instant help with your studies</div>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/ai-assistant')}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50"
            >
              Chat with AI
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* LOWER SECTION - 3 COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Overview</h3>
            
            {/* Simple Line Chart Representation */}
            <div className="h-40 mb-4 relative">
              <div className="absolute inset-0 flex items-end justify-between space-x-2">
                <div className="flex-1 bg-blue-500 rounded-t" style={{height: '70%'}}></div>
                <div className="flex-1 bg-blue-500 rounded-t" style={{height: '85%'}}></div>
                <div className="flex-1 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
                <div className="flex-1 bg-blue-500 rounded-t" style={{height: '90%'}}></div>
                <div className="flex-1 bg-blue-500 rounded-t" style={{height: '75%'}}></div>
                <div className="flex-1 bg-gray-300 rounded-t" style={{height: '0%'}}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">45</div>
                <div className="text-sm text-gray-500">Total Classes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">30</div>
                <div className="text-sm text-gray-500">Attended</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${attendanceStatus.color}`}>{attendanceStatus.percentage}%</div>
                <div className="text-sm text-gray-500">Percentage</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.color} bg-opacity-10`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{activity.label}</div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 flex flex-col items-center space-y-2 transition-all duration-300 hover:shadow-md cursor-pointer"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayoutFixed>
  );
};

export default StudentDashboardFixed;
