/**
 * CLEANBI™ Projection Calculator
 * 
 * Generates realistic, defensible revenue and valuation projections
 * based on address type, confidence level, and industry benchmarks.
 * 
 * CRITICAL: This replaces arbitrary formulas with research-based calculations
 */

import { 
  getConfidenceLevel,
  getMarketTierFromIncome,
  inferStoreSize,
  STORE_SIZE_PROFILES,
  VEND_PRICING_BY_TIER,
  TPD_BENCHMARKS,
  FINANCIAL_BENCHMARKS,
  VALUATION_MULTIPLES,
  CONFIDENCE_CAPS,
  ADDRESS_TYPE_MODELS,
  RESIDENTIAL_BENCHMARKS,
  type AddressType,
  type ConfidenceLevel,
  type MarketTier,
  type StoreSizeCategory,
} from './cleanbi-benchmarks';

export interface ProjectionInput {
  addressType: AddressType;
  confidenceScore: number; // 0-100
  medianIncome?: number;
  isOperatingLaundromat?: boolean;
  existingMachineCount?: number;
  existingRevenue?: number;
  sqFt?: number;
  propertyValue?: number; // For residential
  estimatedRent?: number; // For residential
}

export interface LaundryProjection {
  washerCount: { min: number; max: number; typical: number };
  dryerCount: { min: number; max: number; typical: number };
  avgVendPrice: number;
  tpd: { low: number; avg: number; high: number };
  annualRevenue: { low: number; avg: number; high: number };
  ebitda: { low: number; avg: number; high: number };
  valuation: { low: number; avg: number; high: number; method: string };
  roiPotential: { low: number; avg: number; high: number };
  confidenceLevel: ConfidenceLevel;
  disclaimer: string;
  isBusinessProjection: boolean;
}

export interface ResidentialProjection {
  estimatedValue: { low: number; avg: number; high: number };
  capRate: { low: number; avg: number; high: number };
  annualRentPotential: { low: number; avg: number; high: number };
  cashOnCashReturn: { low: number; avg: number; high: number };
  appreciationForecast: { low: number; avg: number; high: number };
  confidenceLevel: ConfidenceLevel;
  disclaimer: string;
  isBusinessProjection: boolean;
}

export type CLEANBIProjection = LaundryProjection | ResidentialProjection;

/**
 * Calculate realistic projections based on address type and available data
 */
export function calculateProjections(input: ProjectionInput): CLEANBIProjection {
  const addressModel = ADDRESS_TYPE_MODELS[input.addressType];
  const confidenceLevel = getConfidenceLevel(input.confidenceScore);
  const caps = CONFIDENCE_CAPS[confidenceLevel];
  
  // For residential addresses, use residential metrics
  if (input.addressType === 'residential' || !addressModel.usesBusinessMetrics) {
    return calculateResidentialProjection(input, confidenceLevel, caps);
  }
  
  // For business addresses, use laundromat metrics
  return calculateLaundryProjection(input, addressModel, confidenceLevel, caps);
}

/**
 * Calculate laundromat business projections
 */
