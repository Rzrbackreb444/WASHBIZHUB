/**
 * DYNAMIC PRICING OPTIMIZER
 * 
 * Optimizes laundromat pricing based on:
 * - Time of day
 * - Day of week
 * - Competition
 * - Demographics
 * - Machine capacity
 * - Foot traffic patterns
 */

import { DEFAULT_PRICING_CONFIG, PricingOptimization, FootTrafficData } from './consultation-tiers';

interface MachineConfig {
  type: "topLoad" | "frontLoad20lb" | "frontLoad40lb" | "frontLoad60lb" | "dryer30lb" | "dryer50lb";
  count: number;
}

interface PricingInput {
  machines: MachineConfig[];
  location: {
    lat: number;
    lng: number;
    medianIncome: number;
    population: number;
  };
  competition: {
    count: number;
    avgPrice?: number;
  };
  currentPricing?: {
    type: string;
    price: number;
  }[];
}

interface PricingRecommendation {
  machineType: string;
  currentPrice: number | null;
  recommendedBase: number;
  peakPrice: number;
  offPeakPrice: number;
  weekendPremium: number;
  projectedRevenueIncrease: number;
  rationale: string;
}

interface PricingStrategy {
  recommendations: PricingRecommendation[];
  timeOfDayStrategy: {
    peakHours: string[];
    offPeakHours: string[];
    standardHours: string[];
  };
  weekendStrategy: {
    saturdayPremium: number;
    sundayPremium: number;
  };
  projectedMonthlyIncrease: number;
  implementationPlan: string[];
}

/**
 * Generate optimal pricing strategy
 */
export function generatePricingStrategy(input: PricingInput): PricingStrategy {
  const recommendations: PricingRecommendation[] = [];
  let totalProjectedIncrease = 0;

  // Calculate adjustment factors
  const incomeAdjustment = calculateIncomeAdjustment(input.location.medianIncome);
  const competitionAdjustment = calculateCompetitionAdjustment(input.competition.count, input.competition.avgPrice);
  const populationAdjustment = calculatePopulationAdjustment(input.location.population);

  const totalAdjustment = 1 + incomeAdjustment + competitionAdjustment + populationAdjustment;

  for (const machine of input.machines) {
    const config = DEFAULT_PRICING_CONFIG.machineType[machine.type];
    if (!config) continue;

    const currentPrice = input.currentPricing?.find(p => p.type === machine.type)?.price || null;
    
    // Calculate recommended base price
    let recommendedBase = config.basePrice * totalAdjustment;
    recommendedBase = Math.max(config.range[0], Math.min(config.range[1], recommendedBase));
    recommendedBase = Math.round(recommendedBase * 4) / 4; // Round to nearest $0.25

    // Calculate time-of-day pricing
    const peakPrice = Math.round(recommendedBase * 1.15 * 4) / 4;
    const offPeakPrice = Math.round(recommendedBase * 0.85 * 4) / 4;
    const weekendPremium = Math.round(recommendedBase * 1.10 * 4) / 4;

    // Calculate projected revenue increase
    let projectedIncrease = 0;
    if (currentPrice) {
      const priceChange = recommendedBase - currentPrice;
      // Assume -2% volume for every $0.25 increase, but +3% for dynamic pricing capture
      const volumeImpact = (priceChange / 0.25) * -0.02;
      const dynamicPricingBonus = 0.05; // 5% revenue boost from optimization
      projectedIncrease = ((recommendedBase * (1 + volumeImpact)) - currentPrice) / currentPrice * 100;
      projectedIncrease += dynamicPricingBonus * 100;
    }

    const rationale = generateRationale(machine.type, currentPrice, recommendedBase, incomeAdjustment, competitionAdjustment);

    recommendations.push({
      machineType: formatMachineType(machine.type),
      currentPrice,
      recommendedBase,
      peakPrice,
      offPeakPrice,
      weekendPremium,
      projectedRevenueIncrease: Math.round(projectedIncrease * 10) / 10,
      rationale
    });

    totalProjectedIncrease += projectedIncrease * machine.count;
  }

  // Generate time-of-day strategy
  const timeOfDayStrategy = {
    peakHours: ["9:00 AM - 11:00 AM", "5:00 PM - 8:00 PM"],
    offPeakHours: ["6:00 AM - 8:00 AM", "9:00 PM - Close"],
    standardHours: ["11:00 AM - 5:00 PM"]
  };

  // Weekend strategy
  const weekendStrategy = {
    saturdayPremium: 10, // 10% premium
    sundayPremium: 5     // 5% premium
  };

  // Implementation plan
  const implementationPlan = [
    "1. Program card/payment system for time-based pricing",
    "2. Create clear signage showing peak/off-peak rates",
    "3. Announce changes 30 days in advance",
    "4. Monitor first 60 days for customer feedback",
    "5. Adjust based on utilization patterns"
  ];

  return {
    recommendations,
    timeOfDayStrategy,
    weekendStrategy,
    projectedMonthlyIncrease: Math.round(totalProjectedIncrease / input.machines.length),
    implementationPlan
  };
}

