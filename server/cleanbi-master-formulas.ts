/**
 * CLEANBI 2.0 Master Formulas Implementation
 * 
 * Implements the canonical 17-FACTOR CLEANBI scoring algorithm:
 * 
 * THE 17 FACTORS & WEIGHTS (Total: 100%)
 * ═══════════════════════════════════════
 * 1. Rent % of Revenue     (10%) - Inverse normalize (lower = better, 10-18% optimal)
 * 2. EBITDA Margin         (10%) - Linear normalize (20-35% optimal)
 * 3. Turns Per Day         (10%) - Linear normalize (4-6 TPD optimal)
 * 4. Market Saturation      (8%) - Inverse of competitor density
 * 5. DSCR                   (8%) - Debt Service Coverage Ratio (1.25-2.0 optimal)
 * 6. Renter Percentage      (6%) - Linear normalize (40-70% optimal)
 * 7. Population Density     (6%) - Linear normalize (2000-5000/sq mi optimal)
 * 8. Traffic Score          (6%) - Direct 0-100 (higher = better)
 * 9. Equipment Mix          (6%) - Direct 0-100 (higher = better)
 * 10. Median Income         (5%) - Bell curve to $55K target ($40K-$70K optimal)
 * 11. Utilities % Revenue   (5%) - Inverse normalize (8-12% optimal)
 * 12. Parking Score         (4%) - Direct 0-100 (higher = better)
 * 13. Cashless Enabled      (4%) - Boolean (100 if yes, 40 if no)
 * 14. WDF Space (sq ft)     (4%) - Linear normalize (200-500 sqft optimal)
 * 15. Household Size        (3%) - Linear normalize (2.5-3.5 optimal)
 * 16. Delivery Ready        (3%) - Boolean (100 if yes, 50 if no)
 * 17. Curbside Ready        (2%) - Boolean (100 if yes, 50 if no)
 * 
 * Uses shared CLEANBI grading: A (85+), B (70-84), C (55-69), Needs Work (<55)
 */

import { EnrichedCLEANBIData } from './cleanbi-data-enrichment';
import { getGrade, type CLEANBIGrade } from '../shared/cleanbi-grades';

export interface FinancialInputs {
  grossRevenue?: number;
  netProfit?: number;
  monthlyRent?: number;
  machineCount?: number;
  ebitda?: number;
  annualDebtService?: number;
  turnsPerDay?: number;
}

export interface LeaseInputs {
  yearsRemaining?: number;
  annualEscalation?: number;
  hasExclusiveUse?: boolean;
  isNNN?: boolean;
}

export interface EquipmentInputs {
  avgMachineAge?: number;
  brandScores?: number[];
  hasHighSpinExtractors?: boolean;
  hasSingleLoadTops?: boolean;
  hasSmartPayment?: boolean;
  hasCashlessPayment?: boolean;
}

export interface UtilitiesInputs {
  monthlyGasBill?: number;
  monthlyWaterBill?: number;
  turnsPerDay?: number;
  machineCount?: number;
  monthlyElectricBill?: number;
}

export interface OperationalInputs {
  trafficScore?: number;
  parkingScore?: number;
  wdfSpaceSqFt?: number;
  hasWDF?: boolean;
  hasDeliveryService?: boolean;
  hasCurbsidePickup?: boolean;
  householdSize?: number;
}

export interface CLEANBIMasterScore {
  cleanbiScore: number;
  grade: 'A' | 'B' | 'C' | 'Needs Work';
  
  // 6 category subscores for visualization
  subscores: {
    marketScore: number;
    financialScore: number;
    leaseScore: number;
    equipmentScore: number;
    utilitiesScore: number;
    growthScore: number;
  };
  
  // Full 17-factor breakdown with weights
  factors: {
    // Financial Factors (30% total)
    rentToRevenueRatio: { score: number; weight: 0.10; value: number };
    ebitdaMargin: { score: number; weight: 0.10; value: number };
    turnsPerDay: { score: number; weight: 0.10; value: number };
    
    // Market Factors (20% total)
    marketSaturation: { score: number; weight: 0.08; value: number };
    renterPercentage: { score: number; weight: 0.06; value: number };
    populationDensity: { score: number; weight: 0.06; value: number };
    
    // Operational Factors (22% total)
    dscr: { score: number; weight: 0.08; value: number };
    trafficScore: { score: number; weight: 0.06; value: number };
    equipmentMix: { score: number; weight: 0.06; value: number };
    cashlessEnabled: { score: number; weight: 0.04; value: number }; // 1=yes, 0=no
    
    // Demographics (8% total)
    medianIncome: { score: number; weight: 0.05; value: number };
    householdSize: { score: number; weight: 0.03; value: number };
    
    // Utilities (5% total)
    utilitiesRevenue: { score: number; weight: 0.05; value: number };
    
    // Facility (8% total)
    parkingScore: { score: number; weight: 0.04; value: number };
    wdfSpace: { score: number; weight: 0.04; value: number };
    
    // Services (5% total)
    deliveryReady: { score: number; weight: 0.03; value: number }; // 1=yes, 0=no
    curbsideReady: { score: number; weight: 0.02; value: number }; // 1=yes, 0=no
  };
  
