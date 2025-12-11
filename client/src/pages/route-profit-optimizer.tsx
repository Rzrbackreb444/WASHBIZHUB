import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WASHBIZHUB_SEO_DEFAULTS } from "@/lib/design-system";
import { 
  Truck, TrendingUp, DollarSign, MapPin, Fuel, Clock, 
  BarChart3, Route, Sparkles, AlertTriangle, CheckCircle, Info,
  Timer, Target, Gauge
} from "lucide-react";

const routeProfitOptimizerConfig: PremiumCalculatorConfig = {
  id: "route-profit-optimizer",
  name: "Route Profit Optimizer Calculator",
  description: "Analyze delivery route profitability for WDF/pickup-delivery services. Calculate fuel costs, labor expenses, and profit margins to optimize your routes for maximum efficiency.",
  category: "Operations & Delivery",
  inputs: [
    {
      name: "routeDistance",
      label: "Route Distance (Miles)",
      type: "slider",
      defaultValue: 25,
      min: 5,
      max: 100,
      step: 1,
      tooltip: "Total round-trip distance for the delivery route in miles.",
    },
    {
      name: "numberOfStops",
      label: "Number of Stops",
      type: "slider",
      defaultValue: 8,
      min: 1,
      max: 30,
      step: 1,
      tooltip: "Total number of delivery/pickup stops on this route.",
    },
    {
      name: "avgOrderValue",
      label: "Average WDF Order Value",
      type: "slider",
      defaultValue: 35,
      min: 15,
      max: 100,
      step: 1,
      prefix: "$",
      tooltip: "Average revenue per wash-dry-fold or delivery order. Industry average: $25-45 per order.",
    },
    {
      name: "fuelCostPerGallon",
      label: "Fuel Cost per Gallon",
      type: "slider",
      defaultValue: 3.50,
      min: 2.50,
      max: 6.00,
      step: 0.10,
      prefix: "$",
      tooltip: "Current fuel price per gallon in your area.",
    },
    {
      name: "vehicleMPG",
      label: "Vehicle MPG",
      type: "slider",
      defaultValue: 22,
      min: 10,
      max: 40,
      step: 1,
      tooltip: "Your delivery vehicle's fuel efficiency (miles per gallon). Vans average 18-25 MPG.",
    },
    {
      name: "driverHourlyRate",
      label: "Driver Hourly Rate",
      type: "slider",
      defaultValue: 18,
      min: 12,
      max: 35,
      step: 0.50,
      prefix: "$",
      tooltip: "Total hourly cost for driver including wages, taxes, and benefits. Average: $15-22/hr.",
    },
    {
      name: "deliveryTimePerStop",
      label: "Delivery Time per Stop (Minutes)",
      type: "slider",
      defaultValue: 8,
      min: 3,
      max: 20,
      step: 1,
      tooltip: "Average time spent at each stop for delivery/pickup. Includes parking, walking, and customer interaction.",
    },
    {
      name: "totalRouteTime",
      label: "Total Route Time (Hours)",
      type: "slider",
      defaultValue: 3,
      min: 1,
      max: 8,
      step: 0.25,
      tooltip: "Total time to complete the route including driving and all stops.",
    },
    {
      name: "vehicleCostPerMile",
      label: "Vehicle Cost per Mile",
      type: "slider",
      defaultValue: 0.25,
      min: 0.10,
      max: 0.75,
      step: 0.05,
      prefix: "$",
      tooltip: "Depreciation, maintenance, insurance per mile. IRS standard: $0.67/mile (2024). Realistic fleet cost: $0.20-0.35/mile.",
    },
  ],
  outputs: [
    {
      name: "totalRouteRevenue",
      label: "Total Route Revenue",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Total revenue from all stops on this route",
    },
    {
      name: "fuelCost",
      label: "Fuel Cost",
      format: "currency",
      decimals: 2,
      description: "Total fuel expense for this route",
    },
    {
      name: "laborCost",
      label: "Labor Cost",
      format: "currency",
      decimals: 2,
      description: "Driver wages for total route time",
    },
    {
      name: "vehicleCost",
      label: "Vehicle Cost",
      format: "currency",
      decimals: 2,
      description: "Depreciation, maintenance, insurance for this route",
    },
    {
      name: "totalCosts",
      label: "Total Costs",
      format: "currency",
      decimals: 2,
      highlight: true,
      description: "All route expenses combined",
    },
    {
      name: "netProfitPerRoute",
      label: "Net Profit per Route",
      format: "currency",
      decimals: 2,
      highlight: true,
      description: "Revenue minus all costs",
    },
    {
      name: "profitPerMile",
      label: "Profit per Mile",
      format: "currency",
      decimals: 2,
      description: "Net profit divided by route distance",
    },
    {
      name: "profitPerStop",
      label: "Profit per Stop",
      format: "currency",
      decimals: 2,
      description: "Net profit divided by number of stops",
    },
    {
      name: "routeEfficiencyScore",
      label: "Route Efficiency Score",
      format: "percentage",
      decimals: 1,
      highlight: true,
      description: "Revenue / Total Costs × 100 (>150% is excellent)",
    },
    {
      name: "profitMargin",
      label: "Profit Margin",
      format: "percentage",
      decimals: 1,
      description: "Net profit as percentage of revenue",
    },
    {
      name: "revenuePerHour",
      label: "Revenue per Hour",
      format: "currency",
      decimals: 2,
      description: "Total revenue divided by route time",
    },
    {
      name: "costPerStop",
      label: "Cost per Stop",
      format: "currency",
      decimals: 2,
      description: "Total costs divided by number of stops",
    },
  ],
  formulas: {
    totalRouteRevenue: "avgOrderValue * numberOfStops",
    fuelCost: "(routeDistance / vehicleMPG) * fuelCostPerGallon",
    laborCost: "totalRouteTime * driverHourlyRate",
    vehicleCost: "routeDistance * vehicleCostPerMile",
    totalCosts: "fuelCost + laborCost + vehicleCost",
    netProfitPerRoute: "totalRouteRevenue - totalCosts",
    profitPerMile: "routeDistance > 0 ? netProfitPerRoute / routeDistance : 0",
    profitPerStop: "numberOfStops > 0 ? netProfitPerRoute / numberOfStops : 0",
    routeEfficiencyScore: "totalCosts > 0 ? (totalRouteRevenue / totalCosts) * 100 : 0",
    profitMargin: "totalRouteRevenue > 0 ? (netProfitPerRoute / totalRouteRevenue) * 100 : 0",
    revenuePerHour: "totalRouteTime > 0 ? totalRouteRevenue / totalRouteTime : 0",
    costPerStop: "numberOfStops > 0 ? totalCosts / numberOfStops : 0",
  },
  charts: [
    {
      type: "bar",
      title: "Cost Breakdown",
      dataKeys: ["fuelCost", "laborCost", "vehicleCost"],
      labels: ["Fuel", "Labor", "Vehicle"],
      colors: ["#F59E0B", "#3B82F6", "#8B5CF6"],
    },
    {
      type: "pie",
      title: "Profit vs Costs",
      dataKeys: ["netProfitPerRoute", "totalCosts"],
      labels: ["Net Profit", "Total Costs"],
      colors: ["#22C55E", "#EF4444"],
    },
    {
      type: "bar",
      title: "Per-Unit Metrics",
      dataKeys: ["profitPerMile", "profitPerStop", "costPerStop"],
      labels: ["$/Mile", "$/Stop", "Cost/Stop"],
      colors: ["#C8A661", "#3B82F6", "#EF4444"],
    },
  ],
  tips: [
    "Target 8-12 stops per route for optimal efficiency in urban areas",
    "Route efficiency above 150% indicates strong profitability",
    "Profit margins below 20% suggest route optimization is needed",
    "Cluster stops geographically to reduce drive time between deliveries",
    "Consider minimum order values to ensure route profitability",
    "Premium WDF services ($40+/order) dramatically improve route economics",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

function ProfitMarginIndicator({ margin }: { margin: number }) {
  let color = "text-red-600";
  let bgColor = "bg-red-100 dark:bg-red-900/30";
  let label = "Needs Improvement";
  let Icon = AlertTriangle;

  if (margin >= 40) {
    color = "text-green-600";
    bgColor = "bg-green-100 dark:bg-green-900/30";
    label = "Excellent";
    Icon = CheckCircle;
  } else if (margin >= 25) {
    color = "text-green-600";
    bgColor = "bg-green-100 dark:bg-green-900/30";
    label = "Good";
    Icon = CheckCircle;
  } else if (margin >= 15) {
    color = "text-yellow-600";
    bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
    label = "Marginal";
    Icon = Info;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgColor}`} data-testid="profit-margin-indicator">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-medium ${color}`} data-testid="profit-margin-label">{label}</span>
      <span className={`text-sm ${color}`} data-testid="profit-margin-value">({margin.toFixed(1)}%)</span>
    </div>
  );
}

