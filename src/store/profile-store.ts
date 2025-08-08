'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getMe, patchMe, uploadAvatar,
  getTwoAddresses, upsertAddress,
  User, Address
} from '@/services/profile';

type State = {
  user?: User;
  loadingUser: boolean;
  savingUser: boolean;

  addresses: { billing?: Address; shipping?: Address };
  loadingAddresses: boolean;
  savingAddress: boolean;

  // actions
  fetchProfile: () => Promise<void>;
  saveProfile: (p: Partial<User>) => Promise<void>;
  changeAvatar: (file: File) => Promise<void>;

  fetchAddresses: () => Promise<void>;
  editAddress: (kind: 'billing' | 'shipping', data: Omit<Address, 'kind'>) => Promise<void>;
};

export const useProfileStore = create<State>()(
  devtools((set, get) => ({
    user: undefined,
    loadingUser: false,
    savingUser: false,

    addresses: {},
    loadingAddresses: false,
    savingAddress: false,

    async fetchProfile() {
      set({ loadingUser: true });
      try {
        const u = await getMe();
        set({ user: u });
      } finally {
        set({ loadingUser: false });
      }
    },

    async saveProfile(p) {
      set({ savingUser: true });
      try {
        const u = await patchMe({
          fullName: p.fullName,
          phone: p.phone,
          gender: p.gender,
          dob: p.dob,
        });
        set({ user: u });
      } finally {
        set({ savingUser: false });
      }
    },

    async changeAvatar(file) {
      set({ savingUser: true });
      try {
        const u = await uploadAvatar(file);
        set({ user: u });
      } finally {
        set({ savingUser: false });
      }
    },

    async fetchAddresses() {
      set({ loadingAddresses: true });
      try {
        const list = await getTwoAddresses();
        const billing = list.find(a => a.kind === 'billing');
        const shipping = list.find(a => a.kind === 'shipping');
        set({ addresses: { billing, shipping } });
      } finally {
        set({ loadingAddresses: false });
      }
    },

    async editAddress(kind, data) {
      set({ savingAddress: true });
      try {
        const current = get().addresses[kind];
        const updated = await upsertAddress({ ...current, ...data, kind });
        set({
          addresses: { ...get().addresses, [kind]: updated },
        });
      } finally {
        set({ savingAddress: false });
      }
    },
  }))
);
