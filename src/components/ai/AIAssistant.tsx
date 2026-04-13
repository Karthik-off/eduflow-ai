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
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'question' | 'material' | 'concept' | 'exam' | 'general';
}

interface AIResponse {
  answer: string;
  type: 'question' | 'material' | 'concept' | 'exam' | 'general';
  followUp?: string[];
  resources?: Array<{
    title: string;
    type: 'video' | 'article' | 'book' | 'practice';
    url?: string;
  }>;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm EduFlow AI, your academic assistant. I can help you with:\n\n• Answer subject-related questions\n• Find study materials and resources\n• Explain concepts in simple steps\n• Suggest learning topics\n• Help with exam preparation\n\nHow can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'general'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateAIResponse = async (query: string): Promise<AIResponse> => {
    const lowerQuery = query.toLowerCase();
    
    // Pattern matching for different types of queries
    if (lowerQuery.includes('what is') || lowerQuery.includes('explain') || lowerQuery.includes('define')) {
      return {
        answer: generateConceptExplanation(query),
        type: 'concept',
        followUp: ['Would you like an example?', 'Can I explain related concepts?', 'Need practice problems?'],
        resources: [
          { title: 'Related Video Tutorial', type: 'video' },
          { title: 'Practice Problems', type: 'practice' },
          { title: 'Reference Article', type: 'article' }
        ]
      };
    }
    
    if (lowerQuery.includes('study material') || lowerQuery.includes('resources') || lowerQuery.includes('where can i')) {
      return {
        answer: generateStudyMaterials(query),
        type: 'material',
        resources: [
          { title: 'Textbook Chapter 3', type: 'book' },
          { title: 'Online Course Module', type: 'video' },
          { title: 'Practice Exercises', type: 'practice' }
        ]
      };
    }
    
    if (lowerQuery.includes('exam') || lowerQuery.includes('test') || lowerQuery.includes('prepare')) {
      return {
        answer: generateExamPrep(query),
        type: 'exam',
        followUp: ['Need more practice questions?', 'Want study schedule?', 'Exam tips?']
      };
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('how to') || lowerQuery.includes('question')) {
      return {
        answer: generateGeneralHelp(query),
        type: 'question',
        followUp: ['Was this helpful?', 'Need more details?', 'Related topic?']
      };
    }
    
    // Default response
    return {
      answer: generateGeneralResponse(query),
      type: 'general',
      followUp: ['Can I be more specific?', 'Need examples?', 'Related topics?']
    };
  };

  const generateConceptExplanation = (query: string): string => {
    const concepts: Record<string, string> = {
      'algorithm': 'An algorithm is a step-by-step procedure for solving a problem or accomplishing a task. Think of it like a recipe - it tells you exactly what steps to follow to get the desired result.\n\nKey characteristics:\n• Clear and unambiguous steps\n• Has defined input and output\n• Finite (terminates)\n• Effective (each step is doable)',
      
      'data structure': 'A data structure is a way of organizing and storing data so it can be accessed and used efficiently. It\'s like organizing your books on a shelf - some arrangements make it easier to find what you need.\n\nCommon types:\n• Arrays: Ordered collection of items\n• Linked Lists: Chain of connected elements\n• Trees: Hierarchical structure\n• Graphs: Network of connected nodes',
      
      'recursion': 'Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem. Think of Russian nesting dolls - each doll contains a smaller version of itself.\n\nKey elements:\n• Base case: When to stop\n• Recursive case: How to make the problem smaller\n• Progress toward base case'
    };

    const lowerQuery = query.toLowerCase();
    for (const [concept, explanation] of Object.entries(concepts)) {
      if (lowerQuery.includes(concept)) {
        return explanation;
      }
    }

    return `I'd be happy to explain that concept! Based on your question about "${query}", here's a structured explanation:\n\n**Main Idea**: This is a fundamental concept that builds on basic principles.\n\n**Key Points**:\n• First important aspect\n• Second crucial element\n• Third consideration\n\n**Simple Example**: [Practical example would go here]\n\n**Why It Matters**: This concept is important because it helps solve real-world problems and forms the foundation for more advanced topics.\n\nWould you like me to elaborate on any specific part?`;
  };

