'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Button from '../ui/Button';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({
  onScan,
  onError,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5Qrcode('barcode-scanner');
    scannerRef.current = scanner;

    // Cleanup on unmount
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .catch((err) => console.error('Error stopping scanner:', err));
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scannerRef.current || isScanning) return;

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // Scanning box size
        },
        (decodedText) => {
          // Successful scan
          onScan(decodedText);
          stopScanning();
        },
        () => {
          // Scanning error (continuous, can be ignored)
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to start scanner';

      if (errorMessage.includes('Permission')) {
        setHasPermission(false);
        onError?.(
          'Camera permission denied. Please enable camera access in your browser settings.'
        );
      } else {
        onError?.(errorMessage);
      }

      console.error('Scanner error:', err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div className="relative">
        <div
          id="barcode-scanner"
          className={`rounded-lg overflow-hidden ${
            isScanning ? 'block' : 'hidden'
          }`}
        />

        {/* Placeholder when not scanning */}
        {!isScanning && (
          <div className="aspect-square max-w-md mx-auto bg-vinyl-800 rounded-lg border-2 border-dashed border-vinyl-600 flex items-center justify-center">
            <div className="text-center p-8">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-vinyl-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <p className="text-vinyl-300 font-medium mb-2">
                Barcode Scanner Ready
              </p>
              <p className="text-vinyl-500 text-sm">
                Click "Start Scanner" to begin scanning
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <Button
          onClick={isScanning ? stopScanning : startScanning}
          variant={isScanning ? 'danger' : 'primary'}
          size="lg"
        >
          {isScanning ? 'Stop Scanner' : 'Start Scanner'}
        </Button>
      </div>

      {/* Permission Denied Message */}
      {hasPermission === false && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">
            <strong>Camera Access Required:</strong> This feature needs camera
            permission. Please enable it in your browser settings and try again.
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-vinyl-900 border border-vinyl-700 rounded-lg">
        <h4 className="font-medium text-vinyl-200 mb-2">Instructions:</h4>
        <ol className="text-sm text-vinyl-400 space-y-1 list-decimal list-inside">
          <li>Click "Start Scanner" to activate your camera</li>
          <li>Allow camera access when prompted</li>
          <li>Point your camera at the barcode on the vinyl record</li>
          <li>Keep the barcode within the scanning area</li>
          <li>Scanner will automatically detect and search for the record</li>
        </ol>
      </div>
    </div>
  );
}
