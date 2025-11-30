import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, DollarSign, Building2, ArrowRight, ArrowLeft, 
  Check, FileText, Camera, Sparkles, Crown, Lock
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ListingMediaUpload } from '@/components/ListingMediaUpload';
import type { Listing } from '@shared/schema';

const listingFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  tagline: z.string().max(200).optional(),
  description: z.string().min(50, 'Description must be at least 50 characters').max(10000),
  businessType: z.enum(['laundromat', 'car_wash', 'dry_cleaner']),
  listingType: z.enum(['owner', 'broker']),
  
  priceOriginal: z.string().optional(),
  currency: z.string().default('USD'),
  priceVisibility: z.enum(['public', 'authenticated', 'nda_required', 'hidden']).default('public'),
  
  ownerFinancing: z.boolean().default(false),
  downPaymentPercent: z.number().min(0).max(100).optional(),
  
  country: z.string().default('US'),
  region: z.string().min(1, 'State/Region is required'),
  city: z.string().min(1, 'City is required'),
  generalLocation: z.string().optional(),
  addressVisibility: z.enum(['public', 'general', 'authenticated', 'hidden']).default('general'),
  
  includesRealEstate: z.boolean().default(false),
  requiresNDA: z.boolean().default(false),
});

type ListingFormData = z.infer<typeof listingFormSchema>;

const STEPS = ['basic', 'description', 'location', 'pricing', 'media'] as const;
type Step = typeof STEPS[number];

