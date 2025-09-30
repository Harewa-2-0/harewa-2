import { TrendingFashionGallery } from '@/components/Public_C/trending_fashion_gallery';
import Hero from '@/components/Public_C/Home/hero';
import What_we_Offer from '@/components/Public_C/Home/what_We_Offer';
import ProductCardsGrid from '@/components/Public_C/Home/new_Arivals';
import FashionCardsComponent from '@/components/Public_C/Home/fashion_Journey';

export default function Home() {
  return (
    <div>
      <Hero />
      <What_we_Offer />
      <TrendingFashionGallery />
      <ProductCardsGrid/>
      <FashionCardsComponent/>
    </div>
  );
}