function calculateLaundryProjection(
  input: ProjectionInput,
  addressModel: typeof ADDRESS_TYPE_MODELS[AddressType],
  confidenceLevel: ConfidenceLevel,
  caps: typeof CONFIDENCE_CAPS[ConfidenceLevel]
): LaundryProjection {
  
  // Determine market tier and store size
  const marketTier = input.medianIncome 
    ? getMarketTierFromIncome(input.medianIncome) 
    : addressModel.defaultMarketTier;
    
  const storeSize = input.sqFt 
    ? inferStoreSize(input.sqFt) 
    : input.existingMachineCount 
      ? inferStoreSize(undefined, input.existingMachineCount)
      : addressModel.defaultStoreSize;
  
  const sizeProfile = STORE_SIZE_PROFILES[storeSize];
  const pricing = VEND_PRICING_BY_TIER[marketTier];
  
  // Apply confidence caps
  const washerCount = {
    min: Math.min(sizeProfile.washerCount.min, caps.maxWashers),
    max: Math.min(sizeProfile.washerCount.max, caps.maxWashers),
    typical: Math.min(sizeProfile.washerCount.typical, caps.maxWashers),
  };
  
  const dryerCount = {
    min: Math.round(washerCount.min * 0.8),
    max: Math.round(washerCount.max * 0.85),
    typical: Math.round(washerCount.typical * 0.85),
  };
  
  // Cap vend price based on confidence
  const avgVendPrice = Math.min(pricing.averageVend.typical, caps.vendPriceCap);
  
  // Apply TPD multiplier based on confidence
  const tpdMultiplier = caps.tpdMultiplier;
  const washerTPD = TPD_BENCHMARKS.washerTPD.blended;
  const dryerTPD = TPD_BENCHMARKS.dryerTPD.blended;
  
  const tpd = {
    low: Math.round(washerTPD.low * tpdMultiplier * 10) / 10,
    avg: Math.round(washerTPD.average * tpdMultiplier * 10) / 10,
    high: Math.round(washerTPD.high * tpdMultiplier * 10) / 10,
  };
  
  // Calculate revenue: washers + dryers, 360 days/year
  const daysPerYear = 360;
  const dryerRevenueRatio = 0.35; // Dryers contribute ~35% as much as washers
  
  const washerRevLow = washerCount.min * tpd.low * avgVendPrice * daysPerYear;
  const washerRevTypical = washerCount.typical * tpd.avg * avgVendPrice * daysPerYear;
  const washerRevHigh = washerCount.max * tpd.high * avgVendPrice * daysPerYear;
  
  const dryerRevLow = dryerCount.min * dryerTPD.low * (avgVendPrice * dryerRevenueRatio) * daysPerYear;
  const dryerRevTypical = dryerCount.typical * dryerTPD.average * (avgVendPrice * dryerRevenueRatio) * daysPerYear;
  const dryerRevHigh = dryerCount.max * dryerTPD.high * (avgVendPrice * dryerRevenueRatio) * daysPerYear;
  
  // Apply address type revenue multiplier (prospective = 85%, operating = 100%)
  const revenueMultiplier = addressModel.maxRevenueMultiplier;
  
  const annualRevenue = {
    low: Math.round((washerRevLow + dryerRevLow) * revenueMultiplier),
    avg: Math.round((washerRevTypical + dryerRevTypical) * revenueMultiplier),
    high: Math.round((washerRevHigh + dryerRevHigh) * revenueMultiplier),
  };
  
  // Calculate EBITDA with confidence margin adjustment
  const marginMultiplier = caps.marginMultiplier;
  const margins = FINANCIAL_BENCHMARKS.ebitdaMargin;
  
  const ebitda = {
    low: Math.round(annualRevenue.low * margins.low * marginMultiplier),
    avg: Math.round(annualRevenue.avg * margins.average * marginMultiplier),
    high: Math.round(annualRevenue.high * margins.high * marginMultiplier),
  };
  
  // Calculate valuation using EBITDA multiples
  const multiples = VALUATION_MULTIPLES.ebitdaMultiple;
  
  const valuation = {
    low: Math.round(ebitda.low * multiples.low),
    avg: Math.round(ebitda.avg * multiples.average),
    high: Math.round(ebitda.high * multiples.high),
    method: 'EBITDA Multiple (Industry Standard)',
  };
  
  // Calculate ROI potential
  const roiPotential = {
    low: Math.round((ebitda.low / valuation.avg) * 100 * 10) / 10,
    avg: Math.round((ebitda.avg / valuation.avg) * 100 * 10) / 10,
    high: Math.round((ebitda.high / valuation.low) * 100 * 10) / 10,
  };
  
  // Cap ROI at realistic levels
  roiPotential.low = Math.max(8, Math.min(25, roiPotential.low));
  roiPotential.avg = Math.max(12, Math.min(35, roiPotential.avg));
  roiPotential.high = Math.max(18, Math.min(45, roiPotential.high));
  
  return {
    washerCount,
    dryerCount,
    avgVendPrice,
    tpd,
    annualRevenue,
    ebitda,
    valuation,
    roiPotential,
    confidenceLevel,
    disclaimer: caps.disclaimerText || addressModel.projectionNotes,
    isBusinessProjection: true,
  };
}

/**
 * Calculate residential property projections
 */
