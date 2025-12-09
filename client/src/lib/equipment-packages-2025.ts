/**
 * WashBizHub Design Studio - Equipment Packages 2025
 * Curated laundromat equipment configurations for Micro/Standard/Large/Mega stores
 * Based on 90% of winning stores' equipment mix + partner affiliate integrations
 */

import { 
  EQUIPMENT_DATABASE, 
  ANCILLARIES, 
  type EquipmentItem, 
  type AncillaryItem 
} from "./equipment-database-2025";

// Partner affiliate links
export const PARTNER_LINKS = {
  aadvantage: {
    name: "AAdvantage Laundry",
    url: "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry",
    description: "Commercial laundry equipment distributor - Speed Queen, Dexter, ADC authorized dealer",
    commission: "10-15%",
    trackingParam: "ref=washbizhub"
  },
  atmDepot: {
    name: "ATM Depot",
    url: "https://atmdepot.com/laundromat",
    description: "Laundromat-specific ATM bundles with free placement option (50/50 rev split)",
    commission: "Referral bonus",
    trackingParam: "partner=washbizhub"
  },
  preferredFunding: {
    name: "Preferred Funding",
    url: "https://preferredfunding.wufoo.com/forms/laundromat-financing-inquiry/",
    description: "SBA loans 0.5-2% rates, equipment financing, working capital",
    commission: "Finder's fee",
    trackingParam: "source=washbizhub"
  },
  goldCoin: {
    name: "Gold Coin Laundry",
    url: "https://goldcoinlaundry.com",
    description: "Sol-O-Matic tables, seating, laundromat supplies",
    commission: "10%",
    trackingParam: "ref=washbizhub"
  },
  lowLaundry: {
    name: "Laundry Owners Warehouse",
    url: "https://lowlaundry.com",
    description: "Parts, supplies, and equipment. Free shipping over $145",
    commission: "8%",
    trackingParam: "ref=washbizhub"
  }
} as const;

// Equipment package types
export type PackageSize = "micro" | "standard" | "large" | "mega";

export interface EquipmentPackageItem {
  equipmentId: string;
  quantity: number;
  category: "washer" | "dryer" | "stack" | "ancillary";
}

export interface EquipmentPackage {
  id: PackageSize;
  name: string;
  sqftRange: { min: number; max: number };
  description: string;
  equipment: EquipmentPackageItem[];
  pricing: {
    new: { min: number; max: number };
    refurb: { min: number; max: number };
  };
  revenue: {
    monthly: { min: number; max: number };
    annual: { min: number; max: number };
  };
  bestFor: string[];
  roi: string;
  recommendedMix: string;
}

