'use client';

import { useState, useRef, useEffect } from 'react';
import ProductsTable from './ProductsTable';
import AddProductModal from './AddProductModal';

export default function ProductsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [genderFilter, setGenderFilter] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const genderOptions = [
    { value: '', label: 'All' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  const selectedOption = genderOptions.find(option => option.value === genderFilter) || genderOptions[0];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products <span className="text-lg font-normal text-gray-500">({productCount})</span>
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
      />

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