function EfficiencyIndicator({ score }: { score: number }) {
  let color = "text-red-600";
  let bgColor = "bg-red-100 dark:bg-red-900/30";
  let label = "Unprofitable";
  let Icon = AlertTriangle;

  if (score >= 200) {
    color = "text-green-600";
    bgColor = "bg-green-100 dark:bg-green-900/30";
    label = "Excellent";
    Icon = CheckCircle;
  } else if (score >= 150) {
    color = "text-green-600";
    bgColor = "bg-green-100 dark:bg-green-900/30";
    label = "Good";
    Icon = CheckCircle;
  } else if (score >= 120) {
    color = "text-yellow-600";
    bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
    label = "Marginal";
    Icon = Info;
  } else if (score >= 100) {
    color = "text-yellow-600";
    bgColor = "bg-yellow-100 dark:bg-yellow-900/30";
    label = "Break-even";
    Icon = Info;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgColor}`} data-testid="efficiency-indicator">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-medium ${color}`} data-testid="efficiency-label">{label}</span>
      <span className={`text-sm ${color}`} data-testid="efficiency-value">({score.toFixed(0)}%)</span>
    </div>
  );
}

export default function RouteProfitOptimizer() {
  return (
    <>
      <SEO
        title="Route Profit Optimizer Calculator | WDF Delivery Route Analysis | WashBizHub"
        description="Calculate and optimize delivery route profitability for your laundromat's WDF and pickup/delivery services. Analyze fuel costs, labor expenses, and maximize profit per route."
        canonicalUrl="/route-profit-optimizer"
        ogType="website"
        keywords={[
          "route profit calculator",
          "delivery route optimization",
          "WDF delivery calculator",
          "laundromat delivery profit",
          "route efficiency calculator",
          "delivery cost analysis",
          "pickup delivery laundromat",
          "fleet optimization laundry",
        ]}
      />
      
      <div className="min-h-screen bg-background" data-testid="route-profit-optimizer-page">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Route Profit Optimizer", url: "/route-profit-optimizer" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center" data-testid="calculator-icon">
                <Route className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground" data-testid="calculator-title">
                  Route Profit Optimizer
                </h1>
                <p className="text-muted-foreground" data-testid="calculator-subtitle">
                  Maximize profitability for WDF pickup & delivery routes
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]" data-testid="badge-category">
                <Truck className="w-3 h-3 mr-1" />
                Delivery Operations
              </Badge>
              <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]" data-testid="badge-feature">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium Calculator
              </Badge>
              <Badge variant="outline" className="border-[#C8A661]/40 text-[#C8A661]" data-testid="badge-charts">
                <BarChart3 className="w-3 h-3 mr-1" />
                Visualizations
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border shadow-sm" data-testid="info-card-revenue">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Revenue/Route</p>
                    <p className="text-lg font-bold text-foreground" data-testid="target-revenue">$280+ per route</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm" data-testid="info-card-efficiency">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Gauge className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Efficiency</p>
                    <p className="text-lg font-bold text-foreground" data-testid="target-efficiency">150%+ score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm" data-testid="info-card-margin">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#C8A661]/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Margin</p>
                    <p className="text-lg font-bold text-foreground" data-testid="target-margin">25%+ profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-8 border-[#C8A661]/40 bg-[#C8A661]/5" data-testid="calculator-description-alert">
            <Truck className="h-4 w-4 text-[#C8A661]" />
            <AlertTitle className="text-foreground">Delivery Route Economics</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Successful WDF delivery operations require careful route planning. Industry benchmarks show 
              profitable routes achieve 8-12 stops with $30+ average order values. This calculator helps 
              you analyze all cost factors and optimize your delivery strategy.
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine config={routeProfitOptimizerConfig} />

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card className="bg-card border shadow-sm overflow-hidden" data-testid="optimization-tips-card">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-[#C8A661]" />
                  Route Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3" data-testid="tip-1">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Cluster deliveries:</strong> Group stops by neighborhood to minimize driving time between orders.
                  </p>
                </div>
                <div className="flex items-start gap-3" data-testid="tip-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Set minimum orders:</strong> Require $25+ minimum to ensure each stop is profitable.
                  </p>
                </div>
                <div className="flex items-start gap-3" data-testid="tip-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Optimize timing:</strong> Schedule deliveries during off-peak traffic hours.
                  </p>
                </div>
                <div className="flex items-start gap-3" data-testid="tip-4">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Combine pickups & deliveries:</strong> Run routes that both collect and deliver for maximum efficiency.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden" data-testid="benchmarks-card">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                  Industry Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b" data-testid="benchmark-stops">
                    <span className="text-sm text-muted-foreground">Optimal Stops/Route</span>
                    <span className="font-semibold text-foreground">8-12 stops</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" data-testid="benchmark-order-value">
                    <span className="text-sm text-muted-foreground">Avg WDF Order Value</span>
                    <span className="font-semibold text-foreground">$30-45</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" data-testid="benchmark-time-per-stop">
                    <span className="text-sm text-muted-foreground">Time per Stop</span>
                    <span className="font-semibold text-foreground">5-10 min</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b" data-testid="benchmark-profit-margin">
                    <span className="text-sm text-muted-foreground">Target Profit Margin</span>
                    <span className="font-semibold text-green-600">25-40%</span>
                  </div>
                  <div className="flex justify-between items-center py-2" data-testid="benchmark-revenue-per-hour">
                    <span className="text-sm text-muted-foreground">Revenue per Hour</span>
                    <span className="font-semibold text-foreground">$80-120</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="bg-card border shadow-sm overflow-hidden" data-testid="route-comparison-card">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-5 w-5 text-[#C8A661]" />
                  Route Configuration Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="comparison-table">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-foreground">Route Type</th>
                        <th className="text-center py-3 px-2 font-medium text-foreground">Stops</th>
                        <th className="text-center py-3 px-2 font-medium text-foreground">Distance</th>
                        <th className="text-center py-3 px-2 font-medium text-foreground">Time</th>
                        <th className="text-center py-3 px-2 font-medium text-foreground">Revenue</th>
                        <th className="text-center py-3 px-2 font-medium text-foreground">Profit</th>
                        <th className="text-center py-3 px-2 font-medium text-foreground">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50" data-testid="comparison-row-short">
                        <td className="py-3 px-2 text-muted-foreground">Short Urban</td>
                        <td className="text-center py-3 px-2">6</td>
                        <td className="text-center py-3 px-2">12 mi</td>
                        <td className="text-center py-3 px-2">1.5 hr</td>
                        <td className="text-center py-3 px-2 text-green-600 font-medium">$210</td>
                        <td className="text-center py-3 px-2 text-green-600 font-medium">$145</td>
                        <td className="text-center py-3 px-2">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">69%</Badge>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50" data-testid="comparison-row-standard">
                        <td className="py-3 px-2 text-muted-foreground">Standard</td>
                        <td className="text-center py-3 px-2">10</td>
                        <td className="text-center py-3 px-2">25 mi</td>
                        <td className="text-center py-3 px-2">3 hr</td>
                        <td className="text-center py-3 px-2 text-green-600 font-medium">$350</td>
                        <td className="text-center py-3 px-2 text-green-600 font-medium">$208</td>
                        <td className="text-center py-3 px-2">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">59%</Badge>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50" data-testid="comparison-row-extended">
                        <td className="py-3 px-2 text-muted-foreground">Extended</td>
                        <td className="text-center py-3 px-2">15</td>
                        <td className="text-center py-3 px-2">40 mi</td>
                        <td className="text-center py-3 px-2">4.5 hr</td>
                        <td className="text-center py-3 px-2 text-green-600 font-medium">$525</td>
                        <td className="text-center py-3 px-2 text-green-600 font-medium">$285</td>
                        <td className="text-center py-3 px-2">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">54%</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50" data-testid="comparison-row-suburban">
                        <td className="py-3 px-2 text-muted-foreground">Suburban Spread</td>
                        <td className="text-center py-3 px-2">8</td>
                        <td className="text-center py-3 px-2">50 mi</td>
                        <td className="text-center py-3 px-2">4 hr</td>
                        <td className="text-center py-3 px-2 text-green-600 font-medium">$280</td>
                        <td className="text-center py-3 px-2 text-yellow-600 font-medium">$92</td>
                        <td className="text-center py-3 px-2">
                          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30">33%</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4" data-testid="comparison-note">
                  * Based on $35 avg order, $3.50/gal fuel, 22 MPG, $18/hr driver rate, 8 min per stop
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <CalculatorDisclaimer
              title="Route Profit Calculator Disclaimer"
              description="Results are estimates based on input values. Actual profitability may vary based on traffic conditions, customer availability, route complexity, and operational factors. Always track actual costs and adjust calculations accordingly."
            />
          </div>
        </div>
      </div>
    </>
  );
}
