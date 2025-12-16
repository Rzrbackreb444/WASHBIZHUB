/**
 * THE LAUNDROMAT BIBLE
 * Three Generations' Guide to a Profitable Laundry Empire
 * By Nicholas "Stroked-Out Sasquatch" Kremers with Contributions by Lawrence "Laundromat Larry" Larsen
 * 
 * WashBizHub Premium Content - Copyright © 2025 Stroke Lyfe Inc.
 */

export interface BibleChapter {
  id: string;
  part: number;
  partTitle: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  description: string;
  keyTopics: string[];
  isPremium: boolean;
  estimatedReadTime: string;
}

export interface BibleAppendix {
  id: string;
  letter: string;
  title: string;
  description: string;
  isPremium: boolean;
}

export const bibleMetadata = {
  title: "The Laundromat Bible",
  subtitle: "Three Generations' Guide to a Profitable Laundry Empire",
  authors: [
    {
      name: "Nicholas 'Stroked-Out Sasquatch' Kremers",
      role: "Primary Author",
      bio: "Third-generation laundromat expert, stroke survivor, and leader of a 70k-member Facebook community for laundromat operators."
    },
    {
      name: "Lawrence 'Laundromat Larry' Larsen",
      role: "Contributing Author",
      bio: "50+ years owning, building, and consulting on laundromats via laundromat123.com. Industry legend and WashBizHub partner."
    }
  ],
  publisher: "Stroke Lyfe Publishing",
  copyright: "© 2025 Stroke Lyfe Inc.",
  website: "WashBizHub.com",
  tagline: "Apply this, wash away the BS, build wealth."
};

