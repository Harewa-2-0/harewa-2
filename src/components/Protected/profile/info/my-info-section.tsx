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
    profileData, loadingUser, savingUser,
    addresses, loadingAddresses, savingAddress,
    fetchProfile, saveProfile, changeAvatar,
    fetchAddresses, editAddress,
  } = useProfileStore();

  const [openKind, setOpenKind] = useState<null | 'home' | 'office'>(null);

  useEffect(() => {
    // initial load
    fetchProfile();
  }, [fetchProfile]);

  if (loadingUser && !profileData) {
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
          src={profileData?.profilePicture}
          size={72}
          onUpload={changeAvatar}
        />
        <div>
          <h2 className="text-lg font-semibold text-black">Hello {profileData?.firstName || profileData?.user.username?.split(' ')[0] || 'User'}</h2>
          <p className="text-sm text-gray-500">Welcome to your account</p>
        </div>
      </div>

      {/* Contact info card with Edit toggle */}
      <ContactInfoCard
        profileData={profileData}
        saving={savingUser}
        onSave={async (v) => {
          await saveProfile({
            user: { 
              email: profileData?.user.email || '',
              username: v.username,
              isVerified: profileData?.user.isVerified || false,
              role: profileData?.user.role || '',
              phoneNumber: v.phone,
              avatar: profileData?.user.avatar
            },
            firstName: v.firstName,
            lastName: v.lastName,
            phone: v.phone,
            bio: v.bio,
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
              title="Home address"
              address={addresses.home}
              onEdit={() => setOpenKind('home')}
            />
            <AddressCard
              title="Office address"
              address={addresses.office}
              onEdit={() => setOpenKind('office')}
            />
          </div>
        )}
      </div>

      {/* Modal for editing one slot */}
      <AddressModal
        open={!!openKind}
        title={openKind === 'home' ? 'Edit home address' : 'Edit office address'}
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
