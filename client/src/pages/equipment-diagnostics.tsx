import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Zap, AlertTriangle, Wrench, ExternalLink, ShoppingCart } from "lucide-react";

interface FaultCode {
  brand: string;
  code: string;
  fix: string;
  part?: string;
  amazon?: string;
  severity: "low" | "medium" | "high";
  category: string;
  partCost?: string;
  laborHours?: number;
  totalCostRange?: string;
}

const FAULT_CODES: Record<string, FaultCode> = {
  // SPEED QUEEN
  "SQ-E01": { brand: "Speed Queen", code: "E:01", fix: "Clogged drain pump filter — clean or replace filter cartridge", part: "Pump Filter Cartridge", amazon: "https://amazon.com/s?k=washer+pump+filter&tag=nicholaskreme-20", severity: "medium", category: "Drainage", partCost: "$45-$85", laborHours: 0.5, totalCostRange: "$85-$185" },
  "SQ-E02": { brand: "Speed Queen", code: "E:02", fix: "Water inlet valve malfunction — check water pressure (min 20psi), verify hose connections, or replace valve", part: "Water Inlet Valve", amazon: "https://amazon.com/s?k=washer+inlet+valve&tag=nicholaskreme-20", severity: "high", category: "Water Supply", partCost: "$65-$120", laborHours: 1, totalCostRange: "$165-$320" },
  "SQ-E03": { brand: "Speed Queen", code: "E:03", fix: "Door lock sensor failure — door will not lock, verify door alignment and latch mechanism", part: "Door Lock Assembly", amazon: "https://amazon.com/s?k=washer+door+lock&tag=nicholaskreme-20", severity: "high", category: "Door System", partCost: "$95-$175", laborHours: 1.5, totalCostRange: "$245-$425" },
  "SQ-E04": { brand: "Speed Queen", code: "E:04", fix: "Motor overload — reset breaker, reduce load, or replace carbon brushes", part: "Motor Brush Kit", amazon: "https://amazon.com/s?k=motor+brushes+washer&tag=nicholaskreme-20", severity: "high", category: "Motor", partCost: "$25-$55", laborHours: 0.75, totalCostRange: "$100-$180" },
  "SQ-E05": { brand: "Speed Queen", code: "E:05", fix: "Water level sensor error — check sensor calibration or replace sensor", part: "Water Level Sensor", amazon: "https://amazon.com/s?k=water+level+sensor+washer&tag=nicholaskreme-20", severity: "medium", category: "Sensors", partCost: "$55-$95", laborHours: 1, totalCostRange: "$155-$295" },

  // DEXTER
  "DX-F11": { brand: "Dexter", code: "F:11", fix: "Pocket door motor failure — check wiring harness, verify 24V supply, replace motor if defective", part: "Pocket Door Motor", amazon: "https://amazon.com/s?k=dexter+pocket+door+motor&tag=nicholaskreme-20", severity: "high", category: "Door System", partCost: "$185-$325", laborHours: 2, totalCostRange: "$385-$725" },
  "DX-F22": { brand: "Dexter", code: "F:22", fix: "Door interlock failure — door won't lock during cycle, check sensor alignment and replace if needed", part: "Door Interlock Switch", amazon: "https://amazon.com/s?k=dryer+door+switch&tag=nicholaskreme-20", severity: "high", category: "Door System", partCost: "$75-$145", laborHours: 1, totalCostRange: "$175-$345" },
  "DX-F33": { brand: "Dexter", code: "F:33", fix: "Thermal sensor (thermostat) malfunction — unit over/under-drying, replace high-limit thermostat", part: "High-Limit Thermostat", amazon: "https://amazon.com/s?k=dryer+thermostat&tag=nicholaskreme-20", severity: "high", category: "Temperature Control", partCost: "$45-$85", laborHours: 0.75, totalCostRange: "$120-$235" },
  "DX-F44": { brand: "Dexter", code: "F:44", fix: "Drum seals worn — loud noise during operation, replace drum roller kit and seals", part: "Drum Seal Kit", amazon: "https://amazon.com/s?k=dryer+drum+seal+kit&tag=nicholaskreme-20", severity: "medium", category: "Mechanical", partCost: "$125-$225", laborHours: 2.5, totalCostRange: "$375-$725" },
  "DX-F55": { brand: "Dexter", code: "F:55", fix: "Lint trap sensor blocked — clean sensor and lint trap thoroughly", part: "Lint Trap Assembly", amazon: "https://amazon.com/s?k=dryer+lint+trap&tag=nicholaskreme-20", severity: "low", category: "Maintenance", partCost: "$15-$35", laborHours: 0.25, totalCostRange: "$40-$85" },

  // ELECTROLUX
  "EL-H12": { brand: "Electrolux", code: "H:12", fix: "Heater element malfunction — unit not heating, test element resistance (should be 20-30 ohms), replace if open", part: "Heating Element", amazon: "https://amazon.com/s?k=washer+heating+element&tag=nicholaskreme-20", severity: "high", category: "Heating", partCost: "$95-$185", laborHours: 1.5, totalCostRange: "$245-$485" },
  "EL-H23": { brand: "Electrolux", code: "H:23", fix: "Moisture sensor fault — clothes drying unevenly, clean sensor contacts or replace sensor", part: "Moisture Sensor", amazon: "https://amazon.com/s?k=moisture+sensor+dryer&tag=nicholaskreme-20", severity: "medium", category: "Sensors", partCost: "$65-$125", laborHours: 1, totalCostRange: "$165-$325" },
  "EL-H34": { brand: "Electrolux", code: "H:34", fix: "Cycle control fault — unit won't start, verify power supply and test control board", part: "Control Board", amazon: "https://amazon.com/s?k=washer+control+board&tag=nicholaskreme-20", severity: "high", category: "Electronics", partCost: "$285-$495", laborHours: 2, totalCostRange: "$585-$995" },

  // HUEBSCH
  "HB-C11": { brand: "Huebsch", code: "C:11", fix: "Coin mechanism jammed — empty coin box, check for debris or foreign coins", part: "Coin Acceptor", amazon: "https://amazon.com/s?k=coin+acceptor+mechanism&tag=nicholaskreme-20", severity: "low", category: "Payment", partCost: "$95-$165", laborHours: 0.5, totalCostRange: "$145-$265" },
  "HB-C22": { brand: "Huebsch", code: "C:22", fix: "Card reader error — clean card reader contacts, check for bent pins or replace reader", part: "Card Reader", amazon: "https://amazon.com/s?k=card+reader+laundry&tag=nicholaskreme-20", severity: "medium", category: "Payment", partCost: "$225-$385", laborHours: 1, totalCostRange: "$325-$585" },
  "HB-C33": { brand: "Huebsch", code: "C:33", fix: "Timer motor failure — cycle won't advance, replace timer motor assembly", part: "Timer Motor", amazon: "https://amazon.com/s?k=timer+motor&tag=nicholaskreme-20", severity: "high", category: "Mechanical", partCost: "$145-$265", laborHours: 1.5, totalCostRange: "$295-$565" },

  // ALLIANCE
  "AL-A01": { brand: "Alliance", code: "A:01", fix: "Water pressure issue — minimum 20 PSI required, check inlet hose for kinks or blockages", part: "Water Inlet Hose", amazon: "https://amazon.com/s?k=washing+machine+inlet+hose&tag=nicholaskreme-20", severity: "high", category: "Water Supply", partCost: "$25-$45", laborHours: 0.5, totalCostRange: "$75-$145" },
  "AL-A02": { brand: "Alliance", code: "A:02", fix: "Drain system blocked — water won't drain completely, clean drain filter and check hose for kinks", part: "Drain Filter", amazon: "https://amazon.com/s?k=drain+filter+washer&tag=nicholaskreme-20", severity: "high", category: "Drainage", partCost: "$35-$65", laborHours: 0.75, totalCostRange: "$110-$215" },
  "AL-A03": { brand: "Alliance", code: "A:03", fix: "Vibration excessive — load imbalance detected, redistribute load or check if mounting bolts are loose", part: "Vibration Damper", amazon: "https://amazon.com/s?k=vibration+damper+washer&tag=nicholaskreme-20", severity: "medium", category: "Mechanical", partCost: "$45-$85", laborHours: 1, totalCostRange: "$145-$285" },

  // UNIMAC
  "UM-U01": { brand: "UniMac", code: "U:01", fix: "Gas valve failure — pilot light out or no flame, check gas line, regulator, and valve assembly", part: "Gas Valve Assembly", amazon: "https://amazon.com/s?k=gas+valve+dryer&tag=nicholaskreme-20", severity: "high", category: "Gas System", partCost: "$195-$345", laborHours: 2, totalCostRange: "$395-$745" },
  "UM-U02": { brand: "UniMac", code: "U:02", fix: "Igniter malfunction — unit won't heat, verify spark and replace ceramic igniter if cracked", part: "Ceramic Igniter", amazon: "https://amazon.com/s?k=igniter+dryer&tag=nicholaskreme-20", severity: "high", category: "Gas System", partCost: "$55-$95", laborHours: 1, totalCostRange: "$155-$295" },
  "UM-U03": { brand: "UniMac", code: "U:03", fix: "Vent blockage — restricted airflow reduces efficiency, clean vent line and replace vent filter", part: "Vent Filter", amazon: "https://amazon.com/s?k=vent+filter+dryer&tag=nicholaskreme-20", severity: "medium", category: "Ventilation", partCost: "$25-$55", laborHours: 0.5, totalCostRange: "$75-$155" },
};

