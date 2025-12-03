/**
 * CLEANBI™ VALUATOR SERVICE
 * 
 * Enterprise-grade laundromat valuation engine featuring:
 * - Brand-specific depreciation curves (Speed Queen, Dexter, Maytag, etc.)
 * - EBITDA multiples tied to CLEANBI grades
 * - Equipment Fair Market Value (FMV) calculations
 * - Business valuation with income approach
 * - What-If scenario modeling for add/remove machines
 * 
 * TRADE SECRET PROTECTED - PROPRIETARY TECHNOLOGY
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { getGrade, type CLEANBIGrade } from '../shared/cleanbi-grades';

// ========================================
// TYPES & INTERFACES
// ========================================

export type MachineType = 'washer' | 'dryer' | 'combo' | 'folder' | 'ironer';
export type MachineBrand = 
  | 'speed_queen' 
  | 'dexter' 
  | 'maytag' 
  | 'lg' 
  | 'electrolux' 
  | 'huebsch' 
  | 'wascomat' 
  | 'continental_girbau' 
  | 'ipso'
  | 'alliance'
  | 'adc'
  | 'unimac'
  | 'primus'
  | 'fagor'
  | 'other';

export type MachineCapacity = 'small' | 'medium' | 'large' | 'extra_large' | 'mega';

export interface EquipmentItem {
  id: string;
  machineType: MachineType;
  brand: MachineBrand;
  model: string;
  capacity: MachineCapacity;
  ageYears: number;
  purchaseCost: number;
  quantity: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  hasCardSystem?: boolean;
  monthlyRevenue?: number;
}

export interface EquipmentValuation {
  item: EquipmentItem;
  depreciationRate: number;
  currentValue: number;
  fairMarketValue: number;
  remainingLifeYears: number;
  annualDepreciation: number;
  revenueMultiple: number;
}

export interface BusinessValuation {
  annualRevenue: number;
  annualExpenses: number;
  ebitda: number;
  ebitdaMultiple: number;
  ebitdaMultipleRange: { min: number; max: number };
  businessValue: number;
  businessValueRange: { min: number; max: number };
  cleanbiGrade: CLEANBIGrade;
  cleanbiScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface TotalValuation {
  equipmentFMV: number;
  propertyValue: number;
  businessValue: number;
  totalAssetValue: number;
  adjustments: ValuationAdjustment[];
  valuationRange: { min: number; max: number };
  methodology: string;
  generatedAt: Date;
}

export interface ValuationAdjustment {
  reason: string;
  amount: number;
  percentage: number;
  direction: 'increase' | 'decrease';
}

export interface WhatIfScenario {
  id: string;
  name: string;
  addedMachines: EquipmentItem[];
  removedMachineIds: string[];
  assumedRevenueChange: number;
  capitalRequired: number;
  newValuation: TotalValuation;
  roiEstimate: number;
  paybackMonths: number;
}

export interface ValuatorInput {
  equipment: EquipmentItem[];
  financials: {
    annualRevenue: number;
    annualExpenses: number;
    monthlyRent: number;
    monthlyUtilities: number;
    laborCosts: number;
  };
  propertyValue: number;
  cleanbiScore: number;
  cleanbiGrade: CLEANBIGrade;
  locationFactors?: {
    walkScore?: number;
    transitScore?: number;
    competitorCount?: number;
    populationDensity?: number;
  };
}

// ========================================
// DEPRECIATION CURVES BY BRAND
// ========================================

/**
 * Brand-specific depreciation data
 * Based on industry research and resale market analysis
 * 
 * residualAt5: Percentage of original value at 5 years
 * residualAt10: Percentage of original value at 10 years
 * usefulLife: Expected useful life in years
 * qualityMultiplier: Brand premium/discount factor
 */
