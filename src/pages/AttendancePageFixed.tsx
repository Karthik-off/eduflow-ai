import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import QRScannerModal from '@/components/QRScannerModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  QrCode,
  CalendarDays,
  Activity,
  Receipt,
  Smartphone,
  CreditCard
} from 'lucide-react';


const AttendancePageFixed = () => {
  const navigate = useNavigate();
  const { studentProfile } = useAuthStore();
  const { records, stats, isLoading, error, refreshData } = useAttendanceData();
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [transactionData, setTransactionData] = useState({
    amount: '',
    utr: '',
    senderName: '',
    description: 'Quick Payment via Attendance Page'
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Set current month and year
  useEffect(() => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'absent':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'late':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'excused':
        return <AlertCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  // Use unified stats from useAttendanceData hook

  // Filter records based on search
  const filteredRecords = records.filter(record =>
    record.date.includes(searchQuery) ||
    (record.status && record.status.toLowerCase().includes(searchQuery.toLowerCase()))
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
    setShowQRScanner(true);
  };

  const handleQRScanSuccess = async (scanData: any) => {
    try {
      console.log('QR Scan Success:', scanData);
      
      // Process the scanned QR data and mark attendance
      const attendanceRecord = {
        student_id: studentProfile?.id,
        session_id: scanData.sessionId,
        staff_id: scanData.staffId,
        date: new Date().toISOString().split('T')[0],
        check_in: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        check_out: null,
        status: 'present',
        total_hours: 0,
        location: scanData.location,
        timestamp: scanData.timestamp
      };

      // Here you would save to database
      console.log('Attendance record to save:', attendanceRecord);
      
      // Refresh attendance data
      refreshData();
      
      // Show success message (you could add a toast here)
      alert('Attendance marked successfully!');
      
    } catch (error) {
      console.error('Error processing QR scan:', error);
      alert('Error processing attendance. Please try again.');
    }
  };

  return (
    <StudentLayoutWithSearch title="Attendance">
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-gray-600 dark:text-gray-400">Loading attendance data...</span>
          </div>
        )}
        
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
                onClick={() => navigate('/academics')}
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
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
              onClick={() => navigate(`/attendance/${record.date}`)}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl ${getStatusColor(record.status)} bg-opacity-10 flex items-center justify-center`}>
                  {getStatusIcon(record.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Attendance</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)} bg-opacity-10`}>
                      {getStatusText(record.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <CalendarDays className="w-4 h-4" />
                      <span>{record.date}</span>
                    </div>
                    {record.check_in && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>In: {record.check_in}</span>
                      </div>
                    )}
                    {record.check_out && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Out: {record.check_out}</span>
                      </div>
                    )}
                    {record.total_hours > 0 && (
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4" />
                        <span>{record.total_hours}h</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

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
                {loading ? 'Processing...' : 'Pay Now'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Scanner Modal */}
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScanSuccess={handleQRScanSuccess}
        />
      </div>
    </StudentLayoutWithSearch>
  );
};

export default AttendancePageFixed;
