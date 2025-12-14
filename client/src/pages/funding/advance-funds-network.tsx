import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, Clock, Zap, ArrowRight, DollarSign, FileText, TrendingUp, Briefcase, Star, Timer } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Link } from 'wouter';

const APPLY_URL = "https://app.advancefundsnetwork.com/application/RcEBxFNwGGhwe5Z1Mehzaj2vqfm2?partner=OEO602XAIiZkhill7WmMwJ7NEfB3";

const AFN_FEATURES = [
  "A+ BBB rating with 4.9/5 Trustpilot (900+ reviews)",
  "Approval in as little as 60 minutes",
  "Same-day funding available",
  "No minimum credit score required",
  "Only 3+ months in business needed",
  "Just $15K/month revenue minimum",
  "APR starting from 6.95%"
];

const FUNDING_TYPES = [
  {
    title: "Working Capital",
    description: "Fast cash for any business purpose—repairs, inventory, payroll, or opportunities",
    amount: "$5,000 - $2,000,000",
    bestFor: "Emergency repairs, inventory, payroll, expansion",
    speed: "Same-day"
  },
  {
    title: "Term Loans",
    description: "Structured loans with fixed payments and clear terms",
    amount: "$10,000 - $500,000",
    bestFor: "Equipment purchases, renovations, growth initiatives",
    speed: "1-2 days"
  },
  {
    title: "Lines of Credit",
    description: "Revolving credit you can draw on as needed",
    amount: "Up to $5,000,000",
    bestFor: "Ongoing expenses, seasonal needs, cash flow management",
    speed: "1-2 days"
  },
  {
    title: "Equipment Financing",
    description: "Dedicated financing for commercial equipment purchases",
    amount: "Based on equipment value",
    bestFor: "Washers, dryers, payment systems, HVAC",
    speed: "1-3 days"
  },
  {
    title: "MCA (Merchant Cash Advance)",
    description: "Revenue-based funding repaid through daily sales percentage",
    amount: "$5,000 - $500,000",
    bestFor: "Quick capital when credit is challenging",
    speed: "Same-day"
  },
  {
    title: "Invoice Factoring",
    description: "Convert outstanding invoices into immediate cash",
    amount: "Up to 90% of invoice value",
    bestFor: "B2B laundromat services, commercial accounts",
    speed: "Same-day"
  }
];

export default function AdvanceFundsNetwork() {
  return (
    <>
      <SEO
        title="Advance Funds Network | Same-Day Funding - 60 Minute Approvals"
        description="A+ BBB rated with 4.9/5 Trustpilot. Same-day funding with approvals in 60 minutes. No minimum credit score. Working capital, lines of credit up to $5M, and equipment financing from 6.95% APR."
        canonicalUrl="/funding/advance-funds-network"
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f]/90 to-[#1e3a5f] text-white py-16 border-b border-[#1e3a5f]">
          <div className="max-w-4xl mx-auto px-6">
            <Link href="/funding" className="text-[#C8A661] hover:underline text-sm mb-4 inline-block" data-testid="link-back-to-funding">
              ← Back to Funding Options
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                <Timer className="h-7 w-7 text-[#C8A661]" />
              </div>
              <div>
                <Badge className="bg-[#C8A661]/30 text-[#C8A661] mb-2">
                  <Zap className="w-3 h-3 mr-1" />
                  Same-Day Funding
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-partner-name">Advance Funds Network</h1>
              </div>
            </div>
            <p className="text-xl text-[#C8A661] mb-6" data-testid="text-partner-tagline">
              A+ BBB rated. 4.9/5 Trustpilot. Approvals in 60 minutes. Same-day funding. No minimum credit score.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-hero">
                  Get Funded Today
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
            <Card className="text-center" data-testid="card-stat-speed">
              <CardContent className="pt-6">
                <Timer className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#C8A661]">60 Min</div>
                <div className="text-sm text-muted-foreground">Approval Time</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-rating">
              <CardContent className="pt-6">
                <Star className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">4.9/5</div>
                <div className="text-sm text-muted-foreground">Trustpilot (900+ Reviews)</div>
              </CardContent>
            </Card>
            <Card className="text-center" data-testid="card-stat-apr">
              <CardContent className="pt-6">
                <TrendingUp className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">6.95%</div>
                <div className="text-sm text-muted-foreground">Starting APR</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">About Advance Funds Network</h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              Founded in 2007 with offices in Brooklyn, New Jersey, Florida, Chicago, and Toronto, Advance Funds Network 
              has built a reputation for fast, reliable business funding. Their A+ BBB rating and 4.9/5 Trustpilot score 
              from over 900 reviews speaks to their commitment to customer service. They specialize in helping business 
              owners who need capital quickly—whether for emergencies, opportunities, or growth—regardless of credit history.
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

          <Card className="border-2 border-[#C8A661]" data-testid="card-why-afn">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#C8A661]" />
                Why Choose Advance Funds Network?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {AFN_FEATURES.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {AFN_FEATURES.slice(4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Emergency Ready:</strong> When your equipment breaks down or you spot a can't-miss opportunity, 
                  AFN can have funds in your account the same day. Their minimal requirements (3+ months in business, 
                  $15K/mo revenue) and no credit minimum make them accessible when you need capital fast.
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
                      3+ months in business
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      $15,000/month minimum revenue
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
                      4 months bank statements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Voided check or bank letter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Driver's license
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Signed application
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
                <span>Need capital today—not next week</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Have less-than-perfect credit</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Face emergency equipment repairs</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Want to seize time-sensitive opportunities</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Have been declined by traditional banks</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Value working with A+ BBB rated companies</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/90 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Need Funding Today?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Apply now and get approved in as little as 60 minutes. Same-day funding available. No minimum credit score.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-cta">
                  Get Funded Today
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
              A+ BBB rated. 4.9/5 Trustpilot. 60-minute decisions.
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
