import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Wrench,
  ChevronRight,
  ArrowLeft,
  WashingMachine,
  Wind,
  Settings,
  Sparkles,
  ShoppingCart,
  Zap
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import serviceGuyAILogo from "@assets/SERVICE GUY_1764436998885.png";

interface ErrorCode {
  id: number;
  code: string;
  manufacturer: string;
  slug: string;
  title: string;
  description: string;
  severity: string;
  machineType: string;
}

interface ManufacturerCount {
  manufacturer: string;
  count: number;
}

interface ErrorCodeStats {
  totalCodes: number;
  totalBrands: number;
  bySeverity: Array<{ severity: string; count: number }>;
  byMachineType: Array<{ machineType: string; count: number }>;
}

const ERROR_CODES_FAQS = [
  {
    question: "What does Speed Queen error E3 mean?",
    answer: "Speed Queen error code E3 typically indicates a water fill problem. The washer is not detecting that water is entering the machine within the expected timeframe. Common causes include: 1) Clogged inlet screens or filters, 2) Low water pressure, 3) Kinked or frozen water supply hoses, 4) Faulty water inlet valve, 5) Water level sensor malfunction. To fix: First check that water supply valves are fully open, then clean the inlet screens. If the problem persists, test the water inlet valve and pressure switch."
  },
  {
    question: "How to fix washer not draining error?",
    answer: "When your commercial washer shows a 'not draining' error (codes like F21, E21, DR, or nd), follow these steps: 1) Check for clogged drain hose or standpipe - remove any blockages, 2) Inspect the drain pump filter (usually at the front bottom) and remove debris like coins, lint, or small items, 3) Verify the drain hose isn't kinked or elevated more than 96 inches, 4) Test the drain pump motor for continuity, 5) Check the control board for error codes. Most drain issues are caused by foreign objects blocking the pump or filter."
  },
  {
    question: "Where can I find Dexter washer fault codes list?",
    answer: "The complete Dexter washer fault codes list is available in several places: 1) WashBizHub's comprehensive error code database (2,500+ codes across 60+ brands), 2) Your machine's service manual (typically stored behind the control panel), 3) DexterLive diagnostic system if your machines are connected, 4) Dexter Laundry's official technical support. Common Dexter T-Series codes include: E01 (door lock), E02 (motor), E03 (water fill), E04 (drain), E05 (unbalance), E06 (temperature), and E07 (inverter). For complete troubleshooting, use the code search feature on WashBizHub."
  },
  {
    question: "What are common commercial dryer error codes?",
    answer: "Common commercial dryer error codes include: Speed Queen - E:xx codes like E:dL (door lock), E:nF (no flame), E:tS (thermistor), E:oH (overheat). Dexter - E01-E10 series covering ignition, airflow, and sensor issues. Huebsch - Similar to Speed Queen as they're Alliance brands. Continental/Girbau - Error codes typically start with 'Er' followed by numbers. Most dryer errors relate to: ignition/flame issues, airflow restrictions, high-limit thermostat trips, door switch problems, or exhaust blockages. Always check lint traps and exhaust vents first."
  },
  {
    question: "How do I reset washer error codes?",
    answer: "To reset washer error codes on commercial equipment: 1) Speed Queen/Huebsch: Press and hold the 'Start' button for 5 seconds, or power cycle by unplugging for 60 seconds, 2) Dexter: Clear codes through the DexterLive app or hold 'Start' and 'Option' simultaneously, 3) Continental/Girbau: Use the service menu accessed via specific button combinations (varies by model), 4) Maytag Commercial: Unplug for 1 minute, then replug. Note: Resetting only clears the display - if the underlying problem isn't fixed, the code will return. Always address the root cause before resetting."
  },
  {
    question: "What does error code F02 mean on a commercial washer?",
    answer: "Error code F02 on commercial washers typically indicates a long drain time - the machine didn't empty within the expected timeframe (usually 8-10 minutes). Causes include: 1) Clogged drain pump filter or impeller, 2) Blockage in drain hose or standpipe, 3) Faulty drain pump motor, 4) Control board timing issue, 5) Excessive suds from too much detergent. Fix: Clean the drain pump filter, check for obstructions in the drain path, verify the drain hose isn't kinked, and test the pump motor. For coin laundries, this is one of the most common service calls - regular pump filter cleaning prevents it."
  },
  {
    question: "Why is my commercial washer showing door lock error?",
    answer: "Door lock errors (codes like E:dL, dL, F5E1, or E01) on commercial washers mean the control can't confirm the door is properly locked. Common causes: 1) Door not fully closed - check for obstructions or worn door seal, 2) Faulty door lock mechanism - may need replacement, 3) Door strike misalignment - adjust the strike plate, 4) Wiring issue between door lock and control, 5) Control board failure. For coin laundry, door issues cause significant downtime and customer complaints. Test the door latch with a multimeter and inspect the wiring harness for damage."
  },
  {
    question: "How often should I check laundromat equipment for error codes?",
    answer: "Best practices for monitoring laundromat equipment error codes: 1) Daily visual inspection of all machines for displayed errors, 2) Weekly review of error history through machine diagnostics or connected systems like DexterLive, SpyderWash, or CCI, 3) Monthly download and analysis of error logs, 4) Immediately investigate any recurring codes. Modern connected laundromats can receive real-time alerts for critical errors. Set up email or SMS notifications for high-priority codes like overheat, fire suppression, or payment system failures. Proactive monitoring reduces downtime and extends equipment life."
  }
];

