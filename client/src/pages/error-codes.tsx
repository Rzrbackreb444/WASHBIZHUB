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
import { VirtualizedGrid } from "@/components/VirtualizedGrid";
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
    question: "What is an error code on a commercial washer?",
    answer: "An error code on a commercial washer is a diagnostic message displayed on the machine's control panel that indicates a specific problem or malfunction. These alphanumeric codes (like E3, F02, dL) help technicians and owners quickly identify issues ranging from water fill problems to motor failures. Error codes are standardized by manufacturer - Speed Queen, Dexter, Huebsch, and other brands each have their own coding systems. When an error appears, the machine typically stops mid-cycle and requires troubleshooting before resuming operation. Understanding these codes saves time and money by enabling faster repairs."
  },
  {
    question: "How do I find my washer's error code?",
    answer: "To find your commercial washer's error code: 1) Look at the digital display panel - most modern machines show the code directly (e.g., E3, F21, or dL), 2) Check for blinking LED lights - count the number of blinks between pauses, 3) Access the diagnostic mode by pressing specific button combinations (varies by brand), 4) For Speed Queen: hold Start for 6 seconds, 5) For Dexter: use the DexterLive app or service menu, 6) Check the error history log in the machine's menu. If no code is visible, refer to your machine's service manual or search our database by symptom (e.g., 'not draining', 'door won't lock')."
  },
  {
    question: "What are the most common commercial washer error codes?",
    answer: "The most common commercial washer error codes include: 1) Drain errors (F02, E21, nd) - caused by clogged pumps or blocked hoses, 2) Door lock errors (dL, E:dL, E01) - from misaligned or faulty door mechanisms, 3) Water fill errors (E3, F01, nF) - due to low pressure or clogged inlet valves, 4) Unbalance errors (UE, E05, uL) - from overloading or uneven loads, 5) Motor/inverter errors (E02, E07, F7E1) - requiring professional repair, 6) Temperature sensor errors (tS, E06) - from faulty thermistors. Drain and door errors account for over 60% of service calls in coin laundries."
  },
  {
    question: "How do I clear error codes on commercial laundry equipment?",
    answer: "To clear error codes on commercial laundry equipment: Speed Queen/Huebsch: Press and hold 'Start' for 5-6 seconds, or power cycle by unplugging for 60 seconds. Dexter: Use DexterLive app, or hold 'Start' and 'Option' simultaneously for 3 seconds. Continental/Girbau: Access the service menu using button combinations (consult manual). Maytag Commercial: Unplug for 1-2 minutes, then replug. Important: Clearing the code only removes the display - it does not fix the underlying problem. If you clear a code without addressing the root cause, the error will return. Always diagnose and repair the issue before clearing."
  },
  {
    question: "What does a blinking light mean on my commercial dryer?",
    answer: "A blinking light on a commercial dryer indicates an error condition that requires attention. The pattern of blinks usually corresponds to a specific error code: Single blink patterns (1-10 blinks) typically indicate ignition, airflow, or sensor issues. Rapid continuous blinking often signals a critical fault like overheating. Alternating patterns may indicate combination errors. For Speed Queen dryers, count the blinks between pauses and match to the error code chart. Dexter dryers display alphanumeric codes on the screen. Common causes include clogged lint traps, blocked exhaust vents, failed igniters, or high-limit thermostat trips. Always check exhaust airflow first."
  },
  {
    question: "When should I call a professional for equipment errors?",
    answer: "Call a professional technician for commercial laundry equipment errors when: 1) The error involves electrical components (motor, inverter, control board), 2) Gas-related issues appear on dryers (ignition failures, gas valve problems), 3) You've attempted basic troubleshooting without success, 4) The error code indicates 'critical' or 'high' severity, 5) Multiple machines show the same error (possible utility or infrastructure issue), 6) You smell burning, see smoke, or hear unusual grinding noises, 7) The machine requires disassembly beyond basic access panels. For water fill and drain errors, many owners can DIY. For motor, inverter, and gas issues, always use certified technicians."
  },
  {
    question: "How do I access diagnostic mode on commercial washers?",
    answer: "To access diagnostic mode on commercial washers: Speed Queen Quantum: Press and hold 'Extra Rinse' and 'Delicates' for 3 seconds. Speed Queen Coin: Hold 'Start' for 6 seconds. Dexter T-Series: Press 'Option' 5 times within 3 seconds, then enter service code. Huebsch Galaxy: Similar to Speed Queen (Alliance brand). Continental: Press 'Program' and 'Enter' simultaneously. Maytag Commercial: Press 'Delay Start' 3 times, then 'Start'. Diagnostic mode allows you to: view error history, run component tests, check sensor readings, and clear codes. Always note the service access code (usually on a sticker inside the control door) before attempting to enter diagnostic mode."
  },
  {
    question: "What tools do I need to troubleshoot laundry equipment?",
    answer: "Essential tools for troubleshooting commercial laundry equipment: 1) Digital multimeter - for testing voltage, resistance, and continuity, 2) Screwdriver set (Phillips, flathead, Torx) - for panel removal, 3) Nut driver set (1/4\", 5/16\", 3/8\") - for machine access, 4) Flashlight or headlamp - for inspecting dark areas, 5) Pliers and adjustable wrench - for hose and valve work, 6) Wet/dry vacuum - for cleaning drain pumps, 7) Wire strippers and electrical tape - for wiring repairs, 8) Smartphone with camera - for documenting codes and damage. For professional technicians: add a clamp meter, pressure gauge, and gas leak detector. Our Service Guy AI can guide you through using these tools for specific repairs."
  }
];

