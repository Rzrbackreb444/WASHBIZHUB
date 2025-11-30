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
    <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-y border-white/10" data-testid="section-animated-stats">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Trusted by the Industry's Best
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
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
                className="text-center group bg-white/5 rounded-xl p-4 border border-white/10"
                data-testid={`stat-item-${idx}`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black/30 mb-3">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>
                  <AnimatedCounter 
                    end={stat.value} 
                    duration={2000} 
                    suffix={stat.suffix}
                  />
                </div>
                <p className="text-gray-400 text-xs font-medium">
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
