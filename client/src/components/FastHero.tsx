import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, DollarSign, Users, Star, CheckCircle } from "lucide-react";
import heroImage from "@assets/big_dexter_laundromat_1765733391377.jpg";

export function FastHero() {
  return (
    <section 
      className="relative overflow-hidden min-h-[85vh] flex items-center"
      aria-label="CLEANBI Location Intelligence Platform"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/85 to-[#0A1628]/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/90 via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <div className="mb-6">
              <span 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8A661]/20 border border-[#C8A661]/30 text-[#C8A661] text-sm font-semibold"
                data-testid="badge-hero-tagline"
              >
                <Star className="w-4 h-4 fill-current" />
                #1 Laundromat Intelligence Platform
              </span>
            </div>
            
            <h1 
              className="text-white leading-tight mb-6"
              style={{ fontFamily: 'var(--font-bebas)' }}
              data-testid="heading-hero-title"
            >
              <span className="block text-5xl sm:text-6xl lg:text-7xl tracking-tight">
                SCORE ANY LOCATION
              </span>
              <span className="block text-3xl sm:text-4xl text-[#C8A661] tracking-wide mt-2">
                IN 60 SECONDS
              </span>
            </h1>
            
            <p 
              className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8"
              data-testid="text-hero-description"
            >
              CLEANBI analyzes demographics, competition, and 50+ data points 
              to give you an investment-grade location score. Used by 73,000+ 
              laundromat professionals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/cleanbi-explorer">
                <Button 
                  size="lg" 
                  className="bg-[#C8A661] hover:bg-[#B8965A] text-[#0A1628] font-bold text-lg px-8 py-6 w-full sm:w-auto"
                  data-testid="button-hero-cta"
                >
                  Try CLEANBI Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 w-full sm:w-auto"
                  data-testid="button-hero-secondary"
                >
                  View All Tools
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#C8A661]" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#C8A661]" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#C8A661]" />
                <span>Instant results</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-[#0A1628]/80 border border-[#C8A661]/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">CLEANBI Score</h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  Grade A
                </span>
              </div>
              
              <div className="text-center py-6">
                <div className="text-6xl font-bold text-[#C8A661] mb-2">87</div>
                <div className="text-white/60 text-sm">Excellent Investment Opportunity</div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Demographics
                  </span>
                  <span className="text-green-400 font-medium">92/100</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Competition
                  </span>
                  <span className="text-green-400 font-medium">85/100</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Revenue Potential
                  </span>
                  <span className="text-[#C8A661] font-medium">88/100</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-white/50 text-xs">
                  Sample analysis • Your location will vary
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
