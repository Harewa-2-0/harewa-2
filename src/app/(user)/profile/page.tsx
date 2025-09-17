'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProfileLayout from '@/components/Protected/profile/profile-layout';

export default function ProfilePage() {
  const { isAuthenticated, hasHydratedAuth, user } = useAuthStore();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    // Use authentication status immediately if available (from login), don't wait for hydration
    if (user && isAuthenticated) {
      // User is authenticated, allow access
      return;
    }
    
    // Only wait for hydration if no user data is available yet
    if (hasHydratedAuth && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, hasHydratedAuth, user, router]);

  // Show loading only if we don't have user data and haven't hydrated yet
  if (!user && !hasHydratedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return <ProfileLayout />;
}
