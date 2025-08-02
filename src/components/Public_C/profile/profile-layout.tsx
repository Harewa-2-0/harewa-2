'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import MobileNavigation from './mobile-navigation';
import DesktopSidebar from './desktop-sidebar';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'logout') {
      // Add logout logic if needed here too
      console.log('Logging out...');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <DesktopSidebar
  activeTab={activeTab}
  onTabChange={handleTabChange}
  user={user ?? undefined}
/>

        {/* Page Content */}
        <div className="flex-1">
          {/* Optional desktop header */}
          <div className="hidden md:block p-6 bg-white border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold">
                {user?.fullName?.[0] || 'U'}
              </div>
              <h1 className="text-xl font-semibold">Hello {user?.fullName || 'User'}</h1>
            </div>
          </div>

          {/* Slot for nested pages */}
          {children}
        </div>
      </div>
    </div>
  );
}
