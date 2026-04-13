import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera, CameraOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const QRScannerPanel = () => {
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef('');

  const startScanner = async () => {
    setResult(null);
    setScanning(true);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // Avoid double scans of the same code
          if (decodedText === lastScannedRef.current) return;
          lastScannedRef.current = decodedText;

          try {
            const parsed = JSON.parse(decodedText);
            if (!parsed.s || !parsed.k) {
              setResult({ success: false, message: 'Invalid QR code' });
              return;
            }

            setProcessing(true);
            const { data, error } = await supabase.functions.invoke('mark-attendance-qr', {
              body: { sessionId: parsed.s, secret: parsed.k },
              headers: {
                Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              }
            });

            if (error) {
              console.error('Supabase function error:', error);
              setResult({ success: false, message: 'Network error: ' + error.message });
            } else if (data?.success) {
              setResult({ success: true, message: data.message || 'Attendance marked!' });
              toast.success('Attendance marked successfully!');
              // Stop scanner after success
              try { await scanner.stop(); } catch {}
              setScanning(false);
            } else if (data?.already) {
              setResult({ success: true, message: 'Already marked present' });
              try { await scanner.stop(); } catch {}
              setScanning(false);
            } else {
              console.error('Function response:', data);
              setResult({ success: false, message: data?.error || 'Failed to mark attendance' });
              // Reset so student can try next QR
              setTimeout(() => { lastScannedRef.current = ''; }, 2000);
            }
            setProcessing(false);
          } catch (parseError) {
            console.error('QR parsing error:', parseError);
            setResult({ success: false, message: 'Invalid QR format' });
            setTimeout(() => { lastScannedRef.current = ''; }, 2000);
          }
        },
        () => {} // Ignore errors from scanning
      );
    } catch (err: any) {
      toast.error('Camera access denied or not available');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
    }
    setScanning(false);
    lastScannedRef.current = '';
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
      }
    };
  }, []);

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <QrCode className="w-4 h-4 text-primary" />
          Scan Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* QR reader container */}
        <div
          id="qr-reader"
          className={`w-full rounded-xl overflow-hidden ${scanning ? 'min-h-[280px]' : 'h-0'}`}
        />

        {/* Result display */}
        {result && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
            result.success
              ? 'bg-accent/10 text-accent'
              : 'bg-destructive/10 text-destructive'
          }`}>
            {result.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result.message}
          </div>
        )}

        {processing && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
          </div>
        )}

        {!scanning ? (
          <Button
            className="w-full gradient-primary text-primary-foreground"
            onClick={startScanner}
          >
            <Camera className="w-4 h-4 mr-1" /> Open Scanner
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={stopScanner}
          >
            <CameraOff className="w-4 h-4 mr-1" /> Close Scanner
          </Button>
        )}

        <p className="text-[10px] text-center text-muted-foreground">
          Point your camera at the QR code shown by your class incharge
        </p>
      </CardContent>
    </Card>
  );
};

export default QRScannerPanel;
