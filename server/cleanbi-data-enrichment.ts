/**
 * CLEANBI Unified Data Enrichment Pipeline
 * 
 * Orchestrates data collection from multiple sources:
 * - Google Maps/Places API (geocoding, competition, reviews)
 * - US Census Bureau (demographics, income, renter %)
 * - ATTOM API (property values, permits, market trends)
 * 
 * Implements tiered access control:
 * - FREE: Google + basic Census
 * - $49 Starter: + full Census + basic ATTOM
 * - $149 Pro: + full ATTOM + historical trends
 * - $699 Enterprise: + premium insights + API access
 * 
 * Handles fallbacks gracefully when APIs are unavailable
 */

import { enrichWithCensusData, CensusData, getMarketScoreFromCensus, calculateLaundryDemandIndex } from './census-data-service';
import { enrichWithAttomData, AttomEnrichmentResult, calculateGrowthScore, getPropertyInsights } from './attom-data-service';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export interface EnrichedCLEANBIData {
  address: string;
  formattedAddress: string;
  coordinates: { lat: number; lng: number } | null;
  addressType: 'business' | 'residential' | 'unknown';
  
  demographics: {
    population: number;
    populationDensity: number;
    medianHouseholdIncome: number;
    renterPercentage: number;
    housingUnits: number;
    vacancyRate: number;
    medianAge: number;
    povertyRate: number;
    laundryDemandIndex: number;
    dataSource: 'census_api' | 'zip_estimate' | 'fallback';
    dataConfidence: number;
  };

  competition: {
    count: number;
    nearestDistance: number;
    avgCompetitorRating: number;
    marketSaturation: 'low' | 'moderate' | 'high' | 'saturated';
    competitors: Array<{
      name: string;
      distance: number;
      rating: number;
      reviewCount: number;
    }>;
  };

  placeDetails: {
    name: string | null;
    rating: number;
    reviewCount: number;
    priceLevel: number | null;
    businessStatus: string | null;
    types: string[];
    website: string | null;
    phoneNumber: string | null;
    openingHours: string[] | null;
  } | null;

  property: {
    assessedValue: number;
    marketValue: number;
    yearBuilt: number;
    buildingSqFt: number;
    propertyType: string;
    taxAmount: number;
    dataSource: 'attom_api' | 'estimate' | 'fallback';
    dataConfidence: number;
  } | null;

  growthSignals: {
    recentPermits: number;
    newConstructionPermits: number;
    homeValueChange1Yr: number;
    homeValueChange5Yr: number;
    inventoryLevel: 'low' | 'balanced' | 'high';
    growthScore: number;
  } | null;

  marketScores: {
    renterScore: number;
    incomeScore: number;
    densityScore: number;
    demographicPowerScore: number;
    competitionScore: number;
  };

  dataQuality: {
    overallConfidence: number;
    sourcesUsed: string[];
    fallbacksApplied: string[];
    tierUnlockedFeatures: string[];
  };

  insights: string[];
}

export interface EnrichmentOptions {
  tier: SubscriptionTier;
  includeCompetitors?: boolean;
  includeProperty?: boolean;
  includeGrowth?: boolean;
  maxCompetitorRadius?: number;
}

const TIER_FEATURES: Record<SubscriptionTier, {
  includeFullCensus: boolean;
  includeProperty: boolean;
  includeGrowth: boolean;
  includeCompetitorDetails: boolean;
  includeInsights: boolean;
  maxCompetitors: number;
}> = {
  free: {
    includeFullCensus: false,
    includeProperty: false,
    includeGrowth: false,
    includeCompetitorDetails: false,
    includeInsights: false,
    maxCompetitors: 3
  },
  starter: {
    includeFullCensus: true,
    includeProperty: true,
    includeGrowth: false,
    includeCompetitorDetails: true,
    includeInsights: true,
    maxCompetitors: 10
  },
  pro: {
    includeFullCensus: true,
    includeProperty: true,
    includeGrowth: true,
    includeCompetitorDetails: true,
    includeInsights: true,
    maxCompetitors: 20
  },
  enterprise: {
    includeFullCensus: true,
    includeProperty: true,
    includeGrowth: true,
    includeCompetitorDetails: true,
    includeInsights: true,
    maxCompetitors: 50
  }
};

