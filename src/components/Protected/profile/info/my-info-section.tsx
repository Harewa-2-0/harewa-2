'use client';

import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation } from '@/hooks/useProfile';
import { useToast } from '@/contexts/toast-context';
import AvatarUpload from '@/components/common/avatar-upload';
import ContactInfoCard from './contact-info-card';
import AddressCard, { AddressValues } from './address-card';
import AddressModal from './address-modal';

export default function MyInfoSection() {
  // React Query hooks for profile data
  const { data: profileData, isLoading: loadingUser } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const { addToast } = useToast();

  const [openKind, setOpenKind] = useState<null | 'home' | 'office'>(null);

  // Derive addresses from profile (home = index 0, office = index 1)
  const addresses = useMemo(() => {
    const home = profileData?.addresses?.[0] || undefined;
    const office = profileData?.addresses?.[1] || undefined;
    return { home, office };
  }, [profileData?.addresses]);

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatarMutation.mutateAsync(file);
      addToast('Profile picture updated successfully', 'success');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      addToast('Failed to upload profile picture', 'error');
    }
  };

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
          onUpload={handleAvatarUpload}
        />
        <div>
          <h2 className="text-lg font-semibold text-black">Hello {profileData?.firstName || profileData?.user?.username?.split(' ')[0] || 'User'}</h2>
          <p className="text-sm text-gray-500">Welcome to your account</p>
        </div>
      </div>

      {/* Contact info card with Edit toggle */}
      <ContactInfoCard
        profileData={profileData}
        saving={updateProfileMutation.isPending}
        onSave={async (v) => {
          try {
            await updateProfileMutation.mutateAsync({
              username: v.username,
              firstName: v.firstName,
              lastName: v.lastName,
              phone: v.phone,
              bio: v.bio,
            });
            addToast('Profile updated successfully', 'success');
          } catch (error) {
            console.error('Failed to update profile:', error);
            addToast('Failed to update profile', 'error');
          }
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
      </div>

      {/* Modal for editing one slot */}
      <AddressModal
        open={!!openKind}
        title={openKind === 'home' ? 'Edit home address' : 'Edit office address'}
        initial={(openKind ? addresses[openKind] : undefined) as AddressValues}
        onClose={() => setOpenKind(null)}
        onSubmit={async (vals) => {
          if (!openKind || !profileData) return;
          
          try {
            // Get current addresses array
            const currentAddresses = [...(profileData.addresses || [])];
            
            if (openKind === 'home') {
              // Home address at index 0
              if (currentAddresses.length > 0) {
                currentAddresses[0] = vals as any;
              } else {
                currentAddresses.push(vals as any);
              }
            } else if (openKind === 'office') {
              // Office address at index 1
              if (currentAddresses.length > 1) {
                currentAddresses[1] = vals as any;
              } else if (currentAddresses.length === 1) {
                currentAddresses.push(vals as any);
              } else {
                // No addresses yet, add empty home and then office
                currentAddresses.push({} as any, vals as any);
              }
            }
            
            // Update profile with new addresses
            await updateProfileMutation.mutateAsync({ addresses: currentAddresses });
            addToast('Address updated successfully', 'success');
            setOpenKind(null);
          } catch (error) {
            console.error('Failed to update address:', error);
            addToast('Failed to update address', 'error');
          }
        }}
      />
    </div>
  );
}
