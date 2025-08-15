"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

// Dedupe across React StrictMode, Fast Refresh, and multiple layouts
let BOOTSTRAPPED = false;

export default function AuthBootstrap() {
  useEffect(() => {
    if (BOOTSTRAPPED) return;
    BOOTSTRAPPED = true;

    if (typeof window !== "undefined") {
      if ((window as any).__AUTH_BOOTSTRAPPED__) return;
      (window as any).__AUTH_BOOTSTRAPPED__ = true;
    }

    void useAuthStore.getState().hydrateFromCookie();
  }, []);

  return null;
}
