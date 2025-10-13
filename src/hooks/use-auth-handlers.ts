"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { loginWithEmail, getMe, GOOGLE_OAUTH_URL } from "@/services/auth";
import { useToast } from "@/contexts/toast-context";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
  fullName?: string;
}

export default function useAuthHandlers() {
  const router = useRouter();
  const { setEmailForVerification, setUser } = useAuthStore();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
    fullName: "",
  });

  const [authState, setAuthState] = useState({
    isLoading: false,
    isGoogleLoading: false,
    isRedirecting: false,
  });

  /** ✅ Input Change Handler */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, type, value, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  /** ✅ Common Success Handler */
  const handleAuthSuccess = useCallback(
    (userData: any, remember: boolean) => {
      const user = {
        id: userData?.id || "local",
        email: userData?.email || formData.email,
        fullName:
          userData?.fullName ||
          userData?.name ||
          formData.fullName ||
          undefined,
        name:
          userData?.name ||
          userData?.fullName ||
          formData.fullName ||
          undefined,
        role: userData?.role || "user",
        avatar: userData?.avatar || userData?.picture || undefined,
      };

      setUser(user, remember ? "localStorage" : "sessionStorage");
      
      // ✅ Save snapshot for instant hydration on next visit
      localStorage.setItem('auth-snapshot', JSON.stringify({ user, isAuthenticated: true }));

      setAuthState({
        isLoading: false,
        isGoogleLoading: false,
        isRedirecting: false,
      });

      // Show success toast
      addToast("Login successful! Redirecting...", "success");

      // Redirect after short delay based on user role
      setTimeout(() => {
        setAuthState((prev) => ({ ...prev, isRedirecting: true }));
        // Route based on user role - complete app separation
        if (user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/home");
        }
      }, 800);
    },
    [formData, router, setUser, addToast]
  );

  /** ✅ Common Error Handler */
  const handleAuthError = useCallback(
    (error: any, isGoogle = false) => {
      let msg =
        error?.message || error?.error || "Something went wrong. Please try again.";

      if (isGoogle) {
        msg = "Google authentication failed. Please try again.";
      } else if (typeof msg === "string" && msg.toLowerCase().includes("not verified")) {
        setEmailForVerification(formData.email);
        router.push("/verify-email");
        return;
      }

      setAuthState({
        isLoading: false,
        isGoogleLoading: false,
        isRedirecting: false,
      });

      // Show error toast
      addToast(msg, "error");
    },
    [formData.email, router, setEmailForVerification, addToast]
  );

  /** ✅ Email Login (via service) */
  const handleEmailLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.email || !formData.password) {
        addToast("Please fill in all required fields.", "error");
        return;
      }

      setAuthState((prev) => ({ ...prev, isLoading: true }));

      try {
        const { user } = await loginWithEmail({
          email: formData.email,
          password: formData.password,
        });
        handleAuthSuccess(user, formData.rememberMe);
      } catch (err: any) {
        handleAuthError(err);
      }
    },
    [formData, handleAuthError, handleAuthSuccess, addToast]
  );

  /** ➊ Listen for postMessage from the Google popup */
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.origin) return;
      const { type, status } = event.data || {};
      if (type === "oauth" && status === "success") {
        // Popup has closed itself after setting cookies → fetch the user
        getMe()
          .then(({ user }) => handleAuthSuccess(user, true))
          .catch(() =>
            handleAuthError({ message: "Google login failed or was cancelled." }, true)
          );
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleAuthSuccess, handleAuthError]);

  /** ✅ Google Login (postMessage + auto-close) */
  const handleGoogleLogin = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      isGoogleLoading: true,
    }));

    const popup = window.open(
      GOOGLE_OAUTH_URL,
      "google-oauth",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    if (!popup) {
      handleAuthError(
        { message: "Popup blocked. Enable popups and try again." },
        true
      );
    }
    // no more polling—popup will postMessage & self-close on success
  }, [handleAuthError]);

  return {
    formData,
    authState,
    handleChange,
    handleEmailLogin,
    handleGoogleLogin,
  };
}