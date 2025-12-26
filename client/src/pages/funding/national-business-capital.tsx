import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Building, Clock, Shield, ArrowRight, DollarSign, FileText, Users, Landmark, Phone, Mail } from 'lucide-react';
import { Star } from "@/lib/icon-registry";
import { SEO } from '@/components/SEO';
import { Link } from 'wouter';

const APPLY_EMAIL = "trosado@national.biz";
const CC_EMAIL = "consult@washbizhub.com";
const SUBJECT = "Nicholas Kremers Referral - Laundromat Acquisition Financing";

const SBA_LOAN_FEATURES = [
  "SBA 7(a) loan specialists",
  "75+ lender network for best rates",
  "10-25 year terms available",
  "24-48 hour pre-approval decisions",
  "Dedicated acquisition specialists",
  "No prepayment penalties on most loans",
  "Expert guidance through SBA process"
];

const FUNDING_TYPES = [
  {
    title: "SBA 7(a) Business Loans",
    description: "The gold standard for laundromat acquisitions with the best rates and longest terms",
    amount: "$100K - $5M",
    terms: "10-25 years",
    bestFor: "Established laundromat purchases, multi-store acquisitions"
  },
  {
    title: "Commercial Real Estate Loans",
    description: "Finance the purchase of laundromat real estate alongside the business",
    amount: "$500K - $10M",
    terms: "Up to 25 years",
    bestFor: "Property acquisitions, owner-occupied buildings"
  },
  {
    title: "Equipment Financing",
    description: "Dedicated financing for large-scale commercial laundry equipment",
    amount: "$100K - $2M",
    terms: "5-10 years",
    bestFor: "Full retool projects, new equipment packages"
  }
];

const REQUIREMENTS = [
  { label: "Credit Score", value: "650+ minimum" },
  { label: "Time in Business", value: "2+ years preferred" },
  { label: "Annual Revenue", value: "$100,000+ minimum" },
  { label: "Down Payment", value: "10-20% typical" }
];

