'use client';

import { Pencil, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { User } from '@/services/profile';

export type ContactValues = Pick<User, 'fullName'|'email'|'phone'|'gender'|'dob'>;

export default function ContactInfoCard({
  user,
  saving,
  onSave,
}: {
  user?: User;
  saving?: boolean;
  onSave: (v: ContactValues) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<ContactValues>();

  useEffect(() => {
    reset({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender,
      dob: user?.dob || '',
    });
  }, [user, reset]);

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
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
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
          <label className="block text-sm text-gray-600 mb-1">Full name</label>
          <input {...register('fullName')} disabled={!editing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50"/>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input {...register('email')} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50"/>
          <p className="text-xs text-gray-500 mt-1">Email can’t be changed.</p>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Phone</label>
          <input {...register('phone')} disabled={!editing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50"/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Gender</label>
            <select {...register('gender')} disabled={!editing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50 bg-white">
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date of birth</label>
            <input type="date" {...register('dob')} disabled={!editing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50"/>
          </div>
        </div>

        {editing && (
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex items-center px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#bfa129] disabled:opacity-50"
            >
              {saving && <Loader2 className="animate-spin mr-2" size={16} />}
              Save changes
            </button>
            <button type="button" onClick={() => reset()} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
