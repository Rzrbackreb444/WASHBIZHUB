import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, DollarSign, Zap } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { AuthorExpertise, TrustSignals, RelatedFundingPaths, FundingDisclaimer, ConsultationCTA } from "@/components/FundingEEAT";

const EQUIPMENT_PARTNERS = [
  {
    name: 'Advance Funds Network',
    description: 'Equipment and revenue-based financing solutions',
    approval: '24-48 hours',
    terms: 'Revenue-based or fixed terms',
    ltv: 'Up to 85% of equipment value',
    minLoan: '$15,000',
    maxLoan: '$1,000,000',
    rate: 'Based on revenue model',
    commission: '1.5%+',
    links: [
      { title: 'Submit Application', url: 'https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3' },
      { title: 'Partner Opportunities', url: 'https://app.advancefundsnetwork.com/partner-landing/OEO602XAIiZkhill7WmMwJ7NEfB3' },
    ]
  },
  {
    name: 'MyPartner.io',
    description: 'Fast-track equipment financing for laundromat operators',
    approval: '24-72 hours',
    terms: 'Flexible, 12-84 months',
    ltv: 'Up to 100% of equipment value',
    minLoan: '$5,000',
    maxLoan: '$500,000',
    rate: 'Competitive market rates',
    commission: '1%+',
    links: [
      { title: 'Apply for Equipment Financing', url: 'https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1' },
      { title: 'Become a Referral Partner', url: 'https://go.mypartner.io/referral-partner/?ref=001Qk00000KW1FBIA1' },
    ]
  },
  {
    name: 'Preferred Funding Group',
    description: 'Specialized equipment and expansion funding',
    approval: '48 hours',
    terms: 'Custom terms available',
    ltv: 'Up to 90% of equipment value',
    minLoan: '$10,000',
    maxLoan: '$250,000',
    rate: 'Competitive, based on credit',
    commission: '0.75%+',
    links: [
      { title: 'Apply Now', url: 'https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/' },
      { title: 'Partnership Program', url: 'https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/' },
    ]
  }
];

const EQUIPMENT_TYPES = [
  { name: 'Commercial Washers', range: '$2,500-$5,500 per unit', example: 'Speed Queen 40-50lb capacity' },
  { name: 'Commercial Dryers', range: '$2,000-$4,000 per unit', example: 'Huebsch 75-90lb capacity' },
  { name: 'Coin/Card Systems', range: '$5,000-$15,000', example: 'Multi-coin acceptor with mobile integration' },
  { name: 'Folding Tables/Seating', range: '$500-$2,000 per set', example: 'Commercial-grade stainless steel' },
  { name: 'Dog Wash Stations', range: '$3,500-$8,000', example: 'Self-service with hot/cold water' },
  { name: 'Soap Dispensers', range: '$300-$800 per unit', example: 'Commercial-grade detergent dispensers' },
];

const EQUIPMENT_FINANCING_KEYWORDS = [
  'laundromat equipment financing',
  'commercial laundry equipment financing',
  'washer dryer financing for laundromat',
  'laundromat equipment loan',
  'commercial washer financing',
  'commercial dryer financing',
  'laundry equipment lease vs buy',
  'equipment financing for laundromat business',
  'coin laundry equipment financing',
  'laundromat machine financing',
  'speed queen financing',
  'huebsch financing',
  'dexter laundry financing',
  'commercial laundry equipment loan rates',
  'laundromat equipment upgrade financing'
];

const EQUIPMENT_FINANCING_FAQS = [
  {
    question: "How do I finance laundromat equipment?",
    answer: "To finance laundromat equipment, apply with specialized lenders like MyPartner.io, Advance Funds Network, or Preferred Funding Group. You'll need 6+ months in business, a 600+ credit score, and $3,000+ monthly revenue. Approvals typically take 24-72 hours with financing up to $500,000 available for washers, dryers, card systems, and other commercial laundry equipment."
  },
  {
    question: "What are current laundromat equipment loan rates?",
    answer: "Laundromat equipment loan rates typically range from 6% to 18% APR depending on your credit profile, business history, and loan term. Revenue-based financing may have factor rates from 1.1x to 1.4x. Strong operators with 2+ years history and 700+ credit scores qualify for the lowest rates. Most equipment loans have terms of 12-84 months."
  },
  {
    question: "Should I lease or buy laundromat equipment?",
    answer: "Buying laundromat equipment is generally better for long-term ownership as you build equity and have no restrictions on usage. Leasing can be advantageous for new operators who want lower monthly payments, easier upgrades, and potential tax benefits. Equipment financing typically offers 100% LTV, meaning you can finance the full equipment cost with no down payment required."
  },
  {
    question: "What equipment can I finance for my laundromat?",
    answer: "You can finance commercial washers ($2,500-$5,500 each), commercial dryers ($2,000-$4,000 each), coin/card payment systems ($5,000-$15,000), dog wash stations ($3,500-$8,000), folding tables, seating, soap dispensers, and water heating systems. Most lenders finance both new and used commercial laundry equipment."
  },
  {
    question: "What credit score do I need for laundromat equipment financing?",
    answer: "Most laundromat equipment lenders require a minimum personal FICO score of 600, though 650+ will qualify for better rates. Business credit scores of 75+ are also considered. Even with recent bankruptcies or poor credit history, specialized lenders can often approve equipment financing based on revenue and business performance."
  },
  {
    question: "How much can I borrow for laundromat equipment?",
    answer: "Laundromat equipment financing ranges from $5,000 to $1,000,000 depending on the lender. MyPartner.io offers up to $500,000, Advance Funds Network up to $1,000,000, and Preferred Funding Group up to $250,000. Loan amounts are typically based on equipment value (up to 100% LTV) and your business cash flow."
  },
  {
    question: "How fast can I get approved for equipment financing?",
    answer: "Most laundromat equipment financing approvals happen within 24-72 hours. Some lenders offer same-day approvals for well-qualified applicants. After approval, funds are typically disbursed within 3-7 business days. The entire process from application to equipment purchase can be completed in 1-2 weeks."
  },
  {
    question: "What documents do I need for laundromat equipment financing?",
    answer: "Required documents typically include: valid ID (driver's license or passport), last 6 months of business bank statements, equipment quote or invoice from the vendor, proof of business ownership, and sometimes 2 years of personal tax returns. Some lenders offer streamlined applications requiring minimal documentation for established operators."
  }
];

