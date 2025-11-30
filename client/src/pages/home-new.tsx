import { useState, lazy, Suspense } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SEO } from '@/components/SEO';
import { 
  Play, Download, Shield, TrendingUp, 
  CheckCircle, ArrowRight, Sparkles,
  DollarSign, BarChart3, Cpu, Calculator,
  MessageCircle, MapPin, Award, Store
} from 'lucide-react';

const VideoDemo = lazy(() => import('@/components/VideoDemo').then(m => ({ default: m.VideoDemo })));
const FloatingCTA = lazy(() => import('@/components/EmailCaptureModal').then(m => ({ default: m.FloatingCTA })));
const LazyCleanbiDemo = lazy(() => import('@/components/LazyCleanbiDemo'));

function CleanbiDemoFallback() {
  return (
    <div className="text-center">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        Enter Any Address → See Revenue in 8 Seconds
      </h2>
      <p className="text-white/70 text-lg mb-8">
        Free CLEANBI Score • No email required • Works for any business
      </p>
      <div className="max-w-2xl mx-auto">
        <div className="h-16 bg-white/10 rounded-xl mb-4 animate-pulse" />
        <div className="h-16 bg-[#39CCCC]/50 rounded-xl animate-pulse" />
      </div>
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

const solutionCards = [
  {
    title: 'Evaluate an Investment',
    subtitle: 'Before You Buy',
    metrics: ['17-factor CLEANBI scoring', '220+ countries supported', '5-min due diligence reports'],
    cta: 'Run Free Analysis',
    link: '/cleanbi-auto',
    featured: true
  },
  {
    title: 'Operate & Optimize',
    subtitle: 'For Current Owners',
    metrics: ['AI predictive maintenance', 'Dynamic pricing engine', 'Real-time POS analytics'],
    cta: 'Try Limited Demo',
    link: '/pos-command-center',
    featured: false
  },
  {
    title: 'Buy or Sell',
    subtitle: 'Marketplace',
    metrics: ['Active laundromat listings', 'Verified buyer network', 'Financing connections'],
    cta: 'Browse Listings',
    link: '/laundromat-listings',
    featured: false
  },
  {
    title: 'Grow Your Business',
    subtitle: 'For Vendors & Partners',
    metrics: ['72,000+ owner audience', 'Featured directory listings', 'Lead generation tools'],
    cta: 'Partner With Us',
    link: '/directory',
    featured: false
  }
];

const stats = [
  { value: '72,000+', label: 'Community Members' },
  { value: '220+', label: 'Countries Covered' },
  { value: '80+', label: 'Calculators & Tools' },
  { value: '2,200+', label: 'Error Codes' }
];

export default function HomeNew() {
  const [showVideoDemo, setShowVideoDemo] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://washbizhub.com";

  return (
    <>
      <Suspense fallback={null}>
        <VideoDemo isOpen={showVideoDemo} onClose={() => setShowVideoDemo(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingCTA />
      </Suspense>
      <SEO 
        title="WashBizHub - The #1 Laundromat Platform | CLEANBI Score + POS + AI"
        description="AI predicts failures, dynamic pricing adds $24k/year, marketplace gives you cash back. Join 72,000+ laundromat owners already winning with CLEANBI and professional tools."
        keywords={["laundromat pos", "cleanbi score", "laundromat calculator", "laundromat roi", "laundromat software", "laundromat business"]}
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
                <Button 
                  className="h-14 px-8 bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F] text-lg font-bold rounded-xl" 
                  data-testid="button-play-demo"
                  onClick={() => setShowVideoDemo(true)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play Live Demo (30 Seconds)
                </Button>
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
              <Suspense fallback={<CleanbiDemoFallback />}>
                <LazyCleanbiDemo />
              </Suspense>
            </div>
          </div>
        </section>

        <div className="bg-[#39CCCC] py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#001F3F]">{stat.value}</div>
                <div className="text-[#001F3F]/70 text-xs sm:text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <section className="py-16 md:py-20 bg-[#001F3F]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[#b8860b] font-semibold text-sm tracking-wider uppercase mb-3">Platform Solutions</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Solutions by Outcome
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Enterprise-grade intelligence for every stage of the laundromat business lifecycle
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {solutionCards.map((card, i) => (
                <div 
                  key={i} 
                  className={`relative bg-white/5 backdrop-blur border rounded-xl p-6 transition-all hover:bg-white/10 ${
                    card.featured 
                      ? 'border-[#b8860b]/50 ring-1 ring-[#b8860b]/20' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  data-testid={`card-solution-${i}`}
                >
                  {card.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#b8860b] text-[#001F3F] text-xs font-bold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <p className="text-[#39CCCC] text-xs font-semibold uppercase tracking-wider mb-2">{card.subtitle}</p>
                  <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                  <ul className="space-y-2 mb-6">
                    {card.metrics.map((metric, j) => (
                      <li key={j} className="flex items-start gap-2 text-white/70 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#39CCCC] mt-0.5 flex-shrink-0" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                  <Link href={card.link}>
                    <Button 
                      className={`w-full ${
                        card.featured 
                          ? 'bg-[#b8860b] hover:bg-[#9a7209] text-white' 
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                      data-testid={`button-solution-${i}`}
                    >
                      {card.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ))}
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

        {/* CLEANBI Analysis Section - Simplified until Chrome Extension approved */}
        <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#39CCCC]/10 text-[#39CCCC] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <MapPin className="w-4 h-4" />
                  Location Intelligence
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  CLEANBI — Score Any Address in Seconds
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  Get instant location intelligence for any address. Analyze demographics, competition, traffic patterns, and market potential before you invest.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Demographic & income analysis',
                    'Competition mapping within radius',
                    'Traffic and visibility scoring',
                    'Market potential assessment'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#39CCCC]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link href="/cleanbi-auto" className="w-full sm:w-auto">
                    <Button className="w-full h-12 px-6 bg-[#001F3F] hover:bg-[#002B5C] text-white font-bold" data-testid="button-try-cleanbi">
                      <MapPin className="w-5 h-5 mr-2" />
                      Try CLEANBI Free
                    </Button>
                  </Link>
                  <Link href="/cleanbi" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full h-12 px-6 border-[#001F3F] text-[#001F3F] dark:border-white dark:text-white" data-testid="button-learn-more-cleanbi">
                      Learn More
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

        {/* Featured Expert: Larry Larsen */}
        <section className="py-16 md:py-20 bg-[#001F3F]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-[#b8860b] font-semibold text-sm tracking-wider uppercase mb-3">Industry Partner</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Work With a Proven Expert
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Get personalized guidance from one of the most experienced professionals in the laundromat industry
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-white/5 to-[#b8860b]/10 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8 hover:border-[#b8860b]/30 transition-all" data-testid="card-featured-expert">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex-shrink-0 text-center lg:text-left">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#b8860b] to-[#8B6914] flex items-center justify-center mx-auto lg:mx-0 mb-4">
                    <span className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>LL</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[#b8860b]/20 text-[#b8860b] px-3 py-1 rounded-full text-sm font-semibold">
                    <Award className="w-4 h-4" />
                    50+ Years Experience
                  </div>
                </div>
                
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Larry "Laundromat Larry" Larsen
                  </h3>
                  <p className="text-[#39CCCC] font-semibold mb-4">
                    WashBizHub Featured Consultant • 50+ Years Experience
                  </p>
                  <p className="text-white/70 mb-6 max-w-2xl">
                    With over five decades in the laundromat industry, Larry provides expert guidance on due diligence, store acquisitions, 
                    equipment evaluation, lease analysis, and insurance. Based in Orange County, California, he's helped hundreds of 
                    owners make smarter business decisions. Book through WashBizHub for priority scheduling.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                      'Due Diligence',
                      'Buyer Consulting',
                      'Store Design',
                      'Lease Analysis',
                      'Equipment Evaluation',
                      'Insurance Education',
                      'Expert Witness',
                      'Broker Services'
                    ].map((service, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#39CCCC] flex-shrink-0" />
                        {service}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link href="/consultation">
                      <Button className="w-full sm:w-auto h-12 px-6 bg-[#b8860b] hover:bg-[#9a7209] text-white font-bold" data-testid="button-book-larry-consultation">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Book Free Consultation
                      </Button>
                    </Link>
                    <Link href="/consultation-landing">
                      <Button variant="outline" className="w-full sm:w-auto h-12 px-6 border-[#39CCCC] text-[#39CCCC] hover:bg-[#39CCCC]/10" data-testid="button-view-services">
                        View All Services
                      </Button>
                    </Link>
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