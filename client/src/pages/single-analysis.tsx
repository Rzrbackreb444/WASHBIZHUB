import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Check, 
  Star, 
  MapPin, 
  TrendingUp, 
  Users, 
  Building2,
  FileText,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Zap,
  Download,
  Mail,
  FileSpreadsheet,
  Presentation,
  ArrowRight,
  Sparkles,
  Crown,
  Clock,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { SiGooglesheets, SiGoogledocs, SiGoogleslides } from "react-icons/si";

// Analysis product types
const ANALYSIS_PRODUCTS = {
  demographic: {
    id: "demographic",
    name: "Demographic Report",
    tagline: "Know Your Market Inside Out",
    description: "Comprehensive population, income, and market analysis for any US location. Understand exactly who your customers are.",
    price: 2900, // $29
    icon: Users,
    color: "bg-blue-500",
    features: [
      "Population within 1, 3, and 5-mile radius",
      "Median household income analysis",
      "Age distribution breakdown",
      "Housing density & renter percentage",
      "Employment statistics",
      "Daytime vs nighttime population",
      "Growth trends (5-year projection)",
      "Interactive charts & visualizations"
    ],
    deliverables: ["PDF Report", "Google Sheets Export"],
    pages: "8-10 pages",
    turnaround: "Instant"
  },
  competition: {
    id: "competition",
    name: "Competition Assessment",
    tagline: "Know Your Rivals",
    description: "Deep-dive analysis of every laundromat within your market radius. Machine counts, pricing, reviews, and opportunity gaps.",
    price: 4900, // $49
    icon: Target,
    color: "bg-orange-500",
    features: [
      "All competitors within 3-mile radius",
      "Machine count comparison",
      "Price benchmarking analysis",
      "Google ratings & review sentiment",
      "Service offerings comparison",
      "Operating hours analysis",
      "Market saturation score",
      "Competitive advantage opportunities",
      "Gap analysis & recommendations"
    ],
    deliverables: ["PDF Report", "Google Sheets Export", "Competitor Map"],
    pages: "12-15 pages",
    turnaround: "Instant"
  },
  valuation: {
    id: "valuation",
    name: "Full CLEANBI Valuation",
    tagline: "Enterprise-Grade Location Intelligence",
    description: "Our flagship 6-factor analysis with business valuation, revenue projections, and investment-grade insights.",
    price: 9900, // $99
    icon: BarChart3,
    color: "bg-emerald-500",
    popular: true,
    features: [
      "Complete CLEANBI 6-Factor Score",
      "Letter grade (A, B, C, or Needs Work)",
      "Demographics + Competition combined",
      "Revenue projection models",
      "Monte Carlo simulation",
      "Business valuation range",
      "ROI & payback analysis",
      "Risk assessment matrix",
      "AI-powered recommendations",
      "Investment summary for lenders"
    ],
    deliverables: ["PDF Report", "Google Sheets", "Google Slides Deck", "Executive Summary"],
    pages: "20-25 pages",
    turnaround: "Instant"
  },
  bundle: {
    id: "bundle",
    name: "Complete Analysis Bundle",
    tagline: "Everything You Need",
    description: "All three reports combined at a 25% discount. Perfect for serious buyers and investors conducting due diligence.",
    price: 12900, // $129 (saves $28)
    originalPrice: 15700,
    icon: Crown,
    color: "bg-gradient-to-r from-amber-500 to-orange-500",
    features: [
      "Full Demographic Report",
      "Complete Competition Assessment", 
      "Full CLEANBI Valuation",
      "Cross-referenced insights",
      "Investment decision framework",
      "Due diligence checklist",
      "Negotiation leverage points",
      "Lender-ready package"
    ],
    deliverables: ["3 PDF Reports", "Master Google Sheets", "Investor Slides Deck", "Executive Brief"],
    pages: "40+ pages",
    turnaround: "Instant",
    savings: 28
  }
};

type ProductId = keyof typeof ANALYSIS_PRODUCTS;

