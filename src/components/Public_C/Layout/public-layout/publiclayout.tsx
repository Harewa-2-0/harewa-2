'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Header from '../header/header';
import Footer from '../footer/footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasHydratedAuth } = useAuthStore();

  // Check if admin is trying to access non-admin pages
  useEffect(() => {
    // Use role information immediately if available (from login), don't wait for hydration
    if (user?.role === 'admin') {
      // Admin trying to access public pages - redirect to admin unauthorized page immediately
      router.push('/403/admin');
    }
  }, [user, router, pathname]);

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
export const metadata = {
  title: 'HAREWA - Public Pages',
  description: 'Public pages of HAREWA',
};