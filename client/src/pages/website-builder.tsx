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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DroppableCanvas, Block } from "@/components/website-builder/DroppableCanvas";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Globe, Plus, Layout, Palette, Bot, Image as ImageIcon, Video, FileText,
  Settings, Save, ExternalLink, Upload, Trash2, Edit, Building2, Layers,
  Phone, Mail, MapPin, Clock, Facebook, Instagram, Star, Sparkles,
  MessageSquare, Zap, Shield, Link2, Eye, EyeOff, ChevronRight,
  Loader2, WashingMachine, ShoppingBag, Truck, PenTool, Play, Monitor,
  Search, FileCode, Send, Users, BarChart3, Target, Gift, CheckCircle,
  Server, Lock, RefreshCw, Wifi, Activity, ShoppingCart, CreditCard,
  FlaskConical, Copy, Pause, TrendingUp, Trophy, MousePointerClick, Timer, FileCheck
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AuthGuard } from "@/components/AuthGuard";

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

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: {
    id: string;
    name: string;
    traffic: number;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }[];
  goal: 'button_click' | 'form_submission' | 'time_on_page' | 'scroll_depth';
  goalDescription: string;
  startDate: string | null;
  endDate: string | null;
  confidenceLevel: number;
  winner: string | null;
}

const MOCK_AB_TESTS: ABTest[] = [
  {
    id: 'test-1',
    name: 'Hero Section CTA Test',
    status: 'running',
    variants: [
      { id: 'a', name: 'Variant A (Control)', traffic: 50, visitors: 1247, conversions: 89, conversionRate: 7.1 },
      { id: 'b', name: 'Variant B', traffic: 50, visitors: 1253, conversions: 112, conversionRate: 8.9 },
    ],
    goal: 'button_click',
    goalDescription: 'Click on "Get Started" button',
    startDate: '2025-11-25',
    endDate: null,
    confidenceLevel: 94,
    winner: null,
  },
  {
    id: 'test-2',
    name: 'Pricing Page Layout',
    status: 'completed',
    variants: [
      { id: 'a', name: 'Variant A (Control)', traffic: 50, visitors: 3421, conversions: 198, conversionRate: 5.8 },
      { id: 'b', name: 'Variant B', traffic: 50, visitors: 3389, conversions: 287, conversionRate: 8.5 },
    ],
    goal: 'form_submission',
    goalDescription: 'Submit pricing inquiry form',
    startDate: '2025-11-10',
    endDate: '2025-11-24',
    confidenceLevel: 99,
    winner: 'b',
  },
  {
    id: 'test-3',
    name: 'Service Cards Order',
    status: 'paused',
    variants: [
      { id: 'a', name: 'Variant A (Control)', traffic: 70, visitors: 892, conversions: 45, conversionRate: 5.0 },
      { id: 'b', name: 'Variant B', traffic: 30, visitors: 384, conversions: 23, conversionRate: 6.0 },
    ],
    goal: 'scroll_depth',
    goalDescription: 'Scroll past 75% of page',
    startDate: '2025-11-20',
    endDate: null,
    confidenceLevel: 72,
    winner: null,
  },
];

const TRAFFIC_SPLIT_OPTIONS = [
  { value: '50-50', label: '50% / 50%', a: 50, b: 50 },
  { value: '60-40', label: '60% / 40%', a: 60, b: 40 },
  { value: '70-30', label: '70% / 30%', a: 70, b: 30 },
  { value: '80-20', label: '80% / 20%', a: 80, b: 20 },
  { value: '90-10', label: '90% / 10%', a: 90, b: 10 },
];

const CONVERSION_GOALS = [
  { value: 'button_click', label: 'Button Clicks', icon: MousePointerClick, description: 'Track when users click a specific button' },
  { value: 'form_submission', label: 'Form Submissions', icon: FileCheck, description: 'Track when users submit a form' },
  { value: 'time_on_page', label: 'Time on Page', icon: Timer, description: 'Track when users spend X seconds on page' },
  { value: 'scroll_depth', label: 'Scroll Depth', icon: TrendingUp, description: 'Track when users scroll to X% of page' },
];

