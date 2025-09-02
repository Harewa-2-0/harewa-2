'use client';

import clsx from 'clsx';
import { menuItems } from './profile-tabs';
import { useUIStore } from '@/store/uiStore';

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

  // Whether the bar is logically allowed to show (manual close vs scroll)
  const announcementShown = isAnnouncementVisible && !isAnnouncementHiddenByScroll;

  return (
    <div
      className={clsx(
        'md:hidden fixed left-0 right-0 z-40',
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
            onClick={() => onTabChange(item.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${
                activeTab === item.id
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  : item.id === 'delete-account'
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
