'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import CategorySidebar from './CategorySidebar';
import ProductGrid from './ProductGrid';
import { TrendingFashionGalleryProps } from './types';
import { useTrendingFashionStore } from '@/store/trendingFashionStore';
import { useHomepageProducts } from '@/hooks/useProducts';
import { useCategoriesQuery } from '@/hooks/useCategories';
import { type Product } from '@/services/products';

// Helper to get category name from product
const getProductCategoryName = (product: Product): string => {
  if (typeof product.category === 'string') {
    return product.category;
  }
  if (product.category && typeof product.category === 'object') {
    return product.category.name;
  }
  return '';
};

const TrendingFashionGallery: React.FC<TrendingFashionGalleryProps> = ({
  categories: propCategories,
  onCategoryChange: propOnCategoryChange,
  initialCategory,
  products: propProducts,
  isLoading: propIsLoading,
}) => {
  // Zustand UI state (active category, filtered products)
  const {
    activeCategory,
    filteredProducts,
    setActiveCategory,
    setFilteredProducts,
  } = useTrendingFashionStore();

  // React Query: Fetch categories (cached 10min)
  const { data: queryCategories = [], isLoading: isLoadingCategories } = useCategoriesQuery();

  // React Query: Fetch products (cached 5min) - only if not provided as props
  const { data: queryProducts = [], isLoading: isLoadingProducts } = useHomepageProducts();

  // Use provided categories/products or fetched ones
  const categories = propCategories || queryCategories;
  const allProducts = propProducts || queryProducts;
  const isLoading = propProducts ? propIsLoading : isLoadingProducts;

  // Filter products by active category (client-side filtering)
  const filtered = useMemo(() => {
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      return [];
    }

    const matched = allProducts.filter(product => {
      const productCategoryName = getProductCategoryName(product);
      return productCategoryName === activeCategory;
    });

    // Limit to 9 products for performance
    return matched.slice(0, 9);
  }, [allProducts, activeCategory]);

  // Track previous filtered products to prevent infinite loops
  const prevFilteredRef = useRef<string>('');
  
  // Update Zustand store with filtered products (for child components)
  // Only update if the product IDs actually changed (prevents infinite loop)
  useEffect(() => {
    const currentIds = filtered.map(p => p._id || p.id).join(',');
    if (currentIds !== prevFilteredRef.current) {
      prevFilteredRef.current = currentIds;
      setFilteredProducts(filtered);
    }
  }, [filtered, setFilteredProducts]);

  // Set initial category if provided
  useEffect(() => {
    if (initialCategory && initialCategory !== activeCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory, activeCategory, setActiveCategory]);

  // Handle category change
  const handleCategoryChange = (categoryName: string) => {
    setActiveCategory(categoryName);
    propOnCategoryChange?.(categoryName);
  };

  // Products are not clickable - removed handleProductClick

  // Show error state if React Query failed (categories would be fallback)
  const hasError = categories.length === 0 && !isLoadingCategories;

  if (hasError) {
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
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-[#D4AF37] hover:bg-[#B8941F] text-white font-medium rounded-lg transition-colors"
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

          {/* Right: Product Grid - Products are not clickable */}
          <ProductGrid
            products={filteredProducts}
            activeCategory={activeCategory}
            loading={isLoading}
          />
        </div>
      </div>
    </section>
  );
};

export default TrendingFashionGallery;
