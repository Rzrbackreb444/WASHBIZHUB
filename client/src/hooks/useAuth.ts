/**
 * Unified Authentication Hook for WashBizHub
 * Supports Cloudflare Access (Enterprise SSO) + Google OAuth
 */

import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn, queryClient } from "@/lib/queryClient";

interface AuthProviders {
  primary: 'cloudflare-access' | 'google';
  providers: string[];
  cloudflareAccess: {
    enabled: boolean;
    loginUrl: string | null;
    label: string;
  };
  google: {
    enabled: boolean;
    loginUrl: string;
    label: string;
  };
}

export function useAuth() {
  // Get current user
  const { data: user, isLoading, isFetching, status } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 1,
    retryDelay: 500,
    staleTime: 30000,
  });

  // Get available auth providers
  const { data: providers } = useQuery<AuthProviders>({
    queryKey: ["/api/auth/cloudflare/providers"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 300000, // Cache for 5 minutes
    retry: false,
  });

  const logout = () => {
    queryClient.setQueryData(["/api/auth/user"], null);
    // Always use Cloudflare logout endpoint (it handles session cleanup)
    window.location.href = "/api/auth/cloudflare/logout";
  };

  const login = (redirectPath: string = '/dashboard') => {
    const redirect = encodeURIComponent(redirectPath);
    if (providers?.cloudflareAccess?.enabled) {
      window.location.href = `/api/auth/cloudflare/login?redirect=${redirect}`;
    } else if (providers?.google?.enabled) {
      window.location.href = `/api/auth/google/login?redirect=${redirect}`;
    } else {
      window.location.href = `/login`;
    }
  };

  // Auth is resolved when query completes (success or error) and not currently fetching
  // This ensures AuthGuard shows login prompt or content instead of infinite loading
  const authResolved = (status === 'success' || status === 'error') && !isFetching;

  return {
    user,
    isLoading: isLoading || isFetching,
    isAuthenticated: !!user,
    authResolved,
    logout,
    login,
    providers,
    isCloudflareAccess: providers?.cloudflareAccess?.enabled ?? false,
    primaryProvider: providers?.primary ?? 'google',
  };
}
