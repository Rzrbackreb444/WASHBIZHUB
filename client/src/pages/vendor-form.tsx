import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Store, Package, Zap, Upload } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';

const vendorProductSchema = z.object({
  name: z.string().min(5, 'Product name required'),
  category: z.enum(['equipment', 'parts', 'supplies', 'detergent', 'services', 'education', 'templates', 'books', 'courses', 'distributors']),
  description: z.string().min(20, 'Description required'),
  price: z.string().refine(v => !isNaN(parseFloat(v)), 'Valid price required'),
  currency: z.string().default('USD'),
  brand: z.string(),
  sku: z.string().optional(),
  stock: z.string().optional(),
  imageUrl: z.string().optional(),
});

type VendorProductData = z.infer<typeof vendorProductSchema>;

export default function VendorForm() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('product-info');

  const form = useForm<VendorProductData>({
    resolver: zodResolver(vendorProductSchema),
    defaultValues: {
      category: 'equipment',
      currency: 'USD',
    },
  });

  const onSubmit = (data: VendorProductData) => {
    console.log('Vendor product submitted:', data);
    toast({
      title: 'Product Listed',
      description: 'Your product has been added to the marketplace.',
    });
  };

  const categories = [
    { value: 'equipment', label: '🏭 Equipment' },
    { value: 'parts', label: '⚙️ Parts & Components' },
    { value: 'supplies', label: '📦 Supplies & Maintenance' },
    { value: 'detergent', label: '🧼 Detergent & Chemicals' },
    { value: 'services', label: '🔧 Services & Support' },
    { value: 'education', label: '📚 Education' },
    { value: 'templates', label: '📋 Templates' },
    { value: 'books', label: '📖 Books' },
    { value: 'courses', label: '🎓 Courses' },
    { value: 'distributors', label: '🚚 Distribution & Logistics' },
  ];

  return (
    <>
      <SEO
        title="Vendor Marketplace | List Products & Services | WashBizHub"
        description="Sell equipment, supplies, services, and digital products to 73,000+ laundromat owners. Set your own prices and reach qualified buyers."
        canonicalUrl="/vendor-form"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white py-12 border-b border-purple-700">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-8 h-8" />
              <h1 className="text-4xl font-bold">Vendor Marketplace</h1>
            </div>
            <p className="text-purple-200">List products and services • Reach qualified laundromat owners • Grow your business</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="product-info">Product Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>

                {/* Product Info */}
                <TabsContent value="product-info" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Information</CardTitle>
                      <CardDescription>What are you selling?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
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
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Commercial Grade Detergent (Case of 12)"
                                {...field}
                                data-testid="input-product-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand/Manufacturer</FormLabel>
                            <FormControl>
                              <Input placeholder="Your company name" {...field} data-testid="input-brand" />
                            </FormControl>
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
                              <Textarea
                                placeholder="Detailed product description, features, benefits..."
                                className="min-h-32"
                                {...field}
                                data-testid="textarea-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Button onClick={() => setActiveTab('details')} className="w-full" data-testid="button-next-details">
                    Next: Pricing & Details
                  </Button>
                </TabsContent>

                {/* Details */}
                <TabsContent value="details" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing & Stock</CardTitle>
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
                                <Input type="number" step="0.01" placeholder="99.99" {...field} data-testid="input-price" />
                              </FormControl>
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
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="ABC-12345" {...field} data-testid="input-sku" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity (optional)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="100" {...field} data-testid="input-stock" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button onClick={() => setActiveTab('product-info')} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button onClick={() => setActiveTab('media')} className="flex-1">
                      Next: Media
                    </Button>
                  </div>
                </TabsContent>

                {/* Media */}
                <TabsContent value="media" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Product Images
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Featured Image URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/product.jpg"
                                {...field}
                                data-testid="input-image-url"
                              />
                            </FormControl>
                            <FormDescription>
                              Link to your product image (at least 500x500px recommended)
                            </FormDescription>
                          </FormItem>
                        )}
                      />

                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">Drag and drop images or click to upload</p>
                        <Button variant="outline" size="sm" data-testid="button-upload">
                          Upload Images
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button onClick={() => setActiveTab('details')} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" data-testid="button-submit-product">
                      <Zap className="w-4 h-4 mr-2" />
                      Publish Product
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
