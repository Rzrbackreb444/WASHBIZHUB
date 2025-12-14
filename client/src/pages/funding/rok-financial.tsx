import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, Clock, Zap, ArrowRight, DollarSign, FileText, Landmark, Briefcase, Network, TrendingUp, Factory } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Link } from 'wouter';

const APPLY_URL = "https://go.mypartner.io/business-financing/?ref=001Qk00000KW1FBIA1";

const ROK_FEATURES = [
  "75+ lender network for best rate matching",
  "72% approval rate vs 13.5% at traditional banks",
  "80% faster processing than banks",
  "Soft pull pre-qualification (no credit impact)",
  "Multiple offers to compare",
  "Equipment financing in 1-5 days",
  "DSCR loans for commercial real estate"
];

const FUNDING_TYPES = [
  {
    title: "SBA Loans",
    description: "Long-term financing with competitive rates through their lender network",
    amount: "$50,000 - $5,000,000",
    bestFor: "Business acquisitions, expansions, real estate",
    speed: "45 days",
    terms: "10-25 years"
  },
  {
    title: "Term Loans",
    description: "Flexible business loans with various term options",
    amount: "$5,000 - $5,000,000",
    bestFor: "Working capital, equipment, renovations",
    speed: "1-3 days",
    terms: "6-120 months, from 6% APR"
  },
  {
    title: "Equipment Financing",
    description: "Fast approval for commercial laundry equipment",
    amount: "Based on equipment value",
    bestFor: "Washers, dryers, card systems, folding equipment",
    speed: "1-5 days",
    terms: "Up to 84 months"
  },
  {
    title: "Commercial Real Estate",
    description: "DSCR loans for laundromat property purchases",
    amount: "Up to 80% LTV",
    bestFor: "Property purchases, refinancing",
    speed: "2-4 weeks",
    terms: "Based on property cash flow"
  },
  {
    title: "Lines of Credit",
    description: "Revolving credit for ongoing business needs",
    amount: "Up to $5,000,000",
    bestFor: "Inventory, repairs, cash flow, emergencies",
    speed: "1-3 days",
    terms: "Revolving"
  }
];

export default function RokFinancial() {
  return (
    <>
      <SEO
        title="ROK Financial | 75+ Lender Network - 72% Approval Rate"
        description="Access 75+ lenders through one application. 72% approval rate vs 13.5% at banks. Equipment financing in 1-5 days. SBA loans, term loans, commercial RE, and lines of credit up to $5M."
        canonicalUrl="/funding/rok-financial"
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f]/90 to-[#1e3a5f] text-white py-16 border-b border-[#1e3a5f]">
          <div className="max-w-4xl mx-auto px-6">
            <Link href="/funding" className="text-[#C8A661] hover:underline text-sm mb-4 inline-block" data-testid="link-back-to-funding">
              ← Back to Funding Options
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                <Network className="h-7 w-7 text-[#C8A661]" />
              </div>
              <div>
                <Badge className="bg-[#C8A661]/30 text-[#C8A661] mb-2">
                  <Zap className="w-3 h-3 mr-1" />
                  Lending Marketplace
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-partner-name">ROK Financial</h1>
              </div>
            </div>
            <p className="text-xl text-[#C8A661] mb-6" data-testid="text-partner-tagline">
              One application. 75+ lenders competing for your business. 72% approval rate vs 13.5% at traditional banks.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-hero">
                  Get Multiple Offers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" data-testid="button-prequalify-hero">
                  Soft Pull Pre-Qualify
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center" data-testid="card-stat-lenders">
              <CardContent className="pt-6">
                <Network className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#C8A661]">75+</div>
                <div className="text-sm text-muted-foreground">Lender Network</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-approval">
              <CardContent className="pt-6">
                <TrendingUp className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">72%</div>
                <div className="text-sm text-muted-foreground">Approval Rate</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-speed">
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">80%</div>
                <div className="text-sm text-muted-foreground">Faster Than Banks</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">About ROK Financial</h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              Founded in 2020 in Great River, NY, ROK Financial operates as a lending marketplace that connects borrowers 
              with their network of 75+ lenders. Instead of applying to multiple lenders individually, you submit one 
              application and receive multiple competing offers. Their 72% approval rate (compared to 13.5% at traditional 
              banks) and 80% faster processing make them an excellent choice for laundromat buyers who want options.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Funding Options</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FUNDING_TYPES.map((type, idx) => (
                <Card key={idx} className={idx === 0 ? "border-2 border-[#C8A661]" : ""} data-testid={`card-funding-type-${idx}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription className="text-xs">{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xl font-bold text-[#C8A661]">{type.amount}</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {type.speed}
                      </Badge>
                    </div>
                    <div className="bg-[#C8A661]/10 p-2 rounded-lg">
                      <div className="text-xs font-semibold text-[#C8A661] mb-1">Best For:</div>
                      <div className="text-xs">{type.bestFor}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{type.terms}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-2 border-[#C8A661]" data-testid="card-why-rok">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#C8A661]" />
                Why Choose ROK Financial?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {ROK_FEATURES.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {ROK_FEATURES.slice(4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Smart Strategy:</strong> ROK's marketplace model means you get multiple offers to compare—often 
                  resulting in better rates than applying to a single lender. Their soft pull pre-qualification won't 
                  impact your credit score, so there's no risk in checking your options.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30" data-testid="card-requirements">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                What You'll Need to Apply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold mb-3">Required Documents:</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Government-issued ID
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      6 months bank statements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Business tax returns (if applicable)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Profit & loss statement
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-3">For Equipment/RE Loans:</div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Equipment quotes or invoices
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Property information (for RE loans)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      DSCR calculations for commercial RE
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Existing lease or purchase agreement
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 rounded-lg p-8" data-testid="section-ideal-for">
            <h3 className="text-xl font-bold mb-4">Ideal For Buyers Who:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Want to compare multiple lending offers</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Need fast equipment financing (1-5 days)</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Are purchasing commercial real estate</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Were declined by traditional banks</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Want to check rates without impacting credit</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Need both SBA and alternative financing options</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/90 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to See Your Options?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              One application, 75+ lenders competing for your business. Get multiple offers with no credit impact.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-cta">
                  Get Multiple Offers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" data-testid="button-prequalify-cta">
                  Soft Pull Pre-Qualify
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-white/70">
              No credit impact. Multiple offers. Fast decisions.
            </p>
          </div>

          <div className="text-center">
            <Link href="/funding">
              <Button variant="outline" data-testid="button-back-to-options">
                ← Compare All Funding Options
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
