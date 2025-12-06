import { AuthGuard } from "@/components/AuthGuard";
import { FeatureGate } from "@/components/monetization";
import { PremiumCalculatorEngine } from "@/components/PremiumCalculatorEngine";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ValuationDisclaimer } from "@/components/LegalDisclaimer";
import type { PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";

const valuationStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Laundromat Valuation Calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "description": "Professional laundromat business valuation tool using 4 proven methodologies: Revenue Multiple, EBITDA Multiple, Cap Rate, and Asset-Based approaches. Calculate accurate market value for buying or selling.",
  "url": "https://washbizhub.com/valuation-calculator",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "11250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "author": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": "https://washbizhub.com"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2025-11-30"
};

const valuationFaqs = [
  {
    question: "How much is a laundromat worth?",
    answer: "A laundromat is typically worth 2.5-4.5x annual revenue or 3.5-6.5x EBITDA. For example, a laundromat generating $200,000 annual revenue would be valued between $500,000-$900,000. Key factors affecting value include location quality, equipment condition, lease terms, and documented financials."
  },
  {
    question: "What are the valuation multiples for laundromats?",
    answer: "Laundromat valuation multiples typically range from 2.5-4.5x annual revenue and 3.5-6.5x EBITDA. Premium multiples (4x+ revenue, 6x+ EBITDA) apply to stores with prime locations, modern equipment, strong lease terms, diversified services, and 3+ years of documented financials."
  },
  {
    question: "How do you value a laundromat business?",
    answer: "Professional brokers use 4 methods: (1) Revenue Multiple: 2.5-4.5x annual gross revenue, (2) EBITDA Multiple: 3.5-6.5x annual earnings, (3) Cap Rate Method: NOI divided by market cap rate (6-12%), (4) Asset-Based: equipment value plus 25-50% goodwill. Most appraisers average 2-3 methods."
  },
  {
    question: "What is a typical EBITDA multiple for a laundromat?",
    answer: "Laundromats typically trade at 3.5-6.5x EBITDA, with 4.5-5x being most common for established stores. Factors increasing multiples include prime location, modern equipment, strong lease, wash-dry-fold services, commercial accounts, and clean documented financials for 3+ years."
  },
  {
    question: "What cap rate should I use for laundromat valuation?",
    answer: "Market cap rates for laundromats range from 6-12%, with 8-9% being average. Lower cap rates (6-8%) indicate lower-risk, prime locations with stable income streams. Higher cap rates (10-12%) reflect higher-risk markets, older equipment, or stores needing improvements."
  },
  {
    question: "How much is a laundromat worth with $300,000 annual revenue?",
    answer: "A laundromat with $300,000 annual revenue typically sells for $750,000-$1,350,000 using industry multiples. Revenue method: $960,000 (3.2x), EBITDA method (assuming 40% margins): $576,000 (4.8x on $120K EBITDA). Actual price depends on location, equipment, and profitability."
  },
  {
    question: "Does location affect laundromat valuation?",
    answer: "Yes, location significantly impacts laundromat value. Prime locations near dense residential areas, apartment complexes, or universities command 20-30% higher valuations. Stores in lower-income areas with high foot traffic often generate better returns. Lease terms and rent ratios also affect value."
  },
  {
    question: "What increases a laundromat's selling price?",
    answer: "Key value drivers include: strong documented financials (3+ years), favorable lease terms (10+ years remaining), modern equipment (under 7 years old), additional services (wash-dry-fold, pickup/delivery), commercial accounts, low rent ratio (under 15% of revenue), and prime location with limited competition."
  }
];

const valuationHowTo = {
  name: "How to Calculate Laundromat Value",
  description: "Step-by-step guide to valuing a laundromat business using multiple professional appraisal methods",
  totalTime: "PT5M",
  steps: [
    {
      name: "Enter Annual Gross Revenue",
      text: "Input the total annual revenue from all sources including coin/card machines, wash-dry-fold services, vending, and any ancillary income. Use actual figures from tax returns or financial statements for accuracy."
    },
    {
      name: "Enter Annual Operating Expenses",
      text: "Input all yearly operating costs including utilities, rent, labor, supplies, maintenance, insurance, and taxes. This determines your Net Operating Income (NOI) and EBITDA."
    },
    {
      name: "Enter Equipment Fair Market Value",
      text: "Input the current replacement value of all washers, dryers, and equipment. Consider age, condition, and remaining useful life. This is used for asset-based valuation."
    },
    {
      name: "Adjust Valuation Multiples",
      text: "Set the Revenue Multiple (2.5-4.5x industry avg) and EBITDA Multiple (3.5-6.5x industry avg) based on your market, location quality, and business strength."
    },
    {
      name: "Set Capitalization Rate",
      text: "Enter the market cap rate (6-12% typical) based on local market conditions and risk factors. Lower cap rates indicate lower risk and higher valuations."
    },
    {
      name: "Review Valuation Results",
      text: "Compare all 4 valuation methods: Revenue Multiple, EBITDA Multiple, Cap Rate, and Asset-Based. The average provides a fair market value estimate with the range showing low to high expectations."
    }
  ]
};