const DEPRECIATION_CURVES: Record<MachineBrand, {
  residualAt5: number;
  residualAt10: number;
  usefulLife: number;
  qualityMultiplier: number;
  annualMaintenance: number;
}> = {
  speed_queen: {
    residualAt5: 0.70,      // 70% value at 5 years - premium brand
    residualAt10: 0.45,     // 45% value at 10 years
    usefulLife: 15,
    qualityMultiplier: 1.15,
    annualMaintenance: 0.03
  },
  dexter: {
    residualAt5: 0.65,      // 65% value at 5 years - premium brand
    residualAt10: 0.40,
    usefulLife: 14,
    qualityMultiplier: 1.10,
    annualMaintenance: 0.035
  },
  maytag: {
    residualAt5: 0.60,      // 60% value at 5 years - good brand
    residualAt10: 0.35,
    usefulLife: 12,
    qualityMultiplier: 1.05,
    annualMaintenance: 0.04
  },
  huebsch: {
    residualAt5: 0.68,      // Similar to Speed Queen (same parent company)
    residualAt10: 0.42,
    usefulLife: 14,
    qualityMultiplier: 1.12,
    annualMaintenance: 0.035
  },
  lg: {
    residualAt5: 0.55,      // Consumer-grade crossover
    residualAt10: 0.30,
    usefulLife: 10,
    qualityMultiplier: 0.95,
    annualMaintenance: 0.045
  },
  electrolux: {
    residualAt5: 0.62,
    residualAt10: 0.38,
    usefulLife: 13,
    qualityMultiplier: 1.08,
    annualMaintenance: 0.04
  },
  wascomat: {
    residualAt5: 0.64,
    residualAt10: 0.40,
    usefulLife: 14,
    qualityMultiplier: 1.08,
    annualMaintenance: 0.035
  },
  continental_girbau: {
    residualAt5: 0.66,
    residualAt10: 0.42,
    usefulLife: 14,
    qualityMultiplier: 1.10,
    annualMaintenance: 0.035
  },
  ipso: {
    residualAt5: 0.62,
    residualAt10: 0.38,
    usefulLife: 13,
    qualityMultiplier: 1.05,
    annualMaintenance: 0.04
  },
  alliance: {
    residualAt5: 0.68,      // Premium commercial
    residualAt10: 0.44,
    usefulLife: 15,
    qualityMultiplier: 1.12,
    annualMaintenance: 0.03
  },
  adc: {
    residualAt5: 0.58,      // Dryer specialist
    residualAt10: 0.35,
    usefulLife: 12,
    qualityMultiplier: 1.02,
    annualMaintenance: 0.04
  },
  unimac: {
    residualAt5: 0.67,      // Industrial/commercial
    residualAt10: 0.43,
    usefulLife: 15,
    qualityMultiplier: 1.10,
    annualMaintenance: 0.032
  },
  primus: {
    residualAt5: 0.63,
    residualAt10: 0.39,
    usefulLife: 13,
    qualityMultiplier: 1.05,
    annualMaintenance: 0.038
  },
  fagor: {
    residualAt5: 0.60,
    residualAt10: 0.36,
    usefulLife: 12,
    qualityMultiplier: 1.02,
    annualMaintenance: 0.042
  },
  other: {
    residualAt5: 0.50,      // Conservative for unknown brands
    residualAt10: 0.25,
    usefulLife: 10,
    qualityMultiplier: 0.90,
    annualMaintenance: 0.05
  }
};

// ========================================
// CAPACITY BASELINES
// ========================================

/**
 * Capacity-based baseline costs and revenue expectations
 */
const CAPACITY_BASELINES: Record<MachineCapacity, {
  washerCost: number;
  dryerCost: number;
  avgVendPrice: number;
  loadWeight: number;
  sqftRequired: number;
}> = {
  small: {
    washerCost: 3500,
    dryerCost: 2500,
    avgVendPrice: 2.75,
    loadWeight: 15,
    sqftRequired: 8
  },
  medium: {
    washerCost: 5500,
    dryerCost: 3500,
    avgVendPrice: 4.50,
    loadWeight: 25,
    sqftRequired: 12
  },
  large: {
    washerCost: 8500,
    dryerCost: 5000,
    avgVendPrice: 6.00,
    loadWeight: 35,
    sqftRequired: 16
  },
  extra_large: {
    washerCost: 12500,
    dryerCost: 7500,
    avgVendPrice: 8.50,
    loadWeight: 50,
    sqftRequired: 24
  },
  mega: {
    washerCost: 18000,
    dryerCost: 10000,
    avgVendPrice: 12.00,
    loadWeight: 80,
    sqftRequired: 32
  }
};

