import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { deleteCurrentUser } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import { clearUserQueries } from '@/utils/clearUserQueries';

export function useDeleteAccount() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  const handleDeleteAccount = async () => {
    setIsPending(true);
    setError(null);

    try {
      console.log('[DeleteAccount] Attempting to delete account...');
      const response = await deleteCurrentUser();
      console.log('[DeleteAccount] Delete response:', response);
      
      // Success: run centralized auth cleanup first
      console.log('[DeleteAccount] Account deleted successfully, logging out...');
      
      // Wait a bit to ensure the server has processed the deletion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user-specific React Query caches before logout
      clearUserQueries(queryClient);
      
      // Run logout (clears all stores and localStorage)
      await logout();
      
      // Use replace to prevent back navigation to protected routes
      router.replace('/home');
      
    } catch (err: any) {
      console.error('[DeleteAccount] Error during deletion:', err);
      
      const status = err.status || err.response?.status;
      const message = err.message || err.response?.data?.message || '';
      
      console.log('[DeleteAccount] Error status:', status);
      console.log('[DeleteAccount] Error message:', message);
      
      // Check if this is actually a success response mishandled as error
      if (
        message.toLowerCase().includes('deleted') || 
        message.toLowerCase().includes('success') ||
        status === 200 ||
        status === 204
      ) {
        console.log('[DeleteAccount] Treating as successful deletion despite error format');
        clearUserQueries(queryClient);
        await logout();
        router.replace('/home');
        return;
      }
      
      if (status === 401 || status === 403) {
        // Auth error: still run cleanup and redirect (treat as success)
        console.log('[DeleteAccount] Auth error - treating as success and logging out');
        clearUserQueries(queryClient);
        await logout();
        router.replace('/home');
      } else if (status === 404) {
        // User not found - likely a Google user or already deleted
        console.log('[DeleteAccount] User not found - treating as success');
        clearUserQueries(queryClient);
        await logout();
        router.replace('/home');
      } else if (status >= 500) {
        // Server error: show error, don't clear auth
        console.error('[DeleteAccount] Server error');
        setError('Server error. Please try again later.');
      } else {
        // Other errors: show error, keep user signed in
        console.error('[DeleteAccount] Client error:', message);
        setError(message || 'Failed to delete account. Please try again.');
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