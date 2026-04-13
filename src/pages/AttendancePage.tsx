import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Smartphone, 
  Receipt, 
  Loader2, 
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
  Search
} from 'lucide-react';
import '@/styles/eduflow-enhanced.css';
import BackToHomeButton from '@/components/BackToHomeButton';

const RECEIVER_UPI_ID = 'institution@upi';
const RECEIVER_NAME = 'College Fee Account';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subject: string;
  time: string;
  instructor: string;
}

const AttendancePage = () => {
  const navigate = useNavigate();
  const { studentProfile } = useAuthStore();
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [transactionData, setTransactionData] = useState({
    amount: '',
    utr: '',
    senderName: '',
    description: 'Quick Payment via Attendance Page'
  });
  const [submitting, setSubmitting] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [searchQuery, setSearchQuery] = useState('');

  // Mock attendance data
  const mockAttendanceData: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-04-01',
      status: 'present',
      subject: 'Computer Science',
      time: '9:00 AM',
      instructor: 'Dr. Smith'
    },
    {
      id: '2',
      date: '2024-04-02',
      status: 'present',
      subject: 'Mathematics',
      time: '10:00 AM',
      instructor: 'Prof. Johnson'
    },
    {
      id: '3',
      date: '2024-04-03',
      status: 'late',
      subject: 'Physics',
      time: '9:30 AM',
      instructor: 'Dr. Brown'
    },
    {
      id: '4',
      date: '2024-04-04',
      status: 'absent',
      subject: 'Chemistry',
      time: '9:00 AM',
      instructor: 'Prof. Davis'
    },
    {
      id: '5',
      date: '2024-04-05',
      status: 'present',
      subject: 'English',
      time: '11:00 AM',
      instructor: 'Ms. Wilson'
    }
  ];

  const openGPay = () => {
    try {
      // Try multiple methods to open GPay
      const upiUrl = `upi://pay?pa=${RECEIVER_UPI_ID}&pn=${encodeURIComponent(RECEIVER_NAME)}&cu=INR`;
      const gpayUrl = `tez://upi/pay?pa=${RECEIVER_UPI_ID}&pn=${encodeURIComponent(RECEIVER_NAME)}&cu=INR`;
      
      // Method 1: Try to open GPay directly
      const link = document.createElement('a');
      link.href = gpayUrl;
      link.click();
      
      // Method 2: Fallback to general UPI
      setTimeout(() => {
        window.location.href = upiUrl;
      }, 1000);
      
      // Show transaction dialog after a delay for user to complete payment
      setTimeout(() => {
        setShowTransactionDialog(true);
      }, 3000);
    } catch (error) {
      console.error('Error opening payment app:', error);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = !searchQuery || 
      record.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMonth = record.date ? new Date(record.date).getMonth() === selectedMonth : true;
    
    return matchesSearch && matchesMonth;
  });

  const stats = {
    total: filteredRecords.length,
    present: filteredRecords.filter(r => r.status === 'present').length,
    absent: filteredRecords.filter(r => r.status === 'absent').length,
    late: filteredRecords.filter(r => r.status === 'late').length,
    percentage: filteredRecords.length > 0 ? Math.round((filteredRecords.filter(r => r.status === 'present').length / filteredRecords.length) * 100) : 0
  };

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

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <UnifiedLayout userRole="student" title="Attendance">
      {/* Header with Home Button */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <BackToHomeButton variant="navbar" />
          <h1 className="text-base font-bold font-display text-foreground">Attendance</h1>
        </div>
      </header>
      
      <div className="space-y-8">
        {/* Attendance Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Classes</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Present</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.present}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Absent</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.absent}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Late</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.late}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Attendance Rate</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.percentage}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attendance records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-premium w-full pl-12"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-sm font-medium"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>More Filters</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="loading-skeleton-enhanced">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No attendance records found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || selectedMonth !== new Date().getMonth()
                    ? 'Try adjusting your search or filters'
                    : 'No attendance records available for the selected period'
                  }
                </p>
                <Button className="mt-4">
                  <Camera className="w-4 h-4 mr-2" />
                  Mark Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card
                key={record.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl ${getStatusBg(record.status)} flex items-center justify-center`}>
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{record.subject}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)} ${getStatusBg(record.status)}`}>
                            {record.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{record.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{record.time}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{record.instructor}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className=""
                onClick={() => navigate('/attendance')}
              >
                <Camera className="w-5 h-5 mr-2" />
                Mark Attendance
              </Button>
              
              <Button 
                variant="outline"
                className=""
                onClick={() => navigate('/academics')}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Attendance
              </Button>
              
              <Button 
                variant="outline"
                className=""
                onClick={() => navigate('/fees')}
              >
                <Receipt className="w-5 h-5 mr-2" />
                Fee Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount Paid
              </label>
              <Input
                type="text"
                placeholder="Enter amount"
                value={transactionData.amount}
                onChange={(e) => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UTR (Transaction ID)
              </label>
              <Input
                type="text"
                placeholder="Enter UTR"
                value={transactionData.utr}
                onChange={(e) => setTransactionData(prev => ({ ...prev, utr: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={transactionData.senderName}
                onChange={(e) => setTransactionData(prev => ({ ...prev, senderName: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Handle transaction submission
                  setSubmitting(true);
                  setTimeout(() => {
                    setShowTransactionDialog(false);
                    setSubmitting(false);
                    // Reset form
                    setTransactionData({
                      amount: '',
                      utr: '',
                      senderName: '',
                      description: 'Quick Payment via Attendance Page'
                    });
                  }, 2000);
                }}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UnifiedLayout>
  );
};

export default AttendancePage;
