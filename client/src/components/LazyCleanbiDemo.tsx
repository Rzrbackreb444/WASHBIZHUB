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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input 
              placeholder="Enter any address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runDemo()}
              className="h-14 pl-12 pr-4 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg rounded-xl focus:border-[#39CCCC] focus:ring-[#39CCCC]/20"
              data-testid="input-cleanbi-address"
            />
          </div>
          <Button 
            onClick={runDemo}
            disabled={isLoading}
            className="h-14 px-8 bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] font-bold text-lg rounded-xl transition-all hover:scale-105 disabled:opacity-50"
            data-testid="button-run-cleanbi-demo"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#001F3F]/30 border-t-[#001F3F] rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Run My Free CLEANBI Score
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </div>
        <p className="mt-3 text-white/50 text-sm">Works for any address • No signup required • Results in 8 seconds</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`text-6xl font-bold ${overallScore >= 80 ? 'text-green-400' : overallScore >= 60 ? 'text-[#39CCCC]' : 'text-amber-400'}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {overallScore}
            </div>
            <div>
              <div className="text-white/60 text-sm">CLEANBI Score</div>
              <div className={`text-lg font-semibold ${overallScore >= 80 ? 'text-green-400' : overallScore >= 60 ? 'text-[#39CCCC]' : 'text-amber-400'}`}>
                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Fair'}
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-white/70 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Est. Annual Revenue</span>
              <span className="text-[#39CCCC] font-semibold">{formatCurrency(revenueMin)} - {formatCurrency(revenueMax)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-white/70 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Est. Valuation</span>
              <span className="text-green-400 font-semibold">{formatCurrency(valuationMin)} - {formatCurrency(valuationMax)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-white/70 flex items-center gap-2"><Target className="w-4 h-4" /> ROI Potential</span>
              <span className="text-amber-400 font-semibold">{Math.round(20 + (overallScore / 5))}% - {Math.round(30 + (overallScore / 4))}%</span>
            </div>
          </div>
          <Link href="/cleanbi-auto">
            <Button className="w-full h-12 bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] font-bold rounded-xl" data-testid="button-get-full-report">
              <CheckCircle className="w-5 h-5 mr-2" />
              Get Full CLEANBI Report
            </Button>
          </Link>
        </div>
        <div className="h-[280px] bg-white/5 rounded-xl p-4">
          {isVisible && (
            <Suspense fallback={<ScorePlaceholder />}>
              <LazyRadarChart data={radarData} />
            </Suspense>
          )}
        </div>
      </div>
      <button 
        onClick={() => { setShowResult(false); setAddress(''); }}
        className="text-[#39CCCC] hover:text-white transition text-sm flex items-center gap-2 mx-auto"
        data-testid="button-try-another-address"
      >
        ← Try another address
      </button>
    </div>
  );
}

export default LazyCleanbiDemo;
