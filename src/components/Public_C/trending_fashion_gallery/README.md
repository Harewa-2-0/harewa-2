# Trending Fashion Gallery Components

A complete set of reusable components for displaying trending fashion items with category-based navigation.

## Components

### 1. TrendingFashionGallery (Main Component)
The main parent component that orchestrates the entire gallery experience.

**Props:**
- `categories?: Category[]` - Optional array of categories (uses defaults if not provided)
- `onProductClick?: (product: Product) => void` - Callback when a product is clicked
- `onCategoryChange?: (category: string) => void` - Callback when category changes
- `initialCategory?: string` - Initial category to display (default: "Iro and Buba")

**Usage:**
```tsx
import { TrendingFashionGallery } from '@/components/Public_C/trending_fashion_gallery';

<TrendingFashionGallery
  onProductClick={(product) => router.push(`/products/${product._id}`)}
  onCategoryChange={(category) => console.log('Category:', category)}
  initialCategory="Aso Oke"
/>
```

### 2. CategorySidebar
Displays the category navigation menu on the left side.

**Props:**
- `categories: Category[]` - Array of categories
- `activeCategory: string` - Currently selected category
- `onCategoryChange: (category: string) => void` - Category change handler

### 3. ProductCard
Individual product card component with hover effects and actions.

**Props:**
- `product: Product` - Product data
- `onProductClick?: (product: Product) => void` - Product click handler
- `onAddToCart?: (product: Product) => void` - Add to cart handler
- `onToggleFavorite?: (product: Product) => void` - Favorite toggle handler
- `variants?: any` - Framer Motion variants for animations

### 4. ProductGrid
Grid layout component that displays products with loading and empty states.

**Props:**
- `products: Product[]` - Array of products to display
- `activeCategory: string` - Current category name
- `onProductClick?: (product: Product) => void` - Product click handler
- `onAddToCart?: (product: Product) => void` - Add to cart handler
- `onToggleFavorite?: (product: Product) => void` - Favorite toggle handler
- `loading?: boolean` - Loading state

## Data Types

### Product
```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  remainingInStock: number;
  location: string;
  images: string[];
  sizes: string[];
  gender: string;
  category: {
    _id: string;
    id: string;
    name: string;
    description: string;
  };
  fabricType: {
    _id: string;
    name: string;
    image: string;
    type: string;
    color: string;
    pattern: string;
    weight: number;
    width: number;
    composition: string;
    supplier: string;
    pricePerMeter: number;
    inStock: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  favourite: boolean;
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
}
```

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion animations for category transitions
- **Loading States**: Skeleton loading for better UX
- **Error Handling**: Graceful error states with retry functionality
- **Interactive Elements**: Hover effects, add to cart, favorite toggle
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **TypeScript**: Full type safety throughout

## State Management

The component uses Zustand for state management with the `useTrendingFashionStore`:

### Store Features:
- **Centralized State**: All products and UI state managed in one place
- **Persistence**: Store state persists across page reloads
- **Frontend Filtering**: Products filtered by category on the frontend
- **Optimistic Updates**: Favorite toggles update immediately
- **Error Handling**: Centralized error state management

### Store Actions:
- `fetchAllProducts()` - Fetches all products from API
- `fetchCategories()` - Fetches categories from API
- `setActiveCategory(category)` - Changes active category and filters products (limited to 9)
- `clearError()` - Clears error state

## API Integration

The component uses two services:

### Products Service
**Service:** `getProducts()` from `@/services/products`
- Fetches all products without query parameters
- Returns `Product[]` array directly

### Categories Service  
**Service:** `getCategories()` from `@/services/product-category`
- Fetches all available categories from the API
- Returns `ProductCategory[]` array
- Falls back to hardcoded categories if API fails

### Data Flow:
1. Component mounts → Store fetches categories and products in parallel
2. Categories load → User sees dynamic category list from API
3. User selects category → Store filters products on frontend
4. Results limited to 9 products per category for performance
5. No additional API calls needed for category changes

### Fallback Behavior:
- If categories API fails, uses fallback categories
- If products API fails, shows error state with retry option
- Both APIs work independently for better resilience

## Styling

The components use Tailwind CSS classes and follow the existing design system:
- Primary color: `#D4AF37` (gold)
- Text colors: `#3D3D3D` (dark), `#5D5D5D` (medium)
- Background: `bg-gray-50`
- Cards: `bg-white` with shadow effects

## Customization

You can customize the components by:
1. Modifying the default categories in `TrendingFashionGallery.tsx`
2. Adjusting the grid layout in `ProductGrid.tsx`
3. Customizing the card design in `ProductCard.tsx`
4. Changing the sidebar layout in `CategorySidebar.tsx`
