// COMPREHENSIVE 2025 LAUNDROMAT EQUIPMENT DATABASE
// Real manufacturer specs with exact dimensions, pricing, and utility requirements
// Aligned with Design Studio equipment types and categories

// Equipment types matching Design Studio categories:
// - washer, dryer (main equipment)
// - door, window, column, wall, bulkhead (architecture)
// - table, counter, seating, furniture, cart (furniture)
// - restroom, storage, utility, sink (utilities)
// - atm, changer (financial)
// - vending, dogwash, accessory (services)
// - arcade, entertainment (games)

export type EquipmentType = 
  | "washer" | "dryer"  // Main equipment
  | "door" | "window" | "column" | "wall" | "bulkhead"  // Architecture
  | "table" | "counter" | "seating" | "furniture" | "cart"  // Furniture
  | "restroom" | "storage" | "utility" | "sink"  // Utilities
  | "atm" | "changer"  // Financial
  | "vending" | "dogwash" | "accessory"  // Services
  | "arcade" | "entertainment";  // Games

export type EquipmentCategory = 
  | "washers" | "dryers" 
  | "architecture" | "furniture" | "utilities" 
  | "financial" | "services" | "entertainment";

export interface UtilityRequirements {
  water: boolean;
  waterHookups?: { hot: boolean; cold: boolean };
  gas: boolean;
  gasType?: "natural" | "propane";
  electric?: "none" | "120V" | "208V" | "240V" | "480V" | "208-240V" | "208-240V-3Ø";
  amperage?: number;
  drainSize?: number; // inches
  ventSize?: number; // inches for dryers
}

export interface EquipmentSpec {
  id: string;
  brand: string;
  model: string;
  type: EquipmentType;
  category: EquipmentCategory;
  capacity: string; // e.g., "20lb", "3.8cf"
  capacityLb?: number;
  cubicFeet?: number;
  height: number; // inches
  width: number; // inches
  depth: number; // inches
  priceNew: number;
  priceRefurb?: number;
  utilities: UtilityRequirements;
  tpdContribution: number; // turns per day
  roiMonthly?: { min: number; max: number }; // for ancillary
  yearRange: string;
  notes?: string;
  color: string;
  extractionG?: number; // G-force for washers
  features?: string[];
}

// ADA COMPLIANCE RULES (2010 ADA Standards)
export const adaComplianceRules = {
  turningSpace: 60, // 60" diameter circle for wheelchair
  doorClearWidth: 32, // minimum door clear width
  aisleWidth: 36, // minimum aisle for wheelchair
  preferredAisle: 48, // preferred aisle width
  washerReachRange: { min: 30, max: 48 }, // accessible reach range
  accessibleWasherRatio: 0.67, // 2/3+ must be accessible (front-load)
  rampSlope: 1 / 12, // maximum 1:12 slope
  signageHeight: 60, // braille signage at 60" AFF
  grabBarHeight: { min: 33, max: 36 }, // grab bar AFF
  toiletSeatHeight: { min: 17, max: 19 },
  sinkMaxHeight: 34, // max rim height
  toiletStallWidth: 60,
  toiletStallDepth: 56, // wall-mount, 59 for floor-mount
  toiletCenterline: { min: 16, max: 18 }, // from side wall
};

// PARKING REQUIREMENTS
export const parkingRequirements = {
  spotsPerWasher: 0.5,
  spotsPerEmployee: 1,
  adaSpotsRatio: 1 / 25, // 1 per 25 total spots
  vanAccessibleRatio: 1 / 6, // 1 in 6 ADA spots must be van
  carSpotWidth: 96, // inches
  carAisleWidth: 60, // inches
  vanSpotWidth: 132, // inches (or 96 + 96 aisle)
  spotLength: 216, // 18 ft
  maxSlope: 0.0208, // 2.08%
  costPerSpot: { min: 2000, max: 5000 },
};

// VIABILITY SCORECARD (0-100)
export const viabilityScorecard = {
  population1mi: [
    { threshold: 8000, score: 0 },
    { threshold: 12000, score: 10 },
    { threshold: 18000, score: 15 },
    { threshold: 20000, score: 20 },
  ],
  competition1mi: [
    { count: 0, score: 15 },
    { count: 1, score: 8 },
    { count: 2, score: 0 },
  ],
  householdIncome: [
    { threshold: 40000, score: 3 },
    { threshold: 65000, score: 8 },
    { threshold: 100000, score: 10 },
  ],
  renterPercentage: [
    { threshold: 30, score: 5 },
    { threshold: 60, score: 12 },
    { threshold: 65, score: 15 },
  ],
  visibilityParking: 10, // corner + 20 spots
  revenueMultiple: [
    { threshold: 2.5, score: 20 },
    { threshold: 4.0, score: 10 },
    { threshold: 4.5, score: 0 },
  ],
  waterRatesLow: 10,
  thresholds: {
    buy: 80,
    strong: 60,
    walk: 0,
  },
};

