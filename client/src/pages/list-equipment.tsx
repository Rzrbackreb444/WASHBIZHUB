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
  Wrench,
  Plus,
  ImagePlus,
  Video,
  Trash2,
  Check,
  ArrowRight,
  Upload,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react";

const EQUIPMENT_CATEGORIES = [
  { value: "washers", label: "Commercial Washers" },
  { value: "dryers", label: "Commercial Dryers" },
  { value: "stacked", label: "Stacked Units" },
  { value: "coin-op", label: "Coin Mechanisms" },
  { value: "card-systems", label: "Card Systems" },
  { value: "parts", label: "Parts & Components" },
  { value: "water-heaters", label: "Water Heaters" },
  { value: "carts-baskets", label: "Carts & Baskets" },
  { value: "folding-tables", label: "Folding Tables" },
  { value: "vending", label: "Vending Machines" },
  { value: "signage", label: "Signage & Displays" },
  { value: "other", label: "Other Equipment" },
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "for-parts", label: "For Parts Only" },
];

const BRANDS = [
  "Speed Queen", "Dexter", "Maytag", "Whirlpool", "LG", "Samsung", 
  "Huebsch", "Continental Girbau", "Wascomat", "IPSO", "Unimac",
  "Electrolux", "Milnor", "Primus", "Other"
];

const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Please provide more details").max(2000),
  category: z.string().min(1, "Please select a category"),
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: z.string().min(1, "Please select condition"),
  yearManufactured: z.string().optional(),
  price: z.string().optional(),
  priceNegotiable: z.boolean().default(true),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().optional(),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function ListEquipmentPage() {
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
      model: "",
      condition: "",
      yearManufactured: "",
      price: "",
      priceNegotiable: true,
      city: "",
      state: "",
      zipCode: "",
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
        yearManufactured: data.yearManufactured ? parseInt(data.yearManufactured) : null,
        images,
        videos,
      };
      return apiRequest("POST", "/api/equipment-listings", payload);
    },
    onSuccess: () => {
      toast({
        title: "Equipment Listed!",
        description: "Your equipment listing is now live and FREE.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment-listings"] });
      navigate("/equipment-marketplace");
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
        title="List Equipment for Sale | WashBizHub FREE Marketplace"
        description="List your laundromat equipment for sale absolutely FREE. Reach thousands of buyers looking for washers, dryers, parts, and more."
        keywords={["sell laundromat equipment", "used commercial washers", "sell dryers", "laundry equipment marketplace"]}
        canonicalUrl="/list-equipment"
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
                <Wrench className="w-10 h-10 text-primary" />
                List Your Equipment
              </h1>
              <p className="text-lg text-muted-foreground">
                Sell your commercial laundry equipment to thousands of buyers. No fees, no commissions.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Equipment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Details</CardTitle>
                    <CardDescription>
                      Provide details about the equipment you're selling
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
                              placeholder="e.g., Speed Queen 80lb Commercial Washer"
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
                                {EQUIPMENT_CATEGORIES.map((cat) => (
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
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-condition">
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CONDITIONS.map((cond) => (
                                  <SelectItem key={cond.value} value={cond.value}>
                                    {cond.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
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

                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., SC80"
                                data-testid="input-model"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearManufactured"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 2020"
                                data-testid="input-year"
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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the equipment, its features, any issues, why you're selling..."
                              className="min-h-[150px]"
                              data-testid="input-description"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include details like capacity, special features, maintenance history
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
                      Add images and videos to showcase your equipment
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
                                alt={`Equipment ${idx + 1}`}
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
                            <FormLabel>Asking Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 5000"
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
                        name="priceNegotiable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Price Negotiable
                              </FormLabel>
                              <FormDescription>
                                Are you open to offers?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-negotiable"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                        List Equipment
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
