import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import useToast from '@/hooks/use-toast';

interface RecommendedProduct {
  _id: string;
  name: string;
  price: number;
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

  const RecommendedProductCard: React.FC<{ product: RecommendedProduct }> = ({ product }) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);

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
              className="w-full h-48 sm:h-64 object-cover"
            />
            <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
              <Heart className={`w-5 h-5 ${product.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
          <div className="p-4">
            <h4 className="text-sm text-gray-800 mb-2 line-clamp-2">{product.name}</h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold text-gray-900">{formatPrice(product.price)}</span>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="p-2 transition-colors cursor-pointer text-gray-600 hover:text-yellow-400 disabled:opacity-50"
                aria-label="Add to cart"
              >
                <ShoppingCart className={`w-5 h-5 ${isAddingToCart ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-500">({product.reviews || 0})</span>
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
      <div className='mt-8 md:mt-16'>
        <h3 className="text-lg text-[#3D3D3D] font-bold mb-4 py-6 text-center">Recommended Items</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <RecommendedProductCard key={product._id} product={product} />
          ))}
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

export default RecommendedProducts; 