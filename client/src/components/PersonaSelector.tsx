import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ShoppingCart, Settings, Building2, ArrowRight,
  Target, Calculator, MapPin, DollarSign, Wrench, BarChart3,
  Users, FileText, Star
} from "lucide-react";
import { usePersona, PersonaType } from "@/contexts/PersonaContext";

interface PersonaPath {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof ShoppingCart;
  color: string;
  features: { name: string; link: string; icon: typeof Target }[];
  cta: { text: string; link: string };
}

const personas: PersonaPath[] = [
  {
    id: "buyer",
    title: "I'm Buying",
    subtitle: "Find, analyze & fund your deal",
    icon: ShoppingCart,
    color: "#22C55E",
    features: [
      { name: "Funding Wizard", link: "/funding-wizard", icon: DollarSign },
      { name: "CLEANBI Scores", link: "/cleanbi-explorer", icon: MapPin },
      { name: "Deal Marketplace", link: "/marketplace", icon: Target },
    ],
    cta: { text: "Start Your Search", link: "/for-buyers" },
  },
  {
    id: "owner",
    title: "I Own",
    subtitle: "Optimize & boost revenue 20-30%",
    icon: Settings,
    color: "#C8A661",
    features: [
      { name: "Operator Dashboard", link: "/owner-dashboard", icon: BarChart3 },
      { name: "Service Guy AI", link: "/service-guy-ai", icon: Wrench },
      { name: "Calculator Suite", link: "/calculators", icon: Calculator },
    ],
    cta: { text: "Boost Revenue", link: "/for-owners" },
  },
  {
    id: "seller",
    title: "I'm Selling",
    subtitle: "List, value & market your business",
    icon: Building2,
    color: "#3B82F6",
    features: [
      { name: "List Your Business", link: "/list-your-laundromat", icon: Target },
      { name: "Valuation Report", link: "/valuation-calculator", icon: Calculator },
      { name: "Broker Directory", link: "/directory", icon: Users },
    ],
    cta: { text: "Get Valuation", link: "/for-sellers" },
  }
];

export function PersonaSelector() {
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { setPersona } = usePersona();
  
  const handlePersonaSelect = (personaId: string, link: string) => {
    setPersona(personaId as PersonaType);
    setLocation(link);
  };

  return (
    <section className="py-24 md:py-32 px-4" style={{ background: '#09090b' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4 border-[#C8A661]/50 text-[#C8A661]">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Choose Your Path
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            What brings you here?
          </h2>
          <p className="text-white/50 max-w-lg mx-auto">
            Select your journey for personalized tools and guidance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {personas.map((persona) => {
            const Icon = persona.icon;
            const isHovered = hoveredPersona === persona.id;

            return (
              <motion.div
                key={persona.id}
                onHoverStart={() => setHoveredPersona(persona.id)}
                onHoverEnd={() => setHoveredPersona(null)}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={`h-full border transition-all duration-300 cursor-pointer bg-white/[0.03] backdrop-blur-xl ${
                    isHovered ? 'border-white/30' : 'border-white/10'
                  }`}
                  style={{ 
                    borderColor: isHovered ? persona.color + '50' : undefined 
                  }}
                  onClick={() => handlePersonaSelect(persona.id, persona.cta.link)}
                  data-testid={`card-persona-${persona.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: persona.color + '20' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: persona.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {persona.title}
                        </h3>
                        <p className="text-xs text-white/50">
                          {persona.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {persona.features.map((feature) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <Link 
                            key={feature.name} 
                            href={feature.link}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 transition-colors text-sm"
                            data-testid={`link-feature-${feature.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <FeatureIcon 
                              className="w-3.5 h-3.5" 
                              style={{ color: persona.color }} 
                            />
                            <span className="text-white/70">{feature.name}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <Button 
                      className="w-full text-white text-sm h-9"
                      style={{ 
                        backgroundColor: persona.color,
                        borderColor: persona.color
                      }}
                      data-testid={`button-persona-cta-${persona.id}`}
                    >
                      {persona.cta.text}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PersonaSelectorCompact() {
  const [, setLocation] = useLocation();
  const { setPersona } = usePersona();

  const handleSelect = (personaId: string, link: string) => {
    setPersona(personaId as PersonaType);
    setLocation(link);
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {personas.map((persona) => {
        const Icon = persona.icon;
        return (
          <Button
            key={persona.id}
            variant="outline"
            className="h-auto py-3 px-6 flex flex-col items-center gap-2 border-2 hover:border-[#C8A661]/50"
            onClick={() => handleSelect(persona.id, persona.cta.link)}
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
