import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, DollarSign, Building2, TrendingUp } from 'lucide-react';
import { SEO } from '@/components/SEO';

const RE_PARTNERS = [
  {
    name: 'David Allen Capital',
    description: 'Enterprise-level commercial real estate and equipment financing',
    approval: '7-14 days',
    terms: '10-25 year terms',
    ltv: 'Up to 75% LTV',
    minLoan: '$100,000',
    maxLoan: '$5,000,000+',
    rate: 'Institutional rates',
    commission: '2%',
    links: [
      { title: 'Enterprise Financing', url: 'https://davidallewncapital.com/nicholaskremers' },
    ]
  },
  {
    name: 'Advance Funds Network',
    description: 'Real estate + equipment combined financing packages',
    approval: '5-7 days',
    terms: 'Custom structures available',
    ltv: 'Up to 85% combined LTV',
    minLoan: '$75,000',
    maxLoan: '$2,500,000',
    rate: 'Competitive commercial rates',
    commission: '1.5%+',
    links: [
      { title: 'Real Estate Application', url: 'https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3' },
      { title: 'Commercial Program', url: 'https://app.advancefundsnetwork.com/partner-landing/OEO602XAIiZkhill7WmMwJ7NEfB3' },
    ]
  },
  {
    name: 'South End Capital',
    description: 'SBA loans and equipment-focused commercial real estate financing',
    approval: '10-15 business days',
    terms: '5-20 year terms with SBA backing',
    ltv: 'Up to 80% LTV (SBA programs)',
    minLoan: '$50,000',
    maxLoan: '$2,000,000+',
    rate: 'SBA favorable rates',
    commission: '0.5%',
    links: [
      { title: 'SBA Financing', url: 'https://southendcapital.com/?rp=RP020811&sub_id=Laundromat' },
      { title: 'Equipment Programs', url: 'https://southendcapital.com/partners/?rp=RP020811&sub_id=Laundromat' },
    ]
  }
];

const REAL_ESTATE_KEYWORDS = [
  'laundromat real estate financing',
  'commercial property loan for laundromat',
  'SBA 504 loan laundromat',
  'laundromat building financing',
  'commercial real estate loan laundromat',
  'buy laundromat property',
  'laundromat property purchase financing',
  'commercial building loan coin laundry',
  'laundromat real estate investment',
  'SBA loan for laundromat property',
  'laundromat commercial mortgage',
  'coin laundry real estate loan',
  'laundromat property refinance',
  'laundromat build out financing',
  'commercial laundry property loan'
];

