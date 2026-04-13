import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Settings, 
  Users, 
  Shield,
  BarChart3,
  FileText,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Send,
  TrendingUp,
  Activity,
  BookOpen,
  Calendar,
  DollarSign,
  GraduationCap,
  HelpCircle,
  Zap,
  Lightbulb
} from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import EnhancedAIAssistant from '@/components/ai/EnhancedAIAssistant';
import { AIContext } from '@/services/AIService';

const AdminAIAssistantPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  // AI context for admin module
  const aiContext: AIContext = {
    module: 'admin',
    userRole: 'admin',
    userId: user?.id,
    currentPath: '/admin/ai-assistant'
  };

  const adminQuickActions = [
    { icon: Users, label: 'Staff Management', color: 'bg-blue-500', description: 'Manage staff accounts and assignments' },
    { icon: GraduationCap, label: 'Student Overview', color: 'bg-green-500', description: 'View student statistics and performance' },
    { icon: BookOpen, label: 'Class Management', color: 'bg-purple-500', description: 'Create and manage academic classes' },
    { icon: Calendar, label: 'Timetable Setup', color: 'bg-indigo-500', description: 'Schedule classes and manage timetables' },
    { icon: FileText, label: 'Reports & Analytics', color: 'bg-orange-500', description: 'Generate reports and view analytics' },
    { icon: Settings, label: 'System Settings', color: 'bg-pink-500', description: 'Configure system preferences' }
  ];

  const adminStats = [
    {
      label: 'Total Staff',
      value: '24',
      change: '+2 this week',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Total Students',
      value: '1,247',
      change: '+15 this week',
      icon: GraduationCap,
      color: 'text-green-600'
    },
    {
      label: 'Active Classes',
      value: '42',
      change: '+3 this month',
      icon: BookOpen,
      color: 'text-purple-600'
    },
    {
      label: 'System Health',
      value: '98%',
      change: 'Optimal',
      icon: Activity,
      color: 'text-emerald-600'
    }
  ];


  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                AI Admin Assistant
              </h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your intelligent administrative companion
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {adminStats.map((stat, index) => (
            <Card key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
                    <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced AI Assistant */}
          <div className="lg:col-span-2">
            <EnhancedAIAssistant 
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced AI Assistant */}
            <div className="lg:col-span-2">
              <EnhancedAIAssistant 
                context={aiContext} 
                className="h-[600px]"
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {adminQuickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        // Navigate to relevant pages or trigger AI assistant with context
                        console.log(`Quick action: ${action.label}`);
                      }}
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
      </div>
    </AdminLayout>
  );
};

export default AdminAIAssistantPage;
