/**
 * COMPETITION ANALYZER & HEATMAP GENERATOR
 * 
 * Uses Google Maps Places API to find competitors,
 * analyze market saturation, and generate heatmap data
 */

import { CompetitorData, CompetitionAnalysis } from './consultation-tiers';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  types?: string[];
}

/**
 * Find competitors within radius of a location
 */
export async function findCompetitors(
  lat: number,
  lng: number,
  radiusMiles: number = 3
): Promise<CompetitorData[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("[Competition Analyzer] No Google Maps API key - using mock data");
    return getMockCompetitors(lat, lng);
  }

  const radiusMeters = radiusMiles * 1609.34;
  const competitors: CompetitorData[] = [];

  try {
    // Search for laundromats and related businesses
    const searchTerms = ["laundromat", "coin laundry", "laundry service", "wash and fold"];
    
    for (const term of searchTerms) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(term)}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        for (const place of data.results as PlaceResult[]) {
          // Skip if already added
          if (competitors.find(c => c.name === place.name)) continue;

          const distance = calculateDistance(
            lat, lng,
            place.geometry.location.lat,
            place.geometry.location.lng
          );

          competitors.push({
            name: place.name,
            address: place.formatted_address,
            distance: Math.round(distance * 100) / 100,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            priceLevel: place.price_level,
            hours: place.opening_hours?.weekday_text?.join(", "),
            threatLevel: calculateThreatLevel(distance, place.rating, place.user_ratings_total)
          });
        }
      }
    }

    // Sort by distance
    competitors.sort((a, b) => a.distance - b.distance);

    return competitors;
  } catch (error) {
    console.error("[Competition Analyzer] Error fetching competitors:", error);
    return getMockCompetitors(lat, lng);
  }
}

/**
 * Generate full competition analysis
 */
export async function analyzeCompetition(
  lat: number,
  lng: number,
  radiusMiles: number = 3
): Promise<CompetitionAnalysis> {
  const competitors = await findCompetitors(lat, lng, radiusMiles);

  // Calculate market saturation (0-100)
  // Formula: (competitors within 1 mile * 25) + (competitors 1-3 miles * 10)
  const within1Mile = competitors.filter(c => c.distance <= 1).length;
  const within3Miles = competitors.filter(c => c.distance > 1 && c.distance <= 3).length;
  const marketSaturation = Math.min(100, (within1Mile * 25) + (within3Miles * 10));

  // Competition score for CLEANBI (0-20, higher is better = fewer competitors)
  const competitionScore = Math.max(0, 20 - (within1Mile * 5) - (within3Miles * 2));

  // Generate heatmap data
  const heatmapData = {
    center: { lat, lng },
    radius: radiusMiles,
    density: competitors.length / (Math.PI * radiusMiles * radiusMiles) // competitors per sq mile
  };

  // Generate recommendations
  const recommendations = generateCompetitionRecommendations(competitors, marketSaturation);

  return {
    competitors,
    marketSaturation,
    competitionScore,
    heatmapData,
    recommendations
  };
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate threat level of a competitor
 */
function calculateThreatLevel(
  distance: number,
  rating?: number,
  reviewCount?: number
): "low" | "medium" | "high" {
  let score = 0;

  // Distance factor (closer = more threatening)
  if (distance <= 0.5) score += 3;
  else if (distance <= 1) score += 2;
  else if (distance <= 2) score += 1;

  // Rating factor
  if (rating && rating >= 4.5) score += 2;
  else if (rating && rating >= 4.0) score += 1;

  // Review count factor (more reviews = established)
  if (reviewCount && reviewCount >= 100) score += 2;
  else if (reviewCount && reviewCount >= 50) score += 1;

  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "low";
}

/**
 * Generate recommendations based on competition
 */
function generateCompetitionRecommendations(
  competitors: CompetitorData[],
  saturation: number
): string[] {
  const recommendations: string[] = [];

  if (saturation > 75) {
    recommendations.push("HIGH SATURATION: Consider differentiating with premium services (wash-fold, pickup/delivery)");
    recommendations.push("Price competitively - survey competitor pricing before setting rates");
  } else if (saturation > 50) {
    recommendations.push("MODERATE SATURATION: Focus on customer experience and loyalty programs");
    recommendations.push("Extended hours could capture market share from 9-5 competitors");
  } else if (saturation > 25) {
    recommendations.push("LOW-MODERATE SATURATION: Good opportunity - standard pricing should work");
    recommendations.push("Focus on visibility and marketing to capture underserved customers");
  } else {
    recommendations.push("LOW SATURATION: Excellent market opportunity");
    recommendations.push("Premium pricing may be sustainable with limited competition");
  }

  // Analyze high-threat competitors
  const highThreats = competitors.filter(c => c.threatLevel === "high");
  if (highThreats.length > 0) {
    recommendations.push(`${highThreats.length} high-threat competitor(s) identified - study their strengths and differentiate`);
  }

  // Analyze ratings
  const avgRating = competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / Math.max(1, competitors.length);
  if (avgRating < 4.0) {
    recommendations.push("Competitors have low ratings - opportunity to win on customer service");
  }

  return recommendations;
}

/**
 * Mock competitors for testing
 */
function getMockCompetitors(lat: number, lng: number): CompetitorData[] {
  return [
    {
      name: "Sudsy's Laundromat",
      address: "123 Main St",
      distance: 0.4,
      lat: lat + 0.005,
      lng: lng + 0.003,
      rating: 4.2,
      reviewCount: 87,
      threatLevel: "high"
    },
    {
      name: "Clean Machine Laundry",
      address: "456 Oak Ave",
      distance: 0.8,
      lat: lat - 0.008,
      lng: lng + 0.006,
      rating: 3.8,
      reviewCount: 45,
      threatLevel: "medium"
    },
    {
      name: "Quick Wash Express",
      address: "789 Pine Rd",
      distance: 1.2,
      lat: lat + 0.012,
      lng: lng - 0.009,
      rating: 4.5,
      reviewCount: 156,
      threatLevel: "high"
    },
    {
      name: "Budget Laundry",
      address: "321 Elm St",
      distance: 2.1,
      lat: lat - 0.02,
      lng: lng + 0.015,
      rating: 3.5,
      reviewCount: 23,
      threatLevel: "low"
    }
  ];
}

/**
 * Generate heatmap data for visualization
 */
export function generateHeatmapPoints(
  centerLat: number,
  centerLng: number,
  competitors: CompetitorData[]
): Array<{ lat: number; lng: number; weight: number }> {
  const points: Array<{ lat: number; lng: number; weight: number }> = [];

  for (const competitor of competitors) {
    // Weight based on threat level and distance
    let weight = 1;
    if (competitor.threatLevel === "high") weight = 3;
    else if (competitor.threatLevel === "medium") weight = 2;
    
    // Closer competitors have more weight
    weight *= Math.max(0.5, 1 - (competitor.distance / 5));

    points.push({
      lat: competitor.lat,
      lng: competitor.lng,
      weight: Math.round(weight * 100) / 100
    });
  }

  return points;
}
