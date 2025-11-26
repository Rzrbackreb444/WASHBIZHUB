import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  JourneyStage,
  UserJourney,
  JourneyEvent,
  trackEvent,
  trackPageView,
  trackConversion,
  getJourneyStage,
  getEngagementScore,
  getJourney,
  getStageProgress,
  getNextBestAction,
  updateOnboardingProgress,
  setUserGoals,
  setUserExperience,
  isOnboardingCompleted,
  getRecentEvents,
  getJourneyStats,
  STAGE_INFO,
} from '@/lib/user-journey';

export interface UseUserJourneyReturn {
  journey: UserJourney;
  stage: JourneyStage;
  stageInfo: typeof STAGE_INFO[JourneyStage];
  engagementScore: number;
  stageProgress: ReturnType<typeof getStageProgress>;
  nextBestAction: ReturnType<typeof getNextBestAction>;
  recentEvents: JourneyEvent[];
  stats: ReturnType<typeof getJourneyStats>;
  isOnboarded: boolean;
  trackEvent: (name: string, type?: JourneyEvent['type'], value?: number, metadata?: Record<string, unknown>) => void;
  trackConversion: (conversionType: string, value?: number, metadata?: Record<string, unknown>) => void;
  updateOnboarding: (step: number, completed?: boolean) => void;
  setGoals: (goals: string[]) => void;
  setExperience: (experience: string) => void;
  refresh: () => void;
}

export function useUserJourney(autoTrackPageViews: boolean = true): UseUserJourneyReturn {
  const [location] = useLocation();
  const [journey, setJourney] = useState<UserJourney>(() => getJourney());
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setJourney(getJourney());
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (autoTrackPageViews && location) {
      const pageName = location === '/' ? 'Home' : location.replace(/^\//, '').replace(/-/g, ' ');
      trackPageView(pageName, { path: location });
      refresh();
    }
  }, [location, autoTrackPageViews, refresh]);

  const handleTrackEvent = useCallback((
    name: string,
    type: JourneyEvent['type'] = 'action',
    value?: number,
    metadata?: Record<string, unknown>
  ) => {
    trackEvent(name, type, value, metadata);
    refresh();
  }, [refresh]);

  const handleTrackConversion = useCallback((
    conversionType: string,
    value?: number,
    metadata?: Record<string, unknown>
  ) => {
    trackConversion(conversionType, value, metadata);
    refresh();
  }, [refresh]);

  const handleUpdateOnboarding = useCallback((step: number, completed: boolean = false) => {
    updateOnboardingProgress(step, completed);
    refresh();
  }, [refresh]);

  const handleSetGoals = useCallback((goals: string[]) => {
    setUserGoals(goals);
    refresh();
  }, [refresh]);

  const handleSetExperience = useCallback((experience: string) => {
    setUserExperience(experience);
    refresh();
  }, [refresh]);

  const stage = useMemo(() => getJourneyStage(), [refreshKey]);
  const stageInfo = useMemo(() => STAGE_INFO[stage], [stage]);
  const engagementScore = useMemo(() => getEngagementScore(), [refreshKey]);
  const stageProgress = useMemo(() => getStageProgress(), [refreshKey]);
  const nextBestAction = useMemo(() => getNextBestAction(), [refreshKey]);
  const recentEvents = useMemo(() => getRecentEvents(10), [refreshKey]);
  const stats = useMemo(() => getJourneyStats(), [refreshKey]);
  const isOnboarded = useMemo(() => isOnboardingCompleted(), [refreshKey]);

  return {
    journey,
    stage,
    stageInfo,
    engagementScore,
    stageProgress,
    nextBestAction,
    recentEvents,
    stats,
    isOnboarded,
    trackEvent: handleTrackEvent,
    trackConversion: handleTrackConversion,
    updateOnboarding: handleUpdateOnboarding,
    setGoals: handleSetGoals,
    setExperience: handleSetExperience,
    refresh,
  };
}

export default useUserJourney;
