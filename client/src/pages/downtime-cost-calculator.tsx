import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Clock, DollarSign, Wrench, AlertTriangle, TrendingDown, 
  BarChart3, Shield, RefreshCcw, Target, CheckCircle, Info, Zap
} from "lucide-react";

const downtimeCostCalculatorConfig: PremiumCalculatorConfig = {
  id: "downtime-cost-calculator",
  name: "Downtime Cost Analyzer",
  description: "Calculate the true cost of machine downtime including lost revenue, repair costs, and customer attrition. Industry benchmark: 2-5% annual revenue loss from unplanned downtime.",
  category: "Operations & Maintenance",
  inputs: [
    {
      name: "numberOfMachines",
      label: "Number of Machines",
      type: "slider",
      defaultValue: 30,
      min: 5,
      max: 100,
      step: 1,
      tooltip: "Total number of washers and dryers in your laundromat. Industry average: 20-40 machines for mid-size locations.",
    },
    {
      name: "revenuePerMachinePerDay",
      label: "Average Revenue per Machine per Day",
      type: "slider",
      defaultValue: 25,
      min: 10,
      max: 75,
      step: 1,
      prefix: "$",
      tooltip: "Average daily revenue generated per machine. Industry average: $20-35/machine/day depending on location and vend prices.",
    },
    {
      name: "downtimeHours",
      label: "Downtime Hours This Month",
      type: "slider",
      defaultValue: 24,
      min: 0,
      max: 200,
      step: 1,
      tooltip: "Total hours machines were out of service this month. Well-maintained stores average 10-20 hours/month, poorly maintained can exceed 100+ hours.",
    },
    {
      name: "repairCostPerIncident",
      label: "Average Repair Cost per Incident",
      type: "slider",
      defaultValue: 150,
      min: 25,
      max: 500,
      step: 5,
      prefix: "$",
      tooltip: "Average cost of each repair including parts and labor. Minor repairs: $50-100, Major repairs: $200-400+.",
    },
    {
      name: "numberOfIncidents",
      label: "Number of Incidents This Month",
      type: "slider",
      defaultValue: 5,
      min: 0,
      max: 30,
      step: 1,
      tooltip: "Number of machine breakdowns requiring repair this month. Well-maintained stores: 2-4 incidents/month, Older equipment: 8-15+.",
    },
    {
      name: "lostCustomerPercentage",
      label: "Lost Customer Percentage During Downtime",
      type: "slider",
      defaultValue: 15,
      min: 0,
      max: 50,
      step: 1,
      suffix: "%",
      tooltip: "Percentage of customers who leave or don't return due to machine unavailability. Industry studies show 10-25% customer loss during extended downtime.",
    },
    {
      name: "operatingHoursPerDay",
      label: "Operating Hours per Day",
      type: "slider",
      defaultValue: 16,
      min: 8,
      max: 24,
      step: 1,
      tooltip: "Hours your laundromat is open each day. Most stores operate 14-18 hours, some 24/7.",
    },
    {
      name: "customerAcquisitionCost",
      label: "Customer Acquisition Cost (CAC)",
      type: "slider",
      defaultValue: 25,
      min: 5,
      max: 100,
      step: 1,
      prefix: "$",
      tooltip: "Cost to acquire a new customer through marketing. Industry average: $15-35 per new customer.",
    },
    {
      name: "preventiveMaintenanceCost",
      label: "Monthly Preventive Maintenance Cost",
      type: "slider",
      defaultValue: 500,
      min: 100,
      max: 2000,
      step: 50,
      prefix: "$",
      tooltip: "Monthly cost for preventive maintenance program. Typical range: $300-800 for mid-size stores.",
    },
  ],
  outputs: [
    {
      name: "hourlyRevenueLoss",
      label: "Hourly Revenue Loss",
      format: "currency",
      decimals: 2,
      description: "Revenue lost per hour of downtime across affected machines",
    },
    {
      name: "totalRevenueLost",
      label: "Total Revenue Lost",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Direct revenue loss from machine downtime this month",
    },
    {
      name: "totalRepairCosts",
      label: "Total Repair Costs",
      format: "currency",
      decimals: 0,
      description: "Total cost of all repairs this month",
    },
    {
      name: "lostCustomers",
      label: "Estimated Lost Customers",
      format: "number",
      decimals: 0,
      description: "Number of customers lost due to downtime",
    },
    {
      name: "customerRecoveryCost",
      label: "Customer Recovery Cost",
      format: "currency",
      decimals: 0,
      description: "Cost to re-acquire lost customers through marketing",
    },
    {
      name: "totalDowntimeImpact",
      label: "Total Downtime Impact",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Complete monthly cost including revenue loss, repairs, and customer recovery",
    },
    {
      name: "annualProjectedLoss",
      label: "Annual Projected Loss",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Projected yearly cost if current downtime patterns continue",
    },
    {
      name: "downtimePercentage",
      label: "Downtime Percentage",
      format: "percentage",
      decimals: 1,
      description: "Percentage of potential operating hours lost to downtime",
    },
    {
      name: "pmROI",
      label: "Preventive Maintenance ROI",
      format: "percentage",
      decimals: 0,
      highlight: true,
      description: "Return on investment if PM reduces downtime by 60%",
    },
    {
      name: "pmPaybackMonths",
      label: "PM Payback Period",
      format: "number",
      decimals: 1,
      description: "Months until preventive maintenance pays for itself",
    },
  ],
  formulas: {
    dailyRevenue: "revenuePerMachinePerDay * numberOfMachines",
    hourlyRevenueLoss: "(revenuePerMachinePerDay / operatingHoursPerDay) * numberOfMachines",
    totalRevenueLost: "downtimeHours * (revenuePerMachinePerDay / operatingHoursPerDay) * numberOfMachines",
    totalRepairCosts: "repairCostPerIncident * numberOfIncidents",
    avgDailyCustomers: "numberOfMachines * 3",
    lostCustomers: "Math.round((numberOfMachines * 3) * (lostCustomerPercentage / 100) * (downtimeHours / (operatingHoursPerDay * 30)))",
    customerRecoveryCost: "lostCustomers * customerAcquisitionCost",
    totalDowntimeImpact: "totalRevenueLost + totalRepairCosts + customerRecoveryCost",
    annualProjectedLoss: "totalDowntimeImpact * 12",
    monthlyOperatingHours: "operatingHoursPerDay * 30 * numberOfMachines",
    downtimePercentage: "(downtimeHours / (operatingHoursPerDay * 30)) * 100",
    pmSavings: "totalDowntimeImpact * 0.6",
    pmROI: "preventiveMaintenanceCost > 0 ? ((pmSavings - preventiveMaintenanceCost) / preventiveMaintenanceCost) * 100 : 0",
    pmPaybackMonths: "pmSavings > 0 ? preventiveMaintenanceCost / (pmSavings / 12) : 0",
  },
  charts: [
    {
      type: "bar",
      title: "Downtime Cost Breakdown",
      dataKeys: ["totalRevenueLost", "totalRepairCosts", "customerRecoveryCost", "totalDowntimeImpact"],
      labels: ["Revenue Lost", "Repair Costs", "Customer Recovery", "Total Impact"],
      colors: ["#EF4444", "#F59E0B", "#8B5CF6", "#C8A661"],
    },
    {
      type: "comparison",
      title: "Downtime vs Preventive Maintenance",
      dataKeys: ["totalDowntimeImpact", "preventiveMaintenanceCost"],
      labels: ["Current Downtime Cost", "PM Investment"],
      colors: ["#EF4444", "#22C55E"],
    },
  ],
  tips: [
    "Industry benchmark: Well-maintained stores experience less than 2% downtime",
    "Preventive maintenance typically reduces breakdowns by 50-70%",
    "Every hour of downtime costs $30-75 in lost revenue for mid-size stores",
    "Customer loss from repeated outages compounds over time - retention drops 10-15% per incident",
    "Emergency repairs cost 2-3x more than scheduled preventive maintenance",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

export default function DowntimeCostCalculator() {
  return (
    <>
      <SEO
        title="Downtime Cost Analyzer Calculator | Laundromat Equipment ROI | WashBizHub"
        description="Calculate the true cost of machine downtime for your laundromat. Analyze lost revenue, repair costs, customer attrition, and ROI of preventive maintenance programs."
        canonicalUrl="/downtime-cost-calculator"
        ogType="website"
        keywords={[
          "downtime cost calculator",
          "laundromat downtime",
          "equipment downtime analysis",
          "preventive maintenance ROI",
          "laundromat repair costs",
          "machine breakdown calculator",
          "laundromat operations",
          "equipment maintenance",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Downtime Cost Analyzer", url: "/downtime-cost-calculator" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center"
                data-testid="calculator-icon"
              >
                <Clock className="h-6 w-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 
                  className="text-3xl font-bold text-foreground"
                  data-testid="calculator-title"
                >
                  Downtime Cost Analyzer
                </h1>
                <p className="text-muted-foreground">
                  Calculate the true cost of equipment downtime
                </p>
              </div>
            </div>
            
            <p 
              className="text-muted-foreground max-w-3xl"
              data-testid="calculator-description"
            >
              Machine downtime is one of the most overlooked costs in laundromat operations. 
              This calculator reveals the full impact including lost revenue, repair costs, 
              and customer attrition—plus the ROI of implementing preventive maintenance.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border shadow-sm" data-testid="stat-card-downtime">
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-[#C8A661] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#C8A661]">2-5%</div>
                <div className="text-xs text-muted-foreground">Industry Avg Revenue Loss</div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm" data-testid="stat-card-repair">
              <CardContent className="p-4 text-center">
                <Wrench className="h-6 w-6 text-[#C8A661] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#C8A661]">$150</div>
                <div className="text-xs text-muted-foreground">Avg Repair Cost</div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm" data-testid="stat-card-pm-reduction">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 text-[#C8A661] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#C8A661]">60%</div>
                <div className="text-xs text-muted-foreground">PM Downtime Reduction</div>
              </CardContent>
            </Card>
            <Card className="bg-card border shadow-sm" data-testid="stat-card-customer-loss">
              <CardContent className="p-4 text-center">
                <TrendingDown className="h-6 w-6 text-[#C8A661] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#C8A661]">15%</div>
                <div className="text-xs text-muted-foreground">Customer Loss Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Calculator */}
          <PremiumCalculatorEngine 
            config={downtimeCostCalculatorConfig}
          />

          {/* Understanding Section */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#C8A661]" />
                  Hidden Costs of Downtime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3" data-testid="hidden-cost-1">
                    <DollarSign className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Direct Revenue Loss</span>
                      <p className="text-sm text-muted-foreground">
                        Every hour a machine is down means lost wash/dry cycles that can never be recovered.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3" data-testid="hidden-cost-2">
                    <RefreshCcw className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Customer Churn</span>
                      <p className="text-sm text-muted-foreground">
                        Customers who encounter broken machines are 3x more likely to try competitors.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3" data-testid="hidden-cost-3">
                    <Wrench className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Emergency Repair Premium</span>
                      <p className="text-sm text-muted-foreground">
                        Rush repairs cost 2-3x more than scheduled maintenance due to emergency rates.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3" data-testid="hidden-cost-4">
                    <BarChart3 className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Reputation Damage</span>
                      <p className="text-sm text-muted-foreground">
                        Negative reviews from equipment issues can reduce new customer acquisition by 20-30%.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#C8A661]" />
                  Preventive Maintenance Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3" data-testid="pm-benefit-1">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">50-70% Fewer Breakdowns</span>
                      <p className="text-sm text-muted-foreground">
                        Regular maintenance catches issues before they become expensive failures.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3" data-testid="pm-benefit-2">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Extended Equipment Life</span>
                      <p className="text-sm text-muted-foreground">
                        Well-maintained machines last 15-20 years vs 8-10 years for neglected equipment.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3" data-testid="pm-benefit-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Lower Repair Costs</span>
                      <p className="text-sm text-muted-foreground">
                        Scheduled service at $50-100 prevents $300-500 emergency repairs.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3" data-testid="pm-benefit-4">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">Higher Customer Satisfaction</span>
                      <p className="text-sm text-muted-foreground">
                        Reliable equipment = happy customers = more referrals and repeat business.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Pro Tips Alert */}
          <Alert className="mt-8 border-[#C8A661]/30 bg-[#C8A661]/5" data-testid="pro-tips-alert">
            <Zap className="h-4 w-4 text-[#C8A661]" />
            <AlertTitle className="text-[#C8A661]">Pro Tips for Reducing Downtime</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Schedule weekly visual inspections of all machines</li>
                <li>Keep spare parts for common failures (belts, bearings, door latches) on-site</li>
                <li>Build relationships with 2-3 reliable service technicians</li>
                <li>Track all repairs in a maintenance log to identify patterns</li>
                <li>Consider service contracts for high-value equipment</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Calculator Formulas Reference */}
          <Card className="mt-8 bg-card border shadow-sm overflow-hidden" data-testid="formulas-reference">
            <div className="h-1 bg-[#C8A661]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-[#C8A661]" />
                Calculator Formulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Revenue Loss Calculations</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li data-testid="formula-hourly-loss">
                      <strong>Hourly Revenue Loss:</strong><br />
                      (Daily Revenue ÷ Operating Hours) × Total Machines
                    </li>
                    <li data-testid="formula-total-loss">
                      <strong>Total Revenue Lost:</strong><br />
                      Downtime Hours × Hourly Revenue Loss
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Customer & PM Calculations</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li data-testid="formula-customer-recovery">
                      <strong>Customer Recovery Cost:</strong><br />
                      Lost Customers × Customer Acquisition Cost
                    </li>
                    <li data-testid="formula-pm-roi">
                      <strong>PM ROI:</strong><br />
                      ((Downtime Savings - PM Cost) ÷ PM Cost) × 100
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="mt-8">
            <CalculatorDisclaimer calculatorName="Downtime Cost Analyzer" />
          </div>

          {/* Related Calculators */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6" data-testid="related-calculators-heading">
              Related Calculators
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card border shadow-sm hover-elevate" data-testid="related-roi-calculator">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-4">
                    <Target className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <h3 className="font-semibold mb-2">ROI Calculator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Calculate return on investment for new equipment purchases.
                  </p>
                  <a 
                    href="/roi-calculator" 
                    className="text-[#C8A661] text-sm font-medium hover:underline"
                    data-testid="link-roi-calculator"
                  >
                    Calculate ROI →
                  </a>
                </CardContent>
              </Card>
              
              <Card className="bg-card border shadow-sm hover-elevate" data-testid="related-utility-calculator">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-4">
                    <Zap className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <h3 className="font-semibold mb-2">Utility Calculator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Analyze utility costs and find energy-saving opportunities.
                  </p>
                  <a 
                    href="/utility-calculator" 
                    className="text-[#C8A661] text-sm font-medium hover:underline"
                    data-testid="link-utility-calculator"
                  >
                    Calculate Utilities →
                  </a>
                </CardContent>
              </Card>
              
              <Card className="bg-card border shadow-sm hover-elevate" data-testid="related-tpd-calculator">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center mb-4">
                    <BarChart3 className="h-5 w-5 text-[#C8A661]" />
                  </div>
                  <h3 className="font-semibold mb-2">TPD Calculator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Calculate turns per day and optimize machine utilization.
                  </p>
                  <a 
                    href="/tpd-calculator" 
                    className="text-[#C8A661] text-sm font-medium hover:underline"
                    data-testid="link-tpd-calculator"
                  >
                    Calculate TPD →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
