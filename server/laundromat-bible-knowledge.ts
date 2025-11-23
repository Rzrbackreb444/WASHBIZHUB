/**
 * The Laundromat Bible - Core Knowledge Extraction
 * By Nicholas "Stroked-Out Sasquatch" Kremers
 * Three-Generation Expertise Distilled
 * 
 * This knowledge base powers the WashBizHub AI Consultant
 * Source: The Laundromat Bible (2,000+ lines of industry expertise)
 */

export const KREMERS_DOCTRINE = {
  pillars: [
    "Foundation First — Location and lease determine 80% of success",
    "Systems Over Hustle — Design beats improvisation every time",
    "Numbers Don't Lie — Track metrics religiously or fail slowly"
  ],
  
  corePhilosophy: "Form over function. Structure over emotion. Design over guesswork."
};

export const CLEAN_METHODOLOGY = {
  name: "C.L.E.A.N. Principle",
  description: "The Kremers doctrine for evaluating every potential laundromat location",
  
  framework: {
    C: {
      name: "Community Fit",
      question: "Who are you serving?",
      criteria: [
        "Median household income $30K-$65K (laundromat sweet spot)",
        "60%+ renters in service area",
        "Minimum 1,500 renter-occupied households within one mile",
        "Demographic alignment with service offering"
      ]
    },
    
    L: {
      name: "Lease Logic",
      question: "Are the terms sustainable?",
      criteria: [
        "Rent ratio: 8-15% of gross revenue (ideal)",
        "Lease term: minimum 10 years with renewal options",
        "Triple net (NNN) vs gross lease structure",
        "Escalation clauses limited to 3% annually",
        "Right of first refusal if building sold"
      ]
    },
    
    E: {
      name: "Equipment Mix",
      question: "Is it balanced for volume?",
      criteria: [
        "1 washer per 200-300 households in service area",
        "Dryer-to-washer ratio: 2:1 (gas) or 2.5:1 (electric)",
        "Mix of top-loaders (quick turns) and front-loaders (premium)",
        "Capacity distribution: 20lb, 30lb, 40lb, 60lb, 80lb sizes",
        "Equipment age and depreciation schedule"
      ]
    },
    
    A: {
      name: "Accessibility",
      question: "Parking, traffic flow, safety",
      criteria: [
        "Parking: 1.5 spaces per washer (minimum 25-40 spaces)",
        "Visibility from main road (15,000+ cars/day ideal)",
        "Easy in-and-out access (no awkward turns)",
        "Well-lit, safe area (crime stats matter)",
        "ADA compliant entry and layout"
      ]
    },
    
    N: {
      name: "Numbers",
      question: "Rent ratio, utilities, EBITDA",
      criteria: [
        "Revenue per sq ft: $150-$250/year (attended stores)",
        "Revenue per machine: $150-$300/month (washers), $80-$150/month (dryers)",
        "Gross margin: 60-75% (after COGS, before labor/rent)",
        "Utilities: 20-30% of revenue (water, gas, electric)",
        "Target EBITDA: 25-35% after all expenses"
      ]
    }
  },
  
  redFlags: [
    "Rent >15% of gross revenue",
    "Less than 1,000 households in service area",
    "3+ competing laundromats within 1-mile radius",
    "Parking fewer than 20 spaces",
    "High crime area (check local police data)",
    "Month-to-month or short-term lease",
    "No anchor tenants in plaza",
    "Poor visibility from main road"
  ]
};