  // Legacy breakdown for backward compatibility
  breakdown: {
    renterScore: number;
    incomeScore: number;
    densityScore: number;
    competitionScore: number;
    cleanlinessScore: number;
    rentRatioScore: number;
    marginScore: number;
    revenuePerMachineScore: number;
    leaseYearsScore: number;
    escalationScore: number;
    equipmentAgeScore: number;
    brandScore: number;
    mixScore: number;
    gasEfficiencyScore: number;
    waterEfficiencyScore: number;
    permitScore: number;
    constructionScore: number;
    trendScore: number;
    // New 17-factor scores
    dscrScore: number;
    trafficScore: number;
    parkingScore: number;
    cashlessScore: number;
    wdfSpaceScore: number;
    householdScore: number;
    deliveryScore: number;
    curbsideScore: number;
    utilitiesRevenueScore: number;
    tpdScore: number;
  };
  
  confidence: number;
  fallbackPenalty: number;
  recommendations: string[];
  
  calculators: {
    tpd: number | null;
    breakEvenTPD: number | null;
    rentToRevenueRatio: number | null;
    demographicPowerScore: number;
    laundryDemandIndex: number;
    dscr: number | null;
    utilitiesRevenuePct: number | null;
  };
}

function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

function calculateRenterScore(renterPct: number): number {
  return clamp((renterPct / 70) * 100);
}

function calculateIncomeScore(medianIncome: number): number {
  if (medianIncome >= 35000 && medianIncome <= 65000) {
    return 100;
  }
  const deviation = Math.abs(medianIncome - 50000);
  return clamp(100 - (deviation / 1000));
}

function calculateDensityScore(popDensity: number): number {
  return clamp((popDensity / 2500) * 100);
}

/**
 * INDUSTRY-CALIBRATED COMPETITION SCORING
 * Based on master algorithms: Market Saturation (8% of full score)
 * 
 * Key benchmarks from industry research:
 * - 87% of customers live within 1 mile of laundromat
 * - Healthy market: 1 laundromat per 4,000-6,000 households
 * - ≤2 competitors within 1 mile = good opportunity
 * - Competition should be evaluated relative to population density
 */
function calculateCompetitionScore(competitionCount: number): number {
  // Count-based scoring for full CLEANBI calculations
  // Industry research: In a 1-mile trade area
  if (competitionCount === 0) return 100;  // Blue ocean - rare opportunity
  if (competitionCount === 1) return 92;   // Minimal competition - excellent
  if (competitionCount === 2) return 84;   // Healthy competition - good
  if (competitionCount === 3) return 76;   // Competitive market - viable
  if (competitionCount === 4) return 68;   // Crowded - need differentiation
  if (competitionCount === 5) return 62;   
  if (competitionCount === 6) return 56;   
  if (competitionCount <= 8) return 50;    // Saturated - careful analysis needed
  if (competitionCount <= 10) return 44;   
  if (competitionCount <= 15) return 38;
  return 32; // Highly saturated - only with significant differentiation
}

function calculateCleanlinessScore(score: number): number {
  return clamp(score * 10);
}

// ═══════════════════════════════════════════════════════════════════════════
// NEW 17-FACTOR CLEANBI 2.0 SCORING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TURNS PER DAY (TPD) Score
 * Industry optimal: 4-6 TPD
 * Higher TPD = higher utilization = better performance
 */
function calculateTPDScore(tpd: number): number {
  if (tpd >= 6) return 100;  // Excellent - max utilization
  if (tpd >= 5) return 90;   // Great performance
  if (tpd >= 4) return 80;   // Good - industry target
  if (tpd >= 3) return 65;   // Below average
  if (tpd >= 2) return 50;   // Underperforming
  return 35;                  // Poor utilization
}

/**
 * DSCR (Debt Service Coverage Ratio) Score
 * Industry optimal: 1.25-2.0
 * DSCR = EBITDA / Annual Debt Service
 */
function calculateDSCRScore(dscr: number): number {
  if (dscr >= 2.0) return 100;   // Excellent debt coverage
  if (dscr >= 1.5) return 90;    // Strong coverage
  if (dscr >= 1.25) return 80;   // Minimum SBA requirement
  if (dscr >= 1.1) return 65;    // Marginal
  if (dscr >= 1.0) return 50;    // Break-even on debt
  return 30;                      // Cannot cover debt
}

/**
 * Traffic Score
 * Direct 0-100 based on foot/vehicle traffic data
 * Higher traffic = more potential customers
 */
function calculateTrafficScoreValue(trafficScore: number): number {
  return clamp(trafficScore);
}

/**
 * Parking Score
 * Direct 0-100 based on parking availability
 * Industry research: parking affects 30% of customer decisions
 */
function calculateParkingScoreValue(parkingScore: number): number {
  return clamp(parkingScore);
}

