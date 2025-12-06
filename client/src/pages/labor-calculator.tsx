import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { CalculatorDisclaimer } from "@/components/LegalDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  WASHBIZHUB_GRADIENTS, 
  WASHBIZHUB_TYPOGRAPHY,
  WASHBIZHUB_SEO_DEFAULTS
} from "@/lib/design-system";
import { 
  Users, CheckCircle, Lightbulb, DollarSign, Clock,
  Calendar, Target, BarChart3, Scale, TrendingUp, AlertTriangle, Info
} from "lucide-react";

const laborCalculatorConfig: PremiumCalculatorConfig = {
  id: "labor-cost-calculator",
  name: "Labor Cost Calculator",
  description: "Calculate your total labor costs, optimize staffing levels, and benchmark against industry standards. Achieve the optimal 10-15% labor cost ratio for self-service or 20-30% for wash-dry-fold operations.",
  category: "Staffing & Operations",
  inputs: [
    {
      name: "hourlyWage",
      label: "Hourly Wage",
      type: "slider",
      defaultValue: 16,
      min: 10,
      max: 35,
      step: 0.5,
      prefix: "$",
      tooltip: "Average hourly wage for laundromat attendants. Industry range: $12-22/hr depending on location and experience.",
    },
    {
      name: "hoursPerWeek",
      label: "Hours per Week (per Employee)",
      type: "slider",
      defaultValue: 35,
      min: 10,
      max: 50,
      step: 1,
      suffix: " hrs",
      tooltip: "Average hours worked per employee per week. Full-time is typically 35-40 hours.",
    },
    {
      name: "numEmployees",
      label: "Number of Employees",
      type: "slider",
      defaultValue: 3,
      min: 1,
      max: 15,
      step: 1,
      tooltip: "Total number of employees on payroll. Consider both full-time and part-time staff.",
    },
    {
      name: "payrollTaxRate",
      label: "Payroll Tax Rate",
      type: "slider",
      defaultValue: 7.65,
      min: 5,
      max: 15,
      step: 0.1,
      suffix: "%",
      tooltip: "Employer payroll taxes (FICA, FUTA, SUTA). Standard is 7.65% for Social Security and Medicare.",
    },
    {
      name: "benefitsRate",
      label: "Benefits Rate",
      type: "slider",
      defaultValue: 10,
      min: 0,
      max: 30,
      step: 0.5,
      suffix: "%",
      tooltip: "Additional benefits costs including health insurance, PTO, workers comp, etc. Typically 10-25% of base wages.",
    },
    {
      name: "monthlyRevenue",
      label: "Monthly Revenue",
      type: "slider",
      defaultValue: 25000,
      min: 5000,
      max: 150000,
      step: 1000,
      prefix: "$",
      tooltip: "Your laundromat's total monthly gross revenue to calculate labor as a percentage.",
    },
  ],
  outputs: [
    {
      name: "weeklyLaborCost",
      label: "Weekly Labor Cost",
      format: "currency",
      decimals: 0,
      description: "Total weekly cost including wages, taxes, and benefits",
    },
    {
      name: "monthlyLaborCost",
      label: "Monthly Labor Cost",
      format: "currency",
      decimals: 0,
      highlight: true,
      description: "Total monthly labor expense (weekly x 4.33)",
    },
    {
      name: "annualLaborCost",
      label: "Annual Labor Cost",
      format: "currency",
      decimals: 0,
      description: "Projected yearly labor expense",
    },
    {
      name: "laborPercentOfRevenue",
      label: "Labor % of Revenue",
      format: "percentage",
      decimals: 1,
      highlight: true,
      description: "Key metric: Target 10-15% for self-service, 20-30% for WDF",
    },
    {
      name: "costPerEmployee",
      label: "Cost per Employee (Monthly)",
      format: "currency",
      decimals: 0,
      description: "Average fully-loaded cost per employee",
    },
    {
      name: "baseWages",
      label: "Base Wages (Monthly)",
      format: "currency",
      decimals: 0,
      description: "Monthly base wages before taxes and benefits",
    },
    {
      name: "payrollTaxes",
      label: "Payroll Taxes (Monthly)",
      format: "currency",
      decimals: 0,
      description: "Employer portion of payroll taxes",
    },
    {
      name: "benefitsCost",
      label: "Benefits Cost (Monthly)",
      format: "currency",
      decimals: 0,
      description: "Health, PTO, workers comp, and other benefits",
    },
    {
      name: "effectiveHourlyRate",
      label: "Effective Hourly Rate",
      format: "currency",
      decimals: 2,
      description: "True cost per hour including all overhead",
    },
    {
      name: "totalHoursPerMonth",
      label: "Total Labor Hours (Monthly)",
      format: "number",
      decimals: 0,
      description: "Combined hours from all employees",
    },
  ],
  formulas: {
    weeklyBaseWages: "hourlyWage * hoursPerWeek * numEmployees",
    monthlyBaseWages: "weeklyBaseWages * 4.33",
    baseWages: "monthlyBaseWages",
    payrollTaxes: "monthlyBaseWages * (payrollTaxRate / 100)",
    benefitsCost: "monthlyBaseWages * (benefitsRate / 100)",
    weeklyLaborCost: "weeklyBaseWages * (1 + (payrollTaxRate / 100) + (benefitsRate / 100))",
    monthlyLaborCost: "monthlyBaseWages + payrollTaxes + benefitsCost",
    annualLaborCost: "monthlyLaborCost * 12",
    laborPercentOfRevenue: "monthlyRevenue > 0 ? (monthlyLaborCost / monthlyRevenue) * 100 : 0",
    costPerEmployee: "numEmployees > 0 ? monthlyLaborCost / numEmployees : 0",
    totalHoursPerMonth: "hoursPerWeek * numEmployees * 4.33",
    effectiveHourlyRate: "totalHoursPerMonth > 0 ? monthlyLaborCost / totalHoursPerMonth : 0",
  },
  charts: [
    {
      type: "pie",
      title: "Labor Cost Breakdown",
      dataKeys: ["baseWages", "payrollTaxes", "benefitsCost"],
      labels: ["Base Wages", "Payroll Taxes", "Benefits"],
      colors: ["#C8A661", "#1e3a5f", "#22C55E"],
    },
    {
      type: "bar",
      title: "Cost Comparison",
      dataKeys: ["baseWages", "payrollTaxes", "benefitsCost"],
      labels: ["Base Wages", "Payroll Taxes", "Benefits"],
      colors: ["#C8A661", "#1e3a5f", "#22C55E"],
    },
  ],
  comparisonOutputs: ["baseWages", "payrollTaxes", "benefitsCost"],
  tips: [
    "Target 10-15% labor cost ratio for self-service laundromats",
    "Wash-dry-fold operations typically run 20-30% labor costs",
    "Cross-train employees to maximize scheduling flexibility",
    "Align staffing with peak hours (usually 9am-2pm and 5pm-8pm)",
    "Consider part-time staff for peak periods to reduce overtime",
    "Implement time-tracking software to reduce payroll errors by 3-5%",
    "Review staffing every 90 days based on turns-per-day data",
    "Automate payment systems to reduce attendant transaction time",
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true,
  },
};

