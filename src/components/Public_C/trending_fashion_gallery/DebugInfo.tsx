'use client';

import React from 'react';
import { useTrendingFashionStore } from '@/store/trendingFashionStore';

const DebugInfo: React.FC = () => {
  const { 
    allProducts, 
    filteredProducts, 
    activeCategory, 
    categories, 
    isLoadingCategories,
    hasCategoriesLoaded 
  } = useTrendingFashionStore();

  // Get unique categories from products
  const getProductCategoryName = (product: any): string => {
    if (typeof product.category === 'string') {
      return product.category;
    }
    if (product.category && typeof product.category === 'object') {
      return product.category.name;
    }
    return '';
  };

  const uniqueCategories = [...new Set(allProducts.map(p => getProductCategoryName(p)))];

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-1">
        <p>Total Products: {allProducts.length}</p>
        <p>Filtered Products: {filteredProducts.length}</p>
        <p>Active Category: {activeCategory}</p>
        <p>Categories Loaded: {hasCategoriesLoaded ? 'Yes' : 'No'}</p>
        <p>Loading Categories: {isLoadingCategories ? 'Yes' : 'No'}</p>
        <div>
          <p className="font-semibold">API Categories ({categories.length}):</p>
          <ul className="ml-2 max-h-16 overflow-y-auto">
            {categories.map((cat, index) => (
              <li key={index} className="text-xs">• {cat.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold">Product Categories:</p>
          <ul className="ml-2 max-h-16 overflow-y-auto">
            {uniqueCategories.map((cat, index) => (
              <li key={index} className="text-xs">• {cat}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;
