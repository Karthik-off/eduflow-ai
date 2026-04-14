import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bot, Users, Shield, BarChart3, FileText, Settings, Activity,
  BookOpen, Calendar, GraduationCap, Sparkles, Zap
} from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import EnhancedAIAssistant from '@/components/ai/EnhancedAIAssistant';
import { AIContext } from '@/services/AIService';

const AdminAIAssistantPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const aiContext: AIContext = {
    module: 'admin',
    userRole: 'admin',
    userId: user?.id,
    currentPath: '/admin/ai-assistant'
  };

  const adminQuickActions = [
    { icon: Users, label: 'Staff Management', color: 'bg-blue-500', description: 'Manage staff accounts and assignments', path: '/admin/staff' },
    { icon: GraduationCap, label: 'Student Overview', color: 'bg-green-500', description: 'View student statistics and performance', path: '/admin/students' },
    { icon: BookOpen, label: 'Class Management', color: 'bg-purple-500', description: 'Create and manage academic classes', path: '/admin/classes' },
    { icon: Calendar, label: 'Timetable Setup', color: 'bg-indigo-500', description: 'Schedule classes and manage timetables', path: '/admin/timetable' },
    { icon: FileText, label: 'Reports & Analytics', color: 'bg-orange-500', description: 'Generate reports and view analytics', path: '/admin/reports' },
    { icon: Settings, label: 'System Settings', color: 'bg-pink-500', description: 'Configure system preferences', path: '/admin/settings' }
  ];

  const adminStats = [
    { label: 'Total Staff', value: '24', change: '+2 this week', icon: Users, color: 'text-blue-600' },
    { label: 'Total Students', value: '1,247', change: '+15 this week', icon: GraduationCap, color: 'text-green-600' },
    { label: 'Active Classes', value: '42', change: '+3 this month', icon: BookOpen, color: 'text-purple-600' },
    { label: 'System Health', value: '98%', change: 'Optimal', icon: Activity, color: 'text-emerald-600' }
  ];

  return (
    <AdminLayout title="AI Assistant">
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">AI Admin Assistant</h1>
              <p className="text-white/80 text-sm flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Your intelligent administrative companion — Powered by EduFlow AI
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat, index) => (
            <Card key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
                    <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-25`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EnhancedAIAssistant
              context={aiContext}
              height="620px"
              className="shadow-xl border-t-4 border-t-blue-500 rounded-xl overflow-hidden"
            />
          </div>

          <div className="space-y-6">
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Zap className="w-5 h-5 text-blue-500" />
                  Quick Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminQuickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`w-full text-left p-3 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{action.label}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAIAssistantPage;
