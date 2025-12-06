import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  DollarSign, 
  MapPin, 
  WashingMachine, 
  TrendingUp,
  Shield,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  FileText,
  Clock,
  Zap
} from "lucide-react";
import { Link } from "wouter";

const listingFormSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  askingPrice: z.string().min(1, "Asking price is required"),
  monthlyRevenue: z.string().optional(),
  squareFootage: z.string().optional(),
  numberOfMachines: z.string().optional(),
  yearEstablished: z.string().optional(),
  leaseRemaining: z.string().optional(),
  ownerName: z.string().min(2, "Your name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  description: z.string().min(20, "Please describe your laundromat"),
  sellingReason: z.string().optional(),
  listingType: z.enum(["owner", "broker"]),
});

type ListingFormData = z.infer<typeof listingFormSchema>;

const BENEFITS = [
  { icon: Users, title: "72,000+ Qualified Buyers", description: "Access to our active buyer network" },
  { icon: TrendingUp, title: "CLEANBI Score Included", description: "Professional location analysis report" },
  { icon: Shield, title: "Verified Listings Only", description: "We verify all financial claims" },
  { icon: Star, title: "Featured Placement", description: "Premium visibility for serious sellers" },
];

const LISTING_TIERS = [
  {
    name: "Basic",
    price: "Free",
    features: ["Standard listing", "5 photos", "30-day visibility", "Email inquiries"],
  },
  {
    name: "Showcase",
    price: "$99/mo",
    popular: true,
    features: ["Featured placement", "30 photos", "Priority search", "CLEANBI report", "Video support", "Phone inquiries"],
  },
  {
    name: "Diamond",
    price: "$299/mo",
    features: ["Homepage featured", "Unlimited media", "Social promotion", "Broker assistance", "Valuation report", "NDA protection"],
  },
];

