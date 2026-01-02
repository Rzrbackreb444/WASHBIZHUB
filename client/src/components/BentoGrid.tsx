import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Radar, TrendingUp, DollarSign, BookOpen, 
  ArrowRight, Search, Sparkles, GraduationCap
} from "lucide-react";

function RadarChartPreview() {
  const points = [
    { angle: 0, value: 85 },
    { angle: 60, value: 72 },
    { angle: 120, value: 91 },
    { angle: 180, value: 68 },
    { angle: 240, value: 88 },
    { angle: 300, value: 76 },
  ];

  const centerX = 60;
  const centerY = 60;
  const maxRadius = 50;

  const pathData = points.map((point, i) => {
    const angleRad = (point.angle - 90) * (Math.PI / 180);
    const radius = (point.value / 100) * maxRadius;
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24 opacity-80">
      {[0.25, 0.5, 0.75, 1].map((scale, i) => (
        <polygon
          key={i}
          points={points.map(p => {
            const angleRad = (p.angle - 90) * (Math.PI / 180);
            const r = maxRadius * scale;
            return `${centerX + r * Math.cos(angleRad)},${centerY + r * Math.sin(angleRad)}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(200,166,97,0.2)"
          strokeWidth="1"
        />
      ))}
      <path
        d={pathData}
        fill="rgba(200,166,97,0.3)"
        stroke="#C8A661"
        strokeWidth="2"
      />
      {points.map((point, i) => {
        const angleRad = (point.angle - 90) * (Math.PI / 180);
        const radius = (point.value / 100) * maxRadius;
        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY + radius * Math.sin(angleRad);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="#C8A661"
          />
        );
      })}
    </svg>
  );
}

export function BentoGrid() {
  const [, navigate] = useLocation();
  const [address, setAddress] = useState("");
  const [roiValue, setRoiValue] = useState([65]);

  const handleCleanbiNavigate = () => {
    const url = address ? `/cleanbi-explorer?address=${encodeURIComponent(address)}` : '/cleanbi-explorer';
    navigate(url);
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-[#0A1628] to-[#050a14]" data-testid="section-bento-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          
          {/* Tile 1: CLEANBI Intelligence Explorer (Large/2-cols) */}
          <div 
            className="md:col-span-2 lg:col-span-2 relative min-h-[280px] rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 p-6 lg:p-8 overflow-hidden group hover-elevate transition-all duration-300 cursor-pointer"
            data-testid="tile-cleanbi"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('input, button')) return;
              navigate('/cleanbi-explorer');
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#C8A661]/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-6 h-full">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C8A661]/20 border border-[#C8A661]/30 flex items-center justify-center">
                    <Radar className="w-5 h-5 text-[#C8A661]" />
                  </div>
                  <span className="text-xs font-semibold text-[#C8A661] uppercase tracking-wider">Location Intelligence</span>
                </div>
                
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2" data-testid="text-cleanbi-title">
                  CLEANBI Intelligence Explorer
                </h3>
                <p className="text-white/60 text-sm lg:text-base mb-6">
                  17-factor scoring algorithm for demographics, competition, and traffic analysis
                </p>
                
                <div className="flex gap-2 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      type="text"
                      placeholder="Analyze Any Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCleanbiNavigate()}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                      data-testid="input-cleanbi-address"
                    />
                  </div>
                  <Button 
                    onClick={handleCleanbiNavigate}
                    className="bg-[#C8A661] text-[#0A1628]"
                    data-testid="button-cleanbi-analyze"
                  >
                    Score
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center lg:pr-4">
                <RadarChartPreview />
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/40 text-sm group-hover:text-[#C8A661] transition-colors">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tile 2: WDF Margin Master (Medium) */}
          <div 
            className="relative min-h-[280px] rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 p-6 overflow-hidden group hover-elevate transition-all duration-300 cursor-pointer"
            data-testid="tile-margin-master"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('[role="slider"]')) return;
              navigate('/wdf-margin-master');
            }}
          >
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Profitability</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2" data-testid="text-margin-title">
                WDF Margin Master
              </h3>
              <p className="text-white/60 text-sm mb-4 flex-1">
                Real-time ROI optimization for wash-dry-fold operations
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">ROI Preview</span>
                  <span className="text-cyan-400 font-bold">{roiValue[0]}%</span>
                </div>
                <Slider
                  value={roiValue}
                  onValueChange={setRoiValue}
                  min={20}
                  max={100}
                  step={1}
                  className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400"
                  data-testid="slider-roi"
                />
              </div>
              
              <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/40 text-sm group-hover:text-cyan-400 transition-colors">
                <span>Calculate</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Tile 3: Funding Wizard (Small) */}
          <div 
            className="relative min-h-[200px] rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 p-6 overflow-hidden group hover-elevate transition-all duration-300 cursor-pointer"
            data-testid="tile-funding"
            onClick={() => navigate('/funding-wizard')}
          >
            <div className="absolute top-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2" data-testid="text-funding-title">
                Funding Wizard
              </h3>
              
              <div className="flex-1 flex items-center">
                <p className="text-3xl font-bold text-green-400">
                  Up to $750K
                </p>
              </div>
              
              <p className="text-white/50 text-sm">Match with 7+ lenders instantly</p>
              
              <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/40 text-sm group-hover:text-green-400 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Tile 4: Academy & Bible (Small) */}
          <div 
            className="relative min-h-[200px] rounded-3xl backdrop-blur-md bg-white/10 border border-white/20 p-6 overflow-hidden group hover-elevate transition-all duration-300 cursor-pointer"
            data-testid="tile-academy"
            onClick={() => navigate('/laundromat-bible')}
          >
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2" data-testid="text-academy-title">
                Academy & Bible
              </h3>
              
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Chapter of the Month</span>
                </div>
              </div>
              
              <p className="text-white/50 text-sm mt-2">Master the laundromat business</p>
              
              <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/40 text-sm group-hover:text-purple-400 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* View Full Pro Suite Link */}
        <div className="text-center mt-10">
          <button 
            onClick={() => navigate('/calculators')}
            className="inline-flex items-center text-white/60 hover:text-[#C8A661] font-medium text-sm transition-colors duration-200 group"
            data-testid="link-pro-suite"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            View Full Pro Suite
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