async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
  zipCode: string | null;
  state: string | null;
  placeId: string | null;
} | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY not configured');
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results?.[0]) {
      return null;
    }

    const result = data.results[0];
    const components = result.address_components || [];
    
    let zipCode = null, state = null;
    for (const comp of components) {
      if (comp.types.includes('postal_code')) zipCode = comp.long_name;
      if (comp.types.includes('administrative_area_level_1')) state = comp.short_name;
    }

    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
      zipCode,
      state,
      placeId: result.place_id
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

async function fetchNearbyCompetitors(
  lat: number,
  lng: number,
  radius: number = 1609,
  maxResults: number = 10
): Promise<Array<{
  name: string;
  distance: number;
  rating: number;
  reviewCount: number;
  placeId: string;
}>> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=laundry&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results) {
      return [];
    }

    return data.results.slice(0, maxResults).map((place: any) => {
      const placeLat = place.geometry?.location?.lat || lat;
      const placeLng = place.geometry?.location?.lng || lng;
      const distance = calculateDistance(lat, lng, placeLat, placeLng);

      return {
        name: place.name,
        distance: Math.round(distance * 100) / 100,
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        placeId: place.place_id
      };
    });
  } catch (error) {
    console.error('Nearby search error:', error);
    return [];
  }
}

async function fetchPlaceDetails(placeId: string): Promise<{
  name: string;
  rating: number;
  reviewCount: number;
  priceLevel: number | null;
  businessStatus: string | null;
  types: string[];
  website: string | null;
  phoneNumber: string | null;
  openingHours: string[] | null;
} | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const fields = 'name,rating,user_ratings_total,price_level,business_status,types,website,formatted_phone_number,opening_hours';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      return null;
    }

    const place = data.result;
    return {
      name: place.name || null,
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
      priceLevel: place.price_level || null,
      businessStatus: place.business_status || null,
      types: place.types || [],
      website: place.website || null,
      phoneNumber: place.formatted_phone_number || null,
      openingHours: place.opening_hours?.weekday_text || null
    };
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function determineMarketSaturation(competitorCount: number, populationDensity: number): 'low' | 'moderate' | 'high' | 'saturated' {
  const laundromatsPerCapita = competitorCount / (populationDensity / 1000);
  
  if (laundromatsPerCapita < 0.3) return 'low';
  if (laundromatsPerCapita < 0.6) return 'moderate';
  if (laundromatsPerCapita < 1.0) return 'high';
  return 'saturated';
}

function calculateCompetitionScore(count: number): number {
  if (count === 0) return 100;
  if (count === 1) return 85;
  if (count === 2) return 65;
  if (count === 3) return 45;
  return 25;
}

function generateInsights(
  demographics: EnrichedCLEANBIData['demographics'],
  competition: EnrichedCLEANBIData['competition'],
  growthSignals: EnrichedCLEANBIData['growthSignals'] | null,
  property: EnrichedCLEANBIData['property'] | null
): string[] {
  const insights: string[] = [];

  if (demographics.renterPercentage > 60) {
    insights.push(`✅ Strong renter market (${demographics.renterPercentage}% renters) - ideal for laundromat demand`);
  } else if (demographics.renterPercentage < 35) {
    insights.push(`⚠️ Low renter percentage (${demographics.renterPercentage}%) may limit demand`);
  }

  if (demographics.medianHouseholdIncome >= 35000 && demographics.medianHouseholdIncome <= 65000) {
    insights.push(`✅ Ideal income range ($${demographics.medianHouseholdIncome.toLocaleString()}) for laundromat customers`);
  } else if (demographics.medianHouseholdIncome > 85000) {
    insights.push(`💡 Higher income area ($${demographics.medianHouseholdIncome.toLocaleString()}) - consider premium WDF services`);
  }

  if (demographics.laundryDemandIndex > 75) {
    insights.push(`🔥 High laundry demand index (${demographics.laundryDemandIndex}/100)`);
  } else if (demographics.laundryDemandIndex < 40) {
    insights.push(`⚠️ Low laundry demand index (${demographics.laundryDemandIndex}/100)`);
  }

  if (competition.marketSaturation === 'low') {
    insights.push(`✅ Low market saturation - limited competition within 1 mile`);
  } else if (competition.marketSaturation === 'saturated') {
    insights.push(`⚠️ Saturated market - ${competition.count} competitors within 1 mile`);
  }

  if (competition.avgCompetitorRating < 3.5 && competition.count > 0) {
    insights.push(`💡 Competitors have low ratings (${competition.avgCompetitorRating.toFixed(1)}/5) - opportunity to differentiate`);
  }

  if (growthSignals) {
    if (growthSignals.newConstructionPermits > 5) {
      insights.push(`📈 High development activity (${growthSignals.newConstructionPermits} new construction permits) - growing area`);
    }
    if (growthSignals.homeValueChange1Yr > 5) {
      insights.push(`📈 Strong home value appreciation (${growthSignals.homeValueChange1Yr}% YoY) indicates desirable area`);
    }
    if (growthSignals.inventoryLevel === 'low') {
      insights.push(`🔥 Low housing inventory - competitive rental market benefits laundromats`);
    }
  }

  if (property) {
    const buildingAge = new Date().getFullYear() - property.yearBuilt;
    if (buildingAge > 40) {
      insights.push(`⚠️ Building is ${buildingAge} years old - factor in potential infrastructure costs`);
    }
  }

  return insights;
}

