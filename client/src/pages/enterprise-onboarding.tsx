import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Factory,
  Wrench,
  Package,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Clock,
  Users,
  Cpu,
  Headphones,
  LineChart,
  Globe,
  Lock,
  Loader2
} from "lucide-react";

const onboardingSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  slug: z.string().min(2, "URL slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  primaryContactName: z.string().min(2, "Contact name is required"),
  primaryContactEmail: z.string().email("Valid email is required"),
  primaryContactPhone: z.string().min(10, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("United States"),
  equipmentBrands: z.array(z.string()).min(1, "Select at least one brand"),
  estimatedFleetSize: z.string(),
  serviceLocations: z.string(),
  selectedModules: z.array(z.string()),
  billingCycle: z.enum(["monthly", "annual"]),
  notes: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const equipmentBrands = [
  "Dexter",
  "Speed Queen",
  "Continental Girbau",
  "Huebsch",
  "IPSO",
  "UniMac",
  "Maytag Commercial",
  "LG Commercial",
  "Samsung Commercial",
  "Wascomat",
  "Electrolux Professional",
  "Other"
];

const availableModules = [
  { id: "fleet", name: "Fleet Health Dashboard", icon: Cpu, description: "Real-time multi-brand equipment monitoring", included: true },
  { id: "service", name: "Service AI Engine", icon: Wrench, description: "AI-powered diagnostics and repair guidance", included: true },
  { id: "parts", name: "Parts Intelligence", icon: Package, description: "Predictive parts ordering and inventory" },
  { id: "dispatch", name: "Technician Dispatch", icon: MapPin, description: "Smart routing and job management" },
  { id: "receptionist", name: "AI Receptionist", icon: Headphones, description: "24/7 call handling and scheduling" },
  { id: "analytics", name: "Advanced Analytics", icon: LineChart, description: "Business intelligence and reporting" },
];

export default function EnterpriseOnboarding() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: "",
      slug: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      equipmentBrands: [],
      estimatedFleetSize: "",
      serviceLocations: "1",
      selectedModules: ["fleet", "service"],
      billingCycle: "annual",
      notes: "",
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      return apiRequest("/api/enterprise/distributors", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "Our team will review your application and contact you within 24 hours.",
      });
      setStep(5);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: OnboardingFormData) => {
    submitMutation.mutate(data);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["companyName", "slug", "primaryContactName", "primaryContactEmail", "primaryContactPhone"];
        break;
      case 2:
        fieldsToValidate = ["equipmentBrands", "estimatedFleetSize"];
        break;
      case 3:
        fieldsToValidate = ["selectedModules", "billingCycle"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const progressPercent = ((step - 1) / totalSteps) * 100;

  if (step === 5) {
    return (
      <>
        <SEO 
          title="Application Submitted | Enterprise Onboarding | WashBizHub"
          description="Your enterprise distributor application has been submitted successfully."
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2" data-testid="text-success-title">Application Submitted!</h1>
                <p className="text-muted-foreground">
                  Thank you for your interest in WashBizHub Enterprise. Our team will review your application 
                  and contact you within 24 business hours.
                </p>
              </div>
              <div className="space-y-2 text-left bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Our enterprise team reviews your requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>We'll schedule a personalized demo call</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Custom pricing proposal based on your fleet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>White-label portal setup within 48 hours of signing</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button asChild variant="outline" data-testid="button-view-demo">
                  <Link href="/distributor-command-center">View Demo</Link>
                </Button>
                <Button asChild data-testid="button-go-home">
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Enterprise Onboarding | Distributor Command Center | WashBizHub"
        description="Set up your white-label distributor command center. Get started with fleet monitoring, AI diagnostics, and service dispatch."
        keywords="equipment distributor onboarding, laundry fleet management setup, white label platform"
      />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-onboarding-title">Enterprise Onboarding</h1>
                <p className="text-muted-foreground">Set up your distributor command center</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round(progressPercent)}% complete</span>
              </div>
              <Progress value={progressPercent} className="h-2" data-testid="progress-onboarding" />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <Card data-testid="card-step-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Company Information
                    </CardTitle>
                    <CardDescription>Tell us about your distribution business</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Acme Equipment Distributors" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (!form.getValues('slug')) {
                                    form.setValue('slug', generateSlug(e.target.value));
                                  }
                                }}
                                data-testid="input-company-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portal URL *</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="text-sm text-muted-foreground mr-1">fleet.</span>
                                <Input 
                                  placeholder="acme-equipment" 
                                  {...field}
                                  data-testid="input-slug"
                                />
                                <span className="text-sm text-muted-foreground ml-1">.com</span>
                              </div>
                            </FormControl>
                            <FormDescription>Your white-label portal URL</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="primaryContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} data-testid="input-contact-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@acme.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="primaryContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Los Angeles" {...field} data-testid="input-city" />
                            </FormControl>
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
                              <Input placeholder="California" {...field} data-testid="input-state" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card data-testid="card-step-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Factory className="w-5 h-5" />
                      Equipment & Coverage
                    </CardTitle>
                    <CardDescription>Tell us about the equipment you service</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="equipmentBrands"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Equipment Brands You Service *</FormLabel>
                          <FormDescription>Select all brands your team supports</FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {equipmentBrands.map((brand) => (
                              <button
                                key={brand}
                                type="button"
                                onClick={() => {
                                  const current = field.value || [];
                                  const updated = current.includes(brand)
                                    ? current.filter(b => b !== brand)
                                    : [...current, brand];
                                  field.onChange(updated);
                                }}
                                className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                                  field.value?.includes(brand) 
                                    ? 'border-primary bg-primary/5 text-primary' 
                                    : 'hover:border-primary/50'
                                }`}
                                data-testid={`button-brand-${brand.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <div className="flex items-center gap-2">
                                  {field.value?.includes(brand) && <Check className="w-4 h-4" />}
                                  <span>{brand}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="estimatedFleetSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Fleet Size *</FormLabel>
                            <FormControl>
                              <select
                                className="w-full h-10 px-3 rounded-md border bg-background"
                                {...field}
                                data-testid="select-fleet-size"
                              >
                                <option value="">Select range...</option>
                                <option value="50-100">50-100 machines</option>
                                <option value="100-250">100-250 machines</option>
                                <option value="250-500">250-500 machines</option>
                                <option value="500-1000">500-1,000 machines</option>
                                <option value="1000-2500">1,000-2,500 machines</option>
                                <option value="2500+">2,500+ machines</option>
                              </select>
                            </FormControl>
                            <FormDescription>Total machines you'll monitor</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serviceLocations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Locations</FormLabel>
                            <FormControl>
                              <select
                                className="w-full h-10 px-3 rounded-md border bg-background"
                                {...field}
                                data-testid="select-locations"
                              >
                                <option value="1">1 location</option>
                                <option value="2-5">2-5 locations</option>
                                <option value="5-10">5-10 locations</option>
                                <option value="10-25">10-25 locations</option>
                                <option value="25+">25+ locations</option>
                              </select>
                            </FormControl>
                            <FormDescription>Number of service/branch locations</FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card data-testid="card-step-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Platform Configuration
                    </CardTitle>
                    <CardDescription>Select the modules and features you need</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="selectedModules"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform Modules</FormLabel>
                          <div className="grid md:grid-cols-2 gap-4 mt-2">
                            {availableModules.map((module) => {
                              const Icon = module.icon;
                              const isSelected = field.value?.includes(module.id);
                              const isIncluded = module.included;
                              
                              return (
                                <button
                                  key={module.id}
                                  type="button"
                                  onClick={() => {
                                    if (isIncluded) return;
                                    const current = field.value || [];
                                    const updated = current.includes(module.id)
                                      ? current.filter(m => m !== module.id)
                                      : [...current, module.id];
                                    field.onChange(updated);
                                  }}
                                  className={`p-4 rounded-lg border text-left transition-colors ${
                                    isSelected || isIncluded
                                      ? 'border-primary bg-primary/5' 
                                      : 'hover:border-primary/50'
                                  } ${isIncluded ? 'cursor-default' : ''}`}
                                  data-testid={`button-module-${module.id}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      isSelected || isIncluded ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    }`}>
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{module.name}</span>
                                        {isIncluded && (
                                          <Badge variant="secondary" className="text-xs">Included</Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                                    </div>
                                    {!isIncluded && (
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                                      }`}>
                                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billingCycle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Preference</FormLabel>
                          <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <button
                              type="button"
                              onClick={() => field.onChange("monthly")}
                              className={`p-4 rounded-lg border text-left ${
                                field.value === "monthly" ? 'border-primary bg-primary/5' : ''
                              }`}
                              data-testid="button-billing-monthly"
                            >
                              <div className="font-medium">Monthly Billing</div>
                              <div className="text-sm text-muted-foreground">Pay as you go, cancel anytime</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange("annual")}
                              className={`p-4 rounded-lg border text-left ${
                                field.value === "annual" ? 'border-primary bg-primary/5' : ''
                              }`}
                              data-testid="button-billing-annual"
                            >
                              <div className="font-medium flex items-center gap-2">
                                Annual Billing
                                <Badge>Save 15%</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">Lock in rates for 12 months</div>
                            </button>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card data-testid="card-step-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Review & Submit
                    </CardTitle>
                    <CardDescription>Review your configuration before submitting</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Company
                        </h3>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                          <div><span className="text-muted-foreground">Name:</span> {form.watch("companyName")}</div>
                          <div><span className="text-muted-foreground">Portal:</span> fleet.{form.watch("slug")}.com</div>
                          <div><span className="text-muted-foreground">Contact:</span> {form.watch("primaryContactName")}</div>
                          <div><span className="text-muted-foreground">Email:</span> {form.watch("primaryContactEmail")}</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <Factory className="w-4 h-4" />
                          Equipment
                        </h3>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                          <div><span className="text-muted-foreground">Fleet Size:</span> {form.watch("estimatedFleetSize")}</div>
                          <div><span className="text-muted-foreground">Locations:</span> {form.watch("serviceLocations")}</div>
                          <div>
                            <span className="text-muted-foreground">Brands:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {form.watch("equipmentBrands")?.map(brand => (
                                <Badge key={brand} variant="outline" className="text-xs">{brand}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Selected Modules
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("selectedModules")?.map(moduleId => {
                          const module = availableModules.find(m => m.id === moduleId);
                          return module ? (
                            <Badge key={moduleId} variant="secondary">
                              {module.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any specific requirements, integrations, or questions for our team..."
                              rows={3}
                              {...field}
                              data-testid="input-notes"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        What Happens Next
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                        <li className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Response within 24 business hours
                        </li>
                        <li className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          Personalized demo with solutions engineer
                        </li>
                        <li className="flex items-center gap-2">
                          <Lock className="w-3 h-3" />
                          Custom pricing proposal for your fleet
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} data-testid="button-prev-step">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="ml-auto" data-testid="button-next-step">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="ml-auto" 
                    disabled={submitMutation.isPending}
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
