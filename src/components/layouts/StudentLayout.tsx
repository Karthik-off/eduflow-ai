import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import NotificationDropdown from '@/components/NotificationDropdown';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';
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
  Search,
  Sun,
  Moon,
  BellDot,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, title }) => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Determine greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: BookOpen, label: 'Academics', path: '/academics', active: location.pathname === '/academics' },
    { icon: Calendar, label: 'Attendance', path: '/attendance', active: location.pathname === '/attendance' },
    { icon: FileText, label: 'Exams', path: '/exams', active: location.pathname === '/exams' },
    { icon: DollarSign, label: 'Fees', path: '/fees', active: location.pathname === '/fees' },
    { icon: Bell, label: 'Alerts', path: '/alerts', active: location.pathname === '/alerts' },
    { icon: Bot, label: 'AI Assistant', path: '/ai-assistant', active: location.pathname === '/ai-assistant', badge: 'New' },
    { icon: User, label: 'Profile', path: '/profile', active: location.pathname === '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings', active: location.pathname === '/settings' }
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {greeting}, {studentProfile?.full_name?.split(' ')[0] || 'Karthik'} {title && `- ${title}`} 
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Back to Home Button - Desktop */}
              <BackToHomeButton variant="navbar" />
              
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              {/* Notification Dropdown */}
              <NotificationDropdown />
              
              {/* Theme Toggle */}
              <div 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </div>
              
              {/* Logout Button */}
              <div 
                onClick={() => setShowLogoutDialog(true)}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer transition-colors duration-200"
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

        {/* PAGE CONTENT */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Floating Back to Home Button for Mobile */}
        <BackToHomeButton variant="floating" />
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog 
        isOpen={showLogoutDialog} 
        onClose={() => setShowLogoutDialog(false)} 
      />
    </div>
  );
};

export default StudentLayout;