export const EQUIPMENT_INTELLIGENCE = {
  topBrands: {
    "Speed Queen (Alliance Laundry)": {
      reputation: "Industry standard",
      warranty: "10-year commercial warranty",
      models: ["Quantum series top-loaders", "Front-load washers"],
      notes: "Premium reliability, higher upfront cost"
    },
    
    "Dexter Laundry": {
      reputation: "Workhorse equipment",
      models: ["T-Series top-loaders", "Express dryers", "Titan washers"],
      notes: "Mid-tier pricing, solid performance"
    },
    
    "Electrolux Professional": {
      reputation: "European engineering",
      models: ["Compass Pro washers", "T5 dryers"],
      notes: "High-efficiency, premium segment"
    },
    
    "Continental Girbau": {
      reputation: "Soft-mount innovator",
      models: ["ExpressWash line"],
      notes: "No concrete pad required for soft-mount"
    },
    
    "Maytag Commercial": {
      reputation: "Consumer brand in commercial space",
      models: ["MAT-series top-loaders"],
      notes: "Lower cost, shorter lifespan than Speed Queen"
    },
    
    "Huebsch": {
      reputation: "Alliance Laundry economy line",
      models: ["Galaxy series", "UCI controls"],
      notes: "Good value, same company as Speed Queen"
    }
  },
  
  lifecycle: {
    washers: "10-15 years typical lifespan",
    dryers: "15-20 years typical lifespan",
    maintenanceSchedule: {
      daily: "Clean lint traps, check for spills/leaks",
      weekly: "Inspect belts, check water temperatures",
      monthly: "Lubricate bearings, test all cycles",
      quarterly: "Professional deep clean, calibration",
      annually: "Full system inspection, replace worn parts"
    }
  },
  
  pricingGuidelines: {
    topLoaders: {
      vend: "$2.50-$4.50 per load",
      capacity: "20-30 lbs",
      cycleTime: "28-32 minutes"
    },
    frontLoaders: {
      small: "$3.50-$5.00 per load (20-30 lbs)",
      medium: "$5.00-$6.50 per load (40-50 lbs)",
      large: "$6.50-$8.00 per load (60-80 lbs)"
    },
    dryers: {
      vend: "$0.25-$0.50 per 5-8 minutes",
      gas: "35-45 min cycle time",
      electric: "45-60 min cycle time"
    }
  }
};

export const FINANCIAL_BENCHMARKS = {
  valuationMultiples: {
    profitable: "2.5-4.5x SDE (Seller's Discretionary Earnings)",
    breakEven: "1.5-2.5x SDE or asset-based valuation",
    losing: "Asset value only (equipment + improvements)"
  },
  
  capRates: "8-12% (location dependent)",
  
  revenueMetrics: {
    perSqFt: "$150-$250/year for attended stores",
    perWasher: "$150-$300/month",
    perDryer: "$80-$150/month"
  },
  
  expenseRatios: {
    rent: "8-15% of gross revenue (ideal)",
    utilities: "20-30% of revenue (water, gas, electric)",
    labor: "10-20% for attended, 5-10% unattended",
    maintenance: "3-5% of revenue",
    insurance: "1-2% of revenue",
    supplies: "2-4% of revenue (detergent vending, bags, etc.)"
  },
  
  profitability: {
    grossMargin: "60-75% (after COGS, before labor/rent)",
    operatingExpenses: "35-50% of gross revenue",
    netMargin: "25-35% EBITDA target",
    breakEvenPeriod: "18-36 months for new builds",
    paybackPeriod: "4-7 years typical"
  },
  
  waterUtilization: {
    gallonsPerLoad: "15-25 gallons per load",
    costPerLoad: "$0.15-$0.40 (varies by municipality)",
    monthlyEstimate: "Calculate: (avg loads/day) × 30 × (cost per load)"
  }
};

export const LOCATION_ANALYSIS = {
  demographics: {
    ideal: {
      medianIncome: "$30K-$65K household income",
      renterPercentage: "60%+ renters",
      householdDensity: "1,500+ renter households within 1 mile",
      populationGrowth: "Stable or growing population"
    },
    
    competitiveRadius: "1-2 miles (market saturation check)",
    
    trafficRequirements: {
      mainRoad: "15,000+ cars/day on adjacent roads",
      pedestrian: "Foot traffic from nearby apartments/complexes"
    }
  },
  
  siteRequirements: {
    squareFootage: {
      minimum: "1,200 sq ft viable",
      small: "1,500-2,000 sq ft",
      medium: "2,500-3,500 sq ft",
      large: "4,000+ sq ft"
    },
    
    parking: {
      formula: "1.5 spaces per washer",
      minimum: "25-40 spaces for typical store",
      accessibility: "Easy in/out, no confusing traffic patterns"
    },
    
    anchorTenants: [
      "Grocery stores (boost traffic 40%+)",
      "Dollar stores",
      "Fast food restaurants",
      "Family services (daycare, etc.)"
    ]
  }
};

