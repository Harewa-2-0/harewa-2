'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DataTable, TableColumn } from '../components/shared';
import DeleteCategoryModal from './DeleteCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import { useCategoriesQuery } from '@/hooks/useCategories';
import { useQueryClient } from '@tanstack/react-query';
import { categoryKeys } from '@/hooks/useCategories';
import { type ProductCategory } from '@/services/product-category';

// Use the ProductCategory type from the service
export type Category = ProductCategory;

interface CategoriesTableProps {
  onCategoryCountChange?: (count: number) => void;
}

export interface CategoriesTableRef {
  refresh: () => void;
  addCategory: (category: Category) => void;
}

const CategoriesTable = forwardRef<CategoriesTableRef, CategoriesTableProps>(({ onCategoryCountChange }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const queryClient = useQueryClient();
  
  // Fetch categories using React Query
  const { data: categories = [], isLoading, error: queryError } = useCategoriesQuery();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    addCategory: (newCategory: Category) => {
      // Optimistically add to cache (mutation hook already handles this, but this allows manual adds)
      queryClient.setQueryData<Category[]>(categoryKeys.lists(), (old = []) => {
        const exists = old.some(cat => cat._id === newCategory._id);
        if (exists) return old;
        return [newCategory, ...old];
      });
    }
  }));

  // Update category count when data changes
  useEffect(() => {
    if (onCategoryCountChange) {
      onCategoryCountChange(categories.length);
    }
  }, [categories.length, onCategoryCountChange]);

  const error = queryError ? 'Failed to fetch categories' : null;

  // Pagination
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = categories.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleEditSuccess = (updatedCategory: Category) => {
    // React Query mutation handles cache update, just close modal
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  const handleDeleteSuccess = (categoryId: string) => {
    // React Query mutation handles cache update, just close modal
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const columns: TableColumn<Category>[] = [
    {
      key: 'category',
      label: 'Categories',
      render: (category) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
              <span className="text-[#D4AF37] text-sm font-semibold">
                {category.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {category.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {category.productCount} products
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (category) => (
        <div className="text-sm text-gray-900">
          {category.createdAt ? formatDate(category.createdAt) : 'N/A'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (category) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(category);
            }}
            className="text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200"
            title="Edit category"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(category);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200"
            title="Delete category"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DataTable
        data={paginatedCategories}
        columns={columns}
        loading={isLoading}
        emptyMessage="No categories found"
        getRowId={(item) => (item.slug || item._id) as string}
        pagination={{
          currentPage,
          totalPages,
          totalItems: categories.length,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: setItemsPerPage,
          showItemsPerPage: true,
          itemsPerPageOptions: [10, 25, 50, 100],
        }}
        showPagination={true}
      />

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <EditCategoryModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && selectedCategory && (
        <DeleteCategoryModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
});

CategoriesTable.displayName = 'CategoriesTable';

export default CategoriesTable;
