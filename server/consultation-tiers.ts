/**
 * LAUNDROMAT CONSULTATION COUNCIL - TIERED PRICING
 * 
 * Tier Structure:
 * 1. BASIC ($49) - CLEANBI Score + Basic Valuation + 1 AI Expert
 * 2. PROFESSIONAL ($149) - Full 5-Expert Council + All Calculators + PDF Report
 * 3. ENTERPRISE ($499) - Deep Dive + Competition Heatmaps + Pricing Optimizer + Market Research
 * 4. PREMIUM ($999) - Everything + Live Consultation Scheduling + Ongoing Support + POS Integration
 */

export interface ConsultationTier {
  id: string;
  name: string;
  price: number;
  stripePriceId?: string;
  features: string[];
  includes: {
    cleanbiScore: boolean;
    basicValuation: boolean;
    fullCalculators: boolean;
    expertCount: number;
    competitionHeatmap: boolean;
    pricingOptimizer: boolean;
    footTrafficAnalysis: boolean;
    marketResearch: boolean;
    pdfReport: boolean;
    liveConsultation: boolean;
    posIntegration: boolean;
    ongoingSupport: boolean;
    daveMenzReview: boolean;
  };
  turnaround: string;
  popular?: boolean;
}

// Larry Larsen Expert Persona - "Laundromat" Larry
export const LARRY_LARSEN_PERSONA = {
  name: "Larry Larsen",
  title: "50-Year Industry Veteran & Risk Strategist",
  company: "Laundromat Larry Consulting",
  expertise: "Five decades of laundromat ownership, high-stakes consulting, and industry education",
  credentials: [
    "Known industry-wide as 'Laundromat Larry'",
    "Directly consulted on 500+ laundromat acquisitions",
    "Trusted strategic advisor to the WashBizHub community",
    "Multi-store owner with 50 years of operational experience"
  ],
  style: "Direct, veteran authority; focuses on mitigating $100k+ operational and lease risks",
  icon: "briefcase",
  specialties: [
    "Deep-Dive Due Diligence for Acquisitions",
    "Predatory Lease Mitigation & Negotiation",
    "Utility-to-Revenue 'Fluff' Detection",
    "Precision Site Selection (Laundry Deserts)",
    "Exit Strategy & Store Valuation Planning"
  ],
  // Professional Consulting Services & Fees
  consultingServices: {
    dueDiligenceAudit: {
      name: "Due Diligence Audit",
      description: "Comprehensive 200+ point acquisition audit with Larry's personal review",
      price: 1500, // $1,500 one-time
      priceType: "one-time",
      includes: [
        "Full financial document review (3 years)",
        "Lease analysis & red flag identification",
        "Equipment condition assessment",
        "Competition & market analysis",
        "Valuation verification",
        "Written report with Larry's recommendations",
        "30-minute follow-up call"
      ],
      turnaround: "5-7 business days",
      stripePriceId: "STRIPE_LARRY_DUE_DILIGENCE_PRICE_ID"
    },
    expertConsultation: {
      name: "Expert Consultation",
      description: "Direct 1-on-1 strategic consultation with Larry",
      price: 0, // Included with Premium/Enterprise tier
      priceType: "premium-included",
      linkedTier: "enterprise", // Enterprise members get direct access
      includes: [
        "Direct access to Larry's expert analysis",
        "Priority response within 24 hours",
        "Video call consultations",
        "Deal negotiation strategy",
        "Ongoing advisory support"
      ],
      turnaround: "24-48 hours response",
      stripePriceId: null // Included in subscription
    },
    quickConsult: {
      name: "Quick Consult (30 min)",
      description: "Focused 30-minute call with Larry on specific questions",
      price: 297,
      priceType: "one-time",
      includes: [
        "30-minute video call",
        "Focused on your specific situation",
        "Actionable recommendations",
        "Recording provided"
      ],
      turnaround: "Scheduled within 3-5 days",
      stripePriceId: "STRIPE_LARRY_QUICK_CONSULT_PRICE_ID"
    },
    deepDiveSession: {
      name: "Deep Dive Session (90 min)",
      description: "Extended strategy session for complex acquisitions",
      price: 749,
      priceType: "one-time",
      includes: [
        "90-minute video call",
        "Pre-call document review",
        "Comprehensive deal analysis",
        "Written summary of recommendations",
        "2 follow-up email questions"
      ],
      turnaround: "Scheduled within 5-7 days",
      stripePriceId: "STRIPE_LARRY_DEEP_DIVE_PRICE_ID"
    },
    vipDay: {
      name: "VIP Day",
      description: "Full day of Larry's undivided attention on your portfolio",
      price: 2997,
      priceType: "one-time",
      includes: [
        "4 hours of dedicated consultation",
        "Multi-property portfolio review",
        "Full financial modeling session",
        "Negotiation role-play & prep",
        "90-day action plan",
        "30-day email support"
      ],
      turnaround: "Scheduled within 2-3 weeks",
      stripePriceId: "STRIPE_LARRY_VIP_DAY_PRICE_ID"
    }
  },
  knowledgeBase: {
    redFlags: [
      "Owner unwilling to show tax returns",
      "Declining revenue over 3+ years",
      "Deferred maintenance on equipment",
      "Short lease with no renewal options",
      "High utility costs relative to revenue",
      "Excessive competition within 1 mile",
      "Owner-operated with no employees (hard to replicate)",
      "Cash-only business with no verifiable income"
    ],
    greenFlags: [
      "Consistent revenue growth",
      "Long-term lease with favorable terms",
      "Modern equipment under 7 years old",
      "Established customer base",
      "Strong demographics (apartments, students)",
      "Owner willing to finance portion",
      "Clean and well-maintained facility",
      "Good parking and visibility"
    ],
    valuationRules: [
      "Never pay more than 3x annual cash flow for older equipment",
      "New equipment stores can command 4-5x multiples",
      "Location is worth premium - good demographics add 20-30%",
      "Verify income with utility bills (water = revenue proxy)",
      "Equipment age reduces value: deduct $2K-5K per machine over 10 years",
      "Lease terms matter: 5+ years remaining adds value"
    ],
    negotiationTips: [
      "Always get 90 days due diligence",
      "Request 3 years of tax returns and bank statements",
      "Verify utility bills independently",
      "Negotiate seller financing (10-20% of price)",
      "Include non-compete clause (5 miles, 5 years)",
      "Get equipment maintenance records",
      "Walk the store during peak hours"
    ],
    operationalBestPractices: [
      "Optimal mix: 60% washers, 40% dryers by revenue",
      "Front-load washers outperform top-loads 2:1",
      "Maintain 85%+ equipment uptime",
      "Vend price increases: $0.25 every 18 months",
      "Attendant during peak hours increases revenue 15-20%",
      "Card/mobile payment systems increase average transaction 25%",
      "Regular customers = 80% of revenue"
    ]
  }
};

