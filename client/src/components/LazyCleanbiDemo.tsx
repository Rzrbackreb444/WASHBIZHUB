import { useState, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { ArrowRight, MapPin, Sparkles, TrendingUp, DollarSign, Target, CheckCircle } from 'lucide-react';

const LazyRadarChart = lazy(() => import('./RadarChartComponent'));

const radarLabels = [
  'Population', 'Income', 'Renters', 'Age Demo', 'Competition',
  'Traffic', 'Visibility', 'Sq Ft', 'Machines', 'Parking',
  'Equip Age', 'Cleanliness', 'Pricing', 'Hours', 'Drop-Off',
  'Card System', 'Reviews'
];

function generateRandomScores(): number[] {
  return radarLabels.map(() => Math.floor(Math.random() * 3) + 7);
}

function calculateOverallScore(scores: number[]): number {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round((avg / 10) * 100);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(value);
}

function ScorePlaceholder() {
  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#39CCCC]/20 animate-pulse" />
        <p className="text-white/60 text-sm">Loading analysis...</p>
      </div>
    </div>
  );
}

export function LazyCleanbiDemo() {
  const [address, setAddress] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const runDemo = () => {
    if (!address.trim()) {
      toast({ title: "Enter an address", description: "Please enter an address to analyze", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const newScores = generateRandomScores();
      setScores(newScores);
      setOverallScore(calculateOverallScore(newScores));
      setIsLoading(false);
      setShowResult(true);
    }, 2500);
  };

  const revenueMin = useMemo(() => Math.round((overallScore / 100) * 650000 + 150000), [overallScore]);
  const revenueMax = useMemo(() => Math.round(revenueMin * 1.12), [revenueMin]);
  const valuationMin = useMemo(() => Math.round(revenueMin * 5), [revenueMin]);
  const valuationMax = useMemo(() => Math.round(revenueMax * 5.5), [revenueMax]);

  const radarData = useMemo(() => ({
    labels: radarLabels,
    datasets: [{
      label: 'Location Analysis',
      data: scores,
      backgroundColor: 'rgba(57, 204, 204, 0.25)',
      borderColor: '#39CCCC',
      borderWidth: 3,
      pointBackgroundColor: '#39CCCC',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  }), [scores]);

  if (!showResult) {
    return (
      <div ref={containerRef} className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#39CCCC]" />
          <span className="text-white/80 text-sm font-medium">Try the Live Demo</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input 
              placeholder="Enter any address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runDemo()}
              className="h-12 sm:h-14 pl-12 pr-4 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base sm:text-lg rounded-xl focus:border-[#39CCCC] focus:ring-[#39CCCC]/20"
              data-testid="input-cleanbi-address"
            />
          </div>
          <Button 
            onClick={runDemo}
            disabled={isLoading}
            className="h-12 sm:h-14 px-6 sm:px-8 bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] font-bold text-base sm:text-lg rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 w-full"
            data-testid="button-run-cleanbi-demo"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#001F3F]/30 border-t-[#001F3F] rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="hidden sm:inline">Get Free CLEANBI Score</span>
                <span className="sm:hidden">Get Free Score</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </div>
        <p className="mt-3 text-white/50 text-xs sm:text-sm text-center">Works for any address • No signup required • Results in 8 seconds</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
        <div className="space-y-3 sm:space-y-4 order-2 md:order-1">
          <div className="flex items-center gap-3">
            <div className={`text-4xl sm:text-6xl font-bold ${overallScore >= 80 ? 'text-green-400' : overallScore >= 60 ? 'text-[#39CCCC]' : 'text-amber-400'}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {overallScore}
            </div>
            <div>
              <div className="text-white/60 text-xs sm:text-sm">CLEANBI Score</div>
              <div className={`text-base sm:text-lg font-semibold ${overallScore >= 80 ? 'text-green-400' : overallScore >= 60 ? 'text-[#39CCCC]' : 'text-amber-400'}`}>
                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Fair'}
              </div>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5">
              <span className="text-white/70 flex items-center gap-1.5 sm:gap-2"><TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Est. </span>Revenue</span>
              <span className="text-[#39CCCC] font-semibold text-xs sm:text-sm">{formatCurrency(revenueMin)} - {formatCurrency(revenueMax)}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5">
              <span className="text-white/70 flex items-center gap-1.5 sm:gap-2"><DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Est. </span>Valuation</span>
              <span className="text-green-400 font-semibold text-xs sm:text-sm">{formatCurrency(valuationMin)} - {formatCurrency(valuationMax)}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5">
              <span className="text-white/70 flex items-center gap-1.5 sm:gap-2"><Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> ROI Potential</span>
              <span className="text-amber-400 font-semibold text-xs sm:text-sm">{Math.round(20 + (overallScore / 5))}% - {Math.round(30 + (overallScore / 4))}%</span>
            </div>
          </div>
          <Link href="/cleanbi-auto">
            <Button className="w-full h-10 sm:h-12 bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] font-bold rounded-xl text-sm sm:text-base" data-testid="button-get-full-report">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Get Full Report
            </Button>
          </Link>
        </div>
        <div className="h-[200px] sm:h-[280px] bg-white/5 rounded-xl p-2 sm:p-4 order-1 md:order-2">
          {isVisible && (
            <Suspense fallback={<ScorePlaceholder />}>
              <LazyRadarChart data={radarData} />
            </Suspense>
          )}
        </div>
      </div>
      <button 
        onClick={() => { setShowResult(false); setAddress(''); }}
        className="text-[#39CCCC] hover:text-white transition text-xs sm:text-sm flex items-center gap-2 mx-auto"
        data-testid="button-try-another-address"
      >
        ← Try another address
      </button>
    </div>
  );
}

export default LazyCleanbiDemo;
