"use client";

import React, { useState, useMemo } from "react";
//import { Product } from "./ProductCard";
import Sidebar from "./Sidebar";
import HeaderSection from "./HeaderSection";
import FilterControls from "./FilterControls";
import ProductGrid from "./ProductGrid";
import MobileFilterOverlay from "./MobileFilterOverlay";
import { useShopProducts } from "@/hooks/useProducts";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/contexts/toast-context";
//import Image from "next/image";

interface FilterState {
  category: string;
  style: string;
  size: string;
  fitType: string;
  color: string;
  priceRange: [number, number];
}

const styles = ["Casual", "Formal", "Traditional", "Sport"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const fitTypes = ["Slim", "Regular", "Loose"];
const colors = ["Red", "Blue", "Green", "Black", "White", "Yellow"];

const ReadyToWearPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    category: "All",
    style: "",
    size: "",
    fitType: "",
    color: "",
    priceRange: [0, 500000],
  });
  const [sortBy, setSortBy] = useState<"feature" | "price-low" | "price-high" | "newest">("feature");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useToast();

  // Fetch products using React Query with server-side pagination
  const { data: productsResponse, isLoading: loading, error: queryError } = useShopProducts({ 
    page: currentPage, 
    limit: 20 
  });

  // Extract products and pagination data from response
  const fetchedProducts = productsResponse?.items || [];
  const paginationData = productsResponse?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasMore: false
  };

  // Normalize product images
  const products = useMemo(() => {
        // Basic validator: if images missing/empty/clearly placeholder -> use single fallback
        const isBadUrl = (u?: string) => {
          if (!u) return true;
          // allow site-relative paths
          if (u.startsWith("/")) return false;
          try {
            const { hostname } = new URL(u);
            return ["example.com", "placehold.co"].includes(hostname);
          } catch {
            return true;
          }
        };

    return fetchedProducts.map((product: any) => {
          let images: string[] = Array.isArray(product?.images) ? product.images : [];
          images = images.filter(Boolean);
          if (images.length === 0 || images.every(isBadUrl)) {
            images = ["/placeholder.png"];
          }
          return { ...product, images };
        });
  }, [fetchedProducts]);

  const error = queryError ? queryError.message : null;

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleCategoryChange = (category: string) => {
    handleFilterChange("category", category);
  };

  const handleSortChange = (sort: "feature" | "price-low" | "price-high" | "newest") => {
    setSortBy(sort);
  };

  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Enhance products with like state
  const productsWithLikes = useMemo(() => {
    return products.map((p) => ({
      ...p,
      isLiked: likedProducts.has(p._id),
    }));
  }, [products, likedProducts]);

  const filteredProducts = useMemo(() => {
    return productsWithLikes.filter((product) => {
      if (filters.category !== "All") {
        const categoryGenderMap: { [key: string]: string } = {
          Men: "male",
          Women: "female",
          Kids: "kids",
        };
        const expectedGender = categoryGenderMap[filters.category];
        if (
          expectedGender &&
          product.gender?.toLowerCase() !== expectedGender.toLowerCase()
        ) {
          return false;
        }
      }
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      if (filters.style && product.style && product.style.toLowerCase() !== filters.style.toLowerCase()) {
        return false;
      }
      if (filters.size && product.sizes && !product.sizes.includes(filters.size)) {
        return false;
      }
      if (filters.fitType && product.fitType && product.fitType.toLowerCase() !== filters.fitType.toLowerCase()) {
        return false;
      }
      if (filters.color && product.color && product.color.toLowerCase() !== filters.color.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [productsWithLikes, filters]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    if (sortBy === "price-low") return arr.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return arr.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") {
      const dateOf = (p: any) => (p?.createdAt ? new Date(p.createdAt).getTime() : 0);
      return arr.sort((a: any, b: any) => dateOf(b) - dateOf(a));
    }
    return arr; // "feature" (default)
  }, [filteredProducts, sortBy]);

  // Handle page change - reset to page 1 when filters change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Header Section */}
      <HeaderSection category={filters.category} />

      {/* Filter Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FilterControls
            category={filters.category}
            sortBy={sortBy}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onMobileFilterToggle={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            isMobileFilterOpen={isMobileFilterOpen}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Overlay */}
          <MobileFilterOverlay
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
                    filters={filters}
            onFilterChange={handleFilterChange}
                    styles={styles}
                    sizes={sizes}
                    fitTypes={fitTypes}
                    colors={colors}
                    totalItems={filteredProducts.length}
                  />

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
            <ProductGrid
              products={sortedProducts}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageChange}
              onToggleLike={toggleLike}
              isLoggedIn={isAuthenticated}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyToWearPage;