  const generateStudyMaterials = (query: string): string => {
    return `I found some excellent study materials for you!\n\n**Recommended Resources**:\n\n📚 **Primary Materials**:\n• Textbook chapters relevant to your topic\n• Lecture notes and slides from class\n• Previous exam papers for practice\n\n🎥 **Visual Learning**:\n• Video tutorials explaining key concepts\n• Interactive simulations and demos\n• Recorded lectures from professors\n\n📝 **Practice Resources**:\n• Problem sets with solutions\n• Online quizzes and tests\n• Study group discussion forums\n\n**Study Tips**:\n• Start with basic concepts before advanced topics\n• Practice problems regularly\n• Form study groups for better understanding\n\nWould you like me to suggest specific materials for a particular subject?`;
  };

  const generateExamPrep = (query: string): string => {
    return `Here's your comprehensive exam preparation strategy:\n\n**📖 Study Plan**:\n• Review all lecture notes (2-3 days)\n• Practice previous exam papers (2 days)\n• Focus on weak areas (1 day)\n• Final revision (1 day)\n\n**🎯 Key Focus Areas**:\n• Important definitions and formulas\n• Problem-solving techniques\n• Common question patterns\n• Time management during exam\n\n**📝 Practice Strategy**:\n• Solve 3-5 problems daily\n• Time yourself while practicing\n• Review mistakes and learn from them\n• Take mock tests under exam conditions\n\n**💡 Exam Day Tips**:\n• Get good sleep the night before\n• Arrive early and stay calm\n• Read all questions carefully\n• Manage time wisely\n\nNeed specific help with any subject or topic?`;
  };

  const generateGeneralHelp = (query: string): string => {
    return `I'm here to help you succeed! Here's how I can assist:\n\n**🎓 Academic Support**:\n• Explain difficult concepts in simple terms\n• Provide step-by-step problem solutions\n• Suggest study strategies and techniques\n\n**📚 Learning Resources**:\n• Find relevant study materials\n• Recommend online courses and videos\n• Suggest practice problems and exercises\n\n**📅 Planning & Organization**:\n• Help create study schedules\n• Suggest learning paths for subjects\n• Provide exam preparation guidance\n\n**💡 Study Tips**:\n• Effective note-taking methods\n• Memory improvement techniques\n• Time management strategies\n\nWhat specific area would you like help with? I can provide detailed guidance tailored to your needs.`;
  };

  const generateGeneralResponse = (query: string): string => {
    return `That's a great question! Let me help you understand this better.\n\n**Understanding Your Query**: Based on "${query}", I can see you're looking for academic assistance.\n\n**My Recommendation**:\n• Break down the topic into smaller parts\n• Start with fundamental concepts\n• Practice with relevant examples\n• Connect with real-world applications\n\n**Next Steps**:\n1. Review the basic principles first\n2. Try some practice problems\n3. Ask follow-up questions if needed\n4. Explore related topics for deeper understanding\n\nWould you like me to explain any specific aspect in more detail? I'm here to make your learning journey easier!`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'question'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(inputText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.answer,
        sender: 'ai',
        timestamp: new Date(),
        type: aiResponse.type
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'general'
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

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'concept': return <Lightbulb className="w-4 h-4" />;
      case 'material': return <BookOpen className="w-4 h-4" />;
      case 'exam': return <GraduationCap className="w-4 h-4" />;
      case 'question': return <HelpCircle className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="w-5 h-5 text-primary" />
          EduFlow AI Assistant
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
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
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
        
        <div className="flex gap-2 mt-2 flex-wrap">
          <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-muted-foreground/20">
            Explain concept
          </Badge>
          <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-muted-foreground/20">
            Study materials
          </Badge>
          <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-muted-foreground/20">
            Exam prep
          </Badge>
          <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-muted-foreground/20">
            Practice problems
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default AIAssistant;
