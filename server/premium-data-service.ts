import { Request } from "express";
import { SUBSCRIPTION_TIERS, getUserTier } from "./enterprise-security";

interface CLEANBIAnalysis {
  locationId: string;
  overallScore: number;
  grade: string;
  demographics: DemographicsData;
  competition: CompetitionData;
  traffic: TrafficData;
  accessibility: AccessibilityData;
  lastUpdated: string;
}

interface DemographicsData {
  populationDensity: number;
  medianIncome: number;
  renterPercentage: number;
  multiFamilyPercentage: number;
  collegePopulation: number;
  ageDistribution: Record<string, number>;
  employmentRate: number;
  householdSize: number;
}

interface CompetitionData {
  nearbyLaundromats: number;
  distanceToNearest: number;
  marketSaturation: string;
  priceComparison: number;
  competitorRatings: number[];
  marketShare: number;
}

interface TrafficData {
  dailyFootTraffic: number;
  vehicleTraffic: number;
  peakHours: string[];
  weekdayVsWeekend: number;
  nearbyRetail: string[];
}

interface AccessibilityData {
  parkingSpaces: number;
  publicTransitScore: number;
  walkScore: number;
  driveScore: number;
  visibility: number;
}

interface POSData {
  locationId: string;
  dailyRevenue: number;
  transactionCount: number;
  averageTicket: number;
  machineUtilization: Record<string, number>;
  peakHours: string[];
  customerSegments: Record<string, number>;
}

interface DashboardMetrics {
  totalLocations: number;
  totalRevenue: number;
  averageCLEANBIScore: number;
  topPerformingLocations: string[];
  underperformingLocations: string[];
  growthRate: number;
  marketOpportunities: number;
}

interface DataAccessPolicy {
  canAccessCLEANBI: boolean;
  cleanbiDetailLevel: "basic" | "standard" | "full";
  canAccessDemographics: boolean;
  demographicsDetailLevel: "summary" | "detailed" | "full";
  canAccessCompetition: boolean;
  competitionDetailLevel: "count" | "locations" | "full";
  canAccessPOS: boolean;
  posDataScope: "summary" | "detailed" | "realtime";
  canExport: boolean;
  exportFormats: string[];
  maxExportsPerMonth: number;
  canAccessAPI: boolean;
  apiRateLimit: number;
}

export function getDataAccessPolicy(req: Request): DataAccessPolicy {
  const tier = getUserTier(req);
  
  const policies: Record<string, DataAccessPolicy> = {
    free: {
      canAccessCLEANBI: false,
      cleanbiDetailLevel: "basic",
      canAccessDemographics: false,
      demographicsDetailLevel: "summary",
      canAccessCompetition: false,
      competitionDetailLevel: "count",
      canAccessPOS: false,
      posDataScope: "summary",
      canExport: false,
      exportFormats: [],
      maxExportsPerMonth: 0,
      canAccessAPI: false,
      apiRateLimit: 0,
    },
    starter: {
      canAccessCLEANBI: true,
      cleanbiDetailLevel: "basic",
      canAccessDemographics: false,
      demographicsDetailLevel: "summary",
      canAccessCompetition: false,
      competitionDetailLevel: "count",
      canAccessPOS: false,
      posDataScope: "summary",
      canExport: true,
      exportFormats: ["pdf"],
      maxExportsPerMonth: 5,
      canAccessAPI: false,
      apiRateLimit: 0,
    },
    professional: {
      canAccessCLEANBI: true,
      cleanbiDetailLevel: "standard",
      canAccessDemographics: true,
      demographicsDetailLevel: "detailed",
      canAccessCompetition: true,
      competitionDetailLevel: "locations",
      canAccessPOS: false,
      posDataScope: "summary",
      canExport: true,
      exportFormats: ["pdf", "excel"],
      maxExportsPerMonth: 50,
      canAccessAPI: true,
      apiRateLimit: 500,
    },
    enterprise: {
      canAccessCLEANBI: true,
      cleanbiDetailLevel: "full",
      canAccessDemographics: true,
      demographicsDetailLevel: "full",
      canAccessCompetition: true,
      competitionDetailLevel: "full",
      canAccessPOS: true,
      posDataScope: "detailed",
      canExport: true,
      exportFormats: ["pdf", "excel", "csv", "json"],
      maxExportsPerMonth: 500,
      canAccessAPI: true,
      apiRateLimit: 2000,
    },
    distributor: {
      canAccessCLEANBI: true,
      cleanbiDetailLevel: "full",
      canAccessDemographics: true,
      demographicsDetailLevel: "full",
      canAccessCompetition: true,
      competitionDetailLevel: "full",
      canAccessPOS: true,
      posDataScope: "realtime",
      canExport: true,
      exportFormats: ["pdf", "excel", "csv", "json", "api"],
      maxExportsPerMonth: -1,
      canAccessAPI: true,
      apiRateLimit: 10000,
    },
  };
  
  return policies[tier.id] || policies.free;
}

