// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowLeft,
  Smartphone,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
interface PaymentGatewaySelectionProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  studentName?: string;
  studentId?: string;
  feeId?: string;
  onSuccess: (details: { id: string; method: string }) => void;
  onCancel: () => void;
}

type Step =
  | 'select'
  | 'select-upi'
  | 'gpay-processing'
  | 'upi-processing'
  | 'upi-verify'
  | 'paytm-processing'
  | 'success'
  | 'failed';

type UpiApp = 'gpay' | 'phonepe' | 'paytm-upi' | 'bhim' | 'other';

declare global {
  interface Window {
    google?: { payments: { api: { PaymentsClient: any } } };
  }
}

// ─── Google Pay Config ────────────────────────────────────────────
const GPAY_ENV = (import.meta.env.VITE_GPAY_ENVIRONMENT || 'TEST') as 'TEST' | 'PRODUCTION';
const GPAY_MERCHANT_ID = import.meta.env.VITE_GPAY_MERCHANT_ID || 'BCR2DN4TZF5LKESK';
const GPAY_GATEWAY = import.meta.env.VITE_GPAY_GATEWAY_NAME || 'stripe';
const SERVER_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const baseRequest = { apiVersion: 2, apiVersionMinor: 0 };

const allowedPaymentMethods = [
  {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['MASTERCARD', 'VISA', 'RUPAY'],
    },
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: GPAY_ENV === 'TEST' ? 'example' : GPAY_GATEWAY,
        gatewayMerchantId: GPAY_MERCHANT_ID,
      },
    },
  },
];

// UPI App definitions
const UPI_APPS: { id: UpiApp; label: string; subtitle: string; colors: string; letter: string }[] = [
  {
    id: 'gpay',
    label: 'Google Pay',
    subtitle: 'Pay via Google Pay UPI',
    colors: 'from-blue-500 to-green-400',
    letter: 'G',
  },
  {
    id: 'phonepe',
    label: 'PhonePe',
    subtitle: 'Pay via PhonePe UPI',
    colors: 'from-indigo-600 to-purple-700',
    letter: 'P',
  },
  {
    id: 'paytm-upi',
    label: 'Paytm UPI',
    subtitle: 'Pay via Paytm UPI',
    colors: 'from-sky-500 to-blue-700',
    letter: 'P',
  },
  {
    id: 'bhim',
    label: 'BHIM UPI',
    subtitle: 'Any UPI app via BHIM',
    colors: 'from-orange-500 to-red-600',
    letter: 'B',
  },
  {
    id: 'other',
    label: 'Other UPI App',
    subtitle: 'Pay via any UPI App',
    colors: 'from-gray-500 to-gray-700',
    letter: '⋯',
  },
];

