'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import FabricGrid from './FabricGrid';
import { FabricsGalleryProps } from './types';
import { useFabricsStore } from '@/store/fabricsStore';
import { useFabricsQuery } from '@/hooks/useFabrics';
import { type Fabric } from '@/services/fabric';

const FabricsGallery: React.FC<FabricsGalleryProps> = ({
  fabrics: propFabrics,
  isLoading: propIsLoading,
  initialFilter,
  onFilterChange: propOnFilterChange,
}) => {
  // Zustand UI state (filtered fabrics)
  const {
    filteredFabrics,
    setFilteredFabrics,
  } = useFabricsStore();

  // React Query: Fetch fabrics (cached 10min)
  const { data: queryFabrics = [], isLoading: isLoadingFabrics } = useFabricsQuery();

  // Use provided fabrics or fetched ones
  const allFabrics = propFabrics || queryFabrics;
  const isLoading = propFabrics ? propIsLoading : isLoadingFabrics;

  // Filter fabrics (currently shows all, but can be extended for filtering)
  const filtered = useMemo(() => {
    if (!Array.isArray(allFabrics) || allFabrics.length === 0) {
      return [];
    }
    // For now, return all fabrics (can add filtering logic later)
    return allFabrics;
  }, [allFabrics]);

  // Track previous filtered fabrics to prevent infinite loops
  const prevFilteredRef = useRef<string>('');
  
  // Update Zustand store with filtered fabrics (for child components)
  // Only update if the fabric IDs actually changed (prevents infinite loop)
  useEffect(() => {
    const currentIds = filtered.map(f => f._id).join(',');
    if (currentIds !== prevFilteredRef.current) {
      prevFilteredRef.current = currentIds;
      setFilteredFabrics(filtered);
    }
  }, [filtered, setFilteredFabrics]);

  // Show error state if React Query failed
  const hasError = allFabrics.length === 0 && !isLoading;

  if (hasError) {
    return (
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto md:px-8 px-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Illustration */}
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
              <svg
                className="w-16 h-16 text-red-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to fetch fabrics
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              We're having trouble loading the fabrics. 
              Please check your network connection and try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-[#D4AF37] hover:bg-[#B8941F] text-white font-medium rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto md:px-8 px-6">
        {/* No Category Sidebar - Just the Grid */}
        <FabricGrid
          fabrics={filteredFabrics}
          loading={isLoading}
        />
      </div>
    </section>
  );
};

export default FabricsGallery;

