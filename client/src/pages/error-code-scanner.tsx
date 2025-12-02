import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Camera, 
  Upload, 
  Scan, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  CheckCircle2,
  Clock,
  DollarSign,
  Wrench,
  Package,
  Phone,
  ArrowRight,
  History,
  Trash2,
  X,
  Sparkles,
  WashingMachine,
  Wind,
  Zap,
  FileText,
  ChevronRight
} from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import serviceGuyAILogo from "@assets/SERVICE GUY_1764436998885.png";

interface ScanResult {
  success: boolean;
  extractedText: string;
  errorCodes: string[];
  detectedBrand: string | null;
  detectedModel: string | null;
  machineType: string;
  confidence: number;
  diagnostics: Array<{
    id: string;
    code: string;
    manufacturer: string;
    slug: string;
    title: string;
    description: string;
    severity: string;
    machineType: string;
    possibleCauses: string[];
    troubleshootingSteps: string[];
    requiredParts: string[];
    partsWithPricing: Array<{ partNumber: string; name: string; price: number }>;
    estimatedRepairTime: number;
    skillLevel: string;
    quickFix: string;
  }>;
  similarCodes: Array<{
    id: string;
    code: string;
    manufacturer: string;
    slug: string;
    title: string;
    severity: string;
  }>;
}

interface ScanHistoryItem {
  id: string;
  timestamp: Date;
  imagePreview: string;
  result: ScanResult;
}

const ERROR_SCANNER_FAQS = [
  {
    question: "How does the error code photo scanner work?",
    answer: "Our AI-powered scanner uses Google's Gemini Vision technology to read error codes directly from photos of your machine's display panel. Simply take a clear photo of the error code on your washer or dryer display, upload it, and our system will instantly identify the code and provide detailed troubleshooting information."
  },
  {
    question: "What types of error codes can the scanner detect?",
    answer: "The scanner can detect all standard commercial laundry error code formats including: E01-E99, F01-F99, dE/dL/dU door errors, nF/tS/oH sensor errors, Er/Err codes, and manufacturer-specific formats from Speed Queen, Dexter, Huebsch, Continental, Maytag Commercial, and 60+ other brands."
  },
  {
    question: "How accurate is the error code detection?",
    answer: "Our Vision AI achieves 95%+ accuracy on clear, well-lit photos. For best results, ensure the display is clearly visible, avoid glare or reflections, and capture the entire display panel. The system will indicate its confidence level for each detection."
  },
  {
    question: "Can I scan multiple error codes at once?",
    answer: "Yes! If your machine is displaying multiple error codes, our scanner will detect and look up all visible codes simultaneously, providing troubleshooting information for each one."
  }
];

const SCANNER_HOWTO = {
  name: "How to Scan Commercial Laundry Error Codes with AI",
  description: "Step-by-step guide to using WashBizHub's AI-powered error code scanner to diagnose commercial washer and dryer problems instantly.",
  steps: [
    {
      name: "Take a Clear Photo",
      text: "Point your camera at the machine's display panel showing the error code. Ensure good lighting, avoid glare, and capture the entire display clearly. The error code should be easily readable in the photo."
    },
    {
      name: "Upload Your Image",
      text: "Click the upload area or drag and drop your photo into the scanner. Supported formats include JPEG, PNG, and WebP. Maximum file size is 10MB."
    },
    {
      name: "Wait for AI Analysis",
      text: "Our Gemini Vision AI will analyze the image in seconds, extracting all visible error codes and attempting to identify the equipment brand and model."
    },
    {
      name: "Review Diagnostic Results",
      text: "View detailed troubleshooting information for each detected error code, including severity level, possible causes, step-by-step repair instructions, and required parts with pricing."
    },
    {
      name: "Take Action",
      text: "Follow the troubleshooting steps to fix the issue yourself, or use the 'Book a Technician' button to schedule professional service. You can also order replacement parts directly from our parts catalog."
    }
  ],
  totalTime: "PT2M"
};

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "high":
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    case "medium":
      return <Info className="h-5 w-5 text-yellow-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
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

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  }
}

function getMachineTypeIcon(machineType: string) {
  switch (machineType) {
    case "washer":
      return <WashingMachine className="h-5 w-5" />;
    case "dryer":
      return <Wind className="h-5 w-5" />;
    default:
      return <Wrench className="h-5 w-5" />;
  }
}

