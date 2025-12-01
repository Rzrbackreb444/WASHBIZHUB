// Replit Auth React hook for WashBizHub
// Reference: javascript_log_in_with_replit blueprint

import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn, queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, isFetching, status, fetchStatus } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 1, // Retry once to handle initial 401 during session handshake
    retryDelay: 500,
    staleTime: 30000, // Keep data fresh for 30 seconds
  });

  const logout = () => {
    queryClient.setQueryData(["/api/auth/user"], null);
    window.location.href = "/api/logout";
  };

  // authResolved = true when we've made a successful query (not just loading finished)
  // This distinguishes "still establishing session" from "confirmed unauthenticated"
  const authResolved = status === 'success' && !isFetching;

  return {
    user,
    isLoading: isLoading || isFetching,
    isAuthenticated: !!user,
    authResolved, // True only when we have a definitive answer
    logout,
  };
}
