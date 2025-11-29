import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, DollarSign, Lightbulb } from 'lucide-react';
import { SEO } from '@/components/SEO';

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

export default function StartupFunding() {
  return (
    <>
      <SEO
        title="Startup Laundromat Funding | First-Time Owner Business Loans"
        description="Startup funding for new laundromat operators. Personal and business credit options. Approvals in 24-48 hours. $5K-$250K available."
        canonicalUrl="/startup-funding"
        keywords={['startup funding', 'first-time laundromat', 'new business loans', 'personal credit business loan', 'startup capital']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-r from-orange-900 via-orange-800 to-orange-900 text-white py-16 border-b border-orange-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-8 h-8" />
              <h1 className="text-5xl font-bold">Startup Laundromat Funding</h1>
            </div>
            <p className="text-xl text-orange-200 mb-4">
              Launch your first laundromat. Personal or business credit options. Approvals in 24-48 hours.
            </p>
            <Badge className="bg-orange-500/30 text-orange-100">
              <CheckCircle className="w-4 h-4 mr-2" />
              Perfect for first-time laundromat owners
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          {/* Getting Started */}
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
                  <div>• Valid driver's license / passport</div>
                  <div>• Social Security number or Tax ID</div>
                  <div>• 2 years personal tax returns</div>
                  <div>• Business plan or projections</div>
                  <div>• Property information (lease/purchase agreement)</div>
                  <div>• Bank statements (6 months)</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Startup Funding Matters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Launch without draining personal savings</div>
                  <div>✓ Purchase quality equipment from day one</div>
                  <div>✓ Cover initial operational costs</div>
                  <div>✓ Build business credit for future growth</div>
                  <div>✓ Scale to multi-unit faster</div>
                  <div>✓ Maintain emergency cash reserves</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Startup Scenarios */}
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
                    <div><span className="font-semibold">Growth Path:</span> Build 6+ months of business credit history → refinance to larger SBA loan</div>
                    <div className="text-xs text-muted-foreground mt-2">Best fit: GoKapital (business) + Preferred Funding Group (personal)</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Partner Comparison */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Startup Financing Options</h2>
            <p className="text-muted-foreground mb-6">Choose based on your credit profile and business stage. Both partners specialize in first-time laundromat operators.</p>
            <div className="space-y-4">
              {STARTUP_PARTNERS.map((partner, idx) => (
                <Card key={idx} data-testid={`card-partner-${idx}`} className={idx === 0 ? 'border-green-500 border-2' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
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

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Startup Funding FAQ</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal vs. Business Credit - Which Should I Use?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Personal Credit:</span> Better if you have strong personal credit (700+). Fast approval, you personally guarantee the loan.</p>
                  <p className="mt-2"><span className="font-semibold text-foreground">Business Credit:</span> Better for building long-term credit history for your LLC. Takes slightly longer but helps with future refinancing and expansion.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What's the Minimum Credit Score?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Personal Credit:</span> Typically 580+, but 650+ gets better rates</p>
                  <p className="mt-2"><span className="font-semibold text-foreground">Business Credit:</span> New businesses can qualify even with thin credit history; business credit builds from business activities</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Can I Get Denied?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Startup approvals are common for first-time laundromat owners. Recent bankruptcies or poor credit can impact rates but won't automatically disqualify you. Both lenders work with new business owners regularly.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How Quickly Can I Get Funded?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p><span className="font-semibold text-foreground">GoKapital:</span> 24-48 hours approval, funds within 3-5 business days</p>
                  <p className="mt-2"><span className="font-semibold text-foreground">Preferred Funding Group:</span> 48 hours approval, funds within 3-7 business days</p>
                  <p className="mt-2">Once funded, you can order equipment and be operational within 2-3 weeks.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-orange-900 to-orange-800 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Laundromat?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Get pre-qualified in minutes. Both partners work with first-time operators.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://itsgokapital.com" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-orange-900 hover:bg-orange-50" data-testid="button-apply-gokapital">
                  Start with GoKapital (Business Credit)
                </Button>
              </a>
              <a href="https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-orange-900 hover:bg-orange-50" data-testid="button-apply-preferred">
                  Start with Preferred Funding (Personal Credit)
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
