'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import AnnouncementBar from '../../Home/announcementBar';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import CartButton from '../../cart/cart-button';
import UserMenu from '../../user-menu/user-menu';

const navItems = [
  { label: 'Fabrics Gallery', href: '/fabrics' },
  { label: 'Ready to Wear', href: '/shop' },
  { label: 'Customization', href: '/customize' },
  { label: 'Trending Styles', href: '/trends' },
  { label: 'Clearance & Sales', href: '/sales' },
  { label: 'About Harewa', href: '/about' },
];

export default function Header() {
  const { isMobileNavOpen, toggleMobileNav, closeMobileNav } = useUIStore();
  const { user, hydrateFromCookie } = useAuthStore();

  const [hideAnnouncement, setHideAnnouncement] = useState(false);

  useEffect(() => {
    hydrateFromCookie();
  }, [hydrateFromCookie]);

  useEffect(() => {
    setHideAnnouncement(isMobileNavOpen);
  }, [isMobileNavOpen]);

  const getCartUrl = () => '/cartt.png';
  const getAvatarUrl = () => '/avatar.webp';

  return (
    <>
      {!hideAnnouncement && <AnnouncementBar />}

      <header className="w-full bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.webp" alt="Harewa Logo" width={120} height={40} priority />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center text-sm text-black font-medium flex-1 justify-center">
            {navItems.map(({ label, href }) => (
              <motion.div key={label} whileHover={{ scale: 1.05 }}>
                <Link href={href} className="hover:underline">
                  {label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4 ml-8">
            <CartButton size={32} getCartIconUrl={getCartUrl} />
            {user ? (
              <UserMenu desktop className="ml-2" getAvatarUrl={getAvatarUrl} />
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="/signup" className="border border-black text-[#D4AF37] px-4 py-1 rounded-full font-semibold">
                    Sign Up
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link href="/signin" className="bg-[#FFE181] text-black flex items-center gap-1 px-3 py-1 rounded-full font-semibold">
                    Login <ArrowUpRight size={16} />
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Right */}
          <div className="md:hidden flex items-center gap-3">
            <CartButton size={24} getCartIconUrl={getCartUrl} />
            {user && <UserMenu desktop={false} getAvatarUrl={getAvatarUrl} />}

            <button onClick={toggleMobileNav} className="md:hidden text-black" aria-label="Toggle navigation">
              {isMobileNavOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              className="md:hidden fixed w-full bg-white px-4 pt-14 pb-8 text-black text-base font-medium border-t min-h-screen flex flex-col"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-8">
                {navItems.map(({ label, href }) => (
                  <Link key={label} href={href} onClick={closeMobileNav} className="block">
                    {label}
                  </Link>
                ))}
              </div>

              <div className="mt-14 flex flex-col space-y-3">
                {!user && (
                  <div className="flex gap-4">
                    <Link href="/signup" onClick={closeMobileNav} className="flex-1 border border-black text-[#D4AF37] text-center px-4 py-2 rounded-full">
                      Sign Up
                    </Link>
                    <Link href="/signin" onClick={closeMobileNav} className="flex-1 bg-[#FFE181] text-black text-center px-4 py-2 rounded-full">
                      Login <ArrowUpRight size={16} className="inline ml-1" />
                    </Link>
                  </div>
                )}
                <div className="bg-[#F4D35E] text-black text-center text-sm py-3 rounded-full mt-8">
                  Customise Your Fabric
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
