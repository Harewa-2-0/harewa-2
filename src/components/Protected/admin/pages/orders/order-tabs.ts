export const orderTabs = [
  { id: 'pending', label: 'Pending', count: 0 },
  { id: 'initiated', label: 'Initiated', count: 0 },
  { id: 'paid', label: 'Paid', count: 0 },
  { id: 'shipped', label: 'Shipped', count: 0 },
  { id: 'delivered', label: 'Delivered', count: 0 }
];

export type OrderTabId = 'pending' | 'initiated' | 'paid' | 'shipped' | 'delivered';
