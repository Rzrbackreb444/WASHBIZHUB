import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DroppableCanvas, Block } from "@/components/website-builder/DroppableCanvas";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, Plus, Layout, Palette, Bot, Image as ImageIcon, Video, FileText,
  Settings, Save, ExternalLink, Upload, Trash2, Edit, Building2, Layers,
  Phone, Mail, MapPin, Clock, Facebook, Instagram, Star, Sparkles,
  MessageSquare, Zap, Shield, Link2, Eye, EyeOff, ChevronRight,
  Loader2, WashingMachine, ShoppingBag, Truck, PenTool, Play, Monitor,
  Search, FileCode, Send, Users, BarChart3, Target, Gift, CheckCircle
} from "lucide-react";

interface BusinessProfile {
  id: string;
  businessName: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  businessHours: any;
  timezone: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  googleMapsUrl: string | null;
  yelpUrl: string | null;
  services: any[];
  pricingMode: string;
  pricePerPound: string;
  minimumWeight: number;
  rushSurcharge: number;
  flatRatePrices: any;
  pickupDeliveryFee: string;
}

interface AiAgentConfig {
  id: string;
  name: string;
  personality: string;
  avatarUrl: string | null;
  welcomeMessage: string;
  awayMessage: string;
  canTakeOrders: boolean;
  canSchedulePickups: boolean;
  canAnswerPricing: boolean;
  canProvideFaq: boolean;
  commonQuestions: any[];
  primaryColor: string;
  position: string;
  isEnabled: boolean;
}

interface ServiceCard {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  price: string | null;
  pricingNote: string | null;
  ctaText: string;
  ctaLink: string | null;
  order: number;
  isHighlighted: boolean;
  isFeatured: boolean;
}

interface WebsiteVideo {
  id: string;
  title: string;
  description: string | null;
  videoType: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  isPublished: boolean;
}

interface Integration {
  id: string;
  integrationType: string;
  integrationName: string | null;
  isConnected: boolean;
  externalAccountName: string | null;
  lastSyncedAt: string | null;
}

interface SiteProject {
  id: string;
  name: string;
  slug: string;
  status: string;
  templateId: string | null;
  createdAt: string;
}

const BLOCK_TYPES = [
  { type: 'hero', name: 'Hero Section', icon: Monitor, description: 'Large header with headline and CTA' },
  { type: 'features', name: 'Features Grid', icon: Layers, description: '3-column feature highlights' },
  { type: 'testimonials', name: 'Testimonials', icon: Star, description: 'Customer reviews and quotes' },
  { type: 'cta', name: 'Call to Action', icon: Zap, description: 'Conversion-focused section' },
  { type: 'gallery', name: 'Image Gallery', icon: ImageIcon, description: 'Photo grid of your business' },
  { type: 'text', name: 'Text Block', icon: FileText, description: 'Rich text content area' },
];

const FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Playfair Display'
];

const PERSONALITY_OPTIONS = [
  { value: 'friendly', label: 'Friendly & Casual' },
  { value: 'professional', label: 'Professional & Formal' },
  { value: 'helpful', label: 'Helpful & Informative' },
  { value: 'enthusiastic', label: 'Enthusiastic & Upbeat' },
];

