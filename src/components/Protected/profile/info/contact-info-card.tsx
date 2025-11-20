'use client';

import { Pencil, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Profile } from '@/services/profile';

export type ContactValues = {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
};

export default function ContactInfoCard({
  profileData,
  saving,
  onSave,
}: {
  profileData?: Profile;
  saving?: boolean;
  onSave: (v: ContactValues) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<ContactValues>();

  useEffect(() => {
    reset({
      username: profileData?.user?.username || '',
      firstName: profileData?.firstName || '',
      lastName: profileData?.lastName || '',
      phone: profileData?.phone || '',
      bio: profileData?.bio || '',
    });
  }, [profileData, reset]);

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-black">Contact Info</h3>
          <p className="text-sm text-gray-500">Details</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(v => !v)}
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer bg-[#D4AF37] text-black hover:bg-[#f0c000]"
        >
          <Pencil size={16} />
          {editing ? 'Close' : 'Edit'}
        </button>
      </div>

      <form
        onSubmit={handleSubmit(async (vals) => { await onSave(vals); setEditing(false); })}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">Username</label>
          {editing ? (
            <input {...register('username')} className="w-full border rounded-lg px-3 py-2 text-black"/>
          ) : (
            <p className="text-black font-medium">{profileData?.user?.username || 'Not set'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <p className="text-black font-medium">{profileData?.user?.email}</p>
          <p className="text-xs text-gray-500 mt-1">Email can't be changed.</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">First Name</label>
          {editing ? (
            <input {...register('firstName')} className="w-full border rounded-lg px-3 py-2 text-black"/>
          ) : (
            <p className="text-black font-medium">{profileData?.firstName || 'Not set'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Last Name</label>
          {editing ? (
            <input {...register('lastName')} className="w-full border rounded-lg px-3 py-2 text-black"/>
          ) : (
            <p className="text-black font-medium">{profileData?.lastName || 'Not set'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Phone</label>
          {editing ? (
            <input {...register('phone')} className="w-full border rounded-lg px-3 py-2 text-black"/>
          ) : (
            <p className="text-black font-medium">{profileData?.phone || 'Not set'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Role</label>
          <p className="text-black font-medium capitalize">{profileData?.user?.role}</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Bio</label>
          {editing ? (
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-black"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-black">{profileData?.bio || 'No bio added yet'}</p>
          )}
        </div>

        {editing && (
          <div className="md:col-span-2 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDirty || saving}
              className="px-4 py-2 bg-[#fdc713] text-black rounded-lg hover:bg-[#f0c000] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
