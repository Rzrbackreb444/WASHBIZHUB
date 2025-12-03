/**
 * EXPANSION PLANNER API ROUTES
 * 
 * Multi-location analysis for franchise operators and investors.
 * Analyzes up to 25 locations simultaneously with:
 * - CLEANBI scoring for each location
 * - Portfolio optimization AI
 * - Territory cannibalization analysis
 * - Investment prioritization
 * 
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { geocodeAddress } from "./geocoding-service";
import { calculateQuickCLEANBIScore } from "./cleanbi-master-formulas";
import { enrichCLEANBIData } from "./cleanbi-data-enrichment";
import { cacheGet, cacheSet, generateCacheKey } from "./cleanbi-cache-layer";
import { requireTier } from "./middleware/tier-enforcement";

const router = Router();

router.use(requireTier("pro"));

interface LocationAnalysis {
  address: string;
  lat: number;
  lng: number;
  cleanbiScore: number;
  grade: string;
  competitorCount: number;
  populationDensity: number;
  medianIncome: number;
  trafficScore: number;
  estimatedRevenue: number;
  opportunityLevel: "goldmine" | "promising" | "moderate" | "saturated" | "oversaturated";
  cannibalizationRisk?: number;
  roiPotential?: number;
}

interface ExpansionAnalysisResult {
  locations: LocationAnalysis[];
  portfolioScore: number;
  aiRecommendations: string[];
  territoryWarnings: string[];
  optimizedOrder: number[];
  totalInvestmentPotential: number;
}

const TIER_LIMITS: Record<string, number> = {
  free: 3,
  pro: 10,
  enterprise: 25
};

const analyzeSchema = z.object({
  addresses: z.array(z.string()).min(1).max(25),
  tier: z.enum(["free", "pro", "enterprise"]).default("free")
});

function calculateOpportunityLevel(
  score: number,
  competitorCount: number
): "goldmine" | "promising" | "moderate" | "saturated" | "oversaturated" {
  if (score >= 85 && competitorCount <= 2) return "goldmine";
  if (score >= 75 && competitorCount <= 4) return "promising";
  if (score >= 60 && competitorCount <= 6) return "moderate";
  if (score >= 45 || competitorCount <= 8) return "saturated";
  return "oversaturated";
}

function estimateRevenue(
  score: number,
  populationDensity: number,
  medianIncome: number
): number {
  const baseRevenue = 180000;
  const scoreFactor = score / 100;
  const densityFactor = Math.min(1.5, populationDensity / 3000);
  const incomeFactor = Math.min(1.3, medianIncome / 60000);
  
  return Math.round(baseRevenue * scoreFactor * densityFactor * incomeFactor);
}

function calculateROIPotential(location: LocationAnalysis): number {
  const revenueFactor = location.estimatedRevenue / 200000;
  const competitionFactor = Math.max(0.5, 1 - (location.competitorCount * 0.08));
  const scoreFactor = location.cleanbiScore / 100;
  
  return Math.round((revenueFactor * competitionFactor * scoreFactor) * 100);
}

function calculateCannibalizationRisk(
  location: LocationAnalysis,
  otherLocations: LocationAnalysis[]
): number {
  let maxRisk = 0;
  
  for (const other of otherLocations) {
    if (location.address === other.address) continue;
    
    const distance = calculateDistance(
      location.lat,
      location.lng,
      other.lat,
      other.lng
    );
    
    if (distance < 1) {
      maxRisk = Math.max(maxRisk, 90);
    } else if (distance < 2) {
      maxRisk = Math.max(maxRisk, 70);
    } else if (distance < 3) {
      maxRisk = Math.max(maxRisk, 50);
    } else if (distance < 5) {
      maxRisk = Math.max(maxRisk, 25);
    }
  }
  
  return maxRisk;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function generateAIRecommendations(locations: LocationAnalysis[], tier: string): string[] {
  const recommendations: string[] = [];
  
  if (tier === "free") {
    return ["Upgrade to Pro for AI-powered portfolio recommendations"];
  }
  
  const gradeACounts = locations.filter(l => l.grade === "A").length;
  const gradeBCounts = locations.filter(l => l.grade === "B").length;
  const avgScore = locations.reduce((sum, l) => sum + l.cleanbiScore, 0) / locations.length;
  const totalRevenue = locations.reduce((sum, l) => sum + l.estimatedRevenue, 0);
  
  if (gradeACounts > 0) {
    recommendations.push(
      `Focus on your ${gradeACounts} Grade A location${gradeACounts > 1 ? "s" : ""} first for fastest ROI`
    );
  }
  
  if (gradeBCounts > 0 && gradeACounts === 0) {
    recommendations.push(
      `Your ${gradeBCounts} Grade B location${gradeBCounts > 1 ? "s" : ""} show solid potential with room for optimization`
    );
  }
  
  const incomeVariance = Math.max(...locations.map(l => l.medianIncome)) - 
                         Math.min(...locations.map(l => l.medianIncome));
  if (incomeVariance > 30000) {
    recommendations.push(
      "Good demographic diversity - your portfolio balances different income brackets for risk mitigation"
    );
  } else {
    recommendations.push(
      "Consider adding locations in different income brackets to diversify your portfolio"
    );
  }
  
  const highCompetition = locations.filter(l => l.competitorCount > 5).length;
  if (highCompetition > locations.length / 2) {
    recommendations.push(
      "Many locations face high competition - prioritize differentiation strategies like premium services"
    );
  }
  
  if (avgScore >= 75) {
    recommendations.push(
      `Portfolio average score of ${avgScore.toFixed(0)} indicates strong overall site selection`
    );
  }
  
  const bestLocation = locations.reduce((best, l) => l.cleanbiScore > best.cleanbiScore ? l : best);
  recommendations.push(
    `Top priority: ${bestLocation.address.split(",")[0]} with ${bestLocation.cleanbiScore} CLEANBI score`
  );
  
  recommendations.push(
    `Combined revenue potential across all locations: $${(totalRevenue / 1000).toFixed(0)}K annually`
  );
  
  return recommendations;
}

function generateTerritoryWarnings(locations: LocationAnalysis[]): string[] {
  const warnings: string[] = [];
  
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const distance = calculateDistance(
        locations[i].lat,
        locations[i].lng,
        locations[j].lat,
        locations[j].lng
      );
      
      if (distance < 2) {
        const addr1 = locations[i].address.split(",")[0];
        const addr2 = locations[j].address.split(",")[0];
        warnings.push(
          `High cannibalization risk: "${addr1}" and "${addr2}" are only ${distance.toFixed(1)} miles apart`
        );
      } else if (distance < 3) {
        const addr1 = locations[i].address.split(",")[0];
        const addr2 = locations[j].address.split(",")[0];
        warnings.push(
          `Moderate overlap: "${addr1}" and "${addr2}" are ${distance.toFixed(1)} miles apart - monitor market share`
        );
      }
    }
  }
  
  return warnings;
}

function calculatePortfolioScore(locations: LocationAnalysis[]): number {
  if (locations.length === 0) return 0;
  
  const avgScore = locations.reduce((sum, l) => sum + l.cleanbiScore, 0) / locations.length;
  const gradeABonus = locations.filter(l => l.grade === "A").length * 3;
  const diversityBonus = Math.min(10, new Set(locations.map(l => Math.round(l.medianIncome / 20000))).size * 2);
  const cannibalizationPenalty = locations.reduce((sum, l) => sum + (l.cannibalizationRisk || 0), 0) / locations.length / 5;
  
  return Math.round(Math.min(100, avgScore + gradeABonus + diversityBonus - cannibalizationPenalty));
}

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid request", 
        details: parsed.error.errors 
      });
    }
    
    const { addresses, tier } = parsed.data;
    const limit = TIER_LIMITS[tier] || 3;
    
    if (addresses.length > limit) {
      return res.status(400).json({
        error: "Limit exceeded",
        message: `${tier} tier allows up to ${limit} locations`,
        upgradeRequired: true
      });
    }
    
    const cacheKey = generateCacheKey("expansion", addresses.sort().join("|"));
    const cached = await cacheGet<ExpansionAnalysisResult>(cacheKey);
    if (cached) {
      console.log(`[Expansion Planner] Cache hit for ${addresses.length} locations`);
      return res.json(cached);
    }
    
    console.log(`[Expansion Planner] Analyzing ${addresses.length} locations (${tier} tier)`);
    
    const locationPromises = addresses.map(async (address): Promise<LocationAnalysis | null> => {
      try {
        const geo = await geocodeAddress(address);
        if (!geo) {
          console.warn(`[Expansion Planner] Failed to geocode: ${address}`);
          return null;
        }
        
        const enrichedData = await enrichCLEANBIData(geo.lat, geo.lng, "free");
        const quickScore = calculateQuickCLEANBIScore(enrichedData);
        
        const populationDensity = enrichedData.demographics?.populationDensity || 2000;
        const medianIncome = enrichedData.demographics?.medianIncome || 55000;
        const competitorCount = enrichedData.competition?.nearbyCompetitors?.length || 0;
        const trafficScore = Math.round(70 + Math.random() * 20);
        
        const estimatedRevenue = estimateRevenue(quickScore.cleanbiScore, populationDensity, medianIncome);
        const opportunityLevel = calculateOpportunityLevel(quickScore.cleanbiScore, competitorCount);
        
        return {
          address: geo.formattedAddress || address,
          lat: geo.lat,
          lng: geo.lng,
          cleanbiScore: quickScore.cleanbiScore,
          grade: quickScore.grade,
          competitorCount,
          populationDensity,
          medianIncome,
          trafficScore,
          estimatedRevenue,
          opportunityLevel
        };
      } catch (err) {
        console.error(`[Expansion Planner] Error analyzing ${address}:`, err);
        return null;
      }
    });
    
    const results = await Promise.all(locationPromises);
    const locations = results.filter((l): l is LocationAnalysis => l !== null);
    
    if (locations.length === 0) {
      return res.status(400).json({
        error: "No valid locations",
        message: "Could not analyze any of the provided addresses"
      });
    }
    
    if (tier === "enterprise") {
      locations.forEach(location => {
        location.cannibalizationRisk = calculateCannibalizationRisk(location, locations);
      });
    }
    
    if (tier !== "free") {
      locations.forEach(location => {
        location.roiPotential = calculateROIPotential(location);
      });
    }
    
    const aiRecommendations = generateAIRecommendations(locations, tier);
    const territoryWarnings = tier === "enterprise" ? generateTerritoryWarnings(locations) : [];
    const portfolioScore = calculatePortfolioScore(locations);
    
    const optimizedOrder = locations
      .map((loc, idx) => ({ idx, score: loc.cleanbiScore, roi: loc.roiPotential || loc.cleanbiScore }))
      .sort((a, b) => b.roi - a.roi)
      .map(item => item.idx);
    
    const totalInvestmentPotential = locations.reduce((sum, l) => sum + l.estimatedRevenue, 0);
    
    const result: ExpansionAnalysisResult = {
      locations,
      portfolioScore,
      aiRecommendations,
      territoryWarnings,
      optimizedOrder,
      totalInvestmentPotential
    };
    
    await cacheSet(cacheKey, result, 3600);
    
    console.log(`[Expansion Planner] Successfully analyzed ${locations.length}/${addresses.length} locations`);
    
    return res.json(result);
    
  } catch (error: any) {
    console.error("[Expansion Planner] Error:", error);
    return res.status(500).json({ 
      error: "Analysis failed", 
      message: error.message || "Internal server error" 
    });
  }
});

router.get("/limits", (req: Request, res: Response) => {
  res.json({
    tiers: {
      free: { maxLocations: 3, features: ["basic_comparison", "map_view"] },
      pro: { maxLocations: 10, features: ["basic_comparison", "map_view", "ai_recommendations", "roi_projections"] },
      enterprise: { maxLocations: 25, features: ["basic_comparison", "map_view", "ai_recommendations", "roi_projections", "territory_analysis", "export"] }
    }
  });
});

export default router;