// EQUIPMENT PACKAGES 2025
export const equipmentPackages = {
  micro: {
    name: "Micro",
    sqft: { min: 800, max: 1200 },
    washers: 8,
    dryers: 8,
    priceNew: { min: 58000, max: 72000 },
    priceRefurb: { min: 32000, max: 42000 },
    revenueMonthly: { min: 4000, max: 7000 },
  },
  standard: {
    name: "Standard",
    sqft: { min: 1500, max: 2200 },
    washers: 14,
    dryers: 14,
    priceNew: { min: 115000, max: 145000 },
    priceRefurb: { min: 68000, max: 92000 },
    revenueMonthly: { min: 8000, max: 14000 },
  },
  large: {
    name: "Large",
    sqft: { min: 2500, max: 3500 },
    washers: 22,
    dryers: 20,
    priceNew: { min: 195000, max: 245000 },
    priceRefurb: { min: 110000, max: 155000 },
    revenueMonthly: { min: 15000, max: 25000 },
  },
  mega: {
    name: "Mega/Hybrid + WDF",
    sqft: { min: 4000, max: 6000 },
    washers: 30,
    dryers: 30,
    priceNew: { min: 350000, max: 550000 },
    priceRefurb: { min: 180000, max: 280000 },
    revenueMonthly: { min: 30000, max: 60000 },
  },
};

