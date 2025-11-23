/**
 * Scalable Parts Data Generator
 * Template-based system for generating 500+ quality parts across all brands
 */

interface PartTemplate {
  name: string;
  partNumberSuffix: string;
  priceRange: [number, number];
  category: string;
  descriptionTemplate: string;
  compatibilityPattern: string[];
}

interface BrandConfig {
  name: string;
  partNumberPrefix: string;
  modelSeries: string[];
}

// Brand configurations with model series
export const BRAND_CONFIGS: Record<string, BrandConfig> = {
  SPEED_QUEEN: {
    name: "Speed Queen",
    partNumberPrefix: "SQ",
    modelSeries: ["SC18", "SC20", "SC30", "SC40", "SC60", "SC80", "SD18", "SD20", "SD30", "SD40", "AWN432", "AWN542"],
  },
  MAYTAG: {
    name: "Maytag Commercial",
    partNumberPrefix: "MAY",
    modelSeries: ["MAH21", "MAH23", "MAH27", "MAH31", "MDG18", "MDG20", "MDG22", "MDG28", "MVW", "MHW"],
  },
  DEXTER: {
    name: "Dexter Laundry",
    partNumberPrefix: "DEX",
    modelSeries: ["T300", "T400", "T600", "T900", "T1200", "DX3", "DX4", "DX5"],
  },
  HUEBSCH: {
    name: "Huebsch",
    partNumberPrefix: "HUE",
    modelSeries: ["HC18", "HC20", "HC27", "HC30", "HC40", "HC60", "HD18", "HD20", "HD30"],
  },
  CONTINENTAL: {
    name: "Continental Girbau",
    partNumberPrefix: "CG",
    modelSeries: ["EH020", "EH030", "EH040", "EH055", "EH070", "ED030", "ED050", "ED070"],
  },
  ELECTROLUX: {
    name: "Electrolux Professional",
    partNumberPrefix: "ELX",
    modelSeries: ["W4105", "W4130", "W4180", "W4240", "T4190", "T4300", "T4350", "T4450"],
  },
  WHIRLPOOL: {
    name: "Whirlpool Commercial",
    partNumberPrefix: "WP",
    modelSeries: ["CAE2743", "CAE2763", "CEM2743", "CEM2763", "CGD9050", "CGD9160"],
  },
  ALLIANCE: {
    name: "Alliance Laundry Systems",
    partNumberPrefix: "ALS",
    modelSeries: ["LR18", "LR20", "LR30", "DR18", "DR20", "DR30"],
  },
  LG: {
    name: "LG Commercial",
    partNumberPrefix: "LGC",
    modelSeries: ["WM3488", "WM3499", "WM3550", "WM3670", "DLE3488", "DLE3499", "DLE3670"],
  },
  SAMSUNG: {
    name: "Samsung Commercial",
    partNumberPrefix: "SAM",
    modelSeries: ["WF45", "WF50", "WF56", "DV45", "DV50", "DV56"],
  },
  UNIMAC: {
    name: "UniMac",
    partNumberPrefix: "UNI",
    modelSeries: ["UT018", "UT030", "UT055", "UD018", "UD030", "UD050"],
  },
  PRIMUS: {
    name: "Primus Laundry",
    partNumberPrefix: "PRI",
    modelSeries: ["FX65", "FX105", "FX135", "FX180", "T9", "T11", "T13", "T16"],
  },
};

