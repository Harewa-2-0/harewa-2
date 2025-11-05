'use client';

import { type Order } from '@/services/order';
import { formatPrice } from '@/utils/currency';

interface OrderPrintSummaryProps {
  order: Order;
}

export default function OrderPrintSummary({ order }: OrderPrintSummaryProps) {

  // Calculate profit (using the same logic as in OrdersTable)
  const calculateProfit = (amount: number) => {
    return Math.round(amount * 0.1);
  };

  const profit = calculateProfit(order.amount);
  const subtotal = order.amount;
  const shipping = 0; // Currently set to 0 in the original component
  const discount = 0; // Currently set to 0 in the original component
  const total = subtotal + shipping - discount;

  return (
    <div className="print-summary-section">
      <div className="summary-container">
        <h3 className="section-title">Order Summary</h3>
        
        <div className="summary-details">
          <div className="summary-row">
            <span className="summary-label">Subtotal:</span>
            <span className="summary-value">{formatPrice(subtotal)}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">Shipping:</span>
            <span className="summary-value">{formatPrice(shipping)}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">Discount:</span>
            <span className="summary-value">-{formatPrice(discount)}</span>
          </div>
          
          <div className="summary-row total-row">
            <span className="summary-label">Total Amount:</span>
            <span className="summary-value total-amount">{formatPrice(total)}</span>
          </div>
          
          <div className="summary-row profit-row">
            <span className="summary-label">Estimated Profit:</span>
            <span className="summary-value profit-amount">{formatPrice(profit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