export default function ListYourLaundromat() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      listingType: "owner",
      businessName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      askingPrice: "",
      monthlyRevenue: "",
      squareFootage: "",
      numberOfMachines: "",
      yearEstablished: "",
      leaseRemaining: "",
      ownerName: "",
      email: "",
      phone: "",
      description: "",
      sellingReason: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      return apiRequest("/api/listing-submissions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Listing Submitted!",
        description: "We'll review your submission and contact you within 24 hours.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Error",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ListingFormData) => {
    submitMutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <SEO 
          title="Thank You | List Your Laundromat - WashBizHub"
          description="Your laundromat listing has been submitted. We'll review and contact you within 24 hours."
        />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Listing Submitted Successfully!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Our team will review your submission and contact you within 24 hours 
            to discuss next steps and verify your listing details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/">
                Return Home
              </Link>
            </Button>
            <Button size="lg" className="bg-[#C8A661] hover:bg-[#9a7209]" asChild>
              <Link href="/cleanbi-explorer">
                Get CLEANBI Score
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <SEO 
        title="List Your Laundromat For Sale | Reach 72,000+ Buyers - WashBizHub"
        description="Sell your laundromat to qualified buyers. Free listing with CLEANBI location score. Featured placement available. Trusted by 72,000+ industry professionals."
        keywords={["sell laundromat", "list laundromat for sale", "laundromat marketplace", "sell coin laundry"]}
      />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#0f2744] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(184,134,11,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 70%, rgba(184,134,11,0.2) 0%, transparent 50%)`
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
              <Building2 className="w-3 h-3 mr-1" />
              Laundromat Marketplace
            </Badge>
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-bebas)' }}
              data-testid="heading-list-laundromat"
            >
              LIST YOUR LAUNDROMAT
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Reach 72,000+ qualified buyers in the largest laundromat community. 
              Get a free CLEANBI location score with every listing.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> 24-hour review
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" /> Verified listings
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" /> Instant exposure
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="text-center p-4">
                <div className="w-12 h-12 bg-[#C8A661]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-6 h-6 text-[#C8A661]" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {benefit.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#C8A661]" />
                  Submit Your Listing
                </CardTitle>
                <CardDescription>
                  Fill out the form below and our team will review your submission within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Listing Type */}
                    <FormField
                      control={form.control}
                      name="listingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I am a...</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-listing-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="owner">Business Owner</SelectItem>
                              <SelectItem value="broker">Licensed Broker</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Business Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        Business Information
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>Business Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Modern Coin Laundry" {...field} data-testid="input-business-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>Street Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main Street" {...field} data-testid="input-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="Los Angeles" {...field} data-testid="input-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State *</FormLabel>
                                <FormControl>
                                  <Input placeholder="CA" {...field} data-testid="input-state" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP *</FormLabel>
                                <FormControl>
                                  <Input placeholder="90001" {...field} data-testid="input-zip" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Financial Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        Financial Details
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="askingPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asking Price *</FormLabel>
                              <FormControl>
                                <Input placeholder="$500,000" {...field} data-testid="input-asking-price" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="monthlyRevenue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly Revenue</FormLabel>
                              <FormControl>
                                <Input placeholder="$25,000" {...field} data-testid="input-monthly-revenue" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Property Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <WashingMachine className="w-5 h-5 text-gray-400" />
                        Property Details
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name="squareFootage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Square Feet</FormLabel>
                              <FormControl>
                                <Input placeholder="2,500" {...field} data-testid="input-sqft" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="numberOfMachines"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel># of Machines</FormLabel>
                              <FormControl>
                                <Input placeholder="35" {...field} data-testid="input-machines" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="yearEstablished"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Established</FormLabel>
                              <FormControl>
                                <Input placeholder="2015" {...field} data-testid="input-year" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="leaseRemaining"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lease Remaining</FormLabel>
                              <FormControl>
                                <Input placeholder="10 years" {...field} data-testid="input-lease" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormDescription>
                            Describe your laundromat, its features, equipment condition, and what makes it special.
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell potential buyers about your laundromat..." 
                              className="min-h-[120px]"
                              {...field} 
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sellingReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Selling</FormLabel>
                          <FormControl>
                            <Input placeholder="Retirement, relocation, etc." {...field} data-testid="input-reason" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        Your Contact Information
                      </h3>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="ownerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John Smith" {...field} data-testid="input-owner-name" />
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
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
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
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full bg-[#C8A661] hover:bg-[#9a7209]"
                        disabled={submitMutation.isPending}
                        data-testid="button-submit-listing"
                      >
                        {submitMutation.isPending ? "Submitting..." : "Submit Listing for Review"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                        By submitting, you agree to our terms and privacy policy. 
                        Your information is secure and will not be shared without consent.
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Listing Packages</CardTitle>
                <CardDescription>Choose visibility that fits your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {LISTING_TIERS.map((tier) => (
                  <div 
                    key={tier.name}
                    className={`p-4 rounded-lg border ${
                      tier.popular 
                        ? 'border-[#C8A661] bg-[#C8A661]/5' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{tier.name}</span>
                      <span className="font-bold text-[#C8A661]">{tier.price}</span>
                    </div>
                    <ul className="space-y-1">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {tier.popular && (
                      <Badge className="mt-3 bg-[#C8A661] text-white">Most Popular</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
                <CardDescription>Our team is here to assist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="tel:+14798834314" 
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid="link-phone-support"
                >
                  <Phone className="w-5 h-5 text-[#C8A661]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">(479) 883-4314</p>
                    <p className="text-xs text-gray-500">Mon-Fri, 9am-5pm CST</p>
                  </div>
                </a>
                <a 
                  href="mailto:consult@washbizhub.com" 
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid="link-email-support"
                >
                  <Mail className="w-5 h-5 text-[#C8A661]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">consult@washbizhub.com</p>
                    <p className="text-xs text-gray-500">Typically replies within 4 hours</p>
                  </div>
                </a>
              </CardContent>
            </Card>

            {/* Trust Signals */}
            <Card className="bg-[#1e3a5f] text-white border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#C8A661] mb-1">72,000+</p>
                  <p className="text-sm text-white/70 mb-4">Active Community Members</p>
                  <Separator className="bg-white/20 mb-4" />
                  <p className="text-3xl font-bold text-[#C8A661] mb-1">$2.1B+</p>
                  <p className="text-sm text-white/70 mb-4">Listings Facilitated</p>
                  <Separator className="bg-white/20 mb-4" />
                  <p className="text-3xl font-bold text-[#C8A661] mb-1">14 Days</p>
                  <p className="text-sm text-white/70">Average Time to First Inquiry</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
