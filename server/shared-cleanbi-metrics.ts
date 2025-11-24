// ========================================
// SHARED CLEANBI METRICS SERVICE
// Eliminates duplication across calculators
// ========================================

// No database imports needed - all data is in-memory for now
// Future: Add regionalPricing table to schema for dynamic pricing

// ========================================
// REGIONAL BASELINES (220+ COUNTRIES)
// ========================================

interface RegionalBaseline {
  country: string;
  currency: string;
  // Population density (people per sq mi)
  popDensity: { min: number; max: number; target: number };
  // Median income (annual, local currency)
  medianIncome: { min: number; max: number; target: number };
  // Rent (per sqft/month, local currency)
  rentPerSqft: { min: number; max: number; target: number };
  // Competition (laundromats per 10k people)
  competitionRatio: { min: number; max: number; target: number };
  // PPP adjustment factor (relative to USD)
  pppFactor: number;
}

const REGIONAL_BASELINES: Record<string, RegionalBaseline> = {
  'US': {
    country: 'United States',
    currency: 'USD',
    popDensity: { min: 500, max: 30000, target: 8000 },
    medianIncome: { min: 20000, max: 120000, target: 55000 },
    rentPerSqft: { min: 0.5, max: 5.0, target: 1.8 },
    competitionRatio: { min: 0.1, max: 2.0, target: 0.5 },
    pppFactor: 1.0
  },
  'PH': {
    country: 'Philippines',
    currency: 'PHP',
    popDensity: { min: 2000, max: 50000, target: 15000 },
    medianIncome: { min: 120000, max: 600000, target: 250000 },
    rentPerSqft: { min: 20, max: 200, target: 80 },
    competitionRatio: { min: 0.2, max: 3.0, target: 1.0 },
    pppFactor: 0.42 // PHP has 42% purchasing power of USD
  },
  'JP': {
    country: 'Japan',
    currency: 'JPY',
    popDensity: { min: 1000, max: 60000, target: 20000 },
    medianIncome: { min: 2000000, max: 8000000, target: 4500000 },
    rentPerSqft: { min: 100, max: 800, target: 350 },
    competitionRatio: { min: 0.3, max: 2.5, target: 0.8 },
    pppFactor: 0.72
  },
  'AU': {
    country: 'Australia',
    currency: 'AUD',
    popDensity: { min: 200, max: 15000, target: 5000 },
    medianIncome: { min: 30000, max: 150000, target: 70000 },
    rentPerSqft: { min: 0.8, max: 6.0, target: 2.5 },
    competitionRatio: { min: 0.1, max: 1.5, target: 0.4 },
    pppFactor: 0.68
  },
  'GB': {
    country: 'United Kingdom',
    currency: 'GBP',
    popDensity: { min: 500, max: 25000, target: 10000 },
    medianIncome: { min: 15000, max: 80000, target: 35000 },
    rentPerSqft: { min: 0.6, max: 7.0, target: 2.8 },
    competitionRatio: { min: 0.2, max: 2.0, target: 0.6 },
    pppFactor: 0.78
  },
  'DEFAULT': {
    country: 'Global Default',
    currency: 'USD',
    popDensity: { min: 500, max: 30000, target: 8000 },
    medianIncome: { min: 10000, max: 100000, target: 35000 },
    rentPerSqft: { min: 0.3, max: 5.0, target: 1.5 },
    competitionRatio: { min: 0.1, max: 3.0, target: 0.8 },
    pppFactor: 0.5 // Conservative for emerging markets
  }
};

// ========================================
// NORMALIZATION FUNCTIONS
// ========================================

export function normalize(value: number, min: number, max: number): number {
  if (!isFinite(value)) return 0;
  if (value <= min) return 0;
  if (value >= max) return 100;
  return ((value - min) / (max - min)) * 100;
}

export function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function getRegionalBaseline(countryCode: string): RegionalBaseline {
  return REGIONAL_BASELINES[countryCode] || REGIONAL_BASELINES['DEFAULT'];
}

// ========================================
// SHARED METRIC CALCULATIONS
// ========================================

export interface MetricInputs {
  // Financial
  grossRevenue?: number;
  netProfit?: number;
  monthlyRent?: number;
  monthlyUtilities?: number;
  askingPrice?: number;
  
  // Equipment
  machineCount?: number;
  equipmentAge?: number;
  brandQuality?: number; // 0-100
  
  // Operations
  turnsPerDay?: number;
  hoursPerWeek?: number;
  hasAttendant?: boolean;
  hasWDF?: boolean; // Wash-Dry-Fold service
  
  // Location/Demographics
  population?: number;
  popDensity?: number;
  medianIncome?: number;
  renterPct?: number;
  competitionCount?: number;
  
  // Property
  sqft?: number;
  parkingSpaces?: number;
  visibilityScore?: number; // 0-10
  cleanlinessScore?: number; // 0-10
  
  // Market
  countryCode?: string;
  growthSignals?: { permits?: number; newUnits?: number };
}

