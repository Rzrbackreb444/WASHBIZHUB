import { 
  Gift, Zap, Star, Crown, Building2, Rocket, 
  Eye, TrendingUp, Search, FileText, Video, Shield,
  Award, Sparkles, Target, BarChart3
} from "lucide-react";

export type PlatformTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type ListingTier = 'free' | 'enhanced' | 'featured' | 'premium_seo' | 'spotlight';

export interface TierFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlatformTierConfig {
  id: PlatformTier;
  name: string;
  tagline: string;
  description: string;
  price: number;
  priceAnnual: number;
  icon: typeof Gift;
  iconBg: string;
  iconColor: string;
  popular: boolean;
  features: TierFeature[];
  limits: {
    cleanbiAnalyses: number | 'unlimited';
    apiCalls: number | 'unlimited';
    savedReports: number | 'unlimited';
    teamMembers: number | 'unlimited';
  };
  cta: string;
  ctaVariant: 'default' | 'outline' | 'secondary';
  badge?: string;
  badgeColor?: string;
}

export interface ListingTierConfig {
  id: ListingTier;
  name: string;
  tagline: string;
  description: string;
  price: number;
  icon: typeof Gift;
  iconBg: string;
  iconColor: string;
  popular: boolean;
  features: TierFeature[];
  limits: {
    photos: number;
    videos: number;
    boostDays: number;
    analytics: boolean;
    seoOptimization: boolean;
    cleanbiReport: boolean;
    priorityPlacement: boolean;
    socialProofBadge: boolean;
  };
  cta: string;
  ctaVariant: 'default' | 'outline' | 'secondary';
  badge?: string;
  badgeColor?: string;
  roi?: string;
}

export const PLATFORM_TIERS: Record<PlatformTier, PlatformTierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Get started today',
    description: 'Try CLEANBI with 3 free location analyses',
    price: 0,
    priceAnnual: 0,
    icon: Gift,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    popular: false,
    features: [
      { text: '3 CLEANBI analyses total', included: true, highlight: true },
      { text: 'Basic location scoring', included: true },
      { text: 'Competitor count display', included: true },
      { text: 'Street View access', included: true },
      { text: 'Browse marketplace listings', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Basic calculators', included: true },
      { text: 'Full category breakdowns', included: false },
      { text: 'AI recommendations', included: false },
      { text: 'Export PDF reports', included: false },
    ],
    limits: {
      cleanbiAnalyses: 3,
      apiCalls: 0,
      savedReports: 3,
      teamMembers: 1,
    },
    cta: 'Start Free',
    ctaVariant: 'outline',
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For serious investors',
    description: 'Unlock full CLEANBI power with unlimited analyses and insights',
    price: 29,
    priceAnnual: 290,
    icon: Zap,
    iconBg: 'bg-[#C8A661]/20',
    iconColor: 'text-[#C8A661]',
    popular: true,
    features: [
      { text: 'Unlimited CLEANBI analyses', included: true, highlight: true },
      { text: 'Full category breakdowns', included: true, highlight: true },
      { text: 'AI-powered recommendations', included: true, highlight: true },
      { text: '3D Aerial View flyovers', included: true },
      { text: 'Walk Score & Transit Score', included: true },
      { text: 'Solar potential analysis', included: true },
      { text: 'Property value estimates', included: true },
      { text: 'Export PDF reports', included: true },
      { text: 'Priority email support', included: true },
      { text: 'ROI calculators', included: false },
    ],
    limits: {
      cleanbiAnalyses: 'unlimited',
      apiCalls: 0,
      savedReports: 100,
      teamMembers: 1,
    },
    cta: 'Start 7-Day Free Trial',
    ctaVariant: 'default',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-[#C8A661] text-white',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For power users & brokers',
    description: 'Advanced analytics, Monte Carlo simulations, and API access',
    price: 99,
    priceAnnual: 990,
    icon: Crown,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    popular: false,
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'ROI & Valuation calculators', included: true, highlight: true },
      { text: 'Monte Carlo simulations', included: true, highlight: true },
      { text: 'Utility rate analysis', included: true },
      { text: 'Drive-time catchment maps', included: true },
      { text: 'Bulk location analysis', included: true },
      { text: 'Deal scoring AI insights', included: true },
      { text: 'Revenue projections', included: true },
      { text: 'API access (500 calls/mo)', included: true },
      { text: 'Priority phone support', included: true },
    ],
    limits: {
      cleanbiAnalyses: 'unlimited',
      apiCalls: 500,
      savedReports: 'unlimited',
      teamMembers: 3,
    },
    cta: 'Start 7-Day Free Trial',
    ctaVariant: 'default',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For brokers & multi-unit operators',
    description: 'White-label reports, ownership data, and dedicated support',
    price: 699,
    priceAnnual: 6990,
    icon: Building2,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    popular: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Ownership & lien data', included: true, highlight: true },
      { text: 'Motivated seller detection', included: true, highlight: true },
      { text: 'Property tax records', included: true },
      { text: 'White-label reports', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Unlimited API access', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Phone & Slack support', included: true },
    ],
    limits: {
      cleanbiAnalyses: 'unlimited',
      apiCalls: 'unlimited',
      savedReports: 'unlimited',
      teamMembers: 'unlimited',
    },
    cta: 'Contact Sales',
    ctaVariant: 'outline',
    badge: 'BEST VALUE',
    badgeColor: 'bg-blue-600 text-white',
  },
};

