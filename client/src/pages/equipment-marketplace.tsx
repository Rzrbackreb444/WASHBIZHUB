import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, MapPin, Search, Plus, ShoppingCart, MessageSquare } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  type: "washer" | "dryer" | "folding-table" | "accessories" | "other";
  brand: string;
  model: string;
  condition: "new" | "excellent" | "good" | "fair";
  price: number;
  location: string;
  sellerName: string;
  sellerRating: number;
  images: string[];
  description: string;
  createdAt: string;
}

export default function EquipmentMarketplace() {
  const [userRole, setUserRole] = useState<"buyer" | "seller">("buyer");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: equipment = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment-marketplace"],
    initialData: [
      {
        id: "e1",
        name: "Speed Queen TC5003WN Top-Load Washer",
        type: "washer",
        brand: "Speed Queen",
        model: "TC5003WN",
        condition: "excellent",
        price: 2400,
        location: "Phoenix, AZ",
        sellerName: "Arizona Laundry Supply",
        sellerRating: 4.9,
        images: [],
        description: "Commercial-grade washer, barely used, 18-month warranty remaining",
        createdAt: new Date().toISOString(),
      },
      {
        id: "e2",
        name: "Electrolux T5075XE Commercial Dryer",
        type: "dryer",
        brand: "Electrolux",
        model: "T5075XE",
        condition: "good",
        price: 1800,
        location: "Las Vegas, NV",
        sellerName: "Vegas Equipment Liquidation",
        sellerRating: 4.6,
        images: [],
        description: "Gas dryer, well-maintained, recently serviced",
        createdAt: new Date().toISOString(),
      },
    ],
  });

  const filteredEquipment = equipment.filter(
    (e) =>
      (selectedType === "all" || e.type === selectedType) &&
      (e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // BUYER VIEW
  if (userRole === "buyer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Zap className="w-10 h-10 text-primary" />
              Equipment Marketplace
            </h1>
            <p className="text-muted-foreground mt-2">
              Buy new and used commercial laundromat equipment at wholesale prices
            </p>
          </div>

          {/* Search & Filter */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-equipment-search"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex gap-2 flex-wrap">
                {["all", "washer", "dryer", "folding-table", "accessories"].map((type) => (
                  <Badge
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedType(type)}
                  >
                    {type === "all" ? "All Equipment" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipment Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEquipment.map((item) => (
              <Card key={item.id} className="hover-elevate" data-testid={`equipment-card-${item.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.brand} {item.model}</p>
                    </div>
                    <Badge variant={
                      item.condition === "new" ? "default" :
                      item.condition === "excellent" ? "secondary" :
                      "outline"
                    }>
                      {item.condition}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Seller Info */}
                  <div className="p-3 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Seller</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-semibold">{item.sellerName}</p>
                      <Badge variant="outline">⭐ {item.sellerRating}</Badge>
                    </div>
                  </div>

                  {/* Price & Location */}
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">${item.price.toLocaleString()}</p>
                    <div className="flex-1" />
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-2">
                    <Button className="flex-1" data-testid={`button-view-equipment-${item.id}`}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="icon" data-testid={`button-message-seller-${item.id}`}>
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SELLER VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Sell Equipment</h1>
          <Button className="gap-2" data-testid="button-list-equipment">
            <Plus className="w-4 h-4" />
            List New Equipment
          </Button>
        </div>

        {/* Seller Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active Listings</p>
              <p className="text-3xl font-bold mt-2">5</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Views This Month</p>
              <p className="text-3xl font-bold mt-2 text-primary">342</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Sold</p>
              <p className="text-3xl font-bold mt-2 text-green-500">8</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-3xl font-bold mt-2">$34K</p>
            </CardContent>
          </Card>
        </div>

        {/* My Listings */}
        <Card>
          <CardHeader>
            <CardTitle>My Equipment Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEquipment.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">${item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" data-testid={`button-edit-equipment-${item.id}`}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`button-promote-${item.id}`}>
                      Promote
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
