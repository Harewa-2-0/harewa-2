'use client';

import React, { useMemo, useState } from 'react';
import { Minus, Plus, Trash2, Heart, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/contexts/toast-context';
import { useAuthAwareCartActions } from '@/hooks/use-cart';

export default function CartItems() {
  const { addToast } = useToast();
  const { updateCartQuantity, removeFromCart } = useAuthAwareCartActions();
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [sizeDropdowns, setSizeDropdowns] = useState<{ [key: string]: boolean }>({});

  const items = useCartStore((s) => s.items);
  const cartId = useCartStore((s) => s.cartId);
  const isLoading = useCartStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Ensure items are deduplicated before rendering
  const uniqueItems = useMemo(() => {
    const productMap = new Map<string, typeof items[0]>();
    items.forEach((item) => {
      if (!item || !item.id) return;
      const productId = String(item.id);
      if (productMap.has(productId)) {
        const existing = productMap.get(productId)!;
        productMap.set(productId, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          price: existing.price ?? item.price,
        });
      } else {
        productMap.set(productId, { ...item });
      }
    });
    return Array.from(productMap.values());
  }, [items]);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const toggleSizeDropdown = (itemId: string) => {
    setSizeDropdowns((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const toggleFavorite = (itemId: string) => {
    setFavoriteItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
        addToast('Removed from favorites', 'info');
      } else {
        next.add(itemId);
        addToast('Added to favorites', 'success');
      }
      return next;
    });
  };

  const onChangeQty = async (id: string, qty: number) => {
    if (pendingOperations.has(id)) return;

    try {
      setPendingOperations((prev) => new Set(prev).add(id));
      
      // Use the new optimistic cart actions
      await updateCartQuantity(id, qty);
      
      if (qty === 0) {
        addToast('Item removed from cart', 'success');
      } else {
        addToast(`Quantity updated to ${qty}`, 'success');
      }
    } catch (error) {
      addToast('Failed to update quantity. Please try again.', 'error');
      console.error('Failed to update quantity:', error);
    } finally {
      setPendingOperations((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const onRemove = async (id: string) => {
    try {
      await removeFromCart(id);
      addToast('Item removed from cart', 'success');
    } catch (error) {
      addToast('Failed to remove item. Please try again.', 'error');
      console.error('Failed to remove item:', error);
    }
  };

  const onSaveForLater = (id: string) => {
    toggleFavorite(id);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-8">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin"></div>
          <span className="ml-2 md:ml-3 text-sm md:text-base text-gray-600">
            Loading cart items...
          </span>
        </div>
      </div>
    );
  }

  if (uniqueItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
        <a
          href="/shop"
          className="inline-flex items-center px-6 py-3 bg-[#fdc713] text-black font-medium rounded-lg hover:bg-[#f0c000] transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Cart Items */}
      {uniqueItems.map((item) => {
        const name = item.name || 'Product Name';
        const image = item.image || '/placeholder.png';
        const itemTotal = typeof item.price === 'number' ? item.price * item.quantity : 0;
        const originalPrice =
          typeof item.price === 'number' ? item.price * 1.2 * item.quantity : 0; // ensure quantity applied
        const isFavorite = favoriteItems.has(item.id);

        return (
          <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 md:p-6">
            <div className="flex gap-3 md:gap-6">
              {/* Product Image */}
              <div className="w-16 h-20 md:w-24 md:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                <img src={image} alt={name} className="w-full h-full object-cover" />
                {/* Love icon on image */}
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-1 right-1 md:top-2 md:right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
                >
                  <Heart
                    size={12}
                    className={`${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'} md:w-4 md:h-4`}
                  />
                </button>
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="text-sm md:text-lg font-medium text-gray-900 mb-2 line-clamp-2 truncate">
                  {name}
                </h3>

                {/* === FLEX ROW: Size • Quantity • Price === */}
                <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                  {/* Size Selector */}
                  <div className="relative">
                    <button
                      onClick={() => toggleSizeDropdown(item.id)}
                      className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-black hover:opacity-80 transition-colors"
                    >
                      <span>Size: M</span>
                      <ChevronDown size={12} className="md:w-4 md:h-4" />
                    </button>

                    {/* Size Dropdown */}
                    {sizeDropdowns[item.id] && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[100px]">
                        {sizeOptions.map((size) => (
                          <button
                            key={size}
                            onClick={() => {
                              toggleSizeDropdown(item.id);
                              addToast(`Size changed to ${size}`, 'success');
                            }}
                            className="block w-full px-3 py-2 text-xs md:text-sm text-left text-black hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md"
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      onClick={() => onChangeQty(item.id, Math.max(0, item.quantity - 1))}
                      disabled={pendingOperations.has(item.id)}
                      className="w-7 h-7 md:w-8 md:h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} className="text-gray-600 md:w-4 md:h-4" />
                    </button>
                    <span className="w-6 md:w-8 text-center text-sm md:text-base font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onChangeQty(item.id, item.quantity + 1)}
                      disabled={pendingOperations.has(item.id)}
                      className="w-7 h-7 md:w-8 md:h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} className="text-gray-600 md:w-4 md:h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right ml-auto">
                    <div className="text-sm md:text-lg font-bold text-red-600">
                      {formatPrice(itemTotal)}
                    </div>
                    {originalPrice > 0 && (
                      <div className="text-xs md:text-sm text-gray-400 line-through">
                        {formatPrice(originalPrice)}
                      </div>
                    )}
                  </div>
                </div>

                {/* === BOTTOM ACTIONS ROW: Save for later (heart) • Delete === */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    onClick={() => onSaveForLater(item.id)}
                    className="flex items-center gap-1.5 text-xs md:text-sm text-black hover:underline transition-colors"
                  >
                    <Heart size={14} className="md:w-4 md:h-4" />
                    <span>Save for later</span>
                  </button>

                  <button
                    onClick={() => onRemove(item.id)}
                    className="flex items-center gap-1.5 text-xs md:text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
                  >
                    <Trash2 size={14} className="md:w-4 md:h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Toast notifications are now handled globally by ToastContainer */}

      {/* Click outside handler for size dropdowns */}
      {Object.values(sizeDropdowns).some(Boolean) && (
        <div className="fixed inset-0 z-5" onClick={() => setSizeDropdowns({})} />
      )}
    </div>
  );
}