export const bibleChapters: BibleChapter[] = [
  // PART I: FOUNDATIONS OF A LAUNDRY EMPIRE
  {
    id: "ch-1",
    part: 1,
    partTitle: "Foundations of a Laundry Empire",
    chapterNumber: 1,
    title: "Three-Generation Blueprint",
    subtitle: "Evolution and Myths",
    description: "Kremers legacy, laundromat history from 1934 to today, debunked myths about 'passive income', and industry trends with practical pillars.",
    keyTopics: ["Kremers Family Legacy", "Laundromat Industry History", "Common Myths Debunked", "Industry Trends 2025", "Three Pillars of Success"],
    isPremium: false,
    estimatedReadTime: "15 min"
  },
  {
    id: "ch-2",
    part: 1,
    partTitle: "Foundations of a Laundry Empire",
    chapterNumber: 2,
    title: "Truth About Laundromats",
    subtitle: "Competitive Intelligence",
    description: "Strategies for analyzing competitors, leveraging real-time data, and optimizing market positioning. Learn why first-time buyers fail.",
    keyTopics: ["Competitive Analysis", "Market Research", "Economics of Laundromats", "Net Margins 30-40%", "Intel Checklist"],
    isPremium: false,
    estimatedReadTime: "20 min"
  },
  {
    id: "ch-3",
    part: 1,
    partTitle: "Foundations of a Laundry Empire",
    chapterNumber: 3,
    title: "Location Is Law",
    subtitle: "Demographics and CLEANBI Scoring",
    description: "Site selection criteria, demographic analysis, and the CLEANBI scoring system for decision-making. Location determines 80% of your success.",
    keyTopics: ["C.L.E.A.N. Principle", "CLEANBI Formula", "Demographic Analysis", "Red Flags to Avoid", "1,500 Renters/Mile Rule"],
    isPremium: true,
    estimatedReadTime: "25 min"
  },
  {
    id: "ch-4",
    part: 1,
    partTitle: "Foundations of a Laundry Empire",
    chapterNumber: 4,
    title: "Lease Logic",
    subtitle: "Negotiation and Trap Avoidance",
    description: "Bad lease = slow death. Lease essentials, negotiation tactics, and common pitfalls to safeguard profitability.",
    keyTopics: ["10+ Year Terms", "Rent <25% Revenue", "Triple Net Clarity", "TI Allowance", "Lease Traps"],
    isPremium: true,
    estimatedReadTime: "20 min"
  },
  
  // PART II: BUILDING THE MACHINE
  {
    id: "ch-5",
    part: 2,
    partTitle: "Building the Machine",
    chapterNumber: 5,
    title: "Equipment Intelligence",
    subtitle: "Brands, Specs, Diagnostics",
    description: "Comprehensive brand reviews (Speed Queen, Dexter, Huebsch, Continental Girbau), equipment specifications, diagnostic guides, and distributor networks.",
    keyTopics: ["Brand Comparison", "Speed Queen vs Dexter", "Diagnostic Codes", "Equipment Urgency Score", "Distributor Network"],
    isPremium: true,
    estimatedReadTime: "30 min"
  },
  {
    id: "ch-6",
    part: 2,
    partTitle: "Building the Machine",
    chapterNumber: 6,
    title: "Design and Flow",
    subtitle: "Optimizing Layouts",
    description: "Layout planning, flow optimization, and design considerations for efficiency and customer experience. Engineer your floor like a machine.",
    keyTopics: ["Store Layout Patterns", "Customer Flow", "LED Lighting", "WiFi & Charging", "Small/Medium/Large Layouts"],
    isPremium: true,
    estimatedReadTime: "20 min"
  },
  {
    id: "ch-7",
    part: 2,
    partTitle: "Building the Machine",
    chapterNumber: 7,
    title: "Funding the Empire",
    subtitle: "From SBA to Crypto",
    description: "Diverse funding options including SBA 7(a), Dexter Financial, seller financing, and creative strategies. No cash, no empire.",
    keyTopics: ["SBA 7(a) Loans", "Seller Financing", "Equipment Financing", "Creative Funding", "Debt-to-Income Rules"],
    isPremium: true,
    estimatedReadTime: "25 min"
  },
  {
    id: "ch-8",
    part: 2,
    partTitle: "Building the Machine",
    chapterNumber: 8,
    title: "Operations Mastery",
    subtitle: "Efficiency, POS, Maintenance",
    description: "Operational efficiency techniques, point-of-sale systems comparison, maintenance protocols, and key metrics like TPD, EBITDA, and DSCR.",
    keyTopics: ["TPD (Turns Per Day)", "EBITDA Calculation", "DSCR Formula", "POS Systems", "Maintenance Protocols"],
    isPremium: true,
    estimatedReadTime: "30 min"
  },
  
  // PART III: SCALING AND LEGACY
  {
    id: "ch-9",
    part: 3,
    partTitle: "Scaling and Legacy",
    chapterNumber: 9,
    title: "Staffing and Systems",
    subtitle: "Automation to Attendants",
    description: "Staffing ratios, system automation, checklists, and leadership strategies for operational scalability.",
    keyTopics: ["1 Attendant/1,500 sq ft", "Opening/Closing Checklists", "Automation Tools", "Manager Training", "Bonus Systems"],
    isPremium: true,
    estimatedReadTime: "20 min"
  },
  {
    id: "ch-10",
    part: 3,
    partTitle: "Scaling and Legacy",
    chapterNumber: 10,
    title: "Marketing That Wins",
    subtitle: "Digital and Community",
    description: "Digital marketing tactics, community engagement, and loyalty programs for growth. Trust over gimmicks.",
    keyTopics: ["Google Business Profile", "Review Strategy", "Loyalty Programs", "Community Sponsorships", "Social Media"],
    isPremium: true,
    estimatedReadTime: "20 min"
  },
  {
    id: "ch-11",
    part: 3,
    partTitle: "Scaling and Legacy",
    chapterNumber: 11,
    title: "Optimized Success Doctrine",
    subtitle: "C.L.E.A.N., W.A.S.H., S.O.A.P., D.R.Y.",
    description: "Detailed explanation of the four Kremers doctrines with practical applications for success.",
    keyTopics: ["C.L.E.A.N. Doctrine", "W.A.S.H. Doctrine", "S.O.A.P. Doctrine", "D.R.Y. Doctrine", "Application Examples"],
    isPremium: true,
    estimatedReadTime: "25 min"
  },
  {
    id: "ch-12",
    part: 3,
    partTitle: "Scaling and Legacy",
    chapterNumber: 12,
    title: "Scaling Smart",
    subtitle: "Multi-Store and Valuations",
    description: "Multi-store expansion strategies, valuation methodologies, and hybrid model integration.",
    keyTopics: ["Multi-Store Operations", "Valuation Methods", "Cap Rate Analysis", "Portfolio Building", "Hybrid Models"],
    isPremium: true,
    estimatedReadTime: "25 min"
  },
  {
    id: "ch-13",
    part: 3,
    partTitle: "Scaling and Legacy",
    chapterNumber: 13,
    title: "Exit or Legacy",
    subtitle: "Selling or Passing On",
    description: "Exit planning, valuation maximization, and legacy-building techniques for long-term impact.",
    keyTopics: ["Exit Planning", "Valuation Maximization", "Broker vs FSBO", "Family Succession", "Business Continuity"],
    isPremium: true,
    estimatedReadTime: "20 min"
  },
  
  // PART IV: FUTURE OF LAUNDROMATS
  {
    id: "ch-14",
    part: 4,
    partTitle: "Future of Laundromats",
    chapterNumber: 14,
    title: "Trends to 2035",
    subtitle: "AI, Eco, Hybrids",
    description: "Future trends including AI integration, eco-innovations, and hybrid models with strategic forecasts.",
    keyTopics: ["AI in Laundromats", "Eco-Friendly Tech", "Hybrid Business Models", "Industry Forecasts", "Technology Adoption"],
    isPremium: true,
    estimatedReadTime: "20 min"
  }
];

