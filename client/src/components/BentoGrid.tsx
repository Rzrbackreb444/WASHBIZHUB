import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Target, ShoppingBag, Calculator, ArrowRight, Search, 
  Calendar, Star, Phone, Award, Clock
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

  const centerX = 50;
  const centerY = 50;
  const maxRadius = 42;

  const pathData = points.map((point, i) => {
    const angleRad = (point.angle - 90) * (Math.PI / 180);
    const radius = (point.value / 100) * maxRadius;
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 100 100" className="w-20 h-20 opacity-80">
      {[0.25, 0.5, 0.75, 1].map((scale, i) => (
        <polygon
          key={i}
          points={points.map(p => {
            const angleRad = (p.angle - 90) * (Math.PI / 180);
            const r = maxRadius * scale;
            return `${centerX + r * Math.cos(angleRad)},${centerY + r * Math.sin(angleRad)}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(212,175,55,0.15)"
          strokeWidth="0.5"
        />
      ))}
      <path
        d={pathData}
        fill="rgba(212,175,55,0.2)"
        stroke="#d4af37"
        strokeWidth="1.5"
      />
      {points.map((point, i) => {
        const angleRad = (point.angle - 90) * (Math.PI / 180);
        const radius = (point.value / 100) * maxRadius;
        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY + radius * Math.sin(angleRad);
        return (
          <circle key={i} cx={x} cy={y} r="3" fill="#d4af37" />
        );
      })}
    </svg>
  );
}

export function BentoGrid() {
  const [, navigate] = useLocation();
  const [address, setAddress] = useState("");

  const handleCleanbiNavigate = () => {
    const url = address ? `/cleanbi-explorer?address=${encodeURIComponent(address)}` : '/cleanbi-explorer';
    navigate(url);
  };

  return (
    <section className="py-16 md:py-20" style={{ background: '#09090b' }} data-testid="section-bento-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}>
            POWERFUL TOOLS FOR YOUR JOURNEY
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Expert analysis, marketplace access, and 1-on-1 consultation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          
          {/* Tile 1: Larry Larsen Expert Spotlight (Largest - 2 cols on lg) */}
          <div 
            className="md:col-span-2 lg:col-span-2 lg:row-span-2 relative min-h-[320px] lg:min-h-[400px] rounded-2xl overflow-hidden group cursor-pointer"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(212,175,55,0.3)'
            }}
            data-testid="tile-larry-consultation"
            onClick={() => navigate('/consultation')}
          >
            {/* Gold gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#d4af37]/10 to-transparent" />
            
            <div className="relative z-10 p-6 lg:p-8 h-full flex flex-col">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40">
                  <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider">Expert Consultation</span>
                </div>
                <div className="px-2 py-1 rounded-full bg-white/10">
                  <span className="text-xs font-medium text-white/60">High-Ticket</span>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                {/* Larry's Profile */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-[#d4af37]/30 to-[#d4af37]/10 border-2 border-[#d4af37]/40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl lg:text-5xl font-bold text-[#d4af37]" style={{ fontFamily: 'var(--font-bebas)' }}>LL</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2" data-testid="text-larry-title">
                    Larry Larsen
                  </h3>
                  <p className="text-[#d4af37] font-semibold text-sm mb-3 uppercase tracking-wide">
                    50+ Years Industry Experience
                  </p>
                  <p className="text-white/60 text-sm lg:text-base mb-6 max-w-md">
                    Direct 1-on-1 strategy sessions with the laundromat industry's most trusted expert. 
                    Get actionable insights for acquisitions, operations, and exit strategies.
                  </p>
                  
                  {/* Credentials */}
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                    {[
                      { icon: Award, label: "Industry Pioneer" },
                      { icon: Star, label: "5,000+ Consultations" },
                      { icon: Clock, label: "Available This Week" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <item.icon className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span className="text-xs text-white/70">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="bg-[#d4af37] hover:bg-[#c49f2f] text-black font-semibold"
                    onClick={(e) => { e.stopPropagation(); navigate('/consultation'); }}
                    data-testid="button-book-consultation"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Strategy Session
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
              
              {/* Session Types Preview */}
              <div className="mt-auto pt-6 border-t border-white/10">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Phone", price: "$149", time: "30 min" },
                    { label: "Video", price: "$249", time: "45 min" },
                    { label: "VIP Day", price: "$1,997", time: "4 hrs" },
                  ].map((session, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/5">
                      <p className="text-xs text-white/50 mb-1">{session.label}</p>
                      <p className="text-lg font-bold text-white">{session.price}</p>
                      <p className="text-[10px] text-[#d4af37]">{session.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Hover arrow */}
            <div className="absolute bottom-6 right-6 flex items-center gap-1 text-white/40 text-sm group-hover:text-[#d4af37] transition-colors">
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Tile 2: CLEANBI Explorer */}
          <div 
            className="relative min-h-[220px] rounded-2xl overflow-hidden group cursor-pointer"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(212,175,55,0.2)'
            }}
            data-testid="tile-cleanbi"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('input, button')) return;
              navigate('/cleanbi-explorer');
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#d4af37]" />
                </div>
                <RadarChartPreview />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1" data-testid="text-cleanbi-title">
                CLEANBI Explorer
              </h3>
              <p className="text-white/50 text-sm mb-4 flex-1">
                17-factor location scoring algorithm
              </p>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="text"
                    placeholder="Enter address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCleanbiNavigate()}
                    className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/30 rounded-lg text-sm h-9"
                    data-testid="input-cleanbi-address"
                  />
                </div>
                <Button 
                  size="sm"
                  onClick={handleCleanbiNavigate}
                  className="bg-[#d4af37] text-black h-9"
                  data-testid="button-cleanbi-analyze"
                >
                  Score
                </Button>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/30 text-xs group-hover:text-[#d4af37] transition-colors">
              <span>Analyze</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Tile 3: Marketplace */}
          <div 
            className="relative min-h-[180px] rounded-2xl overflow-hidden group cursor-pointer"
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(212,175,55,0.2)'
            }}
            data-testid="tile-marketplace"
            onClick={() => navigate('/marketplace')}
          >
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#d4af37]/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1" data-testid="text-marketplace-title">
                Marketplace
              </h3>
              <p className="text-white/50 text-sm mb-3 flex-1">
                Browse laundromats for sale nationwide
              </p>
              
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#d4af37]">250+</span>
                <span className="text-sm text-white/40">Active Listings</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/30 text-xs group-hover:text-[#d4af37] transition-colors">
              <span>Browse</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Tile 4: Calculator Suite */}
          <div 
            className="relative min-h-[180px] rounded-2xl overflow-hidden group cursor-pointer"
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(212,175,55,0.2)'
            }}
            data-testid="tile-calculators"
            onClick={() => navigate('/calculators')}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#d4af37]/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-[#d4af37]" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1" data-testid="text-calculators-title">
                Calculator Suite
              </h3>
              <p className="text-white/50 text-sm mb-3 flex-1">
                Valuation, ROI, WDF profitability & more
              </p>
              
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#d4af37]">50+</span>
                <span className="text-sm text-white/40">Pro Tools</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/30 text-xs group-hover:text-[#d4af37] transition-colors">
              <span>Calculate</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
