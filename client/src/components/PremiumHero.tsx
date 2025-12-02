import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@assets/big_dexter_laundromat_1764704943944.jpg";

const INDUSTRY_PARTNERS = [
  "Speed Queen",
  "Dexter Laundry", 
  "Huebsch",
  "Electrolux",
  "Maytag Commercial",
  "Alliance Laundry Systems",
  "PayRange",
  "Ecolab"
];

export function PremiumHero() {
  return (
    <section className="relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="py-20 lg:py-32 max-w-2xl">
          <p 
            className="text-sm font-bold tracking-[0.25em] text-[#b8860b] uppercase mb-6"
            style={{ fontFamily: 'var(--font-bebas)' }}
          >
            #1 Laundromat Intelligence Platform
          </p>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-800 leading-[1.15] mb-8">
            The all-in-one platform for laundromat{' '}
            <span className="text-[#1e3a5f] font-semibold">owners</span>,{' '}
            <span className="text-[#1e3a5f] font-semibold">buyers</span>, and{' '}
            <span className="text-[#1e3a5f] font-semibold">vendors</span>.
          </h1>
          
          <div className="flex flex-wrap gap-4 mb-12">
            <Link href="/templates">
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 px-6 text-base font-medium border-2 border-gray-800 hover:bg-gray-800 hover:text-white bg-white transition-all"
                data-testid="button-get-templates"
              >
                Get Free Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/funding">
              <Button 
                size="lg"
                className="h-12 px-6 text-base font-medium bg-[#1e3a5f] hover:bg-[#2a4a73] text-white shadow-lg"
                data-testid="button-start-funding"
              >
                Start Funding Application
              </Button>
            </Link>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
              Trusted By
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {INDUSTRY_PARTNERS.slice(0, 5).map((partner) => (
                <span key={partner} className="text-sm text-gray-600 font-medium">
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#b8860b]/20 to-[#1e3a5f]/10 rounded-3xl blur-2xl"
              style={{ transform: 'translate(15px, 15px)' }}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 transform rotate-[-3deg] hover:rotate-0 transition-all duration-500 w-64">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">CLEANBI Score</p>
                    <p className="text-lg font-bold text-[#1e3a5f]">Location Analysis</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Overall Grade</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-3xl font-bold text-[#22C55E]">A</span>
                      <span className="text-sm text-gray-600">Excellent</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#22C55E]">87</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Demo</p>
                    <p className="text-sm font-bold text-[#1e3a5f]">8.2</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Comp</p>
                    <p className="text-sm font-bold text-[#1e3a5f]">7.9</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Traffic</p>
                    <p className="text-sm font-bold text-[#1e3a5f]">9.1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase text-center mb-5">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {INDUSTRY_PARTNERS.map((partner) => (
              <span 
                key={partner} 
                className="text-sm font-bold text-gray-400 hover:text-[#1e3a5f] transition-colors uppercase tracking-wider cursor-pointer"
                style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.08em' }}
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
