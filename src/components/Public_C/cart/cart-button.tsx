'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import CartUI from '../shop/cart';
import { useCartActions, useCartOpen } from '@/hooks/use-cart';
import { useCartStore, useCartTotalItemsOptimistic } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { usePrefetchCart } from '@/hooks/useCartSync';

type CartButtonProps = {
  size?: number;
  className?: string;
  getCartIconUrl?: () => string;
  /** Run auth preflight? If you mount more than one CartButton, set this to false on the second one. */
  preflight?: boolean;
  /** Minimum interval between preflights (ms). */
  preflightIntervalMs?: number;
};

export default function CartButton({
  size = 32,
  className = '',
  getCartIconUrl,
  preflight = true,
  preflightIntervalMs = 60_000, // 1 minute
}: CartButtonProps) {
  // Get count using optimistic counter and loading states
  const count = useCartTotalItemsOptimistic();
  const isMerging = useCartStore((s) => s.isMerging);
  
  // Show spinner during merge to prevent showing "0" then updating
  const isLoading = isMerging;
  
  const isOpen = useCartOpen();
  const { openCart, closeCart, openCartForGuest } = useCartActions();
  const { isAuthenticated } = useAuthStore();
  
  // Prefetch cart data on hover for faster drawer open
  const { prefetch } = usePrefetchCart();

  const iconSrc = getCartIconUrl ? getCartIconUrl() : '/cartt.png';

  const handleOpen = () => {
    if (isAuthenticated) {
      openCart();
    } else {
      openCartForGuest();
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.12 }}
        onClick={handleOpen}
        onMouseEnter={prefetch}
        onFocus={prefetch}
        className={`relative cursor-pointer ${className}`}
        aria-label="Open cart"
      >
        <Image
          src={iconSrc}
          alt="Cart"
          width={size}
          height={size}
          className="object-contain"
        />
        {/* Show spinner when loading, count when loaded */}
        <span className="absolute -top-2 -right-2 bg-[#FDC713] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow">
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            count
          )}
        </span>
      </motion.button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[99998]" onClick={closeCart} aria-hidden="true" />
          <CartUI
            isOpen={isOpen}
            setIsOpen={(v: boolean) => {
              if (v) {
                if (isAuthenticated) {
                  openCart();
                } else {
                  openCartForGuest();
                }
              } else {
                closeCart();
              }
            }}
          />
        </>
      )}
    </>
  );
}