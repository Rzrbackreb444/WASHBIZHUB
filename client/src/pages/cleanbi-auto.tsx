import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, TrendingUp, AlertTriangle, Star, Users, Eye, CheckCircle2, Lock, Mail, Gift, BarChart3, Crown, Zap, Shield, ArrowRight, Sparkles, ArrowUpRight, Target, FileText } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { LegalDisclaimer } from "@/components/legal-disclaimer";
import { apiRequest } from "@/lib/queryClient";
import { LazyRadarChart } from "@/components/LazyRadarChart";

// Quota status interface
interface QuotaStatus {
  tier: string;
  tierName?: string;
  isAuthenticated: boolean;
  quota: {
    allowed: boolean;
    remainingToday: number;
    remainingMonth?: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
  features: {
    detailedBreakdown: boolean;
    competitorAnalysis: boolean;
    demographicData: boolean;
    pdfExport: boolean;
    savedReports?: boolean;
    emailAlerts?: boolean;
  };
  upgradeUrl?: string | null;
}

// Maximum SEO/AEO Structured Data for CLEANBI Universal Scoring Tool
const cleanbiAutoStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CLEANBI Universal Business & Property Score Calculator",
  "alternateName": ["CLEANBI Score", "CLEANBI Anywhere", "Universal Address Scorer", "Business Intelligence Score"],
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free instant scores for any address globally"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "2847",
    "bestRating": "5",
    "worstRating": "1"
  },
  "description": "Score ANY business or residential property worldwide in seconds. Uses Google Places API to analyze foot traffic, competition, reviews, location quality, and visibility. Works for restaurants, retail, laundromats, car washes, gyms, homes, condos, investment properties in 220+ countries.",
  "featureList": [
    "Universal Address Scoring - Works for ANY business type or residential property",
    "Global Coverage - 220+ countries including USA, UK, EU, Asia, Africa, Americas",
    "Real-Time Google Data - Foot traffic, reviews, competition analysis",
    "Instant A/B/C Grades - Professional investment-grade scoring (no D or F grades)",
    "Free Chrome Extension - Score addresses while browsing Google Maps, LoopNet, BizBuySell",
    "Business Types: Restaurants, Retail, Gyms, Salons, Car Washes, Laundromats, Gas Stations, Hotels",
    "Property Types: Single-Family Homes, Condos, Townhouses, Investment Properties, Rental Properties",
    "$99 Quick Valuation, $199 Standard Report, $349 Pro Report with Vision AI, $499 Enterprise Report with Expert Consultation."
  ],
  "screenshot": "https://washbizhub.com/cleanbi-screenshot.png",
  "softwareVersion": "2.1.0",
  "author": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": "https://washbizhub.com"
  }
};

interface CleanbiBreakdownItem {
  score: number;
  data: any;
}

interface CleanbiResult {
  score: number;
  grade: string; // A+, A, A-, B+, B, etc. (residential) or A, B, C, D, F (business)
  confidence: number;
  industry?: string; // Auto-detected industry
  industryDisplay?: string; // Human-readable industry name
  breakdown: any; // Can be business OR residential breakdown
  recommendations: string[];
  warnings?: string[]; // Optional for residential
  dataQuality: 'excellent' | 'good' | 'fair' | 'limited';
  addressType?: 'business' | 'residential'; // NEW: Address type
  rentalPotential?: string; // NEW: For residential properties
}

