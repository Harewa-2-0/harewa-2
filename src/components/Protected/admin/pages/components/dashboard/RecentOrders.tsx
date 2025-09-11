'use client';

import StatusBadge from '../shared/StatusBadge';

interface Order {
  id: string;
  customer: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Processing';
  amount: string;
}

interface RecentOrdersProps {
  orders: Order[];
  className?: string;
}

export default function RecentOrders({ 
  orders, 
  className = ""
}: RecentOrdersProps) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
      
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{order.id}</p>
              <p className="text-xs text-gray-600">{order.customer}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={order.status} size="sm" className="mb-1" />
              <p className="text-sm font-semibold text-gray-900">{order.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
