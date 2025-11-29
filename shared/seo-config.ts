/**
 * WashBizHub SEO Configuration Matrix
 * 
 * Centralized SEO data for all pages to maximize indexing and ranking.
 * Each page includes:
 * - Title (55-60 chars with primary keyphrase)
 * - Description (155-160 chars with call to action)
 * - Focus keyphrases (primary + long-tail variations)
 * - Open Graph configuration
 * - Schema.org structured data types
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface PageSEOConfig {
  title: string;
  description: string;
  keywords: string[];
  focusKeyphrases: string[];
  ogImage: string;
  ogType: 'website' | 'article' | 'product' | 'course';
  schema: string[];
  breadcrumbs?: BreadcrumbItem[];
  canonicalPath?: string;
  noIndex?: boolean;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export const PAGE_SEO_CONFIG: Record<string, PageSEOConfig> = {
  '/': {
    title: 'WashBizHub - #1 Laundromat Business Intelligence Platform',
    description: 'The #1 laundromat resource for owners, operators & investors. CLEANBI scoring, POS system, calculators, marketplace, courses & funding. Start free today!',
    keywords: [
      'laundromat business',
      'laundromat software',
      'laundromat POS system',
      'laundromat for sale',
      'laundry business intelligence',
      'coin laundry management',
      'washateria software',
      'laundromat valuation'
    ],
    focusKeyphrases: [
      'laundromat software',
      'laundromat POS system',
      'laundromat business intelligence',
      'laundromat for sale near me',
      'coin laundry management software'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['Organization', 'WebSite', 'SoftwareApplication'],
    breadcrumbs: [{ name: 'Home', url: '/' }],
    priority: 1.0,
    changefreq: 'daily'
  },

  '/cleanbi-auto': {
    title: 'CLEANBI Score Calculator - Free Business Location Analysis Tool',
    description: 'Get instant CLEANBI scores for any address worldwide. Analyze foot traffic, competition & location quality. 100% free, no login required. Try now!',
    keywords: [
      'business location score',
      'location analysis tool',
      'foot traffic analyzer',
      'competition analysis',
      'property score calculator',
      'business intelligence score',
      'commercial property analysis',
      'retail location score'
    ],
    focusKeyphrases: [
      'CLEANBI score',
      'business location score calculator',
      'free location analysis tool',
      'foot traffic analyzer',
      'commercial property score'
    ],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Tools', url: '/calculators' },
      { name: 'CLEANBI Score', url: '/cleanbi-auto' }
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['SoftwareApplication', 'WebApplication', 'FAQPage'],
    priority: 1.0,
    changefreq: 'daily'
  },

  '/pricing': {
    title: 'WashBizHub Pricing - Free Trial & Plans Starting at $0/month',
    description: 'Start free forever with CLEANBI, calculators & community access. Pro POS starts at $99/mo. 14-day free trial. No credit card required.',
    keywords: [
      'laundromat software pricing',
      'POS system cost',
      'laundry management software price',
      'coin laundry software subscription',
      'laundromat business tools pricing',
      'washbizhub cost',
      'laundromat software free trial'
    ],
    focusKeyphrases: [
      'laundromat software pricing',
      'WashBizHub pricing plans',
      'laundromat POS cost',
      'free laundromat software',
      'laundry business software price'
    ],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Pricing', url: '/pricing' }
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'product',
    schema: ['Product', 'Offer', 'FAQPage'],
    priority: 0.9,
    changefreq: 'weekly'
  },

  '/pos-command-center': {
    title: 'WashBizPOS - Smart Laundromat POS System with AI Alerts',
    description: 'Complete laundromat POS with AI predictive maintenance, dynamic pricing & IoT monitoring. Unlimited machines for $99/mo or 1.9% per transaction.',
    keywords: [
      'laundromat POS system',
      'coin laundry POS',
      'laundry point of sale',
      'washateria POS',
      'laundromat payment system',
      'card payment laundromat',
      'smart laundry POS',
      'IoT laundromat'
    ],
    focusKeyphrases: [
      'laundromat POS system',
      'smart laundry POS',
      'coin laundry point of sale',
      'AI laundromat management',
      'laundromat payment processing'
    ],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/pricing' },
      { name: 'POS Command Center', url: '/pos-command-center' }
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'product',
    schema: ['SoftwareApplication', 'Product', 'FAQPage'],
    priority: 0.9,
    changefreq: 'weekly'
  },

  '/calculators': {
    title: 'Laundromat Calculators - 50+ Free Business Tools | WashBizHub',
    description: 'Free laundromat ROI, valuation, loan & profit calculators. Analyze your laundry business with professional-grade tools. No signup required.',
    keywords: [
      'laundromat calculator',
      'laundromat ROI calculator',
      'laundromat valuation calculator',
      'laundry profit calculator',
      'coin laundry revenue calculator',
      'laundromat investment calculator',
      'laundry business calculator'
    ],
    focusKeyphrases: [
      'laundromat calculator',
      'laundromat ROI calculator',
      'laundry profit calculator',
      'laundromat valuation tool',
      'coin laundry revenue estimator'
    ],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Tools', url: '/calculators' },
      { name: 'Calculators', url: '/calculators' }
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['WebApplication', 'SoftwareApplication'],
    priority: 0.85,
    changefreq: 'weekly'
  },

  '/resources': {
    title: 'Laundromat Resources & Guides - Free Downloads | WashBizHub',
    description: 'Free laundromat business guides, templates, checklists & educational resources. Everything you need to start, operate & grow your laundry business.',
    keywords: [
      'laundromat resources',
      'laundry business guides',
      'laundromat templates',
      'coin laundry checklists',
      'laundromat business plan',
      'laundry startup guide',
      'laundromat operations manual'
    ],
    focusKeyphrases: [
      'laundromat resources',
      'laundry business guides',
      'free laundromat templates',
      'laundromat startup checklist',
      'laundry business plan template'
    ],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Resources', url: '/resources' }
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['CollectionPage', 'ItemList'],
    priority: 0.85,
    changefreq: 'weekly'
  },

  '/laundromat-listings': {
    title: 'Laundromats for Sale - Browse 1000+ Listings | WashBizHub',
    description: 'Find laundromats for sale near you. Browse verified listings with CLEANBI scores, financials & photos. Connect with sellers directly. Updated daily.',
    keywords: [
      'laundromats for sale',
      'laundromat for sale near me',
      'buy a laundromat',
      'coin laundry for sale',
      'laundromat listings',
      'washateria for sale',
      'laundromat marketplace',
      'laundry business for sale'
    ],
    focusKeyphrases: [
      'laundromats for sale',
      'laundromat for sale near me',
      'buy a laundromat',
      'coin laundry for sale',
      'laundromat marketplace listings'
    ],
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Marketplace', url: '/laundromat-listings' },
      { name: 'Laundromats for Sale', url: '/laundromat-listings' }
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['ItemList', 'RealEstateListing', 'SearchResultsPage'],
    priority: 0.9,
    changefreq: 'daily'
  },

  '/startup-funding': {
    title: 'Laundromat Startup Funding - SBA Loans & Equipment Financing',
    description: 'Get approved for laundromat financing. SBA loans, equipment financing & working capital. Compare lenders & apply online. Fast approvals available.',
    keywords: [
      'laundromat financing',
      'laundromat startup funding',
      'laundry equipment financing',
      'SBA laundromat loan',
      'coin laundry financing',
      'laundromat business loan',
      'laundry startup capital'
    ],
    focusKeyphrases: [
      'laundromat financing',
      'laundromat startup funding',
      'laundry equipment loans',
      'SBA laundromat loan',
      'coin laundry business financing'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['FinancialProduct', 'Service', 'FAQPage'],
    priority: 0.85,
    changefreq: 'weekly'
  },

  '/blog': {
    title: 'Laundromat Blog - Industry News, Tips & Success Stories',
    description: 'Expert laundromat advice from industry veterans. Tips on operations, marketing, equipment & profitability. New articles published daily.',
    keywords: [
      'laundromat blog',
      'laundry business tips',
      'coin laundry advice',
      'laundromat marketing',
      'laundromat operations',
      'laundry industry news',
      'laundromat success stories'
    ],
    focusKeyphrases: [
      'laundromat blog',
      'laundry business tips',
      'coin laundry advice',
      'laundromat industry news',
      'laundromat owner guide'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['Blog', 'CollectionPage'],
    priority: 0.9,
    changefreq: 'daily'
  },

  '/courses': {
    title: 'Laundromat Courses - Professional Training & Certification',
    description: 'Master laundromat ownership with expert-led courses. Learn operations, marketing, financials & growth strategies. Certification available.',
    keywords: [
      'laundromat courses',
      'laundry business training',
      'coin laundry certification',
      'laundromat owner education',
      'laundry management course',
      'laundromat business school',
      'laundry industry training'
    ],
    focusKeyphrases: [
      'laundromat courses',
      'laundry business training',
      'laundromat certification program',
      'coin laundry education',
      'laundromat owner training'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'course',
    schema: ['Course', 'ItemList', 'EducationalOrganization'],
    priority: 0.85,
    changefreq: 'weekly'
  },

  '/error-codes': {
    title: 'Laundromat Error Codes Database - 2200+ Diagnostic Codes',
    description: 'Complete error code database for Speed Queen, Maytag, Dexter, Huebsch & more. Diagnose machine problems instantly. Free access for all brands.',
    keywords: [
      'laundromat error codes',
      'Speed Queen error codes',
      'Maytag commercial error codes',
      'Dexter washer error codes',
      'Huebsch error codes',
      'commercial washer troubleshooting',
      'laundry machine diagnostics'
    ],
    focusKeyphrases: [
      'laundromat error codes',
      'Speed Queen error codes',
      'commercial washer error codes',
      'Dexter dryer error codes',
      'laundry machine diagnostics'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['TechArticle', 'HowTo', 'FAQPage'],
    priority: 0.9,
    changefreq: 'daily'
  },

  '/service-guy-ai': {
    title: 'Service Guy AI - Instant Laundromat Equipment Diagnostics',
    description: 'AI-powered equipment troubleshooting for laundromat owners. Get instant repair guidance, parts lists & maintenance tips. Free to try!',
    keywords: [
      'laundromat AI assistant',
      'equipment diagnostics AI',
      'washer repair AI',
      'dryer troubleshooting AI',
      'laundry machine repair help',
      'commercial laundry AI',
      'laundromat maintenance AI'
    ],
    focusKeyphrases: [
      'Service Guy AI',
      'laundromat AI assistant',
      'equipment diagnostics AI',
      'washer repair troubleshooting',
      'commercial laundry AI help'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['SoftwareApplication', 'WebApplication'],
    priority: 0.85,
    changefreq: 'weekly'
  },

  '/marketplace': {
    title: 'Laundromat Marketplace - Equipment, Parts & Supplies',
    description: 'Buy & sell laundromat equipment, parts & supplies. New & used washers, dryers, folding tables & more. 5-15% cash back on purchases.',
    keywords: [
      'laundromat equipment marketplace',
      'used laundry equipment',
      'commercial washers for sale',
      'laundromat parts',
      'laundry supplies',
      'coin laundry equipment',
      'washer dryer marketplace'
    ],
    focusKeyphrases: [
      'laundromat equipment marketplace',
      'used laundry equipment for sale',
      'commercial washers for sale',
      'laundromat parts supplier',
      'laundry business supplies'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['ItemList', 'Store', 'OfferCatalog'],
    priority: 0.85,
    changefreq: 'daily'
  },

  '/superstore': {
    title: 'Laundromat Superstore - Shop Equipment & Supplies Online',
    description: 'Shop commercial washers, dryers, folding tables, carts & supplies. Free shipping on orders over $500. Trusted by 72,000+ laundromat owners.',
    keywords: [
      'laundromat superstore',
      'commercial laundry equipment',
      'laundromat supplies store',
      'coin laundry products',
      'washer dryer shop',
      'laundry equipment online',
      'laundromat accessories'
    ],
    focusKeyphrases: [
      'laundromat superstore',
      'commercial laundry equipment store',
      'laundromat supplies online',
      'coin laundry equipment shop',
      'laundry business supplies store'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['Store', 'Product', 'OfferCatalog'],
    priority: 0.85,
    changefreq: 'daily'
  },

  '/vendors': {
    title: 'Laundromat Vendors Directory - Trusted Industry Partners',
    description: 'Find verified laundromat vendors, distributors & service providers. Equipment dealers, repair services, financing & more. Read reviews.',
    keywords: [
      'laundromat vendors',
      'laundry equipment distributors',
      'coin laundry suppliers',
      'laundromat service providers',
      'laundry equipment dealers',
      'laundromat parts vendors',
      'commercial laundry suppliers'
    ],
    focusKeyphrases: [
      'laundromat vendors',
      'laundry equipment distributors',
      'coin laundry suppliers',
      'laundromat service providers',
      'laundry equipment dealers near me'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['ItemList', 'Organization', 'LocalBusiness'],
    priority: 0.8,
    changefreq: 'weekly'
  },

  '/design-studio': {
    title: 'Laundromat Design Studio - 2D Floor Plan Builder',
    description: 'Design your perfect laundromat layout with our free 2D studio. Drag-and-drop equipment, calculate costs & get AI optimization tips.',
    keywords: [
      'laundromat design studio',
      'laundry floor plan',
      'coin laundry layout',
      'laundromat floor plan software',
      'laundry business design',
      'laundromat layout builder',
      'washateria design tool'
    ],
    focusKeyphrases: [
      'laundromat design studio',
      'laundry floor plan builder',
      'coin laundry layout tool',
      'laundromat design software',
      'laundry business floor plan'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['SoftwareApplication', 'WebApplication'],
    priority: 0.8,
    changefreq: 'monthly'
  },

  '/book': {
    title: 'The Laundromat Bible - Complete Business Guide | WashBizHub',
    description: 'The ultimate guide to laundromat ownership. 3 generations of expertise covering startup, operations, marketing & growth. Order your copy today!',
    keywords: [
      'laundromat bible',
      'laundromat business book',
      'coin laundry guide',
      'laundry business book',
      'laundromat ownership guide',
      'how to start a laundromat',
      'laundromat success book'
    ],
    focusKeyphrases: [
      'The Laundromat Bible',
      'laundromat business book',
      'laundry business guide',
      'how to start a laundromat book',
      'laundromat ownership manual'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'product',
    schema: ['Book', 'Product', 'CreativeWork'],
    priority: 0.8,
    changefreq: 'monthly'
  },

  '/forum': {
    title: 'Laundromat Forum - 72,000+ Owner Community | WashBizHub',
    description: 'Join the largest laundromat owner community. Ask questions, share experiences & connect with industry veterans. Free to join.',
    keywords: [
      'laundromat forum',
      'laundry business community',
      'coin laundry forum',
      'laundromat owner network',
      'laundry industry forum',
      'laundromat discussion',
      'washateria community'
    ],
    focusKeyphrases: [
      'laundromat forum',
      'laundry owner community',
      'coin laundry discussion forum',
      'laundromat owner network',
      'laundry business questions'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['DiscussionForumPosting', 'CollectionPage'],
    priority: 0.85,
    changefreq: 'daily'
  },

  '/roi-calculator': {
    title: 'Laundromat ROI Calculator - Calculate Your Investment Returns',
    description: 'Free laundromat ROI calculator. Estimate returns, break-even period & cash flow. Make informed investment decisions with accurate projections.',
    keywords: [
      'laundromat ROI calculator',
      'laundry investment calculator',
      'coin laundry return calculator',
      'laundromat profit calculator',
      'laundry business ROI',
      'laundromat investment returns',
      'coin laundry profit estimator'
    ],
    focusKeyphrases: [
      'laundromat ROI calculator',
      'laundry investment ROI',
      'coin laundry return calculator',
      'laundromat profit calculator',
      'laundry business investment returns'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['SoftwareApplication', 'WebApplication'],
    priority: 0.85,
    changefreq: 'monthly'
  },

  '/valuation-calculator': {
    title: 'Laundromat Valuation Calculator - Know Your Business Worth',
    description: 'Get an accurate laundromat valuation estimate. Based on revenue multiples, EBITDA & comparable sales. Free instant calculation.',
    keywords: [
      'laundromat valuation calculator',
      'laundry business value',
      'coin laundry valuation',
      'laundromat worth calculator',
      'laundry business appraisal',
      'laundromat sale price calculator',
      'coin laundry value estimator'
    ],
    focusKeyphrases: [
      'laundromat valuation calculator',
      'laundry business valuation',
      'coin laundry value estimator',
      'laundromat worth calculator',
      'laundry business appraisal tool'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['SoftwareApplication', 'WebApplication'],
    priority: 0.85,
    changefreq: 'monthly'
  },

  '/loan-calculator': {
    title: 'Laundromat Loan Calculator - Estimate Monthly Payments',
    description: 'Calculate laundromat loan payments, interest & amortization. Compare SBA loans, equipment financing & commercial mortgages. Free tool.',
    keywords: [
      'laundromat loan calculator',
      'laundry equipment loan calculator',
      'SBA loan calculator',
      'commercial laundry financing',
      'laundromat mortgage calculator',
      'equipment financing calculator',
      'laundry business loan payment'
    ],
    focusKeyphrases: [
      'laundromat loan calculator',
      'laundry equipment financing calculator',
      'SBA loan payment calculator',
      'commercial laundry loan estimator',
      'laundromat financing calculator'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['SoftwareApplication', 'WebApplication'],
    priority: 0.85,
    changefreq: 'monthly'
  },

  '/about-us': {
    title: 'About WashBizHub - The #1 Laundromat Resource Platform',
    description: 'Learn about WashBizHub, the team behind the #1 laundromat platform. Our mission, values & commitment to the laundry industry.',
    keywords: [
      'about washbizhub',
      'laundromat platform',
      'laundry industry leaders',
      'washbizhub team',
      'laundromat resource company',
      'laundry business platform',
      'washbizhub mission'
    ],
    focusKeyphrases: [
      'about WashBizHub',
      'WashBizHub team',
      'laundromat resource platform',
      'laundry industry company',
      'WashBizHub mission'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['Organization', 'AboutPage'],
    priority: 0.7,
    changefreq: 'monthly'
  },

  '/privacy-policy': {
    title: 'Privacy Policy | WashBizHub',
    description: 'WashBizHub privacy policy. Learn how we collect, use and protect your personal information.',
    keywords: ['privacy policy', 'data protection', 'washbizhub privacy'],
    focusKeyphrases: ['WashBizHub privacy policy'],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['WebPage'],
    noIndex: false,
    priority: 0.4,
    changefreq: 'monthly'
  },

  '/terms-of-service': {
    title: 'Terms of Service | WashBizHub',
    description: 'WashBizHub terms of service. Read our terms and conditions for using the platform.',
    keywords: ['terms of service', 'user agreement', 'washbizhub terms'],
    focusKeyphrases: ['WashBizHub terms of service'],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['WebPage'],
    noIndex: false,
    priority: 0.4,
    changefreq: 'monthly'
  },

  '/distributor-locator': {
    title: 'Laundromat Equipment Distributor Locator | WashBizHub',
    description: 'Find laundromat equipment distributors near you. Speed Queen, Dexter, Maytag & more. Contact dealers directly for quotes.',
    keywords: [
      'laundromat equipment distributor',
      'Speed Queen dealer',
      'Dexter distributor',
      'commercial laundry dealer',
      'washer dryer distributor',
      'laundry equipment dealer locator'
    ],
    focusKeyphrases: [
      'laundromat equipment distributor',
      'Speed Queen dealer near me',
      'Dexter distributor locator',
      'commercial laundry equipment dealer',
      'washer dryer distributor finder'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['ItemList', 'LocalBusiness'],
    priority: 0.8,
    changefreq: 'weekly'
  },

  '/equipment-financing': {
    title: 'Laundromat Equipment Financing - Low Rates & Fast Approval',
    description: 'Finance your laundromat equipment with competitive rates. $0 down options available. Apply online & get approved in 24 hours.',
    keywords: [
      'laundromat equipment financing',
      'commercial washer financing',
      'laundry equipment lease',
      'coin laundry financing',
      'washer dryer financing',
      'equipment loans laundromat'
    ],
    focusKeyphrases: [
      'laundromat equipment financing',
      'commercial washer lease',
      'laundry equipment loans',
      'coin laundry equipment financing',
      'washer dryer financing options'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['FinancialProduct', 'Service'],
    priority: 0.85,
    changefreq: 'weekly'
  },

  '/consultation': {
    title: 'Laundromat Consulting - Expert Business Guidance | WashBizHub',
    description: 'Get personalized laundromat consulting from industry experts. Site selection, operations, growth strategies & more. Book your session today.',
    keywords: [
      'laundromat consulting',
      'laundry business consultant',
      'coin laundry expert',
      'laundromat advisor',
      'laundry business coaching',
      'laundromat startup consulting'
    ],
    focusKeyphrases: [
      'laundromat consulting',
      'laundry business consultant',
      'coin laundry expert advice',
      'laundromat startup consultant',
      'laundry business coaching'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['Service', 'ProfessionalService'],
    priority: 0.8,
    changefreq: 'weekly'
  },

  '/locator': {
    title: 'Laundromat Locator - Find Laundromats Near You | WashBizHub',
    description: 'Find laundromats near you with our interactive map. Search by location, amenities & hours. Read reviews & get directions.',
    keywords: [
      'laundromat locator',
      'laundromat near me',
      'coin laundry finder',
      'laundry near me',
      'washateria locator',
      'laundromat map',
      'find laundromat'
    ],
    focusKeyphrases: [
      'laundromat locator',
      'laundromat near me',
      'find laundromat',
      'coin laundry finder',
      'laundry near me map'
    ],
    ogImage: '/washbizhub-logo.png',
    ogType: 'website',
    schema: ['LocalBusiness', 'ItemList', 'SearchResultsPage'],
    priority: 0.85,
    changefreq: 'daily'
  }
};

/**
 * Get SEO config for a specific path
 */
