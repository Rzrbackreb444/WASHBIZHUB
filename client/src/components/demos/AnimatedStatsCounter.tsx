import { useState, useEffect, useRef } from "react";
import { Users, MapPin, Calculator, Building2, TrendingUp, Globe } from "lucide-react";

interface StatItem {
  icon: typeof Users;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const STATS: StatItem[] = [
  { icon: Users, value: 72000, suffix: "+", label: "Community Members", color: "text-teal-400" },
  { icon: MapPin, value: 15847, suffix: "+", label: "CLEANBI Analyses", color: "text-green-400" },
  { icon: Calculator, value: 50, suffix: "+", label: "Pro Calculators", color: "text-amber-400" },
  { icon: Building2, value: 847, suffix: "+", label: "Active Listings", color: "text-purple-400" },
  { icon: Globe, value: 220, suffix: "+", label: "Countries Covered", color: "text-blue-400" },
  { icon: TrendingUp, value: 99, suffix: "%", label: "Platform Uptime", color: "text-lime-400" },
];

interface CounterProps {
  end: number;
  duration: number;
  suffix: string;
}

function AnimatedCounter({ end, duration, suffix }: CounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCount();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCount = () => {
    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = end / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
}

export function AnimatedStatsCounter() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" data-testid="section-animated-stats">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trusted by the Industry's Best
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Join thousands of laundromat owners, investors, and industry professionals 
            who rely on WashBizHub for data-driven decisions.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="text-center group"
                data-testid={`stat-item-${idx}`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className={`text-3xl sm:text-4xl font-black ${stat.color} mb-2`}>
                  <AnimatedCounter 
                    end={stat.value} 
                    duration={2000} 
                    suffix={stat.suffix}
                  />
                </div>
                <p className="text-white/60 text-sm font-medium">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
