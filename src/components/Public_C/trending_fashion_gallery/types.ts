// Re-export the Product type from the services
export type { Product } from '@/services/products';
export type { ProductCategory as Category } from '@/services/product-category';

export interface TrendingFashionGalleryProps {
  categories?: Category[];
  onProductClick?: (product: Product) => void;
  onCategoryChange?: (category: string) => void;
  initialCategory?: string;
  products?: Product[];
  isLoading?: boolean;
}
