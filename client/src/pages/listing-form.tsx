import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, DollarSign, Building2, ArrowRight, ArrowLeft, 
  Check, FileText, Camera, Sparkles, Crown, Lock, Zap, Star, Rocket
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ListingMediaUpload } from '@/components/ListingMediaUpload';
import type { Listing } from '@shared/schema';

type DetailLevel = 'quick' | 'standard' | 'premium';

const listingFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  tagline: z.string().min(50, 'Teaser must be at least 50 characters').max(300),
  description: z.string().max(10000).optional(),
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
  
  detailLevel: z.enum(['quick', 'standard', 'premium']).default('quick'),
});

type ListingFormData = z.infer<typeof listingFormSchema>;

const DEPTH_OPTIONS: { value: DetailLevel; label: string; description: string; icon: typeof Zap; features: string[]; recommended?: boolean }[] = [
  {
    value: 'quick',
    label: 'Quick Listing',
    description: 'Perfect for brokers - get listed in under 2 minutes',
    icon: Zap,
    features: ['Title & teaser', 'Location (city/region)', 'Business type', 'NDA protection'],
  },
  {
    value: 'standard',
    label: 'Standard Listing',
    description: 'Include pricing details and financing options',
    icon: Star,
    features: ['Everything in Quick', 'Asking price', 'Financing options', 'Real estate inclusion'],
    recommended: true,
  },
  {
    value: 'premium',
    label: 'Premium Listing',
    description: 'Full details with photos and extended description',
    icon: Rocket,
    features: ['Everything in Standard', 'Photo gallery', 'Detailed description', 'Maximum buyer engagement'],
  },
];