const REAL_ESTATE_FAQS = [
  {
    question: "How do I finance laundromat real estate?",
    answer: "Finance laundromat real estate through commercial mortgage lenders, SBA 504 loans, or specialized financing partners. You'll need 15-25% down payment, 650+ credit score, 2+ years business history, and strong cash flow (1.25x debt service coverage). SBA programs offer up to 80% LTV with 5-20 year terms, while conventional commercial loans offer 75% LTV with competitive rates."
  },
  {
    question: "What is an SBA 504 loan for laundromat?",
    answer: "An SBA 504 loan is a government-backed financing program ideal for purchasing laundromat real estate. It offers up to $5.5 million with only 10-15% down payment, below-market fixed interest rates, and 20-25 year terms. The structure combines a bank loan (50%), SBA-backed CDC loan (40%), and your down payment (10%). Perfect for buying laundromat buildings or expanding facilities."
  },
  {
    question: "What are commercial property financing options for laundromats?",
    answer: "Commercial property financing options include: SBA 504 loans (10-15% down, 20-25 year terms), SBA 7(a) loans (up to $5M), conventional commercial mortgages (20-25% down, 5-20 year terms), and portfolio loans from specialized lenders. Rates range from 6-9% depending on credit profile, property type, and loan structure."
  },
  {
    question: "How much down payment is needed for laundromat property?",
    answer: "Down payment requirements for laundromat property typically range from 10-25%. SBA 504 loans require only 10-15% down. Conventional commercial mortgages require 20-25% down. Strong operators with excellent credit and business history may qualify for lower down payments through specialized lenders offering up to 85% LTV."
  },
  {
    question: "Can I finance laundromat build-out and renovation?",
    answer: "Yes, laundromat build-out and renovation can be financed through construction loans, SBA loans, or equipment financing packages. Typical build-out costs of $50-$150 per square foot can be financed with 5-15 year terms. Combined financing packages cover both real estate and equipment, simplifying the funding process for new laundromat construction."
  },
  {
    question: "What credit score is needed for commercial real estate loan?",
    answer: "Commercial real estate loans for laundromats typically require a minimum 650 personal FICO score and 75+ business credit score. SBA programs may accept lower scores with strong compensating factors. Higher credit scores (700+) qualify for better rates and terms. Lenders also evaluate debt service coverage ratio, business history, and cash flow."
  },
  {
    question: "How long does commercial real estate financing take?",
    answer: "Commercial real estate financing timelines vary by loan type: conventional commercial mortgages take 30-60 days, SBA 504 loans take 45-90 days, and specialized lenders may close in 5-14 days for qualified applicants. The process includes application, underwriting, property appraisal, and closing. Having documents ready can significantly speed up approval."
  },
  {
    question: "Can I refinance my laundromat property?",
    answer: "Yes, refinancing laundromat property can unlock equity for expansion, lower your interest rate, or extend your loan term. Cash-out refinancing allows you to extract equity for equipment upgrades or acquiring additional locations. Most lenders offer refinance programs with 70-80% LTV, and SBA programs may provide favorable terms for existing laundromat owners."
  }
];

const REAL_ESTATE_HOWTO = {
  name: "How to Get Laundromat Real Estate Financing",
  description: "Complete guide to financing commercial property for laundromats including SBA 504 loans, conventional mortgages, and specialized lending programs. Learn requirements, timelines, and how to qualify.",
  totalTime: "P60D",
  steps: [
    {
      name: "Assess Your Financial Position",
      text: "Review your credit profile (650+ FICO required), calculate your available down payment (15-25% typically), and gather 2 years of business and personal tax returns. Ensure your existing operations show strong cash flow with at least 1.25x debt service coverage ratio."
    },
    {
      name: "Identify Property and Get Valuation",
      text: "Find the laundromat property you want to purchase or refinance. Get a professional commercial appraisal to determine fair market value. Verify zoning allows commercial laundry operations and review any environmental considerations."
    },
    {
      name: "Choose Your Financing Program",
      text: "Compare financing options: SBA 504 (10-15% down, 20-25 year terms, below-market rates), SBA 7(a) (flexible use, up to $5M), conventional commercial mortgage (faster closing, 20-25% down), or specialized lenders like David Allen Capital for larger transactions."
    },
    {
      name: "Prepare Required Documentation",
      text: "Gather business plan with financial projections, 2-3 years business and personal tax returns, profit & loss statements, balance sheets, 12 months bank statements, current lease agreements, and detailed property information including appraisal."
    },
    {
      name: "Submit Applications to Lenders",
      text: "Apply with multiple lenders to compare terms. Work with South End Capital for SBA programs, Advance Funds Network for combined real estate + equipment packages, or David Allen Capital for enterprise-level transactions over $100,000."
    },
    {
      name: "Complete Underwriting Process",
      text: "Respond promptly to lender requests for additional information. Underwriting includes credit analysis, property appraisal review, cash flow verification, and business viability assessment. Timeline is typically 2-8 weeks depending on loan type."
    },
    {
      name: "Close and Fund the Loan",
      text: "Review final loan documents, verify all terms match your expectations, and complete closing. Funds are disbursed to seller or used for refinancing. Plan for closing costs of 2-5% of loan amount including appraisal, legal, and title fees."
    }
  ]
};

