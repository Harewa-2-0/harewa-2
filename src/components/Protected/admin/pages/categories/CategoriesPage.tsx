'use client';

import { useState, useRef } from 'react';
import CategoriesTable from './CategoriesTable';
import AddCategoryModal from './AddCategoryModal';

export default function CategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryCount, setCategoryCount] = useState(0);
  const tableRef = useRef<{ refresh: () => void } | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Product Categories <span className="text-lg font-normal text-gray-500">({categoryCount})</span>
          </h1>
          <p className="text-gray-600">Manage your product categories</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Add Category Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#D4AF37]/90 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>ADD CATEGORY</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <CategoriesTable 
        ref={tableRef}
        onCategoryCountChange={setCategoryCount}
      />

      {/* Add Category Modal */}
      {showAddModal && (
        <AddCategoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            // Refresh the table after successful creation
            if (tableRef.current?.refresh) {
              tableRef.current.refresh();
            }
          }}
        />
      )}
    </div>
  );
}
