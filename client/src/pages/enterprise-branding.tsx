import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Paintbrush,
  Globe,
  Mail,
  Palette,
  Image,
  Eye,
  Save,
  RefreshCw,
  Check,
  ExternalLink,
  Upload,
  Building2,
  Type,
  Layout,
  Smartphone,
  Moon,
  Sun
} from "lucide-react";

interface BrandingConfig {
  id?: string;
  distributorId?: string;
  logoUrl?: string;
  logoUrlDark?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontPrimary?: string;
  fontSecondary?: string;
  headerText?: string;
  footerText?: string;
  supportEmail?: string;
  supportPhone?: string;
  customCss?: string;
  metaTitle?: string;
  metaDescription?: string;
  socialPreviewImage?: string;
}

const defaultBranding: BrandingConfig = {
  primaryColor: "#1e40af",
  secondaryColor: "#3b82f6",
  accentColor: "#f59e0b",
  fontPrimary: "Inter",
  fontSecondary: "Inter",
  headerText: "Distributor Command Center",
  footerText: "© 2025 Your Company. All rights reserved.",
  supportEmail: "support@yourcompany.com",
  supportPhone: "(555) 123-4567",
  metaTitle: "Fleet Management Dashboard",
  metaDescription: "Monitor and manage your commercial laundry equipment fleet in real-time."
};

