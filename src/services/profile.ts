import { api } from '@/utils/api';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;        // ISO string
  avatarUrl?: string;
};

export type Address = {
  id?: string;
  kind: 'billing' | 'shipping';
  fullName?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

export function getMe() {
  return api<User>('/me');
}

export function patchMe(payload: Partial<Pick<User, 'fullName'|'phone'|'gender'|'dob'>>) {
  return api<User>('/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append('avatar', file);
  return api<User>('/me/avatar', { method: 'POST', body: form });
}

// Addresses — server shape may differ; adapt paths if needed
export function getTwoAddresses() {
  // Expecting array [{kind:'billing',...},{kind:'shipping',...}]
  return api<Address[]>('/addresses?limit=2');
}

export function upsertAddress(addr: Address) {
  // if id exists -> PATCH, else POST (but still only billing/shipping)
  if (addr.id) {
    return api<Address>(`/addresses/${addr.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addr),
    });
  }
  return api<Address>('/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addr),
  });
}