// ========================================
// CLEANBI GRADE TO EBITDA MULTIPLES
// ========================================

/**
 * EBITDA multiples based on CLEANBI grade
 * Reflects investor premium for higher-scoring locations
 */
const GRADE_MULTIPLES: Record<CLEANBIGrade, { min: number; mid: number; max: number }> = {
  'A': { min: 4.0, mid: 4.75, max: 5.5 },
  'B': { min: 2.8, mid: 3.4, max: 4.0 },
  'C': { min: 1.8, mid: 2.3, max: 2.8 },
  'Needs Work': { min: 0.8, mid: 1.3, max: 1.8 }
};

// ========================================
// DEPRECIATION CALCULATIONS
// ========================================

/**
 * Calculate current value using declining balance method
 * Accounts for brand quality and condition
 */
export function calculateDepreciation(
  purchaseCost: number,
  ageYears: number,
  brand: MachineBrand,
  condition?: 'excellent' | 'good' | 'fair' | 'poor'
): {
  currentValue: number;
  depreciationRate: number;
  remainingLife: number;
  annualDepreciation: number;
} {
  const curve = DEPRECIATION_CURVES[brand];
  
  // Calculate annual depreciation rate using declining balance
  const residual5 = curve.residualAt5;
  const annualRate = 1 - Math.pow(residual5, 1/5);
  
  // Calculate current value
  let currentValue = purchaseCost * Math.pow(1 - annualRate, ageYears);
  
  // Apply condition adjustment
  const conditionMultiplier = {
    excellent: 1.15,
    good: 1.0,
    fair: 0.80,
    poor: 0.55
  };
  currentValue *= conditionMultiplier[condition || 'good'];
  
  // Apply brand quality multiplier
  currentValue *= curve.qualityMultiplier;
  
  // Floor at 10% of purchase cost (salvage value)
  const salvageValue = purchaseCost * 0.10;
  currentValue = Math.max(currentValue, salvageValue);
  
  // Cap at useful life
  const remainingLife = Math.max(0, curve.usefulLife - ageYears);
  
  return {
    currentValue: Math.round(currentValue),
    depreciationRate: annualRate,
    remainingLife,
    annualDepreciation: Math.round(purchaseCost * annualRate)
  };
}

/**
 * Calculate Fair Market Value for a single equipment item
 */
export function calculateEquipmentFMV(item: EquipmentItem): EquipmentValuation {
  const { currentValue, depreciationRate, remainingLife, annualDepreciation } = 
    calculateDepreciation(item.purchaseCost, item.ageYears, item.brand, item.condition);
  
  // Revenue multiple approach (if monthly revenue provided)
  let revenueMultiple = 0;
  if (item.monthlyRevenue && item.monthlyRevenue > 0) {
    revenueMultiple = currentValue / (item.monthlyRevenue * 12);
  }
  
  // Card system premium
  let fmv = currentValue * item.quantity;
  if (item.hasCardSystem) {
    fmv *= 1.08; // 8% premium for card/app payment capability
  }
  
  return {
    item,
    depreciationRate,
    currentValue,
    fairMarketValue: Math.round(fmv),
    remainingLifeYears: remainingLife,
    annualDepreciation: annualDepreciation * item.quantity,
    revenueMultiple
  };
}

/**
 * Calculate total equipment FMV for entire inventory
 */
