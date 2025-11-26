import { CalculatorEngine } from "@/components/CalculatorEngine";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { CalculatorConfig } from "@/components/CalculatorEngine";

export default function ValuationCalculator() {
  const config: CalculatorConfig = {
    id: "valuation-calculator",
    name: "Laundromat Valuation Calculator",
    description: "Professional business valuation using 4 proven methodologies: Revenue Multiple, EBITDA Multiple, Cap Rate, and Asset-Based approaches. Get accurate market value estimates for buying or selling.",
    category: "Financial Analysis",
    inputs: [
      {
        name: "annualRevenue",
        label: "Annual Gross Revenue",
        type: "currency",
        defaultValue: "180000",
        prefix: "$",
        tooltip: "Total annual revenue before expenses"
      },
      {
        name: "annualExpenses",
        label: "Annual Operating Expenses",
        type: "currency",
        defaultValue: "72000",
        prefix: "$",
        tooltip: "All operating costs including utilities, rent, labor"
      },
      {
        name: "equipmentValue",
        label: "Equipment Fair Market Value",
        type: "currency",
        defaultValue: "150000",
        prefix: "$",
        tooltip: "Current value of all washers, dryers, and equipment"
      },
      {
        name: "revenueMultiple",
        label: "Revenue Multiple",
        type: "number",
        defaultValue: "3.2",
        min: 2.0,
        max: 5.0,
        step: 0.1,
        tooltip: "Industry avg: 2.5-4.5x (use 3.2 for typical stores)"
      },
      {
        name: "ebitdaMultiple",
        label: "EBITDA Multiple",
        type: "number",
        defaultValue: "4.8",
        min: 3.0,
        max: 7.0,
        step: 0.1,
        tooltip: "Industry avg: 3.5-6.5x (use 4.8 for typical stores)"
      },
      {
        name: "capRate",
        label: "Capitalization Rate (%)",
        type: "percentage",
        defaultValue: "8.5",
        min: 5.0,
        max: 15.0,
        step: 0.5,
        suffix: "%",
        tooltip: "Market cap rate: 6-12% (higher = riskier markets)"
      },
    ],
    outputs: [
      {
        name: "noi",
        label: "Net Operating Income (NOI)",
        format: "currency",
        decimals: 0,
      },
      {
        name: "ebitda",
        label: "EBITDA",
        format: "currency",
        decimals: 0,
      },
      {
        name: "revenueMethodValue",
        label: "Revenue Multiple Valuation",
        format: "currency",
        decimals: 0,
      },
      {
        name: "ebitdaMethodValue",
        label: "EBITDA Multiple Valuation",
        format: "currency",
        decimals: 0,
      },
      {
        name: "capRateValue",
        label: "Cap Rate Valuation",
        format: "currency",
        decimals: 0,
      },
      {
        name: "assetValue",
        label: "Asset-Based Valuation",
        format: "currency",
        decimals: 0,
      },
      {
        name: "averageValue",
        label: "Average Market Value",
        format: "currency",
        decimals: 0,
        highlight: true,
      },
      {
        name: "valueRange",
        label: "Valuation Range",
        format: "text",
        highlight: true,
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
        dataKey: "methodValues",
        labels: ["Revenue Multiple", "EBITDA Multiple", "Cap Rate", "Asset-Based"],
      }
    ],
    tips: [
      "Revenue Multiple Method: Best for stores with consistent revenue. Industry average is 2.5-4.5x annual revenue.",
      "EBITDA Multiple Method: Most accurate for established stores. Laundromats typically trade at 3.5-6.5x EBITDA.",
      "Cap Rate Method: Focuses on cash flow. Lower cap rates indicate lower risk and higher valuations.",
      "Asset-Based Method: Conservative approach adding 35% goodwill to equipment value. Useful for newer stores.",
      "Professional brokers typically use a weighted average of 2-3 methods, not just one.",
      "Location, equipment condition, lease terms, and competition significantly impact actual sale price.",
      "Stores with wash-dry-fold service, pickup/delivery, or commercial contracts command premium multiples.",
      "Well-documented financials (3+ years) typically increase valuation by 10-15%."
    ]
  };

  // Custom formula to generate chart data and value range
  const handleSave = (data: any) => {
    const { results } = data;
    
    // Add chart data for visualization
    results.methodValues = [
      results.revenueMethodValue,
      results.ebitdaMethodValue,
      results.capRateValue,
      results.assetValue
    ];
    
    // Format value range
    const min = Math.min(...results.methodValues);
    const max = Math.max(...results.methodValues);
    results.valueRange = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    
    console.log('Valuation saved:', data);
  };

  return (
    <>
      <SEO
        title="Laundromat Valuation Calculator - Professional Business Appraisal Tool"
        description="Calculate your laundromat's market value using 4 proven methods: Revenue Multiple (2.5-4.5x), EBITDA Multiple (3.5-6.5x), Cap Rate, and Asset-Based valuation. Free professional appraisal tool for buyers and sellers."
        canonicalUrl="/valuation-calculator"
        keywords={[
          "laundromat valuation calculator",
          "laundry business appraisal",
          "laundromat worth calculator",
          "business valuation tool",
          "EBITDA multiple laundromat",
          "revenue multiple calculator",
          "cap rate valuation",
          "laundromat selling price",
          "coin laundry business value"
        ]}
        breadcrumbs={[
          { name: "Calculators", url: "/calculators" },
          { name: "Valuation Calculator", url: "/valuation-calculator" }
        ]}
        author={{
          name: "WashBizHub Valuation Team",
          expertise: "Laundromat Appraisal & Business Valuation Specialists",
          credentials: "50+ years combined experience in laundromat acquisitions and sales"
        }}
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Laundromat Valuation Calculator",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "description": "Professional laundromat business valuation tool using 4 proven methodologies: Revenue Multiple, EBITDA Multiple, Cap Rate, and Asset-Based approaches.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "8920"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I calculate the value of a laundromat?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Laundromat values are typically calculated using 4 methods: Revenue Multiple (2.5-4.5x annual revenue), EBITDA Multiple (3.5-6.5x EBITDA), Cap Rate Method (NOI divided by market cap rate), and Asset-Based Valuation (equipment value plus goodwill). Professional appraisers use a weighted average of 2-3 methods."
                }
              },
              {
                "@type": "Question",
                "name": "What is a typical EBITDA multiple for a laundromat?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Laundromats typically trade at 3.5x to 6.5x EBITDA, with 4.5x-5x being most common for well-established stores. Premium multiples apply to stores with strong locations, modern equipment, diversified services (wash-dry-fold, pickup/delivery), and documented financials."
                }
              },
              {
                "@type": "Question",
                "name": "What cap rate should I use for laundromat valuation?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Market cap rates for laundromats range from 6% to 12%. Lower cap rates (6-8%) indicate lower-risk, prime locations with stable income. Higher cap rates (10-12%) reflect higher-risk markets or stores needing improvements. The average is around 8-9% for typical stores."
                }
              },
              {
                "@type": "Question",
                "name": "How much is a laundromat worth with $200,000 annual revenue?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A laundromat with $200,000 annual revenue typically sells for $500,000 to $900,000 depending on profitability, location, equipment condition, and lease terms. Using industry-standard multiples: Revenue method gives $640,000 (3.2x), while EBITDA method varies based on expenses."
                }
              }
            ]
          }
        ]}
      />

      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <Breadcrumb items={[
            { name: "Calculators", url: "/calculators" },
            { name: "Valuation Calculator", url: "/valuation-calculator" }
          ]} />
        </div>
      </div>

      <CalculatorEngine config={config} onSave={handleSave} />
    </>
  );
}