// Best 2025 equipment mix (90% of winning stores)
// 40% Dexter X-Series, 30% Speed Queen Quantum, 20% ADC dryers, 10% stacks
export const EQUIPMENT_PACKAGES: Record<PackageSize, EquipmentPackage> = {
  micro: {
    id: "micro",
    name: "Micro Store",
    sqftRange: { min: 800, max: 1200 },
    description: "Compact operation ideal for neighborhood locations, strip malls, or first-time owners",
    equipment: [
      { equipmentId: "dexter-x350", quantity: 3, category: "washer" },
      { equipmentId: "speedqueen-sc20", quantity: 2, category: "washer" },
      { equipmentId: "speedqueen-sc30", quantity: 1, category: "washer" },
      { equipmentId: "dexter-x350-stack", quantity: 2, category: "stack" },
      { equipmentId: "adc-ad30v", quantity: 4, category: "dryer" },
      { equipmentId: "adc-ad50v", quantity: 2, category: "dryer" },
      { equipmentId: "vendrite-394", quantity: 1, category: "ancillary" },
      { equipmentId: "american-ac1005", quantity: 1, category: "ancillary" },
      { equipmentId: "solomatic-tfd306", quantity: 2, category: "ancillary" },
    ],
    pricing: {
      new: { min: 58000, max: 72000 },
      refurb: { min: 32000, max: 42000 },
    },
    revenue: {
      monthly: { min: 4000, max: 7000 },
      annual: { min: 48000, max: 84000 },
    },
    bestFor: ["First-time owners", "Low competition areas", "Neighborhood locations"],
    roi: "18-30 months",
    recommendedMix: "40% Dexter app-ready, 30% Speed Queen coin, 20% ADC dryers, 10% stacks"
  },

  standard: {
    id: "standard",
    name: "Standard Store",
    sqftRange: { min: 1500, max: 2200 },
    description: "Most common laundromat size with balanced equipment mix for consistent revenue",
    equipment: [
      { equipmentId: "dexter-x350", quantity: 5, category: "washer" },
      { equipmentId: "dexter-x450", quantity: 2, category: "washer" },
      { equipmentId: "speedqueen-sc20", quantity: 3, category: "washer" },
      { equipmentId: "speedqueen-sc30", quantity: 2, category: "washer" },
      { equipmentId: "speedqueen-sc40", quantity: 1, category: "washer" },
      { equipmentId: "speedqueen-sc60", quantity: 1, category: "washer" },
      { equipmentId: "dexter-x350-stack", quantity: 3, category: "stack" },
      { equipmentId: "adc-ad30v", quantity: 5, category: "dryer" },
      { equipmentId: "adc-ad50v", quantity: 4, category: "dryer" },
      { equipmentId: "adc-ad758v", quantity: 2, category: "dryer" },
      { equipmentId: "national-4col", quantity: 1, category: "ancillary" },
      { equipmentId: "american-ac1005", quantity: 1, category: "ancillary" },
      { equipmentId: "genmega-onyxw", quantity: 1, category: "ancillary" },
      { equipmentId: "solomatic-tfd306", quantity: 4, category: "ancillary" },
      { equipmentId: "solomatic-cmd3", quantity: 3, category: "ancillary" },
    ],
    pricing: {
      new: { min: 115000, max: 145000 },
      refurb: { min: 68000, max: 92000 },
    },
    revenue: {
      monthly: { min: 8000, max: 14000 },
      annual: { min: 96000, max: 168000 },
    },
    bestFor: ["Suburban locations", "Strip mall anchors", "Stable neighborhoods"],
    roi: "12-24 months",
    recommendedMix: "40% Dexter X-Series 350G app-ready, 30% Speed Queen Quantum coin, 20% ADC dryers, 10% stacks"
  },

  large: {
    id: "large",
    name: "Large Store",
    sqftRange: { min: 2500, max: 3500 },
    description: "High-capacity operation with full size range and premium amenities",
    equipment: [
      { equipmentId: "dexter-x350", quantity: 8, category: "washer" },
      { equipmentId: "dexter-x450", quantity: 4, category: "washer" },
      { equipmentId: "dexter-x600", quantity: 2, category: "washer" },
      { equipmentId: "speedqueen-sc20", quantity: 3, category: "washer" },
      { equipmentId: "speedqueen-sc40", quantity: 2, category: "washer" },
      { equipmentId: "speedqueen-sc60", quantity: 2, category: "washer" },
      { equipmentId: "speedqueen-sc80", quantity: 1, category: "washer" },
      { equipmentId: "dexter-x350-stack", quantity: 4, category: "stack" },
      { equipmentId: "speedqueen-stack", quantity: 2, category: "stack" },
      { equipmentId: "adc-ad30v", quantity: 6, category: "dryer" },
      { equipmentId: "adc-ad50v", quantity: 6, category: "dryer" },
      { equipmentId: "adc-ad758v", quantity: 4, category: "dryer" },
      { equipmentId: "national-4col", quantity: 2, category: "ancillary" },
      { equipmentId: "american-ac1005", quantity: 1, category: "ancillary" },
      { equipmentId: "genmega-onyxw", quantity: 1, category: "ancillary" },
      { equipmentId: "solomatic-tfd306", quantity: 6, category: "ancillary" },
      { equipmentId: "solomatic-cmd3", quantity: 4, category: "ancillary" },
      { equipmentId: "allpaws-single", quantity: 1, category: "ancillary" },
    ],
    pricing: {
      new: { min: 195000, max: 245000 },
      refurb: { min: 110000, max: 155000 },
    },
    revenue: {
      monthly: { min: 15000, max: 25000 },
      annual: { min: 180000, max: 300000 },
    },
    bestFor: ["High-traffic areas", "Dense urban locations", "Multi-family housing areas"],
    roi: "10-18 months",
    recommendedMix: "40% Dexter X-Series 350G, 30% Speed Queen Quantum, 20% ADC dryers, 10% stacks + dog wash ancillary"
  },

  mega: {
    id: "mega",
    name: "Mega/Hybrid Store",
    sqftRange: { min: 3500, max: 6000 },
    description: "Full-service laundromat with WDF, commercial capacity, and premium revenue streams",
    equipment: [
      { equipmentId: "dexter-x350", quantity: 10, category: "washer" },
      { equipmentId: "dexter-x450", quantity: 6, category: "washer" },
      { equipmentId: "dexter-x600", quantity: 4, category: "washer" },
      { equipmentId: "dexter-x750", quantity: 2, category: "washer" },
      { equipmentId: "dexter-x1200", quantity: 2, category: "washer" },
      { equipmentId: "speedqueen-sc40", quantity: 3, category: "washer" },
      { equipmentId: "speedqueen-sc60", quantity: 2, category: "washer" },
      { equipmentId: "speedqueen-sc80", quantity: 1, category: "washer" },
      { equipmentId: "dexter-x350-stack", quantity: 6, category: "stack" },
      { equipmentId: "speedqueen-stack", quantity: 4, category: "stack" },
      { equipmentId: "adc-ad30v", quantity: 8, category: "dryer" },
      { equipmentId: "adc-ad50v", quantity: 10, category: "dryer" },
      { equipmentId: "adc-ad758v", quantity: 6, category: "dryer" },
      { equipmentId: "national-4col", quantity: 3, category: "ancillary" },
      { equipmentId: "american-ac1005", quantity: 2, category: "ancillary" },
      { equipmentId: "genmega-onyxw", quantity: 2, category: "ancillary" },
      { equipmentId: "solomatic-tfd306", quantity: 10, category: "ancillary" },
      { equipmentId: "solomatic-cmd3", quantity: 6, category: "ancillary" },
      { equipmentId: "allpaws-single", quantity: 1, category: "ancillary" },
    ],
    pricing: {
      new: { min: 350000, max: 550000 },
      refurb: { min: 180000, max: 280000 },
    },
    revenue: {
      monthly: { min: 30000, max: 60000 },
      annual: { min: 360000, max: 720000 },
    },
    bestFor: ["WDF-focused operations", "Commercial accounts", "Multi-location operators"],
    roi: "12-24 months",
    recommendedMix: "35% Dexter X-Series, 25% Speed Queen commercial, 25% ADC high-capacity, 10% stacks, 5% finishers"
  }
};

