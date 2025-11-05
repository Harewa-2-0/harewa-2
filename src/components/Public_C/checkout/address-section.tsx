'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Check, X, Loader2 } from 'lucide-react';
import { useProfileQuery, useUpdateProfileMutation } from '@/hooks/useProfile';
import { useToast } from '@/contexts/toast-context';
import type { ProfileAddress } from '@/store/profile-store';

interface AddressSectionProps {
  selectedAddress?: ProfileAddress;
  onAddressSelect: (address: ProfileAddress) => void;
  onAddressChange: () => void;
}

export default function AddressSection({ 
  selectedAddress, 
  onAddressSelect, 
  onAddressChange 
}: AddressSectionProps) {
  const { data: profileData } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const { addToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAddress, setNewAddress] = useState({
    line1: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    isDefault: false
  });

  const handleAddressSelect = (address: ProfileAddress) => {
    onAddressSelect(address);
    onAddressChange(); // Trigger recalculation
  };

  const handleAddAddress = async () => {
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.zip || !newAddress.country) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Add the new address to the profile
      const updatedAddresses = [...(profileData?.addresses || []), newAddress];
      await updateProfileMutation.mutateAsync({ addresses: updatedAddresses });
      
      addToast('Address added successfully', 'success');
      
      // Select the newly created address
      onAddressSelect(newAddress);
      onAddressChange(); // Trigger recalculation
      
      // Reset form
      setNewAddress({
        line1: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        isDefault: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!profileData?.addresses) return;
    
    try {
      const updatedAddresses = profileData.addresses.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      }));
      
      await useProfileStore.getState().saveProfile({ addresses: updatedAddresses });
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  // Auto-select default address or first address if none selected
  useEffect(() => {
    if (!selectedAddress && profileData?.addresses) {
      const defaultAddr = profileData.addresses.find(addr => addr.isDefault);
      const firstAddr = profileData.addresses[0];
      
      if (defaultAddr) {
        onAddressSelect(defaultAddr);
      } else if (firstAddr) {
        onAddressSelect(firstAddr);
      }
    }
  }, [profileData?.addresses, selectedAddress, onAddressSelect]);

  // Check if user can add more addresses (max 2)
  const canAddAddress = !profileData?.addresses || profileData.addresses.length < 2;

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Billing details</h2>
        {!showAddForm && canAddAddress && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Address
          </button>
        )}
      </div>

      {/* Address List */}
      {profileData?.addresses && profileData.addresses.length > 0 && !showAddForm && (
        <div className="space-y-3 mb-6">
          {profileData.addresses.map((address, index) => (
            <div
              key={address._id || index}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedAddress?._id === address._id
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    selectedAddress?._id === address._id
                      ? 'border-[#D4AF37] bg-[#D4AF37]'
                      : 'border-gray-300'
                  }`}>
                    {selectedAddress?._id === address._id && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {index === 0 ? 'Home Address' : 'Office Address'}
                      </span>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-[#D4AF37] text-black text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>{address.line1}</div>
                      <div>{address.city}, {address.state} {address.zip}</div>
                      <div>{address.country}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address._id || '');
                      }}
                      className="text-xs text-[#D4AF37] hover:text-[#B8941F] cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Form */}
      {showAddForm && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Address</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={newAddress.line1}
                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-black"
                placeholder="Enter street address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-black"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-black"
                placeholder="Enter state"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                value={newAddress.zip}
                onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-black"
                placeholder="Enter postal code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-black"
                placeholder="Enter country"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="setDefault"
              checked={newAddress.isDefault}
              onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
              className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
            />
            <label htmlFor="setDefault" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddAddress}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#D4AF37] text-black rounded-lg hover:bg-[#B8941F] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
