export type GatingTier = 'teaser' | 'free' | 'pro' | 'enterprise';

export interface SmartGateConfig {
  feature: string;
  teaserLimit: number;
  freeLimit: number;
  requiresAuth: boolean;
  blurResults: boolean;
  showPartialResults: boolean;
}

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  isExceeded: boolean;
  resetDate?: Date;
}

export const FEATURE_CONFIGS: Record<string, SmartGateConfig> = {
  cleanbi: {
    feature: 'cleanbi',
    teaserLimit: 1,
    freeLimit: 3,
    requiresAuth: false,
    blurResults: true,
    showPartialResults: true,
  },
  calculator: {
    feature: 'calculator',
    teaserLimit: 2,
    freeLimit: 5,
    requiresAuth: false,
    blurResults: true,
    showPartialResults: true,
  },
  template: {
    feature: 'template',
    teaserLimit: 1,
    freeLimit: 2,
    requiresAuth: true,
    blurResults: true,
    showPartialResults: true,
  },
  serviceGuyAI: {
    feature: 'serviceGuyAI',
    teaserLimit: 1,
    freeLimit: 0,
    requiresAuth: true,
    blurResults: false,
    showPartialResults: false,
  },
  businessPlan: {
    feature: 'businessPlan',
    teaserLimit: 1,
    freeLimit: 1,
    requiresAuth: true,
    blurResults: true,
    showPartialResults: true,
  },
  fundingMatcher: {
    feature: 'fundingMatcher',
    teaserLimit: 1,
    freeLimit: 2,
    requiresAuth: false,
    blurResults: true,
    showPartialResults: true,
  },
};

export const STORAGE_KEYS = {
  teaserUsage: (feature: string) => `washbizhub_teaser_usage_${feature}`,
  teaserShown: (feature: string) => `washbizhub_teaser_shown_${feature}`,
  monthlyUsage: (feature: string) => `washbizhub_monthly_usage_${feature}`,
  usageResetDate: (feature: string) => `washbizhub_usage_reset_${feature}`,
};

export function getFeatureConfig(feature: string): SmartGateConfig {
  return FEATURE_CONFIGS[feature] || {
    feature,
    teaserLimit: 1,
    freeLimit: 3,
    requiresAuth: false,
    blurResults: true,
    showPartialResults: true,
  };
}

export function getNextMonthReset(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export function isCurrentMonth(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}
