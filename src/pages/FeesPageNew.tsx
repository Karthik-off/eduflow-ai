import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import StudentLayout from '@/components/layouts/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Receipt, 
  TrendingUp, 
  Wallet,
  Smartphone,
  QrCode,
  Clock,
  FileText,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

interface FeeRecord {
  id: string;
  fee_type: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  description?: string;
}

interface Transaction {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  fee_type: string;
  transaction_id: string;
}

const FeesPageNew = () => {
  const { studentProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    utr: '',
    senderName: '',
    description: 'Fee Payment'
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  // Mock data - maintaining the same data structure as original
  const mockFees: FeeRecord[] = [
    {
      id: '1',
      fee_type: 'Tuition Fee',
      amount: 25000,
      due_date: '2024-02-15',
      status: 'pending',
      description: 'Semester tuition fee for current academic year'
    },
    {
      id: '2',
      fee_type: 'Library Fee',
      amount: 2000,
      due_date: '2024-02-10',
      status: 'paid',
      payment_date: '2024-02-08',
      payment_method: 'UPI',
      transaction_id: 'TXN123456789',
      description: 'Annual library membership fee'
    },
    {
      id: '3',
      fee_type: 'Lab Fee',
      amount: 5000,
      due_date: '2024-02-20',
      status: 'pending',
      description: 'Science laboratory usage fee'
    },
    {
      id: '4',
      fee_type: 'Examination Fee',
      amount: 3000,
      due_date: '2024-01-30',
      status: 'overdue',
      description: 'Semester examination fee'
    },
    {
      id: '5',
      fee_type: 'Hostel Fee',
      amount: 15000,
      due_date: '2024-02-05',
      status: 'paid',
      payment_date: '2024-02-01',
      payment_method: 'Bank Transfer',
      transaction_id: 'BANK987654321',
      description: 'Monthly hostel accommodation fee'
    }
  ];

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      amount: 2000,
      date: '2024-02-08',
      method: 'UPI',
      status: 'Success',
      fee_type: 'Library Fee',
      transaction_id: 'TXN123456789'
    },
    {
      id: '2',
      amount: 15000,
      date: '2024-02-01',
      method: 'Bank Transfer',
      status: 'Success',
      fee_type: 'Hostel Fee',
      transaction_id: 'BANK987654321'
    }
  ];

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        // For now, use mock data to maintain existing functionality
      } catch (error) {
        console.error('Error fetching fees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [studentProfile]);

  const filteredFees = mockFees.filter(fee => {
    const matchesSearch = fee.fee_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fee.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && fee.status === selectedFilter;
  });

  const stats = {
    totalFees: mockFees.reduce((sum, fee) => sum + fee.amount, 0),
    paidFees: mockFees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0),
    pendingFees: mockFees.filter(f => f.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0),
    overdueFees: mockFees.filter(f => f.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'overdue':
        return AlertTriangle;
      default:
        return AlertCircle;
    }
  };

  const handlePayment = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setPaymentData(prev => ({
      ...prev,
      amount: fee.amount.toString()
    }));
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async () => {
    setProcessingPayment(true);
    // Simulate payment processing
    setTimeout(() => {
      setShowPaymentDialog(false);
      setSelectedFee(null);
      setPaymentData({
        amount: '',
        utr: '',
        senderName: '',
        description: 'Fee Payment'
      });
      setProcessingPayment(false);
    }, 2000);
  };

  return (
    <StudentLayout title="Fees">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Fees</div>
                <div className="text-2xl font-bold text-gray-800">Rs. {stats.totalFees.toLocaleString()}</div>
                <div className="text-sm text-blue-600">This semester</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Paid</div>
                <div className="text-2xl font-bold text-green-600">Rs. {stats.paidFees.toLocaleString()}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Pending</div>
                <div className="text-2xl font-bold text-amber-600">Rs. {stats.pendingFees.toLocaleString()}</div>
                <div className="text-sm text-amber-600">Due soon</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Overdue</div>
                <div className="text-2xl font-bold text-red-600">Rs. {stats.overdueFees.toLocaleString()}</div>
                <div className="text-sm text-red-600">Immediate</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
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
                  placeholder="Search fees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <Button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Payment Banner */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">Quick Payment</div>
                <div className="text-white/80">Pay your fees instantly with UPI</div>
              </div>
            </div>
            <Button 
              onClick={() => setShowPaymentDialog(true)}
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50"
            >
              Pay Now
              <CreditCard className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 border border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Fee Overview
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'transactions'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'receipts'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Receipts
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
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
            ) : (
              filteredFees.map((fee) => {
                const StatusIcon = getStatusIcon(fee.status);
                return (
                  <Card key={fee.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{fee.fee_type}</h3>
                          <Badge className={getStatusColor(fee.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{fee.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium text-gray-900 dark:text-white">Rs. {fee.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {fee.due_date}</span>
                          </div>
                          {fee.payment_date && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>Paid: {fee.payment_date}</span>
                            </div>
                          )}
                        </div>
                        {fee.transaction_id && (
                          <div className="mt-3 text-sm text-gray-500">
                            Transaction ID: {fee.transaction_id}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {fee.status !== 'paid' && (
                          <Button 
                            onClick={() => handlePayment(fee)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          className="px-4 py-2 rounded-xl"
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <Card key={transaction.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{transaction.fee_type}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{transaction.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">Rs. {transaction.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{transaction.method}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                  <Receipt className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Download Receipts</h3>
                <p className="text-gray-600 dark:text-gray-400">Download your payment receipts and invoices</p>
                <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Download All Receipts
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedFee ? `Pay ${selectedFee.fee_type}` : 'Fee Payment'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFee && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div className="mb-2">Amount: <span className="font-medium text-gray-900 dark:text-white">Rs. {selectedFee.amount.toLocaleString()}</span></div>
                    <div>Due Date: <span className="font-medium text-gray-900 dark:text-white">{selectedFee.due_date}</span></div>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Amount (INR)</label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">UTR Number</label>
                <Input
                  type="text"
                  value={paymentData.utr}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, utr: e.target.value }))}
                  placeholder="Enter UTR number"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Your Name</label>
                <Input
                  type="text"
                  value={paymentData.senderName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, senderName: e.target.value }))}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="px-6 py-3 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={processingPayment}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                {processingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
};

export default FeesPageNew;
