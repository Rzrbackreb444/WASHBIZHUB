/**
 * WashBizHub Comprehensive SEO Keyword Database
 * 
 * Master configuration for multi-keyword SEO strategy targeting:
 * - Primary money keywords (high purchase intent)
 * - Tool/feature keywords
 * - Long-tail educational keywords
 * - Local/geographic keywords
 * - Voice search / AEO queries
 * 
 * Based on industry research: $7.1B market, 35,000+ locations
 * Target: #1 rankings across laundromat vertical
 */

export interface SEOKeywordCluster {
  primary: string;
  secondary: string[];
  longTail: string[];
  questions: string[];
  relatedTools: string[];
}

export interface SEOPageConfig {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  primaryQuestion: string;
  directAnswer: string;
  faqs: Array<{ question: string; answer: string }>;
  breadcrumbs: Array<{ name: string; url: string }>;
}

export const SEO_KEYWORD_CLUSTERS: Record<string, SEOKeywordCluster> = {
  valuation: {
    primary: "laundromat valuation",
    secondary: [
      "laundromat value calculator",
      "how much is my laundromat worth",
      "coin laundry valuation",
      "laundromat appraisal",
      "laundry business value"
    ],
    longTail: [
      "laundromat valuation multiples 2024",
      "laundromat EBITDA multiple",
      "laundromat SDE multiple",
      "laundromat valuation formula",
      "fair market value laundromat",
      "what is a laundromat worth",
      "laundromat selling price calculator",
      "laundromat net operating income calculator"
    ],
    questions: [
      "How do you value a laundromat?",
      "What multiple do laundromats sell for?",
      "How much is my laundromat worth?",
      "What is the average EBITDA multiple for laundromats?",
      "How to calculate laundromat value?"
    ],
    relatedTools: ["valuation-calculator", "roi-calculator", "cleanbi-explorer"]
  },

  buyLaundromat: {
    primary: "buy laundromat",
    secondary: [
      "laundromat for sale",
      "laundromats for sale near me",
      "coin laundry for sale",
      "laundromat business for sale",
      "laundry business for sale"
    ],
    longTail: [
      "how to buy a laundromat",
      "laundromat for sale by owner",
      "laundromat listings",
      "laundromat broker",
      "buy laundromat with no money down",
      "laundromat acquisition",
      "turnkey laundromat for sale",
      "profitable laundromat for sale"
    ],
    questions: [
      "How do I buy a laundromat?",
      "Is buying a laundromat a good investment?",
      "Where can I find laundromats for sale?",
      "How much does it cost to buy a laundromat?",
      "What to look for when buying a laundromat?"
    ],
    relatedTools: ["buy-laundromat", "cleanbi-explorer", "funding"]
  },

  sellLaundromat: {
    primary: "sell laundromat",
    secondary: [
      "sell my laundromat",
      "how to sell a laundromat",
      "laundromat exit strategy",
      "list laundromat for sale"
    ],
    longTail: [
      "how to sell a laundromat business",
      "laundromat selling tips",
      "prepare laundromat for sale",
      "laundromat selling price",
      "laundromat business broker",
      "how long to sell a laundromat"
    ],
    questions: [
      "How do I sell my laundromat?",
      "What is the best way to sell a laundromat?",
      "How long does it take to sell a laundromat?",
      "Should I use a broker to sell my laundromat?"
    ],
    relatedTools: ["sell-your-laundromat", "valuation-calculator", "brokers"]
  },

  dueDiligence: {
    primary: "laundromat due diligence",
    secondary: [
      "laundromat due diligence checklist",
      "laundromat inspection",
      "buying laundromat checklist",
      "laundromat evaluation"
    ],
    longTail: [
      "laundromat due diligence questions",
      "what to check before buying laundromat",
      "laundromat financial due diligence",
      "laundromat equipment inspection checklist",
      "laundromat lease review",
      "laundromat utility verification"
    ],
    questions: [
      "What is laundromat due diligence?",
      "What should I check before buying a laundromat?",
      "How long does laundromat due diligence take?",
      "What documents do I need for laundromat due diligence?"
    ],
    relatedTools: ["cleanbi-explorer", "valuation-calculator", "buy-laundromat"]
  },

  locationAnalysis: {
    primary: "laundromat location analysis",
    secondary: [
      "laundromat site selection",
      "laundromat demographics",
      "best location for laundromat",
      "laundromat market analysis"
    ],
    longTail: [
      "laundromat demographic requirements",
      "how to find laundromat location",
      "laundromat competition analysis",
      "laundromat catchment area",
      "laundromat foot traffic analysis",
      "laundromat renter population analysis",
      "ideal laundromat demographics"
    ],
    questions: [
      "What demographics are best for laundromats?",
      "How do I analyze a laundromat location?",
      "What is a good renter percentage for laundromat?",
      "How far do laundromat customers travel?"
    ],
    relatedTools: ["cleanbi-explorer", "buy-laundromat"]
  },

  roi: {
    primary: "laundromat ROI",
    secondary: [
      "laundromat return on investment",
      "laundromat profit margins",
      "laundromat investment return",
      "laundromat cash flow"
    ],
    longTail: [
      "is a laundromat a good investment",
      "how much do laundromats make",
      "laundromat passive income",
      "laundromat income potential",
      "average laundromat profit",
      "laundromat profit per machine",
      "laundromat annual revenue"
    ],
    questions: [
      "What is the average ROI for a laundromat?",
      "How much profit does a laundromat make?",
      "Are laundromats still profitable in 2024?",
      "What is a good cap rate for a laundromat?"
    ],
    relatedTools: ["roi-calculator", "valuation-calculator", "cleanbi-explorer"]
  },

  startup: {
    primary: "how to start a laundromat",
    secondary: [
      "laundromat startup costs",
      "open a laundromat",
      "start laundromat business",
      "laundromat business plan"
    ],
    longTail: [
      "starting a laundromat with no money",
      "laundromat startup guide",
      "build vs buy laundromat",
      "laundromat franchise cost",
      "self service laundry business",
      "laundromat construction costs",
      "how much to build a laundromat"
    ],
    questions: [
      "How much does it cost to start a laundromat?",
      "How do I start a laundromat business?",
      "Is it better to buy or build a laundromat?",
      "What permits do I need for a laundromat?"
    ],
    relatedTools: ["business-plan-generator", "funding", "cleanbi-explorer"]
  },

  financing: {
    primary: "laundromat financing",
    secondary: [
      "laundromat loan",
      "SBA loan laundromat",
      "laundromat equipment financing",
      "laundromat business loan"
    ],
    longTail: [
      "how to finance a laundromat",
      "laundromat startup funding",
      "commercial laundry business loan",
      "laundromat acquisition loan",
      "no money down laundromat financing",
      "SBA 7a loan laundromat",
      "laundromat seller financing"
    ],
    questions: [
      "How do I finance a laundromat purchase?",
      "Can I get an SBA loan for a laundromat?",
      "What down payment do I need for a laundromat?",
      "What credit score do I need for laundromat financing?"
    ],
    relatedTools: ["sba-readiness", "funding", "loan-calculator"]
  },

  equipment: {
    primary: "commercial laundry equipment",
    secondary: [
      "laundromat equipment",
      "commercial washer",
      "commercial dryer",
      "coin operated washer"
    ],
    longTail: [
      "best commercial washer for laundromat",
      "Speed Queen commercial washer price",
      "Dexter laundry equipment",
      "used laundromat equipment",
      "laundromat equipment cost",
      "washer extractor price",
      "commercial washer dryer combo"
    ],
    questions: [
      "What is the best equipment for a laundromat?",
      "How much does commercial laundry equipment cost?",
      "Should I buy new or used laundromat equipment?",
      "What brand of washer is best for laundromats?"
    ],
    relatedTools: ["equipment-marketplace", "equipment-diagnostics", "parts"]
  },

  repair: {
    primary: "laundromat equipment repair",
    secondary: [
      "commercial washer repair",
      "commercial dryer repair",
      "laundromat troubleshooting",
      "coin laundry repair"
    ],
    longTail: [
      "Speed Queen error codes",
      "Dexter error codes",
      "commercial washer not draining",
      "dryer not heating troubleshooting",
      "washer not spinning fix",
      "coin mechanism repair",
      "commercial laundry preventive maintenance"
    ],
    questions: [
      "How do I fix a commercial washer?",
      "What do laundromat error codes mean?",
      "How often should laundromat equipment be serviced?",
      "How to troubleshoot commercial dryer not heating?"
    ],
    relatedTools: ["service-guy-ai", "error-codes", "equipment-diagnostics"]
  },

  utilities: {
    primary: "laundromat utility costs",
    secondary: [
      "laundromat operating costs",
      "cost per load calculator",
      "laundromat water usage",
      "laundromat electric bill"
    ],
    longTail: [
      "utilities as percent of gross laundromat",
      "reduce laundromat utility bills",
      "laundromat gas costs",
      "water cost per wash",
      "energy efficient laundromat equipment",
      "laundromat utility audit"
    ],
    questions: [
      "What percentage of revenue goes to utilities in a laundromat?",
      "How can I reduce my laundromat utility costs?",
      "How much water does a laundromat use?",
      "What is the average electric bill for a laundromat?"
    ],
    relatedTools: ["utility-calculator", "utility-bill-auditor", "cleanbi-explorer"]
  },

  consulting: {
    primary: "laundromat consultant",
    secondary: [
      "laundromat consulting",
      "laundromat business consulting",
      "coin laundry consultant",
      "laundromat expert"
    ],
    longTail: [
      "laundromat consulting services",
      "hire laundromat consultant",
      "laundromat acquisition consultant",
      "laundromat operations consultant",
      "laundromat growth consultant"
    ],
    questions: [
      "Do I need a laundromat consultant?",
      "How much does laundromat consulting cost?",
      "What does a laundromat consultant do?",
      "How to find a good laundromat consultant?"
    ],
    relatedTools: ["consultation", "ai-consultation-council", "cleanbi-explorer"]
  }
};