export default function ListingForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [detailLevel, setDetailLevel] = useState<DetailLevel | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);
  
  const searchParams = new URLSearchParams(search);
  const saleType = searchParams.get('type');
  const includesRealEstateDefault = saleType === 'with-real-estate';
  
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
      includesRealEstate: includesRealEstateDefault,
      requiresNDA: false,
      tagline: '',
      description: '',
      detailLevel: 'quick',
    },
  });
  
  useEffect(() => {
    if (saleType === 'with-real-estate') {
      form.setValue('includesRealEstate', true);
    } else {
      form.setValue('includesRealEstate', false);
    }
  }, [saleType, form]);

  const getSteps = (level: DetailLevel) => {
    const base = ['essentials'];
    if (level === 'standard' || level === 'premium') base.push('pricing');
    if (level === 'premium') base.push('details');
    base.push('media');
    return base;
  };

  const steps = detailLevel ? getSteps(detailLevel) : [];
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const response = await apiRequest('POST', '/api/listings', {
        ...data,
        priceInUSD: data.priceOriginal,
        status: 'draft',
        detailLevel: detailLevel,
      });
      return response.json() as Promise<Listing>;
    },
    onSuccess: (listing) => {
      setCreatedListing(listing);
      setCurrentStep(steps.length - 1);
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: 'Listing Created',
        description: detailLevel === 'premium' 
          ? 'Now add photos to complete your listing.'
          : 'Your listing is ready. Add photos or publish now.',
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
      const response = await apiRequest('PATCH', `/api/listings/${listingId}`, {
        status: 'active',
        listedAt: new Date().toISOString(),
      });
      return response.json();
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

  const canProceed = () => {
    const values = form.getValues();
    const step = steps[currentStep];
    
    switch (step) {
      case 'essentials':
        return values.title?.length >= 5 && values.tagline?.length >= 50 && values.region && values.city;
      case 'pricing':
        return true;
      case 'details':
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      const isLastFormStep = currentStep === steps.length - 2;
      if (isLastFormStep && !createdListing) {
        form.handleSubmit(onSubmit)();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const goPrev = () => {
    if (currentStep > 0 && !createdListing) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectDepth = (level: DetailLevel) => {
    setDetailLevel(level);
    form.setValue('detailLevel', level);
    setCurrentStep(0);
  };

  if (!detailLevel) {
    return (
      <>
        <SEO
          title="Create Listing | Sell Your Laundromat | WashBizHub"
          description="List your laundromat, equipment, or business. Reach 73,000+ qualified buyers on the #1 laundromat marketplace."
          canonicalUrl="/listing-form"
        />

        <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-background">
          <div className="relative py-16 bg-gradient-to-br from-[#001F3F] via-[#002B5C] to-[#001F3F] overflow-hidden border-b border-[#39CCCC]/20">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#D4AF37] rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-3 py-1">
                  <Crown className="w-3.5 h-3.5 mr-1" />
                  Seller Portal
                </Badge>
                {saleType && (
                  <Badge 
                    variant="outline" 
                    className={`${
                      saleType === 'with-real-estate' 
                        ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
                        : 'border-blue-500/50 text-blue-400 bg-blue-500/10'
                    }`}
                  >
                    {saleType === 'with-real-estate' ? 'With Real Estate' : 'Asset Sale Only'}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
                Create Your Listing
              </h1>
              <p className="text-white/70 text-lg max-w-xl mx-auto">
                Choose how much detail you want to include. You can always upgrade later.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid gap-6 md:grid-cols-3">
              {DEPTH_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <Card 
                    key={option.value}
                    className={`relative cursor-pointer transition-all hover-elevate ${
                      option.recommended ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50' : ''
                    }`}
                    onClick={() => selectDepth(option.value)}
                    data-testid={`card-depth-${option.value}`}
                  >
                    {option.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-[#D4AF37] text-[#001F3F]">
                          Recommended
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-3">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                        option.value === 'quick' ? 'bg-blue-500/20 text-blue-400' :
                        option.value === 'standard' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{option.label}</CardTitle>
                      <CardDescription className="text-sm">{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {option.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full mt-6 ${
                          option.value === 'standard' 
                            ? 'bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#001F3F]' 
                            : ''
                        }`}
                        variant={option.value === 'standard' ? 'default' : 'outline'}
                      >
                        Select {option.label.split(' ')[0]}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }

  const stepLabels: Record<string, { label: string; icon: typeof Building2 }> = {
    essentials: { label: 'Essentials', icon: Building2 },
    pricing: { label: 'Pricing', icon: DollarSign },
    details: { label: 'Details', icon: FileText },
    media: { label: 'Photos', icon: Camera },
  };

  return (
    <>
      <SEO
        title="Create Listing | Sell Your Laundromat | WashBizHub"
        description="List your laundromat, equipment, or business. Reach 73,000+ qualified buyers on the #1 laundromat marketplace."
        canonicalUrl="/listing-form"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-background">
        <div className="relative py-12 bg-gradient-to-br from-[#001F3F] via-[#002B5C] to-[#001F3F] overflow-hidden border-b border-[#39CCCC]/20">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#D4AF37] rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 px-3 py-1">
                  <Crown className="w-3.5 h-3.5 mr-1" />
                  {DEPTH_OPTIONS.find(o => o.value === detailLevel)?.label}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/60 hover:text-white"
                onClick={() => { setDetailLevel(null); setCurrentStep(0); setCreatedListing(null); }}
                data-testid="button-change-depth"
              >
                Change
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Create Your Listing
              </h1>
              {saleType && (
                <Badge 
                  variant="outline" 
                  className={`${
                    saleType === 'with-real-estate' 
                      ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
                      : 'border-blue-500/50 text-blue-400 bg-blue-500/10'
                  }`}
                >
                  {saleType === 'with-real-estate' ? 'With Real Estate' : 'Asset Sale'}
                </Badge>
              )}
            </div>
            <p className="text-white/70 mb-6">
              Reach 73,000+ qualified buyers on the #1 laundromat marketplace
            </p>
            
            <div className="max-w-md">
              <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/10" />
            </div>

            <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = currentStep > idx || (createdListing && idx < steps.length - 1);
                const StepIcon = stepLabels[step]?.icon || Building2;
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
                    {isCompleted ? <Check className="w-3 h-3 mr-1" /> : <StepIcon className="w-3 h-3 mr-1" />}
                    {stepLabels[step]?.label || step}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {steps[currentStep] === 'media' && createdListing ? (
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
                  data-testid="button-preview"
                >
                  Preview Listing
                </Button>
                <Button 
                  onClick={() => publishMutation.mutate(createdListing.id)}
                  className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#001F3F]"
                  disabled={publishMutation.isPending}
                  data-testid="button-publish"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {publishMutation.isPending ? 'Publishing...' : 'Publish Listing'}
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {steps[currentStep] === 'essentials' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Essential Information
                      </CardTitle>
                      <CardDescription>The basics buyers need to know</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
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
                      </div>

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
                            <FormLabel>Teaser Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief overview to capture buyer interest. Highlight key opportunities without giving away too much..."
                                className="min-h-[100px]"
                                {...field} 
                                data-testid="input-tagline"
                              />
                            </FormControl>
                            <FormDescription>
                              50-300 characters. This appears in search results and listings.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border-t pt-6">
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </h4>
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
                      </div>

                      <div className="border-t pt-6 space-y-4">
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
                      </div>
                    </CardContent>
                  </Card>
                )}

                {steps[currentStep] === 'pricing' && (
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
                    </CardContent>
                  </Card>
                )}

                {steps[currentStep] === 'details' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Detailed Description
                      </CardTitle>
                      <CardDescription>Provide a comprehensive overview for serious buyers</CardDescription>
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
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3">
                  {currentStep > 0 && (
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
                  
                  {currentStep === steps.length - 2 ? (
                    <Button 
                      type="submit"
                      className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#001F3F]"
                      disabled={createMutation.isPending || !canProceed()}
                      data-testid="button-create-listing"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {createMutation.isPending ? 'Creating...' : 'Continue to Photos'}
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={goNext}
                      disabled={!canProceed()}
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
