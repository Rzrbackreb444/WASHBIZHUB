/**
 * WashBizHub Centralized SEO Configuration
 * 
 * Complete SEO settings, author info, organization data, and page-specific configs
 * for maximum E-E-A-T, AEO, and SERP optimization.
 */

// ===== BASE URLs =====
export const BASE_URL = 'https://washbizhub.com';
export const CURRENT_YEAR = new Date().getFullYear();

// ===== ORGANIZATION INFO =====
export const ORGANIZATION = {
  name: 'WashBizHub',
  legalName: 'WashBizHub LLC',
  url: BASE_URL,
  logo: `${BASE_URL}/washbizhub-logo.png`,
  logoWidth: 512,
  logoHeight: 512,
  description: 'The #1 laundromat resource and educational hub. CLEANBI location intelligence, valuation tools, marketplace, courses, and AI-powered business consulting for 73,000+ industry professionals.',
  foundingDate: '2024',
  slogan: 'Learn. Start. Operate. Expand.',
  email: 'support@washbizhub.com',
  consultEmail: 'consult@washbizhub.com',
  phone: '+1-479-883-4314',
  socialProfiles: {
    facebook: 'https://www.facebook.com/washbizhub1',
    twitter: 'https://twitter.com/washbizhub',
    linkedin: 'https://www.linkedin.com/company/washbizhub',
    youtube: 'https://www.youtube.com/@washbizhub'
  },
  areaServed: ['United States', 'Canada', 'United Kingdom', 'Australia'],
  knowsAbout: [
    'laundromat business',
    'laundromat for sale',
    'laundromat valuation',
    'laundromat investment',
    'CLEANBI location scoring',
    'commercial laundry equipment',
    'laundromat due diligence',
    'coin laundry operations'
  ]
};

// ===== PRIMARY AUTHOR - NICK KREMERS (E-E-A-T) =====
export const AUTHOR_NICK = {
  name: 'Nick Kremers',
  url: `${BASE_URL}/about-us`,
  image: `${BASE_URL}/authors/nick-kremers.jpg`,
  jobTitle: 'Founder & Laundromat Industry Expert',
  credentials: [
    '20+ years laundromat industry experience',
    'Multi-location owner/operator',
    'Equipment valuation specialist',
    'CLEANBI methodology creator'
  ],
  experience: 'Nick Kremers founded WashBizHub after successfully operating multiple laundromat locations. He created the CLEANBI scoring system and has helped hundreds of investors make data-driven decisions in the laundromat industry.',
  socialProfiles: {
    linkedin: 'https://www.linkedin.com/in/nickkremers',
    twitter: 'https://twitter.com/washbizhub'
  },
  contactEmail: 'nick@washbizhub.com',
  contactPhone: '+1-479-883-4314'
};

// ===== CONTRIBUTING AUTHORS =====
export const AUTHORS = {
  nick: AUTHOR_NICK,
  washbizhub: {
    name: 'WashBizHub Team',
    url: `${BASE_URL}/about-us`,
    jobTitle: 'Industry Experts',
    credentials: ['Laundromat operations specialists', 'Equipment technicians', 'Business analysts'],
    experience: 'The WashBizHub team combines decades of hands-on laundromat experience with data-driven analysis to help investors succeed.'
  }
};

// ===== TRUST SIGNALS =====
export const TRUST_SIGNALS = {
  userCount: '73,000+',
  statesCovered: 50,
  toolsCount: '50+',
  yearsExperience: 20,
  reviewRating: 4.9,
  reviewCount: 2847,
  certifications: [
    'Human-Verified Intelligence',
    'Data-Driven Analysis',
    'Industry Expert Support'
  ]
};

// ===== AGGREGATE RATINGS =====
export const RATINGS = {
  platform: { ratingValue: 4.9, reviewCount: 2847, bestRating: 5 },
  cleanbi: { ratingValue: 4.8, reviewCount: 1523, bestRating: 5 },
  calculators: { ratingValue: 4.9, reviewCount: 892, bestRating: 5 },
  courses: { ratingValue: 4.7, reviewCount: 324, bestRating: 5 }
};

