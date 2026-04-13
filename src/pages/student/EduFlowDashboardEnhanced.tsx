import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useStudentData } from '@/hooks/useStudentData';
import { Button } from '@/components/premium-ui/Button';
import { Card, CardHeader, CardContent } from '@/components/premium-ui/Card';
import { Input } from '@/components/premium-ui/Input';
import '@/styles/eduflow-enhanced.css';
import { 
  Home,
  BookOpen,
  Calendar,
  FileText,
  DollarSign,
  IndianRupee,
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
  AlertCircle,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Layers,
  Grid3x3,
  PieChart,
  TrendingUpIcon,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Heart,
  Bookmark,
  Share2,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

const EduFlowDashboard = () => {
  const { studentProfile, isReady } = useAuthStore();
  const databaseStudentData = useStudentData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(5);
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state if auth store is not ready
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Show loading state if studentProfile is still null but isReady is true
  if (isReady && !studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Fee data - same as FeesPageFixed
  const mockFees = databaseStudentData?.fees?.feeDetails || [
    { id: '1', fee_type: 'Tuition Fee', amount: 25000, due_date: '2024-02-15', status: 'pending' },
    { id: '2', fee_type: 'Library Fee', amount: 2000, due_date: '2024-02-10', status: 'paid' },
    { id: '3', fee_type: 'Lab Fee', amount: 5000, due_date: '2024-02-20', status: 'pending' },
    { id: '4', fee_type: 'Examination Fee', amount: 3000, due_date: '2024-01-30', status: 'overdue' },
    { id: '5', fee_type: 'Hostel Fee', amount: 15000, due_date: '2024-02-05', status: 'paid' }
  ];

  const feeStats = {
    totalFees: databaseStudentData?.fees?.totalFees || 0,
    paidFees: databaseStudentData?.fees?.paidFees || 0,
    pendingFees: databaseStudentData?.fees?.pendingFees || 0,
    overdueFees: databaseStudentData?.fees?.overdueFees || 0,
    dueFees: databaseStudentData?.fees?.dueFees || 0
  };

  // Create student data object that matches component expectations
  const studentData = {
    name: studentProfile?.full_name || "Student",
    rollNumber: studentProfile?.roll_number || "STU001",
    semester: databaseStudentData?.academics?.semester || "Current Semester",
    attendance: databaseStudentData?.attendance?.percentage || 0,
    cgpa: databaseStudentData?.academics?.cgpa || 0,
    rank: 12, // This would need to be calculated from database
    department: "Computer Science",
    email: studentProfile?.email || "student@eduflow.com",
    phone: studentProfile?.phone || "+1234567890",
    totalStudents: 120,
    studyHours: 24,
    assignments: 8,
    subjects: databaseStudentData?.academics?.subjects || 6,
    alerts: databaseStudentData?.attendance?.percentage < 75 ? 1 : 0,
    dueFees: feeStats.dueFees,
    attendanceData: databaseStudentData?.attendance?.weeklyData || []
  };

  // Show loading state if studentProfile is not loaded
  if (!studentProfile && !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  const recentActivities = [
    { id: 1, title: "Attendance Marked", time: "2 hours ago", icon: Calendar, color: "blue", description: "Computer Science - CS301" },
    { id: 2, title: "Assignment Submitted", time: "5 hours ago", icon: FileText, color: "green", description: "Data Structures - Lab 3" },
    { id: 3, title: "Fee Payment Due", time: "1 day ago", icon: DollarSign, color: "orange", description: "Semester 6 fees pending" },
    { id: 4, title: "Exam Results Published", time: "2 days ago", icon: BarChart3, color: "purple", description: "Mid-term results available" },
    { id: 5, title: "Study Material Updated", time: "3 days ago", icon: BookMarked, color: "indigo", description: "New resources added" },
  ];

  const quickActions = [
    { id: 1, title: "Scan Attendance", icon: Camera, color: "blue", description: "Mark your presence", path: "/attendance" },
    { id: 2, title: "View Timetable", icon: CalendarDays, color: "green", description: "Check your schedule", path: "/academics" },
    { id: 3, title: "Study Material", icon: BookMarked, color: "purple", description: "Access resources", path: "/academics" },
    { id: 4, title: "Fee Payment", icon: CreditCard, color: "orange", description: "Pay your fees", path: "/fees" },
    { id: 5, title: "Results", icon: BarChart3, color: "red", description: "View your grades", path: "/exams" },
    { id: 6, title: "AI Assistant", icon: Bot, color: "indigo", description: "Get help instantly", path: "/ai-assistant" },
  ];

  const navigation = [
    { id: 1, title: 'Home', icon: Home, path: '/dashboard', badge: null },
    { id: 2, title: 'Academics', icon: BookOpen, path: '/academics', badge: 3 },
    { id: 3, title: 'Attendance', icon: Calendar, path: '/attendance', badge: null },
    { id: 4, title: 'Exams', icon: FileText, path: '/exams', badge: 2 },
    { id: 5, title: 'Fees', icon: DollarSign, path: '/fees', badge: 1 },
    { id: 6, title: 'Alerts', icon: Bell, path: '/alerts', badge: 5 },
    { id: 7, title: 'AI Assistant', icon: Bot, path: '/ai-assistant', badge: null },
    { id: 8, title: 'Profile', icon: User, path: '/profile', badge: null },
    { id: 9, title: 'Settings', icon: Settings, path: '/settings', badge: null },
  ];

  
  const performanceMetrics = [
    { label: 'Study Hours', value: '24h', change: '+15%', trend: 'up' },
    { label: 'Assignments', value: '8/10', change: '+2', trend: 'up' },
    { label: 'Class Rank', value: `#${studentData.rank}`, change: '+3', trend: 'up' },
    { label: 'Participation', value: '92%', change: '+8%', trend: 'up' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'} transition-all duration-500 relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${darkMode ? 'bg-purple-900/20' : 'bg-purple-400/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-400/20'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${darkMode ? 'bg-pink-900/10' : 'bg-pink-400/10'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Enhanced Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 ${darkMode ? 'bg-gradient-to-b from-gray-900 via-purple-900/90 to-gray-900' : 'bg-gradient-to-b from-purple-700 via-blue-600 to-indigo-700'} shadow-2xl transform transition-all duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} backdrop-blur-xl border-r ${darkMode ? 'border-gray-800' : 'border-white/20'}`}>
        {/* Enhanced Logo Section */}
        <div className="flex items-center justify-center p-8 border-b border-white/10">
          <div className="text-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl transform rotate-6 hover:rotate-0 transition-transform duration-300"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">EduFlow</h1>
            <p className="text-white/70 text-sm font-medium">Student Portal v2.0</p>
          </div>
        </div>

        {/* Enhanced Navigation Menu */}
        <nav className="p-6 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full group relative flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                location.pathname === item.path 
                  ? 'bg-gradient-to-r from-white/20 to-white/10 text-white shadow-xl backdrop-blur-sm border border-white/20' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`relative ${location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                  <item.icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="font-semibold">{item.title}</span>
              </div>
              {location.pathname === item.path && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Enhanced User Profile Card */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">JD</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{studentData.name}</p>
                <p className="text-white/60 text-sm">{studentData.rollNumber}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-xs">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-500 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        {/* Enhanced Top Navbar */}
        <header className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-900/90 backdrop-blur-xl border-gray-800' : 'bg-white/90 backdrop-blur-xl'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200/50'} shadow-2xl`}>
          <div className="px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-6">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`lg:hidden p-3 rounded-2xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-300 hover:scale-110`}
                >
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Enhanced Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses, assignments, resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-12 pr-12 py-4 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'} border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 w-80 text-sm font-medium placeholder-gray-400`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <kbd className={`px-2 py-1 text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} rounded-lg font-mono`}>⌘K</kbd>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Period Selector */}
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className={`px-4 py-2 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-sm font-medium`}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative p-3 rounded-2xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200'} transition-all duration-300 hover:scale-110 group`}
                >
                  <div className="relative">
                    {darkMode ? <Moon className="w-6 h-6 text-yellow-400" /> : <Sun className="w-6 h-6 text-orange-500" />}
                    <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-pulse" />
                  </div>
                </button>


                {/* Enhanced Profile Avatar */}
                <div className="relative group">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl cursor-pointer hover:scale-110 transition-transform duration-300 shadow-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">JD</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Dashboard Content */}
        <main className="p-6 lg:p-8">
          <div className={`space-y-8 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
            {/* Enhanced Top Card - Student Info */}
            <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600'} rounded-3xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  {/* Enhanced Circular Progress */}
                  <div className="flex justify-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="16"
                          fill="none"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="url(#gradient)"
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 70}`}
                          strokeDashoffset={`${2 * Math.PI * 70 * (1 - studentData.attendance / 100)}`}
                          className="transition-all duration-1500 ease-out"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{studentData.attendance}%</span>
                        <span className="text-white/80 font-medium">Attendance</span>
                        <div className="flex items-center space-x-1 mt-2">
                          <TrendingUp className="w-4 h-4 text-green-300" />
                          <span className="text-green-300 text-sm">+5%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Student Details */}
                  <div className="lg:col-span-2 text-center lg:text-left">
                    <h2 className="text-4xl font-black text-white mb-4">{studentData.name}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-yellow-300" />
                          <div>
                            <p className="text-white/70 text-sm">Roll Number</p>
                            <p className="text-white font-bold">{studentData.rollNumber}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-5 h-5 text-green-300" />
                          <div>
                            <p className="text-white/70 text-sm">Semester</p>
                            <p className="text-white font-bold">{studentData.semester}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3">
                          <Target className="w-5 h-5 text-blue-300" />
                          <div>
                            <p className="text-white/70 text-sm">Rank</p>
                            <p className="text-white font-bold">#{studentData.rank}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center space-x-3">
                          <Award className="w-5 h-5 text-purple-300" />
                          <div>
                            <p className="text-white/70 text-sm">CGPA</p>
                            <p className="text-white font-bold">{studentData.cgpa}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-transparent hover:border-purple-200 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-7 h-7 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{studentData.cgpa}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">CGPA</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Academic Performance</span>
                    <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">+0.2</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-transparent hover:border-blue-200 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{studentData.subjects}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Subjects</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Active Courses</span>
                    <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Active</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-transparent hover:border-orange-200 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IndianRupee className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">₹{studentData.dueFees.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Due Fees</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Payment Status</span>
                    <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">Due</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-transparent hover:border-red-200 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Bell className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{studentData.alerts}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Alerts</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Notifications</span>
                    <div className="flex items-center space-x-1 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-lg">
                      <Zap className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">New</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Enhanced AI Assistant Banner */}
            <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600'} rounded-3xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  <div className="mb-6 lg:mb-0">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="relative">
                        <Bot className="w-8 h-8 text-white" />
                        <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-300 animate-pulse" />
                      </div>
                      <h3 className="text-3xl font-black text-white">EduFlow AI Assistant</h3>
                    </div>
                    <p className="text-white/90 text-lg max-w-md">Get instant help with your studies, assignments, and exam preparation with our advanced AI technology</p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Zap className="w-4 h-4 text-yellow-300" />
                        <span className="text-white text-sm font-medium">24/7 Available</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Shield className="w-4 h-4 text-green-300" />
                        <span className="text-white text-sm font-medium">AI Powered</span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300 group">
                    <MessageSquare className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Chat with AI
                    <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <Card key={index} className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-transparent hover:border-purple-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{metric.label}</span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                      metric.trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                      <span className={`text-sm font-bold ${
                        metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>{metric.change}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{metric.value}</div>
                </Card>
              ))}
            </div>

            {/* Enhanced Lower Section - 3 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left - Enhanced Attendance Chart */}
              <Card className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} shadow-2xl border-2 border-transparent hover:border-purple-200 transition-all duration-500`}>
                <CardHeader title="Weekly Attendance" />
                <CardContent>
                  <div className="space-y-4">
                    {studentData.attendanceData.map((data, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data.day}</span>
                          <span className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data.percentage}%</span>
                        </div>
                        <div className={`h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden relative`}>
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                              data.percentage === 0 ? 'bg-gray-400' : 
                              data.percentage >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
                              data.percentage >= 75 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                              'bg-gradient-to-r from-red-400 to-pink-500'
                            }`}
                            style={{ width: `${data.percentage}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {data.status === 'present' ? 'Present' : 
                             data.status === 'late' ? 'Late' : 
                             data.status === 'partial' ? 'Partial' : 'Holiday'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Center - Enhanced Recent Activity */}
              <Card className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} shadow-2xl border-2 border-transparent hover:border-purple-200 transition-all duration-500`}>
                <CardHeader title="Recent Activity" />
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className={`group flex items-start space-x-4 p-4 rounded-2xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-all duration-300 hover:scale-105 cursor-pointer`}>
                        <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${
                          activity.color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30' :
                          activity.color === 'green' ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' :
                          activity.color === 'orange' ? 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30' :
                          activity.color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30' :
                          'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30'
                        }`}>
                          <activity.icon className={`w-6 h-6 ${
                            activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                            activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                            activity.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            activity.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                            'text-indigo-600 dark:text-indigo-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{activity.title}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>{activity.description}</p>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Right - Enhanced Quick Actions */}
              <Card className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} shadow-2xl border-2 border-transparent hover:border-purple-200 transition-all duration-500`}>
                <CardHeader title="Quick Actions" />
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                      <Link
                        key={action.id}
                        to={action.path}
                        className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200'} transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                          action.color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30' :
                          action.color === 'green' ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' :
                          action.color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30' :
                          action.color === 'orange' ? 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30' :
                          action.color === 'red' ? 'bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30' :
                          'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30'
                        }`}>
                          <action.icon className={`w-7 h-7 ${
                            action.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                            action.color === 'green' ? 'text-green-600 dark:text-green-400' :
                            action.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                            action.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                            action.color === 'red' ? 'text-red-600 dark:text-red-400' :
                            'text-indigo-600 dark:text-indigo-400'
                          }`} />
                        </div>
                        <span className={`relative text-sm font-bold text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.title}</span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-center mt-1`}>{action.description}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EduFlowDashboard;
