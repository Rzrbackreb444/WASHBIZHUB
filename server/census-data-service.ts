/**
 * US Census Bureau Data Enrichment Service
 * 
 * Provides demographic data for CLEANBI scoring:
 * - Population density
 * - Median household income
 * - Renter percentage
 * - Housing units
 * - Age distribution
 * 
 * Uses Census Bureau's free API (no key required for basic access)
 * Data source: American Community Survey (ACS) 5-Year Estimates
 */

export interface CensusData {
  population: number;
  populationDensity: number;
  medianHouseholdIncome: number;
  renterPercentage: number;
  housingUnits: number;
  vacancyRate: number;
  medianAge: number;
  householdsWithChildren: number;
  povertyRate: number;
  unemploymentRate: number;
  educationBachelorOrHigher: number;
  dataYear: number;
  geoLevel: 'tract' | 'zip' | 'county' | 'state';
  confidence: number;
}

export interface CensusEnrichmentResult {
  success: boolean;
  data: CensusData | null;
  source: 'census_api' | 'zip_estimate' | 'fallback';
  error?: string;
}

const CENSUS_API_BASE = 'https://api.census.gov/data';
const ACS_YEAR = '2022';
const ACS_DATASET = 'acs/acs5';

const censusCache: Map<string, { data: CensusData; timestamp: number }> = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

const zipToFipsCache: Map<string, { state: string; county: string } | null> = new Map();

const ZIP_PREFIX_TO_COUNTY: Record<string, { state: string; county: string }> = {
  // New York City area
  '100': { state: '36', county: '061' },
  '101': { state: '36', county: '061' },
  '102': { state: '36', county: '061' },
  '103': { state: '36', county: '005' },
  '104': { state: '36', county: '047' },
  '112': { state: '36', county: '047' },
  '113': { state: '36', county: '081' },
  '114': { state: '36', county: '081' },
  // Washington DC
  '200': { state: '11', county: '001' },
  // Arkansas - Fort Smith (Sebastian County 131)
  '729': { state: '05', county: '131' }, // Fort Smith (THE WASHROOM location)
  '728': { state: '05', county: '131' }, // Fort Smith area
  // Arkansas - Little Rock (Pulaski County 119)
  '721': { state: '05', county: '119' }, // Little Rock
  '722': { state: '05', county: '119' }, // Little Rock area
  // Arkansas - Northwest (Washington County 143, Benton County 007)
  '727': { state: '05', county: '143' }, // Fayetteville/Washington Co
  '726': { state: '05', county: '007' }, // Bentonville/Benton Co
  // Arkansas - Northeast (Craighead County 031)
  '724': { state: '05', county: '031' }, // Jonesboro
  '201': { state: '11', county: '001' },
  '202': { state: '11', county: '001' },
  '203': { state: '11', county: '001' },
  '204': { state: '11', county: '001' },
  '205': { state: '11', county: '001' },
  '206': { state: '11', county: '001' },
  '207': { state: '11', county: '001' },
  '208': { state: '11', county: '001' },
  '209': { state: '11', county: '001' },
  '900': { state: '06', county: '037' },
  '901': { state: '06', county: '037' },
  '902': { state: '06', county: '037' },
  '903': { state: '06', county: '037' },
  '904': { state: '06', county: '037' },
  '905': { state: '06', county: '037' },
  '906': { state: '06', county: '037' },
  '907': { state: '06', county: '037' },
  '908': { state: '06', county: '037' },
  '909': { state: '06', county: '071' },
  '910': { state: '06', county: '037' },
  '911': { state: '06', county: '037' },
  '912': { state: '06', county: '037' },
  '913': { state: '06', county: '037' },
  '914': { state: '06', county: '037' },
  '915': { state: '06', county: '037' },
  '916': { state: '06', county: '037' },
  '917': { state: '06', county: '037' },
  '918': { state: '06', county: '037' },
  '919': { state: '06', county: '059' },
  '920': { state: '06', county: '073' },
  '921': { state: '06', county: '073' },
  '922': { state: '06', county: '073' },
  '923': { state: '06', county: '073' },
  '924': { state: '06', county: '071' },
  '925': { state: '06', county: '071' },
  '926': { state: '06', county: '059' },
  '927': { state: '06', county: '059' },
  '928': { state: '06', county: '059' },
  '606': { state: '17', county: '031' },
  '607': { state: '17', county: '031' },
  '608': { state: '17', county: '031' },
  '330': { state: '12', county: '086' },
  '331': { state: '12', county: '086' },
  '332': { state: '12', county: '086' },
  '333': { state: '12', county: '011' },
  '770': { state: '48', county: '201' },
  '771': { state: '48', county: '201' },
  '772': { state: '48', county: '201' },
  '773': { state: '48', county: '201' },
  '774': { state: '48', county: '201' },
  '775': { state: '48', county: '201' },
  '303': { state: '13', county: '121' },
  '304': { state: '13', county: '121' },
  '305': { state: '13', county: '121' },
  '306': { state: '13', county: '121' },
  '850': { state: '04', county: '013' },
  '851': { state: '04', county: '013' },
  '852': { state: '04', county: '013' },
  '853': { state: '04', county: '013' },
  '750': { state: '48', county: '113' },
  '751': { state: '48', county: '113' },
  '752': { state: '48', county: '113' },
  '753': { state: '48', county: '113' },
  '980': { state: '53', county: '033' },
  '981': { state: '53', county: '033' },
  '982': { state: '53', county: '033' },
  '983': { state: '53', county: '033' },
  '984': { state: '53', county: '033' },
  '190': { state: '42', county: '101' },
  '191': { state: '42', county: '101' },
  '192': { state: '42', county: '101' },
  '193': { state: '42', county: '045' },
  '194': { state: '42', county: '045' },
  '021': { state: '25', county: '025' },
  '022': { state: '25', county: '025' },
  '023': { state: '25', county: '025' },
  '941': { state: '06', county: '075' },
  '940': { state: '06', county: '075' },
};

