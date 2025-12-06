import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import { useToast } from '@/contexts/toast-context';
import { formatPrice } from '@/utils/currency';
import { useToggleWishlistMutation, useIsInWishlist } from '@/hooks/useWishlist';
import { SizeSelectorPopover } from '../shop/SizeSelectorPopover';

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
  product: Product | null | undefined;
  toggleLike: (id: string) => void;
  isLoggedIn?: boolean;
  /** Optional: show a gold ring spinner while products load */
  isLoading?: boolean;
}

const renderStars = (rating: number = 4) => (
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`w-4 h-4 ${index < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`}
    />
  ))
);

/** Gold ring spinner (for loading products) */
const GoldRingSpinner: React.FC = () => (
  <div className="w-full flex items-center justify-center py-10">
    <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  toggleLike,
  isLoggedIn = false,
  isLoading = false,
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSizePopover, setShowSizePopover] = useState(false);
  const addToCartBtnRef = React.useRef<HTMLButtonElement>(null);

  const { addToCart: addToCartAction } = useAuthAwareCartActions();
  const { addToast } = useToast();
  const toggleWishlistMutation = useToggleWishlistMutation();
  const isInWishlist = useIsInWishlist(product?._id || '');

  // Loading state (gold ring spinner)
  if (isLoading) {
    return <GoldRingSpinner />;
  }

  // No product available — say nothing in store
  if (!product || !product._id) {
    return <div className="text-center text-sm text-gray-500 py-6">Nothing in store</div>;
  }

  const imageUrl = product.images?.[0] || '';
  const displayName = product.name;
  const displayPrice = product.price;
  const displayRating = product.rating ?? 4; // keep star UI consistent
  const isLiked = product.isLiked || false;
  const remainingInStock = product.remainingInStock ?? product.quantity ?? 0;
  const availableSizes = product.sizes || [];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart) return;
    setShowSizePopover(true);
  };

  const onSizeConfirm = async (size: string, qty: number) => {
    if (qty <= 0) return;

    setIsAddingToCart(true);
    try {
      await addToCartAction({
        id: product._id,
        quantity: qty,
        price: product.price,
        name: product.name,
        image: imageUrl,
        size: size
      });
      addToast('Item added to cart successfully', 'success');
    } catch (error) {
      addToast('Failed to add item to cart', 'error');
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      addToast('Please login to add to wishlist', 'error');
      return;
    }

    try {
      const result = await toggleWishlistMutation.mutateAsync({ productId: product._id });
      addToast(result.message, result.added ? 'success' : 'info');
    } catch (error) {
      addToast('Failed to update wishlist', 'error');
      console.error('Failed to toggle wishlist:', error);
    }
  };

  return (
    <>
      <Link href={`/shop/${product._id}`} className="block w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="relative">
            <img
              src={imageUrl}
              alt={displayName}
              className="w-full h-36 sm:h-40 object-cover"  /* reduced height further */
            />
            <button
              onClick={handleToggleWishlist}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <Heart
                className={`w-5 h-5 ${isInWishlist ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-400'}`}
              />
            </button>
          </div>
          <div className="p-2.5"> {/* tighter padding */}
            <h4 className="text-sm text-gray-800 mb-1 line-clamp-2">{displayName}</h4>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              <div ref={addToCartBtnRef}>
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  type="button"
                  className={`p-2 transition-all duration-200 rounded-full ${isAddingToCart || showSizePopover
                    ? 'bg-gray-100 cursor-not-allowed opacity-60'
                    : 'text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 cursor-pointer'
                    }`}
                  aria-label={isAddingToCart ? 'Adding to cart...' : 'Add to cart'}
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {renderStars(displayRating)}
              </div>
              <span className="text-xs text-gray-500">({remainingInStock})</span>
            </div>
          </div>
        </div>
      </Link>

      {showSizePopover && (
        <React.Suspense fallback={null}>
          <SizeSelectorPopover
            isOpen={showSizePopover}
            onClose={() => setShowSizePopover(false)}
            sizeBreakdown={{}} // Empty to start fresh
            availableSizes={availableSizes}
            onSizeQuantityChange={onSizeConfirm}
            anchorRef={addToCartBtnRef}
            mode="increase"
          />
        </React.Suspense>
      )}
    </>
  );
};

export default ProductCard;
