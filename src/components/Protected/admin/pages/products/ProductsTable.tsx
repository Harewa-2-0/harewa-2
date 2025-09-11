'use client';

import { useState, useEffect } from 'react';
import { DataTable, TableColumn } from '../components/shared';
import DeleteProductModal from './DeleteProductModal';
import EditProductModal from './EditProductModal';
import { adminGetProducts, adminUpdateProduct, type Product as ApiProduct } from '@/services/products';

// Use the API Product type with flexible id field
type Product = ApiProduct & { id?: string };

interface ProductsTableProps {
  genderFilter: string;
  onProductCountChange?: (count: number) => void;
}

export default function ProductsTable({ genderFilter, onProductCountChange }: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminGetProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on gender
  const filteredProducts = products.filter(product => {
    if (!genderFilter) return true;
    return product.gender === genderFilter || product.gender === 'unisex';
  });

  // Notify parent component of product count changes
  useEffect(() => {
    if (onProductCountChange) {
      onProductCountChange(filteredProducts.length);
    }
  }, [filteredProducts.length, onProductCountChange]);

  // Calculate pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
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

  const columns: TableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Product',
      render: (product) => {
  return (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                src={product.images?.[0] || '/placeholder-product.jpg'}
                alt={product.name || 'Product'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                {product.name || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-gray-500">
                ID: {product.id || product._id || 'N/A'}
                      </div>
                    </div>
                  </div>
        );
      }
    },
    {
      key: 'category',
      label: 'Category',
      render: (product) => {
        if (typeof product.category === 'object' && product.category?.name) {
          return <span className="text-gray-900">{product.category.name}</span>;
        }
        return <span className="text-gray-900">{String(product.category || 'N/A')}</span>;
      },
      sortable: true
    },
    {
      key: 'price',
      label: 'Price',
      render: (product) => {
        const price = typeof product.price === 'number' 
          ? product.price 
          : parseInt(String(product.price || '0')) || 0;
        return `₦${price.toLocaleString()}`;
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
  ];


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleEditSuccess = async () => {
    // Refresh products list after successful update
    try {
      const data = await adminGetProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error refreshing products after update:', error);
      setError('Product updated but failed to refresh list');
    }
  };

  const handleDeleteSuccess = async () => {
    // Refresh products list after successful deletion
    try {
      const data = await adminGetProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error refreshing products after deletion:', error);
      setError('Product deleted but failed to refresh list');
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
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
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable
          data={paginatedProducts}
          columns={columns}
          emptyMessage="No products found"
          pagination={{
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
        onSuccess={handleDeleteSuccess}
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