// ─── Component ───────────────────────────────────────────────────
const PaymentGatewaySelection = ({
  isOpen,
  onClose,
  amount,
  description,
  studentName,
  studentId,
  feeId,
  onSuccess,
  onCancel,
}: PaymentGatewaySelectionProps) => {
  const [step, setStep] = useState<Step>('select');
  const [transactionId, setTransactionId] = useState('');
  const [gpayReady, setGpayReady] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiApp | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const paymentsClientRef = useRef<any>(null);

  // ── Load Google Pay SDK ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (window.google?.payments) {
      initGPayClient();
      return;
    }
    const existing = document.querySelector('script[src*="pay.google.com"]');
    if (existing) {
      // Script already injected, wait for load
      (existing as HTMLScriptElement).addEventListener('load', initGPayClient);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = initGPayClient;
    document.head.appendChild(script);
  }, [isOpen]);

  function initGPayClient() {
    try {
      const client = new window.google.payments.api.PaymentsClient({
        environment: GPAY_ENV,
        paymentDataCallbacks: {
          onPaymentAuthorized: () => ({ transactionState: 'SUCCESS' }),
        },
      });
      paymentsClientRef.current = client;
      client
        .isReadyToPay({ ...baseRequest, allowedPaymentMethods })
        .then((resp: { result: boolean }) => {
          setGpayReady(resp.result);
        })
        .catch(() => setGpayReady(false));
    } catch {
      setGpayReady(false);
    }
  }

  // ── Reset when dialog opens ──────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setTransactionId('');
      setSelectedUpiApp(null);
      setUtrInput('');
    }
  }, [isOpen]);

  // ── Google Pay Flow (native SDK) ─────────────────────────────
  const handleGooglePayNative = async () => {
    setStep('gpay-processing');
    try {
      const client = paymentsClientRef.current;
      if (!client) throw new Error('Google Pay not ready');

      const paymentDataRequest = {
        ...baseRequest,
        allowedPaymentMethods,
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: amount.toFixed(2),
          currencyCode: 'INR',
          countryCode: 'IN',
        },
        merchantInfo: {
          merchantName: import.meta.env.VITE_GPAY_MERCHANT_NAME || 'EduFlow',
          merchantId: GPAY_MERCHANT_ID,
        },
      };

      const paymentData = await client.loadPaymentData(paymentDataRequest);
      const token = paymentData?.paymentMethodData?.tokenizationData?.token;

      const resp = await fetch(`${SERVER_BASE}/api/payment/process-gpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, amount, feeId, studentId }),
      });

      const result = await resp.json();
      if (!result.success) throw new Error(result.error || 'GPay charge failed');

      setTransactionId(result.transactionId);
      setStep('success');
      onSuccess({ id: result.transactionId, method: 'Google Pay' });
    } catch (err: any) {
      if (err?.statusCode === 'CANCELED') {
        setStep('select-upi');
        toast.info('Google Pay cancelled — please choose another method');
      } else {
        console.error('[GPay]', err);
        // In TEST env or when SDK not ready, fall back to intent flow
        triggerUpiPayment('gpay');
      }
    }
  };

  // ── UPI Intent Flow (Trigger Device App) ─────────
  const triggerUpiPayment = (app: UpiApp) => {
    setStep('upi-processing');
    setSelectedUpiApp(app);

    const pa = import.meta.env.VITE_UPI_ID || 'merchant@upi';
    const pn = import.meta.env.VITE_GPAY_MERCHANT_NAME || 'EduFlow';
    const tr = `EDUF-${Date.now()}`;
    const am = amount.toFixed(2);
    
    // Construct UPI intent URL parameters
    const upiParams = `pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&tr=${tr}&am=${am}&cu=INR`;
    
    let deepLink = `upi://pay?${upiParams}`;
    if (app === 'gpay') {
      deepLink = `gpay://upi/pay?${upiParams}`;
    } else if (app === 'phonepe') {
      deepLink = `phonepe://pay?${upiParams}`;
    } else if (app === 'paytm-upi') {
      deepLink = `paytmmp://pay?${upiParams}`;
    } else if (app === 'bhim') {
      deepLink = `bhim://pay?${upiParams}`;
    }

    // Trigger the intent application to open on the device
    window.location.href = deepLink;

    // After triggering, switch to the verification step so the student can enter their UTR
    setTimeout(() => {
      setStep('upi-verify');
    }, 1500);
  };

  // ── Handle UPI app selection ─────────────────────────────────
  const handleUpiAppSelect = (app: UpiApp) => {
    triggerUpiPayment(app);
  };

  // ── Paytm Flow ───────────────────────────────────────────────
  const handlePaytm = async () => {
    setStep('paytm-processing');
    try {
      const resp = await fetch(`${SERVER_BASE}/api/payment/initiate-paytm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          feeId,
          customerId: studentId || 'guest_user',
        }),
      });
      const result = await resp.json();

      if (!result.success)
        throw new Error(result.error || 'Failed to initiate Paytm');

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = result.checkoutUrl;

      const fields: Record<string, string> = {
        mid: result.mid,
        orderId: result.orderId,
        txnToken: result.txnToken,
      };
      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error('[Paytm]', err);
      toast.error(err.message || 'Failed to start Paytm');
      setStep('select');
    }
  };

  // ── Handle return from Paytm (URL params) ────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('orderId');
    if (paymentStatus === 'success' && orderId) {
      setTransactionId(orderId);
      setStep('success');
      onSuccess({ id: orderId, method: 'Paytm' });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'failed') {
      setStep('failed');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isOpen]);

  const amountDisplay = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);

  const processingLabel =
    step === 'gpay-processing'
      ? 'Opening Google Pay…'
      : step === 'paytm-processing'
      ? 'Connecting to Paytm…'
      : `Processing ${UPI_APPS.find((u) => u.id === selectedUpiApp)?.label || 'UPI'} Payment…`;

  const processingSubLabel =
    step === 'gpay-processing'
      ? 'Complete the payment in the Google Pay popup'
      : step === 'paytm-processing'
      ? 'You will be redirected to Paytm to complete payment'
      : 'Please wait while we confirm your payment…';

  // ─── UI Rendering ─────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); onCancel(); } }}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Secure Payment
            </DialogTitle>
          </DialogHeader>
          <div className="mt-3">
            <p className="text-white/80 text-sm">{description}</p>
            <p className="text-3xl font-extrabold mt-1 tracking-tight">{amountDisplay}</p>
            {studentName && (
              <p className="text-white/70 text-xs mt-1">Paying as: {studentName}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* ── STEP: SELECT (main) ──────────────────────────── */}
          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4 text-center">
                Choose your payment method
              </p>

              {/* UPI Option */}
              <button
                id="upi-option-button"
                onClick={() => setStep('select-upi')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 
                          border-gray-200 dark:border-gray-700 hover:border-indigo-400 
                          dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-200
                          group bg-white dark:bg-gray-800 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 
                               flex items-center justify-center shadow-md">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 
                                dark:group-hover:text-indigo-400 transition-colors">UPI Payment</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    GPay, PhonePe, Paytm UPI, BHIM & more
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              </button>

              {/* Paytm (full checkout) */}
              <button
                id="paytm-button"
                onClick={handlePaytm}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 
                          border-gray-200 dark:border-gray-700 hover:border-blue-400 
                          dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200
                          group bg-white dark:bg-gray-800 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 
                               flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-sm tracking-tight">PTM</span>
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 
                                dark:group-hover:text-blue-400 transition-colors">Paytm</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cards, Net Banking & Paytm Wallet
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              </button>

              {/* Credit / Debit Card */}
              <button
                id="card-button"
                onClick={handlePaytm}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 
                          border-gray-200 dark:border-gray-700 hover:border-purple-400 
                          dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200
                          group bg-white dark:bg-gray-800 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 
                               flex items-center justify-center shadow-md">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 
                                dark:group-hover:text-purple-400 transition-colors">Debit / Credit Card</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Visa, Mastercard, RuPay
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
              </button>

              {/* PCI Notice */}
              <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400">
                  256-bit SSL encrypted · PCI DSS compliant · Your card details are never stored
                </p>
              </div>

              <Button
                variant="ghost"
                className="w-full mt-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => { onClose(); onCancel(); }}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* ── STEP: SELECT UPI APP ──────────────────────────── */}
          {step === 'select-upi' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('select')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-3 text-center">
                Select your UPI App
              </p>

              {UPI_APPS.map((app) => (
                <button
                  key={app.id}
                  id={`upi-${app.id}-button`}
                  onClick={() => handleUpiAppSelect(app.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 
                            border-gray-200 dark:border-gray-700 hover:border-indigo-400 
                            dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-200
                            group bg-white dark:bg-gray-800 text-left"
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.colors} 
                                flex items-center justify-center text-white font-black text-base shadow-md`}
                  >
                    {app.letter}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 
                                  dark:group-hover:text-indigo-400 transition-colors text-sm">
                      {app.label}
                      {app.id === 'gpay' && gpayReady && (
                        <span className="ml-2 text-xs font-normal text-green-500">✓ Ready</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{app.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                </button>
              ))}

              <Button
                variant="ghost"
                className="w-full mt-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => { onClose(); onCancel(); }}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* ── STEP: PROCESSING ─────────────────────────────── */}
          {(step === 'gpay-processing' || step === 'paytm-processing' || step === 'upi-processing') && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-indigo-700" />
                </div>
              </div>
              <p className="font-semibold text-gray-800 dark:text-white text-center">
                {processingLabel}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {processingSubLabel}
              </p>
            </div>
          )}

          {/* ── STEP: UPI VERIFY ─────────────────────────────── */}
          {step === 'upi-verify' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white text-center">
                Confirm Your Payment
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
                We've tried to open {UPI_APPS.find((u) => u.id === selectedUpiApp)?.label || 'your UPI App'}. 
                After completing the payment, please enter the Transaction ID (UTR) below to generate your receipt.
              </p>
              
              <div className="w-full mt-4 space-y-3 px-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transaction ID / UTR Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012"
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                />
              </div>

              <div className="w-full flex gap-3 mt-4 px-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setStep('select-upi')}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                  disabled={!utrInput || utrInput.length < 5}
                  onClick={async () => {
                    // Update the backend to save the transaction/UTR
                    setStep('gpay-processing'); // Show loading briefly
                    try {
                      // Optional: Make a network call here if the backend needs to explicitly save it first
                      const resp = await fetch(`${SERVER_BASE}/api/payment/process-gpay`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: utrInput, amount, feeId, studentId })
                      });
                      const result = await resp.json();
                      const finalTxId = result.success ? result.transactionId : utrInput;
                      setTransactionId(finalTxId);
                      setStep('success');
                      onSuccess({ id: finalTxId, method: UPI_APPS.find((u) => u.id === selectedUpiApp)?.label || 'UPI' });
                    } catch (e) {
                      setTransactionId(utrInput);
                      setStep('success');
                      onSuccess({ id: utrInput, method: UPI_APPS.find((u) => u.id === selectedUpiApp)?.label || 'UPI' });
                    }
                  }}
                >
                  Confirm Payment
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP: SUCCESS ────────────────────────────────── */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Payment Successful!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {amountDisplay} paid successfully
              </p>
              {transactionId && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2 text-center w-full">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-800 dark:text-white break-all">
                    {transactionId}
                  </p>
                </div>
              )}
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                onClick={onClose}
              >
                View Receipt
              </Button>
            </div>
          )}

          {/* ── STEP: FAILED ─────────────────────────────────── */}
          {step === 'failed' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Payment Failed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Something went wrong. Please try again with a different method.
              </p>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setStep('select')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Another Method
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-500"
                onClick={() => { onClose(); onCancel(); }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentGatewaySelection;