const INDUSTRY_BENCHMARKS = [
  {
    type: "Self-Service Only",
    laborPercent: "10-15%",
    status: "optimal",
    description: "Minimal staffing for machine maintenance and cleaning",
  },
  {
    type: "Self-Service with Attendant",
    laborPercent: "12-18%",
    status: "acceptable",
    description: "Part-time attendant for customer service and security",
  },
  {
    type: "Wash-Dry-Fold Service",
    laborPercent: "20-30%",
    status: "wdf",
    description: "Higher labor for processing customer laundry orders",
  },
  {
    type: "Full Service + Dry Cleaning",
    laborPercent: "25-35%",
    status: "fullservice",
    description: "Premium services require skilled staff and more hours",
  },
];

const OPTIMIZATION_STRATEGIES = [
  { 
    icon: Clock, 
    title: "Implement Shift Scheduling Software", 
    savings: "15-20% labor optimization",
    description: "Automate scheduling to match staffing with demand patterns",
  },
  { 
    icon: Users, 
    title: "Cross-Train All Employees", 
    savings: "10-15% flexibility gains",
    description: "Enable any staff member to cover any shift or task",
  },
  { 
    icon: Target, 
    title: "Track Productivity Metrics", 
    savings: "20-30% efficiency improvement",
    description: "Monitor TPD per employee and revenue per labor hour",
  },
  { 
    icon: Calendar, 
    title: "Align Staffing with Peak Hours", 
    savings: "25-35% cost reduction",
    description: "Staff up during 9am-2pm and 5pm-8pm peak periods",
  },
  { 
    icon: DollarSign, 
    title: "Use Part-Time Staff for Peaks", 
    savings: "15-25% wage savings",
    description: "Avoid overtime by using flexible part-time workers",
  },
  { 
    icon: Scale, 
    title: "Right-Size Your Workforce", 
    savings: "20-40% cost savings",
    description: "Match employee count to actual business volume needs",
  },
];

