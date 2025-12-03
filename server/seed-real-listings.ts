import { db } from "./db";
import { listings, listingFinancials, listingEquipment } from "@shared/schema";
import { eq } from "drizzle-orm";

// Real verified listings from industry sources
const realListings = [
  {
    listing: {
      businessType: "laundromat",
      listingType: "broker",
      title: "Modern Coin Laundry - 6226 S. Western Ave",
      description: `Newly remodeled laundromat in prime Los Angeles location with excellent demographics. This 2,070 sq ft facility features state-of-the-art Girbau equipment with Kiosoft card payment system. Located in a high-traffic neighborhood corner with exceptional visibility and parking. Population of 43,000+ within 1-mile radius with 65%+ Hispanic demographics and high renter concentration (45%+). 15-year lease in place with two 5-year options. Site analysis score of 58 points (Excellent Location). Premium opportunity for experienced operators or investors.`,
      tagline: "Excellent LA Location with New Equipment & Strong Demographics",
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
