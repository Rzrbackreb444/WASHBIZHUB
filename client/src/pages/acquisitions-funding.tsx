import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CheckCircle, DollarSign, Building2 } from 'lucide-react';
import { SEO } from '@/components/SEO';

const ACQUISITION_PARTNERS = [
  {
    name: 'National Business Capital',
    description: 'Established laundromat acquisition financing. Multiple locations, portfolio expansion, and growth capital.',
    approval: '5-10 business days',
    terms: 'Up to 20 years available',
    ltv: 'Up to 85% LTV',
    minLoan: '$100,000',
    maxLoan: 'Multi-million dollar portfolios',
    rate: 'Competitive commercial rates',
    commission: 'Revenue share',
    specialization: 'Acquisition Specialist',
    contactEmail: 'funding@washbizhub.com',
    links: [
      { title: 'Get Acquisition Financing Quote', action: 'email' },
      { title: 'Learn More About Our Acquisitions Program', action: 'info' },
    ]
  }
];

const ACQUISITION_KEYWORDS = [
  'laundromat acquisition financing',
  'buy existing laundromat financing',
  'laundromat acquisition loan',
  'SBA 7a loan laundromat',
  'how to finance laundromat acquisition',
  'laundromat business acquisition loan',
  'buying laundromat with seller financing',
  'laundromat portfolio financing',
  'multi-unit laundromat financing',
  'laundromat purchase financing',
  'existing laundromat business loan',
  'laundromat acquisition capital',
  'buy laundromat SBA loan',
  'laundromat business for sale financing',
  'commercial laundry acquisition loan'
];

const ACQUISITION_FAQS = [
  {
    question: "How do I finance a laundromat acquisition?",
    answer: "Finance a laundromat acquisition through SBA 7(a) loans (up to $5M, 10-25 year terms), conventional commercial loans (15-25% down), seller financing (negotiable terms), or specialized acquisition lenders. Requirements include 2+ years operating experience, 680+ credit score, 15-25% down payment, and strong cash flow from existing operations. Approvals take 5-14 business days for qualified operators."
  },
  {
    question: "What is an SBA 7(a) loan for laundromat acquisition?",
    answer: "An SBA 7(a) loan is the most popular financing option for buying an existing laundromat. It offers up to $5 million with 10-25 year terms, competitive interest rates, and only 10-20% down payment required. The loan can cover purchase price, working capital, and even equipment upgrades. Processing takes 45-90 days with lower rates than conventional loans."
  },
  {
    question: "How to buy an existing laundromat with financing?",
    answer: "To buy an existing laundromat with financing: 1) Get pre-qualified with lenders, 2) Find target laundromat and review financials, 3) Make offer contingent on financing, 4) Complete due diligence and appraisal, 5) Submit full loan application with seller's financial records, 6) Close and transfer ownership. Typical timeline is 60-120 days from offer to closing."
  },
  {
    question: "What down payment is needed for laundromat acquisition?",
    answer: "Down payment for laundromat acquisition ranges from 10-25% depending on financing type: SBA 7(a) loans require 10-20%, conventional commercial loans require 20-25%, and seller financing is negotiable (often 10-30%). Strong operators with excellent credit and multiple locations may qualify for lower down payments through portfolio lenders."
  },
  {
    question: "Can I get seller financing for a laundromat?",
    answer: "Yes, seller financing is common in laundromat acquisitions. Sellers may finance 10-50% of purchase price with flexible terms, often 5-10% down with 5-7 year amortization. Benefits include faster closing, negotiable interest rates, and easier qualification. Combine with SBA or conventional loans for optimal structure. Always have a lawyer review seller financing agreements."
  },
  {
    question: "What financial documents are needed for acquisition financing?",
    answer: "Required documents for laundromat acquisition financing: 3 years personal and business tax returns, 2 years profit & loss statements and balance sheets, last 12 months bank statements, seller's financial records and tax returns, current equipment list and age, lease agreement, and a purchase agreement. Having organized documentation speeds up approval significantly."
  },
  {
    question: "How is acquisition loan amount determined?",
    answer: "Acquisition loan amount is based on: business valuation (typically 2-4x annual earnings/EBITDA), property appraisal, your down payment capability, debt service coverage ratio (1.25x+ required), and lender's LTV limits (up to 85%). Lenders also consider existing cash flow, equipment condition, lease terms, and market competition in their analysis."
  },
  {
    question: "How long does laundromat acquisition financing take?",
    answer: "Laundromat acquisition financing timelines: SBA 7(a) loans take 45-90 days, conventional commercial loans take 30-60 days, seller financing can close in 14-30 days, and specialized acquisition lenders may approve in 5-10 business days. Total acquisition process from offer to closing typically takes 60-120 days including due diligence and legal review."
  }
];

