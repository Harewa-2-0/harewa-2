'use client';

import { TrendingFashionGallery } from '@/components/Public_C/trending_fashion_gallery';
import Hero from '@/components/Public_C/Home/hero';
import What_we_Offer from '@/components/Public_C/Home/what_We_Offer';
import ProductCardsGrid from '@/components/Public_C/Home/new_Arivals';
import FashionCardsComponent from '@/components/Public_C/Home/fashion_Journey';
import { useHomepageProducts } from '@/hooks/useProducts';

export default function Home() {
  // Fetch products once using React Query - automatic caching, deduplication, and persistence
  const { data: products = [], isLoading } = useHomepageProducts();

  return (
    <div>
      <Hero />
      <What_we_Offer />
      <TrendingFashionGallery products={products} isLoading={isLoading} />
      <ProductCardsGrid products={products} isLoading={isLoading} />
      <FashionCardsComponent/>
    </div>
  );
}
