import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Users, Clock, DollarSign, BarChart3, AlertTriangle, 
  CheckCircle, Info, TrendingUp, Sparkles, UserPlus, 
  Timer, Briefcase, Target
} from "lucide-react";

const staffingCalculatorConfig: PremiumCalculatorConfig = {
  id: "staffing-level-calculator",
  name: "Staffing Level Optimizer Calculator",
  description: "Calculate optimal staffing levels for your laundromat based on customer flow, service times, and labor costs. Industry benchmark: 1 staff per 15-20 customers/hour for attended operations.",
  category: "Operations",
  inputs: [
    {
      name: "hoursOpenPerDay",
      label: "Hours Open Per Day",
      type: "slider",
      defaultValue: 14,
      min: 6,
      max: 24,
      step: 1,
      tooltip: "Total hours your laundromat operates daily. Industry average: 12-16 hours for attended, 24/7 for unattended.",
    },
    {
      name: "avgCustomersPerHour",
      label: "Average Customers Per Hour",
      type: "slider",
      defaultValue: 12,
      min: 2,
      max: 50,
      step: 1,
      tooltip: "Average number of customers visiting per hour. Typical range: 8-20 customers/hour for mid-size stores.",
    },
    {
      name: "serviceTimeMinutes",
      label: "Minutes to Service One Customer",
      type: "slider",
      defaultValue: 4,
      min: 1,
      max: 15,
      step: 0.5,
      tooltip: "Average staff time per customer interaction (check-in, questions, WDF intake). Self-service: 2-3 min, WDF: 5-10 min.",
    },
    {
      name: "hourlyLaborCost",
      label: "Hourly Labor Cost",
      type: "slider",
      defaultValue: 16,
      min: 10,
      max: 35,
      step: 0.50,
      prefix: "$",
      tooltip: "Total hourly cost per employee including wages, taxes, and benefits. Industry range: $12-25/hour.",
    },
    {
      name: "numberOfShifts",
      label: "Number of Shifts Per Day",
      type: "slider",
      defaultValue: 2,
      min: 1,
      max: 4,
      step: 1,
      tooltip: "How many shifts you divide your operating hours into. Typical: 2 shifts (AM/PM) or 3 shifts for 24/7.",
    },
    {
      name: "peakHourMultiplier",
      label: "Peak Hour Multiplier",
      type: "slider",
      defaultValue: 1.5,
      min: 1.0,
      max: 3.0,
      step: 0.1,
      suffix: "x",
      tooltip: "How much busier peak hours are vs. average. Weekends often see 1.5-2x normal traffic.",
    },
    {
      name: "daysOpenPerWeek",
      label: "Days Open Per Week",
      type: "slider",
      defaultValue: 7,
      min: 5,
      max: 7,
      step: 1,
      tooltip: "Number of days your laundromat operates. Most laundromats operate 7 days/week.",
    },
    {
      name: "targetUtilization",
      label: "Target Staff Utilization",
      type: "slider",
      defaultValue: 75,
      min: 50,
      max: 95,
      step: 5,
      suffix: "%",
      tooltip: "Ideal percentage of time staff should be actively engaged. 70-80% is healthy; 90%+ leads to burnout.",
    },
  ],
  outputs: [
    {
      name: "baseStaffNeeded",
      label: "Base Staff Per Shift",
      format: "number",
      decimals: 1,
      highlight: true,
      description: "Minimum staff needed based on average customer flow",
    },
    {
      name: "peakStaffNeeded",
      label: "Peak Hour Staff Needed",
      format: "number",
      decimals: 1,
      highlight: true,
      description: "Staff required during peak hours (with multiplier)",
    },
    {
      name: "recommendedStaff",
      label: "Recommended Staff Per Shift",
      format: "number",
      decimals: 0,
      highlight: true,
      description: "Optimal staffing level (rounded up for coverage)",
    },
    {
      name: "totalLaborHoursPerWeek",
      label: "Total Labor Hours/Week",
      format: "number",
      decimals: 0,
      description: "Total staff hours across all shifts per week",
    },
    {
      name: "weeklyLaborCost",
      label: "Weekly Labor Cost",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Total weekly labor expense",
    },
    {
      name: "monthlyLaborCost",
      label: "Monthly Labor Cost",
      format: "currency",
      decimals: 0,
      description: "Estimated monthly labor expense (4.33 weeks)",
    },
    {
      name: "utilizationRate",
      label: "Utilization Rate",
      format: "percentage",
      decimals: 1,
      description: "Percentage of time staff is actively engaged with customers",
    },
    {
      name: "overtimeRiskScore",
      label: "Overtime Risk Score",
      format: "number",
      decimals: 0,
      description: "Risk of overtime (0-100). Higher = more likely overtime needed",
    },
    {
      name: "laborCostPerCustomer",
      label: "Labor Cost Per Customer",
      format: "currency",
      decimals: 2,
      description: "Average labor cost spent per customer served",
    },
    {
      name: "customersPerStaffHour",
      label: "Customers Per Staff Hour",
      format: "number",
      decimals: 1,
      description: "Efficiency metric: customers served per labor hour",
    },
  ],
  formulas: {
    hoursPerShift: "hoursOpenPerDay / numberOfShifts",
    baseStaffNeeded: "(avgCustomersPerHour * serviceTimeMinutes) / 60",
    peakStaffNeeded: "baseStaffNeeded * peakHourMultiplier",
    recommendedStaff: "Math.ceil(peakStaffNeeded)",
    totalLaborHoursPerWeek: "recommendedStaff * hoursOpenPerDay * daysOpenPerWeek",
    weeklyLaborCost: "totalLaborHoursPerWeek * hourlyLaborCost",
    monthlyLaborCost: "weeklyLaborCost * 4.33",
    totalServiceMinutesPerHour: "avgCustomersPerHour * serviceTimeMinutes",
    utilizationRate: "(totalServiceMinutesPerHour / 60) / recommendedStaff * 100",
    weeklyCustomers: "avgCustomersPerHour * hoursOpenPerDay * daysOpenPerWeek",
    laborCostPerCustomer: "weeklyLaborCost / weeklyCustomers",
    customersPerStaffHour: "weeklyCustomers / totalLaborHoursPerWeek",
    overtimeRiskScore: "Math.min(100, Math.max(0, (utilizationRate - 70) * 3 + (peakHourMultiplier - 1) * 30))",
  },
  charts: [
    {
      type: "bar",
      title: "Staffing Levels Comparison",
      dataKeys: ["baseStaffNeeded", "peakStaffNeeded", "recommendedStaff"],
      labels: ["Base Staff", "Peak Staff", "Recommended"],
      colors: ["#3B82F6", "#F59E0B", "#22C55E"],
    },
    {
      type: "pie",
      title: "Monthly Labor Cost Breakdown",
      dataKeys: ["weeklyLaborCost", "monthlyLaborCost"],
      labels: ["Weekly Cost", "Monthly Cost"],
      colors: ["#C8A661", "#0A1628"],
    },
  ],
  tips: [
    "Industry benchmark: 1 attendant per 15-20 customers/hour for WDF operations",
    "Target 70-80% utilization to balance efficiency with customer service quality",
    "Peak hours (weekends, evenings) often require 1.5-2x normal staffing",
    "Labor typically accounts for 15-25% of total laundromat operating costs",
    "Cross-train staff to handle WDF, maintenance, and customer service",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

export default function StaffingLevelCalculator() {
  return (
    <>
      <SEO
        title="Staffing Level Optimizer Calculator | Laundromat Labor Planning | WashBizHub"
        description="Calculate optimal staffing levels for your laundromat. Determine recommended staff per shift, weekly labor costs, utilization rates, and overtime risk based on customer flow and service times."
        canonicalUrl="/staffing-level-calculator"
        ogType="website"
        keywords={[
          "laundromat staffing calculator",
          "labor cost calculator",
          "staffing optimization",
          "laundromat labor planning",
          "employee scheduling laundromat",
          "staffing level optimizer",
          "laundromat operations calculator",
          "workforce planning laundry",
        ]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: "Home", url: "/" },
              { name: "Calculators", url: "/calculators-hub" },
              { name: "Staffing Level Optimizer", url: "/staffing-level-calculator" },
            ]}
          />

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1628] flex items-center justify-center">
                <Users className="w-6 h-6 text-[#C8A661]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                  Staffing Level Optimizer Calculator
                </h1>
                <p className="text-muted-foreground">
                  Optimize your workforce for efficiency and cost control
                </p>
              </div>
              <Badge className="ml-auto bg-[#C8A661]/20 text-[#C8A661] border-[#C8A661]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Operations
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Industry Benchmark</p>
                    <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-benchmark-ratio">1:15-20</p>
                    <p className="text-xs text-muted-foreground">Staff:Customers/hr</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Utilization</p>
                    <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-target-utilization">70-80%</p>
                    <p className="text-xs text-muted-foreground">Optimal range</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Labor % of Revenue</p>
                    <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-labor-percent">15-25%</p>
                    <p className="text-xs text-muted-foreground">Industry average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#C8A661]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Multiplier</p>
                    <p className="text-2xl font-bold text-[#C8A661]" data-testid="text-peak-multiplier">1.5-2x</p>
                    <p className="text-xs text-muted-foreground">Weekend traffic</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mb-6 border-[#C8A661]/30 bg-[#C8A661]/10">
            <Info className="h-4 w-4 text-[#C8A661]" />
            <AlertTitle className="text-[#C8A661]">Understanding Staffing Optimization</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Optimal staffing balances customer service quality with labor costs. Understaffing leads to poor 
              service and lost revenue, while overstaffing wastes payroll. Use this calculator to find the 
              sweet spot for your operation.
            </AlertDescription>
          </Alert>

          <PremiumCalculatorEngine config={staffingCalculatorConfig} />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border shadow-sm overflow-hidden" data-testid="card-scenario-understaffed">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Understaffed Scenario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-red-500/10 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong className="text-foreground">Warning Signs:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      Utilization rate above 90%
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      Customer wait times increasing
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      Staff burnout and turnover
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      WDF orders falling behind
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Impact:</strong> Lost revenue from customers leaving, negative reviews, high turnover costs
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden border-green-500/30" data-testid="card-scenario-optimal">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Optimal Staffing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-green-500/10 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong className="text-foreground">Key Indicators:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      Utilization at 70-80%
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      Staff available for peak surges
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      Time for cleaning & maintenance
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      Positive customer experience
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Result:</strong> Maximized revenue with controlled costs, happy staff and customers
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden" data-testid="card-scenario-overstaffed">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-amber-600">
                  <UserPlus className="w-5 h-5" />
                  Overstaffed Scenario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-amber-500/10 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong className="text-foreground">Warning Signs:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Utilization below 50%
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Staff idle for extended periods
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Labor costs exceeding 25% of revenue
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      Cutting into profit margins
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Impact:</strong> Reduced profitability, wasted payroll, potential layoffs needed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Timer className="w-5 h-5 text-[#C8A661]" />
                  Staffing Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Stagger shifts</strong> - Overlap during peak hours for seamless coverage
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Cross-train employees</strong> - Flexibility for WDF, maintenance, and customer service
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Track peak patterns</strong> - Adjust staffing based on day/time data
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    <strong>Build on-call list</strong> - Have backup staff for unexpected rushes
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border shadow-sm overflow-hidden">
              <div className="h-1 bg-[#C8A661]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-[#C8A661]" />
                  Labor Cost Benchmarks by Store Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Unattended Self-Service</span>
                  <Badge variant="outline" data-testid="badge-labor-unattended">5-10% of revenue</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Partially Attended</span>
                  <Badge variant="outline" data-testid="badge-labor-partial">12-18% of revenue</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Full-Service + WDF</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30" data-testid="badge-labor-fullservice">20-28% of revenue</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pickup & Delivery</span>
                  <Badge variant="outline" className="bg-[#C8A661]/10 text-[#C8A661] border-[#C8A661]/30" data-testid="badge-labor-delivery">25-35% of revenue</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <CalculatorDisclaimer />
        </div>
      </div>
    </>
  );
}
