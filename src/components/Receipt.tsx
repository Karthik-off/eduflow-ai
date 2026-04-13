import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Share2, X, Receipt, Building, Phone, Calendar, User, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptData {
  receiptNo: string;
  date: string;
  studentName: string;
  rollNumber: string;
  branch: string;
  semester: string;
  particulars: Array<{
    item: string;
    amount: number;
  }>;
  totalAmount: number;
  totalAmountWords: string;
  paymentMethod: string;
  transactionId: string;
  authorizedSignatory: string;
}

interface ReceiptComponentProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
  fee?: any;
}

const ReceiptComponent = ({ isOpen, onClose, transaction, fee }: ReceiptComponentProps) => {
  const { studentProfile } = useAuthStore();
  const { isDarkMode } = useDarkMode();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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

  // Generate receipt data based on transaction and student profile
  const generateReceiptData = (): ReceiptData => {
    const receiptNo = transaction?.reference_id || transaction?.transaction_id || `RCP-${Date.now().toString().slice(-6)}`;
    const date = transaction?.created_at || transaction?.date || new Date().toISOString();
    const totalAmount = transaction?.amount || fee?.amount || 0;
    
    
    return {
      receiptNo,
      date,
      studentName: studentProfile?.full_name || 'Student Name',
      rollNumber: studentProfile?.roll_number || 'N/A',
      branch: 'Information Technology', // Full branch name
      semester: semesterLabel,
      particulars: [
        { item: fee?.fee_type || fee?.category || 'TUTION FEES', amount: totalAmount },
        { item: 'TRANSPORT FEES', amount: 0 },
        { item: 'HOSTEL FEES', amount: 0 },
        { item: 'OTHERS FEES', amount: 0 }
      ],
      totalAmount,
      totalAmountWords: convertNumberToWords(totalAmount),
      paymentMethod: 'Online',
      transactionId: transaction?.utr_number || transaction?.transaction_id || transaction?.id || 'N/A',
      authorizedSignatory: 'N.R.'
    };
  };

  const convertNumberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    const convert = (n: number): string => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };
    
    return convert(num) + ' Rupees only.';
  };

  const receiptData = generateReceiptData();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const receiptElement = document.getElementById('receipt-content');
      if (!receiptElement) {
        throw new Error('Receipt content not found');
      }

      // Create canvas from receipt content
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        logging: false
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add image to PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`receipt-${receiptData.receiptNo}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback: open print dialog
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fee Receipt - ${receiptData.receiptNo}`,
          text: `Fee payment receipt for ${receiptData.studentName}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Fee Receipt
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Content */}
        <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} id="receipt-content">
          {/* College Header */}
          <div className={`text-center space-y-2 border-b-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-800'} pb-4`}>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>P.B. COLLEGE OF ENGINEERING</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Irungattukottai, Sriperumbudur (Tk), Kancheepuram (Dt),<br />
              Tamilnadu - 602 117.
            </p>
            <div className={`flex justify-center gap-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                99400 26861
              </span>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Receipt No.:</span> {receiptData.receiptNo}
            </div>
            <div>
              <span className="font-semibold">Date:</span> {format(new Date(receiptData.date), 'dd/MM/yyyy')}
            </div>
          </div>

          {/* Student Details */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4 space-y-2`}>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Student Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Name:</span> {receiptData.studentName}
              </div>
              <div>
                <span className="font-medium">Roll No:</span> {receiptData.rollNumber}
              </div>
              <div>
                <span className="font-medium">Branch:</span> {receiptData.branch}
              </div>
              <div>
                <span className="font-medium">Semester:</span> {receiptData.semester}
              </div>
            </div>
          </div>

          {/* Fee Particulars */}
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Particulars and Amount</h3>
            <div className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg overflow-hidden`}>
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`px-4 py-2 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Particulars</th>
                    <th className={`px-4 py-2 text-right text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.particulars.map((particular, index) => (
                    <tr key={index} className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <td className="px-4 py-2 text-sm">{particular.item}</td>
                      <td className="px-4 py-2 text-sm text-right">
                        {particular.amount > 0 ? particular.amount.toLocaleString() : ''}
                      </td>
                    </tr>
                  ))}
                  <tr className={`border-t-2 ${isDarkMode ? 'border-gray-500' : 'border-gray-400'} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <td className="px-4 py-2 text-sm font-bold">Total</td>
                    <td className="px-4 py-2 text-sm text-right font-bold">
                      {receiptData.totalAmount.toLocaleString()}/-
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in Words */}
          <div className={`${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
            <p className="text-sm">
              <span className="font-semibold">Amount in words:</span> {receiptData.totalAmountWords}
            </p>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Payment Method:</span> {receiptData.paymentMethod}
            </div>
            <div>
              <span className="font-semibold">Transaction ID:</span> {receiptData.transactionId}
            </div>
          </div>

          {/* Authorized Signatory */}
          <div className="flex justify-end">
            <div className="text-center">
              <div className={`border-t-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-400'} pt-2 mt-8`}>
                <p className="text-sm font-semibold">Authorized Signatory</p>
                <p className="text-lg font-bold mt-1">{receiptData.authorizedSignatory}</p>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <div className={`text-8xl font-bold ${isDarkMode ? 'text-gray-600' : 'text-gray-800'} transform rotate-45`}>PAID</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptComponent;