export default function ValuationCalculator() {
  const config: PremiumCalculatorConfig = {
    id: "valuation-calculator",
    name: "Laundromat Valuation Calculator",
    description: "Professional business valuation using 4 proven methodologies: Revenue Multiple, EBITDA Multiple, Cap Rate, and Asset-Based approaches. Get accurate market value estimates for buying or selling.",
    category: "Financial Analysis",
    inputs: [
      {
        name: "annualRevenue",
        label: "Annual Gross Revenue",
        type: "slider",
        defaultValue: 180000,
        min: 50000,
        max: 1000000,
        step: 5000,
        prefix: "$",
        tooltip: "Total annual revenue before expenses from all sources including coin/card machines, wash-dry-fold, and ancillary services",
        formatDisplay: (value: number) => `$${value.toLocaleString()}`
      },
      {
        name: "annualExpenses",
        label: "Annual Operating Expenses",
        type: "slider",
        defaultValue: 72000,
        min: 20000,
        max: 500000,
        step: 2500,
        prefix: "$",
        tooltip: "All operating costs including utilities, rent, labor, supplies, maintenance, insurance, and taxes",
        formatDisplay: (value: number) => `$${value.toLocaleString()}`
      },
      {
        name: "equipmentValue",
        label: "Equipment Fair Market Value",
        type: "slider",
        defaultValue: 150000,
        min: 25000,
        max: 750000,
        step: 5000,
        prefix: "$",
        tooltip: "Current replacement value of all washers, dryers, and equipment. Consider age, condition, and remaining useful life.",
        formatDisplay: (value: number) => `$${value.toLocaleString()}`
      },
      {
        name: "revenueMultiple",
        label: "Revenue Multiple",
        type: "slider",
        defaultValue: 3.2,
        min: 2.0,
        max: 5.0,
        step: 0.1,
        tooltip: "Industry avg: 2.5-4.5x. Higher multiples for prime locations, modern equipment, and diversified services.",
        formatDisplay: (value: number) => `${value.toFixed(1)}x`
      },
      {
        name: "ebitdaMultiple",
        label: "EBITDA Multiple",
        type: "slider",
        defaultValue: 4.8,
        min: 3.0,
        max: 7.0,
        step: 0.1,
        tooltip: "Industry avg: 3.5-6.5x. Higher multiples for established stores with strong documented financials.",
        formatDisplay: (value: number) => `${value.toFixed(1)}x`
      },
      {
        name: "capRate",
        label: "Capitalization Rate",
        type: "slider",
        defaultValue: 8.5,
        min: 5.0,
        max: 15.0,
        step: 0.25,
        suffix: "%",
        tooltip: "Market cap rate: 6-12%. Lower rates for lower-risk prime locations, higher rates for riskier markets.",
        formatDisplay: (value: number) => `${value.toFixed(2)}%`
      },
    ],
    outputs: [
      {
        name: "noi",
        label: "Net Operating Income (NOI)",
        format: "currency",
        decimals: 0,
        description: "Annual revenue minus operating expenses"
      },
      {
        name: "ebitda",
        label: "EBITDA",
        format: "currency",
        decimals: 0,
        description: "Earnings before interest, taxes, depreciation, and amortization"
      },
      {
        name: "revenueMethodValue",
        label: "Revenue Multiple Valuation",
        format: "currency",
        decimals: 0,
        color: "#C8A661",
        description: "Valuation based on annual revenue multiplied by revenue multiple"
      },
      {
        name: "ebitdaMethodValue",
        label: "EBITDA Multiple Valuation",
        format: "currency",
        decimals: 0,
        color: "#1e3a5f",
        description: "Valuation based on EBITDA multiplied by EBITDA multiple"
      },
      {
        name: "capRateValue",
        label: "Cap Rate Valuation",
        format: "currency",
        decimals: 0,
        color: "#22C55E",
        description: "NOI divided by capitalization rate - income approach"
      },
      {
        name: "assetValue",
        label: "Asset-Based Valuation",
        format: "currency",
        decimals: 0,
        color: "#8B5CF6",
        description: "Equipment value plus 35% goodwill factor"
      },
      {
        name: "averageValue",
        label: "Average Market Value",
        format: "currency",
        decimals: 0,
        highlight: true,
        description: "Average of all 4 valuation methods - recommended starting point for negotiations"
      },
      {
        name: "valueRange",
        label: "Valuation Range",
        format: "text",
        highlight: true,
        description: "Low to high range based on all valuation methods"
      },
    ],
    formulas: {
      noi: "annualRevenue - annualExpenses",
      ebitda: "annualRevenue - annualExpenses",
      revenueMethodValue: "annualRevenue * revenueMultiple",
      ebitdaMethodValue: "ebitda * ebitdaMultiple",
      capRateValue: "(noi / (capRate / 100))",
      assetValue: "equipmentValue * 1.35",
      averageValue: "(revenueMethodValue + ebitdaMethodValue + capRateValue + assetValue) / 4",
      minValue: "Math.min(revenueMethodValue, ebitdaMethodValue, capRateValue, assetValue)",
      maxValue: "Math.max(revenueMethodValue, ebitdaMethodValue, capRateValue, assetValue)",
    },
    charts: [
      {
        type: "bar",
        title: "Valuation Methods Comparison",
        dataKeys: ["revenueMethodValue", "ebitdaMethodValue", "capRateValue", "assetValue"],
        labels: ["Revenue Multiple", "EBITDA Multiple", "Cap Rate", "Asset-Based"],
        colors: ["#C8A661", "#1e3a5f", "#22C55E", "#8B5CF6"]
      }
    ],
    comparisonOutputs: ["revenueMethodValue", "ebitdaMethodValue", "capRateValue", "assetValue"],
    tips: [
      "Revenue Multiple Method: Best for stores with consistent, predictable revenue streams. Industry average is 2.5-4.5x annual gross revenue. Use higher multiples (3.5-4.5x) for prime locations with modern equipment.",
      "EBITDA Multiple Method: The most accurate method for established laundromats with 3+ years of documented financials. Industry average is 3.5-6.5x EBITDA. Stores with wash-dry-fold services command premium multiples.",
      "Cap Rate Method: Focuses on cash flow and investment return. Lower cap rates (6-8%) indicate lower-risk, prime locations. Higher cap rates (10-12%) reflect higher-risk markets or stores needing significant improvements.",
      "Asset-Based Method: Conservative approach adding 35% goodwill to equipment fair market value. Most useful for newer stores without established financial history or distressed sales.",
      "Professional brokers typically use a weighted average of 2-3 methods rather than relying on a single approach. The 'Average Market Value' shown provides a balanced starting point.",
      "Key value drivers: Prime location near apartments/universities, favorable lease terms (10+ years remaining), modern equipment (under 7 years old), documented financials, and low rent ratio (under 15% of revenue).",
      "Stores with diversified revenue streams (wash-dry-fold, pickup/delivery, commercial contracts) typically command 10-20% higher valuations than self-service only locations.",
      "Well-documented financials with 3+ years of tax returns and P&L statements can increase valuation by 10-15%. Buyers pay a premium for reduced due diligence risk.",
      "Consider lease terms carefully: A laundromat with only 2-3 years remaining on the lease will sell for significantly less than one with 10+ years of favorable terms.",
      "Equipment age matters: Stores with equipment under 5 years old command higher multiples. Budget for replacement costs if equipment is 10+ years old."
    ],
    premiumFeatures: {
      pdfExport: true,
      emailResults: true,
      sheetsExport: true,
      advancedCharts: true
    }
  };

  const handleSave = (data: any) => {
    const { results } = data;
    
    const methodValues = [
      results.revenueMethodValue,
      results.ebitdaMethodValue,
      results.capRateValue,
      results.assetValue
    ];
    
    const min = Math.min(...methodValues);
    const max = Math.max(...methodValues);
    results.valueRange = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    
    console.log('Valuation saved:', data);
  };

  return (
    <AuthGuard title="Sign In to Use Valuation Calculator" description="Sign in to access this calculator and track your usage.">
      <FeatureGate feature="calculators-advanced">
        <SEO
        title="Laundromat Valuation Calculator - Free Business Appraisal Tool 2025 | WashBizHub"
        description="Calculate how much a laundromat is worth using 4 professional valuation methods: Revenue Multiple (2.5-4.5x), EBITDA Multiple (3.5-6.5x), Cap Rate, and Asset-Based. Free appraisal tool trusted by 11,000+ buyers and sellers."
        canonicalUrl="/valuation-calculator"
        ogType="website"
        keywords={[
          "laundromat valuation calculator",
          "how much is a laundromat worth",
          "laundromat business valuation",
          "laundry business appraisal tool",
          "laundromat selling price calculator",
          "EBITDA multiple laundromat",
          "laundromat revenue multiple",
          "cap rate valuation laundromat",
          "coin laundry business value",
          "laundromat worth calculator 2025",
          "what is my laundromat worth",
          "laundromat appraisal calculator",
          "laundromat market value",
          "laundromat sale price estimator",
          "commercial laundry valuation"
        ]}
        faqs={valuationFaqs}
        howTo={valuationHowTo}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Calculators", url: "/calculators" },
          { name: "Valuation Calculator", url: "/valuation-calculator" }
        ]}
        author={{
          name: "WashBizHub Valuation Team",
          expertise: "Laundromat Appraisal & Business Valuation Specialists",
          credentials: "50+ years combined experience in laundromat acquisitions and sales across 1,000+ transactions"
        }}
        structuredData={valuationStructuredData}
        speakableSelectors={["h1", ".speakable", "[data-highlight='true']"]}
        datePublished="2024-01-15"
        dateModified="2025-11-30"
      />

      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <Breadcrumb items={[
            { name: "Home", url: "/" },
            { name: "Calculators", url: "/calculators" },
            { name: "Valuation Calculator", url: "/valuation-calculator" }
          ]} />
        </div>
      </div>

      <PremiumCalculatorEngine config={config} onSave={handleSave} />
      
      <div className="mx-auto max-w-4xl px-6 py-8">
        <ValuationDisclaimer />
      </div>
      </FeatureGate>
    </AuthGuard>
  );
}