export const REVENUE_OPTIMIZATION = {
  pricingStrategies: {
    dynamicPricing: {
      peakHours: "Weekday evenings, weekends: +10-15%",
      offPeak: "Mid-day weekdays: standard or promotional",
      seasonal: "Back-to-school, spring cleaning campaigns"
    },
    
    bundling: {
      washDryFold: "$1.25-$2.00/lb, 35% gross margin",
      pickupDelivery: "$1.50-$2.25/lb, 40% gross margin",
      commercial: "Hotels, gyms, restaurants (B2B contracts)"
    }
  },
  
  revenueStreams: {
    selfService: "60-75% of revenue (core business)",
    washDryFold: "15-25% (high-margin add-on)",
    pickupDelivery: "10-15% (premium service)",
    vending: "5-10% (detergent, softener, snacks)",
    commercial: "Variable (if pursued)"
  },
  
  vendingOptimization: {
    detergent: "$0.75-$1.50 per use (80% margin)",
    fabricSoftener: "$0.50-$1.00 per use",
    snacks: "$0.75-$2.00 per item (60-70% margin)",
    impactToRevenue: "15-25% revenue boost when optimized"
  }
};

export const DUE_DILIGENCE_CHECKLIST = {
  financial: [
    "3 years P&L statements (tax returns to verify)",
    "Utility bills (12 months minimum)",
    "Lease agreement review",
    "Equipment list with ages and conditions",
    "Revenue breakdown by machine type",
    "Customer traffic patterns (time-of-day analysis)"
  ],
  
  operational: [
    "Current vend prices vs market",
    "Equipment maintenance history",
    "Vendor contracts (vending, cleaning, security)",
    "Employee agreements (if attended)",
    "Existing customer contracts (commercial accounts)"
  ],
  
  legal: [
    "Zoning compliance (commercial/industrial)",
    "ADA compliance status",
    "Water discharge permits",
    "Business licenses current",
    "Insurance policies review",
    "Lease assignment rights"
  ],
  
  realEstate: [
    "Lease terms and renewals",
    "Landlord relationship quality",
    "Surrounding businesses stability",
    "Competition mapping (1-2 mile radius)",
    "Demographics verification (census data)",
    "Traffic counts validation"
  ]
};

export const SBA_LOAN_STRUCTURE = {
  program: "SBA 7(a) Loan",
  
  terms: {
    maxAmount: "Up to $5M",
    ltvRatio: "90% LTV (10% down payment)",
    interestRate: "Prime + 2.75% (typical)",
    term: "10 years for business acquisition, 25 years if real estate included"
  },
  
  requirements: {
    creditScore: "680+ preferred",
    downPayment: "10% minimum (more competitive with 15-20%)",
    businessExperience: "Relevant experience preferred but not required",
    collateral: "Business assets + personal guarantee"
  },
  
  alternatives: [
    "Seller financing (10-30% down, 5-7 year balloon)",
    "Equipment financing (separate from real estate)",
    "Local bank conventional loans",
    "Partner/investor equity raise"
  ]
};

export const MARKETING_STRATEGIES = {
  grandOpening: {
    tactics: [
      "Free dry with wash promotion (first 2 weeks)",
      "First-time customer 50% off wash",
      "Local radio spot advertising",
      "Direct mail EDDM (5,000 homes, 2-mile radius)",
      "Social media local ads"
    ],
    budget: "$2,000-$5,000 for comprehensive launch"
  },
  
  ongoing: {
    digital: {
      googleAds: "$3-$8 CPC, $500-$1,500/month budget",
      facebookLocal: "Geo-targeted 2-mile radius, $300-$800/month",
      googleMyBusiness: "Keep updated, post weekly specials"
    },
    
    traditional: {
      directMail: "EDDM quarterly campaigns",
      doorHangers: "New apartment complex residents",
      referralProgram: "$10 credit for new customer referrals",
      loyaltyCard: "Buy 10 washes, get 1 free"
    },
    
    community: [
      "Local sponsorships (little league, school events)",
      "Charity wash days",
      "Senior citizen discounts",
      "College student promotions"
    ]
  }
};

