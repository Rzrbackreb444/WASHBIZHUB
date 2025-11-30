import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  MapPin, Search, Loader2, TrendingUp, Users, Building2, 
  Star, ArrowRight, Zap, CheckCircle
} from "lucide-react";

type DemoState = 'idle' | 'analyzing' | 'complete';

interface ScoreResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'Needs Work';
  opportunity: string;
  metrics: {
    population: number;
    competition: number;
    income: number;
    traffic: number;
  };
}

const GRADE_STYLES = {
  'A': { bg: '#22C55E', text: '#22C55E', border: '#22C55E' },
  'B': { bg: '#A3E635', text: '#A3E635', border: '#A3E635' },
  'C': { bg: '#FBBF24', text: '#FBBF24', border: '#FBBF24' },
  'Needs Work': { bg: '#C8A661', text: '#C8A661', border: '#C8A661' }
};

const DEMO_ADDRESSES = [
  { address: "2847 S Las Vegas Blvd, Las Vegas, NV", score: 92, grade: 'A' as const, opportunity: "Gold Mine Zone" },
  { address: "1455 Ocean Dr, Miami Beach, FL", score: 87, grade: 'A' as const, opportunity: "High Opportunity" },
  { address: "4502 N Central Ave, Phoenix, AZ", score: 76, grade: 'B' as const, opportunity: "Good Potential" },
  { address: "8901 Sunset Blvd, Los Angeles, CA", score: 89, grade: 'A' as const, opportunity: "Gold Mine Zone" },
  { address: "123 Main St, Smalltown, TX", score: 52, grade: 'Needs Work' as const, opportunity: "Room to Grow" },
];

