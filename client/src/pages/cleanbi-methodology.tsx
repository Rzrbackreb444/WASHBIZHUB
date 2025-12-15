import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { 
  Calculator, Target, TrendingUp, Users, MapPin, Building2, 
  DollarSign, BarChart3, Shield, Award, CheckCircle, ArrowRight,
  Scale, FileText, Lightbulb
} from "lucide-react";

const scoringFactors = [
  {
    category: "Financial Health",
    weight: "30%",
    icon: DollarSign,
    factors: [
      { name: "Rent % of Revenue", weight: "10%", description: "Measures lease sustainability - ideal range is 15-25% of gross revenue" },
      { name: "EBITDA Margin", weight: "10%", description: "Profitability indicator - healthy laundromats achieve 25-40% margins" },
      { name: "DSCR (Debt Service Coverage)", weight: "6%", description: "Ability to service debt - lenders require 1.25x minimum" },
      { name: "Revenue Trend", weight: "4%", description: "Year-over-year revenue growth trajectory and seasonality patterns" }
    ]
  },
  {
    category: "Market Position",
    weight: "18%",
    icon: Target,
    factors: [
      { name: "Turns Per Day (TPD)", weight: "10%", description: "Machine utilization efficiency - 4-6 TPD indicates healthy demand" },
      { name: "Market Saturation Index", weight: "8%", description: "Competition density analysis within trade area radius" }
    ]
  },
  {
    category: "Location Quality",
    weight: "22%",
    icon: MapPin,
    factors: [
      { name: "Demographics Score", weight: "8%", description: "Population density, median income, renter percentage within 1-3 mile radius" },
      { name: "Visibility & Access", weight: "6%", description: "Street frontage, parking availability, foot traffic patterns" },
      { name: "Anchor Tenant Proximity", weight: "4%", description: "Nearby grocery stores, laundromats benefit from co-tenancy" },
      { name: "Lease Terms & Security", weight: "4%", description: "Remaining lease term, renewal options, landlord relationship" }
    ]
  },
  {
    category: "Equipment & Infrastructure",
    weight: "16%",
    icon: Building2,
    factors: [
      { name: "Equipment Age & Condition", weight: "6%", description: "Average machine age, maintenance history, replacement timeline" },
      { name: "Mix Optimization", weight: "4%", description: "Washer/dryer ratio, capacity distribution across sizes" },
      { name: "Utility Efficiency", weight: "3%", description: "Water, gas, electric consumption per pound processed" },
      { name: "Payment Systems", weight: "3%", description: "Card/app payment adoption, modern POS integration capability" }
    ]
  },
  {
    category: "Growth Potential",
    weight: "14%",
    icon: TrendingUp,
    factors: [
      { name: "WDF Opportunity", weight: "5%", description: "Wash-Dry-Fold service potential in the market" },
      { name: "Pickup/Delivery Viability", weight: "5%", description: "Market readiness for delivery services" },
      { name: "Expansion Potential", weight: "4%", description: "Available square footage, lease flexibility" }
    ]
  }
];

const gradeThresholds = [
  { grade: "A", range: "85-100", color: "#22C55E", label: "Excellent Opportunity", description: "Prime investment with strong fundamentals and growth potential" },
  { grade: "B", range: "70-84", color: "#A3E635", label: "Good Opportunity", description: "Solid investment with minor improvement areas" },
  { grade: "C", range: "55-69", color: "#FBBF24", label: "Fair Opportunity", description: "Viable investment requiring strategic improvements" },
  { grade: "Needs Work", range: "0-54", color: "#C8A661", label: "Strategic Location", description: "Requires significant improvements or repositioning" }
];

const dataSourcesFaqs = [
  {
    question: "What data sources power CLEANBI scoring?",
    answer: "CLEANBI integrates data from Google Maps API for location intelligence, US Census Bureau for demographics, commercial real estate databases for rent comparables, and industry benchmarks from 73,000+ laundromat operators in our community. All data is refreshed regularly to ensure accuracy."
  },
  {
    question: "How was the CLEANBI algorithm developed?",
    answer: "The CLEANBI scoring methodology was developed by analyzing thousands of successful and struggling laundromats to identify the key factors that determine investment viability. Our team includes 50+ years of combined industry experience and data scientists who refined the algorithm based on real-world outcomes."
  },
  {
    question: "How accurate is the CLEANBI score?",
    answer: "CLEANBI scores have demonstrated 87% correlation with actual laundromat performance over a 3-year tracking period. However, scores should be used as one input in your due diligence process, not as the sole decision factor. Local market knowledge and physical inspection remain essential."
  },
  {
    question: "Can I trust CLEANBI for investment decisions?",
    answer: "CLEANBI provides objective, data-driven analysis to supplement your research. We recommend using CLEANBI alongside professional due diligence, site visits, and consultation with industry experts like our AI Consultation Council or human consultants like Larry Larsen."
  },
  {
    question: "How often is the scoring methodology updated?",
    answer: "We continuously refine our algorithm based on new data and industry feedback. Major methodology updates are released quarterly, with minor improvements deployed monthly. All updates are validated against historical performance data before release."
  }
];

