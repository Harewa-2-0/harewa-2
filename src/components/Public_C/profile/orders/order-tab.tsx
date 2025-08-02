'use client';
import { orderTabs } from '../profile-tabs';

type OrderTabsProps = {
  activeOrderTab: string | number;
  onOrderTabChange: (tabId: string | number) => void;
};

export const OrderTabs = ({ activeOrderTab, onOrderTabChange }: OrderTabsProps) => (
  <div className="border-b">
    <div className="flex">
      {orderTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onOrderTabChange(tab.id)}
          className={`px-6 py-3 font-medium text-sm relative ${
            activeOrderTab === tab.id
              ? 'text-black border-b-2 border-black'
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
