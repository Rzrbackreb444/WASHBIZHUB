/**
 * LAUNDROMAT INDUSTRY EVENTS - SEO/AEO OPTIMIZED
 * Major trade shows, conferences, and networking events for the commercial laundry industry
 * All CTAs route to affiliate partner: https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry
 */

import { AFFILIATE_LINK } from "./equipment-catalog";

// Import event/city images
import newOrleansImg from "@assets/generated_images/new_orleans_clean_show_venue.png";
import orlandoImg from "@assets/generated_images/orlando_convention_center_venue.png";
import lasVegasImg from "@assets/generated_images/las_vegas_trade_show_skyline.png";
import chicagoImg from "@assets/generated_images/chicago_conference_venue_skyline.png";
import dallasImg from "@assets/generated_images/dallas_convention_center_venue.png";
import losAngelesImg from "@assets/generated_images/los_angeles_convention_venue.png";
import sanDiegoImg from "@assets/generated_images/san_diego_convention_harbor.png";
import atlantaImg from "@assets/generated_images/atlanta_convention_center_venue.png";
import tradeShowFloorImg from "@assets/generated_images/trade_show_exhibition_floor.png";
import keynoteStageImg from "@assets/generated_images/conference_keynote_stage_setup.png";
import newJerseyImg from "@assets/generated_images/new_jersey_convention_nyc_skyline.png";
import phoenixImg from "@assets/generated_images/phoenix_convention_center_desert.png";
import miamiImg from "@assets/generated_images/miami_convention_center_tropical.png";
import networkingImg from "@assets/generated_images/equipment_networking_event_booth.png";
import seattleImg from "@assets/generated_images/seattle_convention_space_needle.png";

export { AFFILIATE_LINK };

export interface IndustryEvent {
  slug: string;
  name: string;
  tagline: string;
  city: string;
  state: string;
  venue: string;
  startDate: string;
  endDate: string;
  year: number;
  organizer: string;
  website?: string;
  featuredImage: string;
  description: string;
  highlights: string[];
  audienceType: string[];
  expectedAttendance?: string;
  focusKeyphrases: string[];
  metaTitle: string;
  metaDescription: string;
  equipmentBrands?: string[];
  isHighlight: boolean;
}

// Export images for use in other components
export const eventImages = {
  newOrleans: newOrleansImg,
  orlando: orlandoImg,
  lasVegas: lasVegasImg,
  chicago: chicagoImg,
  dallas: dallasImg,
  losAngeles: losAngelesImg,
  sanDiego: sanDiegoImg,
  atlanta: atlantaImg,
  tradeShowFloor: tradeShowFloorImg,
  keynoteStage: keynoteStageImg,
  newJersey: newJerseyImg,
  phoenix: phoenixImg,
  miami: miamiImg,
  networking: networkingImg,
  seattle: seattleImg
};

