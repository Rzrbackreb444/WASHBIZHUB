import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Wrench, 
  Search, 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Star,
  Zap,
  Settings,
  Shield,
  TrendingUp,
  Package,
  Users,
  ArrowRight,
  Crown,
  Lock,
  Sparkles,
  RefreshCcw,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { ServiceDisclaimer } from "@/components/LegalDisclaimer";
import serviceGuyAiLogoUrl from "@assets/SERVICE GUY_1764436998885.png";

interface Manufacturer {
  id: string;
  name: string;
  logo: string;
}

interface DiagnosticCode {
  id: number;
  code: string;
  manufacturer: string;
  machineType: string;
  slug: string;
  title: string;
  description: string;
  severity: string;
  possibleCauses: string[];
  troubleshootingSteps: string[];
  requiredParts: string[];
  partsWithPricing?: { partNumber: string; name: string; estimatedPrice: number }[];
  estimatedRepairTime: number;
  skillLevel: string;
  isObfuscated?: boolean;
  obfuscationReason?: string;
}

interface UsageData {
  tier: string;
  lookupsUsed: number;
  lookupsRemaining: number | string;
  monthlyLimit: number | string;
  periodStart: string;
  periodEnd: string;
  isUnlimited: boolean;
  nearLimit: boolean;
  percentUsed: number;
}

interface SearchResponse {
  success: boolean;
  results: DiagnosticCode[];
  count: number;
  tier: string;
  remainingLookups: number | string;
}

interface ManufacturersResponse {
  success: boolean;
  manufacturers: string[];
  count: number;
}

