/**
 * CLEANBI Master Formulas Implementation
 * 
 * Implements the canonical CLEANBI scoring system:
 * - Market Score (25%) - Demographics, competition, neighborhood
 * - Financial Score (25%) - Rent ratio, margins, revenue per machine
 * - Lease Score (20%) - Term, escalation, exclusive use
 * - Equipment Score (15%) - Age, brand, mix
 * - Utilities Score (10%) - Gas/water efficiency
 * - Growth Score (5%) - Permits, trends, competition building
 * 
 * Grade: A (90-100), B (80-89), C (70-79), Needs Work (<70)
 */

import { EnrichedCLEANBIData } from './cleanbi-data-enrichment';

export interface FinancialInputs {
  grossRevenue?: number;
  netProfit?: number;
  monthlyRent?: number;
  machineCount?: number;
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
}

export interface UtilitiesInputs {
  monthlyGasBill?: number;
  monthlyWaterBill?: number;
  turnsPerDay?: number;
  machineCount?: number;
}

export interface CLEANBIMasterScore {
  cleanbiScore: number;
  grade: 'A' | 'B' | 'C' | 'Needs Work';
  
  subscores: {
    marketScore: number;
    financialScore: number;
    leaseScore: number;
    equipmentScore: number;
    utilitiesScore: number;
    growthScore: number;
  };
  
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

function calculateCompetitionScore(competitionCount: number): number {
  if (competitionCount === 0) return 100;
  if (competitionCount === 1) return 85;
  if (competitionCount === 2) return 65;
  if (competitionCount === 3) return 45;
  return 25;
}

function calculateCleanlinessScore(score: number): number {
  return clamp(score * 10);
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
 * ONLY A, B, C are positive grades. Everything below is "Needs Work".
 * This is intentionally encouraging - we NEVER show D or F grades.
 * 
 * A  = 85+ (Excellent opportunity)
 * B  = 70-84 (Good opportunity)  
 * C  = 55-69 (Fair opportunity)
 * Needs Work = Below 55 (Requires strategic improvements)
 */
function getGrade(score: number): 'A' | 'B' | 'C' | 'Needs Work' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  return 'Needs Work';
}

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
  utilitiesInputs: UtilitiesInputs = {}
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

  const rawScore = 
    (0.25 * marketScore) +
    (0.25 * financialScore) +
    (0.20 * leaseScore) +
    (0.15 * equipmentScore) +
    (0.10 * utilitiesScore) +
    (0.05 * growthScore);

  const confidence = enrichedData.dataQuality.overallConfidence / 100;
  const fallbackPenalty = (1 - confidence) * 15;
  const finalScore = Math.round(clamp(rawScore - fallbackPenalty));

  const subscores = {
    marketScore: Math.round(marketScore),
    financialScore: Math.round(financialScore),
    leaseScore: Math.round(leaseScore),
    equipmentScore: Math.round(equipmentScore),
    utilitiesScore: Math.round(utilitiesScore),
    growthScore: Math.round(growthScore)
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
    trendScore: Math.round(trendScore)
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
    breakdown,
    confidence: Math.round(confidence * 100),
    fallbackPenalty: Math.round(fallbackPenalty),
    recommendations: generateRecommendations(subscores, breakdown),
    calculators: {
      tpd: Math.round(tpd * 100) / 100,
      breakEvenTPD: Math.round(breakEvenTPD * 100) / 100,
      rentToRevenueRatio: Math.round(rentRatio * 1000) / 10,
      demographicPowerScore: enrichedData.marketScores.demographicPowerScore,
      laundryDemandIndex: enrichedData.demographics.laundryDemandIndex
    }
  };
}

export function calculateQuickCLEANBIScore(
  enrichedData: EnrichedCLEANBIData
): { score: number; grade: 'A' | 'B' | 'C' | 'Needs Work'; confidence: number } {
  
  const marketScore = enrichedData.marketScores.demographicPowerScore;
  const competitionScore = enrichedData.marketScores.competitionScore;
  const reviewScore = enrichedData.placeDetails?.rating 
    ? (enrichedData.placeDetails.rating / 5) * 100
    : 60;
  
  const rawScore = (0.40 * marketScore) + (0.30 * competitionScore) + (0.30 * reviewScore);
  const confidence = enrichedData.dataQuality.overallConfidence;
  const fallbackPenalty = ((100 - confidence) / 100) * 10;
  const finalScore = Math.round(clamp(rawScore - fallbackPenalty));

  return {
    score: finalScore,
    grade: getGrade(finalScore),
    confidence
  };
}
