import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, Clock, Zap, ArrowRight, DollarSign, FileText, TrendingUp, Briefcase, Shield, CreditCard, Percent } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Link } from 'wouter';

const APPLY_URL = "https://davidallencapital.com/nicholaskremers";

const DAC_FEATURES = [
  "A+ BBB rating",
  "Funding in 48-72 hours",
  "Bad credit OK - revenue-based approvals",
  "50% less expensive than most MCA competitors",
  "Early payoff discounts available",
  "Only 4+ months in business required",
  "$5K/month credit card sales minimum (for MCA)"
];

const FUNDING_TYPES = [
  {
    title: "Merchant Cash Advance",
    description: "Revenue-based funding repaid through a percentage of daily sales",
    amount: "$400 - $2,000,000",
    bestFor: "Fast capital, any credit, flexible repayment",
    speed: "48-72 hours"
  },
  {
    title: "Working Capital",
    description: "General-purpose business funding for any operational need",
    amount: "$5,000 - $500,000",
    bestFor: "Equipment repairs, inventory, payroll, opportunities",
    speed: "48-72 hours"
  },
  {
    title: "Equipment Financing",
    description: "Finance commercial laundry equipment with flexible terms",
    amount: "Based on equipment value",
    bestFor: "Washers, dryers, payment systems, facility upgrades",
    speed: "3-5 days"
  },
  {
    title: "Lines of Credit",
    description: "Revolving credit for ongoing business needs",
    amount: "Up to $250,000",
    bestFor: "Cash flow, inventory, seasonal needs",
    speed: "3-5 days"
  },
  {
    title: "SBA Loans",
    description: "Traditional SBA financing for qualified businesses",
    amount: "Up to $5,000,000",
    bestFor: "Acquisitions, real estate, major expansions",
    speed: "30-60 days"
  }
];

export default function DavidAllenCapital() {
  return (
    <>
      <SEO
        title="David Allen Capital | Working Capital $400-$2M in 48-72 Hours"
        description="A+ BBB rated. 50% less expensive than most MCA competitors. Funding from $400 to $2M in 48-72 hours. Bad credit OK - revenue-based approvals. Early payoff discounts available."
        canonicalUrl="/funding/david-allen-capital"
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f]/90 to-[#1e3a5f] text-white py-16 border-b border-[#1e3a5f]">
          <div className="max-w-4xl mx-auto px-6">
            <Link href="/funding" className="text-[#C8A661] hover:underline text-sm mb-4 inline-block" data-testid="link-back-to-funding">
              ← Back to Funding Options
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-[#C8A661]" />
              </div>
              <div>
                <Badge className="bg-[#C8A661]/30 text-[#C8A661] mb-2">
                  <Zap className="w-3 h-3 mr-1" />
                  Revenue-Based Funding
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-partner-name">David Allen Capital</h1>
              </div>
            </div>
            <p className="text-xl text-[#C8A661] mb-6" data-testid="text-partner-tagline">
              A+ BBB rated. 50% less expensive than most MCA. Funding in 48-72 hours. Bad credit OK.
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
                  Check Your Options
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
                <div className="text-3xl font-bold text-[#C8A661]">$2M</div>
                <div className="text-sm text-muted-foreground">Maximum Funding</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-speed">
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">48-72 Hrs</div>
                <div className="text-sm text-muted-foreground">Funding Speed</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-savings">
              <CardContent className="pt-6">
                <Percent className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">50%</div>
                <div className="text-sm text-muted-foreground">Less Than Most MCA</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">About David Allen Capital</h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              David Allen Capital, led by CEO David Rutz, operates as an ISO (Independent Sales Organization) broker model, 
              connecting business owners with multiple funding sources. Their A+ BBB rating reflects their commitment to 
              ethical practices. What sets them apart is their claim to be 50% less expensive than most MCA competitors, 
              with early payoff discounts that can save you even more. They specialize in helping business owners with 
              challenging credit situations access the capital they need.
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
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {type.speed}
                    </Badge>
                    <div className="bg-[#C8A661]/10 p-2 rounded-lg">
                      <div className="text-xs font-semibold text-[#C8A661] mb-1">Best For:</div>
                      <div className="text-xs">{type.bestFor}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-2 border-[#C8A661]" data-testid="card-why-dac">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#C8A661]" />
                Why Choose David Allen Capital?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {DAC_FEATURES.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {DAC_FEATURES.slice(4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Cost Advantage:</strong> David Allen Capital claims to be 50% less expensive than most MCA 
                  providers. Combined with their early payoff discount program, you can significantly reduce your 
                  total cost of capital. If you've been quoted high rates elsewhere, it's worth getting a comparison.
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
                  <div className="font-semibold mb-3">Minimum Requirements:</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      4+ months in business
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      $5,000/month in credit card sales (for MCA)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Active business bank account
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Valid government ID
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-3">Documents Needed:</div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      3-4 months bank statements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Credit card processing statements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Driver's license
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Voided check
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 rounded-lg p-8" data-testid="section-ideal-for">
            <h3 className="text-xl font-bold mb-4">Ideal For Business Owners Who:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Have challenging credit history</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Want lower-cost MCA alternatives</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Need funding within 48-72 hours</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Plan to pay off early for discounts</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Prefer revenue-based repayment flexibility</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Value working with A+ BBB rated companies</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/90 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready for Affordable Working Capital?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Apply now and get funded in 48-72 hours. 50% less expensive than most MCA. Early payoff discounts available.
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
                  Check Your Options
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-white/70">
              A+ BBB rated. Fast decisions. Early payoff savings.
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