const REAL_ESTATE_BREADCRUMBS = [
  { name: "Home", url: "/" },
  { name: "Funding", url: "/funding" },
  { name: "Real Estate Financing", url: "/real-estate-financing" }
];

const FINANCIAL_SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "Laundromat Real Estate Financing - WashBizHub",
  "description": "Commercial real estate financing for laundromat property purchase, build-out, and refinancing. SBA 504 loans, conventional mortgages, and specialized programs with loans from $50K to $5M+.",
  "url": "https://washbizhub.com/real-estate-financing",
  "serviceType": "Commercial Real Estate Financing",
  "provider": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": "https://washbizhub.com"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Real Estate Financing Options",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "SBA 504 Loan",
          "description": "Government-backed financing with 10-15% down payment and 20-25 year terms for laundromat property"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "Commercial Mortgage",
          "description": "Conventional commercial real estate loan with competitive rates and flexible terms"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "Build-Out Financing",
          "description": "Construction and renovation financing for new laundromat facilities"
        }
      }
    ]
  },
  "termsOfService": "https://washbizhub.com/terms",
  "feesAndCommissionsSpecification": "Real estate financing from $50,000 to $5,000,000+. SBA programs offer 10-15% down. Terms available from 5 to 25 years."
};

export default function RealEstateFinancing() {
  return (
    <>
      <SEO
        title="Laundromat Real Estate Financing | SBA 504 Loan & Commercial Property Loans 2025"
        description="Finance laundromat commercial real estate. SBA 504 loans, property purchase, build-out, refinance. $50K-$5M+ loans. 5-25 year terms. Up to 85% LTV. Compare lenders now."
        canonicalUrl="/real-estate-financing"
        keywords={REAL_ESTATE_KEYWORDS}
        faqs={REAL_ESTATE_FAQS}
        howTo={REAL_ESTATE_HOWTO}
        breadcrumbs={REAL_ESTATE_BREADCRUMBS}
        structuredData={FINANCIAL_SERVICE_SCHEMA}
        author={{
          name: "WashBizHub",
          expertise: "Laundromat Industry Expert",
          credentials: "Leading laundromat resource platform with commercial real estate financing partnerships"
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white py-16 border-b border-emerald-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8" />
              <h1 className="text-5xl font-bold">Real Estate Financing</h1>
            </div>
            <p className="text-xl text-emerald-200 mb-4">
              Finance commercial property for laundromats. Purchase, refinance, or build. Up to $2M+. 5-20 year terms.
            </p>
            <Badge className="bg-emerald-500/30 text-emerald-100">
              <CheckCircle className="w-4 h-4 mr-2" />
              Enterprise to SBA-backed programs available
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Real Estate Opportunities</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Property Purchase</CardTitle>
                  <CardDescription>Buy laundromat building or acquire property for startup</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Own the building instead of leasing. Build equity, secure location, expand operations.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Example Property:</span> 2,500 sq ft building, $350K purchase price</div>
                    <div><span className="font-semibold">Financing:</span> 20% down ($70K), $280K financed at 6.5% over 20 years</div>
                    <div><span className="font-semibold">Monthly Payment:</span> $1,850</div>
                    <div><span className="font-semibold">Projected Revenue:</span> $8K-$12K/month laundromat income</div>
                    <div><span className="font-semibold">Equity Build:</span> $500/month principal paydown + appreciation</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Build-Out/Renovation</CardTitle>
                  <CardDescription>Finance renovation or complete facility buildout</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Lease a space and finance the build-out. Modern, efficient laundromat from day one.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Project Scope:</span> 3,000 sq ft buildout, new equipment, utilities</div>
                    <div><span className="font-semibold">Total Cost:</span> $150,000</div>
                    <div><span className="font-semibold">Financing:</span> $150K at 7% over 5 years = $2,845/month</div>
                    <div><span className="font-semibold">Payback:</span> 3-4 months (assumes $10K monthly revenue)</div>
                    <div><span className="font-semibold">Benefit:</span> Modern facility attracts premium customers, strong margins</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Refinance & Equity Extract</CardTitle>
                  <CardDescription>Refinance existing property to fund expansion</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Own property with equity? Refinance to access capital for expansion or multi-unit growth.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Current Situation:</span> Own $400K property, $200K owed, $200K equity</div>
                    <div><span className="font-semibold">Refinance:</span> $250K new loan at 6% over 20 years</div>
                    <div><span className="font-semibold">Proceeds:</span> $50K cash out for equipment/expansion</div>
                    <div><span className="font-semibold">Payment:</span> $1,500/month (vs original $1,200)</div>
                    <div><span className="font-semibold">Use Capital:</span> Add 8 new washers/dryers in existing location</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Multi-Unit Portfolio</CardTitle>
                  <CardDescription>Finance acquisition of multiple laundromat locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Scale from single-unit to operator network. Finance multiple properties as portfolio.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Acquisition:</span> 3 existing laundromats in metro area</div>
                    <div><span className="font-semibold">Combined Value:</span> $1,200,000</div>
                    <div><span className="font-semibold">Financing:</span> 75% LTV = $900K at 6.25% over 15 years</div>
                    <div><span className="font-semibold">Monthly Payment:</span> $7,250</div>
                    <div><span className="font-semibold">Combined Revenue:</span> $25K-$30K/month (covers payment 3-4x)</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Minimum Requirements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Property & Business
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Property Requirements:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Zoned commercial/light industrial</li>
                      <li>Minimum 1,500 sq ft (typically)</li>
                      <li>Good parking availability</li>
                      <li>Professional appraisal required</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Business History:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Existing operator: 2+ years history</li>
                      <li>First-time: strong industry experience</li>
                      <li>Proven management team required</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial & Credit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Credit Profile:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Personal FICO: 650+ minimum</li>
                      <li>Business credit score: 75+</li>
                      <li>2 years tax returns (personal)</li>
                      <li>2 years business financials</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Financial Strength:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Down payment: 15-25% typically</li>
                      <li>Debt service coverage: 1.25x+</li>
                      <li>Liquidity reserves: 3-6 months PITI</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Recommended Lenders</h2>
            <p className="text-muted-foreground mb-6">Listed by program flexibility and terms. All partner-vetted for laundromat financing.</p>
            <div className="space-y-4">
              {RE_PARTNERS.map((partner, idx) => (
                <Card key={idx} data-testid={`card-partner-${idx}`} className={idx === 0 ? 'border-green-500 border-2' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle>{partner.name}</CardTitle>
                          {idx === 0 && (
                            <Badge className="bg-green-500/20 text-green-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{partner.description}</CardDescription>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-600">{partner.approval}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 mb-6 text-sm">
                      <div>
                        <span className="font-semibold">Terms:</span>
                        <p className="text-muted-foreground">{partner.terms}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Amount:</span>
                        <p className="text-muted-foreground">${partner.minLoan} - ${partner.maxLoan}</p>
                      </div>
                      <div>
                        <span className="font-semibold">LTV:</span>
                        <p className="text-muted-foreground">{partner.ltv}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Commission:</span>
                        <p className="text-muted-foreground font-bold text-green-600">{partner.commission}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {partner.links.map((link, linkIdx) => (
                        <a key={linkIdx} href={link.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" data-testid={`button-apply-${idx}-${linkIdx}`}>
                            {link.title}
                          </Button>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {REAL_ESTATE_FAQS.map((faq, idx) => (
                <Card key={idx} data-testid={`card-faq-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Own Your Laundromat Location</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Finance purchase, build-out, or portfolio expansion. Flexible terms, competitive rates, fast approval.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://davidallewncapital.com/nicholaskremers" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-emerald-900 hover:bg-emerald-50" data-testid="button-apply-david">
                  Apply with David Allen Capital
                </Button>
              </a>
              <a href="https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-emerald-900 hover:bg-emerald-50" data-testid="button-apply-afn">
                  Apply with Advance Funds Network
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