// Consulting service catalog with Stripe product pricing
export interface ConsultingService {
  id: string;
  name: string;
  description: string;
  priceType: "fixed" | "percentage" | "range" | "monthly";
  pricing: {
    min: number;
    max: number;
    percentageBase?: "equipment" | "project" | "revenue";
  };
  deliverables: string[];
  timeline: string;
  stripeProductId?: string;
  popular?: boolean;
}

export const CONSULTING_SERVICES: ConsultingService[] = [
  {
    id: "feasibility",
    name: "Feasibility Study + Pro Forma",
    description: "Complete market analysis, demographic research, competition mapping, and 5-year financial projections",
    priceType: "range",
    pricing: { min: 7500, max: 15000 },
    deliverables: [
      "CLEANBI location analysis report",
      "Demographic deep-dive (1-3 mile radius)",
      "Competition assessment with saturation index",
      "5-year pro forma with revenue projections",
      "Break-even analysis and ROI timeline",
      "Equipment recommendation by budget",
      "SBA loan readiness checklist"
    ],
    timeline: "5-7 business days",
    popular: true
  },
  {
    id: "3d-design",
    name: "3D Interactive Floor Plan",
    description: "Professional CAD layout with equipment placement, traffic flow optimization, and photorealistic renders",
    priceType: "range",
    pricing: { min: 4000, max: 10000 },
    deliverables: [
      "2D CAD floor plan (AutoCAD/PDF)",
      "3D interactive model (SketchUp/Coohom)",
      "8K photorealistic renders (4 angles)",
      "VR walkthrough ready file",
      "Equipment schedule with pricing",
      "Compliance validation report (ADA/venting)",
      "Investor-ready presentation deck"
    ],
    timeline: "7-10 business days"
  },
  {
    id: "equipment-sourcing",
    name: "Equipment Sourcing & Procurement",
    description: "Leveraging distributor relationships to secure best pricing on commercial laundry equipment",
    priceType: "percentage",
    pricing: { min: 12, max: 18, percentageBase: "equipment" },
    deliverables: [
      "Equipment mix optimization analysis",
      "Multi-distributor quote comparison",
      "Negotiated pricing (10-25% below retail)",
      "Delivery coordination and scheduling",
      "Installation oversight",
      "Warranty registration and tracking",
      "Section 179 documentation"
    ],
    timeline: "Ongoing (2-8 weeks typical)"
  },
  {
    id: "turnkey-pm",
    name: "Turnkey Project Management",
    description: "Full build-out management from permits to grand opening",
    priceType: "percentage",
    pricing: { min: 10, max: 10, percentageBase: "project" },
    deliverables: [
      "GC selection and contract negotiation",
      "Permit acquisition management",
      "Utility coordination (water/gas/electric)",
      "Equipment delivery coordination",
      "Installation supervision",
      "Inspection scheduling",
      "Grand opening planning",
      "Staff training program"
    ],
    timeline: "3-6 months typical"
  },
  {
    id: "retool",
    name: "Existing Store Retool Roadmap",
    description: "Comprehensive upgrade plan for existing laundromats to maximize revenue and efficiency",
    priceType: "range",
    pricing: { min: 10000, max: 25000 },
    deliverables: [
      "Current state assessment",
      "Equipment age and efficiency audit",
      "Phased replacement schedule",
      "Revenue optimization recommendations",
      "WDF addition feasibility",
      "Technology upgrade plan (app payments)",
      "Financing options analysis"
    ],
    timeline: "10-14 business days"
  },
  {
    id: "retainer",
    name: "Monthly Advisory Retainer",
    description: "Ongoing strategic support for operators and investors",
    priceType: "monthly",
    pricing: { min: 2000, max: 5000 },
    deliverables: [
      "Monthly performance review calls",
      "KPI dashboard access",
      "Priority support response",
      "Quarterly market updates",
      "Equipment deal alerts",
      "Networking introductions",
      "Unlimited email support"
    ],
    timeline: "Ongoing monthly"
  }
];

