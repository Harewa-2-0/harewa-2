'use client';

import { useState, useEffect, useRef } from 'react';
import { DataTable, TableColumn } from '../components/shared';
import DeleteProductModal from './DeleteProductModal';
import EditProductModal from './EditProductModal';
import { adminGetProducts, adminUpdateProduct, type Product as ApiProduct } from '@/services/products';
import { TableSpinner } from '../../components/Spinner';

// Use the API Product type with flexible id field
type Product = ApiProduct & { id?: string };

interface ProductsTableProps {
  genderFilter: string;
  onProductCountChange?: (count: number) => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
  products?: Product[]; // Products from parent
  onProductsChange?: (products: Product[]) => void; // Update products in parent
  onProductAdded?: (product: Product) => void; // For optimistic updates
  onProductUpdated?: (product: Product) => void; // For optimistic updates
  onProductDeleted?: (productId: string) => void; // For optimistic updates
  isLoading?: boolean; // Loading state from parent
}

export default function ProductsTable({ 
  genderFilter, 
  onProductCountChange, 
  refreshTrigger,
  products: parentProducts,
  onProductsChange,
  onProductAdded,
  onProductUpdated,
  onProductDeleted,
  isLoading: parentIsLoading
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  // Use parent products if available, otherwise use local state
  const currentProducts = parentProducts || products;
  const setCurrentProducts = onProductsChange || setProducts;
  const currentIsLoading = parentIsLoading !== undefined ? parentIsLoading : isLoading;

  // Fetch products from API (only if not using parent products)
  useEffect(() => {
    // Skip fetching if we have parent products
    if (parentProducts) {
      setIsLoading(false);
      return;
    }

    // Prevent duplicate calls (React Strict Mode protection)
    if (isFetchingRef.current) return;
    
    const fetchProducts = async () => {
      isFetchingRef.current = true;
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminGetProducts({ page: 1, limit: 100 });
        
        // Handle paginated response or legacy array
        const data = 'items' in response ? response.items : response;
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products. Please check your connection and try again.');
        // Don't clear products array on error - keep existing data if available
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchProducts();
  }, [refreshTrigger, parentProducts]); // Add parentProducts as dependency

  // Filter products based on gender
  const filteredProducts = currentProducts.filter(product => {
    if (!genderFilter) return true;
    return product.gender === genderFilter || product.gender === 'unisex';
  });

  // Notify parent component of product count changes
  useEffect(() => {
    if (onProductCountChange) {
      onProductCountChange(filteredProducts.length);
    }
  }, [filteredProducts.length, onProductCountChange]);

  // Handle optimistic product addition
  useEffect(() => {
    if (onProductAdded) {
      // This will be called when a product is successfully created
      // The actual optimistic update happens in the parent component
    }
  }, [onProductAdded]);

  // Optimistic update functions
  const handleOptimisticAdd = (newProduct: Product) => {
    if (onProductsChange) {
      onProductsChange([newProduct, ...currentProducts]);
    } else {
      setProducts((prev: Product[]) => [newProduct, ...prev]);
    }
  };

  const handleOptimisticUpdate = (updatedProduct: Product) => {
    console.log('ProductsTable: handleOptimisticUpdate called with:', updatedProduct);
    console.log('ProductsTable: updatedProduct._id:', updatedProduct._id);
    console.log('ProductsTable: updatedProduct.id:', updatedProduct.id);
    console.log('ProductsTable: currentProducts before update:', currentProducts.map(p => ({ name: p.name, _id: p._id, id: p.id })));
    
    // Validate that we have an ID to match against
    if (!updatedProduct._id && !updatedProduct.id) {
      console.error('ProductsTable: Updated product has no ID field! Cannot update.');
      return;
    }
    
    let matchFound = false;
    const updatedProducts = currentProducts.map((product: Product) => {
      const isMatch = product._id === updatedProduct._id;
      console.log(`ProductsTable: Comparing product "${product.name}" (${product._id}) with updated product (${updatedProduct._id}) - Match: ${isMatch}`);
      
      if (isMatch) {
        matchFound = true;
      }
      return isMatch ? updatedProduct : product;
    });
    
    if (!matchFound) {
      console.error('ProductsTable: No matching product found! This could cause all products to be replaced.');
      console.log('ProductsTable: Available product IDs:', currentProducts.map(p => ({ name: p.name, _id: p._id, id: p.id })));
      console.log('ProductsTable: Looking for ID:', updatedProduct._id || updatedProduct.id);
      return; // Don't update if no match found
    }
    
    console.log('ProductsTable: updatedProducts after update:', updatedProducts.map(p => ({ name: p.name, _id: p._id, id: p.id })));
    
    if (onProductsChange) {
      console.log('ProductsTable: Calling onProductsChange with updated products');
      onProductsChange(updatedProducts);
    } else {
      console.log('ProductsTable: Setting local products state');
      setProducts(updatedProducts);
    }
  };

  const handleOptimisticDelete = (productId: string) => {
    setDeletingProductId(productId);
    // Add slide-out animation delay
    setTimeout(() => {
      const filteredProducts = currentProducts.filter((product: Product) => 
        product._id !== productId && product.id !== productId
      );
      
      if (onProductsChange) {
        onProductsChange(filteredProducts);
      } else {
        setProducts(filteredProducts);
      }
      setDeletingProductId(null);
    }, 300); // 300ms for slide-out animation
  };

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
        // If category is a string (ID), show a truncated version
        const categoryStr = String(product.category || 'N/A');
        const displayText = categoryStr.length > 12 ? `${categoryStr.substring(0, 12)}...` : categoryStr;
        return (
          <span className="text-gray-900" title={categoryStr}>
            {displayText}
          </span>
        );
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

  const handleEditSuccess = (updatedProduct: Product) => {
    console.log('ProductsTable: handleEditSuccess called with:', updatedProduct);
    // Call the parent's onProductUpdated callback if available
    if (onProductUpdated) {
      console.log('ProductsTable: Calling parent onProductUpdated');
      onProductUpdated(updatedProduct);
    } else {
      console.log('ProductsTable: No onProductUpdated callback available, using local update');
      // Only update local state if no parent callback is available
      handleOptimisticUpdate(updatedProduct);
    }
    setError(null); // Clear any previous errors
  };

  const handleDeleteSuccess = (productId: string) => {
    // Optimistically remove the product from the table with animation
    handleOptimisticDelete(productId);
    setError(null); // Clear any previous errors
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
      {currentIsLoading ? (
        <div className="bg-white rounded-lg shadow">
          <TableSpinner />
        </div>
      ) : (
        <DataTable
          data={paginatedProducts}
          columns={columns}
          emptyMessage="No products found"
          rowClassName={getRowClasses}
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
