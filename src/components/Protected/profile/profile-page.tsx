'use client';

import OrdersSection from './orders/order-section';
import WishlistSection from './wishlist/wishlist-section';
import MyInfoSection from './info/my-info-section';
import DeleteAccountSection from './delete-account-section';

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

      {activeTab === 'wishlist' && <WishlistSection />}

      {activeTab === 'info' && <MyInfoSection />}

      {activeTab === 'delete-account' && <DeleteAccountSection />}
    </>
  );
}
