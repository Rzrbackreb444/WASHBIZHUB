import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { 
  ShoppingCart, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle, 
  Loader2, Package, User, MapPin, Clock, DollarSign, Building2,
  Wrench, Send, Shield, Award, Star, Users, Phone, Mail, ChevronDown
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Commercial Laundry Equipment Quote Service",
  "description": "Get free personalized quotes for commercial laundry equipment from 585+ verified distributors across 30+ brands including Speed Queen, Dexter, and Huebsch.",
  "provider": {
    "@type": "Organization",
    "name": "WashBizHub",
    "url": "https://washbizhub.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://washbizhub.com/assets/washbizhub-logo.png",
      "width": 200,
      "height": 60
    },
    "sameAs": [
      "https://facebook.com/washbizhub1",
      "https://twitter.com/washbizhub"
    ]
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "serviceType": "Equipment Procurement",
  "category": "Commercial Laundry Equipment",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free equipment quotes with no obligation",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127",
    "bestRating": "5"
  }
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How quickly will I receive equipment quotes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our equipment specialists review every inquiry within 24 hours. You'll receive personalized quotes from verified distributors in your area, typically within 1-3 business days depending on equipment complexity."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a cost for requesting equipment quotes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, our equipment quote service is completely free with no obligation. We connect you directly with authorized distributors who can provide competitive pricing on Speed Queen, Dexter, Huebsch, Maytag, and 30+ other commercial laundry brands."
      }
    },
    {
      "@type": "Question",
      "name": "What brands of commercial laundry equipment can I get quotes for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We work with 585+ verified distributors covering 30+ major brands including Speed Queen, Dexter, Huebsch, Maytag, Alliance, Wascomat, Electrolux, Milnor, UniMac, Continental Girbau, LG Commercial, Miele Professional, and more."
      }
    },
    {
      "@type": "Question",
      "name": "Can I get financing for commercial laundry equipment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Many of our distributor partners offer equipment financing options. Simply check the financing option when building your equipment list, and we'll connect you with distributors who can provide financing solutions tailored to your business."
      }
    }
  ]
};

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://washbizhub.com" },
    { "@type": "ListItem", "position": 2, "name": "Equipment", "item": "https://washbizhub.com/equipment-financing" },
    { "@type": "ListItem", "position": 3, "name": "Equipment Quote Builder", "item": "https://washbizhub.com/equipment-builder" }
  ]
};

const MAJOR_BRANDS = [
  "Speed Queen", "Dexter", "Huebsch", "Maytag", "Alliance", "Wascomat",
  "Electrolux", "Milnor", "UniMac", "Continental Girbau", "LG Commercial",
  "Miele Professional", "IPSO", "Primus", "Fagor", "Jensen", "Yamamoto"
];

const EQUIPMENT_TYPES = [
  { value: "front_load_washer", label: "Front Load Washer" },
  { value: "top_load_washer", label: "Top Load Washer" },
  { value: "washer_extractor", label: "Washer-Extractor" },
  { value: "tumble_dryer", label: "Tumble Dryer" },
  { value: "stack_washer_dryer", label: "Stack Washer/Dryer" },
  { value: "ironer", label: "Ironer/Flatwork" },
  { value: "folder", label: "Folder" },
  { value: "finishing", label: "Finishing Equipment" },
];

const CAPACITIES = {
  washer: ["20 lb", "30 lb", "40 lb", "60 lb", "80 lb", "100 lb", "125 lb", "150 lb"],
  dryer: ["30 lb", "45 lb", "55 lb", "75 lb", "120 lb", "170 lb"],
  other: ["Small", "Medium", "Large", "Industrial"],
};

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const BUSINESS_TYPES = [
  { value: "new_laundromat", label: "Starting a New Laundromat" },
  { value: "existing_laundromat", label: "Existing Laundromat Owner" },
  { value: "replacement", label: "Equipment Replacement" },
  { value: "expansion", label: "Expanding Current Location" },
  { value: "multi_housing", label: "Multi-Housing/Apartment" },
  { value: "other", label: "Other" },
];

const TIMELINES = [
  { value: "immediate", label: "Immediate (Within 1 month)" },
  { value: "1_3_months", label: "1-3 Months" },
  { value: "3_6_months", label: "3-6 Months" },
  { value: "6_12_months", label: "6-12 Months" },
  { value: "just_researching", label: "Just Researching" },
];

const BUDGETS = [
  { value: "under_50k", label: "Under $50,000" },
  { value: "50k_100k", label: "$50,000 - $100,000" },
  { value: "100k_250k", label: "$100,000 - $250,000" },
  { value: "250k_500k", label: "$250,000 - $500,000" },
  { value: "over_500k", label: "Over $500,000" },
  { value: "not_sure", label: "Not Sure Yet" },
];

interface EquipmentItem {
  id: string;
  brand: string;
  type: string;
  capacity: string;
  quantity: number;
  notes?: string;
}

const contactFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone must be at least 10 digits"),
  businessName: z.string().optional(),
  businessType: z.string().min(1, "Please select a business type"),
  state: z.string().min(1, "Please select a state"),
  city: z.string().optional(),
  timeline: z.string().min(1, "Please select a timeline"),
  budget: z.string().optional(),
  financingNeeded: z.boolean().default(false),
  additionalNotes: z.string().optional(),
  preferredDistributor: z.string().optional(),
  howHeard: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function EquipmentBuilder() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<EquipmentItem>>({
    brand: "",
    type: "",
    capacity: "",
    quantity: 1,
    notes: "",
  });

  const { data: distributors } = useQuery<any[]>({
    queryKey: ["/api/distributors"],
    queryFn: () => fetch("/api/distributors").then((res) => res.json()),
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      businessName: "",
      businessType: "",
      state: "",
      city: "",
      timeline: "",
      budget: "",
      financingNeeded: false,
      additionalNotes: "",
      preferredDistributor: "",
      howHeard: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch("/api/equipment-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          equipmentList,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Equipment Request Submitted!",
        description: "Our equipment specialists will contact you within 24 hours with personalized quotes.",
      });
      setStep(4);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const addEquipmentItem = () => {
    if (!currentItem.brand || !currentItem.type || !currentItem.capacity) {
      toast({
        title: "Missing Information",
        description: "Please fill in brand, type, and capacity.",
        variant: "destructive",
      });
      return;
    }

    setEquipmentList([
      ...equipmentList,
      {
        id: Date.now().toString(),
        brand: currentItem.brand!,
        type: currentItem.type!,
        capacity: currentItem.capacity!,
        quantity: currentItem.quantity || 1,
        notes: currentItem.notes,
      },
    ]);

    setCurrentItem({
      brand: currentItem.brand,
      type: "",
      capacity: "",
      quantity: 1,
      notes: "",
    });

    toast({
      title: "Equipment Added",
      description: `Added ${currentItem.quantity}x ${currentItem.brand} ${currentItem.type}`,
    });
  };

  const removeEquipmentItem = (id: string) => {
    setEquipmentList(equipmentList.filter((item) => item.id !== id));
  };

  const getCapacityOptions = () => {
    if (!currentItem.type) return CAPACITIES.other;
    if (currentItem.type.includes("washer")) return CAPACITIES.washer;
    if (currentItem.type.includes("dryer")) return CAPACITIES.dryer;
    return CAPACITIES.other;
  };

  const handleSubmit = (data: ContactFormData) => {
    if (equipmentList.length === 0) {
      toast({
        title: "No Equipment Selected",
        description: "Please add at least one equipment item.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(data);
  };

  const getTypeLabel = (value: string) => {
    return EQUIPMENT_TYPES.find((t) => t.value === value)?.label || value;
  };

  const totalItems = equipmentList.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Helmet>
        <title>Commercial Laundry Equipment Quotes | Free Quote Builder | WashBizHub</title>
        <meta name="description" content="Get free personalized quotes for commercial laundry equipment from 585+ verified distributors. Speed Queen, Dexter, Huebsch, Maytag & 30+ brands. Expert equipment specialists respond within 24 hours." />
        <meta name="keywords" content="commercial laundry equipment, laundromat equipment quotes, Speed Queen distributor, Dexter laundry equipment, Huebsch commercial washers, coin laundry equipment, laundromat startup equipment" />
        <link rel="canonical" href="https://washbizhub.com/equipment-builder" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Free Commercial Laundry Equipment Quotes | WashBizHub" />
        <meta property="og:description" content="Build your equipment list and get personalized quotes from 585+ verified distributors across 30+ major brands. No cost, no obligation." />
        <meta property="og:url" content="https://washbizhub.com/equipment-builder" />
        <meta property="og:site_name" content="WashBizHub" />
        <meta property="og:image" content="https://washbizhub.com/og-equipment-builder.jpg" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Commercial Laundry Equipment Quotes | WashBizHub" />
        <meta name="twitter:description" content="Get personalized quotes from 585+ verified distributors. Speed Queen, Dexter, Huebsch & more." />
        
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="author" content="WashBizHub Equipment Specialists" />
        
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1628] via-[#1a2744] to-[#0A1628] border-b border-[#C8A661]/20">
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Package className="w-3 h-3 mr-1" />
                Free Equipment Quotes
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Equipment Inquiry Builder
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Build your complete equipment list and get personalized quotes from verified distributors. All inquiries handled by our equipment specialists.
              </p>

              <div className="flex justify-center gap-2 mt-8">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex items-center ${s < 3 ? "gap-2" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step >= s
                          ? "bg-[#C8A661] text-black"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`w-12 md:w-24 h-1 rounded ${
                          step > s ? "bg-[#C8A661]" : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-8 mt-4 text-sm text-gray-400">
                <span className={step >= 1 ? "text-[#C8A661]" : ""}>Build List</span>
                <span className={step >= 2 ? "text-[#C8A661]" : ""}>Your Details</span>
                <span className={step >= 3 ? "text-[#C8A661]" : ""}>Submit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {step === 1 && (
              <div className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-[#C8A661]" />
                      Add Equipment
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Select brand, type, capacity, and quantity for each item
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Brand</Label>
                        <Select
                          value={currentItem.brand}
                          onValueChange={(v) => setCurrentItem({ ...currentItem, brand: v })}
                        >
                          <SelectTrigger data-testid="select-brand" className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {MAJOR_BRANDS.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Equipment Type</Label>
                        <Select
                          value={currentItem.type}
                          onValueChange={(v) => setCurrentItem({ ...currentItem, type: v, capacity: "" })}
                        >
                          <SelectTrigger data-testid="select-type" className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {EQUIPMENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Capacity</Label>
                        <Select
                          value={currentItem.capacity}
                          onValueChange={(v) => setCurrentItem({ ...currentItem, capacity: v })}
                        >
                          <SelectTrigger data-testid="select-capacity" className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select capacity" />
                          </SelectTrigger>
                          <SelectContent>
                            {getCapacityOptions().map((cap) => (
                              <SelectItem key={cap} value={cap}>
                                {cap}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Quantity</Label>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={currentItem.quantity}
                          onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                          data-testid="input-quantity"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Notes (Optional)</Label>
                      <Input
                        value={currentItem.notes}
                        onChange={(e) => setCurrentItem({ ...currentItem, notes: e.target.value })}
                        placeholder="e.g., Prefer coin-op, need installation..."
                        data-testid="input-notes"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <Button
                      onClick={addEquipmentItem}
                      data-testid="button-add-equipment"
                      className="w-full bg-[#C8A661] hover:bg-[#B8964E] text-black font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Equipment List
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-[#C8A661]" />
                        Your Equipment List
                      </div>
                      <Badge className="bg-[#C8A661]/20 text-[#C8A661]">
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {equipmentList.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No equipment added yet. Use the form above to build your list.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {equipmentList.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-[#C8A661]/20 text-[#C8A661]">
                                  {item.quantity}x
                                </Badge>
                                <span className="text-white font-medium">{item.brand}</span>
                                <span className="text-gray-400">{getTypeLabel(item.type)}</span>
                                <span className="text-gray-500">({item.capacity})</span>
                              </div>
                              {item.notes && (
                                <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEquipmentItem(item.id)}
                              data-testid={`button-remove-${item.id}`}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-white/10">
                      <Button
                        onClick={() => setStep(2)}
                        disabled={equipmentList.length === 0}
                        data-testid="button-next-step"
                        className="w-full bg-[#C8A661] hover:bg-[#B8964E] text-black font-semibold"
                        size="lg"
                      >
                        Continue to Your Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 2 && (
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-[#C8A661]" />
                    Your Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Tell us about yourself and your project so we can connect you with the right distributors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(() => setStep(3))} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Your Name *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  data-testid="input-name"
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Email *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  data-testid="input-email"
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Phone *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  data-testid="input-phone"
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Business Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  data-testid="input-business"
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="businessType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Business Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-business-type" className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {BUSINESS_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="timeline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Timeline *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-timeline" className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="When do you need equipment?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TIMELINES.map((tl) => (
                                    <SelectItem key={tl.value} value={tl.value}>
                                      {tl.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">State *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-state" className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state} value={state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">City</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  data-testid="input-city"
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Budget Range</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-budget" className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Select range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {BUDGETS.map((b) => (
                                    <SelectItem key={b.value} value={b.value}>
                                      {b.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="financingNeeded"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 bg-white/5 rounded-lg border border-white/10">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-financing"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white">I'm interested in equipment financing</FormLabel>
                              <p className="text-sm text-gray-400">We can connect you with financing options</p>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Equipment
                        </Button>
                        <Button
                          type="submit"
                          data-testid="button-continue-review"
                          className="flex-1 bg-[#C8A661] hover:bg-[#B8964E] text-black font-semibold"
                        >
                          Review & Submit
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                      Review Your Request
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Please review your equipment list and contact information before submitting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...form}>
                    <div>
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#C8A661]" />
                        Equipment List ({totalItems} items)
                      </h3>
                      <div className="space-y-2">
                        {equipmentList.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#C8A661]/20 text-[#C8A661]">{item.quantity}x</Badge>
                              <span className="text-white">{item.brand} {getTypeLabel(item.type)}</span>
                              <span className="text-gray-500">({item.capacity})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-[#C8A661]" />
                          Contact Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-300"><span className="text-gray-500">Name:</span> {form.watch("customerName")}</p>
                          <p className="text-gray-300"><span className="text-gray-500">Email:</span> {form.watch("customerEmail")}</p>
                          <p className="text-gray-300"><span className="text-gray-500">Phone:</span> {form.watch("customerPhone")}</p>
                          {form.watch("businessName") && (
                            <p className="text-gray-300"><span className="text-gray-500">Business:</span> {form.watch("businessName")}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#C8A661]" />
                          Project Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-300">
                            <span className="text-gray-500">Type:</span>{" "}
                            {BUSINESS_TYPES.find((t) => t.value === form.watch("businessType"))?.label}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-500">Location:</span>{" "}
                            {form.watch("city") ? `${form.watch("city")}, ` : ""}{form.watch("state")}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-500">Timeline:</span>{" "}
                            {TIMELINES.find((t) => t.value === form.watch("timeline"))?.label}
                          </p>
                          {form.watch("budget") && (
                            <p className="text-gray-300">
                              <span className="text-gray-500">Budget:</span>{" "}
                              {BUDGETS.find((b) => b.value === form.watch("budget"))?.label}
                            </p>
                          )}
                          {form.watch("financingNeeded") && (
                            <Badge className="bg-green-500/20 text-green-400 mt-2">Financing Requested</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="additionalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Any additional information, specific requirements, or questions..."
                              data-testid="textarea-notes"
                              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 min-h-[100px]"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredDistributor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Preferred Distributor (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-distributor" className="bg-white/10 border-white/20 text-white">
                                <SelectValue placeholder="No preference - get quotes from all" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="no_preference">No preference - get quotes from all</SelectItem>
                              {distributors?.slice(0, 20).map((d: any) => (
                                <SelectItem key={d.id} value={d.distributorName}>
                                  {d.distributorName} ({d.brandName})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div className="bg-[#C8A661]/10 border border-[#C8A661]/20 rounded-lg p-4">
                      <p className="text-sm text-gray-300">
                        By submitting this form, you agree to be contacted by our equipment specialists at{" "}
                        <span className="text-[#C8A661] font-medium">equipment@washbizhub.com</span>{" "}
                        with personalized equipment quotes and recommendations.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={form.handleSubmit(handleSubmit)}
                        disabled={submitMutation.isPending}
                        data-testid="button-submit-inquiry"
                        className="flex-1 bg-[#C8A661] hover:bg-[#B8964E] text-black font-semibold"
                        size="lg"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Equipment Request
                          </>
                        )}
                      </Button>
                    </div>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 4 && (
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-center py-12">
                <CardContent>
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Request Submitted!</h2>
                  <p className="text-xl text-gray-300 max-w-lg mx-auto mb-8">
                    Thank you for your equipment inquiry. Our specialists will review your request and contact you within 24 hours with personalized quotes.
                  </p>
                  <div className="space-y-4">
                    <p className="text-gray-400">
                      Questions? Email us at{" "}
                      <a href="mailto:equipment@washbizhub.com" className="text-[#C8A661] hover:underline">
                        equipment@washbizhub.com
                      </a>
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep(1);
                          setEquipmentList([]);
                          form.reset();
                        }}
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        Submit Another Request
                      </Button>
                      <Button
                        onClick={() => window.location.href = "/distributors"}
                        className="bg-[#C8A661] hover:bg-[#B8964E] text-black"
                      >
                        Browse Distributors
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* E-E-A-T Trust Signals Section */}
        <section className="py-16 bg-gradient-to-b from-black to-[#0A1628]" aria-labelledby="trust-heading">
          <div className="container mx-auto px-4">
            <h2 id="trust-heading" className="text-3xl font-bold text-white text-center mb-4">
              Trusted by Laundromat Owners Nationwide
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
              Our equipment specialists have helped hundreds of laundromat owners find the right equipment at competitive prices.
            </p>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="bg-white/5 border-[#C8A661]/20 text-center p-6">
                <div className="w-14 h-14 bg-[#C8A661]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-[#C8A661]" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">585+</div>
                <p className="text-gray-400 text-sm">Verified Distributors</p>
              </Card>

              <Card className="bg-white/5 border-[#C8A661]/20 text-center p-6">
                <div className="w-14 h-14 bg-[#C8A661]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-[#C8A661]" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">30+</div>
                <p className="text-gray-400 text-sm">Major Equipment Brands</p>
              </Card>

              <Card className="bg-white/5 border-[#C8A661]/20 text-center p-6">
                <div className="w-14 h-14 bg-[#C8A661]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-[#C8A661]" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">24hr</div>
                <p className="text-gray-400 text-sm">Response Time</p>
              </Card>

              <Card className="bg-white/5 border-[#C8A661]/20 text-center p-6">
                <div className="w-14 h-14 bg-[#C8A661]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-[#C8A661]" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <p className="text-gray-400 text-sm">Free & No Obligation</p>
              </Card>
            </div>

            {/* Brand Partners */}
            <div className="text-center mb-12">
              <p className="text-gray-500 text-sm uppercase tracking-wider mb-6">Authorized Distributors For</p>
              <div className="flex flex-wrap justify-center gap-4">
                {["Speed Queen", "Dexter", "Huebsch", "Maytag", "Alliance", "Electrolux"].map((brand) => (
                  <Badge key={brand} variant="outline" className="border-white/20 text-gray-300 px-4 py-2">
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Expert Credentials */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-white text-center mb-6">Meet Our Equipment Specialists</h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#C8A661]/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-7 h-7 text-[#C8A661]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Lawrence "Laundromat Larry" Larsen</h4>
                      <p className="text-[#C8A661] text-sm mb-2">DRE #49460 | 35+ Years Experience</p>
                      <p className="text-gray-400 text-sm">Industry veteran and licensed broker specializing in laundromat equipment and business acquisitions across the United States.</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#C8A661]/20 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-7 h-7 text-[#C8A661]" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">AAdvantage Laundry Systems</h4>
                      <p className="text-[#C8A661] text-sm mb-2">Authorized Speed Queen Distributor</p>
                      <p className="text-gray-400 text-sm">Premium equipment partner providing factory-direct pricing and comprehensive service support nationwide.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="bg-gradient-to-r from-[#C8A661]/10 to-transparent border-[#C8A661]/20">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C8A661] text-[#C8A661]" />
                    ))}
                  </div>
                  <blockquote className="text-gray-300 italic mb-4">
                    "WashBizHub connected me with three distributors in my area within 48 hours. I saved over $15,000 by comparing quotes. The process was completely free."
                  </blockquote>
                  <cite className="text-white font-medium not-italic text-sm">— Michael R., Texas Laundromat Owner</cite>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-[#C8A661]/10 to-transparent border-[#C8A661]/20">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C8A661] text-[#C8A661]" />
                    ))}
                  </div>
                  <blockquote className="text-gray-300 italic mb-4">
                    "As a first-time laundromat owner, I had no idea where to start. The equipment specialists walked me through every option and found financing that fit my budget."
                  </blockquote>
                  <cite className="text-white font-medium not-italic text-sm">— Sarah K., California New Store Owner</cite>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section for AEO/Voice Search */}
        <section className="py-16 bg-[#0A1628]" aria-labelledby="faq-heading">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 id="faq-heading" className="text-3xl font-bold text-white text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-center mb-12">
              Everything you need to know about getting commercial laundry equipment quotes
            </p>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-white/5 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-[#C8A661] text-left py-6">
                  How quickly will I receive equipment quotes?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-6">
                  Our equipment specialists review every inquiry within 24 hours. You'll receive personalized quotes from verified distributors in your area, typically within 1-3 business days depending on equipment complexity. For urgent needs, mention "URGENT" in your additional notes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white/5 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-[#C8A661] text-left py-6">
                  Is there a cost for requesting equipment quotes?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-6">
                  No, our equipment quote service is completely free with no obligation. We connect you directly with authorized distributors who can provide competitive pricing on Speed Queen, Dexter, Huebsch, Maytag, and 30+ other commercial laundry brands. You're never obligated to purchase.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white/5 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-[#C8A661] text-left py-6">
                  What brands of commercial laundry equipment can I get quotes for?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-6">
                  We work with 585+ verified distributors covering 30+ major brands including Speed Queen, Dexter, Huebsch, Maytag, Alliance, Wascomat, Electrolux, Milnor, UniMac, Continental Girbau, LG Commercial, Miele Professional, IPSO, Primus, and more. Whatever brand you need, we can connect you with an authorized distributor.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white/5 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-[#C8A661] text-left py-6">
                  Can I get financing for commercial laundry equipment?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-6">
                  Yes! Many of our distributor partners offer equipment financing options with competitive rates. Simply check the "Financing Needed" option when building your equipment list, and we'll connect you with distributors who can provide financing solutions tailored to your business. Learn more about <Link href="/equipment-financing" className="text-[#C8A661] hover:underline">equipment financing options</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-white/5 border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-white hover:text-[#C8A661] text-left py-6">
                  How do I know the distributors are legitimate?
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-6">
                  All 585+ distributors in our network are verified and authorized dealers for their respective brands. Our equipment specialists personally vet each distributor for licensing, insurance, and service quality. Browse our <Link href="/distributor-locator" className="text-[#C8A661] hover:underline">Distributor Locator</Link> to see distributors in your area.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Contact CTA */}
            <div className="text-center mt-12 p-8 bg-gradient-to-r from-[#C8A661]/10 to-transparent rounded-xl border border-[#C8A661]/20">
              <h3 className="text-xl font-bold text-white mb-2">Still Have Questions?</h3>
              <p className="text-gray-400 mb-4">Our equipment specialists are here to help</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="mailto:equipment@washbizhub.com" className="inline-flex items-center gap-2 text-[#C8A661] hover:underline">
                  <Mail className="w-4 h-4" />
                  equipment@washbizhub.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Links Section */}
        <section className="py-12 bg-gradient-to-b from-[#0A1628] to-black border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link href="/distributor-locator">
                <Card className="bg-white/5 border-white/10 hover:border-[#C8A661]/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <MapPin className="w-8 h-8 text-[#C8A661] mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">Find Distributors</h3>
                    <p className="text-gray-400 text-sm">Browse 585+ verified distributors by location and brand</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/equipment-financing">
                <Card className="bg-white/5 border-white/10 hover:border-[#C8A661]/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="w-8 h-8 text-[#C8A661] mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">Equipment Financing</h3>
                    <p className="text-gray-400 text-sm">Explore financing options for your laundromat equipment</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/cleanbi-explorer">
                <Card className="bg-white/5 border-white/10 hover:border-[#C8A661]/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <Building2 className="w-8 h-8 text-[#C8A661] mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">CLEANBI Explorer</h3>
                    <p className="text-gray-400 text-sm">AI-powered location analysis for your laundromat</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
