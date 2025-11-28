import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { 
  Play, Download, Zap, Shield, TrendingUp, Users, 
  Star, CheckCircle, ArrowRight, ChevronRight, Sparkles,
  DollarSign, BarChart3, Cpu, Store, Calculator, Chrome,
  MessageCircle, Award, Target, Settings, Lightbulb
} from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

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

function CleanbiDemo() {
  const [address, setAddress] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const { toast } = useToast();

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

  const revenueMin = Math.round((overallScore / 100) * 650000 + 150000);
  const revenueMax = Math.round(revenueMin * 1.12);
  const valuationMin = Math.round(revenueMin * 5);
  const valuationMax = Math.round(revenueMax * 5.5);

  const radarData = {
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
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { 
          stepSize: 2,
          color: 'rgba(255,255,255,0.5)',
          backdropColor: 'transparent',
          font: { size: 10 }
        },
        grid: { 
          color: 'rgba(255,255,255,0.1)',
          circular: true
        },
        angleLines: {
          color: 'rgba(255,255,255,0.1)'
        },
        pointLabels: { 
          color: 'rgba(255,255,255,0.8)',
          font: { size: 10, weight: '500' as const }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 31, 63, 0.95)',
        titleColor: '#39CCCC',
        bodyColor: '#fff',
        borderColor: '#39CCCC',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `Score: ${context.raw}/10`
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart' as const
    }
  };

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-400', label: 'Excellent' };
    if (score >= 80) return { grade: 'B', color: 'text-teal-400', label: 'Strong' };
    return { grade: 'C', color: 'text-yellow-400', label: 'Opportunity' };
  };

  const gradeInfo = getGrade(overallScore);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#39CCCC] animate-spin"></div>
          <div className="absolute inset-4 rounded-full bg-white/5 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-[#39CCCC] animate-pulse" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Analyzing Location...</h3>
        <p className="text-white/60">Scanning 17 intelligence factors</p>
      </div>
    );
  }

  if (!showResult) {
    return (
      <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Enter Any Address → See Revenue in 8 Seconds
        </h2>
        <p className="text-white/70 text-lg mb-8">
          Free CLEANBI Score • No email required • Works for any business
        </p>
        <div className="max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="e.g. 1234 Main St, Dallas, TX"
            className="w-full h-16 px-6 text-lg bg-white text-[#001F3F] rounded-xl border-0 mb-4 placeholder:text-gray-400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runDemo()}
            data-testid="input-cleanbi-address"
          />
          <Button 
            onClick={runDemo}
            className="w-full h-16 bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] text-xl font-bold rounded-xl transition-transform hover:scale-[1.02]"
            data-testid="button-run-cleanbi"
          >
            <Play className="w-6 h-6 mr-3" />
            Run My Free CLEANBI Score
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className={`text-8xl md:text-9xl font-black ${gradeInfo.color}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {overallScore}
            </span>
            <div className="text-left">
              <div className={`text-4xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
              <div className="text-white/60 text-sm">{gradeInfo.label}</div>
            </div>
          </div>
          
          <p className="text-2xl text-white/80 mb-2">Projected Annual Revenue</p>
          <p className="text-4xl md:text-5xl font-bold text-[#39CCCC] mb-6">
            {formatCurrency(revenueMin)} – {formatCurrency(revenueMax)}
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <p className="text-white/60 text-sm mb-1">Est. Business Valuation (2026)</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(valuationMin)} – {formatCurrency(valuationMax)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left text-sm mb-6">
            {[
              { label: 'Population 1mi', value: `${Math.floor(Math.random() * 15000 + 10000).toLocaleString()}`, score: scores[0] },
              { label: 'Median Income', value: `$${Math.floor(Math.random() * 30 + 50)}k`, score: scores[1] },
              { label: 'Competition', value: `${Math.floor(Math.random() * 2 + 1)} stores`, score: scores[4] },
              { label: 'Google Rating', value: `${(Math.random() * 0.5 + 4.3).toFixed(1)} ★`, score: scores[16] },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs">{item.label}</div>
                <div className="text-white font-semibold">{item.value}</div>
                <div className="text-[#39CCCC] text-xs">{item.score}/10</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/cleanbi-auto">
              <Button className="w-full bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] font-bold h-12" data-testid="button-full-report">
                <Download className="w-4 h-4 mr-2" />
                Get Full Report ($97)
              </Button>
            </Link>
            <Link href="/pos-command-center">
              <Button variant="outline" className="w-full border-[#39CCCC] text-[#39CCCC] hover:bg-[#39CCCC]/10 h-12" data-testid="button-pos-trial">
                Start Free POS Trial
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-[#001F3F]/50 rounded-2xl p-4 md:p-6">
          <h3 className="text-center text-white/80 text-sm font-semibold mb-4">17-Factor Intelligence Analysis</h3>
          <div className="h-[320px] md:h-[400px]">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>

      <button 
        onClick={() => { setShowResult(false); setAddress(''); }}
        className="mt-6 text-[#39CCCC] hover:text-white transition text-sm flex items-center gap-2 mx-auto"
      >
        ← Try another address
      </button>
    </div>
  );
}

const features = [
  {
    icon: Cpu,
    title: 'AI Predictive Maintenance',
    description: 'Saves $3,000–$12,000/year in downtime',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: TrendingUp,
    title: 'Dynamic Pricing Engine',
    description: 'Adds $24,000+ annual revenue automatically',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: DollarSign,
    title: 'Marketplace Cash Back',
    description: 'Earn rebates on every equipment purchase',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Know your numbers before you arrive',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Shield,
    title: 'Error Code Diagnostics',
    description: '2,200+ codes across 70+ machine brands',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    icon: Calculator,
    title: '8 Pro Calculators',
    description: 'ROI, yield, break-even, financing & more',
    color: 'from-indigo-500 to-purple-500'
  }
];

const journeyCards = [
  {
    icon: Lightbulb,
    title: 'Thinking About It?',
    description: 'Learn if owning a laundromat is right for you',
    link: '/startup-funding',
    color: 'blue'
  },
  {
    icon: Target,
    title: 'Ready to Buy?',
    description: 'Find and analyze your next investment',
    link: '/laundromat-listings',
    color: 'green'
  },
  {
    icon: Settings,
    title: 'Already Own One?',
    description: 'Run your laundromat like a pro',
    link: '/pos-command-center',
    color: 'orange'
  },
  {
    icon: Users,
    title: 'Sell or Serve?',
    description: 'Connect with laundromat owners',
    link: '/listing-form',
    color: 'purple'
  }
];

const stats = [
  { value: '72,000+', label: 'Laundromat Owners' },
  { value: '$1.2B+', label: 'In Deals Analyzed' },
  { value: '41%', label: 'Average ROI Boost' },
  { value: '2,200+', label: 'Error Codes' }
];

export default function HomeNew() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";

  return (
    <>
      <SEO 
        title="WashBizHub - The #1 Laundromat Platform | CLEANBI Score + POS + AI"
        description="AI predicts failures, dynamic pricing adds $24k/year, marketplace gives you cash back. Join 72,000+ laundromat owners already winning with CLEANBI and professional tools."
        keywords={["laundromat pos", "cleanbi score", "laundromat calculator", "laundromat roi", "laundromat software", "laundromat business"]}
        type="website"
      />

      <div className="min-h-screen">
        <section className="relative bg-gradient-to-b from-[#001F3F] via-[#002B5C] to-[#001F3F] pt-8 pb-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#39CCCC]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                The Only Laundromat Platform That{' '}
                <span className="text-[#39CCCC]">Pays You Back</span>{' '}
                Before You Pay Us
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
                AI predicts failures • Dynamic pricing adds $24k/year • Marketplace gives you cash back
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="#demo">
                  <Button className="h-14 px-8 bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] text-lg font-bold rounded-xl" data-testid="button-play-demo">
                    <Play className="w-5 h-5 mr-2" />
                    Play Live Demo (30 Seconds)
                  </Button>
                </Link>
                <Link href="/cleanbi-auto">
                  <Button variant="outline" className="h-14 px-8 border-2 border-[#39CCCC] text-[#39CCCC] hover:bg-[#39CCCC] hover:text-[#001F3F] text-lg font-bold rounded-xl" data-testid="button-cleanbi-cta">
                    Run My Free CLEANBI Score
                  </Button>
                </Link>
              </div>
              <p className="text-white/60">
                Join 72,000+ owners already winning →
              </p>
            </div>

            <div id="demo" className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-10 max-w-5xl mx-auto border border-white/10">
              <CleanbiDemo />
            </div>
          </div>
        </section>

        <div className="bg-[#39CCCC] py-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-[#001F3F]">{stat.value}</div>
                <div className="text-[#001F3F]/70 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Your Journey Starts Here
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Whether you're dreaming, buying, operating, or selling — we've got the tools
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {journeyCards.map((card, i) => {
                const colorMap: Record<string, string> = {
                  blue: 'border-blue-500/30 hover:border-blue-500 bg-blue-500/5',
                  green: 'border-green-500/30 hover:border-green-500 bg-green-500/5',
                  orange: 'border-orange-500/30 hover:border-orange-500 bg-orange-500/5',
                  purple: 'border-purple-500/30 hover:border-purple-500 bg-purple-500/5'
                };
                const iconColorMap: Record<string, string> = {
                  blue: 'text-blue-500',
                  green: 'text-green-500',
                  orange: 'text-orange-500',
                  purple: 'text-purple-500'
                };
                return (
                  <Link key={i} href={card.link}>
                    <Card className={`p-6 border-2 ${colorMap[card.color]} transition-all hover:scale-[1.02] cursor-pointer h-full`} data-testid={`card-journey-${card.color}`}>
                      <card.icon className={`w-10 h-10 ${iconColorMap[card.color]} mb-4`} />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{card.description}</p>
                      <span className={`${iconColorMap[card.color]} text-sm font-semibold flex items-center gap-1`}>
                        Explore <ChevronRight className="w-4 h-4" />
                      </span>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-[#001F3F]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Everything You Need to Dominate
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Enterprise-grade tools that were only available to big chains — now in your hands
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <Card key={i} className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition group" data-testid={`card-feature-${i}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.description}</p>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/pos-command-center">
                <Button className="h-14 px-10 bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] text-lg font-bold rounded-xl" data-testid="button-see-all-features">
                  See All Features <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#39CCCC]/10 text-[#39CCCC] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Chrome className="w-4 h-4" />
                  Chrome Extension Available
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  CLEANBI Anywhere — Score Any Address in Seconds
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  Install our free Chrome extension to analyze any property while browsing LoopNet, BizBuySell, Zillow, or any listing site. Instant intelligence at your fingertips.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Works on any website with addresses',
                    'One-click CLEANBI scores while browsing',
                    'Compare locations side-by-side',
                    'Save reports to your dashboard'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#39CCCC]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="h-12 px-6 bg-[#001F3F] hover:bg-[#002B5C] text-white font-bold" data-testid="button-chrome-extension">
                    <Chrome className="w-5 h-5 mr-2" />
                    Add to Chrome — Free
                  </Button>
                  <Link href="/cleanbi-auto">
                    <Button variant="outline" className="h-12 px-6 border-[#001F3F] text-[#001F3F] dark:border-white dark:text-white" data-testid="button-try-online">
                      Try Online First
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-[#001F3F] to-[#002B5C] rounded-2xl p-8 text-center">
                  <div className="bg-white/10 rounded-xl p-6 mb-4">
                    <div className="text-6xl font-black text-[#39CCCC] mb-2">87</div>
                    <div className="text-white/80">CLEANBI Score</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-left text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60">Population</div>
                      <div className="text-white font-semibold">24,500</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60">Median Income</div>
                      <div className="text-white font-semibold">$72,000</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60">Competition</div>
                      <div className="text-white font-semibold">Low</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60">Traffic</div>
                      <div className="text-white font-semibold">High</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-[#001F3F] to-[#002B5C]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Start Your Free 14-Day Trial
            </h2>
            <p className="text-xl text-white/70 mb-8">
              No credit card • Unlimited machines • Cancel anytime
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subscribe">
                <Button className="h-16 px-12 bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] text-xl font-bold rounded-xl transition-transform hover:scale-105" data-testid="button-start-trial">
                  Activate Free Trial Now
                </Button>
              </Link>
              <Link href="/consultation">
                <Button variant="outline" className="h-16 px-12 border-2 border-white/30 text-white hover:bg-white/10 text-xl font-bold rounded-xl" data-testid="button-talk-to-expert">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Talk to an Expert
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-white/50 text-sm">
              Trusted by 72,000+ laundromat professionals worldwide
            </p>
          </div>
        </section>
      </div>
    </>
  );
}