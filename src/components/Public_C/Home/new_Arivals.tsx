"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { getProducts, type Product } from '@/services/products';
import { useAuthAwareCartActions } from '@/hooks/use-cart';
import { useToast } from '@/contexts/toast-context';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = ""
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart: addToCartAction } = useAuthAwareCartActions();
  const { addToast } = useToast();

  const imageUrl = product.images?.[0] || '';
  const displayName = product.name;
  const displayPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const productId = product._id || product.id || '';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addToCartAction({
        id: productId,
        quantity: 1,
        price: displayPrice,
        name: displayName,
        image: imageUrl,
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
          className="w-full h-full object-cover object-top"
        />

        {/* Glassmorphic overlay for bottom content */}
        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-lg bg-black/20 border-t border-white/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold text-base line-clamp-2">
              {displayName}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base">
                NGN{displayPrice.toLocaleString()}
              </span>
            </div>

            <motion.button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`${
                !isAddingToCart ? 'group hover:bg-white/20 cursor-pointer' : 'pointer-events-none opacity-60'
              } flex items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/30 text-xs font-medium transition-all duration-300`}
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

const ProductCardsGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch products and sort by creation date to get the most recent ones
        const allProducts = await getProducts();

        // Sort by createdAt date (most recent first) and take first 5
        const sortedProducts = allProducts
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);

        setProducts(sortedProducts);
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        setError('Failed to load new arrivals');
        // Fallback to empty array
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              New Arrivals
            </h1>
          </div>
          <div className="flex justify-center items-center h-96">
            <div className="w-10 h-10 border-4 border-[#FDC713] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
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
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-500 text-lg">No new arrivals available at the moment</p>
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
              <ProductCard product={products[1]} className="h-full" />
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
              <ProductCard product={products[2]} className="h-full" />
            </motion.div>
          )}

          {/* Product 4 - row 3, col 2–3 */}
          {products[3] && (
            <motion.div
              className="row-span-1 col-span-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ProductCard product={products[3]} className="h-full" />
            </motion.div>
          )}

          {/* Product 5 - if we have 5 products, we can add it in a different layout */}
          {products[4] && (
            <motion.div
              className="row-span-1 col-span-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <ProductCard product={products[4]} className="h-full" />
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductCardsGrid;
