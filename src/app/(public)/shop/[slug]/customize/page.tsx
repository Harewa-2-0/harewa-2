"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useProductByIdQuery } from '@/hooks/useProducts';
import { ProductDetailSkeleton } from '@/components/common/skeletons';
import ProductBreadcrumb from '@/components/Public_C/Ready_To_Wear/ProductBreadcrumb';
import ProductImageGallery from '@/components/Public_C/Ready_To_Wear/ProductImageGallery';
import CustomizationPanel from '@/components/Public_C/customize/CustomizationPanel';

export default function ProductCustomizePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // React Query: Fetch product (shared cache with product detail page!)
  const { data: product, isLoading: loading, error: queryError } = useProductByIdQuery(resolvedParams.slug);

  const error = queryError ? queryError.message : null;

  if (loading) {
    return <ProductDetailSkeleton />;
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
      <ProductBreadcrumb productName={product.name} gender={product.gender} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Desktop */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-7">
              <ProductImageGallery
                images={product.images || []}
                selectedImageIndex={selectedImageIndex}
                onImageSelect={setSelectedImageIndex}
                productName={product.name}
              />
            </div>
            <div className="col-span-5">
              <CustomizationPanel product={product} />
            </div>
          </div>
        </div>

        {/* Mobile */}
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
