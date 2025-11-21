import { db } from "./db";
import { resources, vendors } from "@shared/schema";

// Additional calculator resources for comprehensive coverage
const additionalCalculators = [
  {
    title: "Cash Flow Projection Calculator",
    slug: "cash-flow-projection",
    description: "12-month cash flow forecast with seasonality adjustments. Plan for seasonal variations, equipment purchases, and maintain healthy working capital.",
    resourceType: "calculator" as const,
    category: "financial" as const,
    targetAudience: ["owner", "investor"],
    difficulty: "intermediate" as const,
    isPremium: true,
    tags: ["cash-flow", "forecasting", "financial-planning", "working-capital"],
    content: JSON.stringify({
      features: ["monthly-projections", "seasonal-adjustments", "what-if-scenarios"],
      outputs: ["cash-position", "burn-rate", "runway"]
    }),
    rating: 4.6,
    useCount: 5420,
  },
  {
    title: "Equipment Replacement Calculator",
    slug: "equipment-replacement",
    description: "Determine optimal equipment replacement timing based on maintenance costs, efficiency loss, and total cost of ownership analysis.",
    resourceType: "calculator" as const,
    category: "operational" as const,
    targetAudience: ["owner", "operator"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["equipment", "replacement", "tco", "maintenance"],
    content: JSON.stringify({
      factors: ["age", "repair-frequency", "efficiency-rating", "downtime"],
      outputs: ["replacement-timing", "financial-impact", "roi-analysis"]
    }),
    rating: 4.5,
    useCount: 8930,
  },
  {
    title: "Water & Energy Efficiency Calculator",
    slug: "water-energy-efficiency",
    description: "Calculate savings from high-efficiency equipment upgrades. Compare water and energy consumption across different equipment models.",
    resourceType: "calculator" as const,
    category: "operational" as const,
    targetAudience: ["owner", "operator"],
    difficulty: "beginner" as const,
    isPremium: false,
    tags: ["efficiency", "sustainability", "utilities", "cost-savings"],
    content: JSON.stringify({
      comparisons: ["standard-vs-he", "ozone-systems", "water-recycling"],
      outputs: ["annual-savings", "payback-period", "environmental-impact"]
    }),
    rating: 4.7,
    useCount: 12340,
  },
  {
    title: "Pricing Strategy Calculator",
    slug: "pricing-strategy",
    description: "Optimize your pricing based on local market rates, competition, and target demographics. Includes price elasticity analysis.",
    resourceType: "calculator" as const,
    category: "marketing" as const,
    targetAudience: ["owner", "operator"],
    difficulty: "intermediate" as const,
    isPremium: true,
    tags: ["pricing", "competition", "market-analysis", "revenue-optimization"],
    content: JSON.stringify({
      factors: ["competitor-pricing", "demographics", "market-positioning"],
      strategies: ["value-pricing", "promotional-pricing", "tiered-pricing"]
    }),
    rating: 4.8,
    useCount: 6780,
  },
  {
    title: "Loan Qualification Calculator",
    slug: "loan-qualification",
    description: "Determine how much you can borrow for a laundromat purchase. Includes SBA 7(a), conventional, and seller financing options.",
    resourceType: "calculator" as const,
    category: "financial" as const,
    targetAudience: ["investor", "buyer"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["financing", "loans", "sba", "qualification"],
    content: JSON.stringify({
      loanTypes: ["sba-7a", "conventional", "seller-financing"],
      requirements: ["credit-score", "down-payment", "debt-service-coverage"],
      outputs: ["max-loan-amount", "monthly-payment", "total-cost"]
    }),
    rating: 4.6,
    useCount: 9870,
  },
  {
    title: "Lease vs Buy Analysis",
    slug: "lease-vs-buy-analysis",
    description: "Compare leasing versus buying a laundromat location. Analyze long-term costs, flexibility, and investment returns.",
    resourceType: "calculator" as const,
    category: "financial" as const,
    targetAudience: ["owner", "investor"],
    difficulty: "advanced" as const,
    isPremium: true,
    tags: ["real-estate", "lease", "purchase", "investment-analysis"],
    content: JSON.stringify({
      scenarios: ["lease-only", "purchase", "lease-to-own"],
      factors: ["appreciation", "tax-benefits", "flexibility", "equity-build"]
    }),
    rating: 4.7,
    useCount: 4230,
  },
  {
    title: "Marketing ROI Calculator",
    slug: "marketing-roi",
    description: "Calculate return on marketing investments. Track customer acquisition costs and lifetime value for different marketing channels.",
    resourceType: "calculator" as const,
    category: "marketing" as const,
    targetAudience: ["owner", "operator"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["marketing", "roi", "customer-acquisition", "analytics"],
    content: JSON.stringify({
      channels: ["digital-ads", "direct-mail", "social-media", "local-partnerships"],
      metrics: ["cac", "ltv", "roi", "conversion-rate"]
    }),
    rating: 4.5,
    useCount: 7650,
  },
  {
    title: "Insurance Cost Estimator",
    slug: "insurance-estimator",
    description: "Estimate insurance costs for property, liability, equipment breakdown, and business interruption coverage. Get competitive quotes.",
    resourceType: "calculator" as const,
    category: "operational" as const,
    targetAudience: ["owner", "investor"],
    difficulty: "beginner" as const,
    isPremium: false,
    tags: ["insurance", "risk-management", "cost-estimation"],
    content: JSON.stringify({
      coverageTypes: ["property", "liability", "equipment", "business-interruption"],
      factors: ["location", "building-value", "equipment-value", "revenue"]
    }),
    rating: 4.4,
    useCount: 5890,
  },
  {
    title: "Competitive Analysis Tool",
    slug: "competitive-analysis",
    description: "Analyze competitors within a radius. Compare equipment, pricing, amenities, and customer reviews to identify market gaps.",
    resourceType: "calculator" as const,
    category: "marketing" as const,
    targetAudience: ["investor", "owner", "broker"],
    difficulty: "intermediate" as const,
    isPremium: true,
    tags: ["competition", "market-analysis", "due-diligence", "positioning"],
    content: JSON.stringify({
      analysisFactors: ["equipment-quality", "pricing", "amenities", "customer-satisfaction"],
      outputs: ["competitive-position", "market-gaps", "differentiation-opportunities"]
    }),
    rating: 4.9,
    useCount: 3450,
  },
  {
    title: "Staffing Requirements Calculator",
    slug: "staffing-requirements",
    description: "Determine optimal staffing levels based on store size, hours, and services offered. Includes labor cost budgeting.",
    resourceType: "calculator" as const,
    category: "operational" as const,
    targetAudience: ["owner", "operator"],
    difficulty: "beginner" as const,
    isPremium: false,
    tags: ["staffing", "labor", "scheduling", "budgeting"],
    content: JSON.stringify({
      inputs: ["store-hours", "sqft", "services", "peak-hours"],
      outputs: ["required-fte", "labor-cost", "scheduling-recommendations"]
    }),
    rating: 4.6,
    useCount: 8920,
  },
];

// Additional guide resources
const additionalGuides = [
  {
    title: "Equipment Selection Guide 2025",
    slug: "equipment-selection-guide-2025",
    description: "Comprehensive guide to selecting washers, dryers, and payment systems. Compare brands, features, warranties, and total cost of ownership.",
    resourceType: "guide" as const,
    category: "technical" as const,
    targetAudience: ["owner", "investor", "startup"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["equipment", "selection", "comparison", "tco"],
    content: JSON.stringify({
      sections: [
        "Washer Selection: Top-Load vs Front-Load",
        "Dryer Technologies & Efficiency",
        "Payment System Comparison",
        "Brand Reliability Rankings",
        "Warranty Analysis",
        "Total Cost of Ownership"
      ],
      brands: 12,
      comparisons: 35
    }),
    rating: 4.8,
    useCount: 16450,
  },
  {
    title: "Location Selection Masterclass",
    slug: "location-selection-masterclass",
    description: "Advanced site selection methodology using demographics, traffic patterns, competition analysis, and GIS mapping. Reduce location risk.",
    resourceType: "guide" as const,
    category: "operational" as const,
    targetAudience: ["investor", "startup"],
    difficulty: "advanced" as const,
    isPremium: true,
    tags: ["location", "site-selection", "demographics", "market-analysis"],
    content: JSON.stringify({
      methodology: ["demographic-analysis", "traffic-study", "competition-mapping", "walkability-score"],
      tools: ["gis-software", "census-data", "traffic-counters", "heat-maps"],
      casestudies: 8
    }),
    rating: 4.9,
    useCount: 5670,
  },
  {
    title: "Marketing Playbook for Laundromats",
    slug: "marketing-playbook",
    description: "Complete marketing strategies including digital marketing, local partnerships, loyalty programs, and grand opening campaigns.",
    resourceType: "guide" as const,
    category: "marketing" as const,
    targetAudience: ["owner", "operator"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["marketing", "advertising", "social-media", "customer-loyalty"],
    content: JSON.stringify({
      strategies: [
        "Google My Business Optimization",
        "Facebook & Instagram Marketing",
        "Yelp Reputation Management",
        "Loyalty Program Design",
        "Local Partnership Development",
        "Grand Opening Campaigns"
      ],
      templates: 15,
      casestudies: 10
    }),
    rating: 4.7,
    useCount: 13240,
  },
  {
    title: "Legal Compliance Handbook",
    slug: "legal-compliance-handbook",
    description: "Navigate permits, licenses, ADA compliance, employment law, and environmental regulations. State-by-state requirements.",
    resourceType: "guide" as const,
    category: "legal" as const,
    targetAudience: ["owner", "startup"],
    difficulty: "advanced" as const,
    isPremium: true,
    tags: ["legal", "compliance", "permits", "regulations"],
    content: JSON.stringify({
      topics: [
        "Business Licenses & Permits",
        "ADA Compliance Requirements",
        "Employment Law Basics",
        "Environmental Regulations",
        "Water Discharge Permits",
        "Fire & Safety Codes"
      ],
      stateGuides: 50
    }),
    rating: 4.8,
    useCount: 4890,
  },
  {
    title: "Negotiation Tactics for Buying Laundromats",
    slug: "negotiation-tactics",
    description: "Professional negotiation strategies from experienced brokers. Get the best deal, favorable terms, and seller concessions.",
    resourceType: "guide" as const,
    category: "financial" as const,
    targetAudience: ["investor", "buyer"],
    difficulty: "intermediate" as const,
    isPremium: true,
    tags: ["negotiation", "buying", "tactics", "deal-structure"],
    content: JSON.stringify({
      tactics: [
        "Price Justification & Analysis",
        "Seller Financing Negotiation",
        "Contingency Structuring",
        "Inspection Period Leverage",
        "Equipment & Lease Terms",
        "Closing Cost Allocation"
      ],
      scripts: 20,
      scenarios: 15
    }),
    rating: 4.9,
    useCount: 7820,
  },
];

// Additional template resources
const additionalTemplates = [
  {
    title: "Financial Projection Model (Excel)",
    slug: "financial-projection-model",
    description: "Professional 5-year financial projection model with dynamic scenarios, sensitivity analysis, and investor-ready output.",
    resourceType: "template" as const,
    category: "financial" as const,
    targetAudience: ["investor", "owner", "startup"],
    difficulty: "advanced" as const,
    isPremium: true,
    tags: ["financial-model", "projections", "excel", "analysis"],
    content: JSON.stringify({
      features: [
        "5-Year Monthly Projections",
        "Scenario Planning (Best/Base/Worst)",
        "Sensitivity Analysis",
        "Key Metrics Dashboard",
        "Chart & Graph Automation"
      ],
      worksheets: 12
    }),
    rating: 4.9,
    useCount: 6240,
  },
  {
    title: "Employee Handbook Template",
    slug: "employee-handbook",
    description: "Comprehensive employee handbook covering policies, procedures, and legal requirements. Customizable for your state and business.",
    resourceType: "template" as const,
    category: "operational" as const,
    targetAudience: ["owner", "operator"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["hr", "employees", "policies", "legal"],
    content: JSON.stringify({
      sections: [
        "Welcome & Company Culture",
        "Employment Policies",
        "Compensation & Benefits",
        "Work Rules & Expectations",
        "Safety & Security",
        "Disciplinary Procedures"
      ],
      pages: 45
    }),
    rating: 4.6,
    useCount: 4560,
  },
  {
    title: "Lease Negotiation Checklist",
    slug: "lease-negotiation-checklist",
    description: "Essential checklist for commercial lease negotiations. Protect your interests with landlord responsibilities, renewal options, and exit clauses.",
    resourceType: "checklist" as const,
    category: "legal" as const,
    targetAudience: ["owner", "investor", "startup"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["lease", "real-estate", "negotiation", "checklist"],
    content: JSON.stringify({
      checkpoints: 45,
      categories: [
        "Lease Term & Renewal Options",
        "Rent Structure & Escalations",
        "Tenant Improvements",
        "Maintenance Responsibilities",
        "Assignment & Subletting",
        "Exit Strategies"
      ]
    }),
    rating: 4.7,
    useCount: 8930,
  },
  {
    title: "Due Diligence Checklist",
    slug: "due-diligence-checklist",
    description: "Complete 100-point due diligence checklist for buying a laundromat. Financial, operational, legal, and equipment verification.",
    resourceType: "checklist" as const,
    category: "financial" as const,
    targetAudience: ["investor", "buyer", "broker"],
    difficulty: "advanced" as const,
    isPremium: true,
    tags: ["due-diligence", "buying", "verification", "checklist"],
    content: JSON.stringify({
      checkpoints: 100,
      categories: [
        "Financial Verification",
        "Equipment Inspection",
        "Lease Review",
        "Legal & Compliance",
        "Market Analysis",
        "Operational Assessment"
      ]
    }),
    rating: 4.9,
    useCount: 12450,
  },
];

// Additional vendor directory entries
const additionalVendors = [
  {
    companyName: "Continental Girbau",
    category: "Equipment",
    description: "Industrial and commercial laundry equipment manufacturer with focus on energy efficiency and water conservation. European engineering with North American support. 60+ years of innovation in washer-extractors and dryers.",
    verified: true,
  },
  {
    companyName: "Wash-Dry-Fold POS",
    category: "Services",
    description: "Point-of-sale system designed specifically for laundromats offering wash-dry-fold services. Integrated payment processing, customer tracking, and inventory management. Cloud-based with mobile app.",
    verified: true,
  },
  {
    companyName: "Cents Payment Solutions",
    category: "Services",
    description: "Modern payment solutions with credit card readers, mobile payments, and customer loyalty programs. Real-time reporting and remote monitoring. Seamless integration with existing equipment.",
    verified: true,
  },
  {
    companyName: "LaundroLux Design Studios",
    category: "Consulting",
    description: "Professional design and renovation services specializing in laundromat makeovers. Interior design, space planning, and brand identity development. Portfolio includes 200+ successful transformations.",
    verified: true,
  },
];

export async function seedResourcesExpansion() {
  console.log("🌱 Starting resources expansion seeding...");

  try {
    // Insert additional calculators
    console.log("📊 Inserting additional calculator resources...");
    for (const calc of additionalCalculators) {
      await db.insert(resources).values(calc);
    }
    console.log(`✅ Inserted ${additionalCalculators.length} additional calculators`);

    // Insert additional guides
    console.log("📚 Inserting additional guide resources...");
    for (const guide of additionalGuides) {
      await db.insert(resources).values(guide);
    }
    console.log(`✅ Inserted ${additionalGuides.length} additional guides`);

    // Insert additional templates
    console.log("📋 Inserting additional template resources...");
    for (const template of additionalTemplates) {
      await db.insert(resources).values(template);
    }
    console.log(`✅ Inserted ${additionalTemplates.length} additional templates/checklists`);

    // Insert additional vendors
    console.log("🏭 Inserting additional vendors...");
    for (const vendor of additionalVendors) {
      await db.insert(vendors).values(vendor);
    }
    console.log(`✅ Inserted ${additionalVendors.length} additional vendors`);

    console.log("\n🎉 Resource expansion completed successfully!");
    console.log("\nSummary:");
    console.log(`  - ${additionalCalculators.length} calculators`);
    console.log(`  - ${additionalGuides.length} guides`);
    console.log(`  - ${additionalTemplates.length} templates/checklists`);
    console.log(`  - ${additionalVendors.length} vendors`);
    console.log(`  - Total new records: ${additionalCalculators.length + additionalGuides.length + additionalTemplates.length + additionalVendors.length}`);

  } catch (error) {
    console.error("❌ Error seeding resource expansion:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedResourcesExpansion()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
