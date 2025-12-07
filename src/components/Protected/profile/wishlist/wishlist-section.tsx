'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import EmptyState from '@/components/common/empty-state';
import { useWishlistQuery, useToggleWishlistMutation } from '@/hooks/useWishlist';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import { useToast } from '@/contexts/toast-context';
import { formatPrice } from '@/utils/currency';

export default function WishlistSection() {
  const { data: wishlistItems = [], isLoading, error } = useWishlistQuery();
  const toggleWishlistMutation = useToggleWishlistMutation();
  const { addToCart: addToCartAction } = useAuthAwareCartActions();
  const { addToast } = useToast();
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const result = await toggleWishlistMutation.mutateAsync({ productId });
      addToast(result.message, 'info');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      addToast('Failed to remove from wishlist', 'error');
    }
  };

  const handleAddToCart = async (productId: string, product: any) => {
    if (addingToCart.has(productId)) return;

    setAddingToCart(prev => new Set(prev).add(productId));
    
    try {
      const imageUrl = product.images?.[0] || '/placeholder.png';
      
      await addToCartAction({
        id: productId,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: imageUrl,
      });
      
      addToast('Item added to cart successfully', 'success');
    } catch (error) {
      addToast('Failed to add item to cart', 'error');
      console.error('Failed to add item to cart:', error);
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white md:m-6 md:rounded-lg md:border p-6">
        <div className="border-b pb-4 mb-6">
          <h2 className="text-lg font-semibold text-black">Wishlist</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#D4AF37] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white md:m-6 md:rounded-lg md:border p-6">
        <div className="border-b pb-4 mb-6">
          <h2 className="text-lg font-semibold text-black">Wishlist</h2>
        </div>
        <EmptyState
          title="Error loading wishlist"
          description={error?.message || String(error) || 'Failed to load wishlist. Please try again.'}
        />
      </div>
    );
  }

  return (
    <div className="bg-white md:m-6 md:rounded-lg md:border p-6">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-lg font-semibold text-black">Wishlist</h2>
        {wishlistItems.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">{wishlistItems.length} items</p>
        )}
      </div>

      {/* If wishlist is empty */}
      {wishlistItems.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="You don't have any product in the wishlist yet."
        />
      ) : (
        <div className="space-y-4">
          {/* Map through wishlist items */}
          {wishlistItems.map((item) => {
            const isAddingToCart = addingToCart.has(item._id);
            const imageUrl = item.images?.[0] || '/placeholder.png';
            
            return (
              <div
                key={item._id}
                className="border rounded-lg hover:shadow-sm transition-shadow p-4"
              >
                {/* Top Section: Image + Details */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Product Image */}
                  <Link href={`/shop/${item._id}`} className="flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-grow min-w-0">
                    <Link href={`/shop/${item._id}`}>
                      <h3 className="font-medium text-gray-800 mb-1 hover:text-[#D4AF37] transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">
                      Added {formatDate(item.createdAt || new Date().toISOString())}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-semibold">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Actions (Mobile-Optimized) */}
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => handleAddToCart(item._id, item)}
                    disabled={isAddingToCart}
                    className={`flex-1 py-2.5 bg-[#D4AF37] text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2 ${
                      isAddingToCart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#B8941F]'
                    }`}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="hidden sm:inline">Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>ADD TO CART</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item._id)}
                    disabled={toggleWishlistMutation.isPending}
                    className="p-2.5 bg-[#FFF9E5] rounded-lg text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    aria-label="Remove from wishlist"
                  >
                    {toggleWishlistMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}