const DEFAULT_DEMOGRAPHICS: CensusData = {
  population: 25000,
  populationDensity: 3000,
  medianHouseholdIncome: 55000,
  renterPercentage: 45,
  housingUnits: 10000,
  vacancyRate: 8,
  medianAge: 38,
  householdsWithChildren: 30,
  povertyRate: 12,
  unemploymentRate: 5,
  educationBachelorOrHigher: 32,
  dataYear: parseInt(ACS_YEAR),
  geoLevel: 'county',
  confidence: 30
};

async function fetchCensusData(
  stateCode: string,
  countyCode?: string,
  tractCode?: string
): Promise<any[]> {
  const variables = [
    'B01003_001E',
    'B19013_001E',
    'B25003_002E',
    'B25003_003E',
    'B25001_001E',
    'B25002_003E',
    'B01002_001E',
    'B11005_002E',
    'B17001_002E',
    'B23025_005E',
    'B15003_022E',
    'B15003_023E',
    'B15003_024E',
    'B15003_025E'
  ].join(',');

  let geoQuery: string;
  if (tractCode && countyCode) {
    geoQuery = `for=tract:${tractCode}&in=state:${stateCode}&in=county:${countyCode}`;
  } else if (countyCode) {
    geoQuery = `for=county:${countyCode}&in=state:${stateCode}`;
  } else {
    geoQuery = `for=state:${stateCode}`;
  }

  const url = `${CENSUS_API_BASE}/${ACS_YEAR}/${ACS_DATASET}?get=${variables}&${geoQuery}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Census API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Census API fetch error:', error);
    throw error;
  }
}

function parseCensusResponse(data: any[], geoLevel: 'tract' | 'county' | 'state'): CensusData {
  if (!data || data.length < 2) {
    throw new Error('Invalid Census response format');
  }

  const headers = data[0];
  const values = data[1];
  
  const getValue = (varName: string): number => {
    const idx = headers.indexOf(varName);
    if (idx === -1) return 0;
    const val = parseInt(values[idx]);
    return isNaN(val) || val < 0 ? 0 : val;
  };

  const population = getValue('B01003_001E');
  const medianIncome = getValue('B19013_001E');
  const ownerOccupied = getValue('B25003_002E');
  const renterOccupied = getValue('B25003_003E');
  const totalHousing = getValue('B25001_001E');
  const vacantUnits = getValue('B25002_003E');
  const medianAge = getValue('B01002_001E');
  const householdsWithKids = getValue('B11005_002E');
  const belowPoverty = getValue('B17001_002E');
  const unemployed = getValue('B23025_005E');
  
  const bachelorDegree = getValue('B15003_022E');
  const mastersDegree = getValue('B15003_023E');
  const professionalDegree = getValue('B15003_024E');
  const doctorate = getValue('B15003_025E');
  const higherEd = bachelorDegree + mastersDegree + professionalDegree + doctorate;

  const totalOccupied = ownerOccupied + renterOccupied;
  const renterPct = totalOccupied > 0 ? (renterOccupied / totalOccupied) * 100 : 45;
  const vacancyRate = totalHousing > 0 ? (vacantUnits / totalHousing) * 100 : 8;
  const povertyRate = population > 0 ? (belowPoverty / population) * 100 : 12;
  
  // Population Density Estimation by Geographic Level
  // Key insight: Laundromat trade area is typically 1-mile radius (~3 sq mi)
  // County-level data includes rural areas which artificially lowers density
  // We need to estimate the URBAN/SUBURBAN density where laundromats are located
  
  let density: number;
  if (geoLevel === 'tract') {
    // Census tracts are ~1-2 sq mi in urban areas
    density = population / 1.5;
  } else if (geoLevel === 'county') {
    // For county-level data, we can't just divide by total county area
    // Instead, estimate urban/suburban density based on:
    // - Total county population indicates urbanization level
    // - Laundromats are in developed areas, not rural farmland
    // 
    // Heuristic: Counties with 50K+ population have cities/suburbs
    // Estimate that 60-80% of population lives in urban/suburban areas
    // covering perhaps 10-20% of the county land area
    
    if (population > 200000) {
      // Large metro county - high urban density
      density = (population * 0.7) / (50); // ~70% urban population in ~50 sq mi core
    } else if (population > 100000) {
      // Mid-size county (like Sebastian Co, Fort Smith ~130K)
      density = (population * 0.6) / (40); // ~60% in ~40 sq mi developed area
    } else if (population > 50000) {
      // Small city county
      density = (population * 0.5) / (30);
    } else {
      // Rural county - lower but still estimate developed area
      density = (population * 0.4) / (25);
    }
    console.log(`📊 County density estimation: ${population} pop → ~${Math.round(density)}/sq mi (urban core estimate)`);
  } else {
    // State level - use standard state density calc
    density = population / 2500;
  }

  const confidence = geoLevel === 'tract' ? 95 : geoLevel === 'county' ? 80 : 60;

  return {
    population,
    populationDensity: Math.round(density),
    medianHouseholdIncome: medianIncome > 0 ? medianIncome : 55000,
    renterPercentage: Math.round(renterPct * 10) / 10,
    housingUnits: totalHousing,
    vacancyRate: Math.round(vacancyRate * 10) / 10,
    medianAge: medianAge > 0 ? medianAge : 38,
    householdsWithChildren: householdsWithKids,
    povertyRate: Math.round(povertyRate * 10) / 10,
    unemploymentRate: 5,
    educationBachelorOrHigher: Math.round((higherEd / population) * 1000) / 10,
    dataYear: parseInt(ACS_YEAR),
    geoLevel,
    confidence
  };
}

async function getStateCountyFromZip(zipCode: string): Promise<{ state: string; county: string } | null> {
  if (zipToFipsCache.has(zipCode)) {
    return zipToFipsCache.get(zipCode) || null;
  }

  const prefix = zipCode.substring(0, 3);
  
  if (ZIP_PREFIX_TO_COUNTY[prefix]) {
    const fips = ZIP_PREFIX_TO_COUNTY[prefix];
    zipToFipsCache.set(zipCode, fips);
    console.log(`📍 ZIP ${zipCode} → State ${fips.state}, County ${fips.county}`);
    return fips;
  }

  try {
    const url = `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?address=${encodeURIComponent(zipCode)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    
    if (response.ok) {
      const data = await response.json();
      const match = data?.result?.addressMatches?.[0];
      if (match?.geographies?.['Census Tracts']?.[0]) {
        const tract = match.geographies['Census Tracts'][0];
        const fips = {
          state: tract.STATE,
          county: tract.COUNTY
        };
        zipToFipsCache.set(zipCode, fips);
        console.log(`📍 Census Geocoder: ZIP ${zipCode} → State ${fips.state}, County ${fips.county}`);
        return fips;
      }
    }
  } catch (err) {
    console.debug('Census geocoder timeout/error, using fallback');
  }

  zipToFipsCache.set(zipCode, null);
  return null;
}

