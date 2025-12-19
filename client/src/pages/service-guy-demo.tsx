import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Wrench,
  Database,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2,
  BarChart3,
  Building2,
  Users,
  Search,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Image,
  Bot,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

interface BrandCoverage {
  name: string;
  codes: number;
  target: number;
}

interface AuditData {
  totalErrorCodes: number;
  totalParts: number;
  aadvantageBrands: BrandCoverage[];
  categories: {
    aadvantageReadiness: {
      score: number;
    };
  };
}

export default function ServiceGuyDemo() {
  const { data: auditData, isLoading } = useQuery<AuditData>({
    queryKey: ["/api/ai-research/full-audit"],
  });

  const brandData = auditData?.aadvantageBrands || [];
  const totalBrandCodes = brandData.reduce((sum, b) => sum + b.codes, 0);
  const overallReadiness = auditData?.categories?.aadvantageReadiness?.score || 0;
  const totalCodes = auditData?.totalErrorCodes || 0;
  const partsCount = auditData?.totalParts || 0;

  return (
    <>
      <Helmet>
        <title>Service Guy AI Enterprise Demo - AAdvantage Partnership | WashBizHub</title>
        <meta name="description" content="Enterprise-grade AI diagnostics platform for laundromat equipment. Demo showcase for AAdvantage Laundry Systems and EVI Industries partnership." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#0A1628] to-[#16213e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <Badge className="bg-[#C8A661] text-[#0A1628] mb-4">
              ENTERPRISE DEMO
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Service Guy AI
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The most comprehensive AI-powered diagnostic platform for commercial laundry equipment.
              Built for distributors like AAdvantage and EVI Industries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardContent className="pt-6 text-center">
                <Database className="w-8 h-8 text-[#C8A661] mx-auto mb-2" />
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mx-auto mb-1 bg-[#C8A661]/20" />
                ) : (
                  <div className="text-3xl font-bold text-[#C8A661]">{totalBrandCodes.toLocaleString()}</div>
                )}
                <div className="text-sm text-gray-400">AAdvantage Codes</div>
                <div className="text-xs text-gray-500 mt-1">Target: 3,500</div>
              </CardContent>
            </Card>
            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardContent className="pt-6 text-center">
                <Wrench className="w-8 h-8 text-green-500 mx-auto mb-2" />
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1 bg-green-500/20" />
                ) : (
                  <div className="text-3xl font-bold text-green-500">{partsCount}</div>
                )}
                <div className="text-sm text-gray-400">Parts Catalog</div>
                <div className="text-xs text-gray-500 mt-1">Target: 10,000+</div>
              </CardContent>
            </Card>
            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardContent className="pt-6 text-center">
                <Building2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-500">7</div>
                <div className="text-sm text-gray-400">AAdvantage Brands</div>
                <div className="text-xs text-gray-500 mt-1">Dexter, Continental, Maytag...</div>
              </CardContent>
            </Card>
            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-1 bg-purple-500/20" />
                ) : (
                  <div className="text-3xl font-bold text-purple-500">{overallReadiness}%</div>
                )}
                <div className="text-sm text-gray-400">AAdvantage Ready</div>
                <div className="text-xs text-gray-500 mt-1">Growing daily</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#16213e]/80 border-[#C8A661]/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#C8A661]" />
                AAdvantage Brand Coverage
              </CardTitle>
              <CardDescription>Error code database progress for AAdvantage-distributed equipment brands</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#C8A661]" />
                  <span className="ml-2 text-gray-400">Loading live data...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {brandData.map((brand) => (
                    <div key={brand.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{brand.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#C8A661] text-[#C8A661]">
                            {brand.codes} codes
                          </Badge>
                          <span className="text-xs text-gray-500">/ {brand.target} target</span>
                        </div>
                      </div>
                      <Progress 
                        value={(brand.codes / brand.target) * 100} 
                        className="h-2 bg-[#0A1628]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C8A661]" />
                  Key Features for Distributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Search, title: "Instant Diagnostics", desc: "AI-powered error code lookup with repair steps" },
                  { icon: Image, title: "Photo Diagnosis", desc: "Gemini Vision AI analyzes equipment photos" },
                  { icon: MessageCircle, title: "Voice Input", desc: "Hands-free diagnostics in the field" },
                  { icon: Shield, title: "White-Label Ready", desc: "Your branding, your domain, your customers" },
                  { icon: Zap, title: "API Integration", desc: "Connect to your existing systems" },
                  { icon: Users, title: "Multi-Tenant", desc: "Separate portals for each customer location" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <feature.icon className="w-5 h-5 text-[#C8A661] mt-0.5" />
                    <div>
                      <div className="font-medium text-white">{feature.title}</div>
                      <div className="text-sm text-gray-400">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#C8A661]" />
                  AI Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "OpenAI GPT-4o", status: "active", use: "Reasoning & Analysis" },
                  { name: "Anthropic Claude", status: "active", use: "Deep Technical Analysis" },
                  { name: "Google Gemini", status: "active", use: "Vision & Photo Diagnosis" },
                  { name: "Perplexity AI", status: "active", use: "Real-time Research" },
                  { name: "Grok/xAI", status: "active", use: "Error Code Expansion" },
                ].map((ai) => (
                  <div key={ai.name} className="flex items-center justify-between bg-[#0A1628] p-3 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{ai.name}</div>
                      <div className="text-xs text-gray-400">{ai.use}</div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-[#C8A661]/20 to-[#D4B878]/20 border-[#C8A661]/40 mb-8">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Enhance DexterLive with Service Guy AI
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Service Guy AI integrates seamlessly with existing equipment monitoring systems.
                Add AI diagnostics to your DexterLive implementation and provide technicians with
                instant repair guidance.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/service-guy-ai">
                  <Button className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                    Try Service Guy AI
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/service-guy-admin">
                  <Button variant="outline" className="border-[#C8A661] text-[#C8A661] hover:bg-[#C8A661]/10">
                    Enterprise Admin Demo
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Immediate Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Reduce diagnostic time by 80%",
                  "Increase first-time fix rate",
                  "Lower training costs for new techs",
                  "Improve customer satisfaction",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Enterprise Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "White-label branding",
                  "Custom domain support",
                  "API access with rate limiting",
                  "Email/SMS notifications",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#16213e]/80 border-[#C8A661]/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Partnership Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Priority brand code development",
                  "Custom integrations",
                  "Dedicated support channel",
                  "Revenue share opportunities",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C8A661]" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12 py-8 border-t border-[#C8A661]/20">
            <p className="text-gray-400 mb-4">
              Ready to transform your service operations?
            </p>
            <a href="mailto:nick@washbizhub.com?subject=Service%20Guy%20AI%20Enterprise%20Demo">
              <Button size="lg" className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]">
                Schedule Partnership Discussion
              </Button>
            </a>
            <p className="text-xs text-gray-500 mt-4">
              Contact: Nick Kremers | nick@washbizhub.com | (479) 883-4314
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
