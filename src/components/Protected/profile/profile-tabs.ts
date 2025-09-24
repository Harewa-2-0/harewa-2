import { User, Package, Activity, Heart, Trash2, LogOut } from 'lucide-react';

export const menuItems = [
  { id: 'orders', label: 'My Orders', icon: Package, active: true },
  { id: 'activity', label: 'Activity feed', icon: Activity, active: false },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, active: false },
  { id: 'info', label: 'My info', icon: User, active: false },
  { id: 'logout', label: 'Logout', icon: LogOut, active: false },
  { id: 'delete-account', label: 'Delete Account', icon: Trash2, active: false }
];

export const orderTabs = [
  { id: 'active', label: 'Active', count: 40 },
  { id: 'completed', label: 'Completed', count: 0 },
  { id: 'cancelled', label: 'Cancelled', count: 0 }
];
