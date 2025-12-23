import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, Clock, DollarSign, CheckCircle, MessageSquare, TrendingUp, 
  Phone, Star, Award, Crown, Zap, Shield, Users, Video
} from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import larryLarsenPhoto from "@assets/image_1765341641648.png";

const CONSULTATION_PACKAGES = {
  quick_call: {
    name: 'Quick Call',
    duration: 30,
    price: 19700,
    priceDisplay: '$197',
    description: '30-minute focused advice session',
    popular: false,
    icon: Phone,
    features: [
      'Quick questions answered',
      'Focused advice on specific topic',
      'Email follow-up summary',
    ]
  },
  strategy_session: {
    name: 'Strategy Session',
    duration: 60,
    price: 39700,
    priceDisplay: '$397',
    description: '1-hour deep dive consultation',
    popular: true,
    icon: MessageSquare,
    features: [
      'Comprehensive analysis',
      'Due diligence review',
      'Market & location insights',
      'Email follow-up with recommendations',
    ]
  },
  vip_annual: {
    name: 'VIP Annual',
    duration: 60,
    price: 199700,
    priceDisplay: '$1,997',
    period: '/year',
    description: 'Unlimited questions for 12 months',
    popular: false,
    icon: Crown,
    features: [
      'Unlimited email questions',
      'Priority phone access',
      '4 one-hour strategy sessions included',
      'Quarterly business reviews',
      'Direct access to Larry',
    ]
  },
  enterprise: {
    name: 'Enterprise Retainer',
    duration: 60,
    price: 499700,
    priceDisplay: '$4,997',
    period: '/year',
    description: 'Full advisory relationship',
    popular: false,
    icon: Shield,
    features: [
      'Everything in VIP Annual',
      'Monthly 1-hour sessions',
      'Site visit (within California)',
      'Priority expert witness services',
      'Multi-store consultation',
      'Investment opportunity alerts',
    ]
  }
};

const consultationSchema = z.object({
  packageType: z.string().min(1, "Please select a package"),
  consultationType: z.string().min(1, "Please select a consultation type"),
  businessStage: z.string().min(1, "Please select your business stage"),
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().min(10, "Please tell us more about your needs"),
  preferredDate: z.string().optional(),
});

type ConsultationForm = z.infer<typeof consultationSchema>;

const consultationTypes = [
  { value: "site_selection", label: "Site Selection & Location Analysis", icon: TrendingUp },
  { value: "due_diligence", label: "Due Diligence & Pre-Purchase Review", icon: CheckCircle },
  { value: "business_plan", label: "Business Plan Development", icon: MessageSquare },
  { value: "equipment", label: "Equipment Selection & Layout", icon: Zap },
  { value: "operations", label: "Operations & Efficiency", icon: Clock },
  { value: "lease_analysis", label: "Lease Analysis & Negotiation", icon: Shield },
  { value: "marketing", label: "Marketing & Customer Acquisition", icon: Users },
  { value: "exit_strategy", label: "Exit Strategy & Business Sale", icon: DollarSign },
];

const businessStages = [
  { value: "researching", label: "Just Researching" },
  { value: "planning", label: "Planning to Start" },
  { value: "acquiring", label: "Acquiring a Laundromat" },
  { value: "operating", label: "Currently Operating" },
  { value: "expanding", label: "Expanding / Multi-Store" },
  { value: "selling", label: "Planning to Sell" },
];

