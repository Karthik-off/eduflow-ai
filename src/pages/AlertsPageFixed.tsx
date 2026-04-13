import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X,
  Filter,
  Search,
  AlertTriangle,
  MessageSquare,
  FileText,
  Users,
  BookOpen,
  TrendingUp,
  Settings
} from 'lucide-react';
import React from 'react';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender?: string;
  action_url?: string;
}

const AlertsPageFixed = () => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Mock data - maintaining the same data structure as original
  const mockAlerts: Alert[] = [
    {
      id: '1',
      title: 'Assignment Due Tomorrow',
      message: 'Your Mathematics assignment is due tomorrow at 11:59 PM. Please submit it on time.',
      type: 'warning',
      created_at: '2024-02-14T10:30:00Z',
      is_read: false,
      priority: 'high',
      sender: 'Dr. Smith',
      action_url: '/academics'
    },
    {
      id: '2',
      title: 'Fee Payment Reminder',
      message: 'Your tuition fee payment is due on February 20, 2024. Please make the payment before the due date.',
      type: 'info',
      created_at: '2024-02-13T14:15:00Z',
      is_read: false,
      priority: 'medium',
      sender: 'Accounts Department',
      action_url: '/fees'
    },
    {
      id: '3',
      title: 'Exam Schedule Updated',
      message: 'The Physics exam schedule has been updated. New date: February 18, 2024 at 9:00 AM.',
      type: 'info',
      created_at: '2024-02-12T09:00:00Z',
      is_read: true,
      priority: 'medium',
      sender: 'Examination Cell',
      action_url: '/exams'
    },
    {
      id: '4',
      title: 'Class Cancelled',
      message: 'Today\'s Chemistry class has been cancelled due to teacher\'s absence. Makeup class will be scheduled soon.',
      type: 'error',
      created_at: '2024-02-11T08:00:00Z',
      is_read: true,
      priority: 'high',
      sender: 'Dr. Brown'
    },
    {
      id: '5',
      title: 'Study Material Available',
      message: 'New study materials for Computer Science have been uploaded to the portal.',
      type: 'success',
      created_at: '2024-02-10T16:45:00Z',
      is_read: true,
      priority: 'low',
      sender: 'Mr. Wilson',
      action_url: '/academics'
    }
  ];

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        // For now, use mock data to maintain existing functionality
        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [studentProfile]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (alert.sender && alert.sender.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'unread') return matchesSearch && !alert.is_read;
    return matchesSearch && alert.type === selectedFilter;
  });

  const unreadCount = alerts.filter(alert => !alert.is_read).length;
  const urgentCount = alerts.filter(alert => alert.priority === 'urgent').length;

  const stats = {
    total: alerts.length,
    unread: unreadCount,
    urgent: urgentCount
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info':
        return Info;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertCircle;
      case 'success':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));
  };

  const handleMarkAllAsRead = async () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
  };

  const handleDeleteAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setSelectedAlert(null);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <StudentLayoutWithSearch title="Alerts">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Alerts</div>
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-blue-600">All messages</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Unread</div>
                <div className="text-2xl font-bold text-amber-600">{stats.unread}</div>
                <div className="text-sm text-amber-600">New messages</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Urgent</div>
                <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                <div className="text-sm text-red-600">Immediate</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">This Week</div>
                <div className="text-2xl font-bold text-purple-600">
                  {mockAlerts.filter(alert => {
                    const alertDate = new Date(alert.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return alertDate >= weekAgo;
                  }).length}
                </div>
                <div className="text-sm text-purple-600">Recent</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Notification Settings Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">Notification Settings</div>
                <div className="text-white/80">Manage your notification preferences</div>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/settings')}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            return (
              <Card 
                key={alert.id} 
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer ${
                  !alert.is_read ? 'bg-white dark:bg-gray-800 border-l-4 border-l-purple-500' : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
                onClick={() => {
                  setSelectedAlert(alert);
                  if (!alert.is_read) {
                    handleMarkAsRead(alert.id);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getAlertColor(alert.type)}`}>
                      <AlertIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{alert.title}</h3>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(alert.priority)}`}></div>
                        {!alert.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{alert.message}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          {alert.sender && (
                            <span>From: {alert.sender}</span>
                          )}
                          <span>{formatTimeAgo(alert.created_at)}</span>
                        </div>
                        {alert.action_url && (
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(alert.action_url!);
                            }}
                            className="px-3 py-1 rounded-lg"
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(alert.id);
                      }}
                      className="p-2 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAlert(alert.id);
                      }}
                      className="p-2 rounded-lg text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </StudentLayoutWithSearch>
  );
};

export default AlertsPageFixed;
