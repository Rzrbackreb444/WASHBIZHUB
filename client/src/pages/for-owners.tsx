import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { 
  Wrench, LayoutGrid, Monitor, ShoppingCart, 
  ArrowRight, CheckCircle, Settings, TrendingUp,
  Cpu, Palette, BarChart3, Users
} from "lucide-react";

const ownerTools = [
  {
    icon: Wrench,
    title: "Service Guy AI",
    description: "AI-powered equipment diagnostics. Identify issues, get repair guides, order parts instantly.",
    features: ["Photo diagnosis", "Error code lookup", "Parts ordering", "Repair guides"],
    link: "/service-guy-ai",
    cta: "Diagnose Issue",
    highlight: true
  },
  {
    icon: Monitor,
    title: "POS Command Center",
    description: "Complete point-of-sale system for laundromat operations with KPIs and order management.",
    features: ["Transaction register", "Customer lookup", "Daily summaries", "Shift management"],
    link: "/pos-command-center",
    cta: "Open POS"
  },
  {
    icon: LayoutGrid,
    title: "Operator Dashboard",
    description: "Your command center for daily operations. KPIs, revenue charts, machine status at a glance.",
    features: ["Real-time KPIs", "Revenue tracking", "Quick actions", "Activity feed"],
    link: "/operator-dashboard",
    cta: "View Dashboard"
  },
  {
    icon: Palette,
    title: "3D Design Studio",
    description: "Plan your laundromat layout in 3D. Visualize equipment placement before buying.",
    features: ["Drag & drop design", "Equipment library", "3D visualization", "Export plans"],
    link: "/design-studio",
    cta: "Design Layout"
  },
  {
    icon: Cpu,
    title: "IoT Dashboard",
    description: "Real-time machine monitoring. Track usage, predict maintenance, optimize pricing.",
    features: ["Machine status", "Usage analytics", "Predictive maintenance", "Dynamic pricing"],
    link: "/iot-dashboard",
    cta: "View IoT"
  },
  {
    icon: ShoppingCart,
    title: "Equipment Marketplace",
    description: "Buy and sell commercial laundry equipment. New and used machines from verified sellers.",
    features: ["Verified listings", "Parts & supplies", "Distributor network", "Price comparison"],
    link: "/equipment-marketplace",
    cta: "Shop Equipment"
  }
];

const testimonials = [
  {
    quote: "Service Guy AI diagnosed my Dexter issue in 30 seconds. Would have cost $200 for a service call.",
    name: "Tom H.",
    location: "Chicago, IL"
  },
  {
    quote: "The operator dashboard gives me everything I need at a glance. No more spreadsheets.",
    name: "Linda M.",
    location: "Miami, FL"
  }
];

export default function ForOwners() {
  return (
    <>
      <SEO
        title="For Owners & Operators | WashBizHub"
        description="Run your laundromat smarter. Service Guy AI diagnostics, POS system, operator dashboard, 3D design studio, and IoT monitoring."
      />
      
      <div className="min-h-screen bg-background">
        <section className="py-16 md:py-24 bg-gradient-to-b from-[#0A1628] to-[#1a3a5c]" data-testid="section-owner-hero">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30" data-testid="badge-owner-persona">
                <Settings className="w-3 h-3 mr-1" />
                For Owners & Operators
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6" data-testid="text-owner-headline">
                Run Your Laundromat Smarter
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8" data-testid="text-owner-subheadline">
                AI diagnostics, operations management, and design tools to maximize your revenue.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/service-guy-ai">
                  <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold" data-testid="button-owner-cta-primary">
                    <Wrench className="w-4 h-4 mr-2" />
                    Diagnose Equipment
                  </Button>
                </Link>
                <Link href="/operator-dashboard">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-owner-cta-secondary">
                    Open Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center" data-testid="owner-stats">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">20-30%</div>
                <div className="text-sm text-gray-400">Revenue Boost</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">All Brands</div>
                <div className="text-sm text-gray-400">Equipment Supported</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">24/7</div>
                <div className="text-sm text-gray-400">AI Assistance</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#C8A661]">1000+</div>
                <div className="text-sm text-gray-400">Error Codes</div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-20" data-testid="section-owner-tools">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3" data-testid="text-tools-heading">
                Your Operator Toolkit
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to run a more profitable laundromat
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownerTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card 
                    key={tool.title} 
                    className={`bg-card border shadow-sm overflow-hidden hover:border-[#C8A661]/50 hover-elevate transition-all ${tool.highlight ? 'ring-2 ring-[#C8A661]/30' : ''}`}
                    data-testid={`card-tool-${tool.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {tool.highlight && <div className="h-1 bg-[#C8A661]" />}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                          <Icon className="h-6 w-6 text-[#C8A661]" />
                        </div>
                        {tool.highlight && (
                          <Badge className="bg-[#C8A661] text-[#0A1628]">Most Popular</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                      <ul className="space-y-1.5 mb-5">
                        {tool.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-3.5 h-3.5 text-[#C8A661] flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Link href={tool.link}>
                        <Button className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white">
                          {tool.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-muted/30" data-testid="section-owner-testimonials">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-2">What Owners Are Saying</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((t, i) => (
                <Card key={i} className="bg-card border" data-testid={`card-testimonial-${i}`}>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground italic mb-4">"{t.quote}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#C8A661]">{t.name[0]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.location}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-[#0A1628]" data-testid="section-owner-cta">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Optimize Your Operations?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Try Service Guy AI free or explore your operator dashboard
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/service-guy-ai">
                <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628] font-semibold" data-testid="button-owner-final-cta">
                  Try Service Guy AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