const STATE_CODES: Record<string, string> = {
  'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06',
  'CO': '08', 'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12',
  'GA': '13', 'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18',
  'IA': '19', 'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23',
  'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28',
  'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
  'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38',
  'OH': '39', 'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44',
  'SC': '45', 'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49',
  'VT': '50', 'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55',
  'WY': '56', 'PR': '72'
};

const ZIP_DEMOGRAPHICS: Record<string, Partial<CensusData>> = {
  '90210': { medianHouseholdIncome: 195000, renterPercentage: 35, populationDensity: 4500 },
  '10001': { medianHouseholdIncome: 95000, renterPercentage: 85, populationDensity: 45000 },
  '60601': { medianHouseholdIncome: 85000, renterPercentage: 75, populationDensity: 15000 },
  '33139': { medianHouseholdIncome: 65000, renterPercentage: 80, populationDensity: 12000 },
  '75201': { medianHouseholdIncome: 78000, renterPercentage: 70, populationDensity: 8000 },
  '98101': { medianHouseholdIncome: 92000, renterPercentage: 72, populationDensity: 18000 },
  '30301': { medianHouseholdIncome: 55000, renterPercentage: 68, populationDensity: 4000 },
  '85001': { medianHouseholdIncome: 48000, renterPercentage: 55, populationDensity: 3500 },
  '19101': { medianHouseholdIncome: 42000, renterPercentage: 62, populationDensity: 11000 },
  '02101': { medianHouseholdIncome: 75000, renterPercentage: 65, populationDensity: 14000 }
};

