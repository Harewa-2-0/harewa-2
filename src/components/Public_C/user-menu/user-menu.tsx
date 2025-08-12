'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

type UserMenuProps = {
  desktop?: boolean; // true for desktop header, false for mobile
  className?: string;
  getAvatarUrl?: () => string;
};

export default function UserMenu({
  desktop = true,
  className = '',
  getAvatarUrl,
}: UserMenuProps) {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const avatarSize = desktop ? 40 : 32;
  const wrapperSize = desktop ? 'w-10 h-10' : 'w-8 h-8';
  const borderClass =
    'border-2 border-[#FDC713] focus:outline-none focus:ring-2 focus:ring-[#FDC713] hover:border-[#D4AF37]';
  const avatarSrc = getAvatarUrl ? getAvatarUrl() : '/avatar.webp';

  const getFirstName = () => {
    if (user?.fullName) return user.fullName.split(' ')[0];
    if (user?.name) return user.name.split(' ')[0];
    return '';
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; path=/; max-age=0';
    }
    logout();
    setOpen(false);
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        className={`${wrapperSize} rounded-full overflow-hidden ${borderClass} transition-colors relative group bg-white`}
      >
        <Image
          src={avatarSrc}
          alt={`${getFirstName()}'s avatar`}
          width={avatarSize}
          height={avatarSize}
          className="w-full h-full object-cover block rounded-full"
        />
        {desktop && (
          <span className="hidden md:block absolute left-1/2 -translate-x-1/2 top-12 z-50 px-3 py-1 bg-black text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 pointer-events-none whitespace-nowrap">
            {user?.fullName}
          </span>
        )}
      </motion.button>

      {desktop && (
        <span className="hidden md:inline font-semibold text-black text-base ml-2">
          {getFirstName()}
        </span>
      )}

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
              href="/user/profile"
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
