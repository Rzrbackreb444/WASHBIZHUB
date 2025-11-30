/**
 * CLEANBI™ Industry Benchmarks - Defensible, Research-Based Standards
 * 
 * Sources:
 * - Coin Laundry Association (CLA) Industry Survey 2023-2024
 * - IBISWorld Laundromat Industry Report
 * - Planet Laundry Magazine benchmarks
 * - Speed Queen/Alliance Laundry dealer data
 * - Actual transaction data from laundromat brokers
 * 
 * These benchmarks are used to generate realistic projections
 * when actual business data is not available.
 */

// =====================================
// LAUNDROMAT SIZE CLASSIFICATIONS
// =====================================

export type StoreSizeCategory = 'small' | 'standard' | 'large' | 'flagship';

export interface StoreSizeProfile {
  category: StoreSizeCategory;
  sqFtRange: { min: number; max: number };
  washerCount: { min: number; max: number; typical: number };
  dryerCount: { min: number; max: number; typical: number };
  totalMachines: { min: number; max: number; typical: number };
}

export const STORE_SIZE_PROFILES: Record<StoreSizeCategory, StoreSizeProfile> = {
  small: {
    category: 'small',
    sqFtRange: { min: 1000, max: 1800 },
    washerCount: { min: 8, max: 18, typical: 12 },
    dryerCount: { min: 6, max: 14, typical: 10 },
    totalMachines: { min: 14, max: 32, typical: 22 },
  },
  standard: {
    category: 'standard',
    sqFtRange: { min: 1800, max: 2800 },
    washerCount: { min: 18, max: 32, typical: 26 },
    dryerCount: { min: 16, max: 28, typical: 22 },
    totalMachines: { min: 34, max: 60, typical: 48 },
  },
  large: {
    category: 'large',
    sqFtRange: { min: 2800, max: 4000 },
    washerCount: { min: 32, max: 50, typical: 40 },
    dryerCount: { min: 26, max: 40, typical: 32 },
    totalMachines: { min: 58, max: 90, typical: 72 },
  },
  flagship: {
    category: 'flagship',
    sqFtRange: { min: 4000, max: 8000 },
    washerCount: { min: 50, max: 80, typical: 60 },
    dryerCount: { min: 40, max: 60, typical: 48 },
    totalMachines: { min: 90, max: 140, typical: 108 },
  },
};

// =====================================
// TURNS PER DAY (TPD) BENCHMARKS
// =====================================

export interface TPDBenchmarks {
  washerTPD: {
    weekday: { low: number; average: number; high: number };
    weekend: { low: number; average: number; high: number };
    blended: { low: number; average: number; high: number }; // 5 weekdays + 2 weekend days
  };
  dryerTPD: {
    weekday: { low: number; average: number; high: number };
    weekend: { low: number; average: number; high: number };
    blended: { low: number; average: number; high: number };
  };
}

export const TPD_BENCHMARKS: TPDBenchmarks = {
  washerTPD: {
    weekday: { low: 3.0, average: 5.0, high: 7.0 },
    weekend: { low: 4.0, average: 6.5, high: 9.0 },
    blended: { low: 3.3, average: 5.4, high: 7.6 }, // (5*weekday + 2*weekend) / 7
  },
  dryerTPD: {
    weekday: { low: 2.0, average: 3.5, high: 5.0 },
    weekend: { low: 3.0, average: 4.5, high: 6.0 },
    blended: { low: 2.3, average: 3.8, high: 5.3 },
  },
};

// =====================================
// VEND PRICING BY MARKET TIER
// =====================================

export type MarketTier = 'budget' | 'value' | 'standard' | 'premium' | 'luxury';

export interface VendPricing {
  topLoadWasher: { min: number; max: number; typical: number };
  frontLoad20lb: { min: number; max: number; typical: number };
  frontLoad40lb: { min: number; max: number; typical: number };
  frontLoad60lb: { min: number; max: number; typical: number };
  frontLoad80lb: { min: number; max: number; typical: number };
  dryer: { min: number; max: number; typical: number }; // per cycle
  averageVend: { min: number; max: number; typical: number }; // weighted average
}

