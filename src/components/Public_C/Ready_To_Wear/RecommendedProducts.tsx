import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';

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

  const RecommendedProductCard: React.FC<{ product: RecommendedProduct }> = ({ product }) => (
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
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
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

  if (products.length === 0) {
    return null;
  }

  return (
    <div className='mt-8 md:mt-16'>
      <h3 className="text-lg text-[#3D3D3D] font-bold mb-4 py-6 text-center">Recommended Items</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <RecommendedProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts; 