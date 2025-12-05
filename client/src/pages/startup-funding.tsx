import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, DollarSign, Lightbulb } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { AuthorExpertise, TrustSignals, RelatedFundingPaths, FundingDisclaimer, ConsultationCTA } from "@/components/FundingEEAT";

const STARTUP_PARTNERS = [
  {
    name: 'GoKapital',
    description: 'Business credit-based financing for laundromat startups and new operations',
    approval: '24-48 hours',
    terms: '6-36 months flexible',
    amount: '$10,000 - $250,000',
    creditType: 'Business Credit',
    rate: 'Competitive business rates',
    commission: 'Revenue share',
    specialization: 'Business Credit Builders',
    links: [
      { title: 'Apply for Startup Funding', url: 'https://itsgokapital.com' },
      { title: 'Get Pre-Qualified', url: 'https://itsgokapital.com/business-loans' },
    ]
  },
  {
    name: 'Preferred Funding Group',
    description: 'Personal credit-based financing for new laundromat operators and entrepreneurs',
    approval: '48 hours',
    terms: 'Custom terms available',
    amount: '$5,000 - $150,000',
    creditType: 'Personal Credit',
    rate: 'Based on personal credit score',
    commission: '0.75%+',
    specialization: 'Personal Credit Users',
    links: [
      { title: 'Apply with Personal Credit', url: 'https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/' },
      { title: 'Get Pre-Qualified', url: 'https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/' },
    ]
  }
];

const STARTUP_FUNDING_KEYWORDS = [
  'laundromat startup funding',
  'first time laundromat owner financing',
  'how to buy a laundromat with no money',
  'startup capital for laundromat',
  'new laundromat business loan',
  'laundromat startup cost financing',
  'first time owner laundromat loan',
  'how to get funding for new laundromat',
  'laundromat business startup financing',
  'no experience laundromat financing',
  'laundromat startup requirements',
  'new laundromat owner funding',
  'laundromat first time buyer loan',
  'startup laundromat capital requirements',
  'laundromat business plan financing'
];

const STARTUP_FUNDING_FAQS = [
  {
    question: "How do I get funding for a new laundromat?",
    answer: "Get funding for a new laundromat through personal credit financing (Preferred Funding Group, up to $150K) or business credit programs (GoKapital, up to $250K). First-time owners typically need a valid ID, 6 months bank statements, business plan, and lease agreement. Approvals happen in 24-48 hours with funding within 3-7 business days."
  },
  {
    question: "How to buy a laundromat with no money down?",
    answer: "While 'no money down' is challenging, you can minimize upfront costs through: seller financing (negotiate 5-10% down), equipment leasing instead of buying, SBA loans (10-15% down), personal credit financing, or partnering with investors. Some equipment lenders offer 100% LTV financing, eliminating the need for equipment down payment."
  },
  {
    question: "What are startup capital requirements for a laundromat?",
    answer: "Laundromat startup capital typically ranges from $50,000 to $500,000+ depending on location and size. Basic requirements include: equipment ($40,000-$100,000), build-out/renovation ($20,000-$50,000), first/last month rent + security deposit ($15,000-$30,000), working capital for 3-6 months ($15,000-$30,000), and licensing/permits ($2,000-$5,000)."
  },
  {
    question: "Can first-time owners get laundromat financing?",
    answer: "Yes, first-time owners can get laundromat financing through specialized lenders that work with new operators. Requirements typically include: 580+ credit score (650+ preferred), valid ID and tax returns, business plan with projections, lease or property agreement, and 6 months personal bank statements. Business experience in service industries is helpful but not required."
  },
  {
    question: "What credit score do I need to start a laundromat?",
    answer: "Minimum credit scores for laundromat startup financing: personal credit loans require 580+ (650+ for best rates), business credit programs work with new LLCs, and SBA loans typically require 650+. Strong personal credit (700+) opens more options with better rates. Lenders also consider income, debt-to-income ratio, and business plan quality."
  },
  {
    question: "How long does it take to get startup funding?",
    answer: "Startup funding timelines vary by lender: GoKapital approves in 24-48 hours with funding in 3-5 days, Preferred Funding Group approves in 48 hours with funding in 3-7 days, and traditional bank loans take 30-60 days. Having documents ready (ID, bank statements, business plan, lease) speeds up the process significantly."
  },
  {
    question: "Should I use personal or business credit for startup?",
    answer: "Personal credit is faster and works better if you have strong credit (700+) but ties the loan to you personally. Business credit builds your LLC's creditworthiness for future expansion and separates personal/business liability. Many first-time owners use a combination: personal credit for quick initial funding, then refinance to business credit once established."
  },
  {
    question: "What documents do I need for laundromat startup funding?",
    answer: "Required documents for startup funding include: valid driver's license or passport, Social Security number or Tax ID, 2 years personal tax returns, 6 months personal/business bank statements, business plan with financial projections, property information (lease agreement or purchase contract), and equipment quotes from vendors."
  }
];

