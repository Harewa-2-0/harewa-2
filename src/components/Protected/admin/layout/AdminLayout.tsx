'use client';

import { ReactNode, useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

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