export default function Consultation() {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string>('strategy_session');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<'packages' | 'form'>('packages');

  const form = useForm<ConsultationForm>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      packageType: "strategy_session",
      consultationType: "",
      businessStage: "",
      name: "",
      email: "",
      phone: "",
      location: "",
      budget: "",
      timeline: "",
      message: "",
      preferredDate: "",
    },
    mode: "onTouched",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ConsultationForm) => {
      const pkg = CONSULTATION_PACKAGES[data.packageType as keyof typeof CONSULTATION_PACKAGES];
      
      // Map package type to consultation type for API
      const typeMap: Record<string, string> = {
        quick_call: "phone",
        strategy_session: "video",
        vip_annual: "deep-dive",
        enterprise: "vip-day"
      };
      
      const consultationType = typeMap[data.packageType] || "video";
      const scheduledAt = data.preferredDate 
        ? new Date(data.preferredDate).toISOString() 
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default to 1 week from now
      
      const response = await apiRequest("POST", "/api/larry/consultations/book", {
        clientName: data.name,
        clientEmail: data.email,
        clientPhone: data.phone,
        consultationType,
        scheduledAt,
        notes: data.message,
        source: "consultation-page"
      });
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Consultation Request Submitted",
        description: "Larry will contact you within 24 hours to schedule your session",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePackageSelect = (pkgKey: string) => {
    setSelectedPackage(pkgKey);
    form.setValue('packageType', pkgKey);
    setStep('form');
  };

  if (submitted) {
    const pkg = CONSULTATION_PACKAGES[selectedPackage as keyof typeof CONSULTATION_PACKAGES];
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4" data-testid="text-success-title">Request Received!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Thank you for booking the <span className="font-semibold text-foreground">{pkg.name}</span>.
              Larry will personally review your request and contact you within 24 hours.
            </p>
            <div className="bg-muted p-6 rounded-lg mb-6">
              <h3 className="font-semibold mb-4">What Happens Next:</h3>
              <ul className="text-left space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Larry will call or email you within 24 hours to confirm your consultation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>You'll receive a calendar invite with Google Meet video link</span>
                </li>
                <li className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Secure payment link ({pkg.priceDisplay}) will be sent before your session</span>
                </li>
                <li className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Prepare your questions for your {pkg.duration}-minute session</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => { setSubmitted(false); setStep('packages'); }} variant="outline" data-testid="button-book-another">
                Book Another Consultation
              </Button>
              <Link href="/larry-larsen">
                <Button variant="default" data-testid="link-meet-larry">
                  Meet Larry Larsen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Book Expert Consultation with Larry Larsen | 50+ Years Experience | WashBizHub"
        description="Book a consultation with Larry 'Laundromat Larry' Larsen - 50+ years experience, 50+ laundromats owned, 135+ stores designed. Get expert guidance on due diligence, acquisitions, equipment, and operations."
        canonicalUrl="/consultation"
        keywords={[
          "laundromat consultation",
          "Larry Larsen consultant",
          "laundromat expert",
          "laundromat due diligence",
          "coin laundry consultant",
          "laundromat business advisor",
          "laundromat acquisition help",
          "laundromat industry expert"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/resources" },
          { name: "Expert Consultation", url: "/consultation" }
        ]}
        faqs={[
          {
            question: "How much does a consultation with Larry Larsen cost?",
            answer: "We offer tiered consultation packages: Quick Call ($197, 30 min), Strategy Session ($397, 1 hour), VIP Annual ($1,997/year for unlimited questions), and Enterprise Retainer ($4,997/year for full advisory relationship)."
          },
          {
            question: "What is Larry Larsen's background?",
            answer: "Larry 'Laundromat Larry' Larsen has over 50 years in the laundromat industry, has owned and operated 50+ laundromats, and designed/built 135+ stores. He's a recognized expert witness and trusted industry advisor based in Orange County, California."
          },
          {
            question: "What topics can I discuss during the consultation?",
            answer: "You can discuss site selection, due diligence, lease analysis, equipment selection, store design, operations optimization, marketing strategies, exit planning, and multi-store expansion."
          }
        ]}
        author={{
          name: "Larry 'Laundromat Larry' Larsen",
          expertise: "Laundromat Industry Expert - 50+ Years Experience",
          credentials: "50+ laundromats owned, 135+ stores designed, recognized expert witness"
        }}
        productOffers={Object.entries(CONSULTATION_PACKAGES).map(([key, pkg]) => ({
          name: pkg.name,
          description: pkg.description,
          price: (pkg.price / 100).toString(),
          priceCurrency: "USD",
          availability: "InStock"
        }))}
      />

      <PageHero
        title="Expert Laundromat Consultation"
        subtitle="With Larry 'Laundromat Larry' Larsen"
        variant="consulting"
        overlay="mesh"
        size="md"
        align="center"
      >
        <div className="flex items-center justify-center gap-4 mt-4">
          <Avatar className="w-16 h-16 border-2 border-amber-500">
            <AvatarImage src={larryLarsenPhoto} alt="Larry Larsen" />
            <AvatarFallback className="bg-amber-500 text-white font-bold">LL</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-black font-medium">
                <Award className="w-3 h-3 mr-1" />
                50+ Years Experience
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              50+ laundromats owned | 135+ stores designed
            </p>
          </div>
        </div>
      </PageHero>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {step === 'packages' && (
          <>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">Choose Your Consultation Package</h2>
              <p className="text-muted-foreground">Select the package that best fits your needs</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {Object.entries(CONSULTATION_PACKAGES).map(([key, pkg]) => {
                const IconComponent = pkg.icon;
                return (
                  <Card 
                    key={key}
                    className={`relative cursor-pointer transition-all hover-elevate ${
                      selectedPackage === key ? 'ring-2 ring-amber-500' : ''
                    } ${pkg.popular ? 'border-amber-500' : ''}`}
                    onClick={() => handlePackageSelect(key)}
                    data-testid={`card-package-${key}`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-amber-500 text-black font-semibold">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-amber-500" />
                      </div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{pkg.priceDisplay}</span>
                        {pkg.period && <span className="text-muted-foreground text-sm">{pkg.period}</span>}
                      </div>
                      <CardDescription className="mt-1">{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full mt-4" 
                        variant={pkg.popular ? "default" : "outline"}
                        data-testid={`button-select-${key}`}
                      >
                        Select Package
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {step === 'form' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setStep('packages')} data-testid="button-back">
                Back to Packages
              </Button>
              <Badge variant="outline" className="text-amber-500 border-amber-500">
                {CONSULTATION_PACKAGES[selectedPackage as keyof typeof CONSULTATION_PACKAGES].name} - {CONSULTATION_PACKAGES[selectedPackage as keyof typeof CONSULTATION_PACKAGES].priceDisplay}
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Complete Your Booking</CardTitle>
                <CardDescription>
                  Fill out the form below and Larry will contact you within 24 hours to schedule your session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
                    <input type="hidden" {...form.register('packageType')} />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="consultationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What would you like to discuss?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-consultation-type">
                                  <SelectValue placeholder="Select topic" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {consultationTypes.map((type) => (
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
                        name="businessStage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Where are you in your journey?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-business-stage">
                                  <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {businessStages.map((stage) => (
                                  <SelectItem key={stage.value} value={stage.value}>
                                    {stage.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State" {...field} data-testid="input-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Investment Budget</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., $250K-500K" {...field} data-testid="input-budget" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeline</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 3-6 months" {...field} data-testid="input-timeline" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferredDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-preferred-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tell Larry about your situation</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what you'd like to discuss - the more detail, the better Larry can prepare for your session..."
                              className="min-h-32"
                              {...field}
                              data-testid="textarea-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                      size="lg"
                      data-testid="button-submit"
                    >
                      {submitMutation.isPending ? "Submitting..." : `Request ${CONSULTATION_PACKAGES[selectedPackage as keyof typeof CONSULTATION_PACKAGES].name}`}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Payment will be collected after Larry confirms your appointment
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="mt-12 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-amber-500/30">
                <AvatarImage src={larryLarsenPhoto} alt="Larry Larsen" />
                <AvatarFallback className="bg-amber-500 text-white text-2xl font-bold">LL</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Work with Larry "Laundromat Larry" Larsen</h3>
                <p className="text-muted-foreground mb-4">
                  With over 50 years in the industry, Larry has helped hundreds of owners avoid costly mistakes 
                  and build profitable laundromat businesses. His experience includes owning 50+ laundromats 
                  and designing 135+ stores across the country.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="outline"><Award className="w-3 h-3 mr-1" /> 50+ Years Experience</Badge>
                  <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" /> 50+ Laundromats Owned</Badge>
                  <Badge variant="outline"><TrendingUp className="w-3 h-3 mr-1" /> 135+ Stores Designed</Badge>
                  <Badge variant="outline"><Shield className="w-3 h-3 mr-1" /> Expert Witness</Badge>
                </div>
              </div>
              <Link href="/larry-larsen">
                <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10" data-testid="link-learn-more-larry">
                  Learn More About Larry
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle className="text-lg">Due Diligence Expertise</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Larry has evaluated hundreds of laundromats and saved buyers from costly mistakes
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle className="text-lg">Video Consultations</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Meet via Google Meet from anywhere - evening and weekend appointments available
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <CardTitle className="text-lg">Proven Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Clients consistently report saving $50,000+ from Larry's pre-purchase advice
            </CardContent>
          </Card>
        </div>

        {/* Lead Capture Section */}
        <LeadCaptureSection />
      </div>
    </div>
  );
}

function LeadCaptureSection() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");

  const leadMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string }) => {
      const response = await apiRequest("POST", "/api/larry/leads/subscribe", {
        name: data.firstName,
        email: data.email,
        source: "consultation-page-signup"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "You're on the list!",
        description: "Check your inbox for Larry's free laundromat tips.",
      });
      setEmail("");
      setFirstName("");
    },
    onError: () => {
      toast({
        title: "Already subscribed",
        description: "You're already on our list!",
      });
    }
  });

  return (
    <Card className="mt-12 bg-gradient-to-r from-[#0A1628] to-[#1a2d45] border-amber-500/20">
      <CardContent className="py-10">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-3">Not Ready to Book Yet?</h3>
          <p className="text-white/70 mb-6">
            Get Larry's free weekly tips on buying, running, and selling laundromats. 
            Join 15,000+ industry professionals.
          </p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (email && firstName) {
                leadMutation.mutate({ email, firstName });
              }
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              data-testid="input-lead-firstname"
            />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              data-testid="input-lead-email"
            />
            <Button 
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold whitespace-nowrap"
              disabled={leadMutation.isPending}
              data-testid="button-subscribe-lead"
            >
              {leadMutation.isPending ? "..." : "Get Free Tips"}
            </Button>
          </form>
          <p className="text-xs text-white/40 mt-4">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
