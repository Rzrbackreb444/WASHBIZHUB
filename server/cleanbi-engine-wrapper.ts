// ========================================
// CLEANBI ENGINE WRAPPER
// Integrates new infrastructure with existing engines
// ========================================

import { fetchBatchedCLEANBIData, type BatchedCLEANBIData } from './cleanbi-batched-pipeline';
import { calculateLocationScore, calculateConfidence, type MetricInputs, type DataSources } from './shared-cleanbi-metrics';
import { trackCLEANBIUsage, checkCLEANBIQuota, CLEANBI_PRICING_TIERS } from './cleanbi-subscription-manager';

// ========================================
// UNIFIED CLEANBI SCORE CALCULATION
// Uses batched pipeline + shared metrics
// ========================================

export interface CLEANBIScoreRequest {
  address: string;
  userId?: string; // For quota tracking
  userTier?: keyof typeof CLEANBI_PRICING_TIERS; // For quota checking
}

export interface CLEANBIScoreResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'Needs Work';
  confidence: number; // 0-100
  breakdown: {
    location: number;
    competition: number;
    reviews: number;
    footTraffic: number;
    visibility: number;
  };
  data: BatchedCLEANBIData;
  usageInfo?: {
    used: number;
    remaining: number;
    limit: number;
  };
}

/**
 * MAIN ENTRY POINT - Replaces old google-cleanbi-engine.ts scoring
 * 
 * Benefits:
 * - 10→1-2 API calls (via batched pipeline)
 * - 85%+ cache hit rate (via caching layer)
 * - Rate limiting (respects free tier quotas)
 * - Quota enforcement (subscription tiers)
 * - Shared metrics (DRY, global baselines)
 */
export async function calculateCLEANBIScore(request: CLEANBIScoreRequest): Promise<CLEANBIScoreResult> {
  // Step 1: Check quota (if user authenticated)
  if (request.userId && request.userTier) {
    const quota = await checkCLEANBIQuota(request.userId, request.userTier);
    
    if (!quota.allowed) {
      throw new Error(`CLEANBI quota exceeded. ${quota.remaining} reports remaining this month. Please upgrade to continue.`);
    }
  }
  
  // Step 2: Fetch batched data (cached, rate-limited, optimized)
  const data = await fetchBatchedCLEANBIData({ address: request.address });
  
  // Step 3: Calculate scores using shared metrics
  const scores = calculateScores(data);
  
  // Step 4: Determine overall score & grade
  const score = calculateOverallScore(scores);
  const grade = getGrade(score);
  
  // Step 5: Calculate confidence
  const confidence = calculateConfidenceFromData(data);
  
  // Step 6: Track usage (if authenticated) with error handling
  if (request.userId) {
    try {
      await trackCLEANBIUsage(request.userId, 'basic');
    } catch (error) {
      console.error('Error tracking CLEANBI usage (table may not exist):', error);
      // Continue execution - don't fail the request if usage tracking fails
    }
  }
  
  // Step 7: Get updated usage info
  let usageInfo;
  if (request.userId && request.userTier) {
    const quota = await checkCLEANBIQuota(request.userId, request.userTier);
    usageInfo = {
      used: quota.limit - quota.remaining,
      remaining: quota.remaining,
      limit: quota.limit
    };
  }
  
  return {
    score,
    grade,
    confidence,
    breakdown: scores,
    data,
    usageInfo
  };
}

// ========================================
// SCORE CALCULATION LOGIC
// ========================================

function calculateScores(data: BatchedCLEANBIData): {
  location: number;
  competition: number;
  reviews: number;
  footTraffic: number;
  visibility: number;
} {
  // Location Score (using shared metrics)
  const locationInputs: MetricInputs = {
    popDensity: data.demographics?.popDensity,
    medianIncome: data.demographics?.medianIncome,
    renterPct: data.demographics?.renterPercentage,
    competitionCount: data.competition?.count
  };
  const location = calculateLocationScore(locationInputs);
  
  // Competition Score (inverse of count)
  const competitionCount = data.competition?.count || 0;
  const competition = Math.max(0, 100 - (competitionCount * 5)); // -5 points per competitor
  
  // Reviews Score
  const rating = data.placeDetails?.rating || 0;
  const reviews = (rating / 5) * 100;
  
  // Foot Traffic Score (estimate from user ratings total)
  const ratingsTotal = data.placeDetails?.userRatingsTotal || 0;
  const footTraffic = Math.min(100, (ratingsTotal / 100) * 100);
  
  // Visibility Score (has photos, website, phone)
  let visibility = 0;
  if (data.placeDetails?.photos && data.placeDetails.photos.length > 0) visibility += 40;
  if (data.placeDetails?.website) visibility += 30;
  if (data.placeDetails?.phoneNumber) visibility += 30;
  
  return {
    location: Math.round(location),
    competition: Math.round(competition),
    reviews: Math.round(reviews),
    footTraffic: Math.round(footTraffic),
    visibility: Math.round(visibility)
  };
}

function calculateOverallScore(scores: {
  location: number;
  competition: number;
  reviews: number;
  footTraffic: number;
  visibility: number;
}): number {
  // Weighted average
  const weighted = 
    scores.location * 0.25 +
    scores.competition * 0.20 +
    scores.reviews * 0.20 +
    scores.footTraffic * 0.20 +
    scores.visibility * 0.15;
  
  return Math.round(weighted);
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'Needs Work' {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  return 'Needs Work';
}

function calculateConfidenceFromData(data: BatchedCLEANBIData): number {
  const sources: DataSources = {
    censusData: !!data.demographics,
    mapboxData: !!data.geocode,
  };
  
  let imputationCount = 0;
  if (!data.placeDetails) imputationCount++;
  if (!data.competition) imputationCount++;
  if (!data.demographics) imputationCount++;
  
  return calculateConfidence(sources, imputationCount);
}

// ========================================
// BATCH PROCESSING FOR BULK REPORTS
// ========================================

export async function calculateBulkCLEANBIScores(
  addresses: string[],
  userId?: string,
  userTier?: keyof typeof CLEANBI_PRICING_TIERS
): Promise<Map<string, CLEANBIScoreResult>> {
  // Check quota for bulk operation
  if (userId && userTier) {
    const quota = await checkCLEANBIQuota(userId, userTier);
    
    if (quota.remaining < addresses.length) {
      throw new Error(`Insufficient quota. Need ${addresses.length} reports but only ${quota.remaining} remaining.`);
    }
  }
  
  // Process in parallel with batching
  const results = new Map<string, CLEANBIScoreResult>();
  
  for (const address of addresses) {
    try {
      const result = await calculateCLEANBIScore({ address, userId, userTier });
      results.set(address, result);
    } catch (error) {
      console.error(`Error scoring ${address}:`, error);
    }
  }
  
  return results;
}
