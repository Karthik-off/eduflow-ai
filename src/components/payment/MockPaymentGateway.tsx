import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Smartphone, Building, CreditCard, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface MockPaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  studentName: string | undefined;
  onSuccess: (transactionDetails: { id: string; method: string }) => void;
  onCancel: () => void;
}

const UPI_APPS = [
  { name: 'Google Pay', id: 'gpay', color: 'bg-white', text: 'text-gray-800', logo: 'GPay' },
  { name: 'PhonePe', id: 'phonepe', color: 'bg-purple-600', text: 'text-white', logo: 'PhonePe' },
  { name: 'Paytm', id: 'paytm', color: 'bg-sky-500', text: 'text-white', logo: 'Paytm' },
  { name: 'BHIM UPI', id: 'bhim', color: 'bg-orange-500', text: 'text-white', logo: 'BHIM' },
];

const MockPaymentGateway: React.FC<MockPaymentGatewayProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  studentName,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<'method' | 'upi_apps' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStep('method');
      setSelectedMethod('');
    }
  }, [isOpen]);

  const handleSelectUpiApp = (appId: string) => {
    setSelectedMethod(appId);
    setStep('processing');
    
    // Construct UPI URI and Intent
    let intentUrl = '';
    const upiLink = `pa=institution@upi&pn=EduFlow%20Institution&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}`;
    
    switch (appId) {
      case 'gpay':
        intentUrl = `intent://pay?${upiLink}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
        break;
      case 'phonepe':
        intentUrl = `intent://pay?${upiLink}#Intent;scheme=upi;package=com.phonepe.app;end`;
        break;
      case 'paytm':
        intentUrl = `intent://pay?${upiLink}#Intent;scheme=upi;package=net.one97.paytm;end`;
        break;
      case 'bhim':
        intentUrl = `intent://pay?${upiLink}#Intent;scheme=upi;package=in.org.npci.upiapp;end`;
        break;
      default:
        intentUrl = `upi://pay?${upiLink}`;
    }

    // Trigger the intent to attempt to open the app (works on mobile devices)
    window.location.href = intentUrl;

    // Simulate API call and payment processing delay
    setTimeout(() => {
      setStep('success');
      
      // Notify parent after success animation
      setTimeout(() => {
        onSuccess({
          id: `TXN${Math.random().toString().slice(2, 12)}`,
          method: 'UPI',
        });
      }, 1500);
    }, 2500);
  };

  const handleCardPayment = () => {
    setSelectedMethod('card');
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess({
          id: `TXN${Math.random().toString().slice(2, 12)}`,
          method: 'CARD',
        });
      }, 1500);
    }, 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && step !== 'processing' && step !== 'success') {
        onCancel();
        onClose();
      }
    }}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border-0 shadow-2xl">
        {/* Header */}
        <div className="bg-primary p-5 text-primary-foreground flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              Secure Checkout
            </h2>
            <p className="text-blue-100 text-sm mt-1">{description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">Amount to Pay</p>
            <p className="text-2xl font-bold">₹{amount.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-5 min-h-[300px] flex flex-col transition-all duration-300">
          {step === 'method' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Paying to</p>
                <p className="font-semibold text-gray-900">EduFlow Institution</p>
              </div>
              
              <p className="text-sm font-medium text-gray-700 mb-2">Select Payment Method</p>
              
              <button
                onClick={() => setStep('upi_apps')}
                className="w-full flex items-center p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">UPI</p>
                  <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
                </div>
              </button>

              <button
                onClick={handleCardPayment}
                className="w-full flex items-center p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Credit / Debit Card</p>
                  <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                </div>
              </button>
              
              <button
                onClick={() => {}}
                className="w-full flex items-center p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left opacity-60 group cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-4">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Netbanking</p>
                  <p className="text-xs text-gray-500">Available for select banks</p>
                </div>
              </button>
            </div>
          )}

          {step === 'upi_apps' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center mb-4">
                <button onClick={() => setStep('method')} className="text-blue-600 text-sm font-medium hover:underline mr-4">
                  &larr; Back
                </button>
                <p className="text-sm font-medium text-gray-700">Choose UPI App</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {UPI_APPS.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleSelectUpiApp(app.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all ${app.color} ${app.text} shadow-sm active:scale-95`}
                  >
                    <span className="font-bold text-lg">{app.logo}</span>
                    {app.id === 'gpay' && <span className="text-[10px] text-gray-500 font-medium mt-1">Google Pay</span>}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-4 rounded-lg bg-gray-50 mt-auto border border-gray-100">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  You will be redirected to the UPI app to complete this payment. Please do not press back or refresh the page.
                </p>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 animate-in fade-in">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment...</h3>
              <p className="text-sm text-gray-500 text-center px-6">
                Awaiting confirmation from your bank. This might take a few seconds.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-sm text-gray-500">Redirecting to receipt...</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-3 text-center border-t border-gray-100 flex justify-center items-center gap-4 text-[10px] text-gray-400 font-medium">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 256-bit Secure</span>
          <span>•</span>
          <span>PCI DSS Compliant</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MockPaymentGateway;
