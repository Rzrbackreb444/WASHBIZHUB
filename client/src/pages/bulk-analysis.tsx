import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Upload,
  FileSpreadsheet,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Loader2,
  Crown,
  Zap,
  Check,
  X,
  Download,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Shield,
  Sparkles,
  AlertTriangle,
  Info,
  Lock,
  Play,
  FileText,
  Globe,
  Layers,
  Star,
  ArrowRight,
  Key,
  RefreshCw,
  Copy,
  Trash2,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Eye,
  MapPin,
} from "lucide-react";

interface BulkLocationResult {
  address: string;
  lat: number;
  lng: number;
  cleanbiScore: number;
  grade: string;
  competitorCount: number;
  populationDensity: number;
  medianIncome: number;
  trafficScore: number;
  estimatedRevenue: number;
  opportunityLevel: "goldmine" | "promising" | "moderate" | "saturated" | "oversaturated";
  roiPotential: number;
  riskScore: number;
  status: "success" | "failed" | "pending";
  error?: string;
}

interface BulkAnalysisJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalLocations: number;
  processedLocations: number;
  successCount: number;
  failedCount: number;
  progress: number;
  estimatedCompletionTime?: number;
}

interface PortfolioSummary {
  averageScore: number;
  totalEstimatedRevenue: number;
  gradeDistribution: Record<string, number>;
  opportunityDistribution: Record<string, number>;
  topLocations: BulkLocationResult[];
  recommendations: string[];
  riskAnalysis: {
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
  };
}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  rateLimit: number;
  isActive: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  "A": "bg-green-500/20 text-green-400 border-green-500/30",
  "B": "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "C": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Needs Work": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "N/A": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const OPPORTUNITY_COLORS: Record<string, string> = {
  "goldmine": "bg-amber-500/20 text-amber-400",
  "promising": "bg-green-500/20 text-green-400",
  "moderate": "bg-blue-500/20 text-blue-400",
  "saturated": "bg-yellow-500/20 text-yellow-400",
  "oversaturated": "bg-red-500/20 text-red-400",
};

const seoFaqs = [
  {
    question: "What is bulk location analysis for real estate investment?",
    answer: "Bulk location analysis allows investors to evaluate hundreds of potential sites simultaneously using AI-powered scoring. This enterprise tool processes CSV files or Google Sheets containing property addresses, returning CLEANBI scores, demographic data, competition analysis, and ROI projections for each location."
  },
  {
    question: "How many locations can I analyze at once with bulk analysis?",
    answer: "Our enterprise bulk analysis tool supports up to 500 locations per batch. For larger portfolios exceeding 1,000 locations, contact our sales team for custom enterprise solutions with dedicated processing infrastructure."
  },
  {
    question: "What data formats are supported for bulk upload?",
    answer: "We support CSV, XLSX (Excel), and direct Google Sheets integration. Files should contain address columns which can be mapped to street address, city, state, and ZIP code fields through our column mapping interface."
  },
  {
    question: "How long does bulk location analysis take?",
    answer: "Processing time depends on the number of locations. Typical processing speed is 2-3 seconds per location. A 100-location batch completes in approximately 3-5 minutes, while 500 locations takes 15-20 minutes."
  },
  {
    question: "Can I customize the scoring weights for bulk analysis?",
    answer: "Yes, enterprise users can adjust the importance of different scoring factors including demographics (population density, income), competition levels, traffic patterns, and economic indicators to match their investment criteria."
  },
  {
    question: "What export formats are available for bulk analysis results?",
    answer: "Results can be exported as CSV, Excel (XLSX), or comprehensive PDF portfolio reports. PDF reports include executive summaries, location rankings, risk analysis, and AI-powered investment recommendations."
  },
  {
    question: "Is there an API for integrating bulk analysis into our systems?",
    answer: "Yes, enterprise subscribers receive API access with dedicated API keys. The RESTful API supports programmatic batch uploads, status polling, and result retrieval for integration with your internal investment platforms."
  },
  {
    question: "What is included in the enterprise bulk analysis pricing?",
    answer: "The $999/month enterprise plan includes 1,000 location analyses, CSV/XLSX upload, Google Sheets integration, custom scoring weights, PDF reports, API access, priority processing, and dedicated support. Add-ons available for higher volumes."
  },
];

