import React from 'react';
import CustomizeProductCard, { Product } from './CustomizeProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomizeProductGridProps {
    products: Product[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const CustomizeProductGrid: React.FC<CustomizeProductGridProps> = ({
    products,
    loading,
    error,
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20">
                <h3 className="text-lg font-medium text-gray-900">No products found for customization</h3>
                <p className="mt-2 text-gray-500">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {products.map((product) => (
                    <CustomizeProductCard key={product._id} product={product} />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-4 pt-12 border-t border-gray-100 mt-12">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full border ${currentPage === 1
                        ? 'bg-gray-50 text-gray-300 border-gray-100'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                        } transition-all`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.max(1, totalPages) }, (_, i) => {
                        const page = i + 1;
                        const isCurrent = page === currentPage;
                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${isCurrent
                                    ? 'bg-[#D4AF37] text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(Math.max(1, totalPages), currentPage + 1))}
                    disabled={currentPage === Math.max(1, totalPages)}
                    className={`p-2 rounded-full border ${currentPage === Math.max(1, totalPages)
                        ? 'bg-gray-50 text-gray-300 border-gray-100'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                        } transition-all`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CustomizeProductGrid;
