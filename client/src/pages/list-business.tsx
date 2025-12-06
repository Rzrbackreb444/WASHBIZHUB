import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Image, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Star,
  Globe,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Loader2
} from "lucide-react";

const listingFormSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(50, "Please provide at least 50 characters describing your business"),
  shortDescription: z.string().max(160, "Short description must be under 160 characters").optional(),
  categoryId: z.string().min(1, "Please select a category"),
  ownerEmail: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  serviceArea: z.string().optional(),
  yearEstablished: z.number().min(1900).max(new Date().getFullYear()).optional(),
  employeeCount: z.string().optional(),
  servicesOffered: z.array(z.string()).optional(),
  brandsCarried: z.array(z.string()).optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingFormSchema>;

const steps = [
  { id: 1, title: "Basic Info", icon: Building2, description: "Tell us about your business" },
  { id: 2, title: "Contact & Location", icon: MapPin, description: "How can customers reach you?" },
  { id: 3, title: "Business Details", icon: Briefcase, description: "What do you offer?" },
  { id: 4, title: "Social & Media", icon: Image, description: "Connect your online presence" },
  { id: 5, title: "Review & Submit", icon: CheckCircle2, description: "Confirm your listing" },
];

const employeeOptions = [
  { value: "1-5", label: "1-5 employees" },
  { value: "6-20", label: "6-20 employees" },
  { value: "21-50", label: "21-50 employees" },
  { value: "50+", label: "50+ employees" },
];

