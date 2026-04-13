import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import StudentLayout from '@/components/layouts/StudentLayout';
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
  Search,
  QrCode,
  CalendarDays,
  Activity
} from 'lucide-react';

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

const AttendancePageNew = () => {
  const navigate = useNavigate();
  const { studentProfile } = useAuthStore();
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [transactionData, setTransactionData] = useState({
    amount: '',
    utr: '',
    senderName: '',
    description: 'Quick Payment via Attendance Page'
  });
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Mock data - keeping the same data structure as original
  const mockRecords: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-01-15',
      status: 'present',
      subject: 'Mathematics',
      time: '09:00 AM',
      instructor: 'Dr. Smith'
    },
    {
      id: '2',
      date: '2024-01-15',
      status: 'present',
      subject: 'Physics',
      time: '10:30 AM',
      instructor: 'Prof. Johnson'
    },
    {
      id: '3',
      date: '2024-01-14',
      status: 'late',
      subject: 'Chemistry',
      time: '11:00 AM',
      instructor: 'Dr. Brown'
    },
    {
      id: '4',
      date: '2024-01-14',
      status: 'absent',
      subject: 'English',
      time: '02:00 PM',
      instructor: 'Ms. Davis'
    },
    {
      id: '5',
      date: '2024-01-13',
      status: 'present',
      subject: 'Computer Science',
      time: '09:00 AM',
      instructor: 'Mr. Wilson'
    }
  ];

  useEffect(() => {
    // Initialize with mock data
    setRecords(mockRecords);
    
    // Set current month and year
    const now = new Date();
    setSelectedMonth(now.toLocaleString('default', { month: 'long' }));
    setSelectedYear(now.getFullYear().toString());
  }, []);

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-amber-500';
      case 'excused':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600';
      case 'absent':
        return 'text-red-600';
      case 'late':
        return 'text-amber-600';
      case 'excused':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'excused':
        return 'Excused';
      default:
        return 'Unknown';
    }
  };

  // Calculate attendance statistics
  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    percentage: records.length > 0 ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100) : 0
  };

  // Filter records based on search
  const filteredRecords = records.filter(record =>
    record.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.date.includes(searchQuery)
  );

  const handleQuickPayment = () => {
    setShowTransactionDialog(true);
  };

  const handleTransactionSubmit = async () => {
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      setShowTransactionDialog(false);
      setTransactionData({
        amount: '',
        utr: '',
        senderName: '',
        description: 'Quick Payment via Attendance Page'
      });
      setLoading(false);
    }, 2000);
  };

  const handleScanAttendance = () => {
    // Navigate to QR scanner or open scanner modal
    navigate('/attendance/scan');
  };

  return (
    <StudentLayout title="Attendance">
      <div className="space-y-6">
        {/* Attendance Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Classes</div>
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-gray-600">This semester</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Present</div>
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <div className="text-sm text-green-600">Excellent</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Absent</div>
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <div className="text-sm text-red-600">Needs attention</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Attendance Rate</div>
                <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
                <div className="text-sm text-blue-600">Good</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search attendance records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Months</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <Button onClick={() => window.print()} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white mb-1">Mark Attendance</div>
                  <div className="text-white/80 text-sm">Scan QR code to mark</div>
                </div>
              </div>
              <Button 
                onClick={handleScanAttendance}
                className="bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan
              </Button>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white mb-1">View Schedule</div>
                  <div className="text-white/80 text-sm">Check your timetable</div>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/attendance/schedule')}
                className="bg-white text-green-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Receipt className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white mb-1">Quick Payment</div>
                  <div className="text-white/80 text-sm">Pay fees instantly</div>
                </div>
              </div>
              <Button 
                onClick={handleQuickPayment}
                className="bg-white text-orange-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Pay
              </Button>
            </div>
          </Card>
        </div>

        {/* Attendance Records */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Attendance Records</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No records found matching your search' : 'No attendance records available'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card
                key={record.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl ${getStatusBg(record.status)} flex items-center justify-center`}>
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{record.subject}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)} bg-opacity-10`}>
                          {getStatusText(record.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{record.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{record.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{record.instructor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Dialog */}
        <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
          <DialogContent className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Quick Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Amount (INR)</label>
                <Input
                  type="number"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">UTR Number</label>
                <Input
                  type="text"
                  value={transactionData.utr}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, utr: e.target.value }))}
                  placeholder="Enter UTR number"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Your Name</label>
                <Input
                  type="text"
                  value={transactionData.senderName}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, senderName: e.target.value }))}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="mb-2">Pay to: <span className="font-medium text-gray-900 dark:text-white">{RECEIVER_NAME}</span></div>
                  <div>UPI ID: <span className="font-medium text-gray-900 dark:text-white">{RECEIVER_UPI_ID}</span></div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTransactionDialog(false)}
                className="px-6 py-3 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransactionSubmit}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                {loading ? 'Processing...' : 'Pay Now'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
};

export default AttendancePageNew;
