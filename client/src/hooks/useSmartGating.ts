import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import {
  getFeatureConfig,
  STORAGE_KEYS,
  getNextMonthReset,
  isCurrentMonth,
  type UsageInfo,
  type GatingTier,
} from '@/lib/feature-gating-config';

export interface SmartGatingResult {
  canAccess: boolean;
  isTeaser: boolean;
  isFree: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  currentTier: GatingTier;
  usageInfo: UsageInfo;
  incrementUsage: () => void;
  showUpgradePrompt: boolean;
  setShowUpgradePrompt: (show: boolean) => void;
  requiresAuth: boolean;
  blurResults: boolean;
  showPartialResults: boolean;
  resetUsage: () => void;
}

function getStoredUsage(key: string): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : 0;
}

function setStoredUsage(key: string, value: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value.toString());
}

function getStoredDate(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function setStoredDate(key: string, date: Date): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, date.toISOString());
}

export function useSmartGating(feature: string): SmartGatingResult {
  const { isAuthenticated, user } = useAuth();
  const { tier, isPro, isBusiness, isEnterprise } = useSubscription();
  const config = getFeatureConfig(feature);

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [teaserUsage, setTeaserUsage] = useState(() => 
    getStoredUsage(STORAGE_KEYS.teaserUsage(feature))
  );
  const [monthlyUsage, setMonthlyUsage] = useState(() => {
    const resetKey = STORAGE_KEYS.usageResetDate(feature);
    const usageKey = STORAGE_KEYS.monthlyUsage(feature);
    const storedDate = getStoredDate(resetKey);
    
    if (!isCurrentMonth(storedDate)) {
      setStoredUsage(usageKey, 0);
      setStoredDate(resetKey, new Date());
      return 0;
    }
    return getStoredUsage(usageKey);
  });

  useEffect(() => {
    const resetKey = STORAGE_KEYS.usageResetDate(feature);
    const usageKey = STORAGE_KEYS.monthlyUsage(feature);
    const storedDate = getStoredDate(resetKey);
    
    if (!isCurrentMonth(storedDate)) {
      setStoredUsage(usageKey, 0);
      setStoredDate(resetKey, new Date());
      setMonthlyUsage(0);
    }
  }, [feature]);

  const currentTier: GatingTier = useMemo(() => {
    if (isEnterprise) return 'enterprise';
    if (isPro || isBusiness) return 'pro';
    if (isAuthenticated) return 'free';
    return 'teaser';
  }, [isAuthenticated, isPro, isBusiness, isEnterprise]);

  const usageInfo: UsageInfo = useMemo(() => {
    if (currentTier === 'enterprise') {
      return {
        used: 0,
        limit: Infinity,
        remaining: Infinity,
        isExceeded: false,
      };
    }

    if (currentTier === 'pro') {
      return {
        used: 0,
        limit: Infinity,
        remaining: Infinity,
        isExceeded: false,
      };
    }

    if (currentTier === 'free') {
      const limit = config.freeLimit;
      const used = monthlyUsage;
      return {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        isExceeded: used >= limit,
        resetDate: getNextMonthReset(),
      };
    }

    const limit = config.teaserLimit;
    const used = teaserUsage;
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      isExceeded: used >= limit,
    };
  }, [currentTier, config, teaserUsage, monthlyUsage]);

  const canAccess = useMemo(() => {
    if (currentTier === 'enterprise' || currentTier === 'pro') {
      return true;
    }
    
    if (config.requiresAuth && !isAuthenticated) {
      return false;
    }
    
    return !usageInfo.isExceeded;
  }, [currentTier, config, isAuthenticated, usageInfo.isExceeded]);

  const isTeaser = useMemo(() => {
    return currentTier === 'teaser' || (currentTier === 'free' && config.blurResults);
  }, [currentTier, config.blurResults]);

  const incrementUsage = useCallback(() => {
    if (currentTier === 'enterprise' || currentTier === 'pro') {
      return;
    }

    if (currentTier === 'teaser') {
      const newUsage = teaserUsage + 1;
      setTeaserUsage(newUsage);
      setStoredUsage(STORAGE_KEYS.teaserUsage(feature), newUsage);
      
      if (newUsage >= config.teaserLimit) {
        setShowUpgradePrompt(true);
      }
      return;
    }

    if (currentTier === 'free') {
      const newUsage = monthlyUsage + 1;
      setMonthlyUsage(newUsage);
      setStoredUsage(STORAGE_KEYS.monthlyUsage(feature), newUsage);
      
      if (newUsage >= config.freeLimit) {
        setShowUpgradePrompt(true);
      }
    }
  }, [currentTier, teaserUsage, monthlyUsage, feature, config]);

  const resetUsage = useCallback(() => {
    setTeaserUsage(0);
    setMonthlyUsage(0);
    setStoredUsage(STORAGE_KEYS.teaserUsage(feature), 0);
    setStoredUsage(STORAGE_KEYS.monthlyUsage(feature), 0);
  }, [feature]);

  return {
    canAccess,
    isTeaser,
    isFree: currentTier === 'free',
    isPro: currentTier === 'pro',
    isEnterprise: currentTier === 'enterprise',
    currentTier,
    usageInfo,
    incrementUsage,
    showUpgradePrompt,
    setShowUpgradePrompt,
    requiresAuth: config.requiresAuth,
    blurResults: config.blurResults && (currentTier === 'teaser' || currentTier === 'free'),
    showPartialResults: config.showPartialResults,
    resetUsage,
  };
}
