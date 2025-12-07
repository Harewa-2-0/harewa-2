'use client';

import { useState, useMemo, useEffect } from 'react';
import CustomizationsTable from './CustomizationsTable';
import { useAdminCustomizationsQuery } from '@/hooks/useCustomizations';
import { PageSpinner } from '../../components/Spinner';

// Helper to get user name safely
const getUserName = (customization: any): string => {
  if (!customization.user) return 'Unknown';
  if (typeof customization.user === 'string') return 'User ' + customization.user.substring(0, 8);
  return customization.user.name || customization.user.email || 'Unknown';
};

export default function CustomizationsPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all customizations using React Query
  const { data: allCustomizations = [], isLoading, error } = useAdminCustomizationsQuery();

  // Filter and sort customizations (latest first)
  const filteredCustomizations = useMemo(() => {
    let result = allCustomizations;

    // Filter by search term if provided
    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      result = result.filter(customization => {
        const userName = getUserName(customization).toLowerCase();
        const outfit = customization.outfit?.toLowerCase() || '';
        const fabricType = customization.fabricType?.toLowerCase() || '';
        const size = customization.size?.toLowerCase() || '';
        const color = customization.preferredColor?.toLowerCase() || '';
        const id = customization._id?.toLowerCase() || '';

        return (
          id.includes(searchTerm) ||
          userName.includes(searchTerm) ||
          outfit.includes(searchTerm) ||
          fabricType.includes(searchTerm) ||
          size.includes(searchTerm) ||
          color.includes(searchTerm)
        );
      });
    }

    // Sort by createdAt descending (latest first)
    return [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [allCustomizations, search]);

  // Paginate filtered customizations
  const paginatedCustomizations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCustomizations.slice(startIndex, endIndex);
  }, [filteredCustomizations, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (search.trim()) {
      setCurrentPage(1);
    }
  }, [search]);

  const totalPages = Math.ceil(filteredCustomizations.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customizations</h1>
          <p className="text-gray-600">View and manage customization requests</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search by customer, outfit, fabric, size, color..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading customizations: {error.message}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow">
          <PageSpinner className="h-64" />
        </div>
      )}

      {/* Customizations Table */}
      {!isLoading && (
        <CustomizationsTable 
          search={search}
          loading={isLoading}
          customizations={paginatedCustomizations}
          totalItems={filteredCustomizations.length}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

