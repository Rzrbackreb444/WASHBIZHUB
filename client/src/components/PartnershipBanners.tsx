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
  Star,
  Handshake
} from "lucide-react";

const AADVANTAGE_LINK = "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry";

export function FundingPartnershipBanner() {
  return (
    <section className="py-12 md:py-16 bg-[#0A1628]" data-testid="section-funding-partnership">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
              <Banknote className="w-3 h-3 mr-1.5" />
              Funding Partner Network
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need Financing for Your Laundromat?
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Our trusted lending partners specialize in laundromat financing. From startup funding to 
              multi-million dollar acquisitions — get pre-qualified in minutes, not weeks.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <div className="font-bold text-white">$10K - $50M</div>
                  <div className="text-sm text-gray-400">Funding Range</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <div className="font-bold text-white">Same-Day</div>
                  <div className="text-sm text-gray-400">Pre-Approval</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#C8A661] flex-shrink-0" />
                <span>SBA 7(a) loans up to $5M with $0 guarantee fees</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#C8A661] flex-shrink-0" />
                <span>Equipment financing from $5K with flexible terms</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#C8A661] flex-shrink-0" />
                <span>Commercial real estate loans up to $50M</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#C8A661] flex-shrink-0" />
                <span>Startup funding for first-time buyers (700+ credit)</span>
              </div>
            </div>

            <Link href="/funding">
              <Button size="lg" className="bg-[#C8A661] text-[#0A1628] hover:bg-[#B8964F]" data-testid="button-funding-cta">
                Explore Funding Options
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10" data-testid="card-funding-stat-1">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-[#C8A661] mb-2">7</div>
                <div className="text-gray-400 text-sm">Lending Partners</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10" data-testid="card-funding-stat-2">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-[#C8A661] mb-2">500+</div>
                <div className="text-gray-400 text-sm">Min Credit Score</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10" data-testid="card-funding-stat-3">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-[#C8A661] mb-2">24hr</div>
                <div className="text-gray-400 text-sm">Fastest Approval</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10" data-testid="card-funding-stat-4">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-[#C8A661] mb-2">25yr</div>
                <div className="text-gray-400 text-sm">Longest Terms</div>
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
    <section className="py-12 md:py-16 bg-[#0A1628]" data-testid="section-equipment-partnership">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10" data-testid="card-equipment-stat-1">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-[#C8A661] mb-2">$500K+</div>
                <div className="text-gray-400 text-sm">Equipment Packages</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10" data-testid="card-equipment-stat-2">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-[#C8A661] mb-2">TX</div>
                <div className="text-gray-400 text-sm">OK, LA, AR Coverage</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 col-span-2" data-testid="card-equipment-stat-3">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Badge variant="outline" className="text-white border-white/30">Dexter</Badge>
                  <Badge variant="outline" className="text-white border-white/30">Continental Girbau</Badge>
                  <Badge variant="outline" className="text-white border-white/30">Maytag</Badge>
                  <Badge variant="outline" className="text-white border-white/30">Whirlpool</Badge>
                  <Badge variant="outline" className="text-white border-white/30">LG</Badge>
                </div>
                <div className="text-gray-400 text-sm text-center mt-3">Top Brand Partners</div>
              </CardContent>
            </Card>
          </div>

          <div className="order-1 lg:order-2 text-white">
            <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
              <Star className="w-3 h-3 mr-1.5" />
              Featured Partner
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need Commercial Laundry Equipment?
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              AAdvantage Laundry Systems is the premier commercial laundry equipment distributor 
              serving Texas, Oklahoma, Louisiana, and Arkansas. Get the best equipment at competitive prices.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <div className="font-bold text-white">Full Turnkey</div>
                  <div className="text-sm text-gray-400">Installation & Setup</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <div className="font-bold text-white">New & Retrofit</div>
                  <div className="text-sm text-gray-400">All Project Types</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#C8A661] flex-shrink-0" />
                <span>Complete equipment packages for new laundromats</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#C8A661] flex-shrink-0" />
                <span>Retrofit and upgrade existing facilities</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#C8A661] flex-shrink-0" />
                <span>Parts and service support across 4 states</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="w-5 h-5 text-[#C8A661] flex-shrink-0" />
                <span>Financing options available through partners</span>
              </div>
            </div>

            <a 
              href={AADVANTAGE_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-[#C8A661] text-[#0A1628] hover:bg-[#B8964F]" data-testid="button-equipment-cta">
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
    <section className="py-20 bg-muted/30" data-testid="section-partnerships">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 border-[#C8A661]/40 text-[#C8A661]">
            <Handshake className="w-3 h-3 mr-1.5" />
            Trusted Partners
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Complete Solutions for Your Laundromat
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get the funding and equipment you need from our trusted partner network
          </p>
        </div>

        {/* Partner Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Funding Partners Card */}
          <Card className="bg-card border shadow-sm overflow-hidden" data-testid="card-partnership-funding">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                  <Banknote className="h-6 w-6 text-[#C8A661]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Funding Partners</h3>
                  <p className="text-sm text-muted-foreground">$10K - $50M Available</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our 7 trusted lending partners specialize in laundromat acquisitions, 
                equipment financing, SBA loans, and commercial real estate. Pre-qualify in minutes.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#C8A661]">0.5-2%</div>
                  <div className="text-xs text-muted-foreground mt-1">Partner Rates</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#C8A661]">500+</div>
                  <div className="text-xs text-muted-foreground mt-1">Min Credit</div>
                </div>
              </div>

              <Link href="/funding">
                <Button className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white" size="lg" data-testid="button-partnership-funding">
                  Explore Funding Options
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Equipment Partner Card */}
          <Card className="bg-card border shadow-sm overflow-hidden" data-testid="card-partnership-equipment">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-6 w-6 text-[#C8A661]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Equipment Partner</h3>
                  <p className="text-sm text-muted-foreground">AAdvantage Laundry Systems</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                The leading commercial laundry equipment distributor serving TX, OK, LA, and AR. 
                Full turnkey solutions from $500K-$1M+ for new builds and retrofits.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#C8A661]">$500K+</div>
                  <div className="text-xs text-muted-foreground mt-1">Equipment Deals</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#C8A661]">4</div>
                  <div className="text-xs text-muted-foreground mt-1">States Covered</div>
                </div>
              </div>

              <a 
                href={AADVANTAGE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]" size="lg" data-testid="button-partnership-equipment">
                  Get Equipment Quote
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
