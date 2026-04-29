export interface AIMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'question' | 'material' | 'concept' | 'exam' | 'admin' | 'fees' | 'general';
  context?: string;
  module?: string;
}

export interface AIResponse {
  answer: string;
  type: 'question' | 'material' | 'concept' | 'exam' | 'admin' | 'fees' | 'general';
  followUp?: string[];
  resources?: Array<{
    title: string;
    type: 'video' | 'article' | 'book' | 'practice' | 'document' | 'link';
    url?: string;
  }>;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

export interface AIContext {
  module: string;
  userRole: 'student' | 'admin' | 'staff';
  userId?: string;
  currentPath?: string;
  studentData?: any;
  systemData?: any;
}

import { supabase } from "@/integrations/supabase/client";

class AIService {
  private context: AIContext | null = null;

  setContext(context: AIContext) {
    this.context = context;
  }

  getContext(): AIContext | null {
    return this.context;
  }

  private async queryAI(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { query: prompt, systemPrompt },
      });
      if (error) throw error;
      if (data?.error) return `AI error: ${data.error}`;
      return data?.answer ?? "I couldn't generate a response.";
    } catch (error) {
      console.error("AI Service Error:", error);
      return "I'm sorry, I couldn't reach the AI service right now. Please try again in a moment.";
    }
  }

  async generateResponse(query: string, context?: AIContext): Promise<AIResponse> {
    const currentContext = context || this.context;
    
    let systemPrompt = "You are EduFlow AI, an intelligent, helpful academic and administrative assistant for an educational application.\n";
    
    if (currentContext?.module) {
      systemPrompt += `The user is currently in the ${currentContext.module} module. `;
      if (currentContext.module === 'admin') {
        systemPrompt += "Provide professional, administrative, and insightful responses. ";
      } else if (currentContext.module === 'student') {
        systemPrompt += "Provide helpful, encouraging, and clear guidance for their studies. ";
      } else if (currentContext.module === 'staff') {
        systemPrompt += "You are assisting a teaching staff member. Provide clear, professional guidance on classroom management, attendance tracking, grading, lesson planning, and student performance analysis. ";
      }
    }

    if (currentContext?.studentData) {
      systemPrompt += `\nAdditional User Data: ${JSON.stringify(currentContext.studentData)}`;
    }

    systemPrompt += "\nKeep your response concise and directly answer the question. Do NOT use markdown links, just use plain text or bold text.";
    systemPrompt += "\nIf there are any quick actions you can suggest, you MUST format them exactly by ending your response with '**Quick Actions Available:**' followed strictly by a list of bullet points starting with '•'.";

    const ollamaAnswer = await this.queryAI(query, systemPrompt);

    let type: AIResponse['type'] = (currentContext?.module as any) || 'general';
    const validTypes = ['question', 'material', 'concept', 'exam', 'admin', 'fees', 'general'];
    if (!validTypes.includes(type)) {
      type = 'general';
    }

    return {
      answer: ollamaAnswer,
      type: type,
      followUp: ['Anything else you need help with?']
    };
  }
}

export const aiService = new AIService();
