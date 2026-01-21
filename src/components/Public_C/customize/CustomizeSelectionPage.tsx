"use client";

import React, { useState, useMemo } from "react";
import Sidebar from "../Ready_To_Wear/Sidebar";
import CustomizeHeaderSection from "./CustomizeHeaderSection";
import FilterControls from "../Ready_To_Wear/FilterControls";
import CustomizeProductGrid from "./CustomizeProductGrid";
import MobileFilterOverlay from "../Ready_To_Wear/MobileFilterOverlay";
import { useShopProducts } from "@/hooks/useProducts";

interface FilterState {
    category: string;
    size: string;
    priceRange: [number, number];
}

const sizes = ["small", "medium", "large", "extra-large", "XXL"];

const CustomizeSelectionPage: React.FC = () => {
    const [filters, setFilters] = useState<FilterState>({
        category: "All",
        size: "",
        priceRange: [0, 500000],
    });
    const [sortBy, setSortBy] = useState<"feature" | "price-low" | "price-high" | "newest">("feature");
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

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
        const isBadUrl = (u?: string) => {
            if (!u) return true;
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
            if (filters.size && product.sizes && !product.sizes.includes(filters.size)) {
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    React.useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortBy]);

    return (
        <div className="min-h-screen bg-white pt-20 md:pt-24">
            <CustomizeHeaderSection category={filters.category} />

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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    <MobileFilterOverlay
                        isOpen={isMobileFilterOpen}
                        onClose={() => setIsMobileFilterOpen(false)}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        sizes={sizes}
                        totalItems={paginationData.total}
                    />

                    <div className="hidden lg:block font-medium">
                        <Sidebar
                            filters={filters}
                            handleFilterChange={handleFilterChange}
                            sizes={sizes}
                            totalItems={paginationData.total}
                        />
                    </div>

                    <div className="flex-1">
                        <CustomizeProductGrid
                            products={sortedProducts}
                            loading={loading}
                            error={error}
                            currentPage={currentPage}
                            totalPages={paginationData.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeSelectionPage;