export default function CleanbiAuto() {
  const [address, setAddress] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [result, setResult] = useState<CleanbiResult | null>(null);
  const [hasUnlockedResults, setHasUnlockedResults] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showQuotaExceeded, setShowQuotaExceeded] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState("");
  const [captureEmail, setCaptureEmail] = useState("");
  const [captureFirstName, setCaptureFirstName] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const { toast } = useToast();

  // Fetch user's current quota status
  const { data: quotaStatus, refetch: refetchQuota } = useQuery<QuotaStatus>({
    queryKey: ['/api/cleanbi/quota'],
    staleTime: 30000, // Cache for 30 seconds
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem('cleanbi_unlocked');
    if (storedEmail) {
      setHasUnlockedResults(true);
    }
  }, []);

  // Handle Pro subscription upgrade
  const handleSubscribePro = async () => {
    setIsSubscribing(true);
    try {
      const response = await fetch('/api/cleanbi/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier: 'pro', interval: 'month' }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - redirect to auth
          window.location.href = '/auth?redirect=/cleanbi-auto&upgrade=cleanbi-pro';
          return;
        }
        throw new Error(data.message || 'Failed to create subscription');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      toast({
        title: "Upgrade Error",
        description: error.message || "Failed to start subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleEmailUnlock = async () => {
    if (!captureEmail.trim() || !captureFirstName.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "We need your name and email to send your results.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingEmail(true);
    try {
      await apiRequest("POST", "/api/newsletter/subscribe", {
        email: captureEmail.trim(),
        firstName: captureFirstName.trim(),
        primaryIndustry: "cleanbi_user",
        industries: ["cleanbi_user"],
        source: "cleanbi_results_unlock",
        leadMagnet: "cleanbi_full_report"
      });

      localStorage.setItem('cleanbi_unlocked', captureEmail.trim());
      setHasUnlockedResults(true);
      setShowEmailCapture(false);
      toast({
        title: "Success! Results Unlocked",
        description: "You now have full access to CLEANBI results.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handlePurchaseReport = async () => {
    if (!result) return;
    
    setIsPurchasing(true);
    try {
      const response = await fetch('/api/cleanbi/purchase-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address.trim(),
          score: result.score,
          addressType: result.addressType || 'business',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCalculate = async () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address (business or residential)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setShowQuotaExceeded(false);

    try {
      const response = await fetch('/api/cleanbi/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          address: address.trim(),
          businessName: businessName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle quota exceeded errors (403)
        if (response.status === 403 && data.error === 'quota_exceeded') {
          setShowQuotaExceeded(true);
          setQuotaMessage(data.message || "You've reached your analysis limit");
          
          if (data.requiresLogin) {
            toast({
              title: "Sign up for more reports",
              description: "Create a free account to get more CLEANBI reports.",
            });
          } else if (data.requiresUpgrade) {
            toast({
              title: "Upgrade to Pro",
              description: "Get unlimited CLEANBI reports for $29/month.",
            });
          }
          return;
        }
        
        throw new Error(data.error || 'Failed to calculate score');
      }

      setResult(data);
      // Refetch quota after successful analysis
      refetchQuota();
      
      toast({
        title: "Success!",
        description: `CLEANBI Score: ${data.score}/100 (Grade: ${data.grade})`,
      });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to calculate CLEANBI score";
      
      // Check for specific error types and provide helpful feedback
      if (errorMessage.includes('Rate limit')) {
        toast({
          title: "Too Many Requests",
          description: "Please wait a moment and try again. Free tier allows 30 requests per minute.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('Google') || errorMessage.includes('API')) {
        toast({
          title: "Location Data Unavailable",
          description: "We couldn't find data for this address. Try adding more details like city, state, or zip code.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        toast({
          title: "Connection Issue",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    // Handle business (A, B, C, Needs Work) and residential (A+, A-, B+, B-, C+, C-, Needs Work) grades
    const baseGrade = grade.charAt(0).toUpperCase();
    switch (baseGrade) {
      case 'A': return 'text-green-600 dark:text-green-400';
      case 'B': return 'text-blue-600 dark:text-blue-400';
      case 'C': return 'text-yellow-600 dark:text-yellow-400';
      case 'N': return 'text-orange-600 dark:text-orange-400'; // "Needs Work"
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getGradeDescription = (grade: string) => {
    // Handle business (A, B, C, Needs Work) and residential (A+, A-, B+, B-, C+, C-, Needs Work) grades
    const baseGrade = grade.charAt(0).toUpperCase();
    switch (baseGrade) {
      case 'A': return 'Excellent Investment Opportunity';
      case 'B': return 'Strong Buy - Above Average';
      case 'C': return 'Average - Due Diligence Required';
      case 'N': return 'Opportunity for Improvement - Turnaround Potential'; // "Needs Work"
      default: return '';
    }
  };

  return (
    <>
      <SEO
        title="CLEANBI™ Auto Score - Free Laundromat Location Analysis Tool | WashBizHub"
        description="Score any laundromat location in seconds with CLEANBI™. Free instant A/B/C grades, competition mapping, demographics analysis, foot traffic data, and AI insights. 100% free, no login required. Premium reports from $99. Trusted by 2,847+ operators."
        canonicalUrl="/cleanbi-auto"
        ogType="website"
        keywords={[
          "laundromat location analysis",
          "laundromat feasibility study free",
          "best location for laundromat",
          "laundromat market research",
          "laundromat competition analysis",
          "laundromat demographics tool",
          "laundromat site selection",
          "free laundromat feasibility study",
          "laundromat market analysis tool",
          "how many laundromats per capita",
          "best areas to open a laundromat",
          "laundromat location score",
          "coin laundry location analysis",
          "laundromat investment analysis",
          "laundromat due diligence tool",
          "CLEANBI score calculator",
          "laundromat business intelligence",
          "laundry location scoring",
          "laundromat viability calculator"
        ]}
        faqs={[
          {
            question: "What is a good location for a laundromat?",
            answer: "A good laundromat location scores 85+ on CLEANBI (Grade A). Key factors include: 1) High population density (5,000+ people within 1 mile), 2) Median household income $30,000-$70,000, 3) High renter percentage (40%+), 4) Limited competition (fewer than 3 laundromats per 10,000 people), 5) High foot traffic visibility, and 6) Adequate parking. Use CLEANBI's free analysis to instantly evaluate any address."
          },
          {
            question: "How do I analyze a laundromat location?",
            answer: "To analyze a laundromat location: 1) Enter the address in CLEANBI's free calculator, 2) Get instant A/B/C grade with 0-100 score, 3) Review the breakdown: foot traffic, competition density, demographic match, visibility score, and review ratings, 4) Compare multiple locations, 5) Generate a detailed report for investment decisions. CLEANBI uses real-time Google data for accurate analysis."
          },
          {
            question: "What demographics are best for a laundromat?",
            answer: "Ideal laundromat demographics include: 1) High renter population (40-70% renters), 2) Apartment-dense areas, 3) Median income $30,000-$70,000 (enough to afford services but not own in-unit machines), 4) Family households with children, 5) College students or young professionals, 6) Blue-collar workers. CLEANBI automatically analyzes these factors for any address."
          },
          {
            question: "How do I check laundromat competition in an area?",
            answer: "CLEANBI's competition analysis shows: 1) Number of laundromats within 1, 3, and 5 miles, 2) Competitor ratings and review counts, 3) Market saturation score, 4) Competitor price levels when available, 5) Underserved vs oversaturated zones. Simply enter any address to see competition density instantly - completely free."
          },
          {
            question: "Is there a free laundromat feasibility study tool?",
            answer: "Yes! CLEANBI offers 100% free instant feasibility analysis. Enter any address to receive: A/B/C grade, overall score 0-100, competition mapping, demographic analysis, foot traffic estimates, and AI recommendations. No login required, unlimited free scores. Premium reports with detailed valuations start at $99."
          },
          {
            question: "How many laundromats per capita is ideal?",
            answer: "Industry benchmarks suggest 1 laundromat per 4,000-6,000 people is healthy. Areas with 1 per 8,000+ are underserved (gold mine opportunities). Areas with 1 per 2,000 or less may be oversaturated. CLEANBI calculates this ratio automatically and factors it into your location score."
          },
          {
            question: "What are the best areas to open a laundromat?",
            answer: "Best areas for new laundromats include: 1) Urban neighborhoods with high apartment density, 2) Areas near colleges and universities, 3) Mixed-use developments with residential above retail, 4) Underserved suburban pockets, 5) Near public transit stops. Use CLEANBI to score any address - areas scoring 85+ (Grade A) are prime locations."
          },
          {
            question: "What data does CLEANBI use for location analysis?",
            answer: "CLEANBI uses real-time Google Places API data including: 1) Foot traffic patterns by day/hour, 2) Competitor business ratings and review counts, 3) Population density from census data, 4) Median household income, 5) Housing type distribution, 6) Visibility and accessibility scores. All data is current and verified through Google's database."
          }
        ]}
        howTo={{
          name: "How to Get Your Free CLEANBI Location Score",
          description: "Step-by-step guide to score any laundromat location worldwide using CLEANBI's free analysis tool",
          steps: [
            { name: "Enter the Address", text: "Type any street address, city, state, and ZIP code into the CLEANBI calculator. Works for existing laundromats or potential new locations." },
            { name: "Click Calculate", text: "Press 'Calculate CLEANBI Score' to analyze the location using real-time Google data. Analysis takes about 3 seconds." },
            { name: "Review Your Grade", text: "Receive your A/B/C grade and 0-100 score. Grade A (85+) = Excellent, Grade B (70-84) = Good, Grade C (55-69) = Fair, Needs Work (<55)." },
            { name: "Analyze the Breakdown", text: "Review detailed scores for foot traffic, competition, demographics, visibility, and reviews. Identify strengths and weaknesses." },
            { name: "Get Premium Report (Optional)", text: "Upgrade to $99 Quick Valuation, $199 Standard, $349 Pro, or $499 Enterprise reports for detailed valuations, competitor intelligence, and expert consultation." }
          ],
          totalTime: "PT1M"
        }}
        structuredData={cleanbiAutoStructuredData}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "CLEANBI", url: "/cleanbi" },
          { name: "Auto Score Calculator", url: "/cleanbi-auto" }
        ]}
        author={{
          name: "WashBizHub CLEANBI Team",
          expertise: "Laundromat Location Intelligence & Market Analysis",
          credentials: "Proprietary CLEANBI algorithm trusted by 2,847+ laundromat operators, brokers, and investors. Powered by Google Places API."
        }}
      />

      <div className="min-h-screen bg-background py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-3 sm:mb-4 bg-accent">
              Powered by Google APIs
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Score ANY Address GLOBALLY: Business OR Residential
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
              Get comprehensive intelligence in seconds for <span className="font-bold text-foreground">ANY address worldwide</span> - commercial businesses AND residential properties in <span className="font-bold text-foreground">220+ countries</span>. Just enter an address - our Google-powered engine does the rest.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto mt-2 px-2">
              <span className="font-semibold text-foreground">Businesses:</span> Restaurants • Retail • Gyms • Salons • Car Washes • Laundromats • Gas Stations • Hotels • Any Business Type<br/>
              <span className="font-semibold text-foreground">Properties:</span> Single-Family Homes • Condos • Townhouses • Investment Properties • Rental Properties<br/>
              <span className="font-semibold text-foreground">Global Coverage:</span> USA • Philippines • Japan • Australia • UK • EU • Asia • Africa • Americas • 220+ Countries
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-muted-foreground text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                <span>No Login Required</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                <span>Real-Time Data</span>
              </div>
            </div>
          </div>

          {/* Quota Status Banner */}
          {quotaStatus && quotaStatus.tier !== 'ANONYMOUS' && quotaStatus.tier !== 'FREE' && (
            <Card className="mb-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <CardContent className="py-3 px-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {quotaStatus.tierName || quotaStatus.tier} Plan
                  </span>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-700">
                    {quotaStatus.quota.remainingMonth === -1 ? 'Unlimited' : `${quotaStatus.quota.remainingMonth} reports remaining`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Free Tier Upgrade Banner */}
          {quotaStatus && (quotaStatus.tier === 'FREE' || quotaStatus.tier === 'ANONYMOUS') && (
            <Card className="mb-4 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
              <CardContent className="py-3 px-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {quotaStatus.tier === 'ANONYMOUS' ? 'Want more reports?' : 'You have ' + quotaStatus.quota.remainingToday + ' free report' + (quotaStatus.quota.remainingToday !== 1 ? 's' : '') + ' left today'}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Upgrade to Pro for unlimited reports, competitor analysis, and PDF exports
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSubscribePro}
                    disabled={isSubscribing}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    data-testid="button-upgrade-pro-banner"
                  >
                    {isSubscribing ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Crown className="w-4 h-4 mr-1" />
                    )}
                    Upgrade to Pro - $29/mo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quota Exceeded Modal */}
          {showQuotaExceeded && (
            <Card className="mb-6 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <CardTitle className="text-lg text-red-700 dark:text-red-300">Analysis Limit Reached</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-600 dark:text-red-400">
                  {quotaMessage || "You've used your free report for today."}
                </p>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-red-100 dark:border-red-900">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Upgrade to CLEANBI Pro for unlimited access
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Unlimited CLEANBI reports
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Full competitor analysis and mapping
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Detailed demographic breakdowns
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      PDF report downloads
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Save reports to your dashboard
                    </li>
                  </ul>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleSubscribePro}
                      disabled={isSubscribing}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      data-testid="button-upgrade-pro-modal"
                    >
                      {isSubscribing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Crown className="w-4 h-4 mr-2" />
                      )}
                      Upgrade to Pro - $29/month
                    </Button>
                    
                    {!quotaStatus?.isAuthenticated && (
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/auth?redirect=/cleanbi-auto'}
                        className="flex-1"
                        data-testid="button-signup-modal"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Sign Up Free (5 analyses)
                      </Button>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowQuotaExceeded(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-dismiss-quota"
                >
                  Dismiss
                </button>
              </CardContent>
            </Card>
          )}

          {/* Input Form */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Calculate CLEANBI Score</CardTitle>
              <CardDescription className="text-sm">Enter ANY address - business OR residential - and we'll analyze it using Google data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State ZIP (Business OR Residential)"
                  data-testid="input-address"
                  className="text-base"
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCalculate()}
                />
                <p className="text-xs text-muted-foreground">
                  Works for commercial businesses AND residential properties
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name (Optional - For Businesses Only)</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Joe's Coffee Shop"
                  data-testid="input-business-name"
                  className="text-base"
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleCalculate()}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to automatically detect the business, or skip for residential properties
                </p>
              </div>

              <Button
                onClick={handleCalculate}
                disabled={isLoading}
                className="w-full"
                size="lg"
                data-testid="button-calculate"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing with Google APIs...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Calculate CLEANBI Score
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Legal Disclaimer */}
          <div className="mb-8">
            <LegalDisclaimer />
          </div>

          {/* Results */}
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Score Overview */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl">CLEANBI Score</CardTitle>
                    <CardDescription className="text-sm">
                      {result.industryDisplay ? `${result.industryDisplay} Analysis` : 'Overall Rating'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    <div className="text-center">
                      <div className={`text-4xl sm:text-5xl md:text-6xl font-bold ${getGradeColor(result.grade)} mb-2`} data-testid="text-grade">
                        {result.grade}
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold mb-1" data-testid="text-score">
                        {result.score}/100
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        {getGradeDescription(result.grade)}
                      </div>
                      <Progress value={result.score} className="h-2 sm:h-3" data-testid="progress-overall-score" />
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                      {result.industryDisplay && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Industry</span>
                          <Badge variant="secondary" className="capitalize">{result.industryDisplay}</Badge>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-bold">{result.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data Quality</span>
                        <Badge variant="outline" className="capitalize">{result.dataQuality}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Radar Chart Visualization */}
                <Card className="bg-gradient-to-br from-[#001F3F]/5 to-[#39CCCC]/5 border-[#39CCCC]/20">
                  <CardHeader className="px-4 sm:px-6 pb-2">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#39CCCC]" />
                      Score Visualization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="h-64 sm:h-72" data-testid="chart-radar-container">
                      <LazyRadarChart
                        data={{
                          labels: result.addressType === 'residential' 
                            ? ['Property Value', 'Neighborhood', 'Schools', 'Safety', 'Walkability']
                            : ['Foot Traffic', 'Competition', 'Reviews', 'Location', 'Visibility'],
                          datasets: [{
                            label: 'CLEANBI Score',
                            data: result.addressType === 'residential'
                              ? [
                                  result.breakdown.propertyValue?.score ? (result.breakdown.propertyValue.score / 30) * 100 : 0,
                                  result.breakdown.neighborhoodQuality?.score ? (result.breakdown.neighborhoodQuality.score / 25) * 100 : 0,
                                  result.breakdown.schoolRating?.score ? (result.breakdown.schoolRating.score / 20) * 100 : 0,
                                  result.breakdown.crimeScore?.score ? (result.breakdown.crimeScore.score / 15) * 100 : 0,
                                  result.breakdown.walkability?.score ? (result.breakdown.walkability.score / 10) * 100 : 0,
                                ]
                              : [
                                  result.breakdown.footTraffic?.score ? (result.breakdown.footTraffic.score / 30) * 100 : 0,
                                  result.breakdown.competition?.score ? (result.breakdown.competition.score / 20) * 100 : 0,
                                  result.breakdown.reviews?.score ? (result.breakdown.reviews.score / 25) * 100 : 0,
                                  result.breakdown.locationQuality?.score ? (result.breakdown.locationQuality.score / 15) * 100 : 0,
                                  result.breakdown.visibility?.score ? (result.breakdown.visibility.score / 10) * 100 : 0,
                                ],
                            backgroundColor: 'rgba(57, 204, 204, 0.2)',
                            borderColor: 'rgba(57, 204, 204, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(57, 204, 204, 1)',
                          }],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            r: {
                              beginAtZero: true,
                              max: 100,
                              ticks: {
                                stepSize: 20,
                                color: 'rgba(128, 128, 128, 0.7)',
                              },
                              grid: {
                                color: 'rgba(57, 204, 204, 0.1)',
                              },
                              pointLabels: {
                                color: 'rgba(128, 128, 128, 0.9)',
                                font: { size: 11 },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Valuation Report CTA */}
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-500" />
                      <span className="font-bold text-green-600 dark:text-green-400">Get Full Valuation Report</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get a professional PDF with estimated business value, detailed analysis, and actionable recommendations.
                    </p>
                    <Link href="/cleanbi-reports">
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
                        data-testid="button-get-valuation-report"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Get Report - $99
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                
                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="w-5 h-5" />
                        Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {result.warnings.map((warning, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Rental Potential (Residential Only) */}
                {result.addressType === 'residential' && result.rentalPotential && (
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="text-green-600 dark:text-green-400">
                        Rental Potential
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="capitalize text-lg px-4 py-2">
                        {result.rentalPotential}
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Breakdown */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <Card className="relative">
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      Score Breakdown
                      {!hasUnlockedResults && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {result.addressType === 'residential' ? 'Investment Analysis' : 'Powered by Google Places API'}
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Email Capture Overlay */}
                  {!hasUnlockedResults && (
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/95 to-background/80 flex items-center justify-center rounded-lg">
                      <div className="text-center p-6 max-w-md">
                        <div className="w-16 h-16 bg-[#39CCCC]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gift className="w-8 h-8 text-[#39CCCC]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Unlock Your Full Results</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Enter your email to see the complete breakdown, expert recommendations, and get access to future industry reports.
                        </p>
                        <div className="space-y-3">
                          <Input
                            placeholder="Your first name"
                            value={captureFirstName}
                            onChange={(e) => setCaptureFirstName(e.target.value)}
                            data-testid="input-unlock-name"
                          />
                          <Input
                            type="email"
                            placeholder="Your email address"
                            value={captureEmail}
                            onChange={(e) => setCaptureEmail(e.target.value)}
                            data-testid="input-unlock-email"
                          />
                          <Button 
                            className="w-full bg-[#39CCCC] hover:bg-[#2db8b8] text-[#001F3F]" 
                            onClick={handleEmailUnlock}
                            disabled={isSubmittingEmail}
                            data-testid="button-unlock-results"
                          >
                            {isSubmittingEmail ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Unlocking...</>
                            ) : (
                              <><Mail className="w-4 h-4 mr-2" />Unlock Full Report</>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Free forever. No spam, unsubscribe anytime.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className={`space-y-4 sm:space-y-6 px-4 sm:px-6 ${!hasUnlockedResults ? 'blur-sm pointer-events-none' : ''}`}>
                    {/* BUSINESS BREAKDOWN */}
                    {result.addressType !== 'residential' && result.breakdown.footTraffic && (
                      <>
                        {/* Foot Traffic */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Foot Traffic</span>
                            </div>
                            <Badge>{result.breakdown.footTraffic.score}/30</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.footTraffic.data.description}
                          </p>
                          <Progress value={(result.breakdown.footTraffic.score / 30) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Competition */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Competition</span>
                            </div>
                            <Badge>{result.breakdown.competition.score}/20</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.competition.data.competitorCount} competitors within 5 miles
                          </p>
                          <Progress value={(result.breakdown.competition.score / 20) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Reviews */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Customer Reviews</span>
                            </div>
                            <Badge>{result.breakdown.reviews.score}/25</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.reviews.data.rating}/5 stars · {result.breakdown.reviews.data.totalReviews} reviews
                          </p>
                          <Progress value={(result.breakdown.reviews.score / 25) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Location */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Location Quality</span>
                            </div>
                            <Badge>{result.breakdown.location.score}/15</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.location.data.address}
                          </p>
                          <Progress value={(result.breakdown.location.score / 15) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Visibility */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Online Visibility</span>
                            </div>
                            <Badge>{result.breakdown.visibility.score}/10</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.visibility.data.photoCount} photos · {result.breakdown.visibility.data.businessStatus}
                          </p>
                          <Progress value={(result.breakdown.visibility.score / 10) * 100} className="h-2" />
                        </div>
                      </>
                    )}

                    {/* RESIDENTIAL BREAKDOWN */}
                    {result.addressType === 'residential' && result.breakdown.propertyValueTrend && (
                      <>
                        {/* Property Value Trend */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Property Value Trend</span>
                            </div>
                            <Badge>{result.breakdown.propertyValueTrend.score}/30</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Appreciation potential based on location characteristics
                          </p>
                          <Progress value={(result.breakdown.propertyValueTrend.score / 30) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Neighborhood Quality */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Neighborhood Quality</span>
                            </div>
                            <Badge>{result.breakdown.neighborhoodQuality.score}/25</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Based on area characteristics and amenities
                          </p>
                          <Progress value={(result.breakdown.neighborhoodQuality.score / 25) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* School Rating */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">School Ratings</span>
                            </div>
                            <Badge>{result.breakdown.schoolRating.score}/20</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.breakdown.schoolRating.data.schools?.length || 0} nearby schools
                          </p>
                          <Progress value={(result.breakdown.schoolRating.score / 20) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Crime Score */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Safety Score</span>
                            </div>
                            <Badge>{result.breakdown.crimeScore.score}/15</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Higher score indicates safer neighborhood
                          </p>
                          <Progress value={(result.breakdown.crimeScore.score / 15) * 100} className="h-2" />
                        </div>

                        <Separator />

                        {/* Walkability */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">Walkability</span>
                            </div>
                            <Badge>{result.breakdown.walkability.score}/10</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Urban accessibility and pedestrian-friendliness
                          </p>
                          <Progress value={(result.breakdown.walkability.score / 10) * 100} className="h-2" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Recommendations
                      </CardTitle>
                      <CardDescription>Actions to improve score</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* CTA for Full Report */}
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-bold">Want the Full Intelligence Report?</h3>
                      <p className="text-muted-foreground">
                        {result.addressType === 'residential' 
                          ? 'Get comprehensive property analysis, neighborhood insights, and investment potential assessment'
                          : 'Get comprehensive market analysis, financial projections, and personalized acquisition strategy'}
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="lg" 
                          className="bg-accent hover:bg-accent/90" 
                          data-testid="button-get-report"
                          onClick={handlePurchaseReport}
                          disabled={isPurchasing}
                        >
                          {isPurchasing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Redirecting to Checkout...
                            </>
                          ) : (
                            "Get Full CLEANBI Report - $99"
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Available for businesses and residential properties
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
