import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Users, ArrowRight, Store, Wrench, Package,
  Megaphone, Gift, TrendingUp, MessageSquare, CheckCircle
} from "lucide-react";

const partnerStats = [
  { value: "72,000+", label: "Active Professionals" },
  { value: "150K+", label: "Monthly Page Views" },
  { value: "45%", label: "Buyer Conversion Rate" }
];

const listingOptions = [
  {
    id: "laundromat",
    title: "List Your Laundromat",
    description: "Sell your laundromat to qualified buyers",
    icon: Store,
    link: "/listing-form",
    badge: "FREE",
    badgeClass: "bg-green-500/20 text-green-400 border-green-500/30",
    testId: "card-list-laundromat"
  },
  {
    id: "equipment",
    title: "List Equipment",
    description: "Sell new or used commercial laundry equipment",
    icon: Wrench,
    link: "/list-equipment",
    testId: "card-list-equipment"
  },
  {
    id: "supplies",
    title: "List Supplies",
    description: "Sell detergents, vending products, and supplies",
    icon: Package,
    link: "/list-supplies",
    testId: "card-list-supplies"
  }
];

const vendorPrograms = [
  {
    id: "vendor",
    title: "Become a Vendor",
    description: "Create your storefront and reach thousands of buyers",
    icon: Store,
    link: "/vendor-form",
    testId: "card-become-vendor"
  },
  {
    id: "advertise",
    title: "Advertising Options",
    description: "Promote your products and services to our audience",
    icon: Megaphone,
    link: "/advertise",
    testId: "card-advertising"
  }
];

const affiliateBenefits = [
  "Earn commissions on referrals",
  "Dedicated affiliate dashboard",
  "Marketing materials provided",
  "Monthly payouts"
];

export default function PartnerPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Partner With WashBizHub",
    "description": "Reach 72,000+ laundromat professionals. List your laundromat, sell equipment, become a vendor, or advertise with us.",
    "url": "https://washbizhub.com/partner"
  };

  return (
    <>
      <SEO
        title="Partner With WashBizHub - Vendor & Advertising Opportunities"
        description="Reach 72,000+ laundromat professionals. List your laundromat for sale, sell equipment, become a vendor, or advertise with WashBizHub."
        canonicalUrl="/partner"
        keywords={[
          "laundromat vendor",
          "sell laundromat",
          "laundromat advertising",
          "list laundromat for sale",
          "laundromat equipment vendor",
          "laundromat marketplace",
          "coin laundry advertising",
          "laundromat affiliate program"
        ]}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background" data-testid="page-partner">
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900">
          <div className="absolute inset-0 bg-purple-500/10" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Users className="w-3 h-3 mr-1" />
                For Vendors & Brokers
              </Badge>
              <h1 
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 text-white"
                data-testid="text-partner-hero-title"
              >
                Partner With <span className="text-purple-400">WashBizHub</span>
              </h1>
              <p 
                className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
                data-testid="text-partner-hero-subtitle"
              >
                Reach 72,000+ laundromat professionals
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/listing-form">
                  <Button 
                    size="lg"
                    className="bg-purple-500 text-white hover-elevate active-elevate-2 font-semibold"
                    data-testid="button-partner-list"
                  >
                    <Store className="mr-2 h-5 w-5" />
                    List Your Business Free
                  </Button>
                </Link>
                <Link href="/vendor-form">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover-elevate active-elevate-2 font-semibold backdrop-blur-sm"
                    data-testid="button-partner-vendor"
                  >
                    Become a Vendor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-partner-stats">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-benefits-heading">
                Why Partner With Us?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Join the largest community of laundromat professionals
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {partnerStats.map((stat, index) => (
                <Card 
                  key={index}
                  className="p-6 bg-white/5 border border-white/10 text-center"
                  data-testid={`card-stat-${index}`}
                >
                  <div className="text-4xl font-bold text-purple-400 mb-2">{stat.value}</div>
                  <div className="text-white/70">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-background" data-testid="section-listing-options">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-500/20 text-purple-500 border-purple-500/30">
                <Store className="w-3 h-3 mr-1" />
                Listing Options
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-listing-heading">
                List With Us
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Reach thousands of qualified buyers for your listings
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listingOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Link key={option.id} href={option.link}>
                    <Card 
                      className="h-full hover-elevate active-elevate-2 cursor-pointer group transition-all"
                      data-testid={option.testId}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                            <Icon className="w-5 h-5 text-purple-500" />
                          </div>
                          {option.badge && (
                            <Badge className={option.badgeClass}>
                              {option.badge}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl group-hover:text-purple-500 transition-colors">
                          {option.title}
                        </CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center text-sm font-medium text-purple-500">
                          Get Started <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-vendor-programs">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Vendor Programs
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-vendor-heading">
                  Grow Your Business
                </h2>
                <p className="text-lg text-white/70 mb-8">
                  Become a vendor and create your own storefront to sell products and services directly to laundromat owners and operators.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {vendorPrograms.map((program) => {
                    const Icon = program.icon;
                    return (
                      <Link key={program.id} href={program.link}>
                        <Card 
                          className="h-full bg-white/5 border border-white/10 hover-elevate active-elevate-2 cursor-pointer group transition-all"
                          data-testid={program.testId}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 mb-3">
                              <Icon className="w-5 h-5 text-purple-400" />
                            </div>
                            <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors">
                              {program.title}
                            </CardTitle>
                            <CardDescription className="text-white/60 text-sm">
                              {program.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <Card className="bg-white/5 border border-purple-500/20 p-8" data-testid="card-affiliate-program">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500/20">
                      <Gift className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Affiliate Program</h3>
                      <p className="text-white/60 text-sm">Earn while you refer</p>
                    </div>
                  </div>
                  <p className="text-white/70 mb-6">
                    Join our affiliate program and earn commissions by referring new vendors, subscribers, and customers to WashBizHub.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {affiliateBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3 text-white/80">
                        <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/affiliate">
                    <Button 
                      className="w-full bg-purple-500 text-white hover-elevate active-elevate-2 font-semibold"
                      data-testid="button-join-affiliate"
                    >
                      Join Affiliate Program
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-purple-600" data-testid="section-contact-cta">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <MessageSquare className="w-16 h-16 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-contact-cta-heading">
                Questions?
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Our team is here to help you find the best partnership opportunity. Schedule a call to learn more about how we can work together.
              </p>
              <Link href="/consultation">
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover-elevate active-elevate-2 font-semibold"
                  data-testid="button-contact-us"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