// COMPREHENSIVE EQUIPMENT DATABASE 2025
export const equipmentDatabase2025: EquipmentSpec[] = [
  // ============================================================================
  // SPEED QUEEN WASHERS (2025 Pricing)
  // ============================================================================
  {
    id: "sq-sc20",
    brand: "Speed Queen",
    model: "SC20",
    type: "washer",
    category: "washers",
    capacity: "20lb",
    capacityLb: 20,
    height: 42.9,
    width: 26,
    depth: 29.8,
    priceNew: 5200,
    priceRefurb: 3100,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 15, drainSize: 2 },
    tpdContribution: 8,
    yearRange: "2000-2025",
    color: "#DC2626",
    extractionG: 200,
    features: ["Quantum Gold controls", "Coin/card ready"],
  },
  {
    id: "sq-sc30",
    brand: "Speed Queen",
    model: "SC30",
    type: "washer",
    category: "washers",
    capacity: "30lb",
    capacityLb: 30,
    height: 45.9,
    width: 29,
    depth: 34.8,
    priceNew: 7100,
    priceRefurb: 4200,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 20, drainSize: 2 },
    tpdContribution: 9,
    yearRange: "2000-2025",
    color: "#DC2626",
    extractionG: 200,
  },
  {
    id: "sq-sc40",
    brand: "Speed Queen",
    model: "SC40",
    type: "washer",
    category: "washers",
    capacity: "40lb",
    capacityLb: 40,
    height: 47.9,
    width: 30.6,
    depth: 40.2,
    priceNew: 8900,
    priceRefurb: 5300,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 20, drainSize: 2 },
    tpdContribution: 10,
    yearRange: "2000-2025",
    color: "#DC2626",
    extractionG: 200,
  },
  {
    id: "sq-sc60",
    brand: "Speed Queen",
    model: "SC60",
    type: "washer",
    category: "washers",
    capacity: "60lb",
    capacityLb: 60,
    height: 50.8,
    width: 34.1,
    depth: 42.9,
    priceNew: 11800,
    priceRefurb: 7100,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 30, drainSize: 2 },
    tpdContribution: 12,
    yearRange: "2000-2025",
    color: "#B91C1C",
    extractionG: 200,
  },
  {
    id: "sq-sc80",
    brand: "Speed Queen",
    model: "SC80",
    type: "washer",
    category: "washers",
    capacity: "80lb",
    capacityLb: 80,
    height: 56.9,
    width: 41.5,
    depth: 52,
    priceNew: 14500,
    priceRefurb: 9200,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 40, drainSize: 2 },
    tpdContribution: 14,
    yearRange: "2000-2025",
    color: "#991B1B",
    extractionG: 200,
  },
  {
    id: "sq-stack-dryer-18x2",
    brand: "Speed Queen",
    model: "Stack Dryer 18x2",
    type: "dryer",
    category: "dryers",
    capacity: "18lb x2",
    capacityLb: 36,
    height: 76.6,
    width: 26.9,
    depth: 28,
    priceNew: 4200,
    priceRefurb: 2600,
    utilities: { water: false, gas: true, gasType: "natural", electric: "120V", ventSize: 4 },
    tpdContribution: 12,
    yearRange: "2000-2025",
    color: "#EF4444",
  },
  {
    id: "sq-tv2000wn",
    brand: "Speed Queen",
    model: "TV2000WN",
    type: "washer",
    category: "washers",
    capacity: "16lb",
    capacityLb: 16,
    cubicFeet: 3.19,
    height: 43,
    width: 25.63,
    depth: 28,
    priceNew: 5000,
    priceRefurb: 3000,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "120V", drainSize: 2 },
    tpdContribution: 7,
    yearRange: "2010-2025",
    notes: "Light commercial top load",
    color: "#DC2626",
  },

  // ============================================================================
  // DEXTER X-SERIES 2025 (New Line - Premium)
  // ============================================================================
  {
    id: "dx-x350",
    brand: "Dexter",
    model: "X-350",
    type: "washer",
    category: "washers",
    capacity: "20lb",
    capacityLb: 20,
    cubicFeet: 2.7,
    height: 43.9,
    width: 26,
    depth: 28,
    priceNew: 6800,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 15, drainSize: 2 },
    tpdContribution: 8,
    yearRange: "2025",
    color: "#3B82F6",
    extractionG: 350,
    features: ["App-ready", "Wi-Fi diagnostics", "350G extraction", "Inverter drive"],
  },
  {
    id: "dx-x450",
    brand: "Dexter",
    model: "X-450",
    type: "washer",
    category: "washers",
    capacity: "30lb",
    capacityLb: 30,
    cubicFeet: 4,
    height: 48.2,
    width: 29.9,
    depth: 27.4,
    priceNew: 8900,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 20, drainSize: 2 },
    tpdContribution: 9,
    yearRange: "2025",
    color: "#2563EB",
    extractionG: 300,
    features: ["App telemetry", "300G extraction"],
  },
  {
    id: "dx-x600",
    brand: "Dexter",
    model: "X-600",
    type: "washer",
    category: "washers",
    capacity: "40lb",
    capacityLb: 40,
    cubicFeet: 6,
    height: 49.7,
    width: 29.9,
    depth: 36,
    priceNew: 10500,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 20, drainSize: 2 },
    tpdContribution: 10,
    yearRange: "2025",
    color: "#1D4ED8",
    notes: "Fits 36\" door, reversing drum",
    features: ["Softmount OPL", "Reversing drum"],
  },
  {
    id: "dx-x750",
    brand: "Dexter",
    model: "X-750",
    type: "washer",
    category: "washers",
    capacity: "50lb",
    capacityLb: 50,
    cubicFeet: 6.5,
    height: 52.5,
    width: 34.5,
    depth: 40,
    priceNew: 12800,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 30, drainSize: 2 },
    tpdContribution: 11,
    yearRange: "2025",
    color: "#1E40AF",
    extractionG: 350,
    features: ["350G extraction", "Ozone compatible"],
  },
  {
    id: "dx-x1200",
    brand: "Dexter",
    model: "X-1200",
    type: "washer",
    category: "washers",
    capacity: "80lb",
    capacityLb: 80,
    cubicFeet: 11.5,
    height: 57.9,
    width: 34.4,
    depth: 45.4,
    priceNew: 16500,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 40, drainSize: 2 },
    tpdContribution: 15,
    yearRange: "2025",
    color: "#1E3A8A",
    extractionG: 300,
    features: ["Programmable", "Industrial grade"],
  },
  {
    id: "dx-x350-combo",
    brand: "Dexter",
    model: "X-350 Express Combo",
    type: "washer",
    category: "washers",
    capacity: "20lb W / 20lb D",
    capacityLb: 20,
    cubicFeet: 2.7,
    height: 74.8,
    width: 27,
    depth: 44.6,
    priceNew: 9800,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: true, gasType: "natural", electric: "208V", drainSize: 2, ventSize: 4 },
    tpdContribution: 14,
    yearRange: "2025",
    color: "#3B82F6",
    extractionG: 350,
    notes: "Fits 36\" door",
    features: ["350G extraction", "Stacked washer/dryer combo"],
  },

  // ============================================================================
  // DEXTER T-SERIES (Classic)
  // ============================================================================
  {
    id: "dx-t350",
    brand: "Dexter",
    model: "T-350",
    type: "washer",
    category: "washers",
    capacity: "20lb",
    capacityLb: 20,
    cubicFeet: 2.7,
    height: 43.875,
    width: 26,
    depth: 28,
    priceNew: 5500,
    priceRefurb: 3500,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 7,
    yearRange: "2000-2025",
    color: "#4A90E2",
    extractionG: 200,
  },
  {
    id: "dx-t400",
    brand: "Dexter",
    model: "T-400",
    type: "washer",
    category: "washers",
    capacity: "30lb",
    capacityLb: 30,
    cubicFeet: 4,
    height: 48.1875,
    width: 29.875,
    depth: 27.375,
    priceNew: 6500,
    priceRefurb: 4000,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 8,
    yearRange: "2000-2025",
    color: "#3B82F6",
    extractionG: 100,
  },
  {
    id: "dx-t600",
    brand: "Dexter",
    model: "T-600",
    type: "washer",
    category: "washers",
    capacity: "40lb",
    capacityLb: 40,
    cubicFeet: 6,
    height: 49.6875,
    width: 29.875,
    depth: 36,
    priceNew: 8000,
    priceRefurb: 5000,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 9,
    yearRange: "2000-2025",
    color: "#2563EB",
    notes: "Fits 36\" door",
  },
  {
    id: "dx-t1200",
    brand: "Dexter",
    model: "T-1200",
    type: "washer",
    category: "washers",
    capacity: "80lb",
    capacityLb: 80,
    cubicFeet: 11.5,
    height: 57.875,
    width: 34.375,
    depth: 45.375,
    priceNew: 12500,
    priceRefurb: 8000,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 40, drainSize: 2 },
    tpdContribution: 15,
    yearRange: "2000-2025",
    color: "#1E40AF",
    extractionG: 100,
  },

  // ============================================================================
  // DEXTER DRYERS
  // ============================================================================
  {
    id: "dx-t30-express",
    brand: "Dexter",
    model: "T-30 Express",
    type: "dryer",
    category: "dryers",
    capacity: "30lb",
    capacityLb: 30,
    height: 72.25,
    width: 34.5,
    depth: 50,
    priceNew: 5000,
    priceRefurb: 3000,
    utilities: { water: false, gas: true, gasType: "natural", electric: "120V", ventSize: 4 },
    tpdContribution: 8,
    yearRange: "2000-2025",
    color: "#0891B2",
  },
  {
    id: "dx-t50",
    brand: "Dexter",
    model: "T-50",
    type: "dryer",
    category: "dryers",
    capacity: "50lb",
    capacityLb: 50,
    cubicFeet: 15.8,
    height: 72.25,
    width: 34.5,
    depth: 50,
    priceNew: 6250,
    priceRefurb: 3800,
    utilities: { water: false, gas: true, gasType: "natural", electric: "120V", ventSize: 4 },
    tpdContribution: 10,
    yearRange: "2000-2025",
    color: "#0E7490",
  },

  // ============================================================================
  // ADC DRYERS
  // ============================================================================
  {
    id: "adc-ad30v",
    brand: "ADC",
    model: "AD-30V",
    type: "dryer",
    category: "dryers",
    capacity: "30lb",
    capacityLb: 30,
    cubicFeet: 9.5,
    height: 43,
    width: 34,
    depth: 30.3,
    priceNew: 4100,
    priceRefurb: 2400,
    utilities: { water: false, gas: true, gasType: "natural", electric: "120V", ventSize: 4 },
    tpdContribution: 8,
    yearRange: "2000-2025",
    color: "#F97316",
  },
  {
    id: "adc-ad50v",
    brand: "ADC",
    model: "AD-50V",
    type: "dryer",
    category: "dryers",
    capacity: "50lb",
    capacityLb: 50,
    cubicFeet: 18.3,
    height: 43,
    width: 34,
    depth: 36.3,
    priceNew: 5300,
    priceRefurb: 3100,
    utilities: { water: false, gas: true, gasType: "natural", electric: "120V", ventSize: 4 },
    tpdContribution: 10,
    yearRange: "2000-2025",
    color: "#EA580C",
  },
  {
    id: "adc-ad758v",
    brand: "ADC",
    model: "AD-758V",
    type: "dryer",
    category: "dryers",
    capacity: "75lb",
    capacityLb: 75,
    cubicFeet: 21.5,
    height: 56.3,
    width: 38.5,
    depth: 52.3,
    priceNew: 7200,
    priceRefurb: 4300,
    utilities: { water: false, gas: true, gasType: "natural", electric: "120V", ventSize: 6 },
    tpdContribution: 12,
    yearRange: "2000-2025",
    color: "#C2410C",
  },

  // ============================================================================
  // GE COMMERCIAL 2025
  // ============================================================================
  {
    id: "ge-vtw565",
    brand: "GE",
    model: "VTW565ASVWB",
    type: "washer",
    category: "washers",
    capacity: "12lb",
    capacityLb: 12,
    cubicFeet: 3.8,
    height: 42,
    width: 27,
    depth: 27,
    priceNew: 1650,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "120V", drainSize: 2 },
    tpdContribution: 6,
    yearRange: "2025",
    color: "#A21CAF",
    features: ["Multi-pay", "Cap touch controls", "App-ready"],
  },
  {
    id: "ge-gfw148",
    brand: "GE",
    model: "GFW148SSMWW",
    type: "washer",
    category: "washers",
    capacity: "18lb",
    capacityLb: 18,
    cubicFeet: 4.8,
    height: 39.8,
    width: 28,
    depth: 32,
    priceNew: 2400,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "120V", drainSize: 2 },
    tpdContribution: 7,
    yearRange: "2025",
    color: "#86198F",
    features: ["ENERGY STAR", "1200 RPM spin"],
  },

  // ============================================================================
  // ELECTROLUX
  // ============================================================================
  {
    id: "elx-w575h",
    brand: "Electrolux",
    model: "W575H",
    type: "washer",
    category: "washers",
    capacity: "18lb",
    capacityLb: 18,
    height: 44.5625,
    width: 28.375,
    depth: 28.375,
    priceNew: 10500,
    priceRefurb: 6500,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 8,
    yearRange: "2000-2025",
    color: "#7C3AED",
    extractionG: 450,
  },
  {
    id: "elx-w5130h",
    brand: "Electrolux",
    model: "W5130H",
    type: "washer",
    category: "washers",
    capacity: "30lb",
    capacityLb: 30,
    height: 52.75,
    width: 35.8125,
    depth: 32.3125,
    priceNew: 13000,
    priceRefurb: 8000,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 10,
    yearRange: "2000-2025",
    color: "#6D28D9",
    extractionG: 450,
  },
  {
    id: "elx-w5240h",
    brand: "Electrolux",
    model: "W5240H",
    type: "washer",
    category: "washers",
    capacity: "60lb",
    capacityLb: 60,
    height: 57.375,
    width: 43.3125,
    depth: 42.5,
    priceNew: 18000,
    priceRefurb: 11000,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 40, drainSize: 2 },
    tpdContribution: 12,
    yearRange: "2000-2025",
    color: "#5B21B6",
    extractionG: 450,
  },
  {
    id: "elx-t5300s",
    brand: "Electrolux",
    model: "T5300S Stack",
    type: "dryer",
    category: "dryers",
    capacity: "35lb x2",
    capacityLb: 70,
    height: 76.375,
    width: 31.125,
    depth: 43.875,
    priceNew: 8750,
    priceRefurb: 5500,
    utilities: { water: false, gas: true, gasType: "natural", electric: "120V", ventSize: 4 },
    tpdContribution: 14,
    yearRange: "2000-2025",
    color: "#8B5CF6",
  },

  // ============================================================================
  // CONTINENTAL GIRBAU
  // ============================================================================
  {
    id: "cg-eh040",
    brand: "Continental Girbau",
    model: "EH040",
    type: "washer",
    category: "washers",
    capacity: "40lb",
    capacityLb: 40,
    cubicFeet: 6.1,
    height: 61.6,
    width: 35.3,
    depth: 40,
    priceNew: 15000,
    priceRefurb: 9000,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 10,
    yearRange: "2000-2025",
    color: "#0D9488",
    extractionG: 200,
    notes: "OPL Softmount",
  },
  {
    id: "cg-rmg055",
    brand: "Continental Girbau",
    model: "RMG055",
    type: "washer",
    category: "washers",
    capacity: "55lb",
    capacityLb: 55,
    cubicFeet: 8,
    height: 63.9,
    width: 39.4,
    depth: 46.9,
    priceNew: 17000,
    priceRefurb: 10500,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 30, drainSize: 2 },
    tpdContribution: 12,
    yearRange: "2000-2025",
    color: "#0F766E",
  },

  // ============================================================================
  // UNIMAC
  // ============================================================================
  {
    id: "um-uwt045v4",
    brand: "UniMac",
    model: "UWT045V4",
    type: "washer",
    category: "washers",
    capacity: "45lb",
    capacityLb: 45,
    cubicFeet: 5.7,
    height: 56.25,
    width: 35.5,
    depth: 45.25,
    priceNew: 12500,
    priceRefurb: 7500,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 10,
    yearRange: "2000-2025",
    color: "#CA8A04",
    extractionG: 200,
  },
  {
    id: "um-uwt065v4",
    brand: "UniMac",
    model: "UWT065V4",
    type: "washer",
    category: "washers",
    capacity: "65lb",
    capacityLb: 65,
    cubicFeet: 8.5,
    height: 58.75,
    width: 39,
    depth: 50.5,
    priceNew: 14500,
    priceRefurb: 9000,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 30, drainSize: 2 },
    tpdContribution: 12,
    yearRange: "2000-2025",
    color: "#A16207",
  },
  {
    id: "um-ut055",
    brand: "UniMac",
    model: "UT055",
    type: "dryer",
    category: "dryers",
    capacity: "55lb",
    capacityLb: 55,
    cubicFeet: 18.3,
    height: 78.25,
    width: 38.5,
    depth: 52.25,
    priceNew: 7500,
    priceRefurb: 4500,
    utilities: { water: false, gas: true, gasType: "natural", electric: "120V", ventSize: 6 },
    tpdContribution: 11,
    yearRange: "2000-2025",
    color: "#854D0E",
  },

  // ============================================================================
  // HUEBSCH
  // ============================================================================
  {
    id: "hub-hc080",
    brand: "Huebsch",
    model: "HC080",
    type: "washer",
    category: "washers",
    capacity: "80lb",
    capacityLb: 80,
    height: 56.875,
    width: 41.5,
    depth: 52,
    priceNew: 12500,
    priceRefurb: 7500,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", amperage: 40, drainSize: 2 },
    tpdContribution: 14,
    yearRange: "2000-2025",
    color: "#16A34A",
  },
  {
    id: "hub-stack-30x2",
    brand: "Huebsch",
    model: "Stack Dryer 30x2",
    type: "dryer",
    category: "dryers",
    capacity: "30lb x2",
    capacityLb: 60,
    height: 76.25,
    width: 31.5,
    depth: 42.875,
    priceNew: 6750,
    priceRefurb: 4000,
    utilities: { water: false, gas: true, gasType: "natural", electric: "120V", ventSize: 4 },
    tpdContribution: 12,
    yearRange: "2000-2025",
    color: "#15803D",
  },

  // ============================================================================
  // MAYTAG COMMERCIAL
  // ============================================================================
  {
    id: "mtg-mfr25pd",
    brand: "Maytag",
    model: "MFR25PD",
    type: "washer",
    category: "washers",
    capacity: "25lb",
    capacityLb: 25,
    height: 44.88,
    width: 26,
    depth: 34.06,
    priceNew: 5500,
    priceRefurb: 3500,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 8,
    yearRange: "2000-2025",
    color: "#DC2626",
  },
  {
    id: "mtg-mfr40pd",
    brand: "Maytag",
    model: "MFR40PD",
    type: "washer",
    category: "washers",
    capacity: "40lb",
    capacityLb: 40,
    height: 51.77,
    width: 33.66,
    depth: 38.62,
    priceNew: 8500,
    priceRefurb: 5500,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 10,
    yearRange: "2000-2025",
    color: "#B91C1C",
  },

  // ============================================================================
  // IPSO
  // ============================================================================
  {
    id: "ipso-ilc98",
    brand: "IPSO",
    model: "ILC98",
    type: "washer",
    category: "washers",
    capacity: "21lb",
    capacityLb: 21,
    cubicFeet: 3.4,
    height: 44.1,
    width: 26.9,
    depth: 29.3,
    priceNew: 10000,
    priceRefurb: 6000,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "208V", drainSize: 2 },
    tpdContribution: 8,
    yearRange: "2000-2025",
    color: "#0284C7",
    extractionG: 200,
    notes: "Light commercial",
  },

  // ============================================================================
  // ANCILLARY - SOAP VENDING
  // ============================================================================
  {
    id: "vr-394",
    brand: "Vend-Rite",
    model: "394 3-Column",
    type: "vending",
    category: "services",
    capacity: "N/A",
    height: 37.8,
    width: 16.3,
    depth: 9.5,
    priceNew: 1050,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    roiMonthly: { min: 400, max: 800 },
    yearRange: "2020-2025",
    color: "#0EA5E9",
  },
  {
    id: "nat-4col",
    brand: "National",
    model: "4-Column Soap",
    type: "vending",
    category: "services",
    capacity: "N/A",
    height: 37.8,
    width: 21.3,
    depth: 9.5,
    priceNew: 1350,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    roiMonthly: { min: 600, max: 1200 },
    yearRange: "2020-2025",
    color: "#0369A1",
  },

  // ============================================================================
  // ANCILLARY - ATM
  // ============================================================================
  {
    id: "gm-onyx-w",
    brand: "Genmega",
    model: "Onyx-W Wall Mount",
    type: "atm",
    category: "financial",
    capacity: "N/A",
    height: 26.8,
    width: 19.7,
    depth: 10.4,
    priceNew: 2950,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    roiMonthly: { min: 800, max: 2000 },
    yearRange: "2020-2025",
    color: "#1F2937",
    notes: "Free placement option available",
  },
  {
    id: "hyo-2700t",
    brand: "Hyosung",
    model: "2700T",
    type: "atm",
    category: "financial",
    capacity: "N/A",
    height: 52,
    width: 16,
    depth: 18,
    priceNew: 2420,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    roiMonthly: { min: 600, max: 1500 },
    yearRange: "2015-2025",
    color: "#374151",
  },

  // ============================================================================
  // ANCILLARY - DOG WASH
  // ============================================================================
  {
    id: "ap-single",
    brand: "All Paws",
    model: "Single Station",
    type: "dogwash",
    category: "services",
    capacity: "N/A",
    height: 48,
    width: 81,
    depth: 70,
    priceNew: 12900,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "120V", drainSize: 2 },
    tpdContribution: 0,
    roiMonthly: { min: 1500, max: 4000 },
    yearRange: "2020-2025",
    color: "#22C55E",
    notes: "Installed price",
  },
  {
    id: "iclean-dw",
    brand: "iClean",
    model: "Dog Wash Station",
    type: "dogwash",
    category: "services",
    capacity: "N/A",
    height: 73,
    width: 81,
    depth: 35,
    priceNew: 14995,
    utilities: { water: true, waterHookups: { hot: true, cold: true }, gas: false, electric: "120V", drainSize: 2 },
    tpdContribution: 0,
    roiMonthly: { min: 1500, max: 4000 },
    yearRange: "2020-2025",
    color: "#16A34A",
  },

  // ============================================================================
  // ANCILLARY - COIN CHANGERS
  // ============================================================================
  {
    id: "ac-1005",
    brand: "American Changer",
    model: "AC1005 Rear-Load",
    type: "changer",
    category: "financial",
    capacity: "N/A",
    height: 36,
    width: 18,
    depth: 18,
    priceNew: 3200,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    yearRange: "2015-2025",
    color: "#FBBF24",
  },
  {
    id: "rowe-bc1200",
    brand: "Rowe",
    model: "BC-1200",
    type: "changer",
    category: "financial",
    capacity: "N/A",
    height: 36,
    width: 18,
    depth: 18,
    priceNew: 2400,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    yearRange: "2010-2025",
    color: "#F59E0B",
  },

  // ============================================================================
  // FURNITURE - FOLDING TABLES
  // ============================================================================
  {
    id: "som-72x30",
    brand: "Sol-O-Matic",
    model: "72x30 Fiberglass",
    type: "table",
    category: "furniture",
    capacity: "N/A",
    height: 30,
    width: 72,
    depth: 30,
    priceNew: 980,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    yearRange: "2020-2025",
    color: "#D6D3D1",
    notes: "Commercial grade fiberglass top",
  },
  {
    id: "som-48x30",
    brand: "Sol-O-Matic",
    model: "48x30 Fiberglass",
    type: "table",
    category: "furniture",
    capacity: "N/A",
    height: 30,
    width: 48,
    depth: 30,
    priceNew: 750,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    yearRange: "2020-2025",
    color: "#A8A29E",
  },
  {
    id: "som-96x30",
    brand: "Sol-O-Matic",
    model: "96x30 Fiberglass",
    type: "table",
    category: "furniture",
    capacity: "N/A",
    height: 30,
    width: 96,
    depth: 30,
    priceNew: 1150,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    yearRange: "2020-2025",
    color: "#E7E5E4",
  },

  // ============================================================================
  // LAUNDRY CARTS
  // ============================================================================
  {
    id: "cart-400lb",
    brand: "R&B Wire",
    model: "400lb Rolling Cart",
    type: "cart",
    category: "furniture",
    capacity: "400lb",
    capacityLb: 400,
    height: 48,
    width: 24,
    depth: 36,
    priceNew: 249,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    yearRange: "2020-2025",
    color: "#6B7280",
  },
  {
    id: "cart-600lb",
    brand: "R&B Wire",
    model: "600lb Heavy Duty",
    type: "cart",
    category: "furniture",
    capacity: "600lb",
    capacityLb: 600,
    height: 52,
    width: 30,
    depth: 42,
    priceNew: 349,
    utilities: { water: false, gas: false, electric: "120V" },
    tpdContribution: 0,
    yearRange: "2020-2025",
    color: "#4B5563",
  },
];