export default function NationalBusinessCapital() {
  const mailtoLink = `mailto:${APPLY_EMAIL}?cc=${CC_EMAIL}&subject=${encodeURIComponent(SUBJECT)}`;
  
  return (
    <>
      <SEO
        title="National Business Capital | SBA 7(a) Laundromat Financing Up to $10M"
        description="Access $100K-$10M in laundromat acquisition financing through 75+ lenders. SBA 7(a) specialists with 10-25 year terms. 24-48 hour pre-approval. Perfect for large acquisitions and multi-store portfolios."
        canonicalUrl="/funding/national-business-capital"
        keywords={[
          "laundromat SBA loan",
          "laundromat acquisition financing",
          "SBA 7(a) laundromat",
          "commercial laundromat loan",
          "laundromat business financing",
          "buy laundromat financing",
          "laundromat purchase loan",
          "SBA small business loan laundromat",
          "laundromat acquisition funding",
          "multi-store laundromat financing"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Funding", url: "/startup-funding" },
          { name: "National Business Capital", url: "/funding/national-business-capital" }
        ]}
        faqs={[
          {
            question: "What is the minimum credit score for National Business Capital SBA loans?",
            answer: "National Business Capital works with borrowers with credit scores of 650 or higher. Higher credit scores typically qualify for better rates and terms."
          },
          {
            question: "How much can I borrow for a laundromat acquisition?",
            answer: "National Business Capital offers financing from $100,000 to $10 million for laundromat acquisitions, with SBA 7(a) loans up to $5 million and commercial real estate loans up to $10 million."
          },
          {
            question: "How long does the SBA loan approval process take?",
            answer: "National Business Capital provides pre-approval decisions within 24-48 hours. Full SBA loan closing typically takes 45-90 days depending on deal complexity."
          },
          {
            question: "What are the typical terms for laundromat acquisition loans?",
            answer: "SBA 7(a) loans for laundromat acquisitions typically have 10-25 year terms with competitive interest rates. Equipment financing terms range from 5-10 years."
          },
          {
            question: "Do I need experience to qualify for laundromat financing?",
            answer: "While experience helps, National Business Capital works with first-time laundromat buyers. Having a solid business plan, adequate down payment, and good credit are the primary requirements."
          }
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FinancialService",
          "name": "National Business Capital - Laundromat Financing",
          "description": "SBA 7(a) loan specialists offering $100K-$10M in laundromat acquisition financing through 75+ lenders",
          "provider": {
            "@type": "Organization",
            "name": "National Business Capital"
          },
          "areaServed": "United States",
          "serviceType": "Business Loan",
          "termsOfService": "https://www.national.biz/terms"
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
                <Landmark className="h-7 w-7 text-[#C8A661]" />
              </div>
              <div>
                <Badge className="bg-[#C8A661]/30 text-[#C8A661] mb-2">
                  <Star className="w-3 h-3 mr-1" />
                  Large Acquisitions Specialist
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold">National Business Capital</h1>
              </div>
            </div>
            <p className="text-xl text-[#C8A661] mb-6">
              SBA 7(a) specialists with 75+ lenders. Access $100K-$10M for laundromat acquisitions with the best rates and terms.
            </p>
            <a href={mailtoLink}>
              <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-hero">
                Get Pre-Qualified
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <DollarSign className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold text-[#C8A661]">$10M</div>
                <div className="text-sm text-muted-foreground">Maximum Funding</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">24-48 Hrs</div>
                <div className="text-sm text-muted-foreground">Pre-Approval</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">75+</div>
                <div className="text-sm text-muted-foreground">Lender Network</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-[#C8A661] mx-auto mb-3" />
                <div className="text-3xl font-bold">SBA 7(a)</div>
                <div className="text-sm text-muted-foreground">Specialists</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">About National Business Capital</h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              National Business Capital is a leading business financing marketplace with access to 75+ lenders, ensuring 
              you get the best rates and terms for your laundromat acquisition. Their team of SBA specialists has helped 
              thousands of business owners secure funding, and they're experts at navigating the SBA 7(a) process for 
              laundromat purchases. Whether you're acquiring a single location or building a multi-store portfolio, 
              National Business Capital has the experience and lender relationships to get your deal done.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8">Financing Options</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {FUNDING_TYPES.map((type, idx) => (
                <Card key={idx} className={idx === 0 ? "border-2 border-[#C8A661]" : ""} data-testid={`card-funding-type-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-2xl font-bold text-[#C8A661]">{type.amount}</div>
                    <div className="text-sm text-muted-foreground">Terms: {type.terms}</div>
                    <div className="bg-[#C8A661]/10 p-3 rounded-lg">
                      <div className="text-sm font-semibold text-[#C8A661] mb-1">Best For:</div>
                      <div className="text-sm">{type.bestFor}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-2 border-[#C8A661]" data-testid="card-why-sba">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[#C8A661]" />
                Why Choose SBA 7(a) for Your Laundromat?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {SBA_LOAN_FEATURES.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {SBA_LOAN_FEATURES.slice(4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Why SBA 7(a)?</strong> SBA loans offer the longest terms (up to 25 years), lowest rates, 
                  and smallest down payments for laundromat acquisitions. The 75+ lender network means competitive 
                  bidding for your deal, ensuring you get the best possible terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Qualification Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {REQUIREMENTS.map((req, idx) => (
                  <div key={idx} className="bg-background p-4 rounded-lg text-center">
                    <div className="text-lg font-bold text-[#C8A661]">{req.value}</div>
                    <div className="text-sm text-muted-foreground">{req.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold mb-3">Required Documents:</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      2-3 years business and personal tax returns
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      YTD profit and loss statement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Business bank statements (3-6 months)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#C8A661]" />
                      Personal financial statement
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-3">For Acquisitions:</div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Seller's 3 years tax returns
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Purchase agreement or LOI
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Equipment list and values
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      Lease agreement or real estate details
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Ideal For Buyers Who:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Are acquiring laundromats valued at $500K or more</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Want the lowest possible interest rates and longest terms</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Are building a multi-location laundromat portfolio</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Need to include real estate in the purchase</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Have existing business experience or industry knowledge</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C8A661] flex-shrink-0 mt-0.5" />
                <span>Want expert guidance through the SBA process</span>
              </div>
            </div>
          </div>

          <Card className="border-[#C8A661]">
            <CardHeader>
              <CardTitle>Contact National Business Capital</CardTitle>
              <CardDescription>Mention "Nicholas Kremers Referral" for priority processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#C8A661]/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="font-semibold">Tony Rosado</div>
                    <a href={mailtoLink} className="text-[#C8A661] hover:underline">trosado@national.biz</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#C8A661]/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">WashBizHub Consulting</div>
                    <a href="mailto:consult@washbizhub.com" className="text-[#C8A661] hover:underline">consult@washbizhub.com</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e3a5f]/90 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Finance Your Acquisition?</h2>
            <p className="mb-8 text-lg max-w-2xl mx-auto">
              Get pre-approved in 24-48 hours. Access up to $10 million through 75+ lenders with the best rates and terms for your laundromat purchase.
            </p>
            <a href={mailtoLink}>
              <Button className="bg-[#C8A661] text-[#1e3a5f] hover:bg-[#C8A661]/90" size="lg" data-testid="button-apply-cta">
                Get Pre-Qualified Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <p className="mt-4 text-sm text-white/70">
              Free consultation. No obligation. SBA loan specialists ready to help.
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