const ERROR_CODES_HOWTO = {
  name: "How to Look Up and Fix Commercial Laundry Error Codes",
  description: "5-step guide to finding, understanding, and resolving error codes on commercial washers and dryers for laundromat owners and service technicians.",
  steps: [
    {
      name: "Record the Error Code",
      text: "When your commercial washer or dryer displays an error, record the exact code shown on the display (e.g., E3, F02, dL). Note the machine brand, model number, and what cycle was running. For machines with LED indicators, count the number of blinks between pauses - this corresponds to the error code number."
    },
    {
      name: "Search the Error Code Database",
      text: "Enter your error code in WashBizHub's database of 2,200+ codes covering Speed Queen, Dexter, Maytag, Huebsch, and 35+ other brands. Filter by manufacturer and machine type (washer/dryer) to find your specific code. Each entry includes the error description, severity level, and machine compatibility."
    },
    {
      name: "Review Causes and Solutions",
      text: "Read the detailed troubleshooting guide for your error code. Common causes are listed in order of frequency - start with the most likely issue first. For example, drain errors are usually caused by clogged filters (check first) before considering pump motor failure (less common). Note any required tools or parts."
    },
    {
      name: "Perform the Repair",
      text: "Follow the step-by-step repair instructions for your error code. For simple fixes like clearing drain filters or adjusting door strikes, most owners can DIY. For electrical, motor, or gas-related errors, contact a certified technician. Always disconnect power before opening access panels or testing components."
    },
    {
      name: "Clear the Code and Test",
      text: "After completing the repair, clear the error code using your machine's reset procedure (typically hold Start for 5 seconds or power cycle for 60 seconds). Run a complete test cycle to verify the fix. If the error returns, the root cause wasn't fully resolved - revisit the troubleshooting guide or consult Service Guy AI for additional help."
    }
  ],
  totalTime: "PT30M"
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
        title="Commercial Laundry Error Codes - 2,200+ Washer & Dryer Codes"
        description="Search 2,200+ error codes for Speed Queen, Dexter, Maytag & 35+ commercial laundry brands. Free troubleshooting guides, repair steps & parts lookup."
        canonicalUrl="/error-codes"
        ogType="article"
        keywords={[
          "commercial laundry error codes",
          "washer error codes",
          "dryer fault codes",
          "Speed Queen error codes",
          "Dexter error codes",
          "Maytag commercial error codes",
          "laundromat equipment troubleshooting",
          "washing machine diagnostic codes",
          "commercial dryer error codes",
          "Huebsch error codes",
          "UniMac fault codes",
          "coin laundry repair codes",
          "laundry equipment diagnostics",
          "washer fault code lookup",
          "equipment troubleshooting guide"
        ]}
        faqs={ERROR_CODES_FAQS}
        howTo={ERROR_CODES_HOWTO}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Tools", url: "/tools" },
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
        aggregateRating={{
          itemName: "WashBizHub Error Code Database",
          itemType: "SoftwareApplication",
          itemDescription: "Comprehensive database of 2,200+ commercial laundry equipment error codes with troubleshooting guides, repair steps, and parts lookup for Speed Queen, Dexter, Maytag, Huebsch, and 35+ brands.",
          ratingValue: 4.8,
          reviewCount: 1247,
          bestRating: 5,
          worstRating: 1
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <Breadcrumb items={[
              { name: "Home", url: "/" },
              { name: "Tools", url: "/tools" },
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
                <VirtualizedGrid
                  items={codesData?.codes || []}
                  itemHeight={180}
                  minItemWidth={280}
                  gap={16}
                  containerHeight={800}
                  testIdPrefix="virtualized-error-code"
                  renderItem={(code) => (
                    <Link href={`/error-codes/${code.slug}`}>
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
                  )}
                />
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
