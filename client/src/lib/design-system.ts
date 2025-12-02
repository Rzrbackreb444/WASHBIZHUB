export const WASHBIZHUB_COLORS = {
  navy: 'hsl(var(--navy-900))',
  navyDark: 'hsl(217 57% 8%)',
  navyLight: 'hsl(var(--navy-800))',
  navyDeep: 'hsl(217 57% 6%)',
  gold: 'hsl(var(--gold-500))',
  goldLight: 'hsl(var(--gold-400))',
  goldDark: 'hsl(var(--gold-600))',
  goldMuted: 'hsl(43 60% 55%)',
  teal: 'hsl(var(--teal-400))',
  tealDark: 'hsl(180 60% 45%)',
  white: 'hsl(0 0% 100%)',
  black: 'hsl(0 0% 4%)',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: 'hsl(var(--primary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
  card: 'hsl(var(--card))',
  gray: {
    50: 'hsl(0 0% 98%)',
    100: 'hsl(0 0% 96%)',
    200: 'hsl(0 0% 90%)',
    300: 'hsl(0 0% 83%)',
    400: 'hsl(0 0% 64%)',
    500: 'hsl(0 0% 45%)',
    600: 'hsl(0 0% 32%)',
    700: 'hsl(0 0% 25%)',
    800: 'hsl(0 0% 15%)',
    900: 'hsl(0 0% 9%)',
  },
} as const;

export const WASHBIZHUB_TAILWIND_COLORS = {
  navy: 'bg-navy-900',
  navyLight: 'bg-navy-800',
  gold: 'bg-gold-500',
  goldLight: 'bg-gold-400',
  goldDark: 'bg-gold-600',
  teal: 'bg-teal-400',
  textNavy: 'text-foreground',
  textGold: 'text-gold-500',
  textGoldLight: 'text-gold-400',
  textTeal: 'text-teal-400',
  borderGold: 'border-gold-500',
  borderTeal: 'border-teal-400',
} as const;

export const WASHBIZHUB_GRADIENTS = {
  primary: 'bg-gradient-to-br from-slate-900 via-background to-slate-900 dark:from-background dark:via-card dark:to-background',
  primaryReverse: 'bg-gradient-to-tl from-slate-900 via-background to-slate-900 dark:from-background dark:via-card dark:to-background',
  hero: 'bg-gradient-to-r from-navy-900 to-navy-800',
  heroOverlay: 'bg-gradient-to-br from-background/90 via-card/95 to-background',
  dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-background dark:via-card dark:to-background',
  navy: 'bg-gradient-to-br from-background via-card to-navy-800',
  navyDeep: 'bg-gradient-to-b from-card to-background',
  goldShimmer: 'bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600',
  tealAccent: 'bg-gradient-to-r from-primary/80 to-primary',
  cardGlow: 'bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-white/0',
} as const;

export const WASHBIZHUB_GLASSMORPHISM = {
  card: 'bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-xl',
  cardHover: 'bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-300',
  cardStrong: 'bg-white/15 dark:bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl',
  panel: 'bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg',
  panelDark: 'bg-black/20 dark:bg-black/20 backdrop-blur-md border border-white/10 rounded-lg',
  input: 'bg-white/10 dark:bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg',
  button: 'bg-white/10 dark:bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all',
  modal: 'bg-card/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl',
  header: 'bg-card/95 backdrop-blur-md border-b border-white/10',
  footer: 'bg-card border-t border-accent/30',
} as const;

export const WASHBIZHUB_SHADOWS = {
  sm: 'shadow-sm shadow-black/20',
  md: 'shadow-md shadow-black/30',
  lg: 'shadow-lg shadow-black/40',
  xl: 'shadow-xl shadow-black/50',
  goldGlow: 'shadow-lg shadow-accent/20',
  tealGlow: 'shadow-lg shadow-primary/20',
  navyGlow: 'shadow-lg shadow-foreground/10',
} as const;

export const WASHBIZHUB_TYPOGRAPHY = {
  heroHeadline: 'font-bebas text-5xl sm:text-6xl md:text-7xl tracking-wide',
  pageTitle: 'font-bebas text-4xl sm:text-5xl tracking-wide',
  sectionTitle: 'font-bebas text-3xl sm:text-4xl tracking-wide',
  cardTitle: 'font-bebas text-2xl tracking-wide',
  subtitle: 'text-xl font-semibold',
  body: 'text-base leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  caption: 'text-xs text-muted-foreground',
  label: 'text-sm font-medium uppercase tracking-wider',
  metric: 'font-bebas text-4xl',
  metricLarge: 'font-bebas text-5xl',
} as const;

