import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building2, Clock, Zap, ArrowRight, DollarSign, FileText, TrendingUp, Briefcase } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Link } from 'wouter';

const APPLY_URL = "https://itsgokapital.com";
const PREQUALIFY_URL = "https://itsgokapital.com/business-loans";

const BUSINESS_LOAN_FEATURES = [
  "Builds your business credit profile",
  "24-48 hour approval decisions",
  "Funding in 3-7 business days",
  "Flexible 6-36 month terms",
  "Works with newer LLCs",
  "Competitive business rates",
  "No personal collateral required"
];

const FUNDING_TYPES = [
  {
    title: "Business Term Loans",
    description: "Traditional business loans to fund your laundromat purchase or startup",
    amount: "$10,000 - $250,000",
    bestFor: "Equipment purchases, build-out costs, working capital"
  },
  {
    title: "Business Line of Credit",
    description: "Revolving credit line for ongoing operational needs",
    amount: "Up to $150,000",
    bestFor: "Inventory, supplies, unexpected expenses, cash flow management"
  },
  {
    title: "Equipment Financing",
    description: "Dedicated financing for commercial laundry equipment",
    amount: "Based on equipment value",
    bestFor: "Washers, dryers, payment systems, folding equipment"
  }
];

export default function GoKapital() {
  return (
    <>
      <SEO
        title="GoKapital | Business Credit Laundromat Funding Up to $250K"
        description="Build business credit while funding your laundromat startup. Up to $250,000 with 24-48 hour approvals. Flexible terms from 6-36 months. Perfect for new LLCs."
        canonicalUrl="/funding/gokapital"
        keywords={[
          "business credit laundromat",
          "LLC laundromat financing",
          "first-time business owner loan",
          "fast laundromat approval",
          "equipment financing laundromat",
          "build business credit laundromat",
          "term loan laundromat",
          "line of credit laundromat",
          "working capital laundromat",
          "new LLC business loan"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Funding", url: "/startup-funding" },
          { name: "GoKapital", url: "/funding/gokapital" }
        ]}
        faqs={[
          {
            question: "How does GoKapital help build my business credit?",
            answer: "GoKapital reports your loan activity to business credit bureaus, not personal credit. After 6-12 months of on-time payments, your LLC establishes a credit history, qualifying you for larger loans and better rates for future expansion."
          },
          {
            question: "Can I get funding with a newly formed LLC?",
            answer: "Yes. GoKapital specializes in working with newer LLCs and first-time business owners. They focus on business credit building, making them ideal for entrepreneurs just starting their laundromat journey."
          },
          {
            question: "How fast can I get approved and funded?",
            answer: "GoKapital provides approval decisions within 24-48 hours. Once approved, funding is typically deposited in 3-7 business days, significantly faster than traditional bank loans."
          },
          {
            question: "What types of funding does GoKapital offer for laundromats?",
            answer: "GoKapital offers business term loans ($10K-$250K), business lines of credit (up to $150K), and equipment financing based on equipment value. All options help build your business credit profile."
          },
          {
            question: "What do I need to apply for GoKapital funding?",
            answer: "You need a valid government ID, business entity documentation (LLC), EIN number, and business bank statements if available. A business plan and equipment quotes are helpful but not required."
          }
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FinancialService",
          "name": "GoKapital - Laundromat Business Financing",
          "description": "Business credit-building laundromat financing up to $250,000 with 24-48 hour approvals. Ideal for new LLCs and first-time business owners.",
          "provider": { "@type": "Organization", "name": "GoKapital" },
          "areaServed": "United States",
          "serviceType": "Business Loan"
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f]/90 to-[#1e3a5f] text-white py-16 border-b border-[#1e3a5f]">
          <div className="max-w-4xl mx-auto px-6">
            <Link href="/startup-funding" className="text-[#C8A661] hover:underline text-sm mb-4 inline-block">
              ← Back to Funding Options
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-14 w-14 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-[#C8A661]" />
              </div>
              <div>
                <Badge className="bg-[#C8A661]/30 text-[#C8A661] mb-2">
                  <Zap className="w-3 h-3 mr-1" />
                  Business Credit Path
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold">GoKapital</h1>
              </div>
            </div>
            <p className="text-xl text-[#C8A661] mb-6">
              Build business credit while funding your laundromat. Fast approvals, flexible terms, works with new LLCs.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-hero">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={PREQUALIFY_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" data-testid="button-prequalify-hero">
                  Get Pre-Qualified
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <DollarSign className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#C8A661]">$250K</div>
                <div className="text-sm text-muted-foreground">Maximum Funding</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">24-48 Hours</div>
                <div className="text-sm text-muted-foreground">Approval Decision</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <TrendingUp className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">Builds Credit</div>
                <div className="text-sm text-muted-foreground">Business Profile</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">About GoKapital</h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              GoKapital is a leading business financing company that specializes in helping entrepreneurs and small business 
              owners access the capital they need to grow. They work with new LLCs and first-time business owners, making 
              them an ideal partner for aspiring laundromat operators. Their focus on business credit means your loan 
              activity builds your company's credit profile, setting you up for larger financing opportunities as you expand.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Funding Options</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {FUNDING_TYPES.map((type, idx) => (
                <Card key={idx} className={idx === 0 ? "border-2 border-[#C8A661]" : ""} data-testid={`card-funding-type-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-2xl font-bold text-[#C8A661]">{type.amount}</div>
                    <div className="bg-[#C8A661]/10 p-3 rounded-lg">
                      <div className="text-sm font-semibold text-[#C8A661] mb-1">Best For:</div>
                      <div className="text-sm">{type.bestFor}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-2 border-[#C8A661]" data-testid="card-why-business-credit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#C8A661]" />
                Why Build Business Credit?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {BUSINESS_LOAN_FEATURES.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {BUSINESS_LOAN_FEATURES.slice(4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Long-term benefit:</strong> By using business credit now, you establish a credit history for your LLC. 
                  After 6-12 months of on-time payments, you'll qualify for larger loans, SBA financing, and better rates 
                  when you're ready to expand to your second or third location.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
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
                      Valid government-issued ID
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Business entity documentation (LLC, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      EIN (Employer Identification Number)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Business bank statements (if available)
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-3">Helpful to Have:</div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Business plan with projections
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Property lease or purchase agreement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Equipment quotes from vendors
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Personal financial statement
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Ideal For First-Time Owners Who:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Recently formed an LLC and want to build business credit</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Plan to expand to multiple locations in the future</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Want to keep personal and business finances separate</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Need faster approval than traditional bank loans</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Prefer shorter-term financing with flexible payoff</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Want to establish banking relationships for growth</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/90 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Business Credit?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Apply now and get a decision in 24-48 hours. Up to $250,000 available for your laundromat startup.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-cta">
                  Start Your Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={PREQUALIFY_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" data-testid="button-prequalify-cta">
                  Get Pre-Qualified First
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-white/70">
              Free to apply. No obligation. Fast decisions.
            </p>
          </div>

          <div className="text-center">
            <Link href="/startup-funding">
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
