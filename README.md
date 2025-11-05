This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Harewa E-Commerce Platform

A modern, high-performance e-commerce platform built with Next.js 15, featuring a hybrid state management architecture using React Query and Zustand.

## Tech Stack

- **Framework:** Next.js 15.3.4
- **State Management:** 
  - React Query (TanStack Query) for server state
  - Zustand for UI state
- **Styling:** Tailwind CSS
- **Database:** MongoDB with Mongoose
- **Payment:** Stripe & Paystack
- **Authentication:** JWT
- **Language:** TypeScript

## State Management Architecture

### Hybrid Approach: React Query + Zustand

The application uses a **separation of concerns** pattern:

#### 🔄 React Query (Server State)
Manages all server-side data with automatic caching, refetching, and optimistic updates.

**Used for:**
- **Products** (`src/hooks/useProducts.ts`)
  - Product listings with pagination
  - Individual product details
  - Recommended products
  - Homepage products
  
- **Categories** (`src/hooks/useCategories.ts`)
  - Product category listings
  - Shared across navigation and product pages
  
- **Cart** (`src/hooks/useCart.ts`)
  - Server-synchronized cart data
  - Add/update/remove operations with optimistic updates
  
- **Orders** (`src/hooks/useOrders.ts`)
  - Order history
  - Pending order tracking
  - Create/delete order mutations
  
- **Profile** (`src/hooks/useProfile.ts`)
  - User profile data
  - Avatar upload with optimistic updates
  - Profile updates
  
- **Fabrics** (`src/hooks/useFabrics.ts`)
  - Fabric type listings for customization

**Key Features:**
- Automatic background refetching
- Cache invalidation on mutations
- Stale-while-revalidate pattern
- Optimistic updates for instant UX
- Smart query deduplication
- 10-15 minute cache times for stable data

#### 🎨 Zustand (UI State)
Manages client-side UI state that doesn't need server synchronization.

**Used for:**
- **Cart Store** (`src/store/cartStore.ts`)
  - Local cart items for display
  - Optimistic quantity updates
  - Guest cart management
  
- **Order Store** (`src/store/orderStore.ts`)
  - Current checkout order reference
  - Temporary order state during payment flow
  
- **UI Store** (`src/store/uiStore.ts`)
  - Modal states
  - Sidebar visibility
  - Announcement bar state
  
- **Auth Store** (`src/store/authStore.ts`)
  - Authentication state
  - User session data
  
- **Trending Fashion Store** (`src/store/trendingFashionStore.ts`)
  - Active category filter
  - Filtered product display

**Why This Split?**
- **Performance:** React Query handles caching, Zustand is lightweight for UI
- **Consistency:** Server state always syncs with backend
- **Developer Experience:** Clear separation of concerns
- **User Experience:** Instant UI updates with background sync

## Performance Optimizations

### 1. Parallel Data Fetching
- Product details and recommendations fetch simultaneously
- Cart and profile data prefetch on navigation

### 2. Smart Caching Strategy
```typescript
// Example: Products cached for 10 minutes
staleTime: 10 * 60 * 1000,
gcTime: 15 * 60 * 1000,
```

### 3. Optimistic Updates
- Cart updates appear instantly before server confirmation
- Profile changes show immediately with automatic rollback on error

### 4. Skeleton Loaders
- Content-aware loading states (no generic spinners)
- Custom masonry skeleton for homepage
- Product grid skeletons match actual layout

### 5. Lazy Order Creation
- Checkout navigation is instant (no API blocking)
- Order created atomically with payment initiation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Application
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # React components
│   ├── Public_C/         # Public-facing components
│   └── Protected/        # Authenticated user components
├── hooks/                # Custom React Query hooks
│   ├── useProducts.ts   # Product data fetching
│   ├── useCart.ts       # Cart operations
│   ├── useOrders.ts     # Order management
│   ├── useProfile.ts    # User profile
│   └── useCategories.ts # Product categories
├── store/                # Zustand stores (UI state only)
│   ├── cartStore.ts     # Cart UI state
│   ├── orderStore.ts    # Checkout flow state
│   ├── authStore.ts     # Authentication state
│   └── uiStore.ts       # UI toggles and modals
├── services/             # API service layer
├── lib/                  # Backend utilities
└── utils/                # Shared utilities
```

## Key Features

### 🛒 Smart Cart Management
- Real-time cart synchronization
- Optimistic updates for instant feedback
- Automatic backend sync for logged-in users
- Guest cart with localStorage fallback

### 💳 Seamless Checkout
- Instant checkout navigation (no blocking)
- Lazy order creation on payment
- Stripe & Paystack integration
- Cart deletion after successful payment

### 📦 Product Browsing
- Fast product listings with caching
- Parallel loading of details and recommendations
- Category-based filtering
- Search and filter capabilities

### 👤 User Profiles
- Optimistic profile updates
- Avatar upload with instant preview
- Order history tracking (when enabled)
- Wishlist management

### 🎨 Modern UX
- Skeleton loaders (no generic spinners)
- Smooth animations with Framer Motion
- Mobile-responsive design
- Professional loading states

## Currency

All prices are displayed in **USD ($)** using a centralized formatting utility (`src/utils/currency.ts`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
