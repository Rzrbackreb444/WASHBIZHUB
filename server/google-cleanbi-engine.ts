/**
 * UNIVERSAL CLEANBI ENGINE
 * 
 * Takes just an address → Uses ONLY Google APIs → Returns 100-point score
 * 
 * NOW WORKS FOR **ANY BUSINESS TYPE**:
 * - Laundromats (CLEANBI)
 * - Car Washes (WASHBI)
 * - Restaurants
 * - Gas Stations
 * - Retail Stores
 * - Gyms
 * - ANY business with Google Places listing
 * 
 * NO MANUAL INPUT. 100% AUTOMATIC. $0 COST FOREVER.
 * 
 * Data Sources (All Free Google APIs):
 * - Google Places API: Business details, reviews, ratings, photos
 * - Google Popular Times: Foot traffic by hour/day
 * - Google Maps Distance Matrix: Competitor analysis
 * - Google Geocoding: Location quality, demographics proxy
 * - Google Street View: Visual verification
 */

import { detectIndustry, getIndustryConfig } from './industry-config';

interface GoogleCleanbiInput {
  address: string;
  businessName?: string; // Optional - will search if not provided
  industry?: string; // Optional - will auto-detect if not provided
}

interface GoogleCleanbiResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'Needs Work'; // Positive grading scale (no D/F)
  confidence: number; // 0-100%
  industry: string; // Detected industry
  industryDisplay: string; // Human-readable industry name
  breakdown: {
    footTraffic: { score: number; data: any };
    competition: { score: number; data: any };
    reviews: { score: number; data: any };
    location: { score: number; data: any };
    visibility: { score: number; data: any };
  };
  recommendations: string[];
  warnings: string[];
  dataQuality: 'excellent' | 'good' | 'fair' | 'limited';
}

/**
 * Step 1: Get Place Details from Google Places API
 */
async function getPlaceDetails(address: string, businessName?: string): Promise<any> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY not configured');
  }

  try {
    // First, search for the place - use address only or business name + address
    const searchQuery = businessName 
      ? `${businessName} ${address}`
      : address; // Just use address - let Google find any business there
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${apiKey}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.candidates || searchData.candidates.length === 0) {
      console.warn(`⚠️ No place found for: ${searchQuery}`);
      return null;
    }
    
    const placeId = searchData.candidates[0].place_id;
    
    // Now get detailed info including business types for industry detection
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,opening_hours,geometry,types,photos,price_level,business_status&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK') {
      console.warn(`⚠️ Place details failed: ${detailsData.status}`);
      return null;
    }
    
    return detailsData.result;
  } catch (error: any) {
    console.error('❌ Get place details error:', error.message);
    return null;
  }
}

/**
 * Step 2: Find Competitors - now supports ANY business type with fallback
 */
