'use client';

import { useState, useRef, useEffect } from 'react';

interface CategoryFiltersProps {
  onFiltersChange: (filters: CategoryFilterState) => void;
  initialFilters?: CategoryFilterState;
}

export interface CategoryFilterState {
  searchQuery: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
}

const defaultFilters: CategoryFilterState = {
  searchQuery: '',
  status: '',
  dateRange: {
    start: '',
    end: '',
  },
};

export default function CategoryFilters({ onFiltersChange, initialFilters = defaultFilters }: CategoryFiltersProps) {
  const [filters, setFilters] = useState<CategoryFilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (key: keyof CategoryFilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: string) => {
    const newDateRange = { ...filters.dateRange, [key]: value };
    const newFilters = { ...filters, dateRange: newDateRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' || 
    filters.status !== '' || 
    filters.dateRange.start !== '' || 
    filters.dateRange.end !== '';

  const selectedStatus = statusOptions.find(option => option.value === filters.status) || statusOptions[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filter Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37] text-white">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors flex items-center space-x-1"
            >
              <span>{isExpanded ? 'Hide' : 'Show'} filters</span>
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Search Query */}
          <div>
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
              Search Categories
            </label>
            <input
              type="text"
              id="searchQuery"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm"
              >
                <span className="block truncate text-gray-900">{selectedStatus.label}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-sm text-gray-900"
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('status', 'active')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filters.status === 'active'
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => handleFilterChange('status', 'inactive')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filters.status === 'inactive'
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive Only
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  handleDateRangeChange('start', lastWeek.toISOString().split('T')[0]);
                  handleDateRangeChange('end', today.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  handleDateRangeChange('start', lastMonth.toISOString().split('T')[0]);
                  handleDateRangeChange('end', today.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Last 30 Days
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
