import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/premium-ui/Button';
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
  ChevronRight,
  Sun,
  Moon,
  Shield,
  Sparkles,
  LogOut
} from 'lucide-react';
import '@/styles/eduflow-enhanced.css';

interface PremiumLayoutProps {
  children: React.ReactNode;
  title?: string;
  userRole?: 'student' | 'staff' | 'admin';
}

const PremiumLayout: React.FC<PremiumLayoutProps> = ({ children, title, userRole = 'student' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(5);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseNavigation = [
      { id: 1, title: 'Dashboard', icon: Home, path: userRole === 'admin' ? '/admin/dashboard' : userRole === 'staff' ? '/staff/dashboard' : '/dashboard', badge: null },
      { id: 2, title: 'Academics', icon: BookOpen, path: '/academics', badge: 3 },
      { id: 3, title: 'Attendance', icon: Calendar, path: '/attendance', badge: null },
      { id: 4, title: 'Exams', icon: FileText, path: '/exams', badge: 2 },
      { id: 5, title: 'Fees', icon: DollarSign, path: '/fees', badge: 1 },
      { id: 6, title: 'Alerts', icon: Bell, path: '/alerts', badge: 5 },
      { id: 7, title: 'AI Assistant', icon: Bot, path: '/ai-assistant', badge: null },
      { id: 8, title: 'Profile', icon: User, path: '/profile', badge: null },
      { id: 9, title: 'Settings', icon: Settings, path: '/settings', badge: null },
    ];

    // Add role-specific navigation items
    if (userRole === 'staff') {
      return [
        baseNavigation[0], // Dashboard
        { id: 10, title: 'Classes', icon: BookOpen, path: '/staff/class', badge: 2 },
        { id: 11, title: 'Subjects', icon: FileText, path: '/staff/subjects', badge: 1 },
        { id: 12, title: 'Marks Entry', icon: FileText, path: '/staff/marks', badge: 3 },
        { id: 13, title: 'Timetable', icon: Calendar, path: '/staff/timetable', badge: null },
        { id: 14, title: 'Calendar', icon: Calendar, path: '/staff/calendar', badge: null },
        baseNavigation[7], // AI Assistant
        baseNavigation[8], // Profile
        baseNavigation[9], // Settings
      ];
    }

    if (userRole === 'admin') {
      return [
        baseNavigation[0], // Dashboard
        { id: 15, title: 'Students', icon: User, path: '/students', badge: 5 },
        { id: 16, title: 'Staff', icon: User, path: '/staff/dashboard', badge: 2 },
        { id: 17, title: 'Classes', icon: BookOpen, path: '/admin/class', badge: 3 },
        baseNavigation[7], // AI Assistant
        baseNavigation[8], // Profile
        baseNavigation[9], // Settings
      ];
    }

    return baseNavigation;
  };

  const navigation = getNavigationItems();

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/login');
  };

  const getUserData = () => {
    // Mock user data - in real app, this would come from auth store
    return {
      name: userRole === 'admin' ? 'Admin User' : userRole === 'staff' ? 'Staff User' : 'John Doe',
      email: `${userRole}@eduflow.com`,
      role: userRole.charAt(0).toUpperCase() + userRole.slice(1)
    };
  };

  const userData = getUserData();

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
            <p className="text-white/70 text-sm font-medium">{userData.role} Portal v2.0</p>
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
                  <span className="text-white font-bold text-lg">{userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{userData.name}</p>
                <p className="text-white/60 text-sm">{userData.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-xs">Verified</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
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

                {/* Page Title */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title || 'Dashboard'}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{userData.role} Portal</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Enhanced Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-12 pr-12 py-4 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'} border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 w-64 text-sm font-medium placeholder-gray-400`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <kbd className={`px-2 py-1 text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} rounded-lg font-mono`}>⌘K</kbd>
                  </div>
                </div>

                {/* Notifications */}
                <button className="relative p-3 rounded-2xl bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 transition-all duration-300 hover:scale-110 group">
                  <Bell className="w-6 h-6 text-red-600 group-hover:animate-bounce" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse shadow-lg">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative p-3 rounded-2xl ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200'} transition-all duration-300 hover:scale-110 group`}
                >
                  <div className="relative">
                    {darkMode ? <Moon className="w-6 h-6 text-yellow-400" /> : <Sun className="w-6 h-6 text-orange-500" />}
                    <Sparkles className="absolute -top-2 -right-2 w-3 h-3 text-yellow-300 animate-pulse" />
                  </div>
                </button>

                {/* Profile Avatar */}
                <div className="relative group cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl hover:scale-110 transition-transform duration-300 shadow-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          <div className={`${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
            {children}
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

export default PremiumLayout;
