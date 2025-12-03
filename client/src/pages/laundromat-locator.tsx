import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
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
import { MapPin, Search, Filter, Clock, Phone, Navigation2, Plus, Building2, CheckCircle, Loader2, Star } from "lucide-react";
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

      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#0f1d2f] to-[#0a1420]">
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#b8860b] to-[#8b6914] mb-6 shadow-xl">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
              Laundromat Locator
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
              Find laundromats near you or list your own business for free
            </p>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 bg-gradient-to-r from-[#b8860b] to-[#8b6914] hover:from-[#d4a030] hover:to-[#b8860b] text-white shadow-xl rounded-xl px-8 py-6 text-lg font-semibold" data-testid="button-list-business">
                  <Plus className="w-5 h-5" />
                  List Your Laundromat Free
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] border border-[#b8860b]/30 text-white max-w-md shadow-2xl rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    <Building2 className="w-5 h-5 text-[#b8860b]" />
                    List Your Laundromat
                  </DialogTitle>
                  <DialogDescription className="text-white/60">
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
                      className="w-full bg-gradient-to-r from-[#b8860b] to-[#8b6914] hover:from-[#d4a030] hover:to-[#b8860b] text-white font-semibold shadow-lg"
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
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-6xl mx-auto mb-8"
          >
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  <Search className="w-5 h-5 text-[#b8860b]" />
                  Search Laundromats
                </CardTitle>
                <CardDescription className="text-white/60">
                  Find laundromats by name, address, or filter by state
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search by name, address, or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#b8860b] focus:ring-[#b8860b]/20"
                      data-testid="input-locator-search"
                    />
                  </div>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-[#b8860b] focus:outline-none focus:ring-2 focus:ring-[#b8860b]/20"
                    data-testid="select-state"
                  >
                    <option value="" className="bg-[#1e3a5f]">All States</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state} className="bg-[#1e3a5f]">{state}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-[#b8860b] animate-spin" />
            </div>
          ) : filteredLaundromats.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tabs defaultValue="list" className="max-w-6xl mx-auto">
                <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/10 rounded-xl p-1">
                  <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b8860b] data-[state=active]:to-[#8b6914] data-[state=active]:text-white data-[state=active]:shadow-lg">
                    List View
                  </TabsTrigger>
                  <TabsTrigger value="map" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b8860b] data-[state=active]:to-[#8b6914] data-[state=active]:text-white data-[state=active]:shadow-lg">
                    Map View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLaundromats.map((laundromat, index) => (
                      <motion.div
                        key={laundromat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card
                          className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl hover:shadow-2xl hover:border-[#b8860b]/30 transition-all duration-300"
                          data-testid={`card-laundromat-${laundromat.id}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <CardTitle className="text-white text-lg font-semibold">{laundromat.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {laundromat.verified && (
                                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                  {laundromat.featured && (
                                    <Badge className="bg-[#b8860b]/20 text-[#d4a030] border border-[#b8860b]/30">
                                      <Star className="w-3 h-3 mr-1" />
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
                                <Button variant="outline" size="icon" className="border-[#b8860b]/50 text-[#b8860b] hover:bg-[#b8860b]/20 hover:border-[#b8860b]">
                                  <Navigation2 className="w-4 h-4" />
                                </Button>
                              </a>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-3">
                            <div className="flex items-start gap-2 text-white/80">
                              <MapPin className="w-4 h-4 mt-1 text-[#b8860b] flex-shrink-0" />
                              <div className="text-sm">
                                <div>{laundromat.address}</div>
                                <div className="text-white/50">
                                  {laundromat.city}, {laundromat.state} {laundromat.zipCode}
                                </div>
                                {laundromat.distance && (
                                  <div className="text-[#d4a030] mt-1 font-medium">{laundromat.distance} away</div>
                                )}
                              </div>
                            </div>

                            {laundromat.phone && (
                              <a
                                href={`tel:${laundromat.phone}`}
                                className="flex items-center gap-2 text-white/80 hover:text-[#d4a030] transition-colors"
                                data-testid={`button-call-${laundromat.id}`}
                              >
                                <Phone className="w-4 h-4 text-[#b8860b]" />
                                <span className="text-sm">{laundromat.phone}</span>
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="map" className="mt-6">
                  <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-8 text-center">
                    <CardContent>
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#b8860b] to-[#8b6914] mb-4">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white/70 mb-4">
                        Interactive map coming soon! For now, click the navigation button on any listing to open in Google Maps.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="max-w-2xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl text-center py-12">
                <CardContent className="space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] border border-white/10 mb-2">
                    <Building2 className="w-10 h-10 text-white/50" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>No Laundromats Found</h2>
                    <p className="text-white/60 mb-6">
                      {searchQuery || stateFilter
                        ? "Try adjusting your search filters"
                        : "Be the first to list your laundromat!"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {(searchQuery || stateFilter) && (
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 hover:border-white/30"
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
                      className="bg-gradient-to-r from-[#b8860b] to-[#8b6914] hover:from-[#d4a030] hover:to-[#b8860b] text-white gap-2 shadow-lg"
                      onClick={() => setDialogOpen(true)}
                      data-testid="button-list-first"
                    >
                      <Plus className="w-4 h-4" />
                      List Your Laundromat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="max-w-6xl mx-auto mt-8 bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl">
              <CardContent className="pt-6">
                <p className="text-white/60 text-center">
                  Showing <strong className="text-[#d4a030]">{filteredLaundromats.length}</strong> laundromats
                  {stateFilter && <span className="text-white/60"> in {stateFilter}</span>}
                </p>
              </CardContent>
            </Card>
          </motion.div>
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
