'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

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
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  // Sizes
  const avatarPx = desktop ? 36 : 32; // circle size - increased both
  const fontPx = desktop ? 14 : 13;   // name text size
  const chipPadX = desktop ? 'px-2.5' : 'px-2';
  const chipPadY = desktop ? 'py-1.5' : 'py-1';

  // Prefer explicit prop > server avatar; else no URL (fall back to initial)
  const resolvedAvatarUrl = useMemo(() => {
    const fromProp = getAvatarUrl?.();
    return fromProp || user?.avatar || null;
  }, [getAvatarUrl, user?.avatar]);

  const displayName = useMemo(
    () => user?.fullName || user?.name || user?.email || 'User',
    [user]
  );

  const firstName = useMemo(() => {
    if (user?.fullName) return user.fullName.split(' ')[0];
    if (user?.name) return user.name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  }, [user]);

  const initial = useMemo(() => {
    const src = user?.name || user?.fullName || user?.email || 'U';
    return src.trim().charAt(0).toUpperCase() || 'U';
  }, [user]);

  const handleToggle = () => setOpen((v) => !v);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mobile: Just the initial, no background at all */}
      {!desktop ? (
        <motion.button
          whileHover={{ scale: 1.04 }}
          onClick={handleToggle}
          aria-label="User menu"
          className="focus:outline-none focus:ring-2 focus:ring-[#FDC713] rounded-full"
          style={{ cursor: 'pointer' }}
        >
          {/* Just the bare circular initial OR avatar */}
          <span
            className="inline-flex items-center justify-center rounded-full overflow-hidden bg-black text-white select-none border-2 border-[#D4AF37]"
            style={{ width: avatarPx, height: avatarPx }}
          >
            {resolvedAvatarUrl ? (
              <Image
                src={resolvedAvatarUrl}
                alt={`${firstName}'s avatar`}
                width={avatarPx}
                height={avatarPx}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="font-semibold" style={{ fontSize: 13 }}>
                {initial}
              </span>
            )}
          </span>
        </motion.button>
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
              className="inline-flex items-center justify-center rounded-full overflow-hidden bg-black text-white select-none border-2 border-[#FDC713] group-hover:border-[#D4AF37] transition-colors"
              style={{ width: avatarPx, height: avatarPx }}
            >
              {resolvedAvatarUrl ? (
                <Image
                  src={resolvedAvatarUrl}
                  alt={`${firstName}'s avatar`}
                  width={avatarPx}
                  height={avatarPx}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="font-semibold" style={{ fontSize: 14 }}>
                  {initial}
                </span>
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