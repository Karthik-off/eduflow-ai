import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  BookOpen, 
  Brain, 
  Route, 
  Award,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  Settings,
  HelpCircle,
  FileText,
  Target,
  Zap,
  Lightbulb
} from 'lucide-react';

const AIAssistantPageFixed = () => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: 'assistant',
      message: 'Hello! I\'m your AI study assistant. How can I help you today?',
      time: '10:30 AM'
    }
  ]);

  const aiStats = [
    {
      label: 'Questions Answered',
      value: '127',
      icon: <Bot className="w-4 h-4" />,
      trend: '+12%',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Study Sessions',
      value: '24',
      icon: <BookOpen className="w-4 h-4" />,
      trend: '+8%',
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Concepts Learned',
      value: '18',
      icon: <Brain className="w-4 h-4" />,
      trend: '+15%',
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Practice Score',
      value: '85%',
      icon: <Award className="w-4 h-4" />,
      trend: '+5%',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const quickActions = [
    { icon: <BookOpen className="w-5 h-5" />, label: 'Study Materials', path: '/academics' },
    { icon: <Target className="w-5 h-5" />, label: 'Practice Tests', path: '/exams' },
    { icon: <FileText className="w-5 h-5" />, label: 'Assignments', path: '/academics' },
    { icon: <Zap className="w-5 h-5" />, label: 'Quick Help', path: '#' }
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Concept Explanation',
      description: 'Get detailed explanations for complex topics',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Route className="w-6 h-6" />,
      title: 'Learning Path',
      description: 'Personalized study recommendations',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Performance Analysis',
      description: 'Track your learning progress',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Exam Preparation',
      description: 'Practice questions and mock tests',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: chatHistory.length + 1,
        type: 'user',
        message: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatHistory([...chatHistory, newMessage]);
      setMessage('');
      setIsTyping(true);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: chatHistory.length + 2,
          type: 'assistant',
          message: 'I understand your question. Let me help you with that...',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  return (
    <StudentLayoutWithSearch title="AI Assistant">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiStats.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">{stat.trend}</div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* AI Features Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">AI Study Assistant</div>
                <div className="text-white/80">Your personal learning companion</div>
              </div>
            </div>
            <Button 
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50"
            >
              <Settings className="w-5 h-5 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>AI Chat Assistant</span>
                  <Badge variant="secondary" className="ml-auto">Online</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    {chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                            chat.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-500'
                          }`}
                        >
                          <p className="text-sm">{chat.message}</p>
                          <p className={`text-xs mt-1 ${chat.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                            {chat.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-600 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-500 px-4 py-2 rounded-xl">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder="Ask me anything..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="px-4 py-2 rounded-xl"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => action.path !== '#' && navigate(action.path)}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        {action.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">AI Features</CardTitle>
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
          </div>
        </div>

        {/* Help Section */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Need Help?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Lightbulb className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Study Tips</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized study advice</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Quick Answers</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instant help with questions</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Goal Setting</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Set and track learning goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayoutWithSearch>
  );
};

export default AIAssistantPageFixed;
