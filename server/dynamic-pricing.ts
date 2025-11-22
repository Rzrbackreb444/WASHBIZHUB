/**
 * DYNAMIC PRICING ENGINE - Optimize revenue with intelligent pricing
 * 
 * Features:
 * - Time-of-day pricing (peak/off-peak)
 * - Demand-based surge pricing
 * - Competitor price tracking
 * - Seasonal adjustments
 * - Customer segment pricing
 * - A/B testing support
 */

export interface PricingRule {
  id: string;
  name: string;
  laundromatId: string;
  serviceType: string; // "wash", "dry", "wdf", "delivery"
  basePrice: number;
  
  // Time-based adjustments
  timeSlots?: TimeSlot[];
  dayOfWeek?: DayPricing[];
  seasonalAdjustments?: SeasonalRule[];
  
  // Demand-based
  demandMultiplier?: number; // 1.0 = no change, 1.5 = 50% increase
  maxSurgePrice?: number;
  minPrice?: number;
  
  // Customer segments
  customerSegments?: SegmentPricing[];
  
  // Status
  isActive: boolean;
  priority: number; // Higher priority rules applied first
}

export interface TimeSlot {
  startTime: string; // "HH:MM" format
  endTime: string;
  adjustmentType: "percentage" | "fixed" | "absolute";
  adjustmentValue: number;
}

export interface DayPricing {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  adjustmentType: "percentage" | "fixed";
  adjustmentValue: number;
}

export interface SeasonalRule {
  startDate: string; // "MM-DD" format
  endDate: string;
  adjustmentType: "percentage" | "fixed";
  adjustmentValue: number;
  reason?: string; // e.g., "Summer peak", "Winter discount"
}

export interface SegmentPricing {
  segment: string; // "premium", "regular", "budget", "student", "senior"
  adjustmentType: "percentage" | "fixed";
  adjustmentValue: number;
}

export interface PriceCalculationContext {
  basePrice: number;
  timestamp: Date;
  demandLevel?: number; // 0-100
  customerSegment?: string;
  location?: { lat: number; lng: number };
}

export interface PriceResult {
  finalPrice: number;
  basePrice: number;
  adjustments: PriceAdjustment[];
  ruleName: string;
  breakdown: string; // Human-readable explanation
}

export interface PriceAdjustment {
  type: string;
  amount: number;
  reason: string;
}

/**
 * Calculate optimal price for a service
 */
