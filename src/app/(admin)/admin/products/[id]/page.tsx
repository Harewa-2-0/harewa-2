'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProductByIdQuery } from '@/hooks/useProducts';
import { useDeleteProductMutation } from '@/hooks/useProducts';
import { formatPrice } from '@/utils/currency';
import { PageSpinner } from '@/components/Protected/admin/components/Spinner';
import EditProductModal from '@/components/Protected/admin/pages/products/EditProductModal';
import DeleteProductModal from '@/components/Protected/admin/pages/products/DeleteProductModal';
import type { Product } from '@/services/products';

export default function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch product directly by ID using the ID-based endpoint
  const { data: product, isLoading, error } = useProductByIdQuery(resolvedParams.id);
  const deleteProductMutation = useDeleteProductMutation();

  const handleDeleteSuccess = async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      router.push('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <PageSpinner className="h-64" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error?.message || 'Product not found'}</p>
          <Link 
            href="/admin/products" 
            className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = typeof product.category === 'object' && product.category?.name
    ? product.category.name
    : 'N/A';

  const fabricName = typeof product.fabricType === 'object' && product.fabricType?.name
    ? product.fabricType.name
    : 'N/A';

  const stock = typeof product.remainingInStock === 'number' 
    ? product.remainingInStock 
    : typeof product.quantity === 'number' 
      ? product.quantity 
      : parseInt(String(product.remainingInStock || product.quantity || '0')) || 0;

  const price = typeof product.price === 'number'
    ? product.price
    : parseInt(String(product.price || '0')) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/admin/products"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </Link>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
              >
                Edit Product
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div>
              <div className="mb-4">
                <img
                  src={product.images?.[selectedImageIndex] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                  }}
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image || '/placeholder-product.jpg'}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-900">{product.description || 'No description available'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Price</h3>
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(price)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Stock</h3>
                    <p className="text-lg font-semibold text-gray-900">{stock.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                    <p className="text-gray-900">{categoryName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Gender</h3>
                    <p className="text-gray-900 capitalize">{product.gender || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Fabric Type</h3>
                    <p className="text-gray-900">{fabricName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    <p className="text-gray-900">{product.location || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes && product.sizes.length > 0 ? (
                      product.sizes.map((size, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm"
                        >
                          {size}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No sizes available</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Product ID</h3>
                  <p className="text-gray-900 font-mono text-sm">{product.id || product._id || 'N/A'}</p>
                </div>

                {product.createdAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
                    <p className="text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        product={product as any}
        onSuccess={() => {
          setShowEditModal(false);
          // Refetch will happen automatically via React Query
        }}
      />

      {/* Delete Modal */}
      <DeleteProductModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        productId={product.id || product._id || ''}
        productName={product.name}
        onSuccess={() => handleDeleteSuccess(product.id || product._id || '')}
      />
    </div>
  );
}
