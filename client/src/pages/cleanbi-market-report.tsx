import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Users, 
  Building2, 
  Download,
  Share2,
  Calendar,
  BarChart3,
  Target,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star
} from "lucide-react";
import { Link } from "wouter";

const GRADE_COLORS: Record<string, string> = {
  A: "#22C55E",
  B: "#A3E635", 
  C: "#FBBF24",
  "Needs Work": "#C8A661"
};

interface MarketMetric {
  city: string;
  state: string;
  avgScore: number;
  grade: string;
  opportunityCount: number;
  avgIncome: number;
  population: number;
  competitionLevel: "Low" | "Medium" | "High";
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

const sampleMarketData: MarketMetric[] = [
  { city: "Phoenix", state: "AZ", avgScore: 87, grade: "A", opportunityCount: 42, avgIncome: 68500, population: 1680000, competitionLevel: "Medium", trend: "up", trendPercent: 12 },
  { city: "Austin", state: "TX", avgScore: 84, grade: "B", opportunityCount: 38, avgIncome: 78200, population: 1020000, competitionLevel: "Medium", trend: "up", trendPercent: 8 },
  { city: "Charlotte", state: "NC", avgScore: 82, grade: "B", opportunityCount: 35, avgIncome: 65800, population: 897000, competitionLevel: "Low", trend: "up", trendPercent: 15 },
  { city: "Nashville", state: "TN", avgScore: 79, grade: "B", opportunityCount: 31, avgIncome: 62400, population: 715000, competitionLevel: "Low", trend: "up", trendPercent: 18 },
  { city: "Las Vegas", state: "NV", avgScore: 76, grade: "B", opportunityCount: 28, avgIncome: 58900, population: 665000, competitionLevel: "Medium", trend: "stable", trendPercent: 2 },
  { city: "Tampa", state: "FL", avgScore: 74, grade: "B", opportunityCount: 26, avgIncome: 55200, population: 398000, competitionLevel: "Medium", trend: "up", trendPercent: 6 },
  { city: "Denver", state: "CO", avgScore: 72, grade: "B", opportunityCount: 24, avgIncome: 72100, population: 727000, competitionLevel: "High", trend: "stable", trendPercent: 1 },
  { city: "Raleigh", state: "NC", avgScore: 71, grade: "B", opportunityCount: 22, avgIncome: 69500, population: 474000, competitionLevel: "Low", trend: "up", trendPercent: 14 },
  { city: "Atlanta", state: "GA", avgScore: 68, grade: "C", opportunityCount: 45, avgIncome: 64200, population: 498000, competitionLevel: "High", trend: "stable", trendPercent: 3 },
  { city: "San Antonio", state: "TX", avgScore: 65, grade: "C", opportunityCount: 33, avgIncome: 52800, population: 1580000, competitionLevel: "Medium", trend: "up", trendPercent: 5 },
];

const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

export default function CLEANBIMarketReport() {
  const [selectedRegion, setSelectedRegion] = useState<"all" | "southwest" | "southeast" | "midwest">("all");

  return (
    <>
      <Helmet>
        <title>CLEANBI Market Pulse Report - {currentMonth} | WashBizHub</title>
        <meta name="description" content={`Monthly laundromat market intelligence report for ${currentMonth}. Discover the top cities for laundromat investment based on CLEANBI scores, demographics, and competition analysis.`} />
        <meta property="og:title" content={`CLEANBI Market Pulse - ${currentMonth} | WashBizHub`} />
        <meta property="og:description" content="Data-driven laundromat market intelligence. Find the best cities for laundromat investment." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-[#0a1628] via-[#1a2744] to-[#0f1d32] text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-[#C8A661] to-[#d4a84b] text-white border-0">
                <Calendar className="w-3 h-3 mr-1" />
                {currentMonth}
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white/80">
                Monthly Report
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              CLEANBI™ Market Pulse
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mb-8">
              Data-driven intelligence for laundromat investors. Discover the hottest markets, 
              emerging opportunities, and strategic insights powered by AI analysis.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/cleanbi-explorer">
                <Button size="lg" className="bg-gradient-to-r from-[#C8A661] to-[#d4a84b] hover:from-[#a07608] hover:to-[#c49940] text-white" data-testid="button-analyze-location">
                  <Target className="w-5 h-5 mr-2" />
                  Analyze Any Location
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-download-pdf">
                <Download className="w-5 h-5 mr-2" />
                Download PDF Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Markets Analyzed</p>
                    <p className="text-3xl font-bold">847</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +23 new this month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">A-Grade Opportunities</p>
                    <p className="text-3xl font-bold">156</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +18% vs last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Market Score</p>
                    <p className="text-3xl font-bold">72.4</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  National average (B grade)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Investment Volume</p>
                    <p className="text-3xl font-bold">$847M</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12% YoY growth
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="rankings" className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="rankings" data-testid="tab-rankings">Top Markets</TabsTrigger>
              <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
              <TabsTrigger value="insights" data-testid="tab-insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="rankings" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Top 10 Markets for Laundromat Investment</h2>
                  <p className="text-muted-foreground">Ranked by CLEANBI score and opportunity density</p>
                </div>
                <Button variant="outline" size="sm" data-testid="button-share-report">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Report
                </Button>
              </div>

              <div className="grid gap-4">
                {sampleMarketData.map((market, index) => (
                  <Card key={market.city} className="hover-elevate cursor-pointer" data-testid={`card-market-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{market.city}, {market.state}</h3>
                            {market.trend === "up" && (
                              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +{market.trendPercent}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {(market.population / 1000).toFixed(0)}K pop
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${(market.avgIncome / 1000).toFixed(0)}K income
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {market.competitionLevel} competition
                            </span>
                          </div>
                        </div>

                        <div className="text-center">
                          <div 
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: GRADE_COLORS[market.grade] }}
                          >
                            {market.grade}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Score: {market.avgScore}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{market.opportunityCount}</p>
                          <p className="text-xs text-muted-foreground">Opportunities</p>
                        </div>

                        <Link href={`/cleanbi-explorer?city=${market.city}&state=${market.state}`}>
                          <Button size="sm" variant="ghost" data-testid={`button-explore-${market.city.toLowerCase()}`}>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Trends - {currentMonth}</CardTitle>
                  <CardDescription>Key movements and patterns in laundromat markets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-5 h-5" />
                        Rising Markets
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                          <span>Nashville, TN</span>
                          <Badge className="bg-green-600">+18%</Badge>
                        </li>
                        <li className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                          <span>Charlotte, NC</span>
                          <Badge className="bg-green-600">+15%</Badge>
                        </li>
                        <li className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                          <span>Raleigh, NC</span>
                          <Badge className="bg-green-600">+14%</Badge>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2 text-amber-600">
                        <Zap className="w-5 h-5" />
                        Emerging Opportunities
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                          <span>Boise, ID</span>
                          <Badge variant="outline">New Entry</Badge>
                        </li>
                        <li className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                          <span>Salt Lake City, UT</span>
                          <Badge variant="outline">New Entry</Badge>
                        </li>
                        <li className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                          <span>Huntsville, AL</span>
                          <Badge variant="outline">New Entry</Badge>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Key Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Sun Belt Dominance Continues</h4>
                      <p className="text-sm text-muted-foreground">
                        8 of the top 10 markets are in Sun Belt states, driven by population 
                        growth and favorable demographics for laundromat investment.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Low Competition = Higher Scores</h4>
                      <p className="text-sm text-muted-foreground">
                        Markets with "Low" competition show 23% higher average CLEANBI scores, 
                        indicating significant white space for new entrants.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold mb-2">Income Sweet Spot: $55K-$70K</h4>
                      <p className="text-sm text-muted-foreground">
                        Markets with median household income in this range show optimal 
                        balance of demand and pricing power.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Target Nashville & Charlotte</h4>
                        <p className="text-sm text-muted-foreground">
                          These markets show strongest upward momentum with low competition.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Use CLEANBI for Site Selection</h4>
                        <p className="text-sm text-muted-foreground">
                          Analyze specific addresses to find A-grade micro-locations.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Secure SBA Pre-Approval</h4>
                        <p className="text-sm text-muted-foreground">
                          Use our SBA Readiness tool to prepare for fast acquisition.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <Card className="mt-12 bg-gradient-to-br from-[#0a1628] to-[#1a2744] text-white border-0">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Investment?</h2>
                  <p className="text-white/80 mb-6">
                    Use CLEANBI Explorer to analyze any address in the country and get instant 
                    intelligence on demographics, competition, and opportunity potential.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link href="/cleanbi-explorer">
                      <Button size="lg" className="bg-gradient-to-r from-[#C8A661] to-[#d4a84b] text-white" data-testid="button-try-cleanbi">
                        <Target className="w-5 h-5 mr-2" />
                        Try CLEANBI Free
                      </Button>
                    </Link>
                    <Link href="/consultation">
                      <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-book-consultation">
                        Book Expert Consultation
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#C8A661]/20 to-[#d4a84b]/20 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#C8A661] to-[#d4a84b] flex items-center justify-center">
                      <span className="text-5xl font-bold">A</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
