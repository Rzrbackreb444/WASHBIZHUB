import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { 
  Truck,
  Package,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Calendar,
  Timer,
  Shield,
  Star,
  Phone,
  Mail,
  Shirt,
  Scale,
  Droplets,
  Wind,
  ThermometerSun,
  Leaf,
  Heart,
  AlertCircle,
  Plus,
  Minus,
  ShoppingBag,
  User,
  Home,
  Building,
  ChevronRight
} from "lucide-react";

// Demo business branding (this would be customized per tenant)
const BUSINESS_CONFIG = {
  name: "Fresh & Clean Laundry",
  tagline: "Your neighborhood laundry experts",
  primaryColor: "#00A699",
  logo: null,
  phone: "(555) 123-4567",
  email: "hello@freshandclean.com",
  address: "123 Main Street, Los Angeles, CA 90001",
  pricePerPound: 1.75,
  minimumOrder: 10,
  deliveryFee: 5.99,
  freeDeliveryThreshold: 30,
  turnaroundHours: 24,
  zones: ["Downtown", "Westside", "Hollywood", "Santa Monica"],
};

// Service Options
const SERVICE_OPTIONS = [
  {
    id: 'wash-dry-fold',
    name: 'Wash & Fold',
    description: 'Professional washing, drying, and folding',
    icon: Shirt,
    pricePerLb: 1.75,
    color: '#00A699',
    popular: true,
  },
  {
    id: 'wash-dry-hang',
    name: 'Wash & Hang',
    description: 'Washed, dried, and hung on hangers',
    icon: Wind,
    pricePerLb: 2.25,
    color: '#3B82F6',
  },
  {
    id: 'delicates',
    name: 'Delicates',
    description: 'Special care for delicate fabrics',
    icon: Heart,
    pricePerLb: 3.50,
    color: '#EC4899',
  },
  {
    id: 'heavy-items',
    name: 'Heavy Items',
    description: 'Comforters, blankets, large items',
    icon: Package,
    pricePerLb: 4.00,
    color: '#8B5CF6',
  },
];

// Add-on Services
const ADDONS = [
  { id: 'hypoallergenic', name: 'Hypoallergenic Detergent', price: 2.00, icon: Leaf },
  { id: 'fabric-softener', name: 'Extra Fabric Softener', price: 1.50, icon: Droplets },
  { id: 'stain-treatment', name: 'Stain Pre-Treatment', price: 3.00, icon: Sparkles },
  { id: 'express', name: 'Express Service (Same Day)', price: 10.00, icon: Zap },
  { id: 'hot-water', name: 'Hot Water Wash', price: 2.00, icon: ThermometerSun },
];

// Time Slots
const PICKUP_SLOTS = [
  { id: 'morning', time: '8:00 AM - 12:00 PM', label: 'Morning' },
  { id: 'afternoon', time: '12:00 PM - 5:00 PM', label: 'Afternoon' },
  { id: 'evening', time: '5:00 PM - 9:00 PM', label: 'Evening' },
];

// Order Steps
const ORDER_STEPS = [
  { id: 'service', title: 'Choose Service', icon: Shirt },
  { id: 'details', title: 'Order Details', icon: Scale },
  { id: 'schedule', title: 'Schedule', icon: Calendar },
  { id: 'address', title: 'Address', icon: MapPin },
  { id: 'payment', title: 'Payment', icon: CreditCard },
  { id: 'confirm', title: 'Confirm', icon: CheckCircle2 },
];

