import { useQuery } from "@tanstack/react-query";

export interface EquipmentSpecs {
  gforce?: number;
  water?: number;
  energy?: number;
  cycleTime?: number;
}

export interface EquipmentItem {
  id: string;
  brand: string;
  model: string;
  type: string;
  capacity: number | null;
  capacityUnit: string | null;
  dimensions: {
    height: number;
    width: number;
    depth: number;
  };
  price: number;
  specs: EquipmentSpecs;
  color: string;
  tpdContribution: number;
  revenuePerMonth?: number;
  featured?: boolean;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  icon: string;
}

export interface EquipmentLibraryData {
  version: string;
  lastUpdated: string;
  categories: EquipmentCategory[];
  brands: string[];
  equipment: EquipmentItem[];
}

async function fetchEquipmentLibrary(): Promise<EquipmentLibraryData> {
  const response = await fetch("/data/equipment-library.json");
  if (!response.ok) {
    throw new Error("Failed to load equipment library");
  }
  return response.json();
}

export function useEquipmentLibrary() {
  return useQuery<EquipmentLibraryData>({
    queryKey: ["/equipment-library"],
    queryFn: fetchEquipmentLibrary,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useFilteredEquipment(
  data: EquipmentLibraryData | undefined,
  filters: {
    searchQuery?: string;
    categoryFilter?: string;
    brandFilter?: string;
    minCapacity?: number;
    maxCapacity?: number;
    maxPrice?: number;
  }
) {
  if (!data) return [];

  return data.equipment.filter((item) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        item.brand.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (filters.categoryFilter && filters.categoryFilter !== "all") {
      if (item.type !== filters.categoryFilter) return false;
    }

    if (filters.brandFilter && filters.brandFilter !== "all") {
      if (item.brand !== filters.brandFilter) return false;
    }

    if (filters.minCapacity && item.capacity) {
      if (item.capacity < filters.minCapacity) return false;
    }

    if (filters.maxCapacity && item.capacity) {
      if (item.capacity > filters.maxCapacity) return false;
    }

    if (filters.maxPrice) {
      if (item.price > filters.maxPrice) return false;
    }

    return true;
  });
}

export function getFeaturedEquipment(data: EquipmentLibraryData | undefined) {
  if (!data) return [];
  return data.equipment.filter((item) => item.featured);
}

export function getEquipmentByType(
  data: EquipmentLibraryData | undefined,
  type: string
) {
  if (!data) return [];
  return data.equipment.filter((item) => item.type === type);
}

export function getEquipmentById(
  data: EquipmentLibraryData | undefined,
  id: string
) {
  if (!data) return null;
  return data.equipment.find((item) => item.id === id) || null;
}

export function formatCapacity(item: EquipmentItem): string {
  if (!item.capacity) return "N/A";
  return `${item.capacity}${item.capacityUnit || "lb"}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDimensions(item: EquipmentItem): string {
  const { height, width, depth } = item.dimensions;
  return `${height}"H × ${width}"W × ${depth}"D`;
}

export const LEGACY_EQUIPMENT_MAP: Record<string, string> = {
  "dexter-t900": "dexter-t900",
  "dexter-t1200": "dexter-t1200",
  "speed-queen-sfn": "sq-ff7005wn",
  "speed-queen-stack": "sq-st075",
};

export function getLegacyCompatibleId(legacyId: string): string {
  return LEGACY_EQUIPMENT_MAP[legacyId] || legacyId;
}
