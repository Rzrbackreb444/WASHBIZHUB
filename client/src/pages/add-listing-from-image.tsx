import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Upload, Image as ImageIcon, Sparkles, Check, X, 
  Building2, MapPin, DollarSign, Phone, Mail, User,
  ArrowRight, Loader2, AlertCircle, CheckCircle2,
  Zap, FileText, Crown, RefreshCw
} from "lucide-react";

interface ExtractedData {
  businessType: "laundromat" | "car_wash" | "restaurant" | "dry_cleaner" | "other";
  businessTypeOther?: string;
  title: string;
  tagline: string;
  city: string | null;
  region: string | null;
  country: string;
  askingPrice: string | null;
  currency: string;
  netIncome: string | null;
  grossRevenue: string | null;
  includesRealEstate: boolean;
  ownerFinancing: boolean;
  absenteeRun: boolean;
  features: string[];
  equipmentBrands: string[];
  brokerName: string | null;
  brokerCompany: string | null;
  brokerPhone: string | null;
  brokerEmail: string | null;
  externalListingId: string | null;
  confidence: number;
  rawNotes: string;
}

const BUSINESS_TYPES = [
  { value: "laundromat", label: "Laundromat" },
  { value: "car_wash", label: "Car Wash" },
  { value: "restaurant", label: "Restaurant" },
  { value: "dry_cleaner", label: "Dry Cleaner" },
  { value: "other", label: "Other Business" },
];

function formatCurrency(value: string | null): string {
  if (!value) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num);
}

