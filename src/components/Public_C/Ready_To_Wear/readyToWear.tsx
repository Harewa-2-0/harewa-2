import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard, { Product } from './ProductCard';
import Sidebar from './Sidebar';
import { useResponsivePagination } from '../../../hooks/useResponsivePagination';
import { fetchProducts } from '../../../utils/api';

interface FilterState {
  category: string;
  style: string;
  size: string;
  fitType: string;
  color: string;
  priceRange: [number, number];
}

const categories = ['All', 'Men', 'Women', 'Kids'];
const styles = ['Casual', 'Formal', 'Traditional', 'Sport'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const fitTypes = ['Slim', 'Regular', 'Loose'];
const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'];

// CustomDropdown component (inline, similar to FilterDropdown)
const CustomDropdown = ({ label, value, options, onChange }: { label?: string, value: string, options: string[], onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative min-w-[140px]" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-base font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FDC713] hover:border-[#FDC713] transition-colors"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{value || label}</span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-180' : ''} text-black`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-lg z-20 overflow-hidden border border-gray-100">
          {options.map(option => (
            <div
              key={option}
              className={`px-4 py-2 cursor-pointer text-base text-black hover:bg-[#FDC713] hover:text-black transition-colors ${value === option ? 'bg-gray-100' : ''}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReadyToWearPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    style: '',
    size: '',
    fitType: '',
    color: '',
    priceRange: [0, 500000],
  });
  const [sortBy, setSortBy] = useState('feature');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    fetchProducts()
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load products');
        setLoading(false);
        
        // Fallback test data if API fails
        const fallbackData = [
          {
            _id: 'test-1',
            name: 'Test Product 1',
            price: 25000,
            images: ['/placeholder.png'],
            rating: 4,
            reviews: 12,
            isLiked: false,
            gender: 'female'
          },
          {
            _id: 'test-2', 
            name: 'Test Product 2',
            price: 30000,
            images: ['/placeholder.png'],
            rating: 5,
            reviews: 8,
            isLiked: false,
            gender: 'female'
          }
        ];
        setProducts(fallbackData);
        setError(null);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const toggleLike = (productId: string) => {
    // Implement like logic (e.g., update state or call API)
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, isLiked: !p.isLiked } : p
      )
    );
  };

  const addToCart = (productId: string) => {
    // Implement add to cart logic
    console.log(`Add to cart: ${productId}`);
  };

  // Enhanced filtering logic
  const filteredProducts = products.filter((product) => {
    // Category filtering - only filter if not 'All'
    if (filters.category !== 'All') {
      const categoryGenderMap: { [key: string]: string } = {
        'Men': 'male',
        'Women': 'female',
        'Kids': 'kids'
      };
      
      const expectedGender = categoryGenderMap[filters.category];
      if (expectedGender && product.gender?.toLowerCase() !== expectedGender.toLowerCase()) {
        return false;
      }
    }
    
    // Price filtering
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    
    // Style filtering (if you have style field in your API)
    if (filters.style && product.style && product.style.toLowerCase() !== filters.style.toLowerCase()) {
      return false;
    }
    
    // Size filtering (if you have size field in your API)
    if (filters.size && product.sizes && !product.sizes.includes(filters.size)) {
      return false;
    }
    
    // Fit type filtering (if you have fitType field in your API)
    if (filters.fitType && product.fitType && product.fitType.toLowerCase() !== filters.fitType.toLowerCase()) {
      return false;
    }
    
    // Color filtering (if you have color field in your API)
    if (filters.color && product.color && product.color.toLowerCase() !== filters.color.toLowerCase()) {
      return false;
    }
    
    return true;
  });

  // Sorting logic (expand as needed)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    // Add more sort logic as needed
    return 0;
  });

  // Pagination
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
  } = useResponsivePagination(sortedProducts);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-4">
            <nav className="flex text-sm text-gray-500">
              <span>Home</span>
              <span className="mx-2">›</span>
              <span>Ready to wear</span>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{filters.category}</span>
            </nav>
          </div>

          {/* Page Title */}
          <div className="text-center py-8">
            <h1 className="text-4xl md:text-6xl font-bold text-[#3D3D3D] mb-2">
              Ready To Wear
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-[#3D3D3D] mb-4">
              Fashion Clothes
            </h2>
            <p className="text-[#5D5D5D] md:text-base max-w-2xl mx-auto">
              Discover vibrant clothes from skilled craftsmen to suit every of your event.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
            >
              Filters
            </button>
            <div className="flex items-center space-x-4 ml-auto">
              <CustomDropdown
                value={filters.category}
                options={categories}
                onChange={v => handleFilterChange('category', v)}
                label="Category"
              />
              <CustomDropdown
                value={sortBy}
                options={[
                  'Sort by feature',
                  'Price: Low to High',
                  'Price: High to Low',
                  'Newest',
                ]}
                onChange={v => {
                  if (v === 'Sort by feature') setSortBy('feature');
                  else if (v === 'Price: Low to High') setSortBy('price-low');
                  else if (v === 'Price: High to Low') setSortBy('price-high');
                  else if (v === 'Newest') setSortBy('newest');
                }}
                label="Sort by"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Overlay */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div className="absolute left-0 top-0 h-full w-80 bg-white overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <Sidebar
                  filters={filters}
                  handleFilterChange={handleFilterChange}
                  styles={styles}
                  sizes={sizes}
                  fitTypes={fitTypes}
                  colors={colors}
                  totalItems={filteredProducts.length}
                />
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              filters={filters}
              handleFilterChange={handleFilterChange}
              styles={styles}
              sizes={sizes}
              fitTypes={fitTypes}
              colors={colors}
              totalItems={filteredProducts.length}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Loading products...</div>
            ) : error ? (
              <div className="text-center py-20 text-red-500">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedItems.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      toggleLike={toggleLike}
                      addToCart={addToCart}
                    />
                  ))}
                </div>
                {/* Styled Pagination Controls */}
                <div className="mt-12">
                  {/* Always show pagination for testing - remove the condition later */}
                  <div className="flex justify-center items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.max(1, totalPages) }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 font-semibold text-sm ${
                          currentPage === i + 1 
                            ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg transform scale-110' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300 hover:scale-105'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(Math.max(1, totalPages), p + 1))}
                      disabled={currentPage === Math.max(1, totalPages)}
                      className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyToWearPage;