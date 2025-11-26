import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Building2,
  Truck,
  DollarSign,
  Calculator,
  CreditCard,
  Wrench,
  Package,
  Globe,
  BarChart3,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  FileText,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Target,
  Palette,
  Layout,
  Bot,
  MessageSquare,
  Bell,
  CalendarDays,
  ClipboardList,
  Receipt,
  Banknote,
  PieChart,
  LayoutDashboard,
  Layers
} from "lucide-react";

// Business Builder Steps
const STEPS = [
  { id: 'business', title: 'Business Info', icon: Building2 },
  { id: 'services', title: 'Services', icon: Truck },
  { id: 'pricing', title: 'Pricing', icon: DollarSign },
  { id: 'tools', title: 'Tools & Apps', icon: Layers },
  { id: 'website', title: 'Website', icon: Globe },
  { id: 'payments', title: 'Payments', icon: CreditCard },
  { id: 'launch', title: 'Launch', icon: Zap },
];

// Service Types
const SERVICE_TYPES = [
  {
    id: 'wdf',
    name: 'Wash-Dry-Fold',
    description: 'Drop-off laundry service with professional handling',
    icon: Sparkles,
    color: '#00A699',
    popular: true,
  },
  {
    id: 'pud',
    name: 'Pickup & Delivery',
    description: 'Door-to-door laundry service for convenience',
    icon: Truck,
    color: '#F59E0B',
    popular: true,
  },
  {
    id: 'self-service',
    name: 'Self-Service',
    description: 'Coin-op or card-op machines for walk-in customers',
    icon: Building2,
    color: '#3B82F6',
  },
  {
    id: 'commercial',
    name: 'Commercial Accounts',
    description: 'B2B services for hotels, gyms, restaurants',
    icon: BarChart3,
    color: '#8B5CF6',
  },
  {
    id: 'dry-cleaning',
    name: 'Dry Cleaning',
    description: 'Professional garment care services',
    icon: Star,
    color: '#EC4899',
  },
  {
    id: 'alterations',
    name: 'Alterations',
    description: 'Clothing repairs and modifications',
    icon: Settings,
    color: '#10B981',
  },
];

// Pricing Models
const PRICING_MODELS = [
  {
    id: 'by-pound',
    name: 'By The Pound',
    description: 'Charge customers based on weight',
    example: '$1.75/lb',
    icon: Calculator,
    recommended: true,
  },
  {
    id: 'flat-rate',
    name: 'Flat Rate',
    description: 'Fixed price per bag or load',
    example: '$25/bag',
    icon: Receipt,
  },
  {
    id: 'tiered',
    name: 'Tiered Pricing',
    description: 'Volume-based discounts',
    example: '$2/lb (1-10lb), $1.75/lb (10+)',
    icon: TrendingUp,
  },
  {
    id: 'subscription',
    name: 'Subscription',
    description: 'Monthly unlimited or plans',
    example: '$99/month unlimited',
    icon: CalendarDays,
  },
];

