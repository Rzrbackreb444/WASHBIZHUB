import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, DollarSign, Building2 } from 'lucide-react';
import { SEO } from '@/components/SEO';

const RE_PARTNERS = [
  {
    name: 'South End Capital',
    description: 'Commercial real estate financing specialist for laundromat operators',
    approval: '5-10 business days',
    terms: '5-20 year terms available',
    ltv: 'Up to 80% LTV',
    minLoan: '$50,000',
    maxLoan: '$2,000,000+',
    rate: 'Competitive, fixed & variable',
    links: [
      { title: 'Apply for Financing', url: 'https://southendcapital.com/?rp=RP020811&sub_id=Laundromat' },
      { title: 'Partnership Program', url: 'https://southendcapital.com/partners/?rp=RP020811&sub_id=Laundromat' },
    ]
  },
  {
    name: 'David Allen Capital',
    description: 'Enterprise-level commercial real estate and equipment financing',
    approval: '7-14 days',
    terms: '10-25 year terms',
    ltv: 'Up to 75% LTV',
    minLoan: '$100,000',
    maxLoan: '$5,000,000+',
    rate: 'Institutional rates',
    links: [
      { title: 'Business Financing Portal', url: 'https://davidallewncapital.com/nicholaskremers' },
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
    links: [
      { title: 'Real Estate Application', url: 'https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3' },
      { title: 'Commercial Program', url: 'https://app.advancefundsnetwork.com/partner-landing/OEO602XAIiZkhill7WmMwJ7NEfB3' },
    ]
  }
];

export default function RealEstateFinancing() {
  return (
    <>
      <SEO
        title="Commercial Real Estate Financing for Laundromats | Property & Building Loans"
        description="Finance laundromat commercial real estate. Purchase, refinance, or build-out. $50K-$2M+ loans. 5-20 year terms. Up to 80% LTV."
        canonicalUrl="/real-estate-financing"
        keywords={['commercial real estate financing', 'laundromat property', 'business real estate loan', 'commercial building finance', 'property acquisition loan']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
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
              Designed for laundromat property acquisition
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          {/* Use Cases */}
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

          {/* Minimum Requirements */}
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
                      <li>• Zoned commercial/light industrial</li>
                      <li>• Minimum 1,500 sq ft (typically)</li>
                      <li>• Good parking availability</li>
                      <li>• Professional appraisal required</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Business History:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Existing operator: 2+ years history</li>
                      <li>• First-time: strong industry experience</li>
                      <li>• Proven management team required</li>
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
                      <li>• Personal FICO: 650+ minimum</li>
                      <li>• Business credit score: 75+</li>
                      <li>• 2 years tax returns (personal)</li>
                      <li>• 2 years business financials</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Financial Strength:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Down payment: 15-25% typically</li>
                      <li>• Debt service coverage: 1.25x+</li>
                      <li>• Liquidity reserves: 3-6 months PITI</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Partner Comparison */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Lender Comparison</h2>
            <div className="space-y-4">
              {RE_PARTNERS.map((partner, idx) => (
                <Card key={idx} data-testid={`card-partner-${idx}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle>{partner.name}</CardTitle>
                        <CardDescription>{partner.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-500/20 text-green-600">{partner.approval}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
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

          {/* CTA */}
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Own Your Laundromat Location</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Finance purchase, build-out, or portfolio expansion. Flexible terms, competitive rates, fast approval.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://southendcapital.com/?rp=RP020811&sub_id=Laundromat" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-emerald-900 hover:bg-emerald-50" data-testid="button-apply-south-end">
                  Apply with South End Capital
                </Button>
              </a>
              <a href="https://davidallewncapital.com/nicholaskremers" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-emerald-900 hover:bg-emerald-50" data-testid="button-apply-david">
                  Apply with David Allen Capital
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
