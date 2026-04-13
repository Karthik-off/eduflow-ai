import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { 
  Search, 
  Home, 
  BookOpen, 
  Calendar, 
  FileText, 
  DollarSign, 
  Bell, 
  Bot, 
  User, 
  Settings,
  ArrowRight
} from 'lucide-react';

interface SearchablePage {
  title: string;
  description: string;
  path: string;
  keywords: string[];
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className = '',
  placeholder = 'Search pages...'
}) => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search data with all available pages
  const searchablePages: SearchablePage[] = [
    { 
      title: 'Home', 
      description: 'Dashboard and overview', 
      path: '/dashboard',
      keywords: ['home', 'dashboard', 'overview', 'main']
    },
    { 
      title: 'Academics', 
      description: 'View subjects, timetable, and study materials', 
      path: '/academics',
      keywords: ['academics', 'subjects', 'timetable', 'study', 'courses', 'classes']
    },
    { 
      title: 'Attendance', 
      description: 'Mark and view attendance records', 
      path: '/attendance',
      keywords: ['attendance', 'present', 'absent', 'classes', 'scan']
    },
    { 
      title: 'Exams', 
      description: 'View exam schedules and results', 
      path: '/exams',
      keywords: ['exams', 'test', 'results', 'marks', 'grades', 'assessment']
    },
    { 
      title: 'Fees', 
      description: 'View fee structure and make payments', 
      path: '/fees',
      keywords: ['fees', 'payment', 'bill', 'invoice', 'cost']
    },
    { 
      title: 'Alerts', 
      description: 'View notifications and announcements', 
      path: '/alerts',
      keywords: ['alerts', 'notifications', 'announcements', 'messages', 'updates']
    },
    { 
      title: 'AI Assistant', 
      description: 'Get help with studies using AI', 
      path: '/ai-assistant',
      keywords: ['ai', 'assistant', 'help', 'chat', 'bot', 'support']
    },
    { 
      title: 'Profile', 
      description: 'View and edit personal information', 
      path: '/profile',
      keywords: ['profile', 'account', 'settings', 'personal', 'information']
    },
    { 
      title: 'Settings', 
      description: 'Manage app preferences and settings', 
      path: '/settings',
      keywords: ['settings', 'preferences', 'config', 'options']
    }
  ];

  // Filter search results based on query with priority for pages starting with letter
  const filteredResults = searchablePages.filter(page => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];
    
    const title = page.title.toLowerCase();
    const description = page.description.toLowerCase();
    
    // Priority 1: Pages starting with the query
    if (title.startsWith(query)) {
      return true;
    }
    
    // Priority 2: Keywords starting with the query
    if (page.keywords.some(keyword => keyword.toLowerCase().startsWith(query))) {
      return true;
    }
    
    // Priority 3: Pages containing the query anywhere
    return (
      title.includes(query) ||
      description.includes(query) ||
      page.keywords.some(keyword => keyword.includes(query))
    );
  }).sort((a, b) => {
    const query = searchQuery.toLowerCase().trim();
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    
    // Sort by priority: starts with > contains
    const aStarts = aTitle.startsWith(query);
    const bStarts = bTitle.startsWith(query);
    
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    // If both start with query, sort alphabetically
    if (aStarts && bStarts) return aTitle.localeCompare(bTitle);
    
    // If neither starts with query, sort alphabetically
    return aTitle.localeCompare(bTitle);
  });

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
    setSelectedResultIndex(0);
  };

  // Handle navigation to selected page
  const handleNavigate = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchResults(false);
    setSelectedResultIndex(0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchResults) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedResultIndex]) {
          handleNavigate(filteredResults[selectedResultIndex].path);
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSelectedResultIndex(0);
        break;
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageIcon = (title: string) => {
    switch (title) {
      case 'Home': return <Home className="w-4 h-4 text-blue-500" />;
      case 'Academics': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'Attendance': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'Exams': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Fees': return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'Alerts': return <Bell className="w-4 h-4 text-blue-500" />;
      case 'AI Assistant': return <Bot className="w-4 h-4 text-blue-500" />;
      case 'Profile': return <User className="w-4 h-4 text-blue-500" />;
      case 'Settings': return <Settings className="w-4 h-4 text-blue-500" />;
      default: return <Search className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        className={`pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 ${
          isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-800'
        }`}
      />
      
      {/* Search Results Dropdown */}
      {showSearchResults && filteredResults.length > 0 && (
        <div className={`absolute top-full mt-2 w-full rounded-xl shadow-2xl border z-50 max-h-80 overflow-y-auto ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {filteredResults.map((result, index) => (
            <div
              key={result.path}
              onClick={() => handleNavigate(result.path)}
              className={`px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center space-x-3 ${
                index === selectedResultIndex
                  ? isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                {getPageIcon(result.title)}
              </div>
              <div className="flex-1">
                <div className={`font-medium text-sm ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {result.title}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {result.description}
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
            </div>
          ))}
          
          {/* No Results Message */}
          {filteredResults.length === 0 && searchQuery.trim() && (
            <div className={`px-4 py-6 text-center text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No pages found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