export default function EnterpriseBranding() {
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('colors');
  
  const [, params] = useRoute('/enterprise-branding/:distributorId');
  const distributorId = params?.distributorId || sessionStorage.getItem('distributorId') || null;

  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: savedBranding, isLoading } = useQuery<BrandingConfig>({
    queryKey: ['/api/enterprise/branding', distributorId],
    enabled: !!distributorId,
  });

  useEffect(() => {
    if (savedBranding && !isInitialized) {
      setBranding({
        ...defaultBranding,
        ...savedBranding,
      });
      setIsInitialized(true);
    }
  }, [savedBranding, isInitialized]);

  const saveBrandingMutation = useMutation({
    mutationFn: async (data: BrandingConfig) => {
      return apiRequest(`/api/enterprise/branding/${distributorId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Branding saved",
        description: "Your branding settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/branding', distributorId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving branding",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveBrandingMutation.mutate(branding);
  };

  const handleChange = (field: keyof BrandingConfig, value: string | boolean) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  const colorPresets = [
    { name: "Corporate Blue", primary: "#1e40af", secondary: "#3b82f6", accent: "#f59e0b" },
    { name: "Forest Green", primary: "#15803d", secondary: "#22c55e", accent: "#a855f7" },
    { name: "Deep Purple", primary: "#7c3aed", secondary: "#a78bfa", accent: "#f472b6" },
    { name: "Ocean Teal", primary: "#0d9488", secondary: "#2dd4bf", accent: "#fb923c" },
    { name: "Slate Modern", primary: "#334155", secondary: "#64748b", accent: "#06b6d4" },
    { name: "Red Energy", primary: "#dc2626", secondary: "#f87171", accent: "#fbbf24" },
  ];

  const fontOptions = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Poppins",
    "Montserrat",
    "Source Sans Pro",
    "Nunito",
    "Raleway",
    "Ubuntu"
  ];

  return (
    <>
      <SEO 
        title="White-Label Branding | Enterprise Settings | WashBizHub"
        description="Customize your white-label platform with your brand colors, logo, and styling."
        keywords="white label branding, custom branding, enterprise customization"
        ogType="website"
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" data-testid="badge-branding">
                    <Paintbrush className="w-3 h-3 mr-1" />
                    White-Label Settings
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold" data-testid="text-branding-title">Brand Customization</h1>
                <p className="text-muted-foreground mt-1">
                  Configure how your platform looks to your customers
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" data-testid="button-preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saveBrandingMutation.isPending}
                  data-testid="button-save-branding"
                >
                  {saveBrandingMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="colors" className="gap-2" data-testid="tab-colors">
                    <Palette className="w-4 h-4" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="logo" className="gap-2" data-testid="tab-logo">
                    <Image className="w-4 h-4" />
                    Logo
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="gap-2" data-testid="tab-typography">
                    <Type className="w-4 h-4" />
                    Typography
                  </TabsTrigger>
                  <TabsTrigger value="content" className="gap-2" data-testid="tab-content">
                    <Layout className="w-4 h-4" />
                    Content
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Color Presets</CardTitle>
                      <CardDescription>Quick-start with a professionally designed color palette</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {colorPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleChange('primaryColor', preset.primary);
                              handleChange('secondaryColor', preset.secondary);
                              handleChange('accentColor', preset.accent);
                            }}
                            className="p-3 rounded-lg border hover:border-primary transition-colors text-left"
                            data-testid={`button-preset-${idx}`}
                          >
                            <div className="flex gap-1 mb-2">
                              <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primary }} />
                              <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondary }} />
                              <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accent }} />
                            </div>
                            <span className="text-sm font-medium">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Colors</CardTitle>
                      <CardDescription>Fine-tune your exact brand colors</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <div className="flex gap-2">
                            <div 
                              className="w-10 h-10 rounded border cursor-pointer" 
                              style={{ backgroundColor: branding.primaryColor }}
                            />
                            <Input 
                              id="primaryColor"
                              type="text"
                              value={branding.primaryColor}
                              onChange={(e) => handleChange('primaryColor', e.target.value)}
                              placeholder="#1e40af"
                              data-testid="input-primary-color"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Buttons, links, headers</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="secondaryColor">Secondary Color</Label>
                          <div className="flex gap-2">
                            <div 
                              className="w-10 h-10 rounded border cursor-pointer" 
                              style={{ backgroundColor: branding.secondaryColor }}
                            />
                            <Input 
                              id="secondaryColor"
                              type="text"
                              value={branding.secondaryColor}
                              onChange={(e) => handleChange('secondaryColor', e.target.value)}
                              placeholder="#3b82f6"
                              data-testid="input-secondary-color"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Secondary buttons, badges</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="accentColor">Accent Color</Label>
                          <div className="flex gap-2">
                            <div 
                              className="w-10 h-10 rounded border cursor-pointer" 
                              style={{ backgroundColor: branding.accentColor }}
                            />
                            <Input 
                              id="accentColor"
                              type="text"
                              value={branding.accentColor}
                              onChange={(e) => handleChange('accentColor', e.target.value)}
                              placeholder="#f59e0b"
                              data-testid="input-accent-color"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Highlights, notifications</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="logo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Logo Assets</CardTitle>
                      <CardDescription>Upload your company logos for light and dark modes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label>Light Mode Logo</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center bg-white">
                            {branding.logoUrl ? (
                              <img 
                                src={branding.logoUrl} 
                                alt="Logo preview" 
                                className="max-h-16 mx-auto"
                              />
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Drop logo here or click to upload</p>
                                <p className="text-xs text-muted-foreground">Recommended: 200x50px PNG with transparent background</p>
                              </div>
                            )}
                          </div>
                          <Input 
                            type="text"
                            value={branding.logoUrl || ''}
                            onChange={(e) => handleChange('logoUrl', e.target.value)}
                            placeholder="https://example.com/logo.png"
                            data-testid="input-logo-url"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Dark Mode Logo</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-900">
                            {branding.logoUrlDark ? (
                              <img 
                                src={branding.logoUrlDark} 
                                alt="Dark logo preview" 
                                className="max-h-16 mx-auto"
                              />
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-400">Drop logo here or click to upload</p>
                                <p className="text-xs text-gray-500">Use light-colored logo for dark backgrounds</p>
                              </div>
                            )}
                          </div>
                          <Input 
                            type="text"
                            value={branding.logoUrlDark || ''}
                            onChange={(e) => handleChange('logoUrlDark', e.target.value)}
                            placeholder="https://example.com/logo-dark.png"
                            data-testid="input-logo-url-dark"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Favicon</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-muted">
                            {branding.faviconUrl ? (
                              <img src={branding.faviconUrl} alt="Favicon" className="w-8 h-8" />
                            ) : (
                              <Building2 className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Input 
                              type="text"
                              value={branding.faviconUrl || ''}
                              onChange={(e) => handleChange('faviconUrl', e.target.value)}
                              placeholder="https://example.com/favicon.ico"
                              data-testid="input-favicon-url"
                            />
                            <p className="text-xs text-muted-foreground mt-1">32x32px ICO or PNG recommended</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="typography" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Font Settings</CardTitle>
                      <CardDescription>Choose fonts that match your brand identity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fontPrimary">Primary Font (Headings)</Label>
                          <select
                            id="fontPrimary"
                            value={branding.fontPrimary}
                            onChange={(e) => handleChange('fontPrimary', e.target.value)}
                            className="w-full h-10 px-3 rounded-md border bg-background"
                            data-testid="select-font-primary"
                          >
                            {fontOptions.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                          <p className="text-2xl mt-2" style={{ fontFamily: branding.fontPrimary }}>
                            Heading Preview
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fontSecondary">Secondary Font (Body)</Label>
                          <select
                            id="fontSecondary"
                            value={branding.fontSecondary}
                            onChange={(e) => handleChange('fontSecondary', e.target.value)}
                            className="w-full h-10 px-3 rounded-md border bg-background"
                            data-testid="select-font-secondary"
                          >
                            {fontOptions.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                          <p className="mt-2" style={{ fontFamily: branding.fontSecondary }}>
                            Body text preview. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Header & Footer</CardTitle>
                      <CardDescription>Customize the text displayed in your platform</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="headerText">Header Title</Label>
                        <Input 
                          id="headerText"
                          value={branding.headerText || ''}
                          onChange={(e) => handleChange('headerText', e.target.value)}
                          placeholder="Your Company Dashboard"
                          data-testid="input-header-text"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="footerText">Footer Text</Label>
                        <Input 
                          id="footerText"
                          value={branding.footerText || ''}
                          onChange={(e) => handleChange('footerText', e.target.value)}
                          placeholder="© 2025 Your Company. All rights reserved."
                          data-testid="input-footer-text"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="supportEmail">Support Email</Label>
                          <Input 
                            id="supportEmail"
                            type="email"
                            value={branding.supportEmail || ''}
                            onChange={(e) => handleChange('supportEmail', e.target.value)}
                            placeholder="support@yourcompany.com"
                            data-testid="input-support-email"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="supportPhone">Support Phone</Label>
                          <Input 
                            id="supportPhone"
                            type="tel"
                            value={branding.supportPhone || ''}
                            onChange={(e) => handleChange('supportPhone', e.target.value)}
                            placeholder="(555) 123-4567"
                            data-testid="input-support-phone"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>SEO & Meta</CardTitle>
                      <CardDescription>Configure search engine and social sharing settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="metaTitle">Page Title</Label>
                        <Input 
                          id="metaTitle"
                          value={branding.metaTitle || ''}
                          onChange={(e) => handleChange('metaTitle', e.target.value)}
                          placeholder="Fleet Management Dashboard | Your Company"
                          data-testid="input-meta-title"
                        />
                        <p className="text-xs text-muted-foreground">Appears in browser tab and search results</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea 
                          id="metaDescription"
                          value={branding.metaDescription || ''}
                          onChange={(e) => handleChange('metaDescription', e.target.value)}
                          placeholder="Monitor and manage your commercial laundry equipment fleet in real-time."
                          rows={3}
                          data-testid="input-meta-description"
                        />
                        <p className="text-xs text-muted-foreground">Shown in search engine results (max 160 characters)</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="socialPreviewImage">Social Preview Image</Label>
                        <Input 
                          id="socialPreviewImage"
                          value={branding.socialPreviewImage || ''}
                          onChange={(e) => handleChange('socialPreviewImage', e.target.value)}
                          placeholder="https://example.com/og-image.png"
                          data-testid="input-social-preview"
                        />
                        <p className="text-xs text-muted-foreground">Displayed when sharing on social media (1200x630px recommended)</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Custom CSS</CardTitle>
                      <CardDescription>Advanced styling for developers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        value={branding.customCss || ''}
                        onChange={(e) => handleChange('customCss', e.target.value)}
                        placeholder={`/* Custom styles */\n.header {\n  /* your styles */\n}`}
                        rows={8}
                        className="font-mono text-sm"
                        data-testid="input-custom-css"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        CSS will be injected after default styles. Use with caution.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Live Preview</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={previewMode === 'light' ? 'default' : 'ghost'} 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewMode('light')}
                        data-testid="button-preview-light"
                      >
                        <Sun className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant={previewMode === 'dark' ? 'default' : 'ghost'} 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewMode('dark')}
                        data-testid="button-preview-dark"
                      >
                        <Moon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`rounded-lg overflow-hidden border ${previewMode === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
                    style={{ fontFamily: branding.fontSecondary }}
                  >
                    <div 
                      className="p-3 flex items-center justify-between"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <span className="text-white font-semibold text-sm" style={{ fontFamily: branding.fontPrimary }}>
                        {branding.headerText || 'Dashboard'}
                      </span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                      </div>
                    </div>

                    <div className={`p-4 space-y-3 ${previewMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex gap-2">
                        <div 
                          className="px-3 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: branding.primaryColor }}
                        >
                          Primary
                        </div>
                        <div 
                          className="px-3 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: branding.secondaryColor }}
                        >
                          Secondary
                        </div>
                        <div 
                          className="px-3 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: branding.accentColor }}
                        >
                          Accent
                        </div>
                      </div>

                      <div className={`p-3 rounded ${previewMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <h4 className="font-semibold text-sm mb-1" style={{ fontFamily: branding.fontPrimary }}>
                          Fleet Status
                        </h4>
                        <p className={`text-xs ${previewMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          247 machines online
                        </p>
                      </div>

                      <button 
                        className="w-full py-2 rounded text-sm text-white font-medium"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        View Dashboard
                      </button>
                    </div>

                    <div className={`p-2 text-center text-xs ${previewMode === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                      {branding.footerText || 'Footer text'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Domain Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Custom Domain</p>
                      <p className="text-xs text-muted-foreground">fleet.yourcompany.com</p>
                    </div>
                    <Badge variant="secondary">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">SSL Certificate</p>
                      <p className="text-xs text-muted-foreground">Auto-renewed</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Secure
                    </Badge>
                  </div>

                  <Button variant="outline" className="w-full" size="sm" data-testid="button-manage-domain">
                    <Globe className="w-4 h-4 mr-2" />
                    Manage Domain
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