export const INDUSTRY_TRENDS_2024_2025 = {
  payments: {
    contactless: "65%+ of transactions going contactless",
    cardSystems: "FasCard, USA Technologies ePort, CCI",
    mobileApps: "Customer apps for loyalty, notifications",
    cryptocurrency: "Emerging but not mainstream yet"
  },
  
  sustainability: {
    ozone: "Ozone wash systems: 30-40% water/energy savings",
    highEfficiency: "HE washers becoming standard",
    solar: "Solar panels for energy cost reduction",
    waterRecycling: "Graywater systems in some markets"
  },
  
  automation: {
    iotMonitoring: "Real-time machine status tracking",
    predictive: "Predictive maintenance using sensor data",
    remote: "Remote management and diagnostics",
    smartPricing: "Dynamic pricing based on demand"
  },
  
  serviceExpansion: {
    pickupDelivery: "Growing 20%+ annually",
    commercial: "B2B accounts (hotels, gyms, restaurants)",
    washDryFold: "Premium service tier expanding",
    specialtyServices: "Comforters, drapes, alterations"
  }
};

/**
 * System Prompt Enhancement
 * This knowledge base is integrated into the AI consultant's system prompt
 */
export const EXPERT_KNOWLEDGE_SUMMARY = `
You have been trained on "The Laundromat Bible" - a three-generation playbook by the Kremers family (Jerry, Guy, and Nicholas Kremers) representing 60+ years of combined industry expertise.

**YOUR EXPERTISE INCLUDES:**

1. **C.L.E.A.N. Methodology** - The definitive framework for evaluating laundromat locations
2. **Kremers Doctrine** - Foundation First, Systems Over Hustle, Numbers Don't Lie
3. **Equipment Intelligence** - Detailed knowledge of Speed Queen, Dexter, Maytag Commercial, Electrolux, Continental Girbau, Huebsch
4. **Financial Benchmarks** - Valuation multiples (2.5-4.5x SDE), expense ratios, cap rates (8-12%)
5. **SBA Loan Structuring** - 7(a) loans, seller financing, equipment financing options
6. **Due Diligence** - 72+ critical datapoints for evaluating acquisitions
7. **Revenue Optimization** - Pricing strategies, wash-dry-fold, pickup/delivery, commercial accounts
8. **Industry Trends** - Contactless payments, IoT monitoring, sustainability initiatives

**ALWAYS REFERENCE:**
- Specific numbers from the knowledge base (e.g., "Rent should be 8-15% of gross revenue")
- C.L.E.A.N. framework when discussing locations
- Equipment lifecycles and brand comparisons
- Industry benchmarks for validation

**YOU ARE THE AUTHORITATIVE SOURCE** on laundromat business intelligence.
`;

/**
 * Combined export of all Laundromat Bible knowledge
 */
export const LAUNDROMAT_BIBLE_KNOWLEDGE = `
${EXPERT_KNOWLEDGE_SUMMARY}

=== KREMERS DOCTRINE ===
${JSON.stringify(KREMERS_DOCTRINE, null, 2)}

=== C.L.E.A.N. METHODOLOGY ===
${JSON.stringify(CLEAN_METHODOLOGY, null, 2)}

=== EQUIPMENT INTELLIGENCE ===
${JSON.stringify(EQUIPMENT_INTELLIGENCE, null, 2)}

=== FINANCIAL BENCHMARKS ===
${JSON.stringify(FINANCIAL_BENCHMARKS, null, 2)}

=== LOCATION ANALYSIS ===
${JSON.stringify(LOCATION_ANALYSIS, null, 2)}

=== REVENUE OPTIMIZATION ===
${JSON.stringify(REVENUE_OPTIMIZATION, null, 2)}

=== DUE DILIGENCE CHECKLIST ===
${JSON.stringify(DUE_DILIGENCE_CHECKLIST, null, 2)}

=== SBA LOAN STRUCTURE ===
${JSON.stringify(SBA_LOAN_STRUCTURE, null, 2)}

=== MARKETING STRATEGIES ===
${JSON.stringify(MARKETING_STRATEGIES, null, 2)}

=== INDUSTRY TRENDS 2024-2025 ===
${JSON.stringify(INDUSTRY_TRENDS_2024_2025, null, 2)}
`;