const howToSteps = [
  {
    name: "Prepare Your Location Data",
    text: "Create a CSV or Excel file with property addresses. Include columns for street address, city, state, and ZIP code, or use a single formatted address column."
  },
  {
    name: "Upload Your File",
    text: "Drag and drop your file into the upload zone, or click to browse. Alternatively, connect directly to Google Sheets for real-time data sync."
  },
  {
    name: "Map Your Columns",
    text: "Use the column mapping interface to match your file's columns to the required address fields. Preview the data to ensure correct mapping."
  },
  {
    name: "Configure Scoring Weights",
    text: "Optionally adjust the importance of different factors like demographics, competition, and traffic to match your investment criteria."
  },
  {
    name: "Start Analysis",
    text: "Click 'Start Analysis' to begin processing. Monitor progress in real-time as each location is evaluated and scored."
  },
  {
    name: "Review Results",
    text: "Examine the results table with filtering, sorting, and search capabilities. View portfolio summary with AI recommendations."
  },
  {
    name: "Export Reports",
    text: "Download results as CSV, Excel, or comprehensive PDF portfolio reports for presentations and investment committee reviews."
  },
];

type SortField = "cleanbiScore" | "grade" | "competitorCount" | "medianIncome" | "estimatedRevenue" | "roiPotential" | "riskScore";
type SortDirection = "asc" | "desc";

