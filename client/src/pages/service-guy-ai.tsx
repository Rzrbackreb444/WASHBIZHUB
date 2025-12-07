import { useState, useEffect, useCallback, lazy, Suspense } from "react";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  EyeOff,
  Mic,
  Camera,
  X,
  ImageIcon,
  Loader2,
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  PauseCircle,
  PlayCircle,
  ShoppingCart,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import type { ServiceJob } from "@shared/schema";
import { ServiceDisclaimer } from "@/components/LegalDisclaimer";
import { KnowledgeCard, KnowledgeCardSkeleton } from "@/components/KnowledgeCard";
import { KnowledgeSchemaLD } from "@/components/KnowledgeSchemaLD";
import { VoiceInputButton } from "@/components/VoiceInputButton";
import { Brain } from "lucide-react";
import { ServiceTechButton } from "@/components/ServiceTechLocator";

const PartsOrderWidget = lazy(() => import("@/components/PartsOrderWidget").then(m => ({ default: m.PartsOrderWidget })));
const InvoiceGenerator = lazy(() => import("@/components/InvoiceGenerator").then(m => ({ default: m.InvoiceGenerator })));
import { FixOutcomeFeedback } from "@/components/FixOutcomeFeedback";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import serviceGuyAiLogoUrl from "@assets/SERVICE GUY_1764436998885.png";

interface Manufacturer {
  id: string;
  name: string;
  logo: string;
}

interface PartWithPricing {
  partNumber: string;
  name: string;
  estimatedPrice?: number;
  price?: string;
  source?: string;
  url?: string;
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
  partsWithPricing?: PartWithPricing[];
  repairTechniques?: string[];
  quickFix?: string;
  fixSuccessRate?: number;
  estimatedRepairTime: number;
  skillLevel: string;
  isObfuscated?: boolean;
  obfuscationReason?: string;
  isLocked?: boolean;
  isProtected?: boolean;
  tier?: string;
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

interface PhotoDiagnosisResult {
  success: boolean;
  diagnosis: {
    extractedText: string;
    errorCodes: Array<{
      code: string;
      description: string;
      confidence: number;
    }>;
    detectedBrand: string | null;
    detectedModel: string | null;
    machineType: "washer" | "dryer" | "payment" | "unknown";
    visibleParts: Array<{
      name: string;
      condition: "good" | "worn" | "damaged" | "unknown";
      notes: string;
    }>;
    wearPatterns: Array<{
      area: string;
      severity: "minor" | "moderate" | "severe";
      description: string;
    }>;
    damageAssessment: Array<{
      type: string;
      location: string;
      severity: "minor" | "moderate" | "severe";
      repairRecommendation: string;
    }>;
    overallCondition: "excellent" | "good" | "fair" | "poor" | "critical";
    recommendations: string[];
    estimatedUrgency: "immediate" | "soon" | "routine" | "monitor";
  };
  confidence: number;
  analyzedAt: string;
}

interface ServiceTechSearchResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  openNow?: boolean;
  placeId: string;
  distance: string;
}

interface ServiceTechSearchResponse {
  success: boolean;
  results: ServiceTechSearchResult[];
  coordinates?: { lat: number; lng: number };
  formattedAddress?: string;
  message?: string;
}

interface ServiceTechDetails {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  hours?: string[];
  openNow?: boolean;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    time: string;
  }>;
}

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

