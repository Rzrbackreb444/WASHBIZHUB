import { db } from "./db";
import { resources, vendors, industryBenchmarks } from "@shared/schema";

// Seed calculator resources
const calculatorResources = [
  {
    title: "ROI Calculator",
    slug: "roi-calculator",
    description: "Calculate return on investment for laundromat purchases. Includes revenue projections, expense forecasting, and payback period analysis.",
    resourceType: "calculator" as const,
    category: "financial" as const,
    targetAudience: ["investor", "owner", "broker"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["roi", "investment", "financial-analysis", "due-diligence"],
    content: JSON.stringify({
      fields: [
        { name: "purchasePrice", label: "Purchase Price", type: "number" },
        { name: "monthlyRevenue", label: "Monthly Revenue", type: "number" },
        { name: "monthlyExpenses", label: "Monthly Expenses", type: "number" },
        { name: "downPayment", label: "Down Payment %", type: "number" },
      ],
      formulas: {
        noi: "monthlyRevenue * 12 - monthlyExpenses * 12",
        cashOnCash: "(noi - debtService) / downPayment",
        paybackPeriod: "downPayment / (noi - debtService)"
      }
    }),
    rating: 4.8,
    useCount: 12450,
  },
  {
    title: "Laundromat Valuation Calculator",
    slug: "valuation-calculator",
    description: "Professional valuation tool using multiple methodologies: revenue multiple, EBITDA multiple, cap rate, and discounted cash flow analysis.",
    resourceType: "calculator" as const,
    category: "financial" as const,
    targetAudience: ["investor", "broker", "owner"],
    difficulty: "advanced" as const,
    isPremium: true,
    tags: ["valuation", "appraisal", "business-value", "selling"],
    content: JSON.stringify({
      methods: ["revenue-multiple", "ebitda-multiple", "cap-rate", "dcf"],
      industryMultiples: {
        revenue: { min: 2.5, avg: 3.2, max: 4.5 },
        ebitda: { min: 3.5, avg: 4.8, max: 6.5 }
      }
    }),
    rating: 4.9,
    useCount: 8920,
  },
  {
    title: "Utility Cost Analyzer",
    slug: "utility-cost-analyzer",
    description: "Calculate and optimize utility costs including water, electricity, gas, and sewer. Compare against industry benchmarks and identify savings opportunities.",
    resourceType: "calculator" as const,
    category: "operational" as const,
    targetAudience: ["owner", "operator"],
    difficulty: "beginner" as const,
    isPremium: false,
    tags: ["utilities", "cost-reduction", "efficiency", "operating-expenses"],
    content: JSON.stringify({
      utilities: ["water", "electricity", "gas", "sewer"],
      benchmarks: {
        waterPerLoad: { min: 0.15, avg: 0.22, max: 0.35 },
        electricityPerSqFt: { min: 1.50, avg: 2.10, max: 3.20 }
      }
    }),
    rating: 4.6,
    useCount: 15780,
  },
  {
    title: "Equipment Financing Calculator",
    slug: "equipment-financing-calculator",
    description: "Compare lease vs. buy options, calculate loan payments, and analyze tax benefits for equipment financing decisions.",
    resourceType: "calculator" as const,
    category: "financial" as const,
    targetAudience: ["owner", "investor"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["financing", "equipment", "lease-vs-buy", "tax-benefits"],
    content: JSON.stringify({
      options: ["purchase", "capital-lease", "operating-lease"],
      taxConsiderations: ["section-179", "bonus-depreciation", "interest-deduction"]
    }),
    rating: 4.7,
    useCount: 6340,
  },
  {
    title: "Labor Cost Calculator",
    slug: "labor-cost-calculator",
    description: "Calculate total labor costs including wages, payroll taxes, benefits, and workers compensation. Optimize staffing levels and schedules.",
    resourceType: "calculator" as const,
    category: "operational" as const,
    targetAudience: ["owner", "operator"],
    difficulty: "beginner" as const,
    isPremium: false,
    tags: ["labor", "payroll", "staffing", "scheduling"],
    content: JSON.stringify({
      costs: ["wages", "payroll-taxes", "benefits", "workers-comp", "training"],
      benchmarks: {
        laborAsPercentOfRevenue: { min: 8, avg: 12, max: 18 }
      }
    }),
    rating: 4.5,
    useCount: 9870,
  },
  {
    title: "Break-Even Analysis Calculator",
    slug: "break-even-calculator",
    description: "Determine your break-even point in revenue and customer transactions. Essential for pricing strategy and business planning.",
    resourceType: "calculator" as const,
    category: "financial" as const,
    targetAudience: ["owner", "investor", "startup"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["break-even", "financial-planning", "pricing", "startup"],
    content: JSON.stringify({
      fixedCosts: ["rent", "insurance", "utilities-base", "equipment-lease"],
      variableCosts: ["utilities-variable", "supplies", "maintenance"]
    }),
    rating: 4.8,
    useCount: 11200,
  },
  {
    title: "Renovation ROI Calculator",
    slug: "renovation-roi-calculator",
    description: "Calculate return on investment for renovations and upgrades. Compare renovation costs against projected revenue increases.",
    resourceType: "calculator" as const,
    category: "financial" as const,
    targetAudience: ["owner", "investor"],
    difficulty: "intermediate" as const,
    isPremium: true,
    tags: ["renovation", "upgrades", "roi", "improvement"],
    content: JSON.stringify({
      renovationTypes: ["equipment-upgrade", "interior-design", "exterior-facade", "amenities"],
      expectedLifts: {
        premiumEquipment: { revenueIncrease: 15, customerSatisfaction: 25 },
        modernDesign: { revenueIncrease: 12, customerRetention: 20 }
      }
    }),
    rating: 4.7,
    useCount: 4560,
  },
];

// Seed guide resources
const guideResources = [
  {
    title: "Complete Laundromat Buyer's Guide",
    slug: "buyers-guide",
    description: "Comprehensive 50-page guide covering every aspect of buying a laundromat: due diligence, valuation, financing, and negotiation strategies.",
    resourceType: "guide" as const,
    category: "financial" as const,
    targetAudience: ["investor", "buyer"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["buying", "due-diligence", "valuation", "negotiation"],
    content: JSON.stringify({
      chapters: [
        "Market Research & Site Selection",
        "Financial Analysis & Valuation",
        "Equipment Inspection & Assessment",
        "Lease Review & Negotiation",
        "Financing Options",
        "Due Diligence Checklist",
        "Closing the Deal"
      ],
      checklists: 12,
      templates: 8
    }),
    rating: 4.9,
    useCount: 18900,
  },
  {
    title: "Laundromat Startup Guide 2025",
    slug: "startup-guide-2025",
    description: "Step-by-step guide to launching a new laundromat from scratch. Includes site selection, equipment sourcing, permits, and grand opening strategies.",
    resourceType: "guide" as const,
    category: "operational" as const,
    targetAudience: ["startup", "owner"],
    difficulty: "beginner" as const,
    isPremium: false,
    tags: ["startup", "new-business", "planning", "launch"],
    content: JSON.stringify({
      phases: [
        "Business Planning & Market Research",
        "Location Selection & Lease Negotiation",
        "Equipment Selection & Layout Design",
        "Permits & Licensing",
        "Financing & Budgeting",
        "Marketing & Grand Opening",
        "Operations & Staffing"
      ],
      budget: {
        startup: { min: 200000, avg: 350000, max: 750000 }
      }
    }),
    rating: 4.8,
    useCount: 14320,
  },
  {
    title: "Preventive Maintenance Best Practices",
    slug: "maintenance-guide",
    description: "Professional maintenance schedules, troubleshooting guides, and preventive maintenance checklists to maximize equipment uptime and lifespan.",
    resourceType: "guide" as const,
    category: "technical" as const,
    targetAudience: ["owner", "operator", "technician"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["maintenance", "equipment", "troubleshooting", "uptime"],
    content: JSON.stringify({
      schedules: {
        daily: ["inspect-machines", "clean-lint-traps", "check-change-machines"],
        weekly: ["deep-clean", "test-equipment", "inspect-plumbing"],
        monthly: ["lubricate-parts", "inspect-belts", "clean-vents"],
        quarterly: ["professional-inspection", "calibrate-timers", "test-safety-features"]
      },
      troubleshooting: 45
    }),
    rating: 4.7,
    useCount: 22100,
  },
];

// Seed template resources
const templateResources = [
  {
    title: "Laundromat Business Plan Template",
    slug: "business-plan-template",
    description: "Professional business plan template with financial projections, market analysis, and operational plans. Banker and SBA-ready format.",
    resourceType: "template" as const,
    category: "financial" as const,
    targetAudience: ["startup", "investor", "owner"],
    difficulty: "intermediate" as const,
    isPremium: true,
    tags: ["business-plan", "financing", "sba", "startup"],
    content: JSON.stringify({
      sections: [
        "Executive Summary",
        "Company Description",
        "Market Analysis",
        "Organization & Management",
        "Service Line",
        "Marketing & Sales",
        "Financial Projections",
        "Funding Request",
        "Appendix"
      ],
      spreadsheets: 5
    }),
    rating: 4.9,
    useCount: 7840,
  },
  {
    title: "Equipment Purchase Agreement",
    slug: "equipment-purchase-agreement",
    description: "Legal contract template for purchasing used laundromat equipment. Includes warranty provisions, payment terms, and liability clauses.",
    resourceType: "template" as const,
    category: "legal" as const,
    targetAudience: ["owner", "investor"],
    difficulty: "advanced" as const,
    isPremium: true,
    tags: ["contract", "legal", "equipment", "purchase"],
    content: JSON.stringify({
      clauses: [
        "Purchase Price & Payment Terms",
        "Equipment Condition & Warranties",
        "Installation & Delivery",
        "Liability & Indemnification",
        "Dispute Resolution"
      ],
      reviewedBy: "Commercial Attorney"
    }),
    rating: 4.6,
    useCount: 3210,
  },
  {
    title: "Daily Operations Checklist",
    slug: "daily-operations-checklist",
    description: "Comprehensive daily checklist for laundromat operators covering opening, midday, and closing procedures. Ensures consistent operations.",
    resourceType: "checklist" as const,
    category: "operational" as const,
    targetAudience: ["operator", "owner"],
    difficulty: "beginner" as const,
    isPremium: false,
    tags: ["operations", "checklist", "procedures", "quality-control"],
    content: JSON.stringify({
      opening: [
        "Unlock and turn on lights",
        "Test all washers and dryers",
        "Stock change machine",
        "Clean restrooms",
        "Verify security system"
      ],
      midday: [
        "Clean lint traps",
        "Restock soap vending",
        "Empty trash",
        "Check equipment status"
      ],
      closing: [
        "Count cash and reconcile",
        "Final cleaning sweep",
        "Lock all doors",
        "Set alarm system"
      ]
    }),
    rating: 4.8,
    useCount: 19650,
  },
];

// Seed case study resources
const caseStudyResources = [
  {
    title: "How I Turned a $250K Investment into $80K Annual Cashflow",
    slug: "250k-to-80k-cashflow",
    description: "Real case study from a first-time investor who bought an underperforming laundromat and implemented strategic improvements to triple net income.",
    resourceType: "case-study" as const,
    category: "financial" as const,
    targetAudience: ["investor", "owner"],
    difficulty: "intermediate" as const,
    isPremium: false,
    tags: ["success-story", "turnaround", "investment", "cashflow"],
    content: JSON.stringify({
      timeline: "18 months",
      investment: {
        purchase: 200000,
        renovation: 35000,
        workingCapital: 15000,
        total: 250000
      },
      improvements: [
        "Upgraded to high-efficiency equipment",
        "Implemented mobile payment system",
        "Added free WiFi and comfortable seating",
        "Launched loyalty program",
        "Extended operating hours"
      ],
      results: {
        revenueIncrease: "65%",
        noi: 80000,
        cashOnCash: "32%"
      }
    }),
    rating: 4.9,
    useCount: 16780,
  },
];

// Seed vendor directory
const vendorData = [
  {
    companyName: "Dexter Laundry",
    category: "Equipment",
    description: "Leading manufacturer of commercial laundry equipment. Specializes in washers, dryers, and payment systems with industry-leading warranties. Founded in 1894, offering ISO-9001 and Energy-Star certified products.",
    verified: true,
  },
  {
    companyName: "Alliance Laundry Systems",
    category: "Equipment",
    description: "World's largest manufacturer of commercial laundry equipment. Parent company of Speed Queen, UniMac, and Huebsch brands. Over 110 years of experience with global reach and comprehensive service offerings.",
    verified: true,
  },
  {
    companyName: "Electrolux Professional",
    category: "Equipment",
    description: "Premium commercial laundry solutions with focus on energy efficiency and innovative technology. Strong international presence with 100+ years of experience. Offers full line of washers, dryers, ironers, and water recycling systems.",
    verified: true,
  },
  {
    companyName: "LaundryCard",
    category: "Services",
    description: "Leading provider of cashless payment systems for laundromats. Cloud-based management platform with mobile apps, loyalty programs, and remote monitoring. PCI-DSS and EMV certified with 25+ years of experience.",
    verified: true,
  },
  {
    companyName: "Setomatic Systems",
    category: "Services",
    description: "Innovative payment solutions including card systems, mobile payments, and IoT-enabled remote monitoring for laundromats. 50+ years of experience with PCI-DSS and UL certifications. Comprehensive support and consulting services.",
    verified: true,
  },
  {
    companyName: "Maytag Commercial Laundry",
    category: "Equipment",
    description: "Trusted name in commercial laundry with durable, high-performance equipment. Known for reliability and low cost of ownership. Offers washers, dryers, and complete laundromat solutions with nationwide service network.",
    verified: true,
  },
  {
    companyName: "Huebsch",
    category: "Equipment",
    description: "Commercial laundry equipment manufacturer focusing on vended and on-premise laundry. Part of Alliance Laundry Systems family. Provides high-quality washers and dryers with excellent parts availability.",
    verified: true,
  },
  {
    companyName: "FasCard Systems",
    category: "Services",
    description: "Revolutionary cloud-based payment and management system for laundromats. Real-time monitoring, mobile payment options, and comprehensive business analytics. Industry leader in cashless payment technology.",
    verified: true,
  },
];

// Seed industry benchmarks
const benchmarkData = [
  {
    category: "revenue",
    metric: "revenue_per_sqft",
    description: "Annual revenue per square foot - National average for medium-sized laundromats",
    sampleSize: 850,
    median: 120.0,
    average: 125.0,
    percentile25: 95.0,
    percentile75: 155.0,
    minimum: 60.0,
    maximum: 220.0,
    unit: "USD",
    periodType: "annual",
    year: 2024,
    dataSource: "industry_survey",
    published: true,
  },
  {
    category: "revenue",
    metric: "revenue_per_sqft",
    description: "Annual revenue per square foot - Urban markets",
    region: "Urban",
    sampleSize: 420,
    median: 160.0,
    average: 165.0,
    percentile25: 135.0,
    percentile75: 195.0,
    minimum: 100.0,
    maximum: 280.0,
    unit: "USD",
    periodType: "annual",
    year: 2024,
    dataSource: "industry_survey",
    published: true,
  },
  {
    category: "expenses",
    metric: "utility_cost_percentage",
    description: "Utility costs (water, electric, gas, sewer) as percentage of revenue",
    sampleSize: 1200,
    median: 21.0,
    average: 22.0,
    percentile25: 18.0,
    percentile75: 26.0,
    minimum: 12.0,
    maximum: 35.0,
    unit: "percentage",
    periodType: "annual",
    year: 2024,
    dataSource: "industry_survey",
    published: true,
  },
  {
    category: "labor",
    metric: "labor_cost_percentage",
    description: "Total labor costs as percentage of revenue",
    sampleSize: 980,
    median: 11.5,
    average: 12.0,
    percentile25: 8.0,
    percentile75: 15.0,
    minimum: 0.0,
    maximum: 22.0,
    unit: "percentage",
    periodType: "annual",
    year: 2024,
    dataSource: "industry_survey",
    published: true,
  },
  {
    category: "expenses",
    metric: "rent_percentage",
    description: "Rent expense as percentage of revenue",
    sampleSize: 1100,
    median: 17.5,
    average: 18.0,
    percentile25: 14.0,
    percentile75: 22.0,
    minimum: 8.0,
    maximum: 32.0,
    unit: "percentage",
    periodType: "annual",
    year: 2024,
    dataSource: "industry_survey",
    published: true,
  },
  {
    category: "revenue",
    metric: "noi_margin",
    description: "Net Operating Income (NOI) margin - bottom-line profitability after all operating expenses",
    sampleSize: 750,
    median: 34.0,
    average: 35.0,
    percentile25: 28.0,
    percentile75: 42.0,
    minimum: 15.0,
    maximum: 58.0,
    unit: "percentage",
    periodType: "annual",
    year: 2024,
    dataSource: "industry_survey",
    published: true,
  },
  {
    category: "equipment",
    metric: "turns_per_day",
    description: "Average machine turns per day in high-traffic locations",
    sampleSize: 350,
    median: 8.0,
    average: 8.5,
    percentile25: 6.5,
    percentile75: 10.5,
    minimum: 4.0,
    maximum: 14.0,
    unit: "count",
    periodType: "annual",
    year: 2024,
    dataSource: "third_party",
    published: true,
  },
  {
    category: "marketing",
    metric: "customer_retention_rate",
    description: "Percentage of customers who return within 30 days",
    sampleSize: 520,
    median: 71.0,
    average: 72.0,
    percentile25: 64.0,
    percentile75: 79.0,
    minimum: 45.0,
    maximum: 88.0,
    unit: "percentage",
    periodType: "annual",
    year: 2024,
    dataSource: "third_party",
    published: true,
  },
];

export async function seedResources() {
  console.log("🌱 Starting resource seeding...");

  try {
    // Clear existing data first
    console.log("🧹 Clearing existing data...");
    await db.delete(industryBenchmarks);
    await db.delete(vendors);
    await db.delete(resources);
    console.log("✅ Cleared existing data");

    // Insert calculators
    console.log("📊 Inserting calculator resources...");
    for (const calc of calculatorResources) {
      await db.insert(resources).values(calc);
    }
    console.log(`✅ Inserted ${calculatorResources.length} calculators`);

    // Insert guides
    console.log("📚 Inserting guide resources...");
    for (const guide of guideResources) {
      await db.insert(resources).values(guide);
    }
    console.log(`✅ Inserted ${guideResources.length} guides`);

    // Insert templates
    console.log("📋 Inserting template resources...");
    for (const template of templateResources) {
      await db.insert(resources).values(template);
    }
    console.log(`✅ Inserted ${templateResources.length} templates`);

    // Insert case studies
    console.log("📈 Inserting case study resources...");
    for (const caseStudy of caseStudyResources) {
      await db.insert(resources).values(caseStudy);
    }
    console.log(`✅ Inserted ${caseStudyResources.length} case studies`);

    // Insert vendors
    console.log("🏭 Inserting vendors...");
    for (const vendor of vendorData) {
      await db.insert(vendors).values(vendor);
    }
    console.log(`✅ Inserted ${vendorData.length} vendors`);

    // Insert benchmarks
    console.log("📊 Inserting industry benchmarks...");
    for (const benchmark of benchmarkData) {
      await db.insert(industryBenchmarks).values(benchmark);
    }
    console.log(`✅ Inserted ${benchmarkData.length} benchmarks`);

    console.log("\n🎉 Resource seeding completed successfully!");
    console.log("\nSummary:");
    console.log(`  - ${calculatorResources.length} calculators`);
    console.log(`  - ${guideResources.length} guides`);
    console.log(`  - ${templateResources.length} templates`);
    console.log(`  - ${caseStudyResources.length} case studies`);
    console.log(`  - ${vendorData.length} vendors`);
    console.log(`  - ${benchmarkData.length} benchmarks`);
    console.log(`  - Total: ${calculatorResources.length + guideResources.length + templateResources.length + caseStudyResources.length + vendorData.length + benchmarkData.length} records`);

  } catch (error) {
    console.error("❌ Error seeding resources:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedResources()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
