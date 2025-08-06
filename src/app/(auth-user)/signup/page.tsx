"use client";

import Image from "next/image";
import Toast from "@/components/Public_C/common/toast";
import useSignupHandlers from "@/hooks/use-signup-handler";
import usePasswordStrength from "@/hooks/use-password-strength";
import { useRouter } from "next/navigation";

export default function SignupScreen() {
  const {
    formData,
    handleInputChange,
    handleSubmit,
    isLoading,
    toasts,
    setToasts,
    showUserExistsModal,
    setShowUserExistsModal,
  } = useSignupHandlers();

  const { requirements, strength, showRequirements, getStrengthText, getStrengthBarWidth, getStrengthBarColor } =
    usePasswordStrength(formData.password);

  const router = useRouter();

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        />
      ))}

      {/* Left Image */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <Image src="/auth.webp" alt="Authentication" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
        <div className="absolute bottom-8 left-8 text-white">
          <p className="text-sm">HAREWA - All rights reserved</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center px-6 pt-4 py-12 lg:px-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image src="/logo.webp" alt="HAREWA Logo" fill className="object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center -mt-12">
            <h1 className="text-4xl font-bold text-black">Create account</h1>
            <p className="mt-2 text-sm text-black">Fill in your login credentials</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 bg-[#F2F2F2] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:border-transparent transition-colors placeholder:text-[#1A1A1AB2] text-[#1A1A1AB2]"
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="info@harewa.com"
              required
              className="w-full px-4 py-3 bg-[#F2F2F2] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:border-transparent transition-colors placeholder:text-[#1A1A1AB2] text-[#1A1A1AB2]"
            />

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className="w-full px-4 py-3 bg-[#F2F2F2] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:border-transparent transition-colors placeholder:text-[#1A1A1AB2] text-[#1A1A1AB2]"
              />

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#FDC713] border-gray-300 rounded focus:ring-[#FDC713]"
                  />
                  <span className="ml-2 text-sm text-[#1A1A1AB2]">Remember me</span>
                </label>
                <a href="/reset-password" className="text-sm text-[#1A1A1A] hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-1 bg-gray-200 rounded-full flex-1 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthBarWidth(strength)} ${getStrengthBarColor(strength)}`}
                      />
                    </div>
                    <span
                      className={`ml-3 text-sm font-medium ${
                        strength === "weak"
                          ? "text-red-500"
                          : strength === "medium"
                          ? "text-yellow-500"
                          : strength === "strong"
                          ? "text-green-500"
                          : ""
                      }`}
                    >
                      {getStrengthText(strength)}
                    </span>
                  </div>
                  {showRequirements && (
                    <div className="space-y-2 mt-3">
                      {requirements.map((req) => (
                        <div
                          key={req.id}
                          className={`flex items-center text-xs transition-all duration-300 ${
                            req.met ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center text-white text-xs font-bold transition-colors duration-300 ${
                              req.met ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            {req.met ? "✓" : "×"}
                          </div>
                          <span>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-white font-semibold py-3 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FDC713] focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>

            {/* Already have account */}
            <div className="text-center text-sm text-black">
              Already have an account?{" "}
              <a href="/signin" className="text-[#FDC713] hover:underline">
                Login here
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showUserExistsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">User is already registered.</h2>
            <p className="mb-6">You already have an account with this email.</p>
            <button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg mb-2"
              onClick={() => router.push("/signin")}
            >
              Login instead
            </button>
            <button
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg"
              onClick={() => setShowUserExistsModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
