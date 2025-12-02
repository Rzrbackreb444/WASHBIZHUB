import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DollarSign, 
  TrendingUp, 
  MousePointerClick, 
  ShoppingCart, 
  Copy, 
  Check, 
  Share2,
  ExternalLink,
  FileText,
  Video,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Affiliate, AffiliateContent, AffiliateSale } from "@shared/schema";

export default function AffiliateDashboard() {
  const { toast } = useToast();
  const [copiedTag, setCopiedTag] = useState(false);
  const [generatorUrl, setGeneratorUrl] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // Fetch affiliate profile
  const { data: affiliate, isLoading: affiliateLoading } = useQuery<Affiliate>({
    queryKey: ["/api/affiliate/profile"],
  });

  // Fetch performance stats
  const { data: stats } = useQuery<{
    clicks: number;
    sales: number;
    revenue: string;
    commission: string;
    conversionRate: number;
  }>({
    queryKey: ["/api/affiliate/stats"],
  });

  // Fetch recent sales
  const { data: recentSales } = useQuery<AffiliateSale[]>({
    queryKey: ["/api/affiliate/sales"],
  });

  // Fetch affiliate content
  const { data: content } = useQuery<AffiliateContent[]>({
    queryKey: ["/api/affiliate/content"],
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const generateAffiliateLink = () => {
    if (!affiliate || !generatorUrl) return;
    
    try {
      const url = new URL(generatorUrl);
      url.searchParams.set("ref", affiliate.affiliateTag || affiliate.affiliateCode);
      setGeneratedLink(url.toString());
    } catch (e) {
      // If not a full URL, assume it's a path on WashBizHub
      const baseUrl = window.location.origin;
      const fullUrl = generatorUrl.startsWith("/") ? generatorUrl : `/${generatorUrl}`;
      const url = new URL(fullUrl, baseUrl);
      url.searchParams.set("ref", affiliate.affiliateTag || affiliate.affiliateCode);
      setGeneratedLink(url.toString());
    }
  };

  if (affiliateLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <AuthGuard 
        title="Sign In to Access Affiliate Dashboard" 
        description="Sign in to access your dashboard."
      >
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Join the Affiliate Program</CardTitle>
                <CardDescription className="text-slate-400">
                  Earn 20% commission on every sale you refer. Start making money by sharing WashBizHub products and services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.location.href = "/affiliate/apply"}
                  data-testid="button-apply-affiliate"
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard 
      title="Sign In to Access Affiliate Dashboard" 
      description="Sign in to access your dashboard."
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Affiliate Dashboard</h1>
          <p className="text-slate-300 text-lg">
            Track your performance and generate affiliate links
          </p>
        </div>

        {/* Status Banner */}
        {affiliate.status === "pending" && (
          <Card className="bg-yellow-900/20 border-yellow-700 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-yellow-200 font-semibold">Application Pending</p>
                  <p className="text-yellow-300/80 text-sm">
                    Your affiliate application is under review. You'll be notified once approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Clicks */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Clicks</CardTitle>
              <MousePointerClick className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="stat-total-clicks">
                {stats?.clicks?.toLocaleString() || affiliate.totalClicks}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Lifetime clicks on your links
              </p>
            </CardContent>
          </Card>

          {/* Total Sales */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Sales</CardTitle>
              <ShoppingCart className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="stat-total-sales">
                {stats?.sales?.toLocaleString() || affiliate.totalSales}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}% conversion rate` : "Lifetime sales"}
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white" data-testid="stat-total-revenue">
                ${stats?.revenue || affiliate.totalRevenue}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Total sales attributed to you
              </p>
            </CardContent>
          </Card>

          {/* Total Commission */}
          <Card className="bg-slate-900/50 border-slate-700 border-2 border-gold-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gold-400">Commission Earned</CardTitle>
              <DollarSign className="w-4 h-4 text-gold-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gold-400" data-testid="stat-total-commission">
                ${stats?.commission || affiliate.totalCommission}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {affiliate.commissionRate}% on profit
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md" data-testid="tabs-affiliate">
            <TabsTrigger value="links" data-testid="tab-links">Link Generator</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">My Content</TabsTrigger>
            <TabsTrigger value="sales" data-testid="tab-sales">Sales</TabsTrigger>
          </TabsList>

          {/* Link Generator Tab */}
          <TabsContent value="links">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your Affiliate Tag */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Your Affiliate Tag</CardTitle>
                  <CardDescription className="text-slate-400">
                    Use this tag in all your promotional links
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={affiliate.affiliateTag || affiliate.affiliateCode}
                      readOnly
                      className="bg-slate-800 border-slate-700 text-white font-mono text-lg"
                      data-testid="input-affiliate-tag"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(affiliate.affiliateTag || affiliate.affiliateCode)}
                      className="border-slate-600"
                      data-testid="button-copy-tag"
                    >
                      {copiedTag ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Commission Rate</Label>
                    <div className="text-3xl font-bold text-gold-400">
                      {affiliate.commissionRate}%
                    </div>
                    <p className="text-sm text-slate-400">
                      You earn {affiliate.commissionRate}% of profit on every sale
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Link Generator */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Generate Affiliate Link</CardTitle>
                  <CardDescription className="text-slate-400">
                    Create trackable links for any WashBizHub product or page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="urlInput" className="text-slate-300">Product URL or Page Path</Label>
                    <Input
                      id="urlInput"
                      value={generatorUrl}
                      onChange={(e) => setGeneratorUrl(e.target.value)}
                      placeholder="https://washbizhub.com/marketplace or /courses/laundry-101"
                      className="bg-slate-800 border-slate-700 text-white"
                      data-testid="input-url-generator"
                    />
                  </div>

                  <Button 
                    onClick={generateAffiliateLink}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!generatorUrl}
                    data-testid="button-generate-link"
                  >
                    Generate Link
                  </Button>

                  {generatedLink && (
                    <div className="space-y-2">
                      <Label className="text-slate-300">Your Affiliate Link</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={generatedLink}
                          readOnly
                          className="bg-slate-800 border-slate-700 text-white text-sm"
                          data-testid="input-generated-link"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(generatedLink)}
                          className="border-slate-600"
                          data-testid="button-copy-link"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Social Sharing Quick Links */}
            <Card className="bg-slate-900/50 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Social Sharing Quick Links
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Share pre-made affiliate links on social media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Website Templates", url: "/website-templates", icon: "🌐" },
                    { name: "Calculator Hub", url: "/calculators", icon: "🧮" },
                    { name: "Marketplace", url: "/marketplace", icon: "🛒" },
                    { name: "Laundromat Bible", url: "/book", icon: "📖" },
                  ].map((item) => {
                    const link = `${window.location.origin}${item.url}?ref=${affiliate.affiliateTag || affiliate.affiliateCode}`;
                    return (
                      <div key={item.url} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-white font-medium">{item.name}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(link)}
                          className="border-slate-600"
                          data-testid={`button-share-${item.url.replace(/\//g, "-")}`}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your UGC Content</CardTitle>
                <CardDescription className="text-slate-400">
                  Track performance of your blogs and videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {content && content.length > 0 ? (
                  <div className="space-y-4">
                    {content.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-3 flex-1">
                          {item.contentType === "video" ? (
                            <Video className="w-5 h-5 text-purple-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-400" />
                          )}
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{item.title}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                              <span>{item.views} views</span>
                              <span>{item.clicks} clicks</span>
                              <span>{item.conversions} conversions</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={item.status === "approved" ? "default" : "secondary"}
                          data-testid={`badge-status-${item.id}`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No content yet. Start creating!</p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.location.href = "/affiliate/submit-content"}
                      data-testid="button-submit-content"
                    >
                      Submit Content
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Sales</CardTitle>
                <CardDescription className="text-slate-400">
                  Track your commission earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentSales && recentSales.length > 0 ? (
                  <div className="space-y-3">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div>
                          <p className="text-white font-medium">{sale.productName}</p>
                          <p className="text-sm text-slate-400">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold-400 font-bold">${sale.commissionAmount}</p>
                          <Badge 
                            variant={sale.commissionStatus === "paid" ? "default" : "secondary"}
                            className="mt-1"
                            data-testid={`badge-commission-${sale.id}`}
                          >
                            {sale.commissionStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No sales yet. Keep promoting!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AuthGuard>
  );
}
