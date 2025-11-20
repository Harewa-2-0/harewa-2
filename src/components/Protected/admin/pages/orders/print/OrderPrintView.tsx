'use client';

import { forwardRef } from 'react';
import { type Order } from '@/services/order';
import OrderPrintHeader from './OrderPrintHeader';
import OrderPrintItems from './OrderPrintItems';
import OrderPrintSummary from './OrderPrintSummary';
import OrderPrintFooter from './OrderPrintFooter';

interface OrderPrintViewProps {
  order: Order;
}

const OrderPrintView = forwardRef<HTMLDivElement, OrderPrintViewProps>(
  ({ order }, ref) => {
    return (
      <div ref={ref} className="order-print-container">
        <div className="print-content">
          <OrderPrintHeader order={order} />
          <OrderPrintItems order={order} />
          <OrderPrintSummary order={order} />
          <OrderPrintFooter />
        </div>
      </div>
    );
  }
);

OrderPrintView.displayName = 'OrderPrintView';

export default OrderPrintView;
