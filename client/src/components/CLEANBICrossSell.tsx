import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Wrench, 
  ArrowRight, 
  CheckCircle2,
  Banknote,
  ExternalLink,
  Zap,
  TrendingUp
} from "lucide-react";

const AADVANTAGE_LINK = "https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry";

interface CLEANBICrossSellProps {
  score?: number;
  grade?: string;
  address?: string;
}

export function CLEANBICrossSell({ score, grade, address }: CLEANBICrossSellProps) {
  const isGoodScore = score && score >= 55;
  
  return (
    <div className="mt-6 space-y-4" data-testid="section-cleanbi-cross-sell">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">Ready for Next Steps?</h3>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Funding CTA */}
        <Card className="bg-gradient-to-br from-[#b8860b]/30 to-[#8B7355]/30 border-[#b8860b]/40" data-testid="card-cross-sell-funding">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-[#b8860b]/30 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-[#C8A661]" />
              </div>
              <div>
                <h4 className="font-bold text-white">Need Funding?</h4>
                <p className="text-xs text-[#C8A661]/80">$10K - $50M Available</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 mb-4">
              {isGoodScore 
                ? `Great score! Pre-qualify with our lending partners to lock in financing.`
                : `Explore financing options from our 7 trusted lending partners.`}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-white">
                SBA Loans
              </Badge>
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-white">
                Equipment
              </Badge>
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-white">
                Same-Day
              </Badge>
            </div>

            <Link href="/funding">
              <Button className="w-full bg-[#b8860b] hover:bg-[#C8A661] text-white" size="sm" data-testid="button-cross-sell-funding">
                Explore Funding
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Equipment CTA */}
        <Card className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#0f1d30]/50 border-[#1e3a5f]/40" data-testid="card-cross-sell-equipment">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-[#1e3a5f]/50 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <h4 className="font-bold text-white">Need Equipment?</h4>
                <p className="text-xs text-white/70">TX, OK, LA, AR Coverage</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 mb-4">
              {isGoodScore 
                ? `Plan your build-out with AAdvantage Laundry Systems. Turnkey solutions available.`
                : `Get equipment quotes from the leading distributor in the Southwest.`}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-white">
                Dexter
              </Badge>
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-white">
                Continental
              </Badge>
              <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-white">
                Maytag
              </Badge>
            </div>

            <a href={AADVANTAGE_LINK} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white" size="sm" data-testid="button-cross-sell-equipment">
                Get Equipment Quote
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Score-specific message */}
      {score && score >= 70 && (
        <Card className="bg-gradient-to-r from-[#b8860b]/20 to-[#C8A661]/20 border-[#b8860b]/40" data-testid="card-cross-sell-hot">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#C8A661]" />
              <div>
                <p className="font-bold text-white">
                  {grade === 'A' ? 'Gold Mine Alert!' : 'High Potential Location!'}
                </p>
                <p className="text-sm text-white/80">
                  This location scored {score}/100 — act fast before others discover it.
                  <Link href="/consultation-landing" className="ml-2 text-[#C8A661] hover:text-[#b8860b] underline">
                    Talk to an expert →
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function CLEANBICrossSellCompact() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4 p-4 bg-white/5 rounded-lg border border-white/10" data-testid="section-cross-sell-compact">
      <Link href="/funding" className="flex-1">
        <Button variant="outline" className="w-full border-[#b8860b]/50 text-[#C8A661] hover:bg-[#b8860b]/10" size="sm" data-testid="button-compact-funding">
          <Banknote className="w-4 h-4 mr-2" />
          Get Funding ($10K-$50M)
        </Button>
      </Link>
      <a href={AADVANTAGE_LINK} target="_blank" rel="noopener noreferrer" className="flex-1">
        <Button variant="outline" className="w-full border-[#1e3a5f]/50 text-white/80 hover:bg-[#1e3a5f]/10" size="sm" data-testid="button-compact-equipment">
          <Wrench className="w-4 h-4 mr-2" />
          Equipment Quote (TX/OK/LA/AR)
        </Button>
      </a>
    </div>
  );
}
