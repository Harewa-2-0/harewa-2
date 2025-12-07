'use client';

import { useState, useRef, useEffect } from 'react';
import ProductsTable from './ProductsTable';
import AddProductModal from './AddProductModal';
import { useAdminProducts } from '@/hooks/useProducts';
import { PageSpinner } from '../../components/Spinner';
import type { Product, PaginatedResponse } from '@/services/products';

export default function ProductsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [genderFilter, setGenderFilter] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Use React Query hook for data fetching with server-side pagination
  const { data: productsResponse, isLoading, error } = useAdminProducts({ 
    page: currentPage, 
    limit: itemsPerPage 
  });

  // Extract products and pagination data from response
  const products: Product[] = productsResponse?.items || [];
  const paginationData = productsResponse?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1,
    hasMore: false
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const genderOptions = [
    { value: '', label: 'All' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  const selectedOption = genderOptions.find(option => option.value === genderFilter) || genderOptions[0];

  // Handlers for modals (mutations handle cache updates automatically)
  const handleProductAdded = () => {
    // Mutation handles cache update, just close modal
    setShowAddModal(false);
  };

  const handleProductUpdated = () => {
    // Mutation handles cache update, no action needed
  };

  const handleProductDeleted = () => {
    // Mutation handles cache update, no action needed
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
        </div>
        <PageSpinner />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading products</p>
          <p className="text-red-600 text-sm mt-1">{error instanceof Error ? error.message : 'Failed to load products'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 text-red-600 hover:text-red-800 underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products <span className="text-lg font-normal text-gray-500">({paginationData.total || productCount})</span>
          </h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Custom Gender Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative w-32 bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] sm:text-sm"
            >
              <span className="block truncate text-gray-900">{selectedOption.label}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {genderOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setGenderFilter(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`${
                      option.value === genderFilter
                        ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                        : 'text-gray-900'
                    } cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 transition-colors`}
                  >
                    <span className="block truncate font-normal">{option.label}</span>
                    {option.value === genderFilter && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <svg className="w-5 h-5 text-[#D4AF37]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Add Product Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#D4AF37]/90 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <ProductsTable 
        genderFilter={genderFilter} 
        onProductCountChange={setProductCount}
        products={products}
        isLoading={isLoading}
        error={error}
        pagination={paginationData}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleProductAdded}
        />
      )}
    </div>
  );
}
