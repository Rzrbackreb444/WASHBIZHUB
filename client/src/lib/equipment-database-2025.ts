/**
 * WashBizHub 2025 Equipment Database
 * Complete CAD-ready equipment catalog with dimensions, 3-tier pricing, and partner links
 */

// Partner Affiliate Links
export const PARTNER_LINKS = {
  aadvantage: "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry",
  atmDepot: "https://atmdepot.com/laundromat",
  preferredFunding: "https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/",
} as const;

// Pricing tier type
export interface PricingTier {
  new: number;
  refurb: number;
  used: number;
}

// Enhanced equipment item with CAD data
export interface EquipmentItem2025 {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: "washer" | "dryer" | "stack" | "combo" | "atm" | "changer" | "vending" | "dogwash" | "cart" | "table" | "seating" | "door" | "window" | "wall" | "bulkhead" | "column" | "restroom" | "utility" | "counter" | "accessory";
  category: "equipment" | "ancillary" | "architectural" | "furniture" | "utility";
  capacity: string;
  cuFt?: number;
  width: number;  // inches
  depth: number;  // inches
  height: number; // inches
  gForce?: number;
  pricing: PricingTier;
  tpdContribution: number;
  monthlyRevenue: number;
  color: string;
  yearRange: string;
  partnerLink?: string;
  notes?: string;
}

// Compliance rules
export const COMPLIANCE_RULES = {
  ada: {
    pathWidth: 36,           // Minimum 36" clear path
    turningRadius: 60,       // 60" turning radius in bathrooms
    machineReach: 30,        // 30" max reach for accessible machines
    frontClearance: 48,      // 48" front clearance for wheelchairs
    accessibleRatio: 0.67,   // 2/3 machines must be accessible
  },
  aisles: {
    minWidth: 36,            // Minimum 36" aisle width
    recommendedWidth: 48,    // Recommended 48" aisle width
    mainAisle: 60,           // Main traffic aisle 60"
  },
  venting: {
    ductDiameter: 4,         // 4" rigid metal duct
    rearClearance: 6,        // 6-12" rear clearance
    maxRearClearance: 12,
  },
  service: {
    rearAccess: 24,          // 24-36" rear service access
    maxRearAccess: 36,
    frontAccess: 48,         // 48" front access
  },
  parking: {
    spotsPerWasher: 0.5,     // 0.5 spots per washer
    adaRatio: 25,            // 1 ADA spot per 25 total
    carSpaceWidth: 96,       // 96" + 60" access aisle
    vanSpaceWidth: 132,      // 132" + 60" access aisle
  },
  fire: {
    extinguisherSpacing: 75, // Fire extinguisher every 75ft
  },
  layout: {
    machinePercent: 40,      // 40% machines
    aislePercent: 30,        // 30% aisles/circulation
    amenityPercent: 20,      // 20% amenities
    utilityPercent: 10,      // 10% utilities
  },
} as const;