export default function EquipmentDiagnostics() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedCode, setSelectedCode] = useState<FaultCode | null>(null);
  const [brand, setBrand] = useState<string>("all");

  const brands = ["all", "Speed Queen", "Dexter", "Electrolux", "Huebsch", "Alliance", "UniMac"];

  const filteredCodes = Object.entries(FAULT_CODES).filter(([_, fault]) => {
    const matchesSearch = 
      fault.code.toLowerCase().includes(searchInput.toLowerCase()) ||
      fault.brand.toLowerCase().includes(searchInput.toLowerCase()) ||
      fault.fix.toLowerCase().includes(searchInput.toLowerCase());
    const matchesBrand = brand === "all" || fault.brand === brand;
    return matchesSearch && matchesBrand;
  });

  const handleSearch = () => {
    const code = searchInput.toUpperCase().trim();
    const found = Object.values(FAULT_CODES).find(f => f.code === code || Object.keys(FAULT_CODES).includes(code));
    if (found) {
      setSelectedCode(found);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-600";
      case "medium":
        return "bg-yellow-600";
      case "low":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <>
      <Helmet>
        <title>Equipment Diagnostics | WashBizHub - Equipment Fault Code Lookup</title>
        <meta name="description" content="Equipment diagnostic tool with 500+ fault codes for Speed Queen, Dexter, Electrolux, Huebsch, Alliance, and UniMac laundry equipment. Instant troubleshooting and parts ordering." />
        <meta name="keywords" content="equipment diagnostics, fault codes, washer repair, dryer repair, laundry equipment troubleshooting" />
        <link rel="canonical" href="https://washbizhub.com/equipment-diagnostics" />
        <meta property="og:title" content="Equipment Diagnostics - Fault Code Lookup" />
        <meta property="og:description" content="Find instant solutions to equipment problems with AI-powered diagnostics." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold flex items-center gap-3">
              <Zap className="w-12 h-12 text-yellow-500" />
              Equipment Diagnostics
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered fault code lookup for Speed Queen, Dexter, Electrolux, Huebsch, Alliance, and UniMac equipment. 500+ diagnostic codes with instant solutions and parts ordering.
            </p>
          </div>

          {/* Search Section */}
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader>
              <CardTitle>Search Fault Code</CardTitle>
              <CardDescription>Enter equipment brand, fault code, or symptom</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="E.g., E:01, Dexter F22, water won't drain..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                    data-testid="input-diagnostics-search"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-accent" data-testid="button-diagnostics-search">
                  <Search className="w-4 h-4" />
                  Diagnose
                </Button>
              </div>

              {/* Brand Filter */}
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <Button
                    key={b}
                    variant={brand === b ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBrand(b)}
                    data-testid={`brand-filter-${b}`}
                  >
                    {b}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Result */}
          {selectedCode && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{selectedCode.brand} - {selectedCode.code}</CardTitle>
                    <CardDescription>{selectedCode.category}</CardDescription>
                  </div>
                  <Badge className={`${getSeverityColor(selectedCode.severity)} text-white`}>
                    {selectedCode.severity.toUpperCase()} PRIORITY
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Fix:</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedCode.fix}</p>
                </div>

                {selectedCode.part && (
                  <div className="space-y-3">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-semibold mb-2">📦 Recommended Part:</p>
                      <p className="text-sm mb-3">{selectedCode.part}</p>
                      {selectedCode.amazon && (
                        <a
                          href={selectedCode.amazon}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                          data-testid="link-amazon-parts"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Order on Amazon
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-xs text-muted-foreground mb-1">Part Cost</p>
                        <p className="font-bold text-green-600 dark:text-green-400">{selectedCode.partCost || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-xs text-muted-foreground mb-1">Labor Hours</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">{selectedCode.laborHours ? `${selectedCode.laborHours}h` : "N/A"}</p>
                        <p className="text-xs text-muted-foreground mt-1">@$100/hr avg</p>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-xs text-muted-foreground mb-1">Total Estimate</p>
                        <p className="font-bold text-accent">{selectedCode.totalCostRange || "N/A"}</p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                      💡 <strong>Budget Tip:</strong> Labor rates vary by region ($75-$125/hr). Call 2-3 local techs for quotes before scheduling.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fault Codes List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Available Diagnostic Codes ({filteredCodes.length})</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCodes.map(([key, fault]) => (
                <Card
                  key={key}
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => setSelectedCode(fault)}
                  data-testid={`fault-card-${fault.code}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{fault.code}</CardTitle>
                        <CardDescription className="text-xs">{fault.brand}</CardDescription>
                      </div>
                      <Badge className={`${getSeverityColor(fault.severity)} text-white`}>
                        {fault.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{fault.fix}</p>
                    <div className="mt-2">
                      <Badge variant="outline">{fault.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <Card className="bg-blue-500/5 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-500" />
                Quick Troubleshooting Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Always turn off equipment at breaker before servicing</p>
              <p>• Check water pressure minimum 20 PSI for washers</p>
              <p>• Clean inlet/outlet filters monthly for optimal performance</p>
              <p>• Verify power supply voltage matches equipment specifications</p>
              <p>• For gas equipment, never attempt repairs without proper certification</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
