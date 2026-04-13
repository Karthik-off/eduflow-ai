import { useState } from 'react';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3
} from 'lucide-react';
import EnhancedAIAssistant from '@/components/ai/EnhancedAIAssistant';
import { AIContext } from '@/services/AIService';
import StudyMaterialsFinder from '@/components/ai/StudyMaterialsFinder';
import ConceptExplainer from '@/components/ai/ConceptExplainer';
import LearningPathRecommendations from '@/components/ai/LearningPathRecommendations';
import ExamPreparation from '@/components/ai/ExamPreparation';
import StudentPerformanceAnalyzer from '@/components/ai/StudentPerformanceAnalyzer';
import ClassPerformanceAnalyzer from '@/components/ai/ClassPerformanceAnalyzer';
import BackToHomeButton from '@/components/BackToHomeButton';

const AIAssistantPage = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  
  // AI context for student module
  const aiContext: AIContext = {
    module: 'student',
    userRole: 'student',
    currentPath: '/student/ai-assistant'
  };

  const aiStats = [
    {
      label: 'Questions Answered',
      value: '127',
      icon: <Bot className="w-4 h-4" />,
      trend: '+12%'
    },
    {
      label: 'Study Sessions',
      value: '24',
      icon: <BookOpen className="w-4 h-4" />,
      trend: '+8%'
    },
    {
      label: 'Concepts Learned',
      value: '18',
      icon: <Brain className="w-4 h-4" />,
      trend: '+15%'
    },
    {
      label: 'Practice Score',
      value: '85%',
      icon: <Award className="w-4 h-4" />,
      trend: '+5%'
    }
  ];

  return (
    <UnifiedLayout userRole="student" title="AI Assistant">
      {/* Header with Home Button */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <BackToHomeButton variant="navbar" />
          <h1 className="text-base font-bold font-display text-foreground">AI Assistant</h1>
        </div>
      </header>
      
      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* AI Stats Overview */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Your AI Learning Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {aiStats.map((stat, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main AI Tools */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-4">
            <TabsTrigger value="assistant" className="text-xs">
              <Bot className="w-3 h-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="materials" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="concepts" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              Concepts
            </TabsTrigger>
            <TabsTrigger value="paths" className="text-xs">
              <Route className="w-3 h-3 mr-1" />
              Paths
            </TabsTrigger>
            <TabsTrigger value="exams" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              Exams
            </TabsTrigger>
            <TabsTrigger value="class" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Class
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="mt-0">
            <EnhancedAIAssistant context={aiContext} />
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <StudentPerformanceAnalyzer studentData={{
              id: '1',
              name: 'John Doe',
              rollNumber: 'CS2023001',
              attendancePercentage: 68,
              pendingFees: 25000,
              feeDueDate: '2026-04-15',
              marks: [
                { subject: 'Data Structures', marks: 35, totalMarks: 100, percentage: 35, grade: 'C', credit: 4 },
                { subject: 'Mathematics', marks: 42, totalMarks: 100, percentage: 42, grade: 'C+', credit: 4 },
                { subject: 'Physics', marks: 28, totalMarks: 100, percentage: 28, grade: 'D', credit: 3 },
                { subject: 'Chemistry', marks: 58, totalMarks: 100, percentage: 58, grade: 'B', credit: 3 }
              ],
              cgpa: 6.8,
              semester: '3rd'
            }} />
          </TabsContent>

          <TabsContent value="materials" className="mt-0">
            <StudyMaterialsFinder />
          </TabsContent>

          <TabsContent value="concepts" className="mt-0">
            <ConceptExplainer />
          </TabsContent>

          <TabsContent value="paths" className="mt-0">
            <LearningPathRecommendations />
          </TabsContent>

          <TabsContent value="exams" className="mt-0">
            <ExamPreparation />
          </TabsContent>

          <TabsContent value="class" className="mt-0">
            <ClassPerformanceAnalyzer />
          </TabsContent>
        </Tabs>

        {/* Quick Tips */}
        <Card className="shadow-card border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">💡 AI Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Ask specific questions for better answers</li>
                  <li>• Use concept explainer for difficult topics</li>
                  <li>• Practice regularly with exam preparation tools</li>
                  <li>• Follow recommended learning paths for structured study</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </UnifiedLayout>
  );
};

export default AIAssistantPage;
