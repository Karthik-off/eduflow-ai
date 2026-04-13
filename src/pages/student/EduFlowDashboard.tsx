import React, { useState, useEffect } from 'react';
import { Button } from '@/components/premium-ui/Button';
import { Card, CardHeader, CardContent } from '@/components/premium-ui/Card';
import { Input } from '@/components/premium-ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useStudentData } from '@/hooks/useStudentData';
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
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Camera,
  CalendarDays,
  BookMarked,
  CreditCard,
  BarChart3,
  MessageSquare,
  Sun,
  Moon,
  ChevronRight,
  Users,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';

const EduFlowDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { studentProfile } = useAuthStore();
  const studentData = useStudentData();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  const recentActivities = [
    { id: 1, title: "Attendance Marked", time: "2 hours ago", icon: Calendar, color: "blue" },
    { id: 2, title: "Assignment Submitted", time: "5 hours ago", icon: FileText, color: "green" },
    { id: 3, title: "Fee Payment Due", time: "1 day ago", icon: DollarSign, color: "orange" },
    { id: 4, title: "Exam Results Published", time: "2 days ago", icon: BarChart3, color: "purple" },
  ];

  const quickActions = [
    { id: 1, title: "Scan Attendance", icon: Camera, color: "blue" },
    { id: 2, title: "View Timetable", icon: CalendarDays, color: "green" },
    { id: 3, title: "Study Material", icon: BookMarked, color: "purple" },
    { id: 4, title: "Fee Payment", icon: CreditCard, color: "orange" },
    { id: 5, title: "Results", icon: BarChart3, color: "red" },
    { id: 6, title: "AI Assistant", icon: Bot, color: "indigo" },
  ];

  const navigation = [
    { id: 1, title: 'Home', icon: Home, active: true },
    { id: 2, title: 'Academics', icon: BookOpen },
    { id: 3, title: 'Attendance', icon: Calendar },
    { id: 4, title: 'Exams', icon: FileText },
    { id: 5, title: 'Fees', icon: DollarSign },
    { id: 6, title: 'Alerts', icon: Bell },
    { id: 7, title: 'AI Assistant', icon: Bot },
    { id: 8, title: 'Profile', icon: User },
    { id: 9, title: 'Settings', icon: Settings },
  ];

  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'} transition-colors duration-300`}>
      {/* Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 ${darkMode ? 'bg-gradient-to-b from-purple-900 to-blue-900' : 'bg-gradient-to-b from-purple-600 to-blue-600'} shadow-2xl transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-center p-6 border-b border-white/20">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">EduFlow</h1>
            <p className="text-white/80 text-sm">Student Portal</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.active 
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
              {item.active && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">JD</span>
              </div>
              <div>
                <p className="text-white font-medium">{studentProfile?.full_name || 'Student'}</p>
                <p className="text-gray-600 dark:text-gray-300">Roll No: {studentProfile?.roll_number || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Top Navbar */}
        <header className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 backdrop-blur-sm'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200/50'} shadow-sm`}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2.5 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 w-64`}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                </button>


                {/* Profile Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full cursor-pointer hover:scale-105 transition-transform"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className={`space-y-6 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
            {/* Top Card - Student Info */}
            <Card variant="gradient" className={`${darkMode ? 'bg-gradient-to-r from-purple-800 to-blue-800' : 'bg-gradient-to-r from-purple-600 to-blue-600'} text-white`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Circular Progress */}
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="white"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - studentData.attendance.percentage / 100)}`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-black text-gray-900 dark:text-white">{studentData.attendance.percentage}%</div>
                        <span className="text-sm text-white/80">Attendance</span>
                      </div>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="md:col-span-2 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {studentProfile?.full_name || 'Student'}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-white/80" />
                        <span className="text-white/80">Roll:</span>
                        <span className="font-medium">{studentProfile?.roll_number || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-white/80" />
                        <span className="text-white/80">Semester:</span>
                        <span className="font-medium">{studentData.academics.semester}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-6 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>CGPA</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{studentData.academics.cgpa}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500">+0.2</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-6 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Subjects</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{studentData.academics.subjects}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-500">Active</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-6 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Due Fees</p>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">₹{studentData.fees.dueFees.toLocaleString()}</div>
                    <div className="flex items-center space-x-1 mt-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-500">Due Soon</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </Card>

              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-6 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Alerts</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>3</p>
                    <div className="flex items-center space-x-1 mt-2">
                      <Bell className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-500">New</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Assistant Banner */}
            <Card className={`${darkMode ? 'bg-gradient-to-r from-purple-800 to-indigo-800 border-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="w-6 h-6" />
                      <h3 className="text-xl font-bold">EduFlow AI Assistant</h3>
                    </div>
                    <p className="text-white/80">Get instant help with your studies, assignments, and exam preparation</p>
                  </div>
                  <Button className="bg-white text-purple-600 hover:bg-gray-100">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with AI
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lower Section - 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left - Attendance Chart */}
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardHeader title="Weekly Attendance" />
                <CardContent>
                  <div className="space-y-4">
                    {studentData.attendance.weeklyData.map((data, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className={`text-sm font-medium w-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{data.day}</span>
                        <div className="flex-1">
                          <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                            <div
                              className={`h-full ${data.percentage === 0 ? 'bg-gray-400' : data.percentage >= 90 ? 'bg-green-500' : data.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full transition-all duration-500`}
                              style={{ width: `${data.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className={`text-sm font-medium w-10 text-right ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{data.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Center - Recent Activity */}
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardHeader title="Recent Activity" />
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className={`flex items-start space-x-3 p-3 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          activity.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          activity.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        }`}>
                          <activity.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activity.title}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Right - Quick Actions */}
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardHeader title="Quick Actions" />
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-all duration-300 hover:scale-105 group`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 ${
                          action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          action.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          action.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          action.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-medium text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.title}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EduFlowDashboard;
