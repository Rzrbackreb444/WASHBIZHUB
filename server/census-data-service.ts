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
  source: 'census_api' | 'zip_estimate' | 'fallback' | 'international_city' | 'international_country';
  error?: string;
}

const CENSUS_API_BASE = 'https://api.census.gov/data';
const ACS_YEAR = '2022';
const ACS_DATASET = 'acs/acs5';

const censusCache: Map<string, { data: CensusData; timestamp: number }> = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

const zipToFipsCache: Map<string, { state: string; county: string } | null> = new Map();

// COMPREHENSIVE US ZIP PREFIX TO FIPS COUNTY MAPPING
// Covers all 50 states + DC, major metros, and population centers
// Format: { state: 'FIPS_STATE_CODE', county: 'FIPS_COUNTY_CODE' }
const ZIP_PREFIX_TO_COUNTY: Record<string, { state: string; county: string }> = {
  // ═══════════════════════════════════════════════════════════════
  // ALABAMA (01) - Birmingham, Mobile, Montgomery, Huntsville
  // ═══════════════════════════════════════════════════════════════
  '350': { state: '01', county: '073' }, // Birmingham/Jefferson
  '351': { state: '01', county: '073' },
  '352': { state: '01', county: '073' },
  '353': { state: '01', county: '073' },
  '354': { state: '01', county: '117' }, // Shelby
  '355': { state: '01', county: '073' },
  '356': { state: '01', county: '043' }, // Cullman
  '357': { state: '01', county: '089' }, // Madison/Huntsville
  '358': { state: '01', county: '089' },
  '359': { state: '01', county: '083' }, // Limestone
  '360': { state: '01', county: '101' }, // Montgomery
  '361': { state: '01', county: '101' },
  '362': { state: '01', county: '005' }, // Barbour
  '363': { state: '01', county: '081' }, // Lee/Auburn
  '364': { state: '01', county: '113' }, // Russell
  '365': { state: '01', county: '041' }, // Crenshaw
  '366': { state: '01', county: '097' }, // Mobile
  '367': { state: '01', county: '003' }, // Baldwin
  
  // ═══════════════════════════════════════════════════════════════
  // ALASKA (02) - Anchorage, Fairbanks
  // ═══════════════════════════════════════════════════════════════
  '995': { state: '02', county: '020' }, // Anchorage
  '996': { state: '02', county: '020' },
  '997': { state: '02', county: '090' }, // Fairbanks North Star
  '998': { state: '02', county: '110' }, // Juneau
  '999': { state: '02', county: '170' }, // Matanuska-Susitna

  // ═══════════════════════════════════════════════════════════════
  // ARIZONA (04) - Phoenix, Tucson, Mesa, Scottsdale
  // ═══════════════════════════════════════════════════════════════
  '850': { state: '04', county: '013' }, // Phoenix/Maricopa
  '851': { state: '04', county: '013' },
  '852': { state: '04', county: '013' },
  '853': { state: '04', county: '013' },
  '854': { state: '04', county: '013' },
  '855': { state: '04', county: '013' },
  '856': { state: '04', county: '013' }, // Mesa
  '857': { state: '04', county: '019' }, // Pima/Tucson
  '858': { state: '04', county: '019' },
  '859': { state: '04', county: '019' }, // Pima/Tucson (extended)
  '860': { state: '04', county: '005' }, // Coconino/Flagstaff
  '863': { state: '04', county: '027' }, // Yuma
  '864': { state: '04', county: '015' }, // Mohave
  '865': { state: '04', county: '013' }, // Scottsdale

  // ═══════════════════════════════════════════════════════════════
  // ARKANSAS (05) - Little Rock, Fort Smith, Fayetteville, Bentonville
  // ═══════════════════════════════════════════════════════════════
  '716': { state: '05', county: '091' }, // Miller
  '717': { state: '05', county: '057' }, // Hempstead
  '718': { state: '05', county: '027' }, // Columbia
  '719': { state: '05', county: '099' }, // Nevada
  '720': { state: '05', county: '119' }, // Little Rock/Pulaski
  '721': { state: '05', county: '119' },
  '722': { state: '05', county: '119' },
  '723': { state: '05', county: '119' },
  '724': { state: '05', county: '031' }, // Jonesboro/Craighead
  '725': { state: '05', county: '143' }, // Washington
  '726': { state: '05', county: '007' }, // Bentonville/Benton
  '727': { state: '05', county: '143' }, // Fayetteville/Washington
  '728': { state: '05', county: '131' }, // Fort Smith/Sebastian
  '729': { state: '05', county: '131' }, // Fort Smith/Sebastian (THE WASHROOM)

  // ═══════════════════════════════════════════════════════════════
  // CALIFORNIA (06) - LA, SF, San Diego, Sacramento, San Jose
  // ═══════════════════════════════════════════════════════════════
  // Los Angeles Area (LA County 037)
  '900': { state: '06', county: '037' }, // Los Angeles
  '901': { state: '06', county: '037' },
  '902': { state: '06', county: '037' }, // Inglewood
  '903': { state: '06', county: '037' },
  '904': { state: '06', county: '037' },
  '905': { state: '06', county: '037' }, // Torrance
  '906': { state: '06', county: '037' },
  '907': { state: '06', county: '037' },
  '908': { state: '06', county: '037' },
  '910': { state: '06', county: '037' }, // Pasadena
  '911': { state: '06', county: '037' },
  '912': { state: '06', county: '037' }, // Glendale
  '913': { state: '06', county: '037' },
  '914': { state: '06', county: '037' }, // Van Nuys
  '915': { state: '06', county: '037' }, // Burbank
  '916': { state: '06', county: '037' },
  '917': { state: '06', county: '037' }, // Industry
  '918': { state: '06', county: '037' },
  // San Bernardino/Riverside (Inland Empire)
  '909': { state: '06', county: '071' }, // San Bernardino
  '923': { state: '06', county: '071' },
  '924': { state: '06', county: '071' },
  '925': { state: '06', county: '065' }, // Riverside
  // Orange County (059)
  '926': { state: '06', county: '059' }, // Santa Ana
  '927': { state: '06', county: '059' },
  '928': { state: '06', county: '059' }, // Anaheim
  '919': { state: '06', county: '059' }, // Irvine
  // San Diego (073)
  '920': { state: '06', county: '073' },
  '921': { state: '06', county: '073' },
  '922': { state: '06', county: '073' },
  // San Francisco Bay Area
  '940': { state: '06', county: '075' }, // San Francisco
  '941': { state: '06', county: '075' },
  '943': { state: '06', county: '081' }, // San Mateo
  '944': { state: '06', county: '075' },
  '945': { state: '06', county: '001' }, // Alameda/Oakland
  '946': { state: '06', county: '001' },
  '947': { state: '06', county: '001' }, // Berkeley
  '948': { state: '06', county: '013' }, // Contra Costa
  '949': { state: '06', county: '075' },
  '950': { state: '06', county: '085' }, // San Jose/Santa Clara
  '951': { state: '06', county: '085' },
  '952': { state: '06', county: '077' }, // Stockton/San Joaquin
  '953': { state: '06', county: '077' }, // Stockton/San Joaquin
  '954': { state: '06', county: '085' },
  '955': { state: '06', county: '097' }, // Sonoma
  '956': { state: '06', county: '067' }, // Sacramento
  '957': { state: '06', county: '067' },
  '958': { state: '06', county: '067' },
  '959': { state: '06', county: '067' },
  // Fresno/Central Valley
  '935': { state: '06', county: '019' }, // Fresno
  '936': { state: '06', county: '019' },
  '937': { state: '06', county: '019' },
  '930': { state: '06', county: '083' }, // Santa Barbara
  '931': { state: '06', county: '111' }, // Ventura
  '932': { state: '06', county: '029' }, // Kern/Bakersfield
  '933': { state: '06', county: '029' },
  '934': { state: '06', county: '107' }, // Tulare

  // ═══════════════════════════════════════════════════════════════
  // COLORADO (08) - Denver, Colorado Springs, Aurora, Fort Collins
  // ═══════════════════════════════════════════════════════════════
  '800': { state: '08', county: '031' }, // Denver
  '801': { state: '08', county: '031' },
  '802': { state: '08', county: '031' },
  '803': { state: '08', county: '005' }, // Arapahoe/Aurora
  '804': { state: '08', county: '005' },
  '805': { state: '08', county: '069' }, // Larimer/Fort Collins
  '806': { state: '08', county: '123' }, // Weld/Greeley
  '807': { state: '08', county: '013' }, // Boulder
  '808': { state: '08', county: '041' }, // El Paso/Colorado Springs
  '809': { state: '08', county: '041' },
  '810': { state: '08', county: '101' }, // Pueblo

  // ═══════════════════════════════════════════════════════════════
  // CONNECTICUT (09) - Hartford, New Haven, Bridgeport, Stamford
  // ═══════════════════════════════════════════════════════════════
  '060': { state: '09', county: '001' }, // Fairfield/Bridgeport
  '061': { state: '09', county: '001' },
  '062': { state: '09', county: '001' }, // Stamford
  '063': { state: '09', county: '001' },
  '064': { state: '09', county: '001' },
  '065': { state: '09', county: '009' }, // New Haven
  '066': { state: '09', county: '009' },
  '067': { state: '09', county: '011' }, // Waterbury/New London
  '068': { state: '09', county: '009' },
  '069': { state: '09', county: '003' }, // Hartford

  // ═══════════════════════════════════════════════════════════════
  // DELAWARE (10) - Wilmington, Dover
  // ═══════════════════════════════════════════════════════════════
  '197': { state: '10', county: '003' }, // Wilmington/New Castle
  '198': { state: '10', county: '003' },
  '199': { state: '10', county: '001' }, // Dover/Kent

  // ═══════════════════════════════════════════════════════════════
  // WASHINGTON DC (11)
  // ═══════════════════════════════════════════════════════════════
  '200': { state: '11', county: '001' },
  '201': { state: '11', county: '001' },
  '202': { state: '11', county: '001' },
  '203': { state: '11', county: '001' },
  '204': { state: '11', county: '001' },
  '205': { state: '11', county: '001' },

  // ═══════════════════════════════════════════════════════════════
  // FLORIDA (12) - EXPANDED FOR MEMBERS (All Major Markets)
  // ═══════════════════════════════════════════════════════════════
  // South Florida Tri-County
  '330': { state: '12', county: '086' }, // Miami-Dade
  '331': { state: '12', county: '086' }, // Miami-Dade/Homestead
  '332': { state: '12', county: '086' }, // Miami-Dade
  '333': { state: '12', county: '011' }, // Broward/Ft Lauderdale
  '334': { state: '12', county: '099' }, // Palm Beach/West Palm
  '329': { state: '12', county: '086' }, // Miami-Dade
  // Tampa Bay Metro
  '335': { state: '12', county: '057' }, // Hillsborough/Tampa area
  '336': { state: '12', county: '057' }, // Hillsborough/Tampa
  '337': { state: '12', county: '103' }, // Pinellas/St Petersburg
  '338': { state: '12', county: '081' }, // Manatee/Bradenton
  '339': { state: '12', county: '115' }, // Sarasota
  '346': { state: '12', county: '057' }, // Hillsborough
  // Orlando Metro
  '327': { state: '12', county: '095' }, // Orange/Orlando
  '328': { state: '12', county: '095' }, // Orange/Orlando
  '347': { state: '12', county: '095' }, // Orange/Orlando
  '348': { state: '12', county: '117' }, // Seminole/Sanford
  '349': { state: '12', county: '111' }, // St. Lucie/Port Saint Lucie
  '344': { state: '12', county: '097' }, // Osceola/Kissimmee
  '345': { state: '12', county: '097' }, // Osceola
  // Jacksonville Metro
  '320': { state: '12', county: '031' }, // Duval/Jacksonville
  '321': { state: '12', county: '031' }, // Duval
  '322': { state: '12', county: '031' }, // Duval
  // Space Coast / Central FL
  '323': { state: '12', county: '001' }, // Alachua/Gainesville
  '324': { state: '12', county: '019' }, // Clay/Orange Park
  '325': { state: '12', county: '009' }, // Brevard/Melbourne
  '326': { state: '12', county: '127' }, // Volusia/Daytona
  // Southwest Florida
  '340': { state: '12', county: '071' }, // Lee/Fort Myers
  '341': { state: '12', county: '021' }, // Collier/Naples
  '342': { state: '12', county: '015' }, // Charlotte/Punta Gorda
  // Panhandle (covered by 3-digit fallback for Florida)

  // ═══════════════════════════════════════════════════════════════
  // GEORGIA (13) - Atlanta, Savannah, Augusta, Columbus
  // ═══════════════════════════════════════════════════════════════
  '300': { state: '13', county: '135' }, // Lawrenceville/Gwinnett
  '301': { state: '13', county: '121' },
  '302': { state: '13', county: '121' },
  '303': { state: '13', county: '121' },
  '304': { state: '13', county: '089' }, // DeKalb
  '305': { state: '13', county: '121' },
  '306': { state: '13', county: '067' }, // Cobb/Marietta
  '307': { state: '13', county: '097' }, // Douglas
  '308': { state: '13', county: '063' }, // Clayton
  '309': { state: '13', county: '135' }, // Gwinnett
  '310': { state: '13', county: '135' },
  '311': { state: '13', county: '051' }, // Chatham/Savannah
  '312': { state: '13', county: '051' },
  '313': { state: '13', county: '245' }, // Richmond/Augusta
  '314': { state: '13', county: '215' }, // Muscogee/Columbus
  '315': { state: '13', county: '021' }, // Bibb/Macon
  '318': { state: '13', county: '215' }, // Columbus/Muscogee
  '319': { state: '13', county: '215' }, // Columbus/Muscogee

  // ═══════════════════════════════════════════════════════════════
  // HAWAII (15) - Honolulu
  // ═══════════════════════════════════════════════════════════════
  '967': { state: '15', county: '003' }, // Honolulu
  '968': { state: '15', county: '003' },
  '969': { state: '15', county: '001' }, // Hawaii (Big Island)

  // ═══════════════════════════════════════════════════════════════
  // IDAHO (16) - Boise
  // ═══════════════════════════════════════════════════════════════
  '836': { state: '16', county: '001' }, // Ada/Boise
  '837': { state: '16', county: '001' },
  '838': { state: '16', county: '027' }, // Canyon

  // ═══════════════════════════════════════════════════════════════
  // ILLINOIS (17) - Chicago, Aurora, Rockford, Naperville
  // ═══════════════════════════════════════════════════════════════
  '606': { state: '17', county: '031' }, // Chicago/Cook
  '607': { state: '17', county: '031' },
  '608': { state: '17', county: '031' },
  '609': { state: '17', county: '031' },
  '600': { state: '17', county: '031' },
  '601': { state: '17', county: '031' },
  '602': { state: '17', county: '031' }, // Evanston
  '603': { state: '17', county: '031' }, // Oak Park
  '604': { state: '17', county: '043' }, // DuPage/Aurora
  '605': { state: '17', county: '043' }, // Naperville
  '610': { state: '17', county: '111' }, // McHenry
  '611': { state: '17', county: '089' }, // Kane
  '612': { state: '17', county: '097' }, // Lake
  '613': { state: '17', county: '197' }, // Will
  '614': { state: '17', county: '093' }, // Kendall
  '615': { state: '17', county: '091' }, // Kankakee
  '617': { state: '17', county: '019' }, // Champaign
  '618': { state: '17', county: '167' }, // Sangamon/Springfield
  '619': { state: '17', county: '167' },
  '620': { state: '17', county: '143' }, // Peoria

  // ═══════════════════════════════════════════════════════════════
  // INDIANA (18) - Indianapolis, Fort Wayne, Evansville
  // ═══════════════════════════════════════════════════════════════
  '460': { state: '18', county: '097' }, // Indianapolis/Marion
  '461': { state: '18', county: '097' },
  '462': { state: '18', county: '097' },
  '463': { state: '18', county: '097' },
  '464': { state: '18', county: '057' }, // Hamilton
  '465': { state: '18', county: '057' },
  '466': { state: '18', county: '003' }, // Allen/Fort Wayne
  '467': { state: '18', county: '003' },
  '468': { state: '18', county: '003' },
  '469': { state: '18', county: '089' }, // Lake/Gary
  '470': { state: '18', county: '163' }, // Vanderburgh/Evansville
  '471': { state: '18', county: '141' }, // St. Joseph/South Bend
  '472': { state: '18', county: '141' },

  // ═══════════════════════════════════════════════════════════════
  // IOWA (19) - Des Moines, Cedar Rapids, Davenport
  // ═══════════════════════════════════════════════════════════════
  '500': { state: '19', county: '153' }, // Des Moines/Polk
  '501': { state: '19', county: '153' },
  '502': { state: '19', county: '153' },
  '503': { state: '19', county: '153' },
  '520': { state: '19', county: '163' }, // Scott/Davenport
  '521': { state: '19', county: '163' },
  '522': { state: '19', county: '057' }, // Linn/Cedar Rapids
  '523': { state: '19', county: '057' },
  '524': { state: '19', county: '113' }, // Linn

  // ═══════════════════════════════════════════════════════════════
  // KANSAS (20) - Wichita, Kansas City, Overland Park
  // ═══════════════════════════════════════════════════════════════
  '670': { state: '20', county: '173' }, // Wichita/Sedgwick
  '671': { state: '20', county: '173' },
  '672': { state: '20', county: '173' },
  '660': { state: '20', county: '209' }, // Kansas City/Wyandotte
  '661': { state: '20', county: '209' },
  '662': { state: '20', county: '091' }, // Johnson/Overland Park
  '663': { state: '20', county: '091' },
  '664': { state: '20', county: '177' }, // Shawnee/Topeka
  '665': { state: '20', county: '177' },
  '666': { state: '20', county: '177' },

  // ═══════════════════════════════════════════════════════════════
  // KENTUCKY (21) - Louisville, Lexington
  // ═══════════════════════════════════════════════════════════════
  '400': { state: '21', county: '111' }, // Louisville/Jefferson
  '401': { state: '21', county: '111' },
  '402': { state: '21', county: '111' },
  '403': { state: '21', county: '111' },
  '404': { state: '21', county: '111' },
  '405': { state: '21', county: '067' }, // Fayette/Lexington
  '406': { state: '21', county: '067' },
  '410': { state: '21', county: '117' }, // Kenton
  '411': { state: '21', county: '015' }, // Boone

  // ═══════════════════════════════════════════════════════════════
  // LOUISIANA (22) - New Orleans, Baton Rouge, Shreveport
  // ═══════════════════════════════════════════════════════════════
  '700': { state: '22', county: '071' }, // New Orleans/Orleans
  '701': { state: '22', county: '071' },
  '702': { state: '22', county: '051' }, // Jefferson
  '703': { state: '22', county: '051' },
  '704': { state: '22', county: '103' }, // St. Tammany
  '707': { state: '22', county: '033' }, // East Baton Rouge
  '708': { state: '22', county: '033' },
  '710': { state: '22', county: '055' }, // Lafayette
  '711': { state: '22', county: '017' }, // Caddo/Shreveport
  '712': { state: '22', county: '017' },

  // ═══════════════════════════════════════════════════════════════
  // MAINE (23) - Portland
  // ═══════════════════════════════════════════════════════════════
  '040': { state: '23', county: '005' }, // Cumberland/Portland
  '041': { state: '23', county: '005' },
  '042': { state: '23', county: '005' },
  '043': { state: '23', county: '001' }, // Androscoggin
  '044': { state: '23', county: '019' }, // Penobscot
  '045': { state: '23', county: '011' }, // Kennebec

  // ═══════════════════════════════════════════════════════════════
  // MARYLAND (24) - Baltimore, Frederick
  // ═══════════════════════════════════════════════════════════════
  '210': { state: '24', county: '510' }, // Baltimore City
  '211': { state: '24', county: '510' }, // Baltimore City
  '212': { state: '24', county: '510' }, // Baltimore City
  '214': { state: '24', county: '003' }, // Anne Arundel
  '215': { state: '24', county: '510' },
  '217': { state: '24', county: '021' }, // Frederick
  '206': { state: '24', county: '031' }, // Montgomery
  '207': { state: '24', county: '033' }, // Prince George's
  '208': { state: '24', county: '033' },
  '209': { state: '24', county: '043' }, // Washington

  // ═══════════════════════════════════════════════════════════════
  // MASSACHUSETTS (25) - Boston, Worcester, Springfield
  // ═══════════════════════════════════════════════════════════════
  '021': { state: '25', county: '025' }, // Boston/Suffolk
  '022': { state: '25', county: '025' },
  '023': { state: '25', county: '017' }, // Middlesex
  '024': { state: '25', county: '017' },
  '025': { state: '25', county: '021' }, // Norfolk
  '026': { state: '25', county: '021' },
  '027': { state: '25', county: '017' }, // Middlesex
  '010': { state: '25', county: '013' }, // Hampden/Springfield
  '011': { state: '25', county: '013' },
  '012': { state: '25', county: '015' }, // Hampshire
  '013': { state: '25', county: '027' }, // Worcester
  '014': { state: '25', county: '027' },
  '015': { state: '25', county: '027' },
  '016': { state: '25', county: '027' },
  '017': { state: '25', county: '017' },
  '018': { state: '25', county: '017' },
  '019': { state: '25', county: '017' },

  // ═══════════════════════════════════════════════════════════════
  // MICHIGAN (26) - Detroit, Grand Rapids, Ann Arbor
  // ═══════════════════════════════════════════════════════════════
  '480': { state: '26', county: '163' }, // Detroit/Wayne
  '481': { state: '26', county: '163' },
  '482': { state: '26', county: '163' },
  '483': { state: '26', county: '125' }, // Oakland
  '484': { state: '26', county: '125' },
  '485': { state: '26', county: '099' }, // Macomb
  '486': { state: '26', county: '161' }, // Washtenaw/Ann Arbor
  '487': { state: '26', county: '065' }, // Ingham/Lansing
  '488': { state: '26', county: '065' },
  '489': { state: '26', county: '077' }, // Kalamazoo
  '490': { state: '26', county: '015' }, // Barry
  '491': { state: '26', county: '081' }, // Kent/Grand Rapids
  '492': { state: '26', county: '081' },
  '493': { state: '26', county: '081' },
  '494': { state: '26', county: '139' }, // Ottawa
  '495': { state: '26', county: '049' }, // Genesee/Flint
  '496': { state: '26', county: '049' },
  '497': { state: '26', county: '145' }, // Saginaw

  // ═══════════════════════════════════════════════════════════════
  // MINNESOTA (27) - Minneapolis, St. Paul, Rochester
  // ═══════════════════════════════════════════════════════════════
  '550': { state: '27', county: '053' }, // Minneapolis/Hennepin
  '551': { state: '27', county: '053' },
  '553': { state: '27', county: '053' },
  '554': { state: '27', county: '123' }, // St. Paul/Ramsey
  '555': { state: '27', county: '123' },
  '556': { state: '27', county: '037' }, // Dakota
  '557': { state: '27', county: '037' },
  '558': { state: '27', county: '109' }, // Olmsted/Rochester
  '559': { state: '27', county: '109' },
  '560': { state: '27', county: '003' }, // Anoka
  '561': { state: '27', county: '163' }, // Washington
  '562': { state: '27', county: '019' }, // Carver
  '563': { state: '27', county: '139' }, // Scott
  '564': { state: '27', county: '137' }, // St. Louis/Duluth

  // ═══════════════════════════════════════════════════════════════
  // MISSISSIPPI (28) - Jackson, Gulfport
  // ═══════════════════════════════════════════════════════════════
  '390': { state: '28', county: '049' }, // Jackson/Hinds
  '391': { state: '28', county: '049' },
  '392': { state: '28', county: '121' }, // Rankin
  '393': { state: '28', county: '047' }, // Harrison/Gulfport
  '394': { state: '28', county: '047' },
  '395': { state: '28', county: '059' }, // Jackson County

  // ═══════════════════════════════════════════════════════════════
  // MISSOURI (29) - St. Louis, Kansas City, Springfield
  // ═══════════════════════════════════════════════════════════════
  '630': { state: '29', county: '189' }, // St. Louis County
  '631': { state: '29', county: '189' },
  '632': { state: '29', county: '189' },
  '633': { state: '29', county: '189' },
  '634': { state: '29', county: '510' }, // St. Louis City
  '635': { state: '29', county: '510' },
  '636': { state: '29', county: '183' }, // St. Charles
  '640': { state: '29', county: '095' }, // Jackson/Kansas City
  '641': { state: '29', county: '095' },
  '644': { state: '29', county: '095' },
  '645': { state: '29', county: '037' }, // Cass
  '646': { state: '29', county: '047' }, // Clay
  '647': { state: '29', county: '165' }, // Platte
  '650': { state: '29', county: '019' }, // Boone/Columbia
  '651': { state: '29', county: '027' }, // Callaway
  '656': { state: '29', county: '077' }, // Greene/Springfield
  '657': { state: '29', county: '077' },
  '658': { state: '29', county: '077' },

  // ═══════════════════════════════════════════════════════════════
  // MONTANA (30) - Billings, Missoula
  // ═══════════════════════════════════════════════════════════════
  '590': { state: '30', county: '111' }, // Billings/Yellowstone
  '591': { state: '30', county: '111' },
  '598': { state: '30', county: '063' }, // Missoula
  '599': { state: '30', county: '063' },

  // ═══════════════════════════════════════════════════════════════
  // NEBRASKA (31) - Omaha, Lincoln
  // ═══════════════════════════════════════════════════════════════
  '680': { state: '31', county: '055' }, // Omaha/Douglas
  '681': { state: '31', county: '055' },
  '682': { state: '31', county: '055' },
  '683': { state: '31', county: '153' }, // Sarpy
  '684': { state: '31', county: '109' }, // Lancaster/Lincoln
  '685': { state: '31', county: '109' },

  // ═══════════════════════════════════════════════════════════════
  // NEVADA (32) - Las Vegas Metro (EXPANDED FOR MEMBERS)
  // ═══════════════════════════════════════════════════════════════
  '889': { state: '32', county: '003' }, // Las Vegas/Clark - Downtown
  '890': { state: '32', county: '003' }, // Las Vegas/Clark
  '891': { state: '32', county: '003' }, // Las Vegas/Clark - Henderson
  '892': { state: '32', county: '003' }, // Las Vegas/Clark - Enterprise
  '893': { state: '32', county: '003' }, // Las Vegas/Clark - Summerlin
  '894': { state: '32', county: '003' }, // Las Vegas/Clark - North Las Vegas
  '895': { state: '32', county: '003' }, // Las Vegas/Clark - Spring Valley
  '896': { state: '32', county: '003' }, // Las Vegas/Clark - Paradise
  '897': { state: '32', county: '031' }, // Reno/Washoe
  '898': { state: '32', county: '031' }, // Reno/Washoe - Sparks
  '881': { state: '32', county: '003' }, // Boulder City area

  // ═══════════════════════════════════════════════════════════════
  // NEW HAMPSHIRE (33) - Manchester, Nashua
  // ═══════════════════════════════════════════════════════════════
  '030': { state: '33', county: '011' }, // Hillsborough/Manchester
  '031': { state: '33', county: '011' },
  '032': { state: '33', county: '011' },
  '033': { state: '33', county: '015' }, // Rockingham
  '034': { state: '33', county: '013' }, // Merrimack
  '035': { state: '33', county: '009' }, // Grafton
  '036': { state: '33', county: '001' }, // Belknap
  '037': { state: '33', county: '005' }, // Cheshire
  '038': { state: '33', county: '017' }, // Strafford

  // ═══════════════════════════════════════════════════════════════
  // NEW JERSEY (34) - EXPANDED FOR MEMBERS (NYC Metro + Shore)
  // ═══════════════════════════════════════════════════════════════
  '070': { state: '34', county: '013' }, // Essex/Newark
  '071': { state: '34', county: '013' }, // Essex/Orange
  '072': { state: '34', county: '039' }, // Union/Elizabeth
  '073': { state: '34', county: '017' }, // Hudson/Jersey City
  '074': { state: '34', county: '031' }, // Passaic/Clifton
  '075': { state: '34', county: '031' }, // Passaic
  '076': { state: '34', county: '017' }, // Hudson/Jersey City
  '077': { state: '34', county: '023' }, // Middlesex/New Brunswick
  '078': { state: '34', county: '039' }, // Union/Plainfield
  '079': { state: '34', county: '027' }, // Morris/Morristown
  '080': { state: '34', county: '007' }, // Camden
  '081': { state: '34', county: '007' }, // Camden/Cherry Hill
  '082': { state: '34', county: '001' }, // Atlantic/Atlantic City
  '083': { state: '34', county: '005' }, // Burlington/Mount Laurel
  '084': { state: '34', county: '015' }, // Gloucester
  '085': { state: '34', county: '021' }, // Mercer/Trenton
  '086': { state: '34', county: '021' }, // Mercer/Princeton
  '087': { state: '34', county: '029' }, // Ocean/Toms River
  '088': { state: '34', county: '023' }, // Middlesex/Edison
  '089': { state: '34', county: '035' }, // Somerset/Bridgewater
  // Bergen County (003) - North Jersey suburbs

  // ═══════════════════════════════════════════════════════════════
  // NEW MEXICO (35) - Albuquerque, Santa Fe
  // ═══════════════════════════════════════════════════════════════
  '870': { state: '35', county: '001' }, // Albuquerque/Bernalillo
  '871': { state: '35', county: '001' },
  '873': { state: '35', county: '001' },
  '874': { state: '35', county: '001' },
  '875': { state: '35', county: '049' }, // Santa Fe
  '876': { state: '35', county: '043' }, // Sandoval
  '877': { state: '35', county: '061' }, // Valencia
  '880': { state: '35', county: '013' }, // Dona Ana/Las Cruces
  '882': { state: '35', county: '015' }, // Eddy

  // ═══════════════════════════════════════════════════════════════
  // NEW YORK (36) - NYC, Buffalo, Rochester, Albany
  // ═══════════════════════════════════════════════════════════════
  // NYC - Manhattan (061)
  '100': { state: '36', county: '061' },
  '101': { state: '36', county: '061' },
  '102': { state: '36', county: '061' },
  // NYC - Bronx (005)
  '103': { state: '36', county: '005' },
  '104': { state: '36', county: '005' },
  // NYC - Brooklyn (047)
  '112': { state: '36', county: '047' },
  '113': { state: '36', county: '081' }, // Queens
  '114': { state: '36', county: '081' },
  '115': { state: '36', county: '081' },
  '116': { state: '36', county: '081' },
  // NYC - Staten Island (085)
  // Long Island
  '110': { state: '36', county: '059' }, // Nassau
  '111': { state: '36', county: '059' },
  '117': { state: '36', county: '103' }, // Suffolk
  '118': { state: '36', county: '103' },
  '119': { state: '36', county: '103' },
  // Westchester
  '105': { state: '36', county: '119' },
  '106': { state: '36', county: '119' },
  '107': { state: '36', county: '119' },
  '108': { state: '36', county: '119' },
  '109': { state: '36', county: '119' },
  // Upstate
  '120': { state: '36', county: '001' }, // Albany
  '121': { state: '36', county: '001' },
  '122': { state: '36', county: '001' },
  '123': { state: '36', county: '083' }, // Rensselaer
  '130': { state: '36', county: '067' }, // Onondaga/Syracuse
  '131': { state: '36', county: '067' },
  '132': { state: '36', county: '067' },
  '140': { state: '36', county: '029' }, // Erie/Buffalo
  '141': { state: '36', county: '029' },
  '142': { state: '36', county: '029' },
  '143': { state: '36', county: '063' }, // Niagara
  '144': { state: '36', county: '055' }, // Monroe/Rochester
  '145': { state: '36', county: '055' },
  '146': { state: '36', county: '055' },
  '147': { state: '36', county: '055' },
  '148': { state: '36', county: '055' },

  // ═══════════════════════════════════════════════════════════════
  // NORTH CAROLINA (37) - EXPANDED FOR MEMBERS
  // ═══════════════════════════════════════════════════════════════
  // Charlotte Metro
  '280': { state: '37', county: '119' }, // Charlotte/Mecklenburg
  '281': { state: '37', county: '119' }, // Charlotte/Mecklenburg
  '282': { state: '37', county: '119' }, // Charlotte/Mecklenburg
  '283': { state: '37', county: '119' }, // Charlotte/Mecklenburg
  '284': { state: '37', county: '025' }, // Concord/Cabarrus
  '285': { state: '37', county: '071' }, // Gaston/Gastonia
  '286': { state: '37', county: '179' }, // Union/Monroe
  // Raleigh-Durham Triangle
  '270': { state: '37', county: '183' }, // Raleigh/Wake
  '271': { state: '37', county: '183' }, // Raleigh/Wake
  '272': { state: '37', county: '183' }, // Raleigh/Wake
  '273': { state: '37', county: '063' }, // Durham
  '274': { state: '37', county: '081' }, // Greensboro/Guilford
  '275': { state: '37', county: '067' }, // Winston-Salem/Forsyth
  '276': { state: '37', county: '183' }, // Raleigh/Wake
  '277': { state: '37', county: '067' }, // Winston-Salem/Forsyth
  // Coastal NC
  '278': { state: '37', county: '129' }, // Wilmington/New Hanover
  '279': { state: '37', county: '129' }, // Wilmington/New Hanover
  // Asheville (Mountain)
  '287': { state: '37', county: '021' }, // Asheville/Buncombe
  '288': { state: '37', county: '021' }, // Asheville/Buncombe
  '289': { state: '37', county: '097' }, // Henderson
  // Fayetteville (Military)

  // ═══════════════════════════════════════════════════════════════
  // NORTH DAKOTA (38) - Fargo, Bismarck
  // ═══════════════════════════════════════════════════════════════
  '580': { state: '38', county: '017' }, // Fargo/Cass
  '581': { state: '38', county: '017' },
  '585': { state: '38', county: '015' }, // Bismarck/Burleigh
  '586': { state: '38', county: '015' },

  // ═══════════════════════════════════════════════════════════════
  // OHIO (39) - Columbus, Cleveland, Cincinnati
  // ═══════════════════════════════════════════════════════════════
  '430': { state: '39', county: '049' }, // Columbus/Franklin
  '431': { state: '39', county: '049' },
  '432': { state: '39', county: '049' },
  '433': { state: '39', county: '049' },
  '440': { state: '39', county: '035' }, // Cleveland/Cuyahoga
  '441': { state: '39', county: '035' },
  '442': { state: '39', county: '035' },
  '443': { state: '39', county: '035' },
  '444': { state: '39', county: '035' },
  '450': { state: '39', county: '061' }, // Cincinnati/Hamilton
  '451': { state: '39', county: '061' },
  '452': { state: '39', county: '061' },
  '453': { state: '39', county: '113' }, // Montgomery/Dayton
  '454': { state: '39', county: '113' },
  '455': { state: '39', county: '113' },
  '456': { state: '39', county: '113' },
  '457': { state: '39', county: '057' }, // Greene
  '445': { state: '39', county: '153' }, // Summit/Akron
  '446': { state: '39', county: '153' },
  '447': { state: '39', county: '099' }, // Mahoning/Youngstown
  '448': { state: '39', county: '151' }, // Stark/Canton

  // ═══════════════════════════════════════════════════════════════
  // OKLAHOMA (40) - Oklahoma City, Tulsa
  // ═══════════════════════════════════════════════════════════════
  '730': { state: '40', county: '109' }, // Oklahoma City/Oklahoma
  '731': { state: '40', county: '109' },
  '732': { state: '40', county: '109' },
  '733': { state: '40', county: '109' },
  '734': { state: '40', county: '027' }, // Cleveland
  '740': { state: '40', county: '143' }, // Tulsa
  '741': { state: '40', county: '143' },
  '743': { state: '40', county: '143' },
  '744': { state: '40', county: '113' }, // Osage

  // ═══════════════════════════════════════════════════════════════
  // OREGON (41) - Portland, Salem, Eugene
  // ═══════════════════════════════════════════════════════════════
  '970': { state: '41', county: '051' }, // Portland/Multnomah
  '971': { state: '41', county: '051' },
  '972': { state: '41', county: '051' },
  '973': { state: '41', county: '005' }, // Clackamas
  '974': { state: '41', county: '067' }, // Washington
  '975': { state: '41', county: '047' }, // Marion/Salem
  '976': { state: '41', county: '047' },
  '977': { state: '41', county: '039' }, // Lane/Eugene
  '978': { state: '41', county: '039' },

  // ═══════════════════════════════════════════════════════════════
  // PENNSYLVANIA (42) - #6 MEMBER MARKET: Philadelphia (432 members)
  // ═══════════════════════════════════════════════════════════════
  // PHILADELPHIA METRO - 432 members
  '190': { state: '42', county: '101' }, // Philadelphia/Center City
  '191': { state: '42', county: '101' }, // Philadelphia/NE
  '192': { state: '42', county: '101' }, // Philadelphia/NW
  '193': { state: '42', county: '045' }, // Delaware/Upper Darby
  '194': { state: '42', county: '045' }, // Delaware/Media
  '195': { state: '42', county: '029' }, // Chester/West Chester
  '196': { state: '42', county: '091' }, // Montgomery/Norristown
  '189': { state: '42', county: '017' }, // Bucks/Doylestown
  // Lehigh Valley
  '180': { state: '42', county: '077' }, // Lehigh/Allentown
  '181': { state: '42', county: '095' }, // Northampton/Bethlehem
  '182': { state: '42', county: '025' }, // Carbon
  // Pittsburgh Metro
  '150': { state: '42', county: '003' }, // Pittsburgh/Downtown
  '151': { state: '42', county: '003' }, // Pittsburgh/North Side
  '152': { state: '42', county: '003' }, // Pittsburgh/South Side
  '153': { state: '42', county: '125' }, // Washington
  '154': { state: '42', county: '129' }, // Westmoreland/Greensburg
  '155': { state: '42', county: '007' }, // Beaver
  '156': { state: '42', county: '019' }, // Butler
  '157': { state: '42', county: '063' }, // Indiana
  // Central PA
  '160': { state: '42', county: '027' }, // Centre/State College
  '161': { state: '42', county: '043' }, // Dauphin/Harrisburg
  '162': { state: '42', county: '043' }, // Dauphin
  '170': { state: '42', county: '043' },
  '171': { state: '42', county: '133' }, // York
  '172': { state: '42', county: '071' }, // Lancaster
  '173': { state: '42', county: '071' }, // Lancaster/suburbs

  // ═══════════════════════════════════════════════════════════════
  // RHODE ISLAND (44) - Providence
  // ═══════════════════════════════════════════════════════════════
  '028': { state: '44', county: '007' }, // Providence
  '029': { state: '44', county: '007' },

  // ═══════════════════════════════════════════════════════════════
  // SOUTH CAROLINA (45) - Columbia, Charleston, Greenville
  // ═══════════════════════════════════════════════════════════════
  '290': { state: '45', county: '079' }, // Columbia/Richland
  '291': { state: '45', county: '079' },
  '292': { state: '45', county: '079' },
  '293': { state: '45', county: '083' }, // Spartanburg
  '294': { state: '45', county: '019' }, // Charleston
  '295': { state: '45', county: '019' },
  '296': { state: '45', county: '045' }, // Greenville
  '297': { state: '45', county: '063' }, // Lexington
  '298': { state: '45', county: '051' }, // Horry/Myrtle Beach

  // ═══════════════════════════════════════════════════════════════
  // SOUTH DAKOTA (46) - Sioux Falls, Rapid City
  // ═══════════════════════════════════════════════════════════════
  '570': { state: '46', county: '099' }, // Sioux Falls/Minnehaha
  '571': { state: '46', county: '099' },
  '572': { state: '46', county: '083' }, // Lincoln
  '577': { state: '46', county: '103' }, // Rapid City/Pennington

  // ═══════════════════════════════════════════════════════════════
  // TENNESSEE (47) - Nashville, Memphis, Knoxville
  // ═══════════════════════════════════════════════════════════════
  '370': { state: '47', county: '037' }, // Nashville/Davidson
  '371': { state: '47', county: '037' },
  '372': { state: '47', county: '037' },
  '373': { state: '47', county: '187' }, // Williamson
  '374': { state: '47', county: '149' }, // Rutherford
  '375': { state: '47', county: '165' }, // Sumner
  '376': { state: '47', county: '189' }, // Wilson
  '377': { state: '47', county: '119' }, // Maury
  '378': { state: '47', county: '157' }, // Shelby/Memphis
  '379': { state: '47', county: '093' }, // Knox/Knoxville
  '380': { state: '47', county: '157' },
  '381': { state: '47', county: '157' },
  '382': { state: '47', county: '157' },
  '383': { state: '47', county: '065' }, // Hamilton/Chattanooga

  // ═══════════════════════════════════════════════════════════════
  // TEXAS (48) - TOP MEMBER MARKETS: Houston #2, Dallas #7, San Antonio #9
  // ═══════════════════════════════════════════════════════════════
  // HOUSTON METRO - 955 members (Harris 201 + suburbs)
  '770': { state: '48', county: '201' }, // Houston/Downtown
  '771': { state: '48', county: '201' }, // Houston/Galleria
  '772': { state: '48', county: '201' }, // Houston/Heights
  '773': { state: '48', county: '201' }, // Houston/Bellaire
  '774': { state: '48', county: '201' }, // Houston/SW
  '775': { state: '48', county: '201' }, // Houston/Pasadena
  '776': { state: '48', county: '201' }, // Houston/Deer Park
  '777': { state: '48', county: '157' }, // Fort Bend/Sugar Land
  '778': { state: '48', county: '291' }, // Montgomery/The Woodlands
  '779': { state: '48', county: '039' }, // Brazoria/Pearland
  // DALLAS METRO - 374 members (Dallas 113 + DFW)
  '750': { state: '48', county: '113' }, // Dallas/Downtown
  '751': { state: '48', county: '113' }, // Dallas/Hensley Field
  '752': { state: '48', county: '113' }, // Dallas/Love Field
  '753': { state: '48', county: '113' }, // Dallas/NE
  '754': { state: '48', county: '113' }, // Dallas/Greenville
  '755': { state: '48', county: '113' }, // Dallas/Oak Lawn
  '760': { state: '48', county: '439' }, // Fort Worth/Downtown
  '761': { state: '48', county: '439' }, // Fort Worth/Stockyards
  '762': { state: '48', county: '439' }, // Fort Worth/Arlington
  '763': { state: '48', county: '085' }, // Collin/Plano
  '764': { state: '48', county: '085' }, // Collin/McKinney
  '765': { state: '48', county: '121' }, // Denton
  '756': { state: '48', county: '121' }, // Denton/Lewisville
  // SAN ANTONIO METRO - 329 members (Bexar 029 + suburbs)
  '780': { state: '48', county: '029' }, // San Antonio/Downtown
  '781': { state: '48', county: '029' }, // San Antonio/Medical Center
  '782': { state: '48', county: '029' }, // San Antonio/Universal City
  '783': { state: '48', county: '029' }, // San Antonio/Lackland
  '784': { state: '48', county: '029' }, // San Antonio/Randolph
  '785': { state: '48', county: '029' }, // San Antonio/NW
  // Austin (Travis 453)
  '786': { state: '48', county: '453' }, // Austin/Downtown
  '787': { state: '48', county: '453' }, // Austin/UT Campus
  '788': { state: '48', county: '453' }, // Austin/South
  '789': { state: '48', county: '491' }, // Williamson/Round Rock
  // El Paso (El Paso 141)
  '798': { state: '48', county: '141' },
  '799': { state: '48', county: '141' },
  '795': { state: '48', county: '141' },
  // Corpus Christi (Nueces 355)
  // Other Texas
  '790': { state: '48', county: '303' }, // Lubbock
  '791': { state: '48', county: '303' },
  '792': { state: '48', county: '375' }, // Potter/Amarillo
  '793': { state: '48', county: '375' },
  '794': { state: '48', county: '441' }, // Taylor/Abilene
  '796': { state: '48', county: '441' },
  '797': { state: '48', county: '309' }, // McLennan/Waco

  // ═══════════════════════════════════════════════════════════════
  // UTAH (49) - Salt Lake City, Provo
  // ═══════════════════════════════════════════════════════════════
  '840': { state: '49', county: '035' }, // Salt Lake
  '841': { state: '49', county: '035' },
  '842': { state: '49', county: '035' },
  '843': { state: '49', county: '049' }, // Utah/Provo
  '844': { state: '49', county: '057' }, // Weber/Ogden
  '845': { state: '49', county: '011' }, // Davis

  // ═══════════════════════════════════════════════════════════════
  // VERMONT (50) - Burlington
  // ═══════════════════════════════════════════════════════════════
  '054': { state: '50', county: '007' }, // Chittenden/Burlington
  '055': { state: '50', county: '007' },
  '056': { state: '50', county: '021' }, // Rutland
  '057': { state: '50', county: '023' }, // Washington

  // ═══════════════════════════════════════════════════════════════
  // VIRGINIA (51) - Virginia Beach, Norfolk, Richmond
  // ═══════════════════════════════════════════════════════════════
  '230': { state: '51', county: '760' }, // Richmond City
  '231': { state: '51', county: '760' }, // Richmond City
  '232': { state: '51', county: '760' }, // Richmond City
  '233': { state: '51', county: '087' }, // Henrico
  '234': { state: '51', county: '810' }, // Virginia Beach City
  '235': { state: '51', county: '810' }, // Norfolk City
  '236': { state: '51', county: '810' },
  '237': { state: '51', county: '550' }, // Chesapeake City
  '238': { state: '51', county: '740' }, // Portsmouth City
  '239': { state: '51', county: '710' }, // Newport News City
  '220': { state: '51', county: '013' }, // Arlington
  '221': { state: '51', county: '059' }, // Fairfax
  '222': { state: '51', county: '059' },
  '223': { state: '51', county: '059' },
  '224': { state: '51', county: '107' }, // Loudoun
  '225': { state: '51', county: '153' }, // Prince William
  '226': { state: '51', county: '830' }, // Williamsburg
  '240': { state: '51', county: '163' }, // Roanoke County
  '241': { state: '51', county: '770' }, // Roanoke City
  '242': { state: '51', county: '165' }, // Rockingham

  // ═══════════════════════════════════════════════════════════════
  // WASHINGTON (53) - Seattle, Spokane, Tacoma
  // ═══════════════════════════════════════════════════════════════
  '980': { state: '53', county: '033' }, // Seattle/King
  '981': { state: '53', county: '033' },
  '982': { state: '53', county: '033' },
  '983': { state: '53', county: '033' },
  '984': { state: '53', county: '033' },
  '985': { state: '53', county: '033' },
  '986': { state: '53', county: '033' },
  '990': { state: '53', county: '063' }, // Spokane
  '991': { state: '53', county: '063' },
  '992': { state: '53', county: '063' },
  '993': { state: '53', county: '077' }, // Yakima
  '987': { state: '53', county: '015' }, // Cowlitz

  // ═══════════════════════════════════════════════════════════════
  // WEST VIRGINIA (54) - Charleston, Huntington
  // ═══════════════════════════════════════════════════════════════
  '250': { state: '54', county: '039' }, // Charleston/Kanawha
  '251': { state: '54', county: '039' },
  '252': { state: '54', county: '039' },
  '253': { state: '54', county: '011' }, // Cabell/Huntington
  '254': { state: '54', county: '011' },
  '255': { state: '54', county: '107' }, // Wood/Parkersburg
  '256': { state: '54', county: '051' }, // Marion
  '257': { state: '54', county: '061' }, // Monongalia/Morgantown

  // ═══════════════════════════════════════════════════════════════
  // WISCONSIN (55) - Milwaukee, Madison, Green Bay
  // ═══════════════════════════════════════════════════════════════
  '530': { state: '55', county: '079' }, // Milwaukee
  '531': { state: '55', county: '079' },
  '532': { state: '55', county: '079' },
  '533': { state: '55', county: '079' },
  '534': { state: '55', county: '101' }, // Racine
  '535': { state: '55', county: '025' }, // Dane/Madison
  '536': { state: '55', county: '025' },
  '537': { state: '55', county: '025' },
  '538': { state: '55', county: '025' },
  '539': { state: '55', county: '063' }, // La Crosse
  '540': { state: '55', county: '133' }, // Waukesha
  '541': { state: '55', county: '131' }, // Washington
  '542': { state: '55', county: '087' }, // Outagamie/Appleton
  '543': { state: '55', county: '009' }, // Brown/Green Bay
  '544': { state: '55', county: '009' },
  '545': { state: '55', county: '009' },
  '546': { state: '55', county: '073' }, // Marathon/Wausau
  '547': { state: '55', county: '017' }, // Chippewa/Eau Claire

  // ═══════════════════════════════════════════════════════════════
  // WYOMING (56) - Cheyenne, Casper
  // ═══════════════════════════════════════════════════════════════
  '820': { state: '56', county: '021' }, // Laramie/Cheyenne
  '821': { state: '56', county: '021' },
  '822': { state: '56', county: '005' }, // Campbell
  '823': { state: '56', county: '025' }, // Natrona/Casper
  '824': { state: '56', county: '025' },
  '825': { state: '56', county: '013' }, // Fremont
  '826': { state: '56', county: '039' }, // Teton
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

// ═══════════════════════════════════════════════════════════════
// INTERNATIONAL CITY DEMOGRAPHICS - Top Member Countries
// PPP-adjusted for CLEANBI scoring accuracy (15.5% international members)
// ═══════════════════════════════════════════════════════════════
const INTERNATIONAL_CITY_DEMOGRAPHICS: Record<string, Partial<CensusData>> = {
  // NIGERIA (1,560 members - #1 international)
  'lagos,ng': { medianHouseholdIncome: 8500, renterPercentage: 72, populationDensity: 20000, medianAge: 24 },
  'abuja,ng': { medianHouseholdIncome: 12000, renterPercentage: 68, populationDensity: 5500, medianAge: 26 },
  'port harcourt,ng': { medianHouseholdIncome: 9500, renterPercentage: 70, populationDensity: 8000, medianAge: 25 },
  'ibadan,ng': { medianHouseholdIncome: 6500, renterPercentage: 65, populationDensity: 6500, medianAge: 24 },
  'kano,ng': { medianHouseholdIncome: 5500, renterPercentage: 60, populationDensity: 12000, medianAge: 22 },
  
  // PHILIPPINES (1,034 members - #2 international)
  'manila,ph': { medianHouseholdIncome: 9000, renterPercentage: 55, populationDensity: 43000, medianAge: 26 },
  'quezon city,ph': { medianHouseholdIncome: 10500, renterPercentage: 52, populationDensity: 21000, medianAge: 27 },
  'cebu,ph': { medianHouseholdIncome: 8500, renterPercentage: 48, populationDensity: 16000, medianAge: 25 },
  'davao,ph': { medianHouseholdIncome: 7500, renterPercentage: 45, populationDensity: 2800, medianAge: 26 },
  'makati,ph': { medianHouseholdIncome: 18000, renterPercentage: 65, populationDensity: 24000, medianAge: 30 },
  
  // INDIA (741 members - #3 international)
  'mumbai,in': { medianHouseholdIncome: 6500, renterPercentage: 55, populationDensity: 32000, medianAge: 28 },
  'delhi,in': { medianHouseholdIncome: 7500, renterPercentage: 48, populationDensity: 29000, medianAge: 27 },
  'bangalore,in': { medianHouseholdIncome: 12000, renterPercentage: 58, populationDensity: 12000, medianAge: 30 },
  'hyderabad,in': { medianHouseholdIncome: 9500, renterPercentage: 52, populationDensity: 10000, medianAge: 29 },
  'chennai,in': { medianHouseholdIncome: 8000, renterPercentage: 50, populationDensity: 26000, medianAge: 28 },
  'pune,in': { medianHouseholdIncome: 10500, renterPercentage: 55, populationDensity: 15000, medianAge: 29 },
  
  // CANADA (725 members - #4 international)
  'toronto,ca': { medianHouseholdIncome: 65000, renterPercentage: 52, populationDensity: 4300, medianAge: 40 },
  'vancouver,ca': { medianHouseholdIncome: 58000, renterPercentage: 55, populationDensity: 5500, medianAge: 41 },
  'montreal,ca': { medianHouseholdIncome: 52000, renterPercentage: 62, populationDensity: 4600, medianAge: 39 },
  'calgary,ca': { medianHouseholdIncome: 68000, renterPercentage: 38, populationDensity: 1500, medianAge: 37 },
  'edmonton,ca': { medianHouseholdIncome: 62000, renterPercentage: 42, populationDensity: 1400, medianAge: 36 },
  'ottawa,ca': { medianHouseholdIncome: 72000, renterPercentage: 40, populationDensity: 350, medianAge: 40 },
  
  // AUSTRALIA (542 members - #5 international)
  'sydney,au': { medianHouseholdIncome: 72000, renterPercentage: 35, populationDensity: 4100, medianAge: 36 },
  'melbourne,au': { medianHouseholdIncome: 68000, renterPercentage: 32, populationDensity: 1700, medianAge: 35 },
  'brisbane,au': { medianHouseholdIncome: 65000, renterPercentage: 35, populationDensity: 950, medianAge: 35 },
  'perth,au': { medianHouseholdIncome: 70000, renterPercentage: 28, populationDensity: 320, medianAge: 36 },
  'adelaide,au': { medianHouseholdIncome: 58000, renterPercentage: 30, populationDensity: 1600, medianAge: 39 },
  
  // UNITED KINGDOM (518 members - #6 international)
  'london,gb': { medianHouseholdIncome: 52000, renterPercentage: 55, populationDensity: 14500, medianAge: 35 },
  'birmingham,gb': { medianHouseholdIncome: 38000, renterPercentage: 42, populationDensity: 4200, medianAge: 33 },
  'manchester,gb': { medianHouseholdIncome: 40000, renterPercentage: 48, populationDensity: 4700, medianAge: 32 },
  'leeds,gb': { medianHouseholdIncome: 38000, renterPercentage: 45, populationDensity: 3500, medianAge: 34 },
  'glasgow,gb': { medianHouseholdIncome: 35000, renterPercentage: 52, populationDensity: 3600, medianAge: 36 },
  
  // UAE (289 members - #7 international)
  'dubai,ae': { medianHouseholdIncome: 45000, renterPercentage: 85, populationDensity: 760, medianAge: 33 },
  'abu dhabi,ae': { medianHouseholdIncome: 52000, renterPercentage: 78, populationDensity: 620, medianAge: 32 },
  'sharjah,ae': { medianHouseholdIncome: 32000, renterPercentage: 88, populationDensity: 3000, medianAge: 31 },
  
  // SOUTH AFRICA (186 members)
  'johannesburg,za': { medianHouseholdIncome: 15000, renterPercentage: 40, populationDensity: 2700, medianAge: 28 },
  'cape town,za': { medianHouseholdIncome: 18000, renterPercentage: 38, populationDensity: 1500, medianAge: 30 },
  'durban,za': { medianHouseholdIncome: 12000, renterPercentage: 42, populationDensity: 1500, medianAge: 27 },
  
  // KENYA (178 members)
  'nairobi,ke': { medianHouseholdIncome: 7500, renterPercentage: 70, populationDensity: 5500, medianAge: 24 },
  'mombasa,ke': { medianHouseholdIncome: 5500, renterPercentage: 65, populationDensity: 4200, medianAge: 23 },
  
  // MEXICO (156 members)
  'mexico city,mx': { medianHouseholdIncome: 12000, renterPercentage: 35, populationDensity: 6000, medianAge: 32 },
  'guadalajara,mx': { medianHouseholdIncome: 10500, renterPercentage: 32, populationDensity: 8400, medianAge: 30 },
  'monterrey,mx': { medianHouseholdIncome: 14000, renterPercentage: 28, populationDensity: 2700, medianAge: 31 },
  
  // GHANA (142 members)
  'accra,gh': { medianHouseholdIncome: 6000, renterPercentage: 68, populationDensity: 12000, medianAge: 22 },
  'kumasi,gh': { medianHouseholdIncome: 4500, renterPercentage: 62, populationDensity: 8500, medianAge: 21 },
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
  coords?: { lat: number; lng: number },
  city?: string,
  countryCode?: string
): Promise<CensusEnrichmentResult> {
  // Build cache key from defined components only
  const cacheKeyParts: string[] = [];
  if (zipCode) cacheKeyParts.push(`zip:${zipCode}`);
  if (coords?.lat && coords?.lng) cacheKeyParts.push(`coords:${coords.lat},${coords.lng}`);
  if (city && countryCode) cacheKeyParts.push(`intl:${city.toLowerCase()},${countryCode.toLowerCase()}`);
  if (stateAbbr) cacheKeyParts.push(`state:${stateAbbr}`);
  const cacheKey = cacheKeyParts.length > 0 ? cacheKeyParts.join('|') : 'default';
  
  const cached = censusCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📊 Census cache hit: ${cacheKey}`);
    return { success: true, data: cached.data, source: 'census_api' };
  }

  try {
    // INTERNATIONAL ADDRESS PATH - Check for non-US addresses first
    if (countryCode && countryCode.toUpperCase() !== 'US') {
      console.log(`🌍 Processing international address: ${city || 'unknown'}, ${countryCode}`);
      
      // Try city-level lookup first
      if (city) {
        const cityData = getInternationalCityDemographics(city, countryCode);
        if (cityData) {
          censusCache.set(cacheKey, { data: cityData, timestamp: Date.now() });
          console.log(`✅ International CITY demographics: ${city}, ${countryCode.toUpperCase()} - income=$${cityData.medianHouseholdIncome}, renters=${cityData.renterPercentage}%`);
          return { success: true, data: cityData, source: 'international_city' };
        }
      }
      
      // Fall back to country-level defaults
      const countryData = getCountryDefaultDemographics(countryCode);
      censusCache.set(cacheKey, { data: countryData, timestamp: Date.now() });
      console.log(`✅ International COUNTRY demographics: ${countryCode.toUpperCase()} - income=$${countryData.medianHouseholdIncome}, renters=${countryData.renterPercentage}%`);
      return { success: true, data: countryData, source: 'international_country' };
    }

    // US ADDRESS PATH - Original logic
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

/**
 * Get demographics for international cities
 * Used for CLEANBI scoring of non-US addresses (15.5% of members)
 * @param city City name (case-insensitive)
 * @param countryCode ISO 2-letter country code (e.g., 'NG', 'PH', 'IN', 'CA', 'AU', 'GB', 'AE')
 * @returns CensusData with international demographics or null if not found
 */
export function getInternationalCityDemographics(
  city: string,
  countryCode: string
): CensusData | null {
  const key = `${city.toLowerCase()},${countryCode.toLowerCase()}`;
  const demographics = INTERNATIONAL_CITY_DEMOGRAPHICS[key];
  
  if (demographics) {
    console.log(`🌍 International demographics: ${city}, ${countryCode.toUpperCase()}`);
    return {
      ...DEFAULT_DEMOGRAPHICS,
      ...demographics,
      geoLevel: 'county',
      confidence: 65,
      dataYear: 2024
    };
  }
  
  return null;
}

/**
 * Get default demographics for international addresses by country
 * Provides reasonable fallback for countries without specific city data
 */
export function getCountryDefaultDemographics(countryCode: string): CensusData {
  const countryDefaults: Record<string, Partial<CensusData>> = {
    // Developed economies
    'ca': { medianHouseholdIncome: 60000, renterPercentage: 45, populationDensity: 3000, medianAge: 41 },
    'au': { medianHouseholdIncome: 65000, renterPercentage: 32, populationDensity: 2000, medianAge: 37 },
    'gb': { medianHouseholdIncome: 42000, renterPercentage: 48, populationDensity: 4500, medianAge: 40 },
    'de': { medianHouseholdIncome: 48000, renterPercentage: 52, populationDensity: 5000, medianAge: 45 },
    'fr': { medianHouseholdIncome: 40000, renterPercentage: 45, populationDensity: 4000, medianAge: 42 },
    'nz': { medianHouseholdIncome: 55000, renterPercentage: 35, populationDensity: 1800, medianAge: 38 },
    'jp': { medianHouseholdIncome: 38000, renterPercentage: 40, populationDensity: 12000, medianAge: 48 },
    
    // Middle East (high renter markets - excellent for laundromats)
    'ae': { medianHouseholdIncome: 42000, renterPercentage: 85, populationDensity: 1500, medianAge: 32 },
    'sa': { medianHouseholdIncome: 35000, renterPercentage: 65, populationDensity: 1200, medianAge: 31 },
    'qa': { medianHouseholdIncome: 55000, renterPercentage: 88, populationDensity: 800, medianAge: 33 },
    'kw': { medianHouseholdIncome: 40000, renterPercentage: 75, populationDensity: 1000, medianAge: 34 },
    
    // Africa (high growth markets)
    'ng': { medianHouseholdIncome: 7500, renterPercentage: 68, populationDensity: 8000, medianAge: 18 },
    'za': { medianHouseholdIncome: 14000, renterPercentage: 40, populationDensity: 2000, medianAge: 27 },
    'ke': { medianHouseholdIncome: 6000, renterPercentage: 68, populationDensity: 4500, medianAge: 20 },
    'gh': { medianHouseholdIncome: 5000, renterPercentage: 65, populationDensity: 6000, medianAge: 21 },
    'eg': { medianHouseholdIncome: 8000, renterPercentage: 50, populationDensity: 5500, medianAge: 24 },
    
    // Asia (diverse markets)
    'ph': { medianHouseholdIncome: 8500, renterPercentage: 52, populationDensity: 18000, medianAge: 26 },
    'in': { medianHouseholdIncome: 7000, renterPercentage: 52, populationDensity: 15000, medianAge: 28 },
    'pk': { medianHouseholdIncome: 4500, renterPercentage: 45, populationDensity: 8000, medianAge: 22 },
    'bd': { medianHouseholdIncome: 4000, renterPercentage: 55, populationDensity: 12000, medianAge: 27 },
    'sg': { medianHouseholdIncome: 65000, renterPercentage: 20, populationDensity: 8500, medianAge: 42 },
    'my': { medianHouseholdIncome: 12000, renterPercentage: 35, populationDensity: 3500, medianAge: 30 },
    'th': { medianHouseholdIncome: 10000, renterPercentage: 30, populationDensity: 3200, medianAge: 38 },
    'id': { medianHouseholdIncome: 6500, renterPercentage: 35, populationDensity: 5000, medianAge: 29 },
    'vn': { medianHouseholdIncome: 5500, renterPercentage: 40, populationDensity: 4500, medianAge: 31 },
    
    // Latin America
    'mx': { medianHouseholdIncome: 11000, renterPercentage: 32, populationDensity: 6500, medianAge: 29 },
    'br': { medianHouseholdIncome: 9500, renterPercentage: 30, populationDensity: 4800, medianAge: 33 },
    'co': { medianHouseholdIncome: 8500, renterPercentage: 38, populationDensity: 4200, medianAge: 31 },
    'ar': { medianHouseholdIncome: 12000, renterPercentage: 35, populationDensity: 3500, medianAge: 32 },
    'cl': { medianHouseholdIncome: 15000, renterPercentage: 28, populationDensity: 2800, medianAge: 35 },
    
    // Caribbean
    'jm': { medianHouseholdIncome: 8000, renterPercentage: 45, populationDensity: 2500, medianAge: 30 },
    'tt': { medianHouseholdIncome: 18000, renterPercentage: 35, populationDensity: 2800, medianAge: 34 },
    'pr': { medianHouseholdIncome: 22000, renterPercentage: 40, populationDensity: 4000, medianAge: 43 },
  };
  
  const code = countryCode.toLowerCase();
  const defaults = countryDefaults[code] || {};
  
  console.log(`🌍 Country default demographics: ${countryCode.toUpperCase()}`);
  
  return {
    ...DEFAULT_DEMOGRAPHICS,
    ...defaults,
    geoLevel: 'county',
    confidence: 50,
    dataYear: 2024
  };
}
