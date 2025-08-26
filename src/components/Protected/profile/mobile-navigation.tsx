'use client';

import { useState } from 'react';
import { Package, Activity, Heart, User, Trash2, Menu, X } from 'lucide-react';
import { menuItems } from './profile-tabs';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MobileNavigation({
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: MobileNavigationProps) {
  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden p-4 border-b bg-white">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 text-gray-700"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          <span className="font-medium">Menu</span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="p-4 border-b">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700"
              >
                <X size={24} />
                <span className="font-medium">Close</span>
              </button>
            </div>

            <nav className="p-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left mb-1 transition-colors
                    ${activeTab === item.id
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : item.id === 'delete-account'
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
        </div>
      )}
    </>
  );
}