import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Image as ImageIcon, Wand2, Palette, Sparkles, Upload, Download,
  Scissors, Layers, Crown, Filter, Maximize, Loader2, X, Info,
  Sun, Snowflake, Camera, Film, Contrast, CloudFog, Clapperboard, Cloud, Aperture, Sunset
} from "lucide-react";

interface ProcessedResult {
  url: string;
  type: string;
  name: string;
}

const FILTERS = [
  { id: "warm", name: "Warm", icon: Sun },
  { id: "cool", name: "Cool", icon: Snowflake },
  { id: "vintage", name: "Vintage", icon: Camera },
  { id: "noir", name: "Noir", icon: Film },
  { id: "vibrant", name: "Vibrant", icon: Contrast },
  { id: "muted", name: "Muted", icon: CloudFog },
  { id: "cinematic", name: "Cinematic", icon: Clapperboard },
  { id: "dreamy", name: "Dreamy", icon: Cloud },
  { id: "hdr", name: "HDR", icon: Aperture },
  { id: "sunset", name: "Sunset", icon: Sunset },
];

const LOGO_STYLES = [
  { id: "modern", name: "Modern" },
  { id: "vintage", name: "Vintage" },
  { id: "playful", name: "Playful" },
  { id: "corporate", name: "Corporate" },
  { id: "tech", name: "Tech" },
  { id: "hand-drawn", name: "Hand-drawn" },
  { id: "luxury", name: "Luxury" },
  { id: "bold", name: "Bold" },
];

