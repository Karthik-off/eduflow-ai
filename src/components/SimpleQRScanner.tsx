import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, CameraOff, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: any) => void;
}

const SimpleQRScanner: React.FC<SimpleQRScannerProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef('');

  // Clean up scanner
  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
      setIsScanning(false);
    } catch (err) {
      console.log('Scanner stop error (can be ignored):', err);
    }
  };

  // Reset state
  const resetState = () => {
    setError('');
    setSuccess(false);
    setProcessing(false);
    lastScanRef.current = '';
  };

  // Close modal and cleanup
  const handleClose = () => {
    stopScanner();
    resetState();
    onClose();
  };

  // Handle successful QR scan
  const handleQRCodeSuccess = async (decodedText: string) => {
    // Prevent duplicate scans
    if (decodedText === lastScanRef.current) return;
    lastScanRef.current = decodedText;

    console.log('QR Code scanned:', decodedText);
    setProcessing(true);

    try {
      // Parse QR data
      const parsed = JSON.parse(decodedText);
      
      if (!parsed.s || !parsed.k) {
        setError('Invalid QR code format. Please scan a valid attendance QR code.');
        setTimeout(() => { lastScanRef.current = ''; }, 3000);
        setProcessing(false);
        return;
      }

      // Call attendance function
      const { data, error: funcError } = await supabase.functions.invoke('mark-attendance-qr', {
        body: { sessionId: parsed.s, secret: parsed.k },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (funcError) {
        console.error('Function error:', funcError);
        setError('Network error. Please try again.');
        setTimeout(() => { lastScanRef.current = ''; }, 3000);
      } else if (data?.success) {
        setSuccess(true);
        toast.success('Attendance marked successfully!');
        onScanSuccess(data);
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else if (data?.already) {
        setSuccess(true);
        toast.info('Already marked present');
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(data?.error || 'Failed to mark attendance. Please try again.');
        setTimeout(() => { lastScanRef.current = ''; }, 3000);
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      setError('Invalid QR code format. Please scan a valid attendance QR code.');
      setTimeout(() => { lastScanRef.current = ''; }, 3000);
    } finally {
      setProcessing(false);
    }
  };

  // Start QR scanner
  const startScanner = async () => {
    resetState();
    
    try {
      console.log('Starting QR scanner...');
      
      // Create new scanner instance
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // Start scanning with basic configuration
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleQRCodeSuccess,
        (errorMessage) => {
          // Ignore scan errors - they're normal during operation
          console.debug('QR scan debug:', errorMessage);
        }
      );

      setIsScanning(true);
      toast.success('Camera ready! Point at QR code to scan.');
      
    } catch (err: any) {
      console.error('Scanner start error:', err);
      
      // Handle specific errors
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a working camera.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported. Please use a modern browser like Chrome, Firefox, or Safari.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use. Please close other apps using the camera.');
      } else {
        setError(`Failed to start camera: ${err.message || 'Unknown error'}`);
      }
      
      setIsScanning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      handleClose();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Scan QR Code</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-0">
          {/* Camera View */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '300px' }}>
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <AlertCircle className="w-12 h-12 mb-3" />
                <p className="text-center text-sm mb-4">{error}</p>
                <div className="space-y-2 w-full max-w-xs">
                  <Button onClick={startScanner} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => {
                      const helpText = `CAMERA PERMISSION HELP:

1. Look for a camera icon in your address bar (top)
2. Click it and select "Allow"
3. If no icon appears, go to your browser settings:
   - Chrome: Settings > Privacy > Camera
   - Firefox: Settings > Privacy & Security > Permissions > Camera
   - Safari: Safari > Preferences > Websites > Camera
4. Find this site and set to "Allow"
5. Refresh this page`;
                      alert(helpText);
                    }} 
                    variant="outline" 
                    className="w-full border-white text-white hover:bg-white hover:text-black"
                  >
                    Camera Help
                  </Button>
                </div>
              </div>
            ) : success ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <CheckCircle className="w-12 h-12 mb-3 text-green-400" />
                <p className="text-center text-sm">Attendance Marked!</p>
              </div>
            ) : !isScanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <Camera className="w-12 h-12 mb-3" />
                <p className="text-center text-sm mb-4">Click "Start Scanner" to begin</p>
                <Button onClick={startScanner} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanner
                </Button>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <div
                  id="qr-reader"
                  className="w-full h-full"
                />
                {processing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Verifying...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Point your camera at the QR code shown by your instructor</p>
            <p className="text-xs mt-1">The QR code will be scanned automatically</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleQRScanner;
