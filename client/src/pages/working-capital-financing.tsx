import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CheckCircle, DollarSign, Zap } from 'lucide-react';
import { SEO } from '@/components/SEO';

const WC_PARTNERS = [
  {
    name: 'MyPartner.io',
    description: 'Quick working capital for laundromat operations and growth',
    approval: '24-48 hours',
    terms: '6-36 months',
    amount: '$5,000 - $250,000',
    rate: 'Market rates',
    links: [
      { title: 'Get Working Capital', url: 'https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1' },
      { title: 'Partnership Opportunities', url: 'https://go.mypartner.io/referral-partner/?ref=001Qk00000KW1FBIA1' },
    ]
  },
  {
    name: 'Advance Funds Network',
    description: 'Revenue-based working capital for cash flow needs',
    approval: '24-48 hours',
    terms: 'Revenue-based or fixed',
    amount: '$10,000 - $500,000',
    rate: 'Revenue-based or fixed',
    links: [
      { title: 'Submit Application', url: 'https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3' },
      { title: 'Program Details', url: 'https://app.advancefundsnetwork.com/partner-landing/OEO602XAIiZkhill7WmMwJ7NEfB3' },
    ]
  },
];

export default function WorkingCapitalFinancing() {
  return (
    <>
      <SEO
        title="Working Capital Loans for Laundromats | Business Cash Flow Financing"
        description="Get quick working capital funding for laundromat operations, inventory, staffing, and growth. Approvals in 24-48 hours. $5K-$500K available."
        canonicalUrl="/working-capital-financing"
        keywords={['working capital', 'business cash flow', 'laundromat loans', 'operational funding', 'inventory financing']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white py-16 border-b border-purple-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8" />
              <h1 className="text-5xl font-bold">Working Capital Financing</h1>
            </div>
            <p className="text-xl text-purple-200 mb-4">
              Fast funding for laundromat operations, inventory, staffing, and growth initiatives. Approvals in 24-48 hours.
            </p>
            <Badge className="bg-purple-500/30 text-purple-100">
              <CheckCircle className="w-4 h-4 mr-2" />
              Revenue-based & traditional options available
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          {/* Use Cases */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Common Uses for Working Capital</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Inventory & Supplies</CardTitle>
                  <CardDescription>Stock up on detergent, chemicals, and operational supplies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Bulk purchasing at better rates = higher margins. Working capital lets you buy more at once.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Need:</span> $15,000 for 6 months of supplies</div>
                    <div><span className="font-semibold">Financing:</span> 12-month term at $1,350/month</div>
                    <div><span className="font-semibold">Savings:</span> Bulk discounts save $2,000+/month</div>
                    <div><span className="font-semibold">ROI:</span> Break-even in 8 months, profit grows after</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payroll & Staffing</CardTitle>
                  <CardDescription>Cover payroll during slow seasons or expansion</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Seasonal fluctuations can strain cash flow. Working capital bridges the gap.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Situation:</span> 3 full-time staff, $12K monthly payroll</div>
                    <div><span className="font-semibold">Problem:</span> Winter months 20% slower = cash crunch</div>
                    <div><span className="font-semibold">Solution:</span> $30K working capital covers 2.5 months gap</div>
                    <div><span className="font-semibold">Benefit:</span> Keep quality staff year-round</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Marketing & Customer Acquisition</CardTitle>
                  <CardDescription>Fund promotions, ads, and community programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Strategic marketing drives revenue growth. Use working capital to invest in growth.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Budget:</span> $5,000 monthly marketing spend</div>
                    <div><span className="font-semibold">Campaign:</span> Local ads, mobile app launch, loyalty program</div>
                    <div><span className="font-semibold">Expected Result:</span> 25% customer growth in 3 months</div>
                    <div><span className="font-semibold">Revenue Impact:</span> $8K additional monthly revenue</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Maintenance & Repairs</CardTitle>
                  <CardDescription>Emergency repairs and preventive maintenance fund</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Equipment breakdowns are expensive and hurt cash flow. Working capital keeps you operational.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Reserve Fund:</span> $10,000 maintenance/repair buffer</div>
                    <div><span className="font-semibold">Scenario:</span> Pump failure costs $3,000, compressor issue $5,000</div>
                    <div><span className="font-semibold">Impact:</span> Covered without disrupting operations</div>
                    <div><span className="font-semibold">Benefit:</span> No lost revenue from downtime</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Multi-Location Expansion</CardTitle>
                  <CardDescription>Launch new location or expand existing site</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    Growing to multi-unit operation requires operational capital before revenue kicks in.
                  </p>
                  <div className="bg-muted/50 p-4 rounded text-sm space-y-2">
                    <div><span className="font-semibold">Expansion:</span> Second location opening in 60 days</div>
                    <div><span className="font-semibold">Need:</span> $30,000 for pre-launch operations</div>
                    <div><span className="font-semibold">Timeline:</span> Location 2 break-even in 4-6 months</div>
                    <div><span className="font-semibold">Revenue Impact:</span> Combined $40K/month from both locations</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Minimum Requirements */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Qualification Requirements</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Minimum:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 6 months operating history</li>
                      <li>• Valid business license</li>
                      <li>• Bank account showing regular revenue</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Preferred:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 1+ years operating history</li>
                      <li>• Consistent monthly revenue</li>
                      <li>• Multiple revenue streams</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Credit:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Personal FICO: 580+</li>
                      <li>• Some programs: No credit check</li>
                      <li>• Revenue-based options available</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Revenue:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Minimum: $3,000/month</li>
                      <li>• Last 6 months bank statements</li>
                      <li>• Revenue verification via ACH</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Partners */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Funding Partners</h2>
            <div className="space-y-4">
              {WC_PARTNERS.map((partner, idx) => (
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
                        <p className="text-muted-foreground">{partner.amount}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Rate:</span>
                        <p className="text-muted-foreground">{partner.rate}</p>
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
          <div className="bg-gradient-to-r from-purple-900 to-purple-800 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Need Cash Fast?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Get approved in 24-48 hours. Flexible terms starting at $5,000.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-purple-900 hover:bg-purple-50" data-testid="button-apply-mypartner">
                  Apply with MyPartner.io
                </Button>
              </a>
              <a href="https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-purple-900 hover:bg-purple-50" data-testid="button-apply-afn">
                  Apply with Advance Funds
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
