/**
 * WASHBIZHUB COMMERCIAL LAUNDRY EQUIPMENT CATALOG
 * Comprehensive equipment data for SEO domination across all commercial laundry verticals
 * 
 * AFFILIATE PARTNER: AAdvantage Laundry Systems (Ryan Smith - EVI Industries Board)
 * All CTAs route to affiliate form for commission on equipment AND parts
 */

export const AFFILIATE_LINK = "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry";
export const PARTNER_PHONE = "1-800-880-2138";
export const PARTNER_NAME = "AAdvantage Laundry Systems";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EquipmentBrand {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription: string;
  madeInUSA: boolean;
  founded?: string;
  headquarters?: string;
  employees?: string;
  keyFeatures: string[];
  warranty: string;
  warrantyDetails: string[];
  certifications: string[];
  industries: string[];
  website: string;
  isPrimary: boolean;
}

export interface EquipmentModel {
  id: string;
  brandId: string;
  series: string;
  seriesName: string;
  model: string;
  name: string;
  capacity: string;
  capacityLbs: number;
  capacityKg: number;
  type: 'washer' | 'dryer' | 'stack' | 'changer' | 'ironer' | 'folder' | 'feeder' | 'other';
  gForce?: number;
  features: string[];
  specs: Record<string, string>;
  idealFor: string[];
  isExpress?: boolean;
  isNewSeries?: boolean;
  isPopular?: boolean;
}

export interface PartCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  commonParts: string[];
  compatibleBrands: string[];
  icon: string;
  searchKeywords: string[];
}

export interface IndustryVertical {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  keywords: string[];
  equipmentNeeds: string[];
  capacityRange: string;
  typicalSetup: string;
  challenges: string[];
  solutions: string[];
}

