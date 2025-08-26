import React, { useState } from 'react';
import { Heart, Info, Star } from 'lucide-react';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import useToast from '@/hooks/use-toast';

interface ProductCheckoutCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    description?: string;
    rating?: number;
    reviews?: number;
    sizes?: string[]; // (unused now)
  };
  // Deprecated/unused (kept to avoid breaking parents)
  selectedSize: string;
  isLiked: boolean;
  isAddingToCart?: boolean;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  onToggleLike: () => void;
}

const ProductCheckoutCard: React.FC<ProductCheckoutCardProps> = ({
  product,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedSize: _selectedSize,
  isLiked,
  isAddingToCart = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSizeSelect: _onSizeSelect,
  onAddToCart,
  onToggleLike
}) => {
  const [isAddingToCartLocal, setIsAddingToCartLocal] = useState(false);
  const { addToCart: addToCartAction, isAuthenticated } = useAuthAwareCartActions();
  const { addToast, toasts, setToasts } = useToast();

  const formatPrice = (price: number) => `NGN ${price.toLocaleString()}`;

  const renderStars = (rating: number = 4) => (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const handleAddToCart = async () => {
    // Prevent double-submit
    if (isAddingToCartLocal) return;

    setIsAddingToCartLocal(true);

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

      // Parent callback for UI side-effects only
      onAddToCart();
    } catch (error) {
      // Show error toast - the hook already handled rollback
      addToast("Failed to add item to cart", "error");
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCartLocal(false);
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

          {/* Style Guide (image to be added later) */}
          <div className="flex items-center gap-2 mb-4 cursor-pointer text-blue-600 hover:underline">
            <Info className="w-4 h-4" />
            <span className="text-sm">Style Guide</span>
          </div>

          {/* Add to Cart & Like */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCartLocal}
              className={`flex-1 py-3 bg-yellow-600 text-white rounded-lg font-medium transition-colors text-sm ${
                isAddingToCartLocal
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-yellow-700'
              }`}
            >
              {isAddingToCartLocal ? (
                <div className="flex justify-center items-center">
                  <svg className="animate-spin h-5 w-5 text-[#fdc713]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : 'Add to Cart'}
            </button>
            <button
              onClick={onToggleLike}
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${isLiked ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} transition-colors`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>

          {/* Description */}
          <div className="text-gray-700 text-sm leading-relaxed">
            {product.description || 'No description available.'}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg text-white max-w-sm flex items-center gap-3 relative overflow-hidden ${
              toast.type === "success"
                ? "bg-[#fdc713] text-black"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === "success" ? (
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : toast.type === "error" ? (
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 text-gray-600 hover:text-gray-800 text-lg font-bold flex-shrink-0"
            >
              ×
            </button>

            {/* Running line animation */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
              <div className="h-full bg-white/60 animate-[progress_3s_linear_forwards]"></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProductCheckoutCard;