/**
 * Cashless Enabled Score
 * Boolean: 100 if yes, 40 if no
 * Modern laundromats need card/app payment
 */
function calculateCashlessScore(hasCashless: boolean): number {
  return hasCashless ? 100 : 40;
}

/**
 * WDF Space Score
 * Linear normalize (200-500 sqft optimal)
 * WDF generates 40-60% margins
 */
function calculateWDFSpaceScore(sqft: number): number {
  if (sqft === 0) return 30;       // No WDF space
  if (sqft >= 500) return 100;     // Full-service WDF
  if (sqft >= 400) return 90;      // Excellent space
  if (sqft >= 300) return 80;      // Good capacity
  if (sqft >= 200) return 70;      // Minimum viable
  if (sqft >= 100) return 55;      // Limited
  return 40;                        // Very limited
}

/**
 * Household Size Score
 * Linear normalize (2.5-3.5 optimal)
 * Larger households = more laundry
 */
function calculateHouseholdScore(avgSize: number): number {
  if (avgSize >= 2.5 && avgSize <= 3.5) return 100;
  if (avgSize >= 3.0 && avgSize <= 4.0) return 90;
  if (avgSize >= 2.0 && avgSize <= 3.0) return 75;
  return 60;
}

/**
 * Delivery Ready Score
 * Boolean: 100 if yes, 50 if no
 * Delivery = higher LTV customers
 */
function calculateDeliveryScore(hasDelivery: boolean): number {
  return hasDelivery ? 100 : 50;
}

/**
 * Curbside Ready Score
 * Boolean: 100 if yes, 50 if no
 * Convenience feature
 */
function calculateCurbsideScore(hasCurbside: boolean): number {
  return hasCurbside ? 100 : 50;
}

/**
 * Utilities % of Revenue Score
 * Inverse normalize (8-12% optimal, lower = better)
 */
function calculateUtilitiesRevenueScore(utilPct: number): number {
  if (utilPct <= 8) return 100;   // Excellent efficiency
  if (utilPct <= 10) return 90;   // Great
  if (utilPct <= 12) return 80;   // Industry standard
  if (utilPct <= 15) return 65;   // Above average cost
  if (utilPct <= 18) return 50;   // High utilities
  return 35;                       // Needs efficiency improvements
}

function calculateMarketScore(
  renterScore: number,
  incomeScore: number,
  densityScore: number,
  competitionScore: number,
  cleanlinessScore: number
): number {
  return clamp(
    (0.30 * renterScore) +
    (0.20 * incomeScore) +
    (0.20 * densityScore) +
    (0.20 * competitionScore) +
    (0.10 * cleanlinessScore)
  );
}

function calculateRentRatioScore(ratio: number): number {
  if (ratio <= 0.20) return 100;
  if (ratio <= 0.25) return 85;
  if (ratio <= 0.30) return 70;
  return 50;
}

function calculateMarginScore(marginPct: number): number {
  if (marginPct > 35) return 100;
  if (marginPct >= 25) return 85;
  if (marginPct >= 15) return 70;
  if (marginPct >= 10) return 55;
  return 40;
}

function calculateRevenuePerMachineScore(rpm: number): number {
  if (rpm >= 3500) return 100;
  if (rpm >= 2500) return 85;
  if (rpm >= 1500) return 70;
  if (rpm >= 1000) return 55;
  return 40;
}

function calculateFinancialScore(
  rentRatioScore: number,
  marginScore: number,
  rpmScore: number
): number {
  return clamp(
    (0.40 * rentRatioScore) +
    (0.40 * marginScore) +
    (0.20 * rpmScore)
  );
}

function calculateLeaseYearsScore(years: number): number {
  if (years >= 10) return 100;
  if (years >= 7) return 85;
  if (years >= 5) return 70;
  if (years >= 3) return 55;
  return 40;
}

function calculateEscalationScore(escalationPct: number): number {
  if (escalationPct <= 2) return 100;
  if (escalationPct <= 4) return 80;
  if (escalationPct <= 5) return 60;
  return 40;
}

function calculateLeaseScore(
  yearsScore: number,
  escalationScore: number,
  hasExclusiveUse: boolean
): number {
  const base = (0.60 * yearsScore) + (0.40 * escalationScore);
  const bonus = hasExclusiveUse ? 10 : 0;
  return clamp(base + bonus);
}

function calculateEquipmentAgeScore(avgAge: number): number {
  if (avgAge <= 5) return 100;
  if (avgAge <= 10) return 85;
  if (avgAge <= 15) return 65;
  if (avgAge <= 20) return 45;
  return 30;
}

