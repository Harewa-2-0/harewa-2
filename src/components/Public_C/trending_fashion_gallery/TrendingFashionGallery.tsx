'use client';

import React, { useEffect } from 'react';
import CategorySidebar from './CategorySidebar';
import ProductGrid from './ProductGrid';
import { Category, TrendingFashionGalleryProps } from './types';
import { useTrendingFashionStore } from '@/store/trendingFashionStore';

const TrendingFashionGallery: React.FC<TrendingFashionGalleryProps> = ({
  categories: propCategories,
  onProductClick,
  onCategoryChange: propOnCategoryChange,
  initialCategory,
}) => {
  // Use the store
  const {
    allProducts,
    filteredProducts,
    categories: storeCategories,
    activeCategory,
    isLoading,
    isLoadingCategories,
    error,
    hasInitialized,
    hasCategoriesLoaded,
    setActiveCategory,
    initializeData,
    clearError,
  } = useTrendingFashionStore();

  // Use provided categories or store categories
  const categories = propCategories || storeCategories;

  // Handle category change
  const handleCategoryChange = (categoryName: string) => {
    setActiveCategory(categoryName);
    propOnCategoryChange?.(categoryName);
  };

  // Handle product click
  const handleProductClick = (product: any) => {
    onProductClick?.(product);
  };


  // Initialize data on mount
  useEffect(() => {
    if (!hasInitialized || !hasCategoriesLoaded) {
      initializeData();
    }
  }, [hasInitialized, hasCategoriesLoaded, initializeData]);

  // Set initial category if provided
  useEffect(() => {
    if (initialCategory && initialCategory !== activeCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory, activeCategory, setActiveCategory]);

  // Show network error state if there's an error
  if (error) {
    return (
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto md:px-8 px-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Illustration */}
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
              <svg
                className="w-16 h-16 text-red-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to fetch trending fashion
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              We're having trouble loading the latest fashion trends. 
              Please check your network connection and try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  clearError();
                  initializeData();
                }}
                className="inline-flex items-center px-6 py-3 bg-[#D4AF37] hover:bg-[#B8941F] text-white font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto md:px-8 px-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          {/* Left: Category Sidebar */}
          <CategorySidebar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            isLoading={isLoadingCategories}
          />

          {/* Right: Product Grid */}
          <ProductGrid
            products={filteredProducts}
            activeCategory={activeCategory}
            onProductClick={handleProductClick}
            loading={isLoading}
          />
        </div>
      </div>
    </section>
  );
};

export default TrendingFashionGallery;
