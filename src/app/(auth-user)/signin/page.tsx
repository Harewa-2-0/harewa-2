"use client";

import Image from "next/image";
import AuthForm from "@/components/Public_C/auth/auth_form";
import GoogleLoginButton from "@/components/Public_C/auth/google_login_button";
import useAuthHandlers from "@/hooks/use-auth-handlers";

export default function SigninScreen() {
  const {
    formData,
    authState,
    handleChange,
    handleEmailLogin,
    handleGoogleLogin,
  } = useAuthHandlers();

  const isFormDisabled =
    authState.isLoading || authState.isRedirecting;
  const isGoogleDisabled =
    authState.isGoogleLoading || authState.isRedirecting;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <img
          src="/auth.webp"
          alt="Authentication"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
        <div className="absolute bottom-8 left-8 text-white">
          <p className="text-sm">HAREWA - All rights reserved</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center px-6 bg-white lg:px-8 py-8 md:-mt-12 md:py-0 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image
                src="/logo.webp"
                alt="HAREWA Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center -mt-10 md:-mt-15">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600">Sign in to your account</p>
          </div>

          {/* Email/Password Form */}
          <AuthForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleEmailLogin}
            isDisabled={isFormDisabled}
            isLoading={authState.isLoading}
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <GoogleLoginButton
            onClick={handleGoogleLogin}
            isLoading={authState.isGoogleLoading}
            disabled={isGoogleDisabled}
          />

          {/* Sign up link */}
          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-yellow-600 font-medium hover:text-yellow-700 hover:underline"
            >
              Sign Up
            </a>
          </div>

          {/* Terms */}
          <div className="text-center text-xs text-gray-500 mt-6 md:mt-0">
            By signing in, you agree to our{" "}
            <a
              href="/terms"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Terms of Service
            </a>{" "}
            &{" "}
            <a
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
