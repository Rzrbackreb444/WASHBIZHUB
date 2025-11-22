import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { MapPin, DollarSign, Home, Zap, Building2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';

const listingFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  businessType: z.enum(['laundromat', 'car_wash', 'dry_cleaner']),
  listingType: z.enum(['owner', 'broker']),
  condition: z.enum(['new', 'used', 'refurbished']),
  
  // Pricing
  price: z.string().refine(v => !isNaN(parseFloat(v)), 'Must be a valid number'),
  currency: z.string().default('USD'),
  ownerFinancing: z.boolean().default(false),
  downPayment: z.string().optional(),
  
  // Location
  country: z.string().default('US'),
  region: z.string(),
  city: z.string(),
  address: z.string(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  
  // Equipment Details
  equipmentType: z.string(),
  brand: z.string(),
  model: z.string(),
  capacity: z.string(),
  yearManufactured: z.string().optional(),
  
  // Real Estate
  includesRealEstate: z.boolean().default(false),
  
  // Media
  images: z.array(z.string()).optional(),
});

type ListingFormData = z.infer<typeof listingFormSchema>;

export default function ListingForm() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('basic');
  
  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      businessType: 'laundromat',
      listingType: 'owner',
      condition: 'used',
      currency: 'USD',
      country: 'US',
      ownerFinancing: false,
      includesRealEstate: false,
    },
  });

  const onSubmit = (data: ListingFormData) => {
    console.log('Listing submitted:', data);
    toast({
      title: 'Listing Created',
      description: 'Your listing has been posted successfully.',
    });
  };

  return (
    <>
      <SEO
        title="Create Listing | Sell Your Laundromat | WashBizHub"
        description="Create a professional listing for your laundromat, equipment, or business. Reach 72,000+ buyers."
        canonicalUrl="/listing-form"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white py-12 border-b border-emerald-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <Home className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Create New Listing</h1>
            </div>
            <p className="text-emerald-200">Post your laundromat or equipment • Reach 72,000+ qualified buyers</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic" data-testid="tab-basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
                  <TabsTrigger value="location" data-testid="tab-location">Location</TabsTrigger>
                  <TabsTrigger value="pricing" data-testid="tab-pricing">Pricing</TabsTrigger>
                </TabsList>

                {/* Basic Info */}
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Tell us about what you're listing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="listingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Listing Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-listing-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="owner">Owner Direct</SelectItem>
                                <SelectItem value="broker">Broker</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-business-type">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="laundromat">Laundromat</SelectItem>
                                <SelectItem value="car_wash">Car Wash</SelectItem>
                                <SelectItem value="dry_cleaner">Dry Cleaner</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Premium Laundromat in Northeast Philadelphia" {...field} data-testid="input-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Detailed description of your business..." className="min-h-32" {...field} data-testid="textarea-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-condition">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="new">New Equipment</SelectItem>
                                <SelectItem value="used">Used Equipment</SelectItem>
                                <SelectItem value="refurbished">Refurbished</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Button onClick={() => setCurrentTab('details')} className="w-full" data-testid="button-next-details">
                    Next: Equipment Details
                  </Button>
                </TabsContent>

                {/* Equipment Details */}
                <TabsContent value="details" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Equipment Details</CardTitle>
                      <CardDescription>Specifications and information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="equipmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment Type</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Commercial Washer" {...field} data-testid="input-equipment-type" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Speed Queen" {...field} data-testid="input-brand" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., SC-40-2" {...field} data-testid="input-model" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacity (lbs)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="40" {...field} data-testid="input-capacity" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearManufactured"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Manufactured (optional)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2022" {...field} data-testid="input-year" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button onClick={() => setCurrentTab('basic')} variant="outline" className="flex-1" data-testid="button-back-basic">
                      Back
                    </Button>
                    <Button onClick={() => setCurrentTab('location')} className="flex-1" data-testid="button-next-location">
                      Next: Location
                    </Button>
                  </div>
                </TabsContent>

                {/* Location */}
                <TabsContent value="location" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </CardTitle>
                      <CardDescription>Where is your business located?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-country" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="PA" {...field} data-testid="input-region" />
                              </FormControl>
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
                                <Input placeholder="Philadelphia" {...field} data-testid="input-city" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} data-testid="input-address" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude (auto-filled)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.000001" placeholder="39.9526" {...field} data-testid="input-latitude" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude (auto-filled)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.000001" placeholder="-75.1652" {...field} data-testid="input-longitude" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button onClick={() => setCurrentTab('details')} variant="outline" className="flex-1" data-testid="button-back-details">
                      Back
                    </Button>
                    <Button onClick={() => setCurrentTab('pricing')} className="flex-1" data-testid="button-next-pricing">
                      Next: Pricing
                    </Button>
                  </div>
                </TabsContent>

                {/* Pricing */}
                <TabsContent value="pricing" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Pricing & Financing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="500000" {...field} data-testid="input-price" />
                              </FormControl>
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
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="ownerFinancing"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between border rounded-lg p-4">
                            <div>
                              <FormLabel>Offer Owner Financing</FormLabel>
                              <FormDescription>Allow buyers to finance through you</FormDescription>
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
                          name="downPayment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Down Payment (%)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="20" {...field} data-testid="input-down-payment" />
                              </FormControl>
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
                              <FormLabel>Includes Real Estate</FormLabel>
                              <FormDescription>Building and property included</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-real-estate" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button onClick={() => setCurrentTab('location')} variant="outline" className="flex-1" data-testid="button-back-location">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" data-testid="button-submit-listing">
                      <Zap className="w-4 h-4 mr-2" />
                      Publish Listing
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
