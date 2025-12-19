import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionTier {
  id: string;
  name: string;
  level: number;
  features: string[];
  rateLimit: number;
  exportLimit: number;
  apiAccess: boolean;
  cleanbiAccess: boolean;
  demographicsAccess: boolean;
  competitionAccess: boolean;
  posAccess: boolean;
  dashboardAccess: boolean;
  whiteLabel: boolean;
}

interface DataAccessPolicy {
  canAccessCLEANBI: boolean;
  cleanbiDetailLevel: "basic" | "standard" | "full";
  canAccessDemographics: boolean;
  demographicsDetailLevel: "summary" | "detailed" | "full";
  canAccessCompetition: boolean;
  competitionDetailLevel: "count" | "locations" | "full";
  canAccessPOS: boolean;
  posDataScope: "summary" | "detailed" | "realtime";
  canExport: boolean;
  exportFormats: string[];
  maxExportsPerMonth: number;
  canAccessAPI: boolean;
  apiRateLimit: number;
}

interface SubscriptionContextValue {
  tier: SubscriptionTier;
  dataPolicy: DataAccessPolicy;
  isLoading: boolean;
  isPremium: boolean;
  isEnterprise: boolean;
  isDistributor: boolean;
  hasFeature: (feature: string) => boolean;
  canAccess: (requiredLevel: number) => boolean;
  canExportFormat: (format: string) => boolean;
  upgradeUrl: string;
}

const DEFAULT_TIER: SubscriptionTier = {
  id: "free",
  name: "Free",
  level: 0,
  features: ["basic_calculator", "limited_marketplace"],
  rateLimit: 30,
  exportLimit: 0,
  apiAccess: false,
  cleanbiAccess: false,
  demographicsAccess: false,
  competitionAccess: false,
  posAccess: false,
  dashboardAccess: false,
  whiteLabel: false,
};

const DEFAULT_POLICY: DataAccessPolicy = {
  canAccessCLEANBI: false,
  cleanbiDetailLevel: "basic",
  canAccessDemographics: false,
  demographicsDetailLevel: "summary",
  canAccessCompetition: false,
  competitionDetailLevel: "count",
  canAccessPOS: false,
  posDataScope: "summary",
  canExport: false,
  exportFormats: [],
  maxExportsPerMonth: 0,
  canAccessAPI: false,
  apiRateLimit: 0,
};

