/**
 * Enterprise-Grade Demo Data Seeding
 * Creates impressive demo data showcasing platform capabilities
 */

import { db } from "./db";
import { 
  brokerProfiles, users, listings, listingFinancials, 
  activityEvents, savedSearches, favoriteListings,
  userConnections
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Premium Broker Profiles - Industry Leaders
const demoBrokers = [
  {
    companyName: "Laundry Business Specialists",
    licenseNumber: "DRE-01892456",
    website: "https://laundrybusinessspecialists.com",
    phone: "(310) 555-0147",
    email: "deals@laundrybusinessspecialists.com",
    bio: `With over 25 years in the laundromat industry, Laundry Business Specialists has facilitated over $150M in successful transactions. Our team of certified business brokers specializes exclusively in coin laundry and related businesses across California, Arizona, and Nevada.

We provide comprehensive services including:
• Confidential business valuations
• Strategic marketing to qualified buyers
• SBA loan facilitation partnerships
• Due diligence support
• Transition planning and training

Our proprietary database of pre-qualified buyers ensures maximum exposure for your listing while maintaining strict confidentiality.`,
    specializations: ["laundromats", "coin_laundry", "fluff_fold", "card_operated"],
    yearsExperience: 25,
    nickname: "The Laundry Pros",
    countries: ["US"],
    regions: ["CA", "AZ", "NV", "TX"],
    totalListings: 47,
    activeListings: 23,
    soldListings: 389,
    averageDaysToSell: 67,
    verified: true,
    slug: "laundry-business-specialists",
    storefrontEnabled: true,
    storefrontTheme: { primaryColor: "#1E40AF", accentColor: "#C8A661" },
    testimonials: [
      { name: "Michael Chen", role: "Laundromat Owner", text: "They found the perfect buyer for my 3-location portfolio in just 45 days. Incredible service!", rating: 5 },
      { name: "Sandra Williams", role: "First-Time Buyer", text: "Their guidance through the SBA process was invaluable. Couldn't have done it without them.", rating: 5 },
      { name: "Robert Garcia", role: "Serial Investor", text: "I've bought 7 laundromats through them. Always professional, always deliver.", rating: 5 },
    ],
  },
  {
    companyName: "Empire Laundry Brokers",
    licenseNumber: "NYS-10948732",
    website: "https://empirelaundrybrokers.com",
    phone: "(212) 555-0298",
    email: "info@empirelaundrybrokers.com",
    bio: `Empire Laundry Brokers is New York's premier laundromat brokerage, serving the Tri-State area for over 18 years. We specialize in high-volume urban laundromats, card-operated facilities, and wash-dry-fold operations.

Our deep knowledge of NYC's unique market dynamics—including lease negotiations, union considerations, and utility optimization—sets us apart. We've closed deals in all five boroughs and understand the nuances of each neighborhood.

Services:
• Free confidential valuations
• Professional photography & marketing
• Buyer pre-qualification
• Deal structuring expertise
• Post-sale transition support`,
    specializations: ["laundromats", "wash_dry_fold", "urban_locations", "high_volume"],
    yearsExperience: 18,
    nickname: "NYC Laundry King",
    countries: ["US"],
    regions: ["NY", "NJ", "CT", "PA"],
    totalListings: 31,
    activeListings: 14,
    soldListings: 256,
    averageDaysToSell: 52,
    verified: true,
    slug: "empire-laundry-brokers",
    storefrontEnabled: true,
    storefrontTheme: { primaryColor: "#0A1628", accentColor: "#D4AF37" },
    testimonials: [
      { name: "James Rodriguez", role: "Brooklyn Operator", text: "Sold my Williamsburg location at 15% above asking. These guys know the NYC market inside out.", rating: 5 },
      { name: "Patricia Kim", role: "Multi-Unit Owner", text: "Professional, responsive, and they actually understand laundromat economics.", rating: 5 },
    ],
  },
  {
    companyName: "Sunbelt Laundry Advisors",
    licenseNumber: "FL-BK3448921",
    website: "https://sunbeltlaundryadvisors.com", 
    phone: "(305) 555-0412",
    email: "acquisitions@sunbeltlaundryadvisors.com",
    bio: `Florida's fastest-growing laundromat brokerage, Sunbelt Laundry Advisors specializes in the unique opportunities of the Sunshine State market. From Miami's high-density urban locations to Orlando's tourism-adjacent opportunities, we know Florida laundromats.

Our team includes former laundromat operators, CPA-certified business valuators, and SBA-approved lenders. This comprehensive approach ensures every transaction is handled with expert care from initial valuation through closing.

Why Choose Us:
• Deep Florida market expertise
• Bilingual services (English/Spanish)
• In-house financing facilitation
• Seller financing structuring
• 90-day average time to close`,
    specializations: ["laundromats", "coin_laundry", "pickup_delivery", "attendant_operated"],
    yearsExperience: 12,
    nickname: "Florida Laundry Experts",
    countries: ["US"],
    regions: ["FL", "GA", "AL", "SC"],
    totalListings: 28,
    activeListings: 16,
    soldListings: 178,
    averageDaysToSell: 58,
    verified: true,
    slug: "sunbelt-laundry-advisors",
    storefrontEnabled: true,
    storefrontTheme: { primaryColor: "#047857", accentColor: "#F59E0B" },
    testimonials: [
      { name: "Carlos Mendez", role: "Miami Investor", text: "Excelente servicio! They helped me find the perfect location in Hialeah.", rating: 5 },
      { name: "Jennifer Thompson", role: "Retired Professional", text: "Made my transition into laundromat ownership seamless and profitable.", rating: 5 },
    ],
  },
  {
    companyName: "Pacific Coast Laundry Group",
    licenseNumber: "CA-BRE02156789",
    website: "https://pacificcoastlaundry.com",
    phone: "(415) 555-0623",
    email: "team@pacificcoastlaundry.com",
    bio: `Pacific Coast Laundry Group represents the premium tier of West Coast laundromat transactions. Based in San Francisco with offices in Los Angeles, Seattle, and Portland, we handle high-value transactions exclusively—typically $500K and above.

Our clientele includes private equity firms, family offices, and high-net-worth individuals seeking recession-resistant cash flow investments. We provide institutional-grade due diligence packages, detailed market analysis, and confidential off-market opportunities.

Exclusive Services:
• Off-market deal sourcing
• Portfolio consolidation strategies
• 1031 exchange facilitation
• Institutional-grade valuations
• White-glove transaction management`,
    specializations: ["premium_laundromats", "portfolio_deals", "1031_exchanges", "institutional"],
    yearsExperience: 22,
    nickname: "West Coast Premium",
    countries: ["US"],
    regions: ["CA", "WA", "OR", "HI"],
    totalListings: 19,
    activeListings: 8,
    soldListings: 412,
    averageDaysToSell: 89,
    verified: true,
    slug: "pacific-coast-laundry-group",
    storefrontEnabled: true,
    storefrontTheme: { primaryColor: "#4338CA", accentColor: "#10B981" },
    testimonials: [
      { name: "David Sterling", role: "Private Equity Partner", text: "The only brokerage we trust for institutional-quality laundromat acquisitions.", rating: 5 },
      { name: "Margaret Wu", role: "Family Office Manager", text: "Their market insights and deal flow are unmatched on the West Coast.", rating: 5 },
      { name: "Thomas Anderson", role: "1031 Investor", text: "Facilitated a complex multi-property exchange flawlessly.", rating: 5 },
    ],
  },
  {
    companyName: "Midwest Laundry Exchange",
    licenseNumber: "IL-RE441892",
    website: "https://midwestlaundryexchange.com",
    phone: "(312) 555-0891",
    email: "hello@midwestlaundryexchange.com",
    bio: `Serving the heartland of America, Midwest Laundry Exchange brings honest, straightforward brokerage services to laundromat buyers and sellers across the Midwest. We believe in fair valuations, transparent processes, and building long-term relationships.

Our regional expertise spans from Chicago's dense urban markets to smaller-town opportunities in Iowa, Wisconsin, and Indiana. We understand the unique demographics and operating challenges of Midwest laundromats—from harsh winters to seasonal fluctuations.

What Sets Us Apart:
• Honest, no-pressure valuations
• Strong community bank relationships
• Owner financing matchmaking
• Transition training programs
• Ongoing owner support network`,
    specializations: ["laundromats", "small_town", "owner_operated", "retool_opportunities"],
    yearsExperience: 15,
    nickname: "Heartland Laundry Pros",
    countries: ["US"],
    regions: ["IL", "WI", "IN", "IA", "MN", "OH", "MI"],
    totalListings: 34,
    activeListings: 19,
    soldListings: 223,
    averageDaysToSell: 73,
    verified: true,
    slug: "midwest-laundry-exchange",
    storefrontEnabled: true,
    storefrontTheme: { primaryColor: "#7C3AED", accentColor: "#F97316" },
    testimonials: [
      { name: "Kevin O'Brien", role: "Chicago Operator", text: "Down-to-earth people who actually care about matching the right buyer with the right store.", rating: 5 },
      { name: "Lisa Mueller", role: "Wisconsin Owner", text: "They found me a buyer in just 3 weeks. Couldn't believe it!", rating: 4 },
    ],
  },
];

// Demo Listings with Enterprise-Quality Data
const demoListings = [
  {
    listing: {
      businessType: "laundromat",
      listingType: "broker",
      title: "Premium Card-Op Laundromat - Silicon Valley",
      description: `Exceptional opportunity in the heart of Silicon Valley! This turnkey, card-operated laundromat generates strong cash flow with minimal owner involvement. Located in a growing tech corridor with excellent demographics.

HIGHLIGHTS:
• 3,200 sq ft modern facility with LED lighting
• 100% card-operated with mobile payment integration
• 2024 Dexter equipment throughout
• Unattended operation with remote monitoring
• Strong lease with 10 years remaining + options
• Located next to major apartment complexes

FINANCIAL PERFORMANCE:
• Gross Revenue: $42,000/month
• Net Operating Income: $18,500/month
• ROI: 38% annual

Perfect for passive investors or operators looking for a premium, well-maintained facility.`,
      tagline: "Silicon Valley Premium Location - $18.5K Monthly NOI - Turnkey Card-Op",
      priceOriginal: "895000",
      currency: "USD",
      priceInUSD: "895000",
      priceVisibility: "public",
      includesRealEstate: false,
      ownerFinancing: true,
      country: "US",
      region: "CA",
      city: "San Jose",
      generalLocation: "Silicon Valley - Tech Corridor",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 5,
      subscriptionTier: "showcase",
      slug: "premium-card-op-laundromat-silicon-valley",
      requiresNDA: true,
      hasValuationReport: true,
      detailLevel: "full",
      completenessScore: 95,
    },
    financials: {
      grossRevenueOriginal: "504000",
      netRevenueOriginal: "222000",
      averageMonthlyRevenueOriginal: "42000",
      grossRevenueUSD: "504000",
      netRevenueUSD: "222000",
      averageMonthlyRevenueUSD: "42000",
      rentOriginal: "8500",
      utilitiesOriginal: "4200",
      laborOriginal: "0",
      maintenanceOriginal: "1800",
      insuranceOriginal: "600",
      otherExpensesOriginal: "1400",
      totalExpensesOriginal: "16500",
      rentUSD: "8500",
      utilitiesUSD: "4200",
      laborUSD: "0",
      maintenanceUSD: "1800",
      insuranceUSD: "600",
      otherExpensesUSD: "1400",
      totalExpensesUSD: "16500",
      netIncomeOriginal: "222000",
      ebitdaOriginal: "222000",
      cashFlowOriginal: "222000",
      netIncomeUSD: "222000",
      ebitdaUSD: "222000",
      cashFlowUSD: "222000",
      profitMargin: "44.05",
      roi: "24.80",
      paybackPeriodMonths: 48,
      financialYear: 2024,
      currency: "USD",
      verified: true,
    },
  },
  {
    listing: {
      businessType: "laundromat",
      listingType: "broker",
      title: "Multi-Location Portfolio - 3 Chicago Laundromats",
      description: `RARE PORTFOLIO OPPORTUNITY - Three established Chicago laundromats offered as a package. All locations are profitable, well-maintained, and operating under unified management. Ideal for investors seeking scale or operators ready to expand.

PORTFOLIO OVERVIEW:
• Location 1: Pilsen - 2,400 sq ft, 28 machines, $22K/month gross
• Location 2: Logan Square - 1,800 sq ft, 22 machines, $18K/month gross  
• Location 3: Humboldt Park - 2,100 sq ft, 25 machines, $19K/month gross

COMBINED METRICS:
• Total Gross Revenue: $708,000/year
• Combined NOI: $295,000/year
• 75 total machines (Continental Girbau)
• All card-operated with centralized management

STRATEGIC ADVANTAGES:
• Shared marketing & customer base
• Bulk purchasing power for supplies
• Single-point management system
• Cross-location staff flexibility

All three leases have 7+ years remaining with options. This is a rare chance to acquire an established, diversified portfolio in one transaction.`,
      tagline: "3-Store Chicago Portfolio - $295K Annual NOI - Unified Operations",
      priceOriginal: "2450000",
      currency: "USD",
      priceInUSD: "2450000",
      priceVisibility: "registered",
      includesRealEstate: false,
      ownerFinancing: true,
      country: "US",
      region: "IL",
      city: "Chicago",
      generalLocation: "Chicago - Multiple Neighborhoods",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 5,
      subscriptionTier: "showcase",
      slug: "multi-location-portfolio-3-chicago-laundromats",
      requiresNDA: true,
      hasValuationReport: true,
      detailLevel: "full",
      completenessScore: 92,
    },
    financials: {
      grossRevenueOriginal: "708000",
      netRevenueOriginal: "295000",
      averageMonthlyRevenueOriginal: "59000",
      grossRevenueUSD: "708000",
      netRevenueUSD: "295000",
      averageMonthlyRevenueUSD: "59000",
      rentOriginal: "18000",
      utilitiesOriginal: "9500",
      laborOriginal: "6000",
      maintenanceOriginal: "4200",
      insuranceOriginal: "1800",
      otherExpensesOriginal: "4000",
      totalExpensesOriginal: "43500",
      rentUSD: "18000",
      utilitiesUSD: "9500",
      laborUSD: "6000",
      maintenanceUSD: "4200",
      insuranceUSD: "1800",
      otherExpensesUSD: "4000",
      totalExpensesUSD: "43500",
      netIncomeOriginal: "295000",
      ebitdaOriginal: "295000",
      cashFlowOriginal: "295000",
      netIncomeUSD: "295000",
      ebitdaUSD: "295000",
      cashFlowUSD: "295000",
      profitMargin: "41.67",
      roi: "12.04",
      paybackPeriodMonths: 100,
      financialYear: 2024,
      currency: "USD",
      verified: true,
    },
  },
  {
    listing: {
      businessType: "laundromat",
      listingType: "owner",
      title: "High-Volume Miami Beach Laundromat",
      description: `Prime South Beach location with exceptional foot traffic and tourist visibility! This high-volume laundromat serves a diverse clientele including residents, tourists, and vacation rental guests. Strong year-round demand with seasonal peaks.

PROPERTY FEATURES:
• 2,800 sq ft facility on major commercial strip
• 100% renovated in 2023
• Attendant station for drop-off service
• Comfortable waiting area with WiFi
• Air conditioned for Florida heat

EQUIPMENT (32 Machines):
• 14 Speed Queen washers (20-80 lb)
• 18 Commercial dryers
• All equipped with Pay Range card system

REVENUE STREAMS:
• Self-service: 70% of revenue
• Wash-dry-fold: 25% of revenue
• Vending/retail: 5% of revenue

Located steps from Ocean Drive in one of the most desirable retail corridors in Florida. Lease includes signage rights and ample parking.`,
      tagline: "South Beach Premium Location - Multi-Revenue Streams - 2023 Renovation",
      priceOriginal: "675000",
      currency: "USD",
      priceInUSD: "675000",
      priceVisibility: "public",
      includesRealEstate: false,
      ownerFinancing: false,
      country: "US",
      region: "FL",
      city: "Miami Beach",
      generalLocation: "South Beach - Ocean Drive Area",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 4,
      subscriptionTier: "showcase",
      slug: "high-volume-miami-beach-laundromat",
      requiresNDA: false,
      hasValuationReport: true,
      detailLevel: "full",
      completenessScore: 88,
    },
    financials: {
      grossRevenueOriginal: "396000",
      netRevenueOriginal: "158000",
      averageMonthlyRevenueOriginal: "33000",
      grossRevenueUSD: "396000",
      netRevenueUSD: "158000",
      averageMonthlyRevenueUSD: "33000",
      rentOriginal: "9500",
      utilitiesOriginal: "5200",
      laborOriginal: "4800",
      maintenanceOriginal: "2100",
      insuranceOriginal: "900",
      otherExpensesOriginal: "2500",
      totalExpensesOriginal: "25000",
      rentUSD: "9500",
      utilitiesUSD: "5200",
      laborUSD: "4800",
      maintenanceUSD: "2100",
      insuranceUSD: "900",
      otherExpensesUSD: "2500",
      totalExpensesUSD: "25000",
      netIncomeOriginal: "158000",
      ebitdaOriginal: "158000",
      cashFlowOriginal: "158000",
      netIncomeUSD: "158000",
      ebitdaUSD: "158000",
      cashFlowUSD: "158000",
      profitMargin: "39.90",
      roi: "23.41",
      paybackPeriodMonths: 51,
      financialYear: 2024,
      currency: "USD",
      verified: false,
    },
  },
];

// Demo Activity Events for Social Network
const demoActivityTypes = [
  { eventType: "cleanbi_analysis", entityType: "location", details: "Analyzed 123 Main St, Phoenix, AZ - Score: A (87)" },
  { eventType: "saved_search", entityType: "search", details: "California laundromats under $500K" },
  { eventType: "favorite_listing", entityType: "listing", details: "Premium Card-Op Laundromat - Silicon Valley" },
  { eventType: "follow", entityType: "broker", details: "Followed Laundry Business Specialists" },
  { eventType: "report_generated", entityType: "valuation", details: "Generated valuation report for downtown location" },
  { eventType: "listing_created", entityType: "listing", details: "Listed Brooklyn Coin Laundry" },
  { eventType: "profile_view", entityType: "user", details: "Viewed broker profile" },
  { eventType: "cleanbi_analysis", entityType: "location", details: "Analyzed 456 Oak Ave, Austin, TX - Score: B (78)" },
];

export async function seedEnterpriseDemos() {
  console.log("🏢 Seeding enterprise demo data...");
  
  try {
    // Seed Broker Profiles
    console.log("👔 Creating premium broker profiles...");
    for (const broker of demoBrokers) {
      const existing = await db.select().from(brokerProfiles).where(eq(brokerProfiles.slug, broker.slug!));
      if (existing.length === 0) {
        await db.insert(brokerProfiles).values(broker);
        console.log(`  ✓ Created broker: ${broker.companyName}`);
      } else {
        console.log(`  ○ Broker exists: ${broker.companyName}`);
      }
    }
    
    // Seed Demo Listings (need tenant ID)
    console.log("🏪 Creating demo listings...");
    for (const demo of demoListings) {
      const existing = await db.select().from(listings).where(eq(listings.slug, demo.listing.slug!));
      if (existing.length === 0) {
        // Get WashBizHub tenant
        const { tenants } = await import("@shared/schema");
        const tenant = await db.select().from(tenants).where(eq(tenants.slug, "washbizhub.com")).limit(1);
        if (tenant.length > 0) {
          const [newListing] = await db.insert(listings).values({
            ...demo.listing,
            tenantId: tenant[0].id,
            listedAt: new Date(),
          }).returning();
          
          // Add financials
          if (demo.financials) {
            await db.insert(listingFinancials).values({
              ...demo.financials,
              listingId: newListing.id,
            });
          }
          
          console.log(`  ✓ Created listing: ${demo.listing.title}`);
        }
      } else {
        console.log(`  ○ Listing exists: ${demo.listing.title}`);
      }
    }
    
    console.log("✅ Enterprise demo seeding complete!");
  } catch (error) {
    console.error("Error seeding enterprise demos:", error);
  }
}
