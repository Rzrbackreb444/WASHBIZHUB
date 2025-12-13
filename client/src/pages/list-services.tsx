import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";
import {
  Wrench,
  Plus,
  ImagePlus,
  Trash2,
  Check,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User,
  Globe,
  Clock,
  Shield,
  Star,
  CheckCircle,
  Building2,
  Sparkles,
  Settings,
  Truck,
  Palette,
  BarChart3,
  Megaphone,
  Calculator,
  FileText,
  Loader2,
} from "lucide-react";

const SERVICE_CATEGORIES = [
  { value: "repair-maintenance", label: "Repair & Maintenance", icon: Wrench },
  { value: "installation", label: "Equipment Installation", icon: Settings },
  { value: "consulting", label: "Business Consulting", icon: BarChart3 },
  { value: "marketing", label: "Marketing & Advertising", icon: Megaphone },
  { value: "accounting", label: "Accounting & Bookkeeping", icon: Calculator },
  { value: "legal", label: "Legal Services", icon: FileText },
  { value: "design", label: "Store Design & Renovation", icon: Palette },
  { value: "delivery", label: "Pickup & Delivery Setup", icon: Truck },
  { value: "cleaning", label: "Professional Cleaning", icon: Sparkles },
  { value: "software", label: "Software & POS Systems", icon: Settings },
  { value: "financing", label: "Financing & Lending", icon: DollarSign },
  { value: "other", label: "Other Services", icon: Star },
];

const SERVICE_AREAS = [
  { value: "local", label: "Local Only (within 50 miles)" },
  { value: "regional", label: "Regional (within state)" },
  { value: "nationwide", label: "Nationwide" },
  { value: "remote", label: "Remote / Virtual Only" },
];

