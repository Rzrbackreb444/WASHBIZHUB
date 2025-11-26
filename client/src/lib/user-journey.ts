/**
 * User Journey Tracking System for WashBizHub
 * Tracks user stages: visitor → lead → trial → customer → advocate
 */

export type JourneyStage = 'visitor' | 'lead' | 'trial' | 'customer' | 'advocate';

export interface JourneyEvent {
  id: string;
  type: 'page_view' | 'action' | 'conversion' | 'engagement';
  name: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface UserJourney {
  id: string;
  stage: JourneyStage;
  events: JourneyEvent[];
  engagementScore: number;
  firstVisit: number;
  lastVisit: number;
  totalPageViews: number;
  totalActions: number;
  conversions: string[];
  onboardingCompleted: boolean;
  onboardingStep?: number;
  goals?: string[];
  experience?: string;
}

const STORAGE_KEY = 'washbizhub_user_journey';
const STAGE_THRESHOLDS = {
  visitor: 0,
  lead: 20,
  trial: 50,
  customer: 100,
  advocate: 200,
};

const EVENT_SCORES: Record<string, number> = {
  page_view: 1,
  calculator_use: 5,
  resource_download: 10,
  newsletter_signup: 15,
  account_create: 25,
  trial_start: 30,
  purchase: 50,
  review_submit: 20,
  referral: 40,
  course_complete: 30,
  forum_post: 10,
  share_content: 8,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getDefaultJourney(): UserJourney {
  return {
    id: generateId(),
    stage: 'visitor',
    events: [],
    engagementScore: 0,
    firstVisit: Date.now(),
    lastVisit: Date.now(),
    totalPageViews: 0,
    totalActions: 0,
    conversions: [],
    onboardingCompleted: false,
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function loadJourney(): UserJourney {
  if (!isBrowser()) {
    return getDefaultJourney();
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const journey = JSON.parse(stored) as UserJourney;
      journey.lastVisit = Date.now();
      return journey;
    }
  } catch (error) {
    console.warn('Failed to load user journey from localStorage:', error);
  }
  return getDefaultJourney();
}

function saveJourney(journey: UserJourney): void {
  if (!isBrowser()) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
  } catch (error) {
    console.warn('Failed to save user journey to localStorage:', error);
  }
}

function calculateStage(score: number, conversions: string[]): JourneyStage {
  if (conversions.includes('referral') || conversions.includes('review_submit')) {
    return 'advocate';
  }
  if (conversions.includes('purchase')) {
    return 'customer';
  }
  if (conversions.includes('trial_start') || conversions.includes('account_create')) {
    return 'trial';
  }
  if (score >= STAGE_THRESHOLDS.lead || conversions.includes('newsletter_signup')) {
    return 'lead';
  }
  return 'visitor';
}

export function trackEvent(
  name: string,
  type: JourneyEvent['type'] = 'action',
  value?: number,
  metadata?: Record<string, unknown>
): JourneyEvent {
  const journey = loadJourney();
  
  const event: JourneyEvent = {
    id: generateId(),
    type,
    name,
    value,
    metadata,
    timestamp: Date.now(),
  };

  journey.events.push(event);
  
  if (type === 'action' || type === 'engagement') {
    journey.totalActions += 1;
  }

  const scoreValue = EVENT_SCORES[name] || (type === 'action' ? 3 : 1);
  journey.engagementScore += value ?? scoreValue;

  if (type === 'conversion') {
    if (!journey.conversions.includes(name)) {
      journey.conversions.push(name);
    }
  }

  journey.stage = calculateStage(journey.engagementScore, journey.conversions);
  journey.lastVisit = Date.now();
  
  saveJourney(journey);
  
  return event;
}

export function trackPageView(
  pageName: string,
  metadata?: Record<string, unknown>
): JourneyEvent {
  const journey = loadJourney();
  
  const event: JourneyEvent = {
    id: generateId(),
    type: 'page_view',
    name: pageName,
    metadata,
    timestamp: Date.now(),
  };

  journey.events.push(event);
  journey.totalPageViews += 1;
  journey.engagementScore += EVENT_SCORES.page_view;
  journey.stage = calculateStage(journey.engagementScore, journey.conversions);
  journey.lastVisit = Date.now();
  
  saveJourney(journey);
  
  return event;
}

export function trackConversion(
  conversionType: string,
  value?: number,
  metadata?: Record<string, unknown>
): JourneyEvent {
  return trackEvent(conversionType, 'conversion', value, metadata);
}

export function getJourneyStage(): JourneyStage {
  const journey = loadJourney();
  return journey.stage;
}

export function getEngagementScore(): number {
  const journey = loadJourney();
  return journey.engagementScore;
}

export function getJourney(): UserJourney {
  return loadJourney();
}

export function getStageProgress(): {
  currentStage: JourneyStage;
  stageIndex: number;
  totalStages: number;
  percentage: number;
  nextStage: JourneyStage | null;
  pointsToNextStage: number;
} {
  const journey = loadJourney();
  const stages: JourneyStage[] = ['visitor', 'lead', 'trial', 'customer', 'advocate'];
  const stageIndex = stages.indexOf(journey.stage);
  
  const nextStage = stageIndex < stages.length - 1 ? stages[stageIndex + 1] : null;
  const currentThreshold = STAGE_THRESHOLDS[journey.stage];
  const nextThreshold = nextStage ? STAGE_THRESHOLDS[nextStage] : journey.engagementScore;
  
  const progressInStage = journey.engagementScore - currentThreshold;
  const stageRange = nextThreshold - currentThreshold;
  const stagePercentage = stageRange > 0 ? Math.min(100, (progressInStage / stageRange) * 100) : 100;
  
  const overallPercentage = ((stageIndex + (stagePercentage / 100)) / stages.length) * 100;

  return {
    currentStage: journey.stage,
    stageIndex,
    totalStages: stages.length,
    percentage: Math.round(overallPercentage),
    nextStage,
    pointsToNextStage: nextStage ? Math.max(0, nextThreshold - journey.engagementScore) : 0,
  };
}

export function getNextBestAction(): {
  action: string;
  description: string;
  points: number;
  path?: string;
} {
  const journey = loadJourney();
  
  const actionsByStage: Record<JourneyStage, { action: string; description: string; points: number; path?: string }[]> = {
    visitor: [
      { action: 'Try Calculator', description: 'Use our ROI calculator to estimate your potential', points: 5, path: '/calculator' },
      { action: 'Read Blog', description: 'Learn from industry experts', points: 2, path: '/blog' },
      { action: 'Newsletter Signup', description: 'Get weekly laundromat insights', points: 15, path: '/' },
    ],
    lead: [
      { action: 'Create Account', description: 'Unlock personalized recommendations', points: 25, path: '/login' },
      { action: 'Browse Listings', description: 'Find laundromats for sale', points: 5, path: '/listings' },
      { action: 'Take a Course', description: 'Learn how to evaluate locations', points: 30, path: '/courses' },
    ],
    trial: [
      { action: 'Complete Profile', description: 'Get better recommendations', points: 10, path: '/settings' },
      { action: 'Use CLEANBI', description: 'Analyze your target location', points: 15, path: '/cleanbi' },
      { action: 'Start Free Trial', description: 'Access premium features', points: 30, path: '/pricing' },
    ],
    customer: [
      { action: 'Leave a Review', description: 'Help others discover WashBizHub', points: 20, path: '/forum' },
      { action: 'Refer a Friend', description: 'Share the success', points: 40, path: '/affiliate-dashboard' },
      { action: 'Complete Advanced Course', description: 'Master laundromat operations', points: 30, path: '/courses' },
    ],
    advocate: [
      { action: 'Share on Social', description: 'Spread the word', points: 8, path: '/' },
      { action: 'Write a Case Study', description: 'Share your success story', points: 50, path: '/forum' },
      { action: 'Become an Affiliate', description: 'Earn commissions', points: 40, path: '/affiliate-dashboard' },
    ],
  };

  const actions = actionsByStage[journey.stage];
  const completedActions = new Set(journey.events.map(e => e.name));
  
  const availableActions = actions.filter(a => !completedActions.has(a.action));
  return availableActions[0] || actions[0];
}

export function updateOnboardingProgress(step: number, completed: boolean = false): void {
  const journey = loadJourney();
  journey.onboardingStep = step;
  
  if (completed) {
    journey.onboardingCompleted = true;
    trackEvent('onboarding_complete', 'conversion', 20);
  }
  
  saveJourney(journey);
}

export function setUserGoals(goals: string[]): void {
  const journey = loadJourney();
  journey.goals = goals;
  trackEvent('goals_set', 'action', 5, { goals });
  saveJourney(journey);
}

export function setUserExperience(experience: string): void {
  const journey = loadJourney();
  journey.experience = experience;
  trackEvent('experience_set', 'action', 5, { experience });
  saveJourney(journey);
}

export function isOnboardingCompleted(): boolean {
  const journey = loadJourney();
  return journey.onboardingCompleted;
}

export function resetJourney(): void {
  if (!isBrowser()) {
    return;
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset user journey:', error);
  }
}

export function getRecentEvents(count: number = 10): JourneyEvent[] {
  const journey = loadJourney();
  return journey.events.slice(-count).reverse();
}

export function getJourneyStats(): {
  daysActive: number;
  averageSessionEvents: number;
  topActions: { name: string; count: number }[];
  conversionRate: number;
} {
  const journey = loadJourney();
  const daysActive = Math.max(1, Math.ceil((journey.lastVisit - journey.firstVisit) / (1000 * 60 * 60 * 24)));
  
  const actionCounts: Record<string, number> = {};
  journey.events.forEach(event => {
    if (event.type === 'action') {
      actionCounts[event.name] = (actionCounts[event.name] || 0) + 1;
    }
  });
  
  const topActions = Object.entries(actionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalConversionOpportunities = journey.totalPageViews + journey.totalActions;
  const conversionRate = totalConversionOpportunities > 0 
    ? (journey.conversions.length / totalConversionOpportunities) * 100 
    : 0;

  return {
    daysActive,
    averageSessionEvents: journey.events.length / daysActive,
    topActions,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
}

export const STAGE_INFO: Record<JourneyStage, { label: string; description: string; icon: string; color: string }> = {
  visitor: {
    label: 'Visitor',
    description: 'Exploring the platform',
    icon: 'Eye',
    color: 'text-muted-foreground',
  },
  lead: {
    label: 'Lead',
    description: 'Showing interest',
    icon: 'Sparkles',
    color: 'text-blue-500',
  },
  trial: {
    label: 'Trial User',
    description: 'Testing features',
    icon: 'Zap',
    color: 'text-amber-500',
  },
  customer: {
    label: 'Customer',
    description: 'Active subscriber',
    icon: 'Crown',
    color: 'text-primary',
  },
  advocate: {
    label: 'Advocate',
    description: 'Community champion',
    icon: 'Trophy',
    color: 'text-emerald-500',
  },
};
