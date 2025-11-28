import { useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Star, 
  Users, 
  Shield, 
  DollarSign,
  Truck,
  Clock,
  Award,
  Loader2,
  Mail,
  Building,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const londrInterestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  businessName: z.string().optional(),
  experienceLevel: z.string().optional(),
  interest: z.string().min(1, "Please select your interest"),
  message: z.string().optional()
});

type LondrInterestFormData = z.infer<typeof londrInterestSchema>;

export default function LondrPartnership() {
  const { toast } = useToast();

  const form = useForm<LondrInterestFormData>({
    resolver: zodResolver(londrInterestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      businessName: "",
      experienceLevel: "",
      interest: "",
      message: ""
    }
  });

  const submitInterest = useMutation({
    mutationFn: async (data: LondrInterestFormData) => {
      const response = await apiRequest("POST", "/api/contact", {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        subject: `Londr Partnership Interest - ${data.city}, ${data.state}`,
        message: `
Business Name: ${data.businessName || "Individual"}
Experience Level: ${data.experienceLevel || "Not specified"}
Interest Type: ${data.interest}
Location: ${data.city}, ${data.state}

Message:
${data.message || "No additional message"}
        `.trim(),
        source: "londr-partnership"
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Interest Submitted!",
        description: "The Londr team will contact you soon to discuss partnership opportunities.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem submitting your interest. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LondrInterestFormData) => {
    submitInterest.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Londr.com Partnership | Verified Vendor Partner | WashBizHub</title>
        <meta name="description" content="Join the Londr family - the revolutionary gig-economy laundry platform. Learn about partnership opportunities for laundromat owners and independent washers." />
      </Helmet>

      <div 
        className="min-h-screen py-12"
        style={{ background: "linear-gradient(135deg, #001F3F 0%, #0A2540 50%, #001F3F 100%)" }}
        data-testid="londr-partnership-page"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Vendor Partner Header */}
          <div className="text-center mb-12" data-testid="section-header">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge 
                className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold px-4 py-2 text-sm flex items-center gap-2"
                data-testid="badge-vendor-partner"
              >
                <Award className="h-4 w-4" />
                VERIFIED VENDOR PARTNER
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20" data-testid="logo-londr">
                <span className="text-white font-bold text-2xl">L</span>
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-white" data-testid="heading-londr">Londr.com</h1>
                <p className="text-teal-400 text-lg" data-testid="text-tagline">The Gig Economy for Laundry</p>
              </div>
            </div>

            <p className="text-white/80 text-lg max-w-2xl mx-auto" data-testid="text-description">
              Londr is revolutionizing laundry services by connecting customers with local washers and laundromat operators through a seamless on-demand platform.
            </p>
          </div>

          {/* What is Londr Section */}
          <Card className="bg-white/10 backdrop-blur border-white/20 mb-8" data-testid="section-what-is-londr">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-teal-400" />
                What is Londr?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80 space-y-4">
              <p data-testid="text-what-is-londr">
                Londr is a groundbreaking platform that's doing for laundry what DoorDash did for food delivery 
                and Uber did for transportation. By connecting customers who need laundry services with local 
                washers and laundromat operators, Londr creates a win-win marketplace that benefits everyone.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10" data-testid="card-on-demand">
                  <Truck className="h-8 w-8 text-teal-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">On-Demand Pickup</h3>
                  <p className="text-sm text-white/70">Customers schedule pickups through the app. Washers collect, clean, and deliver.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10" data-testid="card-revenue">
                  <DollarSign className="h-8 w-8 text-green-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Extra Revenue</h3>
                  <p className="text-sm text-white/70">Laundromat owners fill empty machines. Independent washers earn flexible income.</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10" data-testid="card-flexible">
                  <Clock className="h-8 w-8 text-amber-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Flexible Hours</h3>
                  <p className="text-sm text-white/70">Work when you want, accept orders that fit your schedule.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="bg-white/10 backdrop-blur border-white/20 mb-8" data-testid="section-benefits">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-400" />
                Why Partner with Londr?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div data-testid="benefits-owners">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-400" />
                    For Laundromat Owners
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Fill machines during off-peak hours",
                      "Acquire new customers without marketing costs",
                      "Add wash-dry-fold revenue stream",
                      "Keep your existing self-service business",
                      "No contracts or franchise fees"
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/80" data-testid={`benefit-owner-${i}`}>
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div data-testid="benefits-washers">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    For Independent Washers
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Set your own hours and availability",
                      "Earn $15-25/hour on your schedule",
                      "Use any laundromat in the network",
                      "No experience required - training provided",
                      "Weekly payouts direct to your bank"
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/80" data-testid={`benefit-washer-${i}`}>
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial */}
          <Card className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 backdrop-blur border-teal-400/30 mb-8" data-testid="section-testimonial">
            <CardContent className="py-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center flex-shrink-0" data-testid="avatar-testimonial">
                  <span className="text-white font-bold">BJ</span>
                </div>
                <div>
                  <p className="text-white/90 italic mb-4" data-testid="text-testimonial">
                    "Londr is transforming how Americans think about laundry. We're not just an app - we're creating 
                    opportunities for entrepreneurs and giving time back to busy families. Join us in building the 
                    future of laundry."
                  </p>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-white font-semibold" data-testid="text-testimonial-name">Benjamin Johnson</p>
                      <p className="text-teal-400 text-sm" data-testid="text-testimonial-role">Londr.com Team</p>
                    </div>
                    <div className="flex gap-1" data-testid="rating-stars">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interest Form */}
          <Card className="bg-white/10 backdrop-blur border-white/20" data-testid="section-interest-form">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <Mail className="h-6 w-6 text-teal-400" />
                Join the Londr Family
              </CardTitle>
              <CardDescription className="text-white/70">
                Express your interest in becoming a Londr partner. The team will reach out to discuss opportunities in your area.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="John Smith"
                              className="bg-white/20 border-white/30 text-white placeholder-white/50"
                              data-testid="input-name"
                            />
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
                          <FormLabel className="text-white/90">Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="john@example.com"
                              className="bg-white/20 border-white/30 text-white placeholder-white/50"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder="(555) 123-4567"
                              className="bg-white/20 border-white/30 text-white placeholder-white/50"
                              data-testid="input-phone"
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
                          <FormLabel className="text-white/90">Business Name (if applicable)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Your Laundromat LLC"
                              className="bg-white/20 border-white/30 text-white placeholder-white/50"
                              data-testid="input-business"
                            />
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
                          <FormLabel className="text-white/90">City *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Los Angeles"
                              className="bg-white/20 border-white/30 text-white placeholder-white/50"
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
                          <FormLabel className="text-white/90">State *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="California"
                              className="bg-white/20 border-white/30 text-white placeholder-white/50"
                              data-testid="input-state"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="interest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">I'm Interested In *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger 
                                className="bg-white/20 border-white/30 text-white"
                                data-testid="select-interest"
                              >
                                <SelectValue placeholder="Select your interest" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="laundromat-partner">Partnering my laundromat with Londr</SelectItem>
                              <SelectItem value="independent-washer">Becoming an independent washer</SelectItem>
                              <SelectItem value="both">Both - I want to explore all options</SelectItem>
                              <SelectItem value="investor">Investment opportunities</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger 
                                className="bg-white/20 border-white/30 text-white"
                                data-testid="select-experience"
                              >
                                <SelectValue placeholder="Select experience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">New to laundry industry</SelectItem>
                              <SelectItem value="1-3">1-3 years experience</SelectItem>
                              <SelectItem value="3-5">3-5 years experience</SelectItem>
                              <SelectItem value="5+">5+ years experience</SelectItem>
                              <SelectItem value="owner">Current laundromat owner</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <FormLabel className="text-white/90">Additional Information</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell us about your situation, questions, or what excites you about Londr..."
                            rows={4}
                            className="bg-white/20 border-white/30 text-white placeholder-white/50"
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold"
                    disabled={submitInterest.isPending}
                    data-testid="button-submit-interest"
                  >
                    {submitInterest.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Express Interest in Londr
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="text-center mt-8 text-white/60" data-testid="section-footer">
            <p className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              Verified WashBizHub Vendor Partner
            </p>
            <p className="text-sm mt-2">
              Questions? Email <a href="mailto:partners@londr.com" className="text-teal-400 hover:underline" data-testid="link-email-contact">partners@londr.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
