'use client';
import { orderTabs } from '../profile-tabs';

type OrderTabsProps = {
  activeOrderTab: string | number;
  onOrderTabChange: (tabId: string | number) => void;
  orderCounts?: {
    active: number;
    completed: number;
    cancelled: number;
  };
};

export const OrderTabs = ({ activeOrderTab, onOrderTabChange, orderCounts }: OrderTabsProps) => {
  const tabsWithCounts = orderTabs.map(tab => ({
    ...tab,
    count: orderCounts?.[tab.id as keyof typeof orderCounts] || 0
  }));

  return (
    <div className="border-b">
      <div className="flex justify-between md:justify-start">
        {tabsWithCounts.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onOrderTabChange(tab.id)}
            className={`px-6 py-3 font-medium text-sm relative ${
              activeOrderTab === tab.id
                ? 'text-black border-b-2 border-black bg-gray-100'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