// Part templates for each category
export const PART_TEMPLATES: Record<string, PartTemplate[]> = {
  WASHER_MOTORS: [
    {
      name: "1/3 HP Washer Motor",
      partNumberSuffix: "MTR-W33",
      priceRange: [225, 275],
      category: "Washer Motors",
      descriptionTemplate: "1/3 HP commercial washer motor for {BRAND}. 120V, 60Hz. Direct drive design.",
      compatibilityPattern: ["SMALL_MODELS"],
    },
    {
      name: "1/2 HP Washer Motor",
      partNumberSuffix: "MTR-W50",
      priceRange: [275, 325],
      category: "Washer Motors",
      descriptionTemplate: "1/2 HP motor for {BRAND} front-load washers. Heavy-duty commercial grade.",
      compatibilityPattern: ["MEDIUM_MODELS"],
    },
    {
      name: "3/4 HP Washer Motor - Heavy Duty",
      partNumberSuffix: "MTR-W75",
      priceRange: [350, 425],
      category: "Washer Motors",
      descriptionTemplate: "3/4 HP heavy-duty motor for large {BRAND} washers. Extended warranty.",
      compatibilityPattern: ["LARGE_MODELS"],
    },
    {
      name: "1 HP Washer Motor - Industrial",
      partNumberSuffix: "MTR-W100",
      priceRange: [425, 525],
      category: "Washer Motors",
      descriptionTemplate: "1 HP industrial motor for {BRAND} high-capacity washers. Maximum reliability.",
      compatibilityPattern: ["XLARGE_MODELS"],
    },
  ],
  WASHER_BELTS: [
    {
      name: "Drive Belt - 88 inch",
      partNumberSuffix: "BLT-W88",
      priceRange: [20, 26],
      category: "Washer Belts",
      descriptionTemplate: "88\" drive belt for {BRAND} washers. Heat and oil resistant rubber.",
      compatibilityPattern: ["SMALL_MODELS"],
    },
    {
      name: "Drive Belt - 92 inch",
      partNumberSuffix: "BLT-W92",
      priceRange: [22, 28],
      category: "Washer Belts",
      descriptionTemplate: "92\" heavy-duty drive belt for {BRAND}. Long-lasting construction.",
      compatibilityPattern: ["MEDIUM_MODELS"],
    },
    {
      name: "V-Belt - 95 inch",
      partNumberSuffix: "BLT-V95",
      priceRange: [24, 30],
      category: "Washer Belts",
      descriptionTemplate: "95\" V-belt for {BRAND} commercial washers. Premium quality.",
      compatibilityPattern: ["LARGE_MODELS"],
    },
  ],
  WASHER_PUMPS: [
    {
      name: "Drain Pump - Standard",
      partNumberSuffix: "PMP-DR-ST",
      priceRange: [85, 105],
      category: "Washer Pumps",
      descriptionTemplate: "Standard drain pump assembly for {BRAND}. Self-priming design.",
      compatibilityPattern: ["ALL_MODELS"],
    },
    {
      name: "Drain Pump - High Capacity",
      partNumberSuffix: "PMP-DR-HC",
      priceRange: [105, 135],
      category: "Washer Pumps",
      descriptionTemplate: "High-capacity drain pump for large {BRAND} washers. Commercial grade.",
      compatibilityPattern: ["LARGE_MODELS", "XLARGE_MODELS"],
    },
    {
      name: "Circulation Pump",
      partNumberSuffix: "PMP-CIR",
      priceRange: [125, 165],
      category: "Washer Pumps",
      descriptionTemplate: "Circulation pump for {BRAND} front-load washers. High-flow design.",
      compatibilityPattern: ["MEDIUM_MODELS", "LARGE_MODELS"],
    },
  ],
  WASHER_VALVES: [
    {
      name: "Water Inlet Valve - 2-Way",
      partNumberSuffix: "VLV-IN-2W",
      priceRange: [42, 55],
      category: "Washer Valves",
      descriptionTemplate: "2-way water inlet valve for {BRAND}. Dual solenoid for hot/cold.",
      compatibilityPattern: ["ALL_MODELS"],
    },
    {
      name: "Water Inlet Valve - 3-Way",
      partNumberSuffix: "VLV-IN-3W",
      priceRange: [58, 75],
      category: "Washer Valves",
      descriptionTemplate: "3-way inlet valve for {BRAND} with temperature mixing. Commercial grade.",
      compatibilityPattern: ["MEDIUM_MODELS", "LARGE_MODELS", "XLARGE_MODELS"],
    },
  ],
  WASHER_BEARINGS: [
    {
      name: "Drum Bearing Kit",
      partNumberSuffix: "BRG-DRM-KT",
      priceRange: [55, 75],
      category: "Washer Bearings",
      descriptionTemplate: "Complete drum bearing kit for {BRAND}. Includes seals and hardware.",
      compatibilityPattern: ["ALL_MODELS"],
    },
    {
      name: "Outer Tub Bearing",
      partNumberSuffix: "BRG-TUB-OT",
      priceRange: [35, 48],
      category: "Washer Bearings",
      descriptionTemplate: "Outer tub bearing for {BRAND} washers. Heavy-duty construction.",
      compatibilityPattern: ["ALL_MODELS"],
    },
  ],
  WASHER_SEALS: [
    {
      name: "Door Boot Seal",
      partNumberSuffix: "SEL-DR-BT",
      priceRange: [45, 68],
      category: "Washer Seals",
      descriptionTemplate: "Door boot seal for {BRAND} front-load washers. Prevents leaks.",
      compatibilityPattern: ["MEDIUM_MODELS", "LARGE_MODELS"],
    },
    {
      name: "Shaft Seal",
      partNumberSuffix: "SEL-SFT",
      priceRange: [28, 42],
      category: "Washer Seals",
      descriptionTemplate: "Main shaft seal for {BRAND}. Oil and water resistant.",
      compatibilityPattern: ["ALL_MODELS"],
    },
  ],
  DRYER_MOTORS: [
    {
      name: "Dryer Blower Motor - 1/4 HP",
      partNumberSuffix: "MTR-D25",
      priceRange: [195, 235],
      category: "Dryer Motors",
      descriptionTemplate: "1/4 HP blower motor for {BRAND} dryers. Reversible rotation.",
      compatibilityPattern: ["SMALL_MODELS"],
    },
    {
      name: "Dryer Motor - 1/3 HP",
      partNumberSuffix: "MTR-D33",
      priceRange: [215, 265],
      category: "Dryer Motors",
      descriptionTemplate: "1/3 HP motor for {BRAND} commercial dryers. Long-lasting performance.",
      compatibilityPattern: ["MEDIUM_MODELS"],
    },
    {
      name: "Dryer Motor - 1/2 HP Heavy Duty",
      partNumberSuffix: "MTR-D50",
      priceRange: [255, 305],
      category: "Dryer Motors",
      descriptionTemplate: "1/2 HP heavy-duty motor for large {BRAND} dryers.",
      compatibilityPattern: ["LARGE_MODELS", "XLARGE_MODELS"],
    },
  ],
  DRYER_BELTS: [
    {
      name: "Dryer Belt - 92.25 inch",
      partNumberSuffix: "BLT-D92",
      priceRange: [20, 26],
      category: "Dryer Belts",
      descriptionTemplate: "92.25\" dryer belt for {BRAND}. Heat resistant up to 350°F.",
      compatibilityPattern: ["SMALL_MODELS", "MEDIUM_MODELS"],
    },
    {
      name: "Dryer Belt - 93.75 inch",
      partNumberSuffix: "BLT-D94",
      priceRange: [22, 28],
      category: "Dryer Belts",
      descriptionTemplate: "93.75\" heavy-duty belt for {BRAND} large dryers.",
      compatibilityPattern: ["LARGE_MODELS"],
    },
  ],
  DRYER_ROLLERS: [
    {
      name: "Drum Roller - Set of 2",
      partNumberSuffix: "ROL-DR-2",
      priceRange: [35, 48],
      category: "Dryer Rollers",
      descriptionTemplate: "Drum support roller set for {BRAND}. Includes 2 rollers with shafts.",
      compatibilityPattern: ["ALL_MODELS"],
    },
    {
      name: "Drum Roller Kit - Complete",
      partNumberSuffix: "ROL-DR-KT",
      priceRange: [55, 75],
      category: "Dryer Rollers",
      descriptionTemplate: "Complete roller kit for {BRAND} with 4 rollers and hardware.",
      compatibilityPattern: ["LARGE_MODELS"],
    },
  ],
  DRYER_HEATING: [
    {
      name: "Heating Element - 4500W",
      partNumberSuffix: "HET-45",
      priceRange: [115, 145],
      category: "Dryer Heating Elements",
      descriptionTemplate: "4500W electric heating element for {BRAND}. 240V commercial.",
      compatibilityPattern: ["SMALL_MODELS", "MEDIUM_MODELS"],
    },
    {
      name: "Heating Element - 5000W",
      partNumberSuffix: "HET-50",
      priceRange: [125, 155],
      category: "Dryer Heating Elements",
      descriptionTemplate: "5000W heating element for {BRAND} dryers. Heavy-duty construction.",
      compatibilityPattern: ["MEDIUM_MODELS", "LARGE_MODELS"],
    },
    {
      name: "Gas Burner Assembly - Natural Gas",
      partNumberSuffix: "GAS-NG",
      priceRange: [165, 205],
      category: "Dryer Gas Valves",
      descriptionTemplate: "Natural gas burner assembly for {BRAND}. Includes igniter.",
      compatibilityPattern: ["GAS_MODELS"],
    },
    {
      name: "Gas Burner Assembly - LP",
      partNumberSuffix: "GAS-LP",
      priceRange: [165, 205],
      category: "Dryer Gas Valves",
      descriptionTemplate: "LP gas burner assembly for {BRAND} dryers. Complete kit.",
      compatibilityPattern: ["GAS_MODELS"],
    },
  ],
  DRYER_THERMOSTATS: [
    {
      name: "High Limit Thermostat",
      partNumberSuffix: "THR-HL",
      priceRange: [28, 38],
      category: "Dryer Thermostats",
      descriptionTemplate: "High-limit safety thermostat for {BRAND}. Auto-reset at 250°F.",
      compatibilityPattern: ["ALL_MODELS"],
    },
    {
      name: "Operating Thermostat",
      partNumberSuffix: "THR-OP",
      priceRange: [25, 35],
      category: "Dryer Thermostats",
      descriptionTemplate: "Operating thermostat for {BRAND} dryers. Temperature cycling control.",
      compatibilityPattern: ["ALL_MODELS"],
    },
  ],
  CONTROL_BOARDS: [
    {
      name: "Main Control Board - Washer",
      partNumberSuffix: "CTL-W-MN",
      priceRange: [245, 325],
      category: "Washer Control Boards",
      descriptionTemplate: "Main control board for {BRAND} washers. Pre-programmed, plug and play.",
      compatibilityPattern: ["MEDIUM_MODELS", "LARGE_MODELS"],
    },
    {
      name: "User Interface Board - Washer",
      partNumberSuffix: "CTL-W-UI",
      priceRange: [125, 175],
      category: "Washer Control Boards",
      descriptionTemplate: "User interface control board for {BRAND}. Includes display.",
      compatibilityPattern: ["MEDIUM_MODELS", "LARGE_MODELS"],
    },
    {
      name: "Main Control Board - Dryer",
      partNumberSuffix: "CTL-D-MN",
      priceRange: [215, 285],
      category: "Dryer Control Boards",
      descriptionTemplate: "Main control board for {BRAND} dryers. Factory programmed.",
      compatibilityPattern: ["MEDIUM_MODELS", "LARGE_MODELS"],
    },
  ],
};

