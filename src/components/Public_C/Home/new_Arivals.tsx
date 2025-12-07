"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { type Product } from '@/services/products';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import { useToast } from '@/contexts/toast-context';
import { formatPrice } from '@/utils/currency';
import { NewArrivalsSkeleton } from '@/components/common/skeletons';
import { getSizeInitial } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
  className?: string;
  imagePosition?: 'top' | 'center';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = "",
  imagePosition = 'top'
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addToCart: addToCartAction } = useAuthAwareCartActions();
  const { addToast } = useToast();

  const imageUrl = product.images?.[0] || '';
  const displayName = product.name;
  const displayPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const productId = product._id || product.id || '';
  const sizes = product.sizes || [];

  // Auto-select first size if available and none selected
  useEffect(() => {
    if (!selectedSize && sizes.length > 0) {
      setSelectedSize(sizes[0]);
    }
  }, [sizes, selectedSize]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart) return;

    if (!selectedSize && sizes.length > 0) {
      addToast('Please select a size', 'error');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCartAction({
        id: productId,
        quantity: 1,
        price: displayPrice,
        name: displayName,
        image: imageUrl,
        size: selectedSize, // Include selected size
        availableSizes: sizes, // Include all available sizes from product
      });
      addToast('Item added to cart successfully', 'success');
    } catch (error) {
      addToast('Failed to add item to cart', 'error');
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image */}
      <div className="relative w-full h-full">
        <img
          src={imageUrl}
          alt={displayName}
          className={`w-full h-full object-cover ${
            imagePosition === 'center' 
              ? 'object-[center_25%]' 
              : 'object-top'
          }`}
        />

        {/* Glassmorphic overlay for bottom content */}
        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-lg bg-black/20 border-t border-white/20 p-2">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-white font-semibold text-sm line-clamp-1 flex-1 min-w-0">
              {displayName}
            </h3>
            <span className="text-white font-bold text-sm whitespace-nowrap">
              {formatPrice(displayPrice)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            {/* Size buttons on the left */}
            {sizes.length > 0 && (
              <div className="flex items-center gap-1.5">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(size);
                      }}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200 backdrop-blur-sm ${
                        isSelected
                          ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
                          : 'bg-white/20 border-white/30 text-white/90 hover:bg-white/30'
                      }`}
                      aria-label={`Select size ${size}`}
                    >
                      {getSizeInitial(size)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Cart button on the right */}
            <motion.button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`${
                !isAddingToCart ? 'group hover:bg-white/20 cursor-pointer' : 'pointer-events-none opacity-60'
              } flex items-center gap-1 rounded-full px-2.5 py-1 backdrop-blur-sm border border-white/30 text-xs font-medium transition-all duration-300`}
              style={{ color: '#FFFFFFB2' }}
              whileHover={!isAddingToCart ? { scale: 1.05 } : {}}
              whileTap={!isAddingToCart ? { scale: 0.95 } : {}}
              aria-busy={isAddingToCart}
              aria-label={isAddingToCart ? 'Adding to cart' : 'Add to cart'}
            >
              <div
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center
                           transition-all duration-300 group-hover:bg-black group-hover:translate-x-6"
              >
                {isAddingToCart ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ShoppingCart
                    size={12}
                    className="transition-all duration-700 group-hover:text-[#FDC713]"
                  />
                )}
              </div>
              <span className="transition-opacity duration-300 group-hover:opacity-0">{isAddingToCart ? 'Adding...' : 'Add'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ProductCardsGridProps {
  products?: Product[];
  isLoading?: boolean;
}

const ProductCardsGrid: React.FC<ProductCardsGridProps> = ({ 
  products: propProducts = [], 
  isLoading = false 
}) => {
  const error = null; // Error handling is done at the parent level
  
  // Get the 5 newest products (already sorted by createdAt desc from API)
  const products = React.useMemo(() => {
    if (!propProducts || propProducts.length === 0) return [];

    // Sort by createdAt to ensure we get the newest ones
    const sorted = [...propProducts].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
    });
    
    return sorted.slice(0, 5);
  }, [propProducts]);

  // Loading state - custom skeleton matching the masonry layout
  if (isLoading) {
    return <NewArrivalsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              New Arrivals
            </h1>
          </div>
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-500 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              New Arrivals
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Illustration - Same as Trending Styles section */}
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
              <img
                src="/unauthorized.png"
                alt="No Products"
                width={128}
                height={128}
                className=""
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No new arrivals available
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              We couldn't find any new arrivals at the moment. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h1>
        </motion.div>

        {/* Mobile Layout - Stacked */}
        <div className="block md:hidden space-y-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id || product.id || index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Desktop Layout - Custom Grid */}
        <div
          className="
    hidden md:grid grid-cols-3 gap-3
    h-[300px] md:h-[550px] lg:h-[600px]"
          style={{
            gridTemplateRows: '150px 150px 250px'
          }}
        >
          {/* Product 1 - spans all three rows, col 1 */}
          {products[0] && (
            <motion.div
              className="row-span-3 col-span-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ProductCard product={products[0]} className="h-full" />
            </motion.div>
          )}

          {/* Product 2 - spans rows 1-2, col 2 */}
          {products[1] && (
            <motion.div
              className="row-span-2 col-span-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ProductCard product={products[1]} className="h-full" imagePosition="center" />
            </motion.div>
          )}

          {/* Product 3 - spans rows 1-2, col 3 */}
          {products[2] && (
            <motion.div
              className="row-span-2 col-span-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <ProductCard product={products[2]} className="h-full" imagePosition="center" />
            </motion.div>
          )}

          {/* Product 4 - row 3, col 2 */}
          {products[3] && (
            <motion.div
              className="row-span-1 col-span-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ProductCard product={products[3]} className="h-full" imagePosition="center" />
            </motion.div>
          )}

          {/* Product 5 - row 3, col 3 */}
          {products[4] && (
            <motion.div
              className="row-span-1 col-span-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <ProductCard product={products[4]} className="h-full" imagePosition="center" />
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCardsGrid;
