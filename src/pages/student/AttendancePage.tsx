import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardHeader, CardContent } from '@/components/premium-ui/Card';
import { Button } from '@/components/premium-ui/Button';
import { Input } from '@/components/premium-ui/Input';
import SimpleQRScanner from '@/components/SimpleQRScanner';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import RealTimeDateTime from '@/components/RealTimeDateTime';
import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Download,
  Upload,
  TrendingUp,
  Users,
  Target,
  Filter,
  Search,
  MoreHorizontal,
  ChevronRight,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';
import '@/styles/eduflow-enhanced.css';


const AttendancePage = () => {
  const { studentProfile } = useAuthStore();
  const { records: attendanceRecords, stats, isLoading, error, refreshData } = useAttendanceData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const navigate = useNavigate();

  // Attendance threshold logic
  const ATTENDANCE_THRESHOLD = 75;
  const isAttendanceBelowThreshold = stats.percentage < ATTENDANCE_THRESHOLD;
  const attendanceStatus = isAttendanceBelowThreshold ? 'Below Threshold' : 'Good';
  const attendanceColor = isAttendanceBelowThreshold ? 'text-red-600' : 'text-green-600';
  const attendanceBgColor = isAttendanceBelowThreshold ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQRScanSuccess = async (data: any) => {
    console.log('QR scan successful:', data);
    // Refresh attendance records after successful scan
    refreshData();
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = !searchQuery || 
      record.date.includes(searchQuery) ||
      record.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMonth = selectedMonth === 'all' || 
      (selectedMonth && record.date.startsWith(selectedMonth));
    
    return matchesSearch && matchesMonth;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 dark:text-green-400';
      case 'absent': return 'text-red-600 dark:text-red-400';
      case 'late': return 'text-amber-600 dark:text-amber-400';
      case 'excused': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 dark:bg-green-900/30';
      case 'absent': return 'bg-red-100 dark:bg-red-900/30';
      case 'late': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'excused': return 'bg-blue-100 dark:bg-blue-900/30';
      default: return 'bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return CheckCircle;
      case 'absent': return AlertCircle;
      case 'late': return Clock;
      case 'excused': return AlertCircle;
      default: return AlertCircle;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Dashboard</h1>
          <p className="text-gray-600">Track your daily attendance and check-in/check-out times</p>
        </div>

        {/* Debug Info - Better Styled */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold text-blue-900">Debug Information</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-medium">Loading Status</p>
              <p className="text-blue-600">{isLoading ? 'Loading...' : 'Ready'}</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Records Count</p>
              <p className="text-blue-600">{attendanceRecords.length}</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Attendance %</p>
              <p className="text-blue-600">{stats.percentage}%</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">API Status</p>
              <p className="text-blue-600">{error ? 'Error' : 'Connected'}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Better Alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Classes</p>
            <p className="text-xs text-gray-500 mt-1">All sessions</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.present}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Present</p>
            <p className="text-xs text-gray-500 mt-1">On time attendance</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.absent}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Absent</p>
            <p className="text-xs text-gray-500 mt-1">Missed classes</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.percentage}%</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
            <p className="text-xs text-gray-500 mt-1">Overall percentage</p>
          </div>
        </div>

        {/* Records List - Better Layout */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Attendance Records</h2>
            <p className="text-sm text-gray-600 mt-1">Your latest check-in and check-out times</p>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Loading attendance records...</span>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                <p className="text-gray-600">Start marking your attendance to see records here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {attendanceRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        record.status === 'present' ? 'bg-green-100' :
                        record.status === 'absent' ? 'bg-red-100' :
                        record.status === 'late' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        {record.status === 'present' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         record.status === 'absent' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                         record.status === 'late' ? <Clock className="w-5 h-5 text-yellow-600" /> :
                         <AlertCircle className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.date}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          {record.check_in && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              In: {record.check_in}
                            </span>
                          )}
                          {record.check_out && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Out: {record.check_out}
                            </span>
                          )}
                          {record.total_hours > 0 && (
                            <span className="flex items-center">
                              <Activity className="w-3 h-3 mr-1" />
                              {record.total_hours}h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                        record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
