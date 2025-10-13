"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

// Dedupe across React StrictMode, Fast Refresh, and multiple layouts
let BOOTSTRAPPED = false;

export default function AuthBootstrap() {
  const hasClientHydrated = useAuthStore((s) => s.hasClientHydrated);
  const hasHydratedAuth = useAuthStore((s) => s.hasHydratedAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const silentRefresh = useAuthStore((s) => s.silentRefresh);
  const hydrateFromCookie = useAuthStore((s) => s.hydrateFromCookie);
  const user = useAuthStore((s) => s.user);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // CRITICAL FIX: Force hasClientHydrated to true if user data exists
  useEffect(() => {
    if (!hasClientHydrated && (user || isAuthenticated)) {
      console.log('[Auth] Force-setting hasClientHydrated due to present user data');
      useAuthStore.setState({ hasClientHydrated: true });
    }
  }, [hasClientHydrated, user, isAuthenticated]);

  // Also add a timeout fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasClientHydrated) {
        console.log('[Auth] Fallback: Setting hasClientHydrated after 500ms');
        useAuthStore.setState({ hasClientHydrated: true });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [hasClientHydrated]);

  // Helper: Only call server if we have evidence of a logged-in user
  const checkAndHydrate = () => {
    // Check for cached auth snapshot
    const snapshot = localStorage.getItem('auth-snapshot');
    if (!snapshot) {
      console.log('[Auth] No cached session, skipping server check');
      // Mark as hydrated so UI knows we're done checking
      useAuthStore.setState({ hasHydratedAuth: true });
      return;
    }

    try {
      const cached = JSON.parse(snapshot);
      if (cached.isAuthenticated && cached.user) {
        console.log('[Auth] Found cached session, verifying with server...');
        // We think user is logged in - verify with server
        void hydrateFromCookie();
        return;
      }
    } catch (e) {
      console.warn('[Auth] Invalid cached snapshot, clearing');
      localStorage.removeItem('auth-snapshot');
    }

    // No valid cached session
    console.log('[Auth] No valid cached session');
    useAuthStore.setState({ hasHydratedAuth: true });
  };

  // ONE-TIME: Smart hydration on mount (only if cached state suggests logged in)
  useEffect(() => {
    if (BOOTSTRAPPED) return;
    BOOTSTRAPPED = true;

    if (typeof window !== "undefined") {
      if ((window as any).__AUTH_BOOTSTRAPPED__) return;
      (window as any).__AUTH_BOOTSTRAPPED__ = true;
    }

    // Wait for Zustand to finish rehydrating from localStorage
    if (!hasClientHydrated) {
      const unsubscribe = useAuthStore.subscribe(
        (state) => {
          if (state.hasClientHydrated) {
            unsubscribe();
            checkAndHydrate();
          }
        }
      );
      return;
    }

    checkAndHydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasClientHydrated]);

  // Background session refresh (only if authenticated)
  useEffect(() => {
    if (!isAuthenticated || !hasHydratedAuth) {
      // Clear any existing interval if user logged out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log('[Auth] Starting background session checks (5min interval)');

    // Immediate check
    void silentRefresh();

    // Then every 5 minutes
    intervalRef.current = setInterval(() => {
      console.log('[Auth] Background session check...');
      void silentRefresh();
    }, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, hasHydratedAuth, silentRefresh]);

  return null;
}