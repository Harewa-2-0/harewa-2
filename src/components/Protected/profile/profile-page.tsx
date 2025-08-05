'use client';

import OrdersSection from './orders/order-section';

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

      {activeTab === 'info' && (
        <div className="p-6">
          <div className="bg-white rounded-lg border p-8">
            <h2 className="text-xl font-semibold mb-4">My info</h2>
            <p className="text-gray-500">
              Profile details and edit form will go here.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
