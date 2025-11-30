import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { MapPin, TrendingUp, Users, Building2, ArrowRight, Star } from "lucide-react";

interface MarketScore {
  city: string;
  state: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'Needs Work';
  opportunity: string;
  population: string;
  medianIncome: string;
  competition: string;
  highlight: string;
  image: string;
}

const GRADE_COLORS = {
  'A': { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', glow: 'shadow-green-500/20' },
  'B': { bg: 'bg-lime-500', text: 'text-lime-500', border: 'border-lime-500', glow: 'shadow-lime-500/20' },
  'C': { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', glow: 'shadow-amber-500/20' },
  'Needs Work': { bg: 'bg-yellow-600', text: 'text-yellow-600', border: 'border-yellow-600', glow: 'shadow-yellow-600/20' }
};

const FEATURED_MARKETS: MarketScore[] = [
  {
    city: "Las Vegas",
    state: "NV",
    score: 94,
    grade: 'A',
    opportunity: "Gold Mine Zone",
    population: "2.3M",
    medianIncome: "$62,000",
    competition: "Low",
    highlight: "24/7 demand from tourism & hospitality workers",
    image: "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=250&fit=crop"
  },
  {
    city: "Miami Beach",
    state: "FL",
    score: 89,
    grade: 'A',
    opportunity: "High Opportunity",
    population: "92K",
    medianIncome: "$58,000",
    competition: "Moderate",
    highlight: "Strong renter population & tourist traffic",
    image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=400&h=250&fit=crop"
  },
  {
    city: "Phoenix",
    state: "AZ",
    score: 76,
    grade: 'B',
    opportunity: "Good Potential",
    population: "1.6M",
    medianIncome: "$54,000",
    competition: "High",
    highlight: "Rapid population growth & new developments",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop"
  },
  {
    city: "Austin",
    state: "TX",
    score: 82,
    grade: 'B',
    opportunity: "Good Potential",
    population: "1.0M",
    medianIncome: "$71,000",
    competition: "Moderate",
    highlight: "Tech hub with high-density apartment living",
    image: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=400&h=250&fit=crop"
  },
];

export function FeaturedMarketScores() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black" data-testid="section-featured-markets">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-teal-500/20 text-teal-400 border-teal-500/30">
            <Star className="w-3 h-3 mr-1" />
            Featured Markets
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Top CLEANBI™ Markets Right Now
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Real-time market intelligence from our proprietary scoring algorithm. 
            These locations are showing exceptional opportunity for laundromat investment.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_MARKETS.map((market, idx) => {
            const gradeStyle = GRADE_COLORS[market.grade];
            return (
              <Card 
                key={idx}
                className={`relative overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all group ${gradeStyle.glow} shadow-xl`}
                data-testid={`card-market-${idx}`}
              >
                <div className="relative h-32 overflow-hidden">
                  <img 
                    src={market.image}
                    alt={`${market.city}, ${market.state}`}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <div className={`${gradeStyle.bg} text-white text-lg font-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg`}>
                      {market.grade === 'Needs Work' ? 'NW' : market.grade}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-white font-bold text-lg">
                      {market.city}, {market.state}
                    </h3>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wider">Score</p>
                      <p className={`text-2xl font-black ${gradeStyle.text}`}>
                        {market.score}/100
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs uppercase tracking-wider">Opportunity</p>
                      <p className={`font-semibold ${gradeStyle.text}`}>
                        {market.opportunity}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-3 bg-white/5 rounded-lg">
                    <div>
                      <Users className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                      <p className="text-white text-xs font-semibold">{market.population}</p>
                      <p className="text-white/40 text-[10px]">Pop.</p>
                    </div>
                    <div>
                      <TrendingUp className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                      <p className="text-white text-xs font-semibold">{market.medianIncome}</p>
                      <p className="text-white/40 text-[10px]">Income</p>
                    </div>
                    <div>
                      <Building2 className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                      <p className="text-white text-xs font-semibold">{market.competition}</p>
                      <p className="text-white/40 text-[10px]">Comp.</p>
                    </div>
                  </div>

                  <p className="text-white/70 text-sm">
                    {market.highlight}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/cleanbi-explorer">
            <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-white font-bold" data-testid="button-explore-all-markets">
              <MapPin className="mr-2 w-5 h-5" />
              Explore Any Market
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
