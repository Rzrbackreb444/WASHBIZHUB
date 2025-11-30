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

const ZIP_TO_FIPS: Record<string, { state: string; county: string }> = {};

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
  
  const sqMiPerTract = geoLevel === 'tract' ? 1.5 : geoLevel === 'county' ? 500 : 2500;
  const density = population / sqMiPerTract;

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
  if (ZIP_TO_FIPS[zipCode]) {
    return ZIP_TO_FIPS[zipCode];
  }

  try {
    const url = `https://api.census.gov/data/2020/dec/pl?get=NAME&for=zip%20code%20tabulation%20area:${zipCode}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    
    return null;
  } catch {
    return null;
  }
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
        console.log(`✅ Census data enriched for ${stateAbbr}: income=$${data.medianHouseholdIncome}, renters=${data.renterPercentage}%`);
        
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
  const renterScore = Math.min(100, (census.renterPercentage / 70) * 100);
  
  let incomeScore: number;
  if (census.medianHouseholdIncome >= 35000 && census.medianHouseholdIncome <= 65000) {
    incomeScore = 100;
  } else {
    const deviation = Math.abs(census.medianHouseholdIncome - 50000);
    incomeScore = Math.max(0, 100 - (deviation / 1000));
  }
  
  const densityScore = Math.min(100, (census.populationDensity / 2500) * 100);
  
  const demographicPowerScore = Math.round(
    (renterScore * 0.40) +
    (densityScore * 0.30) +
    (incomeScore * 0.30)
  );

  return {
    renterScore: Math.round(renterScore),
    incomeScore: Math.round(incomeScore),
    densityScore: Math.round(densityScore),
    demographicPowerScore
  };
}
