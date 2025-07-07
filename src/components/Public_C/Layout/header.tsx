'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementBar from '../Home/announcementBar';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

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
  const [hideAnnouncement, setHideAnnouncement] = useState(false);
  const { user, logout, setUser } = useAuthStore();
  const [avatarOpen, setAvatarOpen] = useState(false);

  // Hydrate Zustand user state from storage on mount (for Google login/callback)
  useEffect(() => {
    if (!user) {
      let storedUser = null;
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('user');
        const session = sessionStorage.getItem('user');
        storedUser = local ? JSON.parse(local) : session ? JSON.parse(session) : null;
        if (storedUser) {
          setUser(storedUser, local ? 'localStorage' : 'sessionStorage');
        }
      }
    }
  }, [user, setUser]);

  useEffect(() => {
    setHideAnnouncement(isMobileNavOpen);
  }, [isMobileNavOpen]);

  const getInitial = () => {
    if (user?.fullName) return user.fullName[0].toUpperCase();
    if (user?.name) return user.name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
  };

  // Helper to get the user's first name
  const getFirstName = () => {
    if (user?.fullName) return user.fullName.split(' ')[0];
    if (user?.name) return user.name.split(' ')[0];
    return '';
  };

  // Always use the local avatar.webp for the profile image
  const getAvatarUrl = () => {
    return '/avatar.webp';
  };
  // Always use the local catt.png for the cart image
  const getCartUrl = () => {
    return '/cartt.png';
  };

  return (
    <>
      {/* AnnouncementBar with conditional visibility */}
      {!hideAnnouncement && <AnnouncementBar />}

      {/* Main Header */}
      <header className="w-full bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image src="/logo.webp" alt="Harewa Logo" width={120} height={40} priority />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 items-center text-sm text-black font-medium flex-1 justify-center">
            {navItems.map(({ label, href }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.05 }}
                className="transition"
              >
                <Link href={href} className="hover:underline">{label}</Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop Right Side - Cart, Avatar (if logged in), and Auth Buttons */}
          <div className="hidden md:flex items-center gap-4 ml-8">
            {/* Cart - Always visible */}
            <motion.div
              whileHover={{ scale: 1.12 }}
              className="cursor-pointer"
            >
              <Image
                src={getCartUrl()}
                alt="Cart"
                width={32}
                height={32}
                className="object-contain"
              />
            </motion.div>
            
            {/* User Avatar and Menu - Only if logged in */}
            {user && (
              <>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FDC713] focus:outline-none focus:ring-2 focus:ring-[#FDC713] hover:border-[#D4AF37] transition-colors relative group bg-white"
                  onClick={() => setAvatarOpen((open) => !open)}
                  aria-label="User menu"
                >
                  <Image
                    src={getAvatarUrl()}
                    alt={`${getFirstName()}'s avatar`}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover block rounded-full"
                  />
                  {/* Tooltip with user's full name, only on desktop */}
                  <span
                    className="hidden md:block absolute left-1/2 -translate-x-1/2 top-12 z-50 px-3 py-1 bg-black text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 pointer-events-none whitespace-nowrap"
                    style={{
                      transitionProperty: 'opacity, transform',
                    }}
                  >
                    {user.fullName}
                  </span>
                </motion.button>
                <span className="font-semibold text-black text-base">{getFirstName()}</span>
                
                {/* Avatar Dropdown Menu */}
                {avatarOpen && (
                  <div className="absolute right-4 top-12 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                    {/* Close button */}
                    <button
                      className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center rounded-full bg-[#FDC713] text-white text-lg font-bold shadow cursor-pointer border-2 border-white"
                      style={{ zIndex: 10 }}
                      onClick={() => setAvatarOpen(false)}
                      aria-label="Close profile menu"
                    >
                      ×
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg text-black"
                      onClick={() => {
                        setAvatarOpen(false);
                        // TODO: Implement settings navigation
                      }}
                    >
                      Settings
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-red-600"
                      onClick={async () => {
                        // Call backend logout endpoint (GET)
                        try {
                          await fetch('/api/auth/logout', { method: 'GET' });
                        } catch (e) {
                          // Optionally handle error
                        }
                        // Clear user from both storages
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('user');
                          sessionStorage.removeItem('user');
                        }
                        logout();
                        setAvatarOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}
            
            {/* Auth Buttons - Only if not logged in */}
            {!user && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} className="transition">
                  <Link
                    href="/signup"
                    className="border border-black text-[#D4AF37] px-4 py-1 rounded-full font-semibold"
                  >
                    Sign Up
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="transition">
                  <Link
                    href="/signin"
                    className="bg-[#FFE181] text-black flex items-center gap-1 px-3 py-1 rounded-full font-semibold"
                  >
                    Login <ArrowUpRight size={16} />
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Right Side - Cart, Avatar (if logged in), and Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Cart - Always visible on mobile */}
            <motion.div
              whileHover={{ scale: 1.12 }}
              className="cursor-pointer"
            >
              <Image
                src={getCartUrl()}
                alt="Cart"
                width={24}
                height={24}
                className="object-contain"
              />
            </motion.div>
            
            {/* User Avatar - Only if logged in */}
            {user && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FDC713] focus:outline-none focus:ring-2 focus:ring-[#FDC713] hover:border-[#D4AF37] transition-colors relative bg-white"
                onClick={() => setAvatarOpen((open) => !open)}
                aria-label="User menu"
              >
                <Image
                  src={getAvatarUrl()}
                  alt={`${getFirstName()}'s avatar`}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover block rounded-full"
                />
              </motion.button>
            )}
            
            <button onClick={toggleMobileNav} className="md:hidden text-black">
              {isMobileNavOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
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
                {/* If user is not logged in, show Sign Up and Login */}
                {!user && (
                  <div className="flex gap-4">
                    <Link
                      href="/signup"
                      onClick={closeMobileNav}
                      className="flex-1 border border-black text-[#D4AF37] text-center px-4 py-2 rounded-full"
                    >
                      Sign Up
                    </Link>
                    <Link
                      href="/signin"
                      onClick={closeMobileNav}
                      className="flex-1 bg-[#FFE181] text-black text-center px-4 py-2 rounded-full"
                    >
                      Login <ArrowUpRight size={16} className="inline ml-1" />
                    </Link>
                  </div>
                )}
                
                {/* Mobile-specific CTA */}
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