export const WASHBIZHUB_BUTTONS = {
  primary: 'bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200',
  primaryLarge: 'bg-gold-500 hover:bg-gold-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200',
  secondary: 'bg-navy-900 hover:bg-navy-800 text-white font-semibold px-6 py-3 rounded-lg border border-white/20 transition-all duration-200',
  outline: 'border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200',
  ghost: 'text-foreground/80 hover:text-foreground hover:bg-white/10 font-medium px-4 py-2 rounded-lg transition-all duration-200',
  teal: 'bg-teal-400 hover:bg-teal-300 text-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-200',
} as const;

export const WASHBIZHUB_TRUST_STATS = {
  countries: '220+',
  members: '72,000+',
  cleanbiFactors: '17',
  tools: '80+',
  rating: 4.9,
  reviewCount: 2847,
} as const;

export const WASHBIZHUB_SEO_DEFAULTS = {
  siteName: 'WashBizHub',
  tagline: 'The #1 Laundromat Resource & Educational Hub',
  description: 'The #1 laundromat resource for owners, operators, brokers, investors. CLEANBI analyzer, listings, valuations, courses, calculators, funding.',
  author: {
    name: 'WashBizHub Team',
    expertise: 'Laundromat Business Experts',
    credentials: '30+ years combined industry experience',
  },
  socialLinks: {
    facebook: 'https://www.facebook.com/washbizhub1',
    twitter: 'https://twitter.com/washbizhub',
    linkedin: 'https://www.linkedin.com/company/washbizhub',
    facebookGroup: 'https://facebook.com/groups/thelaundromat',
  },
  contact: {
    email: 'support@washbizhub.com',
    phone: '+1-800-WASHBIZ',
  },
  location: {
    address: 'United States',
    geo: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
} as const;

export const WASHBIZHUB_PAGE_DEFAULTS = {
  tool: {
    ratingValue: 4.8,
    reviewCount: 1247,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
  },
  content: {
    ratingValue: 4.9,
    reviewCount: 892,
  },
  marketplace: {
    ratingValue: 4.7,
    reviewCount: 3156,
  },
  pricing: {
    ratingValue: 4.9,
    reviewCount: 2341,
  },
  blog: {
    ratingValue: 4.8,
    reviewCount: 567,
  },
  landing: {
    ratingValue: 4.9,
    reviewCount: 2847,
  },
} as const;

export const WASHBIZHUB_KEYWORDS = {
  core: [
    'laundromat',
    'laundry business',
    'coin laundry',
    'self-service laundry',
    'laundromat for sale',
    'buy laundromat',
    'sell laundromat',
  ],
  tools: [
    'laundromat calculator',
    'CLEANBI score',
    'laundromat valuation',
    'ROI calculator',
    'laundry business tools',
  ],
  education: [
    'laundromat courses',
    'laundry business training',
    'laundromat guide',
    'how to buy laundromat',
  ],
  marketplace: [
    'laundromat listings',
    'laundry equipment',
    'commercial washers',
    'coin-op machines',
  ],
} as const;

export const WASHBIZHUB_FAQS_DEFAULT = [
  {
    question: 'What is WashBizHub?',
    answer: 'WashBizHub is the #1 comprehensive platform for laundromat owners, operators, buyers, sellers, and investors. We provide CLEANBI scoring, marketplace listings, educational courses, business calculators, and AI-powered tools.',
  },
  {
    question: 'What is CLEANBI?',
    answer: 'CLEANBI is our proprietary 17-factor scoring algorithm that evaluates laundromat locations and businesses. It analyzes demographics, competition, traffic, income levels, and more to give you a comprehensive score out of 100.',
  },
  {
    question: 'How much does WashBizHub cost?',
    answer: 'WashBizHub offers a free tier with basic tools, and premium plans starting at $29/month for advanced features like unlimited CLEANBI scores, AI consulting, and marketplace access.',
  },
  {
    question: 'Can I list my laundromat for sale on WashBizHub?',
    answer: 'Yes! WashBizHub has a comprehensive marketplace where you can list your laundromat for sale. Our platform reaches over 72,000 members across 220+ countries.',
  },
] as const;

export type WashBizHubColors = typeof WASHBIZHUB_COLORS;
export type WashBizHubGradients = typeof WASHBIZHUB_GRADIENTS;
export type WashBizHubGlassmorphism = typeof WASHBIZHUB_GLASSMORPHISM;
export type WashBizHubPageType = keyof typeof WASHBIZHUB_PAGE_DEFAULTS;
export type WashBizHubTailwindColors = typeof WASHBIZHUB_TAILWIND_COLORS;
