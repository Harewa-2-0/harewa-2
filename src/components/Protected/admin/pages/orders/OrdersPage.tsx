'use client';

import { useState, useMemo } from 'react';
import { orderTabs, type OrderTabId } from './order-tabs';
import OrdersTable from './OrdersTable';
import OrderFilters from './OrderFilters';
import { useAdminOrdersQuery } from '@/hooks/useOrders';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderTabId>('pending');
  const [filters, setFilters] = useState({
    search: '',
    dateRange: ''
  });

  // Fetch all orders using React Query
  const { data: allOrders = [], isLoading, error } = useAdminOrdersQuery();

  // Filter orders by active tab
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => order.status === activeTab);
  }, [allOrders, activeTab]);

  // Calculate counts for each tab
  const tabsWithCounts = useMemo(() => {
    return orderTabs.map(tab => ({
      ...tab,
      count: allOrders.filter(order => order.status === tab.id).length,
    }));
  }, [allOrders]);

  const handleTabChange = (tabId: OrderTabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
      </div>

      {/* Order Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabsWithCounts.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as OrderTabId)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <OrderFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        activeTab={activeTab}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading orders: {error.message}</p>
        </div>
      )}

      {/* Orders Table */}
      <OrdersTable 
        filters={filters} 
        activeTab={activeTab}
        loading={isLoading}
        orders={filteredOrders}
      />
    </div>
  );
}
