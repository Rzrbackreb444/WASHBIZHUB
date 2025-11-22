/**
 * WashBizHub Ultimate Laundromat Superstore - Product Taxonomy
 * Comprehensive catalog structure for 20+ product categories
 */

export interface ProductCategory {
  id: string;
  label: string;
  description: string;
  icon?: string;
  subcategories?: ProductSubcategory[];
  amazonSearches: string[];
  seoKeywords: string[];
}

export interface ProductSubcategory {
  id: string;
  label: string;
  amazonSearches: string[];
}

export const SUPERSTORE_TAXONOMY: ProductCategory[] = [
  {
    id: "washers",
    label: "Commercial Washers",
    description: "Heavy-duty coin-op washers from Speed Queen, Maytag, Huebsch",
    amazonSearches: [
      "commercial washing machine coin operated",
      "speed queen commercial washer",
      "maytag commercial washer",
      "huebsch commercial washer"
    ],
    seoKeywords: ["commercial washer", "coin-op washer", "laundromat washer"]
  },
  {
    id: "dryers",
    label: "Commercial Dryers",
    description: "High-capacity commercial dryers for laundromats",
    amazonSearches: [
      "commercial dryer coin operated",
      "speed queen commercial dryer",
      "huebsch commercial dryer stack"
    ],
    seoKeywords: ["commercial dryer", "coin-op dryer", "stacked dryer"]
  },
  {
    id: "folding-tables",
    label: "Folding Tables & Workstations",
    description: "Heavy-duty folding tables for customer use",
    amazonSearches: [
      "commercial folding table laundry",
      "laundromat folding station heavy duty",
      "industrial folding table commercial"
    ],
    seoKeywords: ["folding table", "laundry station", "workstation"]
  },
  {
    id: "seating",
    label: "Seating & Furniture",
    description: "Waiting room chairs, benches, and customer seating",
    amazonSearches: [
      "commercial waiting room chairs",
      "laundromat seating benches",
      "industrial stackable chairs"
    ],
    seoKeywords: ["waiting room chairs", "commercial seating", "benches"]
  },
  {
    id: "carts",
    label: "Laundry Carts",
    description: "Rolling laundry carts and baskets - R&B style and more",
    amazonSearches: [
      "commercial laundry cart heavy duty rolling",
      "R&B wire laundry cart",
      "industrial rolling basket commercial"
    ],
    seoKeywords: ["laundry cart", "rolling cart", "R&B cart"]
  },
  {
    id: "supplies",
    label: "Laundry Supplies",
    description: "Detergent, dryer sheets, stain removers, and cleaning products",
    subcategories: [
      { id: "detergent", label: "Detergent", amazonSearches: ["commercial laundry detergent bulk", "tide commercial detergent"] },
      { id: "dryer-sheets", label: "Dryer Sheets", amazonSearches: ["commercial dryer sheets bulk", "bounce dryer sheets commercial"] },
      { id: "trash-bags", label: "Trash Bags", amazonSearches: ["commercial trash bags bulk", "heavy duty garbage bags"] },
      { id: "stain-removers", label: "Stain Removers", amazonSearches: ["commercial stain remover bulk", "shout stain remover commercial"] }
    ],
    amazonSearches: [
      "commercial laundry detergent bulk",
      "dryer sheets commercial bulk",
      "commercial trash bags heavy duty"
    ],
    seoKeywords: ["laundry detergent", "dryer sheets", "trash bags", "cleaning supplies"]
  },
  {
    id: "hvac",
    label: "HVAC & Climate Control",
    description: "Air conditioners, water coolers, and ventilation",
    subcategories: [
      { id: "air-conditioners", label: "Air Conditioners", amazonSearches: ["commercial air conditioner portable", "industrial AC unit"] },
      { id: "water-coolers", label: "Water Coolers", amazonSearches: ["commercial water cooler dispenser", "bottle-less water cooler"] },
      { id: "ventilation", label: "Ventilation & Fans", amazonSearches: ["commercial exhaust fan", "industrial ventilation system"] }
    ],
    amazonSearches: [
      "commercial air conditioner",
      "water cooler dispenser commercial",
      "commercial exhaust fan industrial"
    ],
    seoKeywords: ["air conditioner", "water cooler", "HVAC", "ventilation"]
  },
  {
    id: "dog-wash",
    label: "Dog Wash Stations",
    description: "Self-service pet washing stations and supplies",
    amazonSearches: [
      "dog wash station commercial self service",
      "pet grooming tub commercial",
      "dog bathing station industrial"
    ],
    seoKeywords: ["dog wash", "pet wash station", "self-service dog wash"]
  },
  {
    id: "car-wash",
    label: "Car Wash Supplies",
    description: "Vacuums, cleaning products, and car wash equipment",
    amazonSearches: [
      "commercial car vacuum coin operated",
      "car wash soap commercial bulk",
      "industrial wet dry vacuum commercial"
    ],
    seoKeywords: ["car wash vacuum", "car cleaning supplies", "commercial vacuum"]
  },
  {
    id: "coin-changers",
    label: "Coin Changers & Payment",
    description: "Bill changers, coin dispensers, and payment systems",
    amazonSearches: [
      "coin changer machine commercial",
      "bill changer laundromat",
      "card reader laundromat payment system"
    ],
    seoKeywords: ["coin changer", "bill changer", "payment system", "card reader"]
  },
  {
    id: "vending",
    label: "Vending Machines",
    description: "Snack, drink, and soap vending machines",
    subcategories: [
      { id: "snack-vending", label: "Snack Vending", amazonSearches: ["commercial snack vending machine", "candy vending machine coin operated"] },
      { id: "drink-vending", label: "Drink Vending", amazonSearches: ["commercial drink vending machine", "soda vending machine coin operated"] },
      { id: "soap-vending", label: "Soap Vending", amazonSearches: ["soap vending machine laundromat", "detergent dispenser commercial"] }
    ],
    amazonSearches: [
      "commercial vending machine coin operated",
      "soap vending machine laundromat",
      "snack vending machine commercial"
    ],
    seoKeywords: ["vending machine", "soap dispenser", "snack machine"]
  },
  {
    id: "arcade",
    label: "Arcade & Entertainment",
    description: "Pinball, claw machines, video games for customer entertainment",
    subcategories: [
      { id: "pinball", label: "Pinball Machines", amazonSearches: ["pinball machine commercial coin operated", "arcade pinball full size"] },
      { id: "claw-machines", label: "Claw Machines", amazonSearches: ["claw machine commercial coin operated", "crane game vending"] },
      { id: "video-games", label: "Video Games", amazonSearches: ["arcade game commercial coin operated", "multi-game arcade cabinet"] }
    ],
    amazonSearches: [
      "pinball machine commercial",
      "claw machine coin operated",
      "arcade game cabinet commercial"
    ],
    seoKeywords: ["arcade games", "pinball", "claw machine", "video games"]
  },
  {
    id: "parts",
    label: "Parts & Repairs",
    description: "Motors, belts, pumps, controls for washer/dryer repair",
    subcategories: [
      { id: "motors", label: "Motors", amazonSearches: ["washer motor commercial replacement", "dryer motor heavy duty"] },
      { id: "belts", label: "Belts & Pulleys", amazonSearches: ["washer belt commercial", "dryer belt replacement"] },
      { id: "pumps", label: "Pumps & Valves", amazonSearches: ["washer drain pump commercial", "water inlet valve"] },
      { id: "controls", label: "Controls & Timers", amazonSearches: ["washer control board", "dryer timer replacement"] }
    ],
    amazonSearches: [
      "commercial washer parts replacement",
      "dryer parts commercial heavy duty"
    ],
    seoKeywords: ["washer parts", "dryer parts", "replacement parts", "repair parts"]
  },
  {
    id: "signage",
    label: "Signage & Lighting",
    description: "LED signs, business hours signs, and interior lighting",
    amazonSearches: [
      "LED business sign laundromat",
      "open closed sign neon",
      "commercial LED lighting industrial"
    ],
    seoKeywords: ["LED sign", "business signage", "commercial lighting"]
  },
  {
    id: "security",
    label: "Security Systems",
    description: "Cameras, alarms, and surveillance equipment",
    amazonSearches: [
      "commercial security camera system",
      "business alarm system wireless",
      "surveillance camera commercial outdoor"
    ],
    seoKeywords: ["security camera", "surveillance system", "alarm system"]
  },
  {
    id: "cleaning",
    label: "Cleaning Equipment",
    description: "Mops, vacuums, floor cleaners, and janitorial supplies",
    amazonSearches: [
      "commercial floor cleaner machine",
      "industrial wet dry vacuum",
      "commercial mop bucket wringer"
    ],
    seoKeywords: ["cleaning equipment", "floor cleaner", "janitorial supplies"]
  },
  {
    id: "pos",
    label: "POS & Management",
    description: "Point-of-sale systems and business management software",
    amazonSearches: [
      "POS system touchscreen commercial",
      "business management software",
      "commercial receipt printer"
    ],
    seoKeywords: ["POS system", "point of sale", "business software"]
  },
  {
    id: "tools",
    label: "Tools & Maintenance",
    description: "Repair tools, multimeters, and maintenance equipment",
    amazonSearches: [
      "appliance repair tool kit professional",
      "multimeter digital commercial",
      "maintenance tool set industrial"
    ],
    seoKeywords: ["repair tools", "maintenance tools", "tool kit"]
  }
];

// Flatten all Amazon searches for comprehensive catalog
export function getAllAmazonSearches(): string[] {
  const searches: string[] = [];
  
  for (const category of SUPERSTORE_TAXONOMY) {
    searches.push(...category.amazonSearches);
    
    if (category.subcategories) {
      for (const sub of category.subcategories) {
        searches.push(...sub.amazonSearches);
      }
    }
  }
  
  return searches;
}

// Get category by ID
export function getCategoryById(id: string): ProductCategory | undefined {
  return SUPERSTORE_TAXONOMY.find(c => c.id === id);
}

// Get all SEO keywords
export function getAllSEOKeywords(): string[] {
  return SUPERSTORE_TAXONOMY.flatMap(c => c.seoKeywords);
}