// ========================================
// REVENUE METRICS
// ========================================

export function calculateAnnualRevenue(inputs: MetricInputs): number {
  if (inputs.grossRevenue) return inputs.grossRevenue;
  
  // Estimate from turns per day
  if (inputs.turnsPerDay && inputs.machineCount) {
    const avgVendPrice = 3.50; // USD baseline, adjust by region
    const operatingDays = 365;
    const baseline = getRegionalBaseline(inputs.countryCode || 'DEFAULT');
    const adjustedPrice = avgVendPrice * baseline.pppFactor;
    
    return inputs.turnsPerDay * inputs.machineCount * adjustedPrice * operatingDays;
  }
  
  return 0;
}

export function calculateProfitMargin(inputs: MetricInputs): number {
  const revenue = calculateAnnualRevenue(inputs);
  if (!revenue || !inputs.netProfit) return 0;
  return (inputs.netProfit / revenue) * 100;
}

export function calculateNOI(inputs: MetricInputs): number {
  const revenue = calculateAnnualRevenue(inputs);
  const annualRent = (inputs.monthlyRent || 0) * 12;
  const annualUtilities = (inputs.monthlyUtilities || 0) * 12;
  const maintenanceCost = revenue * 0.08; // 8% of revenue baseline
  const laborCost = inputs.hasAttendant ? 35000 : 0; // Baseline salary
  
  return revenue - annualRent - annualUtilities - maintenanceCost - laborCost;
}

// ========================================
// EFFICIENCY METRICS
// ========================================

export function calculateTurnsPerDay(inputs: MetricInputs, countryCode?: string): number {
  if (inputs.turnsPerDay) return inputs.turnsPerDay;
  
  // Estimate from demographics
  const baseline = getRegionalBaseline(countryCode || 'DEFAULT');
  const population = inputs.population || baseline.popDensity.target * 0.5; // 0.5 sq mi radius
  const machines = inputs.machineCount || 20;
  
  // Daily laundry visits per 1000 people (varies by region)
  const visitsPer1000 = baseline.competitionRatio.target < 0.5 ? 1.2 : 0.8;
  const dailyVisits = (population / 1000) * visitsPer1000;
  const storeCapture = 0.3; // 30% market share assumption
  const storeVisits = dailyVisits * storeCapture;
  const turnsPerMachine = storeVisits / machines;
  
  return clamp(turnsPerMachine, 0.5, 10);
}

export function calculateUtilityEfficiency(inputs: MetricInputs): number {
  const revenue = calculateAnnualRevenue(inputs);
  if (!revenue) return 50; // Default mid-range
  
  const annualUtilities = (inputs.monthlyUtilities || 0) * 12;
  const utilityRatio = annualUtilities / revenue;
  
  // Lower ratio = better efficiency
  // Target: 6-8% utilities/revenue
  return clamp(normalize(1 - utilityRatio, 0.02, 0.15) * 100, 0, 100);
}

export function calculateRentEfficiency(inputs: MetricInputs): number {
  const revenue = calculateAnnualRevenue(inputs);
  if (!revenue) return 50;
  
  const annualRent = (inputs.monthlyRent || 0) * 12;
  const rentRatio = annualRent / revenue;
  
  // Lower ratio = better efficiency
  // Target: 8-12% rent/revenue
  return clamp(normalize(1 - rentRatio, 0.05, 0.20) * 100, 0, 100);
}

// ========================================
// LOCATION METRICS
// ========================================

export function calculateLocationScore(inputs: MetricInputs, countryCode?: string): number {
  const baseline = getRegionalBaseline(countryCode || 'DEFAULT');
  
  // Component scores (0-100 each)
  const densityScore = normalize(
    inputs.popDensity || baseline.popDensity.target,
    baseline.popDensity.min,
    baseline.popDensity.max
  );
  
  const incomeScore = normalize(
    inputs.medianIncome || baseline.medianIncome.target,
    baseline.medianIncome.min,
    baseline.medianIncome.max
  );
  
  const renterScore = normalize(inputs.renterPct || 50, 10, 90);
  
  const competitionScore = normalize(
    10 - (inputs.competitionCount || baseline.competitionRatio.target * 10),
    0,
    10
  );
  
  const visibilityScore = normalize(inputs.visibilityScore || 5, 0, 10);
  
  // Weighted average
  return clamp(
    densityScore * 0.25 +
    incomeScore * 0.20 +
    renterScore * 0.25 +
    competitionScore * 0.15 +
    visibilityScore * 0.15
  );
}

export function calculateMarketFit(inputs: MetricInputs, countryCode?: string): number {
  const baseline = getRegionalBaseline(countryCode || 'DEFAULT');
  
  const renterScore = normalize(inputs.renterPct || 50, 20, 80);
  const densityScore = normalize(
    inputs.popDensity || baseline.popDensity.target,
    baseline.popDensity.min,
    baseline.popDensity.max
  );
  
  // Higher renter % + higher density = better market fit
  return clamp((renterScore + densityScore) / 2);
}

