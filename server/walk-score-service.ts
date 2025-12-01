/**
 * WALK SCORE API SERVICE
 * 
 * Integrates Walk Score, Transit Score, and Bike Score into CLEANBI Explorer
 * Free tier: 5,000 calls/day
 * 
 * © 2025 WashBizHub. All Rights Reserved.
 */

import { cacheGet, cacheSet, generateCacheKey } from "./cleanbi-cache-layer";

export interface WalkScoreResult {
  walkScore: number;
  walkDescription: string;
  transitScore: number | null;
  transitDescription: string | null;
  transitSummary: string | null;
  bikeScore: number | null;
  bikeDescription: string | null;
  logoUrl: string;
  moreInfoLink: string;
  status: "success" | "error" | "not_available";
  error?: string;
}

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days - scores don't change often

/**
 * Get Walk Score, Transit Score, and Bike Score for a location
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @param address - Street address (for better accuracy)
 */
export async function getWalkScore(
  lat: number,
  lng: number,
  address: string
): Promise<WalkScoreResult> {
  const apiKey = process.env.WALK_SCORE_API_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ WALK_SCORE_API_KEY not configured");
    return {
      walkScore: 0,
      walkDescription: "Not Available",
      transitScore: null,
      transitDescription: null,
      transitSummary: null,
      bikeScore: null,
      bikeDescription: null,
      logoUrl: "",
      moreInfoLink: "",
      status: "error",
      error: "Walk Score API not configured"
    };
  }

  // Check cache first
  const cacheKey = generateCacheKey("walkscore", `${lat.toFixed(5)},${lng.toFixed(5)}`);
  const cached = await cacheGet<WalkScoreResult>(cacheKey);
  
  if (cached) {
    console.log(`✅ Walk Score cache hit: ${cached.walkScore}`);
    return cached;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.walkscore.com/score?format=json&address=${encodedAddress}&lat=${lat}&lon=${lng}&transit=1&bike=1&wsapikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 1) {
      const result: WalkScoreResult = {
        walkScore: data.walkscore || 0,
        walkDescription: data.description || "Not Available",
        transitScore: data.transit?.score || null,
        transitDescription: data.transit?.description || null,
        transitSummary: data.transit?.summary || null,
        bikeScore: data.bike?.score || null,
        bikeDescription: data.bike?.description || null,
        logoUrl: data.logo_url || "",
        moreInfoLink: data.ws_link || "https://www.walkscore.com/how-it-works/",
        status: "success"
      };
      
      await cacheSet(cacheKey, result, CACHE_TTL);
      console.log(`✅ Walk Score fetched: Walk=${result.walkScore}, Transit=${result.transitScore}, Bike=${result.bikeScore}`);
      
      return result;
    } else if (data.status === 2) {
      // Score being calculated
      return {
        walkScore: 0,
        walkDescription: "Score being calculated",
        transitScore: null,
        transitDescription: null,
        transitSummary: null,
        bikeScore: null,
        bikeDescription: null,
        logoUrl: "",
        moreInfoLink: "",
        status: "not_available",
        error: "Walk Score is being calculated for this location"
      };
    } else {
      console.warn(`⚠️ Walk Score API error: status=${data.status}`);
      return {
        walkScore: 0,
        walkDescription: "Not Available",
        transitScore: null,
        transitDescription: null,
        transitSummary: null,
        bikeScore: null,
        bikeDescription: null,
        logoUrl: "",
        moreInfoLink: "",
        status: "error",
        error: `Walk Score API returned status ${data.status}`
      };
    }
  } catch (error: any) {
    console.error("❌ Walk Score API error:", error.message);
    return {
      walkScore: 0,
      walkDescription: "Error",
      transitScore: null,
      transitDescription: null,
      transitSummary: null,
      bikeScore: null,
      bikeDescription: null,
      logoUrl: "",
      moreInfoLink: "",
      status: "error",
      error: error.message
    };
  }
}

/**
 * Get color for Walk Score display
 */
export function getWalkScoreColor(score: number): string {
  if (score >= 90) return "#22C55E"; // Green - Walker's Paradise
  if (score >= 70) return "#A3E635"; // Lime - Very Walkable
  if (score >= 50) return "#FBBF24"; // Amber - Somewhat Walkable
  if (score >= 25) return "#F97316"; // Orange - Car-Dependent
  return "#EF4444"; // Red - Almost All Errands Require a Car
}

/**
 * Calculate walkability contribution to CLEANBI score
 * Laundromats benefit from walkable locations (more foot traffic)
 */
export function calculateWalkabilityBonus(walkScore: number): number {
  // Walk Score contribution: 0-10 bonus points
  // 90+ = +10 points (Walker's Paradise)
  // 70-89 = +7 points (Very Walkable)
  // 50-69 = +4 points (Somewhat Walkable)
  // 25-49 = +1 point (Car-Dependent)
  // <25 = 0 points (Almost All Errands Require a Car)
  
  if (walkScore >= 90) return 10;
  if (walkScore >= 70) return 7;
  if (walkScore >= 50) return 4;
  if (walkScore >= 25) return 1;
  return 0;
}
