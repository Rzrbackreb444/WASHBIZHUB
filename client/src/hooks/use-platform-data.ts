import { useQuery } from "@tanstack/react-query";

export interface IndustryBenchmarks {
  averageRevenuePerSqFt: number;
  averageValuationMultiple: number;
  medianAskingPrice: number;
  averageNetOperatingIncome: number;
  marketGrowthRate: number;
  industrySize: number;
  survivalRate: number;
  averageROI: number;
  source: string;
  lastUpdated: string;
}

export interface FundingRates {
  sbaRates: { min: number; max: number; term: string };
  equipmentFinancing: { min: number; max: number; term: string };
  businessLineOfCredit: { min: number; max: number };
  merchantCashAdvance: { min: number; max: number };
  lastUpdated: string;
}

export interface EquipmentPricing {
  newPriceRange: { min: number; max: number };
  usedPriceRange: { min: number; max: number };
  brands: string[];
  source: string;
}

export interface MarketInsights {
  marketOverview: string;
  opportunities: string[];
  challenges: string[];
  competitionLevel: string;
  recommendedStrategy: string;
}

export function useBenchmarks() {
  return useQuery<IndustryBenchmarks>({
    queryKey: ['/api/platform-data/benchmarks'],
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false
  });
}

export function useFundingRates() {
  return useQuery<FundingRates>({
    queryKey: ['/api/platform-data/funding-rates'],
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false
  });
}

export function useEquipmentPricing(equipmentType: string) {
  return useQuery<EquipmentPricing>({
    queryKey: ['/api/platform-data/equipment-pricing', equipmentType],
    enabled: !!equipmentType,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false
  });
}

export function useMarketInsights(city: string, state: string) {
  return useQuery<MarketInsights>({
    queryKey: ['/api/platform-data/market-insights', city, state],
    enabled: !!city && !!state,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false
  });
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
