import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Search, Package, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Parts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [faultCode, setFaultCode] = useState("");

  const sampleParts = [
    {
      id: "1",
      name: "Washer Drive Motor - 1/2 HP",
      partNumber: "WM-500-1250",
      price: 245.00,
      category: "Motors",
      compatibility: ["Dexter T-900", "Dexter T-1200"],
      inStock: true,
    },
    {
      id: "2",
      name: "V-Belt Assembly Kit",
      partNumber: "BLT-V40-KIT",
      price: 32.50,
      category: "Belts",
      compatibility: ["Speed Queen SFN", "Speed Queen Stack"],
      inStock: true,
    },
    {
      id: "3",
      name: "Control Board - Digital Display",
      partNumber: "CTL-DIG-850",
      price: 189.00,
      category: "Controls",
      compatibility: ["Dexter T-900", "Speed Queen SFN"],
      inStock: false,
    },
  ];

  const recentFaultCodes = [
    { code: "E01", description: "Water inlet valve failure", severity: "high" },
    { code: "E02", description: "Drain pump malfunction", severity: "high" },
    { code: "E03", description: "Door lock error", severity: "medium" },
    { code: "E04", description: "Temperature sensor fault", severity: "medium" },
    { code: "E05", description: "Motor overload", severity: "high" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Wrench className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-parts-title">
            Parts Store & Diagnostics
          </h1>
          <p className="text-xl text-white/70" data-testid="text-parts-subtitle">
            2,200+ fault codes with genuine replacement parts
          </p>
        </div>

        <Tabs defaultValue="parts" className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/10">
            <TabsTrigger value="parts" data-testid="tab-parts">Parts Catalog</TabsTrigger>
            <TabsTrigger value="diagnostics" data-testid="tab-diagnostics">Fault Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="parts">
            {/* Search */}
            <Card className="bg-white/10 backdrop-blur border-white/20 mb-8">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  <Input
                    type="search"
                    placeholder="Search by part name, number, or equipment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/50"
                    data-testid="input-search-parts"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Parts Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {sampleParts.map((part) => (
                <Card 
                  key={part.id} 
                  className="bg-white/10 backdrop-blur border-white/20 hover-elevate active-elevate-2"
                  data-testid={`card-part-${part.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Package className="h-8 w-8 text-accent" />
                      <Badge variant={part.inStock ? "default" : "destructive"}>
                        {part.inStock ? "In Stock" : "Back Order"}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">{part.name}</CardTitle>
                    <CardDescription className="text-white/60 text-sm">
                      Part #: {part.partNumber}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-3xl font-black text-accent" data-testid={`price-${part.id}`}>
                        ${part.price.toFixed(2)}
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        {part.category}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-white/60 mb-1">Compatible with:</div>
                      <div className="flex flex-wrap gap-1">
                        {part.compatibility.map((model, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-white/30 text-white/70">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                      disabled={!part.inStock}
                      data-testid={`button-order-${part.id}`}
                    >
                      {part.inStock ? "Order Part" : "Notify When Available"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="diagnostics">
            {/* Fault Code Lookup */}
            <Card className="bg-white/10 backdrop-blur border-white/20 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-accent" />
                  Fault Code Lookup
                </CardTitle>
                <CardDescription className="text-white/70">
                  Search our database of 2,200+ diagnostic codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter fault code (e.g., E01, E02...)"
                    value={faultCode}
                    onChange={(e) => setFaultCode(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50"
                    data-testid="input-fault-code"
                  />
                  <Button 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                    data-testid="button-lookup"
                  >
                    Lookup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Codes */}
            <h2 className="text-2xl font-bold text-white mb-4">Common Fault Codes</h2>
            <div className="grid gap-4">
              {recentFaultCodes.map((fault) => (
                <Card 
                  key={fault.code} 
                  className={`bg-white/10 backdrop-blur border-white/20 ${getSeverityColor(fault.severity)}`}
                  data-testid={`card-fault-${fault.code}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl font-black text-white" data-testid={`code-${fault.code}`}>
                            {fault.code}
                          </div>
                          <Badge className={getSeverityColor(fault.severity)}>
                            {fault.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-white/80">{fault.description}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="ml-4 border-white/30 text-white hover:bg-white/10"
                        data-testid={`button-view-${fault.code}`}
                      >
                        View Solution
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-accent/20 backdrop-blur border-accent/30 mt-8">
              <CardContent className="p-6 text-center">
                <p className="text-white/90">
                  Can't find your code? <strong>Pro members</strong> get access to our complete 
                  database of 2,200+ diagnostic codes with step-by-step repair guides.
                </p>
                <Button 
                  className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                  data-testid="button-upgrade-diagnostics"
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
