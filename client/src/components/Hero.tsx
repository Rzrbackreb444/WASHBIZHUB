import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, CheckCircle, Loader2, Mail, MapPin, Building2, Home as HomeIcon, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { LazyRadarChart } from "./LazyRadarChart";
import { getGradeInfo } from "@shared/cleanbi-grades";

type DemoStep = 'address' | 'analyzing' | 'results' | 'capture' | 'success';
type AddressType = 'laundromat' | 'commercial' | 'residential';

interface DemoResult {
  score: number;
  grade: string;
  opportunity: string;
  addressType: AddressType;
  projections: {
    revenueMin: number;
    revenueMax: number;
    valuationMin: number;
    valuationMax: number;
  } | null;
  propertyMetrics: {
    estimatedValue: number;
    monthlyRent: number;
    capRate: number;
  } | null;
}

export function Hero() {
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<DemoStep>('address');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (window.google?.maps?.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setPredictions([]);
      return;
    }
    autocompleteService.current.getPlacePredictions(
      { input, componentRestrictions: { country: 'us' }, types: ['address'] },
      (results) => {
        setPredictions(results || []);
        setShowPredictions(true);
      }
    );
  }, []);

  const detectAddressType = (addr: string): AddressType => {
    const lower = addr.toLowerCase();
    if (lower.includes('laundry') || lower.includes('laundromat') || lower.includes('wash') || lower.includes('cleaners')) {
      return 'laundromat';
    }
    if (lower.includes('plaza') || lower.includes('center') || lower.includes('mall') || lower.includes('suite') || lower.includes('ste')) {
      return 'commercial';
    }
    const hasResidentialPattern = /^\d+\s+[a-z]/i.test(addr) && 
      (lower.includes('st') || lower.includes('ave') || lower.includes('rd') || lower.includes('dr') || lower.includes('ln') || lower.includes('ct'));
    if (hasResidentialPattern && !lower.includes('#') && !lower.includes('unit')) {
      return 'residential';
    }
    return 'commercial';
  };

  const generateRealisticScore = (addressType: AddressType): DemoResult => {
    const baseScore = addressType === 'laundromat' ? 70 + Math.random() * 20 : 
                      addressType === 'commercial' ? 55 + Math.random() * 30 : 
                      45 + Math.random() * 25;
    const score = Math.round(baseScore);
    const gradeInfo = getGradeInfo(score);
    
    if (addressType === 'residential') {
      const estimatedValue = 150000 + Math.random() * 350000;
      return {
        score,
        grade: gradeInfo.grade,
        opportunity: gradeInfo.opportunity,
        addressType,
        projections: null,
        propertyMetrics: {
          estimatedValue: Math.round(estimatedValue),
          monthlyRent: Math.round(estimatedValue * 0.007),
          capRate: 4 + Math.random() * 4
        }
      };
    }

    const washerCount = addressType === 'laundromat' ? 18 + Math.floor(Math.random() * 12) : 15 + Math.floor(Math.random() * 10);
    const tpd = score >= 85 ? 5.2 : score >= 70 ? 4.3 : score >= 55 ? 3.5 : 2.8;
    const vend = 4.25;
    const revenueBase = washerCount * tpd * vend * 360;
    const revenueMultiplier = addressType === 'laundromat' ? 1.0 : 0.85;
    
    return {
      score,
      grade: gradeInfo.grade,
      opportunity: gradeInfo.opportunity,
      addressType,
      projections: {
        revenueMin: Math.round(revenueBase * 0.85 * revenueMultiplier),
        revenueMax: Math.round(revenueBase * 1.15 * revenueMultiplier),
        valuationMin: Math.round(revenueBase * 0.22 * 4.5),
        valuationMax: Math.round(revenueBase * 0.28 * 5.5)
      },
      propertyMetrics: null
    };
  };

  const runDemo = async (inputAddress?: string, inputName?: string) => {
    const targetAddress = inputAddress || address;
    const targetName = inputName !== undefined ? inputName : businessName;
    if (!targetAddress.trim()) return;
    if (inputAddress) setAddress(inputAddress);
    if (inputName !== undefined) setBusinessName(inputName);
    setStep('analyzing');
    setShowPredictions(false);
    
    try {
      const response = await fetch('/api/cleanbi-explorer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: targetAddress, businessName: targetName || undefined, radius: 5 })
      });
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      if (data.success && data.analysis) {
        const { analysis, competitors } = data;
        const addressType = detectAddressType(targetAddress);
        const gradeInfo = getGradeInfo(analysis.cleanbiScore);
        
        const washerCount = addressType === 'laundromat' ? 20 : 18;
        const competitorFactor = Math.max(0.7, 1 - (competitors?.length || 0) * 0.03);
        const incomeFactor = Math.min(1.3, (analysis.medianIncome || 50000) / 60000);
        const densityFactor = Math.min(1.2, (analysis.populationDensity || 3000) / 4000);
        
        const tpd = analysis.cleanbiScore >= 85 ? 5.5 : analysis.cleanbiScore >= 70 ? 4.5 : analysis.cleanbiScore >= 55 ? 3.8 : 3.0;
        const vend = 4.25;
        const revenueBase = washerCount * tpd * vend * 360 * competitorFactor * incomeFactor * densityFactor;
        
        const demoResult: DemoResult = {
          score: analysis.cleanbiScore,
          grade: gradeInfo.grade,
          opportunity: gradeInfo.opportunity,
          addressType,
          projections: addressType !== 'residential' ? {
            revenueMin: Math.round(revenueBase * 0.85),
            revenueMax: Math.round(revenueBase * 1.15),
            valuationMin: Math.round(revenueBase * 0.22 * 4.5),
            valuationMax: Math.round(revenueBase * 0.28 * 5.5)
          } : null,
          propertyMetrics: addressType === 'residential' ? {
            estimatedValue: Math.round(analysis.medianIncome * 4),
            monthlyRent: Math.round(analysis.medianIncome * 4 * 0.007),
            capRate: 5 + Math.random() * 3
          } : null
        };
        
        setResult(demoResult);
        setStep('results');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('CLEANBI API error:', error);
      toast({ title: "Using demo mode", description: "Live analysis unavailable. Showing estimated projections.", variant: "default" });
      const addressType = detectAddressType(targetAddress);
      const demoResult = generateRealisticScore(addressType);
      setResult(demoResult);
      setStep('results');
    }
  };

  const handleEmailCapture = async (action: 'trial' | 'report') => {
    if (!email.trim() || !email.includes('@')) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, address, source: 'cleanbi_demo', action, score: result?.score, addressType: result?.addressType })
      });
      setStep('success');
      if (action === 'trial') {
        setTimeout(() => { window.location.href = '/pricing?trial=true'; }, 1500);
      }
    } catch (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <section className="relative overflow-hidden mesh-gradient-hero">
      {/* Decorative mesh elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-[#b8860b]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-[#1e3a5f]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 mb-6">
              <span className="text-sm font-medium text-[#1e3a5f]">The #1 Laundromat Intelligence Platform</span>
            </div>
            
            <h1 
              className="hero-title text-[#1e3a5f] mb-6"
              data-testid="text-hero-title"
            >
              Don't Overpay for Your Next{' '}
              <span className="text-gradient-gold">Laundromat</span>
            </h1>
            
            <p 
              className="hero-subtitle max-w-xl mx-auto lg:mx-0 mb-8"
              data-testid="text-hero-subtitle"
            >
              Bad location = $200K+ mistake. Score any address in 30 seconds with CLEANBI™ before you invest.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button 
                className="btn-premium-gold text-white px-8 py-6 text-lg font-semibold rounded-xl"
                onClick={() => document.getElementById('cleanbi-demo')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-hero-cta-primary"
              >
                Get Your Free Score
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Link href="/directory">
                <Button 
                  variant="outline" 
                  className="px-8 py-6 text-lg font-semibold rounded-xl border-2 border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f]/5"
                  data-testid="button-hero-cta-secondary"
                >
                  Browse Listings
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-600">
              <span>72,000+ users</span>
              <span className="text-[#b8860b] font-medium">4.9/5 rating</span>
              <span>Free to start</span>
            </div>
          </div>

          {/* Right: CLEANBI Demo Card */}
          <div 
            id="cleanbi-demo"
            className="premium-card p-8 max-w-lg mx-auto lg:mx-0 lg:ml-auto"
            data-testid="section-cleanbi-demo"
          >
            {/* Progress Indicator */}
            <div className="flex items-center justify-between gap-2 mb-6" data-testid="progress-indicator">
              {[
                { num: 1, label: 'Address', active: step === 'address' },
                { num: 2, label: 'Analyze', active: step === 'analyzing' || step === 'results' || step === 'capture' || step === 'success' },
                { num: 3, label: 'Score', active: step === 'results' || step === 'capture' || step === 'success' }
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    s.active ? 'bg-[#b8860b] text-white' : 'bg-gray-100 text-gray-400'
                  } ${step === 'analyzing' && s.num === 2 ? 'animate-pulse' : ''}`}>
                    {s.num}
                  </div>
                  <span className={`text-xs hidden sm:inline ${s.active ? 'text-[#1e3a5f] font-medium' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                  {i < 2 && <div className={`h-0.5 flex-1 ${s.active ? 'bg-[#b8860b]' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {step === 'address' && (
              <div className="animate-in">
                <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2 text-center">
                  Is This Location Worth It?
                </h2>
                <p className="text-gray-500 mb-6 text-center">Get your CLEANBI™ score in 30 seconds</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name <span className="text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g., Spin City Laundry"
                        className="input-premium w-full pl-12"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        data-testid="input-cleanbi-business-name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-[#b8860b]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="123 Main Street, City, State ZIP"
                        className="input-premium w-full pl-12"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          fetchPredictions(e.target.value);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && runDemo()}
                        onBlur={() => setTimeout(() => setShowPredictions(false), 200)}
                        data-testid="input-cleanbi-address"
                      />
                      
                      {showPredictions && predictions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                          {predictions.map((pred) => (
                            <button
                              key={pred.place_id}
                              onClick={() => {
                                setAddress(pred.description);
                                setShowPredictions(false);
                              }}
                              className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                              data-testid={`prediction-${pred.place_id}`}
                            >
                              <MapPin className="w-4 h-4 text-[#b8860b]" />
                              <span className="text-sm">{pred.description}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6">
                  {[
                    { name: "Spin City", addr: "2847 S Las Vegas Blvd, Las Vegas, NV 89109" },
                    { name: "WaveMax", addr: "4502 N Central Ave, Phoenix, AZ 85012" },
                    { name: "Suds Factory", addr: "1455 Ocean Dr, Miami Beach, FL 33139" }
                  ].map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => runDemo(sample.addr, sample.name)}
                      className="px-3 py-1.5 bg-[#1e3a5f]/5 text-[#1e3a5f] rounded-full text-xs font-medium hover:bg-[#1e3a5f]/10 transition flex items-center gap-1 border border-[#1e3a5f]/10"
                      data-testid={`button-sample-${sample.name.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      <Building2 className="w-3 h-3" />
                      {sample.name}
                    </button>
                  ))}
                </div>
                
                <Button 
                  onClick={() => runDemo()} 
                  disabled={!address.trim()}
                  className="btn-premium-gold w-full text-white py-6 text-lg font-semibold rounded-xl disabled:opacity-50"
                  data-testid="button-cleanbi-run-demo"
                >
                  Score This Location
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-gray-400 text-xs mt-3 text-center">Free instant analysis - No signup required</p>
              </div>
            )}

            {step === 'analyzing' && (
              <div className="animate-in py-8 text-center">
                <Loader2 className="w-12 h-12 text-[#b8860b] animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
                  Analyzing Location Data...
                </h2>
                <p className="text-gray-500">Scanning demographics, competition, traffic patterns...</p>
                <div className="mt-4 flex justify-center gap-2">
                  {['Demographics', 'Competition', 'Traffic', 'Revenue'].map((item, i) => (
                    <span 
                      key={item}
                      className="px-3 py-1 bg-[#b8860b]/10 text-[#b8860b] rounded-full text-xs font-medium animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {step === 'results' && result && (
              <div className="animate-in">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {result.addressType === 'residential' ? (
                    <HomeIcon className="w-6 h-6 text-[#b8860b]" />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#1e3a5f]" />
                  )}
                  <span className="text-sm text-gray-500 capitalize">
                    {result.addressType === 'laundromat' ? 'Laundromat Location' : 
                     result.addressType === 'commercial' ? 'Commercial Property' : 'Residential Property'}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <span 
                    className="text-6xl font-bold"
                    style={{ color: result.grade === 'A' ? '#22C55E' : result.grade === 'B' ? '#84CC16' : result.grade === 'C' ? '#EAB308' : '#b8860b' }}
                    data-testid="text-cleanbi-score"
                  >
                    {result.score}
                  </span>
                  <div className="text-left">
                    <span 
                      className="text-3xl font-bold px-3 py-1 rounded-lg"
                      style={{ 
                        backgroundColor: result.grade === 'A' ? '#22C55E20' : result.grade === 'B' ? '#84CC1620' : result.grade === 'C' ? '#EAB30820' : '#b8860b20',
                        color: result.grade === 'A' ? '#22C55E' : result.grade === 'B' ? '#84CC16' : result.grade === 'C' ? '#EAB308' : '#b8860b'
                      }}
                    >
                      {result.grade}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">out of 100</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 text-center font-medium">{result.opportunity}</p>
                
                {result.projections && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-gray-400 mb-2 text-center">Estimated Annual Revenue</p>
                    <p className="text-2xl font-bold text-[#1e3a5f] text-center">
                      {formatCurrency(result.projections.revenueMin)} - {formatCurrency(result.projections.revenueMax)}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link href="/cleanbi" className="flex-1">
                    <Button className="w-full btn-premium-gold text-white" data-testid="button-full-report">
                      Get Full Report
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => { setStep('address'); setResult(null); setAddress(''); }}
                    className="flex-1 border-[#1e3a5f]/20 text-[#1e3a5f]"
                    data-testid="button-try-another"
                  >
                    Try Another
                  </Button>
                </div>
              </div>
            )}

            {step === 'capture' && (
              <div className="animate-in py-4 text-center">
                <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">Unlock Your Full Report</h2>
                <p className="text-gray-500 mb-6">Enter your email to access detailed insights</p>
                <div className="relative mb-4">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    className="input-premium w-full pl-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email-capture"
                  />
                </div>
                <Button 
                  onClick={() => handleEmailCapture('report')} 
                  disabled={isSubmitting}
                  className="w-full btn-premium-gold text-white"
                  data-testid="button-get-report"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get My Report'}
                </Button>
              </div>
            )}

            {step === 'success' && (
              <div className="animate-in py-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">You're All Set!</h2>
                <p className="text-gray-500">Check your email for your full CLEANBI report.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
