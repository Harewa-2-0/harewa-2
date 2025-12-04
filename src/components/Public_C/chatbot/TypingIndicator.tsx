import React from 'react';
import { Loader2 } from 'lucide-react';

const TypingIndicator: React.FC = () => {
    return (
        <div className="flex gap-3 mb-4">
            {/* AI Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
            </div>

            {/* Typing animation */}
            <div className="px-4 py-3 rounded-2xl bg-gray-100 rounded-tl-sm">
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
