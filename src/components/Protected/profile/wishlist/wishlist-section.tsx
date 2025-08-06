'use client';

import EmptyState from '@/components/common/empty-state';

export default function WishlistSection() {
  // TODO: Replace with real wishlist data from API/store
  const wishlistItems = [
    {
      id: 1,
      name: "(name of outfit)",
      image: "/cart_1.webp",
      price: "₦12,000",
      originalPrice: "₦21,000",
      dateAdded: "June 21, 2023"
    },
    {
      id: 2,
      name: "(name of outfit)",
      image: "/cart_2.webp", 
      price: "₦12,000",
      originalPrice: "₦21,000",
      dateAdded: "June 21, 2023"
    }
  ];

  return (
    <div className="bg-white md:m-6 md:rounded-lg md:border p-6">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-lg font-semibold text-black">Wishlist</h2>
      </div>

      {/* If wishlist is empty */}
      {wishlistItems.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="You don't have any product in the wishlist yet."
        />
      ) : (
        <div className="space-y-4">
          {/* Map through wishlist items here */}
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="flex-grow">
                <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.dateAdded}</p>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-semibold">{item.price}</span>
                  <span className="text-gray-400 line-through text-sm">{item.originalPrice}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-[#D4AF37] hover:bg-[#bfa129] text-white rounded-lg font-medium transition-colors text-sm">
                  ADD TO CART
                </button>
                <button className="p-2 bg-[#FFEDB1] rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}