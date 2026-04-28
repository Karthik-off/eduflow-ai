import React from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '@/components/layouts/StaffLayout';
import EnhancedAIAssistant from '@/components/ai/EnhancedAIAssistant';
import { useAuthStore } from '@/stores/authStore';
import { Bot, Sparkles, Calendar, ClipboardList, GraduationCap, Zap, Brain, Lightbulb, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDarkMode } from '@/contexts/DarkModeContext';

const StaffAIAssistantPage = () => {
  const { staffProfile } = useAuthStore();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const quickActions = [
    { icon: Users, label: 'Mark Attendance', path: '/staff/attendance', color: 'bg-blue-500' },
    { icon: ClipboardList, label: 'Enter Marks', path: '/staff/marks', color: 'bg-green-500' },
    { icon: Calendar, label: 'View Schedule', path: '/staff/timetable', color: 'bg-purple-500' },
    { icon: GraduationCap, label: 'Students', path: '/staff/students', color: 'bg-indigo-500' }
  ];

  const features = [
    {
      icon: <Calendar className="w-6 h-6 text-white" />,
      title: 'Schedule Planning',
      description: 'Help organizing your timetable',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <ClipboardList className="w-6 h-6 text-white" />,
      title: 'Grade Analysis',
      description: 'Analyze student performance',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Brain className="w-6 h-6 text-white" />,
      title: 'Teaching Resources',
      description: 'Lesson plans and methodologies',
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <StaffLayout title="AI Assistant">
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Staff AI Assistant</h1>
              <p className="text-white/80 text-sm flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Your intelligent companion for managing students, grading, and scheduling.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EnhancedAIAssistant 
              context={{
                module: 'staff',
                userRole: 'staff',
                systemData: staffProfile
              }}
              height="620px"
              className="shadow-xl border-t-4 border-t-indigo-500 rounded-xl overflow-hidden"
            />
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Zap className="w-5 h-5 text-indigo-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{feature.title}</h4>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Tips */}
            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <CardContent className="p-4 space-y-3">
                <div className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Tips to get better answers
                </div>
                <ul className={`text-xs space-y-1.5 list-disc list-inside ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <li>Ask to create lesson plans for specific subjects</li>
                  <li>Use the quick action chips below the chat</li>
                  <li>Ask for student performance improvements</li>
                  <li>Request time-saving tips for grading</li>
                </ul>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffAIAssistantPage;