const WEBSITE_BUILDER_FAQS = [
  {
    question: "What are some laundromat website examples I can learn from?",
    answer: "The best laundromat websites share common elements: professional photography of clean facilities, clear service pricing, easy-to-find location and hours, online ordering for wash-dry-fold, and customer reviews. Top examples include Speed Queen Laundry stores with modern branding, Tide Cleaners franchise sites, and independent laundromats using platforms like WashBizHub Website Builder. Look for sites with mobile-responsive design, Google Maps integration, and clear calls-to-action for services like pickup/delivery."
  },
  {
    question: "How to make a laundromat website?",
    answer: "Create a laundromat website in 7 steps: 1) Choose a website builder designed for laundromats like WashBizHub (includes industry templates), 2) Select your branding colors and upload your logo, 3) Add essential pages: Home, Services, Pricing, Location/Hours, and Contact, 4) Include high-quality photos of your facility, 5) Add online ordering for wash-dry-fold if you offer it, 6) Integrate an AI chatbot for 24/7 customer inquiries, 7) Optimize for local SEO with Google Business Profile connection. WashBizHub Website Builder handles all of this with drag-and-drop simplicity."
  },
  {
    question: "How much does a laundromat website cost?",
    answer: "Laundromat website costs vary widely: DIY website builders (Wix, Squarespace): $12-40/month plus your time to build and maintain. Professional custom design: $2,000-10,000 one-time plus $50-200/month hosting. Industry-specific platforms like WashBizHub: included with membership, optimized for laundromat features. Hidden costs to consider: domain registration ($12-50/year), SSL certificate (often free), professional photos ($200-500), and ongoing SEO/maintenance. The WashBizHub Website Builder includes hosting, templates, AI chatbot, and integrations at no extra cost."
  },
  {
    question: "What features should a laundromat website have?",
    answer: "Essential laundromat website features: 1) Mobile-responsive design (70%+ of traffic is mobile), 2) Location with Google Maps and clear directions, 3) Hours of operation with real-time status, 4) Service pricing (self-service, wash-dry-fold, pickup/delivery), 5) Online ordering/scheduling system, 6) AI chatbot for 24/7 customer questions, 7) Customer reviews and testimonials, 8) Photo gallery of clean facilities, 9) Contact form and phone number, 10) Email capture for promotions, 11) Local SEO optimization, 12) Fast loading speed under 3 seconds."
  },
  {
    question: "Do I need a website for my laundromat?",
    answer: "Yes, a website is essential for modern laundromats. Statistics show: 97% of consumers search online for local services, laundromats with websites see 30-40% higher customer acquisition, and online ordering increases wash-dry-fold revenue by 50-100%. A website establishes credibility, enables 24/7 customer service via chatbots, supports pickup/delivery operations, and improves local SEO rankings. Even self-service laundromats benefit from websites for hours, location, and building trust before customers visit."
  },
  {
    question: "How do I add online ordering to my laundromat website?",
    answer: "Add online ordering to your laundromat website through: 1) Built-in ordering systems in platforms like WashBizHub Website Builder (easiest), 2) Third-party integrations like CleanCloud, Cents, or Curbside Laundries, 3) Simple contact forms for manual order processing (basic but functional), 4) Custom development with payment processing (most expensive). Essential features include: service selection (wash-fold, dry clean), pickup scheduling, weight estimates, pricing calculator, and payment processing. WashBizHub includes ordering, AI chatbot, and payment integration out of the box."
  },
  {
    question: "How can I improve my laundromat website SEO?",
    answer: "Improve laundromat website SEO with these strategies: 1) Claim and optimize Google Business Profile with accurate NAP (name, address, phone), 2) Use local keywords like 'laundromat in [city]' and 'wash and fold [neighborhood]', 3) Create location-specific landing pages, 4) Get customer reviews and display them on your site, 5) Add structured data markup for local business and services, 6) Ensure mobile-friendly, fast-loading pages, 7) Build local backlinks from community sites, 8) Create helpful content about laundry tips and services. WashBizHub Website Builder includes built-in SEO tools and schema markup."
  },
  {
    question: "Can I build a laundromat website myself without coding?",
    answer: "Absolutely! No-code website builders make it easy to create professional laundromat websites. WashBizHub Website Builder is designed specifically for laundromats with drag-and-drop page building, pre-built templates, AI chatbot integration, and all essential features. Other options include Wix, Squarespace, and WordPress with themes, though they require more customization. Industry-specific platforms like WashBizHub save time by including laundromat-focused templates, service cards, pricing displays, and integrations that general website builders lack."
  }
];