// Helper function to get equipment by brand
export function getEquipmentByBrand(brand: string): EquipmentSpec[] {
  return equipmentDatabase2025.filter(e => e.brand.toLowerCase() === brand.toLowerCase());
}

// Helper function to get equipment by type
export function getEquipmentByType(type: EquipmentSpec["type"]): EquipmentSpec[] {
  return equipmentDatabase2025.filter(e => e.type === type);
}

// Helper function to get equipment by capacity range
export function getEquipmentByCapacity(minLb: number, maxLb: number): EquipmentSpec[] {
  return equipmentDatabase2025.filter(e => 
    e.capacityLb && e.capacityLb >= minLb && e.capacityLb <= maxLb
  );
}

// Get all unique brands
export function getAllBrands(): string[] {
  return [...new Set(equipmentDatabase2025.map(e => e.brand))].sort();
}

// Calculate total equipment cost for a layout
export function calculateEquipmentCost(equipmentIds: string[], useRefurb: boolean = false): number {
  return equipmentIds.reduce((total, id) => {
    const equipment = equipmentDatabase2025.find(e => e.id === id);
    if (!equipment) return total;
    return total + (useRefurb && equipment.priceRefurb ? equipment.priceRefurb : equipment.priceNew);
  }, 0);
}

// Calculate monthly ancillary revenue
export function calculateAncillaryRevenue(equipmentIds: string[]): { min: number; max: number } {
  return equipmentIds.reduce((total, id) => {
    const equipment = equipmentDatabase2025.find(e => e.id === id);
    if (!equipment?.roiMonthly) return total;
    return {
      min: total.min + equipment.roiMonthly.min,
      max: total.max + equipment.roiMonthly.max,
    };
  }, { min: 0, max: 0 });
}