// Tool Categories
const TOOL_CATEGORIES = [
  {
    id: 'operations',
    name: 'Operations',
    icon: ClipboardList,
    color: '#00A699',
    tools: [
      { id: 'order-management', name: 'Order Management', included: true },
      { id: 'customer-database', name: 'Customer Database', included: true },
      { id: 'route-optimization', name: 'Route Optimization', included: true },
      { id: 'inventory-tracking', name: 'Inventory Tracking', included: true },
      { id: 'employee-scheduling', name: 'Employee Scheduling', premium: true },
    ]
  },
  {
    id: 'calculators',
    name: 'Calculators',
    icon: Calculator,
    color: '#F59E0B',
    tools: [
      { id: 'wdf-calculator', name: 'WDF Calculator', included: true },
      { id: 'pud-calculator', name: 'PUD Calculator', included: true },
      { id: 'roi-calculator', name: 'ROI Calculator', included: true },
      { id: 'valuation-tool', name: 'Business Valuation', included: true },
      { id: 'competition-intel', name: 'Competition Intelligence', premium: true },
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: Banknote,
    color: '#8B5CF6',
    tools: [
      { id: 'pos-system', name: 'POS System', included: true },
      { id: 'invoicing', name: 'Invoicing', included: true },
      { id: 'expense-tracking', name: 'Expense Tracking', included: true },
      { id: 'profit-reports', name: 'Profit & Loss Reports', included: true },
      { id: 'quickbooks-sync', name: 'QuickBooks Sync', premium: true },
    ]
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    icon: Wrench,
    color: '#EF4444',
    tools: [
      { id: 'repair-logs', name: 'Repair Logs', included: true },
      { id: 'maintenance-schedule', name: 'Maintenance Schedule', included: true },
      { id: 'service-guy-ai', name: 'Service Guy AI', premium: true },
      { id: 'predictive-maintenance', name: 'Predictive Maintenance', premium: true },
      { id: 'parts-ordering', name: 'Auto Parts Ordering', premium: true },
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Target,
    color: '#EC4899',
    tools: [
      { id: 'email-campaigns', name: 'Email Campaigns', included: true },
      { id: 'sms-notifications', name: 'SMS Notifications', included: true },
      { id: 'loyalty-program', name: 'Loyalty Program', premium: true },
      { id: 'referral-system', name: 'Referral System', premium: true },
      { id: 'review-management', name: 'Review Management', premium: true },
    ]
  },
  {
    id: 'ai',
    name: 'AI Features',
    icon: Bot,
    color: '#3B82F6',
    tools: [
      { id: 'ai-chatbot', name: 'Customer Chatbot', premium: true },
      { id: 'demand-forecasting', name: 'Demand Forecasting', premium: true },
      { id: 'pricing-optimization', name: 'Pricing Optimization', premium: true },
      { id: 'cleanbi-integration', name: 'CLEANBI™ Integration', premium: true },
    ]
  },
];

// Hosting Plans
const HOSTING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'Perfect for new laundry businesses',
    features: [
      'Up to 100 orders/month',
      'Basic website',
      'Email support',
      'Core calculators',
      'Basic POS',
    ],
    color: '#10B981',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    description: 'For growing laundry operations',
    features: [
      'Up to 1,000 orders/month',
      'Custom website',
      'Priority support',
      'All calculators',
      'Full POS + invoicing',
      'Route optimization',
      'SMS notifications',
    ],
    popular: true,
    color: '#3B82F6',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    description: 'For multi-location operations',
    features: [
      'Unlimited orders',
      'White-label website',
      'Dedicated support',
      'All premium tools',
      'Service Guy AI',
      'Predictive maintenance',
      'QuickBooks integration',
      'API access',
    ],
    color: '#8B5CF6',
  },
];

