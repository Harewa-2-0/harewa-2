// New Arrivals Section Skeleton Loader
// Matches the exact custom masonry layout of New Arrivals

export function NewArrivalsSkeleton() {
  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h1>
        </div>

        {/* Mobile Layout - Stacked Skeletons */}
        <div className="block md:hidden space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Layout - Custom Grid (EXACT MATCH) */}
        <div
          className="
            hidden md:grid grid-cols-3 gap-3
            h-[300px] md:h-[550px] lg:h-[600px]"
          style={{
            gridTemplateRows: '150px 150px 250px'
          }}
        >
          {/* Product 1 - Tall vertical card (left side) - spans all three rows */}
          <div className="row-span-3 col-span-1 bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="h-full bg-gray-200"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          {/* Product 2 - Horizontal card (top-middle) - spans rows 1-2 */}
          <div className="row-span-2 col-span-1 bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="h-3/4 bg-gray-200"></div>
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          {/* Product 3 - Horizontal card (top-right) - spans rows 1-2 */}
          <div className="row-span-2 col-span-1 bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="h-3/4 bg-gray-200"></div>
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          {/* Product 4 - Small card (bottom-middle) - row 3 only */}
          <div className="row-span-1 col-span-1 bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="h-3/4 bg-gray-200"></div>
            <div className="p-2 space-y-1">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          {/* Product 5 - Small card (bottom-right) - row 3 only */}
          <div className="row-span-1 col-span-1 bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="h-3/4 bg-gray-200"></div>
            <div className="p-2 space-y-1">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

