'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ProfileLayoutWithDetail from '@/components/Protected/profile/ProfileLayoutWithDetail';

interface CustomizationDetailProps {
  params: {
    id: string;
  };
}

export default function CustomizationDetail({ params }: CustomizationDetailProps) {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#fdc713] rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return <ProfileLayoutWithDetail customizationId={params.id} />;
}
