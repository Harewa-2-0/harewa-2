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

  // Check if admin is trying to access user/public pages
  useEffect(() => {
    // Use role information immediately if available (from login), don't wait for hydration
    if (user?.role === 'admin') {
      // Admin trying to access user/public pages - redirect to admin dashboard immediately
      router.push('/admin');
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
  description: ' Your One Stop Fashion House',
};