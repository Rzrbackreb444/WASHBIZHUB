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
import { useToast } from "@/hooks/use-toast";
import {
  Receipt,
  Upload,
  Loader2,
  Zap,
  Flame,
  Droplets,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  X,
  Calculator,
  Info,
} from "lucide-react";

interface UtilityBillData {
  provider: string | null;
  accountNumber: string | null;
  serviceAddress: string | null;
  billingPeriod: {
    start: string | null;
    end: string | null;
  };
  dueDate: string | null;
  totalAmountDue: number | null;
  previousBalance: number | null;
  payments: number | null;
  currentCharges: number | null;
  usage: {
    amount: number | null;
    unit: string | null;
    type: "electric" | "gas" | "water" | "unknown";
  };
  rate: {
    perUnit: number | null;
    unit: string | null;
  };
  additionalFees: Array<{
    name: string;
    amount: number;
  }>;
  rawExtractedText: string;
}

interface ScanResult {
  success: boolean;
  data: UtilityBillData;
  confidence: number;
  error?: string;
}

const getUtilityIcon = (type: string) => {
  switch (type) {
    case "electric":
      return Zap;
    case "gas":
      return Flame;
    case "water":
      return Droplets;
    default:
      return Receipt;
  }
};

const getUtilityColor = (type: string) => {
  switch (type) {
    case "electric":
      return "text-yellow-500";
    case "gas":
      return "text-orange-500";
    case "water":
      return "text-blue-500";
    default:
      return "text-muted-foreground";
  }
};

