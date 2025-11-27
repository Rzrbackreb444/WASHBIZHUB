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
import { Label } from "@/components/ui/label";
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
  Package,
  Plus,
  ImagePlus,
  Video,
  Trash2,
  Check,
  ArrowRight,
  DollarSign,
  MapPin,
  User,
  Truck,
} from "lucide-react";

const SUPPLY_CATEGORIES = [
  { value: "detergents", label: "Detergents & Soaps" },
  { value: "fabric-softeners", label: "Fabric Softeners" },
  { value: "bleach", label: "Bleach & Stain Removers" },
  { value: "chemicals", label: "Industrial Chemicals" },
  { value: "vending-products", label: "Vending Products" },
  { value: "hangers", label: "Hangers & Garment Bags" },
  { value: "bags", label: "Laundry Bags & Carts" },
  { value: "cleaning-supplies", label: "Cleaning Supplies" },
  { value: "signage", label: "Signage & Marketing" },
  { value: "packaging", label: "Packaging Materials" },
  { value: "uniforms", label: "Staff Uniforms" },
  { value: "other", label: "Other Supplies" },
];

const BRANDS = [
  "Tide", "Gain", "Downy", "Clorox", "OxiClean", "Persil",
  "All", "Arm & Hammer", "Seventh Generation", "Method",
  "Ecolab", "Diversey", "P&G Professional", "Other"
];

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Please provide more details").max(2000),
  category: z.string().min(1, "Please select a category"),
  brand: z.string().optional(),
  sku: z.string().optional(),
  price: z.string().optional(),
  minimumOrder: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().optional(),
  shipsNationwide: z.boolean().default(true),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function ListSuppliesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      brand: "",
      sku: "",
      price: "",
      minimumOrder: "",
      city: "",
      state: "",
      zipCode: "",
      shipsNationwide: true,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : null,
        minimumOrder: data.minimumOrder ? parseInt(data.minimumOrder) : null,
        images,
        videos,
      };
      return apiRequest("POST", "/api/supply-listings", payload);
    },
    onSuccess: () => {
      toast({
        title: "Supplies Listed!",
        description: "Your supply listing is now live and FREE.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/supply-listings"] });
      navigate("/marketplace");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    },
  });

  const addImage = () => {
    if (newImageUrl && !images.includes(newImageUrl)) {
      setImages([...images, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const removeImage = (url: string) => {
    setImages(images.filter((img) => img !== url));
  };

  const addVideo = () => {
    if (newVideoUrl && !videos.includes(newVideoUrl)) {
      setVideos([...videos, newVideoUrl]);
      setNewVideoUrl("");
    }
  };

  const removeVideo = (url: string) => {
    setVideos(videos.filter((vid) => vid !== url));
  };

  const onSubmit = (data: ListingFormData) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <SEO
        title="List Supplies for Sale | WashBizHub FREE Marketplace"
        description="List your laundromat supplies for sale absolutely FREE. Reach thousands of buyers looking for detergents, chemicals, and laundry products."
        keywords={["sell laundry supplies", "commercial detergents", "laundry chemicals", "laundromat supplies marketplace"]}
        canonicalUrl="/list-supplies"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
                100% FREE Listings
              </Badge>
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                <Package className="w-10 h-10 text-primary" />
                List Your Supplies
              </h1>
              <p className="text-lg text-muted-foreground">
                Sell laundry supplies, chemicals, and products to thousands of buyers. No fees, no commissions.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Supply Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Supply Details</CardTitle>
                    <CardDescription>
                      Provide details about the supplies you're selling
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Bulk Commercial Laundry Detergent - 5 Gallon"
                              data-testid="input-title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SUPPLY_CATEGORIES.map((cat) => (
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
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-brand">
                                  <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BRANDS.map((brand) => (
                                  <SelectItem key={brand} value={brand.toLowerCase()}>
                                    {brand}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU / Product Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., TDE-5GAL-001"
                              data-testid="input-sku"
                              {...field}
                            />
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the product, quantity available, specifications..."
                              className="min-h-[150px]"
                              data-testid="input-description"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include details like quantity, size, specifications, bulk pricing
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Media */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImagePlus className="w-5 h-5" />
                      Photos & Videos
                    </CardTitle>
                    <CardDescription>
                      Add images and videos to showcase your products
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Images */}
                    <div className="space-y-3">
                      <Label>Images</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Paste image URL"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          data-testid="input-image-url"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addImage}
                          data-testid="button-add-image"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          {images.map((url, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-lg overflow-hidden border aspect-square"
                            >
                              <img
                                src={url}
                                alt={`Product ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(url)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                data-testid={`button-remove-image-${idx}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Videos */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Videos
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Paste YouTube or video URL"
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          data-testid="input-video-url"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addVideo}
                          data-testid="button-add-video"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {videos.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {videos.map((url, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                            >
                              <Video className="w-4 h-4 text-muted-foreground" />
                              <span className="flex-1 text-sm truncate">{url}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVideo(url)}
                                data-testid={`button-remove-video-${idx}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 49.99"
                                data-testid="input-price"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Leave blank for "Contact for Price"
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="minimumOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Order Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 10"
                                data-testid="input-min-order"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Leave blank if no minimum
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Shipping */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location & Shipping
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Los Angeles"
                                data-testid="input-city"
                                {...field}
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
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., CA"
                                data-testid="input-state"
                                {...field}
                              />
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
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 90001"
                                data-testid="input-zip"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="shipsNationwide"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5 flex items-center gap-3">
                            <Truck className="w-5 h-5 text-primary" />
                            <div>
                              <FormLabel className="text-base">
                                Ships Nationwide
                              </FormLabel>
                              <FormDescription>
                                Do you ship across the country?
                              </FormDescription>
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-ships-nationwide"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
                      How buyers can reach you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Smith"
                                data-testid="input-contact-name"
                                {...field}
                              />
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
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                data-testid="input-contact-email"
                                {...field}
                              />
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
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(555) 123-4567"
                                data-testid="input-contact-phone"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    <Check className="w-4 h-4 inline mr-1 text-green-500" />
                    100% Free to list - No hidden fees
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={createMutation.isPending}
                    className="gap-2"
                    data-testid="button-submit-listing"
                  >
                    {createMutation.isPending ? (
                      "Creating Listing..."
                    ) : (
                      <>
                        List Supplies
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
