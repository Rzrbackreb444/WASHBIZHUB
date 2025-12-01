import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Settings, ArrowRight, Star, Wrench, Stethoscope, Palette,
  ShoppingCart, Package, BookOpen, MessageSquare, HelpCircle, CheckCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const operationsFaqs = [
  {
    question: "How do I run a successful laundromat?",
    answer: "Running a successful laundromat requires focus on 5 key areas: 1) Equipment reliability - maintain machines proactively with scheduled maintenance to minimize downtime, 2) Cleanliness - clean facilities daily, especially restrooms, folding areas, and machine surfaces, 3) Pricing optimization - analyze competition and adjust vend prices quarterly to maximize revenue, 4) Customer experience - provide a safe, well-lit environment with amenities like WiFi and comfortable seating, 5) Cost control - monitor utilities, negotiate with vendors, and implement energy-efficient practices. Our POS Command Center helps you track all these metrics in real-time."
  },
  {
    question: "What are the daily operations of a laundromat?",
    answer: "Essential daily laundromat operations include: Opening tasks (unlock, turn on lights/TVs, check machine status, empty lint traps), Hourly tasks (walk-through for cleanliness, empty bill changers, restock soap vending), Customer service (assist customers, handle complaints, maintain safe environment), Closing tasks (clean floors/bathrooms, collect coins, secure premises, check all machines are off). Track these with our operational checklists in the Resources Hub."
  },
  {
    question: "How can I increase laundromat profits?",
    answer: "Proven profit-boosting strategies: 1) Optimize pricing - raise vend prices $0.25-0.50 quarterly if competitive, 2) Add revenue streams - wash-dry-fold service (30-50% margins), pickup/delivery, vending machines, 3) Reduce utilities - upgrade to high-efficiency equipment, install LED lighting, optimize water heating, 4) Increase turns per day (TPD) - improve customer flow, reduce machine downtime, 5) Implement loyalty programs - increase customer retention and visit frequency. Use our TPD Calculator and POS analytics to identify opportunities."
  },
  {
    question: "How do I troubleshoot laundromat equipment problems?",
    answer: "Equipment troubleshooting steps: 1) Identify the error code displayed on the machine, 2) Check our Error Code Database for specific issue resolution, 3) Use Service Guy AI for instant AI-powered diagnostics - describe the problem and get step-by-step repair guidance, 4) Perform basic checks (water supply, drainage, power connections), 5) If unresolved, contact manufacturer support or a certified technician. Our Equipment Diagnostics tool covers all major brands including Speed Queen, Dexter, Huebsch, and Maytag."
  },
  {
    question: "What are the best laundromat POS systems?",
    answer: "Top laundromat POS systems offer: 1) Card/mobile payment acceptance (reduces coin handling by 60%+), 2) Remote monitoring and reporting, 3) Machine status tracking, 4) Customer loyalty features, 5) Automated pricing and promotions. Popular options include ESD, SpyderWash, CyclePay, and our POS Command Center. Key selection criteria: integration with your equipment brand, monthly fees, customer support quality, and mobile app capabilities."
  },
  {
    question: "How do I reduce laundromat operating costs?",
    answer: "Cost reduction strategies: 1) Utilities (25-35% of revenue) - upgrade to high-efficiency machines, install solar/tankless heaters, negotiate commercial rates, 2) Labor (10-15%) - implement self-service model, use remote monitoring to reduce on-site staff, 3) Maintenance (5-10%) - preventive maintenance reduces repair costs 30-50%, stock common parts, 4) Supplies (3-5%) - buy in bulk, negotiate vendor contracts, 5) Rent (15-25%) - negotiate lease terms, consider percentage rent vs. fixed. Track all costs in our POS Command Center dashboard."
  },
  {
    question: "How often should I service laundromat equipment?",
    answer: "Recommended maintenance schedule: Daily - empty lint traps, wipe door seals, check for leaks. Weekly - inspect and clean coin slides, check hoses and connections. Monthly - deep clean machines, inspect belts and bearings, lubricate as needed. Quarterly - professional inspection, calibrate machines, check water/gas connections. Annually - full overhaul, replace wear items (bearings, belts, seals). High-usage machines may require more frequent service. Log all maintenance in our Equipment Diagnostics system."
  },
  {
    question: "How do I handle difficult laundromat customers?",
    answer: "Customer management best practices: 1) Post clear rules signage for machine usage, closing times, and behavior expectations, 2) Install security cameras for safety and documentation, 3) Train staff on de-escalation techniques, 4) Have a policy for handling damaged property claims, 5) Address complaints promptly and professionally, 6) For serious issues, don't hesitate to call authorities. Maintain a incident log for recurring problems. Focus on creating a safe, family-friendly environment that naturally deters problematic behavior."
  }
];