export default function WebsiteBuilder() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pages");
  const [isUploading, setIsUploading] = useState(false);
  const [editingCard, setEditingCard] = useState<ServiceCard | null>(null);
  const [newCardDialogOpen, setNewCardDialogOpen] = useState(false);
  const [addBlockDialogOpen, setAddBlockDialogOpen] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);

  const { data: profile, isLoading: profileLoading } = useQuery<BusinessProfile | null>({
    queryKey: ['/api/whitelabel/business-profile'],
  });

  const { data: aiAgent, isLoading: agentLoading } = useQuery<AiAgentConfig | null>({
    queryKey: ['/api/whitelabel/ai-agent'],
  });

  const { data: serviceCards = [], isLoading: cardsLoading } = useQuery<ServiceCard[]>({
    queryKey: ['/api/whitelabel/service-cards'],
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery<WebsiteVideo[]>({
    queryKey: ['/api/whitelabel/videos'],
  });

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery<Integration[]>({
    queryKey: ['/api/whitelabel/integrations'],
  });

  const [profileForm, setProfileForm] = useState<Partial<BusinessProfile>>({
    businessName: '',
    tagline: '',
    description: '',
    primaryColor: '#C8A661',
    secondaryColor: '#1a2332',
    accentColor: '#ffffff',
    fontFamily: 'Inter',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    timezone: 'America/New_York',
    facebookUrl: '',
    instagramUrl: '',
    googleMapsUrl: '',
    yelpUrl: '',
    pricingMode: 'per_pound',
    pricePerPound: '1.75',
    minimumWeight: 10,
    rushSurcharge: 50,
  });

  const [agentForm, setAgentForm] = useState<Partial<AiAgentConfig>>({
    name: 'Store Assistant',
    personality: 'friendly',
    welcomeMessage: 'Hi! How can I help you today?',
    awayMessage: "We're currently closed. Leave a message and we'll get back to you!",
    canTakeOrders: false,
    canSchedulePickups: false,
    canAnswerPricing: true,
    canProvideFaq: true,
    primaryColor: '#C8A661',
    position: 'bottom-right',
    isEnabled: true,
  });

  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    price: '',
    pricingNote: '',
    ctaText: 'Learn More',
    isHighlighted: false,
    isFeatured: false,
    order: 0,
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: Partial<BusinessProfile>) => {
      const response = await apiRequest('POST', '/api/whitelabel/business-profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whitelabel/business-profile'] });
      toast({ title: "Profile Saved!", description: "Your business profile has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    },
  });

  const saveAgentMutation = useMutation({
    mutationFn: async (data: Partial<AiAgentConfig>) => {
      const response = await apiRequest('POST', '/api/whitelabel/ai-agent', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whitelabel/ai-agent'] });
      toast({ title: "AI Agent Saved!", description: "Your chatbot settings have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    },
  });

  const createCardMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/whitelabel/service-cards', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whitelabel/service-cards'] });
      toast({ title: "Service Card Created!", description: "Your new service card is live." });
      setNewCardDialogOpen(false);
      setNewCard({ title: '', description: '', price: '', pricingNote: '', ctaText: 'Learn More', isHighlighted: false, isFeatured: false, order: 0 });
    },
    onError: (error: Error) => {
      toast({ title: "Create Failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/whitelabel/service-cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whitelabel/service-cards'] });
      toast({ title: "Deleted", description: "Service card removed." });
    },
  });

  const handleFileUpload = async (file: File, category: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      const response = await fetch('/api/whitelabel/upload-asset', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      
      toast({ title: "Upload Complete!", description: `${file.name} has been uploaded.` });
      return result.url;
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = await handleFileUpload(file, 'logos');
    if (url) {
      setProfileForm(prev => ({ ...prev, logoUrl: url }));
    }
  };

  const handleBlocksChange = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
  };

  const handleAISuggest = () => {
    toast({ title: "AI Suggestions", description: "Generating layout suggestions based on your business..." });
  };

  return (
    <>
      <SEO
        title="Website Builder - Build Your Laundromat Website"
        description="Create a professional laundromat website with drag-and-drop page building, custom branding, AI chatbot, and integrated marketing tools."
        canonicalUrl="/website-builder"
        keywords={["laundromat website builder", "white-label website", "business website creator", "AI chatbot builder"]}
      />

      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <Breadcrumb items={[{ name: "Website Builder", url: "/website-builder" }]} />
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
                  <Globe className="w-3 h-3 mr-1" />
                  Website Builder
                </Badge>
                <h1 className="text-3xl font-bold text-white">Build Your Website</h1>
                <p className="text-white/70">Drag-and-drop pages, branding, AI chatbot, and more</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-primary/30" data-testid="button-preview-site">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button className="bg-primary" data-testid="button-publish-site">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card/50 backdrop-blur-sm border border-primary/20 p-1 flex-wrap h-auto gap-1">
              <TabsTrigger value="pages" className="gap-2" data-testid="tab-pages">
                <Layout className="w-4 h-4" />
                Page Builder
              </TabsTrigger>
              <TabsTrigger value="branding" className="gap-2" data-testid="tab-branding">
                <Palette className="w-4 h-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2" data-testid="tab-services">
                <Layers className="w-4 h-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="ai-agent" className="gap-2" data-testid="tab-ai-agent">
                <Bot className="w-4 h-4" />
                AI Chatbot
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2" data-testid="tab-media">
                <Video className="w-4 h-4" />
                Media
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2" data-testid="tab-integrations">
                <Link2 className="w-4 h-4" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2" data-testid="tab-seo">
                <Search className="w-4 h-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2" data-testid="tab-email">
                <Send className="w-4 h-4" />
                Email Marketing
              </TabsTrigger>
            </TabsList>

            {/* PAGE BUILDER TAB */}
            <TabsContent value="pages" className="space-y-6">
              <div className="grid lg:grid-cols-4 gap-6">
                {/* Block Palette */}
                <div className="space-y-4">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" />
                        Add Blocks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {BLOCK_TYPES.map((blockType) => (
                        <Button
                          key={blockType.type}
                          variant="outline"
                          className="w-full justify-start h-auto py-3 border-border/50 hover-elevate"
                          data-testid={`button-add-${blockType.type}`}
                        >
                          <blockType.icon className="w-4 h-4 mr-3 text-primary" />
                          <div className="text-left">
                            <p className="font-medium text-sm">{blockType.name}</p>
                            <p className="text-xs text-muted-foreground">{blockType.description}</p>
                          </div>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Assist
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        className="w-full border-primary/30"
                        onClick={handleAISuggest}
                        data-testid="button-ai-generate"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Layout
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        AI will create a complete page based on your business
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-3">
                  <DroppableCanvas
                    projectId="default"
                    onBlocksChange={handleBlocksChange}
                    onAISuggest={handleAISuggest}
                  />
                </div>
              </div>
            </TabsContent>

            {/* BRANDING TAB */}
            <TabsContent value="branding" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Business Information
                      </CardTitle>
                      <CardDescription>Your business name and core details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Business Name *</Label>
                          <Input
                            value={profileForm.businessName || profile?.businessName || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, businessName: e.target.value }))}
                            placeholder="Sunshine Laundromat"
                            data-testid="input-business-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tagline</Label>
                          <Input
                            value={profileForm.tagline || profile?.tagline || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, tagline: e.target.value }))}
                            placeholder="Fresh & Clean Since 1995"
                            data-testid="input-tagline"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={profileForm.description || profile?.description || ''}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Tell customers about your laundromat..."
                          rows={3}
                          data-testid="input-description"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Contact & Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</Label>
                          <Input
                            value={profileForm.phone || profile?.phone || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="(555) 123-4567"
                            data-testid="input-phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Mail className="w-3 h-3" /> Email</Label>
                          <Input
                            type="email"
                            value={profileForm.email || profile?.email || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="hello@mylaundromat.com"
                            data-testid="input-email"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Street Address</Label>
                        <Input
                          value={profileForm.address || profile?.address || ''}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="123 Main Street"
                          data-testid="input-address"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={profileForm.city || profile?.city || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Springfield"
                            data-testid="input-city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input
                            value={profileForm.state || profile?.state || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="IL"
                            data-testid="input-state"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP Code</Label>
                          <Input
                            value={profileForm.zipCode || profile?.zipCode || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, zipCode: e.target.value }))}
                            placeholder="62701"
                            data-testid="input-zip"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Country</Label>
                          <Input
                            value={profileForm.country || profile?.country || 'USA'}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                            data-testid="input-country"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Brand Colors & Typography
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Primary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={profileForm.primaryColor || profile?.primaryColor || '#C8A661'}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                              className="w-14 h-10 p-1"
                              data-testid="input-primary-color"
                            />
                            <Input
                              value={profileForm.primaryColor || profile?.primaryColor || '#C8A661'}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Secondary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={profileForm.secondaryColor || profile?.secondaryColor || '#1a2332'}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                              className="w-14 h-10 p-1"
                              data-testid="input-secondary-color"
                            />
                            <Input
                              value={profileForm.secondaryColor || profile?.secondaryColor || '#1a2332'}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Accent Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={profileForm.accentColor || profile?.accentColor || '#ffffff'}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, accentColor: e.target.value }))}
                              className="w-14 h-10 p-1"
                              data-testid="input-accent-color"
                            />
                            <Input
                              value={profileForm.accentColor || profile?.accentColor || '#ffffff'}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, accentColor: e.target.value }))}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select
                          value={profileForm.fontFamily || profile?.fontFamily || 'Inter'}
                          onValueChange={(value) => setProfileForm(prev => ({ ...prev, fontFamily: value }))}
                        >
                          <SelectTrigger data-testid="select-font">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONTS.map(font => (
                              <SelectItem key={font} value={font}>{font}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Social Media Links
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Facebook className="w-3 h-3" /> Facebook</Label>
                          <Input
                            value={profileForm.facebookUrl || profile?.facebookUrl || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, facebookUrl: e.target.value }))}
                            placeholder="https://facebook.com/mylaundromat"
                            data-testid="input-facebook"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Instagram className="w-3 h-3" /> Instagram</Label>
                          <Input
                            value={profileForm.instagramUrl || profile?.instagramUrl || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, instagramUrl: e.target.value }))}
                            placeholder="https://instagram.com/mylaundromat"
                            data-testid="input-instagram"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Google Maps</Label>
                          <Input
                            value={profileForm.googleMapsUrl || profile?.googleMapsUrl || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                            placeholder="https://maps.google.com/..."
                            data-testid="input-google-maps"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Star className="w-3 h-3" /> Yelp</Label>
                          <Input
                            value={profileForm.yelpUrl || profile?.yelpUrl || ''}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, yelpUrl: e.target.value }))}
                            placeholder="https://yelp.com/biz/mylaundromat"
                            data-testid="input-yelp"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        Logo & Favicon
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Business Logo</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                          {(profileForm.logoUrl || profile?.logoUrl) ? (
                            <div className="relative">
                              <img
                                src={profileForm.logoUrl || profile?.logoUrl || ''}
                                alt="Logo"
                                className="max-h-32 mx-auto rounded"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => setProfileForm(prev => ({ ...prev, logoUrl: null }))}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mb-2">
                                Drop your logo here or click to upload
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => document.getElementById('logo-upload')?.click()}
                                disabled={isUploading}
                                data-testid="button-upload-logo"
                              >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                Upload Logo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => saveProfileMutation.mutate({ ...profile, ...profileForm })}
                        disabled={saveProfileMutation.isPending}
                        data-testid="button-save-branding"
                      >
                        {saveProfileMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Branding
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Live Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="rounded-lg p-4 text-center"
                        style={{
                          backgroundColor: profileForm.secondaryColor || profile?.secondaryColor || '#1a2332',
                          fontFamily: profileForm.fontFamily || profile?.fontFamily || 'Inter',
                        }}
                      >
                        {(profileForm.logoUrl || profile?.logoUrl) && (
                          <img
                            src={profileForm.logoUrl || profile?.logoUrl || ''}
                            alt="Logo preview"
                            className="max-h-16 mx-auto mb-2"
                          />
                        )}
                        <h3
                          className="text-xl font-bold mb-1"
                          style={{ color: profileForm.primaryColor || profile?.primaryColor || '#C8A661' }}
                        >
                          {profileForm.businessName || profile?.businessName || 'Your Business Name'}
                        </h3>
                        <p
                          className="text-sm opacity-80"
                          style={{ color: profileForm.accentColor || profile?.accentColor || '#ffffff' }}
                        >
                          {profileForm.tagline || profile?.tagline || 'Your tagline here'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* SERVICES TAB */}
            <TabsContent value="services" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Service Cards</h2>
                  <p className="text-white/70">Showcase your services on your website</p>
                </div>
                <Dialog open={newCardDialogOpen} onOpenChange={setNewCardDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-service">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Service</DialogTitle>
                      <DialogDescription>Create a service card for your website</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Service Title *</Label>
                        <Input
                          value={newCard.title}
                          onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Wash & Fold"
                          data-testid="input-card-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newCard.description}
                          onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Professional wash, dry, and fold service..."
                          data-testid="input-card-description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price</Label>
                          <Input
                            value={newCard.price}
                            onChange={(e) => setNewCard(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="$1.75/lb"
                            data-testid="input-card-price"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CTA Text</Label>
                          <Input
                            value={newCard.ctaText}
                            onChange={(e) => setNewCard(prev => ({ ...prev, ctaText: e.target.value }))}
                            placeholder="Learn More"
                            data-testid="input-card-cta"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newCard.isHighlighted}
                            onCheckedChange={(checked) => setNewCard(prev => ({ ...prev, isHighlighted: checked }))}
                            data-testid="switch-highlighted"
                          />
                          <Label>Highlighted</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newCard.isFeatured}
                            onCheckedChange={(checked) => setNewCard(prev => ({ ...prev, isFeatured: checked }))}
                            data-testid="switch-featured"
                          />
                          <Label>Featured</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => createCardMutation.mutate(newCard)}
                        disabled={!newCard.title || createCardMutation.isPending}
                        data-testid="button-create-card"
                      >
                        {createCardMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Service'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {cardsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
              ) : serviceCards.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20 border-dashed">
                  <CardContent className="py-12 text-center">
                    <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Service Cards Yet</h3>
                    <p className="text-muted-foreground mb-4">Add your first service to showcase on your website</p>
                    <Button onClick={() => setNewCardDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Service
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceCards.map((card) => (
                    <Card key={card.id} className="bg-card/50 backdrop-blur-sm border-primary/20 relative group" data-testid={`service-card-${card.id}`}>
                      {card.isHighlighted && (
                        <Badge className="absolute -top-2 -right-2 bg-primary">Featured</Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {card.title}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={() => setEditingCard(card)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => deleteCardMutation.mutate(card.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                        {card.price && (
                          <Badge variant="secondary">{card.price}</Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{card.description || 'No description'}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          {card.ctaText}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* AI CHATBOT TAB */}
            <TabsContent value="ai-agent" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        AI Store Assistant
                      </CardTitle>
                      <CardDescription>Configure your AI-powered chatbot for customer service</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Bot className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Enable AI Chatbot</p>
                            <p className="text-sm text-muted-foreground">Show chatbot on your website</p>
                          </div>
                        </div>
                        <Switch
                          checked={agentForm.isEnabled ?? aiAgent?.isEnabled ?? true}
                          onCheckedChange={(checked) => setAgentForm(prev => ({ ...prev, isEnabled: checked }))}
                          data-testid="switch-chatbot-enabled"
                        />
                      </div>

                      <Separator />

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Assistant Name</Label>
                          <Input
                            value={agentForm.name ?? aiAgent?.name ?? 'Store Assistant'}
                            onChange={(e) => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Store Assistant"
                            data-testid="input-agent-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Personality</Label>
                          <Select
                            value={agentForm.personality ?? aiAgent?.personality ?? 'friendly'}
                            onValueChange={(value) => setAgentForm(prev => ({ ...prev, personality: value }))}
                          >
                            <SelectTrigger data-testid="select-personality">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PERSONALITY_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Welcome Message</Label>
                        <Textarea
                          value={agentForm.welcomeMessage ?? aiAgent?.welcomeMessage ?? ''}
                          onChange={(e) => setAgentForm(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                          placeholder="Hi! How can I help you today?"
                          rows={2}
                          data-testid="input-welcome-message"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Away Message</Label>
                        <Textarea
                          value={agentForm.awayMessage ?? aiAgent?.awayMessage ?? ''}
                          onChange={(e) => setAgentForm(prev => ({ ...prev, awayMessage: e.target.value }))}
                          placeholder="We're currently closed..."
                          rows={2}
                          data-testid="input-away-message"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Capabilities
                      </CardTitle>
                      <CardDescription>What can your AI assistant do?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">Take Orders</p>
                              <p className="text-xs text-muted-foreground">Accept online orders via chat</p>
                            </div>
                          </div>
                          <Switch
                            checked={agentForm.canTakeOrders ?? aiAgent?.canTakeOrders ?? false}
                            onCheckedChange={(checked) => setAgentForm(prev => ({ ...prev, canTakeOrders: checked }))}
                            data-testid="switch-take-orders"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">Schedule Pickups</p>
                              <p className="text-xs text-muted-foreground">Book pickup appointments</p>
                            </div>
                          </div>
                          <Switch
                            checked={agentForm.canSchedulePickups ?? aiAgent?.canSchedulePickups ?? false}
                            onCheckedChange={(checked) => setAgentForm(prev => ({ ...prev, canSchedulePickups: checked }))}
                            data-testid="switch-schedule-pickups"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">Answer Pricing</p>
                              <p className="text-xs text-muted-foreground">Quote prices and services</p>
                            </div>
                          </div>
                          <Switch
                            checked={agentForm.canAnswerPricing ?? aiAgent?.canAnswerPricing ?? true}
                            onCheckedChange={(checked) => setAgentForm(prev => ({ ...prev, canAnswerPricing: checked }))}
                            data-testid="switch-answer-pricing"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">FAQ & Info</p>
                              <p className="text-xs text-muted-foreground">Answer common questions</p>
                            </div>
                          </div>
                          <Switch
                            checked={agentForm.canProvideFaq ?? aiAgent?.canProvideFaq ?? true}
                            onCheckedChange={(checked) => setAgentForm(prev => ({ ...prev, canProvideFaq: checked }))}
                            data-testid="switch-provide-faq"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => saveAgentMutation.mutate({ ...aiAgent, ...agentForm })}
                        disabled={saveAgentMutation.isPending}
                        data-testid="button-save-agent"
                      >
                        {saveAgentMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save AI Settings
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Chatbot Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg overflow-hidden border border-border">
                        <div
                          className="p-3 flex items-center gap-2"
                          style={{ backgroundColor: agentForm.primaryColor || aiAgent?.primaryColor || '#C8A661' }}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-white/20 text-white text-xs">AI</AvatarFallback>
                          </Avatar>
                          <span className="text-white font-medium text-sm">
                            {agentForm.name || aiAgent?.name || 'Store Assistant'}
                          </span>
                        </div>
                        <div className="p-4 bg-background space-y-3">
                          <div className="flex gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">AI</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg p-2 text-sm max-w-[80%]">
                              {agentForm.welcomeMessage || aiAgent?.welcomeMessage || 'Hi! How can I help you today?'}
                            </div>
                          </div>
                        </div>
                        <div className="p-2 border-t border-border bg-muted/30">
                          <Input placeholder="Type a message..." className="h-8 text-sm" disabled />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Appearance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Widget Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={agentForm.primaryColor || aiAgent?.primaryColor || '#C8A661'}
                            onChange={(e) => setAgentForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-14 h-10 p-1"
                            data-testid="input-widget-color"
                          />
                          <Input
                            value={agentForm.primaryColor || aiAgent?.primaryColor || '#C8A661'}
                            onChange={(e) => setAgentForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Widget Position</Label>
                        <Select
                          value={agentForm.position || aiAgent?.position || 'bottom-right'}
                          onValueChange={(value) => setAgentForm(prev => ({ ...prev, position: value }))}
                        >
                          <SelectTrigger data-testid="select-position">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* MEDIA TAB */}
            <TabsContent value="media" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    Videos & Media
                  </CardTitle>
                  <CardDescription>Add promotional videos to your website</CardDescription>
                </CardHeader>
                <CardContent>
                  {videosLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="text-center py-12">
                      <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Videos Yet</h3>
                      <p className="text-muted-foreground mb-4">Add videos to showcase your laundromat</p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Video
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video) => (
                        <Card key={video.id} className="overflow-hidden" data-testid={`video-card-${video.id}`}>
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            {video.thumbnailUrl ? (
                              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                            ) : (
                              <Play className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                          <CardContent className="p-3">
                            <p className="font-medium text-sm truncate">{video.title}</p>
                            <Badge variant="secondary" className="mt-1 text-xs">{video.videoType}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* INTEGRATIONS TAB */}
            <TabsContent value="integrations" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Connected Integrations
                  </CardTitle>
                  <CardDescription>Securely connect your business accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Facebook className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Facebook Page</p>
                          <p className="text-sm text-muted-foreground">
                            {integrations.find(i => i.integrationType === 'facebook')?.isConnected
                              ? integrations.find(i => i.integrationType === 'facebook')?.externalAccountName
                              : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-connect-facebook">
                        {integrations.find(i => i.integrationType === 'facebook')?.isConnected ? 'Manage' : 'Connect'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                          <Globe className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium">Google Business Profile</p>
                          <p className="text-sm text-muted-foreground">
                            {integrations.find(i => i.integrationType === 'google_business')?.isConnected
                              ? integrations.find(i => i.integrationType === 'google_business')?.externalAccountName
                              : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-connect-google">
                        {integrations.find(i => i.integrationType === 'google_business')?.isConnected ? 'Manage' : 'Connect'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                          <Instagram className="w-6 h-6 text-pink-500" />
                        </div>
                        <div>
                          <p className="font-medium">Instagram</p>
                          <p className="text-sm text-muted-foreground">
                            {integrations.find(i => i.integrationType === 'instagram')?.isConnected
                              ? integrations.find(i => i.integrationType === 'instagram')?.externalAccountName
                              : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-connect-instagram">
                        {integrations.find(i => i.integrationType === 'instagram')?.isConnected ? 'Manage' : 'Connect'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-600/10">
                          <Star className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Yelp Business</p>
                          <p className="text-sm text-muted-foreground">
                            {integrations.find(i => i.integrationType === 'yelp')?.isConnected
                              ? integrations.find(i => i.integrationType === 'yelp')?.externalAccountName
                              : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid="button-connect-yelp">
                        {integrations.find(i => i.integrationType === 'yelp')?.isConnected ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Secure Secrets Vault</p>
                        <p className="text-sm text-muted-foreground">
                          Your API keys and access tokens are encrypted and stored securely. We never expose your credentials.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO TAB */}
            <TabsContent value="seo" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary" />
                        SEO Settings
                      </CardTitle>
                      <CardDescription>Optimize your website for search engines</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Site Title (Meta Title)</Label>
                        <Input
                          placeholder="Your Business Name - Professional Laundry Services"
                          data-testid="input-seo-title"
                        />
                        <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Meta Description</Label>
                        <Textarea
                          placeholder="Describe your laundromat services in 150-160 characters..."
                          rows={3}
                          data-testid="input-seo-description"
                        />
                        <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Focus Keywords</Label>
                        <Input
                          placeholder="laundromat near me, wash and fold, dry cleaning"
                          data-testid="input-seo-keywords"
                        />
                        <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label>Custom Robots.txt</Label>
                        <Textarea
                          placeholder="User-agent: *&#10;Allow: /&#10;Sitemap: https://yourdomain.com/sitemap.xml"
                          rows={4}
                          className="font-mono text-sm"
                          data-testid="input-robots-txt"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-primary" />
                        Structured Data
                      </CardTitle>
                      <CardDescription>Help search engines understand your business</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium text-sm">LocalBusiness Schema</p>
                            <p className="text-xs text-muted-foreground">Auto-generated from your business info</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium text-sm">Service Schema</p>
                            <p className="text-xs text-muted-foreground">Generated from your services list</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium text-sm">FAQPage Schema</p>
                            <p className="text-xs text-muted-foreground">From AI chatbot common questions</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium text-sm">OpenGraph & Twitter Cards</p>
                            <p className="text-xs text-muted-foreground">Social sharing optimization</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        SEO Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <div className="relative inline-flex items-center justify-center w-32 h-32">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                            <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="352" strokeDashoffset="70" className="text-green-500" strokeLinecap="round" />
                          </svg>
                          <span className="absolute text-3xl font-bold">80</span>
                        </div>
                        <p className="mt-2 font-medium text-green-500">Good</p>
                        <p className="text-sm text-muted-foreground">Your site is well optimized</p>
                      </div>
                      <Separator className="my-4" />
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Meta Title</span>
                          <Badge className="bg-green-500/20 text-green-500">Good</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Meta Description</span>
                          <Badge className="bg-green-500/20 text-green-500">Good</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Heading Structure</span>
                          <Badge className="bg-green-500/20 text-green-500">Good</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Mobile Friendly</span>
                          <Badge className="bg-green-500/20 text-green-500">Yes</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Schema Markup</span>
                          <Badge className="bg-green-500/20 text-green-500">Complete</Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" data-testid="button-save-seo">
                        <Save className="w-4 h-4 mr-2" />
                        Save SEO Settings
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Sitemap
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/30 font-mono text-xs break-all">
                        https://yourdomain.com/sitemap.xml
                      </div>
                      <Button variant="outline" size="sm" className="w-full" data-testid="button-regenerate-sitemap">
                        Regenerate Sitemap
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Last generated: Auto-updates on publish
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* EMAIL MARKETING TAB */}
            <TabsContent value="email" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Email Subscribers
                          </CardTitle>
                          <CardDescription>Manage your newsletter subscribers</CardDescription>
                        </div>
                        <Button size="sm" data-testid="button-export-subscribers">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 rounded-lg bg-muted/30">
                          <p className="text-3xl font-bold text-primary">0</p>
                          <p className="text-sm text-muted-foreground">Total Subscribers</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/30">
                          <p className="text-3xl font-bold text-green-500">0</p>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/30">
                          <p className="text-3xl font-bold text-muted-foreground">0</p>
                          <p className="text-sm text-muted-foreground">Unsubscribed</p>
                        </div>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-4 text-center text-muted-foreground">
                          <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No subscribers yet</p>
                          <p className="text-sm">Add an email capture widget to your website</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Email Campaigns
                          </CardTitle>
                          <CardDescription>Create and send marketing emails</CardDescription>
                        </div>
                        <Button size="sm" data-testid="button-new-campaign">
                          <Plus className="w-4 h-4 mr-2" />
                          New Campaign
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-dashed border-border text-center">
                          <Send className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No campaigns yet</p>
                          <p className="text-sm text-muted-foreground mb-3">Create your first email campaign</p>
                          <Button size="sm" variant="outline" data-testid="button-create-first-campaign">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Campaign
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-primary" />
                        Email Capture Widget
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Enable Popup</p>
                          <p className="text-xs text-muted-foreground">Show email capture on website</p>
                        </div>
                        <Switch data-testid="switch-email-popup" />
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input
                          placeholder="Get 10% Off Your First Order!"
                          data-testid="input-popup-headline"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subheadline</Label>
                        <Input
                          placeholder="Join our newsletter for deals"
                          data-testid="input-popup-subheadline"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Incentive</Label>
                        <Input
                          placeholder="Plus free pickup on your first order!"
                          data-testid="input-popup-incentive"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          placeholder="Subscribe"
                          data-testid="input-popup-cta"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" data-testid="button-save-email-settings">
                        <Save className="w-4 h-4 mr-2" />
                        Save Widget Settings
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Email Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Emails Sent</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Open Rate</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Click Rate</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Unsubscribe Rate</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <Separator />
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Powered by Resend</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enterprise-grade email delivery with 99.9% uptime
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