export function CLEANBIQuickScoreDemo() {
  const [address, setAddress] = useState('');
  const [state, setState] = useState<DemoState>('idle');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const analyzeAddress = (selectedAddress?: string) => {
    const targetAddress = selectedAddress || address;
    if (!targetAddress.trim()) return;
    
    setState('analyzing');
    setShowSuggestions(false);
    
    const demoResult = DEMO_ADDRESSES.find(d => 
      d.address.toLowerCase().includes(targetAddress.toLowerCase().split(',')[0])
    ) || DEMO_ADDRESSES[Math.floor(Math.random() * DEMO_ADDRESSES.length)];
    
    setTimeout(() => {
      setResult({
        score: demoResult.score,
        grade: demoResult.grade,
        opportunity: demoResult.opportunity,
        metrics: {
          population: 45000 + Math.floor(Math.random() * 30000),
          competition: 2 + Math.floor(Math.random() * 5),
          income: 52000 + Math.floor(Math.random() * 35000),
          traffic: 8000 + Math.floor(Math.random() * 15000),
        }
      });
      setState('complete');
    }, 2500);
  };

  useEffect(() => {
    if (state === 'complete' && result) {
      let current = 0;
      const target = result.score;
      const duration = 1500;
      const steps = 60;
      const increment = target / steps;
      const stepDuration = duration / steps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [state, result]);

  const resetDemo = () => {
    setState('idle');
    setResult(null);
    setAnimatedScore(0);
    setAddress('');
  };

  const filteredSuggestions = DEMO_ADDRESSES.filter(d => 
    d.address.toLowerCase().includes(address.toLowerCase())
  ).slice(0, 3);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-navy-900/95 via-navy-800/95 to-navy-900/95 border-2 border-teal-500/30 p-0" data-testid="card-cleanbi-quick-demo">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-accent/5" />
      
      <div className="relative p-6 sm:p-8">
        {state === 'idle' && (
          <div className="text-center space-y-6" data-testid="section-demo-idle">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 rounded-full border border-teal-500/30">
              <Zap className="w-4 h-4 text-teal-400" />
              <span className="text-teal-400 text-sm font-semibold">Live Demo - Try It Now</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Get Your CLEANBI™ Score in Seconds
            </h3>
            <p className="text-white/70 max-w-lg mx-auto">
              Enter any address to see our AI-powered location intelligence scoring. 
              Works for laundromats, retail, restaurants - any business.
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Enter any address (e.g., 123 Main St, City, State)"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setShowSuggestions(e.target.value.length > 2);
                    }}
                    onFocus={() => setShowSuggestions(address.length > 2)}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeAddress()}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-lg"
                    data-testid="input-demo-address"
                  />
                  
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-navy-800 border border-white/20 rounded-xl overflow-hidden z-10 shadow-2xl">
                      {filteredSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setAddress(suggestion.address);
                            setShowSuggestions(false);
                            analyzeAddress(suggestion.address);
                          }}
                          className="w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 flex items-center gap-3 transition-colors"
                          data-testid={`suggestion-${idx}`}
                        >
                          <MapPin className="w-4 h-4 text-teal-400" />
                          <span>{suggestion.address}</span>
                          <Badge 
                            className="ml-auto text-white"
                            style={{ backgroundColor: GRADE_STYLES[suggestion.grade].bg }}
                          >
                            {suggestion.grade}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => analyzeAddress()}
                  disabled={!address.trim()}
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 shrink-0"
                  data-testid="button-demo-analyze"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Score
                </Button>
              </div>
            </div>
            
            <p className="text-white/50 text-sm">
              Try: "Las Vegas", "Miami Beach", "Phoenix", or any address
            </p>
          </div>
        )}

        {state === 'analyzing' && (
          <div className="text-center py-8 space-y-6" data-testid="section-demo-analyzing">
            <div className="relative inline-flex">
              <div className="w-24 h-24 rounded-full border-4 border-teal-500/30 border-t-teal-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-teal-400" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white">
              Analyzing Location Intelligence...
            </h3>
            
            <div className="flex flex-wrap justify-center gap-3">
              {['Demographics', 'Competition', 'Traffic', 'Income'].map((item, i) => (
                <Badge 
                  key={item}
                  className="bg-teal-500/20 text-teal-400 border-teal-500/30 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  {item}
                </Badge>
              ))}
            </div>
            
            <p className="text-white/60">
              Scanning {address}...
            </p>
          </div>
        )}

        {state === 'complete' && result && (
          <div className="space-y-6" data-testid="section-demo-complete">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30 mb-4">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-semibold">Analysis Complete</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6">
                <div className="relative">
                  <div 
                    className="w-32 h-32 rounded-full border-4 flex items-center justify-center bg-white/5"
                    style={{ borderColor: GRADE_STYLES[result.grade].border }}
                  >
                    <div className="text-center">
                      <span 
                        className="text-4xl font-black" 
                        style={{ color: GRADE_STYLES[result.grade].text }}
                        data-testid="text-demo-score"
                      >
                        {animatedScore}
                      </span>
                      <span className="text-white/60 text-lg">/100</span>
                    </div>
                  </div>
                  <div 
                    className="absolute -top-2 -right-2 text-white text-xl font-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: GRADE_STYLES[result.grade].bg }}
                    data-testid="badge-demo-grade"
                  >
                    {result.grade === 'Needs Work' ? 'NW' : result.grade}
                  </div>
                </div>
                
                <div className="text-center sm:text-left">
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Opportunity Level</p>
                  <h4 
                    className="text-2xl font-bold"
                    style={{ color: GRADE_STYLES[result.grade].text }}
                    data-testid="text-demo-opportunity"
                  >
                    {result.opportunity}
                  </h4>
                  <p className="text-white/70 text-sm mt-2 max-w-xs">
                    {result.grade === 'A' && "Excellent location with high growth potential"}
                    {result.grade === 'B' && "Strong fundamentals with good opportunity"}
                    {result.grade === 'C' && "Moderate potential with room for optimization"}
                    {result.grade === 'Needs Work' && "Strategic improvements recommended"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <Users className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{result.metrics.population.toLocaleString()}</p>
                <p className="text-xs text-white/60">Population</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <Building2 className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{result.metrics.competition}</p>
                <p className="text-xs text-white/60">Competitors</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <TrendingUp className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">${(result.metrics.income / 1000).toFixed(0)}K</p>
                <p className="text-xs text-white/60">Avg Income</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <Star className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{(result.metrics.traffic / 1000).toFixed(1)}K</p>
                <p className="text-xs text-white/60">Daily Traffic</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/cleanbi-explorer">
                <Button size="lg" className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-white font-bold" data-testid="button-demo-full-analysis">
                  Get Full Analysis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={resetDemo}
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                data-testid="button-demo-try-another"
              >
                Try Another Address
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
