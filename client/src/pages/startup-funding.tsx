import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, DollarSign, Lightbulb, CreditCard, Building2, ArrowRight, Clock, Shield, Users, Zap } from 'lucide-react';
import { Star } from "@/lib/icon-registry";
import { SEO } from '@/components/SEO';
import { TrustSignals, FundingDisclaimer, ConsultationCTA } from "@/components/FundingEEAT";

const STARTUP_FUNDING_KEYWORDS = [
  'laundromat startup funding',
  'first time laundromat owner financing',
  'how to buy a laundromat with no money',
  'startup capital for laundromat',
  'new laundromat business loan',
  'laundromat startup cost financing',
  'personal credit laundromat loan',
  'business credit laundromat financing'
];

const STARTUP_FUNDING_FAQS = [
  {
    question: "Should I use personal or business credit for laundromat startup?",
    answer: "Personal credit is faster with higher limits (up to $500K) if you have 680+ scores. Business credit builds your LLC's creditworthiness for future expansion. Many first-time owners use personal credit for quick funding, then build business credit once established."
  },
  {
    question: "How much can I get for laundromat startup funding?",
    answer: "Personal credit term loans offer up to $500,000 with 5-7 year terms. Business credit programs typically range from $10,000-$250,000. The amount depends on your credit profile, income documentation, and business plan."
  },
  {
    question: "What credit score do I need to start a laundromat?",
    answer: "Personal credit term loans require 680+ on all 3 bureaus. Business credit card programs need 700+ credit. Business credit-based financing may work with lower scores but requires an established LLC."
  },
  {
    question: "How fast can I get startup funding?",
    answer: "Personal credit funding typically takes 7-15 business days. Business credit programs approve in 24-48 hours with funding in 3-7 days. Having all documents ready speeds up the process significantly."
  }
];

export default function StartupFunding() {
  return (
    <>
      <SEO
        title="Startup Laundromat Funding | Personal & Business Credit Options 2025"
        description="Get startup funding for your first laundromat. Personal credit up to $500K or business credit options. Compare funding paths and find the right fit for your situation."
        canonicalUrl="/startup-funding"
        keywords={STARTUP_FUNDING_KEYWORDS}
        faqs={STARTUP_FUNDING_FAQS}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-[#1e3a5f] via-[#1e3a5f]/90 to-[#1e3a5f] text-white py-16 border-b border-[#1e3a5f]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lightbulb className="w-10 h-10 text-[#C8A661]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Startup Laundromat Funding</h1>
            <p className="text-xl text-[#C8A661] mb-6 max-w-2xl mx-auto">
              Launch your first laundromat with the right funding. Choose your path below based on your credit situation.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-[#C8A661]/30 text-[#C8A661] px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                No Business History Required
              </Badge>
              <Badge className="bg-[#C8A661]/30 text-[#C8A661] px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Funding in 7-15 Days
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-6 relative z-10">
          <TrustSignals variant="horizontal" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Choose Your Funding Path</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Both paths work for first-time laundromat owners. Choose based on your credit profile and funding needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-[#C8A661] relative overflow-visible hover-elevate" data-testid="card-personal-credit-path">
              <div className="absolute -top-3 left-4">
                <Badge className="bg-[#C8A661] text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular for Startups
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-[#C8A661]/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-[#C8A661]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Personal Credit Path</CardTitle>
                    <CardDescription>Preferred Funding Group</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-3xl font-bold text-[#C8A661]">Up to $500,000</div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">5 or 7 year term loans at 9-15% rates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">0% business credit cards for 6-12 months</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">No collateral or assets required</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">No upfront fees or down payment</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Funding in 7-15 business days</span>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Requirements:</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>680+ credit score on all 3 bureaus</li>
                    <li>2 years tax returns showing $50K+ income</li>
                  </ul>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Best for:</span> First-time owners with good personal credit who want maximum funding with flexible terms
                </div>

                <Link href="/funding/preferred-funding-group">
                  <Button className="w-full bg-[#C8A661] text-white" size="lg" data-testid="button-explore-personal-credit">
                    Explore Personal Credit Options
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border hover-elevate" data-testid="card-business-credit-path">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Business Credit Path</CardTitle>
                    <CardDescription>GoKapital</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-3xl font-bold text-green-600">Up to $250,000</div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Build business credit from day one</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">24-48 hour approval decisions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Flexible 6-36 month terms</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Works with newer LLCs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Funding in 3-7 business days</span>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Requirements:</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Established business entity (LLC)</li>
                    <li>Valid ID and business documentation</li>
                  </ul>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Best for:</span> Entrepreneurs who want to build business credit while funding their laundromat
                </div>

                <Link href="/funding/gokapital">
                  <Button className="w-full" variant="outline" size="lg" data-testid="button-explore-business-credit">
                    Explore Business Credit Options
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Quick Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Personal Credit</th>
                    <th className="text-center py-3 px-4">Business Credit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Maximum Amount</td>
                    <td className="text-center py-3 px-4 text-[#C8A661] font-semibold">$500,000</td>
                    <td className="text-center py-3 px-4">$250,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Approval Speed</td>
                    <td className="text-center py-3 px-4">7-15 days</td>
                    <td className="text-center py-3 px-4 text-green-600 font-semibold">24-48 hours</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Credit Score Required</td>
                    <td className="text-center py-3 px-4">680+</td>
                    <td className="text-center py-3 px-4">Varies</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Loan Terms</td>
                    <td className="text-center py-3 px-4">5-7 years</td>
                    <td className="text-center py-3 px-4">6-36 months</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Collateral Required</td>
                    <td className="text-center py-3 px-4 text-green-600">None</td>
                    <td className="text-center py-3 px-4 text-green-600">None</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Builds Business Credit</td>
                    <td className="text-center py-3 px-4">Credit cards only</td>
                    <td className="text-center py-3 px-4 text-green-600 font-semibold">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {STARTUP_FUNDING_FAQS.map((faq, idx) => (
                <Card key={idx} data-testid={`card-faq-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/90 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Explore your options and apply today. Both paths work with first-time laundromat operators.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/funding/preferred-funding-group">
                <Button className="bg-[#C8A661] text-white" size="lg" data-testid="button-cta-personal">
                  Personal Credit (Up to $500K)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/funding/gokapital">
                <Button variant="outline" className="border-white text-white hover:bg-white/10" size="lg" data-testid="button-cta-business">
                  Business Credit (Up to $250K)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <ConsultationCTA />
          <FundingDisclaimer />
        </div>
      </div>
    </>
  );
}
