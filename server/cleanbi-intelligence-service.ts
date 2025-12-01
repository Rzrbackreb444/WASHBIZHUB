/**
 * CLEANBI UNIFIED INTELLIGENCE SERVICE
 * 
 * Orchestrates all premium APIs with tier-based access control:
 * - Google Solar API (roof potential, energy savings)
 * - OpenEI Utility Rates (actual kWh costs by ZIP)
 * - ATTOM Property Data (ownership, values, liens, motivated sellers)
 * - Google Distance Matrix (drive-time heatmaps)
 * - Walk Score (already integrated, extended here)
 * 
 * Tier Access Matrix:
 * FREE: CLEANBI grade, competitor map, Street View, Walk Score number
 * STARTER: Walk details, property value, solar potential
 * PRO: Utility costs, calculators, distance matrix, full insights
 * ENTERPRISE: Ownership/liens, bulk export, API access
 * 
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { cacheGet, cacheSet, generateCacheKey } from "./cleanbi-cache-layer";
import { getWalkScore, WalkScoreResult } from "./walk-score-service";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type UserTier = "free" | "starter" | "pro" | "enterprise";

export interface SolarData {
  hasSolarPotential: boolean;
  annualSunshineHours: number;
  roofAreaSqFt: number;
  estimatedPanelCount: number;
  annualKwhProduction: number;
  annualSavings: number;
  paybackYears: number;
  carbonOffsetLbs: number;
  status: "success" | "error" | "not_available";
  error?: string;
}

export interface UtilityRateData {
  utilityName: string;
  residentialRate: number; // $/kWh
  commercialRate: number; // $/kWh
  industrialRate: number; // $/kWh
  avgMonthlyBill: number;
  rateClass: "low" | "medium" | "high";
  state: string;
  zipCode: string;
  status: "success" | "error" | "not_available";
  error?: string;
}

export interface PropertyData {
  estimatedValue: number;
  lastSalePrice: number;
  lastSaleDate: string;
  yearBuilt: number;
  lotSizeSqFt: number;
  buildingSqFt: number;
  propertyType: string;
  ownerName: string;
  ownerOccupied: boolean;
  taxAssessedValue: number;
  annualPropertyTax: number;
  hasLiens: boolean;
  lienAmount: number;
  inForeclosure: boolean;
  motivatedSellerScore: number; // 0-100
  status: "success" | "error" | "not_available";
  error?: string;
  ownershipGated?: boolean;
  liensGated?: boolean;
}

export interface DistanceMatrixData {
  driveTimeMinutes: number;
  distanceMiles: number;
  trafficCondition: "light" | "moderate" | "heavy";
  peakHourDuration: number;
  nearbyHouseholds1Mile: number;
  nearbyHouseholds3Mile: number;
  nearbyHouseholds5Mile: number;
  catchmentScore: number; // 0-100
  status: "success" | "error" | "not_available";
  error?: string;
}

export interface FullIntelligenceReport {
  // Core (FREE tier)
  walkScore: WalkScoreResult | null;
  
  // STARTER tier
  solarData: SolarData | null;
  propertyValue: Partial<PropertyData> | null; // Limited for starter
  
  // PRO tier
  utilityRates: UtilityRateData | null;
  distanceMatrix: DistanceMatrixData | null;
  
  // ENTERPRISE tier
  fullPropertyData: PropertyData | null;
  
  // Metadata
  tier: UserTier;
  featuresUnlocked: string[];
  featuresGated: string[];
  timestamp: number;
}

// Cache TTLs
const CACHE_TTL = {
  solar: 30 * 24 * 60 * 60, // 30 days - roof doesn't change
  utility: 7 * 24 * 60 * 60, // 7 days - rates update monthly
  property: 24 * 60 * 60, // 1 day - values fluctuate
  distance: 60 * 60, // 1 hour - traffic changes
};

// ============================================================================
// GOOGLE SOLAR API
// ============================================================================

export async function getSolarPotential(lat: number, lng: number): Promise<SolarData> {
  const apiKey = process.env.SOLAR_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return {
      hasSolarPotential: false,
      annualSunshineHours: 0,
      roofAreaSqFt: 0,
      estimatedPanelCount: 0,
      annualKwhProduction: 0,
      annualSavings: 0,
      paybackYears: 0,
      carbonOffsetLbs: 0,
      status: "error",
      error: "Solar API not configured"
    };
  }

  const cacheKey = generateCacheKey("solar", `${lat.toFixed(5)},${lng.toFixed(5)}`);
  const cached = await cacheGet<SolarData>(cacheKey);
  if (cached) {
    console.log("✅ Solar data cache hit");
    return cached;
  }

  try {
    // Google Solar API - Building Insights endpoint
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // If building not found, estimate based on location
      console.log("⚠️ Solar API: No building data, using regional estimates");
      const estimatedData = estimateSolarPotential(lat, lng);
      await cacheSet(cacheKey, estimatedData, CACHE_TTL.solar);
      return estimatedData;
    }
    
    const data = await response.json();
    
    if (data.solarPotential) {
      const solar = data.solarPotential;
      const avgUtilityRate = 0.12; // National average $/kWh
      const panelCapacityWatts = 400;
      const panelCount = solar.maxArrayPanelsCount || Math.floor((solar.maxArrayAreaMeters2 || 0) * 10.764 / 18);
      const annualKwh = (solar.maxSunshineHoursPerYear || 1500) * panelCount * panelCapacityWatts / 1000 * 0.18;
      
      const result: SolarData = {
        hasSolarPotential: true,
        annualSunshineHours: Math.round(solar.maxSunshineHoursPerYear || 1500),
        roofAreaSqFt: Math.round((solar.wholeRoofStats?.areaMeters2 || solar.maxArrayAreaMeters2 || 0) * 10.764),
        estimatedPanelCount: panelCount,
        annualKwhProduction: Math.round(annualKwh),
        annualSavings: Math.round(annualKwh * avgUtilityRate),
        paybackYears: Math.round(panelCount * 300 / (annualKwh * avgUtilityRate * 0.7)), // After incentives
        carbonOffsetLbs: Math.round(annualKwh * 0.92), // EPA factor
        status: "success"
      };
      
      await cacheSet(cacheKey, result, CACHE_TTL.solar);
      console.log(`✅ Solar potential: ${result.annualKwhProduction} kWh/year`);
      return result;
    }
    
    const estimated = estimateSolarPotential(lat, lng);
    await cacheSet(cacheKey, estimated, CACHE_TTL.solar);
    return estimated;
    
  } catch (error) {
    console.error("❌ Solar API error:", error);
    return estimateSolarPotential(lat, lng);
  }
}

function estimateSolarPotential(lat: number, lng: number): SolarData {
  // Estimate based on latitude (solar irradiance varies by location)
  const absLat = Math.abs(lat);
  const sunshineMultiplier = absLat < 25 ? 1.2 : absLat < 35 ? 1.1 : absLat < 45 ? 1.0 : 0.85;
  const baseHours = 1600 * sunshineMultiplier;
  
  // Assume typical commercial building
  const roofSqFt = 3500;
  const panels = Math.floor(roofSqFt / 18);
  const annualKwh = baseHours * panels * 0.4 * 0.18;
  
  return {
    hasSolarPotential: true,
    annualSunshineHours: Math.round(baseHours),
    roofAreaSqFt: roofSqFt,
    estimatedPanelCount: panels,
    annualKwhProduction: Math.round(annualKwh),
    annualSavings: Math.round(annualKwh * 0.12),
    paybackYears: 8,
    carbonOffsetLbs: Math.round(annualKwh * 0.92),
    status: "success"
  };
}

// ============================================================================
// OPENEI UTILITY RATES API
// ============================================================================

export async function getUtilityRates(lat: number, lng: number, zipCode?: string): Promise<UtilityRateData> {
  const apiKey = process.env.UTILITY_RATE_API_KEY;
  
  // Check cache first
  const cacheKey = generateCacheKey("utility", zipCode || `${lat.toFixed(3)},${lng.toFixed(3)}`);
  const cached = await cacheGet<UtilityRateData>(cacheKey);
  if (cached) {
    console.log("✅ Utility rates cache hit");
    return cached;
  }

  try {
    // OpenEI Utility Rate Database API
    let url: string;
    
    if (apiKey) {
      url = `https://api.openei.org/utility_rates?version=7&format=json&api_key=${apiKey}&lat=${lat}&lon=${lng}&limit=1`;
    } else {
      // Fallback to estimates by state/region
      return estimateUtilityRates(lat, lng);
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log("⚠️ OpenEI API error, using estimates");
      return estimateUtilityRates(lat, lng);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const utility = data.items[0];
      const avgResidential = utility.energyratestructure?.[0]?.[0]?.rate || 0.12;
      const avgCommercial = utility.energyratestructure?.[0]?.[0]?.rate * 0.9 || 0.11; // Commercial usually lower
      
      const result: UtilityRateData = {
        utilityName: utility.utility || "Local Utility",
        residentialRate: Number(avgResidential.toFixed(4)),
        commercialRate: Number(avgCommercial.toFixed(4)),
        industrialRate: Number((avgCommercial * 0.85).toFixed(4)),
        avgMonthlyBill: Math.round(avgCommercial * 2500), // Typical laundromat usage
        rateClass: avgCommercial < 0.10 ? "low" : avgCommercial < 0.14 ? "medium" : "high",
        state: utility.state || "",
        zipCode: zipCode || "",
        status: "success"
      };
      
      await cacheSet(cacheKey, result, CACHE_TTL.utility);
      console.log(`✅ Utility rate: $${result.commercialRate}/kWh`);
      return result;
    }
    
    return estimateUtilityRates(lat, lng);
    
  } catch (error) {
    console.error("❌ Utility API error:", error);
    return estimateUtilityRates(lat, lng);
  }
}

function estimateUtilityRates(lat: number, lng: number): UtilityRateData {
  // Regional utility rate estimates (EIA data)
  const regions: Record<string, { rate: number; state: string }> = {
    // High cost
    "CA": { rate: 0.22, state: "California" },
    "HI": { rate: 0.35, state: "Hawaii" },
    "AK": { rate: 0.21, state: "Alaska" },
    "CT": { rate: 0.21, state: "Connecticut" },
    "MA": { rate: 0.22, state: "Massachusetts" },
    "NY": { rate: 0.18, state: "New York" },
    // Medium cost
    "TX": { rate: 0.12, state: "Texas" },
    "FL": { rate: 0.12, state: "Florida" },
    "AZ": { rate: 0.12, state: "Arizona" },
    "CO": { rate: 0.12, state: "Colorado" },
    // Low cost
    "LA": { rate: 0.09, state: "Louisiana" },
    "AR": { rate: 0.10, state: "Arkansas" },
    "OK": { rate: 0.10, state: "Oklahoma" },
    "WA": { rate: 0.09, state: "Washington" },
    "ID": { rate: 0.10, state: "Idaho" },
  };
  
  // Estimate region by longitude/latitude
  let estimatedRate = 0.12;
  let estimatedState = "National Avg";
  
  if (lng < -120) {
    estimatedRate = lat > 42 ? 0.10 : 0.20; // Pacific NW vs CA
    estimatedState = lat > 42 ? "Pacific NW" : "West Coast";
  } else if (lng < -100) {
    estimatedRate = 0.11;
    estimatedState = "Mountain/Plains";
  } else if (lng < -85) {
    estimatedRate = lat > 37 ? 0.13 : 0.11;
    estimatedState = "Midwest/South";
  } else {
    estimatedRate = lat > 40 ? 0.18 : 0.12;
    estimatedState = lat > 40 ? "Northeast" : "Southeast";
  }
  
  return {
    utilityName: "Regional Estimate",
    residentialRate: estimatedRate,
    commercialRate: estimatedRate * 0.9,
    industrialRate: estimatedRate * 0.75,
    avgMonthlyBill: Math.round(estimatedRate * 0.9 * 2500),
    rateClass: estimatedRate < 0.10 ? "low" : estimatedRate < 0.14 ? "medium" : "high",
    state: estimatedState,
    zipCode: "",
    status: "not_available", // Indicate this is an estimate, not actual API data
    error: "Utility rate data estimated from regional averages"
  };
}

// ============================================================================
// ATTOM PROPERTY DATA API
// ============================================================================

export async function getPropertyData(lat: number, lng: number, address: string): Promise<PropertyData> {
  const apiKey = process.env.ATTOM_API_KEY;
  
  if (!apiKey) {
    return estimatePropertyData(lat, lng);
  }

  const cacheKey = generateCacheKey("property", `${lat.toFixed(5)},${lng.toFixed(5)}`);
  const cached = await cacheGet<PropertyData>(cacheKey);
  if (cached) {
    console.log("✅ Property data cache hit");
    return cached;
  }

  try {
    // ATTOM Property API - using coordinates
    const url = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?latitude=${lat}&longitude=${lng}&radius=0.1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'apikey': apiKey
      }
    });
    
    if (!response.ok) {
      console.log("⚠️ ATTOM API error, using estimates");
      return estimatePropertyData(lat, lng);
    }
    
    const data = await response.json();
    
    if (data.property && data.property.length > 0) {
      const prop = data.property[0];
      const assessment = prop.assessment || {};
      const sale = prop.sale || {};
      const building = prop.building || {};
      const lot = prop.lot || {};
      
      // Calculate motivated seller score
      const motivatedScore = calculateMotivatedSellerScore(prop);
      
      const result: PropertyData = {
        estimatedValue: assessment.market?.mktTtlValue || assessment.assessed?.assdTtlValue * 1.2 || 0,
        lastSalePrice: sale.saleAmountValue || 0,
        lastSaleDate: sale.saleTransDate || "",
        yearBuilt: building.yearBuilt || 0,
        lotSizeSqFt: lot.lotSize1 || lot.lotSizeSquareFeet || 0,
        buildingSqFt: building.sizeInd || building.bldgSize || 0,
        propertyType: prop.summary?.propType || "Commercial",
        ownerName: prop.owner?.ownerName1 || "Unknown",
        ownerOccupied: prop.owner?.ownerOccupiedInd === "Y",
        taxAssessedValue: assessment.assessed?.assdTtlValue || 0,
        annualPropertyTax: assessment.tax?.taxAmt || 0,
        hasLiens: (prop.lien?.totalOpenLienAmt || 0) > 0,
        lienAmount: prop.lien?.totalOpenLienAmt || 0,
        inForeclosure: prop.foreclosure?.fcStatus === "Active",
        motivatedSellerScore: motivatedScore,
        status: "success"
      };
      
      await cacheSet(cacheKey, result, CACHE_TTL.property);
      console.log(`✅ Property value: $${result.estimatedValue.toLocaleString()}`);
      return result;
    }
    
    return estimatePropertyData(lat, lng);
    
  } catch (error) {
    console.error("❌ ATTOM API error:", error);
    return estimatePropertyData(lat, lng);
  }
}

function calculateMotivatedSellerScore(prop: any): number {
  let score = 50; // Base score
  
  // Positive indicators (motivated to sell)
  if (prop.foreclosure?.fcStatus === "Active") score += 30;
  if ((prop.lien?.totalOpenLienAmt || 0) > 10000) score += 15;
  if (!prop.owner?.ownerOccupiedInd) score += 5; // Absentee owner
  
  const lastSale = prop.sale?.saleTransDate;
  if (lastSale) {
    const yearsSinceSale = (Date.now() - new Date(lastSale).getTime()) / (365 * 24 * 60 * 60 * 1000);
    if (yearsSinceSale > 15) score += 10; // Long-term ownership may indicate estate/retirement
  }
  
  // Cap at 100
  return Math.min(100, Math.max(0, score));
}

function estimatePropertyData(lat: number, lng: number): PropertyData {
  // Regional commercial property estimates
  const baseValue = 400000; // National average for small commercial
  
  // Adjust by region (simplified)
  let multiplier = 1.0;
  if (lng < -120 && lat > 32 && lat < 42) multiplier = 1.8; // CA
  if (lng > -75 && lat > 40) multiplier = 1.5; // Northeast
  if (lng < -95 && lng > -105) multiplier = 0.8; // Central US
  
  return {
    estimatedValue: Math.round(baseValue * multiplier),
    lastSalePrice: 0,
    lastSaleDate: "",
    yearBuilt: 1985,
    lotSizeSqFt: 8000,
    buildingSqFt: 3500,
    propertyType: "Commercial",
    ownerName: "Not Available",
    ownerOccupied: false,
    taxAssessedValue: Math.round(baseValue * multiplier * 0.8),
    annualPropertyTax: Math.round(baseValue * multiplier * 0.015),
    hasLiens: false,
    lienAmount: 0,
    inForeclosure: false,
    motivatedSellerScore: 50,
    status: "not_available",
    error: "Property data requires ATTOM API"
  };
}

// ============================================================================
// GOOGLE DISTANCE MATRIX API
// ============================================================================

export async function getDistanceMatrix(lat: number, lng: number): Promise<DistanceMatrixData> {
  const apiKey = process.env.DISTANCE_MATRIX_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return estimateDistanceMatrix(lat, lng);
  }

  const cacheKey = generateCacheKey("distance", `${lat.toFixed(4)},${lng.toFixed(4)}`);
  const cached = await cacheGet<DistanceMatrixData>(cacheKey);
  if (cached) {
    console.log("✅ Distance matrix cache hit");
    return cached;
  }

  try {
    // Generate sample destinations (cardinal directions at 1, 3, 5 miles)
    const destinations = [
      { lat: lat + 0.0145, lng }, // ~1 mile north
      { lat: lat - 0.0145, lng }, // ~1 mile south
      { lat, lng: lng + 0.0145 / Math.cos(lat * Math.PI / 180) }, // ~1 mile east
      { lat, lng: lng - 0.0145 / Math.cos(lat * Math.PI / 180) }, // ~1 mile west
    ];
    
    const destString = destinations.map(d => `${d.lat},${d.lng}`).join("|");
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${destString}&mode=driving&departure_time=now&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return estimateDistanceMatrix(lat, lng);
    }
    
    const data = await response.json();
    
    if (data.rows && data.rows[0]?.elements) {
      const elements = data.rows[0].elements;
      const avgDuration = elements.reduce((sum: number, el: any) => 
        sum + (el.duration_in_traffic?.value || el.duration?.value || 300), 0) / elements.length;
      
      const avgDistance = elements.reduce((sum: number, el: any) => 
        sum + (el.distance?.value || 1609), 0) / elements.length;
      
      // Estimate traffic condition
      const normalDuration = elements.reduce((sum: number, el: any) => 
        sum + (el.duration?.value || 300), 0) / elements.length;
      const trafficRatio = avgDuration / normalDuration;
      
      const result: DistanceMatrixData = {
        driveTimeMinutes: Math.round(avgDuration / 60),
        distanceMiles: Number((avgDistance / 1609).toFixed(1)),
        trafficCondition: trafficRatio < 1.2 ? "light" : trafficRatio < 1.5 ? "moderate" : "heavy",
        peakHourDuration: Math.round(avgDuration * 1.3 / 60),
        nearbyHouseholds1Mile: estimateHouseholds(lat, lng, 1),
        nearbyHouseholds3Mile: estimateHouseholds(lat, lng, 3),
        nearbyHouseholds5Mile: estimateHouseholds(lat, lng, 5),
        catchmentScore: calculateCatchmentScore(avgDuration, trafficRatio),
        status: "success"
      };
      
      await cacheSet(cacheKey, result, CACHE_TTL.distance);
      console.log(`✅ Distance matrix: ${result.driveTimeMinutes} min avg, ${result.trafficCondition} traffic`);
      return result;
    }
    
    return estimateDistanceMatrix(lat, lng);
    
  } catch (error) {
    console.error("❌ Distance Matrix API error:", error);
    return estimateDistanceMatrix(lat, lng);
  }
}

function estimateHouseholds(lat: number, lng: number, radiusMiles: number): number {
  // Rough estimate based on US average density
  const area = Math.PI * radiusMiles * radiusMiles; // sq miles
  const avgDensity = 90; // US average households per sq mile
  
  // Adjust for urban cores
  const absLat = Math.abs(lat);
  let urbanMultiplier = 1;
  if ((lng > -122 && lng < -118 && lat > 33 && lat < 38) || // CA coast
      (lng > -75 && lng < -73 && lat > 40 && lat < 42)) {   // NYC area
    urbanMultiplier = 5;
  } else if (lng > -88 && lng < -87 && lat > 41 && lat < 42) { // Chicago
    urbanMultiplier = 4;
  }
  
  return Math.round(area * avgDensity * urbanMultiplier);
}

function calculateCatchmentScore(avgDuration: number, trafficRatio: number): number {
  // Score based on accessibility
  let score = 70;
  
  if (avgDuration < 180) score += 20; // Under 3 min avg
  else if (avgDuration < 300) score += 10; // Under 5 min
  else if (avgDuration > 600) score -= 15; // Over 10 min
  
  if (trafficRatio < 1.2) score += 10; // Light traffic
  else if (trafficRatio > 1.5) score -= 10; // Heavy traffic
  
  return Math.min(100, Math.max(0, score));
}

function estimateDistanceMatrix(lat: number, lng: number): DistanceMatrixData {
  return {
    driveTimeMinutes: 5,
    distanceMiles: 2.5,
    trafficCondition: "moderate",
    peakHourDuration: 8,
    nearbyHouseholds1Mile: estimateHouseholds(lat, lng, 1),
    nearbyHouseholds3Mile: estimateHouseholds(lat, lng, 3),
    nearbyHouseholds5Mile: estimateHouseholds(lat, lng, 5),
    catchmentScore: 65,
    status: "not_available",
    error: "Distance Matrix API required for live data"
  };
}

// ============================================================================
// UNIFIED INTELLIGENCE ORCHESTRATOR
// ============================================================================

export async function getFullIntelligenceReport(
  lat: number,
  lng: number,
  address: string,
  zipCode: string,
  userTier: UserTier
): Promise<FullIntelligenceReport> {
  
  const featuresUnlocked: string[] = [];
  const featuresGated: string[] = [];
  
  // Always get Walk Score (FREE tier)
  const walkScore = await getWalkScore(lat, lng, address);
  featuresUnlocked.push("walkScore");
  
  // STARTER tier and above
  let solarData: SolarData | null = null;
  let propertyValue: Partial<PropertyData> | null = null;
  
  if (userTier !== "free") {
    solarData = await getSolarPotential(lat, lng);
    featuresUnlocked.push("solarPotential");
    
    const fullProperty = await getPropertyData(lat, lng, address);
    propertyValue = {
      estimatedValue: fullProperty.estimatedValue,
      yearBuilt: fullProperty.yearBuilt,
      buildingSqFt: fullProperty.buildingSqFt,
      propertyType: fullProperty.propertyType,
      taxAssessedValue: fullProperty.taxAssessedValue,
      status: fullProperty.status,
      // Set gating flags for enterprise-only data
      ownershipGated: userTier !== "enterprise",
      liensGated: userTier !== "enterprise"
    };
    featuresUnlocked.push("propertyValue");
  } else {
    featuresGated.push("solarPotential", "propertyValue");
  }
  
  // PRO tier and above
  let utilityRates: UtilityRateData | null = null;
  let distanceMatrix: DistanceMatrixData | null = null;
  
  if (userTier === "pro" || userTier === "enterprise") {
    utilityRates = await getUtilityRates(lat, lng, zipCode);
    distanceMatrix = await getDistanceMatrix(lat, lng);
    featuresUnlocked.push("utilityRates", "distanceMatrix", "calculators");
  } else {
    featuresGated.push("utilityRates", "distanceMatrix", "calculators");
  }
  
  // ENTERPRISE tier only
  let fullPropertyData: PropertyData | null = null;
  
  if (userTier === "enterprise") {
    fullPropertyData = await getPropertyData(lat, lng, address);
    featuresUnlocked.push("ownershipData", "lienData", "motivatedSeller", "bulkExport");
  } else {
    featuresGated.push("ownershipData", "lienData", "motivatedSeller", "bulkExport");
  }
  
  return {
    walkScore,
    solarData,
    propertyValue,
    utilityRates,
    distanceMatrix,
    fullPropertyData,
    tier: userTier,
    featuresUnlocked,
    featuresGated,
    timestamp: Date.now()
  };
}

// ============================================================================
// FEATURE GATING HELPERS
// ============================================================================

export function canAccessFeature(userTier: UserTier, feature: string): boolean {
  const tierLevels: Record<UserTier, number> = {
    free: 0,
    starter: 1,
    pro: 2,
    enterprise: 3
  };
  
  const featureRequirements: Record<string, number> = {
    // FREE (0)
    cleanbiGrade: 0,
    competitorMap: 0,
    streetView: 0,
    walkScoreNumber: 0,
    
    // STARTER (1)
    walkScoreDetails: 1,
    transitScore: 1,
    bikeScore: 1,
    solarPotential: 1,
    propertyValue: 1,
    aerialView: 1,
    
    // PRO (2)
    utilityRates: 2,
    distanceMatrix: 2,
    turnsPerDayCalc: 2,
    ebitdaCalc: 2,
    monteCarloSim: 2,
    revenueForecaster: 2,
    pdfExport: 2,
    
    // ENTERPRISE (3)
    ownershipData: 3,
    lienData: 3,
    motivatedSeller: 3,
    foreclosureAlerts: 3,
    bulkExport: 3,
    apiAccess: 3,
    whiteLabel: 3
  };
  
  const required = featureRequirements[feature] ?? 3; // Default to enterprise if unknown
  return tierLevels[userTier] >= required;
}

export function getUpgradeMessage(feature: string): { tier: UserTier; message: string } {
  const messages: Record<string, { tier: UserTier; message: string }> = {
    walkScoreDetails: {
      tier: "starter",
      message: "Upgrade to Starter for detailed walkability insights, transit & bike scores"
    },
    solarPotential: {
      tier: "starter", 
      message: "Unlock solar potential analysis to estimate energy savings"
    },
    propertyValue: {
      tier: "starter",
      message: "See estimated property values and building details"
    },
    utilityRates: {
      tier: "pro",
      message: "Get actual utility rates to calculate true operating costs"
    },
    distanceMatrix: {
      tier: "pro",
      message: "See drive-time analysis and customer catchment data"
    },
    turnsPerDayCalc: {
      tier: "pro",
      message: "Access Turns/Day calculator for revenue projections"
    },
    ebitdaCalc: {
      tier: "pro",
      message: "Use EBITDA calculator for deal valuation"
    },
    monteCarloSim: {
      tier: "pro",
      message: "Run Monte Carlo simulations for risk analysis"
    },
    ownershipData: {
      tier: "enterprise",
      message: "Access owner names and contact information"
    },
    motivatedSeller: {
      tier: "enterprise",
      message: "See motivated seller scores and distress indicators"
    }
  };
  
  return messages[feature] || { tier: "pro", message: "Upgrade to unlock this premium feature" };
}