export default function SingleAnalysis() {
  const [selectedProduct, setSelectedProduct] = useState<ProductId | null>(null);
  const [address, setAddress] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const checkoutMutation = useMutation({
    mutationFn: async (data: { address: string; productId: string }) => {
      const response = await apiRequest("/api/single-analysis/checkout", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (productId: ProductId) => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter the address you want to analyze.",
        variant: "destructive",
      });
      return;
    }
    checkoutMutation.mutate({ address: address.trim(), productId });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <>
      <SEO 
        title="Single Analysis Reports | WashBizHub"
        description="Purchase individual demographic reports, competition assessments, and CLEANBI valuations. No subscription required."
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                No Subscription Required
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Professional Location Analysis
                <span className="text-primary block mt-2">Pay Per Report</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Get investment-grade insights for any US location. Comprehensive reports delivered instantly with charts, data visualizations, and actionable recommendations.
              </p>
              
              {/* Address Input */}
              <Card className="max-w-xl mx-auto">
                <CardContent className="pt-6">
                  <Label htmlFor="address" className="text-left block mb-2 font-medium">
                    Enter the address to analyze
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="123 Main St, City, State ZIP"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-10"
                        data-testid="input-analysis-address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.entries(ANALYSIS_PRODUCTS) as [ProductId, typeof ANALYSIS_PRODUCTS[ProductId]][]).map(([id, product]) => {
                const Icon = product.icon;
                const isPopular = 'popular' in product && product.popular;
                
                return (
                  <Card 
                    key={id} 
                    className={`relative flex flex-col ${isPopular ? 'ring-2 ring-primary shadow-lg' : ''}`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1" /> Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 rounded-lg ${product.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription>{product.tagline}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                          {'originalPrice' in product && (
                            <span className="text-lg text-muted-foreground line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        {'savings' in product && (
                          <Badge variant="secondary" className="mt-1">
                            Save ${product.savings}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {product.features.slice(0, 5).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {product.features.length > 5 && (
                          <div className="text-sm text-muted-foreground">
                            +{product.features.length - 5} more...
                          </div>
                        )}
                      </div>
                      
                      {/* Deliverables */}
                      <div className="border-t pt-4 mt-4">
                        <div className="text-xs font-medium text-muted-foreground mb-2">DELIVERABLES</div>
                        <div className="flex flex-wrap gap-1">
                          {product.deliverables.map((del, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {del.includes('PDF') && <FileText className="w-3 h-3 mr-1" />}
                              {del.includes('Sheets') && <SiGooglesheets className="w-3 h-3 mr-1" />}
                              {del.includes('Slides') && <SiGoogleslides className="w-3 h-3 mr-1" />}
                              {del}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {product.pages}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" /> {product.turnaround}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full"
                        variant={isPopular ? "default" : "outline"}
                        onClick={() => handlePurchase(id)}
                        disabled={checkoutMutation.isPending}
                        data-testid={`button-purchase-${id}`}
                      >
                        {checkoutMutation.isPending ? "Processing..." : "Purchase Report"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What's In Every Report</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Each report is packed with professional visualizations, actionable insights, and export options for your workflow.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Rich Visualizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Interactive bar & line charts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Pie charts for demographics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Radar charts for scoring
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Heat maps for competition
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Comparison tables
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500" /> Professional PDF report
                    </li>
                    <li className="flex items-center gap-2">
                      <SiGooglesheets className="w-4 h-4 text-green-600" /> Google Sheets with formulas
                    </li>
                    <li className="flex items-center gap-2">
                      <SiGoogleslides className="w-4 h-4 text-yellow-600" /> Investor presentation deck
                    </li>
                    <li className="flex items-center gap-2">
                      <SiGoogledocs className="w-4 h-4 text-blue-600" /> Executive summary doc
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-500" /> Email delivery
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>AI-Powered Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Personalized recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Risk factor analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Opportunity scoring
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Market positioning advice
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Investment thesis summary
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Upsell to All-Access */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Crown className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Need Unlimited Analyses?</h3>
                      <p className="text-muted-foreground">
                        All-Access members get unlimited CLEANBI reports, all calculators, courses, and more for just $49/month.
                      </p>
                    </div>
                  </div>
                  <Button asChild size="lg">
                    <Link href="/pricing">
                      View All-Access <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Secure Stripe Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>30-Day Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
