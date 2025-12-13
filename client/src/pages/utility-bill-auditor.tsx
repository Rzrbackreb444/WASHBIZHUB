import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet-async";
import { 
  Upload, Camera, Zap, Droplets, Flame, DollarSign, 
  AlertTriangle, Lightbulb, History, TrendingUp, TrendingDown,
  FileText, Loader2, X, CheckCircle2, Clock, Trash2
} from "lucide-react";
import { format } from "date-fns";

interface UtilityBillData {
  billType: string;
  billDate: string | null;
  billPeriodStart: string | null;
  billPeriodEnd: string | null;
  electricKwh: number | null;
  electricCost: number | null;
  electricRatePerKwh: number | null;
  waterGallons: number | null;
  waterCost: number | null;
  waterRatePerGallon: number | null;
  gasTherms: number | null;
  gasCost: number | null;
  gasRatePerTherm: number | null;
  totalCost: number | null;
  providerName: string | null;
  accountNumber: string | null;
  serviceAddress: string | null;
  confidence: number;
}

interface LaundromatMetrics {
  costPerWasherLoad: number;
  costPerDryerLoad: number;
  upgRatio: number | null;
  estimatedLoadsSupported: {
    washerLoads: number;
    dryerLoads: number;
  };
}

interface Anomaly {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  percentChange?: number;
}

interface Recommendation {
  priority: "low" | "medium" | "high";
  action: string;
  expectedSavings?: string;
}

interface AnalysisResult {
  success: boolean;
  analysisId: string;
  billData: UtilityBillData;
  laundromatMetrics: LaundromatMetrics;
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  hasPreviousData: boolean;
}

interface HistoryItem {
  id: string;
  billType: string;
  billDate: string | null;
  totalCost: string | null;
  electricKwh: string | null;
  electricCost: string | null;
  waterGallons: string | null;
  waterCost: string | null;
  gasTherms: string | null;
  gasCost: string | null;
  anomalies: Anomaly[];
  createdAt: string;
}

