import { db } from './db';
import { distributors } from '@shared/schema';

const REGIONS = {
  Northeast: ["CT", "ME", "MA", "NH", "RI", "VT", "NJ", "NY", "PA"],
  Southeast: ["AL", "FL", "GA", "KY", "MS", "NC", "SC", "TN", "VA", "WV"],
  Midwest: ["IL", "IN", "IA", "KS", "MI", "MN", "MO", "NE", "ND", "OH", "SD", "WI"],
  Southwest: ["AZ", "NM", "OK", "TX"],
  West: ["AK", "CA", "CO", "HI", "ID", "MT", "NV", "OR", "UT", "WA", "WY"],
  MidAtlantic: ["DE", "MD", "DC"],
  South: ["AR", "LA"],
};

const EQUIPMENT_TYPES = {
  full: ["washers", "dryers", "washer-extractors", "stack units", "coin mechanisms", "parts"],
  washerDryer: ["washers", "dryers", "stack units", "parts"],
  specialty: ["washer-extractors", "industrial dryers", "ironers", "folders"],
  coinLaundry: ["coin-op washers", "coin-op dryers", "payment systems", "card readers"],
};

interface DistributorData {
  brandName: string;
  distributorName: string;
  regions: string[];
  states: string[];
  equipmentTypes: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string | null;
  commissionRate: string | null;
}

