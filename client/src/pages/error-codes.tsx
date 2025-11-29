import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Commercial Laundry Equipment Error Code Database",
    "description": "Comprehensive database of 939+ error codes across 49 commercial laundry equipment brands. Find troubleshooting guides and repair solutions.",
    "author": {
      "@type": "Organization",
      "name": "WashBizHub"
    },
    "publisher": {
      "@type": "Organization",
      "name": "WashBizHub",
      "url": "https://washbizhub.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://washbizhub.com/error-codes"
    }
  };

  return (
    <>
      <Helmet>
        <title>Commercial Laundry Error Codes Database - 939 Codes | WashBizHub</title>
        <meta 
          name="description" 
          content="Comprehensive database of 939+ error codes across 49 commercial laundry equipment brands including Speed Queen, Dexter, Continental, Huebsch, and more. Free troubleshooting guides." 
        />
        <meta name="keywords" content="laundromat error codes, commercial washer error codes, dryer fault codes, Speed Queen errors, Dexter error codes, laundry equipment troubleshooting" />
        <link rel="canonical" href="https://washbizhub.com/error-codes" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Home
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Error Codes</span>
          </div>

          {/* Service Guy AI Branding */}
          <Card className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <img 
                  src={serviceGuyAILogo} 
                  alt="Service Guy AI" 
                  className="h-16 md:h-20 w-auto"
                  data-testid="logo-service-guy-ai"
                />
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    AI-Powered Diagnostics
                  </h2>
                  <p className="text-slate-300 text-sm md:text-base">
                    Get instant troubleshooting help and parts recommendations powered by AI. 
                    Our database covers {stats?.totalCodes || "2,500"}+ error codes across {stats?.totalBrands || "60"}+ brands.
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
            <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-page-title">
              Commercial Laundry Equipment Error Code Database
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Search our comprehensive database of {stats?.totalCodes || "2,537"} error codes across {stats?.totalBrands || "60"} commercial laundry equipment brands. 
              Find troubleshooting guides, repair solutions, and parts information.
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
                      placeholder="Search by code, title, or description..."
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
              <h2 className="text-2xl font-bold mb-6">Browse by Manufacturer</h2>
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

          <div className="mt-12 bg-muted rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">About Our Error Code Database</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Our comprehensive error code database covers the most popular commercial laundry equipment 
                brands used in laundromats and on-premise laundries. Each error code entry includes:
              </p>
              <ul className="grid md:grid-cols-2 gap-2 mt-4">
                <li className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Detailed troubleshooting steps
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  Common causes and solutions
                </li>
                <li className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Skill level requirements
                </li>
                <li className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  Related parts information
                </li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                Need help with a specific error code? Use our AI-powered Service Guy tool for personalized 
                troubleshooting assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
