'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';

/**
 * Temporary debug component to see auth state
 * Add this to your layout temporarily: <AuthDebug />
 */
export default function AuthDebug() {
  const state = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Auth State (Debug)</div>
      <div className="space-y-1">
        <div>hasClientHydrated: <span className={state.hasClientHydrated ? 'text-green-400' : 'text-red-400'}>{String(state.hasClientHydrated)}</span></div>
        <div>hasHydratedAuth: <span className={state.hasHydratedAuth ? 'text-green-400' : 'text-red-400'}>{String(state.hasHydratedAuth)}</span></div>
        <div>isAuthenticated: <span className={state.isAuthenticated ? 'text-green-400' : 'text-red-400'}>{String(state.isAuthenticated)}</span></div>
        <div>user: <span className={state.user ? 'text-green-400' : 'text-red-400'}>{state.user ? state.user.email : 'null'}</span></div>
        <div>isLoading: {String(state.isLoading)}</div>
      </div>
      <div className="mt-2 text-yellow-400 text-[10px]">
        Remove this component after debugging
      </div>
    </div>
  );
}