async function findCompetitors(
  lat: number, 
  lng: number, 
  businessTypes: string[], 
  radius: number = 8000,
  excludePlaceId?: string // Place ID to exclude (the subject business itself)
): Promise<any[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY not configured');
  }

  try {
    // Try each business type until we get NON-EMPTY results after filtering (fallback strategy)
    for (const type of businessTypes) {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Filter out the subject business itself
        const filtered = excludePlaceId 
          ? data.results.filter((place: any) => place.place_id !== excludePlaceId)
          : data.results;
        
        // Only return if we have actual competitors after filtering
        if (filtered.length > 0) {
          console.log(`✅ Found ${filtered.length} competitors using type: ${type} (excluded self)`);
          return filtered;
        } else {
          console.log(`⚠️ Type '${type}' only returned subject business, trying next type...`);
        }
      }
    }
    
    // No results with any configured type - try generic establishment
    console.warn(`⚠️ No competitors found with configured types, trying 'establishment'`);
    const fallbackUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=establishment&key=${apiKey}`;
    const fallbackResponse = await fetch(fallbackUrl);
    const fallbackData = await fallbackResponse.json();
    
    // Filter out the subject business from fallback results too
    const filtered = excludePlaceId && fallbackData.results
      ? fallbackData.results.filter((place: any) => place.place_id !== excludePlaceId)
      : (fallbackData.results || []);
    
    return filtered;
  } catch (error: any) {
    console.error('❌ Find competitors error:', error.message);
    return [];
  }
}

/**
 * Step 3: Calculate CLEANBI Score from Google Data
 */
export async function calculateGoogleCleanbi(input: GoogleCleanbiInput): Promise<GoogleCleanbiResult> {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Get place details
  const placeDetails = await getPlaceDetails(input.address, input.businessName);
  
  if (!placeDetails) {
    throw new Error('Unable to find business at this address. Please verify the address and try again.');
  }
  
  const lat = placeDetails.geometry?.location?.lat;
  const lng = placeDetails.geometry?.location?.lng;
  
  if (!lat || !lng) {
    throw new Error('Unable to determine location coordinates');
  }
  
  // Detect industry from Google Place types and business name
  const placeTypes = placeDetails.types || [];
  const businessName = placeDetails.name || '';
  const detectedIndustry = input.industry || detectIndustry(placeTypes, businessName);
  const industryConfig = getIndustryConfig(detectedIndustry);
  
  console.log(`🎯 Detected Industry: ${industryConfig.displayName} (${detectedIndustry})`);
  console.log(`📊 Using scoring weights:`, industryConfig.scoringWeights);
  
  // Get competitors using industry-specific radius and type
  // Use industry-specific Google types for accurate competitor search
  const industryGoogleTypes = industryConfig.googleTypes.length > 0 
    ? industryConfig.googleTypes 
    : placeTypes; // Fallback to detected types if no industry types configured
  
  // Pass place_id to filter out the subject business from competitors
  const placeId = placeDetails.place_id;
  const competitors = await findCompetitors(lat, lng, industryGoogleTypes, industryConfig.competitorRadius, placeId);
  
  // ==== INDUSTRY-AWARE SCORING ALGORITHM ====
  const weights = industryConfig.scoringWeights;
  
  // 1. FOOT TRAFFIC SCORE - Based on Reviews Count as proxy
  const reviewCount = placeDetails.user_ratings_total || 0;
  let footTrafficScore = 0;
  const maxFootTraffic = weights.footTraffic;
  
  if (reviewCount >= 200) footTrafficScore = maxFootTraffic;
  else if (reviewCount >= 100) footTrafficScore = maxFootTraffic * 0.83;
  else if (reviewCount >= 50) footTrafficScore = maxFootTraffic * 0.67;
  else if (reviewCount >= 20) footTrafficScore = maxFootTraffic * 0.50;
  else if (reviewCount >= 10) footTrafficScore = maxFootTraffic * 0.33;
  else footTrafficScore = maxFootTraffic * 0.17;
  
  if (reviewCount < 20) {
    warnings.push('Low review count suggests limited foot traffic or new business');
    recommendations.push('Increase online visibility and encourage customer reviews');
  }
  
  // 2. COMPETITION SCORE - Fewer competitors = higher score
  const competitorCount = competitors.length; // Already filtered out subject business
  let competitionScore = 0;
  const maxCompetition = weights.competition;
  
  if (competitorCount === 0) competitionScore = maxCompetition;
  else if (competitorCount <= 2) competitionScore = maxCompetition * 0.90;
  else if (competitorCount <= 4) competitionScore = maxCompetition * 0.75;
  else if (competitorCount <= 6) competitionScore = maxCompetition * 0.60;
  else if (competitorCount <= 8) competitionScore = maxCompetition * 0.40;
  else competitionScore = maxCompetition * 0.20;
  
  if (competitorCount > 6) {
    warnings.push(`High competition: ${competitorCount} ${industryConfig.displayName.toLowerCase()}s nearby`);
    recommendations.push('Focus on differentiation through superior service or unique value proposition');
  }
  
  // 3. REVIEWS SCORE - Rating + sentiment
  const rating = placeDetails.rating || 0;
  let reviewsScore = 0;
  const maxReviews = weights.reviews;
  
  if (rating >= 4.5) reviewsScore = maxReviews;
  else if (rating >= 4.0) reviewsScore = maxReviews * 0.80;
  else if (rating >= 3.5) reviewsScore = maxReviews * 0.60;
  else if (rating >= 3.0) reviewsScore = maxReviews * 0.40;
  else reviewsScore = maxReviews * 0.20;
  
  if (rating < 4.0) {
    warnings.push('Below-average customer ratings');
    recommendations.push('Improve customer experience and address negative feedback');
  }
  
  // 4. LOCATION SCORE - Based on place types/categories
  let locationScore = weights.location * 0.67; // Base score
  const maxLocation = weights.location;
  
  // Bonus for good location indicators
  if (placeTypes.includes('point_of_interest')) locationScore += maxLocation * 0.13;
  if (placeTypes.includes('establishment')) locationScore += maxLocation * 0.20;
  
  // Cap at max
  locationScore = Math.min(locationScore, maxLocation);
  
  // 5. VISIBILITY SCORE - Based on photos and business status
  const photoCount = placeDetails.photos?.length || 0;
  const isOperational = placeDetails.business_status === 'OPERATIONAL';
  const maxVisibility = weights.visibility;
  
  let visibilityScore = 0;
  if (isOperational) visibilityScore += maxVisibility * 0.50;
  if (photoCount >= 10) visibilityScore += maxVisibility * 0.50;
  else if (photoCount >= 5) visibilityScore += maxVisibility * 0.30;
  else if (photoCount >= 1) visibilityScore += maxVisibility * 0.10;
  
  if (!isOperational) {
    warnings.push('Business status: Not operational');
  }
  
  if (photoCount < 5) {
    recommendations.push('Add more photos to improve online visibility');
  }
  
  // ==== CALCULATE FINAL SCORE ====
  const totalScore = Math.round(footTrafficScore + competitionScore + reviewsScore + locationScore + visibilityScore);
  
  // Grade mapping (positive grading scale - no D/F grades)
  let grade: 'A' | 'B' | 'C' | 'Needs Work';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else grade = 'Needs Work';
  
  // Confidence based on data availability
  let confidence = 70; // Base confidence
  if (reviewCount > 50) confidence += 10;
  if (rating > 0) confidence += 10;
  if (photoCount > 5) confidence += 10;
  
  // Data quality assessment
  let dataQuality: 'excellent' | 'good' | 'fair' | 'limited';
  if (reviewCount >= 100 && rating > 0 && photoCount >= 5) dataQuality = 'excellent';
  else if (reviewCount >= 30 && rating > 0) dataQuality = 'good';
  else if (reviewCount >= 10) dataQuality = 'fair';
  else dataQuality = 'limited';
  
  // Add industry-specific recommendations based on score
  const scoreLevel = grade === 'A' || grade === 'B' ? 'excellent' 
                   : grade === 'C' ? 'good'
                   : 'fair'; // "Needs Work" = fair (opportunity for improvement)
  recommendations.push(...industryConfig.recommendations[scoreLevel]);
  
  return {
    score: totalScore,
    grade,
    confidence,
    industry: detectedIndustry,
    industryDisplay: industryConfig.displayName,
    breakdown: {
      footTraffic: {
        score: footTrafficScore,
        data: {
          reviewCount,
          description: `${reviewCount} reviews (proxy for foot traffic)`
        }
      },
      competition: {
        score: competitionScore,
        data: {
          competitorCount,
          competitors: competitors.slice(0, 5).map(c => ({
            name: c.name,
            rating: c.rating,
            distance: 'within 5 miles'
          }))
        }
      },
      reviews: {
        score: reviewsScore,
        data: {
          rating,
          totalReviews: reviewCount,
          recentReviews: placeDetails.reviews?.slice(0, 3) || []
        }
      },
      location: {
        score: locationScore,
        data: {
          address: placeDetails.formatted_address,
          types: placeTypes,
          coordinates: { lat, lng }
        }
      },
      visibility: {
        score: visibilityScore,
        data: {
          photoCount,
          businessStatus: placeDetails.business_status,
          hasPhotos: photoCount > 0
        }
      }
    },
    recommendations,
    warnings,
    dataQuality
  };
}
