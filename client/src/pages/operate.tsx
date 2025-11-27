import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Settings, ArrowRight, Star, Wrench, Stethoscope, Palette,
  ShoppingCart, Package, BookOpen, MessageSquare
} from "lucide-react";

const posFeatures = [
  "Real-time machine monitoring",
  "Revenue tracking & analytics",
  "Customer loyalty programs",
  "Remote management capabilities"
];

const operationalTools = [
  {
    id: "service-guy-ai",
    title: "Service Guy AI",
    description: "AI-powered troubleshooting for equipment issues",
    icon: Wrench,
    link: "/service-guy-ai",
    testId: "card-service-guy-ai"
  },
  {
    id: "diagnostics",
    title: "Equipment Diagnostics",
    description: "Diagnose and resolve machine problems quickly",
    icon: Stethoscope,
    link: "/equipment-diagnostics",
    testId: "card-equipment-diagnostics"
  },
  {
    id: "design-studio",
    title: "Design Studio Pro",
    description: "Plan your layout with our 3D design tool",
    icon: Palette,
    link: "/design-studio-pro",
    testId: "card-design-studio-pro"
  }
];

const marketplaceResources = [
  {
    id: "equipment",
    title: "Equipment Marketplace",
    description: "Buy and sell commercial laundry equipment",
    icon: ShoppingCart,
    link: "/equipment-marketplace",
    testId: "card-equipment-marketplace"
  },
  {
    id: "supplies",
    title: "Supplies Marketplace",
    description: "Order detergents, vending products, and more",
    icon: Package,
    link: "/marketplace",
    testId: "card-supplies-marketplace"
  },
  {
    id: "resources",
    title: "Resources Hub",
    description: "Guides, templates, and operational resources",
    icon: BookOpen,
    link: "/resources",
    testId: "card-resources-hub"
  }
];

export default function OperatePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Operate Your Laundromat Like a Pro",
    "description": "Enterprise-grade tools to optimize your laundromat operations. POS systems, equipment diagnostics, AI troubleshooting, and management tools.",
    "url": "https://washbizhub.com/operate"
  };

  return (
    <>
      <SEO
        title="Operate Your Laundromat Like a Pro - POS & Management Tools"
        description="Enterprise-grade laundromat management tools including POS Command Center, Service Guy AI, equipment diagnostics, and design studio. Optimize your laundromat operations."
        canonicalUrl="/operate"
        keywords={[
          "laundromat management",
          "laundromat POS system",
          "laundromat operations",
          "equipment diagnostics",
          "laundromat software",
          "coin laundry management",
          "laundromat tools",
          "laundry business operations"
        ]}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background" data-testid="page-operate">
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-900 via-orange-800 to-gray-900">
          <div className="absolute inset-0 bg-orange-500/10" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-orange-500/20 text-orange-300 border-orange-500/30">
                <Settings className="w-3 h-3 mr-1" />
                For Owners
              </Badge>
              <h1 
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 text-white"
                data-testid="text-operate-hero-title"
              >
                Run Your Laundromat <span className="text-orange-400">Like a Pro</span>
              </h1>
              <p 
                className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
                data-testid="text-operate-hero-subtitle"
              >
                Enterprise-grade tools to optimize your operations
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/pos-command-center">
                  <Button 
                    size="lg"
                    className="bg-orange-500 text-white hover-elevate active-elevate-2 font-semibold"
                    data-testid="button-operate-pos"
                  >
                    <Star className="mr-2 h-5 w-5" />
                    Explore POS Command Center
                  </Button>
                </Link>
                <Link href="/service-guy-ai">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover-elevate active-elevate-2 font-semibold backdrop-blur-sm"
                    data-testid="button-operate-service-ai"
                  >
                    Try Service Guy AI
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-pos-center">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Card className="bg-white/5 border border-orange-500/20 overflow-hidden" data-testid="card-pos-featured">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-pos-heading">
                    POS Command Center
                  </h2>
                  <p className="text-lg text-white/70 mb-6">
                    The most powerful point-of-sale and management system designed specifically for laundromats. Monitor, manage, and grow your business from anywhere.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {posFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-white/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/pos-command-center">
                    <Button 
                      size="lg"
                      className="bg-orange-500 text-white hover-elevate active-elevate-2 font-semibold"
                      data-testid="button-explore-pos"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="bg-orange-500/10 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-500/20 mb-6">
                      <Settings className="w-12 h-12 text-orange-400" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">All-In-One</div>
                    <p className="text-white/60">Management Solution</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-background" data-testid="section-operational-tools">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-orange-500/20 text-orange-500 border-orange-500/30">
                <Wrench className="w-3 h-3 mr-1" />
                Operational Tools
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-operational-heading">
                Keep Everything Running Smoothly
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                AI-powered tools to diagnose issues, optimize layouts, and maintain peak performance
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {operationalTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} href={tool.link}>
                    <Card 
                      className="h-full hover-elevate active-elevate-2 cursor-pointer group transition-all"
                      data-testid={tool.testId}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 mb-3">
                          <Icon className="w-5 h-5 text-orange-500" />
                        </div>
                        <CardTitle className="text-xl group-hover:text-orange-500 transition-colors">
                          {tool.title}
                        </CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center text-sm font-medium text-orange-500">
                          Try Now <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-marketplace">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-orange-500/20 text-orange-300 border-orange-500/30">
                <ShoppingCart className="w-3 h-3 mr-1" />
                Marketplace & Resources
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-marketplace-heading">
                Everything Your Business Needs
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Shop for equipment, supplies, and access operational resources
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {marketplaceResources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <Link key={resource.id} href={resource.link}>
                    <Card 
                      className="h-full bg-white/5 border border-white/10 hover-elevate active-elevate-2 cursor-pointer group transition-all"
                      data-testid={resource.testId}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/20 mb-3">
                          <Icon className="w-5 h-5 text-orange-400" />
                        </div>
                        <CardTitle className="text-xl text-white group-hover:text-orange-400 transition-colors">
                          {resource.title}
                        </CardTitle>
                        <CardDescription className="text-white/60">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center text-sm font-medium text-orange-400">
                          Explore <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-orange-600" data-testid="section-consultation-cta">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <MessageSquare className="w-16 h-16 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4" data-testid="text-consultation-cta-heading">
                Need Expert Advice?
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Book a consultation with our laundromat industry experts. Get personalized advice on operations, equipment, marketing, and more.
              </p>
              <Link href="/consultation">
                <Button 
                  size="lg"
                  className="bg-white text-orange-600 hover-elevate active-elevate-2 font-semibold"
                  data-testid="button-book-consultation"
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
