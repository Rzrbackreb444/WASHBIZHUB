import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumResults } from "@/components/withPremiumEnhancements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Wrench,
  Upload,
  Loader2,
  Zap,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  ArrowRight,
  Sparkles,
  X,
  Info,
  Shield,
  Settings,
  Package,
  Users,
  Cog,
  Thermometer,
  CircuitBoard,
  Gauge,
  HardDrive,
  Activity,
  ExternalLink,
} from "lucide-react";

interface FaultClassificationData {
  equipmentType: string;
  symptomDescription: string;
  classification: {
    faultType: string;
    specificProblem: string;
    severity: "Critical" | "Major" | "Minor" | "Routine";
    severityReason: string;
  };
  diagnosis: {
    rootCause: string;
    affectedComponents: string[];
    secondaryIssues: string[];
  };
  repairSteps: Array<{
    step: number;
    action: string;
    details: string;
    safetyNote?: string;
  }>;
  partsNeeded: Array<{
    partName: string;
    partNumber?: string;
    estimatedCost: string;
    priority: "required" | "recommended" | "optional";
  }>;
  timeEstimate: {
    minHours: number;
    maxHours: number;
    averageHours: number;
    factors: string[];
  };
  recommendation: {
    diyFeasibility: string;
    reason: string;
    skillLevel: string;
    toolsRequired: string[];
  };
  safetyWarnings: string[];
  additionalNotes: string[];
}

interface ClassificationResult {
  success: boolean;
  data: FaultClassificationData;
  confidence: number;
  error?: string;
}

const equipmentTypes = [
  { value: "washer", label: "Washer (Top Load)" },
  { value: "washer-front", label: "Washer (Front Load)" },
  { value: "washer-extractor", label: "Washer-Extractor" },
  { value: "dryer", label: "Dryer" },
  { value: "stack-dryer", label: "Stack Dryer" },
  { value: "tumble-dryer", label: "Tumble Dryer" },
  { value: "ironer", label: "Flatwork Ironer" },
  { value: "folder", label: "Folder" },
  { value: "coin-changer", label: "Coin Changer" },
  { value: "payment-system", label: "Payment System/Kiosk" },
  { value: "other", label: "Other Equipment" },
];

