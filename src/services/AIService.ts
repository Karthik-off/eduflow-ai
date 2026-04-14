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

class AIService {
  private context: AIContext | null = null;

  private readonly OLLAMA_URL = '/api/generate';
  private readonly OLLAMA_MODEL = 'llama2:7b';

  setContext(context: AIContext) {
    this.context = context;
  }

  getContext(): AIContext | null {
    return this.context;
  }

  private async queryOllama(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const response = await fetch(this.OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.OLLAMA_MODEL,
          prompt: prompt,
          system: systemPrompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Ollama API Error:", error);
      return `I'm sorry, I couldn't connect to Ollama. Please ensure Ollama is running and the "${this.OLLAMA_MODEL}" model is installed.`;
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

    const ollamaAnswer = await this.queryOllama(query, systemPrompt);

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