export const LISTING_TIERS: Record<ListingTier, ListingTierConfig> = {
  free: {
    id: 'free',
    name: 'Basic',
    tagline: 'Get discovered',
    description: 'Standard listing visibility for your laundromat',
    price: 0,
    icon: Eye,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    popular: false,
    features: [
      { text: 'Listed in marketplace', included: true },
      { text: '5 photos allowed', included: true },
      { text: 'Basic contact form', included: true },
      { text: 'Standard search placement', included: true },
      { text: 'Enhanced visibility', included: false },
      { text: 'Priority search ranking', included: false },
      { text: 'CLEANBI report included', included: false },
      { text: 'Video tour slots', included: false },
    ],
    limits: {
      photos: 5,
      videos: 0,
      boostDays: 0,
      analytics: false,
      seoOptimization: false,
      cleanbiReport: false,
      priorityPlacement: false,
      socialProofBadge: false,
    },
    cta: 'List for Free',
    ctaVariant: 'outline',
  },
  enhanced: {
    id: 'enhanced',
    name: 'Enhanced',
    tagline: '2x more visibility',
    description: 'Stand out with enhanced listing features',
    price: 49,
    icon: TrendingUp,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    popular: false,
    features: [
      { text: 'Everything in Basic', included: true },
      { text: '15 photos allowed', included: true, highlight: true },
      { text: 'Enhanced listing badge', included: true, highlight: true },
      { text: 'Listing analytics dashboard', included: true },
      { text: 'Buyer inquiry tracking', included: true },
      { text: 'Priority in category search', included: true },
      { text: 'CLEANBI report included', included: false },
      { text: 'Homepage featured', included: false },
    ],
    limits: {
      photos: 15,
      videos: 0,
      boostDays: 0,
      analytics: true,
      seoOptimization: false,
      cleanbiReport: false,
      priorityPlacement: false,
      socialProofBadge: false,
    },
    cta: 'Upgrade to Enhanced',
    ctaVariant: 'default',
    roi: '2x more buyer inquiries on average',
  },
  featured: {
    id: 'featured',
    name: 'Featured',
    tagline: 'Premium placement',
    description: 'Featured on homepage and priority search results',
    price: 149,
    icon: Star,
    iconBg: 'bg-[#C8A661]/20',
    iconColor: 'text-[#C8A661]',
    popular: true,
    features: [
      { text: 'Everything in Enhanced', included: true },
      { text: 'Featured on homepage carousel', included: true, highlight: true },
      { text: 'Priority search ranking', included: true, highlight: true },
      { text: '30 photos allowed', included: true },
      { text: '2 video tour slots', included: true },
      { text: '"Featured" badge on listing', included: true },
      { text: 'CLEANBI report included', included: true },
      { text: 'Weekly email blast inclusion', included: true },
    ],
    limits: {
      photos: 30,
      videos: 2,
      boostDays: 7,
      analytics: true,
      seoOptimization: false,
      cleanbiReport: true,
      priorityPlacement: true,
      socialProofBadge: true,
    },
    cta: 'Get Featured',
    ctaVariant: 'default',
    badge: 'BEST SELLER',
    badgeColor: 'bg-[#C8A661] text-white',
    roi: '5x more visibility vs Basic',
  },
  premium_seo: {
    id: 'premium_seo',
    name: 'Premium SEO',
    tagline: 'Maximum discoverability',
    description: 'SEO optimization for Google ranking + all premium features',
    price: 299,
    icon: Search,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    popular: false,
    features: [
      { text: 'Everything in Featured', included: true },
      { text: 'Custom SEO-optimized URL', included: true, highlight: true },
      { text: 'Google-indexed landing page', included: true, highlight: true },
      { text: 'Schema markup for rich snippets', included: true },
      { text: 'Professional copywriting', included: true },
      { text: 'Social media share cards', included: true },
      { text: '5 video tour slots', included: true },
      { text: 'Dedicated support rep', included: true },
    ],
    limits: {
      photos: 50,
      videos: 5,
      boostDays: 14,
      analytics: true,
      seoOptimization: true,
      cleanbiReport: true,
      priorityPlacement: true,
      socialProofBadge: true,
    },
    cta: 'Maximize Reach',
    ctaVariant: 'default',
    roi: 'Rank on Google for "[city] laundromat for sale"',
  },
  spotlight: {
    id: 'spotlight',
    name: 'Spotlight',
    tagline: 'VIP treatment',
    description: 'Maximum exposure with concierge service and premium placement',
    price: 499,
    icon: Rocket,
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconColor: 'text-white',
    popular: false,
    features: [
      { text: 'Everything in Premium SEO', included: true },
      { text: 'Homepage spotlight banner', included: true, highlight: true },
      { text: 'Social media promotion', included: true, highlight: true },
      { text: 'Email blast to 72K+ members', included: true, highlight: true },
      { text: 'Unlimited photos & videos', included: true },
      { text: 'Professional photography credit', included: true },
      { text: 'Concierge listing setup', included: true },
      { text: 'Priority buyer matching', included: true },
    ],
    limits: {
      photos: 999,
      videos: 20,
      boostDays: 30,
      analytics: true,
      seoOptimization: true,
      cleanbiReport: true,
      priorityPlacement: true,
      socialProofBadge: true,
    },
    cta: 'Go Spotlight',
    ctaVariant: 'default',
    badge: 'VIP',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    roi: 'Sell 3x faster on average',
  },
};

