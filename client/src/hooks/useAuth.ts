// Replit Auth React hook for WashBizHub
// Reference: javascript_log_in_with_replit blueprint

import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getQueryFn, queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const logout = () => {
    queryClient.setQueryData(["/api/auth/user"], null);
    window.location.href = "/api/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