const TIER_POLICIES: Record<string, { tier: SubscriptionTier; policy: DataAccessPolicy }> = {
  free: {
    tier: DEFAULT_TIER,
    policy: DEFAULT_POLICY,
  },
  starter: {
    tier: {
      id: "starter",
      name: "Starter",
      level: 1,
      features: ["calculators", "marketplace", "basic_cleanbi"],
      rateLimit: 100,
      exportLimit: 5,
      apiAccess: false,
      cleanbiAccess: true,
      demographicsAccess: false,
      competitionAccess: false,
      posAccess: false,
      dashboardAccess: true,
      whiteLabel: false,
    },
    policy: {
      canAccessCLEANBI: true,
      cleanbiDetailLevel: "basic",
      canAccessDemographics: false,
      demographicsDetailLevel: "summary",
      canAccessCompetition: false,
      competitionDetailLevel: "count",
      canAccessPOS: false,
      posDataScope: "summary",
      canExport: true,
      exportFormats: ["pdf"],
      maxExportsPerMonth: 5,
      canAccessAPI: false,
      apiRateLimit: 0,
    },
  },
  professional: {
    tier: {
      id: "professional",
      name: "Professional",
      level: 2,
      features: ["calculators", "marketplace", "cleanbi", "demographics", "competition", "templates"],
      rateLimit: 500,
      exportLimit: 50,
      apiAccess: true,
      cleanbiAccess: true,
      demographicsAccess: true,
      competitionAccess: true,
      posAccess: false,
      dashboardAccess: true,
      whiteLabel: false,
    },
    policy: {
      canAccessCLEANBI: true,
      cleanbiDetailLevel: "standard",
      canAccessDemographics: true,
      demographicsDetailLevel: "detailed",
      canAccessCompetition: true,
      competitionDetailLevel: "locations",
      canAccessPOS: false,
      posDataScope: "summary",
      canExport: true,
      exportFormats: ["pdf", "excel"],
      maxExportsPerMonth: 50,
      canAccessAPI: true,
      apiRateLimit: 500,
    },
  },
  enterprise: {
    tier: {
      id: "enterprise",
      name: "Enterprise",
      level: 3,
      features: ["all"],
      rateLimit: 2000,
      exportLimit: 500,
      apiAccess: true,
      cleanbiAccess: true,
      demographicsAccess: true,
      competitionAccess: true,
      posAccess: true,
      dashboardAccess: true,
      whiteLabel: true,
    },
    policy: {
      canAccessCLEANBI: true,
      cleanbiDetailLevel: "full",
      canAccessDemographics: true,
      demographicsDetailLevel: "full",
      canAccessCompetition: true,
      competitionDetailLevel: "full",
      canAccessPOS: true,
      posDataScope: "detailed",
      canExport: true,
      exportFormats: ["pdf", "excel", "csv", "json"],
      maxExportsPerMonth: 500,
      canAccessAPI: true,
      apiRateLimit: 2000,
    },
  },
  distributor: {
    tier: {
      id: "distributor",
      name: "Distributor White-Label",
      level: 4,
      features: ["all", "white_label", "fleet_monitoring", "service_ai", "parts_intelligence", "dispatch", "receptionist"],
      rateLimit: 10000,
      exportLimit: -1,
      apiAccess: true,
      cleanbiAccess: true,
      demographicsAccess: true,
      competitionAccess: true,
      posAccess: true,
      dashboardAccess: true,
      whiteLabel: true,
    },
    policy: {
      canAccessCLEANBI: true,
      cleanbiDetailLevel: "full",
      canAccessDemographics: true,
      demographicsDetailLevel: "full",
      canAccessCompetition: true,
      competitionDetailLevel: "full",
      canAccessPOS: true,
      posDataScope: "realtime",
      canExport: true,
      exportFormats: ["pdf", "excel", "csv", "json", "api"],
      maxExportsPerMonth: -1,
      canAccessAPI: true,
      apiRateLimit: 10000,
    },
  },
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { data: user, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const [subscriptionData, setSubscriptionData] = useState<{
    tier: SubscriptionTier;
    policy: DataAccessPolicy;
  }>({
    tier: DEFAULT_TIER,
    policy: DEFAULT_POLICY,
  });

  useEffect(() => {
    if (user) {
      const tierName = user.subscriptionTier || "free";
      const tierData = TIER_POLICIES[tierName] || TIER_POLICIES.free;
      setSubscriptionData(tierData);
    } else {
      setSubscriptionData({
        tier: DEFAULT_TIER,
        policy: DEFAULT_POLICY,
      });
    }
  }, [user]);

  const contextValue: SubscriptionContextValue = {
    tier: subscriptionData.tier,
    dataPolicy: subscriptionData.policy,
    isLoading: userLoading,
    isPremium: subscriptionData.tier.level >= 1,
    isEnterprise: subscriptionData.tier.level >= 3,
    isDistributor: subscriptionData.tier.level >= 4,
    hasFeature: (feature: string) => {
      return subscriptionData.tier.features.includes("all") || 
             subscriptionData.tier.features.includes(feature);
    },
    canAccess: (requiredLevel: number) => {
      return subscriptionData.tier.level >= requiredLevel;
    },
    canExportFormat: (format: string) => {
      return subscriptionData.policy.exportFormats.includes(format);
    },
    upgradeUrl: "/pricing",
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    return {
      tier: DEFAULT_TIER,
      dataPolicy: DEFAULT_POLICY,
      isLoading: false,
      isPremium: false,
      isEnterprise: false,
      isDistributor: false,
      hasFeature: () => false,
      canAccess: () => false,
      canExportFormat: () => false,
      upgradeUrl: "/pricing",
    };
  }
  return context;
}

export function useFeatureGate(feature: string): { hasAccess: boolean; isLoading: boolean } {
  const { hasFeature, isLoading } = useSubscription();
  return { hasAccess: hasFeature(feature), isLoading };
}

export function useTierGate(requiredLevel: number): { hasAccess: boolean; isLoading: boolean } {
  const { canAccess, isLoading } = useSubscription();
  return { hasAccess: canAccess(requiredLevel), isLoading };
}

export function useExportGate(format: string): { canExport: boolean; isLoading: boolean } {
  const { canExportFormat, isLoading } = useSubscription();
  return { canExport: canExportFormat(format), isLoading };
}

export function useDataAccess(): DataAccessPolicy & { isLoading: boolean } {
  const { dataPolicy, isLoading } = useSubscription();
  return { ...dataPolicy, isLoading };
}
