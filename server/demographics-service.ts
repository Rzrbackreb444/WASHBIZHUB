/**
 * UNIFIED DEMOGRAPHICS SERVICE
 * 
 * Combines ATTOM property data and US Census Bureau demographics
 * into the LocationDemographics format for CLEANBI Explorer.
 * 
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { LocationDemographics } from "@shared/schema";
import { enrichWithCensusData, CensusData } from "./census-data-service";
import { enrichWithAttomData, AttomEnrichmentResult } from "./attom-data-service";
import { cachedFetch, CACHE_TTL } from "./cleanbi-cache-layer";

export interface DemographicsResult {
  success: boolean;
  demographics: LocationDemographics | null;
  rawCensus: CensusData | null;
  rawAttom: AttomEnrichmentResult | null;
  error?: string;
}

/**
 * Get comprehensive demographics for a location
 * Combines ATTOM property intelligence with Census demographic data
 */
export async function getLocationDemographics(
  address: string,
  lat: number,
  lng: number,
  zipCode?: string
): Promise<DemographicsResult> {
  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  
  try {
    return await cachedFetch<DemographicsResult>(
      "demographics",
      cacheKey,
      async () => {
        const [censusResult, attomResult] = await Promise.all([
          enrichWithCensusData(zipCode, { lat, lng }),
          enrichWithAttomData(address, zipCode, { lat, lng })
        ]);

        if (!censusResult.success || !censusResult.data) {
          console.warn("⚠️ Census data unavailable for:", address);
        }

        const census = censusResult.data;
        const attom = attomResult;

        const demographics: LocationDemographics = {
          population: census?.population || 50000,
          populationDensity: census?.populationDensity || 3000,
          medianHouseholdIncome: census?.medianHouseholdIncome || 55000,
          medianAge: census?.medianAge || 38,
          householdCount: census?.housingUnits || Math.round((census?.population || 50000) / 2.5),
          renterPercentage: census?.renterPercentage || 35,
          ownerPercentage: 100 - (census?.renterPercentage || 35),
          averageHouseholdSize: 2.5,
          educationBachelorPlus: census?.educationBachelorOrHigher || 30,
          unemploymentRate: census?.unemploymentRate || 4.5,
          povertyRate: census?.povertyRate || 12,
          growthRate5Year: attom?.market?.homeValueChange5Yr ? attom.market.homeValueChange5Yr / 5 : undefined,
          projectedGrowth: calculateProjectedGrowth(census, attom),
          dataSource: determineDataSource(censusResult.source, attom?.source),
          lastUpdated: new Date().toISOString(),
          confidence: calculateConfidence(censusResult, attom),
        };

        console.log(`✅ Demographics enriched: pop=${demographics.population}, income=$${demographics.medianHouseholdIncome}`);

        return {
          success: true,
          demographics,
          rawCensus: census,
          rawAttom: attom,
        };
      },
      CACHE_TTL.DEMOGRAPHICS
    );
  } catch (error: any) {
    console.error("❌ Demographics service error:", error.message);
    return {
      success: false,
      demographics: null,
      rawCensus: null,
      rawAttom: null,
      error: error.message,
    };
  }
}

function determineDataSource(
  censusSource: string | undefined,
  attomSource: string | undefined
): "attom" | "census" | "estimate" {
  if (attomSource === "attom_api" || censusSource === "census_api") {
    return censusSource === "census_api" ? "census" : "attom";
  }
  return "estimate";
}

function calculateConfidence(
  censusResult: { success: boolean; data: CensusData | null; source: string },
  attomResult: AttomEnrichmentResult | null
): number {
  let confidence = 50;
  
  if (censusResult.success && censusResult.data) {
    confidence += censusResult.data.confidence * 0.3;
  }
  
  if (attomResult?.success) {
    confidence += attomResult.confidence * 0.2;
  }
  
  return Math.min(100, Math.round(confidence));
}

function calculateProjectedGrowth(
  census: CensusData | null,
  attom: AttomEnrichmentResult | null
): number | undefined {
  if (!attom?.market) return undefined;
  
  const homeGrowth = attom.market.homeValueChange1Yr || 0;
  const permitActivity = attom.permits?.recentPermits || 0;
  
  let growth = homeGrowth * 0.3;
  
  if (permitActivity > 5) {
    growth += 2;
  } else if (permitActivity > 2) {
    growth += 1;
  }
  
  if (attom.market.inventoryLevel === "low") {
    growth += 1.5;
  }
  
  return Math.round(growth * 10) / 10;
}

/**
 * Calculate Laundry Market Potential from demographics
 * Returns 0-100 score based on demographic suitability
 */
export function calculateMarketPotential(demographics: LocationDemographics): number {
  let score = 0;
  
  if (demographics.renterPercentage >= 40) {
    score += 25;
  } else if (demographics.renterPercentage >= 25) {
    score += 15;
  } else {
    score += 5;
  }
  
  if (demographics.populationDensity >= 5000) {
    score += 25;
  } else if (demographics.populationDensity >= 2000) {
    score += 15;
  } else if (demographics.populationDensity >= 1000) {
    score += 10;
  }
  
  const income = demographics.medianHouseholdIncome;
  if (income >= 35000 && income <= 75000) {
    score += 20;
  } else if (income >= 25000 && income <= 100000) {
    score += 15;
  } else {
    score += 5;
  }
  
  if (demographics.householdCount >= 10000) {
    score += 15;
  } else if (demographics.householdCount >= 5000) {
    score += 10;
  } else {
    score += 5;
  }
  
  if (demographics.projectedGrowth && demographics.projectedGrowth > 2) {
    score += 15;
  } else if (demographics.projectedGrowth && demographics.projectedGrowth > 0) {
    score += 10;
  }
  
  return Math.min(100, score);
}

/**
 * Get demographic insights for display
 */
export function getDemographicInsights(demographics: LocationDemographics): string[] {
  const insights: string[] = [];
  
  if (demographics.renterPercentage >= 50) {
    insights.push(`High renter population (${demographics.renterPercentage}%) - strong laundry demand`);
  } else if (demographics.renterPercentage >= 35) {
    insights.push(`Good renter mix (${demographics.renterPercentage}%) - solid customer base`);
  }
  
  if (demographics.populationDensity >= 5000) {
    insights.push(`High density area (${demographics.populationDensity.toLocaleString()}/sq mi) - excellent foot traffic`);
  }
  
  if (demographics.medianAge >= 25 && demographics.medianAge <= 45) {
    insights.push(`Prime demographic age (median ${demographics.medianAge}) - high laundry usage`);
  }
  
  if (demographics.projectedGrowth && demographics.projectedGrowth > 3) {
    insights.push(`Fast-growing market (${demographics.projectedGrowth}% projected) - increasing demand`);
  }
  
  if (demographics.unemploymentRate < 4) {
    insights.push(`Strong economy (${demographics.unemploymentRate}% unemployment) - stable spending`);
  }
  
  if (demographics.averageHouseholdSize > 3) {
    insights.push(`Larger households (${demographics.averageHouseholdSize} avg) - more laundry volume`);
  }
  
  return insights;
}