const ACQUISITION_HOWTO = {
  name: "How to Get Laundromat Acquisition Financing",
  description: "Step-by-step guide for experienced operators to finance laundromat acquisitions. Learn requirements for SBA 7(a) loans, conventional financing, and portfolio expansion up to multi-million dollar transactions.",
  totalTime: "P90D",
  steps: [
    {
      name: "Evaluate Your Acquisition Readiness",
      text: "Assess your current portfolio performance with 2+ years operating history and $15K+ monthly EBITDA from existing locations. Verify your credit profile (680+ FICO, 80+ business credit) and calculate available capital for 15-25% down payment plus reserves."
    },
    {
      name: "Identify Acquisition Targets",
      text: "Find laundromats for sale through business brokers, direct outreach to owners, or platforms like WashBizHub marketplace. Evaluate targets based on revenue, location quality, equipment age, lease terms, and growth potential. Request seller's financials for initial review."
    },
    {
      name: "Conduct Due Diligence",
      text: "Thoroughly analyze target laundromat: verify reported revenue through bank statements, review utility bills, inspect equipment condition, evaluate lease terms, analyze local competition, and assess demographic trends. Calculate true operating expenses and realistic projections."
    },
    {
      name: "Determine Financing Structure",
      text: "Choose optimal financing mix: SBA 7(a) for up to $5M with 10-20% down, conventional commercial loan for faster closing, seller financing to reduce bank borrowing, or combination structure. Consider rates, terms, down payment, and closing timeline for each option."
    },
    {
      name: "Get Pre-Qualified with Lenders",
      text: "Apply with acquisition-focused lenders like National Business Capital for pre-qualification. Provide personal financials, current business performance, and acquisition target details. Pre-qualification strengthens your offer and shows sellers you're a serious buyer."
    },
    {
      name: "Submit Formal Application",
      text: "Complete full loan application with all required documents: 3 years tax returns, P&L statements, balance sheets, 12 months bank statements, seller's financial records, equipment list, lease agreement, and purchase contract. Respond promptly to lender requests."
    },
    {
      name: "Complete Underwriting and Close",
      text: "Work with lender through underwriting process including property appraisal, business valuation, and final credit approval. Review closing documents, coordinate with attorneys and title company, and complete closing. Plan for transition and integration of new location."
    }
  ]
};

const ACQUISITION_BREADCRUMBS = [
  { name: "Home", url: "/" },
  { name: "Funding", url: "/funding" },
  { name: "Acquisitions Funding", url: "/acquisitions-funding" }
];

const FINANCIAL_SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "Laundromat Acquisition Financing - WashBizHub",
  "description": "Acquisition financing for established laundromat operators. SBA 7(a) loans, portfolio expansion, and multi-unit growth capital from $100,000 to multi-million dollar transactions.",
  "url": "https://washbizhub.com/acquisitions-funding",
  "serviceType": "Business Acquisition Financing",
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
    "name": "Acquisition Financing Options",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "SBA 7(a) Acquisition Loan",
          "description": "Government-backed financing up to $5M for buying existing laundromats with 10-25 year terms"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "Portfolio Expansion Financing",
          "description": "Multi-location financing for operators scaling to 5-25 unit laundromat portfolios"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "Multi-Million Dollar Acquisition",
          "description": "Enterprise-level financing for large portfolio acquisitions and regional consolidation"
        }
      }
    ]
  },
  "termsOfService": "https://washbizhub.com/terms",
  "feesAndCommissionsSpecification": "Acquisition financing from $100,000 to multi-million dollar portfolios. Up to 85% LTV available. Terms up to 20 years for qualified operators."
};

