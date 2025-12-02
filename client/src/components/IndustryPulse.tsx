/**
 * INDUSTRY PULSE - Live Stats Dashboard
 * Real-time laundromat industry intelligence
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface PulseStats {
  listingsSoldThisWeek: number;
  newListingsToday: number;
  averageMultiple: number;
  cleanbiAnalysesToday: number;
  hotMarkets: { city: string; state: string; count: number }[];
  activeInvestors: number;
  totalValue: string;
}

const MOCK_STATS: PulseStats = {
  listingsSoldThisWeek: 47,
  newListingsToday: 12,
  averageMultiple: 3.2,
  cleanbiAnalysesToday: 284,
  hotMarkets: [
    { city: "Houston", state: "TX", count: 18 },
    { city: "Phoenix", state: "AZ", count: 14 },
    { city: "Atlanta", state: "GA", count: 12 },
  ],
  activeInvestors: 1847,
  totalValue: "$24.7M",
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}{suffix}</span>;
}

export function IndustryPulse() {
  const [stats] = useState<PulseStats>(MOCK_STATS);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500/50'}`} />
        <span className="text-xs text-muted-foreground font-medium">LIVE</span>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-1" data-testid="text-pulse-title">Industry Pulse</h3>
          <p className="text-sm text-muted-foreground">Real-time market intelligence</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground" data-testid="stat-sold">
              <AnimatedNumber value={stats.listingsSoldThisWeek} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">Sold This Week</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground" data-testid="stat-new">
              <AnimatedNumber value={stats.newListingsToday} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">New Today</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground" data-testid="stat-multiple">
              {stats.averageMultiple}x
            </div>
            <div className="text-xs text-muted-foreground mt-1">Avg. Multiple</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground" data-testid="stat-analyses">
              <AnimatedNumber value={stats.cleanbiAnalysesToday} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">CLEANBI Today</div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Hot Markets</span>
            <Badge variant="outline" className="text-xs">This Week</Badge>
          </div>
          
          <div className="space-y-2">
            <AnimatePresence>
              {stats.hotMarkets.map((market, index) => (
                <motion.div
                  key={market.city}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between text-sm"
                  data-testid={`market-${market.city.toLowerCase()}`}
                >
                  <span className="text-foreground/80">{market.city}, {market.state}</span>
                  <span className="font-medium">{market.count} deals</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Active investors: </span>
            <span className="font-semibold" data-testid="stat-investors">{stats.activeInvestors.toLocaleString()}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Weekly volume: </span>
            <span className="font-semibold text-emerald-600" data-testid="stat-volume">{stats.totalValue}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function IndustryPulseMini() {
  const [isLive, setIsLive] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => setIsLive(prev => !prev), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500/50'}`} />
        <span className="text-xs font-medium text-muted-foreground">LIVE</span>
      </div>
      <div className="h-3 w-px bg-border" />
      <span className="text-xs">
        <span className="font-semibold">47</span> sold this week
      </span>
      <div className="h-3 w-px bg-border" />
      <span className="text-xs">
        <span className="font-semibold">3.2x</span> avg. multiple
      </span>
    </div>
  );
}