const getFaultTypeIcon = (faultType: string) => {
  switch (faultType) {
    case "mechanical":
      return Cog;
    case "electrical":
      return Zap;
    case "water":
      return Droplets;
    case "drainage":
      return Activity;
    case "control":
      return CircuitBoard;
    case "heating":
      return Thermometer;
    case "motor":
      return HardDrive;
    case "belt":
      return Settings;
    case "sensor":
      return Gauge;
    default:
      return Wrench;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Critical":
      return "bg-red-500/20 text-red-600 border-red-500/30";
    case "Major":
      return "bg-orange-500/20 text-orange-600 border-orange-500/30";
    case "Minor":
      return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
    case "Routine":
      return "bg-green-500/20 text-green-600 border-green-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getDiyColor = (feasibility: string) => {
  switch (feasibility) {
    case "DIY-Friendly":
      return "bg-green-500/20 text-green-600 border-green-500/30";
    case "DIY-Possible":
      return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
    case "Professional-Recommended":
      return "bg-orange-500/20 text-orange-600 border-orange-500/30";
    case "Professional-Required":
      return "bg-red-500/20 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "required":
      return "bg-red-500/20 text-red-600";
    case "recommended":
      return "bg-[#C8A661]/20 text-[#C8A661]";
    case "optional":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function FaultClassifier() {
  const [equipmentType, setEquipmentType] = useState<string>("");
  const [symptomDescription, setSymptomDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleDiagnose = async () => {
    if (!equipmentType || !symptomDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select equipment type and describe the symptoms.",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("equipmentType", equipmentType);
      formData.append("symptomDescription", symptomDescription);
      if (file) {
        formData.append("image", file);
      }

      const response = await fetch("/api/ai/classify-fault", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to diagnose issue");
      }

      setResult(data);
      toast({
        title: "Diagnosis Complete",
        description: `Identified: ${data.data.classification.specificProblem} (${Math.round(data.confidence * 100)}% confidence)`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Diagnosis Failed",
        description: error.message || "Failed to classify fault. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const clearAll = () => {
    setEquipmentType("");
    setSymptomDescription("");
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const FaultIcon = result?.data?.classification?.faultType 
    ? getFaultTypeIcon(result.data.classification.faultType) 
    : Wrench;

  return (
    <>
      <SEO
        title="Maintenance Fault Classifier | AI Equipment Diagnosis | Service Guy AI | WashBizHub"
        description="AI-powered fault classification for commercial laundry equipment. Get instant diagnosis, repair steps, parts needed, and DIY vs professional recommendations."
        canonicalUrl="/fault-classifier"
        ogType="website"
        keywords={[
          "fault classifier",
          "equipment diagnosis",
          "laundromat repair",
          "commercial laundry maintenance",
          "washer repair",
          "dryer repair",
          "AI diagnosis",
          "service guy ai",
          "laundry equipment troubleshooting",
        ]}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "AI Tools", url: "/ai-tools" },
              { name: "Service Guy AI", url: "/service-guy-ai" },
              { name: "Fault Classifier", url: "/fault-classifier" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#0A1628]">
                <Wrench className="w-8 h-8 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Maintenance Fault Classifier
                </h1>
                <p className="text-muted-foreground">
                  AI-powered diagnosis for commercial laundry equipment
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Service Guy AI
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#C8A661]" />
                    Equipment & Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment-type">Equipment Type</Label>
                    <Select value={equipmentType} onValueChange={setEquipmentType}>
                      <SelectTrigger data-testid="select-equipment-type">
                        <SelectValue placeholder="Select equipment type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symptom-description">Symptom Description</Label>
                    <Textarea
                      id="symptom-description"
                      placeholder="Describe the issue in detail... (e.g., 'Machine makes loud grinding noise during spin cycle, smells like burning rubber, water not draining completely')"
                      value={symptomDescription}
                      onChange={(e) => setSymptomDescription(e.target.value)}
                      className="min-h-[120px]"
                      data-testid="textarea-symptom-description"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific: include sounds, smells, error codes, when the problem occurs, and any recent changes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#C8A661]" />
                    Photo Upload (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!preview ? (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? "border-[#C8A661] bg-[#C8A661]/5"
                          : "border-muted-foreground/30 hover:border-[#C8A661]/50"
                      }`}
                      data-testid="dropzone-upload"
                    >
                      <input {...getInputProps()} data-testid="input-file-upload" />
                      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        {isDragActive ? "Drop your photo here" : "Drag & drop equipment photo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        or click to browse (JPEG, PNG, WebP up to 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border">
                        <img
                          src={preview}
                          alt="Uploaded equipment"
                          className="w-full max-h-[200px] object-contain bg-muted/50"
                          data-testid="img-equipment-preview"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                          onClick={clearFile}
                          data-testid="button-clear-file"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span data-testid="text-filename">{file?.name}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={handleDiagnose}
                  disabled={isAnalyzing || !equipmentType || !symptomDescription.trim()}
                  className="flex-1 bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                  data-testid="button-diagnose"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Diagnose Issue
                    </>
                  )}
                </Button>
                {(equipmentType || symptomDescription || file || result) && (
                  <Button
                    variant="outline"
                    onClick={clearAll}
                    data-testid="button-clear-all"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <Alert className="border-[#C8A661]/30 bg-[#C8A661]/5">
                <Info className="h-4 w-4 text-[#C8A661]" />
                <AlertTitle className="text-foreground">Tips for Best Results</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Include error codes if displayed</li>
                    <li>Describe when the problem started</li>
                    <li>Note any unusual sounds, smells, or behaviors</li>
                    <li>Include make/model if known</li>
                    <li>Upload a clear photo showing the problem area</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-6">
              {!result ? (
                <Card className="bg-muted/30 border border-dashed">
                  <CardContent className="py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Wrench className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Ready to Diagnose
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Select equipment type, describe the symptoms, and click "Diagnose Issue" to get AI-powered fault analysis.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <PremiumResults
                  featureName="fault-classifier"
                  analysisType="fault-classifier"
                  title="Fault Classification Results"
                  data={{
                    inputValues: {
                      equipmentType: equipmentType,
                      symptomDescription: symptomDescription,
                      hasImage: !!file,
                    },
                    classification: result.data.classification,
                    diagnosis: result.data.diagnosis,
                    repairSteps: result.data.repairSteps,
                    partsNeeded: result.data.partsNeeded,
                    timeEstimate: result.data.timeEstimate,
                    recommendation: result.data.recommendation,
                    safetyWarnings: result.data.safetyWarnings,
                    additionalNotes: result.data.additionalNotes,
                    confidence: result.confidence,
                    metrics: {
                      severity: result.data.classification.severity,
                      faultType: result.data.classification.faultType,
                      specificProblem: result.data.classification.specificProblem,
                      diyFeasibility: result.data.recommendation.diyFeasibility,
                      estimatedTime: `${result.data.timeEstimate.minHours}-${result.data.timeEstimate.maxHours} hours`,
                      confidence: `${Math.round(result.confidence * 100)}%`,
                    },
                    timestamp: new Date().toISOString(),
                    analysisType: "fault-classifier",
                  }}
                  summary={{
                    headline: `${result.data.classification.severity} Severity - ${result.data.classification.faultType}`,
                    metrics: [
                      { label: "Severity", value: result.data.classification.severity },
                      { label: "Fault Type", value: result.data.classification.faultType },
                      { label: "Confidence", value: `${Math.round(result.confidence * 100)}%` },
                    ]
                  }}
                  benefits={[
                    "Unlimited AI analyses",
                    "Export to Google Sheets & Docs",
                    "Save all results to profile"
                  ]}
                >
                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                          <FaultIcon className="h-6 w-6 text-[#C8A661]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle data-testid="text-fault-classification">Fault Classification</CardTitle>
                            <Badge className={getSeverityColor(result.data.classification.severity)} data-testid="badge-severity">
                              {result.data.classification.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {result.data.classification.faultType} Issue
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Confidence</div>
                          <div className="text-lg font-bold text-[#C8A661]" data-testid="text-confidence">
                            {Math.round(result.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Identified Problem</h4>
                        <p className="text-muted-foreground" data-testid="text-specific-problem">
                          {result.data.classification.specificProblem}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Root Cause</h4>
                        <p className="text-muted-foreground" data-testid="text-root-cause">
                          {result.data.diagnosis.rootCause}
                        </p>
                      </div>
                      {result.data.diagnosis.affectedComponents.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Affected Components</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.data.diagnosis.affectedComponents.map((component, idx) => (
                              <Badge key={idx} variant="secondary" data-testid={`badge-component-${idx}`}>
                                {component}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {result.data.repairSteps.length > 0 && (
                    <Card className="bg-card border shadow-sm overflow-hidden">
                      <div className="h-1 bg-[#C8A661]" />
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                          Repair Steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-4">
                          {result.data.repairSteps.map((step, idx) => (
                            <li key={idx} className="flex gap-3" data-testid={`step-${idx + 1}`}>
                              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[#0A1628] text-white text-sm font-bold flex items-center justify-center">
                                {step.step}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-foreground">{step.action}</h5>
                                <p className="text-sm text-muted-foreground mt-1">{step.details}</p>
                                {step.safetyNote && (
                                  <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-500/10 rounded-md">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-yellow-600">{step.safetyNote}</span>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  )}

                  {result.data.partsNeeded.length > 0 && (
                    <Card className="bg-card border shadow-sm overflow-hidden">
                      <div className="h-1 bg-[#C8A661]" />
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-[#C8A661]" />
                          Parts Needed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {result.data.partsNeeded.map((part, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              data-testid={`part-${idx}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">{part.partName}</span>
                                  <Badge className={getPriorityBadge(part.priority)}>
                                    {part.priority}
                                  </Badge>
                                </div>
                                {part.partNumber && (
                                  <span className="text-xs text-muted-foreground">Part #: {part.partNumber}</span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-foreground">{part.estimatedCost}</div>
                                <a 
                                  href={`https://www.google.com/search?q=${encodeURIComponent(part.partName + " " + (part.partNumber || ""))}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#C8A661] hover:underline inline-flex items-center gap-1"
                                  data-testid={`link-search-part-${idx}`}
                                >
                                  Search Parts <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-card border shadow-sm overflow-hidden">
                      <div className="h-1 bg-[#C8A661]" />
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Clock className="w-4 h-4 text-[#C8A661]" />
                          Time Estimate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-[#C8A661]" data-testid="text-time-estimate">
                          {result.data.timeEstimate.minHours}-{result.data.timeEstimate.maxHours} hours
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Average: {result.data.timeEstimate.averageHours} hours
                        </div>
                        {result.data.timeEstimate.factors.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Factors: </span>
                            {result.data.timeEstimate.factors.join(", ")}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-card border shadow-sm overflow-hidden">
                      <div className="h-1 bg-[#C8A661]" />
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Users className="w-4 h-4 text-[#C8A661]" />
                          DIY vs Pro
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge 
                          className={getDiyColor(result.data.recommendation.diyFeasibility)}
                          data-testid="badge-diy-recommendation"
                        >
                          {result.data.recommendation.diyFeasibility}
                        </Badge>
                        <div className="mt-2 text-sm text-muted-foreground" data-testid="text-diy-reason">
                          {result.data.recommendation.reason}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Skill Level: </span>
                          {result.data.recommendation.skillLevel}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {result.data.recommendation.toolsRequired.length > 0 && (
                    <Card className="bg-card border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Wrench className="w-4 h-4 text-[#C8A661]" />
                          Tools Required
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {result.data.recommendation.toolsRequired.map((tool, idx) => (
                            <Badge key={idx} variant="outline" data-testid={`badge-tool-${idx}`}>
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {result.data.safetyWarnings.length > 0 && (
                    <Alert className="border-red-500/30 bg-red-500/5">
                      <Shield className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-600">Safety Warnings</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-red-600/90">
                          {result.data.safetyWarnings.map((warning, idx) => (
                            <li key={idx} data-testid={`warning-${idx}`}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    <Link href="/service-guy-ai" className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        data-testid="link-service-guy-ai"
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Full Service Portal
                      </Button>
                    </Link>
                    <Link href="/service-guy-ai?tab=jobs" className="flex-1">
                      <Button 
                        className="w-full bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                        data-testid="button-create-ticket"
                      >
                        Create Service Ticket
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </PremiumResults>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
