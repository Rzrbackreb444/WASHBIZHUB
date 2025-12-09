import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface LocationAnalysis {
  address: string;
  coordinates: { lat: number; lng: number };
  cleanbiScore: number;
  grade: "A" | "B" | "C" | "Needs Work";
  demographics: {
    medianIncome: number;
    populationDensity: number;
    renterPercentage: number;
    householdSize: number;
  };
  competition: {
    count: number;
    nearestDistance: number;
    marketSaturation: "Low" | "Medium" | "High";
  };
  traffic: {
    score: number;
    dailyTraffic: number;
    peakHours: string[];
  };
  accessibility: {
    walkScore: number;
    transitScore: number;
    parkingAvailable: boolean;
  };
  economics: {
    avgRent: number;
    utilityMultiplier: number;
    laborCost: number;
  };
  opportunityLevel: string;
  revenueMultiplier: number;
  analyzedAt: string;
}

export interface DesignProject {
  id?: string;
  name: string;
  locationId?: string;
  location?: LocationAnalysis;
  dimensions: { width: number; depth: number };
  equipment: Array<{
    equipmentId: string;
    x: number;
    y: number;
    rotation: number;
  }>;
  projections: {
    dailyRevenue: number;
    monthlyRevenue: number;
    annualRevenue: number;
    adjustedForLocation: boolean;
  };
  viabilityScore: number;
  viabilityGrade: "A" | "B" | "C" | "Needs Work";
  createdAt: string;
  updatedAt: string;
}

interface LocationDesignContextType {
  currentLocation: LocationAnalysis | null;
  setCurrentLocation: (location: LocationAnalysis | null) => void;
  currentDesign: DesignProject | null;
  setCurrentDesign: (design: DesignProject | null) => void;
  linkLocationToDesign: (location: LocationAnalysis) => void;
  clearLocationContext: () => void;
  calculateRevenueMultiplier: (location: LocationAnalysis) => number;
  isLocationLinked: boolean;
}

const LocationDesignContext = createContext<LocationDesignContextType | undefined>(undefined);

export function LocationDesignProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<LocationAnalysis | null>(() => {
    const saved = sessionStorage.getItem("washbizhub-location-context");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [currentDesign, setCurrentDesign] = useState<DesignProject | null>(null);

  const calculateRevenueMultiplier = useCallback((location: LocationAnalysis): number => {
    let multiplier = 1.0;
    
    const income = location.demographics.medianIncome;
    if (income > 100000) multiplier += 0.15;
    else if (income > 75000) multiplier += 0.10;
    else if (income > 50000) multiplier += 0.05;
    else if (income < 35000) multiplier -= 0.10;
    
    const density = location.demographics.populationDensity;
    if (density > 15000) multiplier += 0.12;
    else if (density > 10000) multiplier += 0.08;
    else if (density > 5000) multiplier += 0.04;
    else if (density < 2000) multiplier -= 0.08;
    
    const renterPct = location.demographics.renterPercentage;
    if (renterPct > 60) multiplier += 0.10;
    else if (renterPct > 45) multiplier += 0.05;
    else if (renterPct < 25) multiplier -= 0.08;
    
    if (location.competition.marketSaturation === "Low") multiplier += 0.08;
    else if (location.competition.marketSaturation === "High") multiplier -= 0.12;
    
    if (location.traffic.score > 80) multiplier += 0.06;
    else if (location.traffic.score < 40) multiplier -= 0.06;
    
    if (location.accessibility.walkScore > 70) multiplier += 0.04;
    if (location.accessibility.transitScore > 60) multiplier += 0.03;
    
    return Math.max(0.6, Math.min(1.5, multiplier));
  }, []);

  const linkLocationToDesign = useCallback((location: LocationAnalysis) => {
    setCurrentLocation(location);
    sessionStorage.setItem("washbizhub-location-context", JSON.stringify(location));
  }, []);

  const clearLocationContext = useCallback(() => {
    setCurrentLocation(null);
    sessionStorage.removeItem("washbizhub-location-context");
  }, []);

  const isLocationLinked = currentLocation !== null;

  return (
    <LocationDesignContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        currentDesign,
        setCurrentDesign,
        linkLocationToDesign,
        clearLocationContext,
        calculateRevenueMultiplier,
        isLocationLinked,
      }}
    >
      {children}
    </LocationDesignContext.Provider>
  );
}

export function useLocationDesign() {
  const context = useContext(LocationDesignContext);
  if (context === undefined) {
    throw new Error("useLocationDesign must be used within a LocationDesignProvider");
  }
  return context;
}

export function useLocationDesignOptional() {
  return useContext(LocationDesignContext);
}
