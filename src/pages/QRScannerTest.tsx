import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const QRScannerTest = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'unknown' | 'checking' | 'available' | 'unavailable'>('unknown');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef('');

  // Check camera availability
  const checkCameraAvailability = async () => {
    setCameraStatus('checking');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('unavailable');
        setError('Camera API not supported in this browser');
        return false;
      }

      // Try to enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setCameraStatus('unavailable');
        setError('No camera devices found');
        return false;
      }

      setCameraStatus('available');
      setError('');
      return true;
    } catch (err) {
      setCameraStatus('unavailable');
      setError('Failed to check camera availability');
      return false;
    }
  };

  // Initialize camera check on mount
  useEffect(() => {
    checkCameraAvailability();
  }, []);

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
        setError('Invalid QR code format. Expected attendance QR code.');
        setTimeout(() => { lastScanRef.current = ''; }, 3000);
        setProcessing(false);
        return;
      }

      setSuccess(true);
      toast.success('QR Code scanned successfully!');
      setTimeout(() => {
        resetState();
        stopScanner();
      }, 2000);
    } catch (parseError) {
      console.error('Parse error:', parseError);
      setError('Invalid QR code format. Please scan a valid QR code.');
      setTimeout(() => { lastScanRef.current = ''; }, 3000);
    } finally {
      setProcessing(false);
    }
  };

  // Start QR scanner with minimal configuration
  const startScanner = async () => {
    resetState();
    
    // First check camera availability
    const hasCamera = await checkCameraAvailability();
    if (!hasCamera) {
      return;
    }
    
    try {
      console.log('Starting QR scanner...');
      
      // Create new scanner instance
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // Start scanning with most basic configuration
      await scanner.start(
        { facingMode: 'environment' }, // Try back camera first
        {
          fps: 10, // Lower FPS for better performance
          qrbox: { width: 250, height: 250 }
        },
        handleQRCodeSuccess,
        (errorMessage) => {
          // Ignore scan errors - they're normal during operation
          // Only log in debug mode
          if (process.env.NODE_ENV === 'development') {
            console.debug('QR scan debug:', errorMessage);
          }
        }
      );

      setIsScanning(true);
      toast.success('Camera started successfully!');
      
    } catch (err: any) {
      console.error('Scanner start error:', err);
      
      // Handle specific errors with clear messages
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Please ensure your device has a working camera.');
      } else if (err.name === 'NotSupportedError' || err.name === 'ConstraintNotSatisfiedError') {
        setError('Camera not supported. Please use Chrome, Firefox, or Safari.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use. Please close other apps using the camera.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera constraints not supported. Trying basic settings...');
        // Try again with basic constraints
        setTimeout(() => startScannerWithBasicConstraints(), 1000);
      } else {
        setError(`Failed to start camera: ${err.message || 'Unknown error'}`);
      }
      
      setIsScanning(false);
    }
  };

  // Try with basic constraints as fallback
  const startScannerWithBasicConstraints = async () => {
    resetState();
    
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'user' }, // Try front camera
        {
          fps: 5,
          qrbox: { width: 200, height: 200 }
        },
        handleQRCodeSuccess,
        () => {} // Ignore errors
      );

      setIsScanning(true);
      toast.success('Camera started with basic settings!');
    } catch (err: any) {
      console.error('Basic scanner failed:', err);
      setError('Camera cannot be started. Please check your camera permissions and hardware.');
      setIsScanning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-6 h-6" />
                <span>QR Scanner Test</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkCameraAvailability}
                disabled={cameraStatus === 'checking'}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${cameraStatus === 'checking' ? 'animate-spin' : ''}`} />
                Check Camera
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Status */}
            <div className="flex items-center justify-center">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                cameraStatus === 'available' ? 'bg-green-100 text-green-800' :
                cameraStatus === 'unavailable' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {cameraStatus === 'available' ? 'Camera Available' :
                 cameraStatus === 'unavailable' ? 'Camera Unavailable' :
                 'Checking Camera...'}
              </div>
            </div>

            {/* Camera View */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <AlertCircle className="w-16 h-16 mb-4" />
                  <p className="text-center text-lg mb-6">{error}</p>
                  <div className="space-y-3 w-full max-w-xs">
                    <Button onClick={startScanner} className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                      <Camera className="w-5 h-5 mr-2" />
                      Try Again
                    </Button>
                    <Button 
                      onClick={() => {
                        const helpText = `CAMERA TROUBLESHOOTING:

1. Click the camera icon in your address bar (if visible)
2. Select "Allow" when prompted
3. If no prompt appears:
   - Chrome: Settings > Privacy > Camera > Allow this site
   - Firefox: Settings > Privacy & Security > Permissions > Camera
   - Safari: Safari > Preferences > Websites > Camera > Allow
4. Refresh the page after enabling permissions
5. Make sure no other app is using the camera`;
                        alert(helpText);
                      }} 
                      variant="outline" 
                      className="w-full border-white text-white hover:bg-white hover:text-black h-12"
                    >
                      Camera Help
                    </Button>
                  </div>
                </div>
              ) : success ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <CheckCircle className="w-16 h-16 mb-4 text-green-400" />
                  <p className="text-center text-lg">QR Code Scanned Successfully!</p>
                </div>
              ) : !isScanning ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <Camera className="w-16 h-16 mb-4" />
                  <p className="text-center text-lg mb-6">
                    {cameraStatus === 'available' ? 
                      "Click 'Start Scanner' to begin" : 
                      "Waiting for camera check..."}
                  </p>
                  <Button 
                    onClick={startScanner} 
                    className="bg-blue-600 hover:bg-blue-700 h-12 px-8"
                    disabled={cameraStatus !== 'available'}
                  >
                    <Camera className="w-5 h-5 mr-2" />
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
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3" />
                        <p className="text-lg">Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">How to use:</h3>
              <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>1. Click "Start Scanner" to activate your camera</li>
                <li>2. Point your camera at a QR code</li>
                <li>3. The QR code will be scanned automatically</li>
                <li>4. If camera permission is denied, click "Camera Help" for instructions</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRScannerTest;