export function filterCLEANBIData(data: CLEANBIAnalysis, policy: DataAccessPolicy): Partial<CLEANBIAnalysis> {
  if (!policy.canAccessCLEANBI) {
    return {
      locationId: data.locationId,
      grade: data.grade,
    };
  }
  
  switch (policy.cleanbiDetailLevel) {
    case "basic":
      return {
        locationId: data.locationId,
        overallScore: data.overallScore,
        grade: data.grade,
        lastUpdated: data.lastUpdated,
      };
    case "standard":
      return {
        locationId: data.locationId,
        overallScore: data.overallScore,
        grade: data.grade,
        demographics: {
          populationDensity: data.demographics.populationDensity,
          medianIncome: data.demographics.medianIncome,
          renterPercentage: data.demographics.renterPercentage,
        } as DemographicsData,
        competition: {
          nearbyLaundromats: data.competition.nearbyLaundromats,
          marketSaturation: data.competition.marketSaturation,
        } as CompetitionData,
        lastUpdated: data.lastUpdated,
      };
    case "full":
    default:
      return data;
  }
}

export function filterDemographicsData(data: DemographicsData, policy: DataAccessPolicy): Partial<DemographicsData> {
  if (!policy.canAccessDemographics) {
    return {};
  }
  
  switch (policy.demographicsDetailLevel) {
    case "summary":
      return {
        populationDensity: data.populationDensity,
        medianIncome: data.medianIncome,
      };
    case "detailed":
      return {
        populationDensity: data.populationDensity,
        medianIncome: data.medianIncome,
        renterPercentage: data.renterPercentage,
        multiFamilyPercentage: data.multiFamilyPercentage,
        employmentRate: data.employmentRate,
      };
    case "full":
    default:
      return data;
  }
}

export function filterCompetitionData(data: CompetitionData, policy: DataAccessPolicy): Partial<CompetitionData> {
  if (!policy.canAccessCompetition) {
    return {};
  }
  
  switch (policy.competitionDetailLevel) {
    case "count":
      return {
        nearbyLaundromats: data.nearbyLaundromats,
      };
    case "locations":
      return {
        nearbyLaundromats: data.nearbyLaundromats,
        distanceToNearest: data.distanceToNearest,
        marketSaturation: data.marketSaturation,
      };
    case "full":
    default:
      return data;
  }
}

export function filterPOSData(data: POSData, policy: DataAccessPolicy): Partial<POSData> | null {
  if (!policy.canAccessPOS) {
    return null;
  }
  
  switch (policy.posDataScope) {
    case "summary":
      return {
        locationId: data.locationId,
        dailyRevenue: data.dailyRevenue,
        transactionCount: data.transactionCount,
      };
    case "detailed":
      return {
        locationId: data.locationId,
        dailyRevenue: data.dailyRevenue,
        transactionCount: data.transactionCount,
        averageTicket: data.averageTicket,
        peakHours: data.peakHours,
      };
    case "realtime":
    default:
      return data;
  }
}

interface IntegratedLocationData {
  locationId: string;
  cleanbi: Partial<CLEANBIAnalysis>;
  demographics: Partial<DemographicsData>;
  competition: Partial<CompetitionData>;
  pos: Partial<POSData> | null;
  insights: string[];
  recommendations: string[];
}

