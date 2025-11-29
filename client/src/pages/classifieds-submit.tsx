import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, ArrowLeft, Loader2, ShoppingBag, Store, Wrench, Building2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

const CATEGORIES = [
  { value: "equipment", label: "Laundry Equipment", icon: ShoppingBag, description: "Washers, dryers, folding tables, carts" },
  { value: "parts", label: "Parts & Supplies", icon: Wrench, description: "Replacement parts, chemicals, detergents" },
  { value: "business", label: "Laundromat for Sale", icon: Store, description: "Full laundromat businesses" },
  { value: "services", label: "Services", icon: Building2, description: "Installation, repair, consulting" },
];

const SUBCATEGORIES: Record<string, string[]> = {
  equipment: ["Commercial Washer", "Commercial Dryer", "Stacked Units", "Folding Equipment", "Carts & Racks", "Change Machines", "Card Systems", "Other"],
  parts: ["Washer Parts", "Dryer Parts", "Payment System Parts", "Chemicals & Detergent", "Other"],
  business: ["Coin Laundry", "Wash-Dry-Fold", "Pick Up & Delivery", "Multi-Location", "Other"],
  services: ["Installation", "Repair & Maintenance", "Consulting", "Financing", "Insurance", "Marketing", "Other"],
};

const CONDITIONS = ["New", "Like New", "Excellent", "Good", "Fair", "For Parts"];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const listingSchema = z.object({
  sellerName: z.string().min(2, "Name is required"),
  sellerEmail: z.string().email("Valid email required"),
  sellerPhone: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  price: z.string().optional(),
  priceType: z.enum(["fixed", "negotiable", "call", "auction"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  yearMade: z.string().optional(),
  quantity: z.string().optional(),
  condition: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function ClassifiedsSubmit() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      sellerName: "",
      sellerEmail: "",
      sellerPhone: "",
      title: "",
      description: "",
      category: "",
      subcategory: "",
      price: "",
      priceType: "fixed",
      city: "",
      state: "",
      zipCode: "",
      manufacturer: "",
      model: "",
      yearMade: "",
      quantity: "1",
      condition: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const response = await apiRequest("POST", "/api/marketplace/listings", {
        ...data,
        price: data.price ? parseFloat(data.price) : null,
        yearMade: data.yearMade ? parseInt(data.yearMade) : null,
        quantity: data.quantity ? parseInt(data.quantity) : 1,
        images: [],
      });
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Listing Submitted",
        description: "Your listing has been submitted for review. You'll receive an email once approved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ListingFormData) => {
    submitMutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Listing Submitted | WashBizHub Classifieds</title>
        </Helmet>
        <div className="container max-w-2xl mx-auto py-20 px-4">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
              <h1 className="text-3xl font-bold text-foreground mb-4">Listing Submitted!</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your listing has been submitted for review. You'll receive an email notification 
                once it's approved and live on the classifieds.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button asChild variant="default">
                  <Link href="/classifieds">Browse Classifieds</Link>
                </Button>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Submit Another Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Post Free Listing | WashBizHub Classifieds</title>
        <meta name="description" content="List your laundry equipment, services, or business for sale on WashBizHub. Reach thousands of laundromat owners and industry professionals." />
      </Helmet>

      <div className="bg-gradient-to-r from-[#001F3F] to-[#0d4f8b] text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/classifieds" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Classifieds
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Post a Free Listing</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Reach thousands of laundromat owners and industry professionals. Laundry-related listings are FREE.
          </p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <Card>
              <CardHeader>
                <CardTitle>Select Category</CardTitle>
                <CardDescription>What type of listing are you creating?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.value;
                    return (
                      <div
                        key={cat.value}
                        onClick={() => {
                          setSelectedCategory(cat.value);
                          form.setValue("category", cat.value);
                        }}
                        className={`
                          cursor-pointer p-4 rounded-lg border-2 transition-all
                          ${isSelected 
                            ? "border-[#b8860b] bg-[#b8860b]/5" 
                            : "border-border hover-elevate"
                          }
                        `}
                        data-testid={`category-${cat.value}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-[#b8860b]/10" : "bg-muted"}`}>
                            <Icon className={`w-6 h-6 ${isSelected ? "text-[#b8860b]" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className={`font-semibold ${isSelected ? "text-[#b8860b]" : "text-foreground"}`}>
                              {cat.label}
                            </div>
                            <div className="text-sm text-muted-foreground">{cat.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive mt-2">{form.formState.errors.category.message}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
                <CardDescription>Your contact details (won't be publicly shown until approved)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sellerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} data-testid="input-seller-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sellerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-seller-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="sellerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} data-testid="input-seller-phone" />
                      </FormControl>
                      <FormDescription>Buyers can contact you directly</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Listing Details</CardTitle>
                <CardDescription>Describe what you're selling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Speed Queen SC40 Commercial Washer" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCategory && SUBCATEGORIES[selectedCategory] && (
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-subcategory">
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUBCATEGORIES[selectedCategory].map((sub) => (
                              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your item in detail. Include condition, specifications, history, and any other relevant information."
                          className="min-h-[120px]"
                          {...field} 
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Speed Queen" {...field} data-testid="input-manufacturer" />
                        </FormControl>
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
                          <Input placeholder="e.g. SC40" {...field} data-testid="input-model" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearMade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g. 2020" {...field} data-testid="input-year" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-condition">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONDITIONS.map((cond) => (
                              <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} data-testid="input-quantity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              className="pl-7"
                              {...field} 
                              data-testid="input-price"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-price-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Price</SelectItem>
                            <SelectItem value="negotiable">Negotiable</SelectItem>
                            <SelectItem value="call">Call for Price</SelectItem>
                            <SelectItem value="auction">Taking Offers</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Where is the item located?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Los Angeles" {...field} data-testid="input-city" />
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
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {US_STATES.map((st) => (
                              <SelectItem key={st} value={st}>{st}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          <Input placeholder="e.g. 90210" {...field} data-testid="input-zip" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href="/classifieds">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                className="bg-[#b8860b] hover:bg-[#a07609] text-white min-w-[150px]"
                data-testid="button-submit-listing"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Listing"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}