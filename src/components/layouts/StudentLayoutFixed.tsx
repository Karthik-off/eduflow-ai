import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
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
  AlertCircle
} from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const StudentLayoutFixed: React.FC<StudentLayoutProps> = ({ children, title }) => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Navigate to search results or implement search logic
      // For now, just log the search
    }
  };

  // Handle profile click
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Handle notifications click
  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
  };

  // Determine greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: BookOpen, label: 'Academics', path: '/academics' },
    { icon: Calendar, label: 'Attendance', path: '/attendance' },
    { icon: FileText, label: 'Exams', path: '/exams' },
    { icon: DollarSign, label: 'Fees', path: '/fees' },
    { icon: Bell, label: 'Alerts', path: '/alerts' },
    { icon: Bot, label: 'AI Assistant', path: '/ai-assistant', badge: 'New' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const handleMenuClick = (path: string) => {
    console.log('Navigating to:', path);
    navigate(path);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* LEFT SIDEBAR */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 rounded-r-3xl shadow-2xl z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Menu Items */}
        <div className="p-6">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleMenuClick(item.path)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  location.pathname === item.path
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
                <div className="text-white font-semibold">{studentProfile?.full_name || 'Karthik'}</div>
                <div className="text-white/70 text-sm">Student</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:ml-64">
        {/* TOP NAVBAR */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-600 dark:bg-gray-300"></div>
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                {greeting}, {studentProfile?.full_name?.split(' ')[0] || 'Karthik'} {title && `- ${title}`} 
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </form>
              
              {/* Notification Bell */}
              <div 
                onClick={handleNotificationsClick}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              
              {/* Theme Toggle */}
              <div 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </div>
              
              {/* Profile Avatar */}
              <div 
                onClick={handleProfileClick}
                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
              >
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-6 top-16 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Assignment due tomorrow</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mathematics assignment due at 11:59 PM</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Fee payment received</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your library fee payment has been confirmed</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
              <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Exam schedule updated</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Physics exam rescheduled to next week</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => navigate('/alerts')}
                className="w-full text-center text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View all notifications
              </button>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StudentLayoutFixed;
