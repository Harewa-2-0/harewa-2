'use client';

import React, { useEffect, useState } from 'react';

// ==========================================
// MAINTENANCE SWITCH
// Set to true to bring the website down.
// Set to false to restore the website.
// ==========================================
const IS_MAINTENANCE_MODE = true;
// ==========================================

const DEACTIVATION_DATE = new Date('2026-02-14T00:16:27'); // The time the site was deactivated

interface MaintenanceWrapperProps {
    children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
    const [timeElapsed, setTimeElapsed] = useState('');

    useEffect(() => {
        if (!IS_MAINTENANCE_MODE) return;

        const calculateTime = () => {
            const now = new Date();
            const diff = now.getTime() - DEACTIVATION_DATE.getTime();

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeElapsed(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!IS_MAINTENANCE_MODE) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] text-white overflow-y-auto pt-10 pb-10">
            <div className="max-w-2xl px-4 md:px-8 py-8 md:py-16 text-center w-full">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/50" />
                <div className="mb-8 md:mb-12 flex justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 md:w-24 md:h-24 border-2 border-[#D4AF37] rounded-full animate-ping opacity-20 absolute inset-0" />
                        <div className="w-16 h-16 md:w-24 md:h-24 border-2 border-[#D4AF37] rounded-full flex items-center justify-center bg-[#0a0a0a] relative z-10">
                            <svg
                                className="w-8 h-8 md:w-12 md:h-12 text-[#D4AF37]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">
                    Website <span className="text-[#D4AF37]">Offline</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-6 md:mb-8 leading-relaxed px-2">
                    The Website has been brought Down and is temporarily unavailable.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-xl border border-white/5">
                        <span className="block text-xs md:text-sm text-gray-500 uppercase tracking-widest mb-1 md:mb-2 font-semibold">
                            Deactivated On
                        </span>
                        <span className="text-base md:text-lg font-medium">
                            {DEACTIVATION_DATE.toLocaleDateString()} at {DEACTIVATION_DATE.toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-xl border border-white/5">
                        <span className="block text-xs md:text-sm text-gray-500 uppercase tracking-widest mb-1 md:mb-2 font-semibold">
                            Time Elapsed
                        </span>
                        <span className="text-base md:text-lg font-mono text-[#D4AF37]">
                            {timeElapsed || '00:00:00'}
                        </span>
                    </div>
                </div>

                <div className="bg-[#D4AF37]/10 p-6 md:p-8 rounded-2xl border border-[#D4AF37]/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-110" />
                    <p className="text-base md:text-lg font-medium text-[#D4AF37] mb-4">
                        If you are the owner of this website, please contact your developers immediately.
                    </p>
                    <a
                        href="mailto:harewa2.0@gmail.com"
                        className="inline-flex items-center space-x-2 md:space-x-3 text-xl md:text-2xl font-bold hover:text-[#D4AF37] transition-colors break-all"
                    >
                        <svg
                            className="w-6 h-6 md:w-8 md:h-8 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                        <span>harewa2.0@gmail.com</span>
                    </a>
                </div>

                <p className="mt-8 md:mt-12 text-gray-600 text-xs md:text-sm">
                    &copy; {new Date().getFullYear()} HAREWA Development Team. All rights reserved.
                </p>
            </div>
        </div>
    );
}