export const bibleAppendices: BibleAppendix[] = [
  {
    id: "app-a",
    letter: "A",
    title: "Kremers Doctrine (Optimized)",
    description: "Expanded definitions and applications of the Kremers family doctrines.",
    isPremium: true
  },
  {
    id: "app-b",
    letter: "B",
    title: "Funding and Lender Index",
    description: "Comprehensive list of funding sources and lender contacts.",
    isPremium: true
  },
  {
    id: "app-c",
    letter: "C",
    title: "Due Diligence Checklist",
    description: "Detailed checklist for evaluating potential laundromat investments.",
    isPremium: true
  },
  {
    id: "app-d",
    letter: "D",
    title: "CLEANBI and Valuation Formulas",
    description: "Mathematical models and practical examples for assessment and valuation.",
    isPremium: true
  },
  {
    id: "app-e",
    letter: "E",
    title: "WashBizHub Platform Guide",
    description: "Guide to utilizing WashBizHub.com tools and consulting services.",
    isPremium: false
  },
  {
    id: "app-f",
    letter: "F",
    title: "Industry Resources",
    description: "Curated list of industry organizations and educational platforms.",
    isPremium: false
  },
  {
    id: "app-g",
    letter: "G",
    title: "Equipment Specs and Distributors",
    description: "Detailed equipment specifications and regional distributor contacts.",
    isPremium: true
  },
  {
    id: "app-h",
    letter: "H",
    title: "Franchise Faux Pas",
    description: "Analysis of franchise pitfalls and advantages of independent operation.",
    isPremium: true
  }
];

export const cleanbiFormula = {
  description: "CLEANBI = 0.22 × MarketScore + 0.22 × FinancialScore + 0.14 × LeaseScore + 0.14 × CompetitionScore + 0.12 × EquipmentScore + 0.08 × UtilitiesScore + 0.08 × ReadinessScore",
  grades: [
    { grade: "A", range: "85-100", meaning: "Invest - Elite opportunity" },
    { grade: "B", range: "70-84", meaning: "Negotiate - Good opportunity" },
    { grade: "C", range: "55-69", meaning: "Fix - Fair opportunity" },
    { grade: "Needs Work", range: "<55", meaning: "High risk - Strategic improvements required" }
  ]
};

export const keyMetrics = {
  tpd: {
    name: "Turns Per Day (TPD)",
    description: "Cycles per washer per day",
    formula: "Revenue = TPD × vend price × days (350-365)",
    target: "4.5 urban, 4 rural"
  },
  ebitda: {
    name: "EBITDA",
    description: "Earnings Before Interest, Taxes, Depreciation, and Amortization",
    formula: "NOI = revenue - (utilities + labor + rent + maintenance). Margin = EBITDA/revenue (>20%)",
    target: ">20% margin"
  },
  dscr: {
    name: "Debt Service Coverage Ratio (DSCR)",
    description: "Ability to service debt from operating income",
    formula: "DSCR = NOI / (PMT × 12)",
    target: ">1.25 safe"
  }
};

export const equipmentBrands = [
  { name: "Speed Queen", pros: "20-25yr life, high resale", cons: "Pricier ($5,500-$8,000)", bestFor: "High-volume stores" },
  { name: "Dexter", pros: "Durable, Dexter Live cloud", cons: "Repair delays ($4,500-$6,500)", bestFor: "Reliable operations" },
  { name: "Huebsch", pros: "Value, Speed Queen parts", cons: "Less resale ($4,800-$7,200)", bestFor: "Budget-conscious" },
  { name: "Continental Girbau", pros: "Eco, low water (18 gal)", cons: "Costly ($12,000-$22,000)", bestFor: "Green markets" },
  { name: "Electrolux/Wascomat", pros: "Upscale", cons: "Parts cost ($6,000-$9,000)", bestFor: "High-end stores" },
  { name: "Maytag", pros: "Reliable", cons: "Shorter life ($2,800-$3,500)", bestFor: "Starters" },
  { name: "B&C", pros: "Cheap ($3,000-$5,000)", cons: "Less durable", bestFor: "Low-budget" },
  { name: "LG", pros: "Efficient", cons: "Not 24/7 ($4,000-$6,000)", bestFor: "Light use, campus stores" }
];

export const posSystemComparison = [
  { name: "Cents", features: "Delivery integration", setup: "$500-1,500", monthly: "$100/mo" },
  { name: "Curbside", features: "CRM", setup: "$1,000", monthly: "$75/mo" },
  { name: "FasCard", features: "Loyalty programs", setup: "$800", monthly: "$50/mo" },
  { name: "LaundryLux Connect", features: "Remote monitoring", setup: "$1,200", monthly: "$80/mo" },
  { name: "Dexter Live", features: "Diagnostics", setup: "$600", monthly: "$60/mo" }
];
