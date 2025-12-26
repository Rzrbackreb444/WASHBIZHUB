import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Clock, Shield, Phone, Mail, ArrowRight, Banknote, FileText, Calendar, DollarSign } from 'lucide-react';
import { Star } from "@/lib/icon-registry";
import { SEO } from '@/components/SEO';
import { Link } from 'wouter';

const APPLY_URL = "https://preferredfundinggroup.wufoo.com/forms/z84eu6p0dp3x12/";

const TERM_LOAN_FEATURES = [
  "No minimum time in business",
  "Fixed monthly payment",
  "No upfront fees or down payment",
  "Full liquidity immediately",
  "Funding in 7-15 business days",
  "No assets or collateral required",
  "No prepayment penalty"
];

const CREDIT_CARD_FEATURES = [
  "No minimum time in business",
  "Stated income",
  "No upfront fees",
  "Reports only to business credit bureaus",
  "Build business credit while you fund"
];

export default function PreferredFundingGroup() {
  return (
    <>
      <SEO
        title="Preferred Funding Group | Personal Credit Laundromat Funding Up to $500K"
        description="Get up to $500,000 for your laundromat startup using personal credit. 5-7 year term loans at 9-15%, 0% business credit cards. No collateral, no upfront fees, funding in 7-15 days."
        canonicalUrl="/funding/preferred-funding-group"
        keywords={[
          "personal credit laundromat loan",
          "laundromat startup funding",
          "no collateral business loan",
          "0% business credit card",
          "term loan laundromat",
          "first-time laundromat owner financing",
          "laundromat credit card funding",
          "laundromat startup capital",
          "personal credit business loan",
          "5 year laundromat loan"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Funding", url: "/startup-funding" },
          { name: "Preferred Funding Group", url: "/funding/preferred-funding-group" }
        ]}
        faqs={[
          {
            question: "What credit score do I need to qualify for Preferred Funding Group?",
            answer: "For term loans, you need a minimum 680 credit score on all 3 bureaus. For business credit cards, a 700+ credit score is required. Both options use personal credit to qualify."
          },
          {
            question: "How much funding can I get for my laundromat startup?",
            answer: "Preferred Funding Group offers up to $500,000 through their term loan program. The exact amount depends on your credit strength, income history, and 2 years of tax returns showing $50K+ income."
          },
          {
            question: "What are the term lengths for laundromat loans?",
            answer: "Preferred Funding Group offers 5 or 7 year term loans with fixed monthly payments. Rates range from 9-15% based on your credit profile, with no prepayment penalties."
          },
          {
            question: "Is collateral required for a laundromat startup loan?",
            answer: "No. Preferred Funding Group requires no assets or collateral for their term loans or business credit card programs. Approval is based on your personal credit and income."
          },
          {
            question: "How long does the approval and funding process take?",
            answer: "Funding typically takes 7-15 business days. There are no upfront fees or down payment requirements, and you receive full liquidity immediately upon approval."
          }
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FinancialService",
          "name": "Preferred Funding Group - Laundromat Financing",
          "description": "Personal credit-based laundromat funding up to $500,000 with 5-7 year term loans and 0% business credit cards. No collateral required.",
          "provider": { "@type": "Organization", "name": "Preferred Funding Group" },
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
                <CreditCard className="h-7 w-7 text-[#C8A661]" />
              </div>
              <div>
                <Badge className="bg-[#C8A661]/30 text-[#C8A661] mb-2">
                  <Star className="w-3 h-3 mr-1" />
                  Personal Credit Path
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold">Preferred Funding Group</h1>
              </div>
            </div>
            <p className="text-xl text-[#C8A661] mb-6">
              Leverage your personal credit to fund your laundromat startup. Up to $500,000 with no collateral required.
            </p>
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#C8A661] text-white" size="lg" data-testid="button-apply-hero">
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <DollarSign className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#C8A661]">$500K</div>
                <div className="text-sm text-muted-foreground">Maximum Funding</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">7-15 Days</div>
                <div className="text-sm text-muted-foreground">Funding Timeline</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">No Collateral</div>
                <div className="text-sm text-muted-foreground">Required</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">About Preferred Funding Group</h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              Preferred Funding Group specializes in helping first-time laundromat owners access capital through personal credit. 
              They work directly with The Laundromat Financial Group to provide tailored funding solutions for entrepreneurs 
              entering the laundromat industry. With their streamlined process, you can get approved and funded quickly 
              without the red tape of traditional bank loans.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-[#C8A661]" data-testid="card-term-loans">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-[#C8A661]/10 flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <div>
                    <CardTitle>5 or 7 Year Term Loans</CardTitle>
                    <CardDescription>Long-term financing for serious capital needs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#C8A661]">Up to $500,000</span>
                </div>
                <div className="text-lg">
                  <span className="font-semibold">Rates:</span> 9-15% based on credit strength
                </div>

                <div className="space-y-3">
                  <div className="font-semibold">Features:</div>
                  {TERM_LOAN_FEATURES.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="font-semibold mb-2">Requirements:</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>680+ credit score on all 3 bureaus</li>
                    <li>2 years tax returns showing $50K+ income</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-lg">
                  <div className="font-semibold mb-2 text-blue-600">Best Used For:</div>
                  <ul className="text-sm space-y-1">
                    <li>Equipment purchases ($50K-$150K)</li>
                    <li>Build-out and renovation costs</li>
                    <li>Working capital for first 6 months</li>
                    <li>Complete laundromat startup package</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-credit-cards">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Business Credit Card Program</CardTitle>
                    <CardDescription>Build credit while funding your startup</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-green-600">0% Interest</span>
                  <span className="text-muted-foreground">for 6-12 months</span>
                </div>

                <div className="space-y-3">
                  <div className="font-semibold">Features:</div>
                  {CREDIT_CARD_FEATURES.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="font-semibold mb-2">Requirements:</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>700+ credit score</li>
                    <li>Established business entity (LLC)</li>
                  </ul>
                </div>

                <div className="bg-green-500/10 p-4 rounded-lg">
                  <div className="font-semibold mb-2 text-green-600">Best Used For:</div>
                  <ul className="text-sm space-y-1">
                    <li>Initial inventory and supplies</li>
                    <li>Marketing and signage</li>
                    <li>Smaller equipment purchases</li>
                    <li>Emergency operational expenses</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

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
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Valid driver's license or passport
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Social Security number
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      2 years personal tax returns
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      6 months bank statements
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-3">Helpful to Have:</div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Business plan or projections
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
                      LLC or business entity documentation
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C8A661]">
            <CardHeader>
              <CardTitle>Contact The Laundromat Financial Group</CardTitle>
              <CardDescription>Direct support for your funding application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#C8A661]/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="font-semibold">Nick Kremers</div>
                    <a href="tel:4798834314" className="text-[#C8A661] hover:underline">(479) 883-4314</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#C8A661]/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <a href="mailto:thelaundromater@gmail.com" className="text-[#C8A661] hover:underline">thelaundromater@gmail.com</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/90 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Fund Your Laundromat?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Apply now and get a decision quickly. Up to $500,000 available with no collateral required.
            </p>
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#C8A661] text-white" size="lg" data-testid="button-apply-cta">
                Start Your Application
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <p className="mt-4 text-sm text-white/70">
              Free to apply. No obligation. Get pre-qualified in minutes.
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
