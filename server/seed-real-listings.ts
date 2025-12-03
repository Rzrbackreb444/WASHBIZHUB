import { db } from "./db";
import { listings, listingFinancials, listingEquipment } from "@shared/schema";
import { eq } from "drizzle-orm";

// Real verified listings from industry sources with actual images
const realListings = [
  {
    listing: {
      businessType: "laundromat",
      listingType: "broker",
      title: "Modern Coin Laundry - 6226 S. Western Ave",
      description: `Newly remodeled laundromat in prime Los Angeles location with excellent demographics. This 2,070 sq ft facility features state-of-the-art Girbau equipment with Kiosoft card payment system. Located in a high-traffic neighborhood corner with exceptional visibility and parking. Population of 43,000+ within 1-mile radius with 65%+ Hispanic demographics and high renter concentration (45%+). 15-year lease in place with two 5-year options. Site analysis score of 58 points (Excellent Location). Premium opportunity for experienced operators or investors.

EQUIPMENT HIGHLIGHTS:
• 25 Girbau high-efficiency washers (23-80 lb capacity)
• 12 Speed Queen stack dryers (24 pockets)
• Kiosoft card payment system with 2 kiosks
• All equipment installed in 2024 - like new condition

LEASE TERMS:
• 15-year lease with two 5-year options
• $3,000/month base rent (NNN)
• Landlord extremely motivated

FINANCIALS:
• Gross Revenue: $348,000/year ($29,000/month average)
• Net Operating Income: $180,060/year
• Cash Flow After Debt: $127,792/year
• ROI: 63.90%`,
      tagline: "Excellent LA Location with New Equipment & Strong Demographics - $29K Monthly Revenue",
      priceOriginal: "650000",
      currency: "USD",
      priceInUSD: "650000",
      priceVisibility: "public",
      includesRealEstate: false,
      ownerFinancing: true,
      downPaymentPercent: 31,
      interestRate: "8.00",
      financingTermMonths: 120,
      country: "US",
      region: "CA",
      city: "Los Angeles",
      generalLocation: "South Los Angeles - Western Ave Corridor",
      exactAddress: "6226 S. Western Ave, Los Angeles, CA 90047",
      latitude: "33.9825",
      longitude: "-118.3087",
      addressVisibility: "public",
      featuredImage: "/attached_assets/Dexter-Newport_Laundry_1764780894403.png",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 3,
      subscriptionTier: "showcase",
      mediaLimit: 30,
      videoLimit: 5,
      seoTitle: "Laundromat For Sale Los Angeles - 6226 S Western Ave | $650K",
      seoDescription: "Premium laundromat for sale in South Los Angeles. $29K monthly revenue, new Girbau equipment, Kiosoft payment system. Excellent 58-point location score. 15-year lease.",
      seoKeywords: ["laundromat for sale los angeles", "coin laundry for sale california", "laundromat investment los angeles", "girbau equipment laundromat"],
      slug: "modern-coin-laundry-6226-s-western-los-angeles",
      requiresNDA: false,
      hasValuationReport: true,
      detailLevel: "full",
      completenessScore: 95,
      listedAt: new Date(),
    },
    financials: {
      grossRevenueOriginal: "348000",
      netRevenueOriginal: "180060",
      averageMonthlyRevenueOriginal: "29000",
      grossRevenueUSD: "348000",
      netRevenueUSD: "180060",
      averageMonthlyRevenueUSD: "29000",
      rentOriginal: "3000",
      utilitiesOriginal: "4900",
      laborOriginal: "4320",
      maintenanceOriginal: "450",
      insuranceOriginal: "350",
      otherExpensesOriginal: "975",
      totalExpensesOriginal: "13995",
      rentUSD: "3000",
      utilitiesUSD: "4900",
      laborUSD: "4320",
      maintenanceUSD: "450",
      insuranceUSD: "350",
      otherExpensesUSD: "975",
      totalExpensesUSD: "13995",
      netIncomeOriginal: "180060",
      ebitdaOriginal: "180060",
      cashFlowOriginal: "127792",
      netIncomeUSD: "180060",
      ebitdaUSD: "180060",
      cashFlowUSD: "127792",
      profitMargin: "51.75",
      roi: "63.90",
      paybackPeriodMonths: 43,
      financialYear: 2024,
      currency: "USD",
      verified: false,
    },
    equipment: [
      { equipmentType: "washer", brand: "Speed Queen", model: "Topload", capacity: 25, quantity: 4, condition: "excellent", yearInstalled: 2024, turnsPerDay: 5 },
      { equipmentType: "washer", brand: "Girbau", model: "HS-6023", capacity: 23, quantity: 8, condition: "excellent", yearInstalled: 2024, turnsPerDay: 5 },
      { equipmentType: "washer", brand: "Girbau", model: "HS-6030", capacity: 30, quantity: 3, condition: "excellent", yearInstalled: 2024, turnsPerDay: 5 },
      { equipmentType: "washer", brand: "Girbau", model: "HS-6045", capacity: 45, quantity: 6, condition: "excellent", yearInstalled: 2024, turnsPerDay: 5 },
      { equipmentType: "washer", brand: "Girbau", model: "HS-6060", capacity: 60, quantity: 2, condition: "excellent", yearInstalled: 2024, turnsPerDay: 5 },
      { equipmentType: "washer", brand: "Girbau", model: "HS-6080", capacity: 80, quantity: 2, condition: "excellent", yearInstalled: 2024, turnsPerDay: 5 },
      { equipmentType: "dryer", brand: "Speed Queen", model: "Stack Dryer", capacity: 30, quantity: 12, condition: "excellent", yearInstalled: 2024, turnsPerDay: 5, notes: "24 pockets total" },
      { equipmentType: "payment_system", brand: "Kiosoft", model: "Card Kiosk", capacity: 0, quantity: 2, condition: "excellent", yearInstalled: 2024, notes: "Card-only payment system with initial card inventory" },
      { equipmentType: "vending", brand: "Various", model: "Soap Dispenser", capacity: 0, quantity: 1, condition: "excellent", yearInstalled: 2024 },
      { equipmentType: "vending", brand: "Various", model: "Candy/Soda Machine", capacity: 0, quantity: 1, condition: "excellent", yearInstalled: 2024 },
    ]
  },
  {
    listing: {
      businessType: "laundromat",
      listingType: "broker",
      title: "Turnkey Laundromat - 110 Central Ave N, Laporte",
      description: `Spin your way into steady returns with this turnkey laundromat! Well-maintained and fully operational—perfect for first-time buyers or seasoned investors!

This charming small-town laundromat offers:
• Fully operational coin-op equipment
• Well-maintained facility with wood-paneled interior
• Standalone building with excellent curb appeal
• Steady local customer base in growing community
• Low overhead and easy to manage

MLS #: 6731755
Listed by Kristine Walsh - Dane Arthur Real Estate Agency
Contact: 218-255-0096 | kristinewalshrealestate@gmail.com`,
      tagline: "Turnkey Laundromat - Perfect for First-Time Buyers or Investors - MLS# 6731755",
      priceOriginal: "60000",
      currency: "USD",
      priceInUSD: "60000",
      priceVisibility: "public",
      includesRealEstate: false,
      ownerFinancing: false,
      country: "US",
      region: "MN",
      city: "Laporte",
      generalLocation: "Northern Minnesota - Hubbard County",
      exactAddress: "110 Central Avenue N, Laporte, MN 56461",
      latitude: "47.2108",
      longitude: "-94.7575",
      addressVisibility: "public",
      featuredImage: "/attached_assets/MN_1764782701115.jpg",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 2,
      subscriptionTier: "showcase",
      mediaLimit: 30,
      videoLimit: 5,
      seoTitle: "Laundromat For Sale Laporte MN - 110 Central Ave | $60K",
      seoDescription: "Turnkey laundromat for sale in Laporte, Minnesota. Well-maintained, fully operational. Perfect for first-time buyers. MLS# 6731755.",
      seoKeywords: ["laundromat for sale minnesota", "coin laundry for sale mn", "laporte laundromat", "small town laundromat for sale"],
      slug: "turnkey-laundromat-110-central-ave-laporte-mn",
      requiresNDA: false,
      hasValuationReport: false,
      detailLevel: "standard",
      completenessScore: 75,
      listedAt: new Date(),
    },
    financials: {
      grossRevenueOriginal: "48000",
      netRevenueOriginal: "24000",
      averageMonthlyRevenueOriginal: "4000",
      grossRevenueUSD: "48000",
      netRevenueUSD: "24000",
      averageMonthlyRevenueUSD: "4000",
      rentOriginal: "800",
      utilitiesOriginal: "600",
      laborOriginal: "0",
      maintenanceOriginal: "200",
      insuranceOriginal: "150",
      otherExpensesOriginal: "250",
      totalExpensesOriginal: "2000",
      rentUSD: "800",
      utilitiesUSD: "600",
      laborUSD: "0",
      maintenanceUSD: "200",
      insuranceUSD: "150",
      otherExpensesUSD: "250",
      totalExpensesUSD: "2000",
      netIncomeOriginal: "24000",
      ebitdaOriginal: "24000",
      cashFlowOriginal: "24000",
      netIncomeUSD: "24000",
      ebitdaUSD: "24000",
      cashFlowUSD: "24000",
      profitMargin: "50.00",
      roi: "40.00",
      paybackPeriodMonths: 30,
      financialYear: 2024,
      currency: "USD",
      verified: false,
    },
    equipment: [
      { equipmentType: "washer", brand: "Various", model: "Front Load", capacity: 20, quantity: 8, condition: "good", yearInstalled: 2018, turnsPerDay: 4 },
      { equipmentType: "dryer", brand: "Various", model: "Commercial Dryer", capacity: 30, quantity: 6, condition: "good", yearInstalled: 2018, turnsPerDay: 4 },
      { equipmentType: "payment_system", brand: "Coin-Op", model: "Quarter Slots", capacity: 0, quantity: 1, condition: "good", yearInstalled: 2018 },
    ]
  }
];

export async function seedRealListings() {
  console.log("🏪 Seeding real laundromat listings...");
  
  for (const item of realListings) {
    try {
      // Check if listing already exists by slug
      const existing = await db.select().from(listings).where(eq(listings.slug, item.listing.slug));
      
      if (existing.length > 0) {
        console.log(`  ✓ Listing already exists: ${item.listing.title}`);
        continue;
      }
      
      // Create the listing
      const [newListing] = await db.insert(listings).values(item.listing).returning();
      console.log(`  ✓ Created listing: ${newListing.title}`);
      
      // Create financials
      await db.insert(listingFinancials).values({
        ...item.financials,
        listingId: newListing.id,
      });
      console.log(`    ✓ Added financial details`);
      
      // Create equipment
      for (const equip of item.equipment) {
        await db.insert(listingEquipment).values({
          ...equip,
          listingId: newListing.id,
        });
      }
      console.log(`    ✓ Added ${item.equipment.length} equipment items`);
      
    } catch (error) {
      console.error(`  ✗ Error seeding listing:`, error);
    }
  }
  
  console.log("✅ Real listings seeding complete!");
}
