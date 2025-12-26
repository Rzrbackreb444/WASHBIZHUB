import { SeoHead } from "@/components/SeoHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Zap, TrendingUp, BarChart3, CheckCircle2, ArrowRight } from "lucide-react";

export default function PosLanding() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WashBizHub POS System",
    description: "Modern POS system for laundromats with per-pound pricing, IoT integration, and analytics",
    applicationCategory: "BusinessApplication",
    url: "https://washbizhub.com/pos-landing",
  };

  return (
    <>
      <SeoHead
        title="POS System for Laundromats - Per-Pound Pricing & IoT"
        description="Modern cloud-based POS system for laundromats. Support per-pound pricing, multiple payment types, real-time analytics, and IoT machine monitoring."
        keywords={[
          "laundromat POS",
          "point of sale system",
          "per-pound pricing",
          "laundromat software",
          "cloud POS",
          "payment processing",
          "IoT monitoring",
        ]}
        canonical="https://washbizhub.com/pos-landing"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero */}
          <div className="text-center space-y-6 py-20">
            <Badge className="mx-auto">Next-Gen POS</Badge>
            <h1 className="text-5xl md:text-6xl font-bold">
              Modern POS for Laundromats
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Per-pound pricing, digital payments, real-time analytics, and IoT integration - all in one cloud-based system.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2">
                Request Demo
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover-elevate">
              <CardHeader>
                <CreditCard className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Per-Pound Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatic weight-based billing increases revenue 15-25%. Digital scales integrated with cloud system.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <Zap className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Multiple Payment Types</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cards, mobile payments, digital wallets, coins - all tracked in one system.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-green-500 mb-2" />
                <CardTitle>Real-Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Live dashboards showing revenue, machine performance, peak hours, and customer trends.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
                <CardTitle>IoT Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Monitor machine status, temperature, water flow, and energy usage in real-time.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold">Increase Revenue & Reduce Costs</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Per-pound pricing: 15-25% revenue increase",
                "Real-time alerts for machine issues",
                "Reduce manual coin collection time",
                "Predictive maintenance prevents downtime",
                "Loyalty programs drive repeat customers",
                "Cloud backup - never lose sales data",
              ].map((benefit, i) => (
                <div key={i} className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Simple Pricing</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Standard</CardTitle>
                  <p className="text-sm text-muted-foreground">For single location</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$99<span className="text-lg">/mo</span></div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Unlimited transactions</li>
                    <li>✓ Real-time reporting</li>
                    <li>✓ Basic IoT integration</li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </CardContent>
              </Card>

              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <p className="text-sm text-muted-foreground">For multiple locations</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$299<span className="text-lg">/mo</span></div>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Multi-location management</li>
                    <li>✓ Advanced analytics</li>
                    <li>✓ Full IoT ecosystem</li>
                    <li>✓ 24/7 support</li>
                  </ul>
                  <Button className="w-full">Contact Sales</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 py-12">
            <h2 className="text-3xl font-bold">Ready to Transform Your POS?</h2>
            <p className="text-muted-foreground text-lg">
              Join 500+ laundromat operators using WashBizHub POS
            </p>
            <Button size="lg">Request Demo Today</Button>
          </div>
        </div>
      </div>
    </>
  );
}