/**
 * Analyze foot traffic patterns
 */
export function analyzeFootTraffic(
  location: { lat: number; lng: number },
  dailyTrafficCount: number
): FootTrafficData {
  // Typical laundromat traffic patterns (as percentage of daily)
  const hourlyDistribution = [
    { hour: 6, pct: 0.02 },
    { hour: 7, pct: 0.03 },
    { hour: 8, pct: 0.05 },
    { hour: 9, pct: 0.08 },
    { hour: 10, pct: 0.10 },
    { hour: 11, pct: 0.09 },
    { hour: 12, pct: 0.07 },
    { hour: 13, pct: 0.06 },
    { hour: 14, pct: 0.05 },
    { hour: 15, pct: 0.05 },
    { hour: 16, pct: 0.06 },
    { hour: 17, pct: 0.09 },
    { hour: 18, pct: 0.10 },
    { hour: 19, pct: 0.08 },
    { hour: 20, pct: 0.05 },
    { hour: 21, pct: 0.02 }
  ];

  // Day of week distribution (as percentage multiplier)
  const dailyDistribution = [
    { day: "Sunday", multiplier: 1.3 },
    { day: "Monday", multiplier: 0.8 },
    { day: "Tuesday", multiplier: 0.7 },
    { day: "Wednesday", multiplier: 0.8 },
    { day: "Thursday", multiplier: 0.9 },
    { day: "Friday", multiplier: 1.0 },
    { day: "Saturday", multiplier: 1.5 }
  ];

  // Estimate daily visitors (assume 5-10% of foot traffic enters)
  const conversionRate = 0.07; // 7% average
  const estimatedDailyVisitors = Math.round(dailyTrafficCount * conversionRate);
  
  // Calculate hourly and daily patterns
  const hourlyPattern = hourlyDistribution.map(h => ({
    hour: h.hour,
    volume: Math.round(estimatedDailyVisitors * h.pct)
  }));

  const dailyPattern = dailyDistribution.map(d => ({
    day: d.day,
    volume: Math.round(estimatedDailyVisitors * d.multiplier)
  }));

  // Identify peak and slow hours
  const sortedByVolume = [...hourlyPattern].sort((a, b) => b.volume - a.volume);
  const peakHours = sortedByVolume.slice(0, 4).map(h => `${h.hour}:00`);
  const slowHours = sortedByVolume.slice(-4).map(h => `${h.hour}:00`);

  // Monthly estimate (average 2.5 visits per customer per month)
  const visitsPerCustomerPerMonth = 2.5;
  const estimatedMonthlyCustomers = Math.round(estimatedDailyVisitors * 30 / visitsPerCustomerPerMonth);

  return {
    hourlyPattern,
    dailyPattern,
    peakHours,
    slowHours,
    estimatedDailyVisitors,
    estimatedMonthlyCustomers,
    conversionRate
  };
}

/**
 * Generate revenue projections with optimized pricing
 */
export function projectOptimizedRevenue(
  currentMonthlyRevenue: number,
  pricingStrategy: PricingStrategy,
  footTraffic: FootTrafficData
): {
  currentRevenue: number;
  projectedRevenue: number;
  increase: number;
  increasePercent: number;
  breakdown: {
    peakPricingGain: number;
    offPeakVolume: number;
    weekendPremium: number;
  };
} {
  // Calculate gains from each optimization
  const peakHoursPct = 0.35; // 35% of business during peak
  const offPeakPct = 0.15;   // 15% during off-peak
  const weekendPct = 0.40;   // 40% on weekends

  const avgPeakIncrease = pricingStrategy.recommendations.reduce(
    (sum, r) => sum + (r.peakPrice - r.recommendedBase) / r.recommendedBase,
    0
  ) / pricingStrategy.recommendations.length;

  const avgOffPeakDecrease = pricingStrategy.recommendations.reduce(
    (sum, r) => sum + (r.recommendedBase - r.offPeakPrice) / r.recommendedBase,
    0
  ) / pricingStrategy.recommendations.length;

  const peakPricingGain = currentMonthlyRevenue * peakHoursPct * avgPeakIncrease;
  const offPeakVolumeGain = currentMonthlyRevenue * offPeakPct * 0.15; // 15% volume increase from lower prices
  const weekendPremiumGain = currentMonthlyRevenue * weekendPct * (pricingStrategy.weekendStrategy.saturdayPremium / 100);

  const totalIncrease = peakPricingGain + offPeakVolumeGain + weekendPremiumGain;
  const projectedRevenue = currentMonthlyRevenue + totalIncrease;

  return {
    currentRevenue: currentMonthlyRevenue,
    projectedRevenue: Math.round(projectedRevenue),
    increase: Math.round(totalIncrease),
    increasePercent: Math.round((totalIncrease / currentMonthlyRevenue) * 1000) / 10,
    breakdown: {
      peakPricingGain: Math.round(peakPricingGain),
      offPeakVolume: Math.round(offPeakVolumeGain),
      weekendPremium: Math.round(weekendPremiumGain)
    }
  };
}