export const VEND_PRICING_BY_TIER: Record<MarketTier, VendPricing> = {
  budget: {
    topLoadWasher: { min: 2.00, max: 3.00, typical: 2.50 },
    frontLoad20lb: { min: 2.50, max: 3.50, typical: 3.00 },
    frontLoad40lb: { min: 4.00, max: 5.50, typical: 4.50 },
    frontLoad60lb: { min: 6.00, max: 7.50, typical: 6.50 },
    frontLoad80lb: { min: 8.00, max: 10.00, typical: 8.50 },
    dryer: { min: 0.25, max: 0.50, typical: 0.25 },
    averageVend: { min: 3.00, max: 4.00, typical: 3.25 },
  },
  value: {
    topLoadWasher: { min: 2.50, max: 3.50, typical: 3.00 },
    frontLoad20lb: { min: 3.00, max: 4.25, typical: 3.50 },
    frontLoad40lb: { min: 5.00, max: 6.50, typical: 5.50 },
    frontLoad60lb: { min: 7.00, max: 9.00, typical: 8.00 },
    frontLoad80lb: { min: 9.00, max: 11.50, typical: 10.00 },
    dryer: { min: 0.25, max: 0.50, typical: 0.35 },
    averageVend: { min: 3.50, max: 4.50, typical: 4.00 },
  },
  standard: {
    topLoadWasher: { min: 3.00, max: 4.00, typical: 3.50 },
    frontLoad20lb: { min: 3.50, max: 5.00, typical: 4.25 },
    frontLoad40lb: { min: 6.00, max: 7.50, typical: 6.75 },
    frontLoad60lb: { min: 8.50, max: 10.50, typical: 9.50 },
    frontLoad80lb: { min: 11.00, max: 13.50, typical: 12.00 },
    dryer: { min: 0.35, max: 0.50, typical: 0.40 },
    averageVend: { min: 4.00, max: 5.25, typical: 4.50 },
  },
  premium: {
    topLoadWasher: { min: 3.50, max: 4.50, typical: 4.00 },
    frontLoad20lb: { min: 4.50, max: 6.00, typical: 5.00 },
    frontLoad40lb: { min: 7.00, max: 9.00, typical: 8.00 },
    frontLoad60lb: { min: 10.00, max: 12.50, typical: 11.00 },
    frontLoad80lb: { min: 13.00, max: 16.00, typical: 14.50 },
    dryer: { min: 0.40, max: 0.60, typical: 0.50 },
    averageVend: { min: 5.00, max: 6.25, typical: 5.50 },
  },
  luxury: {
    topLoadWasher: { min: 4.00, max: 5.50, typical: 4.75 },
    frontLoad20lb: { min: 5.50, max: 7.00, typical: 6.00 },
    frontLoad40lb: { min: 8.50, max: 11.00, typical: 9.50 },
    frontLoad60lb: { min: 12.00, max: 15.00, typical: 13.50 },
    frontLoad80lb: { min: 15.00, max: 20.00, typical: 17.00 },
    dryer: { min: 0.50, max: 0.75, typical: 0.60 },
    averageVend: { min: 5.75, max: 7.50, typical: 6.50 },
  },
};

// =====================================
// FINANCIAL METRICS & MARGINS
// =====================================

export interface FinancialBenchmarks {
  ebitdaMargin: { low: number; average: number; high: number }; // % of revenue
  sdeMargin: { low: number; average: number; high: number }; // Seller's Discretionary Earnings
  netProfitMargin: { low: number; average: number; high: number };
  utilityCostShare: { low: number; average: number; high: number }; // % of revenue
  rentShare: { low: number; average: number; high: number }; // % of revenue
  laborShare: { low: number; average: number; high: number }; // % of revenue (if attended)
  maintenanceShare: { low: number; average: number; high: number }; // % of revenue
}

export const FINANCIAL_BENCHMARKS: FinancialBenchmarks = {
  ebitdaMargin: { low: 0.22, average: 0.28, high: 0.35 },
  sdeMargin: { low: 0.28, average: 0.35, high: 0.42 },
  netProfitMargin: { low: 0.15, average: 0.22, high: 0.30 },
  utilityCostShare: { low: 0.15, average: 0.20, high: 0.26 },
  rentShare: { low: 0.08, average: 0.12, high: 0.18 },
  laborShare: { low: 0.05, average: 0.10, high: 0.18 },
  maintenanceShare: { low: 0.03, average: 0.06, high: 0.10 },
};

// =====================================
// VALUATION MULTIPLES
// =====================================

export interface ValuationMultiples {
  ebitdaMultiple: { low: number; average: number; high: number };
  sdeMultiple: { low: number; average: number; high: number };
  revenueMultiple: { low: number; average: number; high: number };
  assetFloorMultiplier: number; // Replacement cost multiplier for floor value
}

export const VALUATION_MULTIPLES: ValuationMultiples = {
  ebitdaMultiple: { low: 4.0, average: 5.0, high: 6.5 },
  sdeMultiple: { low: 2.5, average: 3.25, high: 4.0 },
  revenueMultiple: { low: 0.8, average: 1.0, high: 1.3 },
  assetFloorMultiplier: 0.55, // 55% of equipment replacement cost
};

