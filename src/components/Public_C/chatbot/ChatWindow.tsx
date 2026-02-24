import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendFashionConsultation, type ChatMessage as ChatMessageType } from '@/services/fashionChat';

interface ChatWindowProps {
    onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [botName, setBotName] = useState('Fashion AI');

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch AI Settings for dynamic bot name
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/ai-settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.data?.settings?.botName) {
                        setBotName(data.data.settings.botName);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch AI settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleSendMessage = async (messageText: string, image?: string) => {
        // Add user message to UI
        const userMessage: ChatMessageType = {
            role: 'user',
            content: messageText,
            image: image,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Send to AI
            const response = await sendFashionConsultation({
                messages: [...messages, userMessage],
                image: image
            });

            if (response.reply) {
                setMessages(prev => [...prev, response.reply]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage: ChatMessageType = {
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again later.",
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] w-[300px] md:h-[450px] md:w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden ">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base">{botName}</h3>
                        <p className="text-xs text-white/80">Style Consultant</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 bg-[#D4AF37] hover:bg-[#B8941F] rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                    aria-label="Close chat"
                >
                    <X className="w-4 h-4 text-white" />
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
                        {messages.map((message, idx) => (
                            <ChatMessage key={idx} message={message} />
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 items-center text-gray-400 text-xs animate-pulse mb-4">
                                <Sparkles className="w-3 h-3" />
                                <span>StyleForge AI is thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input area */}
            <ChatInput
                onSend={handleSendMessage}
                disabled={isLoading}
                placeholder="Ask me about fashion..."
            />
        </div>
    );
};

export default ChatWindow;
