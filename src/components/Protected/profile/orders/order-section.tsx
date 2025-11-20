'use client';

import { useState, useMemo } from 'react';
import { OrderCard } from '@/components/Protected/profile/orders/order-card';
import { OrderTabs } from '@/components/Protected/profile/orders/order-tab';
import EmptyState from '@/components/common/empty-state';
import { mapOrderStatusToCategory, type Order } from '@/services/order';
import { useOrdersQuery } from '@/hooks/useOrders';

export default function OrdersSection() {
  const [activeOrderTab, setActiveOrderTab] = useState('active');
  
  // React Query hook for orders (auto-fetches, caches, and manages state)
  const { data: allOrders = [], isLoading, error } = useOrdersQuery();

  // Filter orders by category
  const filteredOrders = allOrders.filter((order) => {
    const category = mapOrderStatusToCategory(order.status);
    return category === activeOrderTab;
  });

  // Calculate order counts for tabs
  const orderCounts = {
    active: allOrders.filter(order => mapOrderStatusToCategory(order.status) === 'active').length,
    completed: allOrders.filter(order => mapOrderStatusToCategory(order.status) === 'completed').length,
    cancelled: allOrders.filter(order => mapOrderStatusToCategory(order.status) === 'cancelled').length,
  };

  if (isLoading) {
    return (
      <div className="bg-white md:m-6 md:rounded-lg md:border">
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-lg font-semibold text-black">My orders</h2>
        </div>
        <div className="p-4 md:p-6 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#D4AF37] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white md:m-6 md:rounded-lg md:border">
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-lg font-semibold text-black">My orders</h2>
        </div>
        <div className="p-4 md:p-6">
          <EmptyState
            title="Error loading orders"
            description={error?.message || String(error) || 'Failed to load orders. Please try again.'}
          />
        </div>
      </div>
    );
  }

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
        orderCounts={orderCounts}
      />

      {/* Order List or Empty State */}
      <div className="p-4 md:p-6 space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
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