export const SEO_LANDING_PAGES: SEOPageConfig[] = [
  {
    slug: "/laundromat-valuation",
    title: "Laundromat Valuation Calculator - Free Business Appraisal Tool",
    h1: "Free Laundromat Valuation Calculator",
    description: "Calculate your laundromat's value instantly with our free valuation tool. Uses industry-standard EBITDA and SDE multiples. Trusted by 2,400+ operators. Get your business appraisal in minutes.",
    keywords: ["laundromat valuation", "laundromat value calculator", "how much is my laundromat worth", "coin laundry valuation", "laundromat appraisal", "laundromat EBITDA multiple", "laundromat selling price"],
    primaryQuestion: "How much is my laundromat worth?",
    directAnswer: "Laundromats typically sell for 2.6x to 4.0x their annual Seller's Discretionary Earnings (SDE), with a median of 3.5x. Our free calculator uses industry-standard valuation methods including NOI multiples, equipment depreciation, and lease analysis to provide an accurate estimate.",
    faqs: [
      { question: "What multiple do laundromats sell for?", answer: "Laundromats typically sell for 2.6x to 4.0x annual SDE, with a median of 3.5x. Premium locations with new equipment and long leases can command 4x or higher." },
      { question: "How do you calculate laundromat value?", answer: "The most common method is: Annual Net Operating Income × Multiple. Multiples range from 2.5x to 5x depending on equipment condition, lease terms, location quality, and growth potential." },
      { question: "What factors increase laundromat value?", answer: "Long-term favorable lease (10+ years), modern equipment (under 5 years old), high-traffic location, low competition, wash-and-fold services, and strong financial records." },
      { question: "What is a good EBITDA for a laundromat?", answer: "A healthy laundromat should have an EBITDA margin of 20-35%. Premium operations can achieve 40%+ EBITDA through optimized pricing, low overhead, and additional services." }
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Calculators", url: "/calculators" },
      { name: "Valuation Calculator", url: "/laundromat-valuation" }
    ]
  },
  {
    slug: "/laundromat-for-sale",
    title: "Laundromats For Sale - Find Verified Laundromat Listings | WashBizHub",
    h1: "Laundromats For Sale Near You",
    description: "Browse 500+ verified laundromat listings for sale. CLEANBI-analyzed locations with financial data, competition mapping, and due diligence reports. The #1 marketplace for buying laundromats.",
    keywords: ["laundromat for sale", "buy laundromat", "laundromats for sale near me", "coin laundry for sale", "laundromat business for sale", "laundromat listings", "laundromat broker"],
    primaryQuestion: "Where can I find laundromats for sale?",
    directAnswer: "WashBizHub features 500+ verified laundromat listings for sale across the United States. Each listing includes CLEANBI location scoring, financial projections, competition analysis, and broker contact information. Filter by price, location, revenue, and investment potential.",
    faqs: [
      { question: "How much does a laundromat cost to buy?", answer: "Laundromat purchase prices typically range from $200,000 for small operations to $1,000,000+ for large, prime locations. The average is $300,000-$500,000 with typical down payments of 20-30%." },
      { question: "Is buying a laundromat a good investment?", answer: "Yes, laundromats offer 20-35% cash-on-cash returns with relatively passive income. The industry has an 85-95% survival rate and is recession-resistant since people always need clean clothes." },
      { question: "What should I look for when buying a laundromat?", answer: "Key factors: location demographics (40%+ renters), equipment age/condition, lease terms, utility costs, competition within 2 miles, and verified financial records. Use our CLEANBI analysis tool." },
      { question: "Can I buy a laundromat with no money down?", answer: "While rare, some sellers offer financing. More commonly, SBA loans require 10-20% down. Explore our funding marketplace for competitive financing options." }
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Marketplace", url: "/marketplace" },
      { name: "Laundromats For Sale", url: "/laundromat-for-sale" }
    ]
  },
  {
    slug: "/laundromat-due-diligence",
    title: "Laundromat Due Diligence Checklist - Complete Buyer's Guide",
    h1: "Complete Laundromat Due Diligence Checklist",
    description: "Free laundromat due diligence checklist with 100+ verification items. Analyze financials, equipment, lease terms, utilities, and location. Avoid costly mistakes when buying a laundromat.",
    keywords: ["laundromat due diligence", "laundromat due diligence checklist", "buying laundromat checklist", "laundromat inspection", "laundromat evaluation", "what to check before buying laundromat"],
    primaryQuestion: "What is laundromat due diligence?",
    directAnswer: "Laundromat due diligence is the comprehensive investigation process before purchasing a laundry business. It includes verifying financial records, inspecting equipment, reviewing lease terms, analyzing utility costs, and assessing location demographics. Proper due diligence takes 30-60 days and can save you from a $50,000+ mistake.",
    faqs: [
      { question: "How long does laundromat due diligence take?", answer: "Typically 30-60 days. This includes time for document review, equipment inspection, utility verification, and financial analysis. Don't rush - thorough due diligence protects your investment." },
      { question: "What documents do I need for due diligence?", answer: "Request 3 years of tax returns, P&L statements, utility bills, equipment maintenance records, lease agreement, and coin collection logs or card reader reports." },
      { question: "What are red flags in laundromat due diligence?", answer: "Major red flags: seller won't provide financials, revenue doesn't match utility usage, short lease remaining, deferred equipment maintenance, declining neighborhood, or hidden expenses." },
      { question: "Should I hire a professional for due diligence?", answer: "While not required, hiring an experienced laundromat consultant can identify issues you might miss. Use our CLEANBI tool for automated location and competition analysis." }
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Resources", url: "/resources" },
      { name: "Due Diligence Guide", url: "/laundromat-due-diligence" }
    ]
  },
  {
    slug: "/laundromat-location-analysis",
    title: "Laundromat Location Analysis Tool - CLEANBI Demographics & Competition",
    h1: "Free Laundromat Location Analysis",
    description: "Analyze any laundromat location with CLEANBI scoring. Get demographics, competition mapping, traffic patterns, and investment grades. Used by 2,400+ investors to find profitable locations.",
    keywords: ["laundromat location analysis", "laundromat site selection", "laundromat demographics", "best location for laundromat", "laundromat market analysis", "CLEANBI score"],
    primaryQuestion: "How do I analyze a laundromat location?",
    directAnswer: "CLEANBI analyzes 6 key factors: Demographics (renter %, income levels), Competition (distance to competitors), Traffic (foot traffic, visibility), Accessibility (parking, transit), Economics (local employment, housing), and Location Quality (safety, growth trends). Each factor is weighted and combined into an A-C grade or 'Needs Work' rating.",
    faqs: [
      { question: "What demographics are best for laundromats?", answer: "Ideal demographics: 40-50%+ renter population, household income $15K-$50K, high population density, household size 2.3+, and proximity to apartments or mobile home parks." },
      { question: "How far should laundromats be from competitors?", answer: "Ideally 1+ miles from the nearest competitor. Within a 3-mile radius, analyze competitor quality, pricing, and service gaps you can fill." },
      { question: "What is a good CLEANBI score?", answer: "A = 85+ (Excellent opportunity), B = 70-84 (Good opportunity), C = 55-69 (Fair opportunity). Below 55 needs strategic improvements." },
      { question: "How far do laundromat customers travel?", answer: "60-70% of customers live within 1-2 miles of the laundromat. Urban locations have smaller service radiuses than suburban locations." }
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Tools", url: "/products" },
      { name: "Location Analysis", url: "/laundromat-location-analysis" }
    ]
  },
  {
    slug: "/laundromat-roi-calculator",
    title: "Laundromat ROI Calculator - Investment Return & Profit Analysis",
    h1: "Free Laundromat ROI Calculator",
    description: "Calculate laundromat return on investment, cash flow, and payback period. Industry benchmarks for profit margins, cap rates, and cash-on-cash returns. Make data-driven investment decisions.",
    keywords: ["laundromat ROI", "laundromat return on investment", "laundromat profit calculator", "laundromat cash flow", "laundromat investment return", "laundromat profit margins"],
    primaryQuestion: "What is the average ROI for a laundromat?",
    directAnswer: "Laundromats typically generate 20-35% annual ROI with cash-on-cash returns of 15-25%. Well-run operations can achieve 30-40% returns. The average payback period is 3-5 years. Our calculator factors in purchase price, operating expenses, financing costs, and equipment depreciation.",
    faqs: [
      { question: "How much profit does a laundromat make?", answer: "Average laundromat generates $5,000-$25,000+ monthly net income depending on size and location. Profit margins typically range from 20-35% of gross revenue." },
      { question: "Are laundromats still profitable in 2024?", answer: "Yes, laundromats remain highly profitable with recession-resistant demand. The $7.1B industry has shown consistent growth with 85-95% business survival rates." },
      { question: "What is a good cap rate for a laundromat?", answer: "Good cap rates range from 8-15%. Higher cap rates indicate higher risk/reward, while lower cap rates suggest stable, lower-risk investments." },
      { question: "How much can I make with a laundromat?", answer: "Owner-operators typically earn $40,000-$150,000+ annually depending on location, size, and additional services like wash-and-fold." }
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Calculators", url: "/calculators" },
      { name: "ROI Calculator", url: "/laundromat-roi-calculator" }
    ]
  },
  {
    slug: "/laundromat-financing",
    title: "Laundromat Financing & SBA Loans - Complete Funding Guide",
    h1: "Laundromat Financing Options",
    description: "Get SBA loans, equipment financing, and acquisition funding for your laundromat. Compare lenders, check eligibility, and get pre-approved. $50K-$5M funding available.",
    keywords: ["laundromat financing", "laundromat loan", "SBA loan laundromat", "laundromat equipment financing", "laundromat business loan", "laundromat acquisition loan"],
    primaryQuestion: "How do I finance a laundromat purchase?",
    directAnswer: "Common laundromat financing options include SBA 7(a) loans (10-20% down, up to $5M), SBA 504 loans for real estate, conventional bank loans, equipment financing, and seller financing. Our funding marketplace connects you with lenders specializing in laundromat acquisitions.",
    faqs: [
      { question: "Can I get an SBA loan for a laundromat?", answer: "Yes, SBA 7(a) loans are popular for laundromat acquisitions. They require 10-20% down payment, good credit (680+), and relevant business experience. Maximum loan is $5 million." },
      { question: "What down payment do I need for a laundromat?", answer: "Typical down payments range from 10-30%. SBA loans require 10-20%, while conventional loans may require 25-30%. Some sellers offer financing with lower down payments." },
      { question: "What credit score do I need for laundromat financing?", answer: "Most lenders require 680+ for SBA loans. Conventional loans may require 700+. Equipment financing can be more flexible with scores as low as 600." },
      { question: "How long does laundromat financing take?", answer: "SBA loans take 30-90 days. Conventional loans: 2-4 weeks. Equipment financing can be approved in days. Get pre-approved before making offers." }
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Funding", url: "/funding" },
      { name: "Laundromat Financing", url: "/laundromat-financing" }
    ]
  },
  {
    slug: "/laundromat-equipment-repair",
    title: "Laundromat Equipment Repair Guide - Error Codes & Troubleshooting",
    h1: "Laundromat Equipment Repair & Troubleshooting",
    description: "Complete laundromat repair guide with 15,000+ error codes for Speed Queen, Dexter, Maytag, and more. Troubleshoot commercial washers and dryers. Service Guy AI diagnostics included.",
    keywords: ["laundromat equipment repair", "commercial washer repair", "Speed Queen error codes", "Dexter error codes", "commercial dryer repair", "laundromat troubleshooting"],
    primaryQuestion: "How do I fix a commercial washer?",
    directAnswer: "Use Service Guy AI to diagnose your commercial washer issue. Enter the error code or describe symptoms to get step-by-step repair instructions, parts needed, and estimated costs. Our database covers 15,000+ error codes for all major brands including Speed Queen, Dexter, Maytag, and Continental.",
    faqs: [
      { question: "What do laundromat error codes mean?", answer: "Error codes indicate specific machine faults. For example, E1 often means a water inlet issue, E2 indicates drain problems, and E3 relates to motor/spin issues. Use our error code lookup tool for exact meanings." },
      { question: "How often should laundromat equipment be serviced?", answer: "Preventive maintenance should be performed monthly. This includes cleaning lint traps, checking belts, inspecting door seals, and testing safety mechanisms. Full service quarterly or every 500 cycles." },
      { question: "Should I repair or replace old laundromat equipment?", answer: "If repair costs exceed 50% of replacement value, or equipment is 15+ years old, replacement is usually better. New equipment is more efficient and reduces utility costs by 25-40%." },
      { question: "How to troubleshoot a commercial dryer not heating?", answer: "Check: 1) Gas supply/igniter (gas dryers), 2) Heating element (electric), 3) Thermal fuse, 4) Thermostats, 5) Airflow restrictions. Use Service Guy AI for detailed diagnostics." }
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Tools", url: "/products" },
      { name: "Equipment Repair", url: "/laundromat-equipment-repair" }
    ]
  },
  {
    slug: "/how-to-start-laundromat",
    title: "How to Start a Laundromat Business - Complete 2024 Guide",
    h1: "How to Start a Laundromat Business",
    description: "Step-by-step guide to starting a laundromat from scratch. Covers startup costs ($200K-$1M), location selection, equipment, financing, permits, and operations. Build vs buy analysis included.",
    keywords: ["how to start a laundromat", "laundromat startup costs", "open a laundromat", "start laundromat business", "laundromat business plan", "laundromat startup guide"],
    primaryQuestion: "How much does it cost to start a laundromat?",
    directAnswer: "Starting a laundromat costs $200,000-$1,000,000+ depending on location and size. Building from scratch: $500K-$1M (includes construction, equipment, permits). Buying existing: $200K-$750K. Key costs: equipment ($100K-$400K), leasehold improvements ($50K-$200K), and working capital ($25K-$50K).",
    faqs: [
      { question: "How do I start a laundromat business?", answer: "1) Research the market and location, 2) Create a business plan, 3) Secure financing, 4) Find a location, 5) Purchase equipment, 6) Get permits and licenses, 7) Set up operations, 8) Launch and market." },
      { question: "Is it better to buy or build a laundromat?", answer: "Buying existing is faster and less risky - you get proven cash flow. Building from scratch costs more and takes 12-18 months but lets you design the perfect location. Most first-time owners buy existing." },
      { question: "What permits do I need for a laundromat?", answer: "Required: business license, sales tax permit, zoning approval, building permits (if renovating), health department approval, and coin-operated device license in some states." },
      { question: "Can I start a laundromat with no money?", answer: "Difficult but possible through partnerships, seller financing, or SBA loans (require 10% down). Having $50K-$100K in capital significantly improves your options." }
    ],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Resources", url: "/resources" },
      { name: "Startup Guide", url: "/how-to-start-laundromat" }
    ]
  }
];

