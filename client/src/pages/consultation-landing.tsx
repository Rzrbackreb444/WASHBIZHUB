import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { CheckCircle, TrendingUp, Users, Zap, ArrowRight } from "lucide-react";

const CONSULTATION_GUIDES = [
  {
    id: "sba-consultation-guide",
    title: "SBA Loan Consultation: Prepare Your Application",
    description: "Get expert guidance on SBA loan preparation, documentation, and application strategy.",
    benefits: ["Understand eligibility", "Prepare financials", "Improve approval odds"],
    cta: "Schedule Consultation",
    internalLinks: ["/cleanbi", "/calculators", "/valuation-calculator"],
    externalLinks: [
      { text: "ATM Depot Solutions", url: "https://atmdepot.com/laundromat" },
      { text: "Laundry Equipment A-Advantage", url: "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry" }
    ]
  },
  {
    id: "equipment-upgrade-consultation",
    title: "Equipment Upgrade Consultation: ROI Analysis",
    description: "Get expert advice on equipment financing, Dexter vs Girbau comparison, and ROI projections.",
    benefits: ["Financing options", "Equipment comparison", "ROI calculations"],
    cta: "Book Consultation",
    internalLinks: ["/design-studio", "/calculators", "/cleanbi"],
    externalLinks: [
      { text: "A-Advantage Laundry Equipment", url: "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry" }
    ]
  },
  {
    id: "expansion-strategy-consultation",
    title: "Multi-Unit Expansion Strategy: Growth Planning",
    description: "Strategic guidance on expanding from single-unit to multi-unit operations with optimal financing.",
    benefits: ["Growth strategy", "Financing paths", "Market analysis"],
    cta: "Discuss Expansion",
    internalLinks: ["/forum", "/competitive-intelligence", "/calculators"],
    externalLinks: [
      { text: "ATM Depot", url: "https://atmdepot.com/laundromat" },
      { text: "Laundry Equipment Partner", url: "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry" }
    ]
  }
];

export default function ConsultationLanding() {
  return (
    <>
      <SEO 
        title="Expert Consultation Services | WashBizHub - Laundromat Financing & Growth" 
        description="Schedule expert consultations on SBA financing, equipment upgrades, and business growth strategies. Get personalized guidance from industry experts."
        canonicalUrl="/consultation-landing"
        keywords={["laundromat consultation", "financing guidance", "business strategy", "equipment consulting"]}
        ogType="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Expert Consultation Services</h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-6">
              Get personalized guidance on SBA financing, equipment upgrades, and strategic growth from industry experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/consultation"
                className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-lg transition-colors inline-block"
                data-testid="button-book-consultation"
              >
                Book Consultation Now
              </Link>
              <a 
                href="mailto:consult@washbizhub.com" 
                className="text-accent font-semibold text-lg hover:underline"
                data-testid="link-email-hero"
                aria-label="Email our consultation team at consult@washbizhub.com"
              >
                Email consult@washbizhub.com
              </a>
            </div>
          </div>

          {/* Consultation Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {CONSULTATION_GUIDES.map(guide => (
              <Card key={guide.id} className="bg-white/10 backdrop-blur border-white/20 hover-elevate transition-all flex flex-col">
                <CardHeader>
                  <CardTitle className="text-white">{guide.title}</CardTitle>
                  <CardDescription className="text-white/70">{guide.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2">
                    {guide.benefits.map(benefit => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-white/80">
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  
                  {/* Internal Links */}
                  <div className="border-t border-white/20 pt-4">
                    <p className="text-xs text-white/60 mb-2">Resources:</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.internalLinks.map(link => (
                        <Link key={link} href={link}>
                          <Badge variant="outline" className="text-xs cursor-pointer hover-elevate">
                            {link.split('/')[1]}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* External Links */}
                  {guide.externalLinks.length > 0 && (
                    <div className="border-t border-white/20 pt-4">
                      <p className="text-xs text-white/60 mb-2">Partners:</p>
                      <div className="space-y-2">
                        {guide.externalLinks.map(link => (
                          <a 
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                          >
                            {link.text} <ArrowRight className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href="/consultation">
                    <Button className="w-full mt-4">{guide.cta}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-8">Why Work With WashBizHub?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <Zap className="w-8 h-8 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Industry Expertise</h3>
                  <p className="text-sm text-white/70">Years of experience in laundromat, car wash, and dry cleaning industries.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="w-8 h-8 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Proven Network</h3>
                  <p className="text-sm text-white/70">Access to lenders, equipment providers, and strategic partners.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <TrendingUp className="w-8 h-8 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Data-Driven Results</h3>
                  <p className="text-sm text-white/70">Leverage CLEANBI™ scores and competition intelligence for better decisions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-white/70 mb-4">Ready to grow your business?</p>
            <Link href="/consultation">
              <Button size="lg" className="gap-2">
                Schedule Your Consultation <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
