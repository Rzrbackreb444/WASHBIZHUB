/**
 * SEO Landing Page: Laundromat Location Analysis
 * Target Keywords: laundromat location analysis, laundromat site selection, laundromat demographics
 */

import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, MapPin, Users, TrendingUp, Building2, Car, Train, CheckCircle2 } from "lucide-react";

const stats = [
  { value: "6", label: "Scoring Factors" },
  { value: "2,400+", label: "Locations Analyzed" },
  { value: "85%+", label: "Accuracy Rate" },
  { value: "A-C", label: "Grade System" }
];

const features = [
  {
    icon: "users",
    title: "Demographics Analysis",
    description: "Analyze renter population, income levels, household size, and age distribution."
  },
  {
    icon: "building",
    title: "Competition Mapping",
    description: "Map all competitors within 3 miles with quality scores and service gaps."
  },
  {
    icon: "trendingUp",
    title: "Traffic Patterns",
    description: "Evaluate foot traffic, visibility, and peak usage times."
  },
  {
    icon: "mapPin",
    title: "Accessibility Score",
    description: "Assess parking, transit access, and customer convenience."
  },
  {
    icon: "dollarSign",
    title: "Economic Indicators",
    description: "Track local employment, housing trends, and economic stability."
  },
  {
    icon: "target",
    title: "Growth Potential",
    description: "Identify value-add opportunities and expansion potential."
  }
];

const testimonials = [
  {
    quote: "CLEANBI showed me the location had 52% renters and no competition within 1.5 miles. It's now my most profitable store.",
    author: "Chris W.",
    role: "Multi-Unit Owner, Miami FL",
    rating: 5
  },
  {
    quote: "The demographics analysis revealed why the seller was struggling - only 28% renters. Saved me from a bad purchase.",
    author: "Angela P.",
    role: "Investor, Portland OR",
    rating: 5
  },
  {
    quote: "I use CLEANBI for every site selection. It's like having a market researcher on demand.",
    author: "Regional Laundry Group",
    role: "10+ Location Portfolio",
    rating: 5
  }
];

const relatedTools = [
  {
    name: "CLEANBI Explorer",
    description: "Full location intelligence with all 6 scoring factors.",
    href: "/cleanbi-explorer",
    icon: "mapPin"
  },
  {
    name: "Laundromats For Sale",
    description: "Browse listings with pre-analyzed locations.",
    href: "/buy-laundromat",
    icon: "building"
  },
  {
    name: "ROI Calculator",
    description: "Project returns for analyzed locations.",
    href: "/roi-calculator",
    icon: "calculator"
  }
];

const cleanbiFactors = [
  { name: "Demographics", weight: "25%", description: "Renter %, income levels, household size, population density", icon: Users, idealValue: "40%+ renters, $15K-$50K income" },
  { name: "Competition", weight: "20%", description: "Distance to competitors, competitor quality, market saturation", icon: Building2, idealValue: "1+ miles to nearest, weak competition" },
  { name: "Traffic", weight: "20%", description: "Foot traffic, visibility from road, peak hours analysis", icon: Car, idealValue: "High visibility, 10K+ daily traffic" },
  { name: "Accessibility", weight: "15%", description: "Parking availability, transit access, ADA compliance", icon: Train, idealValue: "5+ parking spots, near transit" },
  { name: "Economics", weight: "10%", description: "Local employment, housing growth, economic stability", icon: TrendingUp, idealValue: "Growing employment, new housing" },
  { name: "Location Quality", weight: "10%", description: "Safety, neighborhood trends, anchor tenants", icon: MapPin, idealValue: "Low crime, growing area" }
];

export default function LaundromatLocationAnalysisSEO() {
  const config = getSEOPageConfig("/laundromat-location-analysis");
  
  if (!config) return null;

  return (
    <SEOLandingPage
      config={config}
      stats={stats}
      features={features}
      testimonials={testimonials}
      relatedTools={relatedTools}
      cta={{
        primary: { text: "Analyze Any Location", href: "/cleanbi-explorer" },
        secondary: { text: "View Demo", href: "/cleanbi" }
      }}
    >
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-cleanbi">
            The CLEANBI Scoring System
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            6 weighted factors that determine laundromat location quality
          </p>

          <div className="space-y-4">
            {cleanbiFactors.map((factor, idx) => (
              <Card key={idx} className="border shadow-sm" data-testid={`factor-${idx}`}>
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 md:w-1/4">
                      <div className="w-12 h-12 rounded-lg bg-[#C8A661]/10 flex items-center justify-center flex-shrink-0">
                        <factor.icon className="w-6 h-6 text-[#C8A661]" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{factor.name}</h3>
                        <Badge variant="secondary" className="mt-1">{factor.weight}</Badge>
                      </div>
                    </div>
                    <div className="md:w-2/4">
                      <p className="text-sm text-muted-foreground">{factor.description}</p>
                    </div>
                    <div className="md:w-1/4 text-right">
                      <span className="text-xs text-muted-foreground">Ideal:</span>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">{factor.idealValue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-grades">
            CLEANBI Grading System
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Only A, B, and C are positive grades. Everything below is "Needs Work."
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { grade: "A", score: "85+", label: "Excellent Opportunity", color: "bg-green-500", description: "Prime location with ideal demographics and low competition" },
              { grade: "B", score: "70-84", label: "Good Opportunity", color: "bg-lime-500", description: "Strong fundamentals with minor areas for improvement" },
              { grade: "C", score: "55-69", label: "Fair Opportunity", color: "bg-amber-500", description: "Acceptable location requiring strategic positioning" },
              { grade: "NW", score: "<55", label: "Needs Work", color: "bg-[#C8A661]", description: "Requires significant improvements or value-add strategy" }
            ].map((grade, idx) => (
              <Card key={idx} className="text-center border-2" data-testid={`grade-${idx}`}>
                <CardHeader className="pb-2">
                  <div className={`w-16 h-16 ${grade.color} text-white rounded-xl mx-auto flex items-center justify-center text-3xl font-bold`}>
                    {grade.grade}
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge className="mb-2">{grade.score}</Badge>
                  <h3 className="font-semibold mb-2">{grade.label}</h3>
                  <p className="text-sm text-muted-foreground">{grade.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-demographics">
            Ideal Laundromat Demographics
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Target these metrics for maximum profitability
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { metric: "Renter Population", ideal: "40-50%+", description: "Renters typically lack in-unit laundry" },
              { metric: "Household Income", ideal: "$15K-$50K", description: "Sweet spot for laundromat usage" },
              { metric: "Population Density", ideal: "High", description: "More customers within service radius" },
              { metric: "Household Size", ideal: "2.3+ members", description: "Larger families = more loads" },
              { metric: "Service Radius", ideal: "1-2 miles", description: "60-70% of customers live within" },
              { metric: "Age Demographics", ideal: "18-44", description: "Primary laundromat user age range" }
            ].map((item, idx) => (
              <Card key={idx} data-testid={`demo-${idx}`}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-[#C8A661] mb-1">{item.ideal}</div>
                  <h3 className="font-semibold mb-2">{item.metric}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/cleanbi-explorer">
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628]" data-testid="button-analyze-location">
                Analyze Your Location Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SEOLandingPage>
  );
}
