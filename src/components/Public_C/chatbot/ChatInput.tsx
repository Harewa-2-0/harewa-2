import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    disabled = false,
    placeholder = "Type your message..."
}) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage && !disabled) {
            onSend(trimmedMessage);
            setMessage('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2 items-end">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className="flex-1 resize-none px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed max-h-32"
                    style={{
                        minHeight: '42px',
                        maxHeight: '128px',
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    className="flex-shrink-0 w-10 h-10 bg-[#D4AF37] hover:bg-[#B8941F] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                    aria-label="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            {/* Hint */}
            <div className="flex justify-between items-center mt-2 px-1">
                <p className="text-xs text-gray-500">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
};

export default ChatInput;