const STARTUP_FUNDING_HOWTO = {
  name: "How to Get Startup Funding for Your First Laundromat",
  description: "Complete step-by-step guide for first-time laundromat owners to secure startup funding. Learn requirements, compare lenders, and get approved in 24-48 hours with up to $250,000.",
  totalTime: "PT168H",
  steps: [
    {
      name: "Create Your Laundromat Business Plan",
      text: "Develop a comprehensive business plan including market analysis, location demographics, equipment needs, startup costs breakdown, and 3-year financial projections. A solid business plan increases approval chances and may help secure better rates. Include competitive analysis and your operational strategy."
    },
    {
      name: "Assess Your Credit and Financial Position",
      text: "Check your personal FICO score (580+ minimum, 650+ preferred) and calculate your available capital for down payment and reserves. Review your debt-to-income ratio and gather 2 years of tax returns plus 6 months of bank statements."
    },
    {
      name: "Secure Your Location",
      text: "Find and secure your laundromat location with a signed lease agreement or letter of intent. Lenders require proof of location before funding. Consider demographics, foot traffic, competition, and utility infrastructure when selecting your site."
    },
    {
      name: "Get Equipment Quotes",
      text: "Contact commercial laundry equipment distributors for detailed quotes on washers, dryers, payment systems, and fixtures. Having specific equipment quotes helps lenders understand your total capital needs and strengthens your application."
    },
    {
      name: "Choose Your Financing Path",
      text: "Select between personal credit financing (Preferred Funding Group - faster, up to $150K) or business credit programs (GoKapital - builds business credit, up to $250K). Consider combining both if you need more capital. Compare rates, terms, and approval requirements."
    },
    {
      name: "Prepare and Submit Application",
      text: "Gather all required documents: ID, tax returns, bank statements, business plan, lease agreement, and equipment quotes. Complete online applications with your chosen lenders - applications typically take 15-30 minutes each."
    },
    {
      name: "Review Offers and Accept Funding",
      text: "Within 24-48 hours, you'll receive financing offers. Review loan amounts, interest rates, monthly payments, and terms. Negotiate if needed, accept the best offer, and receive funds within 3-7 business days to start building your laundromat."
    }
  ]
};

const STARTUP_FUNDING_BREADCRUMBS = [
  { name: "Home", url: "/" },
  { name: "Funding", url: "/funding" },
  { name: "Startup Funding", url: "/startup-funding" }
];

const FINANCIAL_SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "Laundromat Startup Funding - WashBizHub",
  "description": "Startup funding and financing for first-time laundromat owners. Personal and business credit options with approvals in 24-48 hours. $5,000 to $250,000 available for new laundromat operators.",
  "url": "https://washbizhub.com/startup-funding",
  "serviceType": "Business Startup Financing",
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
    "name": "Startup Funding Options",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "Business Credit Startup Loan",
          "description": "Build business credit while funding your first laundromat with up to $250,000"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "Personal Credit Startup Loan",
          "description": "Fast approval startup funding based on personal credit with up to $150,000"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "FinancialProduct",
          "name": "First-Time Owner Financing",
          "description": "Specialized financing programs for entrepreneurs new to the laundromat industry"
        }
      }
    ]
  },
  "termsOfService": "https://washbizhub.com/terms",
  "feesAndCommissionsSpecification": "Startup financing from $5,000 to $250,000. Approvals in 24-48 hours. Terms from 6 to 36 months available."
};