// Viability scorecard factors (CLEANBI 2.0)
export const VIABILITY_SCORECARD = {
  location: {
    name: "Location Population (1mi)",
    maxPoints: 20,
    tiers: [
      { threshold: 20000, points: 20, label: ">20k" },
      { threshold: 12000, points: 15, label: "12-18k" },
      { threshold: 8000, points: 8, label: "8-12k" },
      { threshold: 0, points: 0, label: "<8k" }
    ]
  },
  competition: {
    name: "Competition (1mi)",
    maxPoints: 15,
    tiers: [
      { threshold: 0, points: 15, label: "0 competitors" },
      { threshold: 1, points: 8, label: "1 competitor" },
      { threshold: 2, points: 0, label: "2+ competitors" }
    ]
  },
  income: {
    name: "Household Income",
    maxPoints: 10,
    tiers: [
      { threshold: 65000, points: 10, label: ">$65k" },
      { threshold: 40000, points: 8, label: "$40-65k" },
      { threshold: 0, points: 3, label: "<$40k" }
    ]
  },
  renters: {
    name: "Renter Percentage",
    maxPoints: 15,
    tiers: [
      { threshold: 65, points: 15, label: ">65%" },
      { threshold: 40, points: 12, label: "40-60%" },
      { threshold: 30, points: 5, label: "30-40%" },
      { threshold: 0, points: 0, label: "<30%" }
    ]
  },
  visibility: {
    name: "Visibility & Parking",
    maxPoints: 10,
    tiers: [
      { threshold: 20, points: 10, label: "Corner + 20 spots" },
      { threshold: 10, points: 6, label: "Strip + 10 spots" },
      { threshold: 0, points: 2, label: "Limited" }
    ]
  },
  revenueMultiple: {
    name: "Revenue Multiple",
    maxPoints: 20,
    tiers: [
      { threshold: 0, points: 20, label: "<2.5x" },
      { threshold: 3, points: 10, label: "3-4x" },
      { threshold: 4.5, points: 0, label: ">4.5x" }
    ]
  },
  waterRates: {
    name: "Water Rates",
    maxPoints: 10,
    tiers: [
      { threshold: 0, points: 10, label: "Low (<$5/1000gal)" },
      { threshold: 5, points: 5, label: "Medium ($5-10)" },
      { threshold: 10, points: 0, label: "High (>$10)" }
    ]
  }
};

