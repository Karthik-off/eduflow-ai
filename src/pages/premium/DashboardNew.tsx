import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/premium-ui/Button';
import { Card, CardHeader, CardContent } from '@/components/premium-ui/Card';
import { Input } from '@/components/premium-ui/Input';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Award,
  Clock,
  Mail,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  GraduationCap,
  Building,
  Activity,
  DollarSign,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  LogOut,
  Home,
  FileText,
  ChevronRight
} from 'lucide-react';

const PremiumDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();

  // Mock data
  const stats = {
    totalStudents: 1234,
    totalStaff: 89,
    totalClasses: 45,
    totalRevenue: 234567,
    newStudents: 45,
    attendanceRate: 87.5,
    completionRate: 92.3,
    satisfactionRate: 94.2,
    studentsGrowth: 12.3,
    staffGrowth: 5.7,
    revenueGrowth: 23.4,
  };

  const recentActivities = [
    { id: 1, type: 'student', message: 'New student John Doe registered', time: '2 min ago', icon: UserPlus, color: 'blue' },
    { id: 2, type: 'attendance', message: 'Class CS301 attendance updated', time: '15 min ago', icon: Calendar, color: 'green' },
    { id: 3, type: 'staff', message: 'New staff member Sarah joined', time: '1 hour ago', icon: Users, color: 'purple' },
    { id: 4, type: 'revenue', message: 'Payment received from 23 students', time: '2 hours ago', icon: DollarSign, color: 'orange' },
  ];

  const quickActions = [
    { id: 1, title: 'Add Student', description: 'Register new student', icon: UserPlus, color: 'blue', action: () => navigate('/students') },
    { id: 2, title: 'Add Staff', description: 'Register new staff member', icon: Users, color: 'green', action: () => navigate('/staff') },
    { id: 3, title: 'Create Class', description: 'Create new class', icon: BookOpen, color: 'purple', action: () => navigate('/classes') },
    { id: 4, title: 'View Reports', description: 'Analytics and insights', icon: BarChart3, color: 'orange', action: () => navigate('/reports') },
  ];

  const navigation = [
    { id: 1, title: 'Dashboard', icon: Home, href: '/dashboard', active: true },
    { id: 2, title: 'Students', icon: GraduationCap, href: '/students' },
    { id: 3, title: 'Staff', icon: Users, href: '/staff' },
    { id: 4, title: 'Classes', icon: BookOpen, href: '/classes' },
    { id: 5, title: 'Attendance', icon: Calendar, href: '/attendance' },
    { id: 6, title: 'Reports', icon: BarChart3, href: '/reports' },
    { id: 7, title: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">EduFlow</h2>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.active 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
              {item.active && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </a>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@eduflow.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Top Navigation */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-500" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students, staff, classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 w-64"
                />
              </div>

              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-500" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full cursor-pointer"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card variant="gradient" className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    <ArrowUp className="w-4 h-4 text-green-300" />
                    <span className="text-green-300 text-sm">+{stats.studentsGrowth}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="gradient" className="p-6 bg-gradient-to-br from-green-600 to-emerald-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Staff</p>
                  <p className="text-3xl font-bold">{stats.totalStaff}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    <ArrowUp className="w-4 h-4 text-green-300" />
                    <span className="text-green-300 text-sm">+{stats.staffGrowth}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="gradient" className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Classes</p>
                  <p className="text-3xl font-bold">{stats.totalClasses}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="gradient" className="p-6 bg-gradient-to-br from-orange-600 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Revenue</p>
                  <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    <ArrowUp className="w-4 h-4 text-green-300" />
                    <span className="text-green-300 text-sm">+{stats.revenueGrowth}%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader title="Quick Actions" />
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200/50 hover:border-gray-200/70 hover:shadow-md transition-all duration-300 hover:scale-105 group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                        action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        action.color === 'green' ? 'bg-green-100 text-green-600' :
                        action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader title="Recent Activity" />
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        activity.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        activity.color === 'green' ? 'bg-green-100 text-green-600' :
                        activity.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader title="Performance Metrics" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
                  <p className="text-sm text-gray-500">Attendance Rate</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}%</p>
                  <p className="text-sm text-gray-500">Satisfaction Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default PremiumDashboard;