// =====================================
// CONFIDENCE-BASED PROJECTION CAPS
// =====================================

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'very_low';

export interface ConfidenceCaps {
  maxWashers: number;
  tpdMultiplier: number;
  vendPriceCap: number;
  marginMultiplier: number;
  requiresDisclaimer: boolean;
  disclaimerText: string;
}

export const CONFIDENCE_CAPS: Record<ConfidenceLevel, ConfidenceCaps> = {
  high: {
    maxWashers: 80,
    tpdMultiplier: 1.0,
    vendPriceCap: 7.50,
    marginMultiplier: 1.0,
    requiresDisclaimer: false,
    disclaimerText: '',
  },
  medium: {
    maxWashers: 40,
    tpdMultiplier: 0.85,
    vendPriceCap: 5.50,
    marginMultiplier: 0.9,
    requiresDisclaimer: true,
    disclaimerText: 'Estimates based on limited data. Actual results may vary.',
  },
  low: {
    maxWashers: 20,
    tpdMultiplier: 0.70,
    vendPriceCap: 4.50,
    marginMultiplier: 0.8,
    requiresDisclaimer: true,
    disclaimerText: 'Limited market data available. Projections are conservative estimates.',
  },
  very_low: {
    maxWashers: 12,
    tpdMultiplier: 0.50,
    vendPriceCap: 3.50,
    marginMultiplier: 0.7,
    requiresDisclaimer: true,
    disclaimerText: 'Insufficient data for reliable projections. Values shown are minimum estimates only.',
  },
};

// =====================================
// ADDRESS TYPE MODELS
// =====================================

export type AddressType = 'operating_laundromat' | 'prospective_commercial' | 'residential' | 'unknown';

export interface AddressTypeModel {
  type: AddressType;
  usesBusinessMetrics: boolean;
  usesPropertyMetrics: boolean;
  defaultStoreSize: StoreSizeCategory;
  defaultMarketTier: MarketTier;
  maxRevenueMultiplier: number; // Cap on revenue estimates
  projectionNotes: string;
}

export const ADDRESS_TYPE_MODELS: Record<AddressType, AddressTypeModel> = {
  operating_laundromat: {
    type: 'operating_laundromat',
    usesBusinessMetrics: true,
    usesPropertyMetrics: true,
    defaultStoreSize: 'standard',
    defaultMarketTier: 'standard',
    maxRevenueMultiplier: 1.0,
    projectionNotes: 'Based on actual operating data and comparable market analysis.',
  },
  prospective_commercial: {
    type: 'prospective_commercial',
    usesBusinessMetrics: true,
    usesPropertyMetrics: true,
    defaultStoreSize: 'standard',
    defaultMarketTier: 'standard',
    maxRevenueMultiplier: 0.85, // Conservative for unproven location
    projectionNotes: 'Prospective location analysis. Actual performance depends on execution.',
  },
  residential: {
    type: 'residential',
    usesBusinessMetrics: false,
    usesPropertyMetrics: true,
    defaultStoreSize: 'small',
    defaultMarketTier: 'budget',
    maxRevenueMultiplier: 0, // No business revenue for residential
    projectionNotes: 'Residential property. Laundromat projections not applicable.',
  },
  unknown: {
    type: 'unknown',
    usesBusinessMetrics: false,
    usesPropertyMetrics: true,
    defaultStoreSize: 'small',
    defaultMarketTier: 'value',
    maxRevenueMultiplier: 0.5, // Very conservative
    projectionNotes: 'Address type could not be determined. Estimates are highly speculative.',
  },
};

// =====================================
// RESIDENTIAL INVESTMENT BENCHMARKS
// =====================================

export interface ResidentialBenchmarks {
  capRate: { low: number; average: number; high: number }; // Annual yield
  rentToValueRatio: { low: number; average: number; high: number }; // Monthly rent / property value
  appreciationRate: { low: number; average: number; high: number }; // Annual appreciation
  cashOnCashReturn: { low: number; average: number; high: number }; // With typical leverage
  vacancyRate: { low: number; average: number; high: number };
}

export const RESIDENTIAL_BENCHMARKS: ResidentialBenchmarks = {
  capRate: { low: 0.035, average: 0.055, high: 0.08 },
  rentToValueRatio: { low: 0.004, average: 0.007, high: 0.012 },
  appreciationRate: { low: 0.02, average: 0.04, high: 0.08 },
  cashOnCashReturn: { low: 0.06, average: 0.10, high: 0.18 },
  vacancyRate: { low: 0.03, average: 0.06, high: 0.12 },
};

