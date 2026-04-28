// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import StudentLayoutWithSearch from '@/components/layouts/StudentLayoutWithSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { 
  DollarSign,
  IndianRupee, 
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
import ReceiptComponent from '@/components/Receipt';
import FeesAIAssistant from '@/components/ai/FeesAIAssistant';
import MockPaymentGateway from '@/components/payment/MockPaymentGateway'; // kept as fallback
import PaymentGatewaySelection from '@/components/payment/PaymentGatewaySelection';

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

const FeesPageFixed = () => {
  const { studentProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptTransaction, setReceiptTransaction] = useState<any>(null);
  const [receiptFee, setReceiptFee] = useState<FeeRecord | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [semesterLabel, setSemesterLabel] = useState<string>('N/A');

  // Fetch semester label from database
  useEffect(() => {
    const fetchSemesterLabel = async () => {
      if (studentProfile?.current_semester_id) {
        try {
          const { data } = await supabase
            .from('semesters')
            .select('label')
            .eq('id', studentProfile.current_semester_id)
            .single();
          setSemesterLabel(data?.label || 'N/A');
        } catch (error) {
          console.error('Error fetching semester label:', error);
          setSemesterLabel('N/A');
        }
      } else {
        setSemesterLabel('N/A');
      }
    };

    fetchSemesterLabel();
  }, [studentProfile?.current_semester_id]);

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
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async (details: { id: string; method: string }) => {
    if (!selectedFee) return;

    // Simulate backend update
    toast.success(`Payment successful! Transaction ID: ${details.id}`);
    setShowPaymentDialog(false);
    
    // Auto-open receipt
    const mockTransaction = {
      id: details.id,
      amount: selectedFee.amount,
      created_at: new Date().toISOString(),
      utr_number: details.id,
      status: 'approved',
      fee_category: selectedFee.fee_type
    };
    setReceiptTransaction(mockTransaction);
    
    // Auto populate receipt fee with paid status
    setReceiptFee({...selectedFee, status: 'paid'});
    setShowReceipt(true);
    
    setSelectedFee(null);
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    toast.error('Payment cancelled');
  };

  const handleDownloadAllReceipts = async () => {
    setIsDownloadingAll(true);
    try {
      // Get all paid fees from mock data
      const paidFees = mockFees.filter(fee => fee.status === 'paid');
      
      if (paidFees.length === 0) {
        toast.error('No paid receipts available for download');
        return;
      }

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add each receipt as a separate page
      for (let i = 0; i < paidFees.length; i++) {
        const fee = paidFees[i];
        const correspondingTransaction = mockTransactions.find(t => t.fee_type === fee.fee_type);
        
        // Create a temporary receipt element for each receipt
        const receiptElement = document.createElement('div');
        receiptElement.style.position = 'absolute';
        receiptElement.style.left = '-9999px';
        receiptElement.style.backgroundColor = 'white';
        receiptElement.style.color = 'black';
        receiptElement.style.padding = '20px';
        receiptElement.style.width = '210mm'; // A4 width
        receiptElement.innerHTML = `
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">P.B. COLLEGE OF ENGINEERING</h1>
            <p style="font-size: 14px; margin-bottom: 5px;">Irungattukottai, Sriperumbudur (Tk), Kancheepuram (Dt),</p>
            <p style="font-size: 14px; margin-bottom: 5px;">Tamilnadu - 602 117.</p>
            <p style="font-size: 14px;">Phone: 99400 26861</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Receipt No.:</strong> RCP-${fee.id.padStart(6, '0')}</p>
            <p><strong>Date:</strong> ${fee.payment_date || new Date().toLocaleDateString('en-GB')}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 10px;">Student Details</h3>
            <p><strong>Name:</strong> ${studentProfile?.full_name || 'Student Name'}</p>
            <p><strong>Roll No:</strong> ${studentProfile?.roll_number || 'N/A'}</p>
            <p><strong>Branch:</strong> Information Technology</p>
            <p><strong>Semester:</strong> ${semesterLabel}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="font-weight: bold; margin-bottom: 10px;">Particulars and Amount</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Particulars</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${fee.fee_type}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${fee.amount.toLocaleString()}</td>
                </tr>
                <tr style="background-color: #f5f5f5; font-weight: bold;">
                  <td style="border: 1px solid #ddd; padding: 8px;">Total</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${fee.amount.toLocaleString()}/-</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
            <p><strong>Amount in words:</strong> ${fee.amount} Rupees only.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Payment Method:</strong> Online</p>
            <p><strong>Transaction ID:</strong> ${correspondingTransaction?.transaction_id || fee.transaction_id || 'N/A'}</p>
          </div>
          
          <div style="text-align: right; margin-top: 40px;">
            <div style="border-top: 2px solid #333; padding-top: 10px; width: 200px; margin-left: auto;">
              <p style="font-size: 14px; font-weight: bold;">Authorized Signatory</p>
              <p style="font-size: 18px; font-weight: bold; margin-top: 5px;">N.R.</p>
            </div>
          </div>
        `;

        // Add to body temporarily
        document.body.appendChild(receiptElement);

        // Convert to canvas and add to PDF
        const canvas = await html2canvas(receiptElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        
        // Add new page for each receipt except the first one
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add image to PDF
        const imgWidth = 190; // A4 width with margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

        // Remove temporary element
        document.body.removeChild(receiptElement);
      }

      // Download the PDF
      pdf.save(`all-receipts-${studentProfile?.roll_number || 'student'}-${Date.now()}.pdf`);
      toast.success(`Successfully downloaded ${paidFees.length} receipts`);
      
    } catch (error) {
      console.error('Error downloading receipts:', error);
      toast.error('Failed to download receipts. Please try again.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <StudentLayoutWithSearch title="Fees">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Fees</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">Rs. {stats.totalFees.toLocaleString()}</div>
                <div className="text-sm text-blue-600">This semester</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-white" />
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
              onClick={() => {
                const dueFeestoBePaid = mockFees.filter(f => f.status !== 'paid');
                if (dueFeestoBePaid.length === 0) {
                  toast.success('All fees are already paid!');
                  return;
                }
                setSelectedFee(dueFeestoBePaid[0]);
                setShowPaymentDialog(true);
              }}
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
            {filteredFees.map((fee) => {
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
                          <IndianRupee className="w-4 h-4" />
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
                      {fee.status === 'paid' && (
                        <Button 
                          variant="outline"
                          className="px-4 py-2 rounded-xl"
                          onClick={() => {
                            // Create a mock transaction object for the receipt
                            const mockTransaction = {
                              id: fee.transaction_id,
                              amount: fee.amount,
                              created_at: fee.payment_date,
                              utr_number: fee.transaction_id,
                              status: 'approved',
                              fee_category: fee.fee_type
                            };
                            setReceiptTransaction(mockTransaction);
                            setReceiptFee(fee);
                            setShowReceipt(true);
                          }}
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
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
                  <div className="text-right space-y-2">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">Rs. {transaction.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{transaction.method}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3 py-1 rounded-lg"
                      onClick={() => {
                        // Create a mock transaction object for the receipt
                        const mockTransaction = {
                          id: transaction.transaction_id,
                          amount: transaction.amount,
                          created_at: transaction.date,
                          utr_number: transaction.transaction_id,
                          status: 'approved',
                          fee_category: transaction.fee_type
                        };
                        setReceiptTransaction(mockTransaction);
                        // Find the corresponding fee
                        const correspondingFee = mockFees.find(f => f.fee_type === transaction.fee_type);
                        setReceiptFee(correspondingFee || null);
                        setShowReceipt(true);
                      }}
                    >
                      <Receipt className="w-3 h-3 mr-1" />
                      Receipt
                    </Button>
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
                <Button 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  onClick={handleDownloadAllReceipts}
                  disabled={isDownloadingAll}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloadingAll ? 'Downloading...' : 'Download All Receipts'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        <PaymentGatewaySelection
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          amount={selectedFee ? Number(selectedFee.amount) : 0}
          description={selectedFee?.fee_type || 'Fee Payment'}
          studentName={studentProfile?.full_name}
          studentId={studentProfile?.id}
          feeId={selectedFee?.id}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />

        {/* Receipt Component */}
        <ReceiptComponent
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            setReceiptTransaction(null);
            setReceiptFee(null);
          }}
          transaction={receiptTransaction}
          fee={receiptFee}
        />

        {/* AI Assistant */}
        <div className="mt-6">
          <FeesAIAssistant 
            studentData={studentProfile}
            feeData={{
              totalFees: stats.totalFees,
              paidFees: stats.paidFees,
              pendingFees: stats.pendingFees,
              overdueFees: stats.overdueFees
            }}
          />
        </div>
      </div>
    </StudentLayoutWithSearch>
  );
};

export default FeesPageFixed;
