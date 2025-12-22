import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DashboardShell,
  DashboardSection,
  KPICard,
  KPIGroup,
  ChartCard,
  DashboardNav,
} from "@/components/dashboard";
import { getNavItemsForRole } from "@/lib/dashboard-nav-config";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  LinkIcon,
  Wallet,
  Users,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Affiliate, AffiliateContent, AffiliateSale } from "@shared/schema";



const promoMaterials = [
  { name: "Website Templates", url: "/website-templates", description: "Custom templates for laundromat owners" },
  { name: "Calculator Hub", url: "/calculators", description: "Business calculators and tools" },
  { name: "Marketplace", url: "/marketplace", description: "Equipment and supplies marketplace" },
  { name: "Laundromat Bible", url: "/book", description: "Industry-leading educational resource" },
];

export default function AffiliateDashboard() {
  const { toast } = useToast();
  const [copiedTag, setCopiedTag] = useState(false);
  const [generatorUrl, setGeneratorUrl] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const { data: affiliate, isLoading: affiliateLoading } = useQuery<Affiliate>({
    queryKey: ["/api/affiliate/profile"],
  });

  const { data: stats } = useQuery<{
    clicks: number;
    sales: number;
    revenue: string;
    commission: string;
    conversionRate: number;
  }>({
    queryKey: ["/api/affiliate/stats"],
  });

  const { data: recentSales } = useQuery<AffiliateSale[]>({
    queryKey: ["/api/affiliate/sales"],
  });

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
      const baseUrl = window.location.origin;
      const fullUrl = generatorUrl.startsWith("/") ? generatorUrl : `/${generatorUrl}`;
      const url = new URL(fullUrl, baseUrl);
      url.searchParams.set("ref", affiliate.affiliateTag || affiliate.affiliateCode);
      setGeneratedLink(url.toString());
    }
  };

  const realStats = {
    totalReferrals: stats?.clicks || affiliate?.totalClicks || 0,
    conversions: stats?.sales || affiliate?.totalSales || 0,
    commissionEarned: stats?.commission || affiliate?.totalCommission || "0",
    pendingPayout: affiliate?.pendingPayout || "0",
    conversionRate: stats?.conversionRate || 0,
  };

  const affiliateTag = affiliate?.affiliateTag || affiliate?.affiliateCode || "PARTNER2024";
  const commissionRate = affiliate?.commissionRate || 20;

  if (affiliateLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-foreground text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <AuthGuard
        title="Sign In to Access Affiliate Center"
        description="Sign in to access your affiliate dashboard."
      >
        <SEO
          title="Affiliate Center | Earn Commissions | WashBizHub"
          description="Join the WashBizHub affiliate program and earn commissions by referring customers."
          canonicalUrl="/affiliate-dashboard"
        />
        <DashboardShell
          title="Affiliate Dashboard"
          subtitle="Join our affiliate program and start earning"
          showDatePicker={false}
          showExportButtons={false}
        >
          <Card className="bg-card border shadow-sm max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-[#C8A661]/10 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-[#C8A661]" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Join the Affiliate Program</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Earn 20% commission on every sale you refer. Start making money by sharing WashBizHub products and services.
              </p>
              <Button
                className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                onClick={() => window.location.href = "/affiliate/apply"}
                data-testid="button-apply-affiliate"
              >
                Apply Now
              </Button>
            </CardContent>
          </Card>
        </DashboardShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard
      title="Sign In to Access Affiliate Center"
      description="Sign in to access your affiliate dashboard."
    >
      <SEO
        title="Affiliate Center | Track Earnings | WashBizHub"
        description="Track your referrals, commissions, and generate affiliate links for WashBizHub products."
        canonicalUrl="/affiliate-dashboard"
      />

      <DashboardShell
        title="Affiliate Dashboard"
        subtitle="Track referrals, generate links, and maximize your earnings"
        showDatePicker={false}
        showExportButtons={false}
        headerActions={
          <div className="flex items-center gap-2">
            <DashboardNav 
              items={getNavItemsForRole(affiliate?.userId ? "user" : undefined)} 
              variant="dropdown" 
              className="hidden md:flex"
            />
            {affiliate.status === "pending" ? (
              <Badge className="bg-yellow-500/10 text-yellow-600 border-0 gap-1" data-testid="badge-pending">
                <AlertCircle className="w-3.5 h-3.5" />
                Pending Approval
              </Badge>
            ) : (
              <Badge className="bg-green-500/10 text-green-600 border-0 gap-1" data-testid="badge-active">
                <Check className="w-3.5 h-3.5" />
                Active Partner
              </Badge>
            )}
            <Badge className="bg-[#C8A661]/10 text-[#C8A661] border-0 font-bold" data-testid="badge-rate">
              {commissionRate}% Commission
            </Badge>
          </div>
        }
      >
        {affiliate.status === "pending" && (
          <Card className="bg-yellow-500/5 border-yellow-500/30 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-foreground font-semibold">Application Pending</p>
                  <p className="text-muted-foreground text-sm">
                    Your affiliate application is under review. You'll be notified once approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DashboardSection className="mb-8">
          <KPIGroup>
            <KPICard
              value={realStats.totalReferrals}
              label="Total Referrals"
              icon={Users}
              variant="default"
            />
            <KPICard
              value={realStats.conversions}
              label="Conversions"
              icon={ShoppingCart}
              variant="default"
              subtitle={realStats.totalReferrals > 0 ? `${realStats.conversionRate.toFixed(1)}% rate` : "No referrals yet"}
            />
            <KPICard
              value={`$${realStats.commissionEarned}`}
              label="Commission Earned"
              icon={DollarSign}
              variant="gold"
            />
            <KPICard
              value={`$${realStats.pendingPayout}`}
              label="Pending Payout"
              icon={Wallet}
              variant="success"
              subtitle="Payouts processed monthly"
            />
          </KPIGroup>
        </DashboardSection>

        <DashboardSection className="mb-8">
          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <LinkIcon className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Your Affiliate Tag</h3>
                  <p className="text-sm text-muted-foreground">Use this tag in all your promotional links</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <Input
                  value={affiliateTag}
                  readOnly
                  className="font-mono text-lg max-w-xs"
                  data-testid="input-affiliate-tag"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(affiliateTag)}
                  data-testid="button-copy-tag"
                >
                  {copiedTag ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="urlInput" className="text-muted-foreground">Generate Affiliate Link</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="urlInput"
                      value={generatorUrl}
                      onChange={(e) => setGeneratorUrl(e.target.value)}
                      placeholder="Enter URL or page path"
                      data-testid="input-url-generator"
                    />
                    <Button
                      onClick={generateAffiliateLink}
                      disabled={!generatorUrl}
                      className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                      data-testid="button-generate-link"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                {generatedLink && (
                  <div>
                    <Label className="text-muted-foreground">Your Affiliate Link</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={generatedLink}
                        readOnly
                        className="text-sm"
                        data-testid="input-generated-link"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(generatedLink)}
                        data-testid="button-copy-link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </DashboardSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ChartCard
              title="Performance Summary"
              subtitle="Your affiliate performance overview"
              minHeight="280px"
            >
              {realStats.totalReferrals > 0 ? (
                <div className="flex items-center justify-center h-[280px]">
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#0A1628] dark:text-[#C8A661]">{realStats.totalReferrals}</div>
                        <div className="text-sm text-muted-foreground mt-1">Total Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#C8A661]">{realStats.conversions}</div>
                        <div className="text-sm text-muted-foreground mt-1">Conversions</div>
                      </div>
                    </div>
                    <div className="mt-6 text-sm text-muted-foreground">
                      Monthly trend charts coming soon as you build activity
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[280px] text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No Activity Yet</p>
                  <p className="text-sm text-muted-foreground/70 max-w-sm mt-2">
                    Start sharing your affiliate links to see your performance data here. 
                    Copy your tag above and add it to any WashBizHub URL.
                  </p>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="lg:col-span-1">
            <DashboardSection title="Getting Started">
              <Card className="bg-card border shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#C8A661]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#C8A661]">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Copy Your Affiliate Tag</p>
                        <p className="text-xs text-muted-foreground mt-1">Use the tag above in all your links</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#C8A661]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#C8A661]">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Share Links on Social Media</p>
                        <p className="text-xs text-muted-foreground mt-1">Post to Facebook groups, Twitter, etc.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#C8A661]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#C8A661]">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Earn {commissionRate}% Commission</p>
                        <p className="text-xs text-muted-foreground mt-1">On every sale from your referrals</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Get Paid Monthly</p>
                        <p className="text-xs text-muted-foreground mt-1">Payouts processed on the 1st</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DashboardSection>
          </div>
        </div>

        <DashboardSection
          title="Promotional Materials"
          description="Ready-to-share links for maximum conversions"
        >
          <Card className="bg-card border shadow-sm overflow-hidden">
            <div className="h-1 bg-[#C8A661]" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#C8A661]" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Quick Share Links</h3>
                  <p className="text-sm text-muted-foreground">Share pre-made affiliate links on social media</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promoMaterials.map((item) => {
                  const link = `${window.location.origin}${item.url}?ref=${affiliateTag}`;
                  return (
                    <Card key={item.url} className="bg-muted/30 border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(link)}
                              data-testid={`button-share-${item.url.replace(/\//g, "-")}`}
                            >
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => window.open(link, '_blank')}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </DashboardSection>
      </DashboardShell>
    </AuthGuard>
  );
}
