'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useProfileStore } from '@/store/profile-store';
import AvatarUpload from '@/components/common/avatar-upload';
import ContactInfoCard from './contact-info-card';
import AddressCard, { AddressValues } from './address-card';
import AddressModal from './address-modal';

export default function MyInfoSection() {
  const {
    user, loadingUser, savingUser,
    addresses, loadingAddresses, savingAddress,
    fetchProfile, saveProfile, changeAvatar,
    fetchAddresses, editAddress,
  } = useProfileStore();

  const [openKind, setOpenKind] = useState<null | 'billing' | 'shipping'>(null);

  useEffect(() => {
    // initial load
    fetchProfile();
    fetchAddresses();
  }, [fetchProfile, fetchAddresses]);

  if (loadingUser && !user) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border p-8 flex items-center justify-center">
          <Loader2 className="animate-spin mr-2" size={18} />
          <span className="text-gray-600">Loading profile…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header: avatar + greeting */}
      <div className="bg-white border rounded-lg p-6 flex items-center gap-4">
        <AvatarUpload
          src={user?.avatarUrl}
          size={72}
          onUpload={changeAvatar}
        />
        <div>
          <h2 className="text-lg font-semibold text-black">Hello {user?.fullName?.split(' ')[0] || 'User'}</h2>
          <p className="text-sm text-gray-500">Welcome to your account</p>
        </div>
      </div>

      {/* Contact info card with Edit toggle */}
      <ContactInfoCard
        user={user}
        saving={savingUser}
        onSave={async (v) => {
          await saveProfile({
            fullName: v.fullName,
            phone: v.phone,
            gender: v.gender,
            dob: v.dob,
          });
        }}
      />

      {/* Address grid (exactly two cards) */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-black">Address</h3>
            <p className="text-sm text-gray-500">Details</p>
          </div>
          {/* no add button by design */}
        </div>

        {loadingAddresses ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="animate-spin" size={16} /> Loading addresses…
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddressCard
              title="Billing address"
              address={addresses.billing}
              onEdit={() => setOpenKind('billing')}
            />
            <AddressCard
              title="Shipping address"
              address={addresses.shipping}
              onEdit={() => setOpenKind('shipping')}
            />
          </div>
        )}
      </div>

      {/* Modal for editing one slot */}
      <AddressModal
        open={!!openKind}
        title={openKind === 'billing' ? 'Edit billing address' : 'Edit shipping address'}
        initial={(openKind ? addresses[openKind] : undefined) as AddressValues}
        onClose={() => setOpenKind(null)}
        onSubmit={async (vals) => {
          if (!openKind) return;
          await editAddress(openKind, vals as any);
        }}
      />
    </div>
  );
}