export function getIntegratedLocationData(
  locationId: string,
  cleanbiData: CLEANBIAnalysis,
  posData: POSData | null,
  policy: DataAccessPolicy
): IntegratedLocationData {
  const filteredCleanbi = filterCLEANBIData(cleanbiData, policy);
  const filteredDemographics = filterDemographicsData(cleanbiData.demographics, policy);
  const filteredCompetition = filterCompetitionData(cleanbiData.competition, policy);
  const filteredPOS = posData ? filterPOSData(posData, policy) : null;
  
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  if (policy.cleanbiDetailLevel !== "basic") {
    if (cleanbiData.overallScore >= 85) {
      insights.push("This location has excellent potential with Grade A CLEANBI score");
    } else if (cleanbiData.overallScore >= 70) {
      insights.push("Good opportunity with Grade B CLEANBI score");
    } else if (cleanbiData.overallScore >= 55) {
      insights.push("Fair opportunity with Grade C CLEANBI score - consider strategic improvements");
    } else {
      insights.push("Location needs strategic work to improve viability");
    }
  }
  
  if (policy.canAccessDemographics && cleanbiData.demographics.renterPercentage > 50) {
    insights.push(`High renter population (${cleanbiData.demographics.renterPercentage.toFixed(1)}%) indicates strong laundry demand`);
  }
  
  if (policy.canAccessCompetition) {
    if (cleanbiData.competition.nearbyLaundromats === 0) {
      insights.push("No direct competition within 1 mile - potential untapped market");
      recommendations.push("Consider aggressive marketing to establish market presence");
    } else if (cleanbiData.competition.nearbyLaundromats > 3) {
      insights.push(`Competitive market with ${cleanbiData.competition.nearbyLaundromats} nearby laundromats`);
      recommendations.push("Focus on differentiation through service quality, equipment, or pricing");
    }
  }
  
  if (policy.canAccessPOS && posData) {
    if (posData.averageTicket > 15) {
      insights.push(`Strong average ticket size of $${posData.averageTicket.toFixed(2)}`);
    }
    
    const utilization = Object.values(posData.machineUtilization).reduce((a, b) => a + b, 0) / 
      Object.keys(posData.machineUtilization).length;
    
    if (utilization > 0.7) {
      recommendations.push("High machine utilization - consider adding capacity");
    } else if (utilization < 0.3) {
      recommendations.push("Low utilization - review pricing and marketing strategy");
    }
  }
  
  return {
    locationId,
    cleanbi: filteredCleanbi,
    demographics: filteredDemographics,
    competition: filteredCompetition,
    pos: filteredPOS,
    insights,
    recommendations,
  };
}

export function getDashboardMetrics(
  userId: string,
  distributorId: string | null,
  policy: DataAccessPolicy
): DashboardMetrics {
  const baseMetrics: DashboardMetrics = {
    totalLocations: 0,
    totalRevenue: 0,
    averageCLEANBIScore: 0,
    topPerformingLocations: [],
    underperformingLocations: [],
    growthRate: 0,
    marketOpportunities: 0,
  };
  
  if (!policy.canAccessCLEANBI && !policy.canAccessPOS) {
    return baseMetrics;
  }
  
  return baseMetrics;
}

export function validateExportRequest(
  req: Request,
  format: string
): { valid: boolean; error?: string } {
  const policy = getDataAccessPolicy(req);
  
  if (!policy.canExport) {
    return { 
      valid: false, 
      error: "Export is not available with your current subscription. Please upgrade to access this feature." 
    };
  }
  
  if (!policy.exportFormats.includes(format)) {
    return { 
      valid: false, 
      error: `Export format '${format}' is not available with your subscription. Available formats: ${policy.exportFormats.join(", ")}` 
    };
  }
  
  return { valid: true };
}

export function generateExportMetadata(req: Request, data: any): any {
  const user = (req as any).user;
  const tier = getUserTier(req);
  
  return {
    _meta: {
      exportedBy: user?.id || "anonymous",
      exportedAt: new Date().toISOString(),
      subscriptionTier: tier.name,
      source: "WashBizHub Premium Data",
      license: tier.level >= 3 ? "Enterprise License" : "Standard License",
      watermarked: tier.level < 3,
      trackingId: require("crypto").randomBytes(8).toString("hex"),
    },
    data,
  };
}

export { DataAccessPolicy, CLEANBIAnalysis, DemographicsData, CompetitionData, POSData, DashboardMetrics };
