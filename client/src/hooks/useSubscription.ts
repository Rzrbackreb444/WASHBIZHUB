import { useAuth } from "./useAuth";

export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";
export type CLEANBITier = "free" | "starter" | "pro" | "enterprise";

interface FeatureAccess {
  hasAccess: boolean;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  upgradeUrl: string;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

// Map old tier names to new for backwards compatibility
const TIER_MIGRATION: Record<string, SubscriptionTier> = {
  accelerate: "starter",
  scale: "pro",
  summit: "enterprise",
};

const FEATURE_TIERS: Record<string, SubscriptionTier> = {
  // ============================================
  // FREE TIER - Lead Generation & Discovery
  // ============================================
  // Marketplace - Browse and list for free (lead gen)
  "marketplace-browse": "free",
  "marketplace-list": "free",
  
  // Funding Hub - View lenders for free (lead gen)
  "funding-view": "free",
  
  // Forum - Read access free (community building)
  "forum-read": "free",
  
  // Blog & Help - Always free (SEO & trust)
  "blog-access": "free",
  "help-center": "free",
  
  // CLEANBI - 3 free analyses (taste of value)
  "cleanbi-preview": "free",
  
  // Basic calculators - Limited preview
  "calculators-basic": "free",
  
  // Equipment optimizer - Preview only
  "equipment-optimizer-preview": "free",
  
  // Competitor analysis - Limited preview
  "competitor-preview": "free",
  
  // AI Council - Trial/limited
  "ai-council-trial": "free",
  
  // POS - Basic features free
  "pos-basic": "free",
  "pos-orders": "free",
  
  // ============================================
  // STARTER TIER ($29/mo) - Member Benefits
  // ============================================
  // Book & Courses - Members only
  "book-access": "starter",
  "courses-access": "starter",
  
  // Forum - Post access (members can engage)
  "forum-post": "starter",
  
  // Calculator Hub - Full suite access
  "calculators-all": "starter",
  
  // CLEANBI - Full analysis access
  "cleanbi-full": "starter",
  
  // Competitor Analysis - Full access
  "competitor-full": "starter",
  
  // Equipment Optimizer - Basic features
  "equipment-optimizer-basic": "starter",
  
  // Business Plan Generator
  "business-plan-generator": "starter",
  
  // Templates & Downloads
  "templates-premium": "starter",
  
  // AI Consultation Council - Basic
  "ai-council-basic": "starter",
  
  // Revenue Forecaster - Basic
  "revenue-forecaster": "starter",
  
  // What-If Simulator - Basic
  "whatif-basic": "starter",
  
  // Marketplace - Inquire about listings
  "marketplace-inquire": "starter",
  
  // Funding - Match with lenders
  "funding-match": "starter",
  "funding_gauge": "starter",
  "funding_chart": "starter",
  
  // POS - Customer & machine features
  "pos-customers": "starter",
  "pos-machines": "starter",
  
  // Priority support
  "priority-support": "starter",
  
  // ============================================
  // PRO TIER ($99/mo) - Power Users & Brokers
  // ============================================
  // Advanced calculators with export
  "calculators-advanced": "pro",
  "calculators-export": "pro",
  
  // CLEANBI - Unlimited analyses
  "cleanbi-unlimited": "pro",
  
  // Competitor - Unlimited
  "competitor-unlimited": "pro",
  
  // Equipment Optimizer - Full
  "equipment-optimizer-full": "pro",
  
  // AI Council - Unlimited
  "ai-council-unlimited": "pro",
  
  // Revenue Forecaster - Advanced
  "revenue-forecaster-seasonality": "pro",
  
  // What-If Simulator - Unlimited
  "whatif-unlimited": "pro",
  
  // Due Diligence Toolkit
  "due-diligence": "pro",
  
  // Marketplace - Featured listings
  "marketplace-featured": "pro",
  
  // Funding - Priority matching
  "funding-priority": "pro",
  
  // POS - Advanced features
  "pos-routes": "pro",
  "pos-analytics": "pro",
  "pos-inventory": "pro",
  
  // Website Builder
  "website-builder": "pro",
  
  // Multi-location support
  "multi-location": "pro",
  
  // AI Consultant
  "ai-consultant": "pro",
  
  // ============================================
  // ENTERPRISE TIER ($699/mo) - Brokers & Operators
  // ============================================
  // Bulk analysis
  "bulk-analysis": "enterprise",
  "cleanbi-bulk": "enterprise",
  "cleanbi-api": "enterprise",
  
  // Equipment Portfolio
  "equipment-optimizer-portfolio": "enterprise",
  
  // AI Council - Priority
  "ai-council-priority": "enterprise",
  
  // Revenue Forecaster - Multi-location
  "revenue-forecaster-multi": "enterprise",
  
  // What-If - Portfolio
  "whatif-portfolio": "enterprise",
  
  // Due Diligence - Bulk
  "due-diligence-bulk": "enterprise",
  
  // Marketplace - Broker features
  "marketplace-broker": "enterprise",
  
  // Funding - Direct access
  "funding-direct": "enterprise",
  
  // White-label & Calculators
  "calculators-white-label": "enterprise",
  "white-label": "enterprise",
  
  // AI Blog Generator
  "ai-blog-generator": "enterprise",
};

export function useSubscription() {
  const { user, isLoading } = useAuth();

  // Migrate old tier names to new ones
  let rawTier = (user?.subscriptionTier as string) || "free";
  const currentTier = (TIER_MIGRATION[rawTier] || rawTier) as SubscriptionTier;
  const isPro = user?.isPro || currentTier === "pro" || currentTier === "enterprise";

  function hasFeatureAccess(featureKey: string): FeatureAccess {
    const requiredTier = FEATURE_TIERS[featureKey] || "free";
    const currentLevel = TIER_LEVELS[currentTier] || 0;
    const requiredLevel = TIER_LEVELS[requiredTier] || 0;

    return {
      hasAccess: currentLevel >= requiredLevel,
      requiredTier,
      currentTier,
      upgradeUrl: `/subscribe?feature=${featureKey}`,
    };
  }

  function canAccessTier(tier: SubscriptionTier): boolean {
    const currentLevel = TIER_LEVELS[currentTier] || 0;
    const requiredLevel = TIER_LEVELS[tier] || 0;
    return currentLevel >= requiredLevel;
  }

  function getFeatureTier(featureKey: string): SubscriptionTier {
    return FEATURE_TIERS[featureKey] || "free";
  }

  return {
    tier: currentTier,
    isPro,
    isLoading,
    hasFeatureAccess,
    canAccessTier,
    getFeatureTier,
    isFreeTier: currentTier === "free",
    isStarterTier: currentTier === "starter",
    isProTier: currentTier === "pro",
    isEnterpriseTier: currentTier === "enterprise",
    tierLevel: TIER_LEVELS[currentTier] || 0,
  };
}

export function getTierDisplayName(tier: SubscriptionTier | string): string {
  const names: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
    // Legacy names
    accelerate: "Starter",
    scale: "Pro",
    summit: "Enterprise",
  };
  return names[tier] || "Free";
}

export function getTierPrice(tier: SubscriptionTier | string): number {
  const prices: Record<string, number> = {
    free: 0,
    starter: 29,
    pro: 99,
    enterprise: 699,
  };
  return prices[tier] || 0;
}

export function getTierColor(tier: SubscriptionTier | string): string {
  const colors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    starter: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    pro: "bg-[#b8860b]/10 text-[#b8860b] dark:bg-[#b8860b]/20 dark:text-[#d4a030]",
    enterprise: "bg-[#1e3a5f]/10 text-[#1e3a5f] dark:bg-[#1e3a5f]/20 dark:text-blue-200",
    // Legacy
    accelerate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    scale: "bg-[#b8860b]/10 text-[#b8860b] dark:bg-[#b8860b]/20 dark:text-[#d4a030]",
    summit: "bg-[#1e3a5f]/10 text-[#1e3a5f] dark:bg-[#1e3a5f]/20 dark:text-blue-200",
  };
  return colors[tier] || colors.free;
}