export default function AcquisitionsFunding() {
  return (
    <>
      <SEO
        title="Laundromat Acquisition Financing | SBA 7(a) Loan & Multi-Unit Expansion 2025"
        description="Finance laundromat acquisitions and multi-unit expansion. $100K-$5M+ for established operators. SBA 7(a) loans, portfolio financing, seller financing options. Fast approvals, competitive rates."
        canonicalUrl="/acquisitions-funding"
        keywords={ACQUISITION_KEYWORDS}
        faqs={ACQUISITION_FAQS}
        howTo={ACQUISITION_HOWTO}
        breadcrumbs={ACQUISITION_BREADCRUMBS}
        structuredData={FINANCIAL_SERVICE_SCHEMA}
        author={{
          name: "WashBizHub",
          expertise: "Laundromat Industry Expert",
          credentials: "Leading laundromat resource platform with acquisition financing partnerships for portfolio operators"
        }}
        productOffers={[
          {
            name: "SBA 7(a) Acquisition Loan",
            description: "Government-backed financing up to $5M for buying existing laundromats. Lowest rates at Prime + 2.75% with 10-25 year terms.",
            price: "100000",
            priceCurrency: "USD",
            availability: "InStock",
            priceValidUntil: "2025-12-31"
          },
          {
            name: "Portfolio Expansion Financing",
            description: "Multi-location financing for operators scaling to 5-25 unit laundromat portfolios. Up to 85% LTV available.",
            price: "500000",
            priceCurrency: "USD",
            availability: "InStock",
            priceValidUntil: "2025-12-31"
          },
          {
            name: "Seller Financing Assistance",
            description: "Structured seller financing with 10-20% down payment. Transition ownership while building equity.",
            price: "200000",
            priceCurrency: "USD",
            availability: "InStock",
            priceValidUntil: "2025-12-31"
          },
          {
            name: "Bridge Loan for Acquisitions",
            description: "Short-term bridge financing for quick laundromat acquisitions. Close in 7-14 days with competitive rates.",
            price: "150000",
            priceCurrency: "USD",
            availability: "InStock",
            priceValidUntil: "2025-12-31"
          }
        ]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8" />
              <h1 className="text-5xl font-bold">Acquisition Financing</h1>
            </div>
            <p className="text-xl text-slate-300 mb-4">
              Expand your laundromat empire. Acquire existing locations or build a multi-unit portfolio. Up to $5M+.
            </p>
            <Badge className="bg-slate-500/30 text-slate-100">
              <CheckCircle className="w-4 h-4 mr-2" />
              For established operators ready to scale
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Multi-Unit Growth Strategies</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Single Location Expansion (2-3 Units)</CardTitle>
                  <CardDescription>Scale from one successful laundromat to a micro-chain</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Proven operator with solid cash flow acquiring nearby locations in the same market.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Current Portfolio:</span> 1 location generating $10K/month revenue</div>
                    <div><span className="font-semibold">Acquisition Target:</span> 2 more locations at $350K-$500K each</div>
                    <div><span className="font-semibold">Total Capital Needed:</span> $800,000</div>
                    <div><span className="font-semibold">Financing:</span> 80% LTV = $640K, 15-year amortization = $5,700/month</div>
                    <div><span className="font-semibold">Combined Portfolio Revenue:</span> $30K+/month (covers financing 5x+)</div>
                    <div><span className="font-semibold">Timeline:</span> 18-24 months to optimize all three locations</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Regional Consolidation (5-10 Units)</CardTitle>
                  <CardDescription>Consolidate fragmented market into dominant regional player</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Experienced operator acquiring 4-5 existing locations in adjacent markets or neighborhoods.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Current Portfolio:</span> 2 locations, $18K/month EBITDA</div>
                    <div><span className="font-semibold">Acquisition Strategy:</span> 4 locations across metro area</div>
                    <div><span className="font-semibold">Combined Portfolio Value:</span> $2.2M</div>
                    <div><span className="font-semibold">Financing:</span> $1.8M at 6.5% over 15 years = $14,300/month</div>
                    <div><span className="font-semibold">Projected Combined Revenue:</span> $50K+/month</div>
                    <div><span className="font-semibold">Scale Benefits:</span> Unified operations, bulk procurement, shared management</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Multi-Market Portfolio (15-25 Units)</CardTitle>
                  <CardDescription>Build enterprise-scale laundromat operator across multiple cities</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Institutional-level operator creating regional laundromat platform across multiple MSAs.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Current Platform:</span> 5 locations, $35K/month combined revenue</div>
                    <div><span className="font-semibold">Acquisition Targets:</span> 10-12 locations across 3-4 cities</div>
                    <div><span className="font-semibold">Total Platform Investment:</span> $4.5M+</div>
                    <div><span className="font-semibold">Financing Structure:</span> $3.6M (80% LTV) + equity</div>
                    <div><span className="font-semibold">Annual EBITDA Potential:</span> $800K-$1M+ across portfolio</div>
                    <div><span className="font-semibold">Exit Strategy:</span> Build to 20+ unit platform for strategic acquisition or PE investment</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distressed Asset Recovery</CardTitle>
                  <CardDescription>Acquire underperforming or distressed laundromats at discounted valuations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Experienced operators acquiring troubled locations, implementing turnaround operations, and creating value.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Typical Scenario:</span> Location $400K ask, declining to $6K/month revenue</div>
                    <div><span className="font-semibold">Root Cause:</span> Poor management, aging equipment, deferred maintenance</div>
                    <div><span className="font-semibold">Acquisition Price:</span> $300K (25% discount)</div>
                    <div><span className="font-semibold">Turnaround Investment:</span> $50K in equipment + systems upgrades</div>
                    <div><span className="font-semibold">New Revenue Potential:</span> $12K-$15K/month (100%+ improvement)</div>
                    <div><span className="font-semibold">Payback Timeline:</span> 24-30 months with 50%+ value creation</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Acquisition Qualification Requirements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Operator Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Minimum History:</p>
                    <p className="text-muted-foreground">2-3 years operating existing laundromat(s)</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Current Operations:</p>
                    <p className="text-muted-foreground">Operating minimum 1-2 locations with established cash flow</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Management Team:</p>
                    <p className="text-muted-foreground">Capable management to handle multi-unit operations</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Track Record:</p>
                    <p className="text-muted-foreground">Demonstrated ability to generate consistent cash flow and manage operations</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Financial Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Current EBITDA:</p>
                    <p className="text-muted-foreground">Minimum $15K-$25K/month from existing operations</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Credit Profile:</p>
                    <p className="text-muted-foreground">Personal FICO 680+, business credit 80+</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Down Payment:</p>
                    <p className="text-muted-foreground">15-25% typical, lower available for strong operators</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Documentation:</p>
                    <p className="text-muted-foreground">3 years tax returns, 2 years profit & loss, last 12 months bank statements</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Acquisition Financing Partner</h2>
            <div className="space-y-4">
              {ACQUISITION_PARTNERS.map((partner, idx) => (
                <Card key={idx} data-testid={`card-partner-${idx}`} className="border-green-500 border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle>{partner.name}</CardTitle>
                          <Badge className="bg-green-500/20 text-green-600">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
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
                        <p className="text-muted-foreground">${partner.minLoan} - {partner.maxLoan}</p>
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
                      <a href={`mailto:${partner.contactEmail}?subject=Laundromat Acquisition Financing Request`}>
                        <Button variant="default" size="sm" data-testid={`button-apply-${idx}`}>
                          Get Acquisition Quote
                        </Button>
                      </a>
                      <a href={`mailto:${partner.contactEmail}?subject=Laundromat Acquisition Program Information`}>
                        <Button variant="outline" size="sm" data-testid={`button-info-${idx}`}>
                          Learn More
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {ACQUISITION_FAQS.map((faq, idx) => (
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

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Laundromat Business?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Get acquisition financing quotes for multi-unit expansion. Contact our partner for enterprise-level growth capital.
            </p>
            <a href="mailto:funding@washbizhub.com?subject=Laundromat Acquisition Financing">
              <Button className="bg-white text-slate-900 hover:bg-slate-50" size="lg" data-testid="button-contact-funding">
                Contact Funding Partner
              </Button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
