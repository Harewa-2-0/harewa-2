"use client";
import React, { useState } from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-6 right-4 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <ChatWindow onClose={() => setIsOpen(false)} />
                </div>
            )}

            {/* Chat Button */}
            <ChatButton isOpen={isOpen} onClick={toggleChat} />
        </div>
    );
};

export default ChatBot;
