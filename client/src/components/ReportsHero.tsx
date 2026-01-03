import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Zap,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  Lock,
  Star,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileText,
  Shield,
  Sparkles
} from "lucide-react";
import {
  GlassmorphismCard,
  GoldBorderCard,
  PremiumBadge,
  HexGrid,
  GlowOrb,
  AnimatedCounter,
  LiveIndicator
} from "@/components/premium-components";

declare global {
  interface Window {
    google: any;
  }
}

export function ReportsHero() {
  const [, navigate] = useLocation();
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentSearches, setRecentSearches] = useState(847);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentSearches(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!window.google || !addressInputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "us" },
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      if (place?.formatted_address) {
        setAddress(place.formatted_address);
      }
    });
  }, []);

  const handleAnalyze = () => {
    if (!address.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      navigate(`/location-reports?address=${encodeURIComponent(address)}`);
    }, 800);
  };

  return (
    <section className="relative min-h-[85vh] overflow-hidden" style={{ background: '#09090b' }}>
      <HexGrid opacity={0.03} />
      
      <div className="absolute top-20 right-20 opacity-20 pointer-events-none">
        <GlowOrb size="lg" color="gold" />
      </div>
      <div className="absolute bottom-40 left-10 opacity-15 pointer-events-none">
        <GlowOrb size="md" color="cyan" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <LiveIndicator />
              <span className="text-sm text-gray-400">
                <AnimatedCounter value={recentSearches} duration={1000} /> locations analyzed this week
              </span>
            </div>

            <h1 
              className="text-white leading-[1.05] mb-4"
              style={{ fontFamily: 'var(--font-bebas)' }}
              data-testid="heading-reports-hero"
            >
              <span className="block text-[clamp(2.5rem,7vw,5rem)] tracking-tight">
                KNOW BEFORE YOU BUY
              </span>
              <span className="block text-[clamp(2.5rem,7vw,5rem)] tracking-tight text-[#d4af37]">
                LOCATION INTELLIGENCE
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Enter any address. Get demographics, competition, traffic data, and AI-powered insights in minutes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <GoldBorderCard variant="thick" animated>
              <div className="p-6 sm:p-8 bg-[#0a0a0c]">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C8A661]" />
                    <Input
                      ref={addressInputRef}
                      type="text"
                      placeholder="Enter any US address..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-12 h-14 text-lg bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#C8A661] focus:ring-[#C8A661]"
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      data-testid="input-address-hero"
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!address.trim() || isAnalyzing}
                    className="h-14 px-8 text-lg bg-[#C8A661] hover:bg-[#b8963d] text-[#0a0a0c] font-bold"
                    data-testid="button-analyze-location"
                  >
                    {isAnalyzing ? (
                      <>
                        <Search className="w-5 h-5 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Analyze Location
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Free instant preview
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#C8A661]" />
                    Results in 60 seconds
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    17-factor analysis
                  </span>
                </div>
              </div>
            </GoldBorderCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-4 gap-4 mt-12"
        >
          {[
            { icon: Users, label: "Demographics", desc: "Population, income, renters", color: "cyan" },
            { icon: Building2, label: "Competition", desc: "Nearby laundromats mapped", color: "orange" },
            { icon: TrendingUp, label: "Traffic Score", desc: "Foot & vehicle patterns", color: "green" },
            { icon: FileText, label: "Full Report", desc: "PDF ready for investors", color: "gold" }
          ].map((item, i) => (
            <GlassmorphismCard key={i} intensity="light" glowColor={item.color as any}>
              <div className="p-4 text-center">
                <div className={`w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                  item.color === 'cyan' ? 'bg-cyan-500/20' :
                  item.color === 'orange' ? 'bg-orange-500/20' :
                  item.color === 'green' ? 'bg-green-500/20' : 'bg-[#C8A661]/20'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.color === 'cyan' ? 'text-cyan-400' :
                    item.color === 'orange' ? 'text-orange-400' :
                    item.color === 'green' ? 'text-green-400' : 'text-[#C8A661]'
                  }`} />
                </div>
                <h3 className="text-white font-semibold mb-1">{item.label}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </GlassmorphismCard>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <PremiumBadge variant="gold" size="sm">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Trusted by 2,500+ buyers & brokers
            </PremiumBadge>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "CLEANBI saved me from a $180K mistake. The location scored 42 - 6 hidden competitors I didn't know about.",
                name: "Mike R.",
                location: "Dallas, TX",
                saved: "$180K saved"
              },
              {
                quote: "I use these reports for every listing. Gives my buyers confidence and speeds up deals.",
                name: "Sarah L.",
                role: "Commercial Broker",
                saved: "12 deals closed"
              },
              {
                quote: "The $149 report paid for itself 100x. Found a location scoring 89 that's now my best performer.",
                name: "James T.",
                location: "Phoenix, AZ",
                saved: "$340K revenue"
              }
            ].map((testimonial, i) => (
              <GlassmorphismCard key={i} intensity="light">
                <div className="p-5">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-[#C8A661] fill-current" />
                    ))}
                  </div>
                  <p className="text-white/80 text-sm mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{testimonial.name}</p>
                      <p className="text-gray-500 text-xs">{testimonial.location || testimonial.role}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      {testimonial.saved}
                    </Badge>
                  </div>
                </div>
              </GlassmorphismCard>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
