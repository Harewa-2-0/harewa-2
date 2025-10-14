'use client';

import { TrendingFashionGallery } from '@/components/Public_C/trending_fashion_gallery';
import { useRouter } from 'next/navigation';

export default function TrendingFashionPage() {
  const router = useRouter();

  const handleProductClick = (product: any) => {
    // Navigate to product detail page
    const productId = product._id || product.id;
    if (productId) {
      router.push(`/products/${productId}`);
    }
  };

  const handleCategoryChange = (category: string) => {
    // You can add analytics or other logic here
    console.log('Category changed to:', category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm pt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Trending <br /> Fashion Styles
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover vibrant clothes from skilled craftsmen to suit every of your event.
            </p>
          </div>
        </div>
      </div>

      {/* Trending Fashion Gallery */}
      <TrendingFashionGallery
        onProductClick={handleProductClick}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}