// ===== PAGE SEO CONFIGURATIONS =====
export const PAGE_CONFIGS = {
  home: {
    title: 'WashBizHub - #1 Laundromat Resource & Educational Hub',
    description: 'The complete laundromat platform for investors, owners & operators. CLEANBI location scoring, valuation tools, marketplace, courses, and AI consulting. Join 73,000+ industry professionals.',
    keywords: ['laundromat for sale', 'laundromat business', 'laundromat investment', 'CLEANBI', 'laundromat valuation', 'coin laundry', 'laundromat marketplace'],
    canonicalUrl: BASE_URL,
    pageType: 'landing' as const,
    primaryQuestion: 'What is the best platform for laundromat investors?',
    directAnswer: 'WashBizHub is the #1 laundromat resource hub, serving 73,000+ professionals with CLEANBI location scoring, valuation calculators, marketplace listings, expert courses, and AI-powered consulting tools.',
    breadcrumbs: []
  },
  cleanbiExplorer: {
    title: 'CLEANBI Explorer - Free Location Intelligence Score',
    description: 'Score any address worldwide with CLEANBI. Our 17-factor AI algorithm analyzes demographics, competition, foot traffic & market potential. Free unlimited scores, premium reports from $99.',
    keywords: ['CLEANBI score', 'laundromat location analysis', 'location intelligence', 'laundromat site selection', 'competition analysis', 'demographic analysis'],
    canonicalUrl: `${BASE_URL}/cleanbi-explorer`,
    pageType: 'tool' as const,
    primaryQuestion: 'What is a CLEANBI score?',
    directAnswer: 'A CLEANBI score is a 0-100 rating that evaluates any location based on 17 factors including demographics, competition density, foot traffic, rental population, and market potential. Scores above 85 receive an A grade, 70-84 receive B, 55-69 receive C, and below 55 is marked as "Needs Work".',
    breadcrumbs: [{ name: 'Tools', url: '/tools' }, { name: 'CLEANBI Explorer', url: '/cleanbi-explorer' }]
  },
  pricing: {
    title: 'Pricing Plans - WashBizHub Subscriptions',
    description: 'Choose your WashBizHub plan. Free basic features, Starter at $29/mo, Pro at $99/mo, Enterprise at $299/mo. Unlock CLEANBI reports, advanced calculators, and premium tools.',
    keywords: ['WashBizHub pricing', 'CLEANBI pricing', 'laundromat tools pricing', 'laundromat subscription'],
    canonicalUrl: `${BASE_URL}/pricing`,
    pageType: 'product' as const,
    breadcrumbs: [{ name: 'Pricing', url: '/pricing' }]
  },
  courses: {
    title: 'Laundromat Business Courses - Learn from Industry Experts',
    description: 'Professional laundromat courses covering operations, marketing, equipment, financing, and growth strategies. Video lessons, practical guides, and expert insights.',
    keywords: ['laundromat courses', 'laundromat training', 'how to run a laundromat', 'laundromat business education'],
    canonicalUrl: `${BASE_URL}/courses`,
    pageType: 'directory' as const,
    breadcrumbs: [{ name: 'Courses', url: '/courses' }]
  },
  listings: {
    title: 'Laundromats For Sale - Browse Listings Nationwide',
    description: 'Find laundromats for sale across the United States. Browse verified listings, get CLEANBI scores, and connect with sellers. Updated daily with new opportunities.',
    keywords: ['laundromat for sale', 'buy a laundromat', 'laundromat listings', 'coin laundry for sale', 'laundromat marketplace'],
    canonicalUrl: `${BASE_URL}/laundromat-listings`,
    pageType: 'marketplace' as const,
    primaryQuestion: 'Where can I find laundromats for sale?',
    directAnswer: 'WashBizHub marketplace features laundromats for sale across all 50 states. Each listing includes asking price, gross revenue, CLEANBI location score, and seller contact info. Browse free, filter by price and location, and use our valuation tools for due diligence.',
    breadcrumbs: [{ name: 'Marketplace', url: '/marketplace' }, { name: 'Listings', url: '/laundromat-listings' }]
  },
  calculators: {
    title: 'Laundromat Calculators - ROI, Valuation & Financial Tools',
    description: 'Free laundromat calculators for ROI, valuation, utility costs, labor optimization, and break-even analysis. Make data-driven investment decisions.',
    keywords: ['laundromat calculator', 'laundromat ROI calculator', 'laundromat valuation calculator', 'coin laundry profit calculator'],
    canonicalUrl: `${BASE_URL}/calculators`,
    pageType: 'calculator' as const,
    primaryQuestion: 'How do I calculate laundromat valuation?',
    directAnswer: 'Laundromat valuation is typically calculated using a multiple of Seller\'s Discretionary Earnings (SDE). The standard range is 2.5-4x annual SDE, depending on location quality, equipment condition, and lease terms. Use our free valuation calculator to get an instant estimate.',
    breadcrumbs: [{ name: 'Tools', url: '/tools' }, { name: 'Calculators', url: '/calculators' }]
  },
  blog: {
    title: 'Laundromat Industry Blog - News, Guides & Insights',
    description: 'Expert laundromat industry insights, how-to guides, market trends, and success stories. Written by industry veterans with 20+ years experience.',
    keywords: ['laundromat blog', 'laundromat industry news', 'laundromat tips', 'coin laundry guides'],
    canonicalUrl: `${BASE_URL}/blog`,
    pageType: 'blog' as const,
    breadcrumbs: [{ name: 'Blog', url: '/blog' }]
  },
  aboutUs: {
    title: 'About WashBizHub - Our Mission & Team',
    description: 'Meet the team behind WashBizHub. Founded by laundromat industry veterans, we\'re on a mission to help investors make smarter decisions with data-driven tools.',
    keywords: ['about WashBizHub', 'laundromat experts', 'Nick Kremers'],
    canonicalUrl: `${BASE_URL}/about-us`,
    pageType: 'landing' as const,
    breadcrumbs: [{ name: 'About Us', url: '/about-us' }]
  },
  equipmentMarketplace: {
    title: 'Commercial Laundry Equipment Marketplace',
    description: 'Buy and sell commercial laundry equipment. Speed Queen, Dexter, Maytag washers and dryers. New and used equipment with verified sellers.',
    keywords: ['commercial laundry equipment', 'used laundromat equipment', 'Speed Queen for sale', 'commercial washer'],
    canonicalUrl: `${BASE_URL}/equipment-marketplace`,
    pageType: 'marketplace' as const,
    breadcrumbs: [{ name: 'Marketplace', url: '/marketplace' }, { name: 'Equipment', url: '/equipment-marketplace' }]
  },
  directory: {
    title: 'Laundromat Vendor Directory - Verified Service Providers',
    description: 'Find verified laundromat vendors: equipment suppliers, repair technicians, distributors, and business services. All vetted for quality and reliability.',
    keywords: ['laundromat vendors', 'laundry equipment suppliers', 'laundromat service providers'],
    canonicalUrl: `${BASE_URL}/directory`,
    pageType: 'directory' as const,
    breadcrumbs: [{ name: 'Directory', url: '/directory' }]
  },
  serviceGuy: {
    title: 'Service Guy AI - Equipment Diagnostics & Repair',
    description: 'AI-powered commercial laundry equipment diagnostics. Get instant error code solutions, troubleshooting guides, and repair recommendations.',
    keywords: ['laundromat repair', 'commercial washer error codes', 'Speed Queen troubleshooting', 'laundry equipment diagnostics'],
    canonicalUrl: `${BASE_URL}/service-guy`,
    pageType: 'tool' as const,
    primaryQuestion: 'How do I diagnose commercial washer errors?',
    directAnswer: 'Use Service Guy AI to instantly diagnose commercial washer and dryer error codes. Enter your error code or describe the problem, and get step-by-step troubleshooting guides for Speed Queen, Dexter, Maytag, and other major brands.',
    breadcrumbs: [{ name: 'Tools', url: '/tools' }, { name: 'Service Guy AI', url: '/service-guy' }]
  }
};

