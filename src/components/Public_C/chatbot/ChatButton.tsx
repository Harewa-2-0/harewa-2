import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

const ChatButton: React.FC<ChatButtonProps> = ({ isOpen, onClick, unreadCount = 0 }) => {
  return (
    <button
      onClick={onClick}
      className="group relative w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-50"
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {/* Animated background pulse */}
      <div className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-20 animate-ping" />

      {/* Icon */}
      <div className="relative z-10 transition-transform duration-300">
        {isOpen ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white" />
        )}
      </div>

      {/* Unread badge */}
      {!isOpen && unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {isOpen ? 'Close chat' : 'Get fashion advice'}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
      </div>
    </button>
  );
};

export default ChatButton;
