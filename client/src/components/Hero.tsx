import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, CheckCircle, Loader2, Mail, MapPin, Building2, Home as HomeIcon } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@assets/IMG_5796_1763738809544.jpeg";
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
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      if (data.success && data.analysis) {
        const { analysis, competitors } = data;
        const addressType = detectAddressType(targetAddress);
        const gradeInfo = getGradeInfo(analysis.cleanbiScore);
        
        // Calculate revenue projections based on actual demographics
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
      // Fallback to demo mode if API fails - notify user
      toast({ 
        title: "Using demo mode", 
        description: "Live analysis unavailable. Showing estimated projections.",
        variant: "default"
      });
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
        body: JSON.stringify({ 
          email, 
          address, 
          source: 'cleanbi_demo',
          action,
          score: result?.score,
          addressType: result?.addressType
        })
      });
      
      setStep('success');
      
      if (action === 'trial') {
        setTimeout(() => {
          window.location.href = '/pricing?trial=true';
        }, 1500);
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

  const radarData = {
    labels: ['Population', 'Income', 'Renters', 'Age', 'Competition', 'Traffic', 'Visibility', 'Sq Ft', 'Machines', 'Parking', 'Equip Age', 'Cleanliness', 'Pricing', 'Hours', 'Drop-Off', 'Card System', 'Reviews'],
    datasets: [{
      label: 'Your Store',
      data: result ? [
        Math.min(10, Math.round(result.score / 10)),
        Math.min(10, Math.round(result.score / 11)),
        Math.min(10, Math.round(result.score / 10.5)),
        Math.min(10, Math.round(result.score / 12)),
        Math.min(10, Math.round(result.score / 10)),
        Math.min(10, Math.round(result.score / 11)),
        Math.min(10, Math.round(result.score / 10)),
        Math.min(10, Math.round(result.score / 11)),
        Math.min(10, Math.round(result.score / 10.5)),
        Math.min(10, Math.round(result.score / 12)),
        Math.min(10, Math.round(result.score / 11)),
        Math.min(10, Math.round(result.score / 10)),
        Math.min(10, Math.round(result.score / 11)),
        Math.min(10, Math.round(result.score / 10)),
        Math.min(10, Math.round(result.score / 12)),
        Math.min(10, Math.round(result.score / 10)),
        Math.min(10, Math.round(result.score / 10.5))
      ] : Array(17).fill(7),
      backgroundColor: 'rgba(57,204,204,0.2)',
      borderColor: '#39CCCC',
      borderWidth: 4,
      pointBackgroundColor: '#39CCCC',
    }],
  };

  const radarOptions = {
    scales: { 
      r: { 
        min: 0, 
        max: 10, 
        ticks: { stepSize: 2, color: 'rgba(255,255,255,0.6)' }, 
        grid: { color: 'rgba(255,255,255,0.1)' }, 
        pointLabels: { color: '#fff', font: { size: 10 } },
        angleLines: { color: 'rgba(255,255,255,0.1)' }
      } 
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: true,
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-800">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Premium stacked commercial laundromat washers and dryers in modern industrial facility"
          className="w-full h-full object-cover opacity-20"
          loading="eager"
          decoding="async"
          width={1920}
          height={1080}
          data-testid="img-hero-background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/95 via-navy-900/90 to-navy-800/95" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-bebas leading-tight mb-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}
            data-testid="text-hero-title"
          >
            The <span className="text-teal-400">Laundromat Boom</span> Is Here. Get In Before It's Too Late.
          </h1>
          
          <p 
            className="text-xl sm:text-2xl text-white mb-12 max-w-3xl mx-auto font-medium"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}
            data-testid="text-hero-subtitle"
          >
            Everyone wants to own a laundromat. Score any location instantly with CLEANBI™ and find your next investment in a $5B industry.
          </p>

          <div 
            id="cleanbi" 
            className="bg-navy-900 rounded-3xl p-8 sm:p-10 max-w-4xl mx-auto border-2 border-teal-400/50 shadow-2xl"
            data-testid="section-cleanbi-demo"
          >
            {step === 'address' && (
              <div className="animate-in text-center">
                <h2 className="text-3xl sm:text-4xl font-bebas mb-2 text-white text-center">
                  Analyze Any Laundromat Location
                </h2>
                <p className="text-gray-300 mb-8 text-lg text-center">Get instant CLEANBI™ intelligence on any business or property</p>
                
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Business Name Field */}
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-400 mb-2">
                      Business Name <span className="text-gray-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g., Spin City Laundry"
                        className="w-full pl-12 pr-6 py-4 text-lg text-navy-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-400 bg-white"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        data-testid="input-cleanbi-business-name"
                      />
                    </div>
                  </div>
                  
                  {/* Address Field */}
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-400 mb-2">
                      Street Address <span className="text-teal-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="123 Main Street, City, State ZIP"
                        className="w-full pl-12 pr-6 py-4 text-lg text-navy-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-400 bg-white"
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
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                          {predictions.map((pred) => (
                            <button
                              key={pred.place_id}
                              onClick={() => {
                                setAddress(pred.description);
                                setShowPredictions(false);
                              }}
                              className="w-full px-4 py-3 text-left text-navy-900 hover:bg-teal-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                              data-testid={`prediction-${pred.place_id}`}
                            >
                              <MapPin className="w-4 h-4 text-teal-600" />
                              <span className="text-sm">{pred.description}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-6 mb-6">
                  <span className="text-gray-500 text-sm">Quick examples:</span>
                  {[
                    { name: "Spin City Laundry", addr: "2847 S Las Vegas Blvd, Las Vegas, NV 89109" },
                    { name: "WaveMax Laundry", addr: "4502 N Central Ave, Phoenix, AZ 85012" },
                    { name: "Suds Factory", addr: "1455 Ocean Dr, Miami Beach, FL 33139" }
                  ].map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => runDemo(sample.addr, sample.name)}
                      className="px-3 py-1.5 bg-teal-400/10 text-teal-300 rounded-full text-sm hover:bg-teal-400/20 transition flex items-center gap-1 border border-teal-400/20"
                      data-testid={`button-sample-${sample.name.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      <Building2 className="w-3 h-3" />
                      {sample.name}
                    </button>
                  ))}
                </div>
                
                <div>
                  <Button 
                    onClick={() => runDemo()} 
                    size="lg"
                    disabled={!address.trim()}
                    className="bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 text-navy-900 px-10 sm:px-16 py-6 text-xl sm:text-2xl font-bold rounded-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-400/20"
                    data-testid="button-cleanbi-run-demo"
                  >
                    Get Free CLEANBI Score
                  </Button>
                  <p className="text-gray-500 text-sm mt-3">3 free analyses per day • No credit card required</p>
                </div>
              </div>
            )}

            {step === 'analyzing' && (
              <div className="animate-in py-12">
                <Loader2 className="w-16 h-16 text-teal-400 animate-spin mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bebas text-white mb-4">
                  Analyzing Location Data...
                </h2>
                <p className="text-gray-300 text-lg">
                  Scanning demographics, competition, traffic patterns...
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  {['Demographics', 'Competition', 'Traffic', 'Revenue'].map((item, i) => (
                    <span 
                      key={item}
                      className="px-3 py-1 bg-teal-400/20 text-teal-400 rounded-full text-sm animate-pulse"
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
                <div className="flex items-center justify-center gap-3 mb-4">
                  {result.addressType === 'residential' ? (
                    <HomeIcon className="w-8 h-8 text-amber-400" />
                  ) : (
                    <Building2 className="w-8 h-8 text-teal-400" />
                  )}
                  <span className="text-lg text-gray-300 capitalize">
                    {result.addressType === 'laundromat' ? 'Laundromat Location' : 
                     result.addressType === 'commercial' ? 'Commercial Property' : 'Residential Property'}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <span 
                    className="text-7xl sm:text-9xl font-bold"
                    style={{ color: result.grade === 'A' ? '#22C55E' : result.grade === 'B' ? '#A3E635' : result.grade === 'C' ? '#FBBF24' : '#C8A661' }}
                    data-testid="text-cleanbi-score"
                  >
                    {result.score}/100
                  </span>
                  <span 
                    className="text-4xl sm:text-6xl font-bold px-4 py-2 rounded-xl"
                    style={{ 
                      backgroundColor: result.grade === 'A' ? '#22C55E20' : result.grade === 'B' ? '#A3E63520' : result.grade === 'C' ? '#FBBF2420' : '#C8A66120',
                      color: result.grade === 'A' ? '#22C55E' : result.grade === 'B' ? '#A3E635' : result.grade === 'C' ? '#FBBF24' : '#C8A661'
                    }}
                  >
                    {result.grade}
                  </span>
                </div>
                
                <p className="text-xl text-gray-300 mb-6">{result.opportunity}</p>
                
                {result.addressType === 'residential' && result.propertyMetrics ? (
                  <div className="bg-navy-900/50 rounded-2xl p-6 mb-6">
                    <p className="text-gray-400 text-sm mb-2">Residential Property Analysis</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-400">{formatCurrency(result.propertyMetrics.estimatedValue)}</p>
                        <p className="text-gray-400 text-sm">Est. Value</p>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-400">{formatCurrency(result.propertyMetrics.monthlyRent)}/mo</p>
                        <p className="text-gray-400 text-sm">Rental Potential</p>
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold text-amber-400">{result.propertyMetrics.capRate.toFixed(1)}%</p>
                        <p className="text-gray-400 text-sm">Cap Rate</p>
                      </div>
                    </div>
                    <p className="text-amber-400/80 text-sm mt-4 italic">
                      This is a residential property. For laundromat business projections, enter a commercial address.
                    </p>
                  </div>
                ) : result.projections ? (
                  <div className="bg-navy-900/50 rounded-2xl p-6 mb-6">
                    <p className="text-gray-400 text-sm mb-2">Laundromat Business Projections</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-3xl sm:text-4xl font-bold text-teal-400" data-testid="text-cleanbi-revenue">
                          {formatCurrency(result.projections.revenueMin)} – {formatCurrency(result.projections.revenueMax)}
                        </p>
                        <p className="text-gray-400 text-sm">Annual Revenue Potential</p>
                      </div>
                      <div>
                        <p className="text-3xl sm:text-4xl font-bold text-teal-400">
                          {formatCurrency(result.projections.valuationMin)} – {formatCurrency(result.projections.valuationMax)}
                        </p>
                        <p className="text-gray-400 text-sm">Est. Business Valuation</p>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                <div className="bg-navy-900/50 rounded-3xl p-4 sm:p-8 mb-8">
                  <div className="max-w-lg mx-auto">
                    <LazyRadarChart data={radarData} options={radarOptions} />
                  </div>
                </div>

                <div className="bg-navy-900/70 rounded-2xl p-6 mb-6 border border-teal-400/30">
                  <p className="text-white text-lg mb-4">
                    <Mail className="inline w-5 h-5 mr-2 text-teal-400" />
                    Enter your email to unlock your full report + start your free trial
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="flex-1 px-5 py-4 text-lg text-navy-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-400 bg-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailCapture('trial')}
                      data-testid="input-cleanbi-email"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
                  <Link href={`/cleanbi-explorer?address=${encodeURIComponent(address)}&name=${encodeURIComponent(businessName)}&score=${result.score}&grade=${encodeURIComponent(result.grade)}`}>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-navy-900 px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-2xl font-bold rounded-xl hover:scale-105 transition shadow-lg shadow-teal-400/30"
                      data-testid="button-cleanbi-explore-map"
                    >
                      <MapPin className="mr-2 h-6 w-6" />
                      Explore Full Map
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => handleEmailCapture('trial')}
                    disabled={isSubmitting}
                    size="lg"
                    variant="outline"
                    className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-navy-900 px-6 sm:px-10 py-5 sm:py-6 text-lg sm:text-xl font-bold rounded-xl transition"
                    data-testid="button-cleanbi-start-trial"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                    Start Free Trial
                  </Button>
                  <Button 
                    onClick={() => handleEmailCapture('report')}
                    disabled={isSubmitting}
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/50 text-white hover:bg-white/20 px-6 sm:px-10 py-5 sm:py-6 text-lg sm:text-xl font-bold rounded-xl transition"
                    data-testid="button-cleanbi-full-report"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Get Report
                  </Button>
                </div>
                
                <button 
                  onClick={() => { setStep('address'); setEmail(''); }}
                  className="mt-6 text-gray-400 hover:text-white text-sm underline"
                  data-testid="button-cleanbi-try-another"
                >
                  Try another address
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="animate-in py-12">
                <CheckCircle className="w-20 h-20 text-teal-400 mx-auto mb-6" />
                <h2 className="text-4xl sm:text-5xl font-bebas text-white mb-4">
                  You're In!
                </h2>
                <p className="text-xl text-gray-200 mb-2">
                  Check your inbox for your full CLEANBI report.
                </p>
                <p className="text-lg text-teal-400">
                  Redirecting to complete your trial setup...
                </p>
              </div>
            )}
          </div>

          <p 
            className="mt-12 text-xl text-white font-medium"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}
            data-testid="text-hero-trust-stat"
          >
            Join 72,000+ owners already winning &rarr;
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Link href="/cleanbi-explorer">
              <Button 
                size="lg"
                className="bg-teal-400 text-navy-900 hover:bg-teal-300 font-semibold shadow-xl"
                data-testid="button-hero-explorer"
              >
                Explore CLEANBI Map
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button 
                size="lg" 
                variant="outline"
                className="text-white border-white/50 hover:bg-white/20 font-semibold"
                data-testid="button-hero-pricing"
              >
                View Plans
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-300/80" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            <span className="text-teal-400 font-medium">3 free analyses/day</span> · Unlimited with Pro
          </p>
        </div>
      </div>
    </section>
  );
}