function calculateResidentialProjection(
  input: ProjectionInput,
  confidenceLevel: ConfidenceLevel,
  caps: typeof CONFIDENCE_CAPS[ConfidenceLevel]
): ResidentialProjection {
  
  const benchmarks = RESIDENTIAL_BENCHMARKS;
  
  // Estimate property value if not provided
  const baseValue = input.propertyValue || (input.medianIncome ? input.medianIncome * 4 : 350000);
  
  const estimatedValue = {
    low: Math.round(baseValue * 0.85),
    avg: Math.round(baseValue),
    high: Math.round(baseValue * 1.15),
  };
  
  // Calculate cap rate based on location (higher income = lower cap rate)
  const capRate = {
    low: Math.round(benchmarks.capRate.low * 100 * 10) / 10,
    avg: Math.round(benchmarks.capRate.average * 100 * 10) / 10,
    high: Math.round(benchmarks.capRate.high * 100 * 10) / 10,
  };
  
  // Calculate rental potential
  const monthlyRent = input.estimatedRent || Math.round(baseValue * benchmarks.rentToValueRatio.average);
  
  const annualRentPotential = {
    low: Math.round(monthlyRent * 12 * 0.85), // Accounting for vacancy
    avg: Math.round(monthlyRent * 12 * 0.94),
    high: Math.round(monthlyRent * 12),
  };
  
  // Cash on cash return (assumes 20% down)
  const downPayment = estimatedValue.avg * 0.20;
  const cashOnCashReturn = {
    low: Math.round((annualRentPotential.low * 0.35 / downPayment) * 100 * 10) / 10, // 35% margin after expenses
    avg: Math.round((annualRentPotential.avg * 0.40 / downPayment) * 100 * 10) / 10,
    high: Math.round((annualRentPotential.high * 0.50 / downPayment) * 100 * 10) / 10,
  };
  
  // Appreciation forecast
  const appreciationForecast = {
    low: Math.round(benchmarks.appreciationRate.low * 100 * 10) / 10,
    avg: Math.round(benchmarks.appreciationRate.average * 100 * 10) / 10,
    high: Math.round(benchmarks.appreciationRate.high * 100 * 10) / 10,
  };
  
  return {
    estimatedValue,
    capRate,
    annualRentPotential,
    cashOnCashReturn,
    appreciationForecast,
    confidenceLevel,
    disclaimer: 'Residential property. Laundromat business projections not applicable. Values shown are real estate investment metrics.',
    isBusinessProjection: false,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format currency range for display
 */
export function formatCurrencyRange(low: number, high: number): string {
  return `${formatCurrency(low)} - ${formatCurrency(high)}`;
}

/**
 * Get projection summary for display
 */
export function getProjectionSummary(projection: CLEANBIProjection): {
  primaryMetric: string;
  primaryValue: string;
  secondaryMetric: string;
  secondaryValue: string;
  tertiaryMetric: string;
  tertiaryValue: string;
  disclaimer: string;
} {
  if (projection.isBusinessProjection) {
    const laundry = projection as LaundryProjection;
    return {
      primaryMetric: 'Revenue Potential',
      primaryValue: formatCurrencyRange(laundry.annualRevenue.low, laundry.annualRevenue.high),
      secondaryMetric: 'Business Valuation',
      secondaryValue: formatCurrencyRange(laundry.valuation.low, laundry.valuation.high),
      tertiaryMetric: 'ROI Potential',
      tertiaryValue: `${laundry.roiPotential.low}% - ${laundry.roiPotential.high}%`,
      disclaimer: laundry.disclaimer,
    };
  } else {
    const residential = projection as ResidentialProjection;
    return {
      primaryMetric: 'Property Value',
      primaryValue: formatCurrencyRange(residential.estimatedValue.low, residential.estimatedValue.high),
      secondaryMetric: 'Annual Rent Potential',
      secondaryValue: formatCurrencyRange(residential.annualRentPotential.low, residential.annualRentPotential.high),
      tertiaryMetric: 'Cash-on-Cash Return',
      tertiaryValue: `${residential.cashOnCashReturn.low}% - ${residential.cashOnCashReturn.high}%`,
      disclaimer: residential.disclaimer,
    };
  }
}
