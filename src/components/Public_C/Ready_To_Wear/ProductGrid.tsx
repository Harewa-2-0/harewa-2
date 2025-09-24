import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onToggleLike: (productId: string) => void;
  isLoggedIn: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onToggleLike,
  isLoggedIn,
}) => {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">{error}</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            toggleLike={onToggleLike}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12">
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: Math.max(1, totalPages) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-200 font-semibold text-sm ${
                currentPage === i + 1
                  ? "bg-[#D4AF37] border-[#D4AF37] text-white shadow-lg transform scale-110"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-105"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(Math.max(1, totalPages), currentPage + 1))}
            disabled={currentPage === Math.max(1, totalPages)}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductGrid;
