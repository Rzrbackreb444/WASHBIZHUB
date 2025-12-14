import { db } from "./db";
import { listings, listingFinancials, listingEquipment } from "@shared/schema";
import { eq } from "drizzle-orm";

// Real verified listings from industry sources with actual images
const realListings = [
  {
    listing: {
      businessType: "laundromat",
      listingType: "owner",
      title: "Brooklyn Coin Laundry - 740 Myrtle Ave",
      description: `Prime Brooklyn laundromat opportunity in high-traffic Myrtle Avenue location! This well-established, recently renovated coin-operated laundromat offers excellent cash flow with approximately $4,000 weekly revenue (~$16,000/month).

PROPERTY HIGHLIGHTS:
• 740 Myrtle Ave, Brooklyn, NY - High-visibility corner location
• Recently renovated interior with clean, welcoming atmosphere
• Basement cleaned out and available for storage/expansion
• Owner selling due to personal reasons - motivated seller!

EQUIPMENT (37 Total Machines):
• 17 Washers: 9 x 18 lb, 6 x 40 lb, 2 x 50 lb capacity
• 20 Commercial Dryers
• All machines refurbished from 2005
• 100% coin-operated for simple, proven cash flow

LEASE TERMS:
• $5,000/month rent
• 10 years remaining on lease - long-term stability
• Excellent terms for new ownership

FINANCIALS:
• Asking Price: $220,000
• Weekly Revenue: ~$4,000
• Monthly Revenue: ~$16,000
• Annual Revenue: ~$208,000

Perfect for first-time buyers or experienced operators looking for a turnkey Brooklyn location with strong demographics and proven revenue.

CONTACT: Steve - 516-669-1814 (call/text for more info)`,
      tagline: "Renovated Brooklyn Laundromat - $4K Weekly Revenue - 10 Year Lease - Motivated Seller",
      priceOriginal: "220000",
      currency: "USD",
      priceInUSD: "220000",
      priceVisibility: "public",
      includesRealEstate: false,
      ownerFinancing: false,
      country: "US",
      region: "NY",
      city: "Brooklyn",
      generalLocation: "Brooklyn - Myrtle Avenue Corridor",
      exactAddress: "740 Myrtle Ave, Brooklyn, NY",
      latitude: "40.6944",
      longitude: "-73.9537",
      addressVisibility: "public",
      featuredImage: "/attached_assets/image_1765731417886.png",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 3,
      subscriptionTier: "showcase",
      mediaLimit: 30,
      videoLimit: 5,
      seoTitle: "Laundromat For Sale Brooklyn NY - 740 Myrtle Ave | $220K",
      seoDescription: "Brooklyn laundromat for sale on Myrtle Ave. $4K weekly revenue, 37 machines, 10-year lease, recently renovated. Motivated seller asking $220K.",
      seoKeywords: ["laundromat for sale brooklyn", "coin laundry for sale nyc", "brooklyn laundromat investment", "myrtle ave laundromat"],
      slug: "brooklyn-coin-laundry-740-myrtle-ave",
      requiresNDA: false,
      hasValuationReport: false,
      detailLevel: "full",
      completenessScore: 85,
      listedAt: new Date(),
      brokerName: "Steve (Owner)",
      brokerPhone: "516-669-1814",
    },
    financials: {
      grossRevenueOriginal: "208000",
      netRevenueOriginal: "104000",
      averageMonthlyRevenueOriginal: "16000",
      grossRevenueUSD: "208000",
      netRevenueUSD: "104000",
      averageMonthlyRevenueUSD: "16000",
      rentOriginal: "5000",
      utilitiesOriginal: "3000",
      laborOriginal: "0",
      maintenanceOriginal: "800",
      insuranceOriginal: "400",
      otherExpensesOriginal: "800",
      totalExpensesOriginal: "10000",
      rentUSD: "5000",
      utilitiesUSD: "3000",
      laborUSD: "0",
      maintenanceUSD: "800",
      insuranceUSD: "400",
      otherExpensesUSD: "800",
      totalExpensesUSD: "10000",
      netIncomeOriginal: "104000",
      ebitdaOriginal: "104000",
      cashFlowOriginal: "104000",
      netIncomeUSD: "104000",
      ebitdaUSD: "104000",
      cashFlowUSD: "104000",
      profitMargin: "50.00",
      roi: "47.27",
      paybackPeriodMonths: 25,
      financialYear: 2024,
      currency: "USD",
      verified: false,
    },
    equipment: [
      { equipmentType: "washer", brand: "Various", model: "Front Load 18lb", capacity: 18, quantity: 9, condition: "good", yearInstalled: 2005, turnsPerDay: 5, notes: "Refurbished" },
      { equipmentType: "washer", brand: "Various", model: "Front Load 40lb", capacity: 40, quantity: 6, condition: "good", yearInstalled: 2005, turnsPerDay: 4, notes: "Refurbished" },
      { equipmentType: "washer", brand: "Various", model: "Front Load 50lb", capacity: 50, quantity: 2, condition: "good", yearInstalled: 2005, turnsPerDay: 4, notes: "Refurbished" },
      { equipmentType: "dryer", brand: "Various", model: "Commercial Dryer", capacity: 30, quantity: 20, condition: "good", yearInstalled: 2005, turnsPerDay: 5, notes: "Refurbished" },
      { equipmentType: "payment_system", brand: "Coin-Op", model: "Quarter Slots", capacity: 0, quantity: 1, condition: "good", yearInstalled: 2005, notes: "All coin machine operation" },
    ]
  },
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
  },
  {
    listing: {
      businessType: "laundromat",
      listingType: "broker",
      title: "Newport Beach Fluff & Fold Opportunity - 200 30th Street",
      description: `UNIQUE ORANGE COUNTY OPPORTUNITY - Develop a fluff & fold/pickup & delivery business in one of California's most desirable locations!

This is NOT your typical laundromat - this is an opportunity to build a premium wash-and-fold service in affluent Newport Beach. The owner advises current income covers overhead but the REAL opportunity lies in developing fluff & fold services for the high-income demographic.

BROKER: Lawrence Larsen "Laundromat Larry" - 50+ years experience
Phone: 714-390-9969 | CA DRE 49460 | Insurance DOI: 0553938
Larry has owned 50+ laundromats, designed 135+ stores, and distributed millions in equipment nationally.

PROPERTY HIGHLIGHTS:
• Prime Newport Beach location - high-income demographics
• Recently upgraded with new Dexter equipment
• New roof, exterior paint, and signage
• Dual payment system: Coin + PayRange mobile
• Full security camera system with Ubiquiti network
• 20-year lease available for qualified buyers

EQUIPMENT (All Dexter):
• 2 Dexter T800 (80lb) @ $8.50/load
• 6 Dexter T600 (60lb) @ $6.75/load
• 8 Dexter T400 (40lb) @ $5.00/load
• 8 Stack Dryers @ $0.25/4min
• Standard Change Makers (2 hoppers + bill sorter)
• Seaga vending with soap

IT INFRASTRUCTURE:
• Ubiquiti Dream Machine Pro with 11 cameras
• CyberPower battery backup
• Ring doorbell for virtual attendant
• Samsung 43" TV with Loop.Net music/rules

LEASE TERMS (Graduated - landlord motivated):
• Years 1-3: $4,000 + $1,722 NNN = $5,722/mo
• Years 4-6: $4,500 + $1,722 NNN = $6,222/mo
• Years 7-12: $5,400 + $1,722 NNN = $7,122/mo
• Years 13-20+: $5,562 + $1,722 NNN = $7,284/mo

FINANCIALS (8-month verified Jan-Aug):
• Total Income: $82,752 ($10,344/mo avg)
• Cash: $43,263 | PayRange: $39,516
• Gross Profit: $80,410 (after COGS)
• Total Expenses: $69,017
• Net Ordinary Income: $11,393

Owner acquired for $200,000 and invested in new roof, paint, signs, and Dexter equipment upgrade.`,
      tagline: "Prime Newport Beach Location - Fluff & Fold Development Opportunity - 20-Year Lease Available",
      priceOriginal: "250000",
      currency: "USD",
      priceInUSD: "250000",
      priceVisibility: "public",
      includesRealEstate: false,
      ownerFinancing: true,
      country: "US",
      region: "CA",
      city: "Newport Beach",
      generalLocation: "Orange County - Newport Beach",
      exactAddress: "200 30th Street, Newport Beach, CA",
      latitude: "33.6189",
      longitude: "-117.9298",
      addressVisibility: "public",
      featuredImage: "/attached_assets/Dexter-Newport_Laundry_1764784750639.png",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 3,
      subscriptionTier: "diamond",
      mediaLimit: 50,
      videoLimit: 10,
      seoTitle: "Laundromat For Sale Newport Beach CA - Fluff & Fold Opportunity | Premium Location",
      seoDescription: "Prime Newport Beach laundromat for sale. Dexter equipment, 20-year lease available. Perfect for fluff & fold development in affluent Orange County location.",
      seoKeywords: ["laundromat for sale newport beach", "orange county laundromat for sale", "fluff and fold business for sale", "dexter laundry equipment"],
      slug: "newport-beach-fluff-fold-opportunity-200-30th-street",
      requiresNDA: false,
      hasValuationReport: true,
      detailLevel: "full",
      completenessScore: 90,
      listedAt: new Date(),
      brokerName: "Lawrence Larsen",
      brokerPhone: "714-390-9969",
      brokerEmail: "larry@laundromat123.com",
      brokerLicense: "CA DRE 49460",
    },
    financials: {
      grossRevenueOriginal: "124128",
      netRevenueOriginal: "17089",
      averageMonthlyRevenueOriginal: "10344",
      grossRevenueUSD: "124128",
      netRevenueUSD: "17089",
      averageMonthlyRevenueUSD: "10344",
      rentOriginal: "5722",
      utilitiesOriginal: "1564",
      laborOriginal: "642",
      maintenanceOriginal: "624",
      insuranceOriginal: "200",
      otherExpensesOriginal: "878",
      totalExpensesOriginal: "8627",
      rentUSD: "5722",
      utilitiesUSD: "1564",
      laborUSD: "642",
      maintenanceUSD: "624",
      insuranceUSD: "200",
      otherExpensesUSD: "878",
      totalExpensesUSD: "8627",
      netIncomeOriginal: "17089",
      ebitdaOriginal: "17089",
      cashFlowOriginal: "17089",
      netIncomeUSD: "17089",
      ebitdaUSD: "17089",
      cashFlowUSD: "17089",
      profitMargin: "13.77",
      roi: "6.84",
      paybackPeriodMonths: 175,
      financialYear: 2024,
      currency: "USD",
      verified: true,
    },
    equipment: [
      { equipmentType: "washer", brand: "Dexter", model: "T800", capacity: 80, quantity: 2, condition: "excellent", yearInstalled: 2023, turnsPerDay: 4, notes: "$8.50/load" },
      { equipmentType: "washer", brand: "Dexter", model: "T600", capacity: 60, quantity: 6, condition: "excellent", yearInstalled: 2023, turnsPerDay: 4, notes: "$6.75/load" },
      { equipmentType: "washer", brand: "Dexter", model: "T400", capacity: 40, quantity: 8, condition: "excellent", yearInstalled: 2023, turnsPerDay: 4, notes: "$5.00/load" },
      { equipmentType: "dryer", brand: "Dexter", model: "Stack Dryer", capacity: 45, quantity: 8, condition: "excellent", yearInstalled: 2023, turnsPerDay: 4, notes: "$0.25/4min - $1.00 vend" },
      { equipmentType: "payment_system", brand: "Standard", model: "Change Maker 600", capacity: 0, quantity: 2, condition: "excellent", yearInstalled: 2023, notes: "2 hoppers + bill sorter" },
      { equipmentType: "payment_system", brand: "PayRange", model: "Mobile Payment", capacity: 0, quantity: 1, condition: "excellent", yearInstalled: 2023, notes: "App-based payment" },
      { equipmentType: "vending", brand: "Seaga", model: "N2G4000", capacity: 0, quantity: 1, condition: "excellent", yearInstalled: 2023, notes: "Soap dispenser with side unit" },
      { equipmentType: "security", brand: "Ubiquiti", model: "Dream Machine Pro", capacity: 0, quantity: 1, condition: "excellent", yearInstalled: 2023, notes: "11 cameras - G3/G4 Bullet & Dome" },
    ]
  },
  // Oregon Coast Fresh Coast Laundry Works Chain - 3 Locations
  {
    listing: {
      businessType: "laundromat",
      listingType: "owner",
      title: "Fresh Coast Laundry Works - Coos Bay",
      description: `Premium Oregon Coast laundromat in high-traffic Coos Bay location! Part of a well-established 3-location chain, this Fresh Coast Laundry Works facility offers excellent cash flow with professional Dexter equipment and modern CCI FasCard cashless payment system.

CHAIN OVERVIEW:
• Part of 3-location Fresh Coast Laundry Works chain (Coos Bay, North Bend, Reedsport)
• All locations identically equipped with Dexter commercial equipment
• Combined chain grossing $665,000 annually
• Owner selling business only - favorable lease terms available

PROPERTY HIGHLIGHTS:
• Prime Coos Bay, Oregon location with excellent visibility
• Professional commercial-grade fit-out with modern interior
• Large parking lot with ADA accessibility
• High coastal tourism traffic plus strong local demographics

EQUIPMENT:
• All Dexter commercial washers and dryers
• CCI FasCard cashless payment system
• Professional folding tables and seating
• Modern, well-maintained facility

FINANCIAL OPPORTUNITY:
• Asking Price: $600,000 (this location)
• Combined Chain Price: $1,800,000 for all 3 locations
• Estimated Annual Revenue: ~$222,000 per location
• Owner owns real estate - favorable lease terms for new operator
• No owner financing available

This is an exceptional opportunity to acquire a turnkey coastal laundromat with proven revenue and professional equipment. Owner is motivated and ready to work with qualified buyers on favorable lease terms.

CONTACT: 541-912-6034 (Owner - Direct)`,
      tagline: "Oregon Coast Laundromat - Part of 3-Location Chain - Dexter Equipment - FasCard Payment",
      priceOriginal: "600000",
      currency: "USD",
      priceInUSD: "600000",
      priceVisibility: "public",
      includesRealEstate: false,
      ownerFinancing: false,
      country: "US",
      region: "OR",
      city: "Coos Bay",
      generalLocation: "Oregon Coast - Coos Bay/North Bend Area",
      exactAddress: "Coos Bay, OR 97420",
      latitude: "43.3665",
      longitude: "-124.2179",
      addressVisibility: "public",
      featuredImage: "/attached_assets/IMG_5929_1765289819133.jpeg",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 3,
      subscriptionTier: "showcase",
      mediaLimit: 30,
      videoLimit: 5,
      seoTitle: "Laundromat For Sale Coos Bay Oregon | Fresh Coast Laundry Works $600K",
      seoDescription: "Established Oregon coast laundromat for sale in Coos Bay. Part of 3-location chain, Dexter equipment, FasCard payment. $222K annual revenue. Favorable lease terms.",
      seoKeywords: ["laundromat for sale oregon", "coos bay laundromat", "oregon coast laundromat", "dexter laundromat for sale"],
      slug: "fresh-coast-laundry-works-coos-bay",
      requiresNDA: false,
      hasValuationReport: false,
      detailLevel: "full",
      completenessScore: 90,
      listedAt: new Date(),
      brokerName: "Owner Direct",
      brokerPhone: "541-912-6034",
    },
    financials: {
      grossRevenueOriginal: "222000",
      netRevenueOriginal: "111000",
      averageMonthlyRevenueOriginal: "18500",
      grossRevenueUSD: "222000",
      netRevenueUSD: "111000",
      averageMonthlyRevenueUSD: "18500",
      rentOriginal: "3500",
      utilitiesOriginal: "2500",
      laborOriginal: "0",
      maintenanceOriginal: "600",
      insuranceOriginal: "400",
      otherExpensesOriginal: "500",
      totalExpensesUSD: "7500",
      netIncomeOriginal: "111000",
      ebitdaOriginal: "111000",
      cashFlowOriginal: "111000",
      netIncomeUSD: "111000",
      ebitdaUSD: "111000",
      cashFlowUSD: "111000",
      profitMargin: "50.00",
      roi: "18.50",
      paybackPeriodMonths: 65,
      financialYear: 2024,
      currency: "USD",
      verified: false,
    },
    equipment: [
      { equipmentType: "washer", brand: "Dexter", model: "T-600", capacity: 60, quantity: 4, condition: "excellent", yearInstalled: 2020, turnsPerDay: 4 },
      { equipmentType: "washer", brand: "Dexter", model: "T-450", capacity: 45, quantity: 6, condition: "excellent", yearInstalled: 2020, turnsPerDay: 5 },
      { equipmentType: "washer", brand: "Dexter", model: "T-300", capacity: 30, quantity: 8, condition: "excellent", yearInstalled: 2020, turnsPerDay: 5 },
      { equipmentType: "dryer", brand: "Dexter", model: "Stack Dryer", capacity: 45, quantity: 10, condition: "excellent", yearInstalled: 2020, turnsPerDay: 5 },
      { equipmentType: "payment_system", brand: "CCI", model: "FasCard", capacity: 0, quantity: 1, condition: "excellent", yearInstalled: 2020, notes: "Cashless card payment system" },
    ]
  },
  {
    listing: {
      businessType: "laundromat",
      listingType: "owner",
      title: "Fresh Coast Laundry Works - North Bend",
      description: `Excellent Oregon Coast laundromat opportunity in North Bend! Part of the successful Fresh Coast Laundry Works chain, this corner location features high visibility with distinctive teal roof and professional signage.

CHAIN OVERVIEW:
• Part of 3-location Fresh Coast Laundry Works chain (Coos Bay, North Bend, Reedsport)
• All locations identically equipped with Dexter commercial equipment
• Combined chain grossing $665,000 annually
• Owner selling business only - favorable lease terms available

PROPERTY HIGHLIGHTS:
• Corner location in North Bend, OR with exceptional visibility
• Distinctive teal roof and professional dual signage
• Fenced property with ample parking
• Modern interior with professional equipment layout

EQUIPMENT:
• All Dexter commercial washers and dryers
• CCI FasCard cashless payment system
• Commercial folding tables
• Well-maintained, clean facility

FINANCIAL OPPORTUNITY:
• Asking Price: $600,000 (this location)
• Combined Chain Price: $1,800,000 for all 3 locations
• Estimated Annual Revenue: ~$222,000 per location
• Owner owns real estate - favorable lease terms for new operator
• No owner financing available

Perfect for an operator looking to acquire a proven coastal business with strong fundamentals and modern equipment. All three locations can be purchased together or individually.

CONTACT: 541-912-6034 (Owner - Direct)`,
      tagline: "Corner Location - Oregon Coast Chain - Dexter Equipment - High Visibility",
      priceOriginal: "600000",
      currency: "USD",
      priceInUSD: "600000",
      priceVisibility: "public",
      includesRealEstate: false,
      ownerFinancing: false,
      country: "US",
      region: "OR",
      city: "North Bend",
      generalLocation: "Oregon Coast - Coos Bay/North Bend Area",
      exactAddress: "North Bend, OR 97459",
      latitude: "43.4065",
      longitude: "-124.2243",
      addressVisibility: "public",
      featuredImage: "/attached_assets/IMG_5930_1765289819133.jpeg",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 3,
      subscriptionTier: "showcase",
      mediaLimit: 30,
      videoLimit: 5,
      seoTitle: "Laundromat For Sale North Bend Oregon | Fresh Coast Laundry $600K",
      seoDescription: "Oregon coast laundromat for sale in North Bend. Corner location, Dexter equipment, CCI FasCard. Part of 3-location chain. $222K revenue. Owner motivated.",
      seoKeywords: ["laundromat for sale oregon", "north bend laundromat", "oregon coast business for sale", "coin laundry oregon"],
      slug: "fresh-coast-laundry-works-north-bend",
      requiresNDA: false,
      hasValuationReport: false,
      detailLevel: "full",
      completenessScore: 90,
      listedAt: new Date(),
      brokerName: "Owner Direct",
      brokerPhone: "541-912-6034",
    },
    financials: {
      grossRevenueOriginal: "222000",
      netRevenueOriginal: "111000",
      averageMonthlyRevenueOriginal: "18500",
      grossRevenueUSD: "222000",
      netRevenueUSD: "111000",
      averageMonthlyRevenueUSD: "18500",
      rentOriginal: "3500",
      utilitiesOriginal: "2500",
      laborOriginal: "0",
      maintenanceOriginal: "600",
      insuranceOriginal: "400",
      otherExpensesOriginal: "500",
      totalExpensesUSD: "7500",
      netIncomeOriginal: "111000",
      ebitdaOriginal: "111000",
      cashFlowOriginal: "111000",
      netIncomeUSD: "111000",
      ebitdaUSD: "111000",
      cashFlowUSD: "111000",
      profitMargin: "50.00",
      roi: "18.50",
      paybackPeriodMonths: 65,
      financialYear: 2024,
      currency: "USD",
      verified: false,
    },
    equipment: [
      { equipmentType: "washer", brand: "Dexter", model: "T-600", capacity: 60, quantity: 4, condition: "excellent", yearInstalled: 2020, turnsPerDay: 4 },
      { equipmentType: "washer", brand: "Dexter", model: "T-450", capacity: 45, quantity: 6, condition: "excellent", yearInstalled: 2020, turnsPerDay: 5 },
      { equipmentType: "washer", brand: "Dexter", model: "T-300", capacity: 30, quantity: 8, condition: "excellent", yearInstalled: 2020, turnsPerDay: 5 },
      { equipmentType: "dryer", brand: "Dexter", model: "Stack Dryer", capacity: 45, quantity: 10, condition: "excellent", yearInstalled: 2020, turnsPerDay: 5 },
      { equipmentType: "payment_system", brand: "CCI", model: "FasCard", capacity: 0, quantity: 1, condition: "excellent", yearInstalled: 2020, notes: "Cashless card payment system" },
    ]
  },
  {
    listing: {
      businessType: "laundromat",
      listingType: "owner",
      title: "Fresh Coast Laundry Works - Reedsport",
      description: `Southern Oregon Coast laundromat in Reedsport! Part of the established Fresh Coast Laundry Works chain, this location serves the Reedsport/Winchester Bay community with professional Dexter equipment and modern amenities.

CHAIN OVERVIEW:
• Part of 3-location Fresh Coast Laundry Works chain (Coos Bay, North Bend, Reedsport)
• All locations identically equipped with Dexter commercial equipment
• Combined chain grossing $665,000 annually
• Owner selling business only - favorable lease terms available

PROPERTY HIGHLIGHTS:
• Reedsport, Oregon location serving coastal community
• Fresh paved parking lot with clear striping
• Professional signage and curb appeal
• Clean, modern interior with natural lighting

EQUIPMENT:
• All Dexter commercial washers and dryers
• CCI FasCard cashless payment system
• Commercial grade folding stations
• Maintained to high standards

FINANCIAL OPPORTUNITY:
• Asking Price: $600,000 (this location)
• Combined Chain Price: $1,800,000 for all 3 locations
• Estimated Annual Revenue: ~$222,000 per location
• Owner owns real estate - favorable lease terms for new operator
• No owner financing available

Excellent opportunity for a buyer looking to enter the laundromat business with a proven operation. Consider acquiring the entire 3-location chain for enhanced economies of scale.

CONTACT: 541-912-6034 (Owner - Direct)`,
      tagline: "Reedsport Oregon Coast - 3-Location Chain - Dexter Equipment - Turnkey Operation",
      priceOriginal: "600000",
      currency: "USD",
      priceInUSD: "600000",
      priceVisibility: "public",
      includesRealEstate: false,
      ownerFinancing: false,
      country: "US",
      region: "OR",
      city: "Reedsport",
      generalLocation: "Oregon Coast - Douglas County",
      exactAddress: "Reedsport, OR 97467",
      latitude: "43.7026",
      longitude: "-124.0967",
      addressVisibility: "public",
      featuredImage: "/attached_assets/IMG_5931_1765289819133.jpeg",
      status: "active",
      featured: true,
      prioritySearch: true,
      visibilityBoost: 3,
      subscriptionTier: "showcase",
      mediaLimit: 30,
      videoLimit: 5,
      seoTitle: "Laundromat For Sale Reedsport Oregon | Fresh Coast Laundry $600K",
      seoDescription: "Reedsport Oregon laundromat for sale. Part of 3-location coastal chain, Dexter equipment, modern facility. $222K annual revenue. Favorable lease terms available.",
      seoKeywords: ["laundromat for sale oregon", "reedsport laundromat", "oregon coast laundromat for sale", "douglas county business"],
      slug: "fresh-coast-laundry-works-reedsport",
      requiresNDA: false,
      hasValuationReport: false,
      detailLevel: "full",
      completenessScore: 90,
      listedAt: new Date(),
      brokerName: "Owner Direct",
      brokerPhone: "541-912-6034",
    },
    financials: {
      grossRevenueOriginal: "221000",
      netRevenueOriginal: "110500",
      averageMonthlyRevenueOriginal: "18416",
      grossRevenueUSD: "221000",
      netRevenueUSD: "110500",
      averageMonthlyRevenueUSD: "18416",
      rentOriginal: "3500",
      utilitiesOriginal: "2500",
      laborOriginal: "0",
      maintenanceOriginal: "600",
      insuranceOriginal: "400",
      otherExpensesOriginal: "500",
      totalExpensesUSD: "7500",
      netIncomeOriginal: "110500",
      ebitdaOriginal: "110500",
      cashFlowOriginal: "110500",
      netIncomeUSD: "110500",
      ebitdaUSD: "110500",
      cashFlowUSD: "110500",
      profitMargin: "50.00",
      roi: "18.42",
      paybackPeriodMonths: 65,
      financialYear: 2024,
      currency: "USD",
      verified: false,
    },
    equipment: [
      { equipmentType: "washer", brand: "Dexter", model: "T-600", capacity: 60, quantity: 4, condition: "excellent", yearInstalled: 2020, turnsPerDay: 4 },
      { equipmentType: "washer", brand: "Dexter", model: "T-450", capacity: 45, quantity: 6, condition: "excellent", yearInstalled: 2020, turnsPerDay: 5 },
      { equipmentType: "washer", brand: "Dexter", model: "T-300", capacity: 30, quantity: 8, condition: "excellent", yearInstalled: 2020, turnsPerDay: 5 },
      { equipmentType: "dryer", brand: "Dexter", model: "Stack Dryer", capacity: 45, quantity: 10, condition: "excellent", yearInstalled: 2020, turnsPerDay: 5 },
      { equipmentType: "payment_system", brand: "CCI", model: "FasCard", capacity: 0, quantity: 1, condition: "excellent", yearInstalled: 2020, notes: "Cashless card payment system" },
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
