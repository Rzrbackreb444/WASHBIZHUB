import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface UsageQuotaData {
  tier: "FREE" | "STARTER" | "PRO" | "ENTERPRISE" | "WHITE_LABEL" | "ANONYMOUS";
  tierName: string;
  isAuthenticated: boolean;
  quota: {
    allowed: boolean;
    remainingToday: number;
    remainingMonth: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
  features: {
    detailedBreakdown: boolean;
    competitorAnalysis: boolean;
    demographicData: boolean;
    pdfExport: boolean;
    savedReports: boolean;
    emailAlerts: boolean;
  };
  upgradeUrl: string | null;
}

export interface UseUsageQuotaReturn {
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  isLoading: boolean;
  isUnlimited: boolean;
  isAtLimit: boolean;
  tier: string;
  tierName: string;
  isAuthenticated: boolean;
  upgradeUrl: string | null;
  refetch: () => void;
}

export function useUsageQuota(): UseUsageQuotaReturn {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, refetch } = useQuery<UsageQuotaData>({
    queryKey: ["/api/cleanbi/quota"],
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const dailyLimit = data?.quota?.dailyLimit ?? 1;
  const remainingToday = data?.quota?.remainingToday ?? 0;
  const isUnlimited = dailyLimit === -1;
  
  const used = isUnlimited ? 0 : Math.max(0, dailyLimit - remainingToday);
  const limit = dailyLimit;
  const remaining = isUnlimited ? -1 : remainingToday;
  const percentUsed = isUnlimited ? 0 : limit > 0 ? Math.round((used / limit) * 100) : 0;
  const isAtLimit = !isUnlimited && remaining === 0;

  return {
    used,
    limit,
    remaining,
    percentUsed,
    isLoading,
    isUnlimited,
    isAtLimit,
    tier: data?.tier ?? "FREE",
    tierName: data?.tierName ?? "Free",
    isAuthenticated: data?.isAuthenticated ?? isAuthenticated,
    upgradeUrl: data?.upgradeUrl ?? "/pricing?upgrade=cleanbi-pro",
    refetch: () => refetch(),
  };
}
