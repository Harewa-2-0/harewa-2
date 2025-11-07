import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import { useToast } from '@/contexts/toast-context';
import { formatPrice } from '@/utils/currency';
import { useToggleWishlistMutation, useIsInWishlist } from '@/hooks/useWishlist';

interface RecommendedProduct {
  _id?: string;
  name: string;
  price: number | string;
  images: string[];
  rating?: number;
  reviews?: number;
  isLiked?: boolean;
}

interface RecommendedProductsProps {
  products: RecommendedProduct[];
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ products }) => {
  const { addToCart: addToCartAction, isAuthenticated } = useAuthAwareCartActions();
  const { addToast } = useToast();

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

  const RecommendedProductCard: React.FC<{ product: RecommendedProduct }> = ({ product }) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const toggleWishlistMutation = useToggleWishlistMutation();
    const isInWishlist = useIsInWishlist(product._id);

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

    const handleAddToCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation(); // don't trigger Link/navigation
      
      // Prevent double-submit
      if (isAddingToCart) return;

      setIsAddingToCart(true);
      
      // Get the first image or use a placeholder
      const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png';
      
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
      <Link href={`/shop/${product._id}`} className="block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="relative">
            <img
              src={product.images?.[0] || '/placeholder.png'}
              alt={product.name}
              className="w-full h-36 sm:h-40 object-cover"
            />
            <button 
              onClick={handleToggleWishlist}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-400'}`} />
            </button>
          </div>
          <div className="p-2.5">
            <h4 className="text-sm text-gray-800 mb-1 line-clamp-2">{product.name}</h4>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`p-2 transition-all duration-200 rounded-full ${
                  isAddingToCart
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
            <div className="flex items-center justify-between">
              {renderStars(product.rating)}
              <span className="text-xs text-gray-500">({product.reviews || 0})</span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <div className='mt-8 md:mt-16 max-w-4xl mx-auto px-2 lg:px-4'>
        <h3 className="text-lg text-[#3D3D3D] font-bold mb-4 py-6 text-center">Recommended Items</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <RecommendedProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      {/* Toast notifications are now handled globally by ToastContainer */}
    </>
  );
};

export default RecommendedProducts; 