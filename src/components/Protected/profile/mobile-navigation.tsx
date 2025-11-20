'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { menuItems } from './profile-tabs';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { clearUserQueries } from '@/utils/clearUserQueries';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function MobileNavigation({
  activeTab,
  onTabChange,
}: MobileNavigationProps) {
  const { isAnnouncementVisible, isAnnouncementHiddenByScroll } = useUIStore();
  const { logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleItemClick = async (itemId: string) => {
    if (itemId === 'logout') {
      // Clear user-specific React Query caches before logout
      clearUserQueries(queryClient);
      await logout();
      // Navigate to home page (preserves React Query cache for public data)
      router.push('/home');
    } else {
      onTabChange(itemId);
    }
  };

  // Whether the bar is logically allowed to show (manual close vs scroll)
  const announcementShown = isAnnouncementVisible && !isAnnouncementHiddenByScroll;

  return (
    <div
      className={clsx(
        'md:hidden fixed left-0 right-0 z-10',
        'bg-white/95 backdrop-blur-sm border-b shadow-sm'
      )}
      // Offset by the dynamic announcement height (+ header height ~64px)
      style={{
        top: 'calc(var(--announcement-height, 0px) + 54px)',
        transition: 'top 250ms ease',
      }}
      data-announcement-shown={announcementShown}
    >
      {/* Horizontal Scrollable Menu */}
      <div className="flex overflow-x-auto scrollbar-hide py-3 px-4 gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${
                activeTab === item.id
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  : item.id === 'delete-account' || item.id === 'logout'
                  ? 'text-red-600 hover:bg-red-50 border border-red-200'
                  : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