export async function enrichCLEANBIData(
  address: string,
  options: EnrichmentOptions = { tier: 'free' }
): Promise<EnrichedCLEANBIData> {
  const normalizedTier = (options.tier || 'free').toLowerCase() as SubscriptionTier;
  const tierFeatures = TIER_FEATURES[normalizedTier] || TIER_FEATURES.free;
  const sourcesUsed: string[] = [];
  const fallbacksApplied: string[] = [];

  console.log(`🔍 Enriching CLEANBI data for: ${address} (tier: ${options.tier})`);

  const geocoded = await geocodeAddress(address);
  if (geocoded) {
    sourcesUsed.push('google_geocoding');
  } else {
    fallbacksApplied.push('geocoding_failed');
  }

  const censusResult = await enrichWithCensusData(
    geocoded?.zipCode || undefined,
    geocoded?.state || undefined,
    geocoded ? { lat: geocoded.lat, lng: geocoded.lng } : undefined
  );

  if (censusResult.success) {
    sourcesUsed.push(`census_${censusResult.source}`);
  }
  if (censusResult.source === 'fallback') {
    fallbacksApplied.push('census_fallback');
  }

  const census = censusResult.data!;
  const censusScores = getMarketScoreFromCensus(census);
  const laundryDemandIndex = calculateLaundryDemandIndex(census);

  let competitors: EnrichedCLEANBIData['competition']['competitors'] = [];
  if (geocoded) {
    competitors = await fetchNearbyCompetitors(
      geocoded.lat,
      geocoded.lng,
      options.maxCompetitorRadius || 1609,
      tierFeatures.maxCompetitors
    );
    if (competitors.length > 0) {
      sourcesUsed.push('google_places_nearby');
    }
  }

  const avgCompetitorRating = competitors.length > 0
    ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length
    : 0;

  const competitionScore = calculateCompetitionScore(competitors.length);
  const marketSaturation = determineMarketSaturation(competitors.length, census.populationDensity);

  let placeDetails = null;
  if (geocoded?.placeId) {
    placeDetails = await fetchPlaceDetails(geocoded.placeId);
    if (placeDetails) {
      sourcesUsed.push('google_place_details');
    }
  }

  let property: EnrichedCLEANBIData['property'] = null;
  let growthSignals: EnrichedCLEANBIData['growthSignals'] = null;

  if (tierFeatures.includeProperty || tierFeatures.includeGrowth) {
    const attomResult = await enrichWithAttomData(
      address,
      geocoded?.zipCode || undefined,
      geocoded ? { lat: geocoded.lat, lng: geocoded.lng } : undefined,
      { medianHouseholdIncome: census.medianHouseholdIncome, populationDensity: census.populationDensity }
    );

    if (attomResult.success) {
      sourcesUsed.push(`attom_${attomResult.source}`);
    }
    if (attomResult.source === 'fallback') {
      fallbacksApplied.push('attom_fallback');
    }

    if (tierFeatures.includeProperty && attomResult.property) {
      property = {
        assessedValue: attomResult.property.assessedValue,
        marketValue: attomResult.property.marketValue,
        yearBuilt: attomResult.property.yearBuilt,
        buildingSqFt: attomResult.property.buildingSqFt,
        propertyType: attomResult.property.propertyType,
        taxAmount: attomResult.property.taxAmount,
        dataSource: attomResult.source,
        dataConfidence: attomResult.confidence
      };
    }

    if (tierFeatures.includeGrowth && attomResult.permits && attomResult.market) {
      const growthScore = calculateGrowthScore(attomResult.permits, attomResult.market);
      growthSignals = {
        recentPermits: attomResult.permits.recentPermits,
        newConstructionPermits: attomResult.permits.newConstructionPermits,
        homeValueChange1Yr: attomResult.market.homeValueChange1Yr,
        homeValueChange5Yr: attomResult.market.homeValueChange5Yr,
        inventoryLevel: attomResult.market.inventoryLevel,
        growthScore
      };
    }
  }

  const insights = tierFeatures.includeInsights
    ? generateInsights(
        {
          ...census,
          laundryDemandIndex,
          dataSource: censusResult.source,
          dataConfidence: census.confidence
        } as EnrichedCLEANBIData['demographics'],
        {
          count: competitors.length,
          nearestDistance: competitors[0]?.distance || 0,
          avgCompetitorRating,
          marketSaturation,
          competitors: tierFeatures.includeCompetitorDetails ? competitors : []
        },
        growthSignals,
        property
      )
    : [];

  const confidenceWeights = {
    google_geocoding: 0.15,
    google_places_nearby: 0.15,
    google_place_details: 0.10,
    census_census_api: 0.25,
    census_zip_estimate: 0.15,
    census_fallback: 0.05,
    attom_attom_api: 0.20,
    attom_estimate: 0.10,
    attom_fallback: 0.05
  };

  let overallConfidence = 0;
  for (const source of sourcesUsed) {
    overallConfidence += (confidenceWeights as any)[source] || 0.05;
  }
  overallConfidence = Math.min(100, Math.round(overallConfidence * 100));

  if (fallbacksApplied.length > 0) {
    overallConfidence = Math.max(30, overallConfidence - (fallbacksApplied.length * 10));
  }

  const tierUnlockedFeatures: string[] = [];
  if (tierFeatures.includeFullCensus) tierUnlockedFeatures.push('full_census_data');
  if (tierFeatures.includeProperty) tierUnlockedFeatures.push('property_data');
  if (tierFeatures.includeGrowth) tierUnlockedFeatures.push('growth_signals');
  if (tierFeatures.includeCompetitorDetails) tierUnlockedFeatures.push('competitor_details');
  if (tierFeatures.includeInsights) tierUnlockedFeatures.push('ai_insights');

  const result: EnrichedCLEANBIData = {
    address,
    formattedAddress: geocoded?.formattedAddress || address,
    coordinates: geocoded ? { lat: geocoded.lat, lng: geocoded.lng } : null,
    addressType: placeDetails ? 'business' : 'unknown',

    demographics: {
      population: census.population,
      populationDensity: census.populationDensity,
      medianHouseholdIncome: census.medianHouseholdIncome,
      renterPercentage: census.renterPercentage,
      housingUnits: census.housingUnits,
      vacancyRate: census.vacancyRate,
      medianAge: census.medianAge,
      povertyRate: census.povertyRate,
      laundryDemandIndex,
      dataSource: censusResult.source,
      dataConfidence: census.confidence
    },

    competition: {
      count: competitors.length,
      nearestDistance: competitors[0]?.distance || 0,
      avgCompetitorRating,
      marketSaturation,
      competitors: tierFeatures.includeCompetitorDetails ? competitors : []
    },

    placeDetails,
    property,
    growthSignals,

    marketScores: {
      ...censusScores,
      competitionScore
    },

    dataQuality: {
      overallConfidence,
      sourcesUsed,
      fallbacksApplied,
      tierUnlockedFeatures
    },

    insights
  };

  console.log(`✅ CLEANBI enrichment complete: confidence=${overallConfidence}%, sources=${sourcesUsed.join(', ')}`);

  return result;
}

export function getEnrichmentTierFromUser(user: { subscriptionTier?: string } | null): SubscriptionTier {
  if (!user?.subscriptionTier) return 'free';
  
  const tierMap: Record<string, SubscriptionTier> = {
    'starter': 'starter',
    'pro': 'pro',
    'enterprise': 'enterprise',
    'pos_flat': 'pro',
    'pos_transaction': 'starter'
  };

  return tierMap[user.subscriptionTier] || 'free';
}
