import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Settings, Building2, ArrowRight, CheckCircle, 
  Target, Calculator, FileText, DollarSign, Wrench, TrendingUp,
  Users, BarChart3, MapPin, Briefcase, Star
} from "lucide-react";

interface PersonaPath {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof ShoppingCart;
  color: string;
  gradient: string;
  features: { name: string; link: string; icon: typeof Target }[];
  cta: { text: string; link: string };
  stats: { value: string; label: string }[];
}

const personas: PersonaPath[] = [
  {
    id: "buyer",
    title: "I'm Buying",
    subtitle: "Find, analyze, fund & close your laundromat deal",
    icon: ShoppingCart,
    color: "#22C55E",
    gradient: "from-[#22C55E]/20 to-[#22C55E]/5",
    features: [
      { name: "CLEANBI Location Scores", link: "/cleanbi-explorer", icon: MapPin },
      { name: "Deal Marketplace", link: "/laundromat-listings", icon: Target },
      { name: "Instant Valuations", link: "/calculators", icon: Calculator },
      { name: "Funding Wizard", link: "/funding-wizard", icon: DollarSign },
      { name: "AI Business Plan", link: "/business-plan-generator", icon: FileText },
      { name: "Due Diligence Guides", link: "/resources", icon: CheckCircle }
    ],
    cta: { text: "Start Your Search", link: "/cleanbi-explorer" },
    stats: [
      { value: "$180K", label: "Avg saved on bad deals" },
      { value: "48hrs", label: "Funding approval" },
      { value: "2,500+", label: "Locations analyzed" }
    ]
  },
  {
    id: "owner",
    title: "I Own",
    subtitle: "Optimize operations & boost revenue 20-30%",
    icon: Settings,
    color: "#C8A661",
    gradient: "from-[#C8A661]/20 to-[#C8A661]/5",
    features: [
      { name: "Operator Dashboard", link: "/operator-dashboard", icon: BarChart3 },
      { name: "Service Guy AI", link: "/service-guy", icon: Wrench },
      { name: "Design Studio", link: "/design-studio-pro", icon: Target },
      { name: "Equipment Deals", link: "/equipment-marketplace", icon: Settings },
      { name: "POS Suite", link: "/pos-command-center", icon: Calculator },
      { name: "Revenue Tools", link: "/calculators", icon: TrendingUp }
    ],
    cta: { text: "Boost Your Revenue", link: "/operator-dashboard" },
    stats: [
      { value: "20-30%", label: "Revenue increase" },
      { value: "50+", label: "Expert tools" },
      { value: "24/7", label: "AI diagnostics" }
    ]
  },
  {
    id: "seller",
    title: "I'm Selling",
    subtitle: "List, value & market your laundromat",
    icon: Building2,
    color: "#3B82F6",
    gradient: "from-[#3B82F6]/20 to-[#3B82F6]/5",
    features: [
      { name: "List Your Business", link: "/sell-your-laundromat", icon: Target },
      { name: "Valuation Report", link: "/calculators", icon: Calculator },
      { name: "CLEANBI Report", link: "/cleanbi-explorer", icon: MapPin },
      { name: "Broker Directory", link: "/broker-directory", icon: Users },
      { name: "Enterprise API", link: "/broker-dashboard", icon: Briefcase },
      { name: "White-Label Tools", link: "/broker-dashboard", icon: FileText }
    ],
    cta: { text: "Get Your Valuation", link: "/calculators" },
    stats: [
      { value: "3x", label: "Faster sales" },
      { value: "73K+", label: "Active buyers" },
      { value: "Free", label: "Valuation" }
    ]
  }
];

export function PersonaSelector() {
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-[#C8A661]/50 text-[#C8A661]">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Personalized Experience
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What brings you to WashBizHub?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your path for a tailored experience with the right tools, resources, and guidance for your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {personas.map((persona) => {
            const Icon = persona.icon;
            const isHovered = hoveredPersona === persona.id;

            return (
              <motion.div
                key={persona.id}
                onHoverStart={() => setHoveredPersona(persona.id)}
                onHoverEnd={() => setHoveredPersona(null)}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={`h-full border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                    isHovered ? 'border-[' + persona.color + ']/50 shadow-lg' : 'border-border'
                  }`}
                  style={{ 
                    borderColor: isHovered ? persona.color + '40' : undefined 
                  }}
                  data-testid={`card-persona-${persona.id}`}
                >
                  <CardContent className="p-0">
                    <div className={`p-6 bg-gradient-to-br ${persona.gradient}`}>
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: persona.color + '20' }}
                      >
                        <Icon className="w-7 h-7" style={{ color: persona.color }} />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {persona.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {persona.subtitle}
                      </p>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-3 gap-3">
                        {persona.stats.map((stat, i) => (
                          <div key={i} className="text-center">
                            <div 
                              className="text-lg font-bold"
                              style={{ color: persona.color }}
                            >
                              {stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {persona.features.slice(0, 4).map((feature) => {
                          const FeatureIcon = feature.icon;
                          return (
                            <Link 
                              key={feature.name} 
                              href={feature.link}
                              className="flex items-center gap-3 p-2 rounded-lg hover-elevate transition-colors group"
                              data-testid={`link-feature-${feature.name.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <FeatureIcon 
                                className="w-4 h-4 flex-shrink-0" 
                                style={{ color: persona.color }} 
                              />
                              <span className="text-sm text-foreground group-hover:text-foreground">
                                {feature.name}
                              </span>
                              <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                            </Link>
                          );
                        })}
                        {persona.features.length > 4 && (
                          <div className="text-xs text-muted-foreground text-center pt-1">
                            +{persona.features.length - 4} more tools
                          </div>
                        )}
                      </div>

                      <Button 
                        className="w-full"
                        style={{ 
                          backgroundColor: persona.color,
                          borderColor: persona.color
                        }}
                        onClick={() => setLocation(persona.cta.link)}
                        data-testid={`button-persona-cta-${persona.id}`}
                      >
                        {persona.cta.text}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Not sure where to start? Our AI can guide you.
          </p>
          <Button variant="outline" asChild>
            <Link href="/ai-council" data-testid="link-ai-council">
              <Star className="w-4 h-4 mr-2" />
              Talk to AI Council
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function PersonaSelectorCompact() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {personas.map((persona) => {
        const Icon = persona.icon;
        return (
          <Button
            key={persona.id}
            variant="outline"
            className="h-auto py-3 px-6 flex flex-col items-center gap-2 border-2 hover:border-[#C8A661]/50"
            onClick={() => setLocation(persona.cta.link)}
            data-testid={`button-persona-compact-${persona.id}`}
          >
            <Icon className="w-5 h-5" style={{ color: persona.color }} />
            <span className="font-semibold">{persona.title}</span>
          </Button>
        );
      })}
    </div>
  );
}
