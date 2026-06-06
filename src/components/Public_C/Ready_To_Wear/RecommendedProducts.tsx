import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import { useToast } from '@/contexts/toast-context';
import { formatPrice } from '@/utils/currency';
import { useToggleWishlistMutation, useIsInWishlist } from '@/hooks/useWishlist';
import { SizeInlineEditor } from '../shop/SizeInlineEditor';
import type { SizeBreakdown } from '@/store/cartStore';
import { useCartStore } from '@/store/cartStore';

interface RecommendedProduct {
  _id?: string;
  name: string;
  price: number | string;
  images: string[];
  rating?: number;
  reviews?: number;
  isLiked?: boolean;
  sizes?: string[];
}

interface RecommendedProductsProps {
  products: RecommendedProduct[];
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ products }) => {
  const { addToCart: addToCartAction, isAuthenticated, updateProductSizeQty } = useAuthAwareCartActions();
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
    const [showSizeEditor, setShowSizeEditor] = useState(false);
    const [sessionCounts, setSessionCounts] = useState<SizeBreakdown>({});
    const toggleWishlistMutation = useToggleWishlistMutation();
    const isInWishlist = useIsInWishlist(product._id);
    const availableSizes = product.sizes || [];
    const imageUrl = product.images?.[0] || '/placeholder.png';
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

    const syncSessionFromCart = () => {
      if (!product._id) return;
      const cartItem = useCartStore.getState().items.find((i) => i.id === product._id);
      if (cartItem?.sizeBreakdown) {
        setSessionCounts({ ...cartItem.sizeBreakdown });
      } else {
        setSessionCounts({});
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

    const addProductToCart = async (size: string, quantity = 1) => {
      if (!product._id) return false;
      setIsAddingToCart(true);
      try {
        await addToCartAction({
          id: product._id,
          quantity,
          price,
          name: product.name,
          image: imageUrl,
          size,
          availableSizes,
        });
        return true;
      } catch (error) {
        addToast('Failed to add item to cart', 'error');
        console.error('Failed to add item to cart:', error);
        return false;
      } finally {
        setIsAddingToCart(false);
      }
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isAddingToCart) return;

      if (availableSizes.length <= 1) {
        const ok = await addProductToCart(availableSizes[0] || '');
        if (ok) addToast('Item added to cart successfully', 'success');
        return;
      }

      if (showSizeEditor) {
        handleEditorClose();
        return;
      }

      const cartItem = product._id
        ? useCartStore.getState().items.find((i) => i.id === product._id)
        : undefined;
      setSessionCounts(cartItem?.sizeBreakdown ? { ...cartItem.sizeBreakdown } : {});
      setShowSizeEditor(true);
    };

    const handleSizeIncrease = async (size: string) => {
      if (isAddingToCart) return;
      const ok = await addProductToCart(size);
      if (ok) syncSessionFromCart();
    };

    const handleSizeDecrease = async (size: string) => {
      if (isAddingToCart || !product._id) return;
      const currentQty = sessionCounts[size] || 0;
      if (currentQty <= 0) return;

      setIsAddingToCart(true);
      try {
        await updateProductSizeQty(product._id, size, currentQty - 1);
        syncSessionFromCart();
      } catch (error) {
        addToast('Failed to update cart', 'error');
        console.error('Failed to decrease size quantity:', error);
      } finally {
        setIsAddingToCart(false);
      }
    };

    const handleEditorClose = () => {
      const added = Object.values(sessionCounts).some((qty) => qty > 0);
      if (added) {
        addToast('Items added to cart', 'success');
      }
      setShowSizeEditor(false);
      setSessionCounts({});
    };

    return (
      <div
        className={`bg-white rounded-lg shadow-sm border group hover:shadow-md transition-all duration-300 ${
          showSizeEditor
            ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/25 overflow-visible'
            : 'border-gray-200 overflow-hidden'
        }`}
      >
        <Link href={`/shop/${product._id}`} className="block">
          <div className="relative">
            <img
              src={imageUrl}
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
          <h4 className="text-sm text-gray-800 mb-1 line-clamp-2 px-2.5 pt-2.5">{product.name}</h4>
        </Link>

        <div className="px-1 pb-2.5 sm:px-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              type="button"
              className={`p-2 transition-all duration-200 rounded-full ${
                isAddingToCart
                  ? 'bg-gray-100 cursor-not-allowed opacity-60'
                  : showSizeEditor
                    ? 'text-[#D4AF37] bg-[#D4AF37]/10 cursor-pointer'
                    : 'text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 cursor-pointer'
              }`}
              aria-label={
                isAddingToCart
                  ? 'Adding to cart...'
                  : showSizeEditor
                    ? 'Close size selector'
                    : 'Add to cart'
              }
            >
              {isAddingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            {renderStars(product.rating)}
            <span className="text-xs text-gray-500">({product.reviews || 0})</span>
          </div>

          <div className="-mx-1 sm:mx-0">
            <SizeInlineEditor
              isOpen={showSizeEditor}
              sizes={availableSizes}
              sizeBreakdown={sessionCounts}
              onIncrease={handleSizeIncrease}
              onDecrease={handleSizeDecrease}
              onClose={handleEditorClose}
              isPending={isAddingToCart}
              layout="compact"
              title="Tap size to add"
            />
          </div>
        </div>
      </div>
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
    </>
  );
};

export default RecommendedProducts;
