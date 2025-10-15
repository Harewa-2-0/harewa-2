"use client";

import Image from "next/image";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^\w\s]/.test(password)) score++;
    return score;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!token) {
      setError("Invalid or expired reset link.");
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong.");
      }

      setStatus("✅ Reset successful! Redirecting to login...");
      setTimeout(() => router.push("/signin"), 2500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const strength = getStrength();

  return (
    <div className="flex flex-col min-h-screen justify-center items-center px-4 bg-white">
      <div className="absolute top-4 left-4">
        <Image src="/logo.webp" alt="logo" width={120} height={40} />
      </div>

      <div className="absolute top-6 right-6 text-sm hidden md:block">
        <span className="text-[#1A1A1A]">Don&apos;t have an account? </span>
        <a href="/signup" className="text-[#FDC713] font-medium hover:underline">
          Sign Up
        </a>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-6 rounded-md shadow animate-fade-in"
      >
        <div className="flex justify-center mb-4">
          <Image src="/passwordReset.png" alt="icon" width={40} height={40} />
        </div>
        <h2 className="text-center text-[#3D3D3D] text-xl font-semibold">Set new password</h2>
        <p className="text-center text-sm text-[#5D5D5D] mt-1">Must be at least 8 characters</p>

        <div className="mt-6">
          <input
            type="password"
            placeholder="New password*"
            className="w-full bg-[#F2F2F2] p-3 rounded text-[#1A1A1AB2] placeholder-[#1A1A1AB2] border-2 border-transparent focus:border-[#FFE181] focus:outline-none transition-colors duration-200"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error === "Passwords do not match.") setError("");
            }}
            required
          />

          {password && strength < 5 && (
            <div className="transition-all duration-300">
              <div className="flex items-center justify-between mt-2">
                <div className="h-2 flex-1 mr-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength >= 3
                        ? "bg-[#FFCA37] w-2/3"
                        : "bg-[#FF3E3E] w-1/3"
                    }`}
                  ></div>
                </div>
                <span className={`text-xs font-medium ${
                  strength >= 3
                    ? "text-[#FFCA37]"
                    : "text-[#FF3E3E]"
                }`}>
                  {strength >= 3 ? "Almost there" : "Too weak"}
                </span>
              </div>

              <ul className="text-xs mt-2 text-[#5D5D5D] space-y-1">
                <li className={`${password.length >= 8 ? "text-green-600" : ""}`}>
                  {password.length >= 8 ? "✓" : "✗"} minimum of 8 characters
                </li>
                <li className={`${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
                  {/[A-Z]/.test(password) ? "✓" : "✗"} any uppercase letter
                </li>
                <li className={`${/[a-z]/.test(password) ? "text-green-600" : ""}`}>
                  {/[a-z]/.test(password) ? "✓" : "✗"} any lowercase letter
                </li>
                <li className={`${/\d/.test(password) ? "text-green-600" : ""}`}>
                  {/\d/.test(password) ? "✓" : "✗"} any number
                </li>
                <li className={`${/[^\w\s]/.test(password) ? "text-green-600" : ""}`}>
                  {/[^\w\s]/.test(password) ? "✓" : "✗"} any symbol
                </li>
              </ul>
            </div>
          )}

          {password && strength >= 5 && (
            <div className="flex items-center justify-between mt-2">
              <div className="h-2 flex-1 mr-3 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-[#11E215] w-full transition-all duration-300"></div>
              </div>
              <span className="text-xs font-medium text-[#11E215]">Great!</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <input
            type="password"
            placeholder="Confirm password*"
            className="w-full bg-[#F2F2F2] p-3 rounded text-[#1A1A1AB2] placeholder-[#1A1A1AB2] border-2 border-transparent focus:border-[#FFE181] focus:outline-none transition-colors duration-200"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error === "Passwords do not match.") setError("");
            }}
            required
          />
          {confirmPassword && confirmPassword !== password && (
            <p className="text-red-600 text-xs mt-1">Password does not match</p>
          )}
        </div>

        {error && error !== "Passwords do not match." && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}
        {status && <p className="text-green-600 text-sm mt-3 animate-slide-in">{status}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 bg-[#FFE181] hover:bg-[#D4AF37] hover:text-white transition-colors duration-300 py-3 rounded text-sm font-semibold text-[#3D3D3D] cursor-pointer"
        >
          {submitting ? "Submitting..." : "Set new password"}
        </button>
      </form>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-in-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen justify-center items-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}