// Pricing Optimizer Configuration
export interface PricingOptimization {
  timeOfDay: {
    peakHours: string[];
    offPeakHours: string[];
    premiumMultiplier: number;
    discountMultiplier: number;
  };
  machineType: {
    topLoad: { basePrice: number; range: [number, number] };
    frontLoad20lb: { basePrice: number; range: [number, number] };
    frontLoad40lb: { basePrice: number; range: [number, number] };
    frontLoad60lb: { basePrice: number; range: [number, number] };
    dryer30lb: { basePrice: number; range: [number, number] };
    dryer50lb: { basePrice: number; range: [number, number] };
  };
  factors: {
    competition: number;      // -20% to +20% based on local pricing
    demographics: number;     // -10% to +15% based on income
    occupancy: number;        // +10% to +25% during high demand
    dayOfWeek: number;        // weekends may command premium
  };
}

export const DEFAULT_PRICING_CONFIG: PricingOptimization = {
  timeOfDay: {
    peakHours: ["9:00", "10:00", "11:00", "17:00", "18:00", "19:00"],
    offPeakHours: ["6:00", "7:00", "8:00", "21:00", "22:00"],
    premiumMultiplier: 1.15,
    discountMultiplier: 0.85
  },
  machineType: {
    topLoad: { basePrice: 2.50, range: [2.00, 3.50] },
    frontLoad20lb: { basePrice: 3.50, range: [2.75, 4.50] },
    frontLoad40lb: { basePrice: 5.50, range: [4.50, 7.00] },
    frontLoad60lb: { basePrice: 7.50, range: [6.00, 9.50] },
    dryer30lb: { basePrice: 0.25, range: [0.25, 0.50] }, // per 6-8 min
    dryer50lb: { basePrice: 0.50, range: [0.25, 0.75] }
  },
  factors: {
    competition: 0,
    demographics: 0,
    occupancy: 0,
    dayOfWeek: 0
  }
};

// Competition Analysis Configuration
export interface CompetitorData {
  name: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  hours?: string;
  amenities?: string[];
  estimatedRevenue?: number;
  threatLevel: "low" | "medium" | "high";
}