export const LONG_TAIL_KEYWORDS: Record<string, string[]> = {
  location: [
    "laundromat for sale california",
    "laundromat for sale texas",
    "laundromat for sale florida",
    "laundromat for sale new york",
    "laundromat for sale los angeles",
    "laundromat for sale chicago",
    "laundromat for sale houston",
    "laundromat for sale phoenix",
    "laundromat for sale atlanta",
    "laundromat for sale miami"
  ],
  equipment: [
    "Speed Queen commercial washer",
    "Dexter laundry equipment",
    "Maytag commercial dryer",
    "Continental washer extractor",
    "Huebsch laundry equipment",
    "Wascomat washer",
    "IPSO commercial washer",
    "Alliance laundry equipment",
    "Electrolux commercial laundry",
    "LG commercial washer"
  ],
  services: [
    "wash and fold laundromat",
    "pickup and delivery laundry service",
    "coin operated laundromat",
    "card operated laundromat",
    "24 hour laundromat",
    "self service laundry",
    "laundromat with wifi",
    "laundromat with TV",
    "attended laundromat",
    "unattended laundromat"
  ]
};

export function getSEOPageConfig(slug: string): SEOPageConfig | undefined {
  return SEO_LANDING_PAGES.find(page => page.slug === slug);
}

export function getKeywordCluster(category: string): SEOKeywordCluster | undefined {
  return SEO_KEYWORD_CLUSTERS[category];
}

export function getAllKeywords(): string[] {
  const allKeywords: Set<string> = new Set();
  
  Object.values(SEO_KEYWORD_CLUSTERS).forEach(cluster => {
    allKeywords.add(cluster.primary);
    cluster.secondary.forEach(k => allKeywords.add(k));
    cluster.longTail.forEach(k => allKeywords.add(k));
  });
  
  Object.values(LONG_TAIL_KEYWORDS).forEach(keywords => {
    keywords.forEach(k => allKeywords.add(k));
  });
  
  return Array.from(allKeywords);
}