export default function ListingForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);
  
  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      businessType: 'laundromat',
      listingType: 'owner',
      currency: 'USD',
      priceVisibility: 'public',
      country: 'US',
      addressVisibility: 'general',
      ownerFinancing: false,
      includesRealEstate: false,
      requiresNDA: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const response = await apiRequest('/api/listings', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          priceInUSD: data.priceOriginal,
          status: 'draft',
        }),
      });
      return response as Listing;
    },
    onSuccess: (listing) => {
      setCreatedListing(listing);
      setCurrentStep('media');
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: 'Listing Created',
        description: 'Now add photos and documents to complete your listing.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Listing',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await apiRequest(`/api/listings/${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active', listedAt: new Date().toISOString() }),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Listing Published',
        description: 'Your listing is now live and visible to buyers.',
      });
      setLocation('/listings-hub');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Publishing Listing',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ListingFormData) => {
    createMutation.mutate(data);
  };

  const getStepIndex = (step: Step) => STEPS.indexOf(step);
  const progress = ((getStepIndex(currentStep) + 1) / STEPS.length) * 100;

  const canProceed = (step: Step) => {
    const values = form.getValues();
    switch (step) {
      case 'basic':
        return values.title?.length >= 5 && values.businessType && values.listingType;
      case 'description':
        return values.description?.length >= 50;
      case 'location':
        return values.region && values.city;
      case 'pricing':
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    const idx = getStepIndex(currentStep);
    if (idx < STEPS.length - 1) {
      if (currentStep === 'pricing' && !createdListing) {
        form.handleSubmit(onSubmit)();
      } else {
        setCurrentStep(STEPS[idx + 1]);
      }
    }
  };

  const goPrev = () => {
    const idx = getStepIndex(currentStep);
    if (idx > 0 && currentStep !== 'media') {
      setCurrentStep(STEPS[idx - 1]);
    }
  };

  return (
    <>
      <SEO
        title="Create Listing | Sell Your Laundromat | WashBizHub"
        description="List your laundromat, equipment, or business. Reach 72,000+ qualified buyers on the #1 laundromat marketplace."
        canonicalUrl="/listing-form"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-background">
        <div 
          className="relative py-12 bg-gradient-to-br from-[#001F3F] via-[#002B5C] to-[#001F3F] overflow-hidden border-b border-[#39CCCC]/20"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#D4AF37] rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-3 py-1">
                <Crown className="w-3.5 h-3.5 mr-1" />
                Seller Portal
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Create Your Listing
            </h1>
            <p className="text-white/70 mb-6">
              Reach 72,000+ qualified buyers on the #1 laundromat marketplace
            </p>
            
            <div className="max-w-md">
              <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                <span>Step {getStepIndex(currentStep) + 1} of {STEPS.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/10" />
            </div>

            <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
              {STEPS.map((step, idx) => {
                const isActive = step === currentStep;
                const isCompleted = getStepIndex(currentStep) > idx;
                const stepLabels = {
                  basic: 'Basic Info',
                  description: 'Description',
                  location: 'Location',
                  pricing: 'Pricing',
                  media: 'Photos',
                };
                return (
                  <Badge 
                    key={step}
                    variant={isActive ? 'default' : 'outline'}
                    className={`whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-[#39CCCC] text-[#001F3F]' 
                        : isCompleted 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'border-white/30 text-white/60'
                    }`}
                  >
                    {isCompleted && <Check className="w-3 h-3 mr-1" />}
                    {stepLabels[step]}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {currentStep === 'media' && createdListing ? (
            <div className="space-y-6">
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Listing Created Successfully</h3>
                      <p className="text-muted-foreground">
                        "{createdListing.title}" has been saved as a draft.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ListingMediaUpload listingId={createdListing.id} />

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation(`/listing/${createdListing.slug || createdListing.id}`)}
                  className="flex-1"
                >
                  Preview Listing
                </Button>
                <Button 
                  onClick={() => publishMutation.mutate(createdListing.id)}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#001F3F]"
                  disabled={publishMutation.isPending}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {publishMutation.isPending ? 'Publishing...' : 'Publish Listing'}
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 'basic' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Basic Information
                      </CardTitle>
                      <CardDescription>Tell us what you're listing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-business-type">
                                  <SelectValue placeholder="Select business type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="laundromat">Laundromat / Coin Laundry</SelectItem>
                                <SelectItem value="car_wash">Car Wash</SelectItem>
                                <SelectItem value="dry_cleaner">Dry Cleaner</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="listingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Who is listing?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-listing-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="owner">Owner (FSBO)</SelectItem>
                                <SelectItem value="broker">Broker / Agent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Listing Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Premium Newport Beach Laundromat - Fluff & Fold Ready" 
                                {...field} 
                                data-testid="input-title"
                              />
                            </FormControl>
                            <FormDescription>
                              Make it descriptive and include key selling points
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Tagline (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Turnkey operation with strong cash flow" 
                                {...field} 
                                data-testid="input-tagline"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {currentStep === 'description' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Description
                      </CardTitle>
                      <CardDescription>Describe your listing in detail</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the business, equipment, location, financials, and why it's a great opportunity..."
                                className="min-h-[300px]"
                                {...field}
                                data-testid="textarea-description"
                              />
                            </FormControl>
                            <FormDescription>
                              Include equipment inventory, lease terms, monthly revenue, and any unique selling points. 
                              Use markdown formatting for better readability.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {currentStep === 'location' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Location
                      </CardTitle>
                      <CardDescription>Where is the business located?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-country">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="GB">United Kingdom</SelectItem>
                                  <SelectItem value="AU">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State / Region</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., California" 
                                  {...field} 
                                  data-testid="input-region"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Los Angeles" 
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
                          name="generalLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>General Area (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Downtown, Near UCLA" 
                                  {...field} 
                                  data-testid="input-general-location"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="addressVisibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Visibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-address-visibility">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="public">Show full address publicly</SelectItem>
                                <SelectItem value="general">Show city/region only (recommended)</SelectItem>
                                <SelectItem value="authenticated">Show to logged-in users only</SelectItem>
                                <SelectItem value="hidden">Hide until inquiry</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {currentStep === 'pricing' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Pricing & Terms
                      </CardTitle>
                      <CardDescription>Set your asking price and financing options</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="priceOriginal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asking Price</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="650000" 
                                  {...field} 
                                  data-testid="input-price"
                                />
                              </FormControl>
                              <FormDescription>Leave blank for "Call for Price"</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-currency">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="priceVisibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Visibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-price-visibility">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="public">Show price publicly</SelectItem>
                                <SelectItem value="authenticated">Show to logged-in users only</SelectItem>
                                <SelectItem value="nda_required">Require NDA to view price</SelectItem>
                                <SelectItem value="hidden">Contact for pricing</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ownerFinancing"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between border rounded-lg p-4">
                            <div>
                              <FormLabel className="text-base">Owner Financing Available</FormLabel>
                              <FormDescription>Offer flexible financing to qualified buyers</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-financing" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch('ownerFinancing') && (
                        <FormField
                          control={form.control}
                          name="downPaymentPercent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Down Payment (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="20" 
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value))}
                                  data-testid="input-down-payment"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="includesRealEstate"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between border rounded-lg p-4">
                            <div>
                              <FormLabel className="text-base">Includes Real Estate</FormLabel>
                              <FormDescription>Building and property included in sale</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-real-estate" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requiresNDA"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between border rounded-lg p-4">
                            <div>
                              <FormLabel className="text-base flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Require NDA for Sensitive Info
                              </FormLabel>
                              <FormDescription>Protect financials and exact address with NDA</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-nda" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3">
                  {currentStep !== 'basic' && (
                    <Button 
                      type="button"
                      onClick={goPrev} 
                      variant="outline" 
                      className="flex-1"
                      data-testid="button-prev"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  
                  {currentStep === 'pricing' ? (
                    <Button 
                      type="submit"
                      className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#001F3F]"
                      disabled={createMutation.isPending}
                      data-testid="button-create-listing"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {createMutation.isPending ? 'Creating...' : 'Continue to Photos'}
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={goNext}
                      disabled={!canProceed(currentStep)}
                      className="flex-1"
                      data-testid="button-next"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </>
  );
}