// ============================================================================
// SPEED QUEEN EQUIPMENT
// ============================================================================
const speedQueenWashers: EquipmentItem2025[] = [
  {
    id: "sq-sc20",
    name: "Speed Queen SC20",
    brand: "Speed Queen",
    model: "SC20",
    type: "washer",
    category: "equipment",
    capacity: "20lb",
    width: 26,
    depth: 29.8,
    height: 42.9,
    pricing: { new: 5200, refurb: 3100, used: 2500 },
    tpdContribution: 7,
    monthlyRevenue: 450,
    color: "#1e40af",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "sq-sc30",
    name: "Speed Queen SC30",
    brand: "Speed Queen",
    model: "SC30",
    type: "washer",
    category: "equipment",
    capacity: "30lb",
    width: 29,
    depth: 34.8,
    height: 45.9,
    pricing: { new: 7100, refurb: 4200, used: 3500 },
    tpdContribution: 8,
    monthlyRevenue: 550,
    color: "#1e3a8a",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "sq-sc40",
    name: "Speed Queen SC40",
    brand: "Speed Queen",
    model: "SC40",
    type: "washer",
    category: "equipment",
    capacity: "40lb",
    width: 30.6,
    depth: 40.2,
    height: 47.9,
    pricing: { new: 8900, refurb: 5300, used: 4500 },
    tpdContribution: 9,
    monthlyRevenue: 700,
    color: "#1e3a8a",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "sq-sc60",
    name: "Speed Queen SC60",
    brand: "Speed Queen",
    model: "SC60",
    type: "washer",
    category: "equipment",
    capacity: "60lb",
    width: 34.1,
    depth: 42.9,
    height: 50.8,
    pricing: { new: 11800, refurb: 7100, used: 6000 },
    tpdContribution: 11,
    monthlyRevenue: 900,
    color: "#1e3a8a",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "sq-sc80",
    name: "Speed Queen SC80",
    brand: "Speed Queen",
    model: "SC80",
    type: "washer",
    category: "equipment",
    capacity: "80lb",
    width: 41.5,
    depth: 52,
    height: 56.9,
    pricing: { new: 14500, refurb: 9200, used: 7500 },
    tpdContribution: 14,
    monthlyRevenue: 1100,
    color: "#1e3a8a",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
];

const speedQueenDryers: EquipmentItem2025[] = [
  {
    id: "sq-stack-18x2",
    name: "Speed Queen Stack Dryer 18x2",
    brand: "Speed Queen",
    model: "Stack 18x2",
    type: "stack",
    category: "equipment",
    capacity: "18lb x2",
    width: 26.9,
    depth: 28,
    height: 76.6,
    pricing: { new: 4200, refurb: 2600, used: 2000 },
    tpdContribution: 12,
    monthlyRevenue: 600,
    color: "#b91c1c",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "sq-dr7",
    name: "Speed Queen DR7",
    brand: "Speed Queen",
    model: "DR7",
    type: "dryer",
    category: "equipment",
    capacity: "50lb",
    width: 28,
    depth: 28,
    height: 43,
    pricing: { new: 4800, refurb: 2900, used: 2300 },
    tpdContribution: 10,
    monthlyRevenue: 500,
    color: "#b91c1c",
    yearRange: "2010-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
];

// ============================================================================
// DEXTER X-SERIES (2025 HIGH-EFFICIENCY 350G)
// ============================================================================
const dexterWashers: EquipmentItem2025[] = [
  {
    id: "dexter-x350",
    name: "Dexter X-350",
    brand: "Dexter",
    model: "X-350",
    type: "washer",
    category: "equipment",
    capacity: "20lb",
    gForce: 350,
    width: 26,
    depth: 28,
    height: 43.9,
    pricing: { new: 6800, refurb: 4800, used: 3500 },
    tpdContribution: 8,
    monthlyRevenue: 500,
    color: "#3b82f6",
    yearRange: "2020-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
    notes: "High-Efficiency 350G, App-Ready",
  },
  {
    id: "dexter-x450",
    name: "Dexter X-450",
    brand: "Dexter",
    model: "X-450",
    type: "washer",
    category: "equipment",
    capacity: "30lb",
    gForce: 350,
    width: 29.9,
    depth: 27.4,
    height: 48.2,
    pricing: { new: 8900, refurb: 6200, used: 4500 },
    tpdContribution: 9,
    monthlyRevenue: 650,
    color: "#2563eb",
    yearRange: "2020-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
    notes: "High-Efficiency 350G, App-Ready",
  },
  {
    id: "dexter-x600",
    name: "Dexter X-600",
    brand: "Dexter",
    model: "X-600",
    type: "washer",
    category: "equipment",
    capacity: "40lb",
    gForce: 350,
    width: 29.9,
    depth: 36,
    height: 49.7,
    pricing: { new: 10500, refurb: 7300, used: 5500 },
    tpdContribution: 10,
    monthlyRevenue: 800,
    color: "#1d4ed8",
    yearRange: "2020-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
    notes: "High-Efficiency 350G, App-Ready",
  },
  {
    id: "dexter-x750",
    name: "Dexter X-750",
    brand: "Dexter",
    model: "X-750",
    type: "washer",
    category: "equipment",
    capacity: "50lb",
    gForce: 350,
    width: 34.5,
    depth: 40,
    height: 52.5,
    pricing: { new: 12800, refurb: 8900, used: 6500 },
    tpdContribution: 12,
    monthlyRevenue: 950,
    color: "#1e40af",
    yearRange: "2020-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
    notes: "High-Efficiency 350G, App-Ready",
  },
  {
    id: "dexter-x1200",
    name: "Dexter X-1200",
    brand: "Dexter",
    model: "X-1200",
    type: "washer",
    category: "equipment",
    capacity: "80lb",
    gForce: 350,
    width: 34.4,
    depth: 45.4,
    height: 57.9,
    pricing: { new: 16500, refurb: 11500, used: 8500 },
    tpdContribution: 15,
    monthlyRevenue: 1200,
    color: "#1e3a8a",
    yearRange: "2020-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
    notes: "High-Efficiency 350G, App-Ready",
  },
  {
    id: "dexter-t600",
    name: "Dexter T-600",
    brand: "Dexter",
    model: "T-600",
    type: "washer",
    category: "equipment",
    capacity: "40lb",
    cuFt: 6,
    width: 29.9,
    depth: 36,
    height: 49.7,
    pricing: { new: 8000, refurb: 5600, used: 4200 },
    tpdContribution: 9,
    monthlyRevenue: 700,
    color: "#2563eb",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "dexter-t1200",
    name: "Dexter T-1200",
    brand: "Dexter",
    model: "T-1200",
    type: "washer",
    category: "equipment",
    capacity: "80lb",
    cuFt: 11.5,
    gForce: 100,
    width: 34.4,
    depth: 45.4,
    height: 57.9,
    pricing: { new: 15000, refurb: 10500, used: 7500 },
    tpdContribution: 15,
    monthlyRevenue: 1100,
    color: "#1e40af",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
];

const dexterDryers: EquipmentItem2025[] = [
  {
    id: "dexter-t30",
    name: "Dexter T-30 Express",
    brand: "Dexter",
    model: "T-30",
    type: "dryer",
    category: "equipment",
    capacity: "30lb",
    width: 34.5,
    depth: 50,
    height: 72.25,
    pricing: { new: 5000, refurb: 3500, used: 2500 },
    tpdContribution: 8,
    monthlyRevenue: 400,
    color: "#0891b2",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "dexter-t50",
    name: "Dexter T-50",
    brand: "Dexter",
    model: "T-50",
    type: "dryer",
    category: "equipment",
    capacity: "50lb",
    cuFt: 15.8,
    width: 34.5,
    depth: 50,
    height: 72.25,
    pricing: { new: 6500, refurb: 4500, used: 3500 },
    tpdContribution: 10,
    monthlyRevenue: 550,
    color: "#0e7490",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
];

const dexterStacks: EquipmentItem2025[] = [
  {
    id: "dexter-x350-combo",
    name: "Dexter X-350 Combo Stack",
    brand: "Dexter",
    model: "X-350 Stack",
    type: "combo",
    category: "equipment",
    capacity: "20lb W / 20lb D",
    width: 27,
    depth: 44.6,
    height: 74.8,
    pricing: { new: 9800, refurb: 6800, used: 5000 },
    tpdContribution: 14,
    monthlyRevenue: 750,
    color: "#1d4ed8",
    yearRange: "2020-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
    notes: "High-Efficiency Combo Stack",
  },
  {
    id: "dexter-t350-express",
    name: "Dexter T-350 Express Stack",
    brand: "Dexter",
    model: "T-350 Express",
    type: "combo",
    category: "equipment",
    capacity: "20lb W / 20lb D",
    cuFt: 2.7,
    gForce: 200,
    width: 27,
    depth: 44.6,
    height: 74.75,
    pricing: { new: 7500, refurb: 5200, used: 4000 },
    tpdContribution: 12,
    monthlyRevenue: 650,
    color: "#2563eb",
    yearRange: "2010-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "dexter-t450-express",
    name: "Dexter T-450 Express Stack",
    brand: "Dexter",
    model: "T-450 Express",
    type: "combo",
    category: "equipment",
    capacity: "30lb W / 30lb D",
    cuFt: 4,
    width: 31.5,
    depth: 49.4,
    height: 78.4,
    pricing: { new: 8500, refurb: 5900, used: 4500 },
    tpdContribution: 14,
    monthlyRevenue: 800,
    color: "#1e40af",
    yearRange: "2010-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "dexter-t750-express",
    name: "Dexter T-750 Express Stack",
    brand: "Dexter",
    model: "T-750 Express",
    type: "combo",
    category: "equipment",
    capacity: "50lb W / 50lb D",
    cuFt: 6.5,
    width: 34.5,
    depth: 54.6,
    height: 87.2,
    pricing: { new: 11000, refurb: 7700, used: 5800 },
    tpdContribution: 16,
    monthlyRevenue: 1000,
    color: "#1e3a8a",
    yearRange: "2010-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
];

// ============================================================================
// ADC DRYERS
// ============================================================================
const adcDryers: EquipmentItem2025[] = [
  {
    id: "adc-ad30v",
    name: "ADC AD-30V",
    brand: "ADC",
    model: "AD-30V",
    type: "dryer",
    category: "equipment",
    capacity: "30lb",
    cuFt: 9.5,
    width: 34,
    depth: 30.3,
    height: 43,
    pricing: { new: 4100, refurb: 2400, used: 1800 },
    tpdContribution: 7,
    monthlyRevenue: 350,
    color: "#f97316",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
    notes: "Lowest repair rate in industry",
  },
  {
    id: "adc-ad50v",
    name: "ADC AD-50V",
    brand: "ADC",
    model: "AD-50V",
    type: "dryer",
    category: "equipment",
    capacity: "50lb",
    cuFt: 18.3,
    width: 34,
    depth: 36.3,
    height: 43,
    pricing: { new: 5300, refurb: 3100, used: 2500 },
    tpdContribution: 9,
    monthlyRevenue: 480,
    color: "#ea580c",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
    notes: "Lowest repair rate in industry",
  },
  {
    id: "adc-ad758v",
    name: "ADC AD-758V",
    brand: "ADC",
    model: "AD-758V",
    type: "dryer",
    category: "equipment",
    capacity: "75lb",
    cuFt: 21.5,
    width: 38.5,
    depth: 52.3,
    height: 56.3,
    pricing: { new: 7200, refurb: 4300, used: 3500 },
    tpdContribution: 12,
    monthlyRevenue: 650,
    color: "#c2410c",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
    notes: "Lowest repair rate in industry",
  },
];

// ============================================================================
// ELECTROLUX
// ============================================================================
const electroluxWashers: EquipmentItem2025[] = [
  {
    id: "elux-w575h",
    name: "Electrolux W575H",
    brand: "Electrolux",
    model: "W575H",
    type: "washer",
    category: "equipment",
    capacity: "18lb",
    gForce: 450,
    width: 28.4,
    depth: 28.4,
    height: 44.6,
    pricing: { new: 10500, refurb: 6500, used: 5000 },
    tpdContribution: 7,
    monthlyRevenue: 450,
    color: "#7c3aed",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "elux-w5105h",
    name: "Electrolux W5105H",
    brand: "Electrolux",
    model: "W5105H",
    type: "washer",
    category: "equipment",
    capacity: "25lb",
    gForce: 450,
    width: 32.7,
    depth: 29.8,
    height: 47.7,
    pricing: { new: 12000, refurb: 7500, used: 6000 },
    tpdContribution: 8,
    monthlyRevenue: 550,
    color: "#6d28d9",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
  {
    id: "elux-w5130h",
    name: "Electrolux W5130H",
    brand: "Electrolux",
    model: "W5130H",
    type: "washer",
    category: "equipment",
    capacity: "30lb",
    gForce: 450,
    width: 35.8,
    depth: 32.3,
    height: 52.75,
    pricing: { new: 13000, refurb: 8100, used: 6500 },
    tpdContribution: 9,
    monthlyRevenue: 650,
    color: "#5b21b6",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
];

// ============================================================================
// CONTINENTAL GIRBAU
// ============================================================================
const girbauWashers: EquipmentItem2025[] = [
  {
    id: "girbau-eh040",
    name: "Continental Girbau EH040",
    brand: "Continental Girbau",
    model: "EH040",
    type: "washer",
    category: "equipment",
    capacity: "40lb",
    cuFt: 6.1,
    gForce: 200,
    width: 35.3,
    depth: 40,
    height: 61.6,
    pricing: { new: 15000, refurb: 9000, used: 7500 },
    tpdContribution: 10,
    monthlyRevenue: 750,
    color: "#0d9488",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
];

// ============================================================================
// UNIMAC
// ============================================================================
const unimacWashers: EquipmentItem2025[] = [
  {
    id: "unimac-uwt045v4",
    name: "UniMac UWT045V4",
    brand: "UniMac",
    model: "UWT045V4",
    type: "washer",
    category: "equipment",
    capacity: "45lb",
    cuFt: 5.7,
    gForce: 200,
    width: 35.5,
    depth: 45.3,
    height: 56.3,
    pricing: { new: 12500, refurb: 7500, used: 6000 },
    tpdContribution: 10,
    monthlyRevenue: 700,
    color: "#ca8a04",
    yearRange: "2000-2025",
    partnerLink: PARTNER_LINKS.aadvantage,
  },
];

// ============================================================================
// ANCILLARIES - CARTS
// ============================================================================
const carts: EquipmentItem2025[] = [
  {
    id: "rb-100e",
    name: "R&B Wire Standard 100E",
    brand: "R&B Wire",
    model: "100E",
    type: "cart",
    category: "ancillary",
    capacity: "2.5 bu",
    width: 22,
    depth: 27,
    height: 26.5,
    pricing: { new: 197, refurb: 150, used: 120 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#6b7280",
    yearRange: "2020-2025",
  },
  {
    id: "rb-double-pole",
    name: "R&B Wire Double Pole Rack",
    brand: "R&B Wire",
    model: "Double Pole",
    type: "cart",
    category: "ancillary",
    capacity: "2.5 bu",
    width: 22,
    depth: 27,
    height: 26.5,
    pricing: { new: 300, refurb: 220, used: 180 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#4b5563",
    yearRange: "2020-2025",
  },
  {
    id: "temcreat-400l",
    name: "TEMCREAT Industrial 400L",
    brand: "TEMCREAT",
    model: "400L",
    type: "cart",
    category: "ancillary",
    capacity: "400L",
    width: 30,
    depth: 42,
    height: 36,
    pricing: { new: 400, refurb: 300, used: 250 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#374151",
    yearRange: "2020-2025",
  },
];

// ============================================================================
// ANCILLARIES - TABLES
// ============================================================================
const tables: EquipmentItem2025[] = [
  {
    id: "solomatic-tfd306",
    name: "Sol-O-Matic TFD-306",
    brand: "Sol-O-Matic",
    model: "TFD-306",
    type: "table",
    category: "furniture",
    capacity: "N/A",
    width: 72,
    depth: 30,
    height: 34,
    pricing: { new: 980, refurb: 750, used: 600 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#a8a29e",
    yearRange: "2020-2025",
  },
  {
    id: "solomatic-tfd305",
    name: "Sol-O-Matic TFD-305 w/Shelf",
    brand: "Sol-O-Matic",
    model: "TFD-305",
    type: "table",
    category: "furniture",
    capacity: "N/A",
    width: 72,
    depth: 30,
    height: 34,
    pricing: { new: 1400, refurb: 1100, used: 850 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#d6d3d1",
    yearRange: "2020-2025",
    notes: "Includes 60x12x16 shelf",
  },
];

// ============================================================================
// ANCILLARIES - SEATING
// ============================================================================
const seating: EquipmentItem2025[] = [
  {
    id: "solomatic-cmd3",
    name: "Sol-O-Matic CMD-3 (3 seats)",
    brand: "Sol-O-Matic",
    model: "CMD-3",
    type: "seating",
    category: "furniture",
    capacity: "3 seats",
    width: 61,
    depth: 18,
    height: 34,
    pricing: { new: 600, refurb: 450, used: 350 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#78716c",
    yearRange: "2020-2025",
  },
  {
    id: "solomatic-cmd5",
    name: "Sol-O-Matic CMD-DS-5 (5 seats)",
    brand: "Sol-O-Matic",
    model: "CMD-DS-5",
    type: "seating",
    category: "furniture",
    capacity: "5 seats",
    width: 103,
    depth: 18,
    height: 34,
    pricing: { new: 900, refurb: 700, used: 550 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#57534e",
    yearRange: "2020-2025",
  },
  {
    id: "sterling-bench",
    name: "Sterling Heavyweight Bench",
    brand: "Sterling",
    model: "Heavyweight 3-Seat",
    type: "seating",
    category: "furniture",
    capacity: "3 seats",
    width: 72,
    depth: 18,
    height: 18,
    pricing: { new: 700, refurb: 550, used: 400 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#44403c",
    yearRange: "2020-2025",
  },
];

// ============================================================================
// ANCILLARIES - VENDING
// ============================================================================
const vending: EquipmentItem2025[] = [
  {
    id: "vendrite-394",
    name: "Vend-Rite 394 3-Column",
    brand: "Vend-Rite",
    model: "394",
    type: "vending",
    category: "ancillary",
    capacity: "3 columns",
    width: 16.3,
    depth: 9.5,
    height: 37.8,
    pricing: { new: 1200, refurb: 900, used: 700 },
    tpdContribution: 0,
    monthlyRevenue: 150,
    color: "#0ea5e9",
    yearRange: "2020-2025",
    notes: "Soap/detergent vending",
  },
  {
    id: "national-4fl92x",
    name: "National 4FL92X",
    brand: "National",
    model: "4FL92X",
    type: "vending",
    category: "ancillary",
    capacity: "4 columns",
    width: 21.3,
    depth: 9.5,
    height: 37.8,
    pricing: { new: 1500, refurb: 1200, used: 900 },
    tpdContribution: 0,
    monthlyRevenue: 200,
    color: "#0284c7",
    yearRange: "2020-2025",
  },
  {
    id: "vendingcom-20",
    name: "Vending.com 20-Select",
    brand: "Vending.com",
    model: "20-Select",
    type: "vending",
    category: "ancillary",
    capacity: "20 selections",
    width: 29.3,
    depth: 34.75,
    height: 72,
    pricing: { new: 4000, refurb: 3200, used: 2400 },
    tpdContribution: 0,
    monthlyRevenue: 400,
    color: "#0369a1",
    yearRange: "2020-2025",
    notes: "Snack/beverage combo",
  },
];

// ============================================================================
// ANCILLARIES - CHANGERS
// ============================================================================
const changers: EquipmentItem2025[] = [
  {
    id: "american-ac1005",
    name: "American AC1005 Rear Load",
    brand: "American Changer",
    model: "AC1005",
    type: "changer",
    category: "ancillary",
    capacity: "N/A",
    width: 15,
    depth: 16.5,
    height: 31.5,
    pricing: { new: 3500, refurb: 2800, used: 2100 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#fbbf24",
    yearRange: "2020-2025",
  },
  {
    id: "rowe-bc1200",
    name: "Rowe BC-1200",
    brand: "Rowe",
    model: "BC-1200",
    type: "changer",
    category: "ancillary",
    capacity: "N/A",
    width: 15,
    depth: 17,
    height: 32,
    pricing: { new: 2800, refurb: 2200, used: 1700 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#f59e0b",
    yearRange: "2020-2025",
  },
];

// ============================================================================
// ANCILLARIES - ATMs
// ============================================================================
const atms: EquipmentItem2025[] = [
  {
    id: "genmega-onyxw",
    name: "Genmega Onyx-W Wall Mount",
    brand: "Genmega",
    model: "Onyx-W",
    type: "atm",
    category: "ancillary",
    capacity: "N/A",
    width: 19.7,
    depth: 10.4,
    height: 26.8,
    pricing: { new: 3200, refurb: 2500, used: 1900 },
    tpdContribution: 0,
    monthlyRevenue: 1500,
    color: "#1f2937",
    yearRange: "2020-2025",
    partnerLink: PARTNER_LINKS.atmDepot,
    notes: "Free placement available via ATMDepot.com",
  },
  {
    id: "hyosung-halo2",
    name: "Hyosung Halo II",
    brand: "Hyosung",
    model: "Halo II",
    type: "atm",
    category: "ancillary",
    capacity: "N/A",
    width: 15.7,
    depth: 23.4,
    height: 54.2,
    pricing: { new: 3000, refurb: 2400, used: 1800 },
    tpdContribution: 0,
    monthlyRevenue: 1200,
    color: "#111827",
    yearRange: "2020-2025",
    partnerLink: PARTNER_LINKS.atmDepot,
  },
];

// ============================================================================
// ANCILLARIES - DOG WASHES
// ============================================================================
const dogWashes: EquipmentItem2025[] = [
  {
    id: "allpaws-apwass",
    name: "All Paws APW-A-SS",
    brand: "All Paws",
    model: "APW-A-SS",
    type: "dogwash",
    category: "ancillary",
    capacity: "N/A",
    width: 70,
    depth: 81,
    height: 72,
    pricing: { new: 15000, refurb: 12000, used: 9000 },
    tpdContribution: 0,
    monthlyRevenue: 2500,
    color: "#22c55e",
    yearRange: "2020-2025",
    notes: "Revenue: $1,500-4,000/mo",
  },
  {
    id: "evolution-dogwash",
    name: "Evolution Dog Wash",
    brand: "Evolution",
    model: "Standard",
    type: "dogwash",
    category: "ancillary",
    capacity: "N/A",
    width: 74.6,
    depth: 27.7,
    height: 79.5,
    pricing: { new: 18000, refurb: 14000, used: 11000 },
    tpdContribution: 0,
    monthlyRevenue: 3000,
    color: "#16a34a",
    yearRange: "2020-2025",
  },
  {
    id: "iclean-tub",
    name: "iClean Dog Wash Tub",
    brand: "iClean",
    model: "Tub",
    type: "dogwash",
    category: "ancillary",
    capacity: "N/A",
    width: 55.1,
    depth: 21.7,
    height: 48,
    pricing: { new: 12000, refurb: 9000, used: 7000 },
    tpdContribution: 0,
    monthlyRevenue: 2000,
    color: "#15803d",
    yearRange: "2020-2025",
  },
];

// ============================================================================
// ARCHITECTURAL - BULKHEADS
// ============================================================================
const bulkheads: EquipmentItem2025[] = [
  {
    id: "bulkhead-4ft",
    name: "Bulkhead (4ft)",
    brand: "Custom",
    model: "4ft",
    type: "bulkhead",
    category: "architectural",
    capacity: "N/A",
    width: 48,
    depth: 24,
    height: 12,
    pricing: { new: 200, refurb: 150, used: 100 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#e5e7eb",
    yearRange: "2020-2025",
    notes: "Houses ductwork, signage, lighting",
  },
  {
    id: "bulkhead-6ft",
    name: "Bulkhead (6ft)",
    brand: "Custom",
    model: "6ft",
    type: "bulkhead",
    category: "architectural",
    capacity: "N/A",
    width: 72,
    depth: 24,
    height: 12,
    pricing: { new: 280, refurb: 210, used: 140 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#d1d5db",
    yearRange: "2020-2025",
    notes: "Houses ductwork, signage, lighting",
  },
  {
    id: "bulkhead-8ft",
    name: "Bulkhead (8ft)",
    brand: "Custom",
    model: "8ft",
    type: "bulkhead",
    category: "architectural",
    capacity: "N/A",
    width: 96,
    depth: 24,
    height: 12,
    pricing: { new: 350, refurb: 260, used: 175 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#9ca3af",
    yearRange: "2020-2025",
    notes: "Houses ductwork, signage, lighting",
  },
  {
    id: "bulkhead-10ft",
    name: "Bulkhead (10ft)",
    brand: "Custom",
    model: "10ft",
    type: "bulkhead",
    category: "architectural",
    capacity: "N/A",
    width: 120,
    depth: 24,
    height: 12,
    pricing: { new: 420, refurb: 315, used: 210 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#6b7280",
    yearRange: "2020-2025",
    notes: "Houses ductwork, signage, lighting",
  },
  {
    id: "bulkhead-12ft",
    name: "Bulkhead (12ft)",
    brand: "Custom",
    model: "12ft",
    type: "bulkhead",
    category: "architectural",
    capacity: "N/A",
    width: 144,
    depth: 24,
    height: 12,
    pricing: { new: 500, refurb: 375, used: 250 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#4b5563",
    yearRange: "2020-2025",
    notes: "Houses ductwork, signage, lighting",
  },
];

// ============================================================================
// ARCHITECTURAL - WALLS
// ============================================================================
const walls: EquipmentItem2025[] = [
  {
    id: "wall-8ft",
    name: "Interior Wall (8ft)",
    brand: "Custom",
    model: "8ft",
    type: "wall",
    category: "architectural",
    capacity: "N/A",
    width: 96,
    depth: 6,
    height: 96,
    pricing: { new: 800, refurb: 600, used: 400 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#d1d5db",
    yearRange: "2020-2025",
  },
  {
    id: "wall-10ft",
    name: "Interior Wall (10ft)",
    brand: "Custom",
    model: "10ft",
    type: "wall",
    category: "architectural",
    capacity: "N/A",
    width: 120,
    depth: 6,
    height: 96,
    pricing: { new: 1000, refurb: 750, used: 500 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#d1d5db",
    yearRange: "2020-2025",
  },
  {
    id: "wall-12ft",
    name: "Interior Wall (12ft)",
    brand: "Custom",
    model: "12ft",
    type: "wall",
    category: "architectural",
    capacity: "N/A",
    width: 144,
    depth: 6,
    height: 96,
    pricing: { new: 1200, refurb: 900, used: 600 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#d1d5db",
    yearRange: "2020-2025",
  },
];

// ============================================================================
// ARCHITECTURAL - DOORS & WINDOWS
// ============================================================================
const doorsAndWindows: EquipmentItem2025[] = [
  {
    id: "door-entry-single",
    name: "Entry Door (Single)",
    brand: "Commercial",
    model: "36in",
    type: "door",
    category: "architectural",
    capacity: "N/A",
    width: 36,
    depth: 4,
    height: 84,
    pricing: { new: 800, refurb: 600, used: 400 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#8b4513",
    yearRange: "2020-2025",
  },
  {
    id: "door-entry-double",
    name: "Entry Door (Double)",
    brand: "Commercial",
    model: "72in",
    type: "door",
    category: "architectural",
    capacity: "N/A",
    width: 72,
    depth: 4,
    height: 84,
    pricing: { new: 1500, refurb: 1100, used: 750 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#a0522d",
    yearRange: "2020-2025",
  },
  {
    id: "door-emergency",
    name: "Emergency Exit Door",
    brand: "Commercial",
    model: "Emergency",
    type: "door",
    category: "architectural",
    capacity: "N/A",
    width: 36,
    depth: 4,
    height: 84,
    pricing: { new: 1200, refurb: 900, used: 600 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#dc2626",
    yearRange: "2020-2025",
  },
  {
    id: "window-storefront",
    name: "Storefront Window (8ft)",
    brand: "Commercial",
    model: "Storefront",
    type: "window",
    category: "architectural",
    capacity: "N/A",
    width: 96,
    depth: 4,
    height: 72,
    pricing: { new: 1200, refurb: 900, used: 600 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#87ceeb",
    yearRange: "2020-2025",
  },
];

// ============================================================================
// UTILITY - RESTROOMS
// ============================================================================
const utilityRooms: EquipmentItem2025[] = [
  {
    id: "restroom-ada",
    name: "ADA Restroom",
    brand: "Custom",
    model: "ADA Compliant",
    type: "restroom",
    category: "utility",
    capacity: "N/A",
    width: 84,
    depth: 72,
    height: 96,
    pricing: { new: 8000, refurb: 6000, used: 4000 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#4b5563",
    yearRange: "2020-2025",
    notes: "60x60 turning radius required",
  },
  {
    id: "restroom-single",
    name: "Single Restroom",
    brand: "Custom",
    model: "Standard",
    type: "restroom",
    category: "utility",
    capacity: "N/A",
    width: 60,
    depth: 60,
    height: 96,
    pricing: { new: 5000, refurb: 3750, used: 2500 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#6b7280",
    yearRange: "2020-2025",
  },
];

// ============================================================================
// COUNTERS
// ============================================================================
const counters: EquipmentItem2025[] = [
  {
    id: "counter-wdf-8ft",
    name: "WDF Counter (8ft)",
    brand: "Custom",
    model: "WDF 8ft",
    type: "counter",
    category: "furniture",
    capacity: "N/A",
    width: 96,
    depth: 24,
    height: 36,
    pricing: { new: 1200, refurb: 900, used: 600 },
    tpdContribution: 0,
    monthlyRevenue: 800,
    color: "#a8a29e",
    yearRange: "2020-2025",
    notes: "Wash-Dry-Fold area, 40-50% margins",
  },
  {
    id: "counter-wdf-12ft",
    name: "WDF Counter (12ft)",
    brand: "Custom",
    model: "WDF 12ft",
    type: "counter",
    category: "furniture",
    capacity: "N/A",
    width: 144,
    depth: 24,
    height: 36,
    pricing: { new: 1800, refurb: 1350, used: 900 },
    tpdContribution: 0,
    monthlyRevenue: 1200,
    color: "#78716c",
    yearRange: "2020-2025",
    notes: "Wash-Dry-Fold area, 40-50% margins",
  },
  {
    id: "counter-checkout",
    name: "Checkout Counter",
    brand: "Custom",
    model: "Checkout",
    type: "counter",
    category: "furniture",
    capacity: "N/A",
    width: 48,
    depth: 24,
    height: 36,
    pricing: { new: 800, refurb: 600, used: 400 },
    tpdContribution: 0,
    monthlyRevenue: 0,
    color: "#57534e",
    yearRange: "2020-2025",
  },
];

// ============================================================================
// MASTER EQUIPMENT DATABASE
// ============================================================================
export const EQUIPMENT_DATABASE_2025: EquipmentItem2025[] = [
  // Washers
  ...speedQueenWashers,
  ...dexterWashers,
  ...electroluxWashers,
  ...girbauWashers,
  ...unimacWashers,
  // Dryers
  ...speedQueenDryers,
  ...dexterDryers,
  ...adcDryers,
  // Stacks & Combos
  ...dexterStacks,
  // Ancillaries
  ...carts,
  ...tables,
  ...seating,
  ...vending,
  ...changers,
  ...atms,
  ...dogWashes,
  // Architectural
  ...bulkheads,
  ...walls,
  ...doorsAndWindows,
  // Utility
  ...utilityRooms,
  ...counters,
];

// Helper functions
export function getEquipmentByType(type: EquipmentItem2025["type"]): EquipmentItem2025[] {
  return EQUIPMENT_DATABASE_2025.filter(item => item.type === type);
}

export function getEquipmentByCategory(category: EquipmentItem2025["category"]): EquipmentItem2025[] {
  return EQUIPMENT_DATABASE_2025.filter(item => item.category === category);
}

export function getEquipmentByBrand(brand: string): EquipmentItem2025[] {
  return EQUIPMENT_DATABASE_2025.filter(item => item.brand.toLowerCase() === brand.toLowerCase());
}

export function calculateTotalCost(items: { id: string; quantity: number; pricingTier: keyof PricingTier }[]): number {
  return items.reduce((total, item) => {
    const equipment = EQUIPMENT_DATABASE_2025.find(e => e.id === item.id);
    if (equipment) {
      return total + (equipment.pricing[item.pricingTier] * item.quantity);
    }
    return total;
  }, 0);
}

export function calculateMonthlyRevenue(items: { id: string; quantity: number }[]): number {
  return items.reduce((total, item) => {
    const equipment = EQUIPMENT_DATABASE_2025.find(e => e.id === item.id);
    if (equipment) {
      return total + (equipment.monthlyRevenue * item.quantity);
    }
    return total;
  }, 0);
}

export function calculateTotalTPD(items: { id: string; quantity: number }[]): number {
  return items.reduce((total, item) => {
    const equipment = EQUIPMENT_DATABASE_2025.find(e => e.id === item.id);
    if (equipment) {
      return total + (equipment.tpdContribution * item.quantity);
    }
    return total;
  }, 0);
}

// Equipment categories for UI
export const EQUIPMENT_CATEGORIES = [
  { id: "washers", label: "Washers", types: ["washer"] },
  { id: "dryers", label: "Dryers", types: ["dryer", "stack"] },
  { id: "combos", label: "Stacks & Combos", types: ["combo"] },
  { id: "ancillary", label: "Ancillaries", types: ["atm", "changer", "vending", "dogwash", "cart"] },
  { id: "furniture", label: "Furniture", types: ["table", "seating", "counter"] },
  { id: "architectural", label: "Architectural", types: ["door", "window", "wall", "bulkhead", "column"] },
  { id: "utility", label: "Utility Rooms", types: ["restroom", "utility"] },
] as const;

// Brand list for filtering
export const EQUIPMENT_BRANDS = [
  "Speed Queen",
  "Dexter",
  "ADC",
  "Electrolux",
  "Continental Girbau",
  "UniMac",
  "Maytag",
  "Huebsch",
  "IPSO",
  "Whirlpool",
  "Tolon",
  "Jensen",
  "Yamamoto",
  "Milnor",
] as const;
