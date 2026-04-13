import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/premium-ui/Button';
import { Input } from '@/components/premium-ui/Input';
import NotificationDropdown from '@/components/NotificationDropdown';
import BackToHomeButton from '@/components/BackToHomeButton';
import { 
  Home,
  BookOpen,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  User,
  Award,
  Target,
  TrendingUp,
  Camera,
  Upload,
  Filter,
  MoreHorizontal,
  Bot,
  Sun,
  Moon
} from 'lucide-react';
import '@/styles/eduflow-enhanced.css';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  userRole: 'student' | 'staff' | 'admin';
  title?: string;
}

const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ children, userRole, title = "Dashboard" }) => {
  const { user, studentProfile, staffProfile, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(5);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Set initial dark mode
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const getUserDisplayName = () => {
    if (userRole === 'student' && studentProfile) {
      return studentProfile.full_name || "Student";
    } else if (userRole === 'staff' && staffProfile) {
      return staffProfile.full_name || "Staff";
    } else if (userRole === 'admin') {
      return "Administrator";
    }
    return "User";
  };

  const getUserData = () => {
    if (userRole === 'student' && studentProfile) {
      return {
        name: studentProfile.full_name || "Student",
        rollNumber: studentProfile.roll_number || "STU001",
        email: studentProfile.email || "student@eduflow.com",
        cgpa: studentProfile.cgpa || 0,
        attendance: studentProfile.attendance_percentage || 0
      };
    } else if (userRole === 'staff' && staffProfile) {
      return {
        name: staffProfile.full_name || "Staff",
        staffCode: staffProfile.staff_code || "STF001",
        email: staffProfile.email || "staff@eduflow.com",
        department: staffProfile.department_id || "General"
      };
    }
    return {
      name: "User",
      email: user?.email || "user@eduflow.com"
    };
  };

  const getNavigationItems = () => {
    if (userRole === 'student') {
      return [
        { id: 'dashboard', title: 'Dashboard', icon: Home, path: '/dashboard', badge: null },
        { id: 'academics', title: 'Academics', icon: BookOpen, path: '/academics', badge: null },
        { id: 'attendance', title: 'Attendance', icon: Calendar, path: '/attendance', badge: null },
        { id: 'exams', title: 'Exams', icon: FileText, path: '/exams', badge: null },
        { id: 'fees', title: 'Fees', icon: DollarSign, path: '/fees', badge: null },
        { id: 'alerts', title: 'Alerts', icon: Bell, path: '/alerts', badge: notifications > 0 ? notifications : null },
        { id: 'ai-assistant', title: 'AI Assistant', icon: Bot, path: '/ai-assistant', badge: null },
        { id: 'profile', title: 'Profile', icon: User, path: '/profile', badge: null }
      ];
    } else if (userRole === 'staff') {
      return [
        { id: 'dashboard', title: 'Dashboard', icon: Home, path: '/staff/dashboard', badge: null },
        { id: 'attendance', title: 'Attendance', icon: Calendar, path: '/staff/attendance', badge: null },
        { id: 'students', title: 'Students', icon: Users, path: '/staff/students', badge: null },
        { id: 'marks', title: 'Marks Entry', icon: FileText, path: '/staff/marks', badge: null },
        { id: 'timetable', title: 'Timetable', icon: Calendar, path: '/staff/timetable', badge: null }
      ];
    } else if (userRole === 'admin') {
      return [
        { id: 'dashboard', title: 'Dashboard', icon: Home, path: '/admin/dashboard', badge: null },
        { id: 'users', title: 'Users', icon: Users, path: '/admin/users', badge: null },
        { id: 'students', title: 'Students', icon: Users, path: '/admin/students', badge: null },
        { id: 'staff', title: 'Staff', icon: Users, path: '/admin/staff', badge: null },
        { id: 'classes', title: 'Classes', icon: BookOpen, path: '/admin/classes', badge: null }
      ];
    }
    return [];
  };

  // Show loading state if user data is not ready
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  const navigationItems = getNavigationItems();
  const userData = getUserData();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : 'light'}`}>
      {/* Enhanced Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 ${darkMode ? 'bg-gradient-to-b from-gray-900 via-purple-900/90 to-gray-900' : 'bg-gradient-to-b from-purple-700 via-blue-600 to-indigo-700'} shadow-2xl transform transition-all duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} backdrop-blur-xl border-r ${darkMode ? 'border-gray-800' : 'border-white/20'}`}>
        {/* Logo Section */}
        <div className="p-6 border-b ${darkMode ? 'border-gray-800' : 'border-white/20'}">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EduFlow</h1>
              <p className="text-xs text-purple-200 capitalize">{userRole} Portal</p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? darkMode 
                      ? 'bg-purple-800 text-white shadow-lg'
                      : 'bg-purple-600 text-white shadow-lg'
                    : darkMode
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-white/10 text-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`flex-1 text-sm font-medium ${isActive ? 'text-white' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.title}
                </span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t ${darkMode ? 'border-gray-800' : 'border-white/20'}">
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userData.name}</p>
                <p className="text-xs text-purple-200 truncate">
                  {userRole === 'student' && `Roll: ${userData.rollNumber}`}
                  {userRole === 'staff' && `ID: ${userData.staffCode}`}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Active</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 mx-auto rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {userRole === 'student' && `${userData.attendance}%`}
                  {userRole === 'staff' && 'Online'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                <span className="text-sm text-gray-400">Settings</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'} transition-all duration-500`}>
        {/* Top Navbar */}
        <header className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-xl border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-3">
                {/* Back to Home Button */}
                <BackToHomeButton variant="navbar" />
                
                {/* Notifications */}
                <NotificationDropdown />

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>

                {/* User Profile */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userData.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{userData.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{userData.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          to={`/${userRole}/profile`}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Back to Home Button for Mobile */}
      <BackToHomeButton variant="floating" />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default UnifiedLayout;
