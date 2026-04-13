import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, AlertCircle, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: any) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef('');
  const streamRef = useRef<MediaStream | null>(null);

  // Check if HTTPS or localhost
  const isSecureContext = () => {
    return window.isSecureContext || 
           window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  };

  // Open camera settings with improved platform detection
  const openCameraSettings = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
    const isAndroid = userAgent.includes('android');
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
    const isFirefox = userAgent.includes('firefox');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    const isEdge = userAgent.includes('edg');

    // Helper function to show detailed instructions
    const showInstructions = (title: string, instructions: string[]) => {
      const formattedInstructions = instructions.map((step, index) => `${index + 1}. ${step}`).join('\n');
      alert(`${title}\n\n${formattedInstructions}\n\nAfter enabling permissions, refresh this page.`);
    };

    try {
      if (isMobile) {
        if (isIOS) {
          // iOS specific instructions
          showInstructions('Enable Camera on iOS', [
            'Open Settings app',
            'Scroll down and find your browser (Safari/Chrome)',
            'Tap on the browser name',
            'Toggle Camera permission to ON',
            'Return to this page and refresh'
          ]);
        } else if (isAndroid && isChrome) {
          // Android Chrome - try to open settings, fallback to instructions
          try {
            window.open('chrome://settings/content/camera', '_blank');
            setTimeout(() => {
              showInstructions('Enable Camera on Android', [
                'Tap the three dots menu (top right)',
                'Select Settings',
                'Tap Site Settings',
                'Tap Camera',
                'Find this site and set to Allow',
                'Refresh this page'
              ]);
            }, 1000);
          } catch {
            showInstructions('Enable Camera on Android', [
              'Tap the three dots menu (top right)',
              'Select Settings',
              'Tap Site Settings',
              'Tap Camera',
              'Find this site and set to Allow',
              'Refresh this page'
            ]);
          }
        } else {
          // Generic mobile instructions
          showInstructions('Enable Camera on Mobile', [
            'Open your browser settings',
            'Find Site Settings or Permissions',
            'Tap Camera permission',
            'Set this site to Allow',
            'Refresh this page'
          ]);
        }
      } else {
        // Desktop browsers
        if (isChrome) {
          try {
            window.open('chrome://settings/content/camera', '_blank');
            setTimeout(() => {
              showInstructions('Enable Camera in Chrome', [
                'In the Camera settings page that opened',
                'Find this website in the list',
                'Set permission to Allow',
                'Return to this page and refresh'
              ]);
            }, 1000);
          } catch {
            showInstructions('Enable Camera in Chrome', [
              'Click the three dots menu (top right)',
              'Select Settings',
              'Click Privacy and security',
              'Click Site Settings',
              'Click Camera',
              'Find this site and set to Allow',
              'Refresh this page'
            ]);
          }
        } else if (isEdge) {
          try {
            window.open('edge://settings/content/camera', '_blank');
            setTimeout(() => {
              showInstructions('Enable Camera in Edge', [
                'In the Camera settings page that opened',
                'Find this website in the list',
                'Set permission to Allow',
                'Return to this page and refresh'
              ]);
            }, 1000);
          } catch {
            showInstructions('Enable Camera in Edge', [
              'Click the three dots menu (top right)',
              'Select Settings',
              'Click Privacy, search, and services',
              'Scroll down and click Site permissions',
              'Click Camera',
              'Find this site and set to Allow',
              'Refresh this page'
            ]);
          }
        } else if (isFirefox) {
          showInstructions('Enable Camera in Firefox', [
            'Click the padlock icon (left of address bar)',
            'Click Camera permission',
            'Set to Allow',
            'Alternatively: Click the three lines menu',
            'Select Settings',
            'Click Privacy & Security',
            'Scroll to Permissions',
            'Click Camera and find this site',
            'Refresh this page'
          ]);
        } else if (isSafari) {
          showInstructions('Enable Camera in Safari', [
            'Click Safari in the menu bar',
            'Select Preferences',
            'Click Websites tab',
            'Select Camera from left sidebar',
            'Find this website and set to Allow',
            'Refresh this page'
          ]);
        } else {
          showInstructions('Enable Camera', [
            'Look for a camera icon in your address bar',
            'Click it and select Allow',
            'Or check your browser settings under Privacy/Permissions',
            'Find Camera permissions and allow this site',
            'Refresh this page'
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to open camera settings:', error);
      showInstructions('Enable Camera Permission', [
        'Check your browser address bar for a camera icon',
        'Click it and select Allow',
        'Or go to browser settings > Privacy > Camera',
        'Find this site and set permission to Allow',
        'Refresh this page'
      ]);
    }
  };

  // Check current camera permission status
  const checkCameraPermissions = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return { supported: false, permission: 'unsupported' };
      }

      // Try to get permission status (not supported in all browsers)
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return { 
          supported: true, 
          permission: result.state, 
          canRequest: result.state !== 'denied'
        };
      }

      // Fallback - just check if we can enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      return { 
        supported: true, 
        permission: 'unknown', 
        hasCameras: videoDevices.length > 0,
        cameraCount: videoDevices.length
      };
    } catch (error) {
      console.warn('Permission check failed:', error);
      return { supported: true, permission: 'error' };
    }
  };

  // Request camera access directly with improved error handling
  const requestCameraAccess = async (): Promise<MediaStream | null> => {
    try {
      // Check secure context
      if (!isSecureContext()) {
        setCameraError('Camera access requires HTTPS or localhost. Please use a secure connection.');
        return null;
      }

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not supported. Please use a modern browser like Chrome, Firefox, or Safari.');
        return null;
      }

      // First, check what cameras are available
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          setCameraError('No camera devices found. Please connect a camera and try again.');
          return null;
        }
        
        console.log(`Found ${videoDevices.length} camera(s):`, videoDevices.map(d => d.label || 'Unknown'));
      } catch (enumerateError) {
        console.warn('Could not enumerate devices:', enumerateError);
        // Continue anyway, as this might be a permission issue
      }

      // Request camera access with fallback constraints
      let stream: MediaStream | null = null;
      
      // Try with ideal constraints first
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (idealError) {
        console.warn('Ideal constraints failed, trying basic:', idealError);
        
        // Fallback to basic constraints
        try {
          const basicConstraints = {
            video: {
              facingMode: 'environment'
            }
          };
          stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
        } catch (basicError) {
          console.warn('Basic constraints failed, trying any camera:', basicError);
          
          // Last resort - any camera
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          } catch (anyError) {
            throw anyError; // Re-throw to be handled by the outer catch
          }
        }
      }
      
      if (stream) {
        streamRef.current = stream;
        console.log('Camera access granted successfully');
        return stream;
      }
      
      return null;
    } catch (err: any) {
      console.error('Camera access error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Click "Open Camera Settings" for step-by-step instructions to enable it.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found. Please ensure your device has a working camera and it\'s not being used by another application.');
      } else if (err.name === 'NotSupportedError' || err.name === 'ConstraintNotSatisfiedError') {
        setCameraError('Camera not supported by your browser or device. Try using Chrome, Firefox, or Safari.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is already in use by another application. Please close other apps using the camera and try again.');
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        setCameraError('Camera constraints not supported. Try a different browser or device.');
      } else {
        setCameraError(`Camera access failed: ${err.message || 'Unknown error occurred'}`);
      }
      return null;
    }
  };

  // Start QR scanner
  const startScanner = async () => {
    try {
      setError(null);
      setCameraError(null);
      setProcessing(false);
      
      console.log('Starting QR scanner...');
      
      // Request camera access first
      const stream = await requestCameraAccess();
      if (!stream) {
        return;
      }

      // Create scanner instance
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // QR code scan callback
      const onScanSuccess = async (decodedText: string) => {
        // Avoid duplicate scans
        if (decodedText === lastScannedRef.current) return;
        lastScannedRef.current = decodedText;

        console.log('QR Code scanned:', decodedText);
        
        try {
          const parsed = JSON.parse(decodedText);
          if (!parsed.s || !parsed.k) {
            setError('Invalid QR code format. Expected staff-generated attendance QR.');
            setTimeout(() => { lastScannedRef.current = ''; }, 2000);
            return;
          }

          setProcessing(true);
          
          // Mark attendance via API
          const { data, error: funcError } = await supabase.functions.invoke('mark-attendance-qr', {
            body: { sessionId: parsed.s, secret: parsed.k },
            headers: {
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            }
          });

          if (funcError) {
            console.error('API error:', funcError);
            setError('Network error: ' + funcError.message);
          } else if (data?.success) {
            setScanResult(decodedText);
            toast.success('Attendance marked successfully!');
            await stopScanner();
          } else if (data?.already) {
            setScanResult(decodedText);
            toast.info('Already marked present');
            await stopScanner();
          } else {
            console.error('API response:', data);
            setError(data?.error || 'Failed to mark attendance. Contact staff.');
            setTimeout(() => { lastScannedRef.current = ''; }, 2000);
          }
        } catch (parseError) {
          console.error('QR parsing error:', parseError);
          setError('Invalid QR format. Scan a valid staff-generated QR.');
          setTimeout(() => { lastScannedRef.current = ''; }, 2000);
        } finally {
          setProcessing(false);
        }
      };

      // Start scanning
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        onScanSuccess,
        (errorMessage) => {
          console.warn('QR scan warning:', errorMessage);
        }
      );
      
      setIsScanning(true);
      toast.success('Camera ready! Point at QR code to scan.');
      
    } catch (err: any) {
      console.error('Scanner start error:', err);
      
      // Handle errors
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Enable camera access in settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Check device camera.');
      } else if (err.name === 'NotSupportedError') {
        setCameraError('Camera not supported. Try different browser.');
      } else {
        setCameraError(`Scanner error: ${err.message || 'Unknown error'}`);
      }
      
      setIsScanning(false);
    }
  };

  // Stop scanner and cleanup
  const stopScanner = async () => {
    try {
      // Stop QR scanner
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setIsScanning(false);
      lastScannedRef.current = '';
    } catch (err) {
      console.error('Stop scanner error:', err);
    }
  };

  
  // Handle scan result
  const handleScanResult = () => {
    if (scanResult) {
      try {
        const data = JSON.parse(scanResult);
        onScanSuccess(data);
        handleClose();
      } catch (err) {
        setError('Invalid QR code format');
      }
    }
  };

  // Close modal and cleanup
  const handleClose = () => {
    stopScanner();
    setScanResult(null);
    setError(null);
    setCameraError(null);
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      handleClose();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Scan QR Code for Attendance</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Camera View */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '300px' }}>
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <AlertCircle className="w-12 h-12 mb-3" />
                <p className="text-center text-sm mb-4 leading-relaxed">{cameraError}</p>
                <div className="space-y-3 w-full max-w-xs">
                  <Button onClick={startScanner} className="bg-blue-600 hover:bg-blue-700 w-full h-11">
                    <Camera className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={openCameraSettings} 
                    variant="outline" 
                    className="w-full h-11 border-white text-white hover:bg-white hover:text-black font-medium"
                  >
                    Open Camera Settings
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => {
                        // Check for camera icon in address bar
                        const addressBar = document.querySelector('[role="navigation"]') || document.querySelector('input[type="url"]');
                        if (addressBar) {
                          addressBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          setTimeout(() => {
                            alert('Look for a camera icon in the address bar and click it to allow camera access');
                          }, 500);
                        } else {
                          window.location.reload();
                        }
                      }} 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-black text-xs h-9"
                    >
                      Check Address Bar
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-black text-xs h-9"
                    >
                      Refresh Page
                    </Button>
                  </div>
                  <div className="text-center">
                    <button 
                      onClick={() => {
                        const helpText = `QUICK FIXES:
1. Click the camera icon in your address bar (if visible)
2. Click "Allow" when prompted for camera access
3. If no prompt appears, click "Open Camera Settings" above
4. Refresh the page after enabling permissions

If you're on mobile:
- Go to Settings > App Permissions > Camera
- Find your browser and enable camera access`;
                        alert(helpText);
                      }}
                      className="text-xs text-blue-300 hover:text-blue-200 underline"
                    >
                      Quick Help Guide
                    </button>
                  </div>
                </div>
              </div>
            ) : !isScanning && !scanResult ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <Camera className="w-12 h-12 mb-2" />
                <p className="text-center text-sm mb-4">Click "Start Scanner" to begin</p>
                <Button onClick={startScanner} className="bg-blue-600 hover:bg-blue-700">
                  Start Scanner
                </Button>
              </div>
            ) : isScanning ? (
              <div className="relative">
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
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <CheckCircle className="w-12 h-12 mb-2 text-green-400" />
                <p className="text-center text-sm mb-2">QR Code Scanned!</p>
                <div className="bg-black/50 p-2 rounded text-xs max-w-full break-all">
                  {scanResult}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {scanResult ? (
              <>
                <Button onClick={handleScanResult} className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Attendance
                </Button>
                <Button onClick={handleClose} variant="outline">
                  Cancel
                </Button>
              </>
            ) : isScanning ? (
              <>
                <Button onClick={stopScanner} variant="outline" className="flex-1">
                  Stop Scanner
                </Button>
                <Button onClick={handleClose} variant="outline">
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button onClick={startScanner} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanner
                </Button>
                <Button onClick={handleClose} variant="outline">
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScannerModal;
