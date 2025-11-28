import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import serviceGuyAILogo from "@assets/service guy ai_1764034013003.png";
import { 
  ChevronRight, 
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Info,
  Wrench,
  WashingMachine,
  Wind,
  Settings,
  HelpCircle,
  MessageSquare,
  Target,
  Package,
  Clock,
  DollarSign,
  Zap,
  Phone,
  ShieldAlert,
  Lightbulb,
  Cpu,
  Calendar,
  ShoppingCart,
  ExternalLink
} from "lucide-react";

interface PartWithPricing {
  partNumber: string;
  name: string;
  price: number;
  supplier: string;
}

interface ErrorCodeDetail {
  id: number;
  code: string;
  manufacturer: string;
  slug: string;
  title: string;
  description: string;
  severity: string;
  machineType: string;
  possibleCauses: string[];
  troubleshootingSteps: string[];
  requiredParts?: string[];
  skillLevel: string;
  estimatedRepairTime?: number;
  partsWithPricing?: PartWithPricing[];
  quickFix?: string;
  testModeEntry?: string;
  eraCompatibility?: string;
  modelSeries?: string;
  metaTitle?: string;
  metaDescription?: string;
}

function getSeverityDetails(severity: string) {
  switch (severity) {
    case "critical":
      return { 
        icon: <AlertTriangle className="h-5 w-5" />, 
        color: "text-red-500", 
        bg: "bg-red-50 dark:bg-red-950",
        border: "border-red-200 dark:border-red-800",
        label: "Critical - Immediate Attention Required"
      };
    case "high":
      return { 
        icon: <AlertCircle className="h-5 w-5" />, 
        color: "text-orange-500", 
        bg: "bg-orange-50 dark:bg-orange-950",
        border: "border-orange-200 dark:border-orange-800",
        label: "High Priority"
      };
    case "medium":
      return { 
        icon: <Info className="h-5 w-5" />, 
        color: "text-yellow-500", 
        bg: "bg-yellow-50 dark:bg-yellow-950",
        border: "border-yellow-200 dark:border-yellow-800",
        label: "Medium Priority"
      };
    default:
      return { 
        icon: <Info className="h-5 w-5" />, 
        color: "text-blue-500", 
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-200 dark:border-blue-800",
        label: "Low Priority"
      };
  }
}

function getMachineTypeDetails(machineType: string) {
  switch (machineType) {
    case "washer":
      return { icon: <WashingMachine className="h-5 w-5" />, label: "Washer" };
    case "dryer":
      return { icon: <Wind className="h-5 w-5" />, label: "Dryer" };
    case "payment":
      return { icon: <DollarSign className="h-5 w-5" />, label: "Payment System" };
    default:
      return { icon: <Settings className="h-5 w-5" />, label: "Washer/Dryer" };
  }
}

function getSkillLevelDetails(skillLevel: string) {
  switch (skillLevel) {
    case "basic":
      return { 
        color: "text-green-600 dark:text-green-400", 
        bg: "bg-green-100 dark:bg-green-900/50",
        label: "Basic - DIY Friendly",
        description: "No special tools required. Most owners can complete this repair."
      };
    case "intermediate":
      return { 
        color: "text-yellow-600 dark:text-yellow-400", 
        bg: "bg-yellow-100 dark:bg-yellow-900/50",
        label: "Intermediate - Some Experience Helpful",
        description: "Multimeter and basic electrical knowledge recommended."
      };
    case "professional":
      return { 
        color: "text-red-600 dark:text-red-400", 
        bg: "bg-red-100 dark:bg-red-900/50",
        label: "Professional - Tech Recommended",
        description: "Complex repair requiring specialized tools and training."
      };
    default:
      return { 
        color: "text-gray-600 dark:text-gray-400", 
        bg: "bg-gray-100 dark:bg-gray-900/50",
        label: skillLevel,
        description: ""
      };
  }
}

