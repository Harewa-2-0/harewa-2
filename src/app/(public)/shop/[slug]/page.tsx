"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductBreadcrumb from '@/components/Public_C/Ready_To_Wear/ProductBreadcrumb';
import ProductImageGallery from '@/components/Public_C/Ready_To_Wear/ProductImageGallery';
import ProductCheckoutCard from '@/components/Public_C/Ready_To_Wear/ProductCheckoutCard';
import RecommendedProducts from '@/components/Public_C/Ready_To_Wear/RecommendedProducts';

// Types
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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Fetch individual product
        const productResponse = await fetch(`/api/product/${resolvedParams.slug}`);
        if (!productResponse.ok) {
          throw new Error('Product not found');
        }
        const productResponseData = await productResponse.json();
        
        // Handle the API response structure: { success: true, data: { product } }
        if (productResponseData.success && productResponseData.data) {
          setProduct(productResponseData.data);
        } else {
          throw new Error('Invalid product data format');
        }
        
        // Fetch recommended products
        const recommendedResponse = await fetch('/api/product');
        if (recommendedResponse.ok) {
          const recommendedData = await recommendedResponse.json();
          
          // Handle different API response structures
          let productsArray: Product[] = [];
          if (recommendedData.success && recommendedData.data) {
            productsArray = recommendedData.data;
          } else if (Array.isArray(recommendedData)) {
            productsArray = recommendedData;
          }
          
          // Filter out current product and take first 8
          const filtered = productsArray.filter((p: Product) => p._id !== resolvedParams.slug).slice(0, 8);
          setRecommendedProducts(filtered);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.slug) {
      fetchProduct();
    }
  }, [resolvedParams.slug]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    // Add to cart logic
    console.log('Added to cart:', { productId: product?._id, size: selectedSize });
    alert('Added to cart!');
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
      {/* Breadcrumb */}
      <ProductBreadcrumb productName={product.name} gender={product.gender} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Images */}
            <div className="col-span-8">
              {/* Image Gallery */}
              <ProductImageGallery
                images={product.images || []}
                selectedImageIndex={selectedImageIndex}
                onImageSelect={setSelectedImageIndex}
                productName={product.name}
              />
            </div>
            
            {/* Right Column - Checkout Card */}
            <div className="col-span-4">
              <ProductCheckoutCard
                product={product}
                selectedSize={selectedSize}
                isLiked={isLiked}
                onSizeSelect={setSelectedSize}
                onAddToCart={handleAddToCart}
                onToggleLike={toggleLike}
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Image Gallery */}
            <ProductImageGallery
              images={product.images || []}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              productName={product.name}
            />
            
            {/* Checkout Card */}
            <ProductCheckoutCard
              product={product}
              selectedSize={selectedSize}
              isLiked={isLiked}
              onSizeSelect={setSelectedSize}
              onAddToCart={handleAddToCart}
              onToggleLike={toggleLike}
            />
          </div>
        </div>
        
        {/* Recommended Products */}
        <RecommendedProducts products={recommendedProducts} />
      </div>
    </div>
  );
}