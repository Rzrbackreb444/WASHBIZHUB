/**
 * Unified Authentication Hook for WashBizHub
 * Supports Google OAuth + Email OTP (6-digit code)
 */

import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";

interface AuthProviders {
  primary: 'email-otp' | 'google';
  providers: string[];
  google: {
    enabled: boolean;
    loginUrl: string;
    label: string;
  };
  emailOtp: {
    enabled: boolean;
    requestUrl: string;
    verifyUrl: string;
    label: string;
  };
  security: {
    rateLimiting: boolean;
    bruteForceProtection: boolean;
    secureSession: boolean;
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
    queryKey: ["/api/auth/providers"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 300000, // Cache for 5 minutes
    retry: false,
  });

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
    } catch (e) {
      console.error("Logout error:", e);
    }
    queryClient.setQueryData(["/api/auth/user"], null);
    window.location.href = "/";
  };

  const loginWithGoogle = (redirectPath: string = '/dashboard') => {
    const redirect = encodeURIComponent(redirectPath);
    window.location.href = `/api/auth/google/login?redirect=${redirect}`;
  };

  // Auth is resolved when query completes (success or error) and not currently fetching
  const authResolved = (status === 'success' || status === 'error') && !isFetching;

  return {
    user,
    isLoading: isLoading || isFetching,
    isAuthenticated: !!user,
    authResolved,
    logout,
    loginWithGoogle,
    providers,
    primaryProvider: providers?.primary ?? 'email-otp',
    googleEnabled: providers?.google?.enabled ?? true,
    emailOtpEnabled: providers?.emailOtp?.enabled ?? true,
  };
}