export function calculateTotalEquipmentFMV(equipment: EquipmentItem[]): {
  totalFMV: number;
  totalOriginalCost: number;
  weightedAge: number;
  valuations: EquipmentValuation[];
  brandBreakdown: Record<MachineBrand, { count: number; value: number }>;
  typeBreakdown: Record<MachineType, { count: number; value: number }>;
} {
  const valuations = equipment.map(calculateEquipmentFMV);
  
  const totalFMV = valuations.reduce((sum, v) => sum + v.fairMarketValue, 0);
  const totalOriginalCost = equipment.reduce((sum, e) => sum + (e.purchaseCost * e.quantity), 0);
  
  // Weighted average age
  const totalMachines = equipment.reduce((sum, e) => sum + e.quantity, 0);
  const weightedAge = equipment.reduce((sum, e) => sum + (e.ageYears * e.quantity), 0) / (totalMachines || 1);
  
  // Brand breakdown
  const brandBreakdown: Record<MachineBrand, { count: number; value: number }> = {} as any;
  valuations.forEach(v => {
    if (!brandBreakdown[v.item.brand]) {
      brandBreakdown[v.item.brand] = { count: 0, value: 0 };
    }
    brandBreakdown[v.item.brand].count += v.item.quantity;
    brandBreakdown[v.item.brand].value += v.fairMarketValue;
  });
  
  // Type breakdown
  const typeBreakdown: Record<MachineType, { count: number; value: number }> = {} as any;
  valuations.forEach(v => {
    if (!typeBreakdown[v.item.machineType]) {
      typeBreakdown[v.item.machineType] = { count: 0, value: 0 };
    }
    typeBreakdown[v.item.machineType].count += v.item.quantity;
    typeBreakdown[v.item.machineType].value += v.fairMarketValue;
  });
  
  return {
    totalFMV,
    totalOriginalCost,
    weightedAge,
    valuations,
    brandBreakdown,
    typeBreakdown
  };
}

// ========================================
// BUSINESS VALUATION
// ========================================

/**
 * Calculate business value using EBITDA approach
 * Multiple determined by CLEANBI grade
 */
export function calculateBusinessValue(
  annualRevenue: number,
  annualExpenses: number,
  cleanbiScore: number,
  cleanbiGrade: CLEANBIGrade
): BusinessValuation {
  const ebitda = annualRevenue - annualExpenses;
  const multiples = GRADE_MULTIPLES[cleanbiGrade];
  
  // Determine confidence based on data completeness
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (annualRevenue < 50000) confidence = 'low';
  else if (ebitda < 0) confidence = 'low';
  else if (annualRevenue < 100000) confidence = 'medium';
  
  // Apply score-based interpolation within grade range
  let interpolatedMultiple: number;
  if (cleanbiGrade === 'A' && cleanbiScore >= 90) {
    interpolatedMultiple = multiples.mid + (multiples.max - multiples.mid) * ((cleanbiScore - 85) / 15);
  } else if (cleanbiGrade === 'A') {
    interpolatedMultiple = multiples.mid;
  } else if (cleanbiGrade === 'B' && cleanbiScore >= 75) {
    interpolatedMultiple = multiples.mid + (multiples.max - multiples.mid) * ((cleanbiScore - 70) / 15);
  } else if (cleanbiGrade === 'B') {
    interpolatedMultiple = multiples.min + (multiples.mid - multiples.min) * ((cleanbiScore - 55) / 15);
  } else if (cleanbiGrade === 'C') {
    interpolatedMultiple = multiples.min + (multiples.mid - multiples.min) * ((cleanbiScore - 40) / 15);
  } else {
    interpolatedMultiple = multiples.min + (multiples.mid - multiples.min) * (cleanbiScore / 55);
  }
  
  interpolatedMultiple = Math.max(multiples.min, Math.min(multiples.max, interpolatedMultiple));
  
  return {
    annualRevenue,
    annualExpenses,
    ebitda: Math.round(ebitda),
    ebitdaMultiple: Math.round(interpolatedMultiple * 100) / 100,
    ebitdaMultipleRange: { min: multiples.min, max: multiples.max },
    businessValue: Math.round(ebitda * interpolatedMultiple),
    businessValueRange: {
      min: Math.round(ebitda * multiples.min),
      max: Math.round(ebitda * multiples.max)
    },
    cleanbiGrade,
    cleanbiScore,
    confidenceLevel: confidence
  };
}

// ========================================
// TOTAL VALUATION
// ========================================

/**
 * Calculate complete valuation including:
 * - Equipment Fair Market Value
 * - Property Value (from ATTOM or estimate)
 * - Business Value (EBITDA × Multiple)
 */