// Helper functions
function calculateIncomeAdjustment(medianIncome: number): number {
  // Base: $50,000. Adjust +/- 1% for every $5K difference
  const diff = (medianIncome - 50000) / 5000;
  return Math.max(-0.15, Math.min(0.20, diff * 0.01));
}

function calculateCompetitionAdjustment(count: number, avgPrice?: number): number {
  // More competitors = lower prices
  let adjustment = -count * 0.02; // -2% per competitor
  
  // If we know avg competitor price, adjust accordingly
  if (avgPrice) {
    // Price match with slight undercut for market share
    adjustment += -0.05;
  }
  
  return Math.max(-0.20, Math.min(0, adjustment));
}

function calculatePopulationAdjustment(population: number): number {
  // Higher density supports higher prices
  if (population > 50000) return 0.10;
  if (population > 30000) return 0.05;
  if (population > 20000) return 0;
  return -0.05;
}

function formatMachineType(type: string): string {
  const names: Record<string, string> = {
    topLoad: "Top Load Washer",
    frontLoad20lb: "Front Load Washer (20lb)",
    frontLoad40lb: "Front Load Washer (40lb)",
    frontLoad60lb: "Front Load Washer (60lb)",
    dryer30lb: "Dryer (30lb)",
    dryer50lb: "Dryer (50lb)"
  };
  return names[type] || type;
}

function generateRationale(
  machineType: string,
  currentPrice: number | null,
  recommendedPrice: number,
  incomeAdj: number,
  competitionAdj: number
): string {
  const parts: string[] = [];

  if (incomeAdj > 0.05) {
    parts.push("Higher local income supports premium pricing");
  } else if (incomeAdj < -0.05) {
    parts.push("Conservative pricing for income demographics");
  }

  if (competitionAdj < -0.10) {
    parts.push("Competitive pressure requires market-based pricing");
  } else if (competitionAdj >= -0.05) {
    parts.push("Limited competition allows standard market rates");
  }

  if (currentPrice && recommendedPrice > currentPrice) {
    const increase = ((recommendedPrice - currentPrice) / currentPrice * 100).toFixed(0);
    parts.push(`${increase}% increase from current - implement gradually`);
  } else if (currentPrice && recommendedPrice < currentPrice) {
    parts.push("Current pricing may be above market - consider competitive adjustment");
  }

  return parts.join(". ") || "Standard market pricing recommended.";
}

/**
 * Generate equipment capacity recommendations
 */
export function analyzeEquipmentCapacity(
  washers: number,
  dryers: number,
  monthlyRevenue: number,
  footTraffic: FootTrafficData
): {
  washerUtilization: number;
  dryerUtilization: number;
  bottleneck: "washers" | "dryers" | "balanced";
  recommendations: string[];
  optimalMix: {
    washers: number;
    dryers: number;
    ratio: string;
  };
} {
  // Industry standard: 60% washer revenue, 40% dryer
  // Optimal ratio is typically 1:0.9 to 1:1.2 (washers:dryers)
  const currentRatio = dryers / washers;
  
  // Estimate utilization based on revenue per machine
  const washerRevenue = monthlyRevenue * 0.60;
  const dryerRevenue = monthlyRevenue * 0.40;
  
  // Average revenue per washer: $300-600/month for good utilization
  // Average revenue per dryer: $200-400/month
  const revenuePerWasher = washerRevenue / washers;
  const revenuePerDryer = dryerRevenue / dryers;
  
  const washerUtilization = Math.min(100, (revenuePerWasher / 500) * 100);
  const dryerUtilization = Math.min(100, (revenuePerDryer / 300) * 100);
  
  const bottleneck = washerUtilization > dryerUtilization + 15 ? "washers" : 
                     dryerUtilization > washerUtilization + 15 ? "dryers" : 
                     "balanced";
  
  const recommendations: string[] = [];
  
  if (washerUtilization > 85) {
    recommendations.push("Washer utilization is high - consider adding capacity during peak hours");
  }
  
  if (dryerUtilization < 50) {
    recommendations.push("Dryer utilization is low - consider removing underperforming units");
  }
  
  if (currentRatio < 0.8) {
    recommendations.push("Dryer-to-washer ratio is low - customers may wait for dryers");
  } else if (currentRatio > 1.3) {
    recommendations.push("Excess dryer capacity - consider converting space to washers");
  }
  
  if (bottleneck === "washers") {
    recommendations.push("Bottleneck: washers - priority for expansion or larger capacity units");
  }
  
  // Calculate optimal mix
  const optimalDryers = Math.round(washers * 1.0); // 1:1 ratio is optimal for most
  
  return {
    washerUtilization: Math.round(washerUtilization),
    dryerUtilization: Math.round(dryerUtilization),
    bottleneck,
    recommendations,
    optimalMix: {
      washers,
      dryers: optimalDryers,
      ratio: `1:${(optimalDryers / washers).toFixed(1)}`
    }
  };
}
