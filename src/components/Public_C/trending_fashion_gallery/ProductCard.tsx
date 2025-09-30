'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Product } from './types';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
  variants?: any;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  variants,
}) => {
  const handleCardClick = () => {
    onProductClick?.(product);
  };

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Only */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.images[0] || '/placeholder-fashion.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
    </motion.div>
  );
};

export default ProductCard;