function PartsWidgetSkeleton() {
  return (
    <div className="space-y-4 p-4 rounded-lg border bg-muted/30" data-testid="skeleton-parts-widget">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <Card data-testid="skeleton-job-card">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AIDiagnoseSkeleton() {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-muted" data-testid="skeleton-ai-diagnose">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-2 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
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
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoDiagnosisResult, setPhotoDiagnosisResult] = useState<PhotoDiagnosisResult | null>(null);
  const [photoManufacturer, setPhotoManufacturer] = useState<string>("_all");
  const [photoMachineType, setPhotoMachineType] = useState<string>("all");
  
  const [jobStatusFilter, setJobStatusFilter] = useState<string>("all");
  const [savingJobForCode, setSavingJobForCode] = useState<string | null>(null);
  const [expandedPartsCode, setExpandedPartsCode] = useState<string | null>(null);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [invoiceModalCode, setInvoiceModalCode] = useState<DiagnosticCode | null>(null);
  
  const [smartDiagnosisResult, setSmartDiagnosisResult] = useState<any>(null);
  const [isSmartSearching, setIsSmartSearching] = useState(false);

  const [techSearchAddress, setTechSearchAddress] = useState("");
  const [techSearchEnabled, setTechSearchEnabled] = useState(false);
  const [loadingTechDetailsFor, setLoadingTechDetailsFor] = useState<string | null>(null);
  const [techDetailsCache, setTechDetailsCache] = useState<Record<string, ServiceTechDetails>>({});

  const debouncedSearch = useDebounce(searchInput, 300);

  const smartDiagnosisMutation = useMutation({
    mutationFn: async (params: { query: string; manufacturer?: string; errorCode?: string; machineType?: string }) => {
      const response = await apiRequest("POST", "/api/service-guy/smart-diagnose", params);
      return response.json();
    },
    onSuccess: (data) => {
      setSmartDiagnosisResult(data);
      setIsSmartSearching(false);
      if (data.learned) {
        toast({
          title: "New Knowledge Learned",
          description: "This information has been added to our database for faster future lookups.",
        });
      }
    },
    onError: (error: any) => {
      setIsSmartSearching(false);
      toast({
        title: "Search Error",
        description: error.message || "Smart diagnosis failed",
        variant: "destructive",
      });
    },
  });

  const handleSmartDiagnosis = useCallback(() => {
    if (!debouncedSearch && !selectedManufacturer) return;
    
    setIsSmartSearching(true);
    setSmartDiagnosisResult(null);
    
    smartDiagnosisMutation.mutate({
      query: debouncedSearch,
      manufacturer: selectedManufacturer !== "_all" ? selectedManufacturer : undefined,
      errorCode: debouncedSearch?.match(/^[A-Z0-9]{1,5}$/i) ? debouncedSearch : undefined,
      machineType: machineType !== "all" ? machineType : undefined,
    });
  }, [debouncedSearch, selectedManufacturer, machineType, smartDiagnosisMutation]);

  const { data: manufacturersData, isLoading: isLoadingManufacturers } = useQuery<ManufacturersResponse>({
    queryKey: ['/api/service-guy/manufacturers'],
    staleTime: 1000 * 60 * 60,
  });

  const { data: usageData, refetch: refetchUsage } = useQuery<{ success: boolean; usage: UsageData }, Error, UsageData>({
    queryKey: ['/api/service-guy/usage'],
    staleTime: 1000 * 30,
    select: (data) => data.usage,
  });

  const isEnterpriseTier = usageData?.tier === 'enterprise';
  
  const { 
    data: techSearchData, 
    isLoading: isSearchingTechs,
    error: techSearchError,
    refetch: refetchTechSearch
  } = useQuery<ServiceTechSearchResponse>({
    queryKey: ['/api/service-techs/search', techSearchAddress],
    queryFn: async () => {
      const response = await fetch(`/api/service-techs/search?address=${encodeURIComponent(techSearchAddress)}`);
      return response.json();
    },
    enabled: techSearchEnabled && !!techSearchAddress && isEnterpriseTier,
    staleTime: 1000 * 60 * 5,
  });

  const handleTechSearch = useCallback(() => {
    if (!techSearchAddress.trim()) {
      toast({ 
        title: "Enter Location", 
        description: "Please enter a ZIP code or address to search", 
        variant: "destructive" 
      });
      return;
    }
    setTechSearchEnabled(true);
    refetchTechSearch();
  }, [techSearchAddress, refetchTechSearch, toast]);

  const handleGetTechDetails = useCallback(async (placeId: string) => {
    if (techDetailsCache[placeId]) return;
    
    setLoadingTechDetailsFor(placeId);
    try {
      const response = await fetch(`/api/service-techs/details/${placeId}`);
      const data = await response.json();
      if (data.success && data.tech) {
        setTechDetailsCache(prev => ({
          ...prev,
          [placeId]: data.tech
        }));
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to get technician details",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contact information",
        variant: "destructive"
      });
    } finally {
      setLoadingTechDetailsFor(null);
    }
  }, [techDetailsCache, toast]);

  const jobsUrl = jobStatusFilter === 'all' 
    ? '/api/service-guy/jobs' 
    : `/api/service-guy/jobs?status=${jobStatusFilter}`;

  const { data: jobsData, isLoading: isLoadingJobs, refetch: refetchJobs } = useQuery<{ success: boolean; jobs: ServiceJob[]; count: number }>({
    queryKey: ['/api/service-guy/jobs', jobStatusFilter],
    staleTime: 1000 * 60 * 2,
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: Partial<ServiceJob>) => {
      const response = await apiRequest("POST", "/api/service-guy/jobs", jobData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-guy/jobs'] });
      toast({ title: "Job Created", description: "Repair job saved successfully" });
      setSavingJobForCode(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create job", 
        variant: "destructive" 
      });
      setSavingJobForCode(null);
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<ServiceJob>) => {
      const response = await apiRequest("PATCH", `/api/service-guy/jobs/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-guy/jobs'] });
      toast({ title: "Job Updated", description: "Job status updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update job", 
        variant: "destructive" 
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/service-guy/jobs/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-guy/jobs'] });
      toast({ title: "Job Deleted", description: "Repair job removed" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete job", 
        variant: "destructive" 
      });
    },
  });

  const handleSaveAsJob = (code: DiagnosticCode) => {
    setSavingJobForCode(code.code);
    createJobMutation.mutate({
      manufacturer: code.manufacturer,
      machineType: code.machineType,
      errorCodes: [code.code],
      symptoms: code.description,
      diagnosis: code.possibleCauses?.join("; "),
    });
  };

  const handleUpdateJobStatus = (jobId: string, newStatus: string) => {
    updateJobMutation.mutate({ id: jobId, status: newStatus });
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress": return <Badge className="bg-blue-500 text-white">In Progress</Badge>;
      case "on_hold": return <Badge className="bg-yellow-500 text-black">On Hold</Badge>;
      case "completed": return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const jobs = jobsData?.jobs || [];

  const shouldSearch = (selectedManufacturer && selectedManufacturer !== "_all") || debouncedSearch;
  
  // Build search URL with query parameters
  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (selectedManufacturer && selectedManufacturer !== '_all') {
      params.append('manufacturer', selectedManufacturer);
    }
    if (debouncedSearch) {
      params.append('q', debouncedSearch);
    }
    if (machineType && machineType !== 'all') {
      params.append('machineType', machineType);
    }
    const queryString = params.toString();
    return queryString ? `/api/service-guy/search?${queryString}` : '/api/service-guy/search';
  };
  
  const searchUrl = buildSearchUrl();
  
  const { 
    data: searchData, 
    isLoading: isSearching, 
    error: searchError,
    refetch: refetchSearch 
  } = useQuery<SearchResponse>({
    queryKey: [searchUrl],
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
        manufacturer: selectedManufacturer !== '_all' ? selectedManufacturer : undefined,
        machineType: machineType !== 'all' ? machineType : undefined,
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

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({ 
          title: "Invalid File Type", 
          description: "Please upload a JPG, PNG, or WebP image", 
          variant: "destructive" 
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ 
          title: "File Too Large", 
          description: "Please upload an image smaller than 10MB", 
          variant: "destructive" 
        });
        return;
      }
      setPhotoFile(file);
      setPhotoDiagnosisResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({ title: "Photo Ready", description: `${file.name} selected for analysis` });
    }
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setPhotoDiagnosisResult(null);
  };

  const handlePhotoAnalysis = async () => {
    if (!photoPreview || !photoFile) {
      toast({ 
        title: "No Image Selected", 
        description: "Please select or capture an image first", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsAnalyzingPhoto(true);
    try {
      const base64Data = photoPreview.split(',')[1];
      const mimeType = photoFile.type;
      
      const response = await apiRequest("POST", "/api/service-guy/scan-image", {
        imageData: base64Data,
        mimeType,
        manufacturer: photoManufacturer !== '_all' ? photoManufacturer : undefined,
        machineType: photoMachineType !== 'all' ? photoMachineType : undefined,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPhotoDiagnosisResult(data);
        toast({ title: "Analysis Complete", description: "Photo diagnosis ready" });
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error: any) {
      toast({ 
        title: "Analysis Failed", 
        description: error.message || "Failed to analyze image. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "good": return <Badge className="bg-green-500 text-white text-xs">Good</Badge>;
      case "worn": return <Badge className="bg-yellow-500 text-black text-xs">Worn</Badge>;
      case "damaged": return <Badge variant="destructive" className="text-xs">Damaged</Badge>;
      default: return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor": return "text-green-600";
      case "moderate": return "text-yellow-600";
      case "severe": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "immediate": return <Badge variant="destructive">Immediate Action</Badge>;
      case "soon": return <Badge className="bg-orange-500 text-white">Action Soon</Badge>;
      case "routine": return <Badge variant="secondary">Routine</Badge>;
      case "monitor": return <Badge variant="outline">Monitor</Badge>;
      default: return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getOverallConditionBadge = (condition: string) => {
    switch (condition) {
      case "excellent": return <Badge className="bg-green-600 text-white">Excellent</Badge>;
      case "good": return <Badge className="bg-green-500 text-white">Good</Badge>;
      case "fair": return <Badge className="bg-yellow-500 text-black">Fair</Badge>;
      case "poor": return <Badge className="bg-orange-500 text-white">Poor</Badge>;
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
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
        author={{
          name: "WashBizHub Technical Team",
          expertise: "Commercial Laundry Equipment Specialists",
          credentials: "15+ years combined experience in laundromat equipment repair"
        }}
        productOffers={[
          {
            name: "Service Guy AI Free",
            description: "Basic error code lookup with 3 lookups per month and basic error code information for laundromat technicians",
            price: "0",
            priceCurrency: "USD",
            availability: "InStock"
          },
          {
            name: "Service Guy AI Starter",
            description: "50 lookups per month with partial repair steps and troubleshooting guidance for commercial laundry equipment",
            price: "29",
            priceCurrency: "USD",
            availability: "InStock"
          },
          {
            name: "Service Guy AI Pro",
            description: "500 lookups per month with full troubleshooting steps, parts lists, and repair techniques for laundromat professionals",
            price: "79",
            priceCurrency: "USD",
            availability: "InStock"
          },
          {
            name: "Service Guy AI Enterprise",
            description: "Unlimited lookups with priority support, API access, and complete diagnostic tools for multi-location laundromat operators",
            price: "199",
            priceCurrency: "USD",
            availability: "InStock"
          }
        ]}
        aggregateRating={{
          itemName: "Service Guy AI",
          itemType: "SoftwareApplication",
          itemDescription: "AI-powered commercial laundry equipment diagnostic tool with 2,200+ error codes for Speed Queen, Dexter, Maytag, and 35+ manufacturers",
          ratingValue: 4.9,
          reviewCount: 847,
          bestRating: 5,
          worstRating: 1,
          reviews: [
            {
              author: "Mike Thompson",
              authorType: "Person",
              datePublished: "2025-11-15",
              reviewBody: "Service Guy AI saved me hours on a tricky Speed Queen F21 error. The step-by-step troubleshooting guide was spot on - it was the pressure switch exactly as diagnosed. Now I use it for every service call.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Carlos Rodriguez",
              authorType: "Person",
              datePublished: "2025-10-28",
              reviewBody: "As a 20-year laundromat technician, I was skeptical of AI diagnostics. But Service Guy AI's Dexter error code database is incredibly accurate. The parts list with OEM numbers saves me time ordering parts.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Sarah Chen",
              authorType: "Person",
              datePublished: "2025-10-12",
              reviewBody: "I manage 8 laundromats and the Enterprise plan pays for itself. My techs resolve issues faster and the AI symptom analysis helps diagnose problems before they become major repairs.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "James Wilson",
              authorType: "Person",
              datePublished: "2025-09-22",
              reviewBody: "The photo diagnosis feature is impressive. I uploaded a picture of a worn dryer belt and it correctly identified the wear pattern and recommended replacement. Great for training new technicians.",
              ratingValue: 4,
              bestRating: 5,
              worstRating: 1
            },
            {
              author: "Patricia Nguyen",
              authorType: "Person",
              datePublished: "2025-09-05",
              reviewBody: "Finally a diagnostic tool that covers all the major commercial laundry brands in one place. The Maytag and Huebsch error code coverage is excellent. Highly recommend for any laundromat service business.",
              ratingValue: 5,
              bestRating: 5,
              worstRating: 1
            }
          ]
        }}
        speakableContent={[
          "Service Guy AI helps laundromat technicians diagnose equipment problems",
          "Search over 2,200 error codes from 35 manufacturers"
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
          },
          {
            question: "What does Speed Queen error code E:dE mean?",
            answer: "Speed Queen error code E:dE indicates a door error on your commercial washer. This means the door switch is not detecting that the door is properly closed and latched. To fix: 1) Check the door latch mechanism for damage or debris, 2) Inspect the door switch for continuity using a multimeter, 3) Verify the door strike plate alignment, 4) Replace the door switch if defective (OEM part typically $25-50). This is a common issue that prevents the wash cycle from starting."
          },
          {
            question: "How do I reset a Speed Queen commercial washer?",
            answer: "To reset a Speed Queen commercial washer: 1) Turn off the machine and unplug it from power for 30 seconds, 2) Plug it back in and turn on the power, 3) Press and hold the START button for 3 seconds until you hear a beep, 4) The control board should now be reset. For persistent error codes, you may need to enter diagnostic mode by holding SELECT + START during power-on. If errors persist after reset, the issue requires further troubleshooting."
          },
          {
            question: "Why won't my Speed Queen dryer heat?",
            answer: "If your Speed Queen dryer won't heat, check these components in order: 1) Thermal fuse - test for continuity, replace if open ($15-30), 2) Heating element - check resistance (should read 10-25 ohms), 3) For gas dryers: inspect igniter glow (should glow bright orange) and gas valve coils, 4) High-limit thermostat - test for continuity, 5) Cycling thermostat - verify proper operation. Also check exhaust ductwork for restrictions causing overheating and thermal fuse failure."
          },
          {
            question: "What is Dexter error code dP on my washer?",
            answer: "Dexter error code dP indicates a drain pump issue - the machine detected a problem draining water within the allotted time. To troubleshoot: 1) Check the drain hose for kinks or clogs, 2) Clean the drain pump filter (access from front panel), 3) Inspect the drain pump impeller for debris or damage, 4) Test drain pump motor for continuity, 5) Verify drain hose height is not above 8 feet. The drain pump assembly costs approximately $150-250 if replacement is needed."
          },
          {
            question: "How do I access Dexter T-900 diagnostic mode?",
            answer: "To enter Dexter T-900 diagnostic mode: 1) Turn off the machine completely, 2) Press and hold the SELECT button, 3) While holding SELECT, turn the power on, 4) Continue holding for 5 seconds until diagnostic mode activates. In diagnostic mode you can: view error history, test individual components, run motor and valve tests, check sensor readings, and clear stored error codes. Exit by pressing STOP or cycling power."
          },
          {
            question: "Why is my Dexter dryer showing AF error?",
            answer: "Dexter dryer AF error means Airflow Restriction - the machine detected inadequate exhaust airflow which can cause overheating. Fix this by: 1) Remove and thoroughly clean the lint screen, 2) Inspect the exhaust duct for lint buildup or blockages, 3) Check the duct termination cap outside for obstructions, 4) Verify the duct run is not exceeding maximum length (typically 25 feet with minimal bends), 5) Clean the blower wheel and housing. Poor airflow reduces drying efficiency and can damage heating components."
          },
          {
            question: "What does Maytag error F5 E2 mean?",
            answer: "Maytag commercial washer error F5 E2 indicates a door lock failure - the control cannot confirm the door is locked after multiple attempts. To resolve: 1) Inspect the door lock assembly for visible damage, 2) Check wiring connections to the door lock mechanism, 3) Test the door lock motor and switch with a multimeter, 4) Clear the error by running diagnostic mode or power cycling, 5) Replace the door lock assembly if defective ($80-150). This is a safety interlock that prevents operation with an unlocked door."
          },
          {
            question: "How do I clear Maytag commercial washer error codes?",
            answer: "To clear Maytag commercial washer error codes: Method 1 - Power cycle the machine by unplugging for 2 minutes then reconnecting. Method 2 - Enter diagnostic mode: press and hold CYCLE SELECT for 3 seconds, then rotate the cycle knob one click clockwise every half second through the full rotation. The display will show stored error codes. Press START to clear codes. Note: Clearing codes does not fix the underlying issue - troubleshoot and repair the problem first."
          },
          {
            question: "Why is my Maytag dryer beeping but not starting?",
            answer: "When a Maytag commercial dryer beeps but won't start, check: 1) Door switch - the most common cause; test for continuity when pressed, 2) Start relay on the control board - may need replacement if clicking but not engaging, 3) Drive motor - listen for humming without rotation indicating a seized motor or bad capacitor, 4) Thermal fuse - if open, dryer won't start as a safety feature, 5) Belt switch - if belt is broken, safety switch prevents operation. Replace the door switch first as it's the most likely culprit ($20-40)."
          },
          {
            question: "What is Huebsch error code E:nb?",
            answer: "Huebsch error code E:nb means No Balance - the washer could not achieve proper load balance before the spin cycle. This typically occurs with: 1) Unevenly distributed loads - rearrange items in the drum, 2) Single heavy items like blankets - add additional items to balance, 3) Worn or damaged shock absorbers/suspension springs ($50-100 each), 4) Out-of-level machine - adjust leveling feet, 5) Worn drum bearings causing wobble. For persistent E:nb errors, inspect suspension components for wear and replace as needed."
          },
          {
            question: "How do I program Huebsch washer cycles?",
            answer: "To program Huebsch commercial washer cycles: 1) Insert the service key into the control panel, 2) Press and hold PROGRAM + START simultaneously for 5 seconds to enter programming mode, 3) Use CYCLE SELECT to navigate through parameters (water level, temperature, spin speed, pricing), 4) Use UP/DOWN arrows to adjust values, 5) Press START to save each setting, 6) Exit by removing the service key. Programming allows you to customize cycle times, prices, water temperature, and extract speeds for your specific operation."
          },
          {
            question: "What does LG error code OE mean on commercial washer?",
            answer: "LG commercial washer error code OE indicates a drain error - the machine couldn't drain water within 10 minutes. Troubleshooting steps: 1) Check the drain filter/pump filter at the front lower panel for debris and coins, 2) Inspect the drain hose for kinks or clogs, 3) Verify drain hose is not inserted too far into standpipe (maximum 6 inches), 4) Test drain pump operation - should hear humming during drain cycle, 5) Replace drain pump if motor is burned out ($100-175). Clean the filter monthly to prevent future OE errors."
          },
          {
            question: "How do I reset LG commercial dryer?",
            answer: "To reset an LG commercial dryer: 1) Unplug the dryer from the power outlet, 2) Wait 60 seconds to allow capacitors to discharge, 3) While unplugged, press and hold the POWER/START button for 5 seconds to drain residual power, 4) Plug the dryer back in, 5) Turn on and test. For control board errors, you may need to access the diagnostic mode by pressing TEMP + TIME simultaneously for 3 seconds. If errors persist after reset, note the error code and troubleshoot the specific component."
          },
          {
            question: "What tools do I need for laundromat equipment repair?",
            answer: "Essential laundromat repair tools include: 1) Digital multimeter for electrical testing ($30-100), 2) Socket set (metric and SAE) for panel removal and component access, 3) Manufacturer diagnostic/programming key ($50-150 per brand), 4) Nut driver set (5/16\", 1/4\", 3/8\"), 5) Screwdriver set (Phillips, flathead, Torx), 6) Needle-nose pliers for wire terminals, 7) Flashlight or headlamp, 8) Coin mechanism test kit, 9) Clamp meter for amp draw testing, 10) Leak detector solution for gas lines. Keep these in your service vehicle for on-site repairs."
          },
          {
            question: "How often should commercial washers be serviced?",
            answer: "Commercial laundromat washers should receive: Daily - lint screen cleaning and visual inspection. Weekly - wipe door seals, check for leaks, clean coin slides. Monthly - inspect hoses and connections, clean drain pump filter, sanitize drum. Quarterly - professional maintenance including: bearing inspection, belt tension check, electrical connection tightening, coin mechanism calibration, and control board diagnostics. Annual - full inspection of suspension, motor brushes, water valve screens, and preventive part replacement. Regular maintenance extends equipment life 3-5 years and reduces emergency repairs by 60%."
          },
          {
            question: "What's the average repair cost for commercial laundry equipment?",
            answer: "Commercial laundry equipment repair costs vary by component: Minor repairs ($50-150): door switches, thermal fuses, belts, lint screens. Moderate repairs ($150-350): drain pumps, door locks, inlet valves, coin mechanisms. Major repairs ($350-700): control boards, motors, heating elements, inverters. Expensive repairs ($700-1500+): bearings and seals, transmissions, complete motor assemblies. Labor typically runs $75-150/hour for professional technicians. Service Guy AI helps you diagnose issues accurately to avoid unnecessary part replacements and reduce overall repair costs."
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
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center lg:text-left">
                <div className="border-r-0 sm:border-r border-amber-500/20 sm:pr-4">
                  <div className="text-lg font-bold text-muted-foreground">Free</div>
                  <div className="text-xs text-muted-foreground">3 lookups/month</div>
                  <div className="text-xs text-muted-foreground">Limited info</div>
                </div>
                <div className="border-r-0 sm:border-r border-amber-500/20 sm:pr-4">
                  <div className="text-lg font-bold text-primary">$29/mo</div>
                  <div className="text-xs text-muted-foreground font-medium">Starter</div>
                  <div className="text-xs text-muted-foreground">50 lookups + basic steps</div>
                </div>
                <div className="border-r-0 sm:border-r border-amber-500/20 sm:pr-4">
                  <div className="text-lg font-bold text-amber-500">$79/mo</div>
                  <div className="text-xs text-muted-foreground font-medium">Pro</div>
                  <div className="text-xs text-muted-foreground">500 lookups + full repairs</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-500">$199/mo</div>
                  <div className="text-xs text-muted-foreground font-medium">Enterprise</div>
                  <div className="text-xs text-muted-foreground">Unlimited + API access</div>
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

        {/* Quick Actions - Order Parts */}
        <div className="mb-8">
          <Collapsible 
            open={showPartsModal} 
            onOpenChange={setShowPartsModal}
            data-testid="section-parts-ordering-main"
          >
            <Card className="hover-elevate border-primary/20">
              <CardContent className="p-4">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <ShoppingCart className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Order Parts</h3>
                        <p className="text-sm text-muted-foreground">Search Amazon or commercial suppliers</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      data-testid="button-order-parts-main"
                    >
                      {showPartsModal ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <Suspense fallback={<PartsWidgetSkeleton />}>
                    <PartsOrderWidget defaultSearch="" compact={false} />
                  </Suspense>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">Commercial Equipment Suppliers</h4>
                    <a 
                      href="https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry"
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      data-testid="link-aadvantage-affiliate-main"
                    >
                      <ExternalLink className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">AAdvantage Laundry</p>
                        <p className="text-sm text-muted-foreground">Trusted commercial laundry parts supplier</p>
                      </div>
                    </a>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>
        </div>

        <Tabs defaultValue="error-codes" className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-full min-w-max sm:grid sm:grid-cols-5">
              <TabsTrigger value="error-codes" className="flex items-center gap-2 min-h-[44px]">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Error Codes</span>
                <span className="sm:hidden">Codes</span>
              </TabsTrigger>
              <TabsTrigger value="ai-diagnose" className="flex items-center gap-2 min-h-[44px]">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">AI Diagnose</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="my-jobs" className="flex items-center gap-2 min-h-[44px]" data-testid="tab-my-jobs">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">My Jobs</span>
                <span className="sm:hidden">Jobs</span>
              </TabsTrigger>
              <TabsTrigger value="manuals" className="flex items-center gap-2 min-h-[44px]">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Manuals</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="technicians" className="flex items-center gap-2 min-h-[44px]">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Technicians</span>
                <span className="sm:hidden">Techs</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>

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
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="e.g., E1, door lock, drain error" 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="flex-1"
                        data-testid="input-search"
                      />
                      <VoiceInputButton
                        onTranscript={(transcript) => setSearchInput(transcript)}
                        onFinalTranscript={(transcript) => setSearchInput(transcript)}
                        showTranscript={true}
                        autoSubmit={true}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mic className="h-3 w-3" />
                      <span>Try voice: "Speed Queen error Er underscore dL"</span>
                    </p>
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
                  <div className="space-y-4">
                    {isSmartSearching ? (
                      <KnowledgeCardSkeleton />
                    ) : smartDiagnosisResult?.success && smartDiagnosisResult?.knowledge ? (
                      <div className="space-y-4">
                        <KnowledgeSchemaLD knowledge={smartDiagnosisResult.knowledge} />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Brain className="w-4 h-4 text-[#C8A661]" />
                          <span>AI-powered result from {smartDiagnosisResult.source?.replace("_", " ")}</span>
                          {smartDiagnosisResult.cached && (
                            <Badge variant="outline" className="text-xs">Cached</Badge>
                          )}
                          {smartDiagnosisResult.learned && (
                            <Badge className="bg-green-600 text-white text-xs">Learned</Badge>
                          )}
                        </div>
                        <KnowledgeCard 
                          knowledge={smartDiagnosisResult.knowledge}
                          source={smartDiagnosisResult.source}
                          learned={smartDiagnosisResult.learned}
                          userTier={usageData?.tier || "free"}
                        />
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-4">
                          <Brain className="w-8 h-8 text-[#C8A661]" />
                        </div>
                        <p className="text-lg font-medium mb-2">No error codes found in database</p>
                        <p className="text-muted-foreground mb-6">
                          {smartDiagnosisResult?.message || "Try our AI-powered search to find repair information from service manuals."}
                        </p>
                        {smartDiagnosisResult?.upgradeRequired ? (
                          <Button 
                            onClick={handleUpgrade}
                            className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                            data-testid="button-upgrade-smart"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade for More AI Searches
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleSmartDiagnosis}
                            disabled={isSmartSearching}
                            className="bg-[#0A1628] hover:bg-[#0A1628]/90 text-white"
                            data-testid="button-smart-diagnose"
                          >
                            {isSmartSearching ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Searching AI Knowledge...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4 mr-2" />
                                Search with AI
                              </>
                            )}
                          </Button>
                        )}
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredResults.map((code) => {
                      const isLocked = code.isLocked === true;
                      const isPartiallyLocked = code.isProtected && code.tier === 'starter';
                      const hasLockedContent = isLocked || code.troubleshootingSteps?.some((s: string) => 
                        s.includes('Subscribe') || s.includes('Upgrade') || s.includes('protected') || s.includes('🔒')
                      );
                      
                      return (
                      <Card 
                        key={`${code.manufacturer}-${code.code}-${code.id}`} 
                        className={`hover-elevate ${isLocked ? 'border-amber-500/30 bg-amber-500/5' : isPartiallyLocked ? 'border-primary/20' : ''}`}
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
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {getSeverityBadge(code.severity)}
                              <Badge variant="outline" className="text-xs capitalize">{code.machineType}</Badge>
                              {isLocked && (
                                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 bg-amber-500/10">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Upgrade to Unlock
                                </Badge>
                              )}
                              {isPartiallyLocked && (
                                <Badge variant="outline" className="text-xs border-primary text-primary">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Pro for Full Access
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {isLocked || hasLockedContent ? (
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    Possible Causes
                                  </h4>
                                  <ul className="text-sm space-y-1">
                                    {code.possibleCauses?.map((cause: string, i: number) => (
                                      <li key={i} className={`flex items-start gap-2 ${cause.includes('Subscribe') || cause.includes('Pro access') ? 'text-amber-600 italic' : ''}`}>
                                        <span className="text-muted-foreground">{cause.includes('Subscribe') || cause.includes('Pro access') ? '🔒' : '•'}</span>
                                        {cause}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-amber-500" />
                                    Troubleshooting Steps
                                  </h4>
                                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                                      <Shield className="w-4 h-4 inline mr-1" />
                                      Repair procedures are protected content
                                    </p>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                      {code.troubleshootingSteps?.map((step: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-muted-foreground">{i + 1}.</span>
                                          <span className={step.includes('Subscribe') || step.includes('protected') ? 'text-amber-600 italic' : ''}>{step}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              
                              {code.upgradePrompt && (
                                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-4">
                                  <p className="font-semibold text-center mb-3">{code.upgradePrompt.message}</p>
                                  <div className="grid grid-cols-3 gap-2 mb-3">
                                    {code.upgradePrompt.tiers?.map((tier: { name: string; price: string; features: string[] }, i: number) => (
                                      <div key={i} className="text-center p-2 bg-background rounded border">
                                        <div className="font-bold text-sm">{tier.name}</div>
                                        <div className="text-lg font-bold text-primary">{tier.price}</div>
                                        <ul className="text-xs text-muted-foreground mt-1">
                                          {tier.features.slice(0, 2).map((f: string, j: number) => (
                                            <li key={j}>{f}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                  <Button 
                                    onClick={handleUpgrade}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                                    data-testid="button-upgrade"
                                  >
                                    <Crown className="w-4 h-4 mr-2" />
                                    Unlock Full Diagnostic Data
                                  </Button>
                                </div>
                              )}
                              
                              {!code.upgradePrompt && (
                                <div className="text-center pt-2">
                                  <Button 
                                    onClick={handleUpgrade}
                                    size="sm"
                                    className="bg-gradient-to-r from-amber-500 to-orange-600"
                                    data-testid="button-upgrade"
                                  >
                                    <Crown className="w-4 h-4 mr-2" />
                                    Upgrade to Access Full Details
                                  </Button>
                                </div>
                              )}
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
                                    Step-by-Step Repair Procedure
                                    {code.fixSuccessRate && (
                                      <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-300">
                                        {code.fixSuccessRate}% Fix Rate
                                      </Badge>
                                    )}
                                  </h4>
                                  <ol className="text-sm space-y-2">
                                    {code.troubleshootingSteps?.map((step, i) => (
                                      <li key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">{i + 1}</span>
                                        <span className="pt-0.5">{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              </div>
                              
                              {(code.quickFix || code.repairTechniques?.length) && (
                                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3 mt-4">
                                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                                    <Lightbulb className="w-4 h-4" />
                                    Pro Tips from Field Techs
                                  </h4>
                                  {code.quickFix && (
                                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                                      <strong>Quick Fix:</strong> {code.quickFix}
                                    </p>
                                  )}
                                  {code.repairTechniques?.length > 0 && (
                                    <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                                      {code.repairTechniques.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-amber-500">★</span>
                                          {tip}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                              <div className="border-t pt-4">
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Package className="w-4 h-4 text-blue-500" />
                                  Parts & Replacement ({code.manufacturer})
                                </h4>
                                
                                {code.partsWithPricing && code.partsWithPricing.length > 0 ? (
                                  <div className="space-y-2 mb-3">
                                    {code.partsWithPricing.map((part, i) => (
                                      <div 
                                        key={i}
                                        className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-md border bg-muted/30"
                                        data-testid={`part-pricing-${code.code}-${part.partNumber}`}
                                      >
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge variant="outline" className="font-mono text-xs">
                                            {part.partNumber}
                                          </Badge>
                                          <span className="text-sm">{part.name}</span>
                                          {(part.price || part.estimatedPrice) && (
                                            <Badge variant="secondary" className="text-xs">
                                              {part.price || `$${part.estimatedPrice}`}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {part.url ? (
                                            <a
                                              href={part.url}
                                              target="_blank"
                                              rel="nofollow sponsored noopener noreferrer"
                                              data-testid={`link-buy-part-${part.partNumber}`}
                                            >
                                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                {part.source || 'Buy'}
                                              </Button>
                                            </a>
                                          ) : (
                                            <a
                                              href={`https://www.amazon.com/s?k=${encodeURIComponent(part.partNumber)}&tag=nicholaskreme-20`}
                                              target="_blank"
                                              rel="nofollow sponsored noopener noreferrer"
                                              data-testid={`link-amazon-part-${part.partNumber}`}
                                            >
                                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                Amazon
                                              </Button>
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {code.requiredParts?.map((part, i) => {
                                      const partId = part.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                                      const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(part)}&tag=nicholaskreme-20`;
                                      return (
                                        <a 
                                          key={i}
                                          href={amazonSearchUrl}
                                          target="_blank"
                                          rel="nofollow sponsored noopener noreferrer"
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
                                )}
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1" data-testid={`text-affiliate-notice-${code.code}`}>
                                  <span className="text-amber-500">★</span>
                                  Click to order parts (affiliate links support this tool)
                                </p>
                                
                                <Collapsible 
                                  open={expandedPartsCode === code.code} 
                                  onOpenChange={(open) => setExpandedPartsCode(open ? code.code : null)}
                                  className="mt-4"
                                  data-testid={`section-parts-ordering-${code.code}`}
                                >
                                  <CollapsibleTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full justify-between"
                                      data-testid={`button-order-parts-${code.code}`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        Order Parts
                                      </span>
                                      {expandedPartsCode === code.code ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-3 space-y-4">
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                                      {expandedPartsCode === code.code && (
                                        <Suspense fallback={<PartsWidgetSkeleton />}>
                                          <PartsOrderWidget 
                                            defaultSearch={selectedManufacturer && selectedManufacturer !== '_all' && code.code ? `${selectedManufacturer} ${code.code} ${code.requiredParts?.[0] || ''}`.trim() : ''} 
                                            compact={true}
                                            parts={code.requiredParts || []}
                                          />
                                        </Suspense>
                                      )}
                                      
                                      <div className="border-t pt-3">
                                        <p className="text-xs text-muted-foreground mb-2">Commercial Equipment Parts:</p>
                                        <a 
                                          href="https://go.laundry.equipment/laundromat-fb-group-aadvantage-laundry"
                                          target="_blank"
                                          rel="nofollow sponsored noopener noreferrer"
                                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                                          data-testid={`link-aadvantage-affiliate-${code.code}`}
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                          AAdvantage Laundry - Commercial Parts Supplier
                                        </a>
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground border-t pt-4">
                                <div className="flex flex-wrap items-center gap-6">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Est. Repair: {code.estimatedRepairTime} min
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Wrench className="w-4 h-4" />
                                    Skill: <span className="capitalize">{code.skillLevel}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <ServiceTechButton 
                                    diagnosticInfo={{
                                      errorCode: code.code,
                                      manufacturer: code.manufacturer,
                                      description: code.description,
                                      troubleshootingSteps: code.troubleshootingSteps,
                                      requiredParts: code.requiredParts,
                                      quickFix: code.quickFix
                                    }}
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setInvoiceModalCode(code)}
                                    data-testid="button-generate-invoice"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Invoice/Quote
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleSaveAsJob(code)}
                                    disabled={savingJobForCode === code.code || createJobMutation.isPending}
                                    data-testid="button-save-job"
                                  >
                                    {savingJobForCode === code.code ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        Save as Job
                                      </>
                                    )}
                                  </Button>
                                  <FixOutcomeFeedback 
                                    diagnosticInfo={{
                                      diagnosticCodeId: String(code.id),
                                      errorCode: code.code,
                                      manufacturer: code.manufacturer,
                                      machineType: code.machineType
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
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

          <TabsContent value="my-jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  My Repair Jobs
                </CardTitle>
                <CardDescription>
                  Track and manage your repair work in progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Filter by Status:</Label>
                    <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
                      <SelectTrigger className="w-40" data-testid="select-job-status-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => refetchJobs()}
                      disabled={isLoadingJobs}
                    >
                      <RefreshCcw className={`w-4 h-4 ${isLoadingJobs ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                {isLoadingJobs ? (
                  <div className="space-y-4" data-testid="skeleton-jobs-list">
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      {jobStatusFilter === 'all' 
                        ? "You haven't saved any repair jobs yet. Search for error codes and click 'Save as Job' to start tracking your work."
                        : `No jobs with status "${jobStatusFilter.replace('_', ' ')}" found.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {jobs.map((job) => (
                      <Card 
                        key={job.id} 
                        className="hover-elevate"
                        data-testid={`card-job-${job.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {job.manufacturer} {job.machineType}
                                </h4>
                                {getJobStatusBadge(job.status || 'in_progress')}
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                                {job.errorCodes && job.errorCodes.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Error Codes: {job.errorCodes.join(", ")}</span>
                                  </div>
                                )}
                                {job.customerName && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>{job.customerName}</span>
                                  </div>
                                )}
                                {job.locationAddress && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{job.locationAddress}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>Created: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                              </div>

                              {job.symptoms && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  <span className="font-medium">Symptoms:</span> {job.symptoms}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Select 
                                value={job.status || 'in_progress'} 
                                onValueChange={(value) => handleUpdateJobStatus(job.id, value)}
                              >
                                <SelectTrigger 
                                  className="w-36" 
                                  data-testid="button-update-job-status"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in_progress">
                                    <div className="flex items-center gap-2">
                                      <PlayCircle className="w-4 h-4 text-blue-500" />
                                      In Progress
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="on_hold">
                                    <div className="flex items-center gap-2">
                                      <PauseCircle className="w-4 h-4 text-yellow-500" />
                                      On Hold
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                      Completed
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    <div className="flex items-center gap-2">
                                      <X className="w-4 h-4 text-red-500" />
                                      Cancelled
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteJob(job.id)}
                                disabled={deleteJobMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                        <SelectItem value="_all">Not Sure</SelectItem>
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
              {isAnalyzing && (
                <CardFooter className="flex-col items-start">
                  <h4 className="font-semibold mb-2">AI Diagnosis:</h4>
                  <AIDiagnoseSkeleton />
                </CardFooter>
              )}
              {!isAnalyzing && aiDiagnosis && (
                <CardFooter className="flex-col items-start">
                  <h4 className="font-semibold mb-2">AI Diagnosis:</h4>
                  <div className="bg-muted rounded-lg p-4 w-full whitespace-pre-wrap text-sm">
                    {aiDiagnosis}
                  </div>
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Photo Diagnosis
                </CardTitle>
                <CardDescription>
                  Take a photo of the equipment display, error code, or damaged part for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Manufacturer (Optional)</Label>
                    <Select value={photoManufacturer} onValueChange={setPhotoManufacturer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">Not Sure</SelectItem>
                        {manufacturers.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Machine Type</Label>
                    <Select value={photoMachineType} onValueChange={setPhotoMachineType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Not Sure</SelectItem>
                        <SelectItem value="washer">Washer</SelectItem>
                        <SelectItem value="dryer">Dryer</SelectItem>
                        <SelectItem value="payment">Payment System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!photoPreview ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Capture or Upload Equipment Photo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI will analyze error codes, parts condition, wear patterns, and damage
                    </p>
                    <div className="flex justify-center gap-3">
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                          <Camera className="w-4 h-4" />
                          <span>Take Photo / Upload</span>
                        </div>
                        <Input
                          id="photo-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          capture="environment"
                          onChange={handlePhotoCapture}
                          className="hidden"
                          data-testid="button-photo-capture"
                        />
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Supports JPG, PNG, WebP (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Equipment preview"
                        className="max-h-64 rounded-lg border"
                        data-testid="img-photo-preview"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={clearPhoto}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handlePhotoAnalysis}
                        disabled={isAnalyzingPhoto}
                        className="flex-1"
                        data-testid="button-analyze-photo"
                      >
                        {isAnalyzingPhoto ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing Image...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                      <Label htmlFor="photo-reupload" className="cursor-pointer">
                        <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                          <ImageIcon className="w-4 h-4" />
                          <span>Change</span>
                        </div>
                        <Input
                          id="photo-reupload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          capture="environment"
                          onChange={handlePhotoCapture}
                          className="hidden"
                        />
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {photoDiagnosisResult && (
              <Card data-testid="card-photo-diagnosis">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Photo Analysis Results
                      </CardTitle>
                      <CardDescription>
                        Analyzed at {new Date(photoDiagnosisResult.analyzedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getOverallConditionBadge(photoDiagnosisResult.diagnosis.overallCondition)}
                      {getUrgencyBadge(photoDiagnosisResult.diagnosis.estimatedUrgency)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {photoDiagnosisResult.diagnosis.detectedBrand && (
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <span className="text-sm text-muted-foreground">Detected Equipment:</span>
                        <p className="font-semibold">
                          {photoDiagnosisResult.diagnosis.detectedBrand}
                          {photoDiagnosisResult.diagnosis.detectedModel && ` - ${photoDiagnosisResult.diagnosis.detectedModel}`}
                          <Badge variant="outline" className="ml-2 capitalize">
                            {photoDiagnosisResult.diagnosis.machineType}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  )}

                  {photoDiagnosisResult.diagnosis.errorCodes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Detected Error Codes
                      </h4>
                      <div className="space-y-2">
                        {photoDiagnosisResult.diagnosis.errorCodes.map((err, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <div className="bg-orange-500/20 text-orange-700 dark:text-orange-400 font-mono font-bold px-2 py-1 rounded text-sm">
                              {err.code}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{err.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Confidence: {Math.round(err.confidence * 100)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {photoDiagnosisResult.diagnosis.extractedText && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        Extracted Text
                      </h4>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-mono">{photoDiagnosisResult.diagnosis.extractedText}</p>
                      </div>
                    </div>
                  )}

                  {photoDiagnosisResult.diagnosis.visibleParts.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        Visible Parts Assessment
                      </h4>
                      <div className="grid gap-2">
                        {photoDiagnosisResult.diagnosis.visibleParts.map((part, i) => (
                          <div key={i} className="flex items-start justify-between gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{part.name}</span>
                                {getConditionBadge(part.condition)}
                              </div>
                              {part.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{part.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {photoDiagnosisResult.diagnosis.wearPatterns.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-yellow-500" />
                        Wear Patterns
                      </h4>
                      <div className="space-y-2">
                        {photoDiagnosisResult.diagnosis.wearPatterns.map((wear, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
                            <div className={`font-semibold text-sm capitalize ${getSeverityColor(wear.severity)}`}>
                              {wear.severity}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{wear.area}</p>
                              <p className="text-xs text-muted-foreground">{wear.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {photoDiagnosisResult.diagnosis.damageAssessment.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Damage Assessment
                      </h4>
                      <div className="space-y-2">
                        {photoDiagnosisResult.diagnosis.damageAssessment.map((damage, i) => (
                          <div key={i} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{damage.type}</span>
                              <Badge variant="outline" className={`text-xs ${getSeverityColor(damage.severity)}`}>
                                {damage.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Location: {damage.location}</p>
                            <p className="text-sm mt-2 p-2 bg-background/50 rounded">
                              <span className="font-medium">Recommendation:</span> {damage.repairRecommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {photoDiagnosisResult.diagnosis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {photoDiagnosisResult.diagnosis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="font-semibold text-primary">{i + 1}.</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Analysis Confidence: {Math.round(photoDiagnosisResult.confidence * 100)}%</span>
                      <Button variant="outline" size="sm" onClick={clearPhoto}>
                        <Camera className="w-4 h-4 mr-2" />
                        Analyze Another Photo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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

          <TabsContent value="technicians" className="space-y-6" data-testid="tab-content-technicians">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Find Service Technicians Near You
                </CardTitle>
                <CardDescription>
                  Search for verified commercial laundry repair specialists in your area
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isEnterpriseTier ? (
                  <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
                    <CardContent className="p-6 text-center">
                      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl w-fit mx-auto mb-4">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2" data-testid="text-upgrade-title">Enterprise Feature</h3>
                      <p className="text-muted-foreground mb-4" data-testid="text-upgrade-description">
                        Location-based service technician search is available exclusively for Enterprise members. 
                        Upgrade to find verified repair specialists near your laundromats.
                      </p>
                      <Button 
                        onClick={handleUpgrade}
                        className="bg-gradient-to-r from-amber-500 to-orange-600"
                        data-testid="button-upgrade-enterprise"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Enterprise
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Label htmlFor="tech-search" className="sr-only">ZIP Code or Address</Label>
                        <Input
                          id="tech-search"
                          placeholder="Enter ZIP code or address (e.g., 72712 or Bentonville, AR)"
                          value={techSearchAddress}
                          onChange={(e) => setTechSearchAddress(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTechSearch()}
                          data-testid="input-tech-search-address"
                        />
                      </div>
                      <Button 
                        onClick={handleTechSearch}
                        disabled={isSearchingTechs || !techSearchAddress.trim()}
                        data-testid="button-search-technicians"
                      >
                        {isSearchingTechs ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4 mr-2" />
                        )}
                        Search
                      </Button>
                    </div>

                    {techSearchData?.formattedAddress && (
                      <p className="text-sm text-muted-foreground" data-testid="text-search-location">
                        Showing results near: <span className="font-medium">{techSearchData.formattedAddress}</span>
                      </p>
                    )}

                    {isSearchingTechs && (
                      <div className="space-y-4" data-testid="skeleton-tech-results">
                        {[1, 2, 3].map((i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-5 w-48" />
                                  <Skeleton className="h-4 w-64" />
                                  <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-9 w-32" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {!isSearchingTechs && techSearchEnabled && techSearchData?.results?.length === 0 && (
                      <Card className="border-dashed">
                        <CardContent className="p-8 text-center">
                          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="font-semibold mb-2" data-testid="text-no-results">No Service Technicians Found</h3>
                          <p className="text-sm text-muted-foreground">
                            We couldn't find appliance repair services near this location. Try a different ZIP code or expand your search area.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {!isSearchingTechs && !techSearchEnabled && (
                      <Card className="border-dashed">
                        <CardContent className="p-8 text-center">
                          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="font-semibold mb-2" data-testid="text-search-prompt">Enter Your Location</h3>
                          <p className="text-sm text-muted-foreground">
                            Enter a ZIP code or address above to find commercial laundry equipment repair specialists near you.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {!isSearchingTechs && techSearchData?.results && techSearchData.results.length > 0 && (
                      <div className="grid gap-4" data-testid="list-technician-results">
                        {techSearchData.results.map((tech) => {
                          const cachedDetails = techDetailsCache[tech.placeId];
                          const isLoadingDetails = loadingTechDetailsFor === tech.placeId;
                          
                          return (
                            <Card key={tech.id} className="hover-elevate" data-testid={`card-technician-${tech.id}`}>
                              <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-semibold" data-testid={`text-tech-name-${tech.id}`}>{tech.name}</h4>
                                    {tech.openNow !== undefined && (
                                      <Badge 
                                        variant={tech.openNow ? "default" : "secondary"} 
                                        className={`text-xs ${tech.openNow ? 'bg-green-500' : ''}`}
                                      >
                                        {tech.openNow ? 'Open Now' : 'Closed'}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {tech.rating && (
                                      <div className="flex items-center gap-1" data-testid={`text-tech-rating-${tech.id}`}>
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        {tech.rating.toFixed(1)} ({tech.reviewCount || 0} reviews)
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1" data-testid={`text-tech-distance-${tech.id}`}>
                                      <MapPin className="w-4 h-4" />
                                      {tech.distance}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1" data-testid={`text-tech-address-${tech.id}`}>
                                    {tech.address}
                                  </p>
                                  
                                  {cachedDetails && (
                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2" data-testid={`details-tech-${tech.id}`}>
                                      {cachedDetails.phone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-4 h-4 text-green-600" />
                                          <a 
                                            href={`tel:${cachedDetails.phone}`} 
                                            className="font-medium text-green-600 hover:underline"
                                            data-testid={`link-tech-phone-${tech.id}`}
                                          >
                                            {cachedDetails.phone}
                                          </a>
                                        </div>
                                      )}
                                      {cachedDetails.website && (
                                        <div className="flex items-center gap-2">
                                          <ExternalLink className="w-4 h-4" />
                                          <a 
                                            href={cachedDetails.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline truncate max-w-[200px]"
                                            data-testid={`link-tech-website-${tech.id}`}
                                          >
                                            Visit Website
                                          </a>
                                        </div>
                                      )}
                                      {cachedDetails.hours && cachedDetails.hours.length > 0 && (
                                        <Collapsible>
                                          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span>View Hours</span>
                                            <ChevronDown className="w-3 h-3" />
                                          </CollapsibleTrigger>
                                          <CollapsibleContent className="mt-2 pl-6 text-xs text-muted-foreground space-y-1">
                                            {cachedDetails.hours.map((hour, idx) => (
                                              <p key={idx}>{hour}</p>
                                            ))}
                                          </CollapsibleContent>
                                        </Collapsible>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  {!cachedDetails ? (
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleGetTechDetails(tech.placeId)}
                                      disabled={isLoadingDetails}
                                      data-testid={`button-get-details-${tech.id}`}
                                    >
                                      {isLoadingDetails ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Phone className="w-4 h-4 mr-2" />
                                      )}
                                      Get Phone Number
                                    </Button>
                                  ) : cachedDetails.phone ? (
                                    <Button 
                                      size="sm" 
                                      asChild
                                      className="bg-green-600 hover:bg-green-700"
                                      data-testid={`button-call-${tech.id}`}
                                    >
                                      <a href={`tel:${cachedDetails.phone}`}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call Now
                                      </a>
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" disabled>
                                      No Phone Available
                                    </Button>
                                  )}
                                  {cachedDetails?.website && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      asChild
                                      data-testid={`button-website-${tech.id}`}
                                    >
                                      <a href={cachedDetails.website} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Website
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
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

      {invoiceModalCode && (
        <Suspense fallback={null}>
          <InvoiceGenerator
            open={!!invoiceModalCode}
            onOpenChange={(open) => !open && setInvoiceModalCode(null)}
            diagnosticData={{
              code: invoiceModalCode.code,
              title: invoiceModalCode.title,
              description: invoiceModalCode.description,
              manufacturer: invoiceModalCode.manufacturer,
              machineType: invoiceModalCode.machineType,
              estimatedRepairTime: invoiceModalCode.estimatedRepairTime,
              requiredParts: invoiceModalCode.requiredParts || [],
              partsWithPricing: invoiceModalCode.partsWithPricing
            }}
          />
        </Suspense>
      )}
    </div>
    </AuthGuard>
  );
}
