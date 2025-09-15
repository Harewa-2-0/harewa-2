'use client';

import { useState } from 'react';
import DeliveriesTable from './DeliveriesTable';
import DeliveryFilters from './DeliveryFilters';
import DeliveryStats from './DeliveryStats';

export default function DeliveriesPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-600">Track and manage delivery status</p>
        </div>
      </div>

      {/* Delivery Stats */}
      <DeliveryStats />

      {/* Filters */}
      <DeliveryFilters filters={filters} onFiltersChange={setFilters} />

      {/* Deliveries Table */}
      <DeliveriesTable filters={filters} />
    </div>
  );
}
