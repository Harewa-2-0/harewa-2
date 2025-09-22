'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import PublicLayout from "@/components/Public_C/Layout/public-layout/publiclayout";
import AuthBootstrap from "../auth-bootstrap";

export default function UserPagesLayout({ children }: { children: React.ReactNode }) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { user, hasHydratedAuth } = useAuthStore();

  // Check authentication and role on mount
  useEffect(() => {
    // Use role information immediately if available (from login), don't wait for hydration
    if (user) {
      if (user.role === 'admin') {
        // Admin trying to access user pages - redirect to admin dashboard immediately
        router.push('/admin');
        return;
      }
      
      // User is authenticated and is not admin (regular user)
      setIsCheckingAuth(false);
      return;
    }
    
    // Only wait for hydration if no user data is available yet
    if (hasHydratedAuth && !user) {
      // Not authenticated - redirect to signin
      router.push('/signin');
      return;
    }
  }, [user, hasHydratedAuth, router]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Minimal background to prevent flicker */}
      </div>
    );
  }

  return (
    <>
      <AuthBootstrap />
      <PublicLayout>{children}</PublicLayout>
    </>
  );
}
