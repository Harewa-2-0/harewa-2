"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { Product } from "./ProductCard";
import Sidebar from "./Sidebar";
import { useResponsivePagination } from "../../../hooks/useResponsivePagination";
import { getProducts } from "@/services/products";
import { useAuthStore } from "@/store/authStore";

interface FilterState {
  category: string;
  style: string;
  size: string;
  fitType: string;
  color: string;
  priceRange: [number, number];
}

const categories = ["All", "Men", "Women", "Kids"];
const styles = ["Casual", "Formal", "Traditional", "Sport"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const fitTypes = ["Slim", "Regular", "Loose"];
const colors = ["Red", "Blue", "Green", "Black", "White", "Yellow"];

const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[140px]" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-base font-medium text-black focus:outline-none focus:ring-2 focus:ring-[#FDC713] hover:border-[#FDC713] transition-colors"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value || label}</span>
        <ChevronDown
          className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""} text-black`}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-lg z-20 overflow-hidden border border-gray-100"
          role="listbox"
        >
          {options.map((option) => (
            <div
              key={option}
              role="option"
              aria-selected={value === option}
              className={`px-4 py-2 cursor-pointer text-base text-black hover:bg-[#FDC713] hover:text-black transition-colors ${
                value === option ? "bg-gray-100" : ""
              }`}
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
    category: "All",
    style: "",
    size: "",
    fitType: "",
    color: "",
    priceRange: [0, 500000],
  });
  const [sortBy, setSortBy] = useState<"feature" | "price-low" | "price-high" | "newest">("feature");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setLoading(true);

    getProducts()
      .then((data) => {
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

        const normalized: Product[] = (data || []).map((product: any) => {
          let images: string[] = Array.isArray(product?.images) ? product.images : [];
          images = images.filter(Boolean);
          if (images.length === 0 || images.every(isBadUrl)) {
            images = ["/placeholder.png"];
          }
          return { ...product, images };
        });

        setProducts(normalized);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load products");
        setLoading(false);

        // Keep a tiny fallback to avoid an empty page, but no demo overrides.
        const fallbackData: Product[] = [
          {
            _id: "fallback-1",
            name: "Sample Product",
            price: 25000,
            images: ["/placeholder.png"],
            rating: 4,
            reviews: 12,
            isLiked: false,
            gender: "female",
          },
        ];
        setProducts(fallbackData);
        setError(null);
      });
  }, []);

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const toggleLike = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, isLiked: !p.isLiked } : p))
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
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
  }, [products, filters]);

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

  const { currentPage, setCurrentPage, totalPages, paginatedItems } =
    useResponsivePagination(sortedProducts);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb - Hidden on mobile */}
          <div className="py-4 hidden md:block">
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
          <div className="py-4">
            {/* Mobile Layout */}
            <div className="lg:hidden space-y-4">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                Filters
              </button>
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <CustomDropdown
                    value={filters.category}
                    options={categories}
                    onChange={(v) => handleFilterChange("category", v)}
                    label="Category"
                  />
                </div>
                <div className="flex-1">
                  <CustomDropdown
                    value={
                      sortBy === "feature"
                        ? "Feature"
                        : sortBy === "price-low"
                        ? "Price: Low to High"
                        : sortBy === "price-high"
                        ? "Price: High to Low"
                        : "Newest"
                    }
                    options={[
                      "Feature",
                      "Price: Low to High",
                      "Price: High to Low",
                      "Newest",
                    ]}
                    onChange={(v) => {
                      if (v === "Feature") setSortBy("feature");
                      else if (v === "Price: Low to High") setSortBy("price-low");
                      else if (v === "Price: High to Low") setSortBy("price-high");
                      else if (v === "Newest") setSortBy("newest");
                    }}
                    label="Sort by"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
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
                onChange={(v) => handleFilterChange("category", v)}
                label="Category"
              />
              <CustomDropdown
                value={
                  sortBy === "feature"
                    ? "Sort by feature"
                    : sortBy === "price-low"
                    ? "Price: Low to High"
                    : sortBy === "price-high"
                    ? "Price: High to Low"
                    : "Newest"
                }
                options={[
                  "Sort by feature",
                  "Price: Low to High",
                  "Price: High to Low",
                  "Newest",
                ]}
                onChange={(v) => {
                  if (v === "Sort by feature") setSortBy("feature");
                  else if (v === "Price: Low to High") setSortBy("price-low");
                  else if (v === "Price: High to Low") setSortBy("price-high");
                  else if (v === "Newest") setSortBy("newest");
                }}
                label="Sort by"
              />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Overlay */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 bg-black/30 z-40 lg:hidden">
              <div className="absolute left-0 top-0 h-full w-80 bg-white flex flex-col">
                <div className="flex-1 overflow-y-auto">
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
                <div className="p-4 border-t border-gray-200 flex justify-center">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-12 h-12 bg-[#D4AF37] text-white rounded-full flex items-center justify-center hover:bg-[#B8941F] transition-colors"
                  >
                    ✕
                  </button>
                </div>
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
              <div className="w-full flex items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                  {paginatedItems.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      toggleLike={toggleLike}
                      isLoggedIn={isAuthenticated}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-12">
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: Math.max(1, totalPages) }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 font-semibold text-sm ${
                          currentPage === i + 1
                            ? "bg-yellow-400 border-yellow-400 text-white shadow-lg transform scale-110"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300 hover:scale-105"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(Math.max(1, totalPages), p + 1)
                        )
                      }
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
