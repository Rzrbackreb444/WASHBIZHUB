/**
 * CLEANBI v2.0 Scoring Engine
 * Implements all 17 factors with weights from blueprint
 * 
 * MANDATORY: Uses A, B, C, Needs Work grading (NO D or F!)
 * Grading thresholds: A=85+, B=70-84, C=55-69, Needs Work=<55
 */

import { getGrade, type CLEANBIGrade } from '../shared/cleanbi-grades';

export interface CleanbiInput {
  // Demographics
  rentersPercentage: number; // 0-100%
  medianIncome: number; // Annual income
  populationDensity: number; // per sq mile
  populationGrowthRate: number; // % annual

  // Foot Traffic & Transit
  monthlyVisitors: number;
  transitAccessScore: number; // 0-100

  // Financial
  tpd: number; // Transactions Per Day
  ebitda: number; // Annual
  revenuePerSqFt: number;
  dscr: number; // Debt Service Coverage Ratio
  sde: number; // Seller's Discretionary Earnings

  // Lease
  rentPercentageOfRevenue: number; // % of revenue
  leaseTerm: number; // Years
  tenantImprovements: number; // $ spent
  hoaFees: number; // $ monthly

  // Competition
  competitorWashers: number;
  competitorDistance: number; // Miles
  competitorCondition: number; // 0-100
  competitorPricing: number; // $ per lb

  // Equipment
  avgMachineAge: number; // Years
  maintenanceCostPercent: number; // % of revenue
  hasPaymentSmartEquipment: boolean;
  machineUptimePercent: number; // 0-100

  // Utilities
  utilityCostPerTurn: number; // $
  utilityTrendPercent: number; // % annual increase

  // Digital
  hasWebsitePresence: boolean;
  averageReviewRating: number; // 1-5
  reviewCount: number;

  // Risk
  crimeRatePercentile: number; // 0-100 (higher = worse)
  floodRiskScore: number; // 0-100
  zoningCompliance: boolean;
}

export interface CleanbiOutput {
  cleanbiScore: number; // 0-100
  grade: CLEANBIGrade; // A, B, C, Needs Work (NO D or F!)
  confidence: number; // 0-100%
  subscores: {
    marketScore: number;
    financialScore: number;
    leaseScore: number;
    competitionScore: number;
    equipmentScore: number;
    utilityScore: number;
    riskScore: number;
    supplyriskScore: number;
  };
  valuation: ValuationOutput;
  recommendation: string;
}

