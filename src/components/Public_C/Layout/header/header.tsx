'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import AnnouncementBar from '../../Home/announcementBar';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import CartButton from '../../cart/cart-button';
import UserMenu from '../../user-menu/user-menu';
// import { useAuthCartSync } from '@/hooks/use-auth-cart-sync'; // No longer needed - cart merge is now global
import { FabricMenu } from '../../header_expandable_menu/fabric_menu';

const navItems = [
  { label: 'Ready to Wear', href: '/shop' },
  { label: 'Customization', href: '/customize' },
  { label: 'Trending Styles', href: '/trending-fashion' },
  // { label: 'Clearance & Sales', href: '/sales' },
  { label: 'About Harewa', href: '/about' },
];

export default function Header() {
  const { isMobileNavOpen, toggleMobileNav, closeMobileNav } = useUIStore();
  const { user, hasHydratedAuth } = useAuthStore();
  const [hideAnnouncement, setHideAnnouncement] = useState(false);
  const pathname = usePathname();

  // Cart merge is now handled globally in authStore - no need for component-level sync
  // useAuthCartSync();

  useEffect(() => {
    // If you want the announcement to *disappear* when mobile nav opens, keep this true.
    // If you want it to remain stacked above the header even when the menu is open,
    // set this to false (or remove this effect entirely).
    setHideAnnouncement(isMobileNavOpen);
  }, [isMobileNavOpen]);

  const getCartUrl = () => '/cartt.png';

  return (
    <>
      {!hideAnnouncement && <AnnouncementBar />}

      {/* Header sits just below the announcement bar */}
      <header
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
            {navItems.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <motion.div key={label} whileHover={{ scale: 1.05 }}>
                  <Link 
                    href={href} 
                    className={`transition-colors ${
                      isActive 
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
            {!hasHydratedAuth ? (
              <div style={{ width: 120, height: 32 }} aria-hidden />
            ) : user ? (
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
          <div className="md:hidden flex items-center gap-3">
            {hasHydratedAuth && user && <UserMenu desktop={false} />}
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

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              className="md:hidden fixed left-0 right-0 w-full bg-black px-4 pb-8 text-white text-base font-medium border-t border-gray-700 min-h-screen flex flex-col z-30"
              style={{
                // Dropdown starts below announcement + header (~64px)
                top: 'calc(var(--announcement-height, 0px) + 64px)',
                transition: 'top 250ms ease',
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-8 pt-6">
                <FabricMenu isMobile={true} />
                {navItems.map(({ label, href }) => (
                  <Link key={label} href={href} onClick={closeMobileNav} className="block hover:text-[#FFE181]">
                    {label}
                  </Link>
                ))}
              </div>

              <div className="mt-14 flex flex-col space-y-3">
                {hasHydratedAuth && !user && (
                  <div className="flex gap-4">
                    <Link
                      href="/signup"
                      onClick={closeMobileNav}
                      className="flex-1 border border-white text-[#D4AF37] text-center px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors"
                    >
                      Sign Up
                    </Link>
                    <Link
                      href="/signin"
                      onClick={closeMobileNav}
                      className="flex-1 bg-[#FFE181] text-black text-center px-4 py-2 rounded-full hover:bg-yellow-200 transition-colors"
                    >
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