export default function BulkAnalysis() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upload");
  const [addresses, setAddresses] = useState("");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [results, setResults] = useState<BulkLocationResult[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [sortField, setSortField] = useState<SortField>("cleanbiScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterOpportunity, setFilterOpportunity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  
  const [scoringWeights, setScoringWeights] = useState({
    demographics: 25,
    competition: 25,
    traffic: 25,
    economics: 25,
  });
  
  const { data: jobStatus, refetch: refetchJobStatus } = useQuery({
    queryKey: ["/api/bulk-analysis/jobs", currentJobId],
    enabled: !!currentJobId,
    refetchInterval: currentJobId ? 2000 : false,
  });
  
  const { data: apiKeysData, refetch: refetchApiKeys } = useQuery({
    queryKey: ["/api/bulk-analysis/api-keys"],
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (data: { addresses: string[] }) => {
      const response = await apiRequest("POST", "/api/bulk-analysis/upload", {
        addresses: data.addresses,
        scoringWeights,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      setActiveTab("progress");
      toast({
        title: "Analysis Started",
        description: `Processing ${data.totalLocations} locations...`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const generateApiKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/bulk-analysis/api-keys", { name });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedApiKey(data.key);
      refetchApiKeys();
      toast({
        title: "API Key Generated",
        description: "Store this key securely - it won't be shown again.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Generate API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await apiRequest("DELETE", `/api/bulk-analysis/api-keys/${keyId}`);
    },
    onSuccess: () => {
      refetchApiKeys();
      toast({
        title: "API Key Deleted",
      });
    },
  });
  
  const handleStartAnalysis = () => {
    const addressList = addresses.split("\n").filter(a => a.trim().length > 0);
    
    if (addressList.length === 0) {
      toast({
        title: "No Addresses",
        description: "Please enter at least one address to analyze",
        variant: "destructive",
      });
      return;
    }
    
    if (addressList.length > 500) {
      toast({
        title: "Limit Exceeded",
        description: "Maximum 500 locations per batch. Contact sales for higher limits.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate({ addresses: addressList });
  };
  
  const fetchResults = async () => {
    if (!currentJobId) return;
    
    try {
      const response = await fetch(`/api/bulk-analysis/jobs/${currentJobId}/results`);
      const data = await response.json();
      
      if (data.results) {
        setResults(data.results);
        setPortfolioSummary(data.portfolioSummary);
        setActiveTab("results");
        setCurrentJobId(null);
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    }
  };
  
  const isJobComplete = jobStatus && (jobStatus as BulkAnalysisJob).status === "completed";
  
  if (isJobComplete && currentJobId) {
    fetchResults();
  }
  
  const filteredResults = results
    .filter(r => {
      if (filterGrade !== "all" && r.grade !== filterGrade) return false;
      if (filterOpportunity !== "all" && r.opportunityLevel !== filterOpportunity) return false;
      if (searchQuery && !r.address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortField) {
        case "cleanbiScore": aVal = a.cleanbiScore; bVal = b.cleanbiScore; break;
        case "grade":
          aVal = a.grade === "A" ? 4 : a.grade === "B" ? 3 : a.grade === "C" ? 2 : 1;
          bVal = b.grade === "A" ? 4 : b.grade === "B" ? 3 : b.grade === "C" ? 2 : 1;
          break;
        case "competitorCount": aVal = a.competitorCount; bVal = b.competitorCount; break;
        case "medianIncome": aVal = a.medianIncome; bVal = b.medianIncome; break;
        case "estimatedRevenue": aVal = a.estimatedRevenue; bVal = b.estimatedRevenue; break;
        case "roiPotential": aVal = a.roiPotential; bVal = b.roiPotential; break;
        case "riskScore": aVal = a.riskScore; bVal = b.riskScore; break;
        default: return 0;
      }
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
  
  const totalPages = Math.ceil(filteredResults.length / pageSize);
  const paginatedResults = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortDirection === "desc" ? 
      <ChevronDown className="w-4 h-4 ml-1" /> : 
      <ChevronUp className="w-4 h-4 ml-1" />;
  };
  
  const handleExportCSV = () => {
    if (!currentJobId && results.length === 0) return;
    
    window.open(`/api/bulk-analysis/jobs/${currentJobId}/results?format=csv`, "_blank");
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };
  
  return (
    <>
      <SEO
        title="Bulk Analysis Tool | Enterprise Location Intelligence at Scale"
        description="Analyze 100+ locations at once with our enterprise bulk analysis tool. CSV/Excel upload, Google Sheets integration, custom scoring, and API access for private equity firms, REITs, and franchise networks."
        canonicalUrl="/bulk-analysis"
        keywords={[
          "bulk location analysis",
          "portfolio site evaluation",
          "real estate investment analysis",
          "enterprise location intelligence",
          "batch property analysis",
          "multi-site evaluation",
          "franchise location analysis",
          "REIT property scoring",
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "CLEANBI", url: "/cleanbi" },
          { name: "Bulk Analysis", url: "/bulk-analysis" },
        ]}
        faqs={seoFaqs}
        howTo={{
          name: "How to Analyze Locations at Scale",
          description: "Step-by-step guide to bulk analyzing hundreds of property locations for investment decisions using our enterprise tool.",
          steps: howToSteps,
        }}
        author={{
          name: "WashBizHub Enterprise Team",
          expertise: "Commercial Real Estate Analytics",
          credentials: "Enterprise-grade CLEANBI bulk processing",
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "CLEANBI", href: "/cleanbi" },
              { label: "Bulk Analysis" },
            ]}
          />

          <div className="text-center py-12 mb-8">
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30" data-testid="badge-enterprise">
              <Crown className="w-3 h-3 mr-1" />
              Enterprise
            </Badge>
            <h1 className="text-5xl font-black text-white mb-4">
              Bulk Analysis Tool
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Enterprise-Grade Location Intelligence at Scale
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" /> Private Equity Firms
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-4 h-4" /> REITs
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" /> Franchise Networks
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Real Estate Developers
              </span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 bg-white/10">
              <TabsTrigger value="upload" className="data-[state=active]:bg-accent data-[state=active]:text-primary" data-testid="tab-upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-accent data-[state=active]:text-primary" disabled={!currentJobId} data-testid="tab-progress">
                <RefreshCw className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-accent data-[state=active]:text-primary" disabled={results.length === 0} data-testid="tab-results">
                <BarChart3 className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-accent data-[state=active]:text-primary" data-testid="tab-api">
                <Key className="w-4 h-4 mr-2" />
                API
              </TabsTrigger>
              <TabsTrigger value="pricing" className="data-[state=active]:bg-accent data-[state=active]:text-primary" data-testid="tab-pricing">
                <DollarSign className="w-4 h-4 mr-2" />
                Pricing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <Card className="bg-white/10 backdrop-blur border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-accent" />
                        Upload Locations
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Paste addresses or upload CSV/Excel (up to 500 locations)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-gray-300 mb-2 block">
                          Paste Addresses (one per line)
                        </Label>
                        <Textarea
                          value={addresses}
                          onChange={(e) => setAddresses(e.target.value)}
                          placeholder="123 Main St, Los Angeles, CA 90001&#10;456 Oak Ave, San Francisco, CA 94102&#10;789 Pine Rd, San Diego, CA 92101"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 min-h-[200px]"
                          data-testid="textarea-addresses"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          {addresses.split("\n").filter(a => a.trim()).length} addresses entered
                        </p>
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <div 
                          className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
                          data-testid="dropzone-upload"
                        >
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-white font-medium mb-2">Drop CSV or Excel file here</p>
                          <p className="text-gray-400 text-sm">or click to browse</p>
                          <p className="text-gray-500 text-xs mt-2">Supports .csv, .xlsx, .xls</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          className="flex-1 bg-accent text-primary hover:bg-accent/90"
                          variant="ghost"
                          data-testid="button-google-sheets"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Connect Google Sheets
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-accent" />
                        Custom Scoring Weights
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Adjust the importance of different factors
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {Object.entries(scoringWeights).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-gray-300 capitalize">{key}</Label>
                            <span className="text-accent font-bold">{value}%</span>
                          </div>
                          <Slider
                            value={[value]}
                            onValueChange={([val]) => setScoringWeights(prev => ({ ...prev, [key]: val }))}
                            max={100}
                            step={5}
                            className="w-full"
                            data-testid={`slider-${key}`}
                          />
                        </div>
                      ))}
                      <p className="text-sm text-gray-500">
                        Total: {Object.values(scoringWeights).reduce((a, b) => a + b, 0)}% (should equal 100%)
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-accent/20 to-purple-500/20 border-accent/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Ready to Analyze
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Locations</span>
                          <span className="text-white font-bold">
                            {addresses.split("\n").filter(a => a.trim()).length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Est. Time</span>
                          <span className="text-white font-bold">
                            ~{Math.ceil(addresses.split("\n").filter(a => a.trim()).length * 2 / 60)} min
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-accent text-primary hover:bg-accent/90 font-bold"
                        onClick={handleStartAnalysis}
                        disabled={uploadMutation.isPending}
                        data-testid="button-start-analysis"
                      >
                        {uploadMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        Start Bulk Analysis
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Features Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {[
                          "CLEANBI Score for each location",
                          "Demographic analysis",
                          "Competition mapping",
                          "Revenue projections",
                          "Risk assessment",
                          "Portfolio optimization",
                          "AI recommendations",
                          "Export to CSV/PDF",
                        ].map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-8">
              {jobStatus && (
                <Card className="bg-white/10 backdrop-blur border-white/10 max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white flex items-center justify-center gap-2">
                      {(jobStatus as BulkAnalysisJob).status === "completed" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (jobStatus as BulkAnalysisJob).status === "failed" ? (
                        <XCircle className="w-6 h-6 text-red-400" />
                      ) : (
                        <Loader2 className="w-6 h-6 text-accent animate-spin" />
                      )}
                      Bulk Analysis
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Job ID: {(jobStatus as BulkAnalysisJob).id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-bold">
                          {(jobStatus as BulkAnalysisJob).processedLocations} / {(jobStatus as BulkAnalysisJob).totalLocations}
                        </span>
                      </div>
                      <Progress 
                        value={(jobStatus as BulkAnalysisJob).progress || 0} 
                        className="h-3"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-white">
                          {(jobStatus as BulkAnalysisJob).totalLocations}
                        </p>
                        <p className="text-xs text-gray-400">Total</p>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {(jobStatus as BulkAnalysisJob).successCount}
                        </p>
                        <p className="text-xs text-gray-400">Success</p>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-400">
                          {(jobStatus as BulkAnalysisJob).failedCount}
                        </p>
                        <p className="text-xs text-gray-400">Failed</p>
                      </div>
                    </div>

                    {(jobStatus as BulkAnalysisJob).status === "completed" && (
                      <Button 
                        className="w-full bg-accent text-primary hover:bg-accent/90"
                        onClick={() => setActiveTab("results")}
                        data-testid="button-view-results"
                      >
                        View Results
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-8">
              {portfolioSummary && (
                <Card className="bg-gradient-to-br from-accent/10 to-purple-500/10 border-accent/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Portfolio Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-6 mb-6">
                      <div className="bg-white/10 rounded-lg p-4 text-center">
                        <p className="text-3xl font-black text-accent">
                          {portfolioSummary.averageScore}
                        </p>
                        <p className="text-sm text-gray-400">Avg. Score</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 text-center">
                        <p className="text-3xl font-black text-green-400">
                          ${(portfolioSummary.totalEstimatedRevenue / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-sm text-gray-400">Total Revenue</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 text-center">
                        <p className="text-3xl font-black text-blue-400">
                          {portfolioSummary.riskAnalysis.lowRisk}
                        </p>
                        <p className="text-sm text-gray-400">Low Risk</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 text-center">
                        <p className="text-3xl font-black text-amber-400">
                          {portfolioSummary.gradeDistribution["A"] || 0}
                        </p>
                        <p className="text-sm text-gray-400">Grade A</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-300">AI Recommendations:</p>
                      <ul className="space-y-1">
                        {portfolioSummary.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white/10 backdrop-blur border-white/10">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <CardTitle className="text-white">Analysis Results</CardTitle>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search addresses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 bg-white/10 border-white/20 text-white w-[200px]"
                          data-testid="input-search"
                        />
                      </div>
                      <Select value={filterGrade} onValueChange={setFilterGrade}>
                        <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white" data-testid="select-grade-filter">
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Grades</SelectItem>
                          <SelectItem value="A">Grade A</SelectItem>
                          <SelectItem value="B">Grade B</SelectItem>
                          <SelectItem value="C">Grade C</SelectItem>
                          <SelectItem value="Needs Work">Needs Work</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={handleExportCSV} data-testid="button-export-csv">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-gray-400">Address</TableHead>
                          <TableHead 
                            className="text-gray-400 cursor-pointer"
                            onClick={() => handleSort("cleanbiScore")}
                          >
                            <div className="flex items-center">
                              Score
                              <SortIcon field="cleanbiScore" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-gray-400 cursor-pointer"
                            onClick={() => handleSort("grade")}
                          >
                            <div className="flex items-center">
                              Grade
                              <SortIcon field="grade" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-gray-400 cursor-pointer"
                            onClick={() => handleSort("estimatedRevenue")}
                          >
                            <div className="flex items-center">
                              Est. Revenue
                              <SortIcon field="estimatedRevenue" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="text-gray-400 cursor-pointer"
                            onClick={() => handleSort("riskScore")}
                          >
                            <div className="flex items-center">
                              Risk
                              <SortIcon field="riskScore" />
                            </div>
                          </TableHead>
                          <TableHead className="text-gray-400">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedResults.map((result, idx) => (
                          <TableRow key={idx} className="border-white/10" data-testid={`row-result-${idx}`}>
                            <TableCell className="text-white font-medium max-w-[200px] truncate">
                              {result.address}
                            </TableCell>
                            <TableCell>
                              <span className="text-accent font-bold text-lg">
                                {result.cleanbiScore}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={GRADE_COLORS[result.grade] || GRADE_COLORS["N/A"]}>
                                {result.grade}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-green-400 font-medium">
                              ${(result.estimatedRevenue / 1000).toFixed(0)}K
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                result.riskScore < 35 ? "bg-green-500/20 text-green-400" :
                                result.riskScore < 65 ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-red-500/20 text-red-400"
                              }>
                                {result.riskScore < 35 ? "Low" : result.riskScore < 65 ? "Medium" : "High"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {result.status === "success" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-400" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400">
                        Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredResults.length)} of {filteredResults.length}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-white/10 backdrop-blur border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Key className="w-5 h-5 text-accent" />
                      API Keys
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage API keys for programmatic access
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-accent text-primary" data-testid="button-generate-api-key">
                          <Key className="w-4 h-4 mr-2" />
                          Generate New API Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-white/10">
                        <DialogHeader>
                          <DialogTitle className="text-white">Generate API Key</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Create a new API key for programmatic bulk analysis
                          </DialogDescription>
                        </DialogHeader>
                        {generatedApiKey ? (
                          <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                              <p className="text-sm text-green-400 mb-2">
                                Your API key has been generated. Copy it now - it won't be shown again.
                              </p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 bg-black/50 p-2 rounded text-xs text-white break-all">
                                  {generatedApiKey}
                                </code>
                                <Button size="icon" variant="outline" onClick={() => copyToClipboard(generatedApiKey)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={() => {
                                setGeneratedApiKey(null);
                                setNewApiKeyName("");
                                setShowApiKeyDialog(false);
                              }}
                            >
                              Done
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-gray-300">Key Name</Label>
                                <Input
                                  value={newApiKeyName}
                                  onChange={(e) => setNewApiKeyName(e.target.value)}
                                  placeholder="e.g., Production API"
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => generateApiKeyMutation.mutate(newApiKeyName)}
                                disabled={!newApiKeyName || generateApiKeyMutation.isPending}
                                className="bg-accent text-primary"
                              >
                                {generateApiKeyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Generate Key
                              </Button>
                            </DialogFooter>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>

                    <div className="space-y-2">
                      {(apiKeysData as { keys: ApiKey[] })?.keys?.map((key) => (
                        <div key={key.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div>
                            <p className="text-white font-medium">{key.name}</p>
                            <p className="text-xs text-gray-400">{key.keyPrefix}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => deleteApiKeyMutation.mutate(key.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-accent" />
                      API Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Upload Locations</p>
                      <code className="text-xs text-green-400">
                        POST /api/bulk-analysis/upload
                      </code>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Check Job Status</p>
                      <code className="text-xs text-blue-400">
                        GET /api/bulk-analysis/jobs/:jobId
                      </code>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Get Results</p>
                      <code className="text-xs text-purple-400">
                        GET /api/bulk-analysis/jobs/:jobId/results
                      </code>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="https://docs.washbizhub.com/api/bulk-analysis" target="_blank" rel="noopener noreferrer">
                        View Full Documentation
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-8">
              <Card className="bg-gradient-to-br from-purple-500/20 to-accent/20 border-purple-500/30 max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <Badge className="mx-auto mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Enterprise
                  </Badge>
                  <CardTitle className="text-4xl font-black text-white">
                    $999<span className="text-lg font-normal text-gray-400">/month</span>
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    Up to 1,000 location analyses per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Up to 500 locations per batch",
                      "CSV/XLSX file upload",
                      "Google Sheets integration",
                      "Custom scoring weights",
                      "PDF portfolio reports",
                      "API access with dedicated keys",
                      "Priority processing queue",
                      "Dedicated support channel",
                      "99.5% uptime SLA",
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-300">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-4 mb-8">
                    <p className="text-sm font-medium text-gray-300">Add-Ons:</p>
                    <div className="grid gap-3">
                      {[
                        { name: "Custom Integrations", price: "+$500/mo" },
                        { name: "Dedicated Account Manager", price: "+$300/mo" },
                        { name: "99.9% SLA Guarantee", price: "+$200/mo" },
                        { name: "Additional 1,000 analyses", price: "+$500/mo" },
                      ].map((addon, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                          <span className="text-gray-300">{addon.name}</span>
                          <span className="text-accent font-bold">{addon.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-accent text-primary hover:bg-accent/90 font-bold text-lg py-6" asChild>
                    <Link href="/pricing">
                      Contact Sales
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="my-12 bg-white/10" />

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white text-center">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="max-w-3xl mx-auto">
              {seoFaqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="border-white/10">
                  <AccordionTrigger className="text-white hover:text-accent text-left" data-testid={`accordion-faq-${idx}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}