const EQUIPMENT_FINANCING_HOWTO = {
  name: "How to Get Laundromat Equipment Financing",
  description: "Step-by-step guide to securing financing for commercial washers, dryers, and laundromat equipment. Fast approvals in 24-72 hours with loans up to $500,000.",
  totalTime: "PT72H",
  steps: [
    {
      name: "Gather Required Documents",
      text: "Collect your driver's license, last 6 months of business bank statements, equipment quotes from vendors like Speed Queen or Huebsch, proof of business ownership, and personal tax returns. Having documents ready speeds up the approval process."
    },
    {
      name: "Check Your Credit Profile",
      text: "Review your personal FICO score (minimum 600 required, 650+ preferred) and business credit score. Check for any errors and understand your debt-to-income ratio. Strong credit profiles qualify for lower interest rates."
    },
    {
      name: "Get Equipment Quotes",
      text: "Contact commercial laundry equipment distributors for detailed quotes on washers, dryers, payment systems, and other equipment you need. Lenders require specific equipment invoices to process financing applications."
    },
    {
      name: "Compare Lender Options",
      text: "Review equipment financing options from specialized lenders like MyPartner.io (up to $500K, 24-72hr approval), Advance Funds Network (up to $1M, revenue-based), and Preferred Funding Group (up to $250K). Compare rates, terms, and approval requirements."
    },
    {
      name: "Submit Your Application",
      text: "Complete the online application with your chosen lender, upload required documents, and submit your equipment quote. Most applications take 15-30 minutes to complete. Multiple lenders can be applied to simultaneously."
    },
    {
      name: "Review and Accept Offer",
      text: "Within 24-72 hours, you'll receive financing offers with loan amount, interest rate, monthly payment, and term length. Review all terms carefully, negotiate if needed, and accept the best offer for your situation."
    },
    {
      name: "Receive Funds and Purchase Equipment",
      text: "After accepting the offer, funds are typically disbursed within 3-7 business days directly to you or the equipment vendor. Coordinate with your distributor for equipment delivery and installation."
    }
  ]
};

const EQUIPMENT_FINANCING_BREADCRUMBS = [
  { name: "Home", url: "/" },
  { name: "Funding", url: "/funding" },
  { name: "Equipment Financing", url: "/equipment-financing" }
];

const FINANCIAL_SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "Laundromat Equipment Financing - WashBizHub",
  "description": "Fast equipment financing for laundromat operators. Finance commercial washers, dryers, card systems, and more with approvals in 24-72 hours and loans up to $500,000.",
  "url": "https://washbizhub.com/equipment-financing",
  "serviceType": "Equipment Financing",
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
    "name": "Equipment Financing Options",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "Commercial Washer Financing",
          "description": "Finance Speed Queen, Huebsch, and Dexter commercial washers for your laundromat"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "Commercial Dryer Financing",
          "description": "Finance commercial dryers with flexible terms up to 84 months"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "Payment System Financing",
          "description": "Finance coin-op, card, and mobile payment systems for laundromats"
        }
      }
    ]
  },
  "termsOfService": "https://washbizhub.com/terms",
  "feesAndCommissionsSpecification": "Equipment financing from $5,000 to $1,000,000. Rates vary by credit profile and business history. Terms available from 12 to 84 months."
};

