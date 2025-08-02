'use client';

import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuItems } from './profile-tabs';

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MobileNavigation({
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: Props) {
  return (
    <div className="md:hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-lg font-semibold">My Profile</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b bg-white overflow-hidden"
          >
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50
                  ${activeTab === item.id ? 'bg-yellow-50 border-r-2 border-yellow-400' : ''}
                  ${item.isLogout ? 'text-red-600' : 'text-gray-700'}`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
