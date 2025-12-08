/**
 * SEO Landing Page: Laundromat Equipment Repair
 * Target Keywords: laundromat equipment repair, commercial washer repair, Speed Queen error codes
 */

import { SEOLandingPage } from "@/components/SEOLandingPage";
import { getSEOPageConfig } from "@/lib/seo-keywords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Wrench, AlertTriangle, Mic, Camera, FileText, Phone, CheckCircle2, Zap } from "lucide-react";

const config = getSEOPageConfig("/laundromat-equipment-repair")!;

const stats = [
  { value: "15,000+", label: "Error Codes Covered" },
  { value: "50+", label: "Equipment Brands" },
  { value: "AI-Powered", label: "Diagnostics" },
  { value: "24/7", label: "Availability" }
];

const features = [
  {
    icon: "wrench",
    title: "15,000+ Error Codes",
    description: "Complete database for Speed Queen, Dexter, Maytag, Continental, and 50+ more brands."
  },
  {
    icon: "zap",
    title: "AI Diagnostics",
    description: "Describe your symptoms and get step-by-step repair instructions instantly."
  },
  {
    icon: "mapPin",
    title: "Voice Input",
    description: "Hands-free diagnosis in the field using speech recognition."
  },
  {
    icon: "target",
    title: "Photo Analysis",
    description: "Upload equipment photos and let AI identify the error code."
  },
  {
    icon: "fileText",
    title: "Job Tracking",
    description: "Track repair jobs, notes, and status for your service calls."
  },
  {
    icon: "dollarSign",
    title: "Parts & Pricing",
    description: "Integrated parts ordering with Amazon and commercial suppliers."
  }
];

const testimonials = [
  {
    quote: "Service Guy AI diagnosed a Dexter E43 error in seconds. Saved me an hour of troubleshooting.",
    author: "Mike T.",
    role: "Service Technician, Atlanta GA",
    rating: 5
  },
  {
    quote: "The voice input is a game changer. I can diagnose while keeping my hands on the equipment.",
    author: "Carlos R.",
    role: "Multi-Unit Operator, Miami FL",
    rating: 5
  },
  {
    quote: "Parts ordering integration has cut my repair time by 30%. No more searching for part numbers.",
    author: "Dave's Laundry Service",
    role: "Commercial Repair Company",
    rating: 5
  }
];

const relatedTools = [
  {
    name: "Error Code Lookup",
    description: "Search our database of 15,000+ error codes.",
    href: "/error-codes",
    icon: "wrench"
  },
  {
    name: "Parts Store",
    description: "Order replacement parts from trusted suppliers.",
    href: "/parts",
    icon: "dollarSign"
  },
  {
    name: "Equipment Marketplace",
    description: "Buy and sell commercial laundry equipment.",
    href: "/equipment-marketplace",
    icon: "building"
  }
];

const commonErrors = [
  { code: "E1 / F1", meaning: "Water Inlet Issue", solution: "Check water valves, inlet hoses, and water supply" },
  { code: "E2 / F2", meaning: "Drain Problem", solution: "Check drain pump, drain hose, and filter for blockages" },
  { code: "E3 / F3", meaning: "Motor/Spin Error", solution: "Check motor connections, belt, and control board" },
  { code: "E4 / F4", meaning: "Temperature Sensor", solution: "Check thermistor, heating element, or NTC sensor" },
  { code: "E5 / F5", meaning: "Door Lock Issue", solution: "Check door latch, lock mechanism, and switch" },
  { code: "E7 / F7", meaning: "Drive System", solution: "Check motor, inverter, and belt tension" }
];

const supportedBrands = [
  "Speed Queen", "Dexter", "Maytag Commercial", "Continental", 
  "Huebsch", "Wascomat", "IPSO", "Alliance", "Electrolux", 
  "LG Commercial", "Whirlpool Commercial", "UniMac"
];

export default function LaundromatEquipmentRepairSEO() {
  return (
    <SEOLandingPage
      config={config}
      stats={stats}
      features={features}
      testimonials={testimonials}
      relatedTools={relatedTools}
      cta={{
        primary: { text: "Try Service Guy AI", href: "/service-guy-ai" },
        secondary: { text: "Browse Error Codes", href: "/error-codes" }
      }}
    >
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-errors">
            Common Commercial Laundry Error Codes
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Quick reference for the most frequent issues across all brands
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commonErrors.map((error, idx) => (
              <Card key={idx} className="border" data-testid={`error-${idx}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-red-500 text-white font-mono text-lg">{error.code}</Badge>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">{error.meaning}</h3>
                  <p className="text-sm text-muted-foreground">{error.solution}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/error-codes">
              <Button size="lg" variant="outline" data-testid="button-all-errors">
                View All 15,000+ Error Codes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-service-guy">
            Service Guy AI Features
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            The most advanced diagnostic tool for laundromat equipment
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Mic, title: "Voice Diagnosis", description: "Speak your symptoms, get instant solutions" },
              { icon: Camera, title: "Photo Analysis", description: "AI identifies error codes from equipment photos" },
              { icon: FileText, title: "Job Tracking", description: "Manage service calls and repair history" },
              { icon: Phone, title: "Parts Ordering", description: "Integrated Amazon and commercial suppliers" }
            ].map((feature, idx) => (
              <Card key={idx} className="text-center" data-testid={`feature-${idx}`}>
                <CardContent className="pt-6">
                  <feature.icon className="w-10 h-10 mx-auto mb-4 text-[#C8A661]" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/service-guy-ai">
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B89651] text-[#0A1628]" data-testid="button-try-ai">
                Try Service Guy AI Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-brands">
            Supported Equipment Brands
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Comprehensive coverage for all major commercial laundry manufacturers
          </p>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {supportedBrands.map((brand, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="text-base py-2 px-4"
                data-testid={`brand-${idx}`}
              >
                {brand}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" data-testid="heading-pricing">
            Service Guy AI Plans
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Choose the plan that fits your service needs
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "$0", lookups: "3/month", features: ["Basic diagnostics", "Error code lookup", "Limited steps"] },
              { name: "Starter", price: "$29", lookups: "50/month", features: ["Full diagnostics", "Parts pricing", "Voice input"] },
              { name: "Pro", price: "$79", lookups: "500/month", features: ["Everything in Starter", "Photo analysis", "Job tracking", "Invoice generator"], popular: true },
              { name: "Enterprise", price: "$199", lookups: "Unlimited", features: ["Everything in Pro", "Priority support", "API access", "Team accounts"] }
            ].map((plan, idx) => (
              <Card key={idx} className={`relative ${plan.popular ? 'border-2 border-[#C8A661]' : ''}`} data-testid={`plan-${idx}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8A661] text-[#0A1628]">Most Popular</Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <Badge variant="secondary">{plan.lookups}</Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SEOLandingPage>
  );
}