export function calculatePrice(
  rules: PricingRule[],
  context: PriceCalculationContext
): PriceResult {
  // Start with base price
  let currentPrice = context.basePrice;
  const adjustments: PriceAdjustment[] = [];

  // Find applicable rules (sorted by priority)
  const activeRules = rules
    .filter(r => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  let appliedRule: PricingRule | null = null;

  for (const rule of activeRules) {
    // Apply time-based pricing
    if (rule.timeSlots) {
      const timeAdjustment = applyTimeSlotPricing(
        currentPrice,
        rule.timeSlots,
        context.timestamp
      );
      if (timeAdjustment) {
        currentPrice += timeAdjustment.amount;
        adjustments.push(timeAdjustment);
      }
    }

    // Apply day-of-week pricing
    if (rule.dayOfWeek) {
      const dayAdjustment = applyDayPricing(
        currentPrice,
        rule.dayOfWeek,
        context.timestamp
      );
      if (dayAdjustment) {
        currentPrice += dayAdjustment.amount;
        adjustments.push(dayAdjustment);
      }
    }

    // Apply seasonal pricing
    if (rule.seasonalAdjustments) {
      const seasonAdjustment = applySeasonalPricing(
        currentPrice,
        rule.seasonalAdjustments,
        context.timestamp
      );
      if (seasonAdjustment) {
        currentPrice += seasonAdjustment.amount;
        adjustments.push(seasonAdjustment);
      }
    }

    // Apply demand-based surge pricing
    if (rule.demandMultiplier && context.demandLevel) {
      const surgeAdjustment = applySurgePricing(
        currentPrice,
        rule.demandMultiplier,
        context.demandLevel,
        rule.maxSurgePrice
      );
      if (surgeAdjustment) {
        currentPrice += surgeAdjustment.amount;
        adjustments.push(surgeAdjustment);
      }
    }

    // Apply customer segment pricing
    if (rule.customerSegments && context.customerSegment) {
      const segmentAdjustment = applySegmentPricing(
        currentPrice,
        rule.customerSegments,
        context.customerSegment
      );
      if (segmentAdjustment) {
        currentPrice += segmentAdjustment.amount;
        adjustments.push(segmentAdjustment);
      }
    }

    // Enforce min/max price
    if (rule.minPrice && currentPrice < rule.minPrice) {
      adjustments.push({
        type: "min_price_floor",
        amount: rule.minPrice - currentPrice,
        reason: `Enforced minimum price of $${rule.minPrice.toFixed(2)}`,
      });
      currentPrice = rule.minPrice;
    }

    if (rule.maxSurgePrice && currentPrice > rule.maxSurgePrice) {
      adjustments.push({
        type: "max_price_cap",
        amount: rule.maxSurgePrice - currentPrice,
        reason: `Capped at maximum price of $${rule.maxSurgePrice.toFixed(2)}`,
      });
      currentPrice = rule.maxSurgePrice;
    }

    appliedRule = rule;
    break; // Only apply the highest priority rule
  }

  // Generate breakdown
  const breakdown = generateBreakdown(context.basePrice, currentPrice, adjustments);

  return {
    finalPrice: Math.max(0, currentPrice),
    basePrice: context.basePrice,
    adjustments,
    ruleName: appliedRule?.name || "Default Pricing",
    breakdown,
  };
}

/**
 * Apply time slot pricing
 */
function applyTimeSlotPricing(
  currentPrice: number,
  timeSlots: TimeSlot[],
  timestamp: Date
): PriceAdjustment | null {
  const currentTime = `${timestamp.getHours().toString().padStart(2, "0")}:${timestamp.getMinutes().toString().padStart(2, "0")}`;

  for (const slot of timeSlots) {
    if (currentTime >= slot.startTime && currentTime <= slot.endTime) {
      let amount = 0;
      let reason = "";

      switch (slot.adjustmentType) {
        case "percentage":
          amount = currentPrice * (slot.adjustmentValue / 100);
          reason = `${slot.adjustmentValue > 0 ? "+" : ""}${slot.adjustmentValue}% ${slot.startTime}-${slot.endTime}`;
          break;
        case "fixed":
          amount = slot.adjustmentValue;
          reason = `${slot.adjustmentValue > 0 ? "+" : ""}$${Math.abs(slot.adjustmentValue).toFixed(2)} ${slot.startTime}-${slot.endTime}`;
          break;
        case "absolute":
          amount = slot.adjustmentValue - currentPrice;
          reason = `Fixed price $${slot.adjustmentValue.toFixed(2)} ${slot.startTime}-${slot.endTime}`;
          break;
      }

      return { type: "time_slot", amount, reason };
    }
  }

  return null;
}

/**
 * Apply day-of-week pricing
 */
function applyDayPricing(
  currentPrice: number,
  dayRules: DayPricing[],
  timestamp: Date
): PriceAdjustment | null {
  const dayOfWeek = timestamp.getDay();
  const dayRule = dayRules.find(r => r.dayOfWeek === dayOfWeek);

  if (dayRule) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let amount = 0;
    let reason = "";

    switch (dayRule.adjustmentType) {
      case "percentage":
        amount = currentPrice * (dayRule.adjustmentValue / 100);
        reason = `${dayRule.adjustmentValue > 0 ? "+" : ""}${dayRule.adjustmentValue}% on ${dayNames[dayOfWeek]}`;
        break;
      case "fixed":
        amount = dayRule.adjustmentValue;
        reason = `${dayRule.adjustmentValue > 0 ? "+" : ""}$${Math.abs(dayRule.adjustmentValue).toFixed(2)} on ${dayNames[dayOfWeek]}`;
        break;
    }

    return { type: "day_of_week", amount, reason };
  }

  return null;
}

/**
 * Apply seasonal pricing
 */
function applySeasonalPricing(
  currentPrice: number,
  seasonalRules: SeasonalRule[],
  timestamp: Date
): PriceAdjustment | null {
  const monthDay = `${(timestamp.getMonth() + 1).toString().padStart(2, "0")}-${timestamp.getDate().toString().padStart(2, "0")}`;

  for (const rule of seasonalRules) {
    if (monthDay >= rule.startDate && monthDay <= rule.endDate) {
      let amount = 0;
      let reason = rule.reason || "Seasonal adjustment";

      switch (rule.adjustmentType) {
        case "percentage":
          amount = currentPrice * (rule.adjustmentValue / 100);
          reason = `${rule.adjustmentValue > 0 ? "+" : ""}${rule.adjustmentValue}% (${reason})`;
          break;
        case "fixed":
          amount = rule.adjustmentValue;
          reason = `${rule.adjustmentValue > 0 ? "+" : ""}$${Math.abs(rule.adjustmentValue).toFixed(2)} (${reason})`;
          break;
      }

      return { type: "seasonal", amount, reason };
    }
  }

  return null;
}

/**
 * Apply surge pricing based on demand
 */
function applySurgePricing(
  currentPrice: number,
  demandMultiplier: number,
  demandLevel: number,
  maxSurgePrice?: number
): PriceAdjustment | null {
  // Only apply surge if demand is above 70%
  if (demandLevel < 70) return null;

  // Calculate surge based on demand level
  const surgeFactor = ((demandLevel - 70) / 30) * (demandMultiplier - 1);
  let amount = currentPrice * surgeFactor;

  // Respect max surge price
  if (maxSurgePrice && currentPrice + amount > maxSurgePrice) {
    amount = maxSurgePrice - currentPrice;
  }

  const surgePercent = Math.round(surgeFactor * 100);
  const reason = `+${surgePercent}% surge (${demandLevel}% capacity)`;

  return { type: "demand_surge", amount, reason };
}

