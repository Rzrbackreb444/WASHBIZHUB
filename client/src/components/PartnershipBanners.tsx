import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Banknote,
  Wrench,
  TrendingUp,
  ExternalLink,
  Star
} from "lucide-react";

const AADVANTAGE_LINK = "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry";

export function FundingPartnershipBanner() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" data-testid="section-funding-partnership">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Info */}
          <div className="text-white">
            <Badge className="mb-4 bg-emerald-500/30 text-emerald-200 border-emerald-400/30">
              <Banknote className="w-3 h-3 mr-1.5" />
              Funding Partner Network
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need Financing for Your Laundromat?
            </h2>
            <p className="text-lg text-emerald-100/90 mb-6">
              Our trusted lending partners specialize in laundromat financing. From startup funding to 
              multi-million dollar acquisitions — get pre-qualified in minutes, not weeks.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <div className="font-bold text-white">$10K - $50M</div>
                  <div className="text-sm text-emerald-200/70">Funding Range</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <div className="font-bold text-white">Same-Day</div>
                  <div className="text-sm text-emerald-200/70">Pre-Approval</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2 text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>SBA 7(a) loans up to $5M with $0 guarantee fees</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Equipment financing from $5K with flexible terms</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Commercial real estate loans up to $50M</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Startup funding for first-time buyers (700+ credit)</span>
              </div>
            </div>

            <Link href="/funding">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50" data-testid="button-funding-cta">
                Explore Funding Options
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Right: Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur" data-testid="card-funding-stat-1">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">7</div>
                <div className="text-emerald-200/80 text-sm">Lending Partners</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur" data-testid="card-funding-stat-2">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-emerald-200/80 text-sm">Min Credit Score</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur" data-testid="card-funding-stat-3">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">24hr</div>
                <div className="text-emerald-200/80 text-sm">Fastest Approval</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur" data-testid="card-funding-stat-4">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">25yr</div>
                <div className="text-emerald-200/80 text-sm">Longest Terms</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EquipmentPartnershipBanner() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900" data-testid="section-equipment-partnership">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Stats */}
          <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur" data-testid="card-equipment-stat-1">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">$500K+</div>
                <div className="text-blue-200/80 text-sm">Equipment Packages</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur" data-testid="card-equipment-stat-2">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-white mb-2">TX</div>
                <div className="text-blue-200/80 text-sm">OK, LA, AR Coverage</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur col-span-2" data-testid="card-equipment-stat-3">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30">Dexter</Badge>
                  <Badge className="bg-white/20 text-white border-white/30">Continental Girbau</Badge>
                  <Badge className="bg-white/20 text-white border-white/30">Maytag</Badge>
                  <Badge className="bg-white/20 text-white border-white/30">Whirlpool</Badge>
                  <Badge className="bg-white/20 text-white border-white/30">LG</Badge>
                </div>
                <div className="text-blue-200/80 text-sm text-center mt-3">Top Brand Partners</div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Info */}
          <div className="order-1 lg:order-2 text-white">
            <Badge className="mb-4 bg-yellow-500/30 text-yellow-200 border-yellow-400/30">
              <Star className="w-3 h-3 mr-1.5" />
              Featured Partner
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need Commercial Laundry Equipment?
            </h2>
            <p className="text-lg text-blue-100/90 mb-6">
              AAdvantage Laundry Systems is the premier commercial laundry equipment distributor 
              serving Texas, Oklahoma, Louisiana, and Arkansas. Get the best equipment at competitive prices.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <div className="font-bold text-white">Full Turnkey</div>
                  <div className="text-sm text-blue-200/70">Installation & Setup</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <div className="font-bold text-white">New & Retrofit</div>
                  <div className="text-sm text-blue-200/70">All Project Types</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>Complete equipment packages for new laundromats</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>Retrofit and upgrade existing facilities</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>Parts and service support across 4 states</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>Financing options available through partners</span>
              </div>
            </div>

            <a 
              href={AADVANTAGE_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-yellow-500 text-yellow-900 hover:bg-yellow-400" data-testid="button-equipment-cta">
                Get Equipment Quote
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CombinedPartnershipSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" data-testid="section-partnerships">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 bg-accent/10 text-accent border-accent/30">
            <DollarSign className="w-3 h-3 mr-1.5" />
            Revenue Partners
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Complete Solutions for Your Laundromat
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Get the funding and equipment you need from our trusted partner network
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Funding Card */}
          <Card className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-emerald-500/30 overflow-hidden" data-testid="card-partnership-funding">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Banknote className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Funding Partners</h3>
                  <p className="text-emerald-300/80">$10K - $50M Available</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                Our 7 trusted lending partners specialize in laundromat acquisitions, 
                equipment financing, SBA loans, and commercial real estate. Pre-qualify in minutes.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">0.5-2%</div>
                  <div className="text-sm text-slate-400">Partner Rates</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">500+</div>
                  <div className="text-sm text-slate-400">Min Credit</div>
                </div>
              </div>

              <Link href="/funding">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg" data-testid="button-partnership-funding">
                  Explore Funding Options
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Equipment Card */}
          <Card className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/30 overflow-hidden" data-testid="card-partnership-equipment">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Wrench className="h-7 w-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Equipment Partner</h3>
                  <p className="text-blue-300/80">AAdvantage Laundry Systems</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                The leading commercial laundry equipment distributor serving TX, OK, LA, and AR. 
                Full turnkey solutions from $500K-$1M+ for new builds and retrofits.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">$500K+</div>
                  <div className="text-sm text-slate-400">Equipment Deals</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">4</div>
                  <div className="text-sm text-slate-400">States Covered</div>
                </div>
              </div>

              <a 
                href={AADVANTAGE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg" data-testid="button-partnership-equipment">
                  Get Equipment Quote
                  <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
