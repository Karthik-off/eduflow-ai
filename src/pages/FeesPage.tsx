import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import UnifiedLayout from '@/components/layouts/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, CreditCard, IndianRupee, Clock, CheckCircle2, XCircle, Loader2, Smartphone, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import BackToHomeButton from '@/components/BackToHomeButton';
import ReceiptComponent from '@/components/Receipt';

interface Fee {
  id: string;
  category: string;
  amount: number;
  is_paid: boolean;
  due_date: string | null;
  description: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  utr_number: string | null;
  reference_id: string | null;
  created_at: string;
  fee_id: string;
  fee_category?: string;
}

const UPI_APPS = [
  { name: 'Google Pay', id: 'gpay', package: 'com.google.android.apps.nbu.paisa.user', color: 'from-blue-500 to-blue-600', icon: '💳' },
  { name: 'PhonePe', id: 'phonepe', package: 'com.phonepe.app', color: 'from-purple-500 to-purple-600', icon: '📱' },
  { name: 'Paytm', id: 'paytm', package: 'net.one97.paytm', color: 'from-sky-400 to-sky-500', icon: '💰' },
];

// Replace with your institution's UPI details
const RECEIVER_UPI_ID = 'institution@upi';
const RECEIVER_NAME = 'College Fee Account';

const FeesPage = () => {
  const { studentProfile } = useAuthStore();
  const navigate = useNavigate();
  const [fees, setFees] = useState<Fee[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showUtrDialog, setShowUtrDialog] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const [receiptFee, setReceiptFee] = useState<Fee | null>(null);

  useEffect(() => {
    if (studentProfile?.id) fetchData();
  }, [studentProfile?.id]);

  const fetchData = async () => {
    const studentId = studentProfile!.id;
    const [feesRes, txnRes] = await Promise.all([
      supabase.from('fees').select('*').eq('student_id', studentId).order('due_date', { ascending: true }),
      supabase.from('transactions').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
    ]);

    const feesData = (feesRes.data ?? []) as Fee[];
    const txnData = (txnRes.data ?? []) as Transaction[];

    // Map fee category to transactions, handle quick payments
    const feeMap = new Map(feesData.map(f => [f.id, f.category]));
    const enrichedTxns = txnData.map(t => ({
      ...t,
      fee_category: t.fee_id === '00000000-0000-0000-0000-000000000000' 
        ? 'Quick Payment' 
        : feeMap.get(t.fee_id) ?? 'Unknown'
    }));

    setFees(feesData);
    setTransactions(enrichedTxns);
    setLoading(false);
  };

  const handlePayViaUPI = (app: typeof UPI_APPS[0]) => {
    if (!selectedFee) return;
    const amount = selectedFee.amount;
    const note = `Fee Payment - ${selectedFee.category}`;
    const upiUrl = `upi://pay?pa=${RECEIVER_UPI_ID}&pn=${encodeURIComponent(RECEIVER_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    // Try to open UPI app
    window.location.href = upiUrl;

    // After a brief delay, show UTR entry dialog
    setTimeout(() => {
      setShowPayDialog(false);
      setShowUtrDialog(true);
    }, 1500);
  };

  const handleSubmitUtr = async () => {
    if (!utrInput.trim() || !selectedFee || !studentProfile?.id) {
      toast.error('Please enter a valid UTR number');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('transactions').insert({
        student_id: studentProfile.id,
        fee_id: selectedFee.id,
        amount: selectedFee.amount,
        utr_number: utrInput.trim(),
        reference_id: `TXN-${Date.now()}`,
        status: 'pending',
      }).select().single();

      if (error) throw error;

      toast.success('Transaction submitted! Awaiting verification.');
      setShowUtrDialog(false);
      setUtrInput('');
      setSelectedFee(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const unpaidFees = fees.filter(f => !f.is_paid);
  const paidFees = fees.filter(f => f.is_paid);

  return (
    <UnifiedLayout userRole="student" title="Fees & Payments">
      {/* Header with Home Button */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
          <BackToHomeButton variant="navbar" />
          <h1 className="text-base font-bold font-display text-foreground">Fees & Payments</h1>
        </div>
      </header>
      
      <div className="space-y-4">
        {/* Summary Card */}
        <Card className="shadow-card border-0 overflow-hidden">
          <div className="gradient-primary p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/70 text-xs uppercase tracking-wider">Total Pending</p>
                <p className="text-2xl font-bold text-primary-foreground mt-1">
                  ₹{unpaidFees.reduce((s, f) => s + Number(f.amount), 0).toLocaleString()}
                </p>
              </div>
              <IndianRupee className="w-10 h-10 text-primary-foreground/30" />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="pending" className="flex-1">Pending ({unpaidFees.length})</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Transactions ({transactions.length})</TabsTrigger>
            <TabsTrigger value="paid" className="flex-1">Paid ({paidFees.length})</TabsTrigger>
          </TabsList>

          {/* Pending Fees */}
          <TabsContent value="pending" className="space-y-3 mt-3">
            {unpaidFees.length === 0 ? (
              <Card className="border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All fees are paid! 🎉</p>
                </CardContent>
              </Card>
            ) : (
              unpaidFees.map(fee => (
                <Card key={fee.id} className="border-0 shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">{fee.category}</p>
                        {fee.description && <p className="text-xs text-muted-foreground mt-0.5">{fee.description}</p>}
                        {fee.due_date && (
                          <p className="text-xs text-warning mt-1">Due: {format(new Date(fee.due_date), 'MMM dd, yyyy')}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">₹{Number(fee.amount).toLocaleString()}</p>
                        <Button
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={() => { setSelectedFee(fee); setShowPayDialog(true); }}
                        >
                          <Smartphone className="w-3.5 h-3.5 mr-1" />
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Transaction History */}
          <TabsContent value="history" className="space-y-3 mt-3">
            {transactions.length === 0 ? (
              <Card className="border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                </CardContent>
              </Card>
            ) : (
              transactions.map(txn => (
                <Card
                  key={txn.id}
                  className="border-0 shadow-card hover:bg-secondary/30 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1" onClick={() => setSelectedTransaction(txn)}>
                        <p className="font-semibold text-sm text-foreground">{txn.fee_category}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">UTR: {txn.utr_number ?? 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(txn.created_at), 'MMM dd, yyyy · hh:mm a')}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-foreground">₹{Number(txn.amount).toLocaleString()}</p>
                        {getStatusBadge(txn.status)}
                        {txn.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReceiptTransaction(txn);
                              setReceiptFee(fees.find(f => f.id === txn.fee_id) || null);
                              setShowReceipt(true);
                            }}
                          >
                            <Receipt className="w-3 h-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Paid Fees */}
          <TabsContent value="paid" className="space-y-3 mt-3">
            {paidFees.length === 0 ? (
              <Card className="border-0 shadow-card">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No paid fees yet</p>
                </CardContent>
              </Card>
            ) : (
              paidFees.map(fee => (
                <Card key={fee.id} className="border-0 shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{fee.category}</p>
                        {fee.description && <p className="text-xs text-muted-foreground">{fee.description}</p>}
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-green-600">₹{Number(fee.amount).toLocaleString()}</p>
                        <Badge className="bg-green-500/10 text-green-600 border-green-200 text-xs">Paid</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            // Find the corresponding transaction for this fee
                            const correspondingTxn = transactions.find(t => t.fee_id === fee.id && t.status === 'approved');
                            if (correspondingTxn) {
                              setReceiptTransaction(correspondingTxn);
                              setReceiptFee(fee);
                              setShowReceipt(true);
                            }
                          }}
                        >
                          <Receipt className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

      {/* UPI Payment App Selection Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Pay ₹{selectedFee ? Number(selectedFee.amount).toLocaleString() : ''}</DialogTitle>
            <p className="text-xs text-muted-foreground text-center">{selectedFee?.category}</p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground text-center">Choose your UPI app</p>
            {UPI_APPS.map(app => (
              <button
                key={app.id}
                onClick={() => handlePayViaUPI(app)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r ${app.color} text-white font-medium text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]`}
              >
                <span className="text-xl">{app.icon}</span>
                <span>Pay with {app.name}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            You will be redirected to the UPI app. After payment, enter your UTR number for verification.
          </p>
        </DialogContent>
      </Dialog>

      {/* UTR Entry Dialog */}
      <Dialog open={showUtrDialog} onOpenChange={setShowUtrDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter UTR Number</DialogTitle>
            <p className="text-xs text-muted-foreground">
              After completing payment in your UPI app, enter the 12-digit UTR/Reference number from the payment confirmation.
            </p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="e.g. 312345678901"
              value={utrInput}
              onChange={e => setUtrInput(e.target.value)}
              maxLength={22}
              className="text-center text-lg tracking-wider font-mono"
            />
            <p className="text-[10px] text-muted-foreground text-center">
              Amount: ₹{selectedFee ? Number(selectedFee.amount).toLocaleString() : ''} • {selectedFee?.category}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUtrDialog(false); setUtrInput(''); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUtr} disabled={submitting || !utrInput.trim()}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Report Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Transaction Report
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-3 py-2">
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Transaction ID</span>
                  <span className="text-xs font-mono font-medium text-foreground">{selectedTransaction.reference_id ?? selectedTransaction.id.slice(0, 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">UTR Number</span>
                  <span className="text-xs font-mono font-medium text-foreground">{selectedTransaction.utr_number ?? 'N/A'}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-xs text-muted-foreground">Sender</span>
                  <span className="text-xs font-medium text-foreground">{studentProfile?.full_name ?? 'Student'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Sender Account</span>
                  <span className="text-xs font-medium text-foreground">{studentProfile?.roll_number ?? 'N/A'}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-xs text-muted-foreground">Receiver</span>
                  <span className="text-xs font-medium text-foreground">{RECEIVER_NAME}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Receiver UPI</span>
                  <span className="text-xs font-medium text-foreground">{RECEIVER_UPI_ID}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="text-sm font-bold text-foreground">₹{Number(selectedTransaction.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Fee Category</span>
                  <span className="text-xs font-medium text-foreground">{selectedTransaction.fee_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Date & Time</span>
                  <span className="text-xs font-medium text-foreground">{format(new Date(selectedTransaction.created_at), 'MMM dd, yyyy • hh:mm a')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Status</span>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      </div>

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
    </UnifiedLayout>
  );
};

export default FeesPage;
