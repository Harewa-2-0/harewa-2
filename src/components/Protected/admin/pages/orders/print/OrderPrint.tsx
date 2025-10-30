'use client';

import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { type Order } from '@/services/order';
import { useToast } from '@/contexts/toast-context';
import OrderPrintView from './OrderPrintView';
import './print-styles.css';

// Extend Window interface for print tracking
declare global {
  interface Window {
    printStarted?: boolean;
    printCompleted?: boolean;
    printCleanup?: () => void;
    printStartTime?: number;
    printTimeout?: NodeJS.Timeout;
  }
}

interface OrderPrintProps {
  order: Order;
  onClose?: () => void;
}

export default function OrderPrint({ order, onClose }: OrderPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Start with preview shown
  const { addToast } = useToast();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Order-${order._id}-${new Date().toISOString().split('T')[0]}`,
    onBeforePrint: () => {
      setIsPrinting(true);
      
      // Record start time for timing-based heuristic
      window.printStartTime = Date.now();
      
      // Set up event listeners to track print completion
      const handleBeforePrint = () => {
        window.printStarted = true;
      };
      
      const handleAfterPrint = () => {
        window.printCompleted = true;
      };
      
      // Add event listeners
      window.addEventListener('beforeprint', handleBeforePrint);
      window.addEventListener('afterprint', handleAfterPrint);
      
      // Store cleanup function
      window.printCleanup = () => {
        window.removeEventListener('beforeprint', handleBeforePrint);
        window.removeEventListener('afterprint', handleAfterPrint);
        // Clear any pending timeout
        if (window.printTimeout) {
          clearTimeout(window.printTimeout);
          window.printTimeout = undefined;
        }
      };
      
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      
      // Calculate time elapsed since print dialog opened
      const elapsedTime = window.printStartTime ? Date.now() - window.printStartTime : 0;
      
      // Clean up event listeners immediately
      if (window.printCleanup) {
        window.printCleanup();
        window.printCleanup = undefined;
      }
      
      // Timing-based heuristic with event-based fallback
      let isSuccessful = false;
      
      if (elapsedTime >= 5000) {
        // 5+ seconds: Assume successful completion
        isSuccessful = true;
      } else if (elapsedTime < 3000) {
        // Under 3 seconds: Assume cancellation
        isSuccessful = false;
      } else {
        // 3-5 seconds: Use event-based detection as fallback
        isSuccessful = Boolean(window.printCompleted && window.printStarted);
      }
      
      // Show appropriate toast based on determination
      if (isSuccessful) {
        addToast('Print successful!', 'success');
        if (onClose) {
          setTimeout(() => onClose(), 1000);
        }
      } else {
        addToast('Print cancelled', 'error');
        if (onClose) {
          setTimeout(() => onClose(), 2000);
        }
      }
      
      // Reset all flags
      window.printStarted = false;
      window.printCompleted = false;
      window.printStartTime = undefined;
    },
    onPrintError: (errorLocation, error) => {
      console.error('Print error:', errorLocation, error);
      setIsPrinting(false);
      
      // Clean up on error
      if (window.printCleanup) {
        window.printCleanup();
        window.printCleanup = undefined;
      }
      window.printStarted = false;
      window.printCompleted = false;
      window.printStartTime = undefined;
      
      addToast('Failed to open print dialog. Please try again.', 'error');
    },
    pageStyle: `
      @page { 
        margin: 0.5in; 
        size: A4;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print { 
          display: none !important; 
        }
        .print-button { 
          display: none !important; 
        }
        .print-controls {
          display: none !important;
        }
      }
    `,
  });


  const handleHidePreview = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="order-print-wrapper">
      {/* Print Controls */}
      <div className="print-controls no-print">
        <div className="control-buttons">
          <button
            onClick={() => {
              setIsPrinting(true);
              handlePrint();
            }}
            className="control-btn print-btn"
            disabled={isPrinting}
          >
            <Printer className="btn-icon" />
            {isPrinting ? 'Opening...' : 'Print / Save as PDF'}
          </button>
          
          
          <button
            onClick={handleHidePreview}
            className="control-btn close-btn"
            disabled={isPrinting}
          >
            Hide Preview
          </button>
        </div>
      </div>

      {/* Print Preview - Always visible */}
      <div className="print-preview no-print">
        <div className="preview-content">
          <OrderPrintView ref={printRef} order={order} />
        </div>
      </div>

      <style jsx>{`
        .order-print-wrapper {
          position: relative;
        }

        .print-controls {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .control-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .control-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .preview-btn {
          background: #6c757d;
          color: white;
        }

        .preview-btn:hover:not(:disabled) {
          background: #5a6268;
        }

        .print-btn {
          background: #D4AF37;
          color: white;
          font-weight: 600;
        }

        .print-btn:hover:not(:disabled) {
          background: #b8941f;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
        }

        .download-btn {
          background: #28a745;
          color: white;
          font-weight: 600;
        }

        .download-btn:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
        }

        .close-btn {
          background: #6c757d;
          color: white;
          font-weight: 600;
        }

        .close-btn:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }


        .print-preview {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 0;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .preview-content {
          max-height: 70vh;
          overflow-y: auto;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .control-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .control-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