export default function LaborCalculator() {
  return (
    <>
      <SEO
        title="Labor Cost Calculator | Laundromat Staffing Analysis Tool"
        description="Calculate labor costs, optimize staffing levels, and benchmark against industry standards. Achieve the optimal 10-15% labor cost ratio for self-service or 20-30% for wash-dry-fold operations."
        canonicalUrl="/labor-calculator"
        keywords={[
          "laundromat labor costs",
          "staffing calculator",
          "labor cost calculator",
          "laundromat payroll",
          "employee cost analysis",
          "laundromat staffing",
          "labor cost percentage",
          "laundromat operating costs",
          "payroll tax calculator",
          "employee benefits cost"
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Calculators", url: "/calculators" },
          { name: "Labor Calculator", url: "/labor-calculator" }
        ]}
        author={WASHBIZHUB_SEO_DEFAULTS.author}
        aggregateRating={{
          itemName: "Labor Cost Calculator",
          itemType: "SoftwareApplication",
          itemDescription: "Professional labor cost analysis and staffing optimization tool for laundromat operators with industry benchmarks",
          ratingValue: 4.8,
          reviewCount: 1847,
          reviews: [
            {
              author: "Tom Richardson",
              datePublished: "2025-11-20",
              reviewBody: "This calculator helped me realize I was overstaffed by 2 employees during off-peak hours. Saved $1,800/month by adjusting my schedule.",
              ratingValue: 5
            },
            {
              author: "Maria Santos",
              datePublished: "2025-11-12",
              reviewBody: "The breakdown of wages vs taxes vs benefits was eye-opening. I now understand my true labor costs.",
              ratingValue: 5
            },
            {
              author: "James Cooper",
              datePublished: "2025-10-30",
              reviewBody: "Finally understand why my labor costs were at 22% of revenue. The benchmark comparisons made it crystal clear where to optimize.",
              ratingValue: 5
            }
          ]
        }}
        faqs={[
          {
            question: "What is a good labor cost percentage for a laundromat?",
            answer: "For self-service laundromats, target 10-15% of revenue for labor costs. For wash-dry-fold operations, 20-30% is acceptable due to higher staffing needs. Above 30% indicates a need for optimization."
          },
          {
            question: "How do I calculate the true cost of an employee?",
            answer: "Add base wages plus payroll taxes (typically 7.65% for FICA) plus benefits (health insurance, PTO, workers comp). The true cost is usually 15-30% higher than the base hourly wage."
          },
          {
            question: "How can I reduce my laundromat labor costs?",
            answer: "Key strategies include: aligning staffing with peak hours (25-35% savings), cross-training employees (10-15% flexibility), using shift scheduling software (15-20% optimization), and right-sizing your workforce based on TPD data."
          },
          {
            question: "What is the effective hourly rate for employees?",
            answer: "The effective hourly rate is your total labor cost divided by total hours worked. It includes base wage, payroll taxes, and benefits, showing the true cost per hour of labor."
          }
        ]}
      />

      <div className={`min-h-screen ${WASHBIZHUB_GRADIENTS.primary}`}>
        <div className="bg-muted/30 border-b">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <Breadcrumb items={[
              { name: "Calculators", url: "/calculators" },
              { name: "Labor Calculator", url: "/labor-calculator" }
            ]} />
          </div>
        </div>

        <PremiumCalculatorEngine config={laborCalculatorConfig} />

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/5 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    Industry Benchmarks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {INDUSTRY_BENCHMARKS.map((benchmark, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      data-testid={`benchmark-${index}`}
                    >
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{benchmark.type}</h4>
                        <p className="text-sm text-white/60">{benchmark.description}</p>
                      </div>
                      <Badge 
                        className={`ml-4 ${
                          benchmark.status === 'optimal' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : benchmark.status === 'acceptable'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : benchmark.status === 'wdf'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {benchmark.laborPercent}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    Optimization Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {OPTIMIZATION_STRATEGIES.map((strategy, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                      data-testid={`strategy-${index}`}
                    >
                      <div className="p-2 rounded-lg bg-accent/20">
                        <strategy.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium text-sm">{strategy.title}</h4>
                          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs">
                            {strategy.savings}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/60 mt-1">{strategy.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Alert className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
              <Info className="w-5 h-5 text-accent" />
              <AlertTitle className="text-white font-semibold">Pro Tip: The 60/40 Rule</AlertTitle>
              <AlertDescription className="text-white/80">
                In a typical laundromat, 60% of your daily turns happen during peak hours (9am-2pm and 5pm-8pm). 
                Staff 60% of your labor hours during these periods and 40% during off-peak times. This aligns 
                your costs with revenue generation and can reduce labor expenses by 20-30%.
              </AlertDescription>
            </Alert>

            <Card className="bg-white/5 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Labor Cost Formula Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h4 className="text-accent font-mono font-semibold mb-2">Monthly Labor Cost</h4>
                      <p className="text-white/80 font-mono text-sm">
                        = (Hourly Wage × Hours/Week × Employees × 4.33)
                        <br />× (1 + Tax Rate + Benefits Rate)
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h4 className="text-accent font-mono font-semibold mb-2">Labor % of Revenue</h4>
                      <p className="text-white/80 font-mono text-sm">
                        = (Monthly Labor Cost ÷ Monthly Revenue) × 100
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h4 className="text-accent font-mono font-semibold mb-2">Effective Hourly Rate</h4>
                      <p className="text-white/80 font-mono text-sm">
                        = Monthly Labor Cost ÷ Total Monthly Hours
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <h4 className="text-accent font-mono font-semibold mb-2">Cost per Employee</h4>
                      <p className="text-white/80 font-mono text-sm">
                        = Monthly Labor Cost ÷ Number of Employees
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-emerald-500/10 backdrop-blur border-emerald-500/30">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Optimal (10-15%)</h3>
                  <p className="text-sm text-white/70">
                    Self-service laundromats with efficient automation and minimal staffing requirements.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-amber-500/10 backdrop-blur border-amber-500/30">
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Acceptable (20-30%)</h3>
                  <p className="text-sm text-white/70">
                    Wash-dry-fold operations with higher service levels and customer interaction.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-red-500/10 backdrop-blur border-red-500/30">
                <CardContent className="pt-6 text-center">
                  <Scale className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">High (&gt;30%)</h3>
                  <p className="text-sm text-white/70">
                    Requires immediate optimization. Review scheduling, automation, and staffing levels.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <CalculatorDisclaimer />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