export function getViabilityGrade(score: number): { grade: string; recommendation: string; color: string } {
  if (score >= 80) {
    return { grade: "A", recommendation: "Strong Buy - Excellent opportunity", color: "#22C55E" };
  } else if (score >= 60) {
    return { grade: "B", recommendation: "Consider - Good potential with some concerns", color: "#A3E635" };
  } else if (score >= 40) {
    return { grade: "C", recommendation: "Caution - Significant challenges present", color: "#FBBF24" };
  } else {
    return { grade: "Needs Work", recommendation: "Walk Away - High risk, low reward", color: "#C8A661" };
  }
}

// Calculate equipment package total
export function calculatePackageTotal(
  packageId: PackageSize,
  pricingTier: "new" | "refurb"
): { 
  total: number; 
  breakdown: { category: string; count: number; subtotal: number }[];
  monthlyRev: { min: number; max: number };
} {
  const pkg = EQUIPMENT_PACKAGES[packageId];
  const breakdown: { category: string; count: number; subtotal: number }[] = [];
  let total = 0;

  // Group by category
  const categories = ["washer", "dryer", "stack", "ancillary"];
  
  categories.forEach(category => {
    const items = pkg.equipment.filter(e => e.category === category);
    let subtotal = 0;
    let count = 0;
    
    items.forEach(item => {
      count += item.quantity;
      // Look up equipment price from database
      const equipment = EQUIPMENT_DATABASE[item.equipmentId as keyof typeof EQUIPMENT_DATABASE];
      const ancillary = ANCILLARIES[item.equipmentId as keyof typeof ANCILLARIES];
      
      if (equipment) {
        const price = pricingTier === "new" 
          ? equipment.pricing.new 
          : (equipment.pricing.refurbished || equipment.pricing.new * 0.6);
        subtotal += price * item.quantity;
      } else if (ancillary) {
        const price = pricingTier === "new"
          ? ancillary.pricing.new
          : (ancillary.pricing.refurbished || ancillary.pricing.new * 0.6);
        subtotal += price * item.quantity;
      }
    });
    
    if (count > 0) {
      breakdown.push({ category, count, subtotal });
      total += subtotal;
    }
  });

  return {
    total,
    breakdown,
    monthlyRev: pkg.revenue.monthly
  };
}

// Get equipment details for a package
export function getPackageEquipmentDetails(packageId: PackageSize): {
  id: string;
  name: string;
  manufacturer: string;
  quantity: number;
  newPrice: number;
  refurbPrice: number;
}[] {
  const pkg = EQUIPMENT_PACKAGES[packageId];
  
  return pkg.equipment.map(item => {
    const equipment = EQUIPMENT_DATABASE[item.equipmentId as keyof typeof EQUIPMENT_DATABASE];
    const ancillary = ANCILLARIES[item.equipmentId as keyof typeof ANCILLARIES];
    
    if (equipment) {
      return {
        id: item.equipmentId,
        name: equipment.model,
        manufacturer: equipment.manufacturer,
        quantity: item.quantity,
        newPrice: equipment.pricing.new,
        refurbPrice: equipment.pricing.refurbished || equipment.pricing.new * 0.6
      };
    } else if (ancillary) {
      return {
        id: item.equipmentId,
        name: ancillary.model,
        manufacturer: ancillary.manufacturer,
        quantity: item.quantity,
        newPrice: ancillary.pricing.new,
        refurbPrice: ancillary.pricing.refurbished || ancillary.pricing.new * 0.6
      };
    }
    
    return {
      id: item.equipmentId,
      name: item.equipmentId,
      manufacturer: "Unknown",
      quantity: item.quantity,
      newPrice: 0,
      refurbPrice: 0
    };
  });
}

// Partner tracking
export function getPartnerAffiliateUrl(partnerId: keyof typeof PARTNER_LINKS): string {
  const partner = PARTNER_LINKS[partnerId];
  const separator = partner.url.includes("?") ? "&" : "?";
  return `${partner.url}${separator}${partner.trackingParam}`;
}
