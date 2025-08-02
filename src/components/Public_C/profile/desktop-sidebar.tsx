'use client';

import { User } from 'lucide-react';
import { menuItems } from './profile-tabs';

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  user?: {
    fullName?: string;
    email?: string;
  };
}

export default function DesktopSidebar({ activeTab, onTabChange, user }: Props) {
  return (
    <div className="hidden md:block w-64 bg-white border-r min-h-screen">
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              Hello {user?.fullName || 'HAREWA'}
            </h2>
            <p className="text-sm text-gray-500">
              {user?.email || 'user@harewa.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left mb-1 transition-colors
              ${activeTab === item.id
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'text-gray-700 hover:bg-gray-50'}
              ${item.isLogout ? 'text-red-600 hover:bg-red-50' : ''}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
