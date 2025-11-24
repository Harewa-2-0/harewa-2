'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import MobileNavigation from './mobile-navigation';
import DesktopSidebar from './desktop-sidebar';
import CustomizationDetailPage from './customizations/CustomizationDetailPage';

interface ProfileLayoutWithDetailProps {
  customizationId: string;
}

export default function ProfileLayoutWithDetail({ customizationId }: ProfileLayoutWithDetailProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('customizations');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Page Content */}
        <div className="flex-1 md:ml-64 pt-32 md:pt-16">
          <CustomizationDetailPage customizationId={customizationId} />
        </div>
      </div>
    </div>
  );
}
