import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SeoHead } from "@/components/SeoHead";
import { LaundromatMap } from "@/components/LaundromatMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Filter, Star, Clock, Zap, Phone, Navigation2 } from "lucide-react";

interface Laundromat {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  rating: number;
  distance: string;
  hours: string;
  machines: number;
  price: string;
  open: boolean;
}

export default function LaundromatLocator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState("5");
  const [selectedLaundromat, setSelectedLaundromat] = useState<Laundromat | null>(null);

  const { data: laundromats = [] } = useQuery<Laundromat[]>({
    queryKey: ["/api/laundromat-locator"],
    initialData: [
      {
        id: "l1",
        name: "Downtown Laundromat",
        lat: 40.758,
        lng: -73.9855,
        address: "123 5th Ave, New York, NY 10176",
        phone: "(212) 555-0100",
        rating: 4.8,
        distance: "0.3 mi",
        hours: "6am - 11pm Daily",
        machines: 24,
        price: "$1.75",
        open: true,
      },
      {
        id: "l2",
        name: "Midtown Express",
        lat: 40.7489,
        lng: -73.9680,
        address: "456 Park Ave, New York, NY 10022",
        phone: "(212) 555-0200",
        rating: 4.6,
        distance: "0.5 mi",
        hours: "7am - 10pm Daily",
        machines: 18,
        price: "$1.50",
        open: true,
      },
      {
        id: "l3",
        name: "Upper East Side Wash",
        lat: 40.7738,
        lng: -73.9563,
        address: "789 Madison Ave, New York, NY 10065",
        phone: "(212) 555-0300",
        rating: 4.7,
        distance: "1.2 mi",
        hours: "6am - Midnight",
        machines: 20,
        price: "$1.60",
        open: true,
      },
      {
        id: "l4",
        name: "West Village Laundry",
        lat: 40.7337,
        lng: -74.0043,
        address: "321 Bleecker St, New York, NY 10014",
        phone: "(212) 555-0400",
        rating: 4.5,
        distance: "1.8 mi",
        hours: "8am - 9pm Daily",
        machines: 16,
        price: "$1.80",
        open: false,
      },
    ],
  });

  const filteredLaundromats = laundromats.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusinessCategory",
    name: "Laundromat Locator",
    description: "Find laundromats near you with real-time availability",
    url: "https://washbizhub.com/laundromat-locator",
  };

  return (
    <>
      <SeoHead
        title="Laundromat Locator - Find Laundromats Near You"
        description="Find laundromats near you on an interactive map. See ratings, hours, prices, and machine counts. Real-time availability and directions."
        keywords={[
          "laundromat finder",
          "find laundromat",
          "laundromat near me",
          "laundry locations",
          "wash near me",
          "laundromat map",
        ]}
        canonical="https://washbizhub.com/laundromat-locator"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
              <MapPin className="w-10 h-10 text-primary" />
              Laundromat Locator
            </h1>
            <p className="text-muted-foreground text-lg">
              Find laundromats near you with ratings, hours, and real-time availability
            </p>
          </div>

          {/* Search & Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-locator-search"
                  />
                </div>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  className="px-3 py-2 bg-muted border rounded-md text-sm"
                  data-testid="select-distance"
                >
                  <option value="1">Within 1 mile</option>
                  <option value="3">Within 3 miles</option>
                  <option value="5">Within 5 miles</option>
                  <option value="10">Within 10 miles</option>
                </select>
                <Button variant="outline" className="gap-2" data-testid="button-advanced-filters">
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs: Map vs List */}
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">Map View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            {/* Map Tab */}
            <TabsContent value="map" className="mt-6">
              <LaundromatMap
                laundromats={filteredLaundromats}
                onSelectLaundromat={setSelectedLaundromat}
                userLat={40.7128}
                userLng={-74.006}
              />
            </TabsContent>

            {/* List Tab */}
            <TabsContent value="list" className="mt-6">
              <div className="space-y-4">
                {filteredLaundromats.map((laundromat) => (
                  <Card
                    key={laundromat.id}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setSelectedLaundromat(laundromat)}
                    data-testid={`list-item-${laundromat.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{laundromat.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={laundromat.open ? "default" : "secondary"}>
                              {laundromat.open ? "Open Now" : "Closed"}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-semibold">{laundromat.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" data-testid={`button-navigate-${laundromat.id}`}>
                          <Navigation2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Distance */}
                        <div className="flex gap-2">
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-muted-foreground">Distance</p>
                            <p className="font-semibold">{laundromat.distance}</p>
                          </div>
                        </div>

                        {/* Hours */}
                        <div className="flex gap-2">
                          <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-muted-foreground">Hours</p>
                            <p className="font-semibold text-xs">{laundromat.hours}</p>
                          </div>
                        </div>

                        {/* Machines */}
                        <div className="flex gap-2">
                          <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-muted-foreground">Machines</p>
                            <p className="font-semibold">{laundromat.machines}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-sm">
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-semibold">{laundromat.price}/lb</p>
                        </div>
                      </div>

                      {/* Address & Phone */}
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-sm text-muted-foreground">{laundromat.address}</p>
                        <Button variant="outline" size="sm" className="w-full gap-1" data-testid={`button-call-${laundromat.id}`}>
                          <Phone className="w-4 h-4" />
                          {laundromat.phone}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Results Summary */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Showing <strong>{filteredLaundromats.length}</strong> laundromats within {maxDistance} miles
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
