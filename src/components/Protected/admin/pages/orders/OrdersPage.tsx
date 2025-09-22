'use client';

import { useState, useEffect } from 'react';
import { orderTabs, type OrderTabId } from './order-tabs';
import OrdersTable from './OrdersTable';
import OrderFilters from './OrderFilters';
import { getOrders, getOrdersByStatus, type Order } from '@/services/order';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderTabId>('pending');
  const [filters, setFilters] = useState({
    search: '',
    dateRange: ''
  });
  const [loading, setLoading] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  const handleTabChange = (tabId: OrderTabId) => {
    setActiveTab(tabId);
    filterOrdersByTab(tabId);
  };

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      console.log('All orders fetched:', response);
      setAllOrders(response);
      filterOrdersByTab(activeTab, response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAllOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByTab = (tabId: OrderTabId, ordersToFilter = allOrders) => {
    const filtered = ordersToFilter.filter(order => order.status === tabId);
    setFilteredOrders(filtered);
  };

  // Fetch all orders on component mount
  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Filter orders when tab changes
  useEffect(() => {
    if (allOrders.length > 0) {
      filterOrdersByTab(activeTab);
    }
  }, [activeTab, allOrders]);

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
                 {orderTabs.map((tab) => (
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

      {/* Orders Table */}
      <OrdersTable 
        filters={filters} 
        activeTab={activeTab}
        loading={loading}
        orders={filteredOrders}
      />
    </div>
  );
}
