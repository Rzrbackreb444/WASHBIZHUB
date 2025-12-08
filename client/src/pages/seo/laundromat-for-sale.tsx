/**
 * SEO Landing Page: Laundromats For Sale
 * Target Keywords: laundromat for sale, buy laundromat, laundromats for sale near me
 */

import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, MapPin, DollarSign, TrendingUp, Building2, CheckCircle2, Search } from "lucide-react";

const config = getSEOPageConfig("/laundromat-for-sale")!;

const stats = [
  { value: "500+", label: "Active Listings" },
  { value: "50", label: "States Covered" },
  { value: "$250K-$2M", label: "Price Range" },
  { value: "24hr", label: "New Listing Alerts" }
];

const features = [
  {
    icon: "mapPin",
    title: "CLEANBI Location Scores",
    description: "Every listing analyzed with demographics, competition, traffic, and growth potential."
  },
  {
    icon: "dollarSign",
    title: "Financial Projections",
    description: "See estimated ROI, cash flow, and payback period based on verified data."
  },
  {
    icon: "trendingUp",
    title: "Deal Analysis",
    description: "Compare asking price to fair market value with our valuation algorithms."
  },
  {
    icon: "building",
    title: "Verified Brokers",
    description: "Connect directly with experienced laundromat business brokers."
  },
  {
    icon: "shield",
    title: "Due Diligence Support",
    description: "100+ item checklist and expert consultation for every purchase."
  },
  {
    icon: "zap",
    title: "Instant Alerts",
    description: "Get notified when new listings match your criteria within 24 hours."
  }
];

const testimonials = [
  {
    quote: "Found my first laundromat on WashBizHub. The CLEANBI analysis showed me it was a great location before I even visited.",
    author: "Marcus D.",
    role: "First-Time Buyer, Austin TX",
    rating: 5
  },
  {
    quote: "The platform connected me with a broker who specialized in laundromats. Closed in 45 days with SBA financing.",
    author: "Sarah K.",
    role: "Multi-Unit Operator, Phoenix AZ",
    rating: 5
  },
  {
    quote: "We've acquired 3 locations through WashBizHub leads. The financial analysis saves us weeks of due diligence.",
    author: "K&S Laundry Group",
    role: "Portfolio Investors",
    rating: 5
  }
];

const relatedTools = [
  {
    name: "CLEANBI Explorer",
    description: "Analyze any address for laundromat investment potential.",
    href: "/cleanbi-explorer",
    icon: "mapPin"
  },
  {
    name: "Laundromat Financing",
    description: "SBA loans, equipment financing, and acquisition funding.",
    href: "/funding",
    icon: "dollarSign"
  },
  {
    name: "Due Diligence Checklist",
    description: "Complete verification checklist for buyers.",
    href: "/laundromat-due-diligence",
    icon: "fileText"
  }
];

const sampleListings = [
  {
    name: "Turnkey Coin Laundry",
    location: "Los Angeles, CA",
    price: "$450,000",
    revenue: "$180K/yr",
    grade: "A",
    features: ["Card Ready", "10-Year Lease", "Wash & Fold"]
  },
  {
    name: "High-Volume Laundromat",
    location: "Houston, TX",
    price: "$350,000",
    revenue: "$140K/yr",
    grade: "B",
    features: ["24/7 Operation", "30 Washers", "Owner Retiring"]
  },
  {
    name: "Neighborhood Laundry",
    location: "Chicago, IL",
    price: "$275,000",
    revenue: "$110K/yr",
    grade: "B",
    features: ["Corner Location", "New Equipment", "Attended"]
  }
];

export default function LaundromatForSaleSEO() {
  return (
    <SEOLandingPage
      config={config}
      stats={stats}
      features={features}
      testimonials={testimonials}
      relatedTools={relatedTools}
      cta={{
        primary: { text: "Browse All Listings", href: "/buy-laundromat" },
        secondary: { text: "Get Buyer Alerts", href: "/signup" }
      }}
    >
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-listings">
            Featured Laundromats For Sale
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            CLEANBI-analyzed listings with verified financial data
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sampleListings.map((listing, idx) => (
              <Card key={idx} className="border shadow-md hover-elevate" data-testid={`listing-${idx}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{listing.name}</CardTitle>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                        <MapPin className="w-3 h-3" />
                        {listing.location}
                      </div>
                    </div>
                    <Badge 
                      className={`${
                        listing.grade === 'A' ? 'bg-green-500' : 
                        listing.grade === 'B' ? 'bg-lime-500' : 'bg-amber-500'
                      } text-white font-bold`}
                    >
                      Grade {listing.grade}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-[#C8A661]">{listing.price}</div>
                      <div className="text-xs text-muted-foreground">Asking Price</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{listing.revenue}</div>
                      <div className="text-xs text-muted-foreground">Annual Revenue</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {listing.features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{feature}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/buy-laundromat">
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628]" data-testid="button-view-all">
                View All 500+ Listings
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-guide">
            How to Buy a Laundromat
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Your step-by-step guide to purchasing a profitable laundry business
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-2 border-[#0A1628]/10">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#C8A661] text-[#0A1628] flex items-center justify-center text-xl font-bold mb-4">1</div>
                <CardTitle>Search & Analyze</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">Browse listings filtered by location, price, and investment criteria. Use CLEANBI to analyze each opportunity.</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Filter by price range</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> View CLEANBI scores</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Compare opportunities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#0A1628]/10">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#C8A661] text-[#0A1628] flex items-center justify-center text-xl font-bold mb-4">2</div>
                <CardTitle>Due Diligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">Verify financials, inspect equipment, review lease terms, and analyze market conditions before making an offer.</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 100+ item checklist</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Utility verification</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Equipment inspection</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#0A1628]/10">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#C8A661] text-[#0A1628] flex items-center justify-center text-xl font-bold mb-4">3</div>
                <CardTitle>Finance & Close</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">Secure SBA or conventional financing, negotiate terms, and close the deal with broker support.</p>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> SBA loan assistance</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Equipment financing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Closing support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-investment">
            Why Invest in a Laundromat?
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            One of the most profitable small business investments available
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "20-35%", label: "Average Annual ROI", icon: TrendingUp },
              { value: "85-95%", label: "5-Year Survival Rate", icon: Building2 },
              { value: "$7.1B", label: "US Market Size", icon: DollarSign },
              { value: "35,000+", label: "Locations Nationwide", icon: MapPin }
            ].map((stat, idx) => (
              <Card key={idx} className="text-center" data-testid={`invest-stat-${idx}`}>
                <CardContent className="pt-6">
                  <stat.icon className="w-8 h-8 mx-auto mb-4 text-[#C8A661]" />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SEOLandingPage>
  );
}