export default function UtilityBillAuditor() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [grossRevenue, setGrossRevenue] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const { data: historyData, isLoading: historyLoading } = useQuery<{
    success: boolean;
    analyses: HistoryItem[];
    total: number;
  }>({
    queryKey: ["/api/utility-bill/history"],
    enabled: isAuthenticated,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { image: string; mimeType: string; grossRevenue?: string }) => {
      const response = await apiRequest("/api/utility-bill/analyze", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      return response as AnalysisResult;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bill/history"] });
      toast({
        title: "Analysis Complete",
        description: "Your utility bill has been analyzed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the utility bill.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/utility-bill/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utility-bill/history"] });
      toast({
        title: "Deleted",
        description: "Analysis deleted successfully.",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(",")[1];
      setSelectedImage(base64);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;

    analyzeMutation.mutate({
      image: selectedImage,
      mimeType: imageMimeType,
      grossRevenue: grossRevenue || undefined,
    });
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high": return "bg-gold-500/20 text-gold-400 border-gold-500/30";
      case "medium": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Helmet>
          <title>Utility Bill Auditor | WashBizHub</title>
          <meta name="description" content="AI-powered utility bill analysis for laundromat owners. Detect overcharges, track usage, and optimize costs." />
        </Helmet>
        
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-12 text-center">
              <Zap className="w-16 h-16 text-gold-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Utility Bill Auditor</h1>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Sign in to analyze your utility bills with AI and discover potential savings for your laundromat.
              </p>
              <Button 
                className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-8"
                onClick={() => window.location.href = "/api/auth/cloudflare/login"}
                data-testid="button-login-utility"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Helmet>
        <title>Utility Bill Auditor | WashBizHub</title>
        <meta name="description" content="AI-powered utility bill analysis for laundromat owners. Detect overcharges, track usage, and optimize costs." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 mb-4">
            AI-Powered Analysis
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Utility Bill Auditor
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Upload your utility bills to extract usage data, calculate cost per load, 
            detect anomalies, and get actionable recommendations.
          </p>
        </div>

        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="analyze" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black" data-testid="tab-analyze">
              <Upload className="w-4 h-4 mr-2" />
              Analyze Bill
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gold-400" />
                    Upload Utility Bill
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedImage ? (
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragActive 
                          ? "border-gold-400 bg-gold-500/10" 
                          : "border-white/30 hover:border-white/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      data-testid="dropzone-upload"
                    >
                      <Upload className="w-12 h-12 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70 mb-4">
                        Drag & drop your utility bill image here
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="button-upload-file"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                          onClick={() => cameraInputRef.current?.click()}
                          data-testid="button-capture-camera"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInput}
                        data-testid="input-file"
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileInput}
                        data-testid="input-camera"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={`data:${imageMimeType};base64,${selectedImage}`}
                        alt="Uploaded utility bill"
                        className="w-full h-64 object-contain rounded-lg bg-black/50"
                        data-testid="img-preview"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={clearSelection}
                        data-testid="button-clear-image"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="grossRevenue" className="text-white/80">
                      Monthly Gross Revenue (Optional)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                      <Input
                        id="grossRevenue"
                        type="number"
                        placeholder="e.g., 25000"
                        value={grossRevenue}
                        onChange={(e) => setGrossRevenue(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        data-testid="input-gross-revenue"
                      />
                    </div>
                    <p className="text-xs text-white/50">
                      Enter your monthly gross revenue to calculate UPG ratio (Utilities as % of Gross)
                    </p>
                  </div>

                  <Button
                    className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold"
                    disabled={!selectedImage || analyzeMutation.isPending}
                    onClick={handleAnalyze}
                    data-testid="button-analyze"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Analyze Bill
                      </>
                    )}
                  </Button>

                  {analyzeMutation.isPending && (
                    <div className="space-y-2">
                      <Progress value={66} className="h-2" />
                      <p className="text-sm text-white/60 text-center">
                        AI is extracting data from your bill...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {analysisResult && (
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Analysis Results
                      </CardTitle>
                      <Badge className="bg-green-500/20 text-green-400">
                        {Math.round(analysisResult.billData.confidence * 100)}% Confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysisResult.billData.providerName && (
                      <div className="text-sm text-white/60">
                        Provider: {analysisResult.billData.providerName}
                      </div>
                    )}
                    
                    <div className="text-2xl font-bold text-gold-400" data-testid="text-total-cost">
                      Total: ${analysisResult.billData.totalCost?.toFixed(2) || "N/A"}
                    </div>

                    {analysisResult.billData.billPeriodStart && analysisResult.billData.billPeriodEnd && (
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Clock className="w-4 h-4" />
                        {format(new Date(analysisResult.billData.billPeriodStart), "MMM d")} - {format(new Date(analysisResult.billData.billPeriodEnd), "MMM d, yyyy")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {analysisResult && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  {analysisResult.billData.electricKwh !== null && (
                    <Card className="bg-white/10 backdrop-blur border-white/20" data-testid="card-electric">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-yellow-500/20">
                            <Zap className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Electric</p>
                            <p className="text-xl font-bold text-white">
                              {analysisResult.billData.electricKwh.toLocaleString()} kWh
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Cost</span>
                            <span className="text-white font-medium">${analysisResult.billData.electricCost?.toFixed(2)}</span>
                          </div>
                          {analysisResult.billData.electricRatePerKwh && (
                            <div className="flex justify-between">
                              <span className="text-white/60">Rate</span>
                              <span className="text-white font-medium">${analysisResult.billData.electricRatePerKwh.toFixed(4)}/kWh</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.billData.waterGallons !== null && (
                    <Card className="bg-white/10 backdrop-blur border-white/20" data-testid="card-water">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <Droplets className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Water</p>
                            <p className="text-xl font-bold text-white">
                              {analysisResult.billData.waterGallons.toLocaleString()} gal
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Cost</span>
                            <span className="text-white font-medium">${analysisResult.billData.waterCost?.toFixed(2)}</span>
                          </div>
                          {analysisResult.billData.waterRatePerGallon && (
                            <div className="flex justify-between">
                              <span className="text-white/60">Rate</span>
                              <span className="text-white font-medium">${analysisResult.billData.waterRatePerGallon.toFixed(6)}/gal</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysisResult.billData.gasTherms !== null && (
                    <Card className="bg-white/10 backdrop-blur border-white/20" data-testid="card-gas">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-orange-500/20">
                            <Flame className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Gas</p>
                            <p className="text-xl font-bold text-white">
                              {analysisResult.billData.gasTherms.toLocaleString()} therms
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Cost</span>
                            <span className="text-white font-medium">${analysisResult.billData.gasCost?.toFixed(2)}</span>
                          </div>
                          {analysisResult.billData.gasRatePerTherm && (
                            <div className="flex justify-between">
                              <span className="text-white/60">Rate</span>
                              <span className="text-white font-medium">${analysisResult.billData.gasRatePerTherm.toFixed(4)}/therm</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-white/10 backdrop-blur border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gold-400" />
                        Laundromat Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white/5" data-testid="metric-washer-cost">
                          <p className="text-sm text-white/60 mb-1">Cost per Washer Load</p>
                          <p className="text-2xl font-bold text-gold-400">
                            ${analysisResult.laundromatMetrics.costPerWasherLoad.toFixed(4)}
                          </p>
                          <p className="text-xs text-white/40">20 gal + 2.5 kWh avg</p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5" data-testid="metric-dryer-cost">
                          <p className="text-sm text-white/60 mb-1">Cost per Dryer Load</p>
                          <p className="text-2xl font-bold text-gold-400">
                            ${analysisResult.laundromatMetrics.costPerDryerLoad.toFixed(4)}
                          </p>
                          <p className="text-xs text-white/40">3.5 kWh avg</p>
                        </div>
                      </div>

                      {analysisResult.laundromatMetrics.upgRatio !== null && (
                        <div className="p-4 rounded-lg bg-gold-500/10 border border-gold-500/30" data-testid="metric-upg-ratio">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gold-400 mb-1">UPG Ratio</p>
                              <p className="text-3xl font-bold text-gold-400">
                                {analysisResult.laundromatMetrics.upgRatio.toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-white/50">Industry Benchmark</p>
                              <p className="text-sm text-white/70">8-12%</p>
                            </div>
                          </div>
                          {analysisResult.laundromatMetrics.upgRatio > 15 && (
                            <p className="text-xs text-yellow-400 mt-2">
                              Your UPG is above optimal. Consider utility efficiency improvements.
                            </p>
                          )}
                        </div>
                      )}

                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-sm text-white/60 mb-2">Estimated Loads Supported</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-white">
                            <span className="font-bold text-lg">{analysisResult.laundromatMetrics.estimatedLoadsSupported.washerLoads.toLocaleString()}</span> washer loads
                          </span>
                          <span className="text-white">
                            <span className="font-bold text-lg">{analysisResult.laundromatMetrics.estimatedLoadsSupported.dryerLoads.toLocaleString()}</span> dryer loads
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    {analysisResult.anomalies.length > 0 && (
                      <Card className="bg-white/10 backdrop-blur border-white/20">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            Anomalies Detected
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {analysisResult.anomalies.map((anomaly, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
                              data-testid={`anomaly-${index}`}
                            >
                              <div className="flex items-start gap-3">
                                {anomaly.percentChange !== undefined && (
                                  <div className="mt-1">
                                    {anomaly.percentChange > 0 ? (
                                      <TrendingUp className="w-4 h-4 text-red-400" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4 text-green-400" />
                                    )}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">{anomaly.message}</p>
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {anomaly.severity.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {analysisResult.recommendations.length > 0 && (
                      <Card className="bg-white/10 backdrop-blur border-white/20">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-gold-400" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {analysisResult.recommendations.map((rec, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}
                              data-testid={`recommendation-${index}`}
                            >
                              <p className="text-sm font-medium mb-1">{rec.action}</p>
                              {rec.expectedSavings && (
                                <p className="text-xs opacity-80">
                                  Potential: {rec.expectedSavings}
                                </p>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-gold-400" />
                  Analysis History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gold-400 mx-auto" />
                    <p className="text-white/60 mt-2">Loading history...</p>
                  </div>
                ) : historyData?.analyses && historyData.analyses.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {historyData.analyses.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          data-testid={`history-item-${item.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {item.billType}
                                </Badge>
                                <span className="text-xs text-white/50">
                                  {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-white/50">Total</p>
                                  <p className="text-white font-medium">
                                    ${parseFloat(item.totalCost || "0").toFixed(2)}
                                  </p>
                                </div>
                                {item.electricKwh && (
                                  <div>
                                    <p className="text-white/50">Electric</p>
                                    <p className="text-white font-medium">
                                      {parseFloat(item.electricKwh).toLocaleString()} kWh
                                    </p>
                                  </div>
                                )}
                                {item.waterGallons && (
                                  <div>
                                    <p className="text-white/50">Water</p>
                                    <p className="text-white font-medium">
                                      {parseFloat(item.waterGallons).toLocaleString()} gal
                                    </p>
                                  </div>
                                )}
                                {item.gasTherms && (
                                  <div>
                                    <p className="text-white/50">Gas</p>
                                    <p className="text-white font-medium">
                                      {parseFloat(item.gasTherms).toLocaleString()} therms
                                    </p>
                                  </div>
                                )}
                              </div>
                              {item.anomalies && item.anomalies.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {item.anomalies.map((a, i) => (
                                    <Badge key={i} variant="outline" className={getSeverityColor(a.severity)}>
                                      {a.type.replace(/_/g, " ")}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-white/50 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => deleteMutation.mutate(item.id)}
                              data-testid={`button-delete-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No analysis history yet</p>
                    <p className="text-white/40 text-sm">Upload your first utility bill to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
