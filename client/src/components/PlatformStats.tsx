import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, FileText, Calculator, Globe, TrendingUp, 
  Award, Shield, Star, CheckCircle
} from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  value: string;
  label: string;
  suffix?: string;
  color: string;
  delay: number;
}

function AnimatedNumber({ target, suffix = "", delay = 0 }: { target: number; suffix?: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          setTimeout(() => {
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                setCount(target);
                clearInterval(timer);
              } else {
                setCount(Math.floor(current));
              }
            }, duration / steps);
          }, delay);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, delay]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function StatItem({ icon: Icon, value, label, suffix = "", color, delay }: StatItemProps) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  
  return (
    <div className="text-center group">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${color} mb-4 transition-transform group-hover:scale-110`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="text-4xl sm:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        <AnimatedNumber target={numericValue} suffix={suffix} delay={delay} />
      </div>
      <div className="text-white/70 text-sm font-medium">{label}</div>
    </div>
  );
}

export function PlatformStats() {
  const stats = [
    { icon: Users, value: "72000", label: "Industry Professionals", suffix: "+", color: "bg-blue-500/20 text-blue-400", delay: 0 },
    { icon: FileText, value: "110", label: "Expert Blog Posts", suffix: "+", color: "bg-green-500/20 text-green-400", delay: 200 },
    { icon: Calculator, value: "50", label: "Business Calculators", suffix: "+", color: "bg-purple-500/20 text-purple-400", delay: 400 },
    { icon: Globe, value: "220", label: "Countries Covered", suffix: "+", color: "bg-orange-500/20 text-orange-400", delay: 600 },
  ];

  return (
    <section 
      className="py-16 sm:py-20 bg-gradient-to-b from-[#001F3F] to-[#002B5C] relative overflow-hidden"
      data-testid="section-platform-stats"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#39CCCC] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#39CCCC]/20 text-[#39CCCC] border-[#39CCCC]/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            By The Numbers
          </Badge>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            data-testid="text-stats-heading"
          >
            The Industry's Most Complete Platform
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Trusted by laundromat owners, investors, and operators worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustBadges() {
  const badges = [
    { icon: Shield, label: "Bank-Level Security", description: "256-bit SSL encryption" },
    { icon: Award, label: "Industry Trusted", description: "Serving since 2024" },
    { icon: Star, label: "4.9★ Rated", description: "By 2,800+ users" },
    { icon: CheckCircle, label: "Verified Data", description: "Real-time accuracy" },
  ];

  return (
    <section 
      className="py-10 bg-muted/30 border-y"
      data-testid="section-trust-badges"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 justify-center md:justify-start"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#39CCCC]/10 flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-[#39CCCC]" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{badge.label}</div>
                <div className="text-xs text-muted-foreground">{badge.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EnterpriseFeatures() {
  const features = [
    {
      title: "CLEANBI™ Universal Scoring",
      description: "AI-powered location analysis for any address in 220+ countries. Get instant 0-100 scores with A/B/C grades.",
      icon: Globe,
      stats: "2.8M+ scores generated",
      color: "from-[#39CCCC] to-teal-600"
    },
    {
      title: "POS Command Center",
      description: "Complete point-of-sale with loyalty programs, real-time analytics, and multi-location management.",
      icon: TrendingUp,
      stats: "Process $2M+ monthly",
      color: "from-blue-500 to-blue-700"
    },
    {
      title: "AI Consultation Council",
      description: "6 AI experts analyze your deals with industry legend Larry Larsen. Tiered from $49 to $999.",
      icon: Users,
      stats: "500+ consultations",
      color: "from-purple-500 to-purple-700"
    },
    {
      title: "Equipment Intelligence",
      description: "Interactive wizard, brand guides, and diagnostics covering all major manufacturers.",
      icon: Award,
      stats: "6 major brands covered",
      color: "from-orange-500 to-orange-700"
    },
  ];

  return (
    <section 
      className="py-16 sm:py-24 bg-background"
      data-testid="section-enterprise-features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#001F3F]/10 text-[#001F3F] dark:bg-white/10 dark:text-white border-[#001F3F]/20 dark:border-white/20">
            <Award className="w-3 h-3 mr-1" />
            Enterprise-Grade Platform
          </Badge>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From your first search to scaling multiple locations - we've got you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 sm:p-8 hover-elevate border-2 hover:border-[#39CCCC]/30 transition-all group"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <Badge variant="secondary" className="text-xs">
                {feature.stats}
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
