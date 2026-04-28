import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Bot, X, MessageSquare } from 'lucide-react';
import EnhancedAIAssistant from '@/components/ai/EnhancedAIAssistant';
import { AIContext } from '@/services/AIService';

const FloatingAIWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, studentProfile, staffProfile } = useAuthStore();
  
  // Don't show on login pages
  if (location.pathname.includes('login') || location.pathname === '/') {
    return null;
  }
  
  // Don't show if already on a dedicated AI Assistant page
  if (location.pathname.includes('ai-assistant')) {
    return null;
  }

  const determineContext = (): AIContext | null => {
    if (location.pathname.includes('/admin')) {
        return null; // Admin has its own widget/logic if needed, or we omit here
    } else if (staffProfile) {
      return {
        module: 'staff',
        userRole: 'staff',
        systemData: staffProfile
      };
    } else if (studentProfile) {
      // Determine subclass module based on path for students
      let module = 'student';
      if (location.pathname.includes('/fees')) module = 'fees';
      else if (location.pathname.includes('/attendance')) module = 'attendance';
      else if (location.pathname.includes('/academics')) module = 'academics';
      
      return {
        module,
        userRole: 'student',
        userId: user?.id,
        currentPath: location.pathname,
        studentData: {
          name: studentProfile.full_name,
          rollNo: studentProfile.roll_number,
          department: studentProfile.department_id || '',
          section: studentProfile.section_id || ''
        }
      };
    }
    return null;
  };

  const context = determineContext();
  
  // Only render if a valid context is found
  if (!context) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 relative bg-background border">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <EnhancedAIAssistant 
            context={context} 
            height="500px" 
            className="border-0 shadow-none rounded-none"
            showActions={false}
          />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:-translate-y-1 hover:shadow-xl'} text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ml-auto`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
             <MessageSquare className="w-6 h-6" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingAIWidget;