const WEBSITE_BUILDER_HOWTO = {
  name: "How to Build a Professional Laundromat Website",
  description: "Complete step-by-step guide to creating a professional website for your laundromat with online ordering, AI chatbot, and local SEO optimization.",
  steps: [
    {
      name: "Choose Your Website Platform",
      text: "Select an industry-specific platform like WashBizHub Website Builder that includes laundromat templates, or use general builders like Wix/Squarespace. Industry platforms save significant time with pre-built features for laundromats."
    },
    {
      name: "Set Up Your Branding",
      text: "Upload your logo (or create one), choose brand colors that match your storefront, and select fonts that are easy to read. Consistent branding builds trust and recognition with customers."
    },
    {
      name: "Create Essential Pages",
      text: "Build these core pages: Home (overview and main CTA), Services (wash-fold, self-service, pickup/delivery with pricing), Location (address, map, hours), About (your story and what makes you different), Contact (phone, email, form)."
    },
    {
      name: "Add Service Cards and Pricing",
      text: "Create clear service cards with descriptions, pricing, and calls-to-action. Display wash-dry-fold rates prominently. Include any minimum weights, rush fees, and special services. Transparent pricing builds customer trust."
    },
    {
      name: "Integrate AI Chatbot",
      text: "Add an AI-powered chatbot to answer common questions 24/7: hours, pricing, location, service availability. Configure the chatbot to take orders, schedule pickups, and provide FAQs. This reduces phone calls and captures leads when you're busy."
    },
    {
      name: "Upload Quality Photos",
      text: "Add professional photos of your clean facility, modern equipment, and friendly staff. Include before/after photos of laundry if you offer wash-fold. Visual proof of cleanliness is critical for customer trust."
    },
    {
      name: "Optimize for Local SEO",
      text: "Add your business to Google Business Profile and link it to your website. Use local keywords throughout. Add structured data markup for local business schema. Ensure your name, address, and phone (NAP) are consistent everywhere online."
    },
    {
      name: "Test and Launch",
      text: "Preview on mobile and desktop devices. Test all forms and contact methods. Check page load speed (under 3 seconds). Verify online ordering if enabled. Launch and monitor analytics to improve over time."
    }
  ],
  totalTime: "PT4H"
};

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

  const [abTests, setAbTests] = useState<ABTest[]>(MOCK_AB_TESTS);
  const [createTestDialogOpen, setCreateTestDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [newTest, setNewTest] = useState({
    name: '',
    trafficSplit: '50-50',
    goal: 'button_click',
    goalDescription: '',
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
    <AuthGuard title="Sign In to Build Your Website" description="Sign in to access this tool.">
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
              <TabsTrigger value="ab-testing" className="gap-2" data-testid="tab-ab-testing">
                <FlaskConical className="w-4 h-4" />
                A/B Testing
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2" data-testid="tab-email">
                <Send className="w-4 h-4" />
                Email Marketing
              </TabsTrigger>
              <TabsTrigger value="hosting" className="gap-2" data-testid="tab-hosting">
                <Server className="w-4 h-4" />
                Hosting
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

            {/* A/B TESTING TAB */}
            <TabsContent value="ab-testing" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-primary" />
                            A/B Tests
                          </CardTitle>
                          <CardDescription>Create and manage split tests for your landing pages</CardDescription>
                        </div>
                        <Dialog open={createTestDialogOpen} onOpenChange={setCreateTestDialogOpen}>
                          <DialogTrigger asChild>
                            <Button data-testid="button-create-ab-test">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Test
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Create A/B Test</DialogTitle>
                              <DialogDescription>Set up a new split test for your landing page variants</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Test Name</Label>
                                <Input
                                  value={newTest.name}
                                  onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="e.g., Hero Section CTA Test"
                                  data-testid="input-test-name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Traffic Split</Label>
                                <Select
                                  value={newTest.trafficSplit}
                                  onValueChange={(value) => setNewTest(prev => ({ ...prev, trafficSplit: value }))}
                                >
                                  <SelectTrigger data-testid="select-traffic-split">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TRAFFIC_SPLIT_OPTIONS.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">How to split traffic between Variant A and Variant B</p>
                              </div>
                              <div className="space-y-2">
                                <Label>Conversion Goal</Label>
                                <Select
                                  value={newTest.goal}
                                  onValueChange={(value) => setNewTest(prev => ({ ...prev, goal: value }))}
                                >
                                  <SelectTrigger data-testid="select-conversion-goal">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CONVERSION_GOALS.map(goal => (
                                      <SelectItem key={goal.value} value={goal.value}>
                                        <div className="flex items-center gap-2">
                                          <goal.icon className="w-4 h-4" />
                                          {goal.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Goal Description</Label>
                                <Input
                                  value={newTest.goalDescription}
                                  onChange={(e) => setNewTest(prev => ({ ...prev, goalDescription: e.target.value }))}
                                  placeholder="e.g., Click on 'Get Started' button"
                                  data-testid="input-goal-description"
                                />
                              </div>
                              <Separator />
                              <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-muted/30 border-dashed">
                                  <CardContent className="pt-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                                      <span className="text-lg font-bold text-blue-500">A</span>
                                    </div>
                                    <p className="font-medium text-sm">Control</p>
                                    <p className="text-xs text-muted-foreground">Current design</p>
                                  </CardContent>
                                </Card>
                                <Card className="bg-muted/30 border-dashed">
                                  <CardContent className="pt-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                                      <span className="text-lg font-bold text-purple-500">B</span>
                                    </div>
                                    <p className="font-medium text-sm">Variant</p>
                                    <p className="text-xs text-muted-foreground">Modified design</p>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setCreateTestDialogOpen(false)} data-testid="button-cancel-create-test">
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  const splitOption = TRAFFIC_SPLIT_OPTIONS.find(o => o.value === newTest.trafficSplit);
                                  const newAbTest: ABTest = {
                                    id: `test-${Date.now()}`,
                                    name: newTest.name || 'Untitled Test',
                                    status: 'draft',
                                    variants: [
                                      { id: 'a', name: 'Variant A (Control)', traffic: splitOption?.a || 50, visitors: 0, conversions: 0, conversionRate: 0 },
                                      { id: 'b', name: 'Variant B', traffic: splitOption?.b || 50, visitors: 0, conversions: 0, conversionRate: 0 },
                                    ],
                                    goal: newTest.goal as ABTest['goal'],
                                    goalDescription: newTest.goalDescription,
                                    startDate: null,
                                    endDate: null,
                                    confidenceLevel: 0,
                                    winner: null,
                                  };
                                  setAbTests(prev => [newAbTest, ...prev]);
                                  setCreateTestDialogOpen(false);
                                  setNewTest({ name: '', trafficSplit: '50-50', goal: 'button_click', goalDescription: '' });
                                  toast({ title: "Test Created!", description: "Your A/B test has been created. Start it when ready." });
                                }}
                                data-testid="button-confirm-create-test"
                              >
                                Create Test
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {abTests.length === 0 ? (
                        <div className="text-center py-12">
                          <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No A/B Tests Yet</h3>
                          <p className="text-muted-foreground mb-4">Create your first test to optimize conversions</p>
                          <Button onClick={() => setCreateTestDialogOpen(true)} data-testid="button-create-first-test">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Test
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {abTests.map((test) => (
                            <Card
                              key={test.id}
                              className={`hover-elevate cursor-pointer transition-all ${selectedTest?.id === test.id ? 'ring-2 ring-primary' : ''}`}
                              onClick={() => setSelectedTest(test)}
                              data-testid={`ab-test-card-${test.id}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                      test.status === 'running' ? 'bg-green-500/20' :
                                      test.status === 'completed' ? 'bg-blue-500/20' :
                                      test.status === 'paused' ? 'bg-yellow-500/20' :
                                      'bg-muted'
                                    }`}>
                                      <FlaskConical className={`w-5 h-5 ${
                                        test.status === 'running' ? 'text-green-500' :
                                        test.status === 'completed' ? 'text-blue-500' :
                                        test.status === 'paused' ? 'text-yellow-500' :
                                        'text-muted-foreground'
                                      }`} />
                                    </div>
                                    <div>
                                      <p className="font-medium">{test.name}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant="secondary"
                                          className={`text-xs ${
                                            test.status === 'running' ? 'bg-green-500/20 text-green-500' :
                                            test.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                                            test.status === 'paused' ? 'bg-yellow-500/20 text-yellow-500' :
                                            ''
                                          }`}
                                        >
                                          {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                                        </Badge>
                                        {test.winner && (
                                          <Badge className="bg-primary/20 text-primary text-xs gap-1">
                                            <Trophy className="w-3 h-3" />
                                            Winner: Variant {test.winner.toUpperCase()}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                      <p className="text-muted-foreground text-xs">Total Visitors</p>
                                      <p className="font-bold" data-testid={`text-visitors-${test.id}`}>
                                        {test.variants.reduce((sum, v) => sum + v.visitors, 0).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-muted-foreground text-xs">Conversions</p>
                                      <p className="font-bold" data-testid={`text-conversions-${test.id}`}>
                                        {test.variants.reduce((sum, v) => sum + v.conversions, 0).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-muted-foreground text-xs">Confidence</p>
                                      <p className={`font-bold ${test.confidenceLevel >= 95 ? 'text-green-500' : test.confidenceLevel >= 80 ? 'text-yellow-500' : 'text-muted-foreground'}`} data-testid={`text-confidence-${test.id}`}>
                                        {test.confidenceLevel}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {selectedTest && (
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-primary" />
                              Test Results: {selectedTest.name}
                            </CardTitle>
                            <CardDescription>{selectedTest.goalDescription}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {selectedTest.status === 'running' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAbTests(prev => prev.map(t => t.id === selectedTest.id ? { ...t, status: 'paused' } : t));
                                  setSelectedTest(prev => prev ? { ...prev, status: 'paused' } : null);
                                  toast({ title: "Test Paused", description: "The A/B test has been paused." });
                                }}
                                data-testid="button-pause-test"
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </Button>
                            )}
                            {selectedTest.status === 'paused' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAbTests(prev => prev.map(t => t.id === selectedTest.id ? { ...t, status: 'running' } : t));
                                  setSelectedTest(prev => prev ? { ...prev, status: 'running' } : null);
                                  toast({ title: "Test Resumed", description: "The A/B test is now running." });
                                }}
                                data-testid="button-resume-test"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Resume
                              </Button>
                            )}
                            {selectedTest.status === 'draft' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setAbTests(prev => prev.map(t => t.id === selectedTest.id ? { ...t, status: 'running', startDate: new Date().toISOString().split('T')[0] } : t));
                                  setSelectedTest(prev => prev ? { ...prev, status: 'running', startDate: new Date().toISOString().split('T')[0] } : null);
                                  toast({ title: "Test Started!", description: "Your A/B test is now live." });
                                }}
                                data-testid="button-start-test"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Test
                              </Button>
                            )}
                            {(selectedTest.status === 'running' || selectedTest.status === 'paused') && selectedTest.confidenceLevel >= 95 && (
                              <Button
                                size="sm"
                                className="bg-primary"
                                onClick={() => {
                                  const winningVariant = selectedTest.variants.reduce((prev, curr) => curr.conversionRate > prev.conversionRate ? curr : prev);
                                  setAbTests(prev => prev.map(t => t.id === selectedTest.id ? { ...t, status: 'completed', winner: winningVariant.id, endDate: new Date().toISOString().split('T')[0] } : t));
                                  setSelectedTest(prev => prev ? { ...prev, status: 'completed', winner: winningVariant.id, endDate: new Date().toISOString().split('T')[0] } : null);
                                  toast({ title: "Winner Declared!", description: `Variant ${winningVariant.id.toUpperCase()} has been declared the winner.` });
                                }}
                                data-testid="button-declare-winner"
                              >
                                <Trophy className="w-4 h-4 mr-2" />
                                Declare Winner
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedTest.variants.map((variant, index) => (
                            <Card
                              key={variant.id}
                              className={`${selectedTest.winner === variant.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                              data-testid={`variant-card-${variant.id}`}
                            >
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                                      <span className={`font-bold ${index === 0 ? 'text-blue-500' : 'text-purple-500'}`}>{variant.id.toUpperCase()}</span>
                                    </div>
                                    <span className="font-medium">{variant.name}</span>
                                  </div>
                                  {selectedTest.winner === variant.id && (
                                    <Badge className="bg-primary/20 text-primary gap-1">
                                      <Trophy className="w-3 h-3" />
                                      Winner
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Traffic Share</span>
                                    <span className="font-medium">{variant.traffic}%</span>
                                  </div>
                                  <Progress value={variant.traffic} className="h-2" />
                                  <div className="grid grid-cols-3 gap-2 pt-2">
                                    <div className="text-center p-2 rounded-lg bg-muted/30">
                                      <p className="text-lg font-bold" data-testid={`text-variant-visitors-${variant.id}`}>{variant.visitors.toLocaleString()}</p>
                                      <p className="text-xs text-muted-foreground">Visitors</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-muted/30">
                                      <p className="text-lg font-bold" data-testid={`text-variant-conversions-${variant.id}`}>{variant.conversions.toLocaleString()}</p>
                                      <p className="text-xs text-muted-foreground">Conversions</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-muted/30">
                                      <p className={`text-lg font-bold ${variant.conversionRate > (selectedTest.variants.find(v => v.id !== variant.id)?.conversionRate || 0) ? 'text-green-500' : ''}`} data-testid={`text-variant-rate-${variant.id}`}>
                                        {variant.conversionRate.toFixed(1)}%
                                      </p>
                                      <p className="text-xs text-muted-foreground">Conv. Rate</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <Card className="bg-muted/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Conversion Rate Comparison</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={selectedTest.variants.map(v => ({
                                    name: `Variant ${v.id.toUpperCase()}`,
                                    rate: v.conversionRate,
                                    fill: v.id === 'a' ? '#3b82f6' : '#8b5cf6'
                                  }))}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(value) => `${value}%`} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                                    labelStyle={{ color: 'white' }}
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Conversion Rate']}
                                  />
                                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                                    {selectedTest.variants.map((v, index) => (
                                      <Cell key={v.id} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Conversion Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {CONVERSION_GOALS.map((goal) => (
                        <div key={goal.value} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <goal.icon className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{goal.label}</p>
                            <p className="text-xs text-muted-foreground">{goal.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Testing Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm text-muted-foreground">Test one element at a time for clear results</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm text-muted-foreground">Wait for 95% confidence before declaring a winner</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm text-muted-foreground">Run tests for at least 2 weeks for reliable data</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm text-muted-foreground">Use 50/50 traffic split for fastest results</p>
                      </div>
                      <Separator />
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Statistical Significance</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tests reaching 95%+ confidence have a high probability of being accurate and not due to random chance.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedTest && (
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-primary" />
                          Test Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge
                            variant="secondary"
                            className={`${
                              selectedTest.status === 'running' ? 'bg-green-500/20 text-green-500' :
                              selectedTest.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                              selectedTest.status === 'paused' ? 'bg-yellow-500/20 text-yellow-500' :
                              ''
                            }`}
                            data-testid="text-selected-test-status"
                          >
                            {selectedTest.status.charAt(0).toUpperCase() + selectedTest.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Goal Type</span>
                          <span className="font-medium" data-testid="text-selected-test-goal">{CONVERSION_GOALS.find(g => g.value === selectedTest.goal)?.label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Start Date</span>
                          <span className="font-medium" data-testid="text-selected-test-start">{selectedTest.startDate || 'Not started'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">End Date</span>
                          <span className="font-medium" data-testid="text-selected-test-end">{selectedTest.endDate || 'Ongoing'}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Confidence Level</span>
                          <span className={`font-bold ${selectedTest.confidenceLevel >= 95 ? 'text-green-500' : selectedTest.confidenceLevel >= 80 ? 'text-yellow-500' : 'text-muted-foreground'}`} data-testid="text-selected-test-confidence">
                            {selectedTest.confidenceLevel}%
                          </span>
                        </div>
                        <Progress value={selectedTest.confidenceLevel} className="h-2" />
                        {selectedTest.confidenceLevel < 95 && (
                          <p className="text-xs text-muted-foreground">Need {(95 - selectedTest.confidenceLevel).toFixed(0)}% more for statistical significance</p>
                        )}
                        {selectedTest.confidenceLevel >= 95 && (
                          <p className="text-xs text-green-500">Statistically significant! Ready to declare a winner.</p>
                        )}
                      </CardContent>
                      <CardFooter className="flex-col gap-2">
                        <Button variant="outline" className="w-full" size="sm" data-testid="button-duplicate-test">
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate Test
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          size="sm"
                          onClick={() => {
                            setAbTests(prev => prev.filter(t => t.id !== selectedTest.id));
                            setSelectedTest(null);
                            toast({ title: "Test Deleted", description: "The A/B test has been removed." });
                          }}
                          data-testid="button-delete-test"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Test
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
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

            {/* HOSTING TAB */}
            <TabsContent value="hosting" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Your Website Address
                      </CardTitle>
                      <CardDescription>Configure your subdomain and custom domain</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Free Subdomain</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="your-business-name"
                            className="flex-1"
                            data-testid="input-subdomain"
                          />
                          <div className="flex items-center px-4 rounded-md bg-muted/50 border text-sm font-mono">
                            .washbizhub.com
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Your site is live at <span className="font-mono font-medium">yoursite.washbizhub.com</span></span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Custom Domain</Label>
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="w-3 h-3" />
                            Pro Feature
                          </Badge>
                        </div>
                        <Input
                          placeholder="www.yourbusiness.com"
                          data-testid="input-custom-domain"
                        />
                        <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
                          <p className="font-medium text-sm mb-2">DNS Configuration Required</p>
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between p-2 bg-background rounded">
                              <span className="text-muted-foreground">Type</span>
                              <span>CNAME</span>
                            </div>
                            <div className="flex justify-between p-2 bg-background rounded">
                              <span className="text-muted-foreground">Name</span>
                              <span>www</span>
                            </div>
                            <div className="flex justify-between p-2 bg-background rounded">
                              <span className="text-muted-foreground">Value</span>
                              <span>proxy.washbizhub.com</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" data-testid="button-verify-domain">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Verify DNS Configuration
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            Purchase a Domain
                          </CardTitle>
                          <CardDescription>Register a new domain through WashBizHub</CardDescription>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30">Google Domains</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search for available domains..."
                          className="flex-1"
                          data-testid="input-domain-search"
                        />
                        <Button data-testid="button-search-domains">
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </Button>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Popular domain extensions</p>
                        <div className="flex justify-center gap-2 flex-wrap">
                          <Badge variant="outline">.com from $12/yr</Badge>
                          <Badge variant="outline">.net from $12/yr</Badge>
                          <Badge variant="outline">.co from $25/yr</Badge>
                          <Badge variant="outline">.io from $40/yr</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-primary" />
                        Hosting Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <div>
                          <p className="font-medium text-sm">All Systems Operational</p>
                          <p className="text-xs text-muted-foreground">99.99% uptime this month</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-green-500" />
                            <span className="text-sm">SSL Certificate</span>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wifi className="w-4 h-4 text-green-500" />
                            <span className="text-sm">CDN</span>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500">Global</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            <span className="text-sm">DDoS Protection</span>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Auto-Scaling</span>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Response Time</span>
                        <span className="font-medium text-green-500">&lt;100ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Bandwidth</span>
                        <span className="font-medium">Unlimited</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Storage</span>
                        <span className="font-medium">10 GB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Visits</span>
                        <span className="font-medium">Unlimited</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Server className="w-10 h-10 mx-auto mb-3 text-primary" />
                        <h3 className="font-bold text-lg mb-1">Enterprise Hosting</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Powered by Google Cloud Platform with global edge locations
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>99.99% Uptime SLA</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Free SSL Certificates</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Global CDN Distribution</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Automatic Backups</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
