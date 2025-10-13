"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import ProductBreadcrumb from '@/components/Public_C/Ready_To_Wear/ProductBreadcrumb';
import ProductImageGallery from '@/components/Public_C/Ready_To_Wear/ProductImageGallery';
import CustomizationPanel from '@/components/Public_C/customize/CustomizationPanel';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating?: number;
  reviews?: number;
  description?: string;
  gender?: string;
  category?: string;
  fabricType?: string;
  seller?: string;
  shop?: string;
  createdAt?: string;
  updatedAt?: string;
  style?: string;
  fitType?: string;
  color?: string;
}

export default function ProductCustomizePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Fetch product data using the same pattern as the main product page
        const productData = await api<any>(`/api/product/${resolvedParams.slug}`).catch(() => null);

        // Handle product data
        if (!productData) {
          throw new Error('Product not found');
        }

        const product = productData.success && productData.data 
          ? productData.data 
          : productData;

        if (!product || !product._id) {
          throw new Error('Invalid product data format');
        }

        setProduct(product);

      } catch (err) {
        console.error('[ProductCustomize] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.slug) fetchProduct();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product for customization...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link href="/shop" className="text-blue-600 hover:underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom breadcrumb for customization */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gray-500">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href="/shop" className="ml-4 text-gray-400 hover:text-gray-500">
                    Shop
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href={`/shop/${product._id}`} className="ml-4 text-gray-400 hover:text-gray-500">
                    {product.name}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-500 font-medium">Customize</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-8">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Sticky Image Gallery */}
            <div className="col-span-7">
              <div className="sticky top-24 h-fit">
                <ProductImageGallery
                  images={product.images || []}
                  selectedImageIndex={selectedImageIndex}
                  onImageSelect={setSelectedImageIndex}
                  productName={product.name}
                />
              </div>
            </div>
            
            {/* Right: Scrollable Panel */}
            <div className="col-span-5">
              <CustomizationPanel product={product} />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex flex-col lg:flex-row gap-10">
            <ProductImageGallery
              images={product.images || []}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              productName={product.name}
            />
            <CustomizationPanel product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
