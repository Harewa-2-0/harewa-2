'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import CartUI from '../shop/cart';
import { useCartActions, useCartCount, useCartOpen } from '@/hooks/use-cart';
import { useCartHasHydrated } from '@/store/cartStore';



type CartButtonProps = {
  size?: number;              // 32 desktop, 24 mobile
  className?: string;
  getCartIconUrl?: () => string;
};

export default function CartButton({
  size = 32,
  className = '',
  getCartIconUrl,
}: CartButtonProps) {
  const count = useCartCount();
  const isOpen = useCartOpen();
  const { openCart, closeCart } = useCartActions();

  const iconSrc = getCartIconUrl ? getCartIconUrl() : '/cartt.png';
  const hydrated = useCartHasHydrated();


  return (
    <>
      {/* Trigger */}
      <motion.button
        whileHover={{ scale: 1.12 }}
        onClick={openCart}
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

      {/* Overlay + Drawer (controlled by store) */}
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
