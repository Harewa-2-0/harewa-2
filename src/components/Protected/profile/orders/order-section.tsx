'use client';

import { useState } from 'react';
import { OrderCard } from '@/components/Protected/profile/orders/order-card';
import { OrderTabs } from '@/components/Protected/profile/orders/order-tab';
import EmptyState from '@/components/common/empty-state';

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
    image: '/cart_2.webp',
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
    image: '/cart_1.webp',
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

      {/* Order List or Empty State */}
      <div className="p-4 md:p-6 space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <EmptyState
            title={`No ${activeOrderTab} orders`}
            description={`You don't have any ${activeOrderTab} orders at the moment.`}
          />
        )}
      </div>
    </div>
  );
}
