'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { DataTable, TableColumn } from '../components/shared';
import DeleteProductModal from './DeleteProductModal';
import EditProductModal from './EditProductModal';
import { useUpdateProductMutation, useDeleteProductMutation } from '@/hooks/useProducts';
import { formatPrice } from '@/utils/currency';
import { PageSpinner } from '../../components/Spinner';
import type { Product } from '@/services/products';

interface ProductsTableProps {
  genderFilter: string;
  onProductCountChange?: (count: number) => void;
  products: Product[]; // Products from parent (required now)
  isLoading?: boolean; // Loading state from parent
  error?: Error | null; // Error state from parent
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function ProductsTable({ 
  genderFilter, 
  onProductCountChange, 
  products,
  isLoading = false,
  error: parentError,
  pagination,
  onPageChange,
  onItemsPerPageChange
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Use React Query mutations
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();

  // Filter products based on gender (client-side filter)
  const filteredProducts = products.filter(product => {
    if (!genderFilter) return true;
    return product.gender === genderFilter || product.gender === 'unisex';
  });

  // Notify parent component of product count changes
  useEffect(() => {
    if (onProductCountChange) {
      // When using server-side pagination, use the total from pagination
      // Otherwise, use filtered products count
      const count = pagination ? pagination.total : filteredProducts.length;
      onProductCountChange(count);
    }
  }, [filteredProducts.length, onProductCountChange, pagination]);

  // Calculate pagination
  // When pagination prop is provided, use server-side pagination totals
  // Otherwise, use client-side pagination
  const totalItems = pagination ? pagination.total : filteredProducts.length;
  const totalPages = pagination ? pagination.totalPages : Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);


  const getStatusBadge = (product: Product) => {
    // Determine status based on stock
    const stock = typeof product.remainingInStock === 'number' 
      ? product.remainingInStock 
      : typeof product.quantity === 'number' 
        ? product.quantity 
        : parseInt(String(product.remainingInStock || product.quantity || '0'));
    const status = stock > 10 ? 'active' : stock > 0 ? 'low_stock' : 'out_of_stock';
    
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      low_stock: 'bg-[#D4AF37]/20 text-[#D4AF37]',
      out_of_stock: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Define handlers before columns so they can be used in useMemo dependencies
  const handleEditClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  }, []);

  const handleDeleteClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  }, []);

  // Memoize columns to prevent unnecessary re-renders
  const columns: TableColumn<Product>[] = useMemo(() => [
    {
      key: 'name',
      label: 'Product',
      render: (product) => {
        const productName = product.name || 'Unknown Product';
        const truncatedName = productName.length > 10 
          ? `${productName.substring(0, 10)}...` 
          : productName;
        const productId = product.id || product._id || 'N/A';
        const shortId = productId.length > 8 ? `${productId.substring(0, 8)}...` : productId;
        
        return (
          <Link 
            href={`/admin/products/${productId}`}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <div className="flex-shrink-0 h-10 w-10">
              <img
                className="h-10 w-10 rounded-lg object-cover"
                src={product.images?.[0] || '/placeholder-product.jpg'}
                alt={productName}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                }}
              />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900" title={productName}>
                {truncatedName}
              </div>
              <div className="text-sm text-gray-500" title={productId}>
                ID: {shortId}
              </div>
            </div>
          </Link>
        );
      }
    },
    {
      key: 'price',
      label: 'Price',
      render: (product) => {
        const price = typeof product.price === 'number'
          ? product.price
          : parseInt(String(product.price || '0')) || 0;
        return formatPrice(price);
      },
      sortable: true
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product) => {
        const stock = typeof product.remainingInStock === 'number' 
          ? product.remainingInStock 
          : typeof product.quantity === 'number' 
            ? product.quantity 
            : parseInt(String(product.remainingInStock || product.quantity || '0')) || 0;
        return stock.toLocaleString();
      },
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (product) => getStatusBadge(product)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product) => (
                  <div className="flex space-x-2">
          <button 
            onClick={() => handleEditClick(product)}
            className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors cursor-pointer"
          >
                      Edit
                    </button>
          <button 
            onClick={() => handleDeleteClick(product)}
            className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
          >
                      Delete
                    </button>
                  </div>
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);


  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    } else {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);
    }
  };

  const handleEditSuccess = async (updatedProduct: Product) => {
    const productId = updatedProduct._id || updatedProduct.id;
    if (!productId) {
      console.error('Product ID not found');
      return;
    }

    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        payload: updatedProduct as any,
      });
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteSuccess = async (productId: string) => {
    setDeletingProductId(productId);
    try {
      await deleteProductMutation.mutateAsync(productId);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      // Animation delay
      setTimeout(() => {
        setDeletingProductId(null);
      }, 300);
    } catch (error) {
      console.error('Error deleting product:', error);
      setDeletingProductId(null);
    }
  };

  // Get row classes with animation support
  const getRowClasses = (product: Product) => {
    const baseClasses = "transition-all duration-300 ease-in-out";
    const deletingClasses = deletingProductId === (product._id || product.id) 
      ? "opacity-0 transform translate-x-full" 
      : "opacity-100 transform translate-x-0";
    return `${baseClasses} ${deletingClasses}`;
  };


  // Error state
  if (parentError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-500 mb-4">{parentError.message || 'Failed to fetch products'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="bg-white rounded-lg shadow">
          <PageSpinner className="h-64" />
        </div>
      ) : (
        <DataTable
          data={pagination ? filteredProducts : paginatedProducts}
          columns={columns}
          emptyMessage="No products found"
          rowClassName={getRowClasses}
          pagination={pagination ? {
            currentPage: pagination.page,
            totalPages: pagination.totalPages,
            totalItems: pagination.total, // Server-side total (all products, not filtered)
            itemsPerPage: pagination.limit,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handleItemsPerPageChange,
            showItemsPerPage: true,
            itemsPerPageOptions: [10, 20, 50, 100]
          } : {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            onPageChange: handlePageChange,
            onItemsPerPageChange: handleItemsPerPageChange,
            showItemsPerPage: true,
            itemsPerPageOptions: [5, 10, 25, 50]
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        productId={selectedProduct?.id || selectedProduct?._id || ''}
        productName={selectedProduct?.name || ''}
        onSuccess={() => handleDeleteSuccess(selectedProduct?.id || selectedProduct?._id || '')}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct as any}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