export function getPageSEOConfig(path: string): PageSEOConfig | undefined {
  const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  return PAGE_SEO_CONFIG[normalizedPath];
}

/**
 * Get all configured page paths
 */
export function getAllConfiguredPaths(): string[] {
  return Object.keys(PAGE_SEO_CONFIG);
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(config: PageSEOConfig, baseUrl: string): Record<string, string> {
  return {
    'title': config.title,
    'description': config.description,
    'keywords': config.keywords.join(', '),
    'og:title': config.title,
    'og:description': config.description,
    'og:type': config.ogType,
    'og:image': `${baseUrl}${config.ogImage}`,
    'twitter:card': 'summary_large_image',
    'twitter:title': config.title,
    'twitter:description': config.description,
    'twitter:image': `${baseUrl}${config.ogImage}`,
  };
}

/**
 * IndexNow Configuration
 */
export const INDEXNOW_CONFIG = {
  apiKey: process.env.INDEXNOW_API_KEY || 'd8dd574359317a7a428e5402f039fd0a',
  keyLocation: '/.well-known/indexnow',
  supportedEngines: [
    { name: 'Bing', url: 'https://www.bing.com/indexnow' },
    { name: 'Yandex', url: 'https://yandex.com/indexnow' },
    { name: 'IndexNow API', url: 'https://api.indexnow.org/indexnow' },
  ],
  autoSubmitOn: [
    'blog_create',
    'blog_update',
    'listing_create',
    'listing_update',
    'resource_create',
    'course_create',
    'forum_topic_create',
  ],
};

/**
 * Robots.txt directives configuration
 */
export const ROBOTS_CONFIG = {
  userAgentRules: [
    { userAgent: '*', allow: ['/'], crawlDelay: 1 },
    { userAgent: 'Googlebot', allow: ['/'], crawlDelay: 0 },
    { userAgent: 'Bingbot', allow: ['/'], crawlDelay: 1 },
    { userAgent: 'ChatGPT-User', allow: ['/'] },
    { userAgent: 'Claude-Web', allow: ['/'] },
    { userAgent: 'PerplexityBot', allow: ['/'] },
    { userAgent: 'anthropic-ai', allow: ['/'] },
  ],
  globalDisallow: [
    '/api/',
    '/admin/',
    '/admin-*',
    '/owner-dashboard',
    '/settings',
    '/vault',
    '/seo-command-center',
    '/*?*sort=',
    '/*?*filter=',
    '/*?*page=',
  ],
  globalAllow: [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemap-blogs.xml',
    '/sitemap-listings.xml',
    '/sitemap-error-codes.xml',
    '/sitemap-resources.xml',
    '/sitemap-courses.xml',
    '/sitemap-forum.xml',
    '/sitemap-vendors.xml',
    '/error-codes/',
    '/calculators/',
    '/courses/',
    '/marketplace/',
    '/resources/',
    '/blog/',
    '/listings/',
    '/cleanbi/',
    '/design-studio/',
    '/pricing/',
    '/forum/',
  ],
  sitemaps: [
    'https://washbizhub.com/sitemap_index.xml',
    'https://washbizhub.com/sitemap.xml',
  ],
};

/**
 * Schema.org structured data templates
 */
export const SCHEMA_TEMPLATES = {
  Organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WashBizHub',
    alternateName: ['The Laundromat Bible', 'The #1 Laundromat Resource Hub'],
    url: 'https://washbizhub.com',
    logo: 'https://washbizhub.com/washbizhub-logo.png',
    description: 'The #1 laundromat resource and educational hub serving 72,000+ industry professionals worldwide.',
    foundingDate: '2024',
    sameAs: [
      'https://www.facebook.com/washbizhub1',
      'https://twitter.com/washbizhub',
      'https://www.linkedin.com/company/washbizhub'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@washbizhub.com',
      areaServed: 'Worldwide'
    }
  },

  WebSite: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WashBizHub',
    url: 'https://washbizhub.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://washbizhub.com/resources?searchQuery={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  },

  SoftwareApplication: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'WashBizHub Platform',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  }
};