export function calculateTotalValuation(input: ValuatorInput): TotalValuation {
  // Equipment valuation
  const equipmentResult = calculateTotalEquipmentFMV(input.equipment);
  
  // Business valuation
  const businessResult = calculateBusinessValue(
    input.financials.annualRevenue,
    input.financials.annualExpenses,
    input.cleanbiScore,
    input.cleanbiGrade
  );
  
  // Adjustments
  const adjustments: ValuationAdjustment[] = [];
  let adjustedBusinessValue = businessResult.businessValue;
  
  // Walk Score premium/discount
  if (input.locationFactors?.walkScore) {
    if (input.locationFactors.walkScore >= 90) {
      adjustments.push({
        reason: "Walker's Paradise Location Premium",
        amount: Math.round(adjustedBusinessValue * 0.05),
        percentage: 5,
        direction: 'increase'
      });
      adjustedBusinessValue *= 1.05;
    } else if (input.locationFactors.walkScore < 50) {
      adjustments.push({
        reason: "Car-Dependent Location Discount",
        amount: Math.round(adjustedBusinessValue * 0.03),
        percentage: 3,
        direction: 'decrease'
      });
      adjustedBusinessValue *= 0.97;
    }
  }
  
  // Competition adjustment
  if (input.locationFactors?.competitorCount !== undefined) {
    if (input.locationFactors.competitorCount === 0) {
      adjustments.push({
        reason: "Zero Competition Premium",
        amount: Math.round(adjustedBusinessValue * 0.08),
        percentage: 8,
        direction: 'increase'
      });
      adjustedBusinessValue *= 1.08;
    } else if (input.locationFactors.competitorCount >= 5) {
      adjustments.push({
        reason: "High Competition Discount",
        amount: Math.round(adjustedBusinessValue * 0.05),
        percentage: 5,
        direction: 'decrease'
      });
      adjustedBusinessValue *= 0.95;
    }
  }
  
  // Equipment age adjustment
  if (equipmentResult.weightedAge <= 3) {
    adjustments.push({
      reason: "New Equipment Premium",
      amount: Math.round(adjustedBusinessValue * 0.04),
      percentage: 4,
      direction: 'increase'
    });
    adjustedBusinessValue *= 1.04;
  } else if (equipmentResult.weightedAge >= 10) {
    adjustments.push({
      reason: "Aging Equipment Discount",
      amount: Math.round(adjustedBusinessValue * 0.06),
      percentage: 6,
      direction: 'decrease'
    });
    adjustedBusinessValue *= 0.94;
  }
  
  const totalAssetValue = equipmentResult.totalFMV + input.propertyValue + Math.round(adjustedBusinessValue);
  
  // Calculate range
  const minValue = equipmentResult.totalFMV + input.propertyValue + businessResult.businessValueRange.min;
  const maxValue = equipmentResult.totalFMV + input.propertyValue + businessResult.businessValueRange.max;
  
  return {
    equipmentFMV: equipmentResult.totalFMV,
    propertyValue: input.propertyValue,
    businessValue: Math.round(adjustedBusinessValue),
    totalAssetValue,
    adjustments,
    valuationRange: {
      min: Math.round(minValue * 0.95),
      max: Math.round(maxValue * 1.05)
    },
    methodology: 'CLEANBI-Enhanced Income Approach with Asset Adjustment',
    generatedAt: new Date()
  };
}

// ========================================
// WHAT-IF SCENARIOS
// ========================================

/**
 * Calculate What-If scenario impact
 */
