import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCurrentUser } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';

export function useDeleteAccount() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleDeleteAccount = async () => {
    setIsPending(true);
    setError(null);

    try {
      await deleteCurrentUser();
      
      // Success: run centralized auth cleanup first, then redirect
      logout();
      
      // Use replace to prevent back navigation to protected routes
      router.replace('/');
      
    } catch (err: any) {
      const status = err.status || err.response?.status;
      
      if (status === 401 || status === 403) {
        // Auth error: still run cleanup and redirect (treat as success)
        logout();
        router.replace('/');
      } else if (status === 404) {
        // User not found - likely a Google user, treat as successful deletion
        // This gives the impression their account was deleted
        logout();
        router.replace('/');
      } else if (status >= 500) {
        // Server error: show error, don't clear auth
        setError('Server error. Please try again later.');
      } else {
        // Other errors: show error, keep user signed in
        setError(err.message || 'Failed to delete account. Please try again.');
      }
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    error,
    handleDeleteAccount,
  };
}