export default function ListBusinessPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [servicesInput, setServicesInput] = useState("");
  const [brandsInput, setBrandsInput] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: categories, isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/directory/categories"],
  });

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      businessName: "",
      description: "",
      shortDescription: "",
      categoryId: "",
      ownerEmail: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      serviceArea: "",
      employeeCount: "",
      servicesOffered: [],
      brandsCarried: [],
      facebook: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      youtube: "",
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const response = await apiRequest("/api/directory/listings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Listing Submitted!",
        description: "Your business listing has been submitted for review.",
      });
      setCurrentStep(6); // Success state
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof ListingFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["businessName", "description", "categoryId", "ownerEmail"];
        break;
      case 2:
        fieldsToValidate = [];
        break;
      case 3:
        fieldsToValidate = [];
        break;
      case 4:
        fieldsToValidate = [];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = (data: ListingFormData) => {
    createListingMutation.mutate(data);
  };

  const addService = () => {
    if (servicesInput.trim()) {
      const current = form.getValues("servicesOffered") || [];
      form.setValue("servicesOffered", [...current, servicesInput.trim()]);
      setServicesInput("");
    }
  };

  const removeService = (index: number) => {
    const current = form.getValues("servicesOffered") || [];
    form.setValue("servicesOffered", current.filter((_, i) => i !== index));
  };

  const addBrand = () => {
    if (brandsInput.trim()) {
      const current = form.getValues("brandsCarried") || [];
      form.setValue("brandsCarried", [...current, brandsInput.trim()]);
      setBrandsInput("");
    }
  };

  const removeBrand = (index: number) => {
    const current = form.getValues("brandsCarried") || [];
    form.setValue("brandsCarried", current.filter((_, i) => i !== index));
  };

  // Success state
  if (currentStep === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Listing Submitted!
              </h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Your business listing has been submitted successfully. It will be visible in the directory once reviewed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setLocation("/directory")}
                  className="bg-[#39CCCC] hover:bg-[#2db3b3]"
                  data-testid="button-view-directory"
                >
                  View Directory
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setCurrentStep(1);
                  }}
                  data-testid="button-add-another"
                >
                  Add Another Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-emerald-500 text-white mb-4" data-testid="badge-free">
            <Sparkles className="w-3 h-3 mr-1" />
            FREE Listing
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            List Your Business
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Join the #1 laundromat industry directory. Get discovered by thousands of laundromat owners, operators, and investors.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      currentStep >= step.id
                        ? "bg-[#39CCCC] text-white"
                        : "bg-slate-700 text-slate-400"
                    }`}
                    data-testid={`step-indicator-${step.id}`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        currentStep > step.id ? "bg-[#39CCCC]" : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
                <span className="text-xs text-slate-400 mt-2 hidden md:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              {steps[currentStep - 1] && (
                <>
                  {(() => {
                    const StepIcon = steps[currentStep - 1].icon;
                    return <StepIcon className="w-6 h-6 text-[#39CCCC]" />;
                  })()}
                  <div>
                    <CardTitle className="text-xl">{steps[currentStep - 1].title}</CardTitle>
                    <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., ABC Laundry Equipment Co."
                              {...field}
                              data-testid="input-business-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoriesLoading ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                              ) : (
                                categories?.map((cat: any) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))
                              )}
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
                          <FormLabel>Business Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your business, services, and what makes you unique..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="input-description"
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 50 characters. This will appear on your listing page.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description (SEO)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Brief tagline for search results (max 160 chars)"
                              maxLength={160}
                              {...field}
                              data-testid="input-short-description"
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/160 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@company.com"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormDescription>
                            We'll send listing updates to this email.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Contact & Location */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="w-4 h-4" /> Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(555) 123-4567"
                                {...field}
                                data-testid="input-phone"
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
                            <FormLabel className="flex items-center gap-2">
                              <Globe className="w-4 h-4" /> Website
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://yourwebsite.com"
                                {...field}
                                data-testid="input-website"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Main Street"
                              {...field}
                              data-testid="input-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="City"
                                {...field}
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
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="State"
                                {...field}
                                data-testid="input-state"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="12345"
                                {...field}
                                data-testid="input-zip"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="serviceArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Area</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Nationwide, Texas, Greater Houston Area"
                              {...field}
                              data-testid="input-service-area"
                            />
                          </FormControl>
                          <FormDescription>
                            Where do you provide services?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Business Details */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="yearEstablished"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Established</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2010"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                data-testid="input-year-established"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employeeCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-employee-count">
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {employeeOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <Label>Services Offered</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add a service (e.g., Installation, Repair)"
                          value={servicesInput}
                          onChange={(e) => setServicesInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                          data-testid="input-service"
                        />
                        <Button type="button" onClick={addService} variant="outline" data-testid="button-add-service">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.watch("servicesOffered")?.map((service, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeService(index)}
                            data-testid={`badge-service-${index}`}
                          >
                            {service} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Brands Carried</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add a brand (e.g., Speed Queen, Dexter)"
                          value={brandsInput}
                          onChange={(e) => setBrandsInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBrand())}
                          data-testid="input-brand"
                        />
                        <Button type="button" onClick={addBrand} variant="outline" data-testid="button-add-brand">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.watch("brandsCarried")?.map((brand, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeBrand(index)}
                            data-testid={`badge-brand-${index}`}
                          >
                            {brand} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Social & Media */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-slate-900 mb-2">Connect Your Social Media</h3>
                      <p className="text-sm text-slate-600">
                        Add your social profiles to build trust and connect with potential customers.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://facebook.com/yourbusiness"
                                {...field}
                                data-testid="input-facebook"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://instagram.com/yourbusiness"
                                {...field}
                                data-testid="input-instagram"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://linkedin.com/company/yourbusiness"
                                {...field}
                                data-testid="input-linkedin"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Twitter className="w-4 h-4 text-sky-500" /> Twitter/X
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://twitter.com/yourbusiness"
                                {...field}
                                data-testid="input-twitter"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="youtube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Youtube className="w-4 h-4 text-red-600" /> YouTube
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://youtube.com/@yourbusiness"
                                {...field}
                                data-testid="input-youtube"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Submit */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-emerald-700 font-medium mb-1">
                        <Star className="w-4 h-4" />
                        Your listing is ready!
                      </div>
                      <p className="text-sm text-emerald-600">
                        Review your information below and submit to get listed in the directory.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white border rounded-lg p-4">
                        <h3 className="font-semibold text-lg text-slate-900 mb-3">
                          {form.watch("businessName") || "Your Business"}
                        </h3>
                        <p className="text-slate-600 text-sm mb-4">
                          {form.watch("description")}
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Category:</span>
                            <span className="ml-2 text-slate-900">
                              {categories?.find((c: any) => c.id === form.watch("categoryId"))?.name || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Email:</span>
                            <span className="ml-2 text-slate-900">{form.watch("ownerEmail") || "-"}</span>
                          </div>
                          {form.watch("phone") && (
                            <div>
                              <span className="text-slate-500">Phone:</span>
                              <span className="ml-2 text-slate-900">{form.watch("phone")}</span>
                            </div>
                          )}
                          {form.watch("website") && (
                            <div>
                              <span className="text-slate-500">Website:</span>
                              <span className="ml-2 text-slate-900">{form.watch("website")}</span>
                            </div>
                          )}
                          {form.watch("city") && (
                            <div>
                              <span className="text-slate-500">Location:</span>
                              <span className="ml-2 text-slate-900">
                                {form.watch("city")}, {form.watch("state")}
                              </span>
                            </div>
                          )}
                          {form.watch("serviceArea") && (
                            <div>
                              <span className="text-slate-500">Service Area:</span>
                              <span className="ml-2 text-slate-900">{form.watch("serviceArea")}</span>
                            </div>
                          )}
                        </div>

                        {(form.watch("servicesOffered")?.length ?? 0) > 0 && (
                          <div className="mt-4">
                            <span className="text-slate-500 text-sm">Services:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {form.watch("servicesOffered")?.map((service, i) => (
                                <Badge key={i} variant="outline">{service}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-800 mb-2">Want More Visibility?</h4>
                      <p className="text-sm text-amber-700 mb-3">
                        Upgrade to a premium listing after submission to get featured placement, priority search ranking, and analytics.
                      </p>
                      <div className="flex gap-2 text-xs">
                        <Badge className="bg-amber-600">Boost $99/mo</Badge>
                        <Badge className="bg-purple-600">Spotlight $249/mo</Badge>
                        <Badge className="bg-slate-800">Pro $499/mo</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    data-testid="button-previous"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-[#39CCCC] hover:bg-[#2db3b3]"
                      data-testid="button-next"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={createListingMutation.isPending}
                      className="bg-[#C8A661] hover:bg-[#a07609] min-w-[140px]"
                      data-testid="button-submit"
                    >
                      {createListingMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Listing
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-[#39CCCC]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="w-5 h-5 text-[#39CCCC]" />
            </div>
            <h3 className="font-medium text-white mb-1">Get Discovered</h3>
            <p className="text-slate-400 text-sm">Reach 72K+ laundromat owners and operators</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-[#39CCCC]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-5 h-5 text-[#39CCCC]" />
            </div>
            <h3 className="font-medium text-white mb-1">Build Credibility</h3>
            <p className="text-slate-400 text-sm">Showcase your expertise and services</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-[#39CCCC]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5 text-[#39CCCC]" />
            </div>
            <h3 className="font-medium text-white mb-1">Get Leads</h3>
            <p className="text-slate-400 text-sm">Receive inquiries directly from customers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