const ERROR_CODES_HOWTO = {
  name: "How to Diagnose Commercial Washer Error Codes",
  description: "Complete step-by-step guide to identifying, interpreting, and troubleshooting commercial laundry equipment error codes for laundromat owners and technicians.",
  steps: [
    {
      name: "Identify the Error Code",
      text: "When a commercial washer displays an error code, first record the exact code shown (including any letters, numbers, or symbols). Note the machine brand, model number, and what cycle the machine was running when the error occurred. This information is essential for accurate diagnosis."
    },
    {
      name: "Look Up the Error Code",
      text: "Search for the error code in WashBizHub's comprehensive database of 2,500+ codes covering Speed Queen, Dexter, Continental, Huebsch, Maytag Commercial, and 55+ other brands. Each code includes description, severity level, and machine type (washer/dryer)."
    },
    {
      name: "Review Common Causes",
      text: "Each error code has multiple potential causes ranked by frequency. Start with the most common cause - often a simple fix like a clogged filter, loose connection, or sensor issue. Check manufacturer-specific troubleshooting guides for your exact model."
    },
    {
      name: "Perform Visual Inspection",
      text: "Before attempting repairs, visually inspect the machine for obvious issues: Check for water leaks, listen for unusual sounds, verify all hoses are connected, ensure the drain is clear, and confirm power and water supplies are functioning. Many errors have simple visual clues."
    },
    {
      name: "Test Components Systematically",
      text: "Using a multimeter and appropriate tools, test components related to the error code. For water fill errors, test inlet valves and pressure switches. For drain errors, test the pump motor. For heating errors, test thermistors and heating elements. Always disconnect power before testing."
    },
    {
      name: "Reset and Verify",
      text: "After addressing the root cause, clear the error code using the manufacturer's reset procedure (typically holding Start for 5 seconds or power cycling). Run a test cycle to verify the fix worked. If the code returns, the underlying problem wasn't fully resolved."
    },
    {
      name: "Document and Prevent",
      text: "Record the error code, cause, and fix in your maintenance log. Set up preventive maintenance schedules to avoid recurring issues. For connected machines, use remote monitoring to catch errors early. Consider WashBizHub's AI-powered Service Guy for ongoing diagnostic support."
    }
  ],
  totalTime: "PT1H"
};

