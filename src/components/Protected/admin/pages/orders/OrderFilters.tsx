'use client';

import { useState, useRef, useEffect } from 'react';
import { OrderTabId } from './order-tabs';

interface OrderFiltersProps {
  filters: {
    search: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
  activeTab: OrderTabId;
}

export default function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const dateRangeOptions = [
    { value: '', label: 'Filter by date range' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const selectedDateLabel = dateRangeOptions.find(option => option.value === filters.dateRange)?.label || 'Filter by date range';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        {/* Search by Order ID - Left side */}
        <div className="w-full sm:w-80">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by order id"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-black placeholder-gray-500"
            />
          </div>
        </div>

        {/* Custom Date Range Filter - Right side */}
        <div className="w-full sm:w-64" ref={dateDropdownRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-left text-black bg-white flex items-center justify-between"
            >
              <span className={filters.dateRange ? 'text-black' : 'text-gray-500'}>
                {selectedDateLabel}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isDateDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDateDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleFilterChange('dateRange', option.value);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`${
                      option.value === filters.dateRange
                        ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                        : 'text-black hover:bg-gray-50'
                    } cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors w-full text-left`}
                  >
                    <span className="block truncate font-normal">{option.label}</span>
                    {option.value === filters.dateRange && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <svg className="w-4 h-4 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
