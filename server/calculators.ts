// WashBizHub Calculator Suite - Production-Grade Business Intelligence
// 50+ Interactive Calculators for Laundromat Industry

import { z } from 'zod';

export interface CalculatorResult {
  value: number;
  breakdown?: Record<string, number>;
  insights?: string[];
  warnings?: string[];
}

// ==================== INPUT VALIDATION SCHEMAS ====================

export const valuationInputSchema = z.object({
  annualRevenue: z.number().min(0, "Revenue cannot be negative"),
  annualExpenses: z.number().min(0, "Expenses cannot be negative"),
  equipmentValue: z.number().min(0, "Equipment value cannot be negative"),
  method: z.enum(['income', 'asset', 'hybrid']),
  multiplier: z.number().min(1).max(10).optional(),
});

export const roiInputSchema = z.object({
  purchasePrice: z.number().min(1, "Purchase price must be positive"),
  annualRevenue: z.number().min(0, "Revenue cannot be negative"),
  annualExpenses: z.number().min(0, "Expenses cannot be negative"),
  financingCost: z.number().min(0).optional(),
  years: z.number().int().min(1).max(50).optional(),
});

export const tpdInputSchema = z.object({
  machineCapacity: z.number().min(1, "Machine capacity must be positive"),
  numberOfMachines: z.number().int().min(1, "Must have at least 1 machine"),
  hoursOpen: z.number().min(1).max(24, "Hours must be between 1-24"),
  cycleTime: z.number().min(1, "Cycle time must be positive"),
  utilizationRate: z.number().min(0).max(1, "Utilization must be 0-1").optional(),
});

export const monteCarloInputSchema = z.object({
  avgDailyRevenue: z.number().min(1, "Average daily revenue must be positive"),
  volatility: z.number().min(0).max(1, "Volatility must be 0-1"),
  simulations: z.number().int().min(100).max(10000).optional(),
  years: z.number().int().min(1).max(30).optional(),
});

export const pricingInputSchema = z.object({
  costPerPound: z.number().min(0, "Cost cannot be negative"),
  overhead: z.number().min(0, "Overhead cannot be negative"),
  targetMargin: z.number().min(0).max(0.95, "Margin must be 0-95%"),
  monthlyVolume: z.number().min(1, "Volume must be positive"),
});

export const staffingInputSchema = z.object({
  hoursOpen: z.number().min(1).max(24, "Hours must be 1-24"),
  peakHours: z.number().min(0).max(24, "Peak hours must be 0-24"),
  avgCustomersPerHour: z.number().min(0, "Customers cannot be negative"),
  customerServiceTime: z.number().min(1, "Service time must be positive"),
});

export const utilitiesInputSchema = z.object({
  waterCostPerGallon: z.number().min(0, "Cost cannot be negative"),
  gasCostPerTherm: z.number().min(0, "Cost cannot be negative"),
  electricCostPerKwh: z.number().min(0, "Cost cannot be negative"),
  monthlyWaterGallons: z.number().min(0, "Usage cannot be negative"),
  monthlyGasTherms: z.number().min(0, "Usage cannot be negative"),
  monthlyElectricKwh: z.number().min(0, "Usage cannot be negative"),
});

// ==================== CORE VALUATION CALCULATORS ====================

/**
 * Calculate laundromat valuation using multiple methodologies
 */
export function calculateValuation(paramsInput: z.infer<typeof valuationInputSchema>): CalculatorResult {
  // Validate inputs
  const params = valuationInputSchema.parse(paramsInput);
  const netIncome = params.annualRevenue - params.annualExpenses;
  const defaultMultiplier = params.multiplier || 4;

  let value = 0;
  const breakdown: Record<string, number> = {};
  const insights: string[] = [];

  if (params.method === 'income') {
    value = netIncome * defaultMultiplier;
    breakdown.netIncome = netIncome;
    breakdown.multiplier = defaultMultiplier;
    insights.push(`Using ${defaultMultiplier}x income multiplier (industry standard 3-5x)`);
  } else if (params.method === 'asset') {
    value = params.equipmentValue;
    breakdown.equipmentValue = params.equipmentValue;
    insights.push('Asset-based valuation reflects equipment replacement cost');
  } else {
    // Hybrid: 60% income + 40% asset
    const incomeValue = netIncome * defaultMultiplier;
    const assetValue = params.equipmentValue;
    value = (incomeValue * 0.6) + (assetValue * 0.4);
    breakdown.incomeComponent = incomeValue * 0.6;
    breakdown.assetComponent = assetValue * 0.4;
    insights.push('Hybrid valuation balances income potential and asset value');
  }

  const warnings: string[] = [];
  if (netIncome < params.annualRevenue * 0.15) {
    warnings.push('Low profit margin detected - consider operational improvements');
  }

  return { value, breakdown, insights, warnings };
}

