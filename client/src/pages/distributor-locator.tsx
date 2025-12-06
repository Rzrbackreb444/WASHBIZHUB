import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building2, Loader2, ExternalLink, ShoppingCart, CheckCircle, Wrench, Globe, Award, ArrowRight, Package } from "lucide-react";
import { Helmet } from "react-helmet-async";

const MAJOR_BRANDS = [
  "Speed Queen",
  "Dexter",
  "Huebsch",
  "Maytag",
  "Alliance",
  "Wascomat",
  "Electrolux",
  "Milnor",
  "UniMac",
  "Continental Girbau",
  "LG Commercial",
  "Miele Professional",
  "IPSO",
  "Primus",
  "Fagor",
  "Jensen",
  "Yamamoto"
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const EQUIPMENT_TYPES = [
  "Washers",
  "Dryers", 
  "Washer-Extractors",
  "Stack Units",
  "Finishing Equipment",
  "Folders",
  "Ironers"
];

export default function DistributorLocator() {
  const [, navigate] = useLocation();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>("");

  const { data: distributors, isLoading } = useQuery<any[]>({
    queryKey: ["/api/distributors", selectedBrand, selectedState, selectedEquipmentType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedBrand) params.append("brandName", selectedBrand);
      if (selectedState) params.append("state", selectedState);
      if (selectedEquipmentType) params.append("equipmentType", selectedEquipmentType);
      return fetch(`/api/distributors?${params}`).then((res) => res.json());
    },
  });

  const handleRequestQuote = () => {
    navigate("/equipment-builder");
  };

  return (
    <>
      <Helmet>
        <title>Commercial Laundry Equipment Distributors | Find Local Dealers | WashBizHub</title>
        <meta name="description" content="Find authorized distributors for Speed Queen, Dexter, Huebsch, Maytag and 30+ commercial laundry equipment brands. Get free equipment quotes from 350+ verified dealers nationwide." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1628] via-[#1a2744] to-[#0A1628] border-b border-[#C8A661]/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFhMjc0NCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Award className="w-3 h-3 mr-1" />
                585+ Verified Distributors
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Commercial Laundry Equipment
                <span className="block text-[#C8A661]">Distributor Network</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Find authorized distributors for 30+ brands. Build your complete equipment list and get personalized quotes from verified dealers.
              </p>

              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#C8A661]" />
                  How It Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                      <Search className="w-5 h-5 text-[#C8A661]" />
                    </div>
                    <span className="text-gray-300">1. Find Distributors</span>
                    <span className="text-gray-500 text-xs">Filter by brand & location</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#C8A661]" />
                    </div>
                    <span className="text-gray-300">2. Build Equipment List</span>
                    <span className="text-gray-500 text-xs">Washers, dryers, capacities</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#C8A661]/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-[#C8A661]" />
                    </div>
                    <span className="text-gray-300">3. Get Free Quotes</span>
                    <span className="text-gray-500 text-xs">We connect you to dealers</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleRequestQuote()}
                  data-testid="button-hero-equipment-quote"
                  className="mt-6 bg-[#C8A661] hover:bg-[#B8964E] text-black font-semibold px-8"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Build Your Equipment List
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <p className="text-xs text-gray-500 mt-3">
                  All inquiries handled by equipment@washbizhub.com
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto mb-8">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#C8A661]" />
                  Search Distributors
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Filter by brand, location, and equipment type to find authorized distributors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="equipmentType" className="text-white">Equipment Type</Label>
                    <Select value={selectedEquipmentType || "all"} onValueChange={(value) => setSelectedEquipmentType(value === "all" ? "" : value)}>
                      <SelectTrigger data-testid="select-equipment-type" className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {EQUIPMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase()}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(selectedBrand || selectedState || selectedEquipmentType) && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-sm text-gray-400">Active Filters:</span>
                    {selectedBrand && (
                      <Badge variant="secondary" className="bg-[#C8A661]/20 text-[#C8A661]">
                        {selectedBrand}
                      </Badge>
                    )}
                    {selectedState && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                        {selectedState}
                      </Badge>
                    )}
                    {selectedEquipmentType && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        {selectedEquipmentType}
                      </Badge>
                    )}
                    <button
                      onClick={() => {
                        setSelectedBrand("");
                        setSelectedState("");
                        setSelectedEquipmentType("");
                      }}
                      className="text-sm text-gray-400 hover:text-white underline ml-2"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-400">
              {distributors?.length || 0} distributors found
            </div>
            <Button 
              onClick={() => handleRequestQuote()}
              data-testid="button-request-quote-top"
              className="bg-[#C8A661] hover:bg-[#B8964E] text-black font-semibold"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Request Equipment Quote
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-[#C8A661] animate-spin" />
            </div>
          ) : distributors && distributors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {distributors.map((distributor) => (
                <Card
                  key={distributor.id}
                  data-testid={`card-distributor-${distributor.id}`}
                  className="bg-white/5 backdrop-blur-lg border-white/10 hover-elevate group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <Building2 className="w-5 h-5 text-[#C8A661] flex-shrink-0" />
                          <span className="truncate">{distributor.distributorName}</span>
                        </CardTitle>
                        <CardDescription className="text-[#C8A661] font-medium mt-1">
                          {distributor.brandName}
                        </CardDescription>
                      </div>
                      {distributor.website && (
                        <a
                          href={distributor.website.startsWith('http') ? distributor.website : `https://${distributor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-[#C8A661] transition-colors"
                          title="Visit Website"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2 text-gray-300">
                      <MapPin className="w-4 h-4 mt-0.5 text-[#C8A661] flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium">Service Area</div>
                        <div className="text-gray-400 flex flex-wrap gap-1 mt-1">
                          {distributor.states?.slice(0, 6).map((state: string) => (
                            <Badge key={state} variant="outline" className="text-xs border-white/20 text-gray-300">
                              {state}
                            </Badge>
                          ))}
                          {distributor.states?.length > 6 && (
                            <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                              +{distributor.states.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-gray-300">
                      <Wrench className="w-4 h-4 mt-0.5 text-[#C8A661] flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium">Equipment</div>
                        <div className="text-gray-400 mt-1">
                          {distributor.equipmentTypes?.join(", ") || "Full line equipment"}
                        </div>
                      </div>
                    </div>

                    {distributor.regions && distributor.regions.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Region: {distributor.regions.join(", ")}
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <Button
                        onClick={() => handleRequestQuote(distributor)}
                        data-testid={`button-quote-${distributor.id}`}
                        className="flex-1 bg-[#C8A661] hover:bg-[#B8964E] text-black font-medium"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Get Quote
                      </Button>
                      {distributor.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-gray-300 hover:bg-white/10"
                          asChild
                        >
                          <a
                            href={distributor.website.startsWith('http') ? distributor.website : `https://${distributor.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-center py-12">
              <CardContent>
                <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-xl text-gray-400 mb-4">
                  No distributors found matching your filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedBrand("");
                    setSelectedState("");
                    setSelectedEquipmentType("");
                  }}
                  className="text-[#C8A661] hover:text-[#B8964E] underline"
                >
                  Clear all filters
                </button>
              </CardContent>
            </Card>
          )}

          <Card className="mt-12 bg-gradient-to-r from-[#C8A661]/10 to-[#C8A661]/5 border-[#C8A661]/20">
            <CardContent className="py-8">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Need Help Choosing Equipment?
                </h3>
                <p className="text-gray-300 mb-6">
                  Our equipment specialists can help you build the perfect equipment package for your laundromat. 
                  Get personalized recommendations based on your store size, budget, and business goals.
                </p>
                <Button 
                  onClick={() => handleRequestQuote()}
                  data-testid="button-bottom-cta"
                  className="bg-[#C8A661] hover:bg-[#B8964E] text-black font-semibold px-8"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Build Your Equipment List
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  All inquiries are handled by our equipment team at equipment@washbizhub.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