/**
 * Apply customer segment pricing
 */
function applySegmentPricing(
  currentPrice: number,
  segments: SegmentPricing[],
  customerSegment: string
): PriceAdjustment | null {
  const segment = segments.find(s => s.segment === customerSegment);

  if (segment) {
    let amount = 0;
    let reason = `${customerSegment} discount`;

    switch (segment.adjustmentType) {
      case "percentage":
        amount = currentPrice * (segment.adjustmentValue / 100);
        reason = `${segment.adjustmentValue > 0 ? "+" : ""}${segment.adjustmentValue}% (${customerSegment})`;
        break;
      case "fixed":
        amount = segment.adjustmentValue;
        reason = `${segment.adjustmentValue > 0 ? "+" : ""}$${Math.abs(segment.adjustmentValue).toFixed(2)} (${customerSegment})`;
        break;
    }

    return { type: "customer_segment", amount, reason };
  }

  return null;
}

/**
 * Generate human-readable breakdown
 */
function generateBreakdown(
  basePrice: number,
  finalPrice: number,
  adjustments: PriceAdjustment[]
): string {
  let breakdown = `Base Price: $${basePrice.toFixed(2)}\n`;

  if (adjustments.length > 0) {
    breakdown += "\nAdjustments:\n";
    adjustments.forEach(adj => {
      const sign = adj.amount >= 0 ? "+" : "";
      breakdown += `  ${adj.reason}: ${sign}$${adj.amount.toFixed(2)}\n`;
    });
  }

  breakdown += `\nFinal Price: $${finalPrice.toFixed(2)}`;
  return breakdown;
}

/**
 * Estimate current demand level (0-100)
 */
export function estimateDemandLevel(
  currentLoad: number,
  totalCapacity: number
): number {
  if (totalCapacity === 0) return 0;
  return Math.min(100, Math.round((currentLoad / totalCapacity) * 100));
}

/**
 * Get optimal pricing recommendations
 */
export function getPricingRecommendations(
  historicalData: { timestamp: Date; demand: number; revenue: number }[]
): string[] {
  const recommendations: string[] = [];

  // Analyze peak hours
  const hourlyDemand = new Map<number, number[]>();
  historicalData.forEach(d => {
    const hour = d.timestamp.getHours();
    if (!hourlyDemand.has(hour)) hourlyDemand.set(hour, []);
    hourlyDemand.get(hour)!.push(d.demand);
  });

  const avgByHour = Array.from(hourlyDemand.entries())
    .map(([hour, demands]) => ({
      hour,
      avgDemand: demands.reduce((a, b) => a + b, 0) / demands.length,
    }))
    .sort((a, b) => b.avgDemand - a.avgDemand);

  if (avgByHour.length > 0) {
    const peakHours = avgByHour.slice(0, 3).map(h => h.hour);
    recommendations.push(
      `Peak hours are ${peakHours.join(", ")}:00. Consider +15-25% pricing during these times.`
    );

    const lowHours = avgByHour.slice(-3).map(h => h.hour);
    recommendations.push(
      `Low demand at ${lowHours.join(", ")}:00. Consider -10-15% discount to drive traffic.`
    );
  }

  // Analyze day-of-week patterns
  const daylyDemand = new Map<number, number[]>();
  historicalData.forEach(d => {
    const day = d.timestamp.getDay();
    if (!daylyDemand.has(day)) daylyDemand.set(day, []);
    daylyDemand.get(day)!.push(d.demand);
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const avgByDay = Array.from(daylyDemand.entries())
    .map(([day, demands]) => ({
      day,
      avgDemand: demands.reduce((a, b) => a + b, 0) / demands.length,
    }))
    .sort((a, b) => b.avgDemand - a.avgDemand);

  if (avgByDay.length > 0) {
    const peakDay = avgByDay[0];
    recommendations.push(
      `${dayNames[peakDay.day]} is your busiest day. Consider premium pricing or surge during peak hours.`
    );

    const slowDay = avgByDay[avgByDay.length - 1];
    recommendations.push(
      `${dayNames[slowDay.day]} has lowest demand. Run promotions to increase utilization.`
    );
  }

  // Revenue optimization
  const avgRevenue = historicalData.reduce((sum, d) => sum + d.revenue, 0) / historicalData.length;
  const highRevenueSlots = historicalData
    .filter(d => d.revenue > avgRevenue * 1.2)
    .length;

  if (highRevenueSlots / historicalData.length > 0.3) {
    recommendations.push(
      "You have good revenue potential. Consider dynamic surge pricing to capture more value during peak demand."
    );
  }

  return recommendations;
}
