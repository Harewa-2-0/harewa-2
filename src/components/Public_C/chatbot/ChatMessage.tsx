import React from 'react';
import { Bot, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/services/fashionChat';

interface ChatMessageProps {
    message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const timestamp = message.timestamp || message.createdAt;

    const formatTime = (time?: string) => {
        if (!time) return '';
        const date = new Date(time);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-[#D4AF37]' : 'bg-gray-200'
                }`}>
                {isUser ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-gray-700" />
                )}
            </div>

            {/* Message bubble */}
            <div className={`flex flex-col max-w-[75%] overflow-hidden ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl ${isUser
                    ? 'bg-[#D4AF37] text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                    }`}>
                    {message.image && (
                        <div className="mb-2">
                            <img
                                src={message.image}
                                alt="Shared image"
                                className="max-w-full h-auto rounded-lg border border-white/20 shadow-sm"
                                style={{ maxHeight: '200px' }}
                            />
                        </div>
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content.split('\n').map((line, i) => (
                            <div key={i}>
                                {line.split(/(\*\*.*?\*\*|\[!\[.*?\]\(.*?\)\]\(.*?\)|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g).map((part, j) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={j}>{part.slice(2, -2)}</strong>;
                                    }

                                    // Match Linked Image [![alt](img_url)](link_url)
                                    const linkedImgMatch = part.match(/^\[!\[(.*?)\]\((.*?)\)\]\((.*?)\)$/);
                                    if (linkedImgMatch) {
                                        return (
                                            <div key={j} className="my-3 flex flex-col gap-2 bg-white/50 rounded-xl p-2 border border-black/5 w-full max-w-[180px]">
                                                <a
                                                    href={linkedImgMatch[3]}
                                                    className="block hover:opacity-90 transition-opacity"
                                                >
                                                    <img
                                                        src={linkedImgMatch[2]}
                                                        alt={linkedImgMatch[1]}
                                                        className="w-full h-auto rounded-lg shadow-sm"
                                                        style={{ maxHeight: '140px', objectFit: 'cover' }}
                                                    />
                                                </a>
                                                <a
                                                    href={linkedImgMatch[3]}
                                                    className="w-full text-center py-2 px-3 bg-[#D4AF37] hover:bg-[#B8941F] text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                >
                                                    Learn More
                                                </a>
                                            </div>
                                        );
                                    }

                                    // Match Image ![alt](url)
                                    const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
                                    if (imgMatch) {
                                        return (
                                            <div key={j} className="my-2">
                                                <img
                                                    src={imgMatch[2]}
                                                    alt={imgMatch[1]}
                                                    className="max-w-full h-auto rounded-lg shadow-sm border border-black/5"
                                                    style={{ maxHeight: '140px', objectFit: 'cover' }}
                                                />
                                            </div>
                                        );
                                    }

                                    // Match Link [text](url)
                                    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
                                    if (linkMatch) {
                                        return (
                                            <a
                                                key={j}
                                                href={linkMatch[2]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline underline-offset-2 break-all"
                                            >
                                                {linkMatch[1]}
                                            </a>
                                        );
                                    }
                                    return part;
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timestamp */}
                {timestamp && (
                    <span className="text-xs text-gray-500 mt-1 px-1">
                        {formatTime(timestamp)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
