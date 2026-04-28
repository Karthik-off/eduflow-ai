import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';
import BackToHomeButton from '@/components/BackToHomeButton';
import SearchBar from '@/components/SearchBar';
import NotificationDropdown from '@/components/NotificationDropdown';
import LiveDateTime from '@/components/common/LiveDateTime';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { Briefcase, LogOut, Home, Users, GraduationCap, ClipboardList, Calendar, Clock, FileText, Settings, Sun, Moon, Bot } from 'lucide-react';
import FloatingAIWidget from '@/components/ai/FloatingAIWidget';

interface StaffLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children, title }) => {
  const { staffProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
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
    { icon: Home, label: 'Dashboard', active: location.pathname === '/staff/dashboard', path: '/staff/dashboard' },
    { icon: Users, label: 'Attendance', active: location.pathname.includes('/staff/attendance'), path: '/staff/attendance' },
    { icon: GraduationCap, label: 'Students', active: location.pathname.includes('/staff/students'), path: '/staff/students' },
    { icon: ClipboardList, label: 'Marks Entry', active: location.pathname.includes('/staff/marks'), path: '/staff/marks' },
    { icon: Calendar, label: 'Calendar', active: location.pathname.includes('/staff/calendar'), path: '/staff/calendar' },
    { icon: Clock, label: 'Timetable', active: location.pathname.includes('/staff/timetable'), path: '/staff/timetable' },
    { icon: FileText, label: 'Reports', active: location.pathname.includes('/staff/reports'), path: '/staff/reports' },
    { icon: Bot, label: 'AI Assistant', active: location.pathname.includes('/staff/ai-assistant'), path: '/staff/ai-assistant' },
    { icon: Settings, label: 'Settings', active: location.pathname.includes('/staff/settings'), path: '/staff/settings' },
  ];

  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await signOut();
    navigate('/staff/login');
  };

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
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Profile Card */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">{staffProfile?.full_name || 'Staff'}</div>
                <div className="text-white/70 text-sm">{staffProfile?.staff_code || 'Staff Code'}</div>
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
              <div>
                <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {greeting}, {staffProfile?.full_name?.split(' ')[0] || 'Staff'} 👋
                </h1>
                {title && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="hidden md:block">
                <SearchBar placeholder="Search staff functions..." />
              </div>
              
              {/* Notification Dropdown */}
              <NotificationDropdown />
              
              {/* Live Date Time */}
              <LiveDateTime variant="compact" showDate={true} showTime={true} />
              
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
                onClick={() => navigate('/staff/profile')}
                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
              >
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog 
        isOpen={showLogoutDialog} 
        onClose={() => setShowLogoutDialog(false)} 
      />
      
      {/* Floating AI Widget */}
      <FloatingAIWidget />
    </div>
  );
};

export default StaffLayout;
