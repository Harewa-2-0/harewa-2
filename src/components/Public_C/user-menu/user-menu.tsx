'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProfileQuery } from '@/hooks/useProfile';
import { clearUserQueries } from '@/utils/clearUserQueries';

type UserMenuProps = {
  desktop?: boolean; // true for desktop header, false for mobile
  className?: string;
  getAvatarUrl?: () => string; // optional override; will be superseded by user.avatar when present
};

export default function UserMenu({
  desktop = true,
  className = '',
  getAvatarUrl,
}: UserMenuProps) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Fetch profile data via React Query - same pattern as desktop-sidebar
  const { data: profile } = useProfileQuery(isAuthenticated);

  if (!user) return null;

  // Sizes
  const avatarPx = desktop ? 36 : 32; // circle size - increased both
  const fontPx = desktop ? 14 : 13;   // name text size
  const chipPadX = desktop ? 'px-2.5' : 'px-2';
  const chipPadY = desktop ? 'py-1.5' : 'py-1';

  const displayName = profile?.firstName || user?.fullName || user?.name || user?.email || 'User';
  
  const firstName = profile?.firstName || user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const initial = (profile?.firstName || user?.name || user?.fullName || user?.email || 'U').trim().charAt(0).toUpperCase() || 'U';

  const handleToggle = () => setOpen((v) => !v);

  const handleLogout = async () => {
    setOpen(false);
    setIsLoggingOut(true);
    try {
      // Clear user-specific React Query caches before logout
      clearUserQueries(queryClient);
      await logout();
      // Navigate to home page (preserves React Query cache for public data)
      router.push('/home');
      // Keep spinner until navigation completes (component will unmount anyway)
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mobile: Just the initial, no background at all */}
      {!desktop ? (
        <button
          onClick={handleToggle}
          aria-label="User menu"
          className="focus:outline-none active:outline-none outline-none rounded-full"
          style={{ 
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {/* Just the bare circular initial OR avatar */}
          <span
            className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-black text-white select-none border-2 transition-colors ${
              open ? 'border-transparent' : 'border-[#D4AF37]'
            }`}
            style={{ width: avatarPx, height: avatarPx }}
          >
            {(profile?.profilePicture || user?.avatar) ? (
              <img
                src={profile?.profilePicture || user?.avatar}
                alt={`${firstName}'s avatar`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="font-semibold" style={{ fontSize: 13 }}>
                {initial}
              </span>
            )}
            {/* Logout spinner overlay */}
            {isLoggingOut && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              </div>
            )}
          </span>
        </button>
      ) : (
        /* Desktop: Curvy background that starts FROM the initial edge */
        <motion.button
          whileHover={{ scale: 1.04 }}
          onClick={handleToggle}
          aria-label="User menu"
          className="group relative inline-flex items-center focus:outline-none"
          style={{ cursor: 'pointer' }}
        >
          {/* Curvy background that flows from initial's right edge */}
          <div 
            className="absolute bg-gray-100 group-hover:bg-gray-200 transition-colors border-2 border-[#FDC713] group-hover:border-[#D4AF37] border-l-0"
            style={{
              left: `${avatarPx * 0.7}px`, // Start from inside the circle
              top: '50%',
              transform: 'translateY(-50%)',
              height: `${avatarPx + 4}px`, // Increased padding Y
              width: `${Math.max(firstName.length * 10 + 35, 80)}px`, // Dynamic width with minimum + more right padding
              borderRadius: `0 ${avatarPx * 0.4}px ${avatarPx * 0.4}px 0`,
              // Create curves using clip-path
              clipPath: 'polygon(0 25%, 15% 10%, 85% 15%, 100% 35%, 100% 65%, 85% 85%, 15% 90%, 0 75%)'
            }}
          />

          {/* Content layer */}
          <div className="relative flex items-center gap-2 z-10">
            {/* Circular initial OR avatar - completely separate, no background */}
            <span
              className="relative inline-flex items-center justify-center rounded-full overflow-hidden bg-black text-white select-none border-2 border-[#FDC713] group-hover:border-[#D4AF37] transition-colors"
              style={{ width: avatarPx, height: avatarPx }}
            >
              {(profile?.profilePicture || user?.avatar) ? (
                <img
                  src={profile?.profilePicture || user?.avatar}
                  alt={`${firstName}'s avatar`}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="font-semibold" style={{ fontSize: 14 }}>
                  {initial}
                </span>
              )}
              {/* Logout spinner overlay */}
              {isLoggingOut && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                </div>
              )}
            </span>

            {/* Name sits on the curvy background */}
            <span
              className="hidden md:inline font-semibold text-black truncate pr-4"
              style={{ 
                fontSize: fontPx, 
                lineHeight: 1,
                maxWidth: `${Math.max(firstName.length * 10, 60)}px` // Dynamic max-width to ensure it fits
              }}
            >
              {firstName}
            </span>
          </div>
        </motion.button>
      )}

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-12 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
            <button
              className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center rounded-full bg-[#FDC713] text-white text-lg font-bold shadow cursor-pointer border-2 border-white"
              onClick={() => setOpen(false)}
              aria-label="Close user menu"
            >
              ×
            </button>
            <Link
              href="/profile"
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-black rounded-t-lg"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-red-600"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}