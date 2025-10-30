'use client';

import Link from 'next/link';
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
  // Function to shorten ID to first 5 characters + "..."
  const shortenId = (id: string) => {
    return id.length > 5 ? `${id.substring(0, 5)}...` : id;
  };

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <Link 
          href="/admin/orders" 
          className="text-sm bg-[#D4AF37] text-white px-3 py-1 rounded-md hover:bg-[#D4AF37]/90 transition-colors cursor-pointer font-medium"
        >
          View All
        </Link>
      </div>
      
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{shortenId(order.id)}</p>
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
