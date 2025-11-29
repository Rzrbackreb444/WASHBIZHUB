import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chrome, ArrowRight, Download, CheckCircle, Loader2, Mail } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@assets/IMG_5796_1763738809544.jpeg";
import { LazyRadarChart } from "./LazyRadarChart";

type DemoStep = 'address' | 'analyzing' | 'results' | 'capture' | 'success';

export function Hero() {
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<DemoStep>('address');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const runDemo = () => {
    if (!address.trim()) return;
    setStep('analyzing');
    setTimeout(() => setStep('results'), 2000);
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
          score: 94,
          projectedRevenue: '$842,000 – $918,000'
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

  const radarData = {
    labels: ['Population', 'Income', 'Renters', 'Age', 'Competition', 'Traffic', 'Visibility', 'Sq Ft', 'Machines', 'Parking', 'Equip Age', 'Cleanliness', 'Pricing', 'Hours', 'Drop-Off', 'Card System', 'Reviews'],
    datasets: [{
      label: 'Your Store',
      data: [10, 9, 10, 8, 10, 9, 10, 9, 9, 8, 9, 10, 9, 10, 8, 10, 10],
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
          fetchPriority="high"
          width={1920}
          height={1080}
          data-testid="img-hero-background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/95 via-navy-900/90 to-navy-800/95" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-bebas leading-tight mb-6 text-white"
            data-testid="text-hero-title"
          >
            The Only Laundromat Platform That <span className="text-teal-400">Pays You Back</span> Before You Pay Us
          </h1>
          
          <p 
            className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto"
            data-testid="text-hero-subtitle"
          >
            AI predicts failures &bull; Dynamic pricing adds $24k/year &bull; Marketplace gives you cash back
          </p>

          <div 
            id="cleanbi" 
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 max-w-4xl mx-auto border border-teal-400/20"
            data-testid="section-cleanbi-demo"
          >
            {step === 'address' && (
              <div className="animate-in">
                <h2 className="text-3xl sm:text-4xl font-bebas mb-8 text-white">
                  Enter Any Address &rarr; See Revenue in 8 Seconds
                </h2>
                <input
                  type="text"
                  placeholder="e.g. 1234 Main St, Dallas, TX"
                  className="w-full max-w-2xl px-6 py-5 text-lg sm:text-xl text-navy-900 rounded-xl mb-6 focus:outline-none focus:ring-4 focus:ring-teal-400 bg-white"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && runDemo()}
                  data-testid="input-cleanbi-address"
                />
                <div>
                  <Button 
                    onClick={runDemo} 
                    size="lg"
                    className="bg-teal-400 hover:bg-teal-300 text-navy-900 px-10 sm:px-16 py-6 text-xl sm:text-2xl font-bold rounded-xl transition transform hover:scale-105"
                    data-testid="button-cleanbi-run-demo"
                  >
                    Run My Free CLEANBI Score
                  </Button>
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

            {step === 'results' && (
              <div className="animate-in">
                <h2 className="text-7xl sm:text-9xl font-bold text-teal-400 mb-4" data-testid="text-cleanbi-score">
                  94/100
                </h2>
                <p className="text-2xl sm:text-4xl text-gray-200 mb-2">Projected Annual Revenue</p>
                <p className="text-5xl sm:text-7xl font-bold text-teal-400 mb-6" data-testid="text-cleanbi-revenue">
                  $842,000 – $918,000
                </p>
                
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
                  <Button 
                    onClick={() => handleEmailCapture('trial')}
                    disabled={isSubmitting}
                    size="lg"
                    className="bg-teal-400 text-navy-900 px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-2xl font-bold rounded-xl hover:scale-105 transition"
                    data-testid="button-cleanbi-start-trial"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                    Start Free 14-Day Trial
                  </Button>
                  <Button 
                    onClick={() => handleEmailCapture('report')}
                    disabled={isSubmitting}
                    size="lg"
                    variant="outline"
                    className="border-4 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-navy-900 px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-2xl font-bold rounded-xl transition"
                    data-testid="button-cleanbi-full-report"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Full Report
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
            className="mt-12 text-xl text-gray-300"
            data-testid="text-hero-trust-stat"
          >
            Join 72,000+ owners already winning &rarr;
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <a 
              href="https://chrome.google.com/webstore/detail/cleanbi-anywhere" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                className="bg-teal-400 text-navy-900 hover-elevate active-elevate-2 font-semibold shadow-xl"
                data-testid="button-hero-chrome-extension"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Install Free Chrome Extension
              </Button>
            </a>
            <Link href="/pos-command-center">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover-elevate active-elevate-2 font-semibold backdrop-blur-sm"
                data-testid="button-hero-pos"
              >
                Explore POS System
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