// ===== COMMON FAQ DATA =====
export const COMMON_FAQS = {
  general: [
    {
      question: 'What is WashBizHub?',
      answer: 'WashBizHub is the #1 laundromat resource and educational hub, serving over 73,000 industry professionals. We provide CLEANBI location scoring, valuation calculators, marketplace listings, professional courses, and AI-powered business tools for laundromat investors, owners, operators, and vendors.'
    },
    {
      question: 'Is WashBizHub free to use?',
      answer: 'Many WashBizHub features are free including basic CLEANBI scores, marketplace browsing, blog content, and basic calculators. Premium features like detailed reports (from $99), advanced calculators, courses, and consulting have associated fees. Free users get unlimited basic CLEANBI scores with no login required.'
    },
    {
      question: 'Who created WashBizHub?',
      answer: 'WashBizHub was founded by Nick Kremers, a laundromat industry veteran with 20+ years of experience as a multi-location owner and operator. Nick created the CLEANBI scoring methodology and assembled a team of industry experts to build the most comprehensive laundromat platform.'
    }
  ],
  cleanbi: [
    {
      question: 'What is a CLEANBI score?',
      answer: 'A CLEANBI score is a 0-100 rating that evaluates any location based on 17 weighted factors including demographics, competition density, foot traffic, rental population, median income, and market potential. Scores of 85+ receive an A grade (excellent), 70-84 receive B (good), 55-69 receive C (fair), and below 55 is marked as "Needs Work" (strategic improvements needed). CLEANBI works for laundromats and any commercial property worldwide.'
    },
    {
      question: 'How accurate is the CLEANBI score?',
      answer: 'CLEANBI uses real-time data from Google Places API, US Census Bureau, and proprietary industry benchmarks. Each score includes a confidence percentage based on available data quality. Urban and suburban locations typically have excellent data coverage. The 17-factor algorithm is calibrated against thousands of actual laundromat performance metrics.'
    },
    {
      question: 'Is CLEANBI free?',
      answer: 'Yes! Basic CLEANBI scores are 100% free with no login required. You get unlimited address lookups globally. Premium reports starting at $99 provide deeper analysis including full 17-factor breakdowns, AI recommendations, competitor mapping, and downloadable PDF reports.'
    }
  ],
  buying: [
    {
      question: 'How much does it cost to buy a laundromat?',
      answer: 'Laundromat prices typically range from $100,000 to $1,000,000+, depending on location, size, equipment condition, and revenue. The average laundromat sells for 2.5-4x annual Seller\'s Discretionary Earnings (SDE). Use our valuation calculator to get an instant estimate for any laundromat.'
    },
    {
      question: 'How to buy a laundromat with no money down?',
      answer: 'While rare, options include: SBA loans (10-25% down), seller financing (negotiate terms directly), equipment financing (separate from business purchase), partner investors, or ROBS (Rollover for Business Startups using retirement funds). Most successful acquisitions require 10-30% down payment.'
    },
    {
      question: 'What is a good ROI for a laundromat?',
      answer: 'A well-run laundromat typically generates 15-35% cash-on-cash return. Factors affecting ROI include location quality, equipment efficiency, operating costs, and management style. Use our ROI calculator to project returns based on your specific deal parameters.'
    }
  ],
  operations: [
    {
      question: 'How much profit does a laundromat make?',
      answer: 'Average laundromats generate $15,000-$100,000+ annual net income depending on size and location. Profit margins typically range from 20-35% of gross revenue. Key factors include rent (should be under 25% of revenue), utilities, and staffing efficiency.'
    },
    {
      question: 'Is owning a laundromat passive income?',
      answer: 'Laundromats can be relatively passive compared to other businesses, but they\'re not completely hands-off. Expect 5-15 hours per week for maintenance, coin collection, cleaning oversight, and customer issues. Hiring attendants increases passivity but reduces margins.'
    }
  ]
};