export default function StartupFunding() {
  return (
    <>
      <SEO
        title="Startup Laundromat Funding | First-Time Owner Financing & No Money Down Options 2025"
        description="Startup funding for new laundromat operators. Personal and business credit options. Approvals in 24-48 hours. $5K-$250K available. Learn how to buy a laundromat with minimal down payment."
        canonicalUrl="/startup-funding"
        keywords={STARTUP_FUNDING_KEYWORDS}
        faqs={STARTUP_FUNDING_FAQS}
        howTo={STARTUP_FUNDING_HOWTO}
        breadcrumbs={STARTUP_FUNDING_BREADCRUMBS}
        structuredData={FINANCIAL_SERVICE_SCHEMA}
        author={{
          name: "WashBizHub",
          expertise: "Laundromat Industry Expert",
          credentials: "Leading laundromat resource platform helping first-time owners start successful businesses"
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f]/90 to-[#1e3a5f] text-white py-16 border-b border-[#1e3a5f]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-8 h-8" />
              <h1 className="text-5xl font-bold">Startup Laundromat Funding</h1>
            </div>
            <p className="text-xl text-[#C8A661] mb-4">
              Launch your first laundromat. Personal or business credit options. Approvals in 24-48 hours.
            </p>
            <Badge className="bg-[#C8A661]/30 text-[#C8A661]">
              <CheckCircle className="w-4 h-4 mr-2" />
              Perfect for first-time laundromat owners
            </Badge>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-6 relative z-10">
          <TrustSignals variant="horizontal" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Getting Started as a First-Time Owner</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    What You'll Need
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>Valid driver's license / passport</div>
                  <div>Social Security number or Tax ID</div>
                  <div>2 years personal tax returns</div>
                  <div>Business plan or projections</div>
                  <div>Property information (lease/purchase agreement)</div>
                  <div>Bank statements (6 months)</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Startup Funding Matters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>Launch without draining personal savings</div>
                  <div>Purchase quality equipment from day one</div>
                  <div>Cover initial operational costs</div>
                  <div>Build business credit for future growth</div>
                  <div>Scale to multi-unit faster</div>
                  <div>Maintain emergency cash reserves</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Real Startup Scenarios</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scenario 1: First-Time Operator - Leased Space</CardTitle>
                  <CardDescription>No existing business, but ready to launch</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    "I've got a lease on a 2,500 sq ft commercial space. I need equipment and startup capital."
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Total Startup Cost:</span> $85,000</div>
                    <div><span className="font-semibold">Equipment:</span> 24 washers + 24 dryers ($60K)</div>
                    <div><span className="font-semibold">Working Capital:</span> 3 months operating expenses ($25K)</div>
                    <div><span className="font-semibold">Financing Option:</span> $85K at 12 months = $7,500/month</div>
                    <div><span className="font-semibold">Payback Window:</span> 4-5 months at $10K/month projected revenue</div>
                    <div className="text-xs text-muted-foreground mt-2">Best fit: Personal credit with Preferred Funding Group or business credit with GoKapital</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scenario 2: Transitioning from Corporate Job</CardTitle>
                  <CardDescription>Strong personal credit, starting new business venture</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    "Leaving my job to run a laundromat full-time. Have good credit but no business history yet."
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Funding Need:</span> $45,000</div>
                    <div><span className="font-semibold">Personal Savings:</span> $15,000 for 6-month cushion</div>
                    <div><span className="font-semibold">Financing:</span> $45K via personal credit</div>
                    <div><span className="font-semibold">Timeline:</span> Approval in 1-2 weeks, operational in 30 days</div>
                    <div><span className="font-semibold">Strategy:</span> Build business credit quickly for expansion loan later</div>
                    <div className="text-xs text-muted-foreground mt-2">Best fit: Personal credit with Preferred Funding Group</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scenario 3: Recently-Formed LLC Builder</CardTitle>
                  <CardDescription>Business just formed, starting to build business credit</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    "Started my LLC 60 days ago. Ready to launch laundromat but no business credit history yet."
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Total Investment:</span> $65,000</div>
                    <div><span className="font-semibold">Business Credit Available:</span> ~$25,000</div>
                    <div><span className="font-semibold">Personal Credit Bridge:</span> $40,000</div>
                    <div><span className="font-semibold">Combined Approach:</span> Use both personal + business credit</div>
                    <div><span className="font-semibold">Growth Path:</span> Build 6+ months of business credit history then refinance to larger SBA loan</div>
                    <div className="text-xs text-muted-foreground mt-2">Best fit: GoKapital (business) + Preferred Funding Group (personal)</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Startup Financing Options</h2>
            <p className="text-muted-foreground mb-6">Choose based on your credit profile and business stage. Both partners specialize in first-time laundromat operators.</p>
            <div className="space-y-4">
              {STARTUP_PARTNERS.map((partner, idx) => (
                <Card key={idx} data-testid={`card-partner-${idx}`} className={idx === 0 ? 'border-green-500 border-2' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle>{partner.name}</CardTitle>
                          {idx === 0 && (
                            <Badge className="bg-green-500/20 text-green-600">
                              <Zap className="w-3 h-3 mr-1" />
                              Business Credit
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
                        <span className="font-semibold">Credit Type:</span>
                        <p className="text-muted-foreground">{partner.creditType}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Amount:</span>
                        <p className="text-muted-foreground">{partner.amount}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Terms:</span>
                        <p className="text-muted-foreground">{partner.terms}</p>
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
              {STARTUP_FUNDING_FAQS.map((faq, idx) => (
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

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/90 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Laundromat?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Get pre-qualified in minutes. Both partners work with first-time operators.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://itsgokapital.com" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-white hover:bg-[#b8860b]" data-testid="button-apply-gokapital">
                  Start with GoKapital (Business Credit)
                </Button>
              </a>
              <a href="https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-white hover:bg-[#b8860b]" data-testid="button-apply-preferred">
                  Start with Preferred Funding (Personal Credit)
                </Button>
              </a>
            </div>
          </div>

          <AuthorExpertise variant="full" />

          <RelatedFundingPaths currentPath="/startup-funding" />

          <ConsultationCTA />

          <FundingDisclaimer />
        </div>
      </div>
    </>
  );
}
