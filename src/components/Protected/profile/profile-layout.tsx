'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import MobileNavigation from './mobile-navigation';
import DesktopSidebar from './desktop-sidebar';
import ProfilePage from '@/components/Protected/profile/profile-page';

export default function ProfileLayout() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    if (tabId === 'logout') {
      // Add real logout logic
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
          {/* Profile page content based on activeTab */}
          <ProfilePage activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}
