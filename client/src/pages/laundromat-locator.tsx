import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SeoHead } from "@/components/SeoHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, Search, Filter, Clock, Phone, Navigation2, Plus, Building2, CheckCircle, Loader2 } from "lucide-react";
import type { Laundromat } from "@shared/schema";

interface LaundromatWithDistance extends Laundromat {
  distance?: string;
  isOpen?: boolean;
}

const listingFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required").max(2, "Use 2-letter state code"),
  zipCode: z.string().min(5, "Zip code must be 5 digits").max(10),
  phone: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingFormSchema>;

export default function LaundromatLocator() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 40.7128, lng: -74.006 });
        }
      );
    }
  }, []);

  const { data: laundromats = [], isLoading } = useQuery<Laundromat[]>({
    queryKey: ["/api/laundromats", stateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (stateFilter) params.append("state", stateFilter);
      const res = await fetch(`/api/laundromats?${params}`);
      return res.json();
    },
  });

  const listingMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      return apiRequest("/api/laundromats", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Listing Submitted!",
        description: "Your laundromat has been added to our directory. It will appear after verification.",
      });
      setDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/laundromats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later. You may need to be logged in.",
        variant: "destructive",
      });
    },
  });

  const handleListingSubmit = (data: ListingFormData) => {
    listingMutation.mutate(data);
  };

  const laundromatsList: LaundromatWithDistance[] = laundromats.map((l) => ({
    ...l,
    distance: l.latitude && l.longitude && userLocation
      ? calculateDistance(userLocation.lat, userLocation.lng, Number(l.latitude), Number(l.longitude))
      : undefined,
    isOpen: isCurrentlyOpen(l.hours),
  }));

  const filteredLaundromats = laundromatsList.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusinessCategory",
    name: "Laundromat Locator",
    description: "Find laundromats near you with real-time availability",
    url: "https://washbizhub.com/laundromat-locator",
  };

  const US_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <>
      <SeoHead
        title="Laundromat Locator - Find Laundromats Near You | WashBizHub"
        description="Find laundromats near you. Search by city, state, or zip code. View hours, phone, and get directions. Free to list your laundromat business."
        keywords={[
          "laundromat finder",
          "find laundromat",
          "laundromat near me",
          "laundry locations",
          "wash near me",
          "laundromat map",
          "list my laundromat",
        ]}
        canonical="https://washbizhub.com/laundromat-locator"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <MapPin className="w-12 h-12 text-[#39CCCC]" />
              Laundromat Locator
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Find laundromats near you or list your own business for free
            </p>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 bg-[#39CCCC] hover:bg-[#2db8b8]" data-testid="button-list-business">
                  <Plus className="w-5 h-5" />
                  List Your Laundromat Free
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-white/20 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#39CCCC]" />
                    List Your Laundromat
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Add your laundromat to our directory. It's free and helps customers find you!
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleListingSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Business Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Downtown Laundromat"
                              data-testid="input-listing-name"
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Street Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="123 Main St"
                              data-testid="input-listing-address"
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">City</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Dallas"
                                data-testid="input-listing-city"
                                className="bg-white/10 border-white/20 text-white"
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
                            <FormLabel className="text-white">State</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="TX"
                                maxLength={2}
                                data-testid="input-listing-state"
                                className="bg-white/10 border-white/20 text-white uppercase"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Zip Code</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="75201"
                                data-testid="input-listing-zip"
                                className="bg-white/10 border-white/20 text-white"
                              />
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
                            <FormLabel className="text-white">Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder="(555) 123-4567"
                                data-testid="input-listing-phone"
                                className="bg-white/10 border-white/20 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      data-testid="button-submit-listing"
                      className="w-full bg-[#39CCCC] hover:bg-[#2db8b8]"
                      disabled={listingMutation.isPending}
                    >
                      {listingMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Add My Laundromat
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="max-w-6xl mx-auto mb-8">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#39CCCC]" />
                  Search Laundromats
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Find laundromats by name, address, or filter by state
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, address, or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                      data-testid="input-locator-search"
                    />
                  </div>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm"
                    data-testid="select-state"
                  >
                    <option value="">All States</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-[#39CCCC] animate-spin" />
            </div>
          ) : filteredLaundromats.length > 0 ? (
            <Tabs defaultValue="list" className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
                <TabsTrigger value="list" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-white">
                  List View
                </TabsTrigger>
                <TabsTrigger value="map" className="data-[state=active]:bg-[#39CCCC] data-[state=active]:text-white">
                  Map View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLaundromats.map((laundromat) => (
                    <Card
                      key={laundromat.id}
                      className="bg-white/5 backdrop-blur-lg border-white/10 hover-elevate"
                      data-testid={`card-laundromat-${laundromat.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-white text-lg">{laundromat.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              {laundromat.verified && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {laundromat.featured && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${laundromat.address}, ${laundromat.city}, ${laundromat.state} ${laundromat.zipCode}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`button-navigate-${laundromat.id}`}
                          >
                            <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
                              <Navigation2 className="w-4 h-4" />
                            </Button>
                          </a>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 mt-1 text-[#39CCCC] flex-shrink-0" />
                          <div className="text-sm">
                            <div>{laundromat.address}</div>
                            <div className="text-gray-400">
                              {laundromat.city}, {laundromat.state} {laundromat.zipCode}
                            </div>
                            {laundromat.distance && (
                              <div className="text-[#39CCCC] mt-1">{laundromat.distance} away</div>
                            )}
                          </div>
                        </div>

                        {laundromat.phone && (
                          <a
                            href={`tel:${laundromat.phone}`}
                            className="flex items-center gap-2 text-gray-300 hover:text-white"
                            data-testid={`button-call-${laundromat.id}`}
                          >
                            <Phone className="w-4 h-4 text-[#39CCCC]" />
                            <span className="text-sm">{laundromat.phone}</span>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="map" className="mt-6">
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8 text-center">
                  <CardContent>
                    <MapPin className="w-16 h-16 text-[#39CCCC] mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">
                      Interactive map coming soon! For now, click the navigation button on any listing to open in Google Maps.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="max-w-2xl mx-auto bg-white/5 backdrop-blur-lg border-white/10 text-center py-12">
              <CardContent className="space-y-6">
                <Building2 className="w-20 h-20 text-gray-500 mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">No Laundromats Found</h2>
                  <p className="text-gray-400 mb-6">
                    {searchQuery || stateFilter
                      ? "Try adjusting your search filters"
                      : "Be the first to list your laundromat!"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(searchQuery || stateFilter) && (
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => {
                        setSearchQuery("");
                        setStateFilter("");
                      }}
                      data-testid="button-clear-filters"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    className="bg-[#39CCCC] hover:bg-[#2db8b8] gap-2"
                    onClick={() => setDialogOpen(true)}
                    data-testid="button-list-first"
                  >
                    <Plus className="w-4 h-4" />
                    List Your Laundromat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="max-w-6xl mx-auto mt-8 bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="pt-6">
              <p className="text-gray-400 text-center">
                Showing <strong className="text-white">{filteredLaundromats.length}</strong> laundromats
                {stateFilter && <span> in {stateFilter}</span>}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance < 0.1 ? "< 0.1 mi" : `${distance.toFixed(1)} mi`;
}

function isCurrentlyOpen(hours: any): boolean {
  if (!hours) return true;
  return true;
}
