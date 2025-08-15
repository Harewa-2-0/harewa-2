import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';

export interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating?: number;
  reviews?: number;
  isLiked?: boolean;
  slug?: string;
  gender?: string;
  description?: string;
  quantity?: number;
  remainingInStock?: number;
  location?: string;
  sizes?: string[];
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

interface ProductCardProps {
  product: Product;
  toggleLike: (id: string) => void;
  // Pass the full product so the handler can send price & other info to API
  addToCart: (product: Product) => void;
}

const formatPrice = (price: number) => `NGN ${price.toLocaleString()}`;

const renderStars = (rating: number = 4) => (
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`w-4 h-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
    />
  ))
);

const ProductCard: React.FC<ProductCardProps> = ({ product, toggleLike, addToCart }) => {
  const [imageError, setImageError] = useState(false);

  // Get the first image or use a placeholder
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : '/placeholder.png';

  // Fallback for missing data
  const displayName = product.name || 'Product Name';
  const displayPrice = product.price || 0;
  const displayRating = product.rating || 4;
  const isLiked = product.isLiked || false;
  const remainingInStock =
    product.remainingInStock ?? product.quantity ?? 0;

  return (
    <Link href={`/shop/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
        <div className="relative">
          <img
            src={imageError ? '/placeholder.png' : imageUrl}
            alt={displayName}
            className="w-full h-64 sm:h-80 object-cover"
            onError={() => setImageError(true)}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleLike(product._id);
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>
        <div className="p-4">
          <h4 className="text-sm text-gray-800 mb-2 line-clamp-2">
            {displayName}
          </h4>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(displayPrice)}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); // don’t trigger Link/navigation
                addToCart(product);
              }}
              className="p-2 text-gray-600 hover:text-yellow-400 transition-colors cursor-pointer"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>

          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {renderStars(displayRating)}
            </div>
            <span className="text-sm text-gray-500">
              ({remainingInStock})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
