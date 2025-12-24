import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function MarketplaceLanding() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "WashBizHub Marketplace",
    description: "Buy and sell verified, profitable laundromat businesses online",
    url: "https://washbizhub.com/marketplace-landing",
    image: "https://washbizhub.com/og-marketplace.png",
    priceRange: "$50K - $500K",
  };

  return (
    <>
      <SEOHead
        title="Buy & Sell Laundromats - Verified Marketplace"
        description="Browse verified, profitable laundromat businesses with CLEANBI scoring. Connect with sellers, brokers, and find your next opportunity on WashBizHub's marketplace."
        keywords={[
          "buy laundromat",
          "sell laundromat",
          "laundromat marketplace",
          "laundromat for sale",
          "profitable laundromats",
          "CLEANBI scores",
          "laundromat broker",
        ]}
        canonical="https://washbizhub.com/marketplace-landing"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero */}
          <div className="text-center space-y-6 py-20">
            <Badge className="mx-auto">Verified Marketplace</Badge>
            <h1 className="text-5xl md:text-6xl font-bold">
              Buy & Sell Profitable Laundromats
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect directly with verified sellers and brokers. Every listing includes CLEANBI scoring, financial data, and SEO-optimized pages.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/laundromat-listings">
                <Button size="lg" className="gap-2">
                  Browse Listings
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/laundromat-listings">
                <Button size="lg" variant="outline">
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover-elevate">
              <CardHeader>
                <Store className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Verified Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All listings verified with detailed financials, CLEANBI scores, and verified seller profiles.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Financial Clarity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  See annual revenue, monthly profit, ROI projections, and valuation methods upfront.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <Users className="w-8 h-8 text-green-500 mb-2" />
                <CardTitle>Direct Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Message sellers, brokers, and investors directly. No intermediaries.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { num: "1", title: "Search", desc: "Filter by location, price, ROI" },
                { num: "2", title: "Evaluate", desc: "Review CLEANBI scores & financials" },
                { num: "3", title: "Connect", desc: "Message seller directly" },
                { num: "4", title: "Close", desc: "Complete transaction" },
              ].map((step) => (
                <div key={step.num} className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto font-bold">
                    {step.num}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold">Why List on WashBizHub</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Reach 73,000+ serious buyers",
                "SEO-optimized landing pages for your listing",
                "CLEANBI scoring builds buyer confidence",
                "Direct messaging without broker fees",
                "Real-time view and inquiry tracking",
                "Featured listing options for visibility",
              ].map((benefit, i) => (
                <div key={i} className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 py-12">
            <h2 className="text-3xl font-bold">Ready to Buy or Sell?</h2>
            <p className="text-muted-foreground text-lg">
              Join hundreds of successful laundromat entrepreneurs on WashBizHub
            </p>
            <Link href="/laundromat-listings">
              <Button size="lg">Get Started Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