// =====================================
// PROJECTION CALCULATION HELPERS
// =====================================

/**
 * Get confidence level based on data quality score
 */
export function getConfidenceLevel(dataQualityScore: number): ConfidenceLevel {
  if (dataQualityScore >= 70) return 'high';
  if (dataQualityScore >= 50) return 'medium';
  if (dataQualityScore >= 30) return 'low';
  return 'very_low';
}

/**
 * Determine market tier based on median income
 */
export function getMarketTierFromIncome(medianIncome: number): MarketTier {
  if (medianIncome < 35000) return 'budget';
  if (medianIncome < 50000) return 'value';
  if (medianIncome < 75000) return 'standard';
  if (medianIncome < 100000) return 'premium';
  return 'luxury';
}

/**
 * Infer store size from square footage or machine count
 */
export function inferStoreSize(sqFt?: number, machineCount?: number): StoreSizeCategory {
  if (sqFt) {
    if (sqFt <= 1800) return 'small';
    if (sqFt <= 2800) return 'standard';
    if (sqFt <= 4000) return 'large';
    return 'flagship';
  }
  if (machineCount) {
    if (machineCount <= 32) return 'small';
    if (machineCount <= 60) return 'standard';
    if (machineCount <= 90) return 'large';
    return 'flagship';
  }
  return 'standard'; // Default
}

/**
 * Calculate realistic annual revenue projection
 */
export function calculateRevenueProjection(
  washerCount: number,
  dryerCount: number,
  avgVendPrice: number,
  tpdMultiplier: number = 1.0
): { low: number; average: number; high: number } {
  const washerTPD = TPD_BENCHMARKS.washerTPD.blended;
  const dryerTPD = TPD_BENCHMARKS.dryerTPD.blended;
  const daysPerYear = 360; // Industry standard (some holidays)
  
  const washerRevenue = washerCount * avgVendPrice * daysPerYear;
  const dryerRevenue = dryerCount * (avgVendPrice * 0.4) * daysPerYear; // Dryers ~40% of washer revenue
  
  return {
    low: Math.round((washerRevenue * washerTPD.low + dryerRevenue * dryerTPD.low) * tpdMultiplier),
    average: Math.round((washerRevenue * washerTPD.average + dryerRevenue * dryerTPD.average) * tpdMultiplier),
    high: Math.round((washerRevenue * washerTPD.high + dryerRevenue * dryerTPD.high) * tpdMultiplier),
  };
}

/**
 * Calculate valuation range based on revenue and margins
 */
export function calculateValuationRange(
  annualRevenue: number,
  ebitdaMargin: number = FINANCIAL_BENCHMARKS.ebitdaMargin.average,
  sdeMargin: number = FINANCIAL_BENCHMARKS.sdeMargin.average
): { low: number; average: number; high: number; method: string } {
  const ebitda = annualRevenue * ebitdaMargin;
  const sde = annualRevenue * sdeMargin;
  
  const ebitdaValue = {
    low: ebitda * VALUATION_MULTIPLES.ebitdaMultiple.low,
    average: ebitda * VALUATION_MULTIPLES.ebitdaMultiple.average,
    high: ebitda * VALUATION_MULTIPLES.ebitdaMultiple.high,
  };
  
  const sdeValue = {
    low: sde * VALUATION_MULTIPLES.sdeMultiple.low,
    average: sde * VALUATION_MULTIPLES.sdeMultiple.average,
    high: sde * VALUATION_MULTIPLES.sdeMultiple.high,
  };
  
  // Use the higher of EBITDA or SDE valuation
  const useEBITDA = ebitdaValue.average >= sdeValue.average;
  
  return {
    low: Math.round(useEBITDA ? ebitdaValue.low : sdeValue.low),
    average: Math.round(useEBITDA ? ebitdaValue.average : sdeValue.average),
    high: Math.round(useEBITDA ? ebitdaValue.high : sdeValue.high),
    method: useEBITDA ? 'EBITDA Multiple' : 'SDE Multiple',
  };
}

/**
 * Calculate ROI potential based on purchase price and net income
 */
export function calculateROIPotential(
  purchasePrice: number,
  annualNetIncome: number
): { low: number; average: number; high: number } {
  const baseROI = (annualNetIncome / purchasePrice) * 100;
  
  return {
    low: Math.max(5, Math.round(baseROI * 0.8)), // 80% of base
    average: Math.round(baseROI),
    high: Math.min(50, Math.round(baseROI * 1.25)), // 125% of base, capped at 50%
  };
}