// Helper to categorize models
export function categorizeModel(model: string, allModels: string[]) {
  const index = allModels.indexOf(model);
  const totalModels = allModels.length;
  
  if (index < totalModels * 0.25) return "SMALL_MODELS";
  if (index < totalModels * 0.5) return "MEDIUM_MODELS";
  if (index < totalModels * 0.75) return "LARGE_MODELS";
  return "XLARGE_MODELS";
}

// Helper to determine gas models
export function isGasModel(model: string) {
  return model.includes("G") || model.includes("gas");
}

// Generate parts for a specific brand
export function generatePartsForBrand(brandKey: string) {
  const brand = BRAND_CONFIGS[brandKey];
  if (!brand) return [];
  
  const parts = [];
  
  for (const [category, templates] of Object.entries(PART_TEMPLATES)) {
    for (const template of templates) {
      // Determine compatible models based on pattern
      let compatibleModels: string[] = [];
      
      if (template.compatibilityPattern.includes("ALL_MODELS")) {
        compatibleModels = brand.modelSeries;
      } else if (template.compatibilityPattern.includes("GAS_MODELS")) {
        compatibleModels = brand.modelSeries.filter(m => isGasModel(m));
      } else {
        compatibleModels = brand.modelSeries.filter(model => {
          const modelCategory = categorizeModel(model, brand.modelSeries);
          return template.compatibilityPattern.includes(modelCategory);
        });
      }
      
      if (compatibleModels.length === 0) continue;
      
      // Generate part
      const price = (Math.random() * (template.priceRange[1] - template.priceRange[0]) + template.priceRange[0]).toFixed(2);
      
      parts.push({
        brand: brand.name,
        name: template.name,
        partNumber: `${brand.partNumberPrefix}-${template.partNumberSuffix}`,
        price,
        category: template.category,
        description: template.descriptionTemplate.replace("{BRAND}", brand.name),
        compatibility: compatibleModels,
      });
    }
  }
  
  return parts;
}

// Generate all parts for all brands
export function generateAllParts() {
  const allParts = [];
  
  for (const brandKey of Object.keys(BRAND_CONFIGS)) {
    const brandParts = generatePartsForBrand(brandKey);
    allParts.push(...brandParts);
  }
  
  return allParts;
}
