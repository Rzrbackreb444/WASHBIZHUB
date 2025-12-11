import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Upload,
  Loader2,
  Sparkles,
  X,
  DollarSign,
  Clock,
  Wrench,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Calendar,
  Package,
  Settings,
  ShoppingCart,
  ArrowRight,
  ImagePlus,
  Gauge,
  CircleDollarSign,
  Timer,
  ClipboardList,
  Lightbulb,
  RefreshCcw,
  Zap,
} from "lucide-react";

interface EquipmentAppraisalData {
  equipment: {
    type: string;
    brand: string | null;
    model: string | null;
    serialNumber: string | null;
    capacity: string | null;
    fuelType: string;
  };
  condition: {
    rating: "Excellent" | "Good" | "Fair" | "Poor";
    score: number;
    overallNotes: string;
    cosmetic: { rating: string; notes: string };
    mechanical: { rating: string; notes: string };
    wearIndicators: string[];
  };
  valuation: {
    estimatedMarketValue: { low: number; mid: number; high: number };
    originalMSRP: number | null;
    depreciationPercent: number;
    pricePerPound: number | null;
    comparableListings: string;
  };
  age: {
    estimatedYears: number;
    estimatedManufactureYear: number | null;
    ageCategory: string;
    ageNotes: string;
  };
  lifespan: {
    expectedTotalYears: number;
    remainingYears: number;
    endOfLifeYear: number | null;
    lifespanNotes: string;
  };
  maintenance: {
    urgentItems: string[];
    recommendedItems: string[];
    preventiveSchedule: string[];
    estimatedMaintenanceCost: number | null;
  };
  recommendations: {
    keepOrReplace: string;
    reasoning: string;
    upgradeOptions: Array<{ option: string; estimatedCost: number; benefit: string }>;
    replacementSuggestions: Array<{
      brand: string;
      model: string;
      estimatedCost: number;
      features: string;
    }>;
  };
}

interface AppraisalResult {
  success: boolean;
  data: EquipmentAppraisalData;
  confidence: number;
  error?: string;
}

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

