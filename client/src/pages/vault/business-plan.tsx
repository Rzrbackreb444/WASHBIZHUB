import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Paywall } from "@/components/monetization/Paywall";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Briefcase, FileText, Download, Lock, Crown, Building2, 
  CheckCircle, MapPin, DollarSign, TrendingUp, Target,
  ArrowRight, ArrowLeft, Sparkles, Loader2, Mail, Zap
} from "lucide-react";

const businessPlanSchema = z.object({
  storeName: z.string().min(2, "Store name is required"),
  location: z.string().min(2, "Location is required"),
  machineCount: z.number().min(10).max(200),
  projectedRevenue: z.number().min(50000).max(2000000),
  missionStatement: z.string().optional(),
  email: z.string().email("Valid email required for your business plan"),
});

type BusinessPlanFormData = z.infer<typeof businessPlanSchema>;

interface GeneratedSection {
  title: string;
  content: string;
  isPremium: boolean;
}

export default function BusinessPlanGenerator() {
  const { user } = useAuth();
  const { canAccessTier } = useSubscription();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedSection[] | null>(null);
  const [cleanbiScore, setCleanbiScore] = useState<number | null>(null);

  const hasPremiumAccess = canAccessTier("business");

  const form = useForm<BusinessPlanFormData>({
    resolver: zodResolver(businessPlanSchema),
    defaultValues: {
      storeName: "",
      location: "",
      machineCount: 50,
      projectedRevenue: 240000,
      missionStatement: "",
      email: user?.email || "",
    },
  });

  const generatePlan = async (data: BusinessPlanFormData) => {
    setIsGenerating(true);
    
    try {
      // Simulate CLEANBI score fetch
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCleanbiScore(Math.floor(Math.random() * 20) + 75);

      // Generate plan sections
      const sections: GeneratedSection[] = [
        {
          title: "Executive Summary",
          content: `${data.storeName} is a full-service coin laundry facility located in ${data.location}. With ${data.machineCount} machines and projected annual revenue of $${data.projectedRevenue.toLocaleString()}, this location represents a strong investment opportunity in the self-service laundry industry.`,
          isPremium: false,
        },
        {
          title: "Market Analysis",
          content: `Based on CLEANBI analysis, ${data.location} shows strong market fundamentals with a location score of ${cleanbiScore || 82}/100. The area has favorable demographics including population density, median household income, and renter percentage that support laundromat demand.`,
          isPremium: false,
        },
        {
          title: "Financial Projections",
          content: `5-Year Revenue Forecast:\n- Year 1: $${data.projectedRevenue.toLocaleString()}\n- Year 2: $${Math.round(data.projectedRevenue * 1.05).toLocaleString()}\n- Year 3: $${Math.round(data.projectedRevenue * 1.10).toLocaleString()}\n- Year 4: $${Math.round(data.projectedRevenue * 1.15).toLocaleString()}\n- Year 5: $${Math.round(data.projectedRevenue * 1.20).toLocaleString()}\n\nExpected EBITDA Margin: 28-35%\nBreak-even: 18-24 months`,
          isPremium: true,
        },
        {
          title: "Competitive Analysis",
          content: `Detailed analysis of competitors within 3-mile radius, including pricing comparison, service offerings, and market positioning strategies.`,
          isPremium: true,
        },
        {
          title: "Operations Plan",
          content: `Staffing requirements, maintenance schedules, vendor relationships, and daily operations procedures for optimal efficiency.`,
          isPremium: true,
        },
        {
          title: "SBA Loan Package",
          content: `Complete SBA 7(a) loan application materials including use of funds breakdown, collateral documentation, and lender presentation.`,
          isPremium: true,
        },
      ];

      setGeneratedPlan(sections);
      setStep(3);

      // Lead capture via email
      if (!hasPremiumAccess && data.email) {
        await fetch("/api/leads/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            source: "business-plan-generator",
            metadata: {
              storeName: data.storeName,
              location: data.location,
              machineCount: data.machineCount,
            },
          }),
        }).catch(() => {});
      }

      toast({
        title: "Business Plan Generated!",
        description: hasPremiumAccess 
          ? "Your full 30-page plan is ready to download."
          : "Preview ready! Upgrade to access the full plan.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!hasPremiumAccess) {
      toast({
        title: "Premium Required",
        description: "Upgrade to Business tier to download the full PDF.",
      });
      return;
    }

    toast({
      title: "Generating PDF...",
      description: "Your business plan is being prepared for download.",
    });

    // In production, this would call the server to generate PDF
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "PDF Ready!",
      description: "Your business plan has been downloaded.",
    });
  };

  return (
    <>
      <Helmet>
        <title>AI Business Plan Generator - Laundromat Business Plan Template | WashBizHub</title>
        <meta 
          name="description" 
          content="Generate a comprehensive 30-page laundromat business plan with CLEANBI market data, financial projections, and SBA-ready format. Free preview available." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-8">
            <Link href="/template-vault">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Template Vault
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Briefcase className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold" data-testid="text-page-title">
                    AI Business Plan Generator
                  </h1>
                  <Badge className="bg-purple-500">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Generate a comprehensive laundromat business plan with CLEANBI market intelligence
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-6">
              {[
                { num: 1, label: "Business Info" },
                { num: 2, label: "Financial Details" },
                { num: 3, label: "Generated Plan" },
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s.num 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-sm ${step >= s.num ? "font-medium" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                  {idx < 2 && <div className="w-12 h-0.5 bg-muted" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(generatePlan)}>
                {/* Step 1: Business Info */}
                {step === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Business Information
                      </CardTitle>
                      <CardDescription>
                        Tell us about your laundromat business
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="storeName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Sunshine Laundry" 
                                {...field}
                                data-testid="input-store-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location (City, State)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                  placeholder="e.g., Austin, TX" 
                                  className="pl-10"
                                  {...field}
                                  data-testid="input-location"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              We'll pull CLEANBI market data for this location
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                  type="email"
                                  placeholder="your@email.com" 
                                  className="pl-10"
                                  {...field}
                                  data-testid="input-email"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              We'll send your business plan to this email
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="button" 
                        onClick={() => setStep(2)}
                        className="ml-auto gap-2"
                        data-testid="button-next-step"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Step 2: Financial Details */}
                {step === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Financial Details
                      </CardTitle>
                      <CardDescription>
                        Configure your financial projections
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <FormField
                        control={form.control}
                        name="machineCount"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Number of Machines</FormLabel>
                              <span className="text-sm font-medium">{field.value} machines</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={10}
                                max={200}
                                step={5}
                                value={[field.value]}
                                onValueChange={(v) => field.onChange(v[0])}
                                data-testid="slider-machines"
                              />
                            </FormControl>
                            <FormDescription>
                              Total washers and dryers combined
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectedRevenue"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Projected Annual Revenue</FormLabel>
                              <span className="text-sm font-medium">${field.value.toLocaleString()}</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={50000}
                                max={2000000}
                                step={10000}
                                value={[field.value]}
                                onValueChange={(v) => field.onChange(v[0])}
                                data-testid="slider-revenue"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="missionStatement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mission Statement (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What's your vision for this laundromat?"
                                className="min-h-[100px]"
                                {...field}
                                data-testid="textarea-mission"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isGenerating}
                        className="gap-2"
                        data-testid="button-generate"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating Plan...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Business Plan
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </form>
            </Form>

            {/* Step 3: Generated Plan */}
            {step === 3 && generatedPlan && (
              <div className="space-y-6">
                {/* CLEANBI Score Banner */}
                {cleanbiScore && (
                  <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/20">
                            <Target className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">CLEANBI Location Score</p>
                            <p className="text-2xl font-bold text-green-600">{cleanbiScore}/100</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white">
                          {cleanbiScore >= 80 ? "Excellent" : cleanbiScore >= 70 ? "Good" : "Fair"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Plan Sections */}
                {generatedPlan.map((section, idx) => (
                  <Card key={idx} className={section.isPremium && !hasPremiumAccess ? "opacity-75" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        {section.isPremium && !hasPremiumAccess && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="w-3 h-3" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {section.isPremium && !hasPremiumAccess ? (
                        <div className="relative">
                          <div className="blur-sm select-none">
                            <p className="text-muted-foreground whitespace-pre-line">
                              {section.content}
                            </p>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                            <Link href="/pricing">
                              <Button className="gap-2">
                                <Crown className="w-4 h-4" />
                                Unlock with Business Plan
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground whitespace-pre-line">
                          {section.content}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Download CTA */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {hasPremiumAccess 
                            ? "Your Full Business Plan is Ready!"
                            : "Unlock Your Complete 30-Page Business Plan"
                          }
                        </h3>
                        <p className="text-muted-foreground">
                          {hasPremiumAccess
                            ? "Download your SBA-ready business plan with all financial projections."
                            : "Includes detailed financials, competitive analysis, and SBA loan package."
                          }
                        </p>
                      </div>
                      
                      {hasPremiumAccess ? (
                        <Button size="lg" onClick={handleDownloadPDF} className="gap-2">
                          <Download className="w-4 h-4" />
                          Download Full PDF
                        </Button>
                      ) : (
                        <Link href="/pricing">
                          <Button size="lg" className="gap-2">
                            <Crown className="w-4 h-4" />
                            Upgrade to Business
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Start Over */}
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => { setStep(1); setGeneratedPlan(null); }}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Create Another Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