export default function AddListingFromImage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);
  const [step, setStep] = useState<"upload" | "analyzing" | "review" | "submitting">("upload");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setExtractedData(null);
      setEditedData(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/listings/analyze-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Analysis failed");
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setExtractedData(result.data);
      setEditedData(result.data);
      setStep("review");
      toast({
        title: "Image Analyzed Successfully",
        description: `Extracted data with ${Math.round(result.data.confidence * 100)}% confidence`,
      });
    },
    onError: (error: Error) => {
      setStep("upload");
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ExtractedData) => {
      const listingData = {
        title: data.title,
        tagline: data.tagline,
        description: data.rawNotes || data.tagline,
        businessType: data.businessType === "other" ? "laundromat" : data.businessType,
        listingType: data.brokerName ? "broker" : "owner",
        priceOriginal: data.askingPrice,
        priceInUSD: data.askingPrice,
        currency: data.currency || "USD",
        priceVisibility: "public",
        country: data.country || "US",
        region: data.region || "",
        city: data.city || "",
        includesRealEstate: data.includesRealEstate,
        ownerFinancing: data.ownerFinancing,
        brokerName: data.brokerName,
        brokerCompany: data.brokerCompany,
        brokerPhone: data.brokerPhone,
        brokerEmail: data.brokerEmail,
        externalListingId: data.externalListingId,
        status: "draft",
      };
      
      const response = await apiRequest("POST", "/api/listings", listingData);
      return response.json();
    },
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Listing Created!",
        description: "Your listing has been saved as a draft. You can add photos and publish it now.",
      });
      setLocation(`/listing-form?id=${listing.id}`);
    },
    onError: (error: Error) => {
      setStep("review");
      toast({
        title: "Failed to Create Listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!uploadedImage) return;
    setStep("analyzing");
    analyzeMutation.mutate(uploadedImage);
  };

  const handleSubmit = () => {
    if (!editedData) return;
    setStep("submitting");
    submitMutation.mutate(editedData);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setExtractedData(null);
    setEditedData(null);
    setStep("upload");
  };

  const updateField = (field: keyof ExtractedData, value: any) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: value });
    }
  };

  return (
    <>
      <SEO 
        title="Add Listing from Image | AI-Powered Listing Creator | WashBizHub"
        description="Upload a broker flyer or listing image and our AI will automatically extract all the details. Create listings in seconds, not minutes."
        canonicalUrl="/add-listing-from-image"
        keywords={["add listing", "broker flyer", "AI listing", "laundromat listing"]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Add Listing from Image
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Upload a broker flyer or listing image and our AI will automatically extract all the details.
              Works with laundromats, car washes, restaurants, and more!
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {["upload", "analyzing", "review"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === s || (step === "submitting" && s === "review") 
                    ? "bg-accent text-accent-foreground" 
                    : i < ["upload", "analyzing", "review"].indexOf(step)
                    ? "bg-green-500 text-white"
                    : "bg-slate-700 text-slate-400"
                }`}>
                  {i < ["upload", "analyzing", "review"].indexOf(step) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-sm hidden sm:block ${
                  step === s ? "text-white" : "text-slate-500"
                }`}>
                  {s === "upload" ? "Upload" : s === "analyzing" ? "Analyze" : "Review"}
                </span>
                {i < 2 && <div className="w-8 h-0.5 bg-slate-700" />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === "upload" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Upload className="w-5 h-5 text-accent" />
                      Upload Listing Image
                    </CardTitle>
                    <CardDescription>
                      Drag and drop or click to upload a broker flyer, Facebook post, or any listing image
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragActive 
                          ? "border-accent bg-accent/10" 
                          : imagePreview 
                          ? "border-green-500/50 bg-green-500/5"
                          : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                      }`}
                      data-testid="dropzone-upload"
                    >
                      <input {...getInputProps()} data-testid="input-image-upload" />
                      
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img 
                            src={imagePreview} 
                            alt="Uploaded listing" 
                            className="max-h-64 mx-auto rounded-lg shadow-lg"
                          />
                          <div className="flex items-center justify-center gap-2 text-green-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{uploadedImage?.name}</span>
                          </div>
                          <p className="text-slate-500 text-sm">
                            Click or drag to replace image
                          </p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                          <p className="text-slate-300 mb-2">
                            {isDragActive 
                              ? "Drop the image here..." 
                              : "Drag & drop an image here, or click to select"}
                          </p>
                          <p className="text-slate-500 text-sm">
                            Supports PNG, JPG, GIF, WebP (max 10MB)
                          </p>
                        </>
                      )}
                    </div>

                    {imagePreview && (
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleReset}
                          variant="outline"
                          className="flex-1"
                          data-testid="button-reset-upload"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear
                        </Button>
                        <Button 
                          onClick={handleAnalyze}
                          className="flex-1 bg-accent hover:bg-accent/90"
                          data-testid="button-analyze-image"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze with AI
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === "analyzing" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
                  <CardContent className="py-16 text-center">
                    <Loader2 className="w-16 h-16 mx-auto text-accent animate-spin mb-6" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Analyzing Image with AI...
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Extracting business details, pricing, location, and broker information
                    </p>
                    <Progress value={66} className="w-64 mx-auto" />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {(step === "review" || step === "submitting") && editedData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={
                        extractedData!.confidence >= 0.8 
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : extractedData!.confidence >= 0.6
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }
                    >
                      {Math.round(extractedData!.confidence * 100)}% Confidence
                    </Badge>
                    <span className="text-slate-400 text-sm">
                      Review and edit the extracted data below
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleReset}
                    data-testid="button-start-over"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {imagePreview && (
                    <Card className="border-slate-700 bg-slate-900/50 lg:row-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">Original Image</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img 
                          src={imagePreview} 
                          alt="Listing" 
                          className="w-full rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-slate-700 bg-slate-900/50 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-accent" />
                        Business Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Business Type</Label>
                          <Select 
                            value={editedData.businessType}
                            onValueChange={(v) => updateField("businessType", v)}
                          >
                            <SelectTrigger data-testid="select-business-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BUSINESS_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>External Listing ID</Label>
                          <Input 
                            value={editedData.externalListingId || ""}
                            onChange={(e) => updateField("externalListingId", e.target.value)}
                            placeholder="e.g., 67881"
                            data-testid="input-external-id"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Listing Title</Label>
                        <Input 
                          value={editedData.title}
                          onChange={(e) => updateField("title", e.target.value)}
                          placeholder="e.g., $160K Net Absentee Laundromat in Brooklyn"
                          data-testid="input-title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tagline / Summary</Label>
                        <Textarea 
                          value={editedData.tagline}
                          onChange={(e) => updateField("tagline", e.target.value)}
                          placeholder="Brief description of the business..."
                          rows={2}
                          data-testid="textarea-tagline"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {editedData.features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="bg-slate-700">
                            {feature}
                          </Badge>
                        ))}
                        {editedData.equipmentBrands.map((brand, i) => (
                          <Badge key={`brand-${i}`} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input 
                          value={editedData.city || ""}
                          onChange={(e) => updateField("city", e.target.value)}
                          placeholder="e.g., Brooklyn"
                          data-testid="input-city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State / Region</Label>
                        <Input 
                          value={editedData.region || ""}
                          onChange={(e) => updateField("region", e.target.value)}
                          placeholder="e.g., NY"
                          data-testid="input-region"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input 
                          value={editedData.country}
                          onChange={(e) => updateField("country", e.target.value)}
                          placeholder="e.g., US"
                          data-testid="input-country"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-accent" />
                        Financials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Asking Price</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                          <Input 
                            value={editedData.askingPrice || ""}
                            onChange={(e) => updateField("askingPrice", e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="785000"
                            className="pl-7"
                            data-testid="input-asking-price"
                          />
                        </div>
                        {editedData.askingPrice && (
                          <p className="text-sm text-slate-500">
                            {formatCurrency(editedData.askingPrice)}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Net Income</Label>
                          <Input 
                            value={editedData.netIncome || ""}
                            onChange={(e) => updateField("netIncome", e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="160000"
                            data-testid="input-net-income"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Gross Revenue</Label>
                          <Input 
                            value={editedData.grossRevenue || ""}
                            onChange={(e) => updateField("grossRevenue", e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Optional"
                            data-testid="input-gross-revenue"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <Label>Includes Real Estate</Label>
                          <Switch 
                            checked={editedData.includesRealEstate}
                            onCheckedChange={(v) => updateField("includesRealEstate", v)}
                            data-testid="switch-real-estate"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Owner Financing</Label>
                          <Switch 
                            checked={editedData.ownerFinancing}
                            onCheckedChange={(v) => updateField("ownerFinancing", v)}
                            data-testid="switch-owner-financing"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Absentee Run</Label>
                          <Switch 
                            checked={editedData.absenteeRun}
                            onCheckedChange={(v) => updateField("absenteeRun", v)}
                            data-testid="switch-absentee"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700 bg-slate-900/50 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-accent" />
                        Broker Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Broker Name</Label>
                          <Input 
                            value={editedData.brokerName || ""}
                            onChange={(e) => updateField("brokerName", e.target.value)}
                            placeholder="e.g., Ryan Greene"
                            data-testid="input-broker-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Company</Label>
                          <Input 
                            value={editedData.brokerCompany || ""}
                            onChange={(e) => updateField("brokerCompany", e.target.value)}
                            placeholder="e.g., Hedgestone Business Advisors"
                            data-testid="input-broker-company"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input 
                            value={editedData.brokerPhone || ""}
                            onChange={(e) => updateField("brokerPhone", e.target.value)}
                            placeholder="e.g., 724-503-9139"
                            data-testid="input-broker-phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input 
                            value={editedData.brokerEmail || ""}
                            onChange={(e) => updateField("brokerEmail", e.target.value)}
                            placeholder="e.g., agent@brokerage.com"
                            data-testid="input-broker-email"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-accent/30 bg-accent/5">
                  <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Ready to Create Listing</p>
                          <p className="text-sm text-slate-400">
                            Your listing will be saved as a draft. You can add photos and publish later.
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleSubmit}
                        disabled={step === "submitting" || !editedData.title || !editedData.city}
                        size="lg"
                        className="bg-accent hover:bg-accent/90 min-w-[180px]"
                        data-testid="button-create-listing"
                      >
                        {step === "submitting" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            Create Listing
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm mb-4">
              Works with any business listing image - Facebook posts, broker flyers, screenshots, and more!
            </p>
            <div className="flex justify-center gap-6 text-slate-600 text-xs">
              <span>Laundromats</span>
              <span>•</span>
              <span>Car Washes</span>
              <span>•</span>
              <span>Restaurants</span>
              <span>•</span>
              <span>Dry Cleaners</span>
              <span>•</span>
              <span>& More</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
