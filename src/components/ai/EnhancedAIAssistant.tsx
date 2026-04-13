import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Send, 
  BookOpen, 
  Lightbulb, 
  GraduationCap,
  FileText,
  HelpCircle,
  Loader2,
  Settings,
  Zap,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { aiService, AIMessage, AIResponse, AIContext } from '@/services/AIService';

interface EnhancedAIAssistantProps {
  context?: AIContext;
  className?: string;
  height?: string;
  showActions?: boolean;
}

const EnhancedAIAssistant = ({ 
  context, 
  className = '', 
  height = '600px',
  showActions = true 
}: EnhancedAIAssistantProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      text: generateWelcomeMessage(context),
      sender: 'ai',
      timestamp: new Date(),
      type: 'general',
      module: context?.module
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (context) {
      aiService.setContext(context);
      updateSuggestions(context.module);
    }
  }, [context]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const updateSuggestions = (module?: string) => {
    const moduleSuggestions: Record<string, string[]> = {
      admin: [
        'How do I add a new staff member?',
        'Show me student enrollment trends',
        'Generate performance reports',
        'System health status'
      ],
      fees: [
        'Check my fee status',
        'Download payment receipts',
        'How to pay pending fees?',
        'Fee structure details'
      ],
      student: [
        'Update my profile',
        'Check my attendance',
        'View my academic performance',
        'Exam preparation help'
      ],
      attendance: [
        'My attendance percentage',
        'Apply for attendance regularization',
        'Attendance trends this month',
        'Subject-wise attendance'
      ],
      academics: [
        'Study materials for Data Structures',
        'Help with exam preparation',
        'Improve my CGPA',
        'Concept explanations'
      ]
    };

    const defaultSuggestions = [
      'Explain a concept',
      'Find study materials',
      'Exam preparation tips',
      'General help'
    ];

    setSuggestions(moduleSuggestions[module || ''] || defaultSuggestions);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'question',
      module: context?.module
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await aiService.generateResponse(inputText, context);
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.answer,
        sender: 'ai',
        timestamp: new Date(),
        type: aiResponse.type,
        module: context?.module
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Add follow-up questions if available
      if (aiResponse.followUp && aiResponse.followUp.length > 0) {
        setSuggestions(aiResponse.followUp);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'general',
        module: context?.module
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    handleSendMessage();
  };

  const handleActionClick = (action: { label: string; action: string; data?: any }) => {
    // Handle action based on type
    switch (action.action) {
      case 'navigate':
        if (action.data) {
          // This would integrate with your routing system
          console.log(`Navigate to: ${action.data}`);
          // window.location.href = action.data;
          // Or use your router: navigate(action.data);
        }
        break;
      case 'download-all-receipts':
        // Trigger download all receipts functionality
        console.log('Download all receipts');
        break;
      case 'email-receipts':
        // Trigger email receipts functionality
        console.log('Email receipts');
        break;
      default:
        console.log('Action:', action.action, action.data);
    }
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'concept': return <Lightbulb className="w-4 h-4" />;
      case 'material': return <BookOpen className="w-4 h-4" />;
      case 'exam': return <GraduationCap className="w-4 h-4" />;
      case 'question': return <HelpCircle className="w-4 h-4" />;
      case 'admin': return <Settings className="w-4 h-4" />;
      case 'fees': return <FileText className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getModuleColor = (module?: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-blue-500',
      fees: 'bg-green-500',
      student: 'bg-purple-500',
      attendance: 'bg-orange-500',
      academics: 'bg-pink-500'
    };
    return colors[module || ''] || 'bg-gray-500';
  };

  return (
    <Card className={`flex flex-col shadow-lg ${className}`} style={{ height }}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`w-5 h-5 rounded-full ${getModuleColor(context?.module)} flex items-center justify-center`}>
            <Bot className="w-3 h-3 text-white" />
          </div>
          {context?.module === 'admin' && 'Admin AI Assistant'}
          {context?.module === 'fees' && 'Fee AI Assistant'}
          {context?.module === 'student' && 'Student AI Assistant'}
          {context?.module === 'attendance' && 'Attendance AI Assistant'}
          {context?.module === 'academics' && 'Academic AI Assistant'}
          {!context?.module && 'EduFlow AI Assistant'}
          {context?.module && (
            <Badge variant="outline" className="ml-auto text-xs">
              {context.module.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[450px] px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {getMessageIcon(message.type)}
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-line text-sm">{message.text}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  {/* Extract and display actions from AI response */}
                  {message.sender === 'ai' && message.text.includes('**Quick Actions Available:**') && (
                    <div className="mt-3 space-y-2">
                      {message.text.split('\n').filter(line => line.includes('•')).map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start h-auto py-2 text-xs"
                          onClick={() => {
                            const cleanAction = action.replace('•', '').trim();
                            setInputText(cleanAction);
                            handleSendMessage();
                          }}
                        >
                          <ArrowRight className="w-3 h-3 mr-2" />
                          {action.replace('•', '').trim()}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="text-sm">Thinking...</div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="p-4 border-t">
        {showActions && suggestions.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium">Quick Actions</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-muted-foreground/20 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              context?.module === 'admin' ? 'Ask me about administrative tasks...' :
              context?.module === 'fees' ? 'Ask me about fees and payments...' :
              context?.module === 'student' ? 'Ask me about student services...' :
              context?.module === 'attendance' ? 'Ask me about attendance...' :
              context?.module === 'academics' ? 'Ask me about academics...' :
              'Ask me anything...'
            }
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

function generateWelcomeMessage(context?: AIContext): string {
  if (!context?.module) {
    return "Hello! I'm EduFlow AI, your intelligent academic assistant. I can help you with:\n\n• Answer subject-related questions\n• Find study materials and resources\n• Explain concepts in simple steps\n• Suggest learning topics\n• Help with exam preparation\n• Administrative support\n• Fee management\n• Attendance tracking\n\nHow can I assist you today?";
  }

  const welcomeMessages: Record<string, string> = {
    admin: "Hello! I'm your AI Admin Assistant. I can help you with:\n\n• Staff management and assignments\n• Student oversight and analytics\n• Report generation and data analysis\n• System configuration and settings\n• Class and timetable management\n• Financial oversight\n\nWhat administrative task can I help you with today?",
    fees: "Hello! I'm your Fee AI Assistant. I can help you with:\n\n• Check your current fee status\n• Make online payments\n• Download payment receipts\n• View payment history\n• Understand fee breakdowns\n• Payment reminders and due dates\n\nWhat fee-related information do you need?",
    student: "Hello! I'm your Student AI Assistant. I can help you with:\n\n• Profile management\n• Academic performance tracking\n• Attendance records\n• Fee payments and receipts\n• Course information\n• Campus services\n\nWhat would you like help with today?",
    attendance: "Hello! I'm your Attendance AI Assistant. I can help you with:\n\n• View detailed attendance records\n• Track attendance trends\n• Apply for attendance regularization\n• Subject-wise attendance analysis\n• Attendance improvement tips\n\nWhat attendance information would you like to explore?",
    academics: "Hello! I'm your Academic AI Assistant. I can help you with:\n\n• Study material recommendations\n• Concept explanations\n• Practice problems and solutions\n• Exam preparation guides\n• Performance analysis\n• Learning path recommendations\n\nWhat academic area would you like help with?"
  };

  return welcomeMessages[context.module] || "Hello! How can I assist you today?";
}

export default EnhancedAIAssistant;