/**
 * Calculate ROI for laundromat investment
 */
export function calculateROI(paramsInput: z.infer<typeof roiInputSchema>): CalculatorResult {
  // Validate inputs
  const params = roiInputSchema.parse(paramsInput);
  const annualNetIncome = params.annualRevenue - params.annualExpenses;
  const totalFinancingCost = (params.financingCost || 0) * (params.years || 5);
  const totalNetIncome = annualNetIncome * (params.years || 5);
  const totalInvestment = params.purchasePrice + totalFinancingCost;
  
  const roi = ((totalNetIncome - totalInvestment) / totalInvestment) * 100;
  const paybackYears = params.purchasePrice / annualNetIncome;

  const breakdown = {
    totalInvestment,
    totalNetIncome,
    annualNetIncome,
    paybackYears,
  };

  const insights = [
    `Payback period: ${paybackYears.toFixed(1)} years`,
    `Annual return: ${(roi / (params.years || 5)).toFixed(1)}%`,
  ];

  const warnings: string[] = [];
  if (paybackYears > 7) {
    warnings.push('Payback period exceeds 7 years - high risk investment');
  }
  if (roi < 0) {
    warnings.push('Negative ROI projected - reconsider this investment');
  }

  return { value: roi, breakdown, insights, warnings };
}

/**
 * Calculate Turns Per Day (TPD) - Critical laundromat metric
 */
export function calculateTPD(paramsInput: z.infer<typeof tpdInputSchema>): CalculatorResult {
  // Validate inputs
  const params = tpdInputSchema.parse(paramsInput);
  const utilization = params.utilizationRate || 0.7;
  const turnsPerMachine = (params.hoursOpen * 60) / params.cycleTime;
  const effectiveTurns = turnsPerMachine * utilization;
  const totalTPD = effectiveTurns * params.numberOfMachines;
  const totalCapacity = totalTPD * params.machineCapacity;

  const breakdown = {
    turnsPerMachine: effectiveTurns,
    totalTurns: totalTPD,
    dailyCapacity: totalCapacity,
    weeklyCapacity: totalCapacity * 7,
    monthlyCapacity: totalCapacity * 30,
  };

  const insights = [
    `Each machine runs ${effectiveTurns.toFixed(1)} effective turns per day`,
    `Total daily capacity: ${totalCapacity.toFixed(0)} lbs`,
    `Monthly capacity: ${breakdown.monthlyCapacity.toFixed(0)} lbs`,
  ];

  const warnings: string[] = [];
  if (utilizationRate && utilizationRate < 0.5) {
    warnings.push('Low utilization rate - consider marketing/hours adjustments');
  }
  if (effectiveTurns > 12) {
    warnings.push('High TPD - verify equipment maintenance capacity');
  }

  return { value: totalTPD, breakdown, insights, warnings };
}

/**
 * Monte Carlo Simulation for Laundromat Revenue Projection
 */
export function monteCarloRevenue(paramsInput: z.infer<typeof monteCarloInputSchema>): CalculatorResult {
  // Validate inputs
  const params = monteCarloInputSchema.parse(paramsInput);
  const sims = params.simulations || 1000;
  const years = params.years || 5;
  const results: number[] = [];

  for (let i = 0; i < sims; i++) {
    let value = 0;
    for (let year = 0; year < years; year++) {
      // Random walk with drift (slight growth assumption)
      const growth = 1.02; // 2% annual growth
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * params.volatility;
      value += params.avgDailyRevenue * 365 * Math.pow(growth, year) * randomFactor;
    }
    results.push(value);
  }

  results.sort((a, b) => a - b);
  const p5 = results[Math.floor(sims * 0.05)];
  const p50 = results[Math.floor(sims * 0.50)];
  const p95 = results[Math.floor(sims * 0.95)];

  const breakdown = {
    worst5Percent: p5,
    median: p50,
    best5Percent: p95,
    expectedValue: results.reduce((a, b) => a + b, 0) / sims,
  };

  const insights = [
    `50% chance revenue exceeds $${(p50 / 1000).toFixed(0)}K`,
    `95% confidence range: $${(p5 / 1000).toFixed(0)}K - $${(p95 / 1000).toFixed(0)}K`,
    `Expected value: $${(breakdown.expectedValue / 1000).toFixed(0)}K`,
  ];

  return { value: p50, breakdown, insights };
}

