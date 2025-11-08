'use client';

import { User } from 'lucide-react';
import { menuItems } from './profile-tabs';
import { useProfileQuery } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/authStore';

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function DesktopSidebar({ activeTab, onTabChange }: Props) {
  const { logout, isAuthenticated } = useAuthStore();
  const { data: profile } = useProfileQuery(isAuthenticated);

  const handleItemClick = async (itemId: string) => {
    if (itemId === 'logout') {
      await logout();
    } else {
      onTabChange(itemId);
    }
  };
  
  return (
    <div className="hidden md:block w-64 bg-white border-r min-h-screen fixed left-0 top-16 pt-8 overflow-y-auto">
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          {profile?.profilePicture ? (
            <img 
              src={profile.profilePicture} 
              alt="Profile" 
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-lg">
              {profile?.firstName?.[0]?.toUpperCase() || profile?.user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">
              {profile?.firstName || profile?.user?.username || 'HAREWA'}
            </h2>
            {/* 
            <p className="text-sm text-gray-500">
              {profile?.user?.email}
            </p>
            */}
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left mb-1 transition-colors
              ${activeTab === item.id
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : item.id === 'delete-account' || item.id === 'logout'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-50'}
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
