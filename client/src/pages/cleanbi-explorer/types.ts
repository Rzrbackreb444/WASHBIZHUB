export type MachineType = 'washer' | 'dryer' | 'combo' | 'folder' | 'ironer';
export type MachineBrand = 
  | 'speed_queen' | 'dexter' | 'maytag' | 'lg' | 'electrolux' | 'huebsch'
  | 'wascomat' | 'continental_girbau' | 'ipso' | 'alliance' | 'adc'
  | 'unimac' | 'primus' | 'fagor' | 'other';
export type MachineCapacity = 'small' | 'medium' | 'large' | 'extra_large' | 'mega';

export interface EquipmentItem {
  id: string;
  machineType: MachineType;
  brand: MachineBrand;
  model: string;
  capacity: MachineCapacity;
  ageYears: number;
  purchaseCost: number;
  quantity: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  hasCardSystem?: boolean;
  monthlyRevenue?: number;
}

export interface ValuatorResult {
  equipmentFMV: number;
  propertyValue: number;
  businessValue: number;
  totalAssetValue: number;
  valuationRange: { min: number; max: number };
  adjustments: Array<{ reason: string; amount: number; percentage: number; direction: 'increase' | 'decrease' }>;
  equipmentBreakdown: {
    totalFMV: number;
    totalOriginalCost: number;
    weightedAge: number;
    brandBreakdown: Record<string, { count: number; value: number }>;
    typeBreakdown: Record<string, { count: number; value: number }>;
    items: Array<{
      id: string;
      machineType: string;
      brand: string;
      quantity: number;
      currentValue: number;
      fairMarketValue: number;
      depreciationRate: number;
      remainingLifeYears: number;
    }>;
  };
  businessDetails: {
    ebitda: number;
    ebitdaMultiple: number;
    cleanbiPremium: number;
    locationAdjustment: number;
  };
}

export interface ValuatorNarrative {
  executiveSummary: string;
  strengthsAnalysis: string;
  risksAnalysis: string;
  recommendations: string[];
  confidenceStatement: string;
}

export interface WhatIfScenario {
  addedMachines: EquipmentItem[];
  removedMachineIds: string[];
}

export const BRAND_DISPLAY_NAMES: Record<MachineBrand, string> = {
  speed_queen: "Speed Queen",
  dexter: "Dexter",
  maytag: "Maytag",
  lg: "LG",
  electrolux: "Electrolux",
  huebsch: "Huebsch",
  wascomat: "Wascomat",
  continental_girbau: "Continental Girbau",
  ipso: "IPSO",
  alliance: "Alliance",
  adc: "ADC",
  unimac: "UniMac",
  primus: "Primus",
  fagor: "Fagor",
  other: "Other"
};

export const CAPACITY_DISPLAY_NAMES: Record<MachineCapacity, string> = {
  small: "Small (≤20lb)",
  medium: "Medium (20-40lb)",
  large: "Large (40-60lb)",
  extra_large: "XL (60-80lb)",
  mega: "Mega (80lb+)"
};

export const MACHINE_TYPE_DISPLAY: Record<MachineType, string> = {
  washer: "Washer",
  dryer: "Dryer",
  combo: "Combo",
  folder: "Folder",
  ironer: "Ironer"
};
