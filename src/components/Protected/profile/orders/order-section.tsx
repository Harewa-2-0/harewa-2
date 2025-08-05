'use client';

import { useState } from 'react';
import { OrderCard } from '@/components/Protected/profile/orders/order-card';
import { OrderTabs } from '@/components/Protected/profile/orders/order-tab';
import { Package } from 'lucide-react';

const mockOrders = [
  {
    id: '8001',
    date: 'Jun 11, 2023, 1:00 PM',
    estimatedDate: 'Jun 30, 2023',
    status: 'active',
    outfitName: 'Outfit name',
    quantity: 2,
    totalPrice: '₦25,000',
    paymentStatus: 'In progress',
    paymentMethod: 'Cash on delivery',
    image: '/api/placeholder/80/100',
  },
  {
    id: '8002',
    date: 'Jun 10, 2023, 1:00 PM',
    estimatedDate: 'Jun 30, 2023',
    status: 'active',
    outfitName: 'Outfit name',
    quantity: 1,
    totalPrice: '₦25,000',
    paymentStatus: 'In progress',
    paymentMethod: 'Cash on delivery',
    image: '/api/placeholder/80/100',
  },
];

export default function OrdersSection() {
  const [activeOrderTab, setActiveOrderTab] = useState('active');

  const filteredOrders = mockOrders.filter(
    (order) => order.status === activeOrderTab
  );

  return (
    <div className="bg-white md:m-6 md:rounded-lg md:border">
      {/* Orders Header */}
      <div className="p-4 md:p-6 border-b">
        <h2 className="text-lg font-semibold text-black">My orders</h2>
      </div>

      {/* Tabs */}
      <OrderTabs
        activeOrderTab={activeOrderTab}
        onOrderTabChange={(tabId) => setActiveOrderTab(String(tabId))}
      />

      {/* Order List */}
      <div className="p-4 md:p-6 space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeOrderTab} orders
            </h3>
            <p className="text-gray-500">
              You don't have any {activeOrderTab} orders at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
