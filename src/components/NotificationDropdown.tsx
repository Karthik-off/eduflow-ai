import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { Bell, X, Calendar, FileText, DollarSign, AlertTriangle, Check } from 'lucide-react';

interface Notification {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  time: string;
  color: string;
  read: boolean;
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  // Mock recent notifications - in real app, this would come from API
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: '1', 
      icon: Calendar, 
      label: 'Attendance marked for today', 
      time: '2 hours ago', 
      color: 'text-green-500',
      read: false
    },
    { 
      id: '2', 
      icon: FileText, 
      label: 'Assignment submitted successfully', 
      time: '5 hours ago', 
      color: 'text-blue-500',
      read: false
    },
    { 
      id: '3', 
      icon: DollarSign, 
      label: 'Fee payment received', 
      time: '1 day ago', 
      color: 'text-green-500',
      read: true
    },
    { 
      id: '4', 
      icon: AlertTriangle, 
      label: 'Attendance below threshold', 
      time: '2 days ago', 
      color: 'text-orange-500',
      read: false
    },
    { 
      id: '5', 
      icon: Calendar, 
      label: 'Exam schedule updated', 
      time: '3 days ago', 
      color: 'text-purple-500',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when pressing Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNotificationClick = (notificationId: string) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/alerts');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        className="relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications - ${unreadCount} new notifications`}
        aria-expanded={isOpen}
        tabIndex={0}
        type="button"
      >
        <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} aria-hidden="true" />
        {unreadCount > 0 && (
          <>
            <span 
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" 
              aria-hidden="true"
            ></span>
            <span className="sr-only">{unreadCount} new notifications</span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } z-50 overflow-hidden`}
          role="menu"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
                aria-label="Close notifications"
              >
                <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
            {unreadCount > 0 && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                } flex items-center justify-center`}>
                  <Bell className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                    isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                  } ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => handleNotificationClick(notification.id)}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    } flex-shrink-0`}>
                      <notification.icon className={`w-4 h-4 ${notification.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.label}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - View All Link */}
          <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={handleViewAll}
              className={`w-full text-center py-2 px-4 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              role="menuitem"
              tabIndex={0}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