function StepIndicator({ steps, currentStep, onStepClick }: { 
  steps: typeof STEPS; 
  currentStep: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <button
            key={step.id}
            onClick={() => onStepClick(index)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : isCompleted 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            data-testid={`button-step-${step.id}`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline font-medium">{step.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function ServiceCard({ service, selected, onToggle }: { 
  service: typeof SERVICE_TYPES[0]; 
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = service.icon;
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 ${
        selected 
          ? 'border-2 ring-2 ring-primary/20' 
          : 'hover:border-primary/50'
      }`}
      style={{ borderColor: selected ? service.color : undefined }}
      onClick={onToggle}
      data-testid={`card-service-${service.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${service.color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color: service.color }} />
          </div>
          <div className="flex items-center gap-2">
            {service.popular && (
              <Badge variant="secondary" className="text-xs">Popular</Badge>
            )}
            <Switch checked={selected} />
          </div>
        </div>
        <h3 className="font-bold mt-4">{service.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
      </CardContent>
    </Card>
  );
}

function PricingModelCard({ model, selected, onSelect }: {
  model: typeof PRICING_MODELS[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = model.icon;
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 ${
        selected ? 'border-2 border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
      data-testid={`card-pricing-${model.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {model.recommended && (
            <Badge className="bg-primary">Recommended</Badge>
          )}
        </div>
        <h3 className="font-bold mt-4">{model.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
        <div className="mt-3 p-2 bg-muted rounded-lg text-center">
          <span className="font-mono font-bold">{model.example}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ToolCategorySection({ category, selectedTools, onToggleTool }: {
  category: typeof TOOL_CATEGORIES[0];
  selectedTools: string[];
  onToggleTool: (toolId: string) => void;
}) {
  const Icon = category.icon;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="pb-3"
        style={{ backgroundColor: `${category.color}08` }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${category.color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: category.color }} />
          </div>
          <CardTitle className="text-lg">{category.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {category.tools.map((tool) => (
            <div 
              key={tool.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Switch 
                  checked={selectedTools.includes(tool.id)}
                  onCheckedChange={() => onToggleTool(tool.id)}
                  disabled={tool.included}
                  data-testid={`switch-tool-${tool.id}`}
                />
                <span className={tool.included ? 'font-medium' : ''}>{tool.name}</span>
              </div>
              {tool.included ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  Included
                </Badge>
              ) : tool.premium ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Premium
                </Badge>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HostingPlanCard({ plan, selected, onSelect }: {
  plan: typeof HOSTING_PLANS[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${
        selected ? 'border-2 ring-2 ring-primary/20' : 'hover:border-primary/50'
      } ${plan.popular ? 'scale-105' : ''}`}
      style={{ borderColor: selected ? plan.color : undefined }}
      onClick={onSelect}
      data-testid={`card-plan-${plan.id}`}
    >
      {plan.popular && (
        <div 
          className="absolute top-0 right-0 px-3 py-1 text-white text-xs font-bold"
          style={{ backgroundColor: plan.color }}
        >
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{plan.name}</span>
          <span className="text-3xl font-bold" style={{ color: plan.color }}>
            ${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
          </span>
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={selected ? 'default' : 'outline'}
          style={selected ? { backgroundColor: plan.color } : {}}
        >
          {selected ? 'Selected' : 'Select Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function BusinessBuilderPage() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form state
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  
  const [selectedServices, setSelectedServices] = useState<string[]>(['wdf', 'pud']);
  const [pricingModel, setPricingModel] = useState('by-pound');
  const [pricePerPound, setPricePerPound] = useState(1.75);
  const [selectedTools, setSelectedTools] = useState<string[]>([
    'order-management', 'customer-database', 'route-optimization', 'inventory-tracking',
    'wdf-calculator', 'pud-calculator', 'roi-calculator', 'valuation-tool',
    'pos-system', 'invoicing', 'expense-tracking', 'profit-reports',
    'repair-logs', 'maintenance-schedule',
    'email-campaigns', 'sms-notifications',
  ]);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  
  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <>
      <Helmet>
        <title>Build Your Laundry Business | WashBizHub</title>
        <meta name="description" content="Design and launch your complete laundry on-demand business. Choose services, pricing, tools, and website - all hosted on WashBizHub." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-xl">Business Builder</h1>
                  <p className="text-sm text-muted-foreground">Design your complete laundry operation</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <div className="text-sm text-muted-foreground">Progress</div>
                  <div className="font-bold">{Math.round(progress)}% Complete</div>
                </div>
                <Progress value={progress} className="w-32 h-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Step Indicator */}
          <StepIndicator 
            steps={STEPS} 
            currentStep={currentStep} 
            onStepClick={setCurrentStep}
          />

          {/* Step Content */}
          <div className="min-h-[500px]">
            {/* Step 1: Business Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">Tell Us About Your Business</h2>
                  <p className="text-muted-foreground mt-2">Basic information to get started</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
                  <div className="md:col-span-2">
                    <Label htmlFor="business-name">Business Name *</Label>
                    <Input 
                      id="business-name"
                      placeholder="e.g., Fresh & Clean Laundry"
                      value={businessInfo.name}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                      data-testid="input-business-name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input 
                      id="tagline"
                      placeholder="e.g., Your neighborhood laundry experts"
                      value={businessInfo.tagline}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, tagline: e.target.value }))}
                      className="mt-1"
                      data-testid="input-tagline"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      placeholder="(555) 123-4567"
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="hello@yourlaundry.com"
                      value={businessInfo.email}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                      data-testid="input-email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address"
                      placeholder="123 Main Street"
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-1"
                      data-testid="input-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      placeholder="Los Angeles"
                      value={businessInfo.city}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, city: e.target.value }))}
                      className="mt-1"
                      data-testid="input-city"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state"
                        placeholder="CA"
                        value={businessInfo.state}
                        onChange={(e) => setBusinessInfo(prev => ({ ...prev, state: e.target.value }))}
                        className="mt-1"
                        data-testid="input-state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input 
                        id="zip"
                        placeholder="90001"
                        value={businessInfo.zip}
                        onChange={(e) => setBusinessInfo(prev => ({ ...prev, zip: e.target.value }))}
                        className="mt-1"
                        data-testid="input-zip"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Services */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">What Services Will You Offer?</h2>
                  <p className="text-muted-foreground mt-2">Select all the services you want to provide</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {SERVICE_TYPES.map((service) => (
                    <ServiceCard 
                      key={service.id}
                      service={service}
                      selected={selectedServices.includes(service.id)}
                      onToggle={() => toggleService(service.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">Set Your Pricing Model</h2>
                  <p className="text-muted-foreground mt-2">Choose how you'll charge your customers</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {PRICING_MODELS.map((model) => (
                    <PricingModelCard 
                      key={model.id}
                      model={model}
                      selected={pricingModel === model.id}
                      onSelect={() => setPricingModel(model.id)}
                    />
                  ))}
                </div>

                {/* Pricing Configuration */}
                {pricingModel === 'by-pound' && (
                  <Card className="max-w-md mx-auto">
                    <CardHeader>
                      <CardTitle>Configure Your Price</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Price Per Pound</Label>
                          <span className="font-bold text-xl text-primary">${pricePerPound.toFixed(2)}/lb</span>
                        </div>
                        <Slider
                          value={[pricePerPound]}
                          onValueChange={(v) => setPricePerPound(v[0])}
                          min={0.50}
                          max={5.00}
                          step={0.05}
                          className="mt-4"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          <span>$0.50</span>
                          <span>$5.00</span>
                        </div>
                      </div>
                      <Separator />
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Estimated Monthly Revenue</h4>
                        <div className="text-2xl font-bold text-primary">
                          ${(pricePerPound * 2000).toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Based on 2,000 lbs/month</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 4: Tools & Apps */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">Choose Your Business Tools</h2>
                  <p className="text-muted-foreground mt-2">Core tools are included. Add premium features for more power.</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {TOOL_CATEGORIES.map((category) => (
                    <ToolCategorySection 
                      key={category.id}
                      category={category}
                      selectedTools={selectedTools}
                      onToggleTool={toggleTool}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Website */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">Your Customer Website</h2>
                  <p className="text-muted-foreground mt-2">Professional website included with online ordering</p>
                </div>
                
                <div className="max-w-4xl mx-auto">
                  <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-background">
                          <Globe className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Professional Website Included</h3>
                          <p className="text-muted-foreground">
                            {businessInfo.name ? `${businessInfo.name.toLowerCase().replace(/\s+/g, '')}.washbizhub.com` : 'yourlaundry.washbizhub.com'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-background p-4 rounded-lg">
                          <Layout className="h-5 w-5 text-primary mb-2" />
                          <h4 className="font-medium">Beautiful Design</h4>
                          <p className="text-sm text-muted-foreground">Mobile-friendly, modern templates</p>
                        </div>
                        <div className="bg-background p-4 rounded-lg">
                          <CreditCard className="h-5 w-5 text-primary mb-2" />
                          <h4 className="font-medium">Online Ordering</h4>
                          <p className="text-sm text-muted-foreground">Customers book & pay online</p>
                        </div>
                        <div className="bg-background p-4 rounded-lg">
                          <MapPin className="h-5 w-5 text-primary mb-2" />
                          <h4 className="font-medium">Delivery Zones</h4>
                          <p className="text-sm text-muted-foreground">Interactive zone mapping</p>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h4 className="font-bold mb-4">Website Features</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          'Service menu with pricing',
                          'Online scheduling & booking',
                          'Customer accounts & history',
                          'Real-time order tracking',
                          'Payment processing',
                          'SMS & email notifications',
                          'Review collection',
                          'Custom branding',
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 6: Payments */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">Choose Your Hosting Plan</h2>
                  <p className="text-muted-foreground mt-2">Everything you need to run your business</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
                  {HOSTING_PLANS.map((plan) => (
                    <HostingPlanCard 
                      key={plan.id}
                      plan={plan}
                      selected={selectedPlan === plan.id}
                      onSelect={() => setSelectedPlan(plan.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Launch */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-4">
                    <Zap className="h-12 w-12 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Ready to Launch!</h2>
                  <p className="text-muted-foreground mt-2">Review your business configuration</p>
                </div>
                
                <div className="max-w-3xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-muted-foreground">Business Name</Label>
                          <p className="font-medium">{businessInfo.name || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Hosting Plan</Label>
                          <p className="font-medium capitalize">{selectedPlan} (${HOSTING_PLANS.find(p => p.id === selectedPlan)?.price}/mo)</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Services</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedServices.map(id => (
                              <Badge key={id} variant="secondary">{SERVICE_TYPES.find(s => s.id === id)?.name}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Pricing Model</Label>
                          <p className="font-medium">{PRICING_MODELS.find(m => m.id === pricingModel)?.name}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-muted-foreground">Selected Tools ({selectedTools.length})</Label>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedTools.slice(0, 10).map(id => {
                            const tool = TOOL_CATEGORIES.flatMap(c => c.tools).find(t => t.id === id);
                            return tool ? <Badge key={id} variant="outline">{tool.name}</Badge> : null;
                          })}
                          {selectedTools.length > 10 && (
                            <Badge variant="outline">+{selectedTools.length - 10} more</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full gap-2" size="lg" data-testid="button-launch-business">
                        <Zap className="h-5 w-5" />
                        Launch My Business
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="gap-2"
              data-testid="button-prev-step"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                className="gap-2"
                data-testid="button-next-step"
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700"
                data-testid="button-complete-setup"
              >
                Complete Setup
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