export async function enrichWithCensusData(
  zipCode?: string,
  stateAbbr?: string,
  coords?: { lat: number; lng: number }
): Promise<CensusEnrichmentResult> {
  const cacheKey = zipCode || `${coords?.lat},${coords?.lng}` || stateAbbr || 'default';
  
  const cached = censusCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📊 Census cache hit: ${cacheKey}`);
    return { success: true, data: cached.data, source: 'census_api' };
  }

  try {
    if (zipCode) {
      const fips = await getStateCountyFromZip(zipCode);
      
      if (fips) {
        try {
          const censusResponse = await fetchCensusData(fips.state, fips.county);
          const data = parseCensusResponse(censusResponse, 'county');
          
          if (ZIP_DEMOGRAPHICS[zipCode]) {
            Object.assign(data, ZIP_DEMOGRAPHICS[zipCode]);
            data.confidence = 90;
            data.geoLevel = 'zip';
          }
          
          censusCache.set(cacheKey, { data, timestamp: Date.now() });
          console.log(`✅ Census COUNTY data enriched for ${zipCode}: income=$${data.medianHouseholdIncome}, renters=${data.renterPercentage}%, confidence=${data.confidence}%`);
          
          return { success: true, data, source: 'census_api' };
        } catch (countyError) {
          console.warn('County-level Census API failed, trying state-level:', countyError);
        }
      }
    }

    if (stateAbbr && STATE_CODES[stateAbbr.toUpperCase()]) {
      const stateCode = STATE_CODES[stateAbbr.toUpperCase()];
      
      try {
        const censusResponse = await fetchCensusData(stateCode);
        const data = parseCensusResponse(censusResponse, 'state');
        
        if (zipCode && ZIP_DEMOGRAPHICS[zipCode]) {
          Object.assign(data, ZIP_DEMOGRAPHICS[zipCode]);
          data.confidence = 85;
          data.geoLevel = 'zip';
        }
        
        censusCache.set(cacheKey, { data, timestamp: Date.now() });
        console.log(`✅ Census STATE data enriched for ${stateAbbr}: income=$${data.medianHouseholdIncome}, renters=${data.renterPercentage}%`);
        
        return { success: true, data, source: 'census_api' };
      } catch (apiError) {
        console.warn('Census API failed, using ZIP estimate:', apiError);
      }
    }

    if (zipCode) {
      const zipData = ZIP_DEMOGRAPHICS[zipCode];
      if (zipData) {
        const data: CensusData = {
          ...DEFAULT_DEMOGRAPHICS,
          ...zipData,
          geoLevel: 'zip',
          confidence: 75
        };
        
        censusCache.set(cacheKey, { data, timestamp: Date.now() });
        return { success: true, data, source: 'zip_estimate' };
      }

      const zipPrefix = zipCode.substring(0, 3);
      const regionData = estimateByZipPrefix(zipPrefix);
      
      censusCache.set(cacheKey, { data: regionData, timestamp: Date.now() });
      return { success: true, data: regionData, source: 'zip_estimate' };
    }

    return { 
      success: true, 
      data: { ...DEFAULT_DEMOGRAPHICS, confidence: 30 }, 
      source: 'fallback' 
    };

  } catch (error: any) {
    console.error('Census enrichment error:', error.message);
    return { 
      success: false, 
      data: DEFAULT_DEMOGRAPHICS, 
      source: 'fallback',
      error: error.message 
    };
  }
}

function estimateByZipPrefix(prefix: string): CensusData {
  const regionProfiles: Record<string, Partial<CensusData>> = {
    '100': { medianHouseholdIncome: 72000, renterPercentage: 70, populationDensity: 28000 },
    '900': { medianHouseholdIncome: 78000, renterPercentage: 55, populationDensity: 8000 },
    '606': { medianHouseholdIncome: 65000, renterPercentage: 65, populationDensity: 12000 },
    '770': { medianHouseholdIncome: 58000, renterPercentage: 48, populationDensity: 3500 },
    '331': { medianHouseholdIncome: 55000, renterPercentage: 60, populationDensity: 4500 },
    '303': { medianHouseholdIncome: 62000, renterPercentage: 52, populationDensity: 3200 },
    '852': { medianHouseholdIncome: 52000, renterPercentage: 45, populationDensity: 3000 },
    '752': { medianHouseholdIncome: 68000, renterPercentage: 50, populationDensity: 4000 },
    '981': { medianHouseholdIncome: 85000, renterPercentage: 55, populationDensity: 8500 },
    '191': { medianHouseholdIncome: 48000, renterPercentage: 58, populationDensity: 11000 },
  };

  const regionData = regionProfiles[prefix] || {};
  
  return {
    ...DEFAULT_DEMOGRAPHICS,
    ...regionData,
    geoLevel: 'zip',
    confidence: 60
  };
}

export function calculateLaundryDemandIndex(census: CensusData): number {
  const renterWeight = 0.35;
  const densityWeight = 0.25;
  const incomeWeight = 0.20;
  const povertyWeight = 0.10;
  const ageWeight = 0.10;

  const renterScore = Math.min(100, (census.renterPercentage / 70) * 100);
  
  const densityScore = Math.min(100, (census.populationDensity / 5000) * 100);
  
  let incomeScore: number;
  if (census.medianHouseholdIncome >= 35000 && census.medianHouseholdIncome <= 65000) {
    incomeScore = 100;
  } else if (census.medianHouseholdIncome < 35000) {
    incomeScore = 70 + (census.medianHouseholdIncome / 35000) * 30;
  } else {
    incomeScore = Math.max(50, 100 - ((census.medianHouseholdIncome - 65000) / 1000));
  }
  
  const povertyScore = Math.min(100, 100 - (census.povertyRate * 2));
  
  let ageScore = 80;
  if (census.medianAge >= 25 && census.medianAge <= 45) {
    ageScore = 100;
  } else if (census.medianAge < 25) {
    ageScore = 70;
  } else {
    ageScore = 60;
  }

  const demandIndex = 
    renterScore * renterWeight +
    densityScore * densityWeight +
    incomeScore * incomeWeight +
    povertyScore * povertyWeight +
    ageScore * ageWeight;

  return Math.round(demandIndex);
}

export function getMarketScoreFromCensus(census: CensusData): {
  renterScore: number;
  incomeScore: number;
  densityScore: number;
  demographicPowerScore: number;
} {
  // INDUSTRY-CALIBRATED SCORING based on Coin Laundry Association & industry research
  // Sources: PlanetLaundry, Martin-Ray, Laundrylux, American Coin-Op, industry consultants
  
  // RENTER SCORE: Linear 40-70% optimal (per master algorithms doc)
  // Industry data: 60-70% of laundromat customers are renters, 87% live within 1 mile
  // Threshold: 25% minimum, 40% good, 50%+ excellent, 60-70% ideal
  let renterScore: number;
  if (census.renterPercentage >= 60) {
    // 60%+ = excellent (90-100 range)
    renterScore = 90 + Math.min(10, (census.renterPercentage - 60) / 2);
  } else if (census.renterPercentage >= 50) {
    // 50-60% = very good (80-90 range)
    renterScore = 80 + (census.renterPercentage - 50);
  } else if (census.renterPercentage >= 40) {
    // 40-50% = good (65-80 range) - industry minimum threshold
    renterScore = 65 + (census.renterPercentage - 40) * 1.5;
  } else if (census.renterPercentage >= 30) {
    // 30-40% = below average but viable (50-65 range)
    renterScore = 50 + (census.renterPercentage - 30) * 1.5;
  } else if (census.renterPercentage >= 25) {
    // 25-30% = minimum threshold (40-50 range)
    renterScore = 40 + (census.renterPercentage - 25) * 2;
  } else {
    // <25% = poor location for laundromat (25-40 range)
    renterScore = Math.max(25, census.renterPercentage * 1.6);
  }
  
  // INCOME SCORE: Bell curve to $55K (per master algorithms doc)
  // Industry sweet spot: $28K-$65K, core target: $35K-$60K
  // Median laundromat customer income: $28K-$30K
  // Too high (>$85K) = less demand, too low (<$20K) = less spending
  let incomeScore: number;
  const targetIncome = 55000; // Peak of bell curve per master doc
  if (census.medianHouseholdIncome >= 30000 && census.medianHouseholdIncome <= 70000) {
    // Sweet spot range ($30K-$70K) = high scores
    if (census.medianHouseholdIncome >= 35000 && census.medianHouseholdIncome <= 65000) {
      // Core ideal range = 90-100
      const distFromPeak = Math.abs(census.medianHouseholdIncome - targetIncome);
      incomeScore = 100 - (distFromPeak / 2000); // Small penalty for deviation from $55K
    } else {
      // Edges of sweet spot = 75-90
      incomeScore = 75 + ((census.medianHouseholdIncome >= 35000 ? 
        (70000 - census.medianHouseholdIncome) : 
        (census.medianHouseholdIncome - 30000)) / 1000);
    }
  } else if (census.medianHouseholdIncome > 70000) {
    // Higher income = declining demand (affluent areas have in-unit laundry)
    // $70K-$85K = 60-75, >$85K = 40-60
    if (census.medianHouseholdIncome <= 85000) {
      incomeScore = 75 - ((census.medianHouseholdIncome - 70000) / 1000);
    } else {
      incomeScore = Math.max(40, 60 - ((census.medianHouseholdIncome - 85000) / 2000));
    }
  } else {
    // Lower income (<$30K) = viable but less spending power
    incomeScore = Math.max(50, 70 - ((30000 - census.medianHouseholdIncome) / 500));
  }
  
  // DENSITY SCORE: Linear 2000-5000/sq mi (per master algorithms doc)
  // Industry research: 12,000+ for urban, but 2000-5000 is good baseline for trade area
  // Adjusted scoring to reward higher density without harsh penalties
  let densityScore: number;
  if (census.populationDensity >= 5000) {
    // High density (5000+) = 85-100
    densityScore = 85 + Math.min(15, (census.populationDensity - 5000) / 1000);
  } else if (census.populationDensity >= 3000) {
    // Good density (3000-5000) = 70-85
    densityScore = 70 + ((census.populationDensity - 3000) / 133);
  } else if (census.populationDensity >= 2000) {
    // Adequate density (2000-3000) = 55-70
    densityScore = 55 + ((census.populationDensity - 2000) / 67);
  } else if (census.populationDensity >= 1000) {
    // Suburban/lower density (1000-2000) = 40-55
    densityScore = 40 + ((census.populationDensity - 1000) / 67);
  } else {
    // Rural/very low density (<1000) = 25-40
    densityScore = Math.max(25, 25 + (census.populationDensity / 40));
  }
  
  // DEMOGRAPHIC POWER SCORE: Weighted combination
  // Based on master doc weights adjusted for location-only analysis:
  // - Renter %: 40% (critical demand driver - 87% of customers are renters nearby)
  // - Population Density: 30% (foot traffic and customer base)
  // - Income: 30% (spending power and market fit)
  const demographicPowerScore = Math.round(
    (renterScore * 0.40) +
    (densityScore * 0.30) +
    (incomeScore * 0.30)
  );

  console.log(`📊 Census Market Scores: Renter=${Math.round(renterScore)} (${census.renterPercentage}%), Density=${Math.round(densityScore)} (${census.populationDensity}/sqmi), Income=${Math.round(incomeScore)} ($${census.medianHouseholdIncome.toLocaleString()}) → Power=${demographicPowerScore}`);

  return {
    renterScore: Math.round(renterScore),
    incomeScore: Math.round(incomeScore),
    densityScore: Math.round(densityScore),
    demographicPowerScore
  };
}
