export const WASHBIZHUB_COLORS = {
  navy: '#1e3a5f',
  navyDark: '#152d4a',
  navyLight: '#2a4a6f',
  navyDeep: '#0f2847',
  gold: '#b8860b',
  goldLight: '#C8A661',
  goldDark: '#9a7009',
  goldMuted: '#d4a84b',
  teal: '#2dd4bf',
  tealDark: '#14b8a6',
  white: '#ffffff',
  black: '#0a0a0a',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const;

export const WASHBIZHUB_GRADIENTS = {
  primary: 'bg-gradient-to-br from-slate-900 via-[#1e3a5f] to-slate-900',
  primaryReverse: 'bg-gradient-to-tl from-slate-900 via-[#1e3a5f] to-slate-900',
  hero: 'bg-gradient-to-r from-[#1e3a5f] to-[#2a4a6f]',
  heroOverlay: 'bg-gradient-to-br from-[#1e3a5f]/90 via-[#152d4a]/95 to-[#0f2847]',
  dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
  navy: 'bg-gradient-to-br from-[#0f2847] via-[#1e3a5f] to-[#2a4a6f]',
  navyDeep: 'bg-gradient-to-b from-[#152d4a] to-[#0f2847]',
  goldShimmer: 'bg-gradient-to-r from-[#b8860b] via-[#C8A661] to-[#b8860b]',
  tealAccent: 'bg-gradient-to-r from-[#14b8a6] to-[#2dd4bf]',
  cardGlow: 'bg-gradient-to-br from-white/5 to-white/0',
} as const;

export const WASHBIZHUB_GLASSMORPHISM = {
  card: 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl',
  cardHover: 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-300',
  cardStrong: 'bg-white/15 backdrop-blur-lg border border-white/25 rounded-xl',
  panel: 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg',
  panelDark: 'bg-black/20 backdrop-blur-md border border-white/10 rounded-lg',
  input: 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg',
  button: 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all',
  modal: 'bg-[#1e3a5f]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl',
  header: 'bg-[#1e3a5f]/95 backdrop-blur-md border-b border-white/10',
  footer: 'bg-[#152d4a] border-t border-[#C8A661]/30',
} as const;

export const WASHBIZHUB_SHADOWS = {
  sm: 'shadow-sm shadow-black/20',
  md: 'shadow-md shadow-black/30',
  lg: 'shadow-lg shadow-black/40',
  xl: 'shadow-xl shadow-black/50',
  goldGlow: 'shadow-lg shadow-[#b8860b]/20',
  tealGlow: 'shadow-lg shadow-[#2dd4bf]/20',
  navyGlow: 'shadow-lg shadow-[#1e3a5f]/30',
} as const;

export const WASHBIZHUB_TYPOGRAPHY = {
  heroHeadline: 'font-bebas text-5xl sm:text-6xl md:text-7xl tracking-wide',
  pageTitle: 'font-bebas text-4xl sm:text-5xl tracking-wide',
  sectionTitle: 'font-bebas text-3xl sm:text-4xl tracking-wide',
  cardTitle: 'font-bebas text-2xl tracking-wide',
  subtitle: 'text-xl font-semibold',
  body: 'text-base leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  caption: 'text-xs text-white/60',
  label: 'text-sm font-medium uppercase tracking-wider',
  metric: 'font-bebas text-4xl',
  metricLarge: 'font-bebas text-5xl',
} as const;

export const WASHBIZHUB_BUTTONS = {
  primary: 'bg-[#b8860b] hover:bg-[#9a7009] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200',
  primaryLarge: 'bg-[#b8860b] hover:bg-[#9a7009] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200',
  secondary: 'bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white font-semibold px-6 py-3 rounded-lg border border-white/20 transition-all duration-200',
  outline: 'border-2 border-[#b8860b] text-[#b8860b] hover:bg-[#b8860b] hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200',
  ghost: 'text-white/80 hover:text-white hover:bg-white/10 font-medium px-4 py-2 rounded-lg transition-all duration-200',
  teal: 'bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f2847] font-semibold px-6 py-3 rounded-lg transition-all duration-200',
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
