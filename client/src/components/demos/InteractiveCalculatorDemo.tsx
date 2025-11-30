import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { Calculator, TrendingUp, DollarSign, ArrowRight, Zap, RotateCcw } from "lucide-react";

interface CalculatorInputs {
  machines: number;
  pricePerLoad: number;
  turnsPerDay: number;
  operatingDays: number;
}

interface CalculatorResults {
  dailyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenuePerMachine: number;
}

export function InteractiveCalculatorDemo() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    machines: 20,
    pricePerLoad: 4.50,
    turnsPerDay: 5,
    operatingDays: 30,
  });
  
  const [results, setResults] = useState<CalculatorResults>({
    dailyRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    revenuePerMachine: 0,
  });
  
  const [animatedMonthly, setAnimatedMonthly] = useState(0);

  useEffect(() => {
    const dailyRevenue = inputs.machines * inputs.pricePerLoad * inputs.turnsPerDay;
    const monthlyRevenue = dailyRevenue * inputs.operatingDays;
    const yearlyRevenue = monthlyRevenue * 12;
    const revenuePerMachine = monthlyRevenue / inputs.machines;
    
    setResults({
      dailyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      revenuePerMachine,
    });
  }, [inputs]);

  useEffect(() => {
    const target = results.monthlyRevenue;
    const duration = 500;
    const steps = 30;
    const startValue = animatedMonthly;
    const increment = (target - startValue) / steps;
    const stepDuration = duration / steps;
    
    let current = startValue;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        setAnimatedMonthly(target);
        clearInterval(timer);
      } else {
        setAnimatedMonthly(Math.floor(current));
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [results.monthlyRevenue]);

  const resetToDefaults = () => {
    setInputs({
      machines: 20,
      pricePerLoad: 4.50,
      turnsPerDay: 5,
      operatingDays: 30,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-navy-900/95 via-navy-800/95 to-navy-900/95 border-2 border-accent/30 p-0" data-testid="card-calculator-demo">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-teal-500/5" />
      
      <div className="relative p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Revenue Calculator</h3>
              <p className="text-white/60 text-sm">Try it live - adjust the sliders</p>
            </div>
          </div>
          <Badge className="bg-accent/20 text-accent border-accent/30">
            <Zap className="w-3 h-3 mr-1" />
            Interactive
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white/80 text-sm font-medium">Number of Machines</label>
                <span className="text-accent font-bold text-lg">{inputs.machines}</span>
              </div>
              <Slider
                value={[inputs.machines]}
                onValueChange={([value]) => setInputs(prev => ({ ...prev, machines: value }))}
                min={5}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                data-testid="slider-machines"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>5</span>
                <span>100</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white/80 text-sm font-medium">Price Per Load</label>
                <span className="text-accent font-bold text-lg">${inputs.pricePerLoad.toFixed(2)}</span>
              </div>
              <Slider
                value={[inputs.pricePerLoad * 100]}
                onValueChange={([value]) => setInputs(prev => ({ ...prev, pricePerLoad: value / 100 }))}
                min={200}
                max={1000}
                step={25}
                className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                data-testid="slider-price"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>$2.00</span>
                <span>$10.00</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white/80 text-sm font-medium">Turns Per Day (TPD)</label>
                <span className="text-accent font-bold text-lg">{inputs.turnsPerDay}</span>
              </div>
              <Slider
                value={[inputs.turnsPerDay]}
                onValueChange={([value]) => setInputs(prev => ({ ...prev, turnsPerDay: value }))}
                min={1}
                max={12}
                step={0.5}
                className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                data-testid="slider-tpd"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>1x</span>
                <span>12x</span>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetToDefaults}
              className="text-white/60 hover:text-white"
              data-testid="button-reset-calculator"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          <div className="flex flex-col justify-center">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="text-center pb-4 border-b border-white/10">
                <p className="text-white/60 text-sm uppercase tracking-wider mb-2">Projected Monthly Revenue</p>
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-8 h-8 text-accent" />
                  <span className="text-4xl sm:text-5xl font-black text-accent" data-testid="text-monthly-revenue">
                    {formatCurrency(animatedMonthly)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-xs mb-1">Daily</p>
                  <p className="text-white font-bold" data-testid="text-daily-revenue">
                    {formatCurrency(results.dailyRevenue)}
                  </p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-xs mb-1">Yearly</p>
                  <p className="text-white font-bold" data-testid="text-yearly-revenue">
                    {formatCurrency(results.yearlyRevenue)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 pt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  {formatCurrency(results.revenuePerMachine)}/machine/month
                </span>
              </div>
            </div>
            
            <Link href="/calculators" className="mt-4">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold" data-testid="button-all-calculators">
                Explore All 50+ Calculators
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
