'use client';

import React, { useState } from 'react';
import { OrderTabId } from './order-tabs';
import { type Order } from '@/services/order';
import { OrderPrint } from './print';

interface OrderItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

interface OrdersTableProps {
  filters: {
    search: string;
    dateRange: string;
  };
  activeTab: OrderTabId;
  loading?: boolean;
  orders: Order[];
}

export default function OrdersTable({ filters, activeTab, loading = false, orders }: OrdersTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [animatingRows, setAnimatingRows] = useState<Set<string>>(new Set());
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Helper function to calculate profit (mock calculation for now)
  const calculateProfit = (amount: number) => {
    // Simple 10% profit calculation - replace with actual business logic
    return Math.round(amount * 0.1);
  };

  const calculateProfitPercentage = (amount: number, profit: number) => {
    return Math.round((profit / amount) * 100);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-[#D4AF37]/20 text-[#D4AF37]',
      initiated: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getProfitBadge = (percentage: number) => {
  return (
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
        {percentage}%
      </span>
    );
  };

  const toggleExpanded = (orderId: string) => {
    const isCurrentlyExpanded = expandedRows.has(orderId);
    
    if (isCurrentlyExpanded) {
      // Closing: Start slide up animation
      setAnimatingRows(prev => new Set(prev).add(orderId));
      
      // After animation duration, remove from expanded and animating
      setTimeout(() => {
        setExpandedRows(new Set<string>());
        setAnimatingRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }, 300); // Match animation duration
    } else {
      // Opening: Close all others first, then open this one
      setExpandedRows(new Set<string>());
      setAnimatingRows(new Set<string>());
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setExpandedRows(new Set([orderId]));
        setAnimatingRows(prev => new Set(prev).add(orderId));
        
        // Remove from animating after animation completes
        setTimeout(() => {
          setAnimatingRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(orderId);
            return newSet;
          });
        }, 300);
      }, 50);
    }
  };


  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter orders based on search and date filters (tab filtering is done at API level)
  const filteredOrders = orders.filter(order => {
    // Filter by search term
    let matchesSearch = true;
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      matchesSearch = order._id.toLowerCase().includes(searchTerm) ||
                     order.user.name.toLowerCase().includes(searchTerm) ||
                     order.address.toLowerCase().includes(searchTerm);
    }

    // Filter by date range
    let matchesDateRange = true;
    if (filters.dateRange) {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          matchesDateRange = orderDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateRange = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          matchesDateRange = orderDate >= monthAgo;
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          matchesDateRange = orderDate >= quarterAgo;
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          matchesDateRange = orderDate >= yearAgo;
          break;
        default:
          matchesDateRange = true;
      }
    }

    return matchesSearch && matchesDateRange;
  });


  // Expandable content component
  const expandableContent = (order: Order) => {
    const profit = calculateProfit(order.amount);
    const profitPercentage = calculateProfitPercentage(order.amount, profit);
    
    return (
      <div className="space-y-4">
        {/* Order Items Table with PRINT Button in Header */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRICE</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QTY</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DISC.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL</th>
                <th className="px-4 py-2 text-right">
                  <button 
                    onClick={() => setPrintOrder(order)}
                    className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#D4AF37]/90 transition-colors text-sm font-medium cursor-pointer"
                  >
                    PRINT
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.carts?.products?.map((product, index) => (
                <tr key={product._id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{order._id}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">-</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {product.product || 'Product not found'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">-</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">x{product.quantity}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">0%</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">-</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-center text-sm text-gray-500">
                    No cart items available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Order Summary - Right Aligned with Updated Colors */}
        <div className="flex justify-end">
          <div className="bg-white p-4 rounded-lg border w-80">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8B909A]">Subtotal:</span>
                <span className="text-[#23272E]">
                  {formatPrice(order.amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8B909A]">Shipping:</span>
                <span className="text-[#23272E]">
                  {formatPrice(0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8B909A]">Discount:</span>
                <span className="text-[#23272E]">
                  {formatPrice(0)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span className="text-[#8B909A]">TOTAL:</span>
                <span className="text-[#23272E]">
                  {formatPrice(order.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <p className="text-gray-500">No {activeTab} orders found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order id
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const profit = calculateProfit(order.amount);
              const profitPercentage = calculateProfitPercentage(order.amount, profit);
              
              return (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatRelativeTime(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{formatCurrency(profit)}</span>
                        {getProfitBadge(profitPercentage)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(order.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(order._id);
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors border border-gray-300 rounded-md p-1 hover:border-gray-400 cursor-pointer"
                        >
                          <svg
                            className={`w-4 h-4 transform transition-transform duration-200 ${expandedRows.has(order._id) ? 'rotate-90' : ''}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Order Details */}
                  {(expandedRows.has(order._id) || animatingRows.has(order._id)) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className={`transition-all duration-300 ease-out ${
                          expandedRows.has(order._id) 
                            ? 'animate-in slide-in-from-top-2 opacity-100' 
                            : 'animate-out slide-out-to-top-2 opacity-0'
                        }`}>
                          {expandableContent(order)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{' '}
          <span className="font-medium">{filteredOrders.length}</span> of{' '}
          <span className="font-medium">50</span> results
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            &lt;
          </button>
          <button className="px-3 py-1 text-sm bg-[#D4AF37] text-white rounded">1</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">2</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">3</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">4</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">5</button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
            &gt;
          </button>
        </div>
      </div>

      {/* Print Modal */}
      {printOrder && (
        <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setPrintOrder(null)}
      >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Print Order - {printOrder._id}
                </h2>
                <button
                  onClick={() => setPrintOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <OrderPrint 
                order={printOrder} 
                onClose={() => setPrintOrder(null)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
