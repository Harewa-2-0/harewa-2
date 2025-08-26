import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useTokenRefresh() {
  const { user } = useAuthStore();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  const refreshToken = useCallback(async () => {
    try {
      // Prevent multiple simultaneous refresh attempts
      const now = Date.now();
      if (now - lastRefreshRef.current < 5000) { // 5 second cooldown
        return false;
      }
      lastRefreshRef.current = now;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        console.log('Token refreshed successfully');
        return true;
      } else {
        console.error('Failed to refresh token:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, []);

  // Refresh token every 14 minutes (before the 15-minute expiration)
  useEffect(() => {
    if (!user) return;

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set new interval
    refreshIntervalRef.current = setInterval(() => {
      refreshToken();
    }, 14 * 60 * 1000); // 14 minutes

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user, refreshToken]);

  // Also refresh token when user becomes active (focus, visibility change)
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Small delay to ensure the page is fully loaded
        setTimeout(() => refreshToken(), 1000);
      }
    };

    const handleFocus = () => {
      // Small delay to prevent immediate refresh on focus
      setTimeout(() => refreshToken(), 500);
    };

    const handleOnline = () => {
      // Refresh token when coming back online
      setTimeout(() => refreshToken(), 1000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [user, refreshToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return { refreshToken };
}
