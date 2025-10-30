'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('user@example.com');

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const storedEmail = localStorage.getItem('resetEmail') || sessionStorage.getItem('resetEmail');
    setEmail(urlEmail || storedEmail || 'user@example.com');
  }, [searchParams]);

  const openEmailApp = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-white font-sans">
      {/* Logo */}
      <div className="absolute top-4 left-4">
        <Image src="/logo.webp" alt="logo" width={120} height={40} />
      </div>

      {/* Back link */}
      <div className="absolute hidden md:block top-6 right-6 text-sm">
        <span className="text-[#1A1A1A]">Back to </span>
        <a href="/signin" className="text-[#FDC713] font-medium hover:underline">
          Sign In
        </a>
      </div>

      {/* Container */}
      <div className="w-full max-w-md p-8 md:p-10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] bg-white text-center animate-fadeInUp">
        {/* Email Icon */}
        <div className="relative mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-[#FFE181] to-[#FDC713] flex items-center justify-center text-3xl text-[#3D3D3D]">
          ✉
          <div className="absolute top-[-5px] right-[-5px] w-5 h-5 bg-[#11E215] rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            ✓
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-[#3D3D3D] mb-3 animate-slideIn delay-[200ms]">
          Check your email
        </h1>
        <p className="text-sm text-[#5D5D5D] mb-6 leading-relaxed animate-slideIn delay-[400ms]">
          We sent a password reset link to your email address. Click the link to reset your password.
        </p>

        {/* Email Display */}
        <div className="bg-[#F2F2F2] px-4 py-3 rounded-md mb-6 font-medium text-[#3D3D3D] text-sm animate-slideIn delay-[600ms]">
          {email}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 animate-slideIn delay-[800ms]">
          <button
            onClick={openEmailApp}
            className="bg-[#FFE181] text-[#3D3D3D] px-6 py-3 rounded-md font-semibold hover:bg-[#D4AF37] hover:text-white hover:-translate-y-[2px] transition-all shadow hover:shadow-lg"
          >
            Open Email App
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 p-5 bg-[#F8F9FA] rounded-md text-left animate-slideIn delay-[1000ms]">
          <h4 className="text-sm font-semibold text-[#3D3D3D] mb-2">Didn't receive the email?</h4>
          <ul className="text-xs text-[#5D5D5D] list-disc list-inside space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Make sure the email address is correct</li>
            <li>Wait a few minutes and try again</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const CheckEmail = () => {
  return (
    <Suspense fallback={
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
};

export default CheckEmail;