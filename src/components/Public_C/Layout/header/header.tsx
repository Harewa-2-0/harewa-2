'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useLayoutEffect, useRef } from 'react';

import AnnouncementBar from '../../Home/announcementBar';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import CartButton from '../../cart/cart-button';
import UserMenu from '../../user-menu/user-menu';
import { FabricMenu } from '../../header_expandable_menu/fabric_menu';
import { AboutMenu } from '../../header_expandable_menu/about_menu';

const navItems = [
  { label: 'Ready to Wear', href: '/shop' },
  { label: 'Customization', href: '/customize' },
  { label: 'Trending Styles', href: '/trending-fashion' },
];

export default function Header() {
  const { isMobileNavOpen, toggleMobileNav, closeMobileNav } = useUIStore();
  const { user, hasHydratedAuth, hasClientHydrated } = useAuthStore();
  const [hideAnnouncement, setHideAnnouncement] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHideAnnouncement(isMobileNavOpen);
  }, [isMobileNavOpen]);

  // Measure and set header height as CSS variable
  useLayoutEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);

        // Calculate total offset (announcement + header)
        const announcementHeight = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--announcement-height') || '0'
        );
        document.documentElement.style.setProperty(
          '--total-header-offset',
          `${announcementHeight + height}px`
        );
      }
    };

    updateHeaderHeight();

    const ro = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) {
      ro.observe(headerRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  const getCartUrl = () => '/cartt.png';

  const isReady = hasClientHydrated || hasHydratedAuth;
  const isLoggedIn = !!user;

  return (
    <>
      {!hideAnnouncement && <AnnouncementBar />}

      <header
        ref={headerRef}
        className="w-full bg-black border-b border-gray-700 sticky z-40"
        style={{
          top: 'var(--announcement-height, 0px)',
          transition: 'top 250ms ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/home">
            <Image src="/logo.webp" alt="Harewa Logo" width={120} height={40} priority />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center text-sm text-white font-medium flex-1 justify-center">
            <FabricMenu />
            <AboutMenu />
            {navItems.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <motion.div key={label} whileHover={{ scale: 1.05 }}>
                  <Link
                    href={href}
                    className={`transition-colors ${isActive
                      ? 'text-[#FFE181]'
                      : 'hover:text-[#FFE181]'
                      }`}
                  >
                    {label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Desktop Right (Avatar/Name first, then Cart) */}
          <div className="hidden md:flex items-center gap-4 ml-8">
            {!isReady ? (
              // Loading skeleton - minimal placeholder
              <div className="flex items-center gap-4">
                <div className="w-24 h-8 bg-gray-800 rounded-full animate-pulse" />
                <div className="w-24 h-8 bg-gray-800 rounded-full animate-pulse" />
              </div>
            ) : isLoggedIn ? (
              <UserMenu desktop className="ml-2" />
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    href="/signup"
                    className="border border-white text-[#D4AF37] px-4 py-1 rounded-full font-semibold hover:bg-white hover:text-black transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    href="/signin"
                    className="bg-[#FFE181] text-black flex items-center gap-1 px-3 py-1 rounded-full font-semibold hover:bg-yellow-200 transition-colors"
                  >
                    Login <ArrowUpRight size={16} />
                  </Link>
                </motion.div>
              </>
            )}

            {/* Cart after avatar/name — with extra space */}
            <CartButton size={32} getCartIconUrl={getCartUrl} className="ml-8" />
          </div>

          {/* Mobile Right (Avatar circle first, then Cart) */}
          <div className="md:hidden flex items-center gap-6">
            {isReady && isLoggedIn && <UserMenu desktop={false} />}
            <CartButton size={24} getCartIconUrl={getCartUrl} preflight={false} />
            <button
              onClick={toggleMobileNav}
              className="md:hidden text-white"
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown - SEPARATE INSTANCE */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              {/* Full screen backdrop */}
              <motion.div
                className="md:hidden fixed inset-0 bg-black/60 z-[100]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={closeMobileNav}
              />

              {/* Mobile menu - starts from top of screen */}
              <motion.div
                className="md:hidden fixed top-0 left-0 right-0 w-full bg-black px-5 pb-6 text-white text-base font-medium flex flex-col z-[101]"
                style={{
                  height: '100vh',
                  maxHeight: '100vh',
                }}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Mobile Header inside menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center justify-between py-3 border-b border-gray-700 mb-4 flex-shrink-0"
                >
                  <Link href="/home" onClick={closeMobileNav}>
                    <Image src="/logo.webp" alt="Harewa Logo" width={120} height={40} priority />
                  </Link>
                  <button
                    onClick={closeMobileNav}
                    className="text-white p-1"
                    aria-label="Close navigation"
                  >
                    <X size={30} />
                  </button>
                </motion.div>

                {/* Navigation Links - Scrollable when expandables open */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="flex flex-col space-y-4 pt-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                    >
                      <FabricMenu isMobile={true} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <AboutMenu isMobile={true} />
                    </motion.div>
                    {navItems.map(({ label, href }, index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                      >
                        <Link
                          href={href}
                          onClick={closeMobileNav}
                          className="block py-2.5 px-2 hover:text-[#FFE181] text-base transition-colors"
                        >
                          {label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Auth Buttons & CTA - Always at bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="flex flex-col space-y-3 pt-6 flex-shrink-0 border-t border-gray-700 mt-4"
                >
                  {isReady && !isLoggedIn && (
                    <div className="flex gap-3">
                      <Link
                        href="/signup"
                        onClick={closeMobileNav}
                        className="flex-1 border border-white text-[#D4AF37] text-center px-4 py-3 rounded-full hover:bg-white hover:text-black transition-colors text-sm font-medium"
                      >
                        Sign Up
                      </Link>
                      <Link
                        href="/signin"
                        onClick={closeMobileNav}
                        className="flex-1 bg-[#FFE181] text-black text-center px-4 py-3 rounded-full hover:bg-yellow-200 transition-colors text-sm font-medium"
                      >
                        Login <ArrowUpRight size={14} className="inline ml-1" />
                      </Link>
                    </div>
                  )}
                  <Link
                    href="/customize"
                    onClick={closeMobileNav}
                    className="bg-[#F4D35E] text-black text-center text-sm py-3 rounded-full hover:bg-[#F4D35E]/90 transition-colors font-medium"
                  >
                    Customise Your Fabric
                  </Link>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}