function calculateBrandScore(brands: string[]): number {
  const brandMap: Record<string, number> = {
    'dexter': 100,
    'speed queen': 90,
    'speedqueen': 90,
    'huebsch': 90,
    'wascomat': 80,
    'lg': 70,
    'maytag': 70,
    'whirlpool': 65,
    'unknown': 60
  };
  
  if (!brands || brands.length === 0) return 60;
  
  const scores = brands.map(b => brandMap[b.toLowerCase()] || 60);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function calculateMixScore(
  hasHighSpin: boolean,
  hasSingleLoadTops: boolean
): number {
  let score = 70;
  if (hasHighSpin) score += 15;
  if (hasSingleLoadTops) score -= 15;
  return clamp(score);
}

function calculateEquipmentScore(
  ageScore: number,
  brandScore: number,
  mixScore: number
): number {
  return clamp(
    (0.50 * ageScore) +
    (0.30 * brandScore) +
    (0.20 * mixScore)
  );
}

function calculateGasEfficiencyScore(
  gasPerCycle: number
): number {
  if (!gasPerCycle || gasPerCycle <= 0) return 70;
  return clamp((2.5 / gasPerCycle) * 100);
}

function calculateWaterEfficiencyScore(
  waterPerCycle: number
): number {
  if (!waterPerCycle || waterPerCycle <= 0) return 70;
  return clamp((15 / waterPerCycle) * 100);
}

function calculateUtilitiesScore(
  gasScore: number,
  waterScore: number
): number {
  return clamp(
    (0.60 * gasScore) +
    (0.40 * waterScore)
  );
}

function calculateGrowthScore(
  populationGrowth: number,
  newApartments: boolean,
  noNewLaundromats: boolean,
  incomeVsRentTrend: boolean
): number {
  let score = 0;
  if (populationGrowth > 2) score += 30;
  else if (populationGrowth > 0) score += 15;
  if (newApartments) score += 30;
  if (noNewLaundromats) score += 20;
  if (incomeVsRentTrend) score += 20;
  return clamp(score);
}

function calculateTPD(
  grossRevenue: number,
  machineCount: number,
  vendedPrice: number
): number {
  if (!machineCount || !vendedPrice || machineCount === 0 || vendedPrice === 0) {
    return 0;
  }
  return grossRevenue / (365 * machineCount * vendedPrice);
}

function calculateBreakEvenTPD(
  monthlyRent: number,
  monthlyUtilities: number,
  supplies: number,
  labor: number,
  machineCount: number,
  vendedPrice: number,
  costPerCycle: number
): number {
  if (!machineCount || machineCount === 0) return 0;
  const monthlyFixed = monthlyRent + monthlyUtilities + supplies + labor;
  const marginPerCycle = vendedPrice - costPerCycle;
  if (marginPerCycle <= 0) return 999;
  return monthlyFixed / (machineCount * marginPerCycle * 30);
}

/**
 * CLEANBI™ Grading System (Chrome Web Store Style)
 * 
 * Uses the shared canonical grading system from shared/cleanbi-grades.ts
 * ONLY A, B, C are positive grades. Everything below is "Needs Work".
 * 
 * A  = 85+ (Excellent opportunity)
 * B  = 70-84 (Good opportunity)  
 * C  = 55-69 (Fair opportunity)
 * Needs Work = Below 55 (Requires strategic improvements)
 * 
 * Note: getGrade function is now imported from shared/cleanbi-grades.ts
 */

function generateRecommendations(
  subscores: CLEANBIMasterScore['subscores'],
  breakdown: CLEANBIMasterScore['breakdown']
): string[] {
  const recommendations: string[] = [];

  if (subscores.marketScore < 60) {
    if (breakdown.competitionScore < 50) {
      recommendations.push('High competition density - consider differentiating with premium WDF services');
    }
    if (breakdown.renterScore < 50) {
      recommendations.push('Low renter percentage - target marketing to apartment complexes');
    }
  }

  if (subscores.financialScore < 60) {
    if (breakdown.rentRatioScore < 60) {
      recommendations.push('Rent-to-revenue ratio above 25% - negotiate lease renewal terms');
    }
    if (breakdown.marginScore < 60) {
      recommendations.push('Net margins below 15% - review operating expenses for reduction opportunities');
    }
  }

  if (subscores.leaseScore < 60) {
    recommendations.push('Lease terms need attention - prioritize renewal negotiation');
  }

  if (subscores.equipmentScore < 60) {
    if (breakdown.equipmentAgeScore < 60) {
      recommendations.push('Equipment aging - budget for replacements over next 3-5 years');
    }
    if (breakdown.brandScore < 70) {
      recommendations.push('Consider upgrading to premium equipment brands (Dexter, Speed Queen)');
    }
  }

  if (subscores.utilitiesScore < 60) {
    recommendations.push('Utility costs high - evaluate high-efficiency equipment upgrades');
  }

  if (subscores.growthScore < 40) {
    recommendations.push('Limited growth signals - focus on operational efficiency and customer retention');
  }

  if (recommendations.length === 0) {
    recommendations.push('Strong overall performance - continue current operations strategy');
  }

  return recommendations;
}

export function calculateCLEANBIMasterScore(
  enrichedData: EnrichedCLEANBIData,
  financialInputs: FinancialInputs = {},
  leaseInputs: LeaseInputs = {},
  equipmentInputs: EquipmentInputs = {},
  utilitiesInputs: UtilitiesInputs = {},
  operationalInputs: OperationalInputs = {}
): CLEANBIMasterScore {
  
  const renterScore = calculateRenterScore(enrichedData.demographics.renterPercentage);
  const incomeScore = calculateIncomeScore(enrichedData.demographics.medianHouseholdIncome);
  const densityScore = calculateDensityScore(enrichedData.demographics.populationDensity);
  const competitionScore = calculateCompetitionScore(enrichedData.competition.count);
  
  const cleanlinessScore = enrichedData.placeDetails?.rating 
    ? calculateCleanlinessScore(enrichedData.placeDetails.rating * 2)
    : 60;

  const marketScore = calculateMarketScore(
    renterScore, incomeScore, densityScore, competitionScore, cleanlinessScore
  );

  const grossRevenue = financialInputs.grossRevenue || 120000;
  const netProfit = financialInputs.netProfit || grossRevenue * 0.12;
  const monthlyRent = financialInputs.monthlyRent || 2000;
  const machineCount = financialInputs.machineCount || 20;

  const rentRatio = (monthlyRent * 12) / grossRevenue;
  const marginPct = (netProfit / grossRevenue) * 100;
  const rpm = grossRevenue / machineCount;

  const rentRatioScore = calculateRentRatioScore(rentRatio);
  const marginScore = calculateMarginScore(marginPct);
  const revenuePerMachineScore = calculateRevenuePerMachineScore(rpm);

  const financialScore = calculateFinancialScore(
    rentRatioScore, marginScore, revenuePerMachineScore
  );

  const yearsRemaining = leaseInputs.yearsRemaining ?? 5;
  const escalation = leaseInputs.annualEscalation ?? 3;
  const hasExclusiveUse = leaseInputs.hasExclusiveUse ?? false;

  const leaseYearsScore = calculateLeaseYearsScore(yearsRemaining);
  const escalationScore = calculateEscalationScore(escalation);

  const leaseScore = calculateLeaseScore(
    leaseYearsScore, escalationScore, hasExclusiveUse
  );

  const avgAge = equipmentInputs.avgMachineAge ?? 8;
  const brandScores = equipmentInputs.brandScores || [];
  const hasHighSpin = equipmentInputs.hasHighSpinExtractors ?? false;
  const hasSingleLoadTops = equipmentInputs.hasSingleLoadTops ?? false;

  const equipmentAgeScore = calculateEquipmentAgeScore(avgAge);
  const brandScore = brandScores.length > 0 
    ? Math.round(brandScores.reduce((a, b) => a + b, 0) / brandScores.length)
    : 60;
  const mixScore = calculateMixScore(hasHighSpin, hasSingleLoadTops);

  const equipmentScore = calculateEquipmentScore(
    equipmentAgeScore, brandScore, mixScore
  );

  const turnsPerDay = utilitiesInputs.turnsPerDay ?? 4;
  const utilMachineCount = utilitiesInputs.machineCount ?? machineCount;
  const monthlyTurns = turnsPerDay * utilMachineCount * 30;

  const gasPerCycle = utilitiesInputs.monthlyGasBill 
    ? utilitiesInputs.monthlyGasBill / monthlyTurns
    : 2.0;
  const waterPerCycle = utilitiesInputs.monthlyWaterBill
    ? utilitiesInputs.monthlyWaterBill / monthlyTurns
    : 12;

  const gasEfficiencyScore = calculateGasEfficiencyScore(gasPerCycle);
  const waterEfficiencyScore = calculateWaterEfficiencyScore(waterPerCycle);

  const utilitiesScore = calculateUtilitiesScore(
    gasEfficiencyScore, waterEfficiencyScore
  );

  const populationGrowth = 2;
  const newApartments = enrichedData.growthSignals?.newConstructionPermits 
    ? enrichedData.growthSignals.newConstructionPermits > 3
    : false;
  const noNewLaundromats = true;
  const incomeVsRentTrend = enrichedData.growthSignals?.homeValueChange1Yr 
    ? enrichedData.growthSignals.homeValueChange1Yr < 5
    : true;

  const permitScore = newApartments ? 100 : 50;
  const constructionScore = enrichedData.growthSignals?.newConstructionPermits 
    ? Math.min(100, enrichedData.growthSignals.newConstructionPermits * 15)
    : 50;
  const trendScore = incomeVsRentTrend ? 80 : 50;

  const growthScore = calculateGrowthScore(
    populationGrowth, newApartments, noNewLaundromats, incomeVsRentTrend
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW 17-FACTOR CLEANBI 2.0 CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Extract values for 17-factor scoring
  const ebitda = financialInputs.ebitda ?? (netProfit * 1.2); // Approximate EBITDA
  const annualDebtService = financialInputs.annualDebtService ?? 0;
  const turnsPerDayValue = financialInputs.turnsPerDay ?? turnsPerDay;
  
  // Calculate DSCR (Debt Service Coverage Ratio)
  const dscr = annualDebtService > 0 ? ebitda / annualDebtService : 2.0;
  
  // Calculate utilities % of revenue
  const monthlyUtilities = (utilitiesInputs.monthlyGasBill ?? 800) + 
    (utilitiesInputs.monthlyWaterBill ?? 600) + 
    (utilitiesInputs.monthlyElectricBill ?? 400);
  const utilitiesPct = (monthlyUtilities * 12 / grossRevenue) * 100;
  
  // Get operational inputs with defaults
  const trafficValue = operationalInputs.trafficScore ?? 60;
  const parkingValue = operationalInputs.parkingScore ?? 70;
  const wdfSpaceValue = operationalInputs.wdfSpaceSqFt ?? 200;
  const hasDelivery = operationalInputs.hasDeliveryService ?? false;
  const hasCurbside = operationalInputs.hasCurbsidePickup ?? false;
  const householdSizeValue = operationalInputs.householdSize ?? enrichedData.demographics.householdSize ?? 2.5;
  const hasCashless = equipmentInputs.hasCashlessPayment ?? equipmentInputs.hasSmartPayment ?? true;
  
  // Calculate new 17-factor individual scores
  const tpdScore = calculateTPDScore(turnsPerDayValue);
  const dscrScore = calculateDSCRScore(dscr);
  const trafficScoreValue = calculateTrafficScoreValue(trafficValue);
  const parkingScoreValue = calculateParkingScoreValue(parkingValue);
  const cashlessScore = calculateCashlessScore(hasCashless);
  const wdfSpaceScore = calculateWDFSpaceScore(wdfSpaceValue);
  const householdScore = calculateHouseholdScore(householdSizeValue);
  const deliveryScore = calculateDeliveryScore(hasDelivery);
  const curbsideScore = calculateCurbsideScore(hasCurbside);
  const utilitiesRevenueScore = calculateUtilitiesRevenueScore(utilitiesPct);
  const ebitdaMarginPct = (ebitda / grossRevenue) * 100;
  const ebitdaScore = calculateMarginScore(ebitdaMarginPct);

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCULATE FULL 17-FACTOR WEIGHTED CLEANBI 2.0 SCORE
  // ═══════════════════════════════════════════════════════════════════════════
  const cleanbi2Score = 
    (0.10 * rentRatioScore) +           // Factor 1: Rent % of Revenue
    (0.10 * ebitdaScore) +              // Factor 2: EBITDA Margin
    (0.10 * tpdScore) +                 // Factor 3: Turns Per Day
    (0.08 * competitionScore) +         // Factor 4: Market Saturation
    (0.08 * dscrScore) +                // Factor 5: DSCR
    (0.06 * renterScore) +              // Factor 6: Renter Percentage
    (0.06 * densityScore) +             // Factor 7: Population Density
    (0.06 * trafficScoreValue) +        // Factor 8: Traffic Score
    (0.06 * mixScore) +                 // Factor 9: Equipment Mix
    (0.05 * incomeScore) +              // Factor 10: Median Income
    (0.05 * utilitiesRevenueScore) +    // Factor 11: Utilities % Revenue
    (0.04 * parkingScoreValue) +        // Factor 12: Parking Score
    (0.04 * cashlessScore) +            // Factor 13: Cashless Enabled
    (0.04 * wdfSpaceScore) +            // Factor 14: WDF Space
    (0.03 * householdScore) +           // Factor 15: Household Size
    (0.03 * deliveryScore) +            // Factor 16: Delivery Ready
    (0.02 * curbsideScore);             // Factor 17: Curbside Ready

  // Legacy 6-category score for backward compatibility
  const rawScore = 
    (0.25 * marketScore) +
    (0.25 * financialScore) +
    (0.20 * leaseScore) +
    (0.15 * equipmentScore) +
    (0.10 * utilitiesScore) +
    (0.05 * growthScore);

  const confidence = enrichedData.dataQuality.overallConfidence / 100;
  const fallbackPenalty = (1 - confidence) * 15;
  
  // Use CLEANBI 2.0 17-factor score as primary, with confidence adjustment
  const finalScore = Math.round(clamp(cleanbi2Score - fallbackPenalty));

  const subscores = {
    marketScore: Math.round(marketScore),
    financialScore: Math.round(financialScore),
    leaseScore: Math.round(leaseScore),
    equipmentScore: Math.round(equipmentScore),
    utilitiesScore: Math.round(utilitiesScore),
    growthScore: Math.round(growthScore)
  };

  // Full 17-factor breakdown with weights
  const factors = {
    rentToRevenueRatio: { score: Math.round(rentRatioScore), weight: 0.10 as const, value: rentRatio * 100 },
    ebitdaMargin: { score: Math.round(ebitdaScore), weight: 0.10 as const, value: ebitdaMarginPct },
    turnsPerDay: { score: Math.round(tpdScore), weight: 0.10 as const, value: turnsPerDayValue },
    marketSaturation: { score: Math.round(competitionScore), weight: 0.08 as const, value: enrichedData.competition.count },
    dscr: { score: Math.round(dscrScore), weight: 0.08 as const, value: dscr },
    renterPercentage: { score: Math.round(renterScore), weight: 0.06 as const, value: enrichedData.demographics.renterPercentage },
    populationDensity: { score: Math.round(densityScore), weight: 0.06 as const, value: enrichedData.demographics.populationDensity },
    trafficScore: { score: Math.round(trafficScoreValue), weight: 0.06 as const, value: trafficValue },
    equipmentMix: { score: Math.round(mixScore), weight: 0.06 as const, value: mixScore },
    medianIncome: { score: Math.round(incomeScore), weight: 0.05 as const, value: enrichedData.demographics.medianHouseholdIncome },
    utilitiesRevenue: { score: Math.round(utilitiesRevenueScore), weight: 0.05 as const, value: utilitiesPct },
    parkingScore: { score: Math.round(parkingScoreValue), weight: 0.04 as const, value: parkingValue },
    cashlessEnabled: { score: Math.round(cashlessScore), weight: 0.04 as const, value: hasCashless ? 1 : 0 },
    wdfSpace: { score: Math.round(wdfSpaceScore), weight: 0.04 as const, value: wdfSpaceValue },
    householdSize: { score: Math.round(householdScore), weight: 0.03 as const, value: householdSizeValue },
    deliveryReady: { score: Math.round(deliveryScore), weight: 0.03 as const, value: hasDelivery ? 1 : 0 },
    curbsideReady: { score: Math.round(curbsideScore), weight: 0.02 as const, value: hasCurbside ? 1 : 0 },
  };

  const breakdown = {
    renterScore: Math.round(renterScore),
    incomeScore: Math.round(incomeScore),
    densityScore: Math.round(densityScore),
    competitionScore: Math.round(competitionScore),
    cleanlinessScore: Math.round(cleanlinessScore),
    rentRatioScore: Math.round(rentRatioScore),
    marginScore: Math.round(marginScore),
    revenuePerMachineScore: Math.round(revenuePerMachineScore),
    leaseYearsScore: Math.round(leaseYearsScore),
    escalationScore: Math.round(escalationScore),
    equipmentAgeScore: Math.round(equipmentAgeScore),
    brandScore: Math.round(brandScore),
    mixScore: Math.round(mixScore),
    gasEfficiencyScore: Math.round(gasEfficiencyScore),
    waterEfficiencyScore: Math.round(waterEfficiencyScore),
    permitScore: Math.round(permitScore),
    constructionScore: Math.round(constructionScore),
    trendScore: Math.round(trendScore),
    // New 17-factor scores
    dscrScore: Math.round(dscrScore),
    trafficScore: Math.round(trafficScoreValue),
    parkingScore: Math.round(parkingScoreValue),
    cashlessScore: Math.round(cashlessScore),
    wdfSpaceScore: Math.round(wdfSpaceScore),
    householdScore: Math.round(householdScore),
    deliveryScore: Math.round(deliveryScore),
    curbsideScore: Math.round(curbsideScore),
    utilitiesRevenueScore: Math.round(utilitiesRevenueScore),
    tpdScore: Math.round(tpdScore),
  };

  const vendedPrice = 3.50;
  const tpd = calculateTPD(grossRevenue, machineCount, vendedPrice);
  const breakEvenTPD = calculateBreakEvenTPD(
    monthlyRent, 800, 200, 1500, machineCount, vendedPrice, 0.50
  );

  return {
    cleanbiScore: finalScore,
    grade: getGrade(finalScore),
    subscores,
    factors,
    breakdown,
    confidence: Math.round(confidence * 100),
    fallbackPenalty: Math.round(fallbackPenalty),
    recommendations: generateRecommendations(subscores, breakdown),
    calculators: {
      tpd: Math.round(tpd * 100) / 100,
      breakEvenTPD: Math.round(breakEvenTPD * 100) / 100,
      rentToRevenueRatio: Math.round(rentRatio * 1000) / 10,
      demographicPowerScore: enrichedData.marketScores.demographicPowerScore,
      laundryDemandIndex: enrichedData.demographics.laundryDemandIndex,
      dscr: Math.round(dscr * 100) / 100,
      utilitiesRevenuePct: Math.round(utilitiesPct * 10) / 10,
    }
  };
}

/**
 * INDUSTRY-CALIBRATED QUICK CLEANBI SCORE
 * 
 * For location-only analysis (without financial data), weights adjusted from full CLEANBI 2.0:
 * 
 * Full CLEANBI 2.0 weights (with financial data):
 * - Market Saturation: 8%, Renter %: 6%, Population Density: 6%, Income: 5% = 25% demographics
 * - Financial factors (EBITDA, TPD, DSCR, etc.): 58%
 * - Operational factors: 17%
 * 
 * Quick Score (location-only) rebalanced weights:
 * - Demographics (Renter %, Density, Income): 45% - Foundation of demand
 * - Competition/Saturation: 30% - Market opportunity
 * - Business Quality (Ratings/Reviews): 15% - Proxy for operations
 * - Confidence Adjustment: 10% - Data quality factor
 * 
 * Sources: Coin Laundry Association, PlanetLaundry, Martin-Ray, industry consultants
 */
export function calculateQuickCLEANBIScore(
  enrichedData: EnrichedCLEANBIData
): { score: number; grade: 'A' | 'B' | 'C' | 'Needs Work'; confidence: number } {
  
  // DEMOGRAPHIC POWER SCORE (45% weight)
  // Combines renter %, population density, and income scoring
  const marketScore = enrichedData.marketScores.demographicPowerScore;
  
  // COMPETITION/SATURATION SCORE (30% weight)
  // Density-normalized competition from master algorithms
  const competitionScore = enrichedData.marketScores.competitionScore;
  
  // BUSINESS QUALITY SCORE (15% weight)
  // Google rating as proxy for operational quality
  // Industry insight: 90% of customers become repeat customers at well-run stores
  let reviewScore: number;
  if (enrichedData.placeDetails?.rating) {
    // Scale: 4.5+ = 95-100, 4.0-4.5 = 80-95, 3.5-4.0 = 65-80, 3.0-3.5 = 50-65, <3.0 = 35-50
    const rating = enrichedData.placeDetails.rating;
    if (rating >= 4.5) {
      reviewScore = 95 + (rating - 4.5) * 10;
    } else if (rating >= 4.0) {
      reviewScore = 80 + (rating - 4.0) * 30;
    } else if (rating >= 3.5) {
      reviewScore = 65 + (rating - 3.5) * 30;
    } else if (rating >= 3.0) {
      reviewScore = 50 + (rating - 3.0) * 30;
    } else {
      reviewScore = Math.max(35, rating * 16.7);
    }
    // Boost for high review count (social proof)
    if (enrichedData.placeDetails.reviewCount > 100) {
      reviewScore = Math.min(100, reviewScore + 5);
    } else if (enrichedData.placeDetails.reviewCount > 50) {
      reviewScore = Math.min(100, reviewScore + 3);
    }
  } else {
    // No rating data - use neutral score (doesn't penalize new/unrated locations)
    reviewScore = 65;
  }
  
  // LAUNDRY DEMAND INDEX (bonus factor)
  // Additional boost for high-demand areas
  const demandBonus = enrichedData.demographics.laundryDemandIndex > 70 
    ? (enrichedData.demographics.laundryDemandIndex - 70) * 0.1 
    : 0;
  
  // Weighted calculation
  const rawScore = (0.45 * marketScore) + (0.30 * competitionScore) + (0.15 * reviewScore) + (0.10 * 70) + demandBonus;
  
  // CONFIDENCE ADJUSTMENT
  // Reduce score uncertainty when using fallback data
  const confidence = enrichedData.dataQuality.overallConfidence;
  const fallbackPenalty = ((100 - confidence) / 100) * 8; // Max 8 point penalty
  
  const finalScore = Math.round(clamp(rawScore - fallbackPenalty));

  // Detailed logging for transparency
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    CLEANBI SCORE BREAKDOWN                     ║
╠═══════════════════════════════════════════════════════════════╣
║ DEMOGRAPHICS (45%):                                            ║
║   Market Power Score: ${marketScore.toFixed(1).padStart(5)} → ${(0.45 * marketScore).toFixed(1).padStart(5)} pts              ║
║   (Renter: ${enrichedData.marketScores.renterScore}%, Density: ${enrichedData.marketScores.densityScore}, Income: ${enrichedData.marketScores.incomeScore})             ║
╠═══════════════════════════════════════════════════════════════╣
║ COMPETITION (30%):                                             ║
║   Saturation Score: ${competitionScore.toFixed(1).padStart(5)} → ${(0.30 * competitionScore).toFixed(1).padStart(5)} pts               ║
║   (${enrichedData.competition.count} competitors, ${enrichedData.competition.marketSaturation} saturation)           ║
╠═══════════════════════════════════════════════════════════════╣
║ QUALITY (15%):                                                 ║
║   Review Score: ${reviewScore.toFixed(1).padStart(5)} → ${(0.15 * reviewScore).toFixed(1).padStart(5)} pts                   ║
║   (Rating: ${enrichedData.placeDetails?.rating || 'N/A'}, Reviews: ${enrichedData.placeDetails?.reviewCount || 0})                  ║
╠═══════════════════════════════════════════════════════════════╣
║ CALCULATIONS:                                                  ║
║   Raw Score: ${rawScore.toFixed(1).padStart(5)}                                           ║
║   Confidence: ${(confidence * 100).toFixed(0)}% → Penalty: -${fallbackPenalty.toFixed(1)}                      ║
║   Demand Bonus: +${demandBonus.toFixed(1)}                                          ║
╠═══════════════════════════════════════════════════════════════╣
║   FINAL SCORE: ${finalScore.toString().padStart(3)} (${getGrade(finalScore)})                                   ║
╚═══════════════════════════════════════════════════════════════╝`);

  return {
    score: finalScore,
    grade: getGrade(finalScore),
    confidence
  };
}