const getConditionColor = (rating: string) => {
  switch (rating) {
    case "Excellent":
      return "text-green-600";
    case "Good":
      return "text-blue-600";
    case "Fair":
      return "text-orange-500";
    case "Poor":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
};

const getConditionBadgeVariant = (rating: string) => {
  switch (rating) {
    case "Excellent":
      return "bg-green-500/20 text-green-600 border-green-500/30";
    case "Good":
      return "bg-blue-500/20 text-blue-600 border-blue-500/30";
    case "Fair":
      return "bg-orange-500/20 text-orange-600 border-orange-500/30";
    case "Poor":
      return "bg-red-500/20 text-red-600 border-red-500/30";
    default:
      return "";
  }
};

const getKeepReplaceColor = (verdict: string) => {
  switch (verdict) {
    case "Keep":
      return "text-green-600";
    case "Consider Replacing":
      return "text-orange-500";
    case "Replace Soon":
      return "text-orange-600";
    case "Replace Immediately":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
};

const getEquipmentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    washer: "Front-Load Washer",
    dryer: "Tumble Dryer",
    "washer-extractor": "Washer-Extractor",
    stack: "Stack Unit",
    ironer: "Flatwork Ironer",
    folder: "Folder",
    "payment-system": "Payment System",
    unknown: "Unknown Equipment",
  };
  return labels[type] || type;
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function EquipmentAppraiser() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AppraisalResult | null>(null);
  const [analyzedImageIndex, setAnalyzedImageIndex] = useState<number>(0);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages: UploadedImage[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }));
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
      setResult(null);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = (id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
    setResult(null);
  };

  const handleAnalyze = async (imageIndex: number = 0) => {
    if (images.length === 0) return;

    setIsAnalyzing(true);
    setAnalyzedImageIndex(imageIndex);

    try {
      const formData = new FormData();
      formData.append("image", images[imageIndex].file);

      const response = await fetch("/api/ai/appraise-equipment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze equipment");
      }

      setResult(data);
      toast({
        title: "Equipment Analyzed Successfully",
        description: `Analysis completed with ${Math.round(data.confidence * 100)}% confidence`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze equipment photo",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResult(null);
  };

  const data = result?.data;
  const lifespanPercent = data
    ? Math.round(
        ((data.lifespan.expectedTotalYears - data.lifespan.remainingYears) /
          data.lifespan.expectedTotalYears) *
          100
      )
    : 0;

  return (
    <>
      <SEO
        title="Equipment Photo Appraiser | AI-Powered Laundromat Equipment Valuation | WashBizHub"
        description="Get instant AI-powered equipment appraisals from photos. Identify brand, model, condition, market value, and maintenance recommendations for laundry equipment."
        canonicalUrl="/equipment-appraiser"
        ogType="website"
        keywords={[
          "equipment appraiser",
          "laundromat equipment value",
          "washer dryer appraisal",
          "commercial laundry equipment",
          "equipment valuation",
          "AI equipment analysis",
          "laundry machine value",
          "equipment condition assessment",
        ]}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Breadcrumb
            items={[
              { label: "AI Tools", href: "/ai-tools" },
              { label: "Equipment Appraiser" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#0A1628]">
                <Camera className="w-8 h-8 text-[#C8A661]" />
              </div>
              <div>
                <h1
                  className="text-3xl font-bold text-foreground"
                  data-testid="text-page-title"
                >
                  Equipment Photo Appraiser
                </h1>
                <p className="text-muted-foreground">
                  AI-powered equipment valuation and condition analysis
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661] text-[#0A1628]">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-[#C8A661]" />
                    Upload Equipment Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-[#C8A661] bg-[#C8A661]/10"
                        : "border-muted-foreground/30 hover:border-[#C8A661]/50 hover:bg-muted/50"
                    }`}
                    data-testid="dropzone-upload"
                  >
                    <input {...getInputProps()} data-testid="input-file-upload" />
                    <Upload
                      className={`w-12 h-12 mx-auto mb-4 ${
                        isDragActive ? "text-[#C8A661]" : "text-muted-foreground"
                      }`}
                    />
                    {isDragActive ? (
                      <p className="text-[#C8A661] font-medium">Drop equipment photos here...</p>
                    ) : (
                      <>
                        <p className="text-foreground font-medium mb-1">
                          Drag & drop equipment photos here
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse (up to 5 images, max 10MB each)
                        </p>
                      </>
                    )}
                  </div>

                  {images.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-foreground">
                          {images.length} image{images.length > 1 ? "s" : ""} uploaded
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAll}
                          data-testid="button-clear-all"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear All
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {images.map((img, index) => (
                          <div
                            key={img.id}
                            className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
                              analyzedImageIndex === index && result
                                ? "border-[#C8A661]"
                                : "border-transparent"
                            }`}
                            data-testid={`image-preview-${index}`}
                          >
                            <img
                              src={img.preview}
                              alt={`Equipment ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleAnalyze(index)}
                                disabled={isAnalyzing}
                                data-testid={`button-analyze-${index}`}
                              >
                                <Sparkles className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeImage(img.id)}
                                data-testid={`button-remove-${index}`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            {analyzedImageIndex === index && result && (
                              <div className="absolute top-1 right-1">
                                <Badge className="bg-[#C8A661] text-[#0A1628] text-xs">
                                  Analyzed
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full mt-4 bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                    onClick={() => handleAnalyze(0)}
                    disabled={images.length === 0 || isAnalyzing}
                    data-testid="button-analyze-equipment"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Equipment...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Equipment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Alert className="border-[#C8A661]/30 bg-[#C8A661]/10">
                <Info className="w-4 h-4 text-[#C8A661]" />
                <AlertTitle className="text-foreground">Pro Tips for Best Results</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Capture the entire machine in good lighting</li>
                    <li>Include the control panel and nameplate</li>
                    <li>Take photos of any visible damage or wear</li>
                    <li>Multiple angles improve accuracy</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-6">
              {!result && !isAnalyzing && (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Camera className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">
                        Upload equipment photos to get instant AI-powered appraisals
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isAnalyzing && (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Loader2 className="w-16 h-16 mx-auto text-[#C8A661] mb-4 animate-spin" />
                      <p className="text-foreground font-medium mb-2">
                        Analyzing Equipment...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Our AI is identifying brand, model, condition, and market value
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {result && data && (
                <div className="space-y-4">
                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-[#C8A661]" />
                          Equipment ID
                        </CardTitle>
                        <Badge
                          className={`${getConditionBadgeVariant(data.condition.rating)}`}
                          data-testid="badge-condition-rating"
                        >
                          {data.condition.rating}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p
                            className="font-medium text-foreground"
                            data-testid="text-equipment-type"
                          >
                            {getEquipmentTypeLabel(data.equipment.type)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Brand</p>
                          <p
                            className="font-medium text-foreground"
                            data-testid="text-equipment-brand"
                          >
                            {data.equipment.brand || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Model</p>
                          <p
                            className="font-medium text-foreground"
                            data-testid="text-equipment-model"
                          >
                            {data.equipment.model || "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Capacity</p>
                          <p className="font-medium text-foreground">
                            {data.equipment.capacity || "Unknown"}
                          </p>
                        </div>
                        {data.equipment.fuelType !== "unknown" && (
                          <div>
                            <p className="text-xs text-muted-foreground">Fuel Type</p>
                            <p className="font-medium text-foreground capitalize">
                              {data.equipment.fuelType}
                            </p>
                          </div>
                        )}
                        {data.equipment.serialNumber && (
                          <div>
                            <p className="text-xs text-muted-foreground">Serial #</p>
                            <p className="font-medium text-foreground font-mono text-sm">
                              {data.equipment.serialNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-[#C8A661]" />
                        Condition Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            Overall Score
                          </span>
                          <span
                            className={`text-lg font-bold ${getConditionColor(
                              data.condition.rating
                            )}`}
                            data-testid="text-condition-score"
                          >
                            {data.condition.score}/100
                          </span>
                        </div>
                        <Progress
                          value={data.condition.score}
                          className="h-3"
                          data-testid="progress-condition"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {data.condition.overallNotes}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Cosmetic</p>
                          <p
                            className={`font-medium ${getConditionColor(
                              data.condition.cosmetic.rating
                            )}`}
                          >
                            {data.condition.cosmetic.rating}
                          </p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Mechanical</p>
                          <p
                            className={`font-medium ${getConditionColor(
                              data.condition.mechanical.rating
                            )}`}
                          >
                            {data.condition.mechanical.rating}
                          </p>
                        </div>
                      </div>
                      {data.condition.wearIndicators.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-muted-foreground mb-2">
                            Wear Indicators:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {data.condition.wearIndicators.map((indicator, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {indicator}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <CircleDollarSign className="w-5 h-5 text-[#C8A661]" />
                        Market Valuation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <p className="text-xs text-muted-foreground">Estimated Value</p>
                        <p
                          className="text-3xl font-bold text-[#C8A661]"
                          data-testid="text-market-value"
                        >
                          {formatCurrency(data.valuation.estimatedMarketValue.mid)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Range: {formatCurrency(data.valuation.estimatedMarketValue.low)} -{" "}
                          {formatCurrency(data.valuation.estimatedMarketValue.high)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {data.valuation.originalMSRP && (
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground">Original MSRP</p>
                            <p className="font-medium text-foreground">
                              {formatCurrency(data.valuation.originalMSRP)}
                            </p>
                          </div>
                        )}
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Depreciation</p>
                          <p className="font-medium text-red-500">
                            -{data.valuation.depreciationPercent}%
                          </p>
                        </div>
                        {data.valuation.pricePerPound && (
                          <div className="bg-muted/50 rounded-lg p-3 text-center col-span-2">
                            <p className="text-xs text-muted-foreground">Price per Pound</p>
                            <p className="font-medium text-foreground">
                              {formatCurrency(data.valuation.pricePerPound)}/lb
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {data.valuation.comparableListings}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-[#C8A661]" />
                        Lifespan & Age
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Age</p>
                          <p
                            className="text-2xl font-bold text-foreground"
                            data-testid="text-equipment-age"
                          >
                            ~{data.age.estimatedYears} years
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {data.age.ageCategory}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Remaining Life</p>
                          <p
                            className="text-2xl font-bold text-[#C8A661]"
                            data-testid="text-remaining-life"
                          >
                            ~{data.lifespan.remainingYears} years
                          </p>
                          {data.lifespan.endOfLifeYear && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Until ~{data.lifespan.endOfLifeYear}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Lifespan Progress</span>
                          <span className="text-xs text-muted-foreground">{lifespanPercent}%</span>
                        </div>
                        <Progress
                          value={lifespanPercent}
                          className="h-2"
                          data-testid="progress-lifespan"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{data.lifespan.lifespanNotes}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-[#C8A661]" />
                        Maintenance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.maintenance.urgentItems.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Urgent Items
                          </p>
                          <ul className="space-y-1">
                            {data.maintenance.urgentItems.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-foreground flex items-start gap-2"
                              >
                                <span className="text-red-500">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {data.maintenance.recommendedItems.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-orange-600 mb-2 flex items-center gap-1">
                            <ClipboardList className="w-3 h-3" /> Recommended
                          </p>
                          <ul className="space-y-1">
                            {data.maintenance.recommendedItems.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-foreground flex items-start gap-2"
                              >
                                <span className="text-orange-500">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {data.maintenance.estimatedMaintenanceCost && (
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground">Est. Annual Maintenance</p>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(data.maintenance.estimatedMaintenanceCost)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-[#C8A661]" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Verdict</span>
                          <Badge
                            className={`${
                              data.recommendations.keepOrReplace === "Keep"
                                ? "bg-green-500/20 text-green-600 border-green-500/30"
                                : data.recommendations.keepOrReplace === "Replace Immediately"
                                ? "bg-red-500/20 text-red-600 border-red-500/30"
                                : "bg-orange-500/20 text-orange-600 border-orange-500/30"
                            }`}
                            data-testid="badge-verdict"
                          >
                            {data.recommendations.keepOrReplace}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {data.recommendations.reasoning}
                        </p>
                      </div>

                      {data.recommendations.upgradeOptions.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[#C8A661]" /> Upgrade Options
                          </p>
                          <div className="space-y-2">
                            {data.recommendations.upgradeOptions.map((opt, i) => (
                              <div
                                key={i}
                                className="bg-muted/30 rounded-lg p-3 border border-muted"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm text-foreground">
                                    {opt.option}
                                  </span>
                                  <span className="text-sm text-[#C8A661]">
                                    {formatCurrency(opt.estimatedCost)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{opt.benefit}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {data.recommendations.replacementSuggestions.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                            <RefreshCcw className="w-3 h-3 text-[#C8A661]" /> Replacement Options
                          </p>
                          <div className="space-y-2">
                            {data.recommendations.replacementSuggestions.map((rep, i) => (
                              <div
                                key={i}
                                className="bg-muted/30 rounded-lg p-3 border border-muted"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm text-foreground">
                                    {rep.brand} {rep.model}
                                  </span>
                                  <span className="text-sm text-[#C8A661]">
                                    {formatCurrency(rep.estimatedCost)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{rep.features}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                      asChild
                      data-testid="button-add-to-inventory"
                    >
                      <Link href="/parts-inventory">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Inventory
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-[#0A1628] text-[#0A1628]"
                      asChild
                      data-testid="button-compare-replacement"
                    >
                      <Link href="/equipment-marketplace">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Compare Replacements
                      </Link>
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Analysis confidence: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