// Calculate utility requirements summary
export function calculateUtilityRequirements(equipmentIds: string[]): {
  totalWaterHookups: number;
  totalGasHookups: number;
  maxAmperage: number;
  requires208V: boolean;
  requires240V: boolean;
  totalDrains: number;
  totalVents: number;
} {
  const equipment = equipmentIds.map(id => equipmentDatabase2025.find(e => e.id === id)).filter(Boolean) as EquipmentSpec[];
  
  return {
    totalWaterHookups: equipment.filter(e => e.utilities.water).length,
    totalGasHookups: equipment.filter(e => e.utilities.gas).length,
    maxAmperage: Math.max(...equipment.map(e => e.utilities.amperage || 15)),
    requires208V: equipment.some(e => e.utilities.electric === "208V"),
    requires240V: equipment.some(e => e.utilities.electric === "240V"),
    totalDrains: equipment.filter(e => e.utilities.drainSize).length,
    totalVents: equipment.filter(e => e.utilities.ventSize).length,
  };
}

// Bathroom specifications for ADA compliance
export const bathroomSpecs = {
  singleUserADA: {
    name: "Single-User ADA",
    width: 60,
    depth: 60,
    turningSpace: 60,
    doorWidth: 32,
    sinkHeight: 34,
    toiletHeight: { min: 17, max: 19 },
    grabBars: { rear: 36, side: 42, height: { min: 33, max: 36 } },
    costNew: { min: 8000, max: 15000 },
  },
  multiUser2Stall: {
    name: "Multi-User (2 Stalls)",
    width: 120,
    depth: 100,
    adaStallWidth: 60,
    adaStallDepth: 56,
    costNew: { min: 15000, max: 25000 },
  },
  comboBathLaundry: {
    name: "Combo Bath-Laundry",
    width: 120,
    depth: 120,
    costNew: { min: 10000, max: 20000 },
    notes: "Saves $2k-$5k vs separate; includes stack W/D",
  },
};

// Startup cost estimates 2025
export const startupCosts2025 = {
  newBuild1500to2200: { min: 220000, max: 520000 },
  acquisitionRetool: { min: 140000, max: 320000 },
  simpleRefurb: { min: 45000, max: 160000 },
  avgFirstYearRevenue: { min: 180000, max: 380000 },
  avgProfitMarginYear1: { min: 0.32, max: 0.48 },
};

// Consulting fee menu 2025
export const consultingFees2025 = {
  feasibilityProForma: { min: 7500, max: 15000 },
  interactiveDesign3D: { min: 4000, max: 10000 },
  equipmentSourcingMarkup: { min: 0.12, max: 0.18 },
  turnkeyProjectMgmt: 0.10, // 10% of build
  retoolRoadmap: { min: 10000, max: 25000 },
  monthlyRetainer: { min: 2000, max: 5000 },
};
