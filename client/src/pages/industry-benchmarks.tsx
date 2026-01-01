import { Helmet } from "react-helmet-async";
import { IndustryBenchmarks } from "@/components/IndustryBenchmarks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  BarChart3, TrendingUp, Shield, Building2, 
  FileText, Download, ExternalLink, CheckCircle
} from "lucide-react";

const dataSources = [
  {
    name: "IBISWorld",
    description: "Global industry research and market data",
    coverage: "Market sizing, industry trends, competitive landscape",
    year: "2025",
    url: "https://www.ibisworld.com"
  },
  {
    name: "Coin Laundry Association (CLA)",
    description: "Official industry trade association",
    coverage: "Annual surveys, operational benchmarks, technology adoption",
    year: "2025",
    url: "https://www.coinlaundry.org"
  },
  {
    name: "BizBuySell",
    description: "Largest business-for-sale marketplace",
    coverage: "Transaction multiples, pricing data, market activity",
    year: "2025",
    url: "https://www.bizbuysell.com"
  },
  {
    name: "WashBizHub Analytics",
    description: "Proprietary data from platform activity",
    coverage: "Real-time marketplace metrics, user behavior, valuation requests",
    year: "Live",
    url: null
  }
];

export default function IndustryBenchmarksPage() {
  return (
    <>
      <Helmet>
        <title>2025 Laundromat Industry Benchmarks | WashBizHub</title>
        <meta 
          name="description" 
          content="Comprehensive 2025 laundromat industry benchmarks including market size, average revenues, SDE multiples, survival rates, and ROI data from IBISWorld, CLA, and BizBuySell." 
        />
        <meta name="keywords" content="laundromat industry data, laundromat benchmarks 2025, laundromat market size, laundromat valuation multiples" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-[#C8A661]/20 flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-[#C8A661]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" data-testid="text-page-title">
              2025 Industry Benchmarks
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Data-driven insights from trusted industry sources including IBISWorld, 
              Coin Laundry Association, and BizBuySell marketplace data.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Updated Q1 2025
              </Badge>
              <Badge className="bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Shield className="w-3 h-3 mr-1" />
                Verified Sources
              </Badge>
            </div>
          </div>

          <IndustryBenchmarks variant="full" showTitle={false} />

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#C8A661]" />
              Data Sources & Methodology
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {dataSources.map((source) => (
                <Card key={source.name} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white flex items-center justify-between">
                      <span>{source.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {source.year}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm mb-2">{source.description}</p>
                    <p className="text-slate-500 text-xs mb-3">
                      <strong className="text-slate-400">Coverage:</strong> {source.coverage}
                    </p>
                    {source.url && (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#C8A661] text-sm hover:underline flex items-center gap-1"
                      >
                        Visit Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-[#C8A661]/10 to-slate-900/50 border-[#C8A661]/20 p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Apply These Benchmarks?
              </h3>
              <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                Use our suite of calculators and analysis tools to compare your laundromat 
                against industry standards and identify opportunities for growth.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/cleanbi-explorer">
                  <Button className="bg-[#C8A661] hover:bg-[#C8A661]/90 text-slate-900" data-testid="button-cleanbi-explorer">
                    <Building2 className="w-4 h-4 mr-2" />
                    CLEANBI Explorer
                  </Button>
                </Link>
                <Link href="/valuation-calculator">
                  <Button variant="outline" className="border-[#C8A661]/50 text-[#C8A661]" data-testid="button-valuation-calculator">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Valuation Calculator
                  </Button>
                </Link>
                <Link href="/calculators">
                  <Button variant="outline" className="border-slate-600 text-slate-300" data-testid="button-calculators">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    All Calculators
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <div className="mt-12 p-6 bg-slate-900/30 rounded-xl border border-slate-800/50">
            <h4 className="text-sm font-semibold text-slate-400 mb-2">Data Disclaimer</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Industry benchmarks are provided for informational purposes only and represent 
              general market conditions. Individual laundromat performance varies significantly 
              based on location, management, equipment age, and local market factors. Always 
              conduct thorough due diligence and consult qualified professionals before making 
              business decisions. Data is updated quarterly from cited sources.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
