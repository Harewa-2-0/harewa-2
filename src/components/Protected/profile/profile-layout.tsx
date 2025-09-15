'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import MobileNavigation from './mobile-navigation';
import DesktopSidebar from './desktop-sidebar';
import OrdersSection from './orders/order-section';
import WishlistSection from './wishlist/wishlist-section';
import MyInfoSection from './info/my-info-section';
import DeleteAccountSection from './delete-account-section';

export default function ProfileLayout() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <OrdersSection />;
      case 'activity':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg border p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Activity feed</h2>
              <p className="text-gray-500">No recent activity to show.</p>
            </div>
          </div>
        );
      case 'wishlist':
        return <WishlistSection />;
      case 'info':
        return <MyInfoSection />;
      case 'delete-account':
        return <DeleteAccountSection />;
      default:
        return <MyInfoSection />;
    }
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