export const industryEvents: IndustryEvent[] = [
  // ============================================================================
  // FEATURED: HOUSTON ROADSHOW - AADVANTAGE LAUNDRY SYSTEMS
  // ============================================================================
  {
    slug: "houston-roadshow-2025",
    name: "Houston Roadshow",
    tagline: "Network with Lenders, See Equipment Live, and Connect with Industry Professionals",
    city: "Houston",
    state: "Texas",
    venue: "TBA",
    startDate: "2025-06-01",
    endDate: "2025-06-01",
    year: 2025,
    organizer: "AAdvantage Laundry Systems",
    website: "https://www.eventzilla.net/e/houston-roadshow-2138678638",
    featuredImage: dallasImg,
    isHighlight: true,
    description: `Join AAdvantage Laundry Systems for the Houston Roadshow - an exclusive networking event for laundromat buyers, owners, and investors in the Houston metropolitan area.

This intimate roadshow brings together funding partners, equipment experts, and industry professionals for a day of deal-making and relationship building. Whether you're looking to acquire your first laundromat, expand your portfolio, or explore equipment upgrades, the Houston Roadshow connects you with the right people.

Highlights include live equipment demonstrations, one-on-one meetings with lenders, exclusive show pricing, and networking opportunities with successful operators in the Texas market. This is the premier regional event for serious laundromat investors in the Gulf Coast region.`,
    highlights: [
      "Meet pre-vetted funding partners face-to-face",
      "Live equipment demonstrations from AAdvantage Laundry Systems",
      "Exclusive show pricing and equipment discounts",
      "Networking with Houston-area laundromat owners and investors",
      "One-on-one consultations with industry experts",
      "Market insights for the Texas laundromat industry"
    ],
    audienceType: ["Laundromat Buyers", "Investors", "Current Owners", "First-Time Buyers"],
    expectedAttendance: "100+",
    focusKeyphrases: ["Houston laundromat event", "Texas laundromat roadshow", "AAdvantage Laundry Systems", "laundromat networking Houston"],
    metaTitle: "Houston Roadshow 2025 | AAdvantage Laundry Systems | WashBizHub",
    metaDescription: "Join the Houston Roadshow by AAdvantage Laundry Systems. Meet lenders, see equipment live, and network with laundromat professionals in the Houston area.",
    equipmentBrands: ["Dexter", "Continental Girbau", "Speed Queen"]
  },

  // ============================================================================
  // FLAGSHIP EVENT: CLEAN SHOW 2025
  // ============================================================================
  {
    slug: "clean-show-2025-new-orleans",
    name: "Clean Show 2025",
    tagline: "The World's Largest Laundry, Dry Cleaning & Textile Care Exhibition",
    city: "New Orleans",
    state: "Louisiana",
    venue: "Ernest N. Morial Convention Center",
    startDate: "2025-07-31",
    endDate: "2025-08-03",
    year: 2025,
    organizer: "Messe Frankfurt & Riddle & Associates",
    website: "https://cleanshow.com",
    featuredImage: newOrleansImg,
    isHighlight: true,
    description: `The Clean Show is the premier textile care industry event, bringing together laundromat owners, dry cleaners, commercial laundry operators, and equipment manufacturers from around the world. This biennial event features the largest equipment exhibition floor in the industry, with live demonstrations of washers, dryers, ironers, and automation systems from all major brands.

For laundromat owners and investors, Clean Show 2025 offers unparalleled opportunities to compare equipment side-by-side, negotiate deals directly with manufacturers, and learn from industry experts. The event includes educational sessions on topics ranging from operational efficiency to business valuation, making it essential for anyone serious about the laundromat industry.`,
    highlights: [
      "400+ exhibitors showcasing latest equipment and technology",
      "Live equipment demonstrations from Dexter, Continental Girbau, and more",
      "Educational sessions on profitability, operations, and growth strategies",
      "Networking with 12,000+ industry professionals",
      "Special financing offers exclusive to show attendees",
      "Equipment discounts up to 15% for show orders"
    ],
    audienceType: ["Laundromat Owners", "Dry Cleaners", "Commercial Laundry", "Investors", "Equipment Dealers"],
    expectedAttendance: "12,000+",
    focusKeyphrases: ["Clean Show 2025", "laundromat trade show New Orleans", "commercial laundry equipment expo", "laundry industry conference 2025"],
    metaTitle: "Clean Show 2025 New Orleans | Laundromat Trade Show Guide | WashBizHub",
    metaDescription: "Complete guide to Clean Show 2025 in New Orleans. Compare Dexter, Continental Girbau equipment live. 400+ exhibitors, exclusive deals for laundromat owners.",
    equipmentBrands: ["Dexter", "Continental Girbau", "Speed Queen", "Huebsch", "IPSO", "Maytag Commercial"]
  },

  // ============================================================================
  // CLEAN SHOW 2027 (FUTURE)
  // ============================================================================
  {
    slug: "clean-show-2027-orlando",
    name: "Clean Show 2027",
    tagline: "The World's Largest Textile Care Exhibition Returns to Florida",
    city: "Orlando",
    state: "Florida",
    venue: "Orange County Convention Center",
    startDate: "2027-06-17",
    endDate: "2027-06-20",
    year: 2027,
    organizer: "Messe Frankfurt & Riddle & Associates",
    website: "https://cleanshow.com",
    featuredImage: orlandoImg,
    isHighlight: true,
    description: `Clean Show 2027 returns to Orlando, Florida, bringing the world's largest textile care exhibition to one of America's most accessible convention destinations. The Orange County Convention Center offers state-of-the-art facilities and proximity to major airports, hotels, and attractions.

Start planning now for this must-attend industry event. Early birds can lock in hotel rates and plan equipment purchases around the show's exclusive financing offers.`,
    highlights: [
      "World-class Orange County Convention Center venue",
      "Easy access from Orlando International Airport",
      "Family-friendly destination with nearby attractions",
      "Expected 15,000+ attendees",
      "Largest equipment floor in North America"
    ],
    audienceType: ["Laundromat Owners", "Dry Cleaners", "Commercial Laundry", "Investors"],
    expectedAttendance: "15,000+",
    focusKeyphrases: ["Clean Show 2027", "laundromat trade show Orlando", "commercial laundry expo Florida", "laundry equipment show 2027"],
    metaTitle: "Clean Show 2027 Orlando | Future Laundromat Trade Show | WashBizHub",
    metaDescription: "Plan ahead for Clean Show 2027 in Orlando, FL. The world's largest laundry equipment exhibition returns to Florida. Hotels, exhibitors, equipment deals.",
    equipmentBrands: ["Dexter", "Continental Girbau", "Speed Queen", "Huebsch"]
  },

  // ============================================================================
  // COIN LAUNDRY ASSOCIATION EVENTS
  // ============================================================================
  {
    slug: "excellence-in-laundry-2025-las-vegas",
    name: "Excellence in Laundry Conference 2025",
    tagline: "CLA's Premier Annual Event for Laundromat Professionals",
    city: "Las Vegas",
    state: "Nevada",
    venue: "The Venetian Resort",
    startDate: "2025-09-15",
    endDate: "2025-09-17",
    year: 2025,
    organizer: "Coin Laundry Association",
    website: "https://coinlaundry.org",
    featuredImage: lasVegasImg,
    isHighlight: true,
    description: `The Coin Laundry Association's Excellence in Laundry Conference is the premier annual event specifically designed for laundromat owners and operators. Unlike larger trade shows, this focused conference provides deep-dive education on profitability, operations, marketing, and growth strategies specifically for vended laundry.

Held at the luxurious Venetian Resort in Las Vegas, the conference combines world-class education with networking opportunities in one of America's most exciting destinations.`,
    highlights: [
      "Focused education for laundromat owners",
      "Sessions on profitability, marketing, and operations",
      "Networking with successful multi-store operators",
      "Equipment manufacturer presentations",
      "Store tours of top Las Vegas laundromats",
      "Exclusive member pricing and financing offers"
    ],
    audienceType: ["Laundromat Owners", "Investors", "Multi-Store Operators"],
    expectedAttendance: "500+",
    focusKeyphrases: ["CLA Excellence in Laundry", "laundromat conference Las Vegas", "coin laundry association event", "laundromat owner conference 2025"],
    metaTitle: "Excellence in Laundry 2025 Las Vegas | CLA Conference | WashBizHub",
    metaDescription: "CLA Excellence in Laundry Conference 2025 in Las Vegas. Premier education for laundromat owners on profitability, operations, and growth strategies.",
    equipmentBrands: ["Dexter", "Continental Girbau", "Speed Queen"]
  },

  {
    slug: "cla-excellence-workshop-chicago-2025",
    name: "CLA Excellence Workshop Chicago",
    tagline: "One-Day Intensive Training for Midwest Laundromat Owners",
    city: "Chicago",
    state: "Illinois",
    venue: "Hyatt Regency O'Hare",
    startDate: "2025-03-20",
    endDate: "2025-03-20",
    year: 2025,
    organizer: "Coin Laundry Association",
    featuredImage: chicagoImg,
    isHighlight: false,
    description: `The CLA Excellence Workshop brings intensive, one-day training to Chicago for Midwest laundromat owners. This focused workshop covers essential topics including store operations, customer retention, equipment maintenance, and profitability optimization.

Perfect for operators who can't attend multi-day conferences, the workshop provides actionable takeaways you can implement immediately.`,
    highlights: [
      "One-day intensive format",
      "Midwest-focused content and networking",
      "Hands-on operational training",
      "Equipment maintenance best practices",
      "Marketing strategies for local markets"
    ],
    audienceType: ["Laundromat Owners", "Store Managers"],
    expectedAttendance: "100-150",
    focusKeyphrases: ["CLA workshop Chicago", "laundromat training Illinois", "coin laundry workshop Midwest", "laundromat owner education Chicago"],
    metaTitle: "CLA Excellence Workshop Chicago 2025 | Laundromat Training | WashBizHub",
    metaDescription: "CLA Excellence Workshop in Chicago. One-day intensive training for Midwest laundromat owners covering operations, maintenance, and profitability."
  },

  {
    slug: "cla-excellence-workshop-dallas-2025",
    name: "CLA Excellence Workshop Dallas",
    tagline: "One-Day Intensive Training for Texas Laundromat Owners",
    city: "Dallas",
    state: "Texas",
    venue: "Dallas/Fort Worth Marriott Hotel & Golf Club",
    startDate: "2025-05-15",
    endDate: "2025-05-15",
    year: 2025,
    organizer: "Coin Laundry Association",
    featuredImage: dallasImg,
    isHighlight: false,
    description: `The CLA Excellence Workshop comes to Dallas for Texas and Southwest laundromat owners. This intensive one-day training covers the unique challenges and opportunities of operating laundromats in the rapidly growing Texas market.

Topics include handling high-volume stores, managing utility costs in hot climates, and capitalizing on Texas's booming population growth.`,
    highlights: [
      "Texas market-specific content",
      "Utility cost management for hot climates",
      "High-volume store operations",
      "Networking with Texas operators",
      "Local equipment dealer connections"
    ],
    audienceType: ["Laundromat Owners", "Store Managers", "Investors"],
    expectedAttendance: "100-150",
    focusKeyphrases: ["CLA workshop Dallas", "laundromat training Texas", "coin laundry workshop DFW", "laundromat owner education Dallas"],
    metaTitle: "CLA Excellence Workshop Dallas 2025 | Texas Laundromat Training | WashBizHub",
    metaDescription: "CLA Excellence Workshop in Dallas, TX. One-day intensive training for Texas laundromat owners on operations, utility management, and growth strategies."
  },

  {
    slug: "cla-excellence-workshop-los-angeles-2025",
    name: "CLA Excellence Workshop Los Angeles",
    tagline: "One-Day Intensive Training for California Laundromat Owners",
    city: "Los Angeles",
    state: "California",
    venue: "Los Angeles Airport Marriott",
    startDate: "2025-06-12",
    endDate: "2025-06-12",
    year: 2025,
    organizer: "Coin Laundry Association",
    featuredImage: losAngelesImg,
    isHighlight: false,
    description: `The CLA Excellence Workshop brings essential training to Los Angeles for Southern California laundromat owners. California presents unique challenges including high real estate costs, water regulations, and competition—this workshop addresses them all.

Learn strategies for maximizing revenue in premium locations, navigating California's environmental requirements, and competing effectively in dense urban markets.`,
    highlights: [
      "California regulatory compliance training",
      "Water efficiency and conservation",
      "Premium location revenue strategies",
      "Urban market competition tactics",
      "SoCal operator networking"
    ],
    audienceType: ["Laundromat Owners", "Store Managers", "Investors"],
    expectedAttendance: "100-150",
    focusKeyphrases: ["CLA workshop Los Angeles", "laundromat training California", "coin laundry workshop LA", "laundromat owner education SoCal"],
    metaTitle: "CLA Excellence Workshop Los Angeles 2025 | California Laundromat Training | WashBizHub",
    metaDescription: "CLA Excellence Workshop in Los Angeles. One-day training for California laundromat owners on regulations, water efficiency, and urban market strategies."
  },

  // ============================================================================
  // REGIONAL ASSOCIATION EVENTS
  // ============================================================================
  {
    slug: "western-states-laundry-expo-2025-san-diego",
    name: "Western States Laundry & Drycleaning Expo 2025",
    tagline: "West Coast's Premier Regional Laundry Industry Event",
    city: "San Diego",
    state: "California",
    venue: "San Diego Convention Center",
    startDate: "2025-04-25",
    endDate: "2025-04-27",
    year: 2025,
    organizer: "Western States Laundry Association",
    featuredImage: sanDiegoImg,
    isHighlight: true,
    description: `The Western States Laundry & Drycleaning Expo is the largest regional laundry industry event on the West Coast. Held in beautiful San Diego, this expo brings together laundromat owners, dry cleaners, and commercial laundry operators from California, Arizona, Nevada, Oregon, and Washington.

The event features equipment exhibitions, educational sessions, and networking events designed specifically for West Coast operators facing regional challenges like water restrictions, high real estate costs, and competitive urban markets.`,
    highlights: [
      "West Coast's largest regional laundry expo",
      "Equipment exhibitions from major manufacturers",
      "California water regulation updates",
      "West Coast market analysis sessions",
      "San Diego store tours",
      "Beautiful harbor-front venue"
    ],
    audienceType: ["Laundromat Owners", "Dry Cleaners", "Commercial Laundry"],
    expectedAttendance: "1,500+",
    focusKeyphrases: ["Western States Laundry Expo", "laundromat trade show San Diego", "California laundry conference", "West Coast laundry expo 2025"],
    metaTitle: "Western States Laundry Expo 2025 San Diego | West Coast Trade Show | WashBizHub",
    metaDescription: "Western States Laundry & Drycleaning Expo 2025 in San Diego. West Coast's premier regional event with equipment exhibitions and California market insights.",
    equipmentBrands: ["Dexter", "Continental Girbau", "Speed Queen"]
  },

  {
    slug: "clean-classic-2025-atlanta",
    name: "Clean Classic 2025",
    tagline: "Southeast's Premier Laundry & Drycleaning Event",
    city: "Atlanta",
    state: "Georgia",
    venue: "Georgia World Congress Center",
    startDate: "2025-10-17",
    endDate: "2025-10-19",
    year: 2025,
    organizer: "Southeastern Fabricare Association",
    featuredImage: atlantaImg,
    isHighlight: true,
    description: `Clean Classic is the Southeast's premier laundry and drycleaning event, bringing together operators from Georgia, Florida, Alabama, Tennessee, and the Carolinas. The Georgia World Congress Center in downtown Atlanta provides a world-class venue for this growing regional show.

The event features equipment demonstrations, educational tracks for both laundromat and dry cleaning operators, and networking events showcasing the unique opportunities in the rapidly growing Southeast market.`,
    highlights: [
      "Southeast's largest regional laundry show",
      "Growing market opportunities focus",
      "Equipment demonstrations and deals",
      "Southeast operator networking",
      "Atlanta store tours",
      "Southern hospitality atmosphere"
    ],
    audienceType: ["Laundromat Owners", "Dry Cleaners", "Commercial Laundry"],
    expectedAttendance: "1,000+",
    focusKeyphrases: ["Clean Classic Atlanta", "Southeast laundry trade show", "Georgia laundromat conference", "Southern laundry expo 2025"],
    metaTitle: "Clean Classic 2025 Atlanta | Southeast Laundry Trade Show | WashBizHub",
    metaDescription: "Clean Classic 2025 in Atlanta, GA. Southeast's premier laundry & drycleaning event with equipment exhibitions and regional market insights.",
    equipmentBrands: ["Dexter", "Continental Girbau", "Speed Queen"]
  },

  {
    slug: "cleaners-launderers-expo-2025-new-jersey",
    name: "Cleaners & Launderers Expo 2025",
    tagline: "Northeast's Premier Industry Event",
    city: "Secaucus",
    state: "New Jersey",
    venue: "Meadowlands Exposition Center",
    startDate: "2025-11-07",
    endDate: "2025-11-09",
    year: 2025,
    organizer: "Northeast Fabricare Association",
    featuredImage: newJerseyImg,
    isHighlight: true,
    description: `The Cleaners & Launderers Expo is the Northeast's major industry event, conveniently located in Secaucus, New Jersey with easy access from New York City and the entire tri-state area. This expo brings together operators from New York, New Jersey, Connecticut, Pennsylvania, and Massachusetts.

The Meadowlands Exposition Center offers modern facilities just minutes from Manhattan, making this the ideal event for busy Northeast operators who want maximum value from their time.`,
    highlights: [
      "Minutes from New York City",
      "Northeast market focus and insights",
      "Urban laundromat strategies",
      "High-rent location profitability",
      "Equipment exhibitions and deals",
      "Tri-state operator networking"
    ],
    audienceType: ["Laundromat Owners", "Dry Cleaners", "Commercial Laundry"],
    expectedAttendance: "1,200+",
    focusKeyphrases: ["Cleaners Launderers Expo NJ", "Northeast laundry trade show", "New York laundromat conference", "NJ laundry expo 2025"],
    metaTitle: "Cleaners & Launderers Expo 2025 New Jersey | Northeast Trade Show | WashBizHub",
    metaDescription: "Cleaners & Launderers Expo 2025 near NYC. Northeast's premier laundry event with equipment exhibitions, urban market strategies, and tri-state networking.",
    equipmentBrands: ["Dexter", "Continental Girbau", "Speed Queen"]
  },

  // ============================================================================
  // HOSPITALITY & HEALTHCARE LAUNDRY EVENTS
  // ============================================================================
  {
    slug: "alm-impact-2025-miami",
    name: "ALM IMPACT Conference 2025",
    tagline: "Association for Linen Management Annual Conference",
    city: "Miami",
    state: "Florida",
    venue: "Miami Beach Convention Center",
    startDate: "2025-05-04",
    endDate: "2025-05-07",
    year: 2025,
    organizer: "Association for Linen Management",
    featuredImage: miamiImg,
    isHighlight: false,
    description: `The ALM IMPACT Conference is the premier event for healthcare and hospitality linen professionals. While focused on commercial laundry operations rather than self-service laundromats, this event provides valuable insights for operators considering on-premise laundry (OPL) services for hotels, hospitals, and healthcare facilities.

Learn about the growing OPL market and how laundromat owners can expand into commercial accounts.`,
    highlights: [
      "Healthcare laundry best practices",
      "Hotel OPL market insights",
      "Commercial laundry technology",
      "Linen management strategies",
      "Miami Beach venue"
    ],
    audienceType: ["Commercial Laundry", "Healthcare Laundry", "Hotel OPL"],
    expectedAttendance: "800+",
    focusKeyphrases: ["ALM IMPACT Conference", "healthcare laundry conference", "hotel linen management", "commercial laundry Miami 2025"],
    metaTitle: "ALM IMPACT 2025 Miami | Healthcare Laundry Conference | WashBizHub",
    metaDescription: "ALM IMPACT Conference 2025 in Miami Beach. Premier event for healthcare and hospitality linen professionals with OPL market insights."
  },

  // ============================================================================
  // ADDITIONAL REGIONAL EVENTS
  // ============================================================================
  {
    slug: "southwest-laundry-summit-2025-phoenix",
    name: "Southwest Laundry Summit 2025",
    tagline: "Arizona's Premier Laundry Industry Event",
    city: "Phoenix",
    state: "Arizona",
    venue: "Phoenix Convention Center",
    startDate: "2025-02-20",
    endDate: "2025-02-21",
    year: 2025,
    organizer: "Arizona Laundry Association",
    featuredImage: phoenixImg,
    isHighlight: false,
    description: `The Southwest Laundry Summit brings together operators from Arizona, New Mexico, Nevada, and Southern California for focused education on desert-climate laundromat operations. Learn strategies for managing utility costs in extreme heat, water conservation, and capitalizing on the Southwest's growing population.`,
    highlights: [
      "Desert climate operations focus",
      "Water conservation strategies",
      "Southwest market growth opportunities",
      "Equipment cooling and maintenance",
      "Regional networking"
    ],
    audienceType: ["Laundromat Owners", "Store Managers"],
    expectedAttendance: "200+",
    focusKeyphrases: ["Southwest Laundry Summit", "Arizona laundromat conference", "Phoenix laundry event", "desert laundromat operations"],
    metaTitle: "Southwest Laundry Summit 2025 Phoenix | Arizona Conference | WashBizHub",
    metaDescription: "Southwest Laundry Summit 2025 in Phoenix. Arizona's laundry industry event focused on desert operations, water conservation, and regional growth."
  },

  {
    slug: "pacific-northwest-laundry-conference-2025-seattle",
    name: "Pacific Northwest Laundry Conference 2025",
    tagline: "Washington & Oregon Laundry Industry Event",
    city: "Seattle",
    state: "Washington",
    venue: "Seattle Convention Center",
    startDate: "2025-09-25",
    endDate: "2025-09-26",
    year: 2025,
    organizer: "Pacific Northwest Fabricare Association",
    featuredImage: seattleImg,
    isHighlight: false,
    description: `The Pacific Northwest Laundry Conference brings together operators from Washington, Oregon, and Idaho for education and networking focused on the unique challenges of PNW operations. Topics include rain-season marketing, tech-savvy customer expectations, and sustainability practices that resonate with Pacific Northwest consumers.`,
    highlights: [
      "PNW market-specific strategies",
      "Sustainability and eco-friendly operations",
      "Tech-forward customer expectations",
      "Rain-season marketing tactics",
      "Regional operator networking"
    ],
    audienceType: ["Laundromat Owners", "Store Managers"],
    expectedAttendance: "150+",
    focusKeyphrases: ["Pacific Northwest Laundry Conference", "Seattle laundromat event", "Washington laundry conference", "Oregon laundry industry"],
    metaTitle: "Pacific Northwest Laundry Conference 2025 Seattle | WashBizHub",
    metaDescription: "Pacific Northwest Laundry Conference 2025 in Seattle. Washington & Oregon focused event on sustainability, tech customers, and regional strategies."
  }
];

// Get events by year
export function getEventsByYear(year: number): IndustryEvent[] {
  return industryEvents.filter(event => event.year === year);
}

// Get highlight (major) events
export function getHighlightEvents(): IndustryEvent[] {
  return industryEvents.filter(event => event.isHighlight);
}

// Get events by state
export function getEventsByState(state: string): IndustryEvent[] {
  return industryEvents.filter(event => event.state.toLowerCase() === state.toLowerCase());
}

// Get event by slug
export function getEventBySlug(slug: string): IndustryEvent | undefined {
  return industryEvents.find(event => event.slug === slug);
}

// Get upcoming events (after current date)
export function getUpcomingEvents(): IndustryEvent[] {
  const now = new Date();
  return industryEvents
    .filter(event => new Date(event.startDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

// Format date for display
export function formatEventDate(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const yearOptions: Intl.DateTimeFormatOptions = { year: 'numeric' };
  
  if (startDate === endDate) {
    return start.toLocaleDateString('en-US', { ...options, year: 'numeric' });
  }
  
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString('en-US', options)}-${end.getDate()}, ${start.toLocaleDateString('en-US', yearOptions)}`;
  }
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${start.toLocaleDateString('en-US', yearOptions)}`;
}
