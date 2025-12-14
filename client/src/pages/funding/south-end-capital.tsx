import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, Clock, Zap, ArrowRight, DollarSign, FileText, Landmark, Briefcase, Shield, TrendingUp } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Link } from 'wouter';

const APPLY_URL = "https://southendcapital.com/?rp=RP020811&sub_id=Laundromat";

const SBA_FEATURES = [
  "$0 SBA guarantee fees on loans up to $1M through 2025",
  "Preferred SBA Lender status - faster approvals",
  "10-25 year terms for long-term affordability",
  "Same-day equipment financing available",
  "Story-based underwriting for complex situations",
  "Commercial real estate up to 80% LTV",
  "Lines of credit for ongoing needs"
];

const FUNDING_TYPES = [
  {
    title: "SBA 7(a) Loans",
    description: "The gold standard for laundromat acquisitions with long terms and low rates",
    amount: "Up to $5,000,000",
    bestFor: "Business acquisitions, major expansions, real estate purchases",
    speed: "2-4 weeks"
  },
  {
    title: "Equipment Financing",
    description: "Fast funding for commercial washers, dryers, and payment systems",
    amount: "Based on equipment value",
    bestFor: "New equipment purchases, upgrades, replacements",
    speed: "Same-day approval"
  },
  {
    title: "Commercial Real Estate",
    description: "Finance your laundromat property with competitive terms",
    amount: "Up to 80% LTV",
    bestFor: "Property purchases, refinancing, build-outs",
    speed: "2-4 weeks"
  },
  {
    title: "Lines of Credit",
    description: "Revolving credit for working capital and ongoing expenses",
    amount: "Flexible limits",
    bestFor: "Inventory, repairs, seasonal cash flow, emergencies",
    speed: "Same-day approval"
  }
];

export default function SouthEndCapital() {
  return (
    <>
      <SEO
        title="South End Capital | SBA Loans Up to $5M - $0 Guarantee Fees"
        description="Preferred SBA Lender backed by $3.2B Stearns Bank. $0 guarantee fees on loans up to $1M through 2025. Same-day equipment financing. Story-based underwriting for complex situations."
        canonicalUrl="/funding/south-end-capital"
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f]/90 to-[#1e3a5f] text-white py-16 border-b border-[#1e3a5f]">
          <div className="max-w-4xl mx-auto px-6">
            <Link href="/funding" className="text-[#C8A661] hover:underline text-sm mb-4 inline-block" data-testid="link-back-to-funding">
              ← Back to Funding Options
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                <Landmark className="h-7 w-7 text-[#C8A661]" />
              </div>
              <div>
                <Badge className="bg-[#C8A661]/30 text-[#C8A661] mb-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Preferred SBA Lender
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-partner-name">South End Capital</h1>
              </div>
            </div>
            <p className="text-xl text-[#C8A661] mb-6" data-testid="text-partner-tagline">
              Division of $3.2B Stearns Bank. SBA loans up to $5M with $0 guarantee fees on loans under $1M through 2025.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-hero">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" data-testid="button-prequalify-hero">
                  Get Pre-Qualified
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center" data-testid="card-stat-max-funding">
              <CardContent className="pt-6">
                <DollarSign className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#C8A661]">$5M</div>
                <div className="text-sm text-muted-foreground">Maximum SBA Funding</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-fees">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">$0 Fees</div>
                <div className="text-sm text-muted-foreground">On Loans Under $1M</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-speed">
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">Same-Day</div>
                <div className="text-sm text-muted-foreground">Equipment Approval</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">About South End Capital</h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              South End Capital is a division of Stearns Bank, a $3.2 billion institution acquired in 2021. As a Preferred 
              SBA Lender, they offer expedited processing and competitive rates. Their "story-based underwriting" approach 
              means they look beyond just numbers—if you have a compelling business case but complex financials, they'll 
              work with you to find a solution. This makes them ideal for first-time buyers, those with non-traditional 
              income, or complex ownership structures.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Funding Options</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {FUNDING_TYPES.map((type, idx) => (
                <Card key={idx} className={idx === 0 ? "border-2 border-[#C8A661]" : ""} data-testid={`card-funding-type-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-[#C8A661]">{type.amount}</div>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {type.speed}
                      </Badge>
                    </div>
                    <div className="bg-[#C8A661]/10 p-3 rounded-lg">
                      <div className="text-sm font-semibold text-[#C8A661] mb-1">Best For:</div>
                      <div className="text-sm">{type.bestFor}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-2 border-[#C8A661]" data-testid="card-why-south-end">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#C8A661]" />
                Why Choose South End Capital?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {SBA_FEATURES.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {SBA_FEATURES.slice(4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>2025 Special:</strong> Through 2025, SBA guarantee fees are waived on loans up to $1 million. 
                  This can save you thousands of dollars in upfront costs. South End Capital is positioned to maximize 
                  this benefit with their Preferred Lender status for faster processing.
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
                      3 years of personal tax returns
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Business tax returns (if existing business)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Personal financial statement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Business plan with projections
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-3">Helpful to Have:</div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Letter of intent or purchase agreement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Seller's financial statements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Property appraisal or lease
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Resume highlighting relevant experience
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
                <span>Want the lowest rates with longest terms (10-25 years)</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Need loans under $1M and want to save on guarantee fees</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Have complex financial situations or non-traditional income</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Are acquiring real estate along with the business</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Prefer working with a bank-backed lender</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Need same-day equipment financing alongside SBA</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/90 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Apply for SBA Financing?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Get pre-qualified today. Up to $5 million available with $0 guarantee fees on loans under $1M through 2025.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-cta">
                  Start Your Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" data-testid="button-prequalify-cta">
                  Get Pre-Qualified First
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-white/70">
              Preferred SBA Lender. Story-based underwriting. Fast decisions.
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
