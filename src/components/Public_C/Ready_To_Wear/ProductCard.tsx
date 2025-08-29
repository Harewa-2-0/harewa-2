import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import { useToast } from '@/contexts/toast-context';

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
  isLoggedIn?: boolean; // Add this prop to check if user is logged in
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

const ProductCard: React.FC<ProductCardProps> = ({ product, toggleLike, isLoggedIn = false }) => {
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart: addToCartAction, isAuthenticated } = useAuthAwareCartActions();
  const { addToast } = useToast();

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // don't trigger Link/navigation
    
    // Prevent double-submit
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    
    try {
      // Use the centralized cart hook - handles optimistic update, server sync, and error handling
      await addToCartAction({
        id: product._id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: imageUrl,
      });
      
      // Show success toast
      addToast("Item added to cart successfully", "success");
    } catch (error) {
      // Show error toast - the hook already handled rollback
      addToast("Failed to add item to cart", "error");
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
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
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="p-2 transition-colors cursor-pointer text-gray-600 hover:text-yellow-400"
                aria-label="Add to cart"
              >
                <ShoppingCart className={`w-5 h-5 ${isAddingToCart ? 'animate-pulse' : ''}`} />
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

      {/* Toast notifications are now handled globally by ToastContainer */}
    </>
  );
};

export default ProductCard;
