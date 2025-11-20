'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { user, hasHydratedAuth } = useAuthStore();

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Check authentication and role on mount
  useEffect(() => {
    // Use role information immediately if available (from login), don't wait for hydration
    if (user) {
      if (user.role !== 'admin') {
        // Not admin - redirect to user homepage immediately
        router.push('/home');
        return;
      }
      
      // User is authenticated and is admin
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

  // Close sidebar on desktop when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Minimal background to prevent flicker */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      
      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-40">
          <AdminHeader onMenuToggle={handleMenuToggle} />
        </div>
        
        {/* Main Content */}
        <main className="pt-20 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