export default function ErrorCodeDetailPage() {
  const [, params] = useRoute("/error-codes/:slug");
  const slug = params?.slug;

  const { data, isLoading, error } = useQuery<{
    code: ErrorCodeDetail;
    relatedCodes: ErrorCodeDetail[];
  }>({
    queryKey: ["/api/error-codes/slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/error-codes/slug/${slug}`);
      if (!res.ok) throw new Error("Error code not found");
      return res.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data?.code) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">Error Code Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The error code you're looking for doesn't exist in our database.
              </p>
              <Link href="/error-codes">
                <Button data-testid="button-back-to-search">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Error Code Search
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { code, relatedCodes } = data;
  const severityDetails = getSeverityDetails(code.severity);
  const machineTypeDetails = getMachineTypeDetails(code.machineType);
  const skillLevelDetails = getSkillLevelDetails(code.skillLevel);
  const isComplexRepair = code.skillLevel === "professional" || code.severity === "critical";

  const totalPartsCost = code.partsWithPricing?.reduce((sum, part) => sum + part.price, 0) || 0;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What does ${code.manufacturer} error code ${code.code} mean?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": code.description
        }
      },
      {
        "@type": "Question",
        "name": `How do I fix ${code.manufacturer} error code ${code.code}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": code.troubleshootingSteps.join(" ")
        }
      },
      {
        "@type": "Question",
        "name": `What causes ${code.manufacturer} error code ${code.code}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": code.possibleCauses.join(", ")
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Fix ${code.manufacturer} Error Code ${code.code}`,
    "description": code.description,
    "totalTime": code.estimatedRepairTime ? `PT${code.estimatedRepairTime}M` : "PT30M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": totalPartsCost > 0 ? `${totalPartsCost}` : "0-500"
    },
    "tool": [
      { "@type": "HowToTool", "name": "Multimeter" },
      { "@type": "HowToTool", "name": "Screwdriver set" }
    ],
    "step": code.troubleshootingSteps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://washbizhub.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Error Codes",
        "item": "https://washbizhub.com/error-codes"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": code.manufacturer,
        "item": `https://washbizhub.com/error-codes?manufacturer=${encodeURIComponent(code.manufacturer)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": `${code.code} - ${code.title}`,
        "item": `https://washbizhub.com/error-codes/${code.slug}`
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{code.metaTitle || `${code.manufacturer} ${code.code} Error Code - Troubleshooting & Fix | WashBizHub`}</title>
        <meta 
          name="description" 
          content={code.metaDescription || `How to fix ${code.manufacturer} error code ${code.code}: ${code.title}. Step-by-step troubleshooting guide, common causes, and repair solutions.`}
        />
        <meta name="keywords" content={`${code.manufacturer} ${code.code}, ${code.manufacturer} error code, ${code.title}, laundry equipment troubleshooting, ${code.machineType} repair`} />
        <link rel="canonical" href={`https://washbizhub.com/error-codes/${code.slug}`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 mb-6 text-sm flex-wrap" aria-label="Breadcrumb">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-home">
                Home
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link href="/error-codes">
              <Button variant="ghost" size="sm" data-testid="button-error-codes">
                Error Codes
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link href={`/error-codes?manufacturer=${encodeURIComponent(code.manufacturer)}`}>
              <Button variant="ghost" size="sm" data-testid="button-manufacturer">
                {code.manufacturer}
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{code.code}</span>
          </nav>

          {/* Severity Banner with integrated safety warning for high-risk repairs */}
          <div className={`${severityDetails.bg} ${severityDetails.border} border rounded-lg p-4 mb-6`}>
            <div className="flex items-start gap-3">
              <div className={`${severityDetails.color} mt-0.5`}>
                {severityDetails.icon}
              </div>
              <div className="flex-1">
                <span className={`font-semibold ${severityDetails.color}`}>
                  {severityDetails.label}
                </span>
                {(code.severity === "critical" || code.severity === "high" || code.skillLevel === "professional") && (
                  <div className="mt-2 pt-2 border-t border-current/10">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-amber-700 dark:text-amber-300">Safety:</strong> Disconnect power before servicing. 
                        {code.machineType === "dryer" && " For gas dryers, ensure proper ventilation and locate gas shut-off. "}
                        {code.skillLevel === "professional" && "This repair may require specialized tools and training. "}
                        Attempt repairs at your own risk.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="outline" className="text-lg font-mono px-3 py-1" data-testid="badge-error-code">
                {code.code}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                {machineTypeDetails.icon}
                {machineTypeDetails.label}
              </Badge>
              <Badge variant="secondary">
                {code.manufacturer}
              </Badge>
              {code.estimatedRepairTime && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{code.estimatedRepairTime} min
                </Badge>
              )}
              {code.eraCompatibility && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {code.eraCompatibility}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-error-title">
              {code.manufacturer} Error Code {code.code}: {code.title}
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-error-description">
              {code.description}
            </p>
            {code.modelSeries && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Applies to:</strong> {code.modelSeries}
              </p>
            )}
          </header>

          <div className="grid gap-6">
            {/* Quick Fix Pro Tip */}
            {code.quickFix && (
              <Card className="border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Zap className="h-5 w-5" />
                    Pro Tip - Quick Fix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-800 dark:text-green-200 font-medium" data-testid="text-quick-fix">
                    {code.quickFix}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Test Mode Entry */}
            {code.testModeEntry && (
              <Card className="border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <Cpu className="h-5 w-5" />
                    Test Mode Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-800 dark:text-purple-200" data-testid="text-test-mode">
                    {code.testModeEntry}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Possible Causes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Possible Causes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3" data-testid="list-possible-causes">
                  {code.possibleCauses.map((cause, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Troubleshooting Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Step-by-Step Repair Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-md ${skillLevelDetails.bg}`}>
                  <Target className={`h-4 w-4 ${skillLevelDetails.color}`} />
                  <div>
                    <span className={`text-sm font-medium ${skillLevelDetails.color}`}>{skillLevelDetails.label}</span>
                    {skillLevelDetails.description && (
                      <p className="text-xs text-muted-foreground">{skillLevelDetails.description}</p>
                    )}
                  </div>
                </div>
                <ol className="space-y-4" data-testid="list-troubleshooting-steps">
                  {code.troubleshootingSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="pt-1">
                        <p>{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Parts with Pricing - Service Guy AI Integration */}
            {code.partsWithPricing && code.partsWithPricing.length > 0 && (
              <Card className="border-slate-700 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <img 
                        src={serviceGuyAILogo} 
                        alt="Service Guy AI" 
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="text-white">Recommended Parts</span>
                    </CardTitle>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      <Zap className="h-3 w-3 mr-1" />
                      10% Affiliate Rebate
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3" data-testid="list-parts-pricing">
                    {code.partsWithPricing.map((part, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover-elevate">
                        <div className="flex-1">
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{part.partNumber}</p>
                          <p className="text-xs text-muted-foreground">{part.supplier}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              ${part.price}
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => {
                              const manufacturer = code.manufacturer?.toLowerCase() || '';
                              let url = '';
                              
                              // Parts Town is #1 for everything - same-day shipping, search by part number
                              if (manufacturer.includes('speed queen') || manufacturer.includes('huebsch') || manufacturer.includes('unimac') || manufacturer.includes('ipso') || manufacturer.includes('primus')) {
                                // Alliance family - use Alliance Laundry Systems for genuine OEM
                                url = `https://parts.alliancelaundry.com/catalogsearch/result/?q=${encodeURIComponent(part.partNumber)}`;
                              } else if (manufacturer.includes('dexter') || manufacturer.includes('milnor')) {
                                // Dexter/Milnor - AAdvantage Laundry affiliate
                                url = 'https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry';
                              } else if (manufacturer.includes('wascomat') || manufacturer.includes('electrolux')) {
                                // Wascomat/Electrolux - use Eastern Laundry Parts
                                url = `https://www.easternlaundryparts.com/search?q=${encodeURIComponent(part.partNumber)}`;
                              } else if (manufacturer.includes('maytag') || manufacturer.includes('whirlpool') || manufacturer.includes('lg') || manufacturer.includes('ge')) {
                                // Residential brands - use Repair Clinic
                                url = `https://www.repairclinic.com/Shop-For-Parts?q=${encodeURIComponent(part.partNumber)}`;
                              } else if (manufacturer.includes('miele') || manufacturer.includes('fagor') || manufacturer.includes('schulthess')) {
                                // European brands - use HK Laundry
                                url = `https://www.hklaundry.com/search?q=${encodeURIComponent(part.partNumber)}`;
                              } else {
                                // Default: Parts Town - #1 for everything, same-day shipping
                                url = `https://www.partstown.com/search?q=${encodeURIComponent(part.partNumber)}`;
                              }
                              window.open(url, '_blank');
                            }}
                            data-testid={`button-order-part-${index}`}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPartsCost > 0 && (
                    <div className="mt-4 pt-4 border-t flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <span className="font-medium">Estimated Parts Total:</span>
                        <span className="text-xl font-bold text-primary ml-2">${totalPartsCost}</span>
                      </div>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                        onClick={() => {
                          const manufacturer = code.manufacturer?.toLowerCase() || '';
                          let url = '';
                          if (manufacturer.includes('speed queen') || manufacturer.includes('huebsch') || manufacturer.includes('unimac') || manufacturer.includes('ipso')) {
                            url = 'https://parts.alliancelaundry.com/';
                          } else if (manufacturer.includes('dexter') || manufacturer.includes('milnor')) {
                            url = 'https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry';
                          } else if (manufacturer.includes('wascomat') || manufacturer.includes('electrolux')) {
                            url = 'https://www.easternlaundryparts.com/';
                          } else if (manufacturer.includes('maytag') || manufacturer.includes('whirlpool') || manufacturer.includes('lg')) {
                            url = 'https://www.repairclinic.com/';
                          } else {
                            url = 'https://www.partstown.com/laundry-parts';
                          }
                          window.open(url, '_blank');
                        }}
                        data-testid="button-order-all-parts"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Order from OEM Supplier
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Legacy requiredParts support - Service Guy AI Integration */}
            {!code.partsWithPricing && code.requiredParts && code.requiredParts.length > 0 && (
              <Card className="border-slate-700 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <img 
                        src={serviceGuyAILogo} 
                        alt="Service Guy AI" 
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="text-white">Parts That May Need Replacement</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {code.requiredParts.map((part, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover-elevate">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{part}</span>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700"
                          onClick={() => {
                            const manufacturer = code.manufacturer?.toLowerCase() || '';
                            let url = '';
                            if (manufacturer.includes('speed queen') || manufacturer.includes('huebsch') || manufacturer.includes('unimac') || manufacturer.includes('ipso')) {
                              url = `https://parts.alliancelaundry.com/catalogsearch/result/?q=${encodeURIComponent(part)}`;
                            } else if (manufacturer.includes('dexter') || manufacturer.includes('milnor')) {
                              url = 'https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry';
                            } else if (manufacturer.includes('wascomat') || manufacturer.includes('electrolux')) {
                              url = `https://www.easternlaundryparts.com/search?q=${encodeURIComponent(part)}`;
                            } else {
                              url = `https://www.partstown.com/search?q=${encodeURIComponent(part)}`;
                            }
                            window.open(url, '_blank');
                          }}
                          data-testid={`button-order-legacy-part-${index}`}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Find Part
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                      onClick={() => {
                        const manufacturer = code.manufacturer?.toLowerCase() || '';
                        let url = '';
                        if (manufacturer.includes('speed queen') || manufacturer.includes('huebsch') || manufacturer.includes('unimac') || manufacturer.includes('ipso')) {
                          url = 'https://parts.alliancelaundry.com/';
                        } else if (manufacturer.includes('dexter') || manufacturer.includes('milnor')) {
                          url = 'https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry';
                        } else if (manufacturer.includes('wascomat') || manufacturer.includes('electrolux')) {
                          url = 'https://www.easternlaundryparts.com/';
                        } else {
                          url = 'https://www.partstown.com/laundry-parts';
                        }
                        window.open(url, '_blank');
                      }}
                      data-testid="button-browse-all-parts"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Browse {code.manufacturer} Parts
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Find a Local Tech CTA - shown for complex repairs */}
            {isComplexRepair && (
              <Card className="border-2 border-primary bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 flex items-center gap-2 text-lg">
                        <Phone className="h-5 w-5 text-primary" />
                        Need a Professional Technician?
                      </h3>
                      <p className="text-muted-foreground">
                        This repair is complex and may require specialized tools or training. 
                        Find a qualified commercial laundry technician in your area.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Typical tech charge:</strong> $289-$450 | 
                        <strong> DIY savings:</strong> ${Math.round((350 - totalPartsCost) > 0 ? 350 - totalPartsCost : 200)}+
                      </p>
                    </div>
                    <Button size="lg" className="gap-2" data-testid="button-find-tech">
                      <Phone className="h-4 w-4" />
                      Find a Local Tech
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ask Service Guy AI */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Need More Help?
                    </h3>
                    <p className="text-muted-foreground">
                      Chat with our AI Service Guy for personalized troubleshooting assistance.
                    </p>
                  </div>
                  <Link href="/service-guy-ai">
                    <Button data-testid="button-service-guy">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask Service Guy AI
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Codes */}
          {relatedCodes && relatedCodes.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">
                Other {code.manufacturer} Error Codes
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedCodes.map((related) => (
                  <Link key={related.id} href={`/error-codes/${related.slug}`}>
                    <Card className="h-full hover-elevate cursor-pointer" data-testid={`card-related-${related.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="font-mono font-bold text-primary">
                            {related.code}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {related.severity}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-sm">{related.title}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link href="/error-codes">
              <Button variant="outline" data-testid="button-back-search">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Error Code Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