export interface ValuationOutput {
  ebitdaMultiple: number;
  ebitdaValuation: number;
  sdeMultiple: number;
  sdeValuation: number;
  assetValuation: number;
  incomeValuation: number;
  finalValuation: number;
  valuationRange: {
    low: number;
    high: number;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateCleanbi(input: CleanbiInput): CleanbiOutput {
  // Weights: MS=0.20; FS=0.20; LS=0.12; CS=0.12; ES=0.11; US=0.07; RS=0.08; SS=0.05; RA=-0.01
  
  // ====== MARKET SCORE (20%) ======
  const rentersDensityScore = clamp(
    (input.rentersPercentage / 100) * (input.populationDensity / 1500) * 100,
    0,
    100
  );
  
  const medianIncomeScore = clamp(
    (1 - Math.abs(input.medianIncome - 50000) / 50000) * 100,
    0,
    100
  );
  
  const populationGrowthScore = clamp(input.populationGrowthRate * 10, 0, 100);
  
  const marketScore = (rentersDensityScore * 0.4 + medianIncomeScore * 0.4 + populationGrowthScore * 0.2);

  // ====== FINANCIAL SCORE (20%) ======
  const tpdScore = clamp((input.tpd / 150) * 100, 0, 100);
  const ebitdaScore = clamp((input.ebitda / 100000) * 100, 0, 100);
  const revenuePerSqFtScore = clamp((input.revenuePerSqFt / 500) * 100, 0, 100);
  const dscrScore = clamp((input.dscr / 1.25) * 100, 0, 100);

  const financialScore = (tpdScore * 0.25 + ebitdaScore * 0.25 + revenuePerSqFtScore * 0.25 + dscrScore * 0.25);

  // ====== LEASE SCORE (12%) ======
  const rentPercentageScore = clamp((1 - input.rentPercentageOfRevenue / 0.15) * 100, 0, 100);
  const leaseTermScore = clamp((input.leaseTerm / 10) * 100, 0, 100);
  const tiScore = clamp((input.tenantImprovements / 50000) * 100, 0, 100);

  const leaseScore = (rentPercentageScore * 0.4 + leaseTermScore * 0.4 + tiScore * 0.2);

  // ====== COMPETITION SCORE (12%) ======
  const competitorImpactSum = input.competitorWashers * 
    Math.max(0, 1 - (input.competitorDistance / 3)) * 
    (1 - (input.competitorCondition / 100));
  
  const competitionDensity = competitorImpactSum / Math.max(1, input.competitorWashers);
  const competitionScore = clamp(100 - (competitionDensity * 100), 0, 100);

  // ====== EQUIPMENT SCORE (11%) ======
  const ageScore = clamp((1 - input.avgMachineAge / 15) * 100, 0, 100);
  const maintenanceScore = clamp((1 - input.maintenanceCostPercent / 0.20) * 100, 0, 100);
  const smartEquipmentBonus = input.hasPaymentSmartEquipment ? 100 : 60;
  const uptimeScore = input.machineUptimePercent;

  const equipmentScore = (ageScore * 0.3 + maintenanceScore * 0.3 + smartEquipmentBonus * 0.2 + uptimeScore * 0.2);

  // ====== UTILITY SCORE (7%) ======
  const utilityCostScore = clamp((1 - input.utilityCostPerTurn / 50) * 100, 0, 100);
  const utilityTrendScore = clamp((1 - Math.abs(input.utilityTrendPercent) / 10) * 100, 0, 100);

  const utilityScore = (utilityCostScore * 0.6 + utilityTrendScore * 0.4);

  // ====== RISK SCORE (8%) ======
  const crimeScore = clamp((1 - input.crimeRatePercentile / 100) * 100, 0, 100);
  const floodScore = clamp((1 - input.floodRiskScore / 100) * 100, 0, 100);
  const zoningScore = input.zoningCompliance ? 100 : 40;

  const riskScore = (crimeScore * 0.4 + floodScore * 0.4 + zoningScore * 0.2);

  // ====== SUPPLY/DIGITAL SCORE (5%) ======
  const websiteScore = input.hasWebsitePresence ? 100 : 50;
  const reviewScore = clamp((input.averageReviewRating / 5) * 100, 0, 100);
  const reviewCountScore = clamp((input.reviewCount / 100) * 100, 0, 100);

  const supplyScore = (websiteScore * 0.4 + reviewScore * 0.35 + reviewCountScore * 0.25);

  // ====== FOOT TRAFFIC SCORE (Additional factor) ======
  const footTrafficScore = clamp((input.monthlyVisitors / 5000) * 100, 0, 100);

  // ====== FINAL CLEANBI SCORE ======
  const weights = {
    market: 0.20,
    financial: 0.20,
    lease: 0.12,
    competition: 0.12,
    equipment: 0.11,
    utility: 0.07,
    risk: 0.08,
    supply: 0.05,
    footTraffic: 0.05, // Added for completeness
  };

  const cleanbiScore = clamp(
    marketScore * weights.market +
    financialScore * weights.financial +
    leaseScore * weights.lease +
    competitionScore * weights.competition +
    equipmentScore * weights.equipment +
    utilityScore * weights.utility +
    riskScore * weights.risk +
    supplyScore * weights.supply +
    footTrafficScore * weights.footTraffic,
    0,
    100
  );

  // ====== GRADE ASSIGNMENT (A, B, C, Needs Work - NO D or F!) ======
  const grade = getGrade(cleanbiScore);
  const confidence = clamp(70 + (cleanbiScore / 100) * 20, 60, 95);

  // ====== VALUATION ======
  const valuation = calculateValuation(input, cleanbiScore);

  // ====== RECOMMENDATION ======
  const passValidator = 
    cleanbiScore >= 70 &&
    competitionScore >= 50 &&
    input.avgMachineAge <= 10 &&
    input.leaseTerm >= 7 &&
    input.crimeRatePercentile < 50;

  const recommendation = passValidator
    ? `✅ STRONG BUY - CLEANBI Score ${cleanbiScore.toFixed(1)}/100. This property shows excellent fundamentals with strong market position, solid financials, and low risk profile. Recommended for acquisition.`
    : `⚠️ CAUTIOUS - CLEANBI Score ${cleanbiScore.toFixed(1)}/100. Review key risk factors before proceeding. Consider renegotiating lease terms or equipment upgrades.`;

  return {
    cleanbiScore: Math.round(cleanbiScore * 10) / 10,
    grade,
    confidence: Math.round(confidence),
    subscores: {
      marketScore: Math.round(marketScore * 10) / 10,
      financialScore: Math.round(financialScore * 10) / 10,
      leaseScore: Math.round(leaseScore * 10) / 10,
      competitionScore: Math.round(competitionScore * 10) / 10,
      equipmentScore: Math.round(equipmentScore * 10) / 10,
      utilityScore: Math.round(utilityScore * 10) / 10,
      riskScore: Math.round(riskScore * 10) / 10,
      supplyriskScore: Math.round(supplyScore * 10) / 10,
    },
    valuation,
    recommendation,
  };
}

function calculateValuation(input: CleanbiInput, cleanbiScore: number): ValuationOutput {
  // EBITDA Multiple
  let ebitdaMultiple = 2.5;
  if (cleanbiScore > 80) ebitdaMultiple = 4.5;
  else if (cleanbiScore > 70) ebitdaMultiple = 3.8;
  else if (cleanbiScore > 55) ebitdaMultiple = 3.2;

  const ebitdaValuation = input.ebitda * ebitdaMultiple;

  // SDE Multiple
  let sdeMultiple = 2.0;
  if (cleanbiScore >= 80) sdeMultiple = 3.0;
  else if (cleanbiScore >= 60) sdeMultiple = 2.5;

  const sdeValuation = input.sde * sdeMultiple;

  // Income Approach
  const capRate = 0.15; // 15% default
  const noi = input.ebitda; // Simplified
  const incomeValuation = noi / capRate;

  // Asset Valuation (simplified)
  const assetValuation = input.ebitda * 1.5; // Rough estimate

  // Weighted Final Valuation
  const finalValuation = 
    ebitdaValuation * 0.35 +
    sdeValuation * 0.25 +
    incomeValuation * 0.20 +
    assetValuation * 0.20;

  return {
    ebitdaMultiple: Math.round(ebitdaMultiple * 10) / 10,
    ebitdaValuation: Math.round(ebitdaValuation),
    sdeMultiple: Math.round(sdeMultiple * 10) / 10,
    sdeValuation: Math.round(sdeValuation),
    assetValuation: Math.round(assetValuation),
    incomeValuation: Math.round(incomeValuation),
    finalValuation: Math.round(finalValuation),
    valuationRange: {
      low: Math.round(finalValuation * 0.85),
      high: Math.round(finalValuation * 1.15),
    },
  };
}