export const PLATFORM_TIER_ORDER: PlatformTier[] = ['free', 'starter', 'pro', 'enterprise'];
export const LISTING_TIER_ORDER: ListingTier[] = ['free', 'enhanced', 'featured', 'premium_seo', 'spotlight'];

export function getPlatformTier(tierId: string): PlatformTierConfig | undefined {
  return PLATFORM_TIERS[tierId as PlatformTier];
}

export function getListingTier(tierId: string): ListingTierConfig | undefined {
  return LISTING_TIERS[tierId as ListingTier];
}

export function formatPrice(price: number, period: 'month' | 'year' = 'month'): string {
  if (price === 0) return 'Free';
  return `$${price}/${period === 'month' ? 'mo' : 'yr'}`;
}

export function getSavingsPercent(monthly: number, annual: number): number {
  if (monthly === 0) return 0;
  const yearlyMonthly = monthly * 12;
  return Math.round(((yearlyMonthly - annual) / yearlyMonthly) * 100);
}

export const PLATFORM_PRICING_FAQS = [
  {
    question: "What is CLEANBI?",
    answer: "CLEANBI is our proprietary AI-powered location intelligence system that scores any address for laundromat investment potential. It analyzes 6 key factors: Competition, Location, Equipment, Accessibility, Neighborhood, and Business metrics to give you a comprehensive A-F grade."
  },
  {
    question: "How does the free trial work?",
    answer: "Start your 7-day free trial with full access to all Starter or Pro features. No credit card required to start. Cancel anytime during the trial and you won't be charged."
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the start of your next billing cycle. We'll prorate any charges."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processing. Enterprise plans can also pay via invoice."
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes! If you're not satisfied within the first 30 days of your paid subscription, contact us for a full refund. No questions asked."
  },
  {
    question: "What's included in API access?",
    answer: "Pro plan includes 500 API calls per month for integrating CLEANBI data into your own applications. Enterprise includes unlimited API access with dedicated endpoints and priority rate limits."
  }
];

export const LISTING_PRICING_FAQS = [
  {
    question: "How long do listing tiers last?",
    answer: "All listing tiers are monthly subscriptions that auto-renew. Your listing stays active as long as your subscription is active. You can cancel or change tiers anytime."
  },
  {
    question: "What happens if my listing sells?",
    answer: "Congratulations! Simply mark your listing as 'Sold' in your dashboard. Your subscription will continue until the end of your billing period, or you can cancel it immediately."
  },
  {
    question: "Can I upgrade my listing tier later?",
    answer: "Absolutely! You can upgrade your listing at any time and the new features take effect immediately. We'll prorate the difference for the remaining billing period."
  },
  {
    question: "How does the CLEANBI report help sell my laundromat?",
    answer: "Buyers love seeing a professional CLEANBI analysis. It provides third-party validation of location quality, competition analysis, and growth potential - building buyer confidence and often leading to faster sales at better prices."
  },
  {
    question: "What's included in professional photography credit?",
    answer: "Spotlight tier includes a $250 credit toward professional photography services in select markets. We'll connect you with our network of commercial real estate photographers."
  }
];
