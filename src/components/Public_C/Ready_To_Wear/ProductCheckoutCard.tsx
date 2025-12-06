import React, { useState, useEffect } from 'react';
import { Heart, Star, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/contexts/toast-context';
import { api } from '@/utils/api';
import { formatPrice } from '@/utils/currency';
import SizeGuide from './SizeGuide';
import { useToggleWishlistMutation, useIsInWishlist } from '@/hooks/useWishlist';
import { useAuthAwareCartActions } from '@/hooks/use-cart';

interface ProductCheckoutCardProps {
  product: {
    _id?: string;
    name: string;
    price: number | string;
    images: string[];
    description?: string;
    rating?: number;
    reviews?: number;
    sizes?: string[];
  };
  selectedSize: string;
  isLiked: boolean;
  isAddingToCart?: boolean;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  onToggleLike: () => void;
}

const ProductCheckoutCard: React.FC<ProductCheckoutCardProps> = ({
  product,
  selectedSize,
  isLiked,
  isAddingToCart = false,
  onSizeSelect,
  onAddToCart,
  onToggleLike
}) => {
  const [isAddingToCartLocal, setIsAddingToCartLocal] = useState(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  const router = useRouter();
  const toggleWishlistMutation = useToggleWishlistMutation();
  const isInWishlist = useIsInWishlist(product._id);
  const { addToCart: addToCartAction } = useAuthAwareCartActions();

  // Map size names to single letters (same as new arrivals)
  const getSizeLetter = (size: string): string => {
    const sizeMap: Record<string, string> = {
      'small': 'S',
      'medium': 'M',
      'large': 'L',
      'extra-large': 'XL',
      'extra small': 'XS',
      'xxl': 'XXL',
    };
    return sizeMap[size.toLowerCase()] || size.charAt(0).toUpperCase();
  };

  // Auto-select first size if available and none selected
  useEffect(() => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      onSizeSelect(product.sizes[0]);
    }
  }, [product.sizes, selectedSize, onSizeSelect]);

  const renderStars = (rating: number = 4) => (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${index < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const handleAddToCart = async () => {
    if (isAddingToCartLocal) return;

    // Validate size selection
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      addToast('Please select a size', 'error');
      return;
    }

    setIsAddingToCartLocal(true);

    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png';
    const productId = product._id || '';
    const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

    if (!productId) {
      addToast("Product ID is missing", "error");
      setIsAddingToCartLocal(false);
      return;
    }

    try {
      // Use the centralized cart hook - handles optimistic update, server sync, and error handling
      await addToCartAction({
        id: productId,
        quantity: 1,
        price: productPrice,
        name: product.name,
        image: imageUrl,
        size: selectedSize, // Include selected size
      });

      addToast("Item added to cart successfully", "success");
      onAddToCart();
    } catch (error) {
      addToast("Failed to add item to cart", "error");
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCartLocal(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product._id) {
      console.error('Product ID is missing');
      return;
    }

    if (!isAuthenticated) {
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

  // ✅ NEW: Verify auth status before navigation
  const handleCustomizeClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Always prevent default to check auth first

    // Quick check from store
    if (!isAuthenticated) {
      addToast('Please sign in to customize this product', 'error');
      router.push('/signin');
      return;
    }

    // Verify token is still valid by hitting an auth endpoint
    setIsVerifyingAuth(true);
    try {
      console.log('[Customize] Verifying auth before navigation...');

      // Quick ping to verify session (this will auto-refresh if needed)
      await api('/api/auth/me');

      console.log('[Customize] ✅ Auth verified, navigating...');

      // Auth is valid, navigate to customize page
      router.push(`/shop/${product._id}/customize`);

    } catch (error: any) {
      console.error('[Customize] Auth verification failed:', error);

      // Token expired or invalid
      if (error?.status === 401 || error?.message?.includes('Token expired')) {
        addToast('Your session has expired. Please sign in again.', 'error');
        router.push('/signin');
      } else {
        addToast('Unable to verify your session. Please try again.', 'error');
      }
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  return (
    <>
      <div className="w-full lg:w-auto lg:max-w-sm xl:max-w-md order-3">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6">
          {/* Name & Review */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{product.name}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-500">({product.reviews || 0})</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
          </div>

          {/* Size Guide */}
          <div
            className="flex items-center gap-2 mb-4 cursor-pointer text-blue-600 hover:underline"
            onClick={() => setIsSizeGuideOpen(true)}
          >
            <Image
              src="/style_guide.png"
              alt="Size guide"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-sm">Size guide</span>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => {
                  const sizeLetter = getSizeLetter(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => onSizeSelect(size)}
                      className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-colors ${isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                    >
                      {sizeLetter}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleCustomizeClick}
              disabled={isVerifyingAuth}
              className={`flex-1 py-3 bg-black text-white rounded-lg font-medium transition-colors text-sm text-center ${isVerifyingAuth
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-800'
                }`}
            >
              {isVerifyingAuth ? (
                <div className="flex justify-center items-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                'CUSTOMIZE'
              )}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCartLocal}
              className={`flex-1 py-3 bg-[#D4AF37] text-white rounded-lg font-medium transition-colors text-sm ${isAddingToCartLocal
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#B8941F]'
                }`}
            >
              {isAddingToCartLocal ? (
                <div className="flex justify-center items-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : 'ADD TO CART'}
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${isInWishlist ? 'border-[#D4AF37] bg-[#FFF9E5]' : 'border-gray-300 bg-white'} transition-colors`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-400'}`} />
            </button>
          </div>

          {/* Expandable Product Description */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium text-gray-900">Product description</span>
              {isDescriptionExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {isDescriptionExpanded && (
              <div className="mt-3 text-gray-700 text-sm leading-relaxed">
                {product.description || 'No description available.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuide
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </>
  );
};

export default ProductCheckoutCard;