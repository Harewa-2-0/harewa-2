'use client';

import OrdersSection from '@/components/Protected/profile/orders/order-section';
import MyInfoSection from '@/components/Protected/profile/info/my-info-section';

interface ProfilePageProps {
  activeTab: string;
}

export default function ProfilePage({ activeTab }: ProfilePageProps) {
  return (
    <>
      {activeTab === 'orders' && <OrdersSection />}

      {activeTab === 'activity' && (
        <div className="p-6">
          <div className="bg-white rounded-lg border p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Activity feed</h2>
            <p className="text-gray-500">No recent activity to show.</p>
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="p-6">
          <div className="bg-white rounded-lg border p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Wishlist</h2>
            <p className="text-gray-500">Your wishlist is empty.</p>
          </div>
        </div>
      )}

      {activeTab === 'info' && <MyInfoSection />}
    </>
  );
}