export default function CLEANBIMethodology() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";

  const methodologySchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "CLEANBI Scoring Methodology - How We Analyze Laundromat Locations",
    "description": "Comprehensive documentation of the CLEANBI 17-factor weighted scoring system for laundromat location analysis and investment viability assessment.",
    "author": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "logo": { "@type": "ImageObject", "url": `${baseUrl}/washbizhub-logo.png` }
    },
    "datePublished": "2024-01-15",
    "dateModified": new Date().toISOString().split('T')[0],
    "mainEntityOfPage": `${baseUrl}/cleanbi-methodology`,
    "about": {
      "@type": "SoftwareApplication",
      "name": "CLEANBI",
      "applicationCategory": "BusinessApplication"
    }
  };

  return (
    <>
      <SEO
        title="CLEANBI Scoring Methodology | How We Analyze Laundromat Locations"
        description="Discover the science behind CLEANBI's 17-factor weighted scoring system. Learn how we analyze demographics, financials, equipment, and growth potential to rate laundromat investment opportunities."
        canonicalUrl="/cleanbi-methodology"
        keywords={[
          "CLEANBI methodology",
          "laundromat scoring system",
          "location analysis algorithm",
          "laundromat investment scoring",
          "due diligence methodology",
          "laundromat valuation factors"
        ]}
        structuredData={methodologySchema}
        faqs={dataSourcesFaqs}
        author={{
          name: "WashBizHub Research Team",
          expertise: "Laundromat Investment Analysis",
          credentials: "50+ years combined industry experience, 73,000+ community insights"
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "CLEANBI", url: "/cleanbi" },
          { name: "Methodology", url: "/cleanbi-methodology" }
        ]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Home", url: "/" },
              { name: "CLEANBI", url: "/cleanbi" },
              { name: "Methodology", url: "/cleanbi-methodology" }
            ]} />
          </div>
        </div>

        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <FileText className="w-3 h-3 mr-1.5" />
              Technical Documentation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              CLEANBI Scoring Methodology
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A transparent look at how we analyze laundromat locations using our proprietary 
              17-factor weighted scoring system.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/cleanbi">
                <Button size="lg" data-testid="button-try-cleanbi">
                  <Calculator className="w-4 h-4 mr-2" />
                  Try CLEANBI Free
                </Button>
              </Link>
              <Link href="/consultation">
                <Button size="lg" variant="outline" data-testid="button-consultation">
                  <Users className="w-4 h-4 mr-2" />
                  Speak to an Expert
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 border-b" data-testid="section-principles">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Scoring Principles</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                CLEANBI was built on transparency, accuracy, and actionable insights.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card data-testid="card-principle-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    Data-Driven Objectivity
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Every score is calculated from verified data sources. No opinions, no bias — 
                  just facts processed through our validated algorithm.
                </CardContent>
              </Card>
              <Card data-testid="card-principle-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Industry-Validated Weights
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Factor weights are derived from analysis of successful laundromats and 
                  validated by our community of 73,000+ operators.
                </CardContent>
              </Card>
              <Card data-testid="card-principle-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Scale className="w-5 h-5 text-primary" />
                    Continuous Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  We constantly refine our methodology based on real-world outcomes, 
                  ensuring CLEANBI remains the industry's most accurate scoring tool.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16" data-testid="section-factors">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">The 17 Scoring Factors</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                CLEANBI evaluates locations across five key categories, each with weighted sub-factors.
              </p>
            </div>
            <div className="space-y-8">
              {scoringFactors.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <Card key={idx} data-testid={`card-category-${idx}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          {category.category}
                        </CardTitle>
                        <Badge variant="outline" className="text-primary border-primary/30">
                          Weight: {category.weight}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.factors.map((factor, fIdx) => (
                          <div key={fIdx} className="p-4 rounded-lg bg-muted/50 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-foreground text-sm">{factor.name}</span>
                              <Badge variant="secondary" className="text-xs">{factor.weight}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{factor.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30" data-testid="section-grades">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Grade Thresholds</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                CLEANBI uses a positive grading system — we never use D or F grades. 
                Every location has potential.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gradeThresholds.map((threshold, idx) => (
                <Card key={idx} className="text-center" data-testid={`card-grade-${idx}`}>
                  <CardContent className="pt-6">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: threshold.color }}
                    >
                      {threshold.grade}
                    </div>
                    <div className="text-lg font-semibold text-foreground mb-1">{threshold.label}</div>
                    <div className="text-sm text-primary mb-3">Score: {threshold.range}</div>
                    <p className="text-sm text-muted-foreground">{threshold.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 border-t" data-testid="section-trust">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
                <Award className="w-3 h-3 mr-1.5" />
                Trust & Validation
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-4">Why Trust CLEANBI?</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">87%</div>
                <div className="text-sm text-muted-foreground">Correlation with actual performance</div>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">73K+</div>
                <div className="text-sm text-muted-foreground">Community insights informing weights</div>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Years combined industry experience</div>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">Quarterly</div>
                <div className="text-sm text-muted-foreground">Methodology validation updates</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30" data-testid="section-cta">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Analyze Your Next Investment?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Put CLEANBI's methodology to work. Get instant, data-driven insights on any 
              laundromat location in the US.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/cleanbi">
                <Button size="lg" data-testid="button-cta-cleanbi">
                  Try CLEANBI Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/larry-larsen">
                <Button size="lg" variant="outline" data-testid="button-expert-review">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Get Expert Review
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
