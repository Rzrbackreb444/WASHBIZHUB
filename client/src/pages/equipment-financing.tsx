import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, DollarSign, Zap } from 'lucide-react';
import { SEO } from '@/components/SEO';

const EQUIPMENT_PARTNERS = [
  {
    name: 'MyPartner.io',
    description: 'Fast-track equipment financing for laundromat operators',
    approval: '24-72 hours',
    terms: 'Flexible, 12-84 months',
    ltv: 'Up to 100% of equipment value',
    minLoan: '$5,000',
    maxLoan: '$500,000',
    rate: 'Competitive market rates',
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
    links: [
      { title: 'Apply Now', url: 'https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/' },
      { title: 'Partnership Program', url: 'https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/' },
    ]
  },
  {
    name: 'Advance Funds Network',
    description: 'Equipment and revenue-based financing solutions',
    approval: '24-48 hours',
    terms: 'Revenue-based or fixed terms',
    ltv: 'Up to 85% of equipment value',
    minLoan: '$15,000',
    maxLoan: '$1,000,000',
    rate: 'Based on revenue model',
    links: [
      { title: 'Submit Application', url: 'https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3' },
      { title: 'Partner Opportunities', url: 'https://app.advancefundsnetwork.com/partner-landing/OEO602XAIiZkhill7WmMwJ7NEfB3' },
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

export default function EquipmentFinancing() {
  return (
    <>
      <SEO
        title="Laundromat Equipment Financing | Commercial Washer & Dryer Loans"
        description="Fast equipment financing for laundromat operators. Finance washers, dryers, card systems, and more. Approvals in 24-72 hours, up to $500K."
        canonicalUrl="/equipment-financing"
        keywords={['equipment financing', 'laundromat equipment', 'washer dryer loans', 'commercial laundry equipment', 'equipment purchase financing']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
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

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          {/* What Can Be Financed */}
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

          {/* Minimum Requirements */}
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
                      <li>• Active laundromat (6+ months operation)</li>
                      <li>• Valid business license</li>
                      <li>• Proof of ownership/management</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Typical:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 2 years business history preferred</li>
                      <li>• Multiple locations acceptable</li>
                      <li>• Personal guarantee required</li>
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
                      <li>• Personal FICO: 600+ minimum</li>
                      <li>• Business credit score considered</li>
                      <li>• Recent bankruptcies acceptable</li>
                    </ul>
                  </div>
                  <div className="text-sm mt-4">
                    <p className="font-semibold mb-1">Revenue:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Monthly revenue: $3,000+</li>
                      <li>• Last 6 months bank statements</li>
                      <li>• Equipment quote or invoice required</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Use Cases & Examples */}
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

          {/* Partner Comparison */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Lender Comparison</h2>
            <div className="space-y-4">
              {EQUIPMENT_PARTNERS.map((partner, idx) => (
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
        </div>
      </div>
    </>
  );
}