const distributorData: DistributorData[] = [
  // ============ ALLIANCE LAUNDRY SYSTEMS (Speed Queen, Huebsch, UniMac) ============
  // Speed Queen - Northeast
  { brandName: "Speed Queen", distributorName: "New England Speed Queen", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Robert Anderson", contactEmail: "randerson@nespeedqueen.com", contactPhone: "(617) 555-0100", website: "https://nespeedqueen.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Empire State Laundry Systems", regions: ["Northeast"], states: ["NY"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Michael Torres", contactEmail: "mtorres@empirestatelaundry.com", contactPhone: "(212) 555-0101", website: "https://empirestatelaundry.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Garden State Equipment", regions: ["Northeast"], states: ["NJ"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "David Chen", contactEmail: "dchen@gardenstateequip.com", contactPhone: "(973) 555-0102", website: "https://gardenstateequip.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Keystone Commercial Laundry", regions: ["Northeast"], states: ["PA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Jennifer Walsh", contactEmail: "jwalsh@keystonecl.com", contactPhone: "(215) 555-0103", website: "https://keystonecl.com", commissionRate: "3.5" },
  
  // Speed Queen - Southeast
  { brandName: "Speed Queen", distributorName: "Southern Speed Queen", regions: ["Southeast"], states: ["GA", "SC", "NC"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "William Davis", contactEmail: "wdavis@southernspeedqueen.com", contactPhone: "(404) 555-0104", website: "https://southernspeedqueen.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Sunshine State Laundry", regions: ["Southeast"], states: ["FL"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Maria Rodriguez", contactEmail: "mrodriguez@sunshinelaundry.com", contactPhone: "(305) 555-0105", website: "https://sunshinelaundry.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Tennessee Valley Equipment", regions: ["Southeast"], states: ["TN", "KY", "AL", "MS"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "James Martin", contactEmail: "jmartin@tnvalleyequip.com", contactPhone: "(615) 555-0106", website: "https://tnvalleyequip.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Virginia Commercial Laundry", regions: ["Southeast"], states: ["VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Sarah Johnson", contactEmail: "sjohnson@vacl.com", contactPhone: "(804) 555-0107", website: "https://vacl.com", commissionRate: "3.5" },
  
  // Speed Queen - Midwest
  { brandName: "Speed Queen", distributorName: "Great Lakes Laundry Systems", regions: ["Midwest"], states: ["MI", "OH", "IN"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Thomas Miller", contactEmail: "tmiller@greatlakeslaundry.com", contactPhone: "(313) 555-0108", website: "https://greatlakeslaundry.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Heartland Commercial", regions: ["Midwest"], states: ["IL", "WI", "IA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Patricia Brown", contactEmail: "pbrown@heartlandcommercial.com", contactPhone: "(312) 555-0109", website: "https://heartlandcommercial.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Prairie State Equipment", regions: ["Midwest"], states: ["MN", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Christopher Wilson", contactEmail: "cwilson@prairiestateequip.com", contactPhone: "(612) 555-0110", website: "https://prairiestateequip.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Central Plains Laundry", regions: ["Midwest"], states: ["KS", "MO", "NE"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Amanda Taylor", contactEmail: "ataylor@centralplainslaundry.com", contactPhone: "(816) 555-0111", website: "https://centralplainslaundry.com", commissionRate: "3.5" },
  
  // Speed Queen - Southwest/South
  { brandName: "Speed Queen", distributorName: "Lone Star Laundry Equipment", regions: ["Southwest"], states: ["TX"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Robert Garcia", contactEmail: "rgarcia@lonestarlaundry.com", contactPhone: "(214) 555-0112", website: "https://lonestarlaundry.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Houston Commercial Laundry", regions: ["Southwest"], states: ["TX"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Daniel Lee", contactEmail: "dlee@houstoncommercial.com", contactPhone: "(713) 555-0113", website: "https://houstoncommercial.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Southwest Desert Equipment", regions: ["Southwest"], states: ["AZ", "NM"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Lisa Martinez", contactEmail: "lmartinez@swdesertequip.com", contactPhone: "(602) 555-0114", website: "https://swdesertequip.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Oklahoma Laundry Systems", regions: ["Southwest"], states: ["OK"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Kevin Thompson", contactEmail: "kthompson@oklahomalaundry.com", contactPhone: "(405) 555-0115", website: "https://oklahomalaundry.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Bayou State Commercial", regions: ["South"], states: ["LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Nancy White", contactEmail: "nwhite@bayoustatecommercial.com", contactPhone: "(504) 555-0116", website: "https://bayoustatecommercial.com", commissionRate: "3.5" },
  
  // Speed Queen - West
  { brandName: "Speed Queen", distributorName: "Pacific Coast Laundry", regions: ["West"], states: ["CA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Brian Harris", contactEmail: "bharris@pacificcoastlaundry.com", contactPhone: "(213) 555-0117", website: "https://pacificcoastlaundry.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "NorCal Commercial Laundry", regions: ["West"], states: ["CA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Angela Clark", contactEmail: "aclark@norcalcl.com", contactPhone: "(415) 555-0118", website: "https://norcalcl.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Mountain West Equipment", regions: ["West"], states: ["CO", "UT", "WY", "MT"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Steven Lewis", contactEmail: "slewis@mountainwestequip.com", contactPhone: "(303) 555-0119", website: "https://mountainwestequip.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Pacific Northwest Laundry", regions: ["West"], states: ["WA", "OR", "ID"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Michelle Robinson", contactEmail: "mrobinson@pnwlaundry.com", contactPhone: "(206) 555-0120", website: "https://pnwlaundry.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Silver State Commercial", regions: ["West"], states: ["NV"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Joseph Walker", contactEmail: "jwalker@silverstatecommercial.com", contactPhone: "(702) 555-0121", website: "https://silverstatecommercial.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Aloha Laundry Systems", regions: ["West"], states: ["HI"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Catherine Hall", contactEmail: "chall@alohalaundry.com", contactPhone: "(808) 555-0122", website: "https://alohalaundry.com", commissionRate: "3.5" },
  { brandName: "Speed Queen", distributorName: "Last Frontier Equipment", regions: ["West"], states: ["AK"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Donald Young", contactEmail: "dyoung@lastfrontierequip.com", contactPhone: "(907) 555-0123", website: "https://lastfrontierequip.com", commissionRate: "3.5" },
  
  // ============ DEXTER ============
  // Dexter - Northeast
  { brandName: "Dexter", distributorName: "Dexter Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Paul Scott", contactEmail: "pscott@dexternortheast.com", contactPhone: "(617) 555-0200", website: "https://dexternortheast.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Metro NY Dexter", regions: ["Northeast"], states: ["NY", "NJ"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Sandra King", contactEmail: "sking@metronydexter.com", contactPhone: "(212) 555-0201", website: "https://metronydexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Pennsylvania Dexter Sales", regions: ["Northeast"], states: ["PA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "George Wright", contactEmail: "gwright@padextersales.com", contactPhone: "(215) 555-0202", website: "https://padextersales.com", commissionRate: "4.0" },
  
  // Dexter - Southeast
  { brandName: "Dexter", distributorName: "Dixie Dexter", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Betty Lopez", contactEmail: "blopez@dixiedexter.com", contactPhone: "(404) 555-0203", website: "https://dixiedexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Gulf Coast Dexter", regions: ["Southeast"], states: ["AL", "MS", "TN"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Edward Hill", contactEmail: "ehill@gulfcoastdexter.com", contactPhone: "(205) 555-0204", website: "https://gulfcoastdexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Appalachian Dexter", regions: ["Southeast"], states: ["VA", "WV", "KY"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Dorothy Green", contactEmail: "dgreen@appalachiandexter.com", contactPhone: "(804) 555-0205", website: "https://appalachiandexter.com", commissionRate: "4.0" },
  
  // Dexter - Midwest
  { brandName: "Dexter", distributorName: "Great Lakes Dexter", regions: ["Midwest"], states: ["MI", "OH", "IN"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Frank Adams", contactEmail: "fadams@greatlakesdexter.com", contactPhone: "(313) 555-0206", website: "https://greatlakesdexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Heartland Dexter", regions: ["Midwest"], states: ["IL", "WI", "IA", "MN"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Ruth Nelson", contactEmail: "rnelson@heartlanddexter.com", contactPhone: "(312) 555-0207", website: "https://heartlanddexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Plains Dexter Sales", regions: ["Midwest"], states: ["KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Henry Carter", contactEmail: "hcarter@plainsdextersales.com", contactPhone: "(816) 555-0208", website: "https://plainsdextersales.com", commissionRate: "4.0" },
  
  // Dexter - Southwest/South
  { brandName: "Dexter", distributorName: "Texas Dexter", regions: ["Southwest"], states: ["TX"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Virginia Mitchell", contactEmail: "vmitchell@texasdexter.com", contactPhone: "(214) 555-0209", website: "https://texasdexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Southwest Dexter", regions: ["Southwest"], states: ["AZ", "NM", "OK"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Jack Perez", contactEmail: "jperez@southwestdexter.com", contactPhone: "(602) 555-0210", website: "https://southwestdexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Gulf South Dexter", regions: ["South"], states: ["LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Carolyn Roberts", contactEmail: "croberts@gulfsouthdexter.com", contactPhone: "(504) 555-0211", website: "https://gulfsouthdexter.com", commissionRate: "4.0" },
  
  // Dexter - West
  { brandName: "Dexter", distributorName: "SoCal Dexter", regions: ["West"], states: ["CA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Arthur Turner", contactEmail: "aturner@socaldexter.com", contactPhone: "(213) 555-0212", website: "https://socaldexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "NorCal Dexter", regions: ["West"], states: ["CA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Frances Phillips", contactEmail: "fphillips@norcaldexter.com", contactPhone: "(415) 555-0213", website: "https://norcaldexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Rocky Mountain Dexter", regions: ["West"], states: ["CO", "UT", "WY", "MT"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Ralph Campbell", contactEmail: "rcampbell@rmdexter.com", contactPhone: "(303) 555-0214", website: "https://rmdexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Pacific Northwest Dexter", regions: ["West"], states: ["WA", "OR", "ID"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Alice Parker", contactEmail: "aparker@pnwdexter.com", contactPhone: "(206) 555-0215", website: "https://pnwdexter.com", commissionRate: "4.0" },
  { brandName: "Dexter", distributorName: "Nevada Dexter", regions: ["West"], states: ["NV"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Gerald Evans", contactEmail: "gevans@nevadadexter.com", contactPhone: "(702) 555-0216", website: "https://nevadadexter.com", commissionRate: "4.0" },
  
  // ============ HUEBSCH (Alliance) ============
  { brandName: "Huebsch", distributorName: "Huebsch Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT", "NY", "NJ", "PA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Harold Edwards", contactEmail: "hedwards@huebschnortheast.com", contactPhone: "(617) 555-0300", website: "https://huebschnortheast.com", commissionRate: "3.5" },
  { brandName: "Huebsch", distributorName: "Huebsch Southeast", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL", "AL", "MS", "TN", "KY", "VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Marie Collins", contactEmail: "mcollins@huebschsoutheast.com", contactPhone: "(404) 555-0301", website: "https://huebschsoutheast.com", commissionRate: "3.5" },
  { brandName: "Huebsch", distributorName: "Huebsch Midwest", regions: ["Midwest"], states: ["MI", "OH", "IN", "IL", "WI", "IA", "MN", "KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Lawrence Stewart", contactEmail: "lstewart@huebschmidwest.com", contactPhone: "(312) 555-0302", website: "https://huebschmidwest.com", commissionRate: "3.5" },
  { brandName: "Huebsch", distributorName: "Huebsch Southwest", regions: ["Southwest", "South"], states: ["TX", "AZ", "NM", "OK", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Donna Sanchez", contactEmail: "dsanchez@huebschsouthwest.com", contactPhone: "(214) 555-0303", website: "https://huebschsouthwest.com", commissionRate: "3.5" },
  { brandName: "Huebsch", distributorName: "Huebsch West", regions: ["West"], states: ["CA", "CO", "UT", "WY", "MT", "WA", "OR", "ID", "NV", "HI", "AK"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Charles Morris", contactEmail: "cmorris@huebschwest.com", contactPhone: "(213) 555-0304", website: "https://huebschwest.com", commissionRate: "3.5" },
  
  // ============ UNIMAC (Alliance) ============
  { brandName: "UniMac", distributorName: "UniMac Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT", "NY", "NJ", "PA"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Judy Rogers", contactEmail: "jrogers@unimacnortheast.com", contactPhone: "(617) 555-0400", website: "https://unimacnortheast.com", commissionRate: "3.5" },
  { brandName: "UniMac", distributorName: "UniMac Southeast", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL", "AL", "MS", "TN", "KY", "VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Walter Reed", contactEmail: "wreed@unimacsoutheast.com", contactPhone: "(404) 555-0401", website: "https://unimacsoutheast.com", commissionRate: "3.5" },
  { brandName: "UniMac", distributorName: "UniMac Midwest", regions: ["Midwest"], states: ["MI", "OH", "IN", "IL", "WI", "IA", "MN", "KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Janet Cook", contactEmail: "jcook@unimacmidwest.com", contactPhone: "(312) 555-0402", website: "https://unimacmidwest.com", commissionRate: "3.5" },
  { brandName: "UniMac", distributorName: "UniMac Southwest", regions: ["Southwest", "South"], states: ["TX", "AZ", "NM", "OK", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Eugene Morgan", contactEmail: "emorgan@unimacsouthwest.com", contactPhone: "(214) 555-0403", website: "https://unimacsouthwest.com", commissionRate: "3.5" },
  { brandName: "UniMac", distributorName: "UniMac West", regions: ["West"], states: ["CA", "CO", "UT", "WY", "MT", "WA", "OR", "ID", "NV", "HI", "AK"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Margaret Bell", contactEmail: "mbell@unimacwest.com", contactPhone: "(213) 555-0404", website: "https://unimacwest.com", commissionRate: "3.5" },
  
  // ============ MAYTAG COMMERCIAL ============
  { brandName: "Maytag Commercial", distributorName: "Maytag Commercial Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT", "NY", "NJ", "PA"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Raymond Murphy", contactEmail: "rmurphy@maytagcnortheast.com", contactPhone: "(617) 555-0500", website: "https://maytagcnortheast.com", commissionRate: "3.0" },
  { brandName: "Maytag Commercial", distributorName: "Maytag Commercial Southeast", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL", "AL", "MS", "TN", "KY", "VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Helen Bailey", contactEmail: "hbailey@maytagcsoutheast.com", contactPhone: "(404) 555-0501", website: "https://maytagcsoutheast.com", commissionRate: "3.0" },
  { brandName: "Maytag Commercial", distributorName: "Maytag Commercial Midwest", regions: ["Midwest"], states: ["MI", "OH", "IN", "IL", "WI", "IA", "MN", "KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Carl Rivera", contactEmail: "crivera@maytagcmidwest.com", contactPhone: "(312) 555-0502", website: "https://maytagcmidwest.com", commissionRate: "3.0" },
  { brandName: "Maytag Commercial", distributorName: "Maytag Commercial Southwest", regions: ["Southwest", "South"], states: ["TX", "AZ", "NM", "OK", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Sharon Cooper", contactEmail: "scooper@maytagcsouthwest.com", contactPhone: "(214) 555-0503", website: "https://maytagcsouthwest.com", commissionRate: "3.0" },
  { brandName: "Maytag Commercial", distributorName: "Maytag Commercial West", regions: ["West"], states: ["CA", "CO", "UT", "WY", "MT", "WA", "OR", "ID", "NV", "HI", "AK"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Willie Richardson", contactEmail: "wrichardson@maytagcwest.com", contactPhone: "(213) 555-0504", website: "https://maytagcwest.com", commissionRate: "3.0" },
  
  // ============ WASCOMAT ============
  { brandName: "Wascomat", distributorName: "Wascomat Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT", "NY", "NJ", "PA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Bonnie Cox", contactEmail: "bcox@wascomatnortheast.com", contactPhone: "(617) 555-0600", website: "https://wascomatnortheast.com", commissionRate: "3.5" },
  { brandName: "Wascomat", distributorName: "Wascomat Southeast", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL", "AL", "MS", "TN", "KY", "VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Bruce Howard", contactEmail: "bhoward@wascomatsoutheast.com", contactPhone: "(404) 555-0601", website: "https://wascomatsoutheast.com", commissionRate: "3.5" },
  { brandName: "Wascomat", distributorName: "Wascomat Midwest", regions: ["Midwest"], states: ["MI", "OH", "IN", "IL", "WI", "IA", "MN", "KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Gloria Ward", contactEmail: "gward@wascomatnidwest.com", contactPhone: "(312) 555-0602", website: "https://wascomatnidwest.com", commissionRate: "3.5" },
  { brandName: "Wascomat", distributorName: "Wascomat Southwest", regions: ["Southwest", "South"], states: ["TX", "AZ", "NM", "OK", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Terry Torres", contactEmail: "ttorres@wascomatsouthwest.com", contactPhone: "(214) 555-0603", website: "https://wascomatsouthwest.com", commissionRate: "3.5" },
  { brandName: "Wascomat", distributorName: "Wascomat West", regions: ["West"], states: ["CA", "CO", "UT", "WY", "MT", "WA", "OR", "ID", "NV", "HI", "AK"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Diana Peterson", contactEmail: "dpeterson@wascomatnest.com", contactPhone: "(213) 555-0604", website: "https://wascomatnest.com", commissionRate: "3.5" },
  
  // ============ ELECTROLUX PROFESSIONAL ============
  { brandName: "Electrolux Professional", distributorName: "Electrolux Pro Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT", "NY", "NJ", "PA"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Roy Gray", contactEmail: "rgray@electroluxpronortheast.com", contactPhone: "(617) 555-0700", website: "https://electroluxpronortheast.com", commissionRate: "4.0" },
  { brandName: "Electrolux Professional", distributorName: "Electrolux Pro Southeast", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL", "AL", "MS", "TN", "KY", "VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Pamela Ramirez", contactEmail: "pramirez@electroluxprosoutheast.com", contactPhone: "(404) 555-0701", website: "https://electroluxprosoutheast.com", commissionRate: "4.0" },
  { brandName: "Electrolux Professional", distributorName: "Electrolux Pro Midwest", regions: ["Midwest"], states: ["MI", "OH", "IN", "IL", "WI", "IA", "MN", "KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Douglas James", contactEmail: "djames@electroluxpromidwest.com", contactPhone: "(312) 555-0702", website: "https://electroluxpromidwest.com", commissionRate: "4.0" },
  { brandName: "Electrolux Professional", distributorName: "Electrolux Pro Southwest", regions: ["Southwest", "South"], states: ["TX", "AZ", "NM", "OK", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Deborah Watson", contactEmail: "dwatson@electroluxprosouthwest.com", contactPhone: "(214) 555-0703", website: "https://electroluxprosouthwest.com", commissionRate: "4.0" },
  { brandName: "Electrolux Professional", distributorName: "Electrolux Pro West", regions: ["West"], states: ["CA", "CO", "UT", "WY", "MT", "WA", "OR", "ID", "NV", "HI", "AK"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Philip Brooks", contactEmail: "pbrooks@electroluxprowest.com", contactPhone: "(213) 555-0704", website: "https://electroluxprowest.com", commissionRate: "4.0" },
  
  // ============ MILNOR ============
  { brandName: "Milnor", distributorName: "Milnor Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT", "NY", "NJ", "PA"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Cynthia Kelly", contactEmail: "ckelly@milnornortheast.com", contactPhone: "(617) 555-0800", website: "https://milnornortheast.com", commissionRate: "4.5" },
  { brandName: "Milnor", distributorName: "Milnor Southeast", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL", "AL", "MS", "TN", "KY", "VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Jerry Sanders", contactEmail: "jsanders@milnorsoutheast.com", contactPhone: "(404) 555-0801", website: "https://milnorsoutheast.com", commissionRate: "4.5" },
  { brandName: "Milnor", distributorName: "Milnor Midwest", regions: ["Midwest"], states: ["MI", "OH", "IN", "IL", "WI", "IA", "MN", "KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Theresa Price", contactEmail: "tprice@milnormidwest.com", contactPhone: "(312) 555-0802", website: "https://milnormidwest.com", commissionRate: "4.5" },
  { brandName: "Milnor", distributorName: "Milnor Southwest", regions: ["Southwest", "South"], states: ["TX", "AZ", "NM", "OK", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Wayne Bennett", contactEmail: "wbennett@milnorsouthwest.com", contactPhone: "(214) 555-0803", website: "https://milnorsouthwest.com", commissionRate: "4.5" },
  { brandName: "Milnor", distributorName: "Milnor West", regions: ["West"], states: ["CA", "CO", "UT", "WY", "MT", "WA", "OR", "ID", "NV", "HI", "AK"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Joyce Wood", contactEmail: "jwood@milnorwest.com", contactPhone: "(213) 555-0804", website: "https://milnorwest.com", commissionRate: "4.5" },
  
  // ============ CONTINENTAL GIRBAU ============
  { brandName: "Continental Girbau", distributorName: "Continental Girbau Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT", "NY", "NJ", "PA"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Anne Barnes", contactEmail: "abarnes@continentalnortheast.com", contactPhone: "(617) 555-0900", website: "https://continentalnortheast.com", commissionRate: "4.0" },
  { brandName: "Continental Girbau", distributorName: "Continental Girbau Southeast", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL", "AL", "MS", "TN", "KY", "VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Russell Ross", contactEmail: "rross@continentalsoutheast.com", contactPhone: "(404) 555-0901", website: "https://continentalsoutheast.com", commissionRate: "4.0" },
  { brandName: "Continental Girbau", distributorName: "Continental Girbau Midwest", regions: ["Midwest"], states: ["MI", "OH", "IN", "IL", "WI", "IA", "MN", "KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Janice Henderson", contactEmail: "jhenderson@continentalmidwest.com", contactPhone: "(312) 555-0902", website: "https://continentalmidwest.com", commissionRate: "4.0" },
  { brandName: "Continental Girbau", distributorName: "Continental Girbau Southwest", regions: ["Southwest", "South"], states: ["TX", "AZ", "NM", "OK", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Aaron Coleman", contactEmail: "acoleman@continentalsouthwest.com", contactPhone: "(214) 555-0903", website: "https://continentalsouthwest.com", commissionRate: "4.0" },
  { brandName: "Continental Girbau", distributorName: "Continental Girbau West", regions: ["West"], states: ["CA", "CO", "UT", "WY", "MT", "WA", "OR", "ID", "NV", "HI", "AK"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Lori Jenkins", contactEmail: "ljenkins@continentalwest.com", contactPhone: "(213) 555-0904", website: "https://continentalwest.com", commissionRate: "4.0" },
  
  // ============ MIELE PROFESSIONAL ============
  { brandName: "Miele Professional", distributorName: "Miele Pro Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT", "NY", "NJ", "PA"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Patrick Perry", contactEmail: "pperry@mielepronortheast.com", contactPhone: "(617) 555-1000", website: "https://mielepronortheast.com", commissionRate: "4.5" },
  { brandName: "Miele Professional", distributorName: "Miele Pro Southeast", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL", "AL", "MS", "TN", "KY", "VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Katherine Powell", contactEmail: "kpowell@mieleprosoutheast.com", contactPhone: "(404) 555-1001", website: "https://mieleprosoutheast.com", commissionRate: "4.5" },
  { brandName: "Miele Professional", distributorName: "Miele Pro Midwest", regions: ["Midwest"], states: ["MI", "OH", "IN", "IL", "WI", "IA", "MN", "KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Stephen Long", contactEmail: "slong@mielepromidwest.com", contactPhone: "(312) 555-1002", website: "https://mielepromidwest.com", commissionRate: "4.5" },
  { brandName: "Miele Professional", distributorName: "Miele Pro Southwest", regions: ["Southwest", "South"], states: ["TX", "AZ", "NM", "OK", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Rebecca Patterson", contactEmail: "rpatterson@mieleprosouthwest.com", contactPhone: "(214) 555-1003", website: "https://mieleprosouthwest.com", commissionRate: "4.5" },
  { brandName: "Miele Professional", distributorName: "Miele Pro West", regions: ["West"], states: ["CA", "CO", "UT", "WY", "MT", "WA", "OR", "ID", "NV", "HI", "AK"], equipmentTypes: EQUIPMENT_TYPES.specialty, contactName: "Scott Hughes", contactEmail: "shughes@mieleprowest.com", contactPhone: "(213) 555-1004", website: "https://mieleprowest.com", commissionRate: "4.5" },
  
  // ============ LG COMMERCIAL ============
  { brandName: "LG Commercial", distributorName: "LG Commercial Northeast", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT", "NY", "NJ", "PA"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Timothy Flores", contactEmail: "tflores@lgcommercialnortheast.com", contactPhone: "(617) 555-1100", website: "https://lgcommercialnortheast.com", commissionRate: "3.0" },
  { brandName: "LG Commercial", distributorName: "LG Commercial Southeast", regions: ["Southeast"], states: ["GA", "SC", "NC", "FL", "AL", "MS", "TN", "KY", "VA", "WV"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Nicole Washington", contactEmail: "nwashington@lgcommercialsoutheast.com", contactPhone: "(404) 555-1101", website: "https://lgcommercialsoutheast.com", commissionRate: "3.0" },
  { brandName: "LG Commercial", distributorName: "LG Commercial Midwest", regions: ["Midwest"], states: ["MI", "OH", "IN", "IL", "WI", "IA", "MN", "KS", "MO", "NE", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Adam Butler", contactEmail: "abutler@lgcommercialmidwest.com", contactPhone: "(312) 555-1102", website: "https://lgcommercialmidwest.com", commissionRate: "3.0" },
  { brandName: "LG Commercial", distributorName: "LG Commercial Southwest", regions: ["Southwest", "South"], states: ["TX", "AZ", "NM", "OK", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Samantha Simmons", contactEmail: "ssimmons@lgcommercialsouthwest.com", contactPhone: "(214) 555-1103", website: "https://lgcommercialsouthwest.com", commissionRate: "3.0" },
  { brandName: "LG Commercial", distributorName: "LG Commercial West", regions: ["West"], states: ["CA", "CO", "UT", "WY", "MT", "WA", "OR", "ID", "NV", "HI", "AK"], equipmentTypes: EQUIPMENT_TYPES.coinLaundry, contactName: "Joshua Foster", contactEmail: "jfoster@lgcommercialwest.com", contactPhone: "(213) 555-1104", website: "https://lgcommercialwest.com", commissionRate: "3.0" },
  
  // ============ INDEPENDENT MULTI-LINE DISTRIBUTORS ============
  // These carry multiple brands and focus on specific regions
  { brandName: "Multi-Brand", distributorName: "Northeast Equipment Solutions", regions: ["Northeast"], states: ["MA", "NH", "ME", "VT", "RI", "CT"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Craig Bryant", contactEmail: "cbryant@nees.com", contactPhone: "(617) 555-1200", website: "https://nees.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Metro NY Equipment", regions: ["Northeast"], states: ["NY", "NJ"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Rachel Alexander", contactEmail: "ralexander@metroequip.com", contactPhone: "(212) 555-1201", website: "https://metroequip.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Atlantic Coast Laundry", regions: ["Northeast", "Southeast"], states: ["PA", "MD", "DE", "VA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Gary Russell", contactEmail: "grussell@atlanticcoastlaundry.com", contactPhone: "(215) 555-1202", website: "https://atlanticcoastlaundry.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Southeast Commercial Laundry", regions: ["Southeast"], states: ["FL", "GA", "SC", "NC"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Christine Griffin", contactEmail: "cgriffin@secl.com", contactPhone: "(404) 555-1203", website: "https://secl.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Deep South Equipment", regions: ["Southeast", "South"], states: ["AL", "MS", "LA", "AR"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Juan Diaz", contactEmail: "jdiaz@deepsouthequip.com", contactPhone: "(504) 555-1204", website: "https://deepsouthequip.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Volunteer State Commercial", regions: ["Southeast"], states: ["TN", "KY"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Angela Hayes", contactEmail: "ahayes@volunteerstate.com", contactPhone: "(615) 555-1205", website: "https://volunteerstate.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Great Lakes Equipment Corp", regions: ["Midwest"], states: ["MI", "OH", "IN"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Keith Myers", contactEmail: "kmyers@glec.com", contactPhone: "(313) 555-1206", website: "https://glec.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Chicago Commercial Laundry", regions: ["Midwest"], states: ["IL", "WI"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Melissa Ford", contactEmail: "mford@chicagocommercial.com", contactPhone: "(312) 555-1207", website: "https://chicagocommercial.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Twin Cities Equipment", regions: ["Midwest"], states: ["MN", "ND", "SD"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Brian Hamilton", contactEmail: "bhamilton@twincitiesequip.com", contactPhone: "(612) 555-1208", website: "https://twincitiesequip.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Kansas City Laundry Systems", regions: ["Midwest"], states: ["KS", "MO", "NE", "IA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Victoria Graham", contactEmail: "vgraham@kclaundry.com", contactPhone: "(816) 555-1209", website: "https://kclaundry.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Texas Commercial Equipment", regions: ["Southwest"], states: ["TX"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Dennis Sullivan", contactEmail: "dsullivan@texascommercial.com", contactPhone: "(214) 555-1210", website: "https://texascommercial.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Gulf Texas Laundry", regions: ["Southwest"], states: ["TX"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Laura Wallace", contactEmail: "lwallace@gulftexas.com", contactPhone: "(713) 555-1211", website: "https://gulftexas.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Alamo Equipment Group", regions: ["Southwest"], states: ["TX"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Bobby West", contactEmail: "bwest@alamoequip.com", contactPhone: "(210) 555-1212", website: "https://alamoequip.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Southwest Equipment Partners", regions: ["Southwest"], states: ["AZ", "NM"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Kimberly Cole", contactEmail: "kcole@swep.com", contactPhone: "(602) 555-1213", website: "https://swep.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Oklahoma Commercial Systems", regions: ["Southwest"], states: ["OK"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Gregory Jordan", contactEmail: "gjordan@okcommercial.com", contactPhone: "(405) 555-1214", website: "https://okcommercial.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Southern California Equipment", regions: ["West"], states: ["CA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Julia Reynolds", contactEmail: "jreynolds@socale.com", contactPhone: "(213) 555-1215", website: "https://socale.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Bay Area Laundry Systems", regions: ["West"], states: ["CA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Christopher Owens", contactEmail: "cowens@bayarealaundry.com", contactPhone: "(415) 555-1216", website: "https://bayarealaundry.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Central California Equipment", regions: ["West"], states: ["CA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Megan Fisher", contactEmail: "mfisher@centralcaequip.com", contactPhone: "(559) 555-1217", website: "https://centralcaequip.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "San Diego Commercial Laundry", regions: ["West"], states: ["CA"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Trevor Ellis", contactEmail: "tellis@sdcl.com", contactPhone: "(619) 555-1218", website: "https://sdcl.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Rocky Mountain Laundry Systems", regions: ["West"], states: ["CO", "UT", "WY"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Ashley Hunt", contactEmail: "ahunt@rockymtnlaundry.com", contactPhone: "(303) 555-1219", website: "https://rockymtnlaundry.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Pacific Northwest Equipment", regions: ["West"], states: ["WA", "OR"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Brandon Porter", contactEmail: "bporter@pnweq.com", contactPhone: "(206) 555-1220", website: "https://pnweq.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Idaho Montana Equipment", regions: ["West"], states: ["ID", "MT"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Natalie Hicks", contactEmail: "nhicks@idahomontana.com", contactPhone: "(208) 555-1221", website: "https://idahomontana.com", commissionRate: "4.0" },
  { brandName: "Multi-Brand", distributorName: "Las Vegas Commercial", regions: ["West"], states: ["NV"], equipmentTypes: EQUIPMENT_TYPES.full, contactName: "Anthony Powell", contactEmail: "apowell@lvcommercial.com", contactPhone: "(702) 555-1222", website: "https://lvcommercial.com", commissionRate: "4.0" },
  
  // ============ SPECIALTY DISTRIBUTORS ============
  // Parts & Service Only
  { brandName: "Parts & Service", distributorName: "National Laundry Parts", regions: ["Northeast", "Southeast", "Midwest", "Southwest", "West"], states: ["MA", "NY", "FL", "TX", "CA", "IL"], equipmentTypes: ["parts", "maintenance", "repairs"], contactName: "Wayne Armstrong", contactEmail: "warmstrong@nationalparts.com", contactPhone: "(800) 555-1300", website: "https://nationalparts.com", commissionRate: "2.0" },
  { brandName: "Parts & Service", distributorName: "Commercial Laundry Repairs", regions: ["Northeast", "Southeast", "Midwest", "Southwest", "West"], states: ["MA", "GA", "OH", "TX", "CA"], equipmentTypes: ["parts", "maintenance", "repairs"], contactName: "Tiffany Berry", contactEmail: "tberry@clrepairs.com", contactPhone: "(800) 555-1301", website: "https://clrepairs.com", commissionRate: "2.0" },
  
  // Payment Systems
  { brandName: "Payment Systems", distributorName: "Coin & Card Systems", regions: ["Northeast", "Southeast", "Midwest", "Southwest", "West"], states: ["NY", "FL", "IL", "TX", "CA"], equipmentTypes: ["coin mechanisms", "card readers", "mobile payment", "payment kiosks"], contactName: "Raymond Black", contactEmail: "rblack@coincard.com", contactPhone: "(800) 555-1302", website: "https://coincard.com", commissionRate: "3.0" },
  { brandName: "Payment Systems", distributorName: "LaundryPay Solutions", regions: ["Northeast", "Southeast", "Midwest", "Southwest", "West"], states: ["MA", "GA", "OH", "AZ", "WA"], equipmentTypes: ["card readers", "mobile payment", "loyalty systems"], contactName: "Crystal Crawford", contactEmail: "ccrawford@laundrypay.com", contactPhone: "(800) 555-1303", website: "https://laundrypay.com", commissionRate: "3.0" },
  
  // Used Equipment
  { brandName: "Used Equipment", distributorName: "Pre-Owned Laundry Equipment", regions: ["Northeast", "Southeast", "Midwest", "Southwest", "West"], states: ["NY", "FL", "OH", "TX", "CA"], equipmentTypes: ["used washers", "used dryers", "refurbished equipment"], contactName: "Oscar Dean", contactEmail: "odean@preownedlaundry.com", contactPhone: "(800) 555-1304", website: "https://preownedlaundry.com", commissionRate: "5.0" },
  { brandName: "Used Equipment", distributorName: "Second Chance Equipment", regions: ["Northeast", "Midwest"], states: ["PA", "OH", "MI", "IL"], equipmentTypes: ["used washers", "used dryers", "refurbished equipment"], contactName: "Heather Mills", contactEmail: "hmills@secondchance.com", contactPhone: "(800) 555-1305", website: "https://secondchance.com", commissionRate: "5.0" },
  
  // Additional regional distributors to reach 350+
  ...generateAdditionalDistributors(),
];

function generateAdditionalDistributors(): DistributorData[] {
  const additionalDistributors: DistributorData[] = [];
  const brands = ["Speed Queen", "Dexter", "Huebsch", "UniMac", "Maytag Commercial", "Wascomat", "Electrolux Professional", "Milnor", "Continental Girbau", "Miele Professional", "LG Commercial"];
  const cities = [
    { city: "Boston", state: "MA", phone: "(617) 555-" },
    { city: "New York", state: "NY", phone: "(212) 555-" },
    { city: "Philadelphia", state: "PA", phone: "(215) 555-" },
    { city: "Washington DC", state: "MD", phone: "(202) 555-" },
    { city: "Miami", state: "FL", phone: "(305) 555-" },
    { city: "Tampa", state: "FL", phone: "(813) 555-" },
    { city: "Orlando", state: "FL", phone: "(407) 555-" },
    { city: "Jacksonville", state: "FL", phone: "(904) 555-" },
    { city: "Atlanta", state: "GA", phone: "(404) 555-" },
    { city: "Charlotte", state: "NC", phone: "(704) 555-" },
    { city: "Nashville", state: "TN", phone: "(615) 555-" },
    { city: "Chicago", state: "IL", phone: "(312) 555-" },
    { city: "Detroit", state: "MI", phone: "(313) 555-" },
    { city: "Cleveland", state: "OH", phone: "(216) 555-" },
    { city: "Columbus", state: "OH", phone: "(614) 555-" },
    { city: "Cincinnati", state: "OH", phone: "(513) 555-" },
    { city: "Indianapolis", state: "IN", phone: "(317) 555-" },
    { city: "Milwaukee", state: "WI", phone: "(414) 555-" },
    { city: "Minneapolis", state: "MN", phone: "(612) 555-" },
    { city: "St. Louis", state: "MO", phone: "(314) 555-" },
    { city: "Kansas City", state: "MO", phone: "(816) 555-" },
    { city: "Dallas", state: "TX", phone: "(214) 555-" },
    { city: "Houston", state: "TX", phone: "(713) 555-" },
    { city: "Austin", state: "TX", phone: "(512) 555-" },
    { city: "San Antonio", state: "TX", phone: "(210) 555-" },
    { city: "Fort Worth", state: "TX", phone: "(817) 555-" },
    { city: "El Paso", state: "TX", phone: "(915) 555-" },
    { city: "Phoenix", state: "AZ", phone: "(602) 555-" },
    { city: "Tucson", state: "AZ", phone: "(520) 555-" },
    { city: "Denver", state: "CO", phone: "(303) 555-" },
    { city: "Salt Lake City", state: "UT", phone: "(801) 555-" },
    { city: "Las Vegas", state: "NV", phone: "(702) 555-" },
    { city: "Los Angeles", state: "CA", phone: "(213) 555-" },
    { city: "San Diego", state: "CA", phone: "(619) 555-" },
    { city: "San Francisco", state: "CA", phone: "(415) 555-" },
    { city: "San Jose", state: "CA", phone: "(408) 555-" },
    { city: "Sacramento", state: "CA", phone: "(916) 555-" },
    { city: "Fresno", state: "CA", phone: "(559) 555-" },
    { city: "Bakersfield", state: "CA", phone: "(661) 555-" },
    { city: "Seattle", state: "WA", phone: "(206) 555-" },
    { city: "Portland", state: "OR", phone: "(503) 555-" },
    { city: "Boise", state: "ID", phone: "(208) 555-" },
  ];
  
  const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
  
  let counter = 2000;
  
  for (const brand of brands) {
    for (const location of cities) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const emailBase = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
      const companyBase = `${location.city.replace(/\s/g, '').toLowerCase()}${brand.replace(/\s/g, '').toLowerCase()}`;
      
      additionalDistributors.push({
        brandName: brand,
        distributorName: `${location.city} ${brand} Sales`,
        regions: [getRegionForState(location.state)],
        states: [location.state],
        equipmentTypes: EQUIPMENT_TYPES.full,
        contactName: `${firstName} ${lastName}`,
        contactEmail: `${emailBase}@${companyBase}.com`,
        contactPhone: `${location.phone}${String(counter).slice(-4)}`,
        website: `https://${companyBase}.com`,
        commissionRate: (3 + Math.random() * 2).toFixed(1),
      });
      counter++;
    }
  }
  
  return additionalDistributors;
}

function getRegionForState(state: string): string {
  for (const [region, states] of Object.entries(REGIONS)) {
    if (states.includes(state)) return region;
  }
  return "Other";
}

export async function seedDistributors() {
  console.log('🏭 Seeding distributors...');
  
  try {
    // Check if we already have enough distributors
    const existingCount = await db.select({ count: distributors.id }).from(distributors);
    if (existingCount.length > 0 && Object.keys(existingCount[0]).length > 50) {
      console.log('✅ Distributors already seeded');
      return;
    }
    
    // Insert distributors in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < distributorData.length; i += batchSize) {
      const batch = distributorData.slice(i, i + batchSize);
      await db.insert(distributors).values(batch.map(d => ({
        brandName: d.brandName,
        distributorName: d.distributorName,
        regions: d.regions,
        states: d.states,
        equipmentTypes: d.equipmentTypes,
        contactName: d.contactName,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
        website: d.website,
        commissionRate: d.commissionRate,
        active: true,
      }))).onConflictDoNothing();
      
      inserted += batch.length;
      console.log(`  Inserted batch ${Math.ceil(i / batchSize) + 1}: ${inserted}/${distributorData.length} distributors`);
    }
    
    console.log(`✅ Seeded ${inserted} distributors`);
  } catch (error) {
    console.error('❌ Error seeding distributors:', error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedDistributors()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
