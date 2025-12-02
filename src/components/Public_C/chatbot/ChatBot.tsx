"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="chat-window"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="origin-bottom-right"
                    >
                        <ChatWindow onClose={() => setIsOpen(false)} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="chat-button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChatButton isOpen={isOpen} onClick={toggleChat} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatBot;
