"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
// import { useCartStore } from '@/store/cartStore'; // not used after cleanup
// import { addToMyCart } from '@/services/cart';    // child handles server sync
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
  const [selectedSize, setSelectedSize] = useState(''); // kept for prop compatibility only
  const [isLiked, setIsLiked] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { isAuthenticated } = useAuthStore();
  // const { addItem } = useCartStore(); // not used

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const productResponse = await fetch(`/api/product/${resolvedParams.slug}`);
        if (!productResponse.ok) throw new Error('Product not found');
        const productResponseData = await productResponse.json();

        if (productResponseData.success && productResponseData.data) {
          setProduct(productResponseData.data);
        } else {
          throw new Error('Invalid product data format');
        }

        const recommendedResponse = await fetch('/api/product');
        if (recommendedResponse.ok) {
          const recommendedData = await recommendedResponse.json();
          let productsArray: Product[] = [];
          if (recommendedData.success && recommendedData.data) {
            productsArray = recommendedData.data;
          } else if (Array.isArray(recommendedData)) {
            productsArray = recommendedData;
          }
          const filtered = productsArray
            .filter((p: Product) => p._id !== resolvedParams.slug)
            .slice(0, 8);
          setRecommendedProducts(filtered);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.slug) fetchProduct();
  }, [resolvedParams.slug]);

  // Parent no longer performs server add (child already does).
  // Keep this for any UI side-effect you want (e.g., open drawer).
  const handleAddToCart = async () => {
    // no window.alert here
    // optionally: check isAuthenticated and show a toast UI if you have one
    setIsAddingToCart(true);
    try {
      // e.g., openCartDrawer(); if you have that in a store
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
            <div className="col-span-8">
              <ProductImageGallery
                images={product.images || []}
                selectedImageIndex={selectedImageIndex}
                onImageSelect={setSelectedImageIndex}
                productName={product.name}
              />
            </div>
            <div className="col-span-4">
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
