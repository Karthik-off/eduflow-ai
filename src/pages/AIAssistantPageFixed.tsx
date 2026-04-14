import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot,
  BookOpen,
  Brain,
  Route,
  Award,
  Sparkles,
  BarChart3,
  Target,
  Zap,
  Lightbulb,
  FileText
} from 'lucide-react';
import EnhancedAIAssistant from '@/components/ai/EnhancedAIAssistant';
import { AIContext } from '@/services/AIService';

const AIAssistantPageFixed = () => {
  const { user, studentProfile } = useAuthStore();
  const navigate = useNavigate();

  // AI context for student module
  const aiContext: AIContext = {
    module: 'student',
    userRole: 'student',
    userId: user?.id,
    currentPath: '/ai-assistant',
    studentData: studentProfile
      ? {
          name: studentProfile.full_name,
          rollNo: studentProfile.roll_number,
          department: studentProfile.department_id || '',
          year: '',
          section: studentProfile.section_id || ''
        }
      : undefined
  };

  const quickActions = [
    { icon: <BookOpen className="w-5 h-5 text-white" />, label: 'Study Materials', path: '/academics', color: 'from-blue-500 to-blue-600' },
    { icon: <Target className="w-5 h-5 text-white" />, label: 'Practice Tests', path: '/exams', color: 'from-green-500 to-green-600' },
    { icon: <FileText className="w-5 h-5 text-white" />, label: 'Assignments', path: '/academics', color: 'from-purple-500 to-purple-600' },
    { icon: <Zap className="w-5 h-5 text-white" />, label: 'Quick Help', path: '#', color: 'from-orange-500 to-orange-600' }
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-white" />,
      title: 'Concept Explanation',
      description: 'Get detailed explanations for complex topics',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Route className="w-6 h-6 text-white" />,
      title: 'Learning Path',
      description: 'Personalized study recommendations',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      title: 'Performance Analysis',
      description: 'Track your learning progress',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Award className="w-6 h-6 text-white" />,
      title: 'Exam Preparation',
      description: 'Practice questions and mock tests',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <StudentLayoutWithSearch title="AI Assistant">
      <div className="space-y-6">

        {/* AI Features Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">AI Study Assistant</div>
                <div className="text-white/80 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Powered by EduFlow AI — Your personal learning companion
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Enhanced AI Chat — spans 2 cols */}
          <div className="lg:col-span-2">
            <EnhancedAIAssistant
              context={aiContext}
              height="620px"
              className="shadow-xl border-t-4 border-t-purple-500 rounded-xl overflow-hidden"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => action.path !== '#' && navigate(action.path)}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center`}>
                        {action.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
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
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{feature.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Tips */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Tips to get better answers
                </div>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 list-disc list-inside">
                  <li>Ask specific subject or topic questions</li>
                  <li>Use the quick action chips below the chat</li>
                  <li>Mention your exam or assignment context</li>
                  <li>Ask for step-by-step explanations</li>
                </ul>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </StudentLayoutWithSearch>
  );
};

export default AIAssistantPageFixed;