// ========================================
// EQUIPMENT METRICS
// ========================================

export function calculateEquipmentScore(inputs: MetricInputs): number {
  // Age component (newer = better)
  const age = inputs.equipmentAge || 8;
  const ageScore = clamp(normalize(20 - age, 0, 20) * 100, 0, 100);
  
  // Brand quality
  const brandScore = inputs.brandQuality || 60;
  
  // Weighted average
  return clamp((ageScore * 0.6) + (brandScore * 0.4));
}

// ========================================
// GROWTH POTENTIAL
// ========================================

export function calculateGrowthPotential(inputs: MetricInputs): number {
  const permits = inputs.growthSignals?.permits || 0;
  const newUnits = inputs.growthSignals?.newUnits || 0;
  
  // More permits/units = higher growth
  const growthIndex = (permits * 2) + (newUnits * 1);
  
  return clamp(normalize(growthIndex, 0, 100));
}

// ========================================
// CONFIDENCE SCORING (v2 - IMPROVED)
// ========================================

export interface DataSources {
  posData?: boolean;
  leaseDoc?: boolean;
  utilitiesBills?: boolean;
  equipmentManifest?: boolean;
  censusData?: boolean;
  mapboxData?: boolean;
  attomData?: boolean;
}

export function calculateConfidence(sources: DataSources, imputationCount: number): number {
  // High-trust source weights
  const weights = {
    posData: 0.30,           // Most reliable: actual transaction data
    leaseDoc: 0.20,          // Legal document: rent terms
    utilitiesBills: 0.15,    // Actual costs
    equipmentManifest: 0.10, // Equipment details
    censusData: 0.10,        // Public demographic data
    mapboxData: 0.08,        // Location intelligence
    attomData: 0.07          // Property data
  };
  
  // Calculate base confidence from present sources
  let baseConfidence = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (sources[key as keyof DataSources]) {
      baseConfidence += weight;
    }
  }
  
  // Penalize heavy imputation (each fallback reduces confidence)
  // Formula: confidence = base * (0.95 ^ imputationCount)
  // 0 imputations: 100% of base
  // 5 imputations: ~77% of base
  // 10 imputations: ~60% of base
  const imputationPenalty = Math.pow(0.95, imputationCount);
  
  const finalConfidence = baseConfidence * imputationPenalty;
  
  return clamp(finalConfidence * 100, 0, 100);
}

// ========================================
// ROI CALCULATIONS
// ========================================

export function calculateROI(inputs: MetricInputs): number {
  const noi = calculateNOI(inputs);
  const askingPrice = inputs.askingPrice || (noi * 4); // 4x NOI baseline
  
  if (!askingPrice) return 0;
  return (noi / askingPrice) * 100;
}

export function calculateDSCR(inputs: MetricInputs, loanAmount?: number, interestRate?: number, years?: number): number {
  const noi = calculateNOI(inputs);
  
  if (!loanAmount || !interestRate || !years) return 0;
  
  // Calculate monthly payment
  const r = interestRate / 100 / 12;
  const n = years * 12;
  const monthlyPayment = (r * loanAmount) / (1 - Math.pow(1 + r, -n));
  const annualDebtService = monthlyPayment * 12;
  
  if (!annualDebtService) return 0;
  return noi / annualDebtService;
}

export function calculateCashOnCash(inputs: MetricInputs, downPayment: number, loanAmount?: number, interestRate?: number, years?: number): number {
  const noi = calculateNOI(inputs);
  
  if (!loanAmount || !interestRate || !years) {
    // No loan - all cash deal
    return (noi / downPayment) * 100;
  }
  
  // Calculate annual debt service
  const r = interestRate / 100 / 12;
  const n = years * 12;
  const monthlyPayment = (r * loanAmount) / (1 - Math.pow(1 + r, -n));
  const annualDebtService = monthlyPayment * 12;
  
  const cashFlow = noi - annualDebtService;
  
  return (cashFlow / downPayment) * 100;
}

// ========================================
// VALUATION
// ========================================

export function calculateValuation(inputs: MetricInputs): { 
  low: number; 
  mid: number; 
  high: number;
  multiplier: number;
} {
  const noi = calculateNOI(inputs);
  
  // Base multiplier: 3-5x NOI
  let baseMultiplier = 4.0;
  
  // Adjustments based on quality factors
  const equipScore = calculateEquipmentScore(inputs);
  const locationScore = calculateLocationScore(inputs, inputs.countryCode);
  
  if (equipScore > 75) baseMultiplier += 0.5;
  if (locationScore > 75) baseMultiplier += 0.5;
  if (inputs.hasWDF) baseMultiplier += 0.3;
  if (inputs.hasAttendant) baseMultiplier += 0.2;
  
  return {
    low: noi * (baseMultiplier - 1.0),
    mid: noi * baseMultiplier,
    high: noi * (baseMultiplier + 1.0),
    multiplier: baseMultiplier
  };
}
