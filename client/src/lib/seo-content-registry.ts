/**
 * Centralized SEO/EEAT Content Registry
 * Single source of truth for author data, FAQs, and content metadata
 * Used by both SEO schema components and visible UI components
 */

// ============================================
// AUTHOR REGISTRY - EEAT Expertise Attribution
// ============================================

export interface AuthorProfile {
  name: string;
  expertise: string;
  credentials: string;
  experience?: string;
  image?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export const AUTHORS: Record<string, AuthorProfile> = {
  larryLarsen: {
    name: "Larry Larsen",
    expertise: "Laundromat Store Design & Build-Out Expert",
    credentials: "50+ years in the laundromat industry, designed 135+ stores nationwide",
    experience: "50+ years",
    image: "/images/larry-larsen.jpg",
    socialLinks: {
      website: "https://washbizhub.com/larrys-academy"
    }
  },
  washbizhubTeam: {
    name: "WashBizHub Valuation Team",
    expertise: "Laundromat Appraisal & Business Valuation Specialists",
    credentials: "50+ years combined experience in laundromat acquisitions and sales across 1,000+ transactions"
  },
  nickKremers: {
    name: "Nick Kremers",
    expertise: "Laundromat Industry Analyst & Investment Advisor",
    credentials: "Founder of WashBizHub, former multi-unit operator",
    socialLinks: {
      website: "https://washbizhub.com"
    }
  },
  cleanbiTeam: {
    name: "CLEANBI Research Team",
    expertise: "Location Intelligence & Market Analysis",
    credentials: "Analyzed 10,000+ laundromat locations using proprietary 17-factor scoring methodology"
  }
};

// ============================================
// FAQ REGISTRY - Indexed by Topic/Page
// ============================================

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS: Record<string, FAQItem[]> = {
  larrysAcademy: [
    {
      question: "What is Larry's Academy?",
      answer: "Larry's Academy is WashBizHub's premier laundromat education program, taught by Larry Larsen who has 50+ years of industry experience and has designed over 135 laundromats. It covers everything from site selection to store design and operations."
    },
    {
      question: "Who is Larry Larsen?",
      answer: "Larry Larsen is a legendary figure in the laundromat industry with over 50 years of experience. He has personally designed and built out more than 135 laundromats across the United States, making him one of the most experienced professionals in store design and layout optimization."
    },
    {
      question: "How much does it cost to start a laundromat?",
      answer: "Starting a new laundromat typically costs between $200,000 and $1,000,000+ depending on location, size, and equipment choices. A retool (renovating existing store) ranges from $100,000-$400,000. Larry's Academy provides detailed cost breakdowns and budgeting frameworks for both scenarios."
    },
    {
      question: "What equipment should I choose for my laundromat?",
      answer: "The optimal equipment mix depends on your market demographics, store size, and business model. Larry's Academy covers the complete equipment selection process including washer/dryer sizing, hard-mount vs soft-mount options, payment systems, and vendor negotiations."
    },
    {
      question: "How do I find a good location for a laundromat?",
      answer: "Ideal laundromat locations have high-density housing (especially renters), visible street presence, adequate parking, and limited competition. Larry's Academy teaches comprehensive site selection using demographic analysis, traffic patterns, and the CLEANBI scoring system."
    },
    {
      question: "What is the typical ROI for a laundromat?",
      answer: "Well-run laundromats typically generate 20-35% cash-on-cash returns, with some premium locations exceeding 40%. Returns depend on location quality, operational efficiency, and initial investment. Larry's Academy provides realistic financial modeling frameworks."
    },
    {
      question: "Do I need laundromat experience to own one?",
      answer: "No prior experience is required, but education is essential. Larry's Academy is specifically designed for first-time owners, providing step-by-step guidance from industry veterans who have built successful operations from scratch."
    },
    {
      question: "How long does it take to open a new laundromat?",
      answer: "Opening a new laundromat typically takes 6-18 months from site selection to grand opening. The timeline includes lease negotiation (1-3 months), permits and construction (3-9 months), equipment installation (2-4 weeks), and pre-opening preparation (2-4 weeks)."
    }
  ],

  valuationCalculator: [
    {
      question: "How do you calculate laundromat value?",
      answer: "Laundromat value is calculated using four primary methods: Revenue Multiple (2.5-4.5x annual revenue), EBITDA Multiple (3.5-6.5x), Capitalization Rate (NOI ÷ Cap Rate), and Asset-Based (equipment + working capital). Professional appraisals typically average all four methods."
    },
    {
      question: "What is the average multiple for laundromats?",
      answer: "The average revenue multiple for laundromats is 3.0-3.5x annual gross revenue. EBITDA multiples typically range from 4.0-5.5x. Premium locations with modern equipment and strong financials can command multiples 15-25% above average."
    },
    {
      question: "What cap rate should I use for laundromat valuation?",
      answer: "Typical cap rates for laundromats range from 7-12%. Prime urban locations with favorable leases use 7-9% cap rates, while older stores in secondary markets may use 10-12%. Lower cap rates indicate lower risk and result in higher valuations."
    },
    {
      question: "What affects laundromat selling price the most?",
      answer: "The biggest value drivers are: documented financials (10-15% premium), lease terms (10+ years remaining adds significant value), equipment age (under 5 years ideal), location quality, and revenue stability. Stores with multiple revenue streams also command higher prices."
    },
    {
      question: "How much is a laundromat worth with $200k revenue?",
      answer: "A laundromat with $200,000 annual revenue is typically worth $500,000-$900,000 depending on profitability, location, and equipment condition. At a 3.25x revenue multiple and 50% margins, expect approximately $650,000. Use our calculator for a precise estimate based on your specific inputs."
    },
    {
      question: "Should I use revenue or EBITDA multiple for valuation?",
      answer: "EBITDA multiples are generally more accurate because they account for profitability, not just revenue. However, both methods should be used together. Revenue multiples are useful for quick comparisons, while EBITDA provides a better picture of operational efficiency and true value."
    }
  ],

  cleanbiExplorer: [
    {
      question: "What is CLEANBI?",
      answer: "CLEANBI is WashBizHub's proprietary location intelligence scoring system that evaluates laundromat opportunities using 17 weighted factors including demographics, competition, rent ratios, and market potential. Scores range from 0-100 with letter grades (A, B, C, or Needs Work)."
    },
    {
      question: "How accurate is the CLEANBI score?",
      answer: "CLEANBI scores are based on real data from census demographics, Google Maps, and market analysis. The methodology has been validated against 1,000+ actual laundromat performance data points with 85%+ correlation to success rates."
    },
    {
      question: "What factors does CLEANBI analyze?",
      answer: "CLEANBI evaluates 17 factors: Rent % Revenue (10%), EBITDA Margin (10%), Turns Per Day (10%), Market Saturation (8%), DSCR (8%), plus 12 additional factors including population density, renter percentage, median income, competition proximity, visibility, and parking."
    },
    {
      question: "What is a good CLEANBI score?",
      answer: "CLEANBI grades: A (85-100) = Excellent opportunity with strong fundamentals; B (70-84) = Good opportunity with solid potential; C (55-69) = Fair opportunity requiring careful analysis; Needs Work (below 55) = Challenging location requiring strategic improvements."
    },
    {
      question: "Can I save and compare CLEANBI analyses?",
      answer: "Yes, subscribers can save unlimited address analyses, compare multiple locations side-by-side, export PDF reports, and track how scores change over time as market conditions evolve."
    }
  ],

  homepage: [
    {
      question: "What is WashBizHub?",
      answer: "WashBizHub is the #1 laundromat resource and educational hub, providing business intelligence, valuation tools, the CLEANBI location scoring system, a marketplace for buying/selling laundromats, and educational content from industry veterans with 50+ years of experience."
    },
    {
      question: "Is WashBizHub free to use?",
      answer: "WashBizHub offers both free and premium tiers. Free users get 3 CLEANBI analyses per month, basic calculators, and access to educational content. Premium subscribers unlock unlimited analyses, advanced tools, PDF exports, and exclusive features."
    },
    {
      question: "Who created WashBizHub?",
      answer: "WashBizHub was founded by Nick Kremers, a laundromat industry analyst and former multi-unit operator. The platform features expert content from Larry Larsen (50+ years, 135+ stores designed) and a team of industry specialists."
    },
    {
      question: "How do I buy a laundromat?",
      answer: "WashBizHub's marketplace lists laundromats for sale across the US. Use CLEANBI to evaluate locations, our valuation calculator to assess fair prices, and connect with verified brokers through our directory. We also provide due diligence checklists and SBA loan readiness tools."
    },
    {
      question: "What makes WashBizHub different from other resources?",
      answer: "WashBizHub combines proprietary technology (CLEANBI scoring) with genuine industry expertise (Larry Larsen's 50+ years). Unlike generic business tools, everything is purpose-built for the laundromat industry with 80+ specialized calculators and formulas."
    },
    {
      question: "How do I contact WashBizHub for consulting?",
      answer: "For laundromat consulting, contact consult@washbizhub.com. Every consultation request is reviewed by Nick Kremers personally. You can also reach us at 479-883-4314 for urgent matters."
    },
    {
      question: "Does WashBizHub offer courses?",
      answer: "Yes, Larry's Academy provides comprehensive laundromat education covering site selection, store design, equipment selection, operations, and financial management. Courses are taught by Larry Larsen with 50+ years of hands-on experience."
    },
    {
      question: "Can I use WashBizHub for my existing laundromat?",
      answer: "Absolutely. WashBizHub serves both prospective buyers and current operators. Use our operator dashboard, POS system, machine booking, and diagnostic tools to optimize your existing operations and maximize profitability."
    }
  ],

  marketplace: [
    {
      question: "How do I list my laundromat for sale?",
      answer: "To list your laundromat on WashBizHub marketplace, visit our Sell page, complete the listing form with business details, and our team will review and publish your listing. Verified listings with complete financials receive priority placement."
    },
    {
      question: "Are marketplace listings verified?",
      answer: "WashBizHub verifies key details on premium listings including revenue claims, lease terms, and equipment age. Standard listings are seller-provided. Look for the 'Verified' badge when browsing listings."
    },
    {
      question: "How much does it cost to list a laundromat?",
      answer: "Basic listings are free. Premium verified listings with enhanced visibility, professional photos, and financial verification are available for a fee. Contact us for current pricing on premium listing packages."
    }
  ],

  calculators: [
    {
      question: "What calculators does WashBizHub offer?",
      answer: "WashBizHub offers 80+ specialized calculators including Valuation Calculator, ROI Calculator, SBA Loan Calculator, Break-Even Analysis, Cash Flow Projector, Equipment Cost Calculator, Utility Estimator, and What-If Scenario Modeling tools."
    },
    {
      question: "Are the calculators free?",
      answer: "Basic calculators are free with a WashBizHub account. Advanced calculators with PDF export, scenario saving, and detailed analysis are available to premium subscribers."
    },
    {
      question: "How accurate are the calculations?",
      answer: "WashBizHub calculators use industry-standard formulas validated by professionals with 50+ years of combined experience. Default values and ranges are based on actual market data from 1,000+ laundromat transactions."
    }
  ]
};

// ============================================
// SPEAKABLE CONTENT - Priority for Answer Engines
// ============================================

export const SPEAKABLE_CONTENT: Record<string, string[]> = {
  homepage: [
    "WashBizHub is the #1 laundromat resource and educational hub, providing business intelligence, valuation tools, and expert education from industry veterans.",
    "CLEANBI is our proprietary location intelligence system that scores laundromat opportunities using 17 data-driven factors.",
    "Larry's Academy offers comprehensive laundromat education from Larry Larsen, who has 50+ years experience and has designed 135+ stores."
  ],
  valuationCalculator: [
    "Laundromats are typically valued at 2.5 to 4.5 times annual revenue, or 3.5 to 6.5 times EBITDA.",
    "The four primary valuation methods are Revenue Multiple, EBITDA Multiple, Cap Rate, and Asset-Based approaches.",
    "Well-documented financials can increase laundromat value by 10 to 15 percent."
  ],
  cleanbi: [
    "CLEANBI scores range from 0 to 100, with grades A, B, C, or Needs Work indicating opportunity quality.",
    "An A-grade CLEANBI score of 85 or higher indicates an excellent laundromat opportunity with strong fundamentals.",
    "CLEANBI analyzes 17 weighted factors including rent percentage, EBITDA margin, market saturation, and demographics."
  ]
};

// ============================================
// INTERNAL LINKING TAXONOMY
// ============================================

export interface ContentTaxonomy {
  category: string;
  subcategory?: string;
  relatedTopics: string[];
  siblingPages: string[];
}

export const PAGE_TAXONOMY: Record<string, ContentTaxonomy> = {
  "/larrys-academy": {
    category: "Education",
    subcategory: "Training",
    relatedTopics: ["site-selection", "store-design", "equipment", "operations"],
    siblingPages: ["/laundromat-bible", "/resources", "/blog"]
  },
  "/valuation-calculator": {
    category: "Calculators",
    subcategory: "Financial",
    relatedTopics: ["business-valuation", "roi", "investment-analysis"],
    siblingPages: ["/roi-calculator", "/break-even-calculator", "/calculators"]
  },
  "/cleanbi-explorer": {
    category: "Tools",
    subcategory: "Location Intelligence",
    relatedTopics: ["site-selection", "market-analysis", "demographics"],
    siblingPages: ["/cleanbi-auto", "/laundromat-listings", "/marketplace"]
  },
  "/marketplace": {
    category: "Marketplace",
    relatedTopics: ["buying", "selling", "listings"],
    siblingPages: ["/buy-laundromat", "/sell-laundromat", "/broker-directory"]
  },
  "/calculators": {
    category: "Calculators",
    relatedTopics: ["financial-analysis", "roi", "valuation"],
    siblingPages: ["/valuation-calculator", "/roi-calculator", "/sba-loan-calculator"]
  }
};

// ============================================
// HELPER FUNCTIONS WITH VALIDATION
// ============================================

const DEFAULT_AUTHOR: AuthorProfile = {
  name: "WashBizHub Team",
  expertise: "Laundromat Industry Specialists",
  credentials: "Industry-leading laundromat business intelligence and education"
};

const DEFAULT_FAQ: FAQItem = {
  question: "What is WashBizHub?",
  answer: "WashBizHub is the #1 laundromat resource and educational hub, providing business intelligence, valuation tools, and expert education from industry veterans."
};

export type AuthorKey = keyof typeof AUTHORS;
export type FAQKey = keyof typeof FAQS;
export type SpeakableKey = keyof typeof SPEAKABLE_CONTENT;

export function getAuthor(key: AuthorKey): AuthorProfile {
  const author = AUTHORS[key];
  if (!author) {
    console.warn(`[SEO Registry] Author key "${key}" not found. Using default author.`);
    return DEFAULT_AUTHOR;
  }
  return author;
}

export function getFAQs(pageKey: FAQKey, limit?: number): FAQItem[] {
  const faqs = FAQS[pageKey];
  if (!faqs || faqs.length === 0) {
    console.warn(`[SEO Registry] FAQ key "${pageKey}" not found or empty. Using default FAQ.`);
    return [DEFAULT_FAQ];
  }
  return limit ? faqs.slice(0, limit) : faqs;
}

export function getSpeakableContent(pageKey: SpeakableKey): string[] {
  const content = SPEAKABLE_CONTENT[pageKey];
  if (!content || content.length === 0) {
    console.warn(`[SEO Registry] Speakable content key "${pageKey}" not found or empty.`);
    return [];
  }
  return content;
}

export function getRelatedPages(currentPath: string): string[] {
  const taxonomy = PAGE_TAXONOMY[currentPath];
  if (!taxonomy) {
    console.warn(`[SEO Registry] Page taxonomy for "${currentPath}" not found.`);
    return [];
  }
  return taxonomy.siblingPages;
}

export function getCategoryPages(category: string): string[] {
  return Object.entries(PAGE_TAXONOMY)
    .filter(([_, tax]) => tax.category === category)
    .map(([path]) => path);
}

export function validateRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  Object.keys(AUTHORS).forEach(key => {
    const author = AUTHORS[key as AuthorKey];
    if (!author.name) errors.push(`Author "${key}" missing name`);
    if (!author.expertise) errors.push(`Author "${key}" missing expertise`);
  });
  
  Object.keys(FAQS).forEach(key => {
    const faqs = FAQS[key as FAQKey];
    if (!faqs || faqs.length === 0) {
      errors.push(`FAQ key "${key}" is empty`);
    } else {
      faqs.forEach((faq, idx) => {
        if (!faq.question) errors.push(`FAQ "${key}[${idx}]" missing question`);
        if (!faq.answer) errors.push(`FAQ "${key}[${idx}]" missing answer`);
      });
    }
  });
  
  return { valid: errors.length === 0, errors };
}
