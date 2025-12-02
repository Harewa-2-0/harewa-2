import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
    onClose: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (messageText: string) => {
        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);

        // Auto-reply with "Coming Soon" message
        setTimeout(() => {
            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                role: 'assistant',
                content: 'Coming Soon! For inquiries, please reach us at admin@harewa.com',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, botMessage]);
        }, 500);
    };

    return (
        <div className="flex flex-col h-[500px] w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base">Fashion AI</h3>
                        <p className="text-xs text-white/80">Style Consultant</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Close chat"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-xs px-4">
                            <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="w-7 h-7 text-[#D4AF37]" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">Welcome!</h4>
                            <p className="text-xs text-gray-600">
                                Ask me anything about fashion trends, styling tips, or our products.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input area */}
            <ChatInput
                onSend={handleSendMessage}
                placeholder="Ask me about fashion..."
            />
        </div>
    );
};

export default ChatWindow;
