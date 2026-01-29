'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Button from '../ui/Button';
import Input from '../ui/Input';

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
  const [isStarting, setIsStarting] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');

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
    if (!scannerRef.current || isScanning || isStarting) return;

    setIsStarting(true);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      // First, get a high-resolution stream to find the best camera
      let deviceId: string | undefined;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        // Get the device ID from the high-res stream
        const track = stream.getVideoTracks()[0];
        deviceId = track.getSettings().deviceId;
        // Stop this stream - html5-qrcode will create its own
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // Fall back to default camera selection
      }

      // Start scanner with the device ID (high-res camera) or fallback
      const cameraConfig = deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: 'environment' };

      await scannerRef.current.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Wide rectangle for barcodes
            const width = Math.floor(viewfinderWidth * 0.9);
            const height = Math.floor(viewfinderHeight * 0.25);
            return { width, height: Math.max(height, 80) };
          },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {}
      );

      // After scanner starts, try to enhance the camera settings
      setTimeout(async () => {
        try {
          const video = document.querySelector('#barcode-scanner video') as HTMLVideoElement;
          if (video?.srcObject) {
            const track = (video.srcObject as MediaStream).getVideoTracks()[0];
            const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
              focusMode?: string[];
              zoom?: { min: number; max: number };
            };

            const constraints: MediaTrackConstraintSet & { focusMode?: string; zoom?: number } = {};

            // Enable continuous autofocus
            if (capabilities.focusMode?.includes('continuous')) {
              constraints.focusMode = 'continuous';
            }

            // Apply 1.5x zoom if available (helps with distance)
            if (capabilities.zoom) {
              constraints.zoom = Math.min(1.5, capabilities.zoom.max);
            }

            if (Object.keys(constraints).length > 0) {
              await track.applyConstraints({
                advanced: [constraints as MediaTrackConstraintSet],
              });
            }
          }
        } catch {
          // Camera enhancements not supported
        }
      }, 500);

      setIsScanning(true);
      setIsStarting(false);
      setHasPermission(true);
    } catch (err) {
      setIsStarting(false);
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
          className={`rounded-lg overflow-hidden max-w-md mx-auto ${
            isScanning || isStarting ? 'block' : 'hidden'
          }`}
        />

        {/* Placeholder when not scanning */}
        {!isScanning && !isStarting && (
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
          disabled={isStarting}
        >
          {isStarting ? 'Starting...' : isScanning ? 'Stop Scanner' : 'Start Scanner'}
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

      {/* Manual Entry */}
      <div className="p-4 bg-vinyl-900 border border-vinyl-700 rounded-lg">
        <h4 className="font-medium text-vinyl-200 mb-2">Or enter barcode manually:</h4>
        <p className="text-sm text-vinyl-400 mb-3">
          Type the number printed below the barcode on your record
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualBarcode.trim()) {
              onScan(manualBarcode.trim());
              setManualBarcode('');
            }
          }}
          className="flex gap-2"
        >
          <Input
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="e.g. 075992738927"
            className="flex-1"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <Button type="submit" disabled={!manualBarcode.trim()}>
            Search
          </Button>
        </form>
      </div>
    </div>
  );
}