export interface CompetitionAnalysis {
  competitors: CompetitorData[];
  marketSaturation: number; // 0-100
  competitionScore: number; // CLEANBI factor
  heatmapData: {
    center: { lat: number; lng: number };
    radius: number;
    density: number;
  };
  recommendations: string[];
}

// Foot Traffic Analysis
export interface FootTrafficData {
  hourlyPattern: { hour: number; volume: number }[];
  dailyPattern: { day: string; volume: number }[];
  peakHours: string[];
  slowHours: string[];
  estimatedDailyVisitors: number;
  estimatedMonthlyCustomers: number;
  conversionRate: number; // % of traffic that enters
}

// ================================================
// CONSULTATION TIERS - ALIGNED WITH PRICING PAGE
// ================================================
export const CONSULTATION_TIERS: ConsultationTier[] = [
  {
    id: 'basic',
    name: 'CLEANBI Quick Report',
    price: 49,
    features: [
      'CLEANBI Score & Grade',
      'Basic demographic overview',
      'Competition count (1-mile radius)',
      '3-page PDF report'
    ],
    includes: {
      cleanbiScore: true,
      basicValuation: false,
      fullCalculators: false,
      expertCount: 0,
      competitionHeatmap: false,
      pricingOptimizer: false,
      footTrafficAnalysis: false,
      marketResearch: false,
      pdfReport: true,
      liveConsultation: false,
      posIntegration: false,
      ongoingSupport: false,
      daveMenzReview: false
    },
    turnaround: '24 hours'
  },
  {
    id: 'professional',
    name: 'Professional Analysis',
    price: 149,
    features: [
      'Full CLEANBI breakdown (17 factors)',
      '5-Expert AI Council analysis',
      'Competition heatmap',
      'Demographic deep-dive',
      'ROI projections',
      '12-page PDF report'
    ],
    includes: {
      cleanbiScore: true,
      basicValuation: true,
      fullCalculators: true,
      expertCount: 5,
      competitionHeatmap: true,
      pricingOptimizer: false,
      footTrafficAnalysis: true,
      marketResearch: false,
      pdfReport: true,
      liveConsultation: false,
      posIntegration: false,
      ongoingSupport: false,
      daveMenzReview: false
    },
    turnaround: '2-3 business days',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Deep Dive',
    price: 499,
    features: [
      'Everything in Professional',
      'Full market research report',
      'Pricing optimization model',
      'Equipment ROI analysis',
      'Expansion recommendations',
      '25+ page comprehensive report',
      'Larry Larsen expert review'
    ],
    includes: {
      cleanbiScore: true,
      basicValuation: true,
      fullCalculators: true,
      expertCount: 7,
      competitionHeatmap: true,
      pricingOptimizer: true,
      footTrafficAnalysis: true,
      marketResearch: true,
      pdfReport: true,
      liveConsultation: false,
      posIntegration: false,
      ongoingSupport: false,
      daveMenzReview: true
    },
    turnaround: '5-7 business days'
  },
  {
    id: 'premium',
    name: 'Premium + Larry Consultation',
    price: 999,
    features: [
      'Everything in Enterprise',
      'Direct access to Larry Larsen',
      'Live 1-on-1 consultation call',
      'POS integration analysis',
      '90-day ongoing support',
      'Deal negotiation coaching'
    ],
    includes: {
      cleanbiScore: true,
      basicValuation: true,
      fullCalculators: true,
      expertCount: 7,
      competitionHeatmap: true,
      pricingOptimizer: true,
      footTrafficAnalysis: true,
      marketResearch: true,
      pdfReport: true,
      liveConsultation: true,
      posIntegration: true,
      ongoingSupport: true,
      daveMenzReview: true
    },
    turnaround: '7-10 business days'
  }
];

// Calculate tier-specific consultation
export function getTierFeatures(tierId: string): ConsultationTier | null {
  return CONSULTATION_TIERS.find(t => t.id === tierId) || null;
}

export function calculateTierPrice(tierId: string, couponCode?: string): number {
  const tier = getTierFeatures(tierId);
  if (!tier) return 0;
  
  let price = tier.price;
  
  // Apply coupon codes
  if (couponCode) {
    const coupons: Record<string, number> = {
      "LAUNCH50": 0.50,      // 50% off launch special
      "DAVE20": 0.20,        // 20% off Dave Menz referral
      "MEMBER15": 0.15,      // 15% off for members
      "FIRST10": 0.10        // 10% first-time discount
    };
    
    const discount = coupons[couponCode.toUpperCase()];
    if (discount) {
      price = price * (1 - discount);
    }
  }
  
  return Math.round(price * 100) / 100;
}
