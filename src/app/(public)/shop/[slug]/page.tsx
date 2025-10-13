"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/utils/api'; // ✅ Use your API utility
import ProductBreadcrumb from '@/components/Public_C/Ready_To_Wear/ProductBreadcrumb';
import ProductImageGallery from '@/components/Public_C/Ready_To_Wear/ProductImageGallery';
import ProductCheckoutCard from '@/components/Public_C/Ready_To_Wear/ProductCheckoutCard';
import RecommendedProducts from '@/components/Public_C/Ready_To_Wear/RecommendedProducts';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating?: number;
  reviews?: number;
  isLiked?: boolean;
  description?: string;
  gender?: string;
  sizes?: string[];
  quantity?: number;
  remainingInStock?: number;
  location?: string;
  category?: string;
  fabricType?: string;
  seller?: string;
  shop?: string;
  createdAt?: string;
  updatedAt?: string;
  style?: string;
  fitType?: string;
  color?: string;
}

interface RecommendedProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating?: number;
  reviews?: number;
  isLiked?: boolean;
}

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // ✅ Fetch both in parallel using Promise.all
        const [productData, allProductsData] = await Promise.all([
          // Fetch single product
          api<any>(`/api/product/${resolvedParams.slug}`).catch(() => null),
          // Fetch all products (your api.ts will deduplicate if called elsewhere)
          api<any>('/api/product').catch(() => [])
        ]);

        // Handle product data
        if (!productData) {
          throw new Error('Product not found');
        }

        const product = productData.success && productData.data 
          ? productData.data 
          : productData;

        if (!product || !product._id) {
          throw new Error('Invalid product data format');
        }

        setProduct(product);

        // Handle recommendations
        let productsArray: Product[] = [];
        if (allProductsData?.success && allProductsData?.data) {
          productsArray = allProductsData.data;
        } else if (Array.isArray(allProductsData)) {
          productsArray = allProductsData;
        }

        // Filter out current product and limit to 8
        const filtered = productsArray
          .filter((p: Product) => p._id !== resolvedParams.slug)
          .slice(0, 8);

        setRecommendedProducts(filtered);

      } catch (err) {
        console.error('[ProductDetails] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.slug) fetchProduct();
  }, [resolvedParams.slug]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      // Cart logic handled by child component
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleLike = () => setIsLiked((prev) => !prev);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link href="/shop" className="text-blue-600 hover:underline">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductBreadcrumb productName={product.name} gender={product.gender} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Desktop */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-7">
              <ProductImageGallery
                images={product.images || []}
                selectedImageIndex={selectedImageIndex}
                onImageSelect={setSelectedImageIndex}
                productName={product.name}
              />
            </div>
            <div className="col-span-5">
              <ProductCheckoutCard
                product={product}
                selectedSize={selectedSize}
                isLiked={isLiked}
                isAddingToCart={isAddingToCart}
                onSizeSelect={setSelectedSize}
                onAddToCart={handleAddToCart}
                onToggleLike={toggleLike}
              />
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <div className="flex flex-col lg:flex-row gap-10">
            <ProductImageGallery
              images={product.images || []}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              productName={product.name}
            />
            <ProductCheckoutCard
              product={product}
              selectedSize={selectedSize}
              isLiked={isLiked}
              isAddingToCart={isAddingToCart}
              onSizeSelect={setSelectedSize}
              onAddToCart={handleAddToCart}
              onToggleLike={toggleLike}
            />
          </div>
        </div>

        <RecommendedProducts products={recommendedProducts} />
      </div>
    </div>
  );
}