export function calculateWhatIfScenario(
  baseInput: ValuatorInput,
  addedMachines: EquipmentItem[],
  removedMachineIds: string[],
  revenueAssumption: 'conservative' | 'moderate' | 'optimistic' = 'moderate'
): WhatIfScenario {
  // Remove specified machines
  const filteredEquipment = baseInput.equipment.filter(e => !removedMachineIds.includes(e.id));
  
  // Add new machines
  const newEquipment = [...filteredEquipment, ...addedMachines];
  
  // Calculate capital required
  const capitalRequired = addedMachines.reduce((sum, m) => sum + (m.purchaseCost * m.quantity), 0);
  
  // Estimate revenue change
  const revenueMultipliers = {
    conservative: 0.7,
    moderate: 1.0,
    optimistic: 1.3
  };
  
  // Revenue from removed machines (use monthly revenue or estimate)
  const removedRevenue = baseInput.equipment
    .filter(e => removedMachineIds.includes(e.id))
    .reduce((sum, e) => {
      const monthlyRev = e.monthlyRevenue || (CAPACITY_BASELINES[e.capacity].avgVendPrice * 3 * 30); // 3 turns/day
      return sum + (monthlyRev * 12 * e.quantity);
    }, 0);
  
  // Revenue from added machines
  const addedRevenue = addedMachines.reduce((sum, m) => {
    const capacity = CAPACITY_BASELINES[m.capacity];
    const estimatedMonthlyTurns = 90; // 3 turns/day × 30 days
    const monthlyRev = capacity.avgVendPrice * estimatedMonthlyTurns * revenueMultipliers[revenueAssumption];
    return sum + (monthlyRev * 12 * m.quantity);
  }, 0);
  
  const revenueChange = addedRevenue - removedRevenue;
  
  // Create new input with adjusted financials
  const newInput: ValuatorInput = {
    ...baseInput,
    equipment: newEquipment,
    financials: {
      ...baseInput.financials,
      annualRevenue: baseInput.financials.annualRevenue + revenueChange,
      annualExpenses: baseInput.financials.annualExpenses + (revenueChange * 0.35) // 35% expense ratio
    }
  };
  
  // Calculate new valuation
  const newValuation = calculateTotalValuation(newInput);
  const baseValuation = calculateTotalValuation(baseInput);
  
  // ROI and payback
  const valuationIncrease = newValuation.totalAssetValue - baseValuation.totalAssetValue;
  const roiEstimate = capitalRequired > 0 ? ((valuationIncrease / capitalRequired) * 100) : 0;
  const monthlyNetIncrease = revenueChange * 0.65 / 12; // 65% margin
  const paybackMonths = monthlyNetIncrease > 0 ? Math.ceil(capitalRequired / monthlyNetIncrease) : 0;
  
  return {
    id: `scenario_${Date.now()}`,
    name: `${addedMachines.length > 0 ? `+${addedMachines.reduce((s, m) => s + m.quantity, 0)} machines` : ''}${removedMachineIds.length > 0 ? ` -${removedMachineIds.length} removed` : ''}`,
    addedMachines,
    removedMachineIds,
    assumedRevenueChange: Math.round(revenueChange),
    capitalRequired,
    newValuation,
    roiEstimate: Math.round(roiEstimate * 10) / 10,
    paybackMonths
  };
}

// ========================================
// HELPER EXPORTS
// ========================================

export function getBrandInfo(brand: MachineBrand) {
  return DEPRECIATION_CURVES[brand];
}

export function getCapacityInfo(capacity: MachineCapacity) {
  return CAPACITY_BASELINES[capacity];
}

export function getGradeMultiples(grade: CLEANBIGrade) {
  return GRADE_MULTIPLES[grade];
}

export function estimateReplacementCost(machineType: MachineType, capacity: MachineCapacity): number {
  const baseline = CAPACITY_BASELINES[capacity];
  return machineType === 'dryer' ? baseline.dryerCost : baseline.washerCost;
}

export const BRAND_DISPLAY_NAMES: Record<MachineBrand, string> = {
  speed_queen: 'Speed Queen',
  dexter: 'Dexter',
  maytag: 'Maytag',
  lg: 'LG Commercial',
  electrolux: 'Electrolux',
  huebsch: 'Huebsch',
  wascomat: 'Wascomat',
  continental_girbau: 'Continental Girbau',
  ipso: 'IPSO',
  alliance: 'Alliance',
  adc: 'ADC',
  unimac: 'UniMac',
  primus: 'Primus',
  fagor: 'Fagor',
  other: 'Other'
};

export const CAPACITY_DISPLAY_NAMES: Record<MachineCapacity, string> = {
  small: 'Small (15-20 lbs)',
  medium: 'Medium (20-30 lbs)',
  large: 'Large (30-40 lbs)',
  extra_large: 'Extra Large (40-60 lbs)',
  mega: 'Mega (60-80+ lbs)'
};

export const MACHINE_TYPE_DISPLAY_NAMES: Record<MachineType, string> = {
  washer: 'Washer',
  dryer: 'Dryer',
  combo: 'Washer/Dryer Combo',
  folder: 'Folder',
  ironer: 'Ironer'
};