export default function UtilityBillScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setResult(null);
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

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai/scan-utility-bill", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze bill");
      }

      setResult(data);
      toast({
        title: "Bill Analyzed Successfully",
        description: `Extracted data with ${Math.round(data.confidence * 100)}% confidence`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze utility bill",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const UtilityIcon = result?.data?.usage?.type ? getUtilityIcon(result.data.usage.type) : Receipt;
  const utilityColor = result?.data?.usage?.type ? getUtilityColor(result.data.usage.type) : "";

  return (
    <>
      <SEO
        title="Utility Bill Scanner | AI-Powered OCR for Laundromat Utility Bills | WashBizHub"
        description="Scan and extract data from utility bills using AI. Automatically capture usage, rates, billing periods, and amounts to analyze your laundromat's utility costs."
        canonicalUrl="/utility-bill-scanner"
        ogType="website"
        keywords={[
          "utility bill scanner",
          "OCR utility bills",
          "laundromat utility analysis",
          "extract bill data",
          "AI bill reader",
          "utility cost tracking",
          "laundromat expenses",
        ]}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Breadcrumb
            items={[
              { label: "AI Tools", href: "/ai-tools" },
              { label: "Utility Bill Scanner" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#0A1628]">
                <Receipt className="w-8 h-8 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Utility Bill Scanner
                </h1>
                <p className="text-muted-foreground">
                  AI-powered OCR to extract data from your utility bills
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="bg-card border shadow-sm overflow-hidden">
                <div className="h-1 bg-[#C8A661]" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#C8A661]" />
                    Upload Utility Bill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!preview ? (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? "border-[#C8A661] bg-[#C8A661]/5"
                          : "border-muted-foreground/30 hover:border-[#C8A661]/50"
                      }`}
                      data-testid="dropzone-upload"
                    >
                      <input {...getInputProps()} data-testid="input-file-upload" />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        {isDragActive ? "Drop your bill here" : "Drag & drop utility bill image"}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse files
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports JPEG, PNG, WebP up to 10MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden border">
                        <img
                          src={preview}
                          alt="Uploaded utility bill"
                          className="w-full max-h-[400px] object-contain bg-muted/50"
                          data-testid="img-bill-preview"
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span data-testid="text-filename">{file?.name}</span>
                        </div>
                        <Button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                          data-testid="button-analyze-bill"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Analyze Bill
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Alert className="border-[#C8A661]/30 bg-[#C8A661]/5">
                <Info className="h-4 w-4 text-[#C8A661]" />
                <AlertTitle className="text-foreground">Tips for Best Results</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Use a clear, well-lit photo of the entire bill</li>
                    <li>Ensure all text is readable and not blurry</li>
                    <li>Include the summary section with total amount due</li>
                    <li>Works best with electric, gas, and water bills</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-6">
              {result ? (
                <>
                  <Card className="bg-card border shadow-sm overflow-hidden">
                    <div className="h-1 bg-[#C8A661]" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          Extracted Data
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className={
                            result.confidence >= 0.8
                              ? "bg-green-500/20 text-green-600"
                              : result.confidence >= 0.6
                              ? "bg-yellow-500/20 text-yellow-600"
                              : "bg-red-500/20 text-red-600"
                          }
                          data-testid="badge-confidence"
                        >
                          {Math.round(result.confidence * 100)}% Confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                          <UtilityIcon className={`w-6 h-6 ${utilityColor || "text-[#C8A661]"}`} />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground" data-testid="text-provider">
                            {result.data.provider || "Unknown Provider"}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize" data-testid="text-utility-type">
                            {result.data.usage.type !== "unknown" ? `${result.data.usage.type} Utility` : "Utility Bill"}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-[#C8A661]" />
                            <span className="text-sm text-muted-foreground">Total Due</span>
                          </div>
                          <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-total-due">
                            {formatCurrency(result.data.totalAmountDue)}
                          </p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Due Date</span>
                          </div>
                          <p className="text-lg font-semibold text-foreground" data-testid="text-due-date">
                            {formatDate(result.data.dueDate)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Bill Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Account #:</span>
                            <span className="font-medium" data-testid="text-account-number">
                              {result.data.accountNumber || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Billing Period:</span>
                            <span className="font-medium" data-testid="text-billing-period">
                              {result.data.billingPeriod.start && result.data.billingPeriod.end
                                ? `${formatDate(result.data.billingPeriod.start)} - ${formatDate(result.data.billingPeriod.end)}`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Previous Balance:</span>
                            <span className="font-medium" data-testid="text-previous-balance">
                              {formatCurrency(result.data.previousBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payments:</span>
                            <span className="font-medium text-green-600" data-testid="text-payments">
                              {result.data.payments ? `-${formatCurrency(result.data.payments)}` : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Charges:</span>
                            <span className="font-medium" data-testid="text-current-charges">
                              {formatCurrency(result.data.currentCharges)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Usage & Rates</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Usage</p>
                            <p className="text-lg font-semibold text-foreground" data-testid="text-usage">
                              {result.data.usage.amount !== null
                                ? `${result.data.usage.amount.toLocaleString()} ${result.data.usage.unit || ""}`
                                : "—"}
                            </p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Rate</p>
                            <p className="text-lg font-semibold text-foreground" data-testid="text-rate">
                              {result.data.rate.perUnit !== null
                                ? `${formatCurrency(result.data.rate.perUnit)}/${result.data.rate.unit?.replace("$/", "") || "unit"}`
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {result.data.additionalFees.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground">Additional Fees</h4>
                            <div className="space-y-2">
                              {result.data.additionalFees.map((fee, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{fee.name}</span>
                                  <span className="font-medium">{formatCurrency(fee.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                          <Calculator className="w-5 h-5 text-[#C8A661]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Use Data in Calculator</p>
                          <p className="text-sm text-muted-foreground">
                            Pre-fill the Utility Rate Forecaster with extracted data
                          </p>
                        </div>
                        <Link href={`/utility-rate-forecaster?electric=${result.data.usage.type === "electric" ? result.data.totalAmountDue || "" : ""}&gas=${result.data.usage.type === "gas" ? result.data.totalAmountDue || "" : ""}&water=${result.data.usage.type === "water" ? result.data.totalAmountDue || "" : ""}`}>
                          <Button
                            variant="outline"
                            className="border-[#0A1628] text-[#0A1628]"
                            data-testid="button-use-in-calculator"
                          >
                            Open Calculator
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {result.error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Partial Results</AlertTitle>
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Card className="bg-card border shadow-sm">
                  <CardContent className="py-16 text-center">
                    <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Bill Analyzed Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Upload a utility bill image and click "Analyze Bill" to extract data using AI
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Electric Bills</h3>
                    <p className="text-sm text-muted-foreground">
                      Extract kWh usage, rates, and identify peak demand charges for laundromats
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Gas Bills</h3>
                    <p className="text-sm text-muted-foreground">
                      Capture therms usage and seasonal rate variations for dryer costs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                    <Droplets className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Water Bills</h3>
                    <p className="text-sm text-muted-foreground">
                      Track water usage, sewer charges, and identify potential leaks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