export interface FinancingOption {
  id: string;
  name: string;
  provider: string;
  type: 'lease' | 'purchase' | 'rental';
  description: string;
  benefits: string[];
  idealFor: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

// ============================================================================
// EQUIPMENT BRANDS
// ============================================================================

export const brands: EquipmentBrand[] = [
  {
    id: 'dexter',
    name: 'Dexter Laundry',
    slug: 'dexter',
    tagline: 'Built Better. Serviced Quicker. Made in America.',
    description: 'Industry-leading commercial laundry equipment manufacturer with 125+ years of excellence. Employee-owned company headquartered in Fairfield, Iowa.',
    longDescription: `Dexter Laundry has been a leader in commercial and on-premise laundry since the late 1800s. As an employee-owned company, Dexter is committed to manufacturing the highest quality washers, dryers, and laundry systems. Every Dexter machine undergoes rigorous 1,000-hour testing with maximum extract and extreme out-of-balance loads to ensure reliability in the harshest laundry environments. With nearly 600 employees in Fairfield, Iowa, Dexter continues to innovate with smart technology like DexterLive cloud monitoring and DexterPay mobile payments.`,
    madeInUSA: true,
    founded: '1894',
    headquarters: 'Fairfield, Iowa, USA',
    employees: '600+',
    keyFeatures: [
      '200 G-Force Express Extraction',
      'DexterLive Cloud Monitoring',
      'DexterPay Mobile Payments',
      '1,000-Hour Rigorous Testing',
      'Stainless Steel Construction',
      'Industry-Leading Warranties',
      'Lifetime Technical Support',
      'Smart Touchscreen Controls (X-Series)'
    ],
    warranty: '10-Year Frame, Tub & Cylinder Warranty',
    warrantyDetails: [
      '10 years on frame, outer tub, cylinder, main shaft, seals, and bearings',
      '5 years on all other parts',
      'Lifetime technical support included',
      'Extended warranty options available'
    ],
    certifications: ['ENERGY STAR', 'UL Listed', 'NSF Certified', 'ADA Compliant'],
    industries: ['Laundromats', 'Hotels', 'Hospitals', 'Universities', 'Multi-Housing', 'Fire Departments', 'Correctional Facilities'],
    website: 'https://dexter.com',
    isPrimary: true
  },
  {
    id: 'continental-girbau',
    name: 'Continental Girbau',
    slug: 'continental-girbau',
    tagline: 'Performance. Durability. Efficiency.',
    description: 'Major commercial laundry equipment manufacturer offering the largest breadth of laundry products in the industry with superior G-force extraction.',
    longDescription: `Continental Girbau brings real-life solutions to vended, on-premise, multi-housing, industrial, and textile care markets. Their ExpressWash soft-mount washers achieve up to 400-405 G-force extraction - among the highest in the industry - removing significantly more moisture per load and reducing drying times by up to 65%. The innovative Multi-Directional Springs (MDS) system absorbs 95% of vibrations, allowing installation without bolting to concrete foundations.`,
    madeInUSA: false,
    founded: '1960',
    headquarters: 'Oshkosh, Wisconsin, USA (North America HQ)',
    keyFeatures: [
      '400-405 G-Force Extraction (ExpressWash)',
      'ProfitPlus™ Programmable Controls',
      'AquaFall™ Water Distribution',
      'AquaMixer™ Temperature Control',
      'Multi-Directional Springs (MDS)',
      'AISI-304 Stainless Steel Drums',
      'Titan Steel Finish Panels',
      'Custom Select Financing'
    ],
    warranty: '3-5 Year Parts Warranty',
    warrantyDetails: [
      '5 years on stainless steel drums',
      '3 years on most parts',
      'Extended warranty options available',
      '24-hour parts availability through distributors'
    ],
    certifications: ['ENERGY STAR', 'UL Listed', 'NSF Certified'],
    industries: ['Laundromats', 'Hotels', 'Healthcare', 'Universities', 'Multi-Housing', 'Industrial'],
    website: 'https://continental-laundry.com',
    isPrimary: true
  },
  {
    id: 'maytag',
    name: 'Maytag Commercial',
    slug: 'maytag',
    tagline: 'Dependability Since 1893',
    description: 'Trusted commercial laundry brand known for durability and reliability in multi-housing and vended applications.',
    longDescription: `Maytag Commercial Laundry has been a trusted name in laundry for over 130 years. Known for dependable, durable equipment designed for high-volume commercial use.`,
    madeInUSA: true,
    headquarters: 'Benton Harbor, Michigan, USA',
    keyFeatures: [
      'Commercial-Grade Construction',
      'Multi-Housing Expertise',
      'Proven Reliability',
      'Easy Maintenance',
      'Energy Efficient'
    ],
    warranty: '5-Year Limited Warranty',
    warrantyDetails: ['5 years on parts', 'Extended options available'],
    certifications: ['ENERGY STAR', 'UL Listed'],
    industries: ['Multi-Housing', 'Laundromats', 'Hotels'],
    website: 'https://maytagcommerciallaundry.com',
    isPrimary: false
  },
  {
    id: 'whirlpool',
    name: 'Whirlpool Commercial',
    slug: 'whirlpool',
    tagline: 'Commercial Performance, Trusted Quality',
    description: 'Global leader in home appliances with a strong commercial laundry division for multi-housing and hospitality.',
    longDescription: `Whirlpool Commercial brings consumer-trusted quality to commercial applications with energy-efficient equipment designed for multi-housing and hospitality markets.`,
    madeInUSA: true,
    headquarters: 'Benton Harbor, Michigan, USA',
    keyFeatures: [
      'Energy Efficient Design',
      'Multi-Housing Focus',
      'Connected Technology',
      'Reliable Performance'
    ],
    warranty: '5-Year Limited Warranty',
    warrantyDetails: ['5 years on parts'],
    certifications: ['ENERGY STAR', 'UL Listed'],
    industries: ['Multi-Housing', 'Hotels', 'Universities'],
    website: 'https://whirlpoolpro.com',
    isPrimary: false
  },
  {
    id: 'lg-commercial',
    name: 'LG Commercial',
    slug: 'lg-commercial',
    tagline: 'Innovation for a Better Life',
    description: 'Technology-forward commercial laundry equipment with smart connectivity and energy efficiency.',
    longDescription: `LG Commercial brings cutting-edge technology to commercial laundry with smart connectivity, AI-powered cycles, and industry-leading energy efficiency.`,
    madeInUSA: false,
    headquarters: 'Seoul, South Korea',
    keyFeatures: [
      'AI DD™ Technology',
      'Smart Connectivity',
      'TurboWash™ Technology',
      'Inverter Direct Drive',
      'Steam Technology'
    ],
    warranty: '3-Year Limited Warranty',
    warrantyDetails: ['3 years on parts', '10 years on direct drive motor'],
    certifications: ['ENERGY STAR', 'UL Listed'],
    industries: ['Multi-Housing', 'Hotels', 'Laundromats'],
    website: 'https://lg.com/commercial',
    isPrimary: false
  },
  {
    id: 'bc-technologies',
    name: 'B&C Technologies',
    slug: 'bc-technologies',
    tagline: 'Industrial Laundry Solutions',
    description: 'Industrial-grade laundry equipment for high-volume operations including healthcare, hospitality, and processing plants.',
    longDescription: `B&C Technologies specializes in industrial-grade laundry equipment designed for the most demanding high-volume environments including healthcare facilities, hotels, and commercial laundry processors.`,
    madeInUSA: false,
    keyFeatures: [
      'Industrial-Grade Construction',
      'High-Volume Capacity',
      'Programmable Controls',
      'Heavy-Duty Components'
    ],
    warranty: '2-Year Parts Warranty',
    warrantyDetails: ['2 years on parts', 'Extended options available'],
    certifications: ['UL Listed'],
    industries: ['Industrial', 'Healthcare', 'Hotels', 'Processing Plants'],
    website: 'https://bandctech.com',
    isPrimary: false
  },
  {
    id: 'econ-o-wash',
    name: 'Econ-O-Wash',
    slug: 'econ-o-wash',
    tagline: 'Value-Driven Commercial Laundry',
    description: 'Cost-effective commercial laundry equipment for budget-conscious operations without sacrificing quality.',
    longDescription: `Econ-O-Wash provides value-driven commercial laundry solutions for operators who need reliable equipment at competitive price points.`,
    madeInUSA: false,
    keyFeatures: [
      'Budget-Friendly Pricing',
      'Reliable Performance',
      'Simple Operation',
      'Easy Maintenance'
    ],
    warranty: '1-Year Parts Warranty',
    warrantyDetails: ['1 year on parts'],
    certifications: ['UL Listed'],
    industries: ['Laundromats', 'Multi-Housing'],
    website: '',
    isPrimary: false
  }
];

// ============================================================================
// EQUIPMENT MODELS - DEXTER
// ============================================================================

export const dexterModels: EquipmentModel[] = [
  // X-Series (NEW 2024-2025)
  {
    id: 'dexter-t-300-x',
    brandId: 'dexter',
    series: 'x-series',
    seriesName: 'X-Series',
    model: 'T-300',
    name: 'Dexter T-300 X-Series Washer',
    capacity: '20 lb',
    capacityLbs: 20,
    capacityKg: 9,
    type: 'washer',
    gForce: 100,
    features: ['Touchscreen Controls', 'DexterLive Ready', 'DexterPay QR Payments', 'Multi-Language Interface', 'Automatic Leak Detection', 'Programmable Cycles'],
    specs: {
      'Cylinder Size': '21.5" x 14"',
      'Water Connection': '3/4" NPT',
      'Drain': '3" OD',
      'Motor': '1 HP',
      'Electrical': '120V/60Hz/1Ph or 208-240V/60Hz/1Ph'
    },
    idealFor: ['Laundromats', 'Multi-Housing', 'Small Hotels'],
    isNewSeries: true,
    isPopular: true
  },
  {
    id: 'dexter-t-450-x',
    brandId: 'dexter',
    series: 'x-series',
    seriesName: 'X-Series',
    model: 'T-450',
    name: 'Dexter T-450 X-Series Washer',
    capacity: '30 lb',
    capacityLbs: 30,
    capacityKg: 13.6,
    type: 'washer',
    gForce: 100,
    features: ['Touchscreen Controls', 'DexterLive Ready', 'DexterPay QR Payments', 'Multi-Language Interface', 'Automatic Leak Detection'],
    specs: {
      'Cylinder Size': '24" x 16"',
      'Water Connection': '3/4" NPT',
      'Drain': '3" OD',
      'Motor': '1.5 HP'
    },
    idealFor: ['Laundromats', 'Hotels', 'Universities'],
    isNewSeries: true
  },
  {
    id: 'dexter-t-650-x',
    brandId: 'dexter',
    series: 'x-series',
    seriesName: 'X-Series',
    model: 'T-650',
    name: 'Dexter T-650 X-Series Washer',
    capacity: '40 lb',
    capacityLbs: 40,
    capacityKg: 18,
    type: 'washer',
    gForce: 100,
    features: ['Touchscreen Controls', 'DexterLive Ready', 'DexterPay QR Payments', 'Multi-Language Interface'],
    specs: {
      'Cylinder Size': '27" x 18"',
      'Water Connection': '1" NPT',
      'Drain': '3" OD',
      'Motor': '2 HP'
    },
    idealFor: ['High-Volume Laundromats', 'Hotels', 'Healthcare'],
    isNewSeries: true,
    isPopular: true
  },
  // Express Series (200 G-Force)
  {
    id: 'dexter-t-350-express',
    brandId: 'dexter',
    series: 'express',
    seriesName: 'Express',
    model: 'T-350 Express',
    name: 'Dexter T-350 Express Washer',
    capacity: '20 lb',
    capacityLbs: 20,
    capacityKg: 9,
    type: 'washer',
    gForce: 200,
    features: ['200 G-Force Extraction', 'Reduces Dry Time 25%', 'DexterLive Compatible', 'Programmable Cycles'],
    specs: {
      'Extract Speed': '1,025 RPM',
      'G-Force': '200',
      'Cylinder Size': '21.5" x 14"',
      'Water Savings': 'Up to 30%'
    },
    idealFor: ['High-Volume Laundromats', 'Quick-Turn Operations'],
    isExpress: true,
    isPopular: true
  },
  {
    id: 'dexter-t-450-express',
    brandId: 'dexter',
    series: 'express',
    seriesName: 'Express',
    model: 'T-450 Express',
    name: 'Dexter T-450 Express Washer',
    capacity: '30 lb',
    capacityLbs: 30,
    capacityKg: 13.6,
    type: 'washer',
    gForce: 200,
    features: ['200 G-Force Extraction', 'Reduces Dry Time 25%', 'DexterLive Compatible', 'Energy Efficient'],
    specs: {
      'Extract Speed': '980 RPM',
      'G-Force': '200',
      'Cylinder Size': '24" x 16"'
    },
    idealFor: ['Laundromats', 'Hotels', 'Universities'],
    isExpress: true
  },
  {
    id: 'dexter-t-950-express',
    brandId: 'dexter',
    series: 'express',
    seriesName: 'Express',
    model: 'T-950 Express',
    name: 'Dexter T-950 Express Washer',
    capacity: '60 lb',
    capacityLbs: 60,
    capacityKg: 27,
    type: 'washer',
    gForce: 200,
    features: ['200 G-Force Extraction', 'High-Volume Capacity', 'DexterLive Compatible', 'Commercial-Grade'],
    specs: {
      'Extract Speed': '850 RPM',
      'G-Force': '200',
      'Cylinder Size': '32" x 22"',
      'Motor': '5 HP'
    },
    idealFor: ['High-Volume Laundromats', 'Hotels', 'Healthcare', 'Universities'],
    isExpress: true,
    isPopular: true
  },
  {
    id: 'dexter-t-1450-express',
    brandId: 'dexter',
    series: 'express',
    seriesName: 'Express',
    model: 'T-1450 Express',
    name: 'Dexter T-1450 Express Washer',
    capacity: '90 lb',
    capacityLbs: 90,
    capacityKg: 41,
    type: 'washer',
    gForce: 200,
    features: ['200 G-Force Extraction', 'Maximum Capacity', 'Industrial-Grade', 'DexterLive Compatible'],
    specs: {
      'Extract Speed': '780 RPM',
      'G-Force': '200',
      'Cylinder Size': '38" x 26"',
      'Motor': '7.5 HP'
    },
    idealFor: ['Industrial Operations', 'Large Hotels', 'Healthcare Systems'],
    isExpress: true
  },
  // C-Series (Classic)
  {
    id: 'dexter-t-300-c',
    brandId: 'dexter',
    series: 'c-series',
    seriesName: 'C-Series',
    model: 'T-300',
    name: 'Dexter T-300 C-Series Washer',
    capacity: '20 lb',
    capacityLbs: 20,
    capacityKg: 9,
    type: 'washer',
    gForce: 100,
    features: ['Proven Reliability', 'Easy Programming', 'Coin/Card Compatible', 'Low Maintenance'],
    specs: {
      'Cylinder Size': '21.5" x 14"',
      'Extract Speed': '725 RPM',
      'G-Force': '100'
    },
    idealFor: ['Laundromats', 'Multi-Housing', 'Budget-Conscious Operations'],
    isPopular: true
  },
  {
    id: 'dexter-t-900',
    brandId: 'dexter',
    series: 'c-series',
    seriesName: 'C-Series',
    model: 'T-900',
    name: 'Dexter T-900 C-Series Washer',
    capacity: '55 lb',
    capacityLbs: 55,
    capacityKg: 25,
    type: 'washer',
    gForce: 100,
    features: ['Large Capacity', 'Reliable Performance', 'Coin/Card Compatible'],
    specs: {
      'Cylinder Size': '30" x 20"',
      'G-Force': '100',
      'Motor': '3 HP'
    },
    idealFor: ['Laundromats', 'Hotels', 'Healthcare']
  },
  {
    id: 'dexter-t-1200',
    brandId: 'dexter',
    series: 'c-series',
    seriesName: 'C-Series',
    model: 'T-1200',
    name: 'Dexter T-1200 C-Series Washer',
    capacity: '80 lb',
    capacityLbs: 80,
    capacityKg: 36,
    type: 'washer',
    gForce: 100,
    features: ['Extra-Large Capacity', 'Heavy-Duty Construction', 'Industrial Applications'],
    specs: {
      'Cylinder Size': '36" x 24"',
      'G-Force': '100',
      'Motor': '5 HP'
    },
    idealFor: ['High-Volume Operations', 'Industrial', 'Large Hotels']
  },
  {
    id: 'dexter-t-1800',
    brandId: 'dexter',
    series: 'c-series',
    seriesName: 'C-Series',
    model: 'T-1800',
    name: 'Dexter T-1800 Commercial Washer',
    capacity: '120 lb',
    capacityLbs: 120,
    capacityKg: 54,
    type: 'washer',
    gForce: 200,
    features: ['Maximum Capacity', '200 G-Force Available', 'Industrial-Grade', 'Heavy-Duty Components'],
    specs: {
      'Cylinder Size': '42" x 28"',
      'G-Force': 'Up to 200',
      'Motor': '10 HP'
    },
    idealFor: ['Industrial Laundries', 'Large Healthcare Systems', 'Commercial Processors']
  },
  // Dryers
  {
    id: 'dexter-t-30-dryer',
    brandId: 'dexter',
    series: 'dryer',
    seriesName: 'Commercial Dryers',
    model: 'T-30',
    name: 'Dexter T-30 Commercial Dryer',
    capacity: '30 lb',
    capacityLbs: 30,
    capacityKg: 13.6,
    type: 'dryer',
    features: ['Efficient Drying', 'Reversing Drum', 'Easy Access Lint Screen', 'Programmable Cycles'],
    specs: {
      'Drum Size': '30" x 24"',
      'BTU Input': '75,000',
      'Airflow': '400 CFM'
    },
    idealFor: ['Laundromats', 'Multi-Housing', 'Small Hotels']
  },
  {
    id: 'dexter-t-50-dryer',
    brandId: 'dexter',
    series: 'dryer',
    seriesName: 'Commercial Dryers',
    model: 'T-50',
    name: 'Dexter T-50 Commercial Dryer',
    capacity: '50 lb',
    capacityLbs: 50,
    capacityKg: 23,
    type: 'dryer',
    features: ['High Capacity', 'Reversing Drum', 'Moisture Sensing', 'Energy Efficient'],
    specs: {
      'Drum Size': '38" x 28"',
      'BTU Input': '125,000',
      'Airflow': '650 CFM'
    },
    idealFor: ['Laundromats', 'Hotels', 'Healthcare'],
    isPopular: true
  },
  {
    id: 'dexter-t-80-dryer',
    brandId: 'dexter',
    series: 'dryer',
    seriesName: 'Commercial Dryers',
    model: 'T-80',
    name: 'Dexter T-80 Commercial Dryer',
    capacity: '80 lb',
    capacityLbs: 80,
    capacityKg: 36,
    type: 'dryer',
    features: ['Large Capacity', 'Industrial Performance', 'Fire Response System', 'Programmable'],
    specs: {
      'Drum Size': '42" x 32"',
      'BTU Input': '200,000',
      'Airflow': '1,000 CFM'
    },
    idealFor: ['High-Volume Operations', 'Industrial', 'Large Hotels']
  },
  // Stack Units
  {
    id: 'dexter-t-750-stack',
    brandId: 'dexter',
    series: 'stack',
    seriesName: 'Stack Washer-Dryers',
    model: 'T-750 SWD',
    name: 'Dexter T-750 Stack Washer-Dryer',
    capacity: '30 lb Washer / 30 lb Dryer',
    capacityLbs: 30,
    capacityKg: 13.6,
    type: 'stack',
    gForce: 100,
    features: ['Space-Saving Design', 'Dual Functionality', 'Coin/Card Compatible', 'Independent Controls'],
    specs: {
      'Footprint': '27" x 31"',
      'Height': '78"',
      'Washer G-Force': '100'
    },
    idealFor: ['Space-Limited Laundromats', 'Multi-Housing', 'Small Hotels'],
    isPopular: true
  }
];

// ============================================================================
// EQUIPMENT MODELS - CONTINENTAL GIRBAU
// ============================================================================

export const continentalModels: EquipmentModel[] = [
  // E-Series ExpressWash (Soft-Mount, 400+ G-Force)
  {
    id: 'cg-eh020',
    brandId: 'continental-girbau',
    series: 'e-series',
    seriesName: 'E-Series ExpressWash',
    model: 'EH020',
    name: 'Continental Girbau EH020 ExpressWash',
    capacity: '20 lb',
    capacityLbs: 20,
    capacityKg: 9,
    type: 'washer',
    gForce: 400,
    features: ['400 G-Force Extraction', 'Soft-Mount Freestanding', 'Logi Pro Controls', 'No Concrete Bolting Required', 'MDS Vibration System'],
    specs: {
      'G-Force': '400',
      'Net Weight': '249 lbs',
      'Drum Material': 'AISI-304 Stainless Steel',
      'Control': 'Logi Pro'
    },
    idealFor: ['Laundromats', 'Multi-Housing', 'Small Hotels'],
    isPopular: true
  },
  {
    id: 'cg-eh030',
    brandId: 'continental-girbau',
    series: 'e-series',
    seriesName: 'E-Series ExpressWash',
    model: 'EH030',
    name: 'Continental Girbau EH030 ExpressWash',
    capacity: '30 lb',
    capacityLbs: 30,
    capacityKg: 13.6,
    type: 'washer',
    gForce: 400,
    features: ['400 G-Force Extraction', 'Soft-Mount Freestanding', 'Inteli Control', 'AquaFall Water Distribution', 'AquaMixer Temperature'],
    specs: {
      'G-Force': '400',
      'Drum Material': 'AISI-304 Stainless Steel',
      'Control': 'Inteli Control',
      'Dry Time Reduction': 'Up to 65%'
    },
    idealFor: ['Laundromats', 'Hotels', 'Universities']
  },
  {
    id: 'cg-eh040',
    brandId: 'continental-girbau',
    series: 'e-series',
    seriesName: 'E-Series ExpressWash',
    model: 'EH040',
    name: 'Continental Girbau EH040 ExpressWash',
    capacity: '40 lb',
    capacityLbs: 40,
    capacityKg: 18,
    type: 'washer',
    gForce: 405,
    features: ['405 G-Force Extraction', 'ProfitPlus Controls', 'Automatic Chemical Injection', 'Sumpless Design Saves Water'],
    specs: {
      'G-Force': '405',
      'Water Savings': '~3 gallons per fill',
      'Drum Material': 'AISI-304 Stainless Steel',
      'Panel Finish': 'Titan Steel'
    },
    idealFor: ['High-Volume Laundromats', 'Hotels', 'Healthcare'],
    isPopular: true
  },
  {
    id: 'cg-eh060',
    brandId: 'continental-girbau',
    series: 'e-series',
    seriesName: 'E-Series ExpressWash',
    model: 'EH060',
    name: 'Continental Girbau EH060 ExpressWash',
    capacity: '60 lb',
    capacityLbs: 60,
    capacityKg: 27,
    type: 'washer',
    gForce: 400,
    features: ['400 G-Force Extraction', 'High Capacity', 'ProfitPlus Controls', 'Energy Star Qualified'],
    specs: {
      'G-Force': '400',
      'Drum Material': 'AISI-304 Stainless Steel',
      'Certification': 'ENERGY STAR'
    },
    idealFor: ['Large Laundromats', 'Hotels', 'Healthcare', 'Universities']
  },
  {
    id: 'cg-eh080',
    brandId: 'continental-girbau',
    series: 'e-series',
    seriesName: 'E-Series ExpressWash',
    model: 'EH080',
    name: 'Continental Girbau EH080 ExpressWash',
    capacity: '80 lb',
    capacityLbs: 80,
    capacityKg: 36,
    type: 'washer',
    gForce: 400,
    features: ['400 G-Force Extraction', 'Industrial Capacity', 'ProfitPlus Controls', 'Heavy-Duty Construction'],
    specs: {
      'G-Force': '400',
      'Application': 'Industrial/Commercial',
      'Drum Material': 'AISI-304 Stainless Steel'
    },
    idealFor: ['Industrial Operations', 'Large Hotels', 'Healthcare Systems']
  },
  {
    id: 'cg-eh090',
    brandId: 'continental-girbau',
    series: 'e-series',
    seriesName: 'E-Series ExpressWash',
    model: 'EH090',
    name: 'Continental Girbau EH090 ExpressWash',
    capacity: '90 lb',
    capacityLbs: 90,
    capacityKg: 41,
    type: 'washer',
    gForce: 400,
    features: ['400 G-Force Extraction', 'Maximum Soft-Mount Capacity', 'Industrial Performance'],
    specs: {
      'G-Force': '400',
      'Application': 'Industrial/Commercial'
    },
    idealFor: ['Industrial Laundries', 'Large Healthcare', 'Commercial Processors']
  },
  {
    id: 'cg-eh130',
    brandId: 'continental-girbau',
    series: 'e-series',
    seriesName: 'E-Series ExpressWash',
    model: 'EH130',
    name: 'Continental Girbau EH130 ExpressWash',
    capacity: '130 lb',
    capacityLbs: 130,
    capacityKg: 59,
    type: 'washer',
    gForce: 400,
    features: ['400 G-Force Extraction', 'Largest ExpressWash', 'Industrial-Grade', 'Maximum Throughput'],
    specs: {
      'G-Force': '400',
      'Application': 'Heavy Industrial',
      'Drum Material': 'AISI-304 Stainless Steel'
    },
    idealFor: ['Industrial Laundries', 'Large Hospitals', 'Commercial Laundry Processors']
  },
  // G-Flex (Hard-Mount)
  {
    id: 'cg-rmg040',
    brandId: 'continental-girbau',
    series: 'g-flex',
    seriesName: 'G-Flex Hard-Mount',
    model: 'RMG040',
    name: 'Continental Girbau RMG040 G-Flex',
    capacity: '40 lb',
    capacityLbs: 40,
    capacityKg: 18,
    type: 'washer',
    gForce: 200,
    features: ['200 G-Force Extraction', 'Hard-Mount Design', 'ProfitPlus Controls', 'Programmable'],
    specs: {
      'G-Force': '200',
      'Mount Type': 'Hard-Mount (Concrete Foundation)',
      'Control': 'ProfitPlus'
    },
    idealFor: ['Laundromats', 'Hotels', 'On-Premise Laundry']
  },
  {
    id: 'cg-rmg055',
    brandId: 'continental-girbau',
    series: 'g-flex',
    seriesName: 'G-Flex Hard-Mount',
    model: 'RMG055',
    name: 'Continental Girbau RMG055 G-Flex',
    capacity: '55 lb',
    capacityLbs: 55,
    capacityKg: 25,
    type: 'washer',
    gForce: 200,
    features: ['200 G-Force Extraction', 'Hard-Mount Design', 'High Capacity'],
    specs: {
      'G-Force': '200',
      'Mount Type': 'Hard-Mount'
    },
    idealFor: ['High-Volume Laundromats', 'Hotels', 'Healthcare']
  },
  {
    id: 'cg-rmg070',
    brandId: 'continental-girbau',
    series: 'g-flex',
    seriesName: 'G-Flex Hard-Mount',
    model: 'RMG070',
    name: 'Continental Girbau RMG070 G-Flex',
    capacity: '70 lb',
    capacityLbs: 70,
    capacityKg: 32,
    type: 'washer',
    gForce: 200,
    features: ['200 G-Force Extraction', 'Hard-Mount Design', 'Industrial Capacity'],
    specs: {
      'G-Force': '200',
      'Mount Type': 'Hard-Mount',
      'Application': 'Commercial/Industrial'
    },
    idealFor: ['Large Operations', 'Industrial', 'Healthcare Systems']
  },
  // Dryers
  {
    id: 'cg-e-series-dryer-30',
    brandId: 'continental-girbau',
    series: 'e-series-dryer',
    seriesName: 'E-Series Dryers',
    model: 'E-Series 30',
    name: 'Continental Girbau E-Series 30 lb Dryer',
    capacity: '30 lb',
    capacityLbs: 30,
    capacityKg: 13.6,
    type: 'dryer',
    features: ['High Airflow', 'Lower Temperature Drying', 'Programmable Cycles', 'Energy Efficient'],
    specs: {
      'Airflow': 'High CFM',
      'Heat Source': 'Gas or Electric',
      'Control': 'Microprocessor'
    },
    idealFor: ['Laundromats', 'Multi-Housing', 'Small Hotels']
  },
  {
    id: 'cg-pro-series-dryer-50',
    brandId: 'continental-girbau',
    series: 'pro-series-dryer',
    seriesName: 'Pro Series II Dryers',
    model: 'CG5060',
    name: 'Continental Girbau Pro Series II 50 lb Dryer',
    capacity: '50 lb',
    capacityLbs: 50,
    capacityKg: 23,
    type: 'dryer',
    features: ['Industrial-Grade', 'High Airflow Circulation', 'Fast Drying', 'Heavy-Duty Components'],
    specs: {
      'Application': 'Commercial/Industrial',
      'Heat Source': 'Gas or Electric'
    },
    idealFor: ['High-Volume Operations', 'Hotels', 'Healthcare']
  },
  // Ironers
  {
    id: 'cg-express-ironer',
    brandId: 'continental-girbau',
    series: 'ironer',
    seriesName: 'Express Ironers',
    model: 'X13',
    name: 'Continental Girbau X13 Express Ironer',
    capacity: 'N/A',
    capacityLbs: 0,
    capacityKg: 0,
    type: 'ironer',
    features: ['Fast Ironing', 'Easy Operation', 'Compact Design', 'Professional Results'],
    specs: {
      'Roll Width': '13"',
      'Application': 'Linens, Sheets, Tablecloths'
    },
    idealFor: ['Hotels', 'Healthcare', 'Restaurants', 'Dry Cleaners']
  },
  {
    id: 'cg-compact-ironer',
    brandId: 'continental-girbau',
    series: 'ironer',
    seriesName: 'Compact Ironers',
    model: 'Compact',
    name: 'Continental Girbau Compact Ironer',
    capacity: 'N/A',
    capacityLbs: 0,
    capacityKg: 0,
    type: 'ironer',
    features: ['Space-Saving', 'Easy Operation', 'Versatile'],
    specs: {
      'Application': 'Small-Medium Volume Ironing'
    },
    idealFor: ['Small Hotels', 'B&Bs', 'Healthcare']
  }
];

// Combine all models
export const models: EquipmentModel[] = [...dexterModels, ...continentalModels];

// ============================================================================
// PARTS CATEGORIES
// ============================================================================

export const partCategories: PartCategory[] = [
  {
    id: 'bearings-seals',
    name: 'Bearings & Seals',
    slug: 'bearings-seals',
    description: 'High-quality replacement bearings and seals for commercial washers and dryers. Prevent water leaks and ensure smooth drum rotation.',
    commonParts: ['Main Bearings', 'Tub Seals', 'Shaft Seals', 'Bearing Kits', 'Lip Seals', 'Oil Seals'],
    compatibleBrands: ['Dexter', 'Continental Girbau', 'Maytag', 'Whirlpool', 'LG'],
    icon: 'Settings',
    searchKeywords: ['washer bearings', 'dryer bearings', 'commercial laundry seals', 'tub seal replacement', 'bearing kit']
  },
  {
    id: 'belts-pulleys',
    name: 'Belts & Pulleys',
    slug: 'belts-pulleys',
    description: 'OEM and aftermarket drive belts, v-belts, and pulleys for commercial laundry equipment. Keep your machines running at peak performance.',
    commonParts: ['Drive Belts', 'V-Belts', 'Poly-V Belts', 'Motor Pulleys', 'Drum Pulleys', 'Idler Pulleys', 'Belt Tensioners'],
    compatibleBrands: ['Dexter', 'Continental Girbau', 'Maytag', 'Whirlpool'],
    icon: 'RotateCw',
    searchKeywords: ['commercial dryer belt', 'washer drive belt', 'laundry machine pulley', 'belt replacement']
  },
  {
    id: 'motors-drives',
    name: 'Motors & Drives',
    slug: 'motors-drives',
    description: 'Replacement motors, motor drives, and related components for commercial washers and dryers. Restore power to your equipment.',
    commonParts: ['Drive Motors', 'Drain Motors', 'Blower Motors', 'Motor Capacitors', 'Variable Frequency Drives', 'Motor Controllers'],
    compatibleBrands: ['Dexter', 'Continental Girbau', 'Maytag', 'Whirlpool', 'LG', 'B&C Technologies'],
    icon: 'Zap',
    searchKeywords: ['commercial washer motor', 'dryer motor replacement', 'laundry machine motor', 'VFD drive']
  },
  {
    id: 'pumps-valves',
    name: 'Pumps & Valves',
    slug: 'pumps-valves',
    description: 'Water inlet valves, drain pumps, and related plumbing components for commercial laundry equipment.',
    commonParts: ['Drain Pumps', 'Water Inlet Valves', 'Solenoid Valves', 'Check Valves', 'Pump Motors', 'Valve Coils'],
    compatibleBrands: ['Dexter', 'Continental Girbau', 'Maytag', 'Whirlpool'],
    icon: 'Droplets',
    searchKeywords: ['washer drain pump', 'water valve', 'commercial laundry pump', 'inlet valve replacement']
  },
  {
    id: 'controls-electronics',
    name: 'Controls & Electronics',
    slug: 'controls-electronics',
    description: 'Control boards, timers, sensors, and electronic components for commercial laundry equipment diagnostics and repair.',
    commonParts: ['Main Control Boards', 'Timer Assemblies', 'Temperature Sensors', 'Pressure Switches', 'Door Switches', 'Coin Slides', 'Display Boards'],
    compatibleBrands: ['Dexter', 'Continental Girbau', 'Maytag', 'Whirlpool', 'LG'],
    icon: 'Cpu',
    searchKeywords: ['washer control board', 'dryer timer', 'laundry machine sensor', 'coin mechanism', 'electronic control']
  },
  {
    id: 'door-hardware',
    name: 'Door & Hardware',
    slug: 'door-hardware',
    description: 'Door locks, hinges, handles, gaskets, and related hardware for commercial washers and dryers.',
    commonParts: ['Door Locks', 'Door Hinges', 'Door Handles', 'Door Gaskets', 'Boot Seals', 'Latch Assemblies', 'Strike Plates'],
    compatibleBrands: ['Dexter', 'Continental Girbau', 'Maytag', 'Whirlpool', 'LG'],
    icon: 'DoorOpen',
    searchKeywords: ['washer door seal', 'dryer door latch', 'commercial laundry door lock', 'gasket replacement']
  },
  {
    id: 'coin-payment',
    name: 'Coin & Payment Systems',
    slug: 'coin-payment',
    description: 'Coin mechanisms, card readers, coin boxes, and payment system components for vended laundry operations.',
    commonParts: ['Coin Slides', 'Coin Acceptors', 'Coin Boxes', 'Card Readers', 'Payment Terminals', 'Token Systems', 'Coin Counters'],
    compatibleBrands: ['Dexter', 'Continental Girbau', 'Maytag', 'Whirlpool'],
    icon: 'Coins',
    searchKeywords: ['coin mechanism', 'card reader', 'laundry payment system', 'coin acceptor', 'coin slide replacement']
  },
  {
    id: 'heating-elements',
    name: 'Heating Elements',
    slug: 'heating-elements',
    description: 'Replacement heating elements, thermostats, and related components for commercial dryers and ironers.',
    commonParts: ['Heating Elements', 'Thermostats', 'High-Limit Thermostats', 'Thermal Fuses', 'Ignitors', 'Flame Sensors', 'Gas Valves'],
    compatibleBrands: ['Dexter', 'Continental Girbau', 'Maytag', 'Whirlpool'],
    icon: 'Flame',
    searchKeywords: ['dryer heating element', 'commercial dryer thermostat', 'gas valve', 'ignitor replacement']
  },
  {
    id: 'filters-vents',
    name: 'Filters & Vents',
    slug: 'filters-vents',
    description: 'Lint filters, lint screens, vent components, and air filtration parts for commercial dryers.',
    commonParts: ['Lint Filters', 'Lint Screens', 'Lint Traps', 'Vent Ducts', 'Exhaust Housings', 'Blower Wheels'],
    compatibleBrands: ['Dexter', 'Continental Girbau', 'Maytag', 'Whirlpool'],
    icon: 'Wind',
    searchKeywords: ['dryer lint filter', 'lint screen', 'commercial dryer vent', 'exhaust filter']
  },
  {
    id: 'chemicals-supplies',
    name: 'Chemicals & Supplies',
    slug: 'chemicals-supplies',
    description: 'Commercial laundry detergents, softeners, cleaning supplies, and maintenance products.',
    commonParts: ['Laundry Detergent', 'Fabric Softener', 'Bleach', 'Stain Removers', 'Descalers', 'Lubricants', 'Cleaning Supplies'],
    compatibleBrands: ['Universal'],
    icon: 'FlaskConical',
    searchKeywords: ['commercial laundry detergent', 'industrial soap', 'laundry chemicals', 'cleaning supplies']
  }
];

// ============================================================================
// INDUSTRY VERTICALS (For SEO Domination)
// ============================================================================

export const industryVerticals: IndustryVertical[] = [
  {
    id: 'laundromats',
    name: 'Laundromats & Coin Laundry',
    slug: 'laundromats',
    description: 'Vended laundry equipment for coin-operated and card-operated laundromat businesses. Maximize ROI with high-efficiency commercial washers and dryers.',
    icon: 'WashingMachine',
    keywords: ['laundromat equipment', 'coin laundry machines', 'vended laundry', 'coin-op washers', 'laundromat washers', 'commercial laundry equipment for laundromats'],
    equipmentNeeds: ['High G-Force Washers', 'Stack Dryers', 'Coin/Card Payment Systems', 'Changers', 'Folding Tables'],
    capacityRange: '20-120 lb washers, multiple units',
    typicalSetup: '10-50 washers, 20-100 dryers depending on size',
    challenges: ['Utility costs', 'Customer turnaround time', 'Machine durability', 'Payment collection'],
    solutions: ['200+ G-Force extraction reduces dry time', 'DexterLive monitoring', 'Mobile payment integration', 'Energy-efficient equipment']
  },
  {
    id: 'hotels-motels',
    name: 'Hotels & Motels',
    slug: 'hotels-motels',
    description: 'On-premise laundry (OPL) equipment for hotels, motels, resorts, and hospitality operations. Process linens, towels, and uniforms efficiently.',
    icon: 'Hotel',
    keywords: ['hotel laundry equipment', 'motel laundry machines', 'hospitality laundry', 'hotel OPL', 'resort laundry', 'commercial washers for hotels'],
    equipmentNeeds: ['Large Capacity Washers', 'High-Volume Dryers', 'Ironers', 'Folders', 'Finishing Equipment'],
    capacityRange: '40-130 lb washers for volume processing',
    typicalSetup: 'On-premise laundry room with 2-10 large washers and dryers',
    challenges: ['Fast turnaround for linens', 'Consistent quality', 'Space constraints', 'Labor costs'],
    solutions: ['High-capacity equipment', 'Automatic chemical injection', 'Programmable cycles for different fabrics', 'Ironers for professional finish']
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Hospitals',
    slug: 'healthcare',
    description: 'Medical-grade laundry equipment for hospitals, clinics, nursing homes, and healthcare facilities. Meet strict hygiene and sanitation standards.',
    icon: 'Heart',
    keywords: ['hospital laundry equipment', 'healthcare laundry machines', 'medical laundry', 'nursing home laundry', 'clinic laundry equipment', 'sanitary wash systems'],
    equipmentNeeds: ['Barrier Washers', 'High-Temperature Cycles', 'Contamination Prevention', 'Large Capacity'],
    capacityRange: '60-255 lb washers for high-volume medical laundry',
    typicalSetup: 'Separated clean/soiled areas with barrier washers',
    challenges: ['Infection control', 'Regulatory compliance', 'High volume', 'Contamination prevention'],
    solutions: ['Barrier washer-extractors', 'Programmable sanitization cycles', 'Automatic chemical dosing', 'HIPAA-compliant tracking']
  },
  {
    id: 'universities-schools',
    name: 'Universities & Schools',
    slug: 'universities-schools',
    description: 'Commercial laundry equipment for universities, colleges, dormitories, K-12 schools, and educational institutions.',
    icon: 'GraduationCap',
    keywords: ['university laundry equipment', 'college dorm washers', 'school laundry machines', 'dormitory laundry', 'campus laundry', 'student laundry facilities'],
    equipmentNeeds: ['Durable Vended Equipment', 'Card Payment Systems', 'High-Volume Capacity', 'Easy Maintenance'],
    capacityRange: '20-60 lb washers for student use',
    typicalSetup: 'Multiple laundry rooms across campus with card-operated machines',
    challenges: ['Heavy student use', 'Abuse/vandalism', 'Payment tracking', 'Maintenance scheduling'],
    solutions: ['Heavy-duty construction', 'Card/mobile payment', 'Remote monitoring', 'Tamper-resistant designs']
  },
  {
    id: 'apartments-multi-housing',
    name: 'Apartments & Multi-Housing',
    slug: 'apartments-multi-housing',
    description: 'Commercial laundry equipment for apartment complexes, condominiums, housing authorities, and multi-family residential properties.',
    icon: 'Building2',
    keywords: ['apartment laundry equipment', 'multi-housing laundry', 'condo laundry machines', 'residential laundry room', 'apartment washers', 'housing authority laundry'],
    equipmentNeeds: ['Reliable Vended Equipment', 'Compact Options', 'Card/Mobile Payment', 'Quiet Operation'],
    capacityRange: '20-40 lb washers for resident use',
    typicalSetup: 'Common laundry room with 4-20 machines',
    challenges: ['Resident satisfaction', 'Revenue collection', 'Space limitations', 'Noise concerns'],
    solutions: ['Quiet operation machines', 'Mobile payment apps', 'Compact stack units', 'Remote revenue tracking']
  },
  {
    id: 'churches-nonprofits',
    name: 'Churches & Nonprofits',
    slug: 'churches-nonprofits',
    description: 'Commercial laundry equipment for churches, religious organizations, shelters, food banks, and nonprofit organizations.',
    icon: 'Church',
    keywords: ['church laundry equipment', 'nonprofit laundry machines', 'shelter laundry', 'ministry laundry', 'charitable organization laundry'],
    equipmentNeeds: ['Budget-Friendly Options', 'Durable Equipment', 'Easy Operation', 'Versatile Capacity'],
    capacityRange: '20-80 lb depending on mission needs',
    typicalSetup: 'Mission laundry for homeless services or facility linens',
    challenges: ['Budget constraints', 'Volunteer operation', 'Heavy use periods', 'Varied laundry types'],
    solutions: ['Financing options', 'Simple controls', 'Durable construction', 'Flexible programming']
  },
  {
    id: 'fire-departments',
    name: 'Fire Departments & First Responders',
    slug: 'fire-departments',
    description: 'Specialized laundry equipment for fire departments, EMS, police, and first responder facilities. Properly clean and maintain turnout gear.',
    icon: 'Siren',
    keywords: ['fire department laundry', 'turnout gear washer', 'first responder laundry', 'firefighter gear cleaning', 'EMS laundry equipment'],
    equipmentNeeds: ['Turnout Gear Washers', 'Gentle Cycles', 'Contamination Removal', 'Specialized Programs'],
    capacityRange: '40-80 lb washers with specialized cycles',
    typicalSetup: 'Dedicated gear cleaning area with specialized equipment',
    challenges: ['Carcinogen removal', 'Gear preservation', 'NFPA compliance', 'Cross-contamination'],
    solutions: ['NFPA-compliant wash cycles', 'Gentle extraction for gear', 'Dedicated contaminated wash', 'Proper chemical dosing']
  },
  {
    id: 'correctional-facilities',
    name: 'Correctional Facilities & Prisons',
    slug: 'correctional-facilities',
    description: 'Heavy-duty commercial laundry equipment for prisons, jails, detention centers, and correctional facilities.',
    icon: 'Lock',
    keywords: ['prison laundry equipment', 'correctional facility laundry', 'jail laundry machines', 'detention center laundry', 'institutional laundry'],
    equipmentNeeds: ['Tamper-Proof Equipment', 'Lockout Controls', 'High-Volume Capacity', 'Automatic Chemical'],
    capacityRange: '80-255 lb for institutional volume',
    typicalSetup: 'Central laundry with inmate operation under supervision',
    challenges: ['Security concerns', 'Tampering prevention', 'High volume', 'Chemical security'],
    solutions: ['Lockout control panels', 'Tamper-resistant design', 'Automatic chemical injection', 'Simple operation']
  },
  {
    id: 'military-government',
    name: 'Military & Government',
    slug: 'military-government',
    description: 'Commercial laundry equipment for military bases, government facilities, VA hospitals, and federal installations.',
    icon: 'Shield',
    keywords: ['military laundry equipment', 'government laundry machines', 'VA hospital laundry', 'military base laundry', 'federal facility laundry'],
    equipmentNeeds: ['Heavy-Duty Construction', 'High Capacity', 'GSA Approved', 'Reliable Performance'],
    capacityRange: '60-255 lb for military-scale operations',
    typicalSetup: 'Base laundry facility or shipboard installation',
    challenges: ['Extreme conditions', 'High volume', 'Procurement requirements', 'Durability'],
    solutions: ['GSA-approved equipment', 'Marine-grade construction', 'Extended warranties', 'Global parts availability']
  },
  {
    id: 'dry-cleaners',
    name: 'Dry Cleaners & Garment Care',
    slug: 'dry-cleaners',
    description: 'Professional laundry equipment for dry cleaners, garment care facilities, wedding dress preservation, and specialty cleaning operations.',
    icon: 'Shirt',
    keywords: ['dry cleaner equipment', 'garment care laundry', 'professional laundry machines', 'wedding dress cleaning', 'specialty fabric care'],
    equipmentNeeds: ['Gentle Wash Cycles', 'Ironers', 'Pressing Equipment', 'Finishing Equipment'],
    capacityRange: '20-60 lb washers with specialty programs',
    typicalSetup: 'Front shop with back-of-house processing equipment',
    challenges: ['Delicate fabrics', 'Specialty stains', 'Professional finish', 'Customer expectations'],
    solutions: ['Programmable gentle cycles', 'Professional ironers', 'Steam finishing', 'Specialty chemical systems']
  },
  {
    id: 'sports-athletics',
    name: 'Sports & Athletics',
    slug: 'sports-athletics',
    description: 'Commercial laundry equipment for gyms, fitness centers, sports teams, stadiums, and athletic facilities.',
    icon: 'Trophy',
    keywords: ['gym laundry equipment', 'sports team laundry', 'athletic facility laundry', 'fitness center laundry', 'stadium laundry'],
    equipmentNeeds: ['Odor Removal', 'High-Volume Capacity', 'Quick Cycles', 'Durable Equipment'],
    capacityRange: '40-90 lb for uniforms and towels',
    typicalSetup: 'Team laundry room with multiple large machines',
    challenges: ['Heavy soil loads', 'Odor elimination', 'Quick turnaround', 'Uniform care'],
    solutions: ['Ozone injection', 'High-temperature cycles', 'Automatic chemical dosing', 'Programmable cycles']
  },
  {
    id: 'spas-salons',
    name: 'Spas & Salons',
    slug: 'spas-salons',
    description: 'Commercial laundry equipment for day spas, beauty salons, massage therapy, and wellness centers.',
    icon: 'Sparkles',
    keywords: ['spa laundry equipment', 'salon laundry machines', 'massage therapy laundry', 'wellness center laundry', 'beauty salon washers'],
    equipmentNeeds: ['Oil/Chemical Removal', 'Gentle Cycles', 'Compact Options', 'Quiet Operation'],
    capacityRange: '20-40 lb for towels and linens',
    typicalSetup: 'Back-of-house laundry area with 1-4 machines',
    challenges: ['Oil and chemical stains', 'Fabric softness', 'Limited space', 'Client-facing noise'],
    solutions: ['Specialty detergent cycles', 'Gentle wash programs', 'Compact equipment', 'Quiet operation']
  },
  {
    id: 'rv-parks-campgrounds',
    name: 'RV Parks & Campgrounds',
    slug: 'rv-parks-campgrounds',
    description: 'Vended laundry equipment for RV parks, campgrounds, marinas, and outdoor recreation facilities.',
    icon: 'Tent',
    keywords: ['RV park laundry', 'campground laundry equipment', 'marina laundry', 'outdoor recreation laundry', 'camper laundry facilities'],
    equipmentNeeds: ['Weather-Resistant', 'Vended Operation', 'Easy Maintenance', 'Reliable Performance'],
    capacityRange: '20-40 lb for guest use',
    typicalSetup: 'Guest laundry facility with 2-8 machines',
    challenges: ['Seasonal use', 'Weather exposure', 'Remote locations', 'Varied users'],
    solutions: ['Durable construction', 'Simple operation', 'Remote monitoring', 'Card/mobile payment']
  },
  {
    id: 'veterinary-animal',
    name: 'Veterinary & Animal Care',
    slug: 'veterinary-animal',
    description: 'Commercial laundry equipment for veterinary clinics, animal shelters, kennels, pet grooming, and animal care facilities.',
    icon: 'Dog',
    keywords: ['veterinary laundry equipment', 'animal shelter laundry', 'kennel laundry machines', 'pet grooming laundry', 'vet clinic washers'],
    equipmentNeeds: ['Heavy Soil Removal', 'Sanitization Cycles', 'Durable Equipment', 'Easy Cleaning'],
    capacityRange: '30-60 lb for bedding and towels',
    typicalSetup: 'Utility area with commercial washer and dryer',
    challenges: ['Heavy soiling', 'Odor control', 'Hair removal', 'Sanitization'],
    solutions: ['High-extract cycles', 'Sanitization programs', 'Easy-clean drums', 'Ozone options']
  },
  {
    id: 'restaurants-food-service',
    name: 'Restaurants & Food Service',
    slug: 'restaurants-food-service',
    description: 'Commercial laundry equipment for restaurants, catering, food service, and culinary operations.',
    icon: 'UtensilsCrossed',
    keywords: ['restaurant laundry equipment', 'food service laundry', 'commercial kitchen laundry', 'catering laundry machines', 'culinary laundry'],
    equipmentNeeds: ['Grease Removal', 'High-Temperature Wash', 'Quick Cycles', 'Compact Options'],
    capacityRange: '20-40 lb for linens and uniforms',
    typicalSetup: 'Back-of-house with compact commercial equipment',
    challenges: ['Grease and food stains', 'Quick turnaround', 'Limited space', 'Health codes'],
    solutions: ['High-temperature cycles', 'Specialty detergents', 'Compact equipment', 'Programmable sanitization']
  }
];

// ============================================================================
// FINANCING OPTIONS
// ============================================================================

export const financingOptions: FinancingOption[] = [
  {
    id: 'cleancare-lease',
    name: 'CleanCare Lease',
    provider: 'AAdvantage Laundry Systems',
    type: 'lease',
    description: 'No capital outlay leasing program with service and parts included. Lower water and utility bills with low monthly rates.',
    benefits: ['No Capital Outlay', 'Lower Utility Bills', 'Low Monthly Rates', 'Tax Incentives', 'All Service & Parts Included', 'Superior Service'],
    idealFor: ['New Investors', 'Budget-Conscious Operators', 'Risk-Averse Businesses']
  },
  {
    id: 'purchase',
    name: 'Equipment Purchase',
    provider: 'AAdvantage Laundry Systems',
    type: 'purchase',
    description: 'Flexible financing to purchase equipment outright. Keep 100% of revenue with equipment cost including installation.',
    benefits: ['Flexible Financing', 'Superior Service & Maintenance Plans', 'Keep 100% of Revenue', 'Installation Included', 'Free Consultation', 'Best Equipment Selection'],
    idealFor: ['Established Operators', 'Long-Term Investment', 'Maximum Revenue Retention']
  },
  {
    id: 'rightroute-lease',
    name: 'RightRoute Lease',
    provider: 'AAdvantage Laundry Systems',
    type: 'rental',
    description: 'Route-based leasing program with friendly terms, lower utility costs, and improved resident satisfaction.',
    benefits: ['No Capital Outlay', 'Friendly Lease Terms', 'Lower Utility Bills', 'Increased ROI', 'Improved Resident Satisfaction', 'Superior Service'],
    idealFor: ['Multi-Housing Properties', 'Route Operations', 'Property Managers']
  },
  {
    id: 'dexter-financial',
    name: 'Dexter Financial Services',
    provider: 'Dexter Laundry',
    type: 'purchase',
    description: 'Competitive financing rates directly from Dexter with flexible terms for new equipment purchases.',
    benefits: ['Competitive Fixed Rates', 'Flexible Terms', 'Direct Manufacturer Financing', 'Quick Approval'],
    idealFor: ['Dexter Equipment Purchases', 'New Laundromat Startups']
  },
  {
    id: 'continental-financing',
    name: 'Custom Select Financing',
    provider: 'Continental Girbau',
    type: 'purchase',
    description: 'Flexible financing targeted to your specific project requirements with competitive fixed rates.',
    benefits: ['Competitive Fixed Rates', 'Project-Specific Options', 'Flexible Programs', 'Long-Term Investment'],
    idealFor: ['Continental Equipment', 'Large Projects', 'Custom Installations']
  }
];

// ============================================================================
// FAQs (For SEO)
// ============================================================================

export const faqs: FAQ[] = [
  // Equipment Selection
  {
    id: 'faq-1',
    question: 'What is the difference between Dexter Express and C-Series washers?',
    answer: 'Dexter Express washers feature 200 G-force extraction compared to 100 G-force in C-Series machines. This higher extraction removes 25% more water, reducing dry time by up to 10 minutes per load. Express machines are ideal for high-volume operations where faster turnaround increases revenue.',
    category: 'Equipment Selection',
    keywords: ['Dexter Express', 'C-Series', 'G-force', 'extraction speed', 'commercial washer comparison']
  },
  {
    id: 'faq-2',
    question: 'What size commercial washer do I need for my laundromat?',
    answer: 'Laundromat equipment mix typically includes: 40% small (20-30 lb), 35% medium (40-55 lb), and 25% large (60-80+ lb) capacity washers. This mix accommodates everyday loads while offering profitable large-capacity options. Consider your demographics and local competition when planning.',
    category: 'Equipment Selection',
    keywords: ['laundromat equipment mix', 'washer size', 'capacity planning', 'commercial washer sizing']
  },
  {
    id: 'faq-3',
    question: 'Is Continental Girbau or Dexter better for my business?',
    answer: 'Both are excellent choices with different strengths. Dexter offers Made-in-USA quality with industry-leading warranties and smart technology (DexterLive, DexterPay). Continental Girbau offers superior G-force (up to 405G vs 200G) for faster drying. Your choice depends on priorities: Dexter for warranty/support, Continental for maximum extraction efficiency.',
    category: 'Equipment Selection',
    keywords: ['Dexter vs Continental', 'commercial washer brands', 'laundry equipment comparison']
  },
  {
    id: 'faq-4',
    question: 'What is G-force and why does it matter for commercial washers?',
    answer: 'G-force measures centrifugal extraction force during the spin cycle. Higher G-force (200-405G) removes more water from clothes, reducing dry time and utility costs. Dexter Express offers 200G while Continental ExpressWash reaches 400-405G. Higher G-force = faster customer turnaround and lower operating costs.',
    category: 'Equipment Selection',
    keywords: ['G-force', 'extraction', 'spin speed', 'water removal', 'commercial washer specs']
  },
  // Financing
  {
    id: 'faq-5',
    question: 'How much does commercial laundry equipment cost?',
    answer: 'Commercial washers range from $3,000-$15,000+ depending on capacity and features. Dryers range from $2,500-$10,000+. A complete laundromat setup typically costs $200,000-$500,000+ including equipment, installation, and buildout. Financing options are available with $0 down through lease programs.',
    category: 'Financing',
    keywords: ['commercial washer cost', 'laundromat equipment price', 'laundry machine cost', 'equipment financing']
  },
  {
    id: 'faq-6',
    question: 'Can I finance commercial laundry equipment with no money down?',
    answer: 'Yes! AAdvantage Laundry Systems offers CleanCare and RightRoute lease programs with zero capital outlay. These programs include service, parts, and lower utility bills with tax incentives. Traditional financing is also available with competitive rates and flexible terms.',
    category: 'Financing',
    keywords: ['no money down', 'equipment financing', 'laundry lease', 'zero down payment']
  },
  {
    id: 'faq-7',
    question: 'What financing options are available for laundromat equipment?',
    answer: 'Options include: 1) Full purchase with financing (keep 100% revenue), 2) CleanCare lease (no capital outlay, service included), 3) RightRoute lease (ideal for multi-housing), 4) Dexter Financial Services, and 5) Continental Custom Select Financing. Each option suits different business situations.',
    category: 'Financing',
    keywords: ['equipment financing', 'laundromat financing', 'lease vs buy', 'laundry business financing']
  },
  // Installation & Service
  {
    id: 'faq-8',
    question: 'How long does commercial laundry equipment installation take?',
    answer: 'Installation typically takes 1-3 days for a complete laundromat depending on size. This includes equipment placement, plumbing connections, electrical hookups, and testing. AAdvantage provides turnkey installation with their equipment purchases, ensuring proper setup and operation.',
    category: 'Installation',
    keywords: ['equipment installation', 'laundromat setup', 'commercial washer installation']
  },
  {
    id: 'faq-9',
    question: 'Do Dexter and Continental Girbau require special installation?',
    answer: 'Dexter machines are designed to fit through standard 36" doorways. Continental ExpressWash soft-mount machines don\'t require bolting to concrete foundations thanks to their MDS vibration system. Hard-mount machines (like Continental G-Flex) require concrete foundations. Professional installation is recommended for all commercial equipment.',
    category: 'Installation',
    keywords: ['installation requirements', 'concrete foundation', 'soft-mount', 'hard-mount installation']
  },
  {
    id: 'faq-10',
    question: 'What warranty comes with commercial laundry equipment?',
    answer: 'Dexter offers industry-leading warranties: 10 years on frame, outer tub, cylinder, main shaft, seals, and bearings, plus 5 years on other parts. Continental Girbau offers 3-5 year parts warranties. Both include lifetime technical support. Extended warranty options are available.',
    category: 'Service',
    keywords: ['equipment warranty', 'Dexter warranty', 'Continental warranty', 'commercial laundry warranty']
  },
  // Parts & Maintenance
  {
    id: 'faq-11',
    question: 'Where can I buy replacement parts for commercial washers and dryers?',
    answer: 'AAdvantage Laundry Systems maintains the largest parts inventory in the region for Dexter, Continental Girbau, Maytag, Whirlpool, and other brands. They offer 24-hour parts availability with 65+ master technicians for installation and repair. Contact them at 1-800-880-2138 for parts orders.',
    category: 'Parts',
    keywords: ['replacement parts', 'commercial laundry parts', 'washer parts', 'dryer parts', 'parts supplier']
  },
  {
    id: 'faq-12',
    question: 'How often should commercial laundry equipment be serviced?',
    answer: 'Recommended maintenance: Daily lint screen cleaning, weekly exterior wipe-down and coin box emptying, monthly bearing inspection and belt check, quarterly deep cleaning and professional inspection, and annual comprehensive service. Regular maintenance extends equipment life and prevents costly breakdowns.',
    category: 'Maintenance',
    keywords: ['equipment maintenance', 'service schedule', 'preventive maintenance', 'commercial laundry maintenance']
  },
  {
    id: 'faq-13',
    question: 'What are the most common commercial washer repairs?',
    answer: 'Common repairs include: bearing and seal replacement, belt replacement, drain pump issues, door lock/latch problems, control board failures, water inlet valve replacement, and coin mechanism issues. Many repairs can be prevented with regular maintenance and quality OEM parts.',
    category: 'Parts',
    keywords: ['common repairs', 'washer repair', 'commercial laundry repair', 'troubleshooting']
  },
  // Industry-Specific
  {
    id: 'faq-14',
    question: 'What laundry equipment do hotels need?',
    answer: 'Hotels need high-capacity OPL (on-premise laundry) equipment: 60-130 lb washers for sheets/towels, commercial dryers, ironers for linens, and possibly folders. Automatic chemical injection ensures consistent results. Consider Continental ExpressWash for maximum water extraction and faster processing.',
    category: 'Industry',
    keywords: ['hotel laundry', 'OPL equipment', 'hospitality laundry', 'hotel washers']
  },
  {
    id: 'faq-15',
    question: 'What equipment do I need for a multi-housing laundry room?',
    answer: 'Multi-housing laundry rooms typically need: 20-40 lb washers (mix of capacities), matching dryers, card or mobile payment systems, and potentially stack units for space efficiency. Look for quiet operation and reliable performance. Remote monitoring helps manage multiple properties.',
    category: 'Industry',
    keywords: ['apartment laundry', 'multi-housing equipment', 'condo laundry', 'property laundry']
  },
  {
    id: 'faq-16',
    question: 'What special equipment do healthcare facilities need?',
    answer: 'Healthcare facilities require: barrier washer-extractors (separate clean/soiled sides), high-temperature sanitization cycles, automatic chemical injection for infection control, and large capacity for linens/gowns. Equipment must meet healthcare regulations and infection control standards.',
    category: 'Industry',
    keywords: ['healthcare laundry', 'hospital equipment', 'medical laundry', 'barrier washer']
  },
  // Technology
  {
    id: 'faq-17',
    question: 'What is DexterLive and how does it work?',
    answer: 'DexterLive is Dexter\'s cloud-based management system that connects your machines to the internet. It provides real-time monitoring, revenue tracking, fault alerts, remote diagnostics, and machine management from any device. It\'s included with X-Series machines and compatible with most Dexter equipment.',
    category: 'Technology',
    keywords: ['DexterLive', 'remote monitoring', 'laundry management', 'cloud laundry', 'smart laundry']
  },
  {
    id: 'faq-18',
    question: 'Can customers pay with their phone at my laundromat?',
    answer: 'Yes! Dexter offers DexterPay for QR-code mobile payments with no annual fees (pay only when customers use it). Other options include LaundryCard, SpyderWash, and various card payment systems. Mobile payment increases customer convenience and reduces coin handling.',
    category: 'Technology',
    keywords: ['mobile payment', 'DexterPay', 'contactless payment', 'laundromat payment systems']
  }
];

// ============================================================================
// EQUIPMENT CATEGORIES
// ============================================================================

export const equipmentCategories = [
  {
    id: 'washers',
    name: 'Commercial Washers',
    slug: 'commercial-washers',
    description: 'High-performance commercial washing machines for every application - from 20 lb coin-op to 255 lb industrial extractors.',
    icon: 'WashingMachine',
    subcategories: ['Coin/Card Operated', 'On-Premise (OPL)', 'Express High-Extract', 'Industrial']
  },
  {
    id: 'dryers',
    name: 'Commercial Dryers',
    slug: 'commercial-dryers',
    description: 'Energy-efficient commercial tumble dryers designed for fast, thorough drying with minimal utility costs.',
    icon: 'Wind',
    subcategories: ['Single Pocket', 'Stack Dryers', 'Industrial Dryers']
  },
  {
    id: 'stacks',
    name: 'Stack Units',
    slug: 'stack-washer-dryers',
    description: 'Space-saving washer-dryer combinations for laundromats, multi-housing, and locations with limited floor space.',
    icon: 'Layers',
    subcategories: ['Washer-Dryer Stacks', 'Dryer Stacks']
  },
  {
    id: 'changers',
    name: 'Changers & Payment',
    slug: 'coin-changers-payment',
    description: 'Bill changers, coin mechanisms, card readers, and payment systems for vended laundry operations.',
    icon: 'Coins',
    subcategories: ['Bill Changers', 'Coin Mechanisms', 'Card Systems', 'Mobile Payment']
  },
  {
    id: 'finishing',
    name: 'Finishing Equipment',
    slug: 'finishing-equipment',
    description: 'Professional ironers, folders, and finishing equipment for hotels, healthcare, and commercial laundry operations.',
    icon: 'Shirt',
    subcategories: ['Ironers', 'Folders', 'Feeders', 'Presses']
  },
  {
    id: 'parts',
    name: 'Parts & Supplies',
    slug: 'parts-supplies',
    description: 'OEM and aftermarket replacement parts, chemicals, and supplies for all major commercial laundry brands.',
    icon: 'Wrench',
    subcategories: ['Bearings & Seals', 'Belts & Pulleys', 'Motors', 'Controls', 'Chemicals']
  }
];

// ============================================================================
// SEO KEYWORDS
// ============================================================================

export const seoKeywords = {
  primary: [
    'commercial laundry equipment',
    'laundromat equipment',
    'commercial washers',
    'commercial dryers',
    'Dexter laundry equipment',
    'Continental Girbau equipment'
  ],
  secondary: [
    'coin operated washers',
    'vended laundry equipment',
    'on-premise laundry',
    'OPL equipment',
    'commercial laundry parts',
    'laundry equipment financing'
  ],
  longTail: [
    'best commercial washer for laundromat',
    'Dexter vs Continental Girbau',
    'how much does laundromat equipment cost',
    'commercial laundry equipment near me',
    'Dexter washer parts',
    'Continental Girbau parts',
    'hotel laundry equipment',
    'healthcare laundry machines',
    'university laundry equipment',
    'apartment laundry machines',
    'fire department turnout gear washer',
    'commercial laundry equipment financing no money down'
  ],
  industries: industryVerticals.flatMap(v => v.keywords)
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getBrandById(id: string): EquipmentBrand | undefined {
  return brands.find(b => b.id === id);
}

export function getModelsByBrand(brandId: string): EquipmentModel[] {
  return models.filter(m => m.brandId === brandId);
}

export function getModelsBySeries(series: string): EquipmentModel[] {
  return models.filter(m => m.series === series);
}

export function getModelsByType(type: EquipmentModel['type']): EquipmentModel[] {
  return models.filter(m => m.type === type);
}

export function getPopularModels(): EquipmentModel[] {
  return models.filter(m => m.isPopular);
}

export function getPartCategoryById(id: string): PartCategory | undefined {
  return partCategories.find(p => p.id === id);
}

export function getIndustryById(id: string): IndustryVertical | undefined {
  return industryVerticals.find(i => i.id === id);
}

export function getFaqsByCategory(category: string): FAQ[] {
  return faqs.filter(f => f.category === category);
}

export function searchEquipment(query: string): EquipmentModel[] {
  const lowerQuery = query.toLowerCase();
  return models.filter(m => 
    m.name.toLowerCase().includes(lowerQuery) ||
    m.model.toLowerCase().includes(lowerQuery) ||
    m.features.some(f => f.toLowerCase().includes(lowerQuery)) ||
    m.idealFor.some(i => i.toLowerCase().includes(lowerQuery))
  );
}