const ERROR_CODE_BRANDS_ITEMLIST = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Commercial Laundry Equipment Error Codes by Brand",
  "description": "Complete database of error codes for major commercial laundry equipment brands including Speed Queen, Dexter, Huebsch, Continental, Maytag Commercial, and more.",
  "numberOfItems": 60,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Speed Queen Error Codes",
      "url": "https://washbizhub.com/error-codes?manufacturer=Speed%20Queen",
      "description": "Complete list of Speed Queen commercial washer and dryer error codes including E3, dL, nF, tS codes and troubleshooting guides."
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Dexter Laundry Error Codes",
      "url": "https://washbizhub.com/error-codes?manufacturer=Dexter",
      "description": "Dexter T-Series and C-Series washer and dryer fault codes E01-E99 with repair solutions and parts recommendations."
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Huebsch Error Codes",
      "url": "https://washbizhub.com/error-codes?manufacturer=Huebsch",
      "description": "Huebsch commercial laundry equipment error codes and diagnostic guides for Galaxy and UniMac series machines."
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Continental Girbau Error Codes",
      "url": "https://washbizhub.com/error-codes?manufacturer=Continental",
      "description": "Continental and Girbau washer-extractor error codes including Em, Er series codes and solutions."
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Maytag Commercial Error Codes",
      "url": "https://washbizhub.com/error-codes?manufacturer=Maytag",
      "description": "Maytag Commercial laundry error codes for coin-operated washers and dryers with step-by-step repair guides."
    },
    {
      "@type": "ListItem",
      "position": 6,
      "name": "Wascomat Error Codes",
      "url": "https://washbizhub.com/error-codes?manufacturer=Wascomat",
      "description": "Wascomat Electrolux washer and dryer error codes with troubleshooting procedures and parts lookup."
    },
    {
      "@type": "ListItem",
      "position": 7,
      "name": "Milnor Error Codes",
      "url": "https://washbizhub.com/error-codes?manufacturer=Milnor",
      "description": "Pellerin Milnor commercial laundry equipment fault codes and diagnostic procedures."
    },
    {
      "@type": "ListItem",
      "position": 8,
      "name": "Unimac Error Codes",
      "url": "https://washbizhub.com/error-codes?manufacturer=Unimac",
      "description": "UniMac commercial washer and dryer error codes from Alliance Laundry Systems."
    }
  ]
};

const TECH_ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Commercial Laundry Equipment Error Code Database & Troubleshooting Guide",
  "description": "Comprehensive database of 2,500+ error codes across 60+ commercial laundry equipment brands. Find troubleshooting guides, repair solutions, and parts information for Speed Queen, Dexter, Continental, Huebsch, and more.",
  "author": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": "https://washbizhub.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": "https://washbizhub.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://washbizhub.com/washbizhub-logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://washbizhub.com/error-codes"
  },
  "datePublished": "2024-01-01",
  "dateModified": new Date().toISOString().split('T')[0],
  "proficiencyLevel": "Beginner to Expert",
  "dependencies": "Commercial laundry equipment (Speed Queen, Dexter, Huebsch, Continental, Maytag Commercial)"
};

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "high":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "medium":
      return <Info className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

function getSeverityBadgeVariant(severity: string): "destructive" | "default" | "secondary" | "outline" {
  switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}

