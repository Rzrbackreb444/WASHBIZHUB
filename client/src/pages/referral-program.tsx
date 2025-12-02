import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Users, Gift, Copy, Check, Share2, Mail, 
  DollarSign, TrendingUp, Star, Crown, Zap,
  Twitter, Linkedin, MessageCircle, Link as LinkIcon,
  ChevronRight, Sparkles, Trophy, Target
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  tier: string;
  nextTierAt: number;
  recentReferrals: Array<{
    id: string;
    email: string;
    status: string;
    createdAt: string;
    earnings?: number;
  }>;
}

const tiers = [
  { name: "Starter", minReferrals: 0, commission: 10, color: "text-gray-400", bg: "bg-gray-500/20" },
  { name: "Partner", minReferrals: 5, commission: 15, color: "text-blue-400", bg: "bg-blue-500/20" },
  { name: "Ambassador", minReferrals: 15, commission: 20, color: "text-purple-400", bg: "bg-purple-500/20" },
  { name: "Elite", minReferrals: 50, commission: 25, color: "text-gold-400", bg: "bg-gold-500/20" },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "WashBizHub Referral Program - Earn While You Share",
  "description": "Earn up to 25% commission for every friend you refer to WashBizHub. Share your unique link and get rewarded when they subscribe.",
  "url": "https://washbizhub.com/referral-program"
};

export default function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
  });

  const referralCode = stats?.referralCode || "LOADING...";
  const referralLink = stats?.referralLink || `https://washbizhub.com?ref=${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform: string) => {
    const message = `Check out WashBizHub - the #1 platform for laundromat investors. Use my referral link for exclusive perks: ${referralLink}`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=${encodeURIComponent("Check out WashBizHub")}&body=${encodeURIComponent(message)}`,
    };
    window.open(urls[platform], '_blank');
  };

  const currentTier = tiers.find((t, i) => {
    const nextTier = tiers[i + 1];
    return !nextTier || (stats?.totalReferrals || 0) < nextTier.minReferrals;
  }) || tiers[0];

  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progressToNext = nextTier 
    ? ((stats?.totalReferrals || 0) / nextTier.minReferrals) * 100
    : 100;

  return (
    <>
      <SEO
        title="Referral Program | Earn Up to 25% Commission | WashBizHub"
        description="Join the WashBizHub referral program and earn up to 25% recurring commission for every friend you refer. Share your unique link and get rewarded when they become paying subscribers."
        canonicalUrl="/referral-program"
        ogType="website"
        keywords={[
          "washbizhub referral program",
          "laundromat affiliate program",
          "earn commission referrals",
          "refer a friend laundromat",
          "partner program"
        ]}
        structuredData={[structuredData]}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gold-500/20 text-gold-400 border-gold-400/30">
              <Gift className="w-3 h-3 mr-1.5" />
              Referral Program
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4" data-testid="text-page-title">
              Share WashBizHub, <span className="text-gold-400">Earn Rewards</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Earn up to 25% recurring commission for every friend who becomes a paying subscriber
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <Card className="lg:col-span-2 bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-gold-400" />
                  Your Referral Link
                </CardTitle>
                <CardDescription className="text-white/60">
                  Share this link with friends and colleagues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-6">
                  <Input
                    value={referralLink}
                    readOnly
                    className="bg-white/10 border-white/20 text-white font-mono text-sm"
                    data-testid="input-referral-link"
                  />
                  <Button 
                    onClick={() => copyToClipboard(referralLink)}
                    className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-6"
                    data-testid="button-copy-link"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white/60 text-sm">Share via:</span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 flex-1"
                    onClick={() => shareVia('twitter')}
                    data-testid="button-share-twitter"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 flex-1"
                    onClick={() => shareVia('linkedin')}
                    data-testid="button-share-linkedin"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 flex-1"
                    onClick={() => shareVia('email')}
                    data-testid="button-share-email"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gold-500/20 to-amber-500/20 backdrop-blur-xl border-gold-400/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${currentTier.bg} flex items-center justify-center`}>
                    <Crown className={`w-6 h-6 ${currentTier.color}`} />
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${currentTier.color}`} data-testid="text-current-tier">
                      {currentTier.name} Tier
                    </div>
                    <div className="text-white/60 text-sm">{currentTier.commission}% commission</div>
                  </div>
                </div>

                {nextTier && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/60">Progress to {nextTier.name}</span>
                      <span className="text-white font-medium">
                        {stats?.totalReferrals || 0}/{nextTier.minReferrals}
                      </span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                  </div>
                )}

                <Separator className="my-4 bg-white/20" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Total Referrals</span>
                    <span className="text-white font-bold" data-testid="text-total-referrals">
                      {stats?.totalReferrals || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Converted</span>
                    <span className="text-emerald-400 font-bold" data-testid="text-converted">
                      {stats?.convertedReferrals || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Total Earned</span>
                    <span className="text-gold-400 font-bold" data-testid="text-total-earned">
                      ${(stats?.totalEarnings || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {tiers.map((tier, idx) => (
              <Card 
                key={tier.name}
                className={`bg-white/10 backdrop-blur-xl border-white/20 ${
                  currentTier.name === tier.name ? 'ring-2 ring-gold-400' : ''
                }`}
                data-testid={`card-tier-${tier.name.toLowerCase()}`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-xl ${tier.bg} flex items-center justify-center mx-auto mb-4`}>
                    {idx === 0 ? <Users className={`w-7 h-7 ${tier.color}`} /> :
                     idx === 1 ? <Star className={`w-7 h-7 ${tier.color}`} /> :
                     idx === 2 ? <Trophy className={`w-7 h-7 ${tier.color}`} /> :
                     <Crown className={`w-7 h-7 ${tier.color}`} />}
                  </div>
                  <h3 className={`text-xl font-bold ${tier.color} mb-1`}>{tier.name}</h3>
                  <p className="text-white/60 text-sm mb-3">
                    {tier.minReferrals}+ referrals
                  </p>
                  <div className="text-3xl font-black text-white">
                    {tier.commission}%
                  </div>
                  <p className="text-white/50 text-xs">commission</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 mb-12">
            <CardHeader>
              <CardTitle className="text-white">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">1. Share Your Link</h3>
                  <p className="text-white/60 text-sm">
                    Copy your unique referral link and share it with friends, colleagues, or your audience
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">2. They Sign Up</h3>
                  <p className="text-white/60 text-sm">
                    When someone uses your link to create an account, they're linked to you
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gold-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">3. Earn Commission</h3>
                  <p className="text-white/60 text-sm">
                    When they subscribe, you earn recurring commission for as long as they stay subscribed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold-400" />
                Recent Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.recentReferrals?.length ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60">No referrals yet. Start sharing your link!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentReferrals.map((ref) => (
                    <div 
                      key={ref.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      data-testid={`referral-${ref.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{ref.email}</div>
                          <div className="text-white/50 text-sm">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={ref.status === 'converted' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                          }
                        >
                          {ref.status}
                        </Badge>
                        {ref.earnings && (
                          <div className="text-gold-400 font-bold mt-1">
                            +${ref.earnings.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
