'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { easeOut } from 'framer-motion';
import ProductCard from './ProductCard';
import { Product } from './types';

interface ProductGridProps {
  products: Product[];
  activeCategory: string;
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  activeCategory,
  loading = false,
}) => {
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut }
    }
  };

  if (loading) {
    // Show 5 skeletons on mobile, 9 on desktop
    const skeletonCount = isMobile ? 5 : 9;
    
    return (
      <div className="lg:flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Show skeleton cards to match the product limit */}
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
              data-testid="skeleton-card"
            >
              <div className="h-64 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="lg:flex-1">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {/* Illustration */}
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
            <img
              src="/unauthorized.png"
              alt="No Products"
              width={128}
              height={128}
              className=""
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products in this category
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            We couldn't find any products in the "{activeCategory}" category. 
            Try selecting a different category or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:flex-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              variants={itemVariants}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
