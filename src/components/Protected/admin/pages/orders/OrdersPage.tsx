'use client';

import { useState } from 'react';
import OrdersTable from './OrdersTable';
import OrderFilters from './OrderFilters';
import OrderStats from './OrderStats';

export default function OrdersPage() {
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    search: ''
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
      </div>

      {/* Order Stats */}
      <OrderStats />

      {/* Filters */}
      <OrderFilters filters={filters} onFiltersChange={setFilters} />

      {/* Orders Table */}
      <OrdersTable filters={filters} />
    </div>
  );
}
