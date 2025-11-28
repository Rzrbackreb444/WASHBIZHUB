import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chrome, ArrowRight, Download } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/IMG_5796_1763738809544.jpeg";
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

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export function Hero() {
  const [address, setAddress] = useState('');
  const [showCleanbi, setShowCleanbi] = useState(false);

  const runDemo = () => address.trim() && setShowCleanbi(true);

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
            {!showCleanbi ? (
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
            ) : (
              <div className="animate-in">
                <h2 className="text-7xl sm:text-9xl font-bold text-teal-400 mb-4" data-testid="text-cleanbi-score">
                  94/100
                </h2>
                <p className="text-2xl sm:text-4xl text-gray-200 mb-2">Projected Annual Revenue</p>
                <p className="text-5xl sm:text-7xl font-bold text-teal-400 mb-8" data-testid="text-cleanbi-revenue">
                  $842,000 – $918,000
                </p>
                <div className="bg-navy-900/50 rounded-3xl p-4 sm:p-8 mb-8">
                  <div className="max-w-lg mx-auto">
                    <Radar data={radarData} options={radarOptions} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
                  <Link href="/trial">
                    <Button 
                      size="lg"
                      className="bg-teal-400 text-navy-900 px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-2xl font-bold rounded-xl hover:scale-105 transition"
                      data-testid="button-cleanbi-start-trial"
                    >
                      Start Free 14-Day Trial
                    </Button>
                  </Link>
                  <Link href="/cleanbi">
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-4 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-navy-900 px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-2xl font-bold rounded-xl transition"
                      data-testid="button-cleanbi-full-report"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Full Report
                    </Button>
                  </Link>
                </div>
                <button 
                  onClick={() => setShowCleanbi(false)}
                  className="mt-6 text-gray-400 hover:text-white text-sm underline"
                  data-testid="button-cleanbi-try-another"
                >
                  Try another address
                </button>
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
