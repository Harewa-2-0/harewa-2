import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: number;
  image: string;
  mobileImage?: string;
  price: number;
  originalPrice: number;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  mobileImage,
  price,
  originalPrice,
  className = ""
}) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Product Image */}
      <div className="relative w-full h-full">
        <picture>
          {mobileImage && (
            <source media="(max-width: 768px)" srcSet={mobileImage} />
          )}
          <img
            src={image}
            alt={`Product #${id}`}
            className="w-full h-full object-cover object-top"
          />
        </picture>

        {/* Glassmorphic overlay for bottom content */}
        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-lg bg-black/20 border-t border-white/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold text-base">
              Product #{id}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base">
                NGN{price.toFixed(2)}
              </span>
              <span className="text-gray-300 text-xs line-through">
                NGN{originalPrice.toFixed(2)}
              </span>
            </div>

            <motion.button
              className="flex items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/30 text-xs font-medium hover:bg-white/20 transition-all duration-300"
              style={{ color: '#FFFFFFB2' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <ShoppingCart size={12} />
              </div>
              <span>Add</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductCardsGrid: React.FC = () => {
  const products = [
    {
      id: 1,
      image: "/A1.webp",
      price: 120.23,
      originalPrice: 200.23
    },
    {
      id: 2,
      image: "/A2.webp",
      price: 120.23,
      originalPrice: 200.23
    },
    {
      id: 3,
      image: "/A3.webp",
      price: 120.23,
      originalPrice: 200.23
    },
    {
      id: 4,
      image: "/A4_Desktop.png",
      mobileImage: "/A4_Mobile.webp",
      price: 120.23,
      originalPrice: 200.23
    },
  ];

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
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>

        {/* Desktop Layout - Custom Grid */}
        <div
          className="hidden md:grid grid-cols-3 gap-3"
          style={{
            gridTemplateRows: '150px 150px 250px',
            height: '750px'
          }}
        >
          {/* Product 1 - spans all three rows, col 1 */}
          <motion.div
            className="row-span-3 col-span-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ProductCard {...products[0]} className="h-full" />
          </motion.div>

          {/* Product 2 - spans rows 1-2, col 2 */}
          <motion.div
            className="row-span-2 col-span-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ProductCard {...products[1]} className="h-full" />
          </motion.div>

          {/* Product 3 - spans rows 1-2, col 3 */}
          <motion.div
            className="row-span-2 col-span-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ProductCard {...products[2]} className="h-full" />
          </motion.div>

          {/* Product 4 - row 3, col 2–3 */}
          <motion.div
            className="row-span-1 col-span-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ProductCard {...products[3]} className="h-full" />
          </motion.div>
        </div>

        {/* View More Button */}
        <motion.div
          className="flex justify-center mt-8 md:-mt-32 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.button
            className="px-8 cursor-pointer py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{
              backgroundColor: '#FDC713',
              border: '2px solid #FDC713',
              color: 'black'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            View more
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductCardsGrid;