export default function EquipmentFinancing() {
  return (
    <>
      <SEO
        title="Laundromat Equipment Financing | Commercial Washer & Dryer Loans 2025"
        description="Fast equipment financing for laundromat operators. Finance washers, dryers, card systems, and more. Approvals in 24-72 hours, up to $500K. Compare top lenders now."
        canonicalUrl="/equipment-financing"
        keywords={EQUIPMENT_FINANCING_KEYWORDS}
        faqs={EQUIPMENT_FINANCING_FAQS}
        howTo={EQUIPMENT_FINANCING_HOWTO}
        breadcrumbs={EQUIPMENT_FINANCING_BREADCRUMBS}
        structuredData={FINANCIAL_SERVICE_SCHEMA}
        author={{
          name: "Nicholas Kremers",
          expertise: "Laundromat Industry Advisor",
          credentials: "Founder of WashBizHub, helping entrepreneurs secure laundromat equipment financing"
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-16 border-b border-blue-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8" />
              <h1 className="text-5xl font-bold">Equipment Financing</h1>
            </div>
            <p className="text-xl text-blue-200 mb-4">
              Finance new or used laundromat equipment. Approvals in 24-72 hours. Up to $500,000.
            </p>
            <Badge className="bg-blue-500/30 text-blue-100">
              <CheckCircle className="w-4 h-4 mr-2" />
              Lender-verified programs specifically for laundromats
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <TrustSignals />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Equipment We Finance</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {EQUIPMENT_TYPES.map((eq, idx) => (
                <Card key={idx} data-testid={`card-equipment-${idx}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{eq.name}</h4>
                        <p className="text-sm text-muted-foreground">{eq.range}</p>
                        <p className="text-xs text-muted-foreground mt-1">Example: {eq.example}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Minimum Requirements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Business Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Minimum:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Active laundromat (6+ months operation)</li>
                      <li>Valid business license</li>
                      <li>Proof of ownership/management</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Typical:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>2 years business history preferred</li>
                      <li>Multiple locations acceptable</li>
                      <li>Personal guarantee required</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Credit:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Personal FICO: 600+ minimum</li>
                      <li>Business credit score considered</li>
                      <li>Recent bankruptcies acceptable</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Revenue:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>Monthly revenue: $3,000+</li>
                      <li>Last 6 months bank statements</li>
                      <li>Equipment quote or invoice required</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Laundromat-Specific Use Cases</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scenario 1: Equipment Upgrade</CardTitle>
                  <CardDescription>Aging machines need replacement</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    "I've got 32 machines averaging 8 years old. Revenue dropped 15% as customers move to newer locations. Need to upgrade to stay competitive."
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Financing Need:</span> $85,000</div>
                    <div><span className="font-semibold">Equipment:</span> 16 new washers + 16 new dryers</div>
                    <div><span className="font-semibold">Solution:</span> 60-month term at $1,900/month</div>
                    <div><span className="font-semibold">ROI:</span> 20% revenue increase projected = $1,200/month additional profit</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scenario 2: Payment System Modernization</CardTitle>
                  <CardDescription>Upgrade to contactless and mobile payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    "Post-COVID, customers expect mobile pay. Our coin-only systems are losing traffic to competitors with Venmo/Apple Pay integration."
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Financing Need:</span> $25,000</div>
                    <div><span className="font-semibold">Equipment:</span> Smart card/mobile system + installation</div>
                    <div><span className="font-semibold">Solution:</span> 36-month term at $750/month</div>
                    <div><span className="font-semibold">Payback:</span> 8-12 months through volume increase</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scenario 3: Add New Revenue Stream</CardTitle>
                  <CardDescription>Install dog wash station or vending</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    "My location is in a dog-friendly neighborhood with 5 dog parks nearby. Competitors added dog wash and get $8K/month extra revenue."
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Financing Need:</span> $7,500</div>
                    <div><span className="font-semibold">Equipment:</span> 1x Self-service dog wash + installation</div>
                    <div><span className="font-semibold">Solution:</span> 24-month term at $325/month</div>
                    <div><span className="font-semibold">Payback:</span> <strong>3 weeks at $8K/month revenue</strong></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Lender Comparison</h2>
            <p className="text-muted-foreground mb-6">Fastest approvals and best terms for laundromat equipment. All partners specialize in equipment financing.</p>
            <div className="space-y-4">
              {EQUIPMENT_PARTNERS.map((partner, idx) => (
                <Card key={idx} data-testid={`card-partner-${idx}`} className={idx === 0 ? 'border-green-500 border-2' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div>
                        <CardTitle>{partner.name}</CardTitle>
                        <CardDescription>{partner.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-500/20 text-green-600">{partner.approval}</Badge>
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
              {EQUIPMENT_FINANCING_FAQS.map((faq, idx) => (
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

          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Finance Equipment?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Get pre-approved in minutes. Equipment financing starting at $5,000 with flexible terms.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-blue-900 hover:bg-blue-50" data-testid="button-apply-mypartner">
                  Apply with MyPartner.io
                </Button>
              </a>
              <a href="https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-blue-900 hover:bg-blue-50" data-testid="button-apply-afn">
                  Apply with Advance Funds Network
                </Button>
              </a>
            </div>
          </div>

          <AuthorExpertise variant="full" />

          <RelatedFundingPaths currentPath="/equipment-financing" />

          <ConsultationCTA />

          <FundingDisclaimer />
        </div>
      </div>
    </>
  );
}
