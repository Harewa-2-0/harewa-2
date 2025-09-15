'use client';

interface Product {
  id: string;
  name: string;
  itemCode: string;
  price: string;
  image?: string;
}

interface PopularProductsProps {
  products: Product[];
  totalVisitors?: string;
  className?: string;
}

export default function PopularProducts({ 
  products, 
  totalVisitors = "10.4k Visitors",
  className = ""
}: PopularProductsProps) {
  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Popular Products</h3>
          <p className="text-sm text-gray-600">Total {totalVisitors}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-xs font-medium">
                  {product.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-600">Item: {product.itemCode}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
