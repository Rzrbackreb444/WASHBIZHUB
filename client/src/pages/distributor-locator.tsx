import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Phone, Mail, Building2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const MAJOR_BRANDS = [
  "Speed Queen",
  "Dexter",
  "Huebsch",
  "Maytag",
  "Alliance",
  "Wascomat",
  "Electrolux",
  "Milnor",
  "UniMac"
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const inquiryFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone must be at least 10 digits"),
  businessName: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryFormData = z.infer<typeof inquiryFormSchema>;

export default function DistributorLocator() {
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistributor, setSelectedDistributor] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<InquiryFormData>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      businessName: "",
      message: "",
    },
  });

  const { data: distributors, isLoading } = useQuery<any[]>({
    queryKey: ["/api/distributors", selectedBrand, selectedState],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedBrand) params.append("brandName", selectedBrand);
      if (selectedState) params.append("state", selectedState);
      return fetch(`/api/distributors?${params}`).then((res) => res.json());
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: InquiryFormData & { distributorId: string }) => {
      const response = await fetch("/api/distributor-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Submitted!",
        description: "We'll contact the distributor on your behalf and get back to you within 24 hours.",
      });
      setDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/distributor-inquiries"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleInquirySubmit = (data: InquiryFormData) => {
    if (!selectedDistributor) return;
    
    inquiryMutation.mutate({
      ...data,
      distributorId: selectedDistributor.id,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Equipment Distributor Locator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find authorized distributors for top commercial laundry equipment brands.
            We'll connect you with the right partner for your business.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-yellow-500" />
                Search Distributors
              </CardTitle>
              <CardDescription className="text-gray-400">
                Filter by brand and location to find authorized distributors near you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-white">Equipment Brand</Label>
                  <Select value={selectedBrand || "all"} onValueChange={(value) => setSelectedBrand(value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-brand" className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {MAJOR_BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-white">State</Label>
                  <Select value={selectedState || "all"} onValueChange={(value) => setSelectedState(value === "all" ? "" : value)}>
                    <SelectTrigger data-testid="select-state" className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
        ) : distributors && distributors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {distributors.map((distributor) => (
              <Card
                key={distributor.id}
                data-testid={`card-distributor-${distributor.id}`}
                className="bg-white/5 backdrop-blur-lg border-white/10 hover-elevate"
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-yellow-500" />
                    {distributor.distributorName}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {distributor.brandName} • {distributor.regions?.join(", ") || ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 mt-1 text-yellow-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div>Coverage: {distributor.states?.join(", ")}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        Equipment: {distributor.equipmentTypes?.join(", ")}
                      </div>
                    </div>
                  </div>

                  {distributor.website && (
                    <a
                      href={distributor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-500 hover:text-yellow-400 text-sm underline"
                    >
                      Visit Website
                    </a>
                  )}

                  <Dialog open={dialogOpen && selectedDistributor?.id === distributor.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) setSelectedDistributor(distributor);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        data-testid={`button-inquire-${distributor.id}`}
                        className="w-full mt-4"
                        variant="default"
                      >
                        Request Information
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-white/20 text-white">
                      <DialogHeader>
                        <DialogTitle>Contact {distributor.name}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Fill out the form below and we'll connect you with this distributor within 24 hours.
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleInquirySubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Your Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    data-testid="input-inquiry-name"
                                    className="bg-white/10 border-white/20 text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customerEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Email</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    data-testid="input-inquiry-email"
                                    className="bg-white/10 border-white/20 text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="customerPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Phone</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="tel"
                                    data-testid="input-inquiry-phone"
                                    className="bg-white/10 border-white/20 text-white"
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
                                <FormLabel className="text-white">Business Name (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    data-testid="input-inquiry-business"
                                    className="bg-white/10 border-white/20 text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Message</FormLabel>
                                <FormControl>
                                  <textarea
                                    {...field}
                                    data-testid="input-inquiry-message"
                                    rows={4}
                                    className="w-full bg-white/10 border-white/20 text-white rounded-md px-3 py-2 border"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            data-testid="button-submit-inquiry"
                            className="w-full"
                            disabled={inquiryMutation.isPending}
                          >
                            {inquiryMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Inquiry"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-xl text-gray-400">
                No distributors found. Try adjusting your filters or{" "}
                <button
                  onClick={() => {
                    setSelectedBrand("");
                    setSelectedState("");
                  }}
                  className="text-yellow-500 hover:text-yellow-400 underline"
                >
                  clear all filters
                </button>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
