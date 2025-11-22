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

export default function AcquisitionsFunding() {
  return (
    <>
      <SEO
        title="Laundromat Acquisition Financing | Multi-Unit Expansion Loans"
        description="Finance laundromat acquisitions and multi-unit expansion. $100K-$5M+ for established operators. Fast approvals, competitive rates."
        canonicalUrl="/acquisitions-funding"
        keywords={['laundromat acquisition', 'multi-unit expansion', 'business acquisition loan', 'portfolio financing', 'growth capital']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
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
          {/* Growth Strategies */}
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

          {/* Minimum Requirements */}
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

          {/* Partner */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Acquisition Financing Partner</h2>
            <div className="space-y-4">
              {ACQUISITION_PARTNERS.map((partner, idx) => (
                <Card key={idx} data-testid={`card-partner-${idx}`} className="border-green-500 border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
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
                          📧 Get Acquisition Quote
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

          {/* CTA */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Laundromat Business?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Get acquisition financing quotes for multi-unit expansion. Contact our partner for enterprise-level growth capital.
            </p>
            <a href="mailto:funding@washbizhub.com?subject=Laundromat Acquisition Financing">
              <Button className="bg-white text-slate-900 hover:bg-slate-50" size="lg" data-testid="button-contact-funding">
                📧 Contact Funding Partner
              </Button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
