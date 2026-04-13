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
  FileText, 
  CreditCard,
  Download,
  HelpCircle,
  Loader2,
  Zap,
  ArrowRight,
  IndianRupee
} from 'lucide-react';
import { aiService, AIMessage, AIContext } from '@/services/AIService';

interface FeesAIAssistantProps {
  className?: string;
  height?: string;
  studentData?: any;
  feeData?: any;
}

const FeesAIAssistant = ({ 
  className = '', 
  height = '400px',
  studentData,
  feeData
}: FeesAIAssistantProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      text: generateFeesWelcomeMessage(studentData, feeData),
      sender: 'ai',
      timestamp: new Date(),
      type: 'fees',
      module: 'fees'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const aiContext: AIContext = {
    module: 'fees',
    userRole: 'student',
    currentPath: '/student/fees',
    studentData: studentData,
    systemData: feeData
  };

  useEffect(() => {
    aiService.setContext(aiContext);
  }, [studentData, feeData]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'question',
      module: 'fees'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await aiService.generateResponse(inputText, aiContext);
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.answer,
        sender: 'ai',
        timestamp: new Date(),
        type: aiResponse.type,
        module: 'fees'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'fees',
        module: 'fees'
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

  const handleQuickAction = (action: string) => {
    setInputText(action);
    handleSendMessage();
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'fees': return <FileText className="w-4 h-4" />;
      case 'question': return <HelpCircle className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const quickActions = [
    'Check my fee status',
    'How to pay pending fees?',
    'Download payment receipts',
    'Fee structure details',
    'Payment due dates',
    'Refund policy'
  ];

  return (
    <Card className={`flex flex-col shadow-lg ${className}`} style={{ height }}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          Fee AI Assistant
          <Badge variant="outline" className="ml-auto text-xs">
            FEES
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[250px] px-4" ref={scrollAreaRef}>
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
                  
                  {/* Extract and display fee-specific actions */}
                  {message.sender === 'ai' && message.text.includes('**Quick Actions:**') && (
                    <div className="mt-3 space-y-2">
                      {message.text.split('\n').filter(line => line.includes('•')).map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start h-auto py-2 text-xs"
                          onClick={() => {
                            const actionText = action.replace('•', '').trim();
                            setInputText(actionText);
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
                  <div className="text-sm">Processing your request...</div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="p-4 border-t">
        {/* Quick Actions */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium">Quick Fee Actions</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-muted-foreground/20 transition-colors"
                onClick={() => handleQuickAction(action)}
              >
                {action}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about fees, payments, or receipts..."
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

function generateFeesWelcomeMessage(studentData?: any, feeData?: any): string {
  const totalFees = feeData?.totalFees || 50000;
  const paidFees = feeData?.paidFees || 17000;
  const pendingFees = feeData?.pendingFees || 30000;
  const overdueFees = feeData?.overdueFees || 3000;
  const studentName = studentData?.full_name || 'Student';

  return `Hello ${studentName}! I'm your Fee AI Assistant. I can help you with all fee-related matters.

**Your Current Fee Status:**
• Total Fees: ₹${totalFees.toLocaleString()}
• Paid Amount: ₹${paidFees.toLocaleString()}
• Pending Amount: ₹${pendingFees.toLocaleString()}
• Overdue Amount: ₹${overdueFees.toLocaleString()}

**Quick Actions:**
• Check detailed fee status
• Make online payments
• Download payment receipts
• View payment history
• Understand fee structure
• Check due dates

**Available Services:**
• Secure online payments
• Instant receipt generation
• Payment reminders
• Fee breakdown explanations
• Refund policy information

What fee-related information would you like help with today?`;
}

export default FeesAIAssistant;
