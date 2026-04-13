import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
import SearchBar from '@/components/SearchBar';
import NotificationDropdown from '@/components/NotificationDropdown';
import BackToHomeButton from '@/components/BackToHomeButton';
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
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const StudentLayoutWithSearch: React.FC<StudentLayoutProps> = ({ children, title }) => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');

  // Determine greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const menuItems = [
    { icon: Home, label: 'Home', active: location.pathname === '/dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Academics', active: location.pathname === '/academics', path: '/academics' },
    { icon: Calendar, label: 'Attendance', active: location.pathname === '/attendance', path: '/attendance' },
    { icon: FileText, label: 'Exams', active: location.pathname === '/exams', path: '/exams' },
    { icon: DollarSign, label: 'Fees', active: location.pathname === '/fees', path: '/fees' },
    { icon: Bell, label: 'Alerts', active: location.pathname === '/alerts', path: '/alerts' },
    { icon: Bot, label: 'AI Assistant', active: location.pathname === '/ai-assistant', badge: 'New', path: '/ai-assistant' },
    { icon: User, label: 'Profile', active: location.pathname === '/profile', path: '/profile' },
    { icon: Settings, label: 'Settings', active: location.pathname === '/settings', path: '/settings' }
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
                {title || greeting}, {studentProfile?.full_name?.split(' ')[0] || 'Karthik'} 👋
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Back to Home Button - Desktop */}
              <BackToHomeButton variant="navbar" />
              
              {/* Search Bar */}
              <div className="hidden md:block">
                <SearchBar placeholder="Search pages..." />
              </div>
              
              {/* Notification Dropdown */}
              <NotificationDropdown />
              
              {/* Theme Toggle */}
              <div 
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
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

        {/* MAIN CONTENT */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Floating Back to Home Button for Mobile */}
        <BackToHomeButton variant="floating" />
      </div>
    </div>
  );
};

export default StudentLayoutWithSearch;
