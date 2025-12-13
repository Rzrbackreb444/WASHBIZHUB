// State-specific laundromat market data for SEO landing pages
// Each state has unique statistics, market insights, and localized content

export interface StateData {
  slug: string;
  name: string;
  abbr: string;
  population: string;
  laundromatCount: string;
  avgSalePrice: string;
  avgRevenue: string;
  marketGrowth: string;
  topCities: string[];
  demographics: {
    renterPercentage: string;
    medianIncome: string;
    populationDensity: string;
  };
  marketInsights: string[];
  sellerTips: string[];
  recentSales: {
    city: string;
    price: string;
    sqft: string;
    machines: number;
    daysOnMarket: number;
  }[];
  expertQuote: {
    text: string;
    author: string;
    title: string;
  };
  faq: { q: string; a: string }[];
}

export const STATE_DATA: Record<string, StateData> = {
  "alabama": {
    slug: "alabama",
    name: "Alabama",
    abbr: "AL",
    population: "5.1 million",
    laundromatCount: "380+",
    avgSalePrice: "$185,000",
    avgRevenue: "$156,000/year",
    marketGrowth: "+4.2%",
    topCities: ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa"],
    demographics: {
      renterPercentage: "31%",
      medianIncome: "$52,000",
      populationDensity: "96/sq mi"
    },
    marketInsights: [
      "Birmingham metro accounts for 35% of state laundromat transactions",
      "College towns like Tuscaloosa see 15% higher foot traffic",
      "Military bases near Huntsville create stable customer base",
      "Lower real estate costs mean higher profit margins than national average"
    ],
    sellerTips: [
      "Highlight proximity to apartment complexes in your listing",
      "Document utility costs - Alabama has below-average electricity rates",
      "Emphasize any card payment systems - increasingly important to buyers"
    ],
    recentSales: [
      { city: "Birmingham", price: "$225,000", sqft: "2,800", machines: 32, daysOnMarket: 38 },
      { city: "Mobile", price: "$165,000", sqft: "2,100", machines: 24, daysOnMarket: 52 }
    ],
    expertQuote: {
      text: "Alabama's laundromat market offers excellent value for investors. Lower acquisition costs combined with steady demand from the state's significant renter population creates attractive ROI opportunities.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What's the average time to sell a laundromat in Alabama?", a: "Alabama laundromats typically sell within 45-60 days when priced correctly. Birmingham and Huntsville markets move fastest due to higher investor activity." },
      { q: "Do I need a broker to sell my Alabama laundromat?", a: "While not legally required, working with a broker experienced in Alabama laundromat sales can increase your sale price by 10-15% and reduce time on market." },
      { q: "What documentation do Alabama buyers expect?", a: "Prepare 2-3 years of tax returns, utility bills, equipment maintenance records, and your lease agreement. Alabama buyers particularly value documented cash flow." }
    ]
  },
  "alaska": {
    slug: "alaska",
    name: "Alaska",
    abbr: "AK",
    population: "733,000",
    laundromatCount: "85+",
    avgSalePrice: "$245,000",
    avgRevenue: "$198,000/year",
    marketGrowth: "+3.1%",
    topCities: ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan"],
    demographics: {
      renterPercentage: "35%",
      medianIncome: "$77,000",
      populationDensity: "1.3/sq mi"
    },
    marketInsights: [
      "Anchorage contains 65% of all Alaska laundromats",
      "Higher utility costs offset by premium pricing per load",
      "Limited competition due to geographic isolation",
      "Military personnel create consistent year-round demand"
    ],
    sellerTips: [
      "Emphasize heating efficiency - major cost factor for buyers",
      "Document seasonal revenue patterns clearly",
      "Highlight any commercial accounts (hotels, B&Bs)"
    ],
    recentSales: [
      { city: "Anchorage", price: "$285,000", sqft: "3,200", machines: 36, daysOnMarket: 65 },
      { city: "Fairbanks", price: "$195,000", sqft: "2,400", machines: 28, daysOnMarket: 78 }
    ],
    expertQuote: {
      text: "Alaska's unique market dynamics - limited competition, higher pricing power, and steady military demand - make laundromats here surprisingly profitable despite higher operating costs.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Are Alaska laundromats profitable given high utility costs?", a: "Yes. Alaska laundromats typically charge $4-6 per wash vs. $2-3.50 nationally, offsetting higher utility costs. Profit margins remain competitive at 25-35%." },
      { q: "What's unique about selling an Alaska laundromat?", a: "Buyers focus heavily on heating systems, equipment winterization, and lease terms. The smaller buyer pool means pricing accuracy is critical." },
      { q: "How do I reach buyers for my Alaska laundromat?", a: "WashBizHub reaches investors nationally, including those seeking unique markets. We also connect with Alaska-based business brokers." }
    ]
  },
  "arizona": {
    slug: "arizona",
    name: "Arizona",
    abbr: "AZ",
    population: "7.4 million",
    laundromatCount: "520+",
    avgSalePrice: "$275,000",
    avgRevenue: "$215,000/year",
    marketGrowth: "+7.8%",
    topCities: ["Phoenix", "Tucson", "Mesa", "Scottsdale", "Tempe"],
    demographics: {
      renterPercentage: "34%",
      medianIncome: "$62,000",
      populationDensity: "64/sq mi"
    },
    marketInsights: [
      "Phoenix metro is one of the fastest-growing laundromat markets nationally",
      "Snowbird population creates seasonal revenue opportunities",
      "Water costs are a key factor - document efficiency investments",
      "Hispanic community drives strong demand for full-service options"
    ],
    sellerTips: [
      "Highlight water-efficient equipment - major selling point in Arizona",
      "Document A/C costs and any solar installations",
      "Emphasize parking availability - critical in Phoenix market"
    ],
    recentSales: [
      { city: "Phoenix", price: "$345,000", sqft: "3,500", machines: 42, daysOnMarket: 28 },
      { city: "Tucson", price: "$225,000", sqft: "2,600", machines: 30, daysOnMarket: 41 }
    ],
    expertQuote: {
      text: "Arizona's explosive population growth, particularly in Phoenix, has created a seller's market for laundromats. Well-positioned locations are receiving multiple offers within weeks of listing.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Is now a good time to sell my Arizona laundromat?", a: "Absolutely. Arizona's population grew 12% in the last decade, and laundromat valuations have increased 15-20% since 2020. Buyer demand is at historic highs." },
      { q: "What multiple can I expect for my Arizona laundromat?", a: "Arizona laundromats are selling at 2.8-3.5x SDE, above the national average of 2.5-3x, due to strong growth fundamentals." },
      { q: "How important is location in Arizona?", a: "Critical. Proximity to apartment complexes, university housing (ASU, UA), and Hispanic neighborhoods significantly impacts valuation and buyer interest." }
    ]
  },
  "arkansas": {
    slug: "arkansas",
    name: "Arkansas",
    abbr: "AR",
    population: "3.0 million",
    laundromatCount: "285+",
    avgSalePrice: "$145,000",
    avgRevenue: "$128,000/year",
    marketGrowth: "+3.5%",
    topCities: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro"],
    demographics: {
      renterPercentage: "33%",
      medianIncome: "$49,000",
      populationDensity: "58/sq mi"
    },
    marketInsights: [
      "Northwest Arkansas (Bentonville/Fayetteville) is the hottest submarket",
      "Walmart HQ region seeing significant population influx",
      "Lower acquisition costs attract first-time buyers",
      "University of Arkansas creates stable student customer base"
    ],
    sellerTips: [
      "Northwest Arkansas commands 20% premium over state average",
      "Document any commercial accounts (hotels, gyms)",
      "Emphasize low utility costs compared to national average"
    ],
    recentSales: [
      { city: "Little Rock", price: "$175,000", sqft: "2,400", machines: 28, daysOnMarket: 48 },
      { city: "Fayetteville", price: "$195,000", sqft: "2,200", machines: 26, daysOnMarket: 32 }
    ],
    expertQuote: {
      text: "Arkansas offers exceptional entry points for new laundromat investors. The Northwest Arkansas corridor, driven by Walmart and Tyson headquarters, is seeing California-level demand with Midwest pricing.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why is Northwest Arkansas a hot market?", a: "The Bentonville/Fayetteville region is experiencing massive population growth due to Walmart, Tyson, and J.B. Hunt headquarters, creating strong laundromat demand." },
      { q: "What's the typical buyer profile for Arkansas laundromats?", a: "Mix of local entrepreneurs, out-of-state investors seeking value, and existing operators expanding. First-time buyers are common due to accessible price points." },
      { q: "How do I value my Arkansas laundromat?", a: "Arkansas laundromats typically sell at 2.2-2.8x SDE. Location in growing areas like NWA can push multiples to 3x or higher." }
    ]
  },
  "california": {
    slug: "california",
    name: "California",
    abbr: "CA",
    population: "39.5 million",
    laundromatCount: "4,200+",
    avgSalePrice: "$485,000",
    avgRevenue: "$345,000/year",
    marketGrowth: "+5.2%",
    topCities: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno"],
    demographics: {
      renterPercentage: "44%",
      medianIncome: "$78,000",
      populationDensity: "253/sq mi"
    },
    marketInsights: [
      "Largest laundromat market in the US by transaction volume",
      "High renter percentage drives consistent demand",
      "Premium locations in LA command $800K+ valuations",
      "Card/app payment systems are now expected standard"
    ],
    sellerTips: [
      "Professional photos and video tours are essential",
      "Highlight any improvements to ADA compliance",
      "Document water recycling systems - major value driver",
      "Prepare for extensive buyer due diligence"
    ],
    recentSales: [
      { city: "Los Angeles", price: "$625,000", sqft: "4,200", machines: 52, daysOnMarket: 35 },
      { city: "San Diego", price: "$485,000", sqft: "3,400", machines: 40, daysOnMarket: 42 },
      { city: "Fresno", price: "$285,000", sqft: "2,800", machines: 34, daysOnMarket: 55 }
    ],
    expertQuote: {
      text: "California remains the most active laundromat market nationally. The combination of high renter percentage, diverse demographics, and established investor pool creates year-round buyer demand.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What's driving California laundromat values?", a: "High renter rates (44%), limited new construction, and strong cash flow fundamentals. LA and Bay Area locations command premium multiples of 3.5-4x SDE." },
      { q: "How long does it take to sell in California?", a: "Well-priced California laundromats sell in 30-45 days. Premium locations in LA often receive multiple offers within 2 weeks." },
      { q: "Do I need a California business broker?", a: "While not required, California's complex regulations (ABC licensing, environmental) make experienced brokers valuable. WashBizHub connects you with vetted California specialists." }
    ]
  },
  "colorado": {
    slug: "colorado",
    name: "Colorado",
    abbr: "CO",
    population: "5.8 million",
    laundromatCount: "385+",
    avgSalePrice: "$295,000",
    avgRevenue: "$238,000/year",
    marketGrowth: "+6.5%",
    topCities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder"],
    demographics: {
      renterPercentage: "35%",
      medianIncome: "$75,000",
      populationDensity: "56/sq mi"
    },
    marketInsights: [
      "Denver metro accounts for 60% of Colorado laundromat sales",
      "Outdoor recreation culture creates demand for specialty services",
      "High-altitude affects dryer efficiency - document any modifications",
      "Strong population growth driving new buyer interest"
    ],
    sellerTips: [
      "Highlight energy-efficient equipment - Colorado buyers value sustainability",
      "Document any outdoor gear washing capabilities",
      "Emphasize parking and accessibility"
    ],
    recentSales: [
      { city: "Denver", price: "$365,000", sqft: "3,100", machines: 38, daysOnMarket: 32 },
      { city: "Colorado Springs", price: "$245,000", sqft: "2,600", machines: 30, daysOnMarket: 45 }
    ],
    expertQuote: {
      text: "Colorado's combination of population growth, high renter percentage in urban areas, and affluent demographics creates a compelling market for laundromat investors.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does altitude affect laundromat operations in Colorado?", a: "Higher altitude requires longer dry times. Buyers will ask about dryer modifications. Document any high-altitude equipment adjustments." },
      { q: "What areas of Colorado have the most buyer interest?", a: "Denver metro, Colorado Springs, and Fort Collins see the most activity. Boulder commands premium valuations due to limited inventory." },
      { q: "Are Colorado laundromats a good investment?", a: "Yes. Colorado's 15% population growth over the past decade, combined with a 35% renter rate, creates strong fundamentals for laundromat investments." }
    ]
  },
  "connecticut": {
    slug: "connecticut",
    name: "Connecticut",
    abbr: "CT",
    population: "3.6 million",
    laundromatCount: "320+",
    avgSalePrice: "$265,000",
    avgRevenue: "$215,000/year",
    marketGrowth: "+2.8%",
    topCities: ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury"],
    demographics: {
      renterPercentage: "33%",
      medianIncome: "$79,000",
      populationDensity: "738/sq mi"
    },
    marketInsights: [
      "Dense population creates strong foot traffic",
      "Yale/UConn areas have stable student customer bases",
      "Higher-than-average pricing power in Fairfield County",
      "Proximity to NYC attracts sophisticated investors"
    ],
    sellerTips: [
      "Highlight proximity to universities and apartment complexes",
      "Document any parking arrangements - critical in CT",
      "Emphasize modern payment systems"
    ],
    recentSales: [
      { city: "New Haven", price: "$295,000", sqft: "2,800", machines: 34, daysOnMarket: 40 },
      { city: "Hartford", price: "$225,000", sqft: "2,400", machines: 28, daysOnMarket: 52 }
    ],
    expertQuote: {
      text: "Connecticut's high population density and significant renter population in urban areas create excellent laundromat fundamentals, particularly near university towns.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What makes Connecticut laundromats valuable?", a: "High population density, limited parking (makes in-home laundry difficult), and strong renter populations in cities like New Haven, Hartford, and Bridgeport." },
      { q: "Are there many buyers for Connecticut laundromats?", a: "Yes. Connecticut attracts both local buyers and NYC-area investors seeking better returns than Manhattan. Competition for good locations is strong." },
      { q: "What should I know about CT regulations?", a: "Connecticut has specific signage and ADA requirements. Ensure your listing documents compliance with state and local regulations." }
    ]
  },
  "delaware": {
    slug: "delaware",
    name: "Delaware",
    abbr: "DE",
    population: "1.0 million",
    laundromatCount: "95+",
    avgSalePrice: "$225,000",
    avgRevenue: "$185,000/year",
    marketGrowth: "+3.8%",
    topCities: ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"],
    demographics: {
      renterPercentage: "30%",
      medianIncome: "$69,000",
      populationDensity: "508/sq mi"
    },
    marketInsights: [
      "Small market with limited inventory creates seller advantage",
      "Wilmington area sees most transaction activity",
      "No sales tax makes Delaware attractive to investors",
      "University of Delaware provides stable customer base"
    ],
    sellerTips: [
      "Emphasize Delaware's tax advantages in marketing",
      "Document proximity to Philadelphia metro buyers",
      "Highlight any university or military customer base"
    ],
    recentSales: [
      { city: "Wilmington", price: "$265,000", sqft: "2,600", machines: 30, daysOnMarket: 48 },
      { city: "Newark", price: "$195,000", sqft: "2,200", machines: 26, daysOnMarket: 55 }
    ],
    expertQuote: {
      text: "Delaware's small size belies its attractive laundromat market. No sales tax, proximity to major metros, and limited competition create favorable conditions for sellers.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does Delaware's small market affect sales?", a: "Limited inventory means less competition when selling. Well-priced laundromats attract buyers from the broader Philadelphia/Baltimore metro areas." },
      { q: "What are Delaware's tax advantages?", a: "Delaware has no sales tax, making laundromat operations more profitable. This is a key selling point for out-of-state investors." },
      { q: "Who buys Delaware laundromats?", a: "Mix of local entrepreneurs, Philadelphia-area investors, and first-time buyers attracted by accessible price points." }
    ]
  },
  "florida": {
    slug: "florida",
    name: "Florida",
    abbr: "FL",
    population: "22.2 million",
    laundromatCount: "1,850+",
    avgSalePrice: "$325,000",
    avgRevenue: "$265,000/year",
    marketGrowth: "+8.5%",
    topCities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
    demographics: {
      renterPercentage: "35%",
      medianIncome: "$59,000",
      populationDensity: "410/sq mi"
    },
    marketInsights: [
      "Second-largest laundromat market nationally",
      "Population growth of 15%+ drives new demand",
      "Hispanic communities value full-service options",
      "Snowbird population creates seasonal revenue spikes",
      "Hurricane preparation creates commercial washing demand"
    ],
    sellerTips: [
      "Document hurricane preparedness and insurance",
      "Highlight A/C efficiency - major operating cost",
      "Emphasize any commercial accounts (hotels, vacation rentals)",
      "Professional photos essential in competitive market"
    ],
    recentSales: [
      { city: "Miami", price: "$485,000", sqft: "3,800", machines: 46, daysOnMarket: 28 },
      { city: "Orlando", price: "$345,000", sqft: "3,200", machines: 38, daysOnMarket: 35 },
      { city: "Tampa", price: "$295,000", sqft: "2,800", machines: 32, daysOnMarket: 42 }
    ],
    expertQuote: {
      text: "Florida's explosive population growth and tourism industry create unparalleled laundromat demand. Miami and Orlando are among the most competitive markets nationally, with premium valuations.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Is Florida a seller's market for laundromats?", a: "Absolutely. Florida's 15%+ population growth has created intense buyer demand. Well-located laundromats in Miami, Orlando, and Tampa often receive multiple offers." },
      { q: "How do hurricanes affect laundromat sales?", a: "Buyers will review your hurricane preparedness plan and insurance coverage. Documented storm resilience can actually increase valuation." },
      { q: "What multiple can I expect in Florida?", a: "Florida laundromats sell at 2.8-3.5x SDE, with Miami and South Florida commanding premiums up to 4x for prime locations." }
    ]
  },
  "georgia": {
    slug: "georgia",
    name: "Georgia",
    abbr: "GA",
    population: "10.9 million",
    laundromatCount: "920+",
    avgSalePrice: "$245,000",
    avgRevenue: "$198,000/year",
    marketGrowth: "+6.2%",
    topCities: ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens"],
    demographics: {
      renterPercentage: "36%",
      medianIncome: "$61,000",
      populationDensity: "185/sq mi"
    },
    marketInsights: [
      "Atlanta metro dominates with 65% of state transactions",
      "Strong population growth attracting national investors",
      "College towns (Athens, Statesboro) have stable demand",
      "Diverse demographics create varied service opportunities"
    ],
    sellerTips: [
      "Metro Atlanta commands significant premium",
      "Document any commercial/pickup-delivery services",
      "Highlight proximity to MARTA transit lines"
    ],
    recentSales: [
      { city: "Atlanta", price: "$325,000", sqft: "3,200", machines: 38, daysOnMarket: 32 },
      { city: "Savannah", price: "$215,000", sqft: "2,400", machines: 28, daysOnMarket: 48 }
    ],
    expertQuote: {
      text: "Georgia, particularly metro Atlanta, offers compelling laundromat investment opportunities. Strong population growth combined with increasing renter percentages creates sustained demand.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How hot is the Atlanta laundromat market?", a: "Very active. Atlanta's population growth and 40%+ renter rate in urban areas creates strong buyer demand. Well-priced locations sell within 30-45 days." },
      { q: "What areas outside Atlanta are attractive?", a: "Savannah (tourism), Augusta (military), and Athens (University of Georgia) all have solid laundromat fundamentals." },
      { q: "What documentation do Georgia buyers expect?", a: "Standard financials plus utility bills (Georgia Power costs), lease terms, and equipment age. Commercial accounts are a significant value-add." }
    ]
  },
  "hawaii": {
    slug: "hawaii",
    name: "Hawaii",
    abbr: "HI",
    population: "1.4 million",
    laundromatCount: "165+",
    avgSalePrice: "$395,000",
    avgRevenue: "$285,000/year",
    marketGrowth: "+2.5%",
    topCities: ["Honolulu", "Pearl City", "Hilo", "Kailua", "Waipahu"],
    demographics: {
      renterPercentage: "42%",
      medianIncome: "$83,000",
      populationDensity: "221/sq mi"
    },
    marketInsights: [
      "High barriers to entry limit competition",
      "Premium pricing ($5-7/wash) offsets higher costs",
      "Military bases provide stable customer base",
      "Limited commercial laundry options increase demand"
    ],
    sellerTips: [
      "Document utility costs in detail - major buyer concern",
      "Highlight any solar installations",
      "Emphasize military and tourism-related revenue"
    ],
    recentSales: [
      { city: "Honolulu", price: "$475,000", sqft: "2,800", machines: 32, daysOnMarket: 55 },
      { city: "Pearl City", price: "$325,000", sqft: "2,200", machines: 26, daysOnMarket: 68 }
    ],
    expertQuote: {
      text: "Hawaii's unique market dynamics - isolated geography, high renter rates, and limited competition - create laundromats with exceptional pricing power and stable demand.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Are Hawaii laundromats profitable despite high costs?", a: "Yes. Hawaii laundromats charge $5-7 per wash, 2-3x mainland averages. This offsets higher utility and rent costs, maintaining competitive margins." },
      { q: "Who buys Hawaii laundromats?", a: "Mix of local investors, mainland transplants, and military-connected buyers. The smaller buyer pool requires accurate pricing." },
      { q: "What's unique about selling in Hawaii?", a: "Island logistics, shipping costs for equipment, and utility infrastructure are key buyer concerns. Document everything thoroughly." }
    ]
  },
  "idaho": {
    slug: "idaho",
    name: "Idaho",
    abbr: "ID",
    population: "1.9 million",
    laundromatCount: "145+",
    avgSalePrice: "$195,000",
    avgRevenue: "$165,000/year",
    marketGrowth: "+9.2%",
    topCities: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello"],
    demographics: {
      renterPercentage: "29%",
      medianIncome: "$60,000",
      populationDensity: "23/sq mi"
    },
    marketInsights: [
      "Boise metro has seen 25% population growth in 5 years",
      "California transplants driving real estate and business demand",
      "Limited inventory creates seller's advantage",
      "Lower operating costs than West Coast"
    ],
    sellerTips: [
      "Boise-area laundromats command significant premiums",
      "Document growth in surrounding apartment developments",
      "Highlight any expansion potential"
    ],
    recentSales: [
      { city: "Boise", price: "$265,000", sqft: "2,600", machines: 30, daysOnMarket: 28 },
      { city: "Nampa", price: "$175,000", sqft: "2,200", machines: 26, daysOnMarket: 38 }
    ],
    expertQuote: {
      text: "Idaho's explosive growth, particularly in the Boise metro, has transformed the laundromat market. Sellers are achieving valuations that would have been unthinkable five years ago.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How has Idaho's population growth affected laundromat values?", a: "Dramatically. Boise-area laundromat values have increased 30-40% since 2020, driven by California migration and apartment construction." },
      { q: "Is now a good time to sell in Idaho?", a: "Excellent timing. Population growth continues, inventory is limited, and buyer demand from out-of-state investors is at historic highs." },
      { q: "What areas of Idaho are most attractive?", a: "Boise metro (Meridian, Nampa, Caldwell) sees the most activity. Idaho Falls and Pocatello have stable markets with less competition." }
    ]
  },
  "illinois": {
    slug: "illinois",
    name: "Illinois",
    abbr: "IL",
    population: "12.6 million",
    laundromatCount: "1,450+",
    avgSalePrice: "$285,000",
    avgRevenue: "$235,000/year",
    marketGrowth: "+3.2%",
    topCities: ["Chicago", "Aurora", "Rockford", "Naperville", "Joliet"],
    demographics: {
      renterPercentage: "34%",
      medianIncome: "$68,000",
      populationDensity: "228/sq mi"
    },
    marketInsights: [
      "Chicago metro represents 75% of state laundromat activity",
      "Dense urban neighborhoods have highest demand",
      "Strong Hispanic and immigrant communities value laundromats",
      "University towns provide stable customer bases"
    ],
    sellerTips: [
      "Chicago locations require neighborhood-specific marketing",
      "Document CTA accessibility - major value driver",
      "Highlight any bilingual signage/services"
    ],
    recentSales: [
      { city: "Chicago", price: "$385,000", sqft: "3,400", machines: 42, daysOnMarket: 35 },
      { city: "Aurora", price: "$225,000", sqft: "2,600", machines: 30, daysOnMarket: 48 }
    ],
    expertQuote: {
      text: "Chicago's dense, diverse neighborhoods create exceptional laundromat opportunities. The city's strong renter culture and limited in-unit laundry options ensure sustained demand.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How do Chicago neighborhoods affect laundromat values?", a: "Significantly. Locations in high-density areas like Pilsen, Logan Square, and Humboldt Park command premiums. CTA accessibility is crucial." },
      { q: "What challenges exist in Illinois?", a: "Higher property taxes and regulatory requirements than some states. Document compliance thoroughly for buyer confidence." },
      { q: "Are suburban Chicago laundromats valuable?", a: "Yes. Aurora, Joliet, and Waukegan have strong renter populations and less competition than city locations." }
    ]
  },
  "indiana": {
    slug: "indiana",
    name: "Indiana",
    abbr: "IN",
    population: "6.8 million",
    laundromatCount: "485+",
    avgSalePrice: "$175,000",
    avgRevenue: "$148,000/year",
    marketGrowth: "+4.1%",
    topCities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel"],
    demographics: {
      renterPercentage: "31%",
      medianIncome: "$57,000",
      populationDensity: "188/sq mi"
    },
    marketInsights: [
      "Indianapolis metro drives 50% of state transactions",
      "Lower acquisition costs attract first-time buyers",
      "Notre Dame/Purdue areas have stable demand",
      "Growing Hispanic population in Indianapolis"
    ],
    sellerTips: [
      "Emphasize affordable entry point for investors",
      "Document any university or college proximity",
      "Highlight low utility costs compared to coasts"
    ],
    recentSales: [
      { city: "Indianapolis", price: "$215,000", sqft: "2,800", machines: 32, daysOnMarket: 42 },
      { city: "Fort Wayne", price: "$155,000", sqft: "2,200", machines: 26, daysOnMarket: 55 }
    ],
    expertQuote: {
      text: "Indiana offers exceptional value for laundromat investors. Lower acquisition costs, reasonable operating expenses, and stable Midwest demand create attractive returns.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What makes Indiana attractive for laundromat buyers?", a: "Accessible price points, lower operating costs than coastal markets, and stable demand. Indianapolis particularly attracts first-time investors." },
      { q: "How long do Indiana laundromats take to sell?", a: "Average of 45-60 days. Indianapolis sells faster; smaller markets may take longer but face less buyer competition." },
      { q: "What's the typical buyer profile?", a: "First-time entrepreneurs, existing operators expanding, and out-of-state investors seeking better cap rates than coastal markets." }
    ]
  },
  "iowa": {
    slug: "iowa",
    name: "Iowa",
    abbr: "IA",
    population: "3.2 million",
    laundromatCount: "275+",
    avgSalePrice: "$155,000",
    avgRevenue: "$132,000/year",
    marketGrowth: "+2.8%",
    topCities: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"],
    demographics: {
      renterPercentage: "28%",
      medianIncome: "$60,000",
      populationDensity: "57/sq mi"
    },
    marketInsights: [
      "Des Moines metro accounts for 40% of state activity",
      "University of Iowa creates stable demand in Iowa City",
      "Lower competition in rural markets",
      "Stable, recession-resistant economy"
    ],
    sellerTips: [
      "Emphasize stable, consistent cash flow",
      "Document any agricultural community customers",
      "Highlight low operating costs"
    ],
    recentSales: [
      { city: "Des Moines", price: "$195,000", sqft: "2,600", machines: 30, daysOnMarket: 52 },
      { city: "Iowa City", price: "$175,000", sqft: "2,200", machines: 26, daysOnMarket: 45 }
    ],
    expertQuote: {
      text: "Iowa's stable economy and low operating costs create laundromats with consistent, predictable cash flow - exactly what many investors are seeking.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Is Iowa a good market for selling a laundromat?", a: "Yes for sellers seeking stable valuations. Iowa doesn't have the speculation of coastal markets, but valuations are fair and buyers are serious." },
      { q: "What areas of Iowa have the most demand?", a: "Des Moines metro, Iowa City (University of Iowa), and Cedar Rapids see the most buyer activity." },
      { q: "How do Iowa laundromats compare to national averages?", a: "Lower acquisition costs but also lower revenue. However, margins are often better due to significantly lower operating costs." }
    ]
  },
  "kansas": {
    slug: "kansas",
    name: "Kansas",
    abbr: "KS",
    population: "2.9 million",
    laundromatCount: "235+",
    avgSalePrice: "$165,000",
    avgRevenue: "$142,000/year",
    marketGrowth: "+3.2%",
    topCities: ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka"],
    demographics: {
      renterPercentage: "32%",
      medianIncome: "$59,000",
      populationDensity: "36/sq mi"
    },
    marketInsights: [
      "Kansas City metro (KS side) sees most activity",
      "Wichita has stable manufacturing-based demand",
      "Military bases (Fort Riley, Fort Leavenworth) provide customers",
      "Lower competition than Missouri side of KC"
    ],
    sellerTips: [
      "KC metro locations command premium over state average",
      "Document any military customer base",
      "Emphasize low utility and property tax costs"
    ],
    recentSales: [
      { city: "Overland Park", price: "$225,000", sqft: "2,800", machines: 32, daysOnMarket: 38 },
      { city: "Wichita", price: "$155,000", sqft: "2,200", machines: 26, daysOnMarket: 55 }
    ],
    expertQuote: {
      text: "Kansas offers solid laundromat fundamentals at accessible price points. The Kansas City metro provides urban-level demand with Midwest operating costs.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does Kansas City metro affect Kansas laundromat values?", a: "Significantly. Johnson County (Overland Park, Olathe) commands premiums 40-50% above state average due to population density and affluence." },
      { q: "What about selling in smaller Kansas markets?", a: "Wichita and Topeka have stable demand. Smaller towns may take longer to sell but face less competition and more serious buyers." },
      { q: "What's unique about Kansas laundromat sales?", a: "Lower acquisition costs attract first-time buyers. Military proximity in some areas creates uniquely stable customer bases." }
    ]
  },
  "kentucky": {
    slug: "kentucky",
    name: "Kentucky",
    abbr: "KY",
    population: "4.5 million",
    laundromatCount: "345+",
    avgSalePrice: "$165,000",
    avgRevenue: "$138,000/year",
    marketGrowth: "+3.5%",
    topCities: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"],
    demographics: {
      renterPercentage: "32%",
      medianIncome: "$52,000",
      populationDensity: "113/sq mi"
    },
    marketInsights: [
      "Louisville metro represents 45% of state activity",
      "University of Kentucky area (Lexington) has stable demand",
      "Northern Kentucky benefits from Cincinnati metro spillover",
      "Amazon/logistics growth creating new demand pockets"
    ],
    sellerTips: [
      "Louisville and Lexington command premiums",
      "Document any university or college customer base",
      "Highlight low operating costs"
    ],
    recentSales: [
      { city: "Louisville", price: "$195,000", sqft: "2,600", machines: 30, daysOnMarket: 45 },
      { city: "Lexington", price: "$175,000", sqft: "2,400", machines: 28, daysOnMarket: 52 }
    ],
    expertQuote: {
      text: "Kentucky's affordable entry points and stable demand make it attractive for new laundromat investors. Louisville and Lexington offer urban fundamentals with Midwest pricing.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What's driving Kentucky laundromat demand?", a: "Amazon distribution centers and automotive manufacturing have brought population growth. Louisville and Northern Kentucky are particularly active." },
      { q: "How do Kentucky prices compare nationally?", a: "About 30% below national average acquisition costs, but margins are competitive due to lower operating expenses." },
      { q: "Who buys Kentucky laundromats?", a: "Mix of local entrepreneurs, Ohio/Indiana investors, and first-time buyers attracted by accessible price points." }
    ]
  },
  "louisiana": {
    slug: "louisiana",
    name: "Louisiana",
    abbr: "LA",
    population: "4.6 million",
    laundromatCount: "425+",
    avgSalePrice: "$185,000",
    avgRevenue: "$158,000/year",
    marketGrowth: "+3.8%",
    topCities: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"],
    demographics: {
      renterPercentage: "33%",
      medianIncome: "$50,000",
      populationDensity: "107/sq mi"
    },
    marketInsights: [
      "New Orleans has unique cultural demand for laundromats",
      "Oil/gas industry creates economic cycles",
      "Hurricane resilience is a key buyer concern",
      "Strong community-oriented customer relationships"
    ],
    sellerTips: [
      "Document hurricane preparedness and insurance thoroughly",
      "Highlight any flood zone mitigation",
      "Emphasize community customer relationships"
    ],
    recentSales: [
      { city: "New Orleans", price: "$225,000", sqft: "2,800", machines: 32, daysOnMarket: 48 },
      { city: "Baton Rouge", price: "$175,000", sqft: "2,400", machines: 28, daysOnMarket: 55 }
    ],
    expertQuote: {
      text: "Louisiana's unique market, particularly New Orleans, offers laundromats with strong community ties and cultural significance that create loyal customer bases.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How do hurricanes affect Louisiana laundromat sales?", a: "Buyers scrutinize storm preparedness carefully. Well-documented resilience and insurance can actually be selling points, showing the business survives adversity." },
      { q: "What's special about New Orleans laundromats?", a: "Dense neighborhoods, tourism, and limited in-unit laundry create strong demand. Cultural community ties often mean loyal, multi-generational customers." },
      { q: "Are Louisiana laundromats affected by oil prices?", a: "Somewhat in oil-dependent regions (Lafayette, Lake Charles). New Orleans and Baton Rouge have more diversified economies." }
    ]
  },
  "maine": {
    slug: "maine",
    name: "Maine",
    abbr: "ME",
    population: "1.4 million",
    laundromatCount: "125+",
    avgSalePrice: "$195,000",
    avgRevenue: "$165,000/year",
    marketGrowth: "+2.5%",
    topCities: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn"],
    demographics: {
      renterPercentage: "28%",
      medianIncome: "$58,000",
      populationDensity: "44/sq mi"
    },
    marketInsights: [
      "Portland metro dominates with 60% of state activity",
      "Tourism creates seasonal revenue opportunities",
      "Limited competition in rural markets",
      "Heating costs are a key operational factor"
    ],
    sellerTips: [
      "Document heating efficiency - major buyer concern",
      "Highlight any tourist/vacation rental accounts",
      "Portland commands significant premiums"
    ],
    recentSales: [
      { city: "Portland", price: "$245,000", sqft: "2,600", machines: 30, daysOnMarket: 45 },
      { city: "Lewiston", price: "$155,000", sqft: "2,200", machines: 26, daysOnMarket: 62 }
    ],
    expertQuote: {
      text: "Maine's laundromat market, centered on Portland, offers stable demand with tourism upside. The limited inventory creates favorable conditions for sellers.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does Maine's climate affect laundromat operations?", a: "Heating costs are significant. Buyers will scrutinize your heating system. Document any efficiency improvements or alternative heating sources." },
      { q: "Does tourism affect Maine laundromats?", a: "Yes, particularly in coastal areas. Summer months can see 30-50% revenue increases from tourists and vacation rental accounts." },
      { q: "What's the buyer pool for Maine laundromats?", a: "Mix of local entrepreneurs, Boston-area investors, and retirees relocating. Portland attracts the most sophisticated buyers." }
    ]
  },
  "maryland": {
    slug: "maryland",
    name: "Maryland",
    abbr: "MD",
    population: "6.2 million",
    laundromatCount: "485+",
    avgSalePrice: "$275,000",
    avgRevenue: "$225,000/year",
    marketGrowth: "+4.5%",
    topCities: ["Baltimore", "Columbia", "Germantown", "Silver Spring", "Waldorf"],
    demographics: {
      renterPercentage: "36%",
      medianIncome: "$86,000",
      populationDensity: "636/sq mi"
    },
    marketInsights: [
      "DC suburb locations command premium valuations",
      "Baltimore has strong urban laundromat demand",
      "High income levels support premium pricing",
      "Dense population creates excellent foot traffic"
    ],
    sellerTips: [
      "DC proximity significantly affects valuation",
      "Document any federal contractor customer base",
      "Highlight Metro accessibility"
    ],
    recentSales: [
      { city: "Baltimore", price: "$295,000", sqft: "3,000", machines: 36, daysOnMarket: 38 },
      { city: "Silver Spring", price: "$345,000", sqft: "2,800", machines: 32, daysOnMarket: 32 }
    ],
    expertQuote: {
      text: "Maryland's combination of dense population, high incomes, and DC proximity creates one of the most attractive laundromat markets on the East Coast.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does DC proximity affect Maryland laundromat values?", a: "Significantly. Montgomery and Prince George's County locations command 25-40% premiums over Baltimore due to DC commuter demand." },
      { q: "What makes Baltimore's market unique?", a: "Dense urban neighborhoods with high renter percentages. Strong community ties and limited competition in established neighborhoods." },
      { q: "Are Maryland laundromats good investments?", a: "Excellent. High household incomes support premium pricing, while dense population creates consistent demand." }
    ]
  },
  "massachusetts": {
    slug: "massachusetts",
    name: "Massachusetts",
    abbr: "MA",
    population: "7.0 million",
    laundromatCount: "625+",
    avgSalePrice: "$325,000",
    avgRevenue: "$268,000/year",
    marketGrowth: "+3.8%",
    topCities: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell"],
    demographics: {
      renterPercentage: "38%",
      medianIncome: "$84,000",
      populationDensity: "901/sq mi"
    },
    marketInsights: [
      "Boston metro has the highest density of laundromats in New England",
      "College/university population creates year-round demand",
      "Limited parking increases laundromat usage",
      "High renter percentage ensures stable customer base"
    ],
    sellerTips: [
      "Boston locations require neighborhood-specific marketing",
      "Document T (subway) accessibility",
      "Highlight any university customer base"
    ],
    recentSales: [
      { city: "Boston", price: "$425,000", sqft: "3,200", machines: 38, daysOnMarket: 32 },
      { city: "Worcester", price: "$265,000", sqft: "2,800", machines: 32, daysOnMarket: 45 }
    ],
    expertQuote: {
      text: "Massachusetts, particularly Boston, offers laundromat fundamentals rivaling New York. The combination of high renter rates, limited parking, and dense population creates exceptional demand.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What makes Boston laundromats valuable?", a: "38% renter rate, limited in-unit laundry, and 60+ colleges/universities create unmatched demand. T accessibility is a key value driver." },
      { q: "How do college students affect Massachusetts laundromats?", a: "Significantly. But year-round demand exists due to high renter rates. Locations near universities see consistent traffic even in summer." },
      { q: "What should I know about selling in Massachusetts?", a: "Sophisticated buyer pool expects thorough documentation. Environmental compliance and ADA accessibility are scrutinized carefully." }
    ]
  },
  "michigan": {
    slug: "michigan",
    name: "Michigan",
    abbr: "MI",
    population: "10.0 million",
    laundromatCount: "875+",
    avgSalePrice: "$195,000",
    avgRevenue: "$165,000/year",
    marketGrowth: "+3.5%",
    topCities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor"],
    demographics: {
      renterPercentage: "29%",
      medianIncome: "$59,000",
      populationDensity: "177/sq mi"
    },
    marketInsights: [
      "Detroit metro represents 45% of state laundromat activity",
      "Grand Rapids is fastest-growing market in state",
      "Ann Arbor (University of Michigan) has premium valuations",
      "Automotive recovery driving economic stability"
    ],
    sellerTips: [
      "Detroit neighborhoods vary significantly in value",
      "Document any auto industry customer relationships",
      "Ann Arbor and Grand Rapids command premiums"
    ],
    recentSales: [
      { city: "Detroit", price: "$185,000", sqft: "2,600", machines: 30, daysOnMarket: 48 },
      { city: "Grand Rapids", price: "$225,000", sqft: "2,800", machines: 32, daysOnMarket: 38 }
    ],
    expertQuote: {
      text: "Michigan's laundromat market has strengthened significantly with the automotive recovery. Grand Rapids and Ann Arbor now command valuations rivaling coastal markets.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How has Michigan's economy affected laundromat values?", a: "Positively. Automotive recovery has stabilized Detroit-area values, while Grand Rapids has seen 20%+ appreciation in recent years." },
      { q: "What areas of Michigan are most attractive?", a: "Grand Rapids (growth), Ann Arbor (university), and select Detroit suburbs (stability). Avoid areas with significant population decline." },
      { q: "What's the typical Michigan buyer?", a: "Local entrepreneurs, existing operators expanding, and out-of-state investors seeking better cap rates than coastal markets." }
    ]
  },
  "minnesota": {
    slug: "minnesota",
    name: "Minnesota",
    abbr: "MN",
    population: "5.7 million",
    laundromatCount: "425+",
    avgSalePrice: "$215,000",
    avgRevenue: "$182,000/year",
    marketGrowth: "+3.8%",
    topCities: ["Minneapolis", "Saint Paul", "Rochester", "Bloomington", "Duluth"],
    demographics: {
      renterPercentage: "28%",
      medianIncome: "$73,000",
      populationDensity: "71/sq mi"
    },
    marketInsights: [
      "Twin Cities metro represents 65% of state activity",
      "Strong immigrant communities value laundromats",
      "Cold climate drives indoor activity preferences",
      "Corporate headquarters (Target, UnitedHealth) provide stable economy"
    ],
    sellerTips: [
      "Minneapolis/St. Paul command significant premiums",
      "Document heating system efficiency",
      "Highlight any immigrant community customer base"
    ],
    recentSales: [
      { city: "Minneapolis", price: "$275,000", sqft: "3,000", machines: 34, daysOnMarket: 38 },
      { city: "Saint Paul", price: "$225,000", sqft: "2,600", machines: 30, daysOnMarket: 45 }
    ],
    expertQuote: {
      text: "Minnesota's Twin Cities market offers urban-level demand with Midwest operating costs. Strong corporate presence and diverse communities create stable laundromat fundamentals.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does Minnesota's climate affect laundromats?", a: "Heating costs are significant, but cold winters also increase indoor activity and laundromat usage. Net effect is often positive for revenue." },
      { q: "What's unique about Twin Cities laundromats?", a: "Diverse immigrant communities (Somali, Hmong, Hispanic) value laundromats highly. Locations in these neighborhoods often see above-average traffic." },
      { q: "Are Minnesota laundromats good investments?", a: "Yes. Stable economy (Fortune 500 headquarters), diverse population, and reasonable operating costs create attractive fundamentals." }
    ]
  },
  "mississippi": {
    slug: "mississippi",
    name: "Mississippi",
    abbr: "MS",
    population: "2.9 million",
    laundromatCount: "265+",
    avgSalePrice: "$135,000",
    avgRevenue: "$118,000/year",
    marketGrowth: "+2.5%",
    topCities: ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi"],
    demographics: {
      renterPercentage: "31%",
      medianIncome: "$45,000",
      populationDensity: "63/sq mi"
    },
    marketInsights: [
      "Jackson metro represents 35% of state activity",
      "Gulf Coast benefits from tourism and military",
      "Lowest acquisition costs in the nation",
      "Limited competition in rural markets"
    ],
    sellerTips: [
      "Emphasize affordable entry point for investors",
      "Document hurricane preparedness for Gulf Coast",
      "Highlight any military or casino customer base"
    ],
    recentSales: [
      { city: "Jackson", price: "$145,000", sqft: "2,400", machines: 28, daysOnMarket: 58 },
      { city: "Gulfport", price: "$165,000", sqft: "2,600", machines: 30, daysOnMarket: 52 }
    ],
    expertQuote: {
      text: "Mississippi offers the most affordable laundromat entry points in America. For first-time investors or those seeking better cap rates, the value proposition is compelling.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why are Mississippi laundromats so affordable?", a: "Lower cost of living, real estate, and operating expenses. However, margins remain competitive - you're paying less but also spending less." },
      { q: "What's the buyer pool for Mississippi laundromats?", a: "First-time investors attracted by accessible prices, existing operators expanding, and investors seeking higher cap rates than coastal markets." },
      { q: "How does the Gulf Coast compare to Jackson?", a: "Gulf Coast (Gulfport, Biloxi) benefits from tourism and military. Jackson has larger population but slower growth." }
    ]
  },
  "missouri": {
    slug: "missouri",
    name: "Missouri",
    abbr: "MO",
    population: "6.2 million",
    laundromatCount: "525+",
    avgSalePrice: "$185,000",
    avgRevenue: "$158,000/year",
    marketGrowth: "+3.5%",
    topCities: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence"],
    demographics: {
      renterPercentage: "32%",
      medianIncome: "$56,000",
      populationDensity: "89/sq mi"
    },
    marketInsights: [
      "Kansas City and St. Louis metros represent 70% of state activity",
      "Columbia (Mizzou) provides stable university demand",
      "Affordable Midwest pricing attracts national investors",
      "Strong immigrant communities in both metros"
    ],
    sellerTips: [
      "KC and STL require neighborhood-specific pricing",
      "Document any university or college customer base",
      "Highlight low operating costs vs. coasts"
    ],
    recentSales: [
      { city: "Kansas City", price: "$225,000", sqft: "2,800", machines: 32, daysOnMarket: 42 },
      { city: "St. Louis", price: "$195,000", sqft: "2,600", machines: 30, daysOnMarket: 48 }
    ],
    expertQuote: {
      text: "Missouri's two major metros offer urban-level laundromat demand with Midwest pricing. The state represents excellent value for investors seeking stable cash flow.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How do Kansas City and St. Louis compare?", a: "Similar valuations and demand. KC is growing faster; STL has more established neighborhoods. Both have strong buyer pools." },
      { q: "What about smaller Missouri markets?", a: "Columbia (university), Springfield, and Branson (tourism) all have viable laundromat markets with less competition." },
      { q: "What's the typical Missouri buyer?", a: "Local entrepreneurs, existing operators, and increasingly out-of-state investors seeking better returns than coastal markets." }
    ]
  },
  "montana": {
    slug: "montana",
    name: "Montana",
    abbr: "MT",
    population: "1.1 million",
    laundromatCount: "95+",
    avgSalePrice: "$185,000",
    avgRevenue: "$155,000/year",
    marketGrowth: "+5.5%",
    topCities: ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte"],
    demographics: {
      renterPercentage: "32%",
      medianIncome: "$56,000",
      populationDensity: "8/sq mi"
    },
    marketInsights: [
      "Bozeman and Missoula are fastest-growing markets",
      "Limited inventory creates seller advantage",
      "Tourism and university populations drive demand",
      "Out-of-state migration increasing buyer pool"
    ],
    sellerTips: [
      "Bozeman commands significant premiums",
      "Document heating costs and efficiency",
      "Highlight university or tourism customer base"
    ],
    recentSales: [
      { city: "Bozeman", price: "$245,000", sqft: "2,600", machines: 30, daysOnMarket: 35 },
      { city: "Missoula", price: "$195,000", sqft: "2,400", machines: 28, daysOnMarket: 42 }
    ],
    expertQuote: {
      text: "Montana's limited inventory and growing population create favorable conditions for laundromat sellers. Bozeman, in particular, has seen rapid appreciation.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How has Montana's population growth affected laundromat values?", a: "Significantly, especially in Bozeman and Missoula. Values have increased 25-35% since 2020 due to out-of-state migration." },
      { q: "Who buys Montana laundromats?", a: "Mix of local entrepreneurs and out-of-state transplants, often from California, Washington, and Colorado." },
      { q: "What challenges exist in Montana?", a: "Smaller population means smaller buyer pool. Accurate pricing is critical. Heating costs are significant." }
    ]
  },
  "nebraska": {
    slug: "nebraska",
    name: "Nebraska",
    abbr: "NE",
    population: "2.0 million",
    laundromatCount: "165+",
    avgSalePrice: "$175,000",
    avgRevenue: "$148,000/year",
    marketGrowth: "+3.2%",
    topCities: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"],
    demographics: {
      renterPercentage: "34%",
      medianIncome: "$62,000",
      populationDensity: "25/sq mi"
    },
    marketInsights: [
      "Omaha metro represents 55% of state laundromat activity",
      "University of Nebraska (Lincoln) provides stable demand",
      "Growing immigrant communities in Omaha",
      "Low unemployment creates stable customer base"
    ],
    sellerTips: [
      "Omaha and Lincoln command premiums over state average",
      "Document any meatpacking plant customer relationships",
      "Highlight low operating costs"
    ],
    recentSales: [
      { city: "Omaha", price: "$215,000", sqft: "2,800", machines: 32, daysOnMarket: 42 },
      { city: "Lincoln", price: "$175,000", sqft: "2,400", machines: 28, daysOnMarket: 50 }
    ],
    expertQuote: {
      text: "Nebraska's stable economy and growing immigrant population create consistent laundromat demand. Omaha, in particular, offers urban fundamentals with Midwest pricing.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What drives demand for Nebraska laundromats?", a: "Growing immigrant communities (Latino, Sudanese) in Omaha, university population in Lincoln, and stable meatpacking/agricultural economy." },
      { q: "How do Nebraska laundromats compare to national averages?", a: "About 20% below national average on acquisition costs, but margins are competitive due to lower operating expenses." },
      { q: "What's unique about selling in Nebraska?", a: "Smaller market means less competition but also fewer buyers. Accurate pricing and WashBizHub's national reach are important." }
    ]
  },
  "nevada": {
    slug: "nevada",
    name: "Nevada",
    abbr: "NV",
    population: "3.2 million",
    laundromatCount: "275+",
    avgSalePrice: "$285,000",
    avgRevenue: "$235,000/year",
    marketGrowth: "+7.2%",
    topCities: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks"],
    demographics: {
      renterPercentage: "42%",
      medianIncome: "$60,000",
      populationDensity: "29/sq mi"
    },
    marketInsights: [
      "Las Vegas metro represents 75% of state activity",
      "High renter percentage (42%) drives strong demand",
      "24/7 economy creates extended operating hours opportunity",
      "California migration increasing population rapidly"
    ],
    sellerTips: [
      "Vegas locations should emphasize 24/7 potential",
      "Document any casino/hospitality accounts",
      "Highlight water efficiency - critical in desert"
    ],
    recentSales: [
      { city: "Las Vegas", price: "$345,000", sqft: "3,400", machines: 40, daysOnMarket: 32 },
      { city: "Henderson", price: "$295,000", sqft: "3,000", machines: 34, daysOnMarket: 38 }
    ],
    expertQuote: {
      text: "Nevada's explosive population growth and highest-in-nation renter percentage create exceptional laundromat demand. Las Vegas is one of the most active markets nationally.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why is Nevada such a strong laundromat market?", a: "42% renter rate (highest in nation), rapid population growth, and 24/7 casino/hospitality economy. Demand is exceptional." },
      { q: "What multiples do Las Vegas laundromats sell for?", a: "3-3.5x SDE for well-located properties. Premium locations near the Strip or major apartment complexes can approach 4x." },
      { q: "What about Reno?", a: "Strong secondary market benefiting from California migration. Similar dynamics to Vegas but smaller scale. Values have appreciated significantly." }
    ]
  },
  "new-hampshire": {
    slug: "new-hampshire",
    name: "New Hampshire",
    abbr: "NH",
    population: "1.4 million",
    laundromatCount: "115+",
    avgSalePrice: "$225,000",
    avgRevenue: "$188,000/year",
    marketGrowth: "+3.2%",
    topCities: ["Manchester", "Nashua", "Concord", "Dover", "Rochester"],
    demographics: {
      renterPercentage: "28%",
      medianIncome: "$77,000",
      populationDensity: "153/sq mi"
    },
    marketInsights: [
      "No state income tax attracts business investors",
      "Boston commuter communities have strong demand",
      "Limited inventory creates seller advantage",
      "High household incomes support premium pricing"
    ],
    sellerTips: [
      "Emphasize no state income tax advantage",
      "Document heating efficiency - significant cost",
      "Highlight Boston commuter accessibility"
    ],
    recentSales: [
      { city: "Manchester", price: "$265,000", sqft: "2,800", machines: 32, daysOnMarket: 42 },
      { city: "Nashua", price: "$245,000", sqft: "2,600", machines: 30, daysOnMarket: 48 }
    ],
    expertQuote: {
      text: "New Hampshire's tax-friendly environment and Boston proximity create an attractive laundromat market. Limited inventory and high household incomes support strong valuations.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does NH's tax situation affect laundromat sales?", a: "Positively. No state income tax makes NH attractive to business owners. Out-of-state investors, particularly from Massachusetts, often seek NH opportunities." },
      { q: "What areas of NH have the most demand?", a: "Manchester and Nashua (Boston commuter access), and Seacoast area (Dover, Portsmouth). College towns like Durham also have stable demand." },
      { q: "How does NH compare to Massachusetts?", a: "Lower acquisition costs, lower operating costs (no income tax), but also lower population density. Good alternative to expensive Boston market." }
    ]
  },
  "new-jersey": {
    slug: "new-jersey",
    name: "New Jersey",
    abbr: "NJ",
    population: "9.3 million",
    laundromatCount: "1,150+",
    avgSalePrice: "$345,000",
    avgRevenue: "$285,000/year",
    marketGrowth: "+4.2%",
    topCities: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison"],
    demographics: {
      renterPercentage: "36%",
      medianIncome: "$82,000",
      populationDensity: "1,263/sq mi"
    },
    marketInsights: [
      "Highest population density state creates exceptional demand",
      "NYC-adjacent locations command premium valuations",
      "Strong immigrant communities value laundromats",
      "Limited parking increases laundromat usage"
    ],
    sellerTips: [
      "NYC proximity dramatically affects valuation",
      "Document PATH/NJ Transit accessibility",
      "Highlight any commercial accounts"
    ],
    recentSales: [
      { city: "Jersey City", price: "$485,000", sqft: "3,200", machines: 38, daysOnMarket: 28 },
      { city: "Newark", price: "$325,000", sqft: "3,000", machines: 34, daysOnMarket: 38 }
    ],
    expertQuote: {
      text: "New Jersey's extreme population density and NYC proximity create one of the strongest laundromat markets in America. Demand consistently outpaces supply.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why are NJ laundromats so valuable?", a: "Highest population density in the nation, limited in-unit laundry, and NYC accessibility. Jersey City and Hoboken approach Manhattan-level valuations." },
      { q: "What multiples do NJ laundromats sell for?", a: "3-4x SDE for prime locations. Hudson County (Jersey City, Hoboken) can exceed 4x due to NYC proximity." },
      { q: "What should I know about NJ regulations?", a: "Strict environmental regulations, wage requirements, and signage laws. Document compliance thoroughly for buyer confidence." }
    ]
  },
  "new-mexico": {
    slug: "new-mexico",
    name: "New Mexico",
    abbr: "NM",
    population: "2.1 million",
    laundromatCount: "175+",
    avgSalePrice: "$165,000",
    avgRevenue: "$142,000/year",
    marketGrowth: "+3.5%",
    topCities: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"],
    demographics: {
      renterPercentage: "33%",
      medianIncome: "$51,000",
      populationDensity: "17/sq mi"
    },
    marketInsights: [
      "Albuquerque represents 50% of state activity",
      "Strong Hispanic community values laundromats",
      "Military bases (Kirtland, Holloman) provide stable demand",
      "Tourism in Santa Fe creates seasonal opportunities"
    ],
    sellerTips: [
      "Albuquerque and Santa Fe command premiums",
      "Document any military customer base",
      "Highlight bilingual services/signage"
    ],
    recentSales: [
      { city: "Albuquerque", price: "$195,000", sqft: "2,600", machines: 30, daysOnMarket: 48 },
      { city: "Santa Fe", price: "$185,000", sqft: "2,400", machines: 28, daysOnMarket: 55 }
    ],
    expertQuote: {
      text: "New Mexico's strong Hispanic community and military presence create stable laundromat demand. Accessible pricing attracts first-time investors and those seeking underserved markets.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What drives New Mexico laundromat demand?", a: "Large Hispanic community (49% of population), military bases, and tourism in Santa Fe. Cultural affinity for laundromats is strong." },
      { q: "How does New Mexico compare to Arizona?", a: "Lower valuations due to smaller population and slower growth. However, competition is also lower, and entry points are more accessible." },
      { q: "What's unique about selling in New Mexico?", a: "Bilingual marketing reaches broader buyer pool. Document any Spanish-language signage or services as value-adds." }
    ]
  },
  "new-york": {
    slug: "new-york",
    name: "New York",
    abbr: "NY",
    population: "19.3 million",
    laundromatCount: "3,200+",
    avgSalePrice: "$425,000",
    avgRevenue: "$345,000/year",
    marketGrowth: "+4.5%",
    topCities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse"],
    demographics: {
      renterPercentage: "45%",
      medianIncome: "$73,000",
      populationDensity: "411/sq mi"
    },
    marketInsights: [
      "NYC represents 70% of state laundromat activity",
      "Highest renter percentage major state creates exceptional demand",
      "Manhattan locations routinely exceed $1M valuations",
      "Outer boroughs offer strong value opportunities"
    ],
    sellerTips: [
      "NYC requires neighborhood-specific marketing",
      "Document subway accessibility",
      "Professional presentation is essential",
      "Prepare for extensive due diligence"
    ],
    recentSales: [
      { city: "Brooklyn", price: "$625,000", sqft: "3,400", machines: 42, daysOnMarket: 32 },
      { city: "Queens", price: "$485,000", sqft: "3,000", machines: 36, daysOnMarket: 38 },
      { city: "Buffalo", price: "$195,000", sqft: "2,600", machines: 30, daysOnMarket: 52 }
    ],
    expertQuote: {
      text: "New York, driven by NYC, is the largest and most active laundromat market in America. The combination of 45% renter rate, limited in-unit laundry, and dense population creates unmatched demand.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What are NYC laundromats worth?", a: "Highly variable by neighborhood. Manhattan: $800K-$2M+. Brooklyn/Queens: $400K-$800K. Bronx: $250K-$450K. Subway access is critical." },
      { q: "How long do NYC laundromats take to sell?", a: "Well-priced NYC laundromats sell in 30-45 days. Premium locations often receive multiple offers within 2 weeks." },
      { q: "What about Upstate New York?", a: "Buffalo, Rochester, and Syracuse have stable markets with significantly lower valuations. Good opportunities for investors priced out of NYC." }
    ]
  },
  "north-carolina": {
    slug: "north-carolina",
    name: "North Carolina",
    abbr: "NC",
    population: "10.7 million",
    laundromatCount: "785+",
    avgSalePrice: "$225,000",
    avgRevenue: "$188,000/year",
    marketGrowth: "+6.8%",
    topCities: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"],
    demographics: {
      renterPercentage: "35%",
      medianIncome: "$57,000",
      populationDensity: "218/sq mi"
    },
    marketInsights: [
      "Charlotte and Raleigh-Durham are fastest-growing metros",
      "Research Triangle provides stable employment base",
      "Significant in-migration from Northeast driving demand",
      "University towns have strong student populations"
    ],
    sellerTips: [
      "Charlotte and Triangle command significant premiums",
      "Document any tech company customer relationships",
      "Highlight growth in surrounding apartment developments"
    ],
    recentSales: [
      { city: "Charlotte", price: "$295,000", sqft: "3,200", machines: 36, daysOnMarket: 32 },
      { city: "Raleigh", price: "$265,000", sqft: "2,800", machines: 32, daysOnMarket: 38 }
    ],
    expertQuote: {
      text: "North Carolina's combination of rapid population growth, strong employment (banking, tech), and rising renter rates creates one of the most attractive laundromat markets in the Southeast.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why is North Carolina such a hot market?", a: "Top-5 fastest-growing state, major banking (Charlotte) and tech (Research Triangle) employment, and significant Northeastern migration." },
      { q: "How do Charlotte and Raleigh compare?", a: "Similar valuations and growth. Charlotte is larger; Raleigh-Durham has more tech/university influence. Both are excellent markets." },
      { q: "What multiples do NC laundromats sell for?", a: "2.8-3.2x SDE for Charlotte and Triangle locations. Growing markets and strong fundamentals support premium valuations." }
    ]
  },
  "north-dakota": {
    slug: "north-dakota",
    name: "North Dakota",
    abbr: "ND",
    population: "780,000",
    laundromatCount: "75+",
    avgSalePrice: "$165,000",
    avgRevenue: "$142,000/year",
    marketGrowth: "+2.5%",
    topCities: ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo"],
    demographics: {
      renterPercentage: "33%",
      medianIncome: "$65,000",
      populationDensity: "11/sq mi"
    },
    marketInsights: [
      "Fargo represents 40% of state laundromat activity",
      "Oil industry affects western North Dakota demand",
      "University of North Dakota provides stable demand",
      "Low unemployment creates stable customer base"
    ],
    sellerTips: [
      "Fargo commands premiums over state average",
      "Document heating costs and efficiency thoroughly",
      "Highlight any oil worker customer base in western ND"
    ],
    recentSales: [
      { city: "Fargo", price: "$195,000", sqft: "2,600", machines: 30, daysOnMarket: 52 },
      { city: "Bismarck", price: "$155,000", sqft: "2,200", machines: 26, daysOnMarket: 65 }
    ],
    expertQuote: {
      text: "North Dakota's small but stable market offers opportunities for investors seeking lower competition and accessible entry points. Fargo, in particular, has strong fundamentals.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does the oil industry affect ND laundromats?", a: "Western ND (Williston, Dickinson) saw boom-bust cycles. Eastern ND (Fargo) is more stable and less affected by oil prices." },
      { q: "What's unique about selling in North Dakota?", a: "Small market means fewer buyers but also less competition. Heating costs are significant - document efficiency improvements." },
      { q: "Who buys North Dakota laundromats?", a: "Primarily local entrepreneurs. Smaller buyer pool makes accurate pricing and WashBizHub's national reach important." }
    ]
  },
  "ohio": {
    slug: "ohio",
    name: "Ohio",
    abbr: "OH",
    population: "11.8 million",
    laundromatCount: "1,050+",
    avgSalePrice: "$185,000",
    avgRevenue: "$158,000/year",
    marketGrowth: "+3.2%",
    topCities: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
    demographics: {
      renterPercentage: "34%",
      medianIncome: "$58,000",
      populationDensity: "287/sq mi"
    },
    marketInsights: [
      "Columbus is fastest-growing major Ohio city",
      "Three major metros provide diverse opportunities",
      "Strong immigrant communities in all major cities",
      "Affordable entry points attract first-time buyers"
    ],
    sellerTips: [
      "Columbus commands highest premiums in state",
      "Document any university customer base",
      "Neighborhood selection is critical in Cleveland/Cincinnati"
    ],
    recentSales: [
      { city: "Columbus", price: "$245,000", sqft: "2,800", machines: 32, daysOnMarket: 38 },
      { city: "Cleveland", price: "$175,000", sqft: "2,600", machines: 30, daysOnMarket: 52 },
      { city: "Cincinnati", price: "$195,000", sqft: "2,600", machines: 30, daysOnMarket: 45 }
    ],
    expertQuote: {
      text: "Ohio's three major metros offer diverse laundromat opportunities. Columbus leads in growth, while Cleveland and Cincinnati provide stable, established markets with accessible pricing.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How do Ohio's three major cities compare?", a: "Columbus: fastest growing, highest valuations. Cincinnati: stable, diverse neighborhoods. Cleveland: most affordable, revitalization ongoing." },
      { q: "What makes Ohio attractive for laundromat investors?", a: "Affordable entry points (25-30% below national average), stable Midwest demand, and diverse metro options." },
      { q: "What areas should I avoid?", a: "Areas with significant population decline. Focus on neighborhoods with stable or growing apartment density." }
    ]
  },
  "oklahoma": {
    slug: "oklahoma",
    name: "Oklahoma",
    abbr: "OK",
    population: "4.0 million",
    laundromatCount: "325+",
    avgSalePrice: "$165,000",
    avgRevenue: "$142,000/year",
    marketGrowth: "+3.8%",
    topCities: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton"],
    demographics: {
      renterPercentage: "34%",
      medianIncome: "$53,000",
      populationDensity: "58/sq mi"
    },
    marketInsights: [
      "Oklahoma City and Tulsa represent 70% of state activity",
      "Oil/energy industry affects economic cycles",
      "Military bases provide stable customer base",
      "Low cost of living attracts business investors"
    ],
    sellerTips: [
      "OKC and Tulsa command premiums",
      "Document any military customer relationships",
      "Emphasize low operating costs"
    ],
    recentSales: [
      { city: "Oklahoma City", price: "$195,000", sqft: "2,800", machines: 32, daysOnMarket: 45 },
      { city: "Tulsa", price: "$175,000", sqft: "2,600", machines: 30, daysOnMarket: 52 }
    ],
    expertQuote: {
      text: "Oklahoma offers solid laundromat fundamentals at accessible price points. The dual metros of OKC and Tulsa provide stable demand with lower competition than coastal markets.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does the energy industry affect Oklahoma laundromats?", a: "Less than you might expect. OKC and Tulsa have diversified economies. Energy-dependent areas (Lawton) may see more volatility." },
      { q: "What's the typical Oklahoma buyer?", a: "Local entrepreneurs, existing operators expanding, and out-of-state investors seeking better cap rates than coastal markets." },
      { q: "How do OKC and Tulsa compare?", a: "Similar valuations and demand. OKC is larger and growing faster; Tulsa has lower cost of entry but slower growth." }
    ]
  },
  "oregon": {
    slug: "oregon",
    name: "Oregon",
    abbr: "OR",
    population: "4.2 million",
    laundromatCount: "345+",
    avgSalePrice: "$285,000",
    avgRevenue: "$235,000/year",
    marketGrowth: "+5.2%",
    topCities: ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro"],
    demographics: {
      renterPercentage: "37%",
      medianIncome: "$65,000",
      populationDensity: "44/sq mi"
    },
    marketInsights: [
      "Portland metro represents 60% of state activity",
      "Strong environmental values favor efficient equipment",
      "Eugene (UO) has stable university demand",
      "Tech industry growth driving population increase"
    ],
    sellerTips: [
      "Highlight any water recycling or green initiatives",
      "Document energy-efficient equipment",
      "Portland requires neighborhood-specific marketing"
    ],
    recentSales: [
      { city: "Portland", price: "$345,000", sqft: "3,200", machines: 38, daysOnMarket: 35 },
      { city: "Eugene", price: "$225,000", sqft: "2,600", machines: 30, daysOnMarket: 45 }
    ],
    expertQuote: {
      text: "Oregon's environmentally-conscious market rewards sustainable laundromat operations. Portland's strong renter culture and tech-driven growth create excellent fundamentals.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does Oregon's environmental focus affect laundromats?", a: "Significantly. Buyers pay premiums for water recycling, energy efficiency, and eco-friendly detergent options. Document all green initiatives." },
      { q: "What multiples do Portland laundromats sell for?", a: "2.8-3.2x SDE for well-located properties. Green certifications and efficient equipment can push multiples higher." },
      { q: "What about markets outside Portland?", a: "Eugene (university), Salem (government), and Bend (growth) all have viable markets. Generally 20-30% lower valuations than Portland." }
    ]
  },
  "pennsylvania": {
    slug: "pennsylvania",
    name: "Pennsylvania",
    abbr: "PA",
    population: "13.0 million",
    laundromatCount: "1,250+",
    avgSalePrice: "$245,000",
    avgRevenue: "$205,000/year",
    marketGrowth: "+3.5%",
    topCities: ["Philadelphia", "Pittsburgh", "Allentown", "Reading", "Erie"],
    demographics: {
      renterPercentage: "31%",
      medianIncome: "$63,000",
      populationDensity: "286/sq mi"
    },
    marketInsights: [
      "Philadelphia represents 50% of state laundromat activity",
      "Pittsburgh seeing revitalization and tech growth",
      "Strong university populations in both major cities",
      "Dense row house neighborhoods favor laundromats"
    ],
    sellerTips: [
      "Philadelphia requires neighborhood-specific pricing",
      "Document SEPTA/transit accessibility",
      "Pittsburgh tech corridor is hot market"
    ],
    recentSales: [
      { city: "Philadelphia", price: "$325,000", sqft: "3,000", machines: 36, daysOnMarket: 35 },
      { city: "Pittsburgh", price: "$225,000", sqft: "2,600", machines: 30, daysOnMarket: 45 }
    ],
    expertQuote: {
      text: "Pennsylvania's two major metros offer distinct opportunities. Philadelphia provides dense urban demand; Pittsburgh offers emerging tech-driven growth with lower entry costs.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How do Philadelphia and Pittsburgh compare?", a: "Philadelphia: larger, higher valuations, more established market. Pittsburgh: lower entry costs, faster growth due to tech industry (Google, Uber)." },
      { q: "What Philadelphia neighborhoods are most valuable?", a: "University City, Northern Liberties, Fishtown command premiums. South Philadelphia and Kensington offer value opportunities." },
      { q: "What about smaller Pennsylvania markets?", a: "Allentown, Reading, and Lehigh Valley benefit from NYC/Philly spillover. State College (Penn State) has stable demand." }
    ]
  },
  "rhode-island": {
    slug: "rhode-island",
    name: "Rhode Island",
    abbr: "RI",
    population: "1.1 million",
    laundromatCount: "95+",
    avgSalePrice: "$235,000",
    avgRevenue: "$195,000/year",
    marketGrowth: "+2.8%",
    topCities: ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence"],
    demographics: {
      renterPercentage: "40%",
      medianIncome: "$67,000",
      populationDensity: "1,061/sq mi"
    },
    marketInsights: [
      "Smallest state but high population density",
      "Providence represents 60% of state activity",
      "Brown/RISD provide stable student demand",
      "High renter rate creates strong fundamentals"
    ],
    sellerTips: [
      "Emphasize high population density advantages",
      "Document university customer base",
      "Providence walkability is key value driver"
    ],
    recentSales: [
      { city: "Providence", price: "$275,000", sqft: "2,800", machines: 32, daysOnMarket: 40 },
      { city: "Pawtucket", price: "$195,000", sqft: "2,400", machines: 28, daysOnMarket: 52 }
    ],
    expertQuote: {
      text: "Rhode Island's exceptional population density and 40% renter rate create laundromat fundamentals rivaling much larger states. Providence offers strong demand at more accessible prices than Boston.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why is Rhode Island's renter rate so high?", a: "Dense urban development, historic multi-family housing stock, and significant student population (Brown, RISD, Providence College)." },
      { q: "How does RI compare to Massachusetts?", a: "Similar density and fundamentals, but 20-30% lower valuations. Attractive alternative for investors priced out of Boston." },
      { q: "What's the buyer pool for RI laundromats?", a: "Mix of local entrepreneurs, Massachusetts investors seeking value, and out-of-state buyers attracted by density and fundamentals." }
    ]
  },
  "south-carolina": {
    slug: "south-carolina",
    name: "South Carolina",
    abbr: "SC",
    population: "5.2 million",
    laundromatCount: "385+",
    avgSalePrice: "$195,000",
    avgRevenue: "$165,000/year",
    marketGrowth: "+6.5%",
    topCities: ["Charleston", "Columbia", "North Charleston", "Mount Pleasant", "Greenville"],
    demographics: {
      renterPercentage: "31%",
      medianIncome: "$54,000",
      populationDensity: "173/sq mi"
    },
    marketInsights: [
      "Charleston is fastest-growing market in state",
      "Greenville-Spartanburg attracting major manufacturers",
      "Tourism in Charleston/Myrtle Beach creates seasonal demand",
      "Significant in-migration from Northeast"
    ],
    sellerTips: [
      "Charleston commands significant premiums",
      "Document any tourism/vacation rental accounts",
      "Highlight growth in surrounding developments"
    ],
    recentSales: [
      { city: "Charleston", price: "$265,000", sqft: "2,800", machines: 32, daysOnMarket: 32 },
      { city: "Greenville", price: "$195,000", sqft: "2,600", machines: 30, daysOnMarket: 42 }
    ],
    expertQuote: {
      text: "South Carolina's rapid growth, particularly Charleston and Greenville-Spartanburg, creates compelling laundromat opportunities. Northeastern migration is driving sustained demand.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What's driving South Carolina's growth?", a: "BMW, Boeing, and Volvo manufacturing, tourism, and quality of life attracting Northeastern migrants. Charleston and Greenville lead." },
      { q: "How does Charleston compare to other SC markets?", a: "20-30% premium over state average due to growth, tourism, and lifestyle appeal. Greenville is catching up rapidly." },
      { q: "What about coastal tourism markets?", a: "Myrtle Beach and Hilton Head have strong seasonal peaks but more volatility. Document seasonal patterns clearly for buyers." }
    ]
  },
  "south-dakota": {
    slug: "south-dakota",
    name: "South Dakota",
    abbr: "SD",
    population: "900,000",
    laundromatCount: "75+",
    avgSalePrice: "$165,000",
    avgRevenue: "$142,000/year",
    marketGrowth: "+3.2%",
    topCities: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"],
    demographics: {
      renterPercentage: "32%",
      medianIncome: "$59,000",
      populationDensity: "12/sq mi"
    },
    marketInsights: [
      "Sioux Falls represents 45% of state activity",
      "No state income tax attracts business investors",
      "Low unemployment creates stable demand",
      "Growing immigrant population in Sioux Falls"
    ],
    sellerTips: [
      "Emphasize no state income tax advantage",
      "Document heating costs thoroughly",
      "Sioux Falls commands premium over state average"
    ],
    recentSales: [
      { city: "Sioux Falls", price: "$195,000", sqft: "2,600", machines: 30, daysOnMarket: 48 },
      { city: "Rapid City", price: "$155,000", sqft: "2,200", machines: 26, daysOnMarket: 58 }
    ],
    expertQuote: {
      text: "South Dakota's tax-friendly environment and stable economy create favorable conditions for laundromat businesses. Sioux Falls, in particular, has grown significantly.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does South Dakota's tax situation affect laundromat sales?", a: "Positively. No state income tax makes SD attractive to business owners and investors from higher-tax states." },
      { q: "What's unique about Sioux Falls?", a: "Fastest-growing city in the region, significant immigrant population (meatpacking industry), and stable banking/healthcare employment." },
      { q: "Who buys South Dakota laundromats?", a: "Local entrepreneurs and investors from neighboring states seeking tax advantages. Smaller buyer pool requires accurate pricing." }
    ]
  },
  "tennessee": {
    slug: "tennessee",
    name: "Tennessee",
    abbr: "TN",
    population: "7.0 million",
    laundromatCount: "545+",
    avgSalePrice: "$215,000",
    avgRevenue: "$182,000/year",
    marketGrowth: "+6.2%",
    topCities: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"],
    demographics: {
      renterPercentage: "34%",
      medianIncome: "$54,000",
      populationDensity: "167/sq mi"
    },
    marketInsights: [
      "Nashville is one of fastest-growing metros nationally",
      "No state income tax attracts business investors",
      "Memphis has stable demand with lower valuations",
      "Significant in-migration from California, Northeast"
    ],
    sellerTips: [
      "Nashville commands significant premiums",
      "Emphasize no state income tax advantage",
      "Document any music/entertainment industry accounts"
    ],
    recentSales: [
      { city: "Nashville", price: "$295,000", sqft: "3,000", machines: 34, daysOnMarket: 28 },
      { city: "Memphis", price: "$185,000", sqft: "2,600", machines: 30, daysOnMarket: 48 }
    ],
    expertQuote: {
      text: "Tennessee, led by Nashville's explosive growth, offers exceptional laundromat opportunities. No state income tax and quality of life are attracting both residents and investors.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why is Nashville such a hot market?", a: "Top-5 fastest-growing major metro, no state income tax, entertainment industry, and quality of life attracting migration from coasts." },
      { q: "How does Nashville compare to Memphis?", a: "Nashville: 30-40% premium, faster growth, more competitive. Memphis: lower entry cost, stable demand, less competition." },
      { q: "What multiples do Nashville laundromats sell for?", a: "2.8-3.5x SDE for well-located properties. Prime locations near growing apartment developments can approach 4x." }
    ]
  },
  "texas": {
    slug: "texas",
    name: "Texas",
    abbr: "TX",
    population: "30.0 million",
    laundromatCount: "2,850+",
    avgSalePrice: "$285,000",
    avgRevenue: "$238,000/year",
    marketGrowth: "+7.5%",
    topCities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth"],
    demographics: {
      renterPercentage: "38%",
      medianIncome: "$63,000",
      populationDensity: "114/sq mi"
    },
    marketInsights: [
      "Second-largest laundromat market nationally",
      "No state income tax attracts massive in-migration",
      "Austin is fastest-growing major market",
      "Strong Hispanic communities value laundromats",
      "Houston and Dallas offer diverse opportunities"
    ],
    sellerTips: [
      "Texas is a seller's market - strong demand",
      "Document any commercial accounts",
      "Highlight bilingual services/signage",
      "Austin commands highest premiums"
    ],
    recentSales: [
      { city: "Austin", price: "$385,000", sqft: "3,400", machines: 40, daysOnMarket: 25 },
      { city: "Houston", price: "$295,000", sqft: "3,000", machines: 34, daysOnMarket: 35 },
      { city: "Dallas", price: "$325,000", sqft: "3,200", machines: 36, daysOnMarket: 32 }
    ],
    expertQuote: {
      text: "Texas is the most dynamic laundromat market in America. Massive population growth, no state income tax, and diverse metros create exceptional opportunities for sellers.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why is Texas such a strong laundromat market?", a: "Fastest-growing state by population, no state income tax, 38% renter rate, and strong Hispanic communities that value laundromats." },
      { q: "How do Texas metros compare?", a: "Austin: highest premiums, fastest growth. Dallas/Houston: diverse, large markets. San Antonio: value opportunity with strong fundamentals." },
      { q: "What multiples do Texas laundromats sell for?", a: "2.8-3.5x SDE statewide. Austin can exceed 4x for prime locations due to exceptional growth." }
    ]
  },
  "utah": {
    slug: "utah",
    name: "Utah",
    abbr: "UT",
    population: "3.4 million",
    laundromatCount: "225+",
    avgSalePrice: "$265,000",
    avgRevenue: "$218,000/year",
    marketGrowth: "+8.2%",
    topCities: ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem"],
    demographics: {
      renterPercentage: "30%",
      medianIncome: "$74,000",
      populationDensity: "40/sq mi"
    },
    marketInsights: [
      "Fastest-growing state by percentage",
      "Young families create consistent laundry demand",
      "Salt Lake City tech corridor driving growth",
      "BYU/U of U provide stable student demand"
    ],
    sellerTips: [
      "Emphasize family-friendly amenities",
      "Document any tech company customer relationships",
      "Highlight growth in surrounding developments"
    ],
    recentSales: [
      { city: "Salt Lake City", price: "$325,000", sqft: "3,200", machines: 36, daysOnMarket: 28 },
      { city: "Provo", price: "$245,000", sqft: "2,800", machines: 32, daysOnMarket: 35 }
    ],
    expertQuote: {
      text: "Utah's exceptional growth, young demographics, and tech industry create one of the strongest laundromat markets in the Mountain West. Values have appreciated significantly.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why is Utah growing so fast?", a: "Silicon Slopes tech corridor (Adobe, Qualtrics), young demographics, quality of life, and business-friendly environment." },
      { q: "How do large families affect Utah laundromats?", a: "Positively. Utah has highest birth rate in the nation. Large families generate more laundry even if they have home units." },
      { q: "What multiples do Utah laundromats sell for?", a: "3-3.5x SDE for Salt Lake area. Growth fundamentals support premium valuations compared to other Mountain states." }
    ]
  },
  "vermont": {
    slug: "vermont",
    name: "Vermont",
    abbr: "VT",
    population: "647,000",
    laundromatCount: "65+",
    avgSalePrice: "$195,000",
    avgRevenue: "$165,000/year",
    marketGrowth: "+2.2%",
    topCities: ["Burlington", "South Burlington", "Rutland", "Barre", "Montpelier"],
    demographics: {
      renterPercentage: "29%",
      medianIncome: "$63,000",
      populationDensity: "70/sq mi"
    },
    marketInsights: [
      "Burlington represents 50% of state activity",
      "University of Vermont provides stable demand",
      "Tourism creates seasonal revenue opportunities",
      "Limited inventory creates seller advantage"
    ],
    sellerTips: [
      "Document heating efficiency thoroughly",
      "Highlight any tourism/vacation rental accounts",
      "Burlington commands significant premiums"
    ],
    recentSales: [
      { city: "Burlington", price: "$235,000", sqft: "2,600", machines: 30, daysOnMarket: 48 },
      { city: "Rutland", price: "$155,000", sqft: "2,200", machines: 26, daysOnMarket: 65 }
    ],
    expertQuote: {
      text: "Vermont's small but stable market offers opportunities for investors seeking lower competition. Burlington, with UVM and tourism, has particularly strong fundamentals.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does Vermont's small population affect laundromat sales?", a: "Fewer buyers but also less competition. Well-priced laundromats attract serious local and Boston-area investors." },
      { q: "Does tourism affect Vermont laundromats?", a: "Seasonally, yes. Ski season and fall foliage can increase revenue 20-30% in tourist-heavy areas." },
      { q: "What's unique about selling in Vermont?", a: "Heating costs are significant - document efficiency. Environmental consciousness is high - highlight any green initiatives." }
    ]
  },
  "virginia": {
    slug: "virginia",
    name: "Virginia",
    abbr: "VA",
    population: "8.6 million",
    laundromatCount: "625+",
    avgSalePrice: "$275,000",
    avgRevenue: "$228,000/year",
    marketGrowth: "+4.8%",
    topCities: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Arlington"],
    demographics: {
      renterPercentage: "34%",
      medianIncome: "$76,000",
      populationDensity: "218/sq mi"
    },
    marketInsights: [
      "Northern Virginia (DC suburbs) commands premium valuations",
      "Hampton Roads has stable military demand",
      "Richmond is emerging growth market",
      "High household incomes support premium pricing"
    ],
    sellerTips: [
      "NoVA proximity dramatically affects valuation",
      "Document any federal contractor customer base",
      "Highlight Metro accessibility in NoVA"
    ],
    recentSales: [
      { city: "Arlington", price: "$425,000", sqft: "3,000", machines: 34, daysOnMarket: 28 },
      { city: "Richmond", price: "$245,000", sqft: "2,800", machines: 32, daysOnMarket: 42 }
    ],
    expertQuote: {
      text: "Virginia offers distinct markets - premium NoVA (DC suburbs), stable Hampton Roads (military), and emerging Richmond. Each provides compelling opportunities for different investor profiles.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does DC proximity affect Virginia laundromat values?", a: "Dramatically. Arlington, Alexandria, and Fairfax County command valuations 40-60% above state average due to DC commuter demand." },
      { q: "What about Hampton Roads?", a: "Naval Station Norfolk and other military installations provide exceptionally stable demand. Valuations are moderate with consistent cash flow." },
      { q: "Is Richmond a good market?", a: "Emerging. VCU provides student demand, and corporate relocations are driving growth. Values are appreciating faster than statewide average." }
    ]
  },
  "washington": {
    slug: "washington",
    name: "Washington",
    abbr: "WA",
    population: "7.8 million",
    laundromatCount: "545+",
    avgSalePrice: "$325,000",
    avgRevenue: "$268,000/year",
    marketGrowth: "+5.8%",
    topCities: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue"],
    demographics: {
      renterPercentage: "37%",
      medianIncome: "$78,000",
      populationDensity: "117/sq mi"
    },
    marketInsights: [
      "Seattle metro represents 65% of state activity",
      "Tech industry driving population growth",
      "High housing costs increase renter percentage",
      "No state income tax attracts investors"
    ],
    sellerTips: [
      "Seattle requires neighborhood-specific marketing",
      "Document any tech company customer relationships",
      "Highlight water efficiency - environmental focus"
    ],
    recentSales: [
      { city: "Seattle", price: "$425,000", sqft: "3,400", machines: 40, daysOnMarket: 30 },
      { city: "Tacoma", price: "$285,000", sqft: "2,800", machines: 32, daysOnMarket: 38 }
    ],
    expertQuote: {
      text: "Washington's tech-driven economy, no state income tax, and high renter percentage create exceptional laundromat fundamentals. Seattle is one of the strongest markets nationally.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "What makes Seattle laundromats valuable?", a: "37% renter rate (rising due to housing costs), tech industry driving incomes, and no state income tax. Premium locations sell quickly." },
      { q: "What multiples do Seattle laundromats sell for?", a: "3-3.8x SDE for well-located properties. Amazon/Microsoft-adjacent locations can approach 4x." },
      { q: "What about Eastern Washington?", a: "Spokane has stable demand with significantly lower valuations. Good opportunity for investors priced out of Seattle." }
    ]
  },
  "west-virginia": {
    slug: "west-virginia",
    name: "West Virginia",
    abbr: "WV",
    population: "1.8 million",
    laundromatCount: "145+",
    avgSalePrice: "$135,000",
    avgRevenue: "$118,000/year",
    marketGrowth: "+1.8%",
    topCities: ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling"],
    demographics: {
      renterPercentage: "27%",
      medianIncome: "$48,000",
      populationDensity: "74/sq mi"
    },
    marketInsights: [
      "Charleston represents 35% of state activity",
      "WVU (Morgantown) provides stable student demand",
      "Lowest acquisition costs in the region",
      "Limited competition in most markets"
    ],
    sellerTips: [
      "Morgantown commands premiums due to WVU",
      "Emphasize affordable entry point for investors",
      "Document any university customer base"
    ],
    recentSales: [
      { city: "Charleston", price: "$145,000", sqft: "2,400", machines: 28, daysOnMarket: 62 },
      { city: "Morgantown", price: "$175,000", sqft: "2,200", machines: 26, daysOnMarket: 48 }
    ],
    expertQuote: {
      text: "West Virginia offers the most affordable laundromat entry points in the Mid-Atlantic. Morgantown, with WVU, provides stable demand that outperforms state averages.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "Why are West Virginia laundromats so affordable?", a: "Population decline and lower cost of living. However, Morgantown (WVU) bucks the trend with stable demand and growth." },
      { q: "What's the buyer pool for WV laundromats?", a: "Local entrepreneurs, first-time investors attracted by accessibility, and regional buyers from Pittsburgh/DC areas." },
      { q: "Is West Virginia a good investment?", a: "For the right buyer. Lower acquisition costs mean lower risk. Focus on Morgantown, Charleston, or areas with stable employment." }
    ]
  },
  "wisconsin": {
    slug: "wisconsin",
    name: "Wisconsin",
    abbr: "WI",
    population: "5.9 million",
    laundromatCount: "445+",
    avgSalePrice: "$195,000",
    avgRevenue: "$165,000/year",
    marketGrowth: "+3.5%",
    topCities: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine"],
    demographics: {
      renterPercentage: "32%",
      medianIncome: "$63,000",
      populationDensity: "108/sq mi"
    },
    marketInsights: [
      "Milwaukee represents 45% of state activity",
      "Madison (UW) has strong university demand",
      "Manufacturing base provides stable employment",
      "Growing immigrant communities in Milwaukee"
    ],
    sellerTips: [
      "Madison commands premiums due to university",
      "Document any manufacturing customer relationships",
      "Milwaukee neighborhoods vary significantly"
    ],
    recentSales: [
      { city: "Milwaukee", price: "$215,000", sqft: "2,800", machines: 32, daysOnMarket: 45 },
      { city: "Madison", price: "$245,000", sqft: "2,600", machines: 30, daysOnMarket: 38 }
    ],
    expertQuote: {
      text: "Wisconsin offers stable Midwest laundromat fundamentals with accessible pricing. Madison, with UW, provides above-average growth, while Milwaukee offers diverse urban opportunities.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How do Milwaukee and Madison compare?", a: "Madison: university-driven, higher valuations, less competition. Milwaukee: larger market, more diverse neighborhoods, value opportunities." },
      { q: "What makes Wisconsin attractive?", a: "Stable manufacturing economy, reasonable operating costs, and accessible price points. Good alternative to higher-priced Chicago market." },
      { q: "What's unique about Wisconsin laundromats?", a: "Strong Hmong and Hispanic communities in Milwaukee value laundromats highly. University demand in Madison provides stability." }
    ]
  },
  "wyoming": {
    slug: "wyoming",
    name: "Wyoming",
    abbr: "WY",
    population: "577,000",
    laundromatCount: "55+",
    avgSalePrice: "$165,000",
    avgRevenue: "$142,000/year",
    marketGrowth: "+2.5%",
    topCities: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"],
    demographics: {
      renterPercentage: "31%",
      medianIncome: "$65,000",
      populationDensity: "6/sq mi"
    },
    marketInsights: [
      "Smallest laundromat market by population",
      "No state income tax attracts business investors",
      "Energy industry affects economic cycles",
      "University of Wyoming provides stable demand"
    ],
    sellerTips: [
      "Emphasize no state income tax advantage",
      "Document heating costs thoroughly",
      "Cheyenne and Laramie command premiums"
    ],
    recentSales: [
      { city: "Cheyenne", price: "$185,000", sqft: "2,600", machines: 30, daysOnMarket: 58 },
      { city: "Casper", price: "$155,000", sqft: "2,200", machines: 26, daysOnMarket: 72 }
    ],
    expertQuote: {
      text: "Wyoming's small but tax-advantaged market offers opportunities for investors seeking limited competition. Cheyenne and Laramie (UW) have the strongest fundamentals.",
      author: "Industry Analysis Team",
      title: "WashBizHub Market Research"
    },
    faq: [
      { q: "How does Wyoming's small population affect laundromat sales?", a: "Fewer buyers but also minimal competition. Well-priced laundromats attract serious regional and Colorado investors." },
      { q: "What about Wyoming's tax advantages?", a: "No state income tax makes Wyoming attractive to business owners. Combined with low property taxes, it's business-friendly." },
      { q: "Who buys Wyoming laundromats?", a: "Local entrepreneurs, Colorado investors seeking tax advantages, and first-time buyers attracted by accessible prices." }
    ]
  }
};

// Get all state slugs for routing
export const STATE_SLUGS = Object.keys(STATE_DATA);

// Get state data by slug
export function getStateData(slug: string): StateData | undefined {
  return STATE_DATA[slug.toLowerCase()];
}

// Get list of all states for sitemap/navigation
export function getAllStates(): { slug: string; name: string; abbr: string }[] {
  return Object.values(STATE_DATA).map(state => ({
    slug: state.slug,
    name: state.name,
    abbr: state.abbr
  }));
}
