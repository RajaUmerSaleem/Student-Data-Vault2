import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [isStarting, setIsStarting] = useState(true);
  const [isdone, setIsDone] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Check if the scanner is already initialized
    const timerId = setTimeout(() => {
      try {
        // Create a scanner instance with simpler configuration
        const scanner = new Html5QrcodeScanner("qr-reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        });
        
        // Store scanner reference for cleanup
        scannerRef.current = scanner;
        scanner.render(
          (decodedText) => {
            onScanSuccess(decodedText);
            if (!isdone) {
              setIsDone(true);
              toast.success("QR code scanned successfully!");
              scanner.clear(); 
            }
          },
          (error) => {
            // Filter out common non-error messages
            if (
              !error.includes('getImageData') && 
              !error.includes('IndexSizeError') &&
              !error.includes('QR code parse error')
            ) {
              if (onScanError) {
                onScanError(error);
              }
            }
          }
        );
        
        setIsStarting(false);
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
        if (onScanError) {
          onScanError("Failed to initialize scanner. Please try again.");
        }
        setIsStarting(false);
      }
    }, 1000);

    // Cleanup function
    return () => {
      clearTimeout(timerId);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("Error cleaning up scanner:", error);
        }
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      {isStarting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10 text-center text-black">
          <p>Starting camera...</p>
        </div>
      )}
      
      <div id="qr-reader" className="w-full border-0 rounded-lg"></div>

      {/* Custom styling to fix appearance */}
      <style jsx global>{`
        #qr-reader {
          width: 100% !important;
          border: none !important;
          padding: 0 !important;
           color: black !important;
        }
        
        #qr-reader__scan_region {
          background: transparent !important;
        }
        
        #qr-reader__scan_region > img {
          display: none !important;
        }
        
        #qr-reader video {
          border-radius: 8px !important;
        }
        
        #qr-reader__dashboard {
          padding-top: 10px !important;
        }
        
        #qr-reader__dashboard button {
          background-color: #2563eb !important;
          color: black !important;
          border-radius: 4px !important;
          padding: 6px 12px !important;
          margin: 5px 0 !important;

        }
        
        /* Improve the camera selection dropdown */
        #qr-reader select {
          padding: 6px !important;
          border-radius: 4px !important;
          border: 1px solid #ccc !important;
          margin-bottom: 10px !important;
        }
        
        /* Fix status message spacing */
        #qr-reader__status_span {
          margin-top: 10px !important;
          display: block !important;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;