const operationsHowTo = {
  name: "How to Run a Laundromat Effectively",
  description: "Step-by-step guide to operating a profitable laundromat, from daily operations to maximizing revenue and minimizing costs.",
  totalTime: "P1D",
  steps: [
    {
      name: "Establish Daily Operating Procedures",
      text: "Create and follow consistent opening, hourly, and closing checklists. Include equipment checks, cleanliness standards, and customer service protocols. Download templates from our Resources Hub."
    },
    {
      name: "Implement a Preventive Maintenance Program",
      text: "Schedule regular maintenance for all equipment to prevent breakdowns. Use our Equipment Diagnostics tool to track machine health and create maintenance reminders."
    },
    {
      name: "Optimize Pricing Strategy",
      text: "Analyze competitor pricing and adjust your vend prices quarterly. Use our calculators to ensure you're maximizing revenue while staying competitive in your market."
    },
    {
      name: "Monitor Performance with POS Analytics",
      text: "Use the POS Command Center to track daily revenue, machine utilization, peak hours, and customer patterns. Make data-driven decisions based on real performance metrics."
    },
    {
      name: "Add Additional Revenue Streams",
      text: "Implement wash-dry-fold services, pickup/delivery, vending machines, or drop-off dry cleaning. Each can add 10-30% to your bottom line with minimal additional overhead."
    },
    {
      name: "Control Operating Costs",
      text: "Monitor utility usage, negotiate vendor contracts, and implement energy-efficient practices. Target utilities at 25-30% of revenue and labor at 10-15%."
    },
    {
      name: "Use AI Tools for Troubleshooting",
      text: "When equipment issues arise, use Service Guy AI for instant diagnostics and repair guidance. Check error codes in our database covering all major equipment brands."
    }
  ]
};

export default function OperatePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Operate Your Laundromat Like a Pro",
    "description": "Enterprise-grade tools to optimize your laundromat operations. POS systems, equipment diagnostics, AI troubleshooting, and management tools.",
    "url": "https://washbizhub.com/operate",
    "mainEntity": {
      "@type": "Article",
      "headline": "How to Run a Laundromat Effectively",
      "description": "Complete guide to laundromat operations including daily procedures, equipment maintenance, profit optimization, POS systems, and AI-powered troubleshooting.",
      "author": {
        "@type": "Organization",
        "name": "WashBizHub"
      }
    }
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Operate Your Laundromat", url: "/operate" }
  ];

  return (
    <>
      <SEO
        title="Operate Your Laundromat Like a Pro - POS Systems, AI Diagnostics & Management Tools"
        description="Enterprise-grade laundromat management tools including POS Command Center, Service Guy AI, equipment diagnostics, and design studio. Optimize operations, increase profits, and reduce downtime with expert resources."
        canonicalUrl="/operate"
        keywords={[
          "laundromat management",
          "laundromat POS system",
          "laundromat operations",
          "equipment diagnostics",
          "laundromat software",
          "coin laundry management",
          "laundromat tools",
          "laundry business operations",
          "how to run a laundromat",
          "laundromat profit tips",
          "laundromat daily operations",
          "increase laundromat revenue",
          "laundromat maintenance",
          "laundromat employee management",
          "laundromat customer service"
        ]}
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
        faqs={operationsFaqs}
        howTo={operationsHowTo}
        author={{
          name: "WashBizHub Team",
          expertise: "Laundromat Operations Specialists",
          credentials: "Supporting 5,000+ laundromat owners with daily operations and management"
        }}
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
                        <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
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

        <section className="py-16 sm:py-24 bg-background" data-testid="section-faqs">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-orange-500/20 text-orange-500 border-orange-500/30">
                <HelpCircle className="w-3 h-3 mr-1" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-faq-heading">
                Laundromat Operations FAQs
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Expert answers to the most common questions about running a successful laundromat
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {operationsFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border border-border rounded-lg px-6 data-[state=open]:bg-muted/30"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
