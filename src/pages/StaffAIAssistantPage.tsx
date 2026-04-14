import React from 'react';
import StaffLayout from '@/components/layouts/StaffLayout';
import EnhancedAIAssistant from '@/components/ai/EnhancedAIAssistant';
import { useAuthStore } from '@/stores/authStore';
import { Bot, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const StaffAIAssistantPage = () => {
  const { staffProfile } = useAuthStore();

  return (
    <StaffLayout title="AI Assistant">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-6 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="w-8 h-8" />
              Staff AI Assistant
            </h1>
            <p className="text-white/80 mt-2 max-w-2xl">
              Your intelligent companion for managing students, grading, scheduling, and other academic processes.
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="font-medium">Powered by EduFlow AI</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Chat Component */}
        <div className="max-w-5xl mx-auto">
          <EnhancedAIAssistant 
            context={{
              module: 'staff',
              userRole: 'staff',
              systemData: staffProfile
            }}
            height="650px"
            className="shadow-xl border-t-4 border-t-indigo-500 rounded-xl overflow-hidden bg-background"
          />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
          <Card className="bg-card">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-lg">Schedule Planning</h3>
              <p className="text-muted-foreground text-sm">
                Ask me to help organize your timetable and notify you about upcoming classes.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-lg">Grade Analysis</h3>
              <p className="text-muted-foreground text-sm">
                I can help you analyze student performance and identify areas needing attention.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold text-lg">Teaching Resources</h3>
              <p className="text-muted-foreground text-sm">
                Request explanations, lesson plan ideas, and modern teaching methodologies.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffAIAssistantPage;
