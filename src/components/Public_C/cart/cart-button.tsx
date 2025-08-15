'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import CartUI from '../shop/cart';
import { useCartActions, useCartCount, useCartOpen } from '@/hooks/use-cart';
import { useCartHasHydrated } from '@/store/cartStore';
import { useCallback, useEffect } from 'react';
import { getMe } from '@/services/auth';

// Global throttle for auth preflight across all CartButtons
let lastPreflightAt = 0;
let inflightPreflight: Promise<void> | null = null;
async function runPreflight(throttleMs: number) {
  const now = Date.now();
  if (now - lastPreflightAt < throttleMs && inflightPreflight === null) return;
  if (!inflightPreflight) {
    inflightPreflight = getMe().then(() => {}).catch(() => {}).finally(() => {
      lastPreflightAt = Date.now();
      inflightPreflight = null;
    });
  }
  return inflightPreflight;
}

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
  const count = useCartCount();
  const isOpen = useCartOpen();
  const { openCart, closeCart } = useCartActions();
  const hydrated = useCartHasHydrated();

  const iconSrc = getCartIconUrl ? getCartIconUrl() : '/cartt.png';

  const doPreflight = useCallback(async () => {
    if (!preflight) return;
    await runPreflight(preflightIntervalMs);
  }, [preflight, preflightIntervalMs]);

  useEffect(() => { void doPreflight(); }, [doPreflight]);

  const handleOpen = useCallback(async () => {
    await doPreflight();
    openCart();
  }, [doPreflight, openCart]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.12 }}
        onClick={handleOpen}
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
        {hydrated && count > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#FDC713] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow">
            {count}
          </span>
        )}
      </motion.button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeCart} aria-hidden="true" />
          <CartUI
            isOpen={isOpen}
            setIsOpen={(v: boolean) => (v ? openCart() : closeCart())}
          />
        </>
      )}
    </>
  );
}