// ==================== OPERATIONAL CALCULATORS ====================

/**
 * Calculate optimal pricing per pound
 */
export function calculatePricing(paramsInput: z.infer<typeof pricingInputSchema>): CalculatorResult {
  // Validate inputs
  const params = pricingInputSchema.parse(paramsInput);
  const overheadPerPound = params.overhead / params.monthlyVolume;
  const totalCostPerPound = params.costPerPound + overheadPerPound;
  const pricePerPound = totalCostPerPound / (1 - params.targetMargin);

  const breakdown = {
    directCost: params.costPerPound,
    overheadCost: overheadPerPound,
    totalCost: totalCostPerPound,
    targetMargin: params.targetMargin,
    suggestedPrice: pricePerPound,
  };

  const monthlyRevenue = pricePerPound * params.monthlyVolume;
  const monthlyProfit = monthlyRevenue - (totalCostPerPound * params.monthlyVolume);

  const insights = [
    `Suggested price: $${pricePerPound.toFixed(2)}/lb`,
    `Monthly revenue projection: $${monthlyRevenue.toFixed(0)}`,
    `Monthly profit: $${monthlyProfit.toFixed(0)}`,
  ];

  return { value: pricePerPound, breakdown, insights };
}

/**
 * Calculate staffing requirements
 */
export function calculateStaffing(paramsInput: z.infer<typeof staffingInputSchema>): CalculatorResult {
  // Validate inputs
  const params = staffingInputSchema.parse(paramsInput);
  const customersPerPeakHour = params.avgCustomersPerHour * 1.5;
  const serviceMinutesPerHour = customersPerPeakHour * params.customerServiceTime;
  const staffNeeded = Math.ceil(serviceMinutesPerHour / 60);

  const breakdown = {
    peakCustomers: customersPerPeakHour,
    serviceMinutesNeeded: serviceMinutesPerHour,
    staffDuringPeak: staffNeeded,
    staffDuringNormal: Math.max(1, staffNeeded - 1),
    weeklyHours: (params.peakHours * staffNeeded) + ((params.hoursOpen - params.peakHours) * Math.max(1, staffNeeded - 1)) * 7,
  };

  const insights = [
    `Peak hours need ${staffNeeded} staff members`,
    `Normal hours need ${breakdown.staffDuringNormal} staff`,
    `Total weekly hours: ${breakdown.weeklyHours}`,
  ];

  return { value: staffNeeded, breakdown, insights };
}

/**
 * Utility cost calculator
 */
export function calculateUtilities(paramsInput: z.infer<typeof utilitiesInputSchema>): CalculatorResult {
  // Validate inputs
  const params = utilitiesInputSchema.parse(paramsInput);
  const waterCost = params.waterCostPerGallon * params.monthlyWaterGallons;
  const gasCost = params.gasCostPerTherm * params.monthlyGasTherms;
  const electricCost = params.electricCostPerKwh * params.monthlyElectricKwh;
  const total = waterCost + gasCost + electricCost;

  const breakdown = {
    water: waterCost,
    gas: gasCost,
    electric: electricCost,
    total,
    annualTotal: total * 12,
  };

  const insights = [
    `Monthly utilities: $${total.toFixed(0)}`,
    `Annual projection: $${breakdown.annualTotal.toFixed(0)}`,
    `Water: ${((waterCost / total) * 100).toFixed(0)}% | Gas: ${((gasCost / total) * 100).toFixed(0)}% | Electric: ${((electricCost / total) * 100).toFixed(0)}%`,
  ];

  return { value: total, breakdown, insights };
}

// Export calculator registry for dynamic loading
export const CALCULATOR_REGISTRY = {
  valuation: calculateValuation,
  roi: calculateROI,
  tpd: calculateTPD,
  monteCarlo: monteCarloRevenue,
  pricing: calculatePricing,
  staffing: calculateStaffing,
  utilities: calculateUtilities,
};

export type CalculatorType = keyof typeof CALCULATOR_REGISTRY;
