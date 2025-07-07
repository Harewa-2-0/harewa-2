"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/check-email?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || "Email not found. Please check your email address.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 lg:px-8">
        <div className="flex items-center">
          <img
            src="/logo.webp"
            alt="Haremla Logo"
            className="h-8 w-auto"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-[#1A1A1A] hidden md:block">Don't have an account?</span>
          <button
            onClick={handleSignUp}
            className="text-[#FDC713] cursor-pointer hover:text-[#D4AF37] transition-colors duration-200 font-medium"
          >
            Sign up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Fingerprint Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src="/finger.png"
                alt="Fingerprint"
                className="h-16 w-16 animate-pulse"
              />
              <div className="absolute inset-0 bg-[#FFE181] rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-semibold text-[#3D3D3D] text-center mb-3">
            Forgot password?
          </h1>

          {/* Subtitle */}
          <p className="text-[#5D5D5D] text-center mb-8 text-sm lg:text-base">
            Enter your email to recover your password
          </p>

          {/* Success Message */}
          {success && (
            <div className="text-green-600 text-center mb-4 animate-slideUp">
              ✅ Email sent! Redirecting you to check your email...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter email"
                className={`w-full px-4 py-3 bg-[#F2F2F2] border-2 rounded-lg text-[#1A1A1A] placeholder-[#1A1A1AB2] focus:outline-none focus:ring-2 focus:ring-[#FFE181] focus:border-transparent transition-all duration-200 ${
                  error ? "border-red-500 shake" : "border-transparent"
                }`}
                disabled={isLoading}
              />
              {error && (
                <div className="absolute -bottom-6 left-0 text-red-500 text-xs animate-slideUp">
                  {error}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FFE181] hover:bg-[#D4AF37] text-white cursor-pointer font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-8"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                "Send code"
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}