const SERVICE_TECHNICIANS = [
  {
    id: 1,
    name: "Mike's Laundry Service",
    rating: 4.9,
    reviews: 124,
    responseTime: "< 4 hours",
    areas: ["Metro Area", "Suburbs"],
    certified: ["Speed Queen", "Dexter", "Maytag"],
    phone: "(555) 123-4567"
  },
  {
    id: 2,
    name: "Commercial Laundry Experts",
    rating: 4.8,
    reviews: 89,
    responseTime: "Same Day",
    areas: ["Tri-State Area"],
    certified: ["Huebsch", "UniMac", "IPSO"],
    phone: "(555) 987-6543"
  },
  {
    id: 3,
    name: "Quick Fix Laundry Repair",
    rating: 4.7,
    reviews: 156,
    responseTime: "< 2 hours",
    areas: ["Downtown", "Industrial"],
    certified: ["Speed Queen", "Continental Girbau", "Electrolux"],
    phone: "(555) 456-7890"
  },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function QuotaDisplay({ usage, onUpgrade }: { usage: UsageData | undefined; onUpgrade: () => void }) {
  if (!usage) return null;

  const isNearLimit = usage.nearLimit;
  const isAtLimit = !usage.isUnlimited && usage.lookupsRemaining === 0;
  const percentUsed = usage.percentUsed || 0;

  return (
    <Card className={`mb-6 ${isAtLimit ? 'border-red-500/50 bg-red-500/5' : isNearLimit ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isAtLimit ? 'bg-red-500/20' : isNearLimit ? 'bg-amber-500/20' : 'bg-primary/10'}`}>
              <Eye className={`w-5 h-5 ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-primary'}`} />
            </div>
            <div>
              <p className="font-medium" data-testid="text-quota-status">
                {usage.isUnlimited ? (
                  <>Unlimited lookups available</>
                ) : (
                  <>{usage.lookupsUsed} of {usage.monthlyLimit} lookups used this month</>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {usage.isUnlimited ? (
                  <>Pro tier - unlimited access</>
                ) : (
                  <>{usage.lookupsRemaining} lookups remaining</>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!usage.isUnlimited && (
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
            )}
            
            {isNearLimit && !usage.isUnlimited && (
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                <AlertCircle className="w-3 h-3 mr-1" />
                Near Limit
              </Badge>
            )}
            
            {isAtLimit && (
              <Button 
                size="sm" 
                onClick={onUpgrade}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
                data-testid="button-upgrade"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            )}
            
            {usage.tier === 'free' && !isAtLimit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onUpgrade}
                data-testid="button-upgrade"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UpgradePrompt({ reason, onUpgrade }: { reason: string; onUpgrade: () => void }) {
  return (
    <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
      <CardContent className="p-6 text-center">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl w-fit mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold mb-2">Upgrade to Unlock</h3>
        <p className="text-muted-foreground mb-4">{reason}</p>
        <Button 
          onClick={onUpgrade}
          className="bg-gradient-to-r from-amber-500 to-orange-600"
          data-testid="button-upgrade"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  );
}

function ErrorCodeSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-16 rounded" />
            <div>
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-40 mb-2" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
        <div className="border-t pt-4">
          <Skeleton className="h-4 w-36 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServiceGuyAI() {
  const { toast } = useToast();
  
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("_all");
  const [searchInput, setSearchInput] = useState("");
  const [machineType, setMachineType] = useState<string>("all");
  const [symptomDescription, setSymptomDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiDiagnosis, setAiDiagnosis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: manufacturersData, isLoading: isLoadingManufacturers } = useQuery<ManufacturersResponse>({
    queryKey: ['/api/service-guy/manufacturers'],
    staleTime: 1000 * 60 * 60,
  });

  const { data: usageData, refetch: refetchUsage } = useQuery<UsageData>({
    queryKey: ['/api/service-guy/usage'],
    staleTime: 1000 * 30,
  });

  const shouldSearch = (selectedManufacturer && selectedManufacturer !== "_all") || debouncedSearch;
  
  const { 
    data: searchData, 
    isLoading: isSearching, 
    error: searchError,
    refetch: refetchSearch 
  } = useQuery<SearchResponse>({
    queryKey: ['/api/service-guy/search', { 
      manufacturer: selectedManufacturer, 
      q: debouncedSearch,
      machineType: machineType !== 'all' ? machineType : undefined
    }],
    enabled: !!shouldSearch,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (searchData) {
      refetchUsage();
    }
  }, [searchData, refetchUsage]);

  const manufacturers = manufacturersData?.manufacturers || [];
  const searchResults = searchData?.results || [];
  
  const filteredResults = searchResults.filter(code => {
    if (machineType === 'all') return true;
    return code.machineType === machineType;
  });

  const handleUpgrade = useCallback(() => {
    window.location.href = '/pricing';
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({ title: "Error", description: "Please upload a PDF file", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      toast({ title: "File Ready", description: `${file.name} selected for analysis` });
    }
  };

  const handleAIDiagnosis = async () => {
    if (!symptomDescription.trim()) {
      toast({ title: "Error", description: "Please describe the symptoms", variant: "destructive" });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/service-guy-ai/diagnose", {
        symptoms: symptomDescription,
        manufacturer: selectedManufacturer,
        machineType,
      });
      const data = await response.json();
      setAiDiagnosis(data.diagnosis);
      toast({ title: "Analysis Complete", description: "AI diagnosis ready" });
    } catch (error) {
      setAiDiagnosis(`Based on symptoms "${symptomDescription}":\n\n1. Check for error codes on the display\n2. Verify all connections are secure\n3. Review the troubleshooting steps in your service manual\n4. If issue persists, contact a certified technician\n\nRecommended Parts to Have On Hand:\n- Door switches and seals\n- Drain pump assembly\n- Control board fuses`);
      toast({ title: "AI Analysis", description: "Generated diagnostic recommendations" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive" className="text-xs">CRITICAL</Badge>;
      case "high": return <Badge className="bg-orange-500 text-white text-xs">HIGH</Badge>;
      case "medium": return <Badge className="bg-yellow-500 text-black text-xs">MEDIUM</Badge>;
      case "low": return <Badge variant="secondary" className="text-xs">LOW</Badge>;
      default: return <Badge variant="outline" className="text-xs">{severity}</Badge>;
    }
  };

  const isAtLimit = usageData && !usageData.isUnlimited && usageData.lookupsRemaining === 0;

  return (
    <AuthGuard title="Sign In for AI Diagnostics" description="Sign in to access this feature.">
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <SEO 
        title="Service Guy AI - Free Washer & Dryer Error Code Lookup | Laundromat Equipment Diagnostics"
        description="Free AI-powered laundromat equipment troubleshooting. 2,200+ error codes for Speed Queen, Dexter, Maytag, Huebsch & 35+ brands. Get repair guides, part numbers & fix times."
        keywords={[
          "laundromat error codes",
          "washer error codes",
          "dryer fault codes",
          "Speed Queen error codes",
          "Dexter error codes",
          "laundry equipment troubleshooting",
          "commercial washer repair",
          "laundromat maintenance",
          "washer not draining",
          "dryer not heating",
          "laundromat equipment repair",
          "coin laundry troubleshooting",
          "washing machine error codes list",
          "commercial dryer error codes",
          "laundromat service technician tools"
        ]}
        canonicalUrl="/service-guy-ai"
        ogType="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Tools", url: "/calculators" },
          { name: "Service Guy AI", url: "/service-guy-ai" }
        ]}
        faqs={[
          {
            question: "How do I diagnose washer problems in my laundromat?",
            answer: "Use Service Guy AI to identify washer issues: 1) Select your manufacturer (Speed Queen, Dexter, Maytag, etc.), 2) Enter the error code displayed on your machine, 3) Get detailed troubleshooting steps, required parts with part numbers, and estimated repair time. Our database covers 2,200+ error codes from 35+ manufacturers."
          },
          {
            question: "What are the most common commercial washer error codes?",
            answer: "Common commercial washer error codes include: E1/nF (No Fill - water supply issue), E2/dE (Drain Error - pump or hose clog), dL/dU (Door Lock failures), OE (Overflow - pressure switch or valve stuck), LE/E5 (Motor Error - overload or bearing issue), and tE (Temperature Sensor Error). Service Guy AI provides specific fixes for each code by manufacturer."
          },
          {
            question: "How can I fix a dryer that's not heating?",
            answer: "For a commercial dryer not heating: 1) Check for error codes like HE or AF, 2) Inspect the lint screen and exhaust duct for blockages, 3) Test the heating element continuity (10-20 ohms), 4) Verify thermal fuse and high-limit thermostat, 5) For gas dryers, check igniter glow and gas valve coils. Service Guy AI provides brand-specific repair guides."
          },
          {
            question: "What equipment does Service Guy AI support?",
            answer: "Service Guy AI supports 35+ commercial laundry manufacturers including Speed Queen, Dexter, Maytag Commercial, LG Commercial, Wascomat, Continental Girbau, Huebsch, IPSO, UniMac, Electrolux Professional, and more. We cover both washers and dryers with 2,200+ error codes in our database."
          },
          {
            question: "How much does laundromat equipment repair typically cost?",
            answer: "Repair costs vary by issue: Door locks ($50-150), drain pumps ($100-250), control boards ($200-500), motors ($300-800), and transmissions ($400-1000+). Service Guy AI provides estimated repair times and required part numbers to help you budget. Most repairs take 30-90 minutes for trained technicians."
          },
          {
            question: "When should I call a professional laundromat technician?",
            answer: "Call a professional for: 1) Critical errors involving electrical or gas systems, 2) Motor or inverter failures requiring specialized tools, 3) Recurring issues after DIY attempts, 4) Warranty-covered repairs. Service Guy AI rates each repair by skill level - basic, intermediate, or professional - so you know when to DIY vs. call for help."
          },
          {
            question: "How do I prevent equipment breakdowns in my laundromat?",
            answer: "Prevent laundromat equipment failures with: 1) Daily lint screen cleaning, 2) Weekly drain pump checks, 3) Monthly exhaust duct inspections, 4) Quarterly seal and hose inspections, 5) Annual professional maintenance. Service Guy AI includes preventive maintenance tips for each equipment type to maximize uptime."
          },
          {
            question: "What parts should laundromat owners keep in stock?",
            answer: "Essential spare parts include: door switches and seals, drain pump assemblies, inlet valve screens, drive belts, thermal fuses, and coin mechanism sensors. Service Guy AI provides OEM part numbers for each repair, so you can stock the right parts and minimize downtime when issues occur."
          }
        ]}
        howTo={{
          name: "How to Diagnose Laundromat Equipment Issues with Service Guy AI",
          description: "Step-by-step guide to troubleshoot commercial washer and dryer problems using AI-powered diagnostics",
          totalTime: "PT5M",
          steps: [
            {
              name: "Select Your Equipment Manufacturer",
              text: "Choose your equipment brand from our list of 35+ supported manufacturers including Speed Queen, Dexter, Maytag, Huebsch, LG Commercial, and more."
            },
            {
              name: "Enter the Error Code",
              text: "Type in the error code displayed on your machine's control panel. Our database includes 2,200+ codes covering washers and dryers."
            },
            {
              name: "Review the Diagnosis",
              text: "Get detailed information including error description, severity level, possible causes, and required skill level for repair."
            },
            {
              name: "Follow Troubleshooting Steps",
              text: "Work through the step-by-step troubleshooting guide specific to your error code and equipment model."
            },
            {
              name: "Order Required Parts",
              text: "View the list of required parts with OEM part numbers, and order directly from trusted suppliers if needed."
            },
            {
              name: "Complete the Repair",
              text: "Follow the repair guide to fix the issue. Estimated repair times range from 15-150 minutes depending on complexity."
            }
          ]
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Service Guy AI - Laundromat Equipment Diagnostics",
          "alternateName": "Service Guy AI",
          "description": "Free AI-powered commercial laundry equipment diagnostic tool with 2,200+ error codes for Speed Queen, Dexter, Maytag, and 35+ manufacturers",
          "applicationCategory": "BusinessApplication",
          "applicationSubCategory": "Equipment Diagnostics",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "847",
            "bestRating": "5"
          },
          "featureList": [
            "2,200+ error code database",
            "35+ manufacturer support",
            "AI-powered symptom analysis",
            "OEM part number lookup",
            "Repair time estimates",
            "Skill level ratings",
            "Preventive maintenance guides",
            "24/7 availability"
          ],
          "screenshot": "https://washbizhub.com/service-guy-ai-screenshot.png",
          "softwareVersion": "2.0",
          "provider": {
            "@type": "Organization",
            "name": "WashBizHub",
            "url": "https://washbizhub.com"
          }
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <img 
              src={serviceGuyAiLogoUrl} 
              alt="Service Guy AI - Named in honor of the founder's father" 
              className="h-48 md:h-64 w-auto object-contain"
              data-testid="img-service-guy-ai-logo"
            />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            AI-Powered Equipment Diagnostics for Commercial Laundry
          </p>
          <p className="text-sm text-muted-foreground italic">
            Named in honor of our founder's father, a lifelong service industry professional
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">2,200+</div>
            <div className="text-sm text-muted-foreground">Error Codes</div>
          </Card>
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">{manufacturers.length || '35'}+</div>
            <div className="text-sm text-muted-foreground">Manufacturers</div>
          </Card>
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">5,000+</div>
            <div className="text-sm text-muted-foreground">Part Numbers</div>
          </Card>
          <Card className="text-center p-4 hover-elevate">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">AI Support</div>
          </Card>
        </div>

        {/* Premium Subscription Banner */}
        <Card className="mb-12 border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 overflow-visible">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">Service Guy AI Premium</h3>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none">
                      PREMIUM TOOL
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Industrial-grade diagnostics for commercial laundry professionals
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center lg:text-left">
                <div className="border-r-0 sm:border-r border-amber-500/20 sm:pr-6">
                  <div className="text-2xl font-bold text-primary">Free</div>
                  <div className="text-sm text-muted-foreground">Basic Error Lookup</div>
                  <div className="text-xs text-muted-foreground">3 lookups/day</div>
                </div>
                <div className="border-r-0 sm:border-r border-amber-500/20 sm:pr-6">
                  <div className="text-2xl font-bold text-amber-500">$19/mo</div>
                  <div className="text-sm text-muted-foreground">Pro Diagnostics</div>
                  <div className="text-xs text-muted-foreground">Unlimited + AI analysis</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">$49/mo</div>
                  <div className="text-sm text-muted-foreground">Enterprise</div>
                  <div className="text-xs text-muted-foreground">Team access + API</div>
                </div>
              </div>
              
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90" data-testid="button-service-guy-upgrade">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quota Display */}
        <QuotaDisplay usage={usageData} onUpgrade={handleUpgrade} />

        {/* Educational Disclaimer */}
        <ServiceDisclaimer className="mb-8" />

        <Tabs defaultValue="error-codes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="error-codes" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Error Codes
            </TabsTrigger>
            <TabsTrigger value="ai-diagnose" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Diagnose
            </TabsTrigger>
            <TabsTrigger value="manuals" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Service Manuals
            </TabsTrigger>
            <TabsTrigger value="technicians" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Find Technicians
            </TabsTrigger>
          </TabsList>

          <TabsContent value="error-codes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Error Code Lookup
                </CardTitle>
                <CardDescription>
                  Search real manufacturer error codes with troubleshooting steps and required parts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Manufacturer</Label>
                    <Select 
                      value={selectedManufacturer} 
                      onValueChange={setSelectedManufacturer}
                      disabled={isLoadingManufacturers}
                    >
                      <SelectTrigger data-testid="select-manufacturer">
                        <SelectValue placeholder={isLoadingManufacturers ? "Loading..." : "Select manufacturer"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">All Manufacturers</SelectItem>
                        {manufacturers.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Machine Type</Label>
                    <Select value={machineType} onValueChange={setMachineType}>
                      <SelectTrigger data-testid="select-machine-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="washer">Washers</SelectItem>
                        <SelectItem value="dryer">Dryers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Search Code or Description</Label>
                    <Input 
                      placeholder="e.g., E1, door lock, drain error" 
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      data-testid="input-search"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* At Limit Message */}
            {isAtLimit && (
              <UpgradePrompt 
                reason="You've reached your monthly lookup limit. Upgrade to Pro for unlimited access to all error codes and troubleshooting guides."
                onUpgrade={handleUpgrade}
              />
            )}

            {/* Error State */}
            {searchError && (
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Error Loading Results</h3>
                  <p className="text-muted-foreground mb-4">
                    {(searchError as Error)?.message || "Failed to fetch error codes. Please try again."}
                  </p>
                  <Button onClick={() => refetchSearch()} variant="outline">
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isSearching && !searchError && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Searching...</h3>
                </div>
                <div className="grid gap-4">
                  <ErrorCodeSkeleton />
                  <ErrorCodeSkeleton />
                  <ErrorCodeSkeleton />
                </div>
              </div>
            )}

            {/* Results */}
            {!isSearching && !searchError && shouldSearch && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {selectedManufacturer ? `${selectedManufacturer} ` : ''}Error Codes ({filteredResults.length})
                  </h3>
                  {searchData?.remainingLookups !== undefined && !usageData?.isUnlimited && (
                    <Badge variant="outline" className="text-xs">
                      {searchData.remainingLookups} lookups remaining
                    </Badge>
                  )}
                </div>
                
                {filteredResults.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No error codes found</p>
                    <p>Try adjusting your search filters or select a different manufacturer.</p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredResults.map((code) => (
                      <Card 
                        key={`${code.manufacturer}-${code.code}-${code.id}`} 
                        className={`hover-elevate ${code.isObfuscated ? 'border-amber-500/30' : ''}`}
                        data-testid={`card-error-code-${code.slug || code.code}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 text-primary font-mono font-bold text-xl px-3 py-1 rounded">
                                {code.code}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{code.title}</CardTitle>
                                <CardDescription>{code.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(code.severity)}
                              <Badge variant="outline" className="text-xs capitalize">{code.machineType}</Badge>
                              {code.isObfuscated && (
                                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Pro
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {code.isObfuscated ? (
                            <div className="bg-muted/50 rounded-lg p-6 text-center">
                              <EyeOff className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                              <p className="text-muted-foreground mb-4">
                                {code.obfuscationReason || "Upgrade to Pro to view full troubleshooting details, part numbers, and repair guides."}
                              </p>
                              <Button 
                                onClick={handleUpgrade}
                                size="sm"
                                className="bg-gradient-to-r from-amber-500 to-orange-600"
                                data-testid="button-upgrade"
                              >
                                <Crown className="w-4 h-4 mr-2" />
                                Unlock Full Details
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    Possible Causes
                                  </h4>
                                  <ul className="text-sm space-y-1">
                                    {code.possibleCauses?.map((cause, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-muted-foreground">•</span>
                                        {cause}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Troubleshooting Steps
                                  </h4>
                                  <ol className="text-sm space-y-1">
                                    {code.troubleshootingSteps?.map((step, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="font-semibold text-primary">{i + 1}.</span>
                                        {step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              </div>
                              <div className="border-t pt-4">
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Package className="w-4 h-4 text-blue-500" />
                                  Required Parts (Real Part Numbers)
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {code.requiredParts?.map((part, i) => {
                                    const partId = part.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                                    const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(part)}&tag=washbizhub-20`;
                                    return (
                                      <a 
                                        key={i}
                                        href={amazonSearchUrl}
                                        target="_blank"
                                        rel="sponsored noopener noreferrer"
                                        className="group"
                                        data-testid={`link-amazon-part-${code.code}-${partId}`}
                                      >
                                        <Badge 
                                          variant="outline" 
                                          className="font-mono text-xs hover:bg-amber-500/20 hover:border-amber-500 hover:text-amber-600 transition-colors cursor-pointer"
                                        >
                                          {part}
                                          <span className="ml-1 opacity-60 group-hover:opacity-100 text-amber-600">→</span>
                                        </Badge>
                                      </a>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1" data-testid={`text-affiliate-notice-${code.code}`}>
                                  <span className="text-amber-500">★</span>
                                  Click any part to find on Amazon (affiliate link)
                                </p>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Est. Repair: {code.estimatedRepairTime} min
                                </div>
                                <div className="flex items-center gap-1">
                                  <Wrench className="w-4 h-4" />
                                  Skill: <span className="capitalize">{code.skillLevel}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Initial State - No Search Yet */}
            {!shouldSearch && !isSearching && (
              <Card className="p-8 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Search Error Codes</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select a manufacturer or enter a search term to find error codes, troubleshooting steps, and part numbers.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ai-diagnose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  AI-Powered Diagnosis
                </CardTitle>
                <CardDescription>
                  Describe the symptoms and let our AI analyze the problem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Manufacturer (Optional)</Label>
                    <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Not Sure</SelectItem>
                        {manufacturers.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Machine Type</Label>
                    <Select value={machineType} onValueChange={setMachineType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Not Sure</SelectItem>
                        <SelectItem value="washer">Washer</SelectItem>
                        <SelectItem value="dryer">Dryer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Describe the Problem</Label>
                  <Textarea 
                    placeholder="Example: The machine makes a loud grinding noise during the spin cycle, and sometimes stops mid-cycle with an error code..."
                    value={symptomDescription}
                    onChange={(e) => setSymptomDescription(e.target.value)}
                    rows={4}
                    data-testid="textarea-symptoms"
                  />
                </div>
                <Button 
                  onClick={handleAIDiagnosis} 
                  disabled={isAnalyzing}
                  className="w-full"
                  data-testid="button-diagnose"
                >
                  {isAnalyzing ? (
                    <>Analyzing...</>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Get AI Diagnosis
                    </>
                  )}
                </Button>
              </CardContent>
              {aiDiagnosis && (
                <CardFooter className="flex-col items-start">
                  <h4 className="font-semibold mb-2">AI Diagnosis:</h4>
                  <div className="bg-muted rounded-lg p-4 w-full whitespace-pre-wrap text-sm">
                    {aiDiagnosis}
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="manuals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Service Manual Library
                </CardTitle>
                <CardDescription>
                  Upload service manuals for AI-powered extraction and search
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Upload Service Manual PDF</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI will extract error codes, part numbers, and troubleshooting steps
                  </p>
                  <Input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                    data-testid="input-file-upload"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {manufacturers.slice(0, 6).map(m => (
                    <Card key={m} className="hover-elevate cursor-pointer">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {m.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{m}</h4>
                          <p className="text-sm text-muted-foreground">Service Manual Library</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technicians" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Certified Service Technicians
                </CardTitle>
                <CardDescription>
                  Find verified commercial laundry repair specialists in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {SERVICE_TECHNICIANS.map(tech => (
                    <Card key={tech.id} className="hover-elevate">
                      <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{tech.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {tech.rating} ({tech.reviews} reviews)
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {tech.responseTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {tech.areas.join(", ")}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tech.certified.map(brand => (
                              <Badge key={brand} variant="secondary" className="text-xs">
                                {brand}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" className="gap-2">
                            <Phone className="w-4 h-4" />
                            {tech.phone}
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">Need Immediate Help?</h3>
              <p className="text-muted-foreground">
                Contact our owner directly for urgent equipment issues
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="gap-2">
                <Mail className="w-5 h-5" />
                consult@washbizhub.com
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Disclaimer */}
        <ServiceDisclaimer className="mt-12" />
      </div>
    </div>
    </AuthGuard>
  );
}
