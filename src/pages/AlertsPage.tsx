import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  FileText,
  AlertTriangle,
  Eye,
  Trash2,
  Archive,
  Star
} from 'lucide-react';
import BackToHomeButton from '@/components/BackToHomeButton';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_text?: string;
  expires_at?: string;
}

const AlertsPage = () => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('student_id', studentProfile?.id || '')
          .order('created_at', { ascending: false });

        const mapped: Alert[] = (data || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type || 'info',
          priority: 'medium',
          is_read: n.is_read,
          created_at: n.created_at,
          student_id: n.student_id,
        }));
        setAlerts(mapped);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [studentProfile?.id]);

  // Mock data for demonstration
  const mockAlerts: Alert[] = [
    {
      id: '1',
      title: 'Exam Schedule Updated',
      message: 'Your Data Structures midterm exam has been rescheduled to April 15, 2024 at 10:00 AM.',
      type: 'info',
      priority: 'high',
      is_read: false,
      created_at: '2024-04-08T10:30:00Z',
      action_url: '/exams',
      action_text: 'View Exam Schedule'
    },
    {
      id: '2',
      title: 'Fee Payment Reminder',
      message: 'Your semester fees are due by April 30, 2024. Please make the payment to avoid late fees.',
      type: 'warning',
      priority: 'urgent',
      is_read: false,
      created_at: '2024-04-07T14:20:00Z',
      action_url: '/fees',
      action_text: 'Pay Fees'
    },
    {
      id: '3',
      title: 'Assignment Graded',
      message: 'Your Mathematics assignment on Calculus has been graded. You scored 18/20.',
      type: 'success',
      priority: 'medium',
      is_read: true,
      created_at: '2024-04-06T16:45:00Z',
      action_url: '/academics',
      action_text: 'View Assignment'
    },
    {
      id: '4',
      title: 'New Study Material',
      message: 'New study materials have been uploaded for Physics Chapter 5: Electromagnetism.',
      type: 'info',
      priority: 'low',
      is_read: true,
      created_at: '2024-04-05T09:15:00Z',
      action_url: '/academics',
      action_text: 'View Materials'
    },
    {
      id: '5',
      title: 'Attendance Warning',
      message: 'Your attendance in Computer Science has dropped below 75%. Please attend classes regularly.',
      type: 'error',
      priority: 'high',
      is_read: false,
      created_at: '2024-04-04T11:30:00Z',
      action_url: '/attendance',
      action_text: 'View Attendance'
    },
    {
      id: '6',
      title: 'Library Book Due',
      message: 'The library book "Introduction to Algorithms" is due for return in 2 days.',
      type: 'warning',
      priority: 'medium',
      is_read: true,
      created_at: '2024-04-03T13:20:00Z'
    }
  ];

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = !searchQuery || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'unread' && !alert.is_read) ||
      (selectedFilter === 'read' && alert.is_read) ||
      (selectedFilter === 'urgent' && alert.priority === 'urgent') ||
      (selectedFilter === 'high' && alert.priority === 'high');
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = mockAlerts.filter(alert => !alert.is_read).length;
  const urgentCount = mockAlerts.filter(alert => alert.priority === 'urgent').length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return Info;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      case 'success': return CheckCircle;
      default: return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'warning': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'success': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = async (alertId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', alertId);

      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', alertId);

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      setSelectedAlert(null);
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const stats = {
    total: mockAlerts.length,
    unread: unreadCount,
    urgent: urgentCount
  };

  return (
    <UnifiedLayout userRole="student" title="Alerts">
      {/* Header with Home Button */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <BackToHomeButton variant="navbar" />
          <h1 className="text-base font-bold font-display text-foreground">Alerts</h1>
        </div>
      </header>
      
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Alerts</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unread</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.unread}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Urgent</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.urgent}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Week</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {mockAlerts.filter(alert => {
                      const alertDate = new Date(alert.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return alertDate >= weekAgo;
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-premium-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-premium w-full pl-12"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-sm font-medium"
                >
                  <option value="all">All Alerts</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High Priority</option>
                </select>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>More Filters</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card className="text-center">
              <CardContent className="p-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Alerts Found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery || selectedFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'You have no alerts at this time'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer transition-all duration-200 ${
                  !alert.is_read ? 'bg-white dark:bg-gray-800 border-l-4 border-l-purple-500' : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getAlertColor(alert.type)}`}>
                        {React.createElement(getAlertIcon(alert.type), { className: "w-6 h-6" })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-bold text-gray-900 dark:text-white ${!alert.is_read ? 'font-semibold' : ''}`}>
                            {alert.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                              {alert.priority.toUpperCase()}
                            </span>
                            {!alert.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(alert.created_at)}</span>
                          </div>
                          {alert.expires_at && (
                            <div className="flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Expires: {formatDate(alert.expires_at)}</span>
                            </div>
                          )}
                        </div>
                        {alert.action_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(alert.action_url);
                            }}
                            className="mt-3"
                          >
                            {alert.action_text}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlert(alert);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!alert.is_read && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(alert.id);
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAlert(alert.id);
                        }}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getAlertColor(selectedAlert.type)}`}>
                      {React.createElement(getAlertIcon(selectedAlert.type), { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAlert.title}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAlert.priority)}`}>
                          {selectedAlert.priority.toUpperCase()}
                        </span>
                        {!selectedAlert.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedAlert(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedAlert.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {formatDate(selectedAlert.created_at)}</span>
                    </div>
                    {selectedAlert.expires_at && (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Expires: {formatDate(selectedAlert.expires_at)}</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedAlert.action_url && (
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setSelectedAlert(null);
                        navigate(selectedAlert.action_url);
                      }}
                    >
                      {selectedAlert.action_text}
                    </Button>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!selectedAlert.is_read && (
                    <Button 
                      variant="outline"
                      onClick={() => markAsRead(selectedAlert.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => deleteAlert(selectedAlert.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </UnifiedLayout>
  );
};

export default AlertsPage;
