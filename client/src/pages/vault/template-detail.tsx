import { useState } from "react";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, Download, Lock, Crown, FileText, CheckCircle,
  Loader2, AlertCircle, Star, Shield, Clock
} from "lucide-react";

interface TemplateProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  accessTier: "free" | "basic" | "pro" | "enterprise";
  oneTimePriceCents: number | null;
  features: string[];
  previewUrl: string | null;
  downloadUrl: string | null;
}

const TEMPLATE_DATA: Record<string, { name: string; description: string; category: string; features: string[]; accessTier: string; price: number | null }> = {
  "business-plan": {
    name: "AI Business Plan Generator",
    description: "Generate a comprehensive laundromat business plan with CLEANBI market data integration.",
    category: "Business Planning",
    features: [
      "Executive summary auto-generation",
      "Financial projections from CLEANBI data",
      "Market analysis integration",
      "Competitive landscape assessment",
      "Funding requirements calculator",
      "Export to PDF, Word, and Google Docs"
    ],
    accessTier: "pro",
    price: 4900,
  },
  "lease-checklist": {
    name: "Lease Red Flag Checklist",
    description: "Larry Larsen's 50+ trap alerts for lease negotiation. Protect your investment.",
    category: "Due Diligence",
    features: [
      "50+ lease trap alerts",
      "Severity-based categorization",
      "Progress tracking",
      "Negotiation scripts",
      "Legal clause templates",
      "PDF download"
    ],
    accessTier: "basic",
    price: 2900,
  },
  "due-diligence": {
    name: "Due Diligence Master Checklist",
    description: "Complete 100-point inspection checklist for evaluating laundromat acquisitions.",
    category: "Due Diligence",
    features: [
      "100+ inspection points",
      "Equipment assessment forms",
      "Financial verification steps",
      "Lease review guidelines",
      "Environmental checks",
      "Printable PDF format"
    ],
    accessTier: "pro",
    price: 3900,
  },
  "loi-template": {
    name: "Letter of Intent Template",
    description: "Professional LOI template for laundromat acquisitions with legal-reviewed language.",
    category: "Legal Documents",
    features: [
      "Customizable terms",
      "Legal review notes",
      "Contingency clauses",
      "Due diligence timeline",
      "Word format for editing",
      "Sample completed LOI"
    ],
    accessTier: "basic",
    price: 1900,
  },
  "financial-model": {
    name: "Financial Projection Model",
    description: "5-year financial model with revenue projections, expense tracking, and ROI analysis.",
    category: "Financial Tools",
    features: [
      "5-year projections",
      "Revenue modeling",
      "Expense tracking",
      "Cash flow analysis",
      "Scenario comparison",
      "Excel + Google Sheets"
    ],
    accessTier: "pro",
    price: 4900,
  },
  "employee-handbook": {
    name: "Employee Handbook Template",
    description: "Complete employee handbook for laundromat staff with policies and procedures.",
    category: "Operations",
    features: [
      "Policies and procedures",
      "Job descriptions",
      "Safety guidelines",
      "Customer service standards",
      "Disciplinary procedures",
      "Customizable Word format"
    ],
    accessTier: "basic",
    price: 2900,
  },
  "marketing-plan": {
    name: "Marketing Plan Template",
    description: "Strategic marketing plan for laundromat growth with digital and local tactics.",
    category: "Marketing",
    features: [
      "Market positioning",
      "Digital marketing tactics",
      "Local advertising strategies",
      "Social media calendar",
      "Promotion ideas",
      "Budget templates"
    ],
    accessTier: "basic",
    price: 2400,
  },
  "operational-plan": {
    name: "Operational Excellence Plan",
    description: "SOPs and checklists for running a smooth laundromat operation.",
    category: "Operations",
    features: [
      "Daily operation checklists",
      "Maintenance schedules",
      "Staff training guides",
      "Customer service scripts",
      "Emergency procedures",
      "Quality control forms"
    ],
    accessTier: "pro",
    price: 3900,
  },
};

export default function TemplateDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { canAccessTier, tier } = useSubscription();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templateData = slug ? TEMPLATE_DATA[slug] : null;

  if (!templateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-center">Template Not Found</CardTitle>
            <CardDescription className="text-center">
              This template doesn't exist or may have been moved.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/template-vault">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Template Vault
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const hasAccess = canAccessTier(templateData.accessTier as "free" | "basic" | "pro" | "enterprise");
  const priceDisplay = templateData.price 
    ? `$${(templateData.price / 100).toFixed(2)}` 
    : "Free";

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to purchase this template.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/vault/checkout", {
        productId: slug,
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      });
      
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!hasAccess) {
      toast({
        title: "Access Required",
        description: `Upgrade to ${templateData.accessTier} to download this template.`,
      });
      return;
    }

    try {
      const response = await apiRequest("GET", `/api/vault/download/${slug}`);
      if (response.downloadUrl) {
        window.open(response.downloadUrl, "_blank");
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Unable to download. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeadCapture = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to get the free preview.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/vault/lead", {
        email,
        productId: slug,
        source: "template_detail",
      });
      
      toast({
        title: "Success!",
        description: "Check your email for the preview link.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to send preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{templateData.name} | WashBizHub Template Vault</title>
        <meta name="description" content={templateData.description} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6">
            <Link href="/template-vault">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Template Vault
              </Button>
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary">{templateData.category}</Badge>
                  {hasAccess && (
                    <Badge className="bg-green-500 text-white gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Unlocked
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-3" data-testid="text-template-title">
                  {templateData.name}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {templateData.description}
                </p>
              </div>

              <Card className="lg:min-w-[300px]">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold">{priceDisplay}</div>
                    {templateData.accessTier !== "free" && (
                      <p className="text-sm text-muted-foreground">
                        or included with {templateData.accessTier} subscription
                      </p>
                    )}
                  </div>

                  {hasAccess ? (
                    <Button 
                      className="w-full gap-2" 
                      size="lg"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4" />
                      Download Now
                    </Button>
                  ) : user ? (
                    <div className="space-y-3">
                      <Button 
                        className="w-full gap-2" 
                        size="lg"
                        onClick={handlePurchase}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Purchase for {priceDisplay}
                          </>
                        )}
                      </Button>
                      <Link href="/pricing">
                        <Button variant="outline" className="w-full gap-1">
                          <Crown className="w-4 h-4" />
                          Or subscribe & get all templates
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Get free preview</Label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full"
                        onClick={handleLeadCapture}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Send Free Preview"
                        )}
                      </Button>
                      <Separator />
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          Sign in to purchase
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  What's Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {templateData.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Why Choose This Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Industry-Specific</h4>
                    <p className="text-sm text-muted-foreground">
                      Created specifically for the laundromat industry by experts.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Save Hours of Work</h4>
                    <p className="text-sm text-muted-foreground">
                      Pre-built framework means you can customize, not start from scratch.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Crown className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Expert-Reviewed</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on Larry Larsen's 50+ years of industry experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