export default function AIMediaStudio() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [activeTab, setActiveTab] = useState("background");
  const [logoPrompt, setLogoPrompt] = useState("");
  const [logoStyle, setLogoStyle] = useState("modern");
  const [logoColors, setLogoColors] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editStyle, setEditStyle] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const addResult = (url: string, type: string, name: string) => {
    setResults(prev => [{ url, type, name }, ...prev]);
  };

  const removeBackgroundMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/media-studio/remove-background", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove background");
      }
      return response.json();
    },
    onSuccess: (data) => {
      addResult(data.processedUrl || data.tempUrl, "background-removed", "Background Removed");
      toast({ title: "Background removed successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const editImageMutation = useMutation({
    mutationFn: async ({ file, prompt, style }: { file: File; prompt: string; style?: string }) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("prompt", prompt);
      if (style) formData.append("style", style);
      const response = await fetch("/api/media-studio/edit-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to edit image");
      }
      return response.json();
    },
    onSuccess: (data) => {
      addResult(data.processedUrl || data.tempUrl, "edited", "AI Edited");
      toast({ title: "Image edited successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const applyFilterMutation = useMutation({
    mutationFn: async ({ file, filter }: { file: File; filter: string }) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("filter", filter);
      const response = await fetch("/api/media-studio/apply-filter", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to apply filter");
      }
      return response.json();
    },
    onSuccess: (data) => {
      addResult(data.filteredUrl || data.tempUrl, "filtered", `Filter: ${data.filter}`);
      toast({ title: "Filter applied successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const upscaleMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/media-studio/upscale", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upscale image");
      }
      return response.json();
    },
    onSuccess: (data) => {
      addResult(data.upscaledUrl || data.tempUrl, "upscaled", "Upscaled HD");
      toast({ title: "Image upscaled successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const generateLogoMutation = useMutation({
    mutationFn: async ({ prompt, style, colors }: { prompt: string; style: string; colors?: string }) => {
      const response = await apiRequest("/api/media-studio/generate-logo", {
        method: "POST",
        body: JSON.stringify({ prompt, style, colors, transparent: true }),
        headers: { "Content-Type": "application/json" },
      });
      return response;
    },
    onSuccess: (data) => {
      addResult(data.logoUrl || data.tempUrl, "logo", "Generated Logo");
      toast({ title: "Logo generated successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const isProcessing = removeBackgroundMutation.isPending || editImageMutation.isPending || 
    applyFilterMutation.isPending || upscaleMutation.isPending || generateLogoMutation.isPending;

  return (
    <AuthGuard>
      <SEO 
        title="AI Media Studio | WashBizHub" 
        description="Professional AI-powered image and video editing tools"
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Wand2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">AI Media Studio</h1>
              <p className="text-muted-foreground">
                Professional AI-powered image editing like CapCut, Canva & TikTok
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Image
                  </CardTitle>
                  <CardDescription>
                    Upload an image to apply AI transformations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full max-h-96 object-contain rounded-lg border"
                        data-testid="img-preview"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={clearFile}
                        data-testid="button-clear-image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" data-testid="label-upload-area">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF, WebP up to 50MB
                        </p>
                      </div>
                      <Input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        data-testid="input-file-upload"
                      />
                    </label>
                  )}
                </CardContent>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-tools">
                <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full gap-1">
                  <TabsTrigger value="background" data-testid="tab-background" className="text-xs sm:text-sm">
                    <Scissors className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Background</span>
                    <span className="sm:hidden">BG</span>
                  </TabsTrigger>
                  <TabsTrigger value="edit" data-testid="tab-edit" className="text-xs sm:text-sm">
                    <Wand2 className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">AI Edit</span>
                    <span className="sm:hidden">Edit</span>
                  </TabsTrigger>
                  <TabsTrigger value="filters" data-testid="tab-filters" className="text-xs sm:text-sm">
                    <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger value="upscale" data-testid="tab-upscale" className="text-xs sm:text-sm">
                    <Maximize className="h-4 w-4 mr-1 sm:mr-2" />
                    Upscale
                  </TabsTrigger>
                  <TabsTrigger value="logo" data-testid="tab-logo" className="text-xs sm:text-sm col-span-2 sm:col-span-1">
                    <Crown className="h-4 w-4 mr-1 sm:mr-2" />
                    Logo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="background" className="mt-4" data-testid="content-background">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded font-normal">AI Creative</span>
                        Remove Background
                      </CardTitle>
                      <CardDescription>
                        AI-powered background removal for product photos, portraits, and more
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert data-testid="alert-ai-info" className="border-amber-500/50 bg-amber-500/10">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                          <span className="font-semibold">AI Creative:</span> Uses AI to intelligently isolate and place your subject on white. Results are AI-generated and may vary from the original.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => selectedFile && removeBackgroundMutation.mutate(selectedFile)}
                        disabled={!selectedFile || isProcessing}
                        className="w-full"
                        data-testid="button-remove-background"
                      >
                        {removeBackgroundMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                        ) : (
                          <><Scissors className="h-4 w-4 mr-2" /> Remove Background</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="edit" className="mt-4" data-testid="content-edit">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded font-normal">AI Creative</span>
                        AI Image Editing
                      </CardTitle>
                      <CardDescription>
                        Transform your images with AI-powered artistic interpretations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert data-testid="alert-edit-info" className="border-amber-500/50 bg-amber-500/10">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                          <span className="font-semibold">AI Creative:</span> Generates artistic transformations based on your prompt. Output is an artistic interpretation, not a pixel-perfect edit.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <Label htmlFor="edit-prompt">Edit Prompt</Label>
                        <Input
                          id="edit-prompt"
                          placeholder="Describe the changes you want..."
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          data-testid="input-edit-prompt"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-style">Style (Optional)</Label>
                        <Select value={editStyle} onValueChange={setEditStyle}>
                          <SelectTrigger id="edit-style" data-testid="select-edit-style">
                            <SelectValue placeholder="Select a style..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enhance">Enhance</SelectItem>
                            <SelectItem value="cartoon">Cartoon</SelectItem>
                            <SelectItem value="vintage">Vintage</SelectItem>
                            <SelectItem value="dramatic">Dramatic</SelectItem>
                            <SelectItem value="watercolor">Watercolor</SelectItem>
                            <SelectItem value="oil-painting">Oil Painting</SelectItem>
                            <SelectItem value="pop-art">Pop Art</SelectItem>
                            <SelectItem value="cinematic">Cinematic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => selectedFile && editPrompt && editImageMutation.mutate({ 
                          file: selectedFile, 
                          prompt: editPrompt, 
                          style: editStyle 
                        })}
                        disabled={!selectedFile || !editPrompt || isProcessing}
                        className="w-full"
                        data-testid="button-edit-image"
                      >
                        {editImageMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Editing...</>
                        ) : (
                          <><Sparkles className="h-4 w-4 mr-2" /> Apply AI Edit</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="filters" className="mt-4" data-testid="content-filters">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded font-normal">Guaranteed</span>
                        Photo Filters
                      </CardTitle>
                      <CardDescription>
                        Deterministic color grading - your pixels preserved exactly
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert data-testid="alert-filter-info" className="border-green-500/50 bg-green-500/10">
                        <Filter className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700 dark:text-green-300">
                          <span className="font-semibold">Guaranteed Edit:</span> Deterministic color grading using Sharp. Your original pixels are preserved exactly - only colors change.
                        </AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 flex-wrap">
                        {FILTERS.map((filter) => {
                          const IconComponent = filter.icon;
                          return (
                            <Button
                              key={filter.id}
                              variant={selectedFilter === filter.id ? "default" : "outline"}
                              className="flex flex-col h-auto py-3"
                              onClick={() => setSelectedFilter(filter.id)}
                              data-testid={`button-filter-${filter.id}`}
                            >
                              <IconComponent className="h-5 w-5" />
                              <span className="text-xs mt-1">{filter.name}</span>
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        onClick={() => selectedFile && selectedFilter && applyFilterMutation.mutate({ 
                          file: selectedFile, 
                          filter: selectedFilter 
                        })}
                        disabled={!selectedFile || !selectedFilter || isProcessing}
                        className="w-full"
                        data-testid="button-apply-filter"
                      >
                        {applyFilterMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Applying...</>
                        ) : (
                          <><Palette className="h-4 w-4 mr-2" /> Apply Filter</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="upscale" className="mt-4" data-testid="content-upscale">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded font-normal">Guaranteed</span>
                        HD Upscale
                      </CardTitle>
                      <CardDescription>
                        Enhance image resolution with pixel-perfect Lanczos3 upscaling
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert data-testid="alert-upscale-info" className="border-green-500/50 bg-green-500/10">
                        <Maximize className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700 dark:text-green-300">
                          <span className="font-semibold">Guaranteed Edit:</span> Lanczos3 upscaling with sharpening. Pixel-perfect 2x enlargement - your original content preserved exactly.
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => selectedFile && upscaleMutation.mutate(selectedFile)}
                        disabled={!selectedFile || isProcessing}
                        className="w-full"
                        data-testid="button-upscale"
                      >
                        {upscaleMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Upscaling...</>
                        ) : (
                          <><Maximize className="h-4 w-4 mr-2" /> Upscale to HD</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="logo" className="mt-4" data-testid="content-logo">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded font-normal">AI Creative</span>
                        AI Logo Generator
                      </CardTitle>
                      <CardDescription>
                        Generate professional logos with AI - review carefully before commercial use
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert data-testid="alert-logo-info" className="border-amber-500/50 bg-amber-500/10">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                          <span className="font-semibold">AI Creative:</span> Generates unique logo concepts. Results should be reviewed and refined before commercial use.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <Label htmlFor="logo-prompt">Logo Description</Label>
                        <Input
                          id="logo-prompt"
                          placeholder="Describe your logo (e.g., 'modern laundromat logo with water droplet')"
                          value={logoPrompt}
                          onChange={(e) => setLogoPrompt(e.target.value)}
                          data-testid="input-logo-prompt"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="logo-style">Style</Label>
                          <Select value={logoStyle} onValueChange={setLogoStyle}>
                            <SelectTrigger id="logo-style" data-testid="select-logo-style">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LOGO_STYLES.map((style) => (
                                <SelectItem key={style.id} value={style.id}>
                                  {style.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="logo-colors">Colors (Optional)</Label>
                          <Input
                            id="logo-colors"
                            placeholder="e.g., blue and gold"
                            value={logoColors}
                            onChange={(e) => setLogoColors(e.target.value)}
                            data-testid="input-logo-colors"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => logoPrompt && generateLogoMutation.mutate({ 
                          prompt: logoPrompt, 
                          style: logoStyle, 
                          colors: logoColors 
                        })}
                        disabled={!logoPrompt || isProcessing}
                        className="w-full"
                        data-testid="button-generate-logo"
                      >
                        {generateLogoMutation.isPending ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                        ) : (
                          <><Crown className="h-4 w-4 mr-2" /> Generate Logo</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Results
                  </CardTitle>
                  <CardDescription>
                    Your processed images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {results.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground" data-testid="text-no-results">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No results yet</p>
                      <p className="text-sm">Process an image to see results here</p>
                    </div>
                  ) : (
                    <div className="space-y-4" data-testid="list-results">
                      {results.map((result, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden" data-testid={`card-result-${index}`}>
                          <img 
                            src={result.url} 
                            alt={result.name}
                            className="w-full h-32 object-cover"
                            data-testid={`img-result-${index}`}
                          />
                          <div className="p-3 flex items-center justify-between gap-2">
                            <span className="text-sm font-medium truncate" data-testid={`text-result-name-${index}`}>{result.name}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              data-testid={`button-download-${index}`}
                            >
                              <a href={result.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
