'use client';

import { useState } from 'react';
import ReviewsTable from './ReviewsTable';
import ReviewFilters from './ReviewFilters';
import ReviewStats from './ReviewStats';

export default function ReviewsPage() {
  const [filters, setFilters] = useState({
    rating: '',
    status: '',
    search: ''
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600">Manage customer reviews and ratings</p>
        </div>
      </div>

      {/* Review Stats */}
      <ReviewStats />

      {/* Filters */}
      <ReviewFilters filters={filters} onFiltersChange={setFilters} />

      {/* Reviews Table */}
      <ReviewsTable filters={filters} />
    </div>
  );
}
