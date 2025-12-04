// Product Detail Page Skeleton Loader
// Matches the layout of product detail pages for better UX

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-24">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8">
            {/* Image Gallery Skeleton */}
            <div className="col-span-7 animate-pulse space-y-4">
              {/* Main image */}
              <div className="h-[500px] bg-gray-200 rounded-lg"></div>
              
              {/* Thumbnail strip */}
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 w-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="col-span-5 animate-pulse space-y-6">
              {/* Title */}
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              
              {/* Price */}
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              
              {/* Description lines */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
              
              {/* Size selector */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              
              {/* Add to cart button */}
              <div className="h-12 bg-gray-200 rounded mt-6"></div>
              
              {/* Additional info */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout Skeleton */}
        <div className="lg:hidden animate-pulse space-y-6">
          {/* Image */}
          <div className="h-80 bg-gray-200 rounded-lg"></div>
          
          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 w-16 bg-gray-200 rounded flex-shrink-0"></div>
            ))}
          </div>
          
          {/* Title */}
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          
          {/* Price */}
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
          
          {/* Button */}
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