// ===== STRUCTURED DATA GENERATORS =====
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    "name": ORGANIZATION.name,
    "legalName": ORGANIZATION.legalName,
    "url": ORGANIZATION.url,
    "logo": {
      "@type": "ImageObject",
      "url": ORGANIZATION.logo,
      "width": ORGANIZATION.logoWidth,
      "height": ORGANIZATION.logoHeight
    },
    "description": ORGANIZATION.description,
    "foundingDate": ORGANIZATION.foundingDate,
    "slogan": ORGANIZATION.slogan,
    "email": ORGANIZATION.email,
    "telephone": ORGANIZATION.phone,
    "sameAs": Object.values(ORGANIZATION.socialProfiles),
    "knowsAbout": ORGANIZATION.knowsAbout,
    "areaServed": ORGANIZATION.areaServed.map(area => ({
      "@type": "Country",
      "name": area
    })),
    "founder": {
      "@type": "Person",
      "name": AUTHOR_NICK.name,
      "jobTitle": AUTHOR_NICK.jobTitle,
      "email": AUTHOR_NICK.contactEmail
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": ORGANIZATION.email,
      "telephone": ORGANIZATION.phone,
      "availableLanguage": ["English"]
    }
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    "url": BASE_URL,
    "name": ORGANIZATION.name,
    "description": ORGANIZATION.description,
    "publisher": { "@id": `${BASE_URL}/#organization` },
    "inLanguage": "en-US",
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BASE_URL}/cleanbi-explorer?address={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BASE_URL}/laundromat-listings?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    ]
  };
}

export function generateAuthorSchema(author = AUTHOR_NICK) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "url": author.url,
    "image": author.image,
    "jobTitle": author.jobTitle,
    "description": author.experience,
    "worksFor": {
      "@type": "Organization",
      "name": ORGANIZATION.name,
      "url": ORGANIZATION.url
    },
    "sameAs": author.socialProfiles ? Object.values(author.socialProfiles) : [],
    "knowsAbout": ORGANIZATION.knowsAbout
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      ...breadcrumbs.map((bc, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": bc.name,
        "item": bc.url.startsWith('http') ? bc.url : `${BASE_URL}${bc.url}`
      }))
    ]
  };
}

export function generateAggregateRatingSchema(
  productName: string,
  rating: { ratingValue: number; reviewCount: number; bestRating?: number }
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "brand": { "@type": "Brand", "name": ORGANIZATION.name },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating.ratingValue,
      "reviewCount": rating.reviewCount,
      "bestRating": rating.bestRating || 5,
      "worstRating": 1
    }
  };
}