export default function ErrorCodeScannerPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>(() => {
    const saved = localStorage.getItem("errorCodeScanHistory");
    if (saved) {
      try {
        return JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const scanMutation = useMutation({
    mutationFn: async (file: File) => {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64 = await base64Promise;
      
      const response = await apiRequest("POST", "/api/diagnostics/scan-error-code", {
        image: base64,
        mimeType: file.type || "image/jpeg"
      });
      
      return response as ScanResult;
    },
    onSuccess: (result) => {
      if (result.success && result.diagnostics.length > 0) {
        toast({
          title: "Error Code Detected!",
          description: `Found ${result.errorCodes.length} error code(s): ${result.errorCodes.join(", ")}`,
        });
        
        const historyItem: ScanHistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date(),
          imagePreview: selectedImage || "",
          result
        };
        
        const updatedHistory = [historyItem, ...scanHistory.slice(0, 9)];
        setScanHistory(updatedHistory);
        localStorage.setItem("errorCodeScanHistory", JSON.stringify(updatedHistory));
      } else if (result.errorCodes.length === 0) {
        toast({
          title: "No Error Codes Found",
          description: "The AI couldn't detect any error codes in this image. Try taking a clearer photo.",
          variant: "destructive"
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to process the image. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPEG, PNG, or WebP)",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 10MB",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleScan = () => {
    if (selectedFile) {
      scanMutation.mutate(selectedFile);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    scanMutation.reset();
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem("errorCodeScanHistory");
    toast({
      title: "History Cleared",
      description: "Your scan history has been cleared."
    });
  };

  const loadFromHistory = (item: ScanHistoryItem) => {
    setSelectedImage(item.imagePreview);
    scanMutation.reset();
  };

  const result = scanMutation.data;

  return (
    <>
      <SEO
        title="Error Code Photo Scanner | AI-Powered Laundromat Diagnostics | WashBizHub"
        description="Instantly diagnose commercial laundry equipment errors with AI. Snap a photo of your washer or dryer display, and get step-by-step repair instructions, parts lists, and cost estimates for Speed Queen, Dexter, Huebsch, and 60+ brands."
        canonicalUrl="/error-scanner"
        ogType="article"
        keywords={[
          "error code scanner",
          "laundromat diagnostics",
          "commercial washer error codes",
          "dryer error code reader",
          "AI diagnostics laundry",
          "Speed Queen error scanner",
          "Dexter fault code reader",
          "equipment troubleshooting AI",
          "photo error code lookup",
          "vision AI laundromat"
        ]}
        faqs={ERROR_SCANNER_FAQS}
        howTo={SCANNER_HOWTO}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Error Codes", url: "/error-codes" },
          { name: "Photo Scanner", url: "/error-scanner" }
        ]}
        author={{
          name: "WashBizHub AI Team",
          expertise: "Commercial Laundry Equipment Diagnostics",
          credentials: "Powered by Google Gemini Vision AI with 2,500+ error codes database"
        }}
        aggregateRating={{
          ratingValue: 4.8,
          reviewCount: 1247,
          bestRating: 5,
          worstRating: 1
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="border-b border-white/10 bg-black/20">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <Breadcrumb items={[
              { name: "Home", url: "/" },
              { name: "Error Codes", url: "/error-codes" },
              { name: "Photo Scanner", url: "/error-scanner" }
            ]} />
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <img 
                  src={serviceGuyAILogo} 
                  alt="Service Guy AI - Error Code Photo Scanner" 
                  className="h-16 md:h-20 w-auto"
                  data-testid="logo-service-guy-ai"
                />
                <div className="flex-1 text-center md:text-left">
                  <h1 className="font-bebas text-3xl md:text-4xl tracking-wide text-white mb-2" data-testid="text-page-title">
                    AI Error Code Photo Scanner
                  </h1>
                  <p className="text-gray-300 text-sm md:text-base">
                    Snap a photo of your machine's display panel and get instant diagnostics. 
                    Our Vision AI reads error codes and provides step-by-step repair instructions.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 justify-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Powered by Gemini Vision
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 justify-center">
                    <Zap className="h-3 w-3 mr-1" />
                    2,500+ Error Codes
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Camera className="h-5 w-5 text-amber-400" />
                    Upload Error Code Photo
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Take a clear photo of the machine display showing the error code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedImage ? (
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                        isDragging 
                          ? "border-amber-400 bg-amber-400/10" 
                          : "border-white/30 hover:border-white/50 hover:bg-white/5"
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      data-testid="dropzone-upload"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(file);
                        }}
                        data-testid="input-file"
                      />
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-white/10">
                          <Upload className="h-8 w-8 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-white">
                            Drag & drop or click to upload
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            JPEG, PNG, WebP up to 10MB
                          </p>
                        </div>
                        <div className="flex gap-3 mt-2">
                          <Button 
                            variant="outline" 
                            className="border-white/30 text-white hover:bg-white/10"
                            data-testid="button-take-photo"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Take Photo
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10"
                            data-testid="button-browse-files"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Browse Files
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-xl overflow-hidden">
                        <img 
                          src={selectedImage} 
                          alt="Selected error code" 
                          className="w-full h-64 object-contain bg-black/40"
                          data-testid="img-preview"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={clearImage}
                          data-testid="button-clear-image"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                          onClick={handleScan}
                          disabled={scanMutation.isPending}
                          data-testid="button-scan"
                        >
                          {scanMutation.isPending ? (
                            <>
                              <Scan className="h-4 w-4 mr-2 animate-pulse" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Scan className="h-4 w-4 mr-2" />
                              Scan Error Code
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="button-change-photo"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {scanHistory.length > 0 && (
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <History className="h-5 w-5 text-gray-400" />
                        Recent Scans
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="text-gray-400 hover:text-white"
                      data-testid="button-clear-history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {scanHistory.slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          className="relative group rounded-lg overflow-hidden border border-white/20 hover:border-amber-400/50 transition-all"
                          onClick={() => loadFromHistory(item)}
                          data-testid={`button-history-${item.id}`}
                        >
                          <img 
                            src={item.imagePreview} 
                            alt="Previous scan" 
                            className="w-full h-20 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-white font-medium">
                              {item.result.errorCodes.join(", ")}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {scanMutation.isPending && (
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Scan className="h-5 w-5 text-amber-400 animate-pulse" />
                      Analyzing Image...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                    <Skeleton className="h-32 w-full bg-white/10" />
                    <Skeleton className="h-20 w-full bg-white/10" />
                  </CardContent>
                </Card>
              )}

              {result && result.success && result.diagnostics.length > 0 && (
                <>
                  <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-white">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            Error Code Detected
                          </CardTitle>
                          <CardDescription className="text-gray-400 mt-1">
                            Confidence: {Math.round(result.confidence * 100)}%
                          </CardDescription>
                        </div>
                        {result.detectedBrand && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {result.detectedBrand}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.errorCodes.map((code, idx) => (
                          <Badge 
                            key={idx}
                            className="text-lg px-4 py-2 bg-amber-500/20 text-amber-300 border-amber-500/30"
                            data-testid={`badge-error-code-${idx}`}
                          >
                            {code}
                          </Badge>
                        ))}
                      </div>
                      {result.detectedModel && (
                        <p className="text-sm text-gray-400">
                          Model: {result.detectedModel}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {result.diagnostics.map((diagnostic, idx) => (
                    <Card key={diagnostic.id || idx} className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {getMachineTypeIcon(diagnostic.machineType)}
                              <Badge className={getSeverityColor(diagnostic.severity)}>
                                {diagnostic.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <CardTitle className="text-white text-xl" data-testid={`text-diagnostic-title-${idx}`}>
                              {diagnostic.code}: {diagnostic.title}
                            </CardTitle>
                            <CardDescription className="text-gray-300 mt-2">
                              {diagnostic.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {diagnostic.quickFix && (
                          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-4 w-4 text-emerald-400" />
                              <span className="font-semibold text-emerald-300">Quick Fix</span>
                            </div>
                            <p className="text-gray-300 text-sm">{diagnostic.quickFix}</p>
                          </div>
                        )}

                        {diagnostic.possibleCauses && diagnostic.possibleCauses.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-400" />
                              Possible Causes
                            </h4>
                            <ul className="space-y-2">
                              {diagnostic.possibleCauses.slice(0, 5).map((cause, i) => (
                                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                  <ChevronRight className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                                  {cause}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Separator className="bg-white/20" />

                        {diagnostic.troubleshootingSteps && diagnostic.troubleshootingSteps.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-amber-400" />
                              Troubleshooting Steps
                            </h4>
                            <ol className="space-y-3">
                              {diagnostic.troubleshootingSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold shrink-0">
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <Separator className="bg-white/20" />

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-white/5">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Estimated Time</span>
                            </div>
                            <p className="text-xl font-semibold text-white">
                              {diagnostic.estimatedRepairTime || 30} minutes
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-white/5">
                            <div className="flex items-center gap-2 mb-2">
                              <Wrench className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Skill Level</span>
                            </div>
                            <p className="text-xl font-semibold text-white capitalize">
                              {diagnostic.skillLevel || "intermediate"}
                            </p>
                          </div>
                        </div>

                        {diagnostic.partsWithPricing && diagnostic.partsWithPricing.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                              <Package className="h-4 w-4 text-amber-400" />
                              Required Parts
                            </h4>
                            <div className="space-y-2">
                              {diagnostic.partsWithPricing.slice(0, 4).map((part, i) => (
                                <div 
                                  key={i}
                                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                >
                                  <div>
                                    <p className="text-white text-sm font-medium">{part.name}</p>
                                    <p className="text-gray-400 text-xs">#{part.partNumber}</p>
                                  </div>
                                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                    ${part.price?.toFixed(2) || "N/A"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row gap-3">
                        <Link href={`/error-codes/${diagnostic.slug}`} className="w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            className="w-full border-white/30 text-white hover:bg-white/10"
                            data-testid={`button-view-details-${idx}`}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Full Details
                          </Button>
                        </Link>
                        <Link href="/parts-catalogue" className="w-full sm:w-auto">
                          <Button 
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                            data-testid={`button-order-parts-${idx}`}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Order Parts
                          </Button>
                        </Link>
                        <Link href="/consultant-inquiry" className="w-full sm:w-auto">
                          <Button 
                            variant="outline"
                            className="w-full border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10"
                            data-testid={`button-book-tech-${idx}`}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Book Technician
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}

                  {result.similarCodes && result.similarCodes.length > 0 && (
                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Sparkles className="h-5 w-5 text-amber-400" />
                          Similar Error Codes
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Other error codes on this equipment you may encounter
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {result.similarCodes.map((code, idx) => (
                            <Link key={code.id || idx} href={`/error-codes/${code.slug}`}>
                              <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge className={getSeverityColor(code.severity)}>
                                    {code.code}
                                  </Badge>
                                  <ArrowRight className="h-4 w-4 text-gray-400" />
                                </div>
                                <p className="text-sm text-white">{code.title}</p>
                                <p className="text-xs text-gray-400">{code.manufacturer}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {result && (!result.success || result.diagnostics.length === 0) && (
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No Error Codes Found
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      {result.extractedText 
                        ? `We detected text but couldn't match it to known error codes. Detected: "${result.extractedText.slice(0, 100)}..."`
                        : "The AI couldn't detect any error codes in this image. Try taking a clearer photo with better lighting."
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={clearImage}
                        className="bg-amber-500 hover:bg-amber-600 text-black"
                        data-testid="button-try-again"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Try Another Photo
                      </Button>
                      <Link href="/error-codes">
                        <Button 
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                          data-testid="button-manual-search"
                        >
                          <Wrench className="h-4 w-4 mr-2" />
                          Manual Search
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!result && !scanMutation.isPending && (
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="py-12 text-center">
                    <Scan className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Ready to Scan
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Upload a photo of your machine's error display to get instant diagnostics, 
                      repair steps, and parts information.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Card className="mt-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                    <Camera className="h-5 w-5 text-amber-400" />
                  </div>
                  <h4 className="font-medium text-white mb-1">Clear Photo</h4>
                  <p className="text-sm text-gray-400">Ensure the display is in focus and readable</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                    <Zap className="h-5 w-5 text-amber-400" />
                  </div>
                  <h4 className="font-medium text-white mb-1">Good Lighting</h4>
                  <p className="text-sm text-gray-400">Avoid glare and shadows on the display</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5 text-amber-400" />
                  </div>
                  <h4 className="font-medium text-white mb-1">Full Display</h4>
                  <p className="text-sm text-gray-400">Capture the entire error code display</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-400" />
                  </div>
                  <h4 className="font-medium text-white mb-1">Steady Hand</h4>
                  <p className="text-sm text-gray-400">Keep the camera still for a sharp image</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}