function getMachineTypeIcon(machineType: string) {
  switch (machineType) {
    case "washer":
      return <WashingMachine className="h-4 w-4" />;
    case "dryer":
      return <Wind className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
}

export default function ErrorCodesPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("all");
  const [selectedMachineType, setSelectedMachineType] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: manufacturers, isLoading: loadingManufacturers } = useQuery<ManufacturerCount[]>({
    queryKey: ["/api/error-codes/manufacturers"],
  });

  const { data: stats } = useQuery<ErrorCodeStats>({
    queryKey: ["/api/error-codes/stats"],
  });

  const { data: codesData, isLoading: loadingCodes } = useQuery<{
    codes: ErrorCode[];
    total: number;
  }>({
    queryKey: ["/api/error-codes", selectedManufacturer, selectedMachineType, selectedSeverity, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedManufacturer !== "all") params.set("manufacturer", selectedManufacturer);
      if (selectedMachineType !== "all") params.set("machineType", selectedMachineType);
      if (selectedSeverity !== "all") params.set("severity", selectedSeverity);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("limit", "100");
      
      const res = await fetch(`/api/error-codes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch error codes");
      return res.json();
    }
  });

  return (
    <>
      <SEO
        title="Laundromat Error Codes Guide | Speed Queen, Dexter, Huebsch Error Codes | WashBizHub"
        description="Complete commercial laundry error codes database with 2,500+ codes across 60+ brands. Find Speed Queen E3, Dexter fault codes, washer not draining errors, commercial dryer error codes, and step-by-step troubleshooting guides."
        canonicalUrl="/error-codes"
        ogType="article"
        keywords={[
          "Speed Queen error codes",
          "Speed Queen error E3",
          "Dexter washer error codes",
          "Dexter fault codes list",
          "commercial washer error codes",
          "commercial dryer error codes",
          "washer not draining error",
          "laundromat equipment troubleshooting",
          "coin laundry error codes",
          "Huebsch error codes",
          "Continental washer error codes",
          "Maytag commercial error codes",
          "washer door lock error",
          "dryer not heating error code",
          "how to reset washer error code",
          "commercial laundry diagnostics",
          "laundromat machine repair codes",
          "washer F02 error code",
          "dryer E:nF error code",
          "Speed Queen dL error"
        ]}
        faqs={ERROR_CODES_FAQS}
        howTo={ERROR_CODES_HOWTO}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Error Codes", url: "/error-codes" }
        ]}
        author={{
          name: "WashBizHub Service Team",
          expertise: "Commercial Laundry Equipment Diagnostics",
          credentials: "Certified technicians with 30+ years combined experience servicing Speed Queen, Dexter, and Alliance Laundry equipment"
        }}
        structuredData={[ERROR_CODE_BRANDS_ITEMLIST, TECH_ARTICLE_SCHEMA]}
        datePublished="2024-01-01"
        dateModified={new Date().toISOString().split('T')[0]}
        articleSection="Equipment Troubleshooting"
        speakableSelectors={["h1", "h2", ".speakable"]}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <Breadcrumb items={[
              { name: "Home", url: "/" },
              { name: "Error Codes", url: "/error-codes" }
            ]} />
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Card className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <img 
                  src={serviceGuyAILogo} 
                  alt="Service Guy AI - Commercial Laundry Diagnostics" 
                  className="h-16 md:h-20 w-auto"
                  data-testid="logo-service-guy-ai"
                />
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2 speakable">
                    AI-Powered Diagnostics for Commercial Laundry Equipment
                  </h2>
                  <p className="text-slate-300 text-sm md:text-base">
                    Get instant troubleshooting help and parts recommendations powered by AI. 
                    Our database covers {stats?.totalCodes || "2,500"}+ error codes across {stats?.totalBrands || "60"}+ brands including Speed Queen, Dexter, Huebsch, Continental, and more.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/parts-catalogue">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" data-testid="button-find-parts">
                      <ShoppingCart className="h-4 w-4" />
                      Find Parts
                    </Button>
                  </Link>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 justify-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Free to Use
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 speakable" data-testid="text-page-title">
              Commercial Laundry Equipment Error Code Database
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl speakable">
              Search our comprehensive database of {stats?.totalCodes || "2,537"} error codes across {stats?.totalBrands || "60"} commercial laundry equipment brands including Speed Queen, Dexter, Huebsch, Continental, and Maytag Commercial. 
              Find troubleshooting guides, repair solutions, and replacement parts information.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary" data-testid="text-total-codes">
                  {stats?.totalCodes || "2,537"}
                </div>
                <p className="text-sm text-muted-foreground">Total Error Codes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary" data-testid="text-total-brands">
                  {stats?.totalBrands || "60+"}
                </div>
                <p className="text-sm text-muted-foreground">Equipment Brands</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <WashingMachine className="h-6 w-6 text-primary" />
                  <div className="text-3xl font-bold">
                    {stats?.byMachineType?.find(m => m.machineType === "washer")?.count || 0}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Washer Codes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Wind className="h-6 w-6 text-primary" />
                  <div className="text-3xl font-bold">
                    {stats?.byMachineType?.find(m => m.machineType === "dryer")?.count || 0}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Dryer Codes</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Error Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by code (E3, F02, dL), title, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>
                <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                  <SelectTrigger data-testid="select-manufacturer">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {manufacturers?.map((m) => (
                      <SelectItem key={m.manufacturer} value={m.manufacturer}>
                        {m.manufacturer} ({m.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMachineType} onValueChange={setSelectedMachineType}>
                  <SelectTrigger data-testid="select-machine-type">
                    <SelectValue placeholder="All Machine Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="washer">Washers</SelectItem>
                    <SelectItem value="dryer">Dryers</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loadingCodes ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground" data-testid="text-results-count">
                  Showing {codesData?.codes?.length || 0} of {codesData?.total || 0} error codes
                </p>
              </div>

              {codesData?.codes?.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No error codes found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {codesData?.codes?.map((code) => (
                    <Link key={code.id} href={`/error-codes/${code.slug}`}>
                      <Card 
                        className="h-full hover-elevate cursor-pointer transition-shadow"
                        data-testid={`card-error-code-${code.id}`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3 gap-2">
                            <div className="flex items-center gap-2">
                              {getMachineTypeIcon(code.machineType)}
                              <span className="font-mono font-bold text-lg text-primary">
                                {code.code}
                              </span>
                            </div>
                            <Badge variant={getSeverityBadgeVariant(code.severity)}>
                              {code.severity}
                            </Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{code.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {code.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Wrench className="h-3 w-3" />
                            <span className="text-muted-foreground">{code.manufacturer}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {manufacturers && manufacturers.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Browse Error Codes by Manufacturer</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {manufacturers.map((m) => (
                  <Button
                    key={m.manufacturer}
                    variant={selectedManufacturer === m.manufacturer ? "default" : "outline"}
                    className="justify-between"
                    onClick={() => setSelectedManufacturer(m.manufacturer)}
                    data-testid={`button-brand-${m.manufacturer.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="truncate mr-1">{m.manufacturer}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {m.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <section className="mt-16 bg-muted/30 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions About Error Codes</h2>
            <Accordion type="single" collapsible className="w-full">
              {ERROR_CODES_FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="mt-12 bg-muted rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">About Our Commercial Laundry Error Code Database</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="speakable">
                Our comprehensive error code database is the largest free resource for commercial laundry equipment troubleshooting, 
                covering the most popular brands used in laundromats and on-premise laundries including Speed Queen, Dexter, Huebsch, 
                Continental, Maytag Commercial, Wascomat, and 55+ more manufacturers. Each error code entry includes:
              </p>
              <ul className="grid md:grid-cols-2 gap-2 mt-4">
                <li className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Detailed step-by-step troubleshooting guides
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  Common causes ranked by frequency
                </li>
                <li className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Skill level requirements (DIY vs. technician)
                </li>
                <li className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  Related replacement parts and pricing
                </li>
                <li className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  Direct links to order parts on Amazon
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI-powered Service Guy diagnostic assistant
                </li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                Need help with a specific error code? Use our AI-powered Service Guy tool for personalized 
                troubleshooting assistance, or visit our <Link href="/parts-catalogue" className="text-primary hover:underline">Parts Catalogue</Link> to order replacement components.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
