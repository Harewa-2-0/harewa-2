import React from 'react';
import { Heart, Info, Star } from 'lucide-react';

interface ProductCheckoutCardProps {
  product: {
    name: string;
    price: number;
    description?: string;
    rating?: number;
    reviews?: number;
    sizes?: string[];
  };
  selectedSize: string;
  isLiked: boolean;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  onToggleLike: () => void;
}

const ProductCheckoutCard: React.FC<ProductCheckoutCardProps> = ({
  product,
  selectedSize,
  isLiked,
  onSizeSelect,
  onAddToCart,
  onToggleLike
}) => {
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

  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];

  return (
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
        
        {/* Style Guide */}
        <div className="flex items-center gap-2 mb-4 cursor-pointer text-blue-600 hover:underline">
          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Style Guide</span>
        </div>
        
        {/* Size Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeSelect(size)}
                className={`px-3 sm:px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedSize === size ? 'bg-yellow-400 border-yellow-400 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        {/* Add to Cart & Like */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onAddToCart}
            className="flex-1 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors text-sm sm:text-base"
          >
            Add to Cart
          </button>
          <button
            onClick={onToggleLike}
            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-2 ${isLiked ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} transition-colors`}
          >
            <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>
        
        {/* Description */}
        <div className="text-gray-700 text-sm leading-relaxed">
          {product.description || 'No description available.'}
        </div>
      </div>
    </div>
  );
};

export default ProductCheckoutCard; 