const EXPERIENCE_LEVELS = [
  { value: "1-2", label: "1-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
];

const listingSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(50, "Please provide at least 50 characters describing your services").max(2000),
  category: z.string().min(1, "Please select a category"),
  serviceArea: z.string().min(1, "Please select your service area"),
  yearsExperience: z.string().optional(),
  hourlyRate: z.string().optional(),
  projectRate: z.string().optional(),
  freeConsultation: z.boolean().default(false),
  insured: z.boolean().default(false),
  licensed: z.boolean().default(false),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().optional(),
  website: z.string().optional(),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

const steps = [
  { id: 1, title: "Service Details", description: "What services do you offer?" },
  { id: 2, title: "Pricing & Credentials", description: "Your rates and qualifications" },
  { id: 3, title: "Contact Info", description: "How to reach you" },
  { id: 4, title: "Review", description: "Confirm your listing" },
];

export default function ListServicesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      businessName: "",
      title: "",
      description: "",
      category: "",
      serviceArea: "",
      yearsExperience: "",
      hourlyRate: "",
      projectRate: "",
      freeConsultation: false,
      insured: false,
      licensed: false,
      city: "",
      state: "",
      zipCode: "",
      website: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const payload = {
        sellerName: data.contactName,
        sellerEmail: data.contactEmail,
        sellerPhone: data.contactPhone || "",
        title: data.title,
        description: data.description,
        category: "services",
        subcategory: data.category,
        price: data.hourlyRate ? parseFloat(data.hourlyRate) : (data.projectRate ? parseFloat(data.projectRate) : null),
        priceType: data.hourlyRate ? "hourly" : "fixed",
        city: data.city,
        state: data.state,
        country: "USA",
        zipCode: data.zipCode || "",
        images: images,
        businessName: data.businessName,
        website: data.website,
        serviceArea: data.serviceArea,
        yearsExperience: data.yearsExperience,
        freeConsultation: data.freeConsultation,
        insured: data.insured,
        licensed: data.licensed,
        specialties: specialties,
      };
      return apiRequest("POST", "/api/marketplace/listings", payload);
    },
    onSuccess: () => {
      toast({
        title: "Service Listed!",
        description: "Your service listing has been submitted for review. You'll receive a confirmation email shortly.",
      });
      navigate("/classifieds?category=services");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addImage = () => {
    if (newImageUrl && images.length < 10) {
      setImages([...images, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addSpecialty = () => {
    if (newSpecialty && specialties.length < 10) {
      setSpecialties([...specialties, newSpecialty]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: ListingFormData) => {
    createMutation.mutate(data);
  };

  const selectedCategory = SERVICE_CATEGORIES.find(c => c.value === form.watch("category"));

  return (
    <>
      <SEO 
        title="List Your Services | WashBizHub"
        description="Offer your professional services to 73,000+ laundromat owners. Repair, maintenance, consulting, marketing, and more."
        keywords={["laundromat services", "equipment repair", "laundry consulting", "commercial laundry maintenance"]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-400">
              <Wrench className="w-3 h-3 mr-1" />
              Professional Services
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              List Your Services
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto">
              Connect with 73,000+ laundromat owners looking for professional services
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex justify-between items-center max-w-2xl mx-auto">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${
                    currentStep >= step.id 
                      ? 'bg-amber-500 text-black' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-12 sm:w-20 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-amber-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-white font-medium">{steps[currentStep - 1].title}</p>
              <p className="text-slate-400 text-sm">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="border-slate-700/50 bg-slate-800/30">
                <CardContent className="pt-6 space-y-6">
                  {/* Step 1: Service Details */}
                  {currentStep === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Business Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Your Company Name"
                                className="bg-slate-900/50 border-slate-700"
                                data-testid="input-business-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Service Title</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., Commercial Washer Repair & Maintenance"
                                className="bg-slate-900/50 border-slate-700"
                                data-testid="input-title"
                              />
                            </FormControl>
                            <FormDescription className="text-slate-500">
                              A clear, descriptive title for your service
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Service Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-900/50 border-slate-700" data-testid="select-category">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SERVICE_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    <div className="flex items-center gap-2">
                                      <cat.icon className="w-4 h-4" />
                                      {cat.label}
                                    </div>
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Service Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Describe your services in detail. Include what you offer, your approach, and why clients should choose you..."
                                className="bg-slate-900/50 border-slate-700 min-h-[150px]"
                                data-testid="input-description"
                              />
                            </FormControl>
                            <FormDescription className="text-slate-500">
                              Minimum 50 characters. Be specific about what you offer.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="serviceArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Service Area</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-900/50 border-slate-700" data-testid="select-service-area">
                                  <SelectValue placeholder="Where do you provide services?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SERVICE_AREAS.map((area) => (
                                  <SelectItem key={area.value} value={area.value}>
                                    {area.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Specialties */}
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">
                          Specialties / Brands Serviced
                        </label>
                        <div className="flex gap-2 mb-3">
                          <Input
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            placeholder="e.g., Speed Queen, Dexter, Maytag..."
                            className="bg-slate-900/50 border-slate-700"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                            data-testid="input-specialty"
                          />
                          <Button type="button" variant="outline" onClick={addSpecialty} data-testid="button-add-specialty">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {specialties.map((specialty, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="gap-1 pr-1"
                            >
                              {specialty}
                              <button 
                                type="button" 
                                onClick={() => removeSpecialty(idx)}
                                className="ml-1 hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2: Pricing & Credentials */}
                  {currentStep === 2 && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Hourly Rate (optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input 
                                    {...field} 
                                    type="number"
                                    placeholder="75"
                                    className="bg-slate-900/50 border-slate-700 pl-8"
                                    data-testid="input-hourly-rate"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="projectRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Project Rate (optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input 
                                    {...field} 
                                    type="number"
                                    placeholder="500"
                                    className="bg-slate-900/50 border-slate-700 pl-8"
                                    data-testid="input-project-rate"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-slate-500">
                                Starting price for projects
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="yearsExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Years of Experience</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-900/50 border-slate-700" data-testid="select-experience">
                                  <SelectValue placeholder="Select experience level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EXPERIENCE_LEVELS.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4 pt-4 border-t border-slate-700">
                        <h3 className="text-white font-medium">Credentials & Trust Signals</h3>
                        
                        <FormField
                          control={form.control}
                          name="freeConsultation"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-white">Free Consultation</FormLabel>
                                <FormDescription className="text-slate-500">
                                  Offer a free initial consultation
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-free-consultation"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="insured"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-white">Insured</FormLabel>
                                <FormDescription className="text-slate-500">
                                  You carry liability insurance
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-insured"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="licensed"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-white">Licensed</FormLabel>
                                <FormDescription className="text-slate-500">
                                  You hold relevant professional licenses
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-licensed"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Portfolio Images */}
                      <div>
                        <label className="text-sm font-medium text-white mb-2 block">
                          Portfolio Images (optional)
                        </label>
                        <div className="flex gap-2 mb-3">
                          <Input
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Paste image URL..."
                            className="bg-slate-900/50 border-slate-700"
                            data-testid="input-image-url"
                          />
                          <Button type="button" variant="outline" onClick={addImage} data-testid="button-add-image">
                            <ImagePlus className="w-4 h-4" />
                          </Button>
                        </div>
                        {images.length > 0 && (
                          <div className="grid grid-cols-5 gap-2">
                            {images.map((url, idx) => (
                              <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-slate-700">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <button 
                                  type="button"
                                  onClick={() => removeImage(idx)}
                                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-destructive"
                                >
                                  <Trash2 className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2">Up to 10 images showing your work</p>
                      </div>
                    </>
                  )}

                  {/* Step 3: Contact Info */}
                  {currentStep === 3 && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">City</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Your city"
                                  className="bg-slate-900/50 border-slate-700"
                                  data-testid="input-city"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">State</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="e.g., CA, TX, FL"
                                  className="bg-slate-900/50 border-slate-700"
                                  data-testid="input-state"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">ZIP Code (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="12345"
                                className="bg-slate-900/50 border-slate-700"
                                data-testid="input-zip"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Website (optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input 
                                  {...field} 
                                  placeholder="https://yourwebsite.com"
                                  className="bg-slate-900/50 border-slate-700 pl-10"
                                  data-testid="input-website"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4 border-t border-slate-700 space-y-4">
                        <h3 className="text-white font-medium">Contact Information</h3>
                        
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Contact Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input 
                                    {...field} 
                                    placeholder="Your name"
                                    className="bg-slate-900/50 border-slate-700 pl-10"
                                    data-testid="input-contact-name"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Contact Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input 
                                    {...field} 
                                    type="email"
                                    placeholder="you@example.com"
                                    className="bg-slate-900/50 border-slate-700 pl-10"
                                    data-testid="input-contact-email"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Contact Phone (optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input 
                                    {...field} 
                                    placeholder="(555) 123-4567"
                                    className="bg-slate-900/50 border-slate-700 pl-10"
                                    data-testid="input-contact-phone"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Review Your Listing</h3>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-slate-500 text-sm">Business Name</p>
                            <p className="text-white font-medium">{form.watch("businessName") || "-"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-sm">Category</p>
                            <p className="text-white font-medium">{selectedCategory?.label || "-"}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-sm">Service Area</p>
                            <p className="text-white font-medium">
                              {SERVICE_AREAS.find(a => a.value === form.watch("serviceArea"))?.label || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-sm">Location</p>
                            <p className="text-white font-medium">
                              {form.watch("city")}, {form.watch("state")}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-slate-500 text-sm">Service Title</p>
                          <p className="text-white font-medium">{form.watch("title") || "-"}</p>
                        </div>

                        <div>
                          <p className="text-slate-500 text-sm">Description</p>
                          <p className="text-slate-300 text-sm">{form.watch("description") || "-"}</p>
                        </div>

                        {(form.watch("hourlyRate") || form.watch("projectRate")) && (
                          <div className="flex gap-6">
                            {form.watch("hourlyRate") && (
                              <div>
                                <p className="text-slate-500 text-sm">Hourly Rate</p>
                                <p className="text-white font-medium">${form.watch("hourlyRate")}/hr</p>
                              </div>
                            )}
                            {form.watch("projectRate") && (
                              <div>
                                <p className="text-slate-500 text-sm">Project Rate</p>
                                <p className="text-white font-medium">From ${form.watch("projectRate")}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                          {form.watch("freeConsultation") && (
                            <Badge variant="outline" className="border-green-500/30 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Free Consultation
                            </Badge>
                          )}
                          {form.watch("insured") && (
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                              <Shield className="w-3 h-3 mr-1" />
                              Insured
                            </Badge>
                          )}
                          {form.watch("licensed") && (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                              <Star className="w-3 h-3 mr-1" />
                              Licensed
                            </Badge>
                          )}
                        </div>

                        {specialties.length > 0 && (
                          <div>
                            <p className="text-slate-500 text-sm mb-2">Specialties</p>
                            <div className="flex flex-wrap gap-2">
                              {specialties.map((s, idx) => (
                                <Badge key={idx} variant="secondary">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <p className="text-amber-400 text-sm">
                          <strong>Note:</strong> All inquiries will be sent to consult@washbizhub.com. 
                          Your listing will be reviewed before going live.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-slate-700">
                    {currentStep > 1 ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                        className="gap-2"
                        data-testid="button-prev-step"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                    ) : (
                      <Link href="/list-on-washbizhub">
                        <Button type="button" variant="outline" className="gap-2" data-testid="button-cancel">
                          <ArrowLeft className="w-4 h-4" />
                          Cancel
                        </Button>
                      </Link>
                    )}

                    {currentStep < steps.length ? (
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        className="gap-2 bg-amber-500 hover:bg-amber-600 text-black"
                        data-testid="button-next-step"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button 
                        type="submit"
                        disabled={createMutation.isPending}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        data-testid="button-submit-listing"
                      >
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Submit Listing
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