function ServiceCard({ service, selected, onSelect }: { 
  service: typeof SERVICE_OPTIONS[0]; 
  selected: boolean;
  onSelect: () => void;
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
      onClick={onSelect}
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
              <Badge className="text-xs" style={{ backgroundColor: service.color }}>Popular</Badge>
            )}
          </div>
        </div>
        <h3 className="font-bold mt-4">{service.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-bold" style={{ color: service.color }}>
            ${service.pricePerLb.toFixed(2)}
          </span>
          <span className="text-muted-foreground">/lb</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AddonItem({ addon, selected, onToggle }: {
  addon: typeof ADDONS[0];
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = addon.icon;
  
  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
      }`}
      onClick={onToggle}
      data-testid={`addon-${addon.id}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${selected ? 'bg-primary/10' : 'bg-muted'}`}>
          <Icon className={`h-5 w-5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <div className="font-medium">{addon.name}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-primary">+${addon.price.toFixed(2)}</span>
        <Switch checked={selected} />
      </div>
    </div>
  );
}

function TimeSlotCard({ slot, selected, onSelect }: {
  slot: typeof PICKUP_SLOTS[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        selected ? 'border-2 border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
      data-testid={`slot-${slot.id}`}
    >
      <CardContent className="p-4 text-center">
        <div className="font-bold">{slot.label}</div>
        <div className="text-sm text-muted-foreground">{slot.time}</div>
      </CardContent>
    </Card>
  );
}

export default function LaundryOrderPortal() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState('wash-dry-fold');
  const [estimatedWeight, setEstimatedWeight] = useState(15);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('morning');
  const [deliverySlot, setDeliverySlot] = useState('afternoon');
  const [addressType, setAddressType] = useState('home');
  const [address, setAddress] = useState({
    street: '',
    apt: '',
    city: '',
    state: '',
    zip: '',
    instructions: '',
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  // Calculate order total
  const selectedServiceData = SERVICE_OPTIONS.find(s => s.id === selectedService);
  const serviceTotal = (selectedServiceData?.pricePerLb || 0) * estimatedWeight;
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = ADDONS.find(a => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);
  const subtotal = serviceTotal + addonsTotal;
  const deliveryFee = subtotal >= BUSINESS_CONFIG.freeDeliveryThreshold ? 0 : BUSINESS_CONFIG.deliveryFee;
  const total = subtotal + deliveryFee;

  const progress = ((currentStep + 1) / ORDER_STEPS.length) * 100;

  return (
    <>
      <Helmet>
        <title>Order Laundry | {BUSINESS_CONFIG.name}</title>
        <meta name="description" content={`Order laundry pickup and delivery from ${BUSINESS_CONFIG.name}. ${BUSINESS_CONFIG.tagline}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Business Header */}
        <div 
          className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur"
          style={{ borderBottomColor: `${BUSINESS_CONFIG.primaryColor}30` }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${BUSINESS_CONFIG.primaryColor}15` }}
                >
                  <Sparkles className="h-6 w-6" style={{ color: BUSINESS_CONFIG.primaryColor }} />
                </div>
                <div>
                  <h1 className="font-bold text-xl">{BUSINESS_CONFIG.name}</h1>
                  <p className="text-sm text-muted-foreground">{BUSINESS_CONFIG.tagline}</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {BUSINESS_CONFIG.phone}
                </div>
                <Badge 
                  variant="outline" 
                  className="gap-1"
                  style={{ borderColor: BUSINESS_CONFIG.primaryColor, color: BUSINESS_CONFIG.primaryColor }}
                >
                  <Clock className="h-3 w-3" />
                  {BUSINESS_CONFIG.turnaroundHours}hr Turnaround
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Order Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-3">
              {ORDER_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => index <= currentStep && setCurrentStep(index)}
                    className={`flex flex-col items-center gap-1 ${
                      isActive 
                        ? 'text-primary' 
                        : isCompleted 
                          ? 'text-green-600' 
                          : 'text-muted-foreground'
                    }`}
                    disabled={index > currentStep}
                  >
                    <div className={`p-2 rounded-full ${
                      isActive 
                        ? 'bg-primary/10' 
                        : isCompleted 
                          ? 'bg-green-500/10' 
                          : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs hidden sm:block">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Choose Service */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Choose Your Service</h2>
                    <p className="text-muted-foreground">Select how you'd like your laundry handled</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {SERVICE_OPTIONS.map((service) => (
                      <ServiceCard 
                        key={service.id}
                        service={service}
                        selected={selectedService === service.id}
                        onSelect={() => setSelectedService(service.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Order Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Order Details</h2>
                    <p className="text-muted-foreground">Estimate your laundry weight and add extras</p>
                  </div>
                  
                  {/* Weight Estimator */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-primary" />
                        Estimated Weight
                      </CardTitle>
                      <CardDescription>
                        Don't worry - you'll only pay for actual weight
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-center gap-6">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEstimatedWeight(Math.max(BUSINESS_CONFIG.minimumOrder, estimatedWeight - 5))}
                          data-testid="button-decrease-weight"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-primary">{estimatedWeight}</div>
                          <div className="text-muted-foreground">pounds</div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEstimatedWeight(estimatedWeight + 5)}
                          data-testid="button-increase-weight"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Slider
                        value={[estimatedWeight]}
                        onValueChange={(v) => setEstimatedWeight(v[0])}
                        min={BUSINESS_CONFIG.minimumOrder}
                        max={100}
                        step={1}
                        className="mt-4"
                      />
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{BUSINESS_CONFIG.minimumOrder} lbs min</span>
                        <span>100 lbs</span>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground">Estimated cost for this service:</div>
                        <div className="text-2xl font-bold text-primary">
                          ${serviceTotal.toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add-ons */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Add-on Services
                      </CardTitle>
                      <CardDescription>
                        Customize your laundry experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {ADDONS.map((addon) => (
                        <AddonItem 
                          key={addon.id}
                          addon={addon}
                          selected={selectedAddons.includes(addon.id)}
                          onToggle={() => toggleAddon(addon.id)}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Schedule Pickup & Delivery</h2>
                    <p className="text-muted-foreground">Choose when we should pick up and return your laundry</p>
                  </div>
                  
                  {/* Pickup Date */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Pickup Date
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input 
                        type="date" 
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="max-w-xs"
                        data-testid="input-pickup-date"
                      />
                    </CardContent>
                  </Card>

                  {/* Pickup Time Slot */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Pickup Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {PICKUP_SLOTS.map((slot) => (
                          <TimeSlotCard 
                            key={slot.id}
                            slot={slot}
                            selected={pickupSlot === slot.id}
                            onSelect={() => setPickupSlot(slot.id)}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery Time Slot */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Delivery Time (Next Day)
                      </CardTitle>
                      <CardDescription>
                        Your laundry will be ready within {BUSINESS_CONFIG.turnaroundHours} hours
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {PICKUP_SLOTS.map((slot) => (
                          <TimeSlotCard 
                            key={slot.id}
                            slot={slot}
                            selected={deliverySlot === slot.id}
                            onSelect={() => setDeliverySlot(slot.id)}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Address */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Pickup & Delivery Address</h2>
                    <p className="text-muted-foreground">Where should we pick up and deliver?</p>
                  </div>
                  
                  {/* Address Type */}
                  <div className="flex gap-4">
                    <Button
                      variant={addressType === 'home' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={() => setAddressType('home')}
                    >
                      <Home className="h-4 w-4" />
                      Home
                    </Button>
                    <Button
                      variant={addressType === 'office' ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={() => setAddressType('office')}
                    >
                      <Building className="h-4 w-4" />
                      Office
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name"
                          placeholder="John Smith"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1"
                          data-testid="input-customer-name"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input 
                            id="phone"
                            placeholder="(555) 123-4567"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                            className="mt-1"
                            data-testid="input-customer-phone"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email"
                            type="email"
                            placeholder="john@email.com"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-1"
                            data-testid="input-customer-email"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Address Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input 
                          id="street"
                          placeholder="123 Main Street"
                          value={address.street}
                          onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                          className="mt-1"
                          data-testid="input-street"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apt">Apt/Suite/Unit (Optional)</Label>
                        <Input 
                          id="apt"
                          placeholder="Apt 4B"
                          value={address.apt}
                          onChange={(e) => setAddress(prev => ({ ...prev, apt: e.target.value }))}
                          className="mt-1"
                          data-testid="input-apt"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city"
                            placeholder="Los Angeles"
                            value={address.city}
                            onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                            className="mt-1"
                            data-testid="input-city"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input 
                            id="state"
                            placeholder="CA"
                            value={address.state}
                            onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                            className="mt-1"
                            data-testid="input-state"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zip">ZIP Code</Label>
                          <Input 
                            id="zip"
                            placeholder="90001"
                            value={address.zip}
                            onChange={(e) => setAddress(prev => ({ ...prev, zip: e.target.value }))}
                            className="mt-1"
                            data-testid="input-zip"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                        <Textarea 
                          id="instructions"
                          placeholder="Gate code, parking info, or special instructions..."
                          value={address.instructions}
                          onChange={(e) => setAddress(prev => ({ ...prev, instructions: e.target.value }))}
                          className="mt-1"
                          data-testid="input-instructions"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 5: Payment */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Payment Method</h2>
                    <p className="text-muted-foreground">Secure payment processing</p>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Add Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input 
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          className="mt-1"
                          data-testid="input-card-number"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <Label htmlFor="expiry">Expiration Date</Label>
                          <Input 
                            id="expiry"
                            placeholder="MM/YY"
                            className="mt-1"
                            data-testid="input-expiry"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input 
                            id="cvv"
                            placeholder="123"
                            className="mt-1"
                            data-testid="input-cvv"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-700">Your payment info is secure and encrypted</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 6: Confirm */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-4">
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Review Your Order</h2>
                    <p className="text-muted-foreground">Everything look good? Confirm to place your order</p>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {/* Service */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shirt className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{selectedServiceData?.name}</div>
                            <div className="text-sm text-muted-foreground">~{estimatedWeight} lbs</div>
                          </div>
                        </div>
                        <span className="font-bold">${serviceTotal.toFixed(2)}</span>
                      </div>
                      
                      {/* Add-ons */}
                      {selectedAddons.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Add-ons</div>
                            {selectedAddons.map(addonId => {
                              const addon = ADDONS.find(a => a.id === addonId);
                              return addon ? (
                                <div key={addonId} className="flex justify-between text-sm">
                                  <span>{addon.name}</span>
                                  <span>+${addon.price.toFixed(2)}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </>
                      )}
                      
                      {/* Schedule */}
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Pickup: {pickupDate || 'Not selected'}</div>
                          <div className="text-sm text-muted-foreground">
                            {PICKUP_SLOTS.find(s => s.id === pickupSlot)?.time}
                          </div>
                        </div>
                      </div>
                      
                      {/* Address */}
                      <Separator />
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{address.street || 'No address entered'}</div>
                          <div className="text-sm text-muted-foreground">
                            {address.city && `${address.city}, ${address.state} ${address.zip}`}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="gap-2"
                  data-testid="button-prev-step"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                
                {currentStep < ORDER_STEPS.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="gap-2"
                    data-testid="button-next-step"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    data-testid="button-place-order"
                  >
                    Place Order
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{selectedServiceData?.name}</span>
                      <span>${serviceTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">~{estimatedWeight} lbs × ${selectedServiceData?.pricePerLb.toFixed(2)}/lb</span>
                    </div>
                    
                    {selectedAddons.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Add-ons ({selectedAddons.length})</span>
                        <span>+${addonsTotal.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        <span>${deliveryFee.toFixed(2)}</span>
                      )}
                    </div>
                    
                    {deliveryFee > 0 && (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        Add ${(BUSINESS_CONFIG.freeDeliveryThreshold - subtotal).toFixed(2)} more for free delivery!
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Estimated Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Final amount based on actual weight at pickup
                    </div>
                  </CardContent>
                </Card>

                {/* Trust Badges */}
                <Card className="mt-4">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>100% Satisfaction Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-primary" />
                      <span>{BUSINESS_CONFIG.turnaroundHours}-Hour Turnaround</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>4.9★ Average Rating</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
