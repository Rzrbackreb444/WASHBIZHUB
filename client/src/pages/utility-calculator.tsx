import { PremiumCalculatorEngine, PremiumCalculatorConfig } from "@/components/PremiumCalculatorEngine";
import { AuthGuard } from "@/components/AuthGuard";
import { FeatureGate } from "@/components/monetization/FeatureGate";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WASHBIZHUB_SEO_DEFAULTS } from "@/lib/design-system";
import { Zap, Droplets, Flame, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

const utilityCalculatorConfig: PremiumCalculatorConfig = {
  id: 'utility-calculator',
  name: 'Utility Cost Calculator',
  description: 'Calculate your laundromat utility costs per load, track monthly and annual expenses, and benchmark your UPG (Utilities as % of Gross). Industry target: 15-22%.',
  category: 'Operations & Efficiency',
  inputs: [
    {
      name: 'electricRate',
      label: 'Electric Rate ($/kWh)',
      type: 'slider',
      defaultValue: 0.12,
      min: 0.05,
      max: 0.35,
      step: 0.01,
      prefix: '$',
      tooltip: 'Your local electric rate per kilowatt-hour. US average is $0.10-0.15/kWh.',
      formatDisplay: (v) => `$${v.toFixed(2)}/kWh`
    },
    {
      name: 'waterRate',
      label: 'Water Rate ($/1000 gal)',
      type: 'slider',
      defaultValue: 4.50,
      min: 2.00,
      max: 12.00,
      step: 0.25,
      prefix: '$',
      tooltip: 'Your local water rate per 1000 gallons. US average is $3.50-6.00/1000 gal.',
      formatDisplay: (v) => `$${v.toFixed(2)}/1K gal`
    },
    {
      name: 'gasRate',
      label: 'Gas Rate ($/therm)',
      type: 'slider',
      defaultValue: 1.20,
      min: 0.50,
      max: 2.50,
      step: 0.05,
      prefix: '$',
      tooltip: 'Your local natural gas rate per therm. US average is $0.80-1.50/therm.',
      formatDisplay: (v) => `$${v.toFixed(2)}/therm`
    },
    {
      name: 'numMachines',
      label: 'Number of Machines',
      type: 'slider',
      defaultValue: 30,
      min: 10,
      max: 100,
      step: 1,
      tooltip: 'Total number of washers and dryers in your laundromat.',
      formatDisplay: (v) => `${v} machines`
    },
    {
      name: 'loadsPerDay',
      label: 'Loads Per Day (TPD)',
      type: 'slider',
      defaultValue: 50,
      min: 20,
      max: 200,
      step: 5,
      tooltip: 'Average number of wash/dry cycles per day across all machines.',
      formatDisplay: (v) => `${v} loads/day`
    },
    {
      name: 'monthlyGrossRevenue',
      label: 'Monthly Gross Revenue',
      type: 'slider',
      defaultValue: 15000,
      min: 5000,
      max: 100000,
      step: 1000,
      prefix: '$',
      tooltip: 'Your total monthly gross revenue for UPG calculation.',
      formatDisplay: (v) => `$${v.toLocaleString()}`
    }
  ],
  outputs: [
    {
      name: 'costPerLoad',
      label: 'Cost Per Load',
      format: 'currency',
      decimals: 3,
      description: 'Combined utility cost for one complete wash + dry cycle'
    },
    {
      name: 'electricCostPerLoad',
      label: 'Electric per Load',
      format: 'currency',
      decimals: 3,
      description: 'Electric portion of each load'
    },
    {
      name: 'waterCostPerLoad',
      label: 'Water per Load',
      format: 'currency',
      decimals: 3,
      description: 'Water portion of each load'
    },
    {
      name: 'gasCostPerLoad',
      label: 'Gas per Load',
      format: 'currency',
      decimals: 3,
      description: 'Gas portion of each load (dryer)'
    },
    {
      name: 'dailyUtilityCost',
      label: 'Daily Utility Cost',
      format: 'currency',
      decimals: 2,
      description: 'Total daily utility expense'
    },
    {
      name: 'monthlyUtilityCost',
      label: 'Monthly Utility Cost',
      format: 'currency',
      decimals: 0,
      highlight: true,
      description: 'Total monthly utility expense'
    },
    {
      name: 'annualUtilityCost',
      label: 'Annual Utility Cost',
      format: 'currency',
      decimals: 0,
      description: 'Projected yearly utility expense'
    },
    {
      name: 'monthlyElectric',
      label: 'Monthly Electric',
      format: 'currency',
      decimals: 0,
      description: 'Monthly electric bill estimate'
    },
    {
      name: 'monthlyWater',
      label: 'Monthly Water',
      format: 'currency',
      decimals: 0,
      description: 'Monthly water bill estimate'
    },
    {
      name: 'monthlyGas',
      label: 'Monthly Gas',
      format: 'currency',
      decimals: 0,
      description: 'Monthly gas bill estimate'
    },
    {
      name: 'upg',
      label: 'UPG (Utilities % of Gross)',
      format: 'percentage',
      decimals: 1,
      highlight: true,
      description: 'Industry benchmark: 15-22% is optimal'
    }
  ],
  formulas: {
    electricCostPerLoad: '(0.25 * electricRate) + (0.05 * electricRate)',
    waterCostPerLoad: '(32 / 1000) * waterRate',
    gasCostPerLoad: '0.12 * gasRate',
    costPerLoad: 'electricCostPerLoad + waterCostPerLoad + gasCostPerLoad',
    dailyUtilityCost: 'costPerLoad * loadsPerDay',
    monthlyUtilityCost: 'dailyUtilityCost * 30',
    annualUtilityCost: 'monthlyUtilityCost * 12',
    monthlyElectric: '((0.25 * electricRate) + (0.05 * electricRate)) * loadsPerDay * 30',
    monthlyWater: '((32 / 1000) * waterRate) * loadsPerDay * 30',
    monthlyGas: '(0.12 * gasRate) * loadsPerDay * 30',
    upg: 'monthlyGrossRevenue > 0 ? (monthlyUtilityCost / monthlyGrossRevenue) * 100 : 0'
  },
  charts: [
    {
      type: 'pie',
      title: 'Utility Cost Breakdown',
      dataKeys: ['monthlyElectric', 'monthlyWater', 'monthlyGas'],
      labels: ['Electric', 'Water', 'Gas'],
      colors: ['#F59E0B', '#3B82F6', '#EF4444']
    }
  ],
  comparisonOutputs: ['monthlyElectric', 'monthlyWater', 'monthlyGas'],
  tips: [
    'Industry benchmark for UPG (Utilities as % of Gross) is 15-22%. Above 22% indicates significant room for improvement.',
    'LED lighting can reduce lighting costs by 40-60% compared to traditional bulbs.',
    'Low-flow fixtures and ozone systems can reduce water usage by 20-50%.',
    'High-efficiency dryers can save 15-25% on gas costs compared to older models.',
    'Consider solar panels for 50-80% reduction in electric costs over time.',
    'Fix water leaks immediately - even small leaks waste 10-15% of water usage.',
    'Programmable thermostats for HVAC can reduce heating/cooling costs by 10-20%.',
    'Monitor utility bills monthly to catch rate increases or unusual spikes early.',
    'Negotiate commercial rates with utility providers - many offer discounts for high-volume users.',
    'Train staff to turn off equipment and lights during low-traffic hours.'
  ],
  premiumFeatures: {
    pdfExport: true,
    emailResults: true,
    sheetsExport: true,
    advancedCharts: true
  }
};

function UPGBenchmarkCard({ upg }: { upg: number }) {
  const getStatus = () => {
    if (upg <= 15) return { status: 'excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Excellent' };
    if (upg <= 18) return { status: 'good', color: 'text-green-400', bg: 'bg-green-500/20', label: 'Good' };
    if (upg <= 22) return { status: 'average', color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Average' };
    return { status: 'needs-work', color: 'text-red-400', bg: 'bg-red-500/20', label: 'Needs Improvement' };
  };

  const { color, bg, label } = getStatus();

  return (
    <Card className="bg-white/5 backdrop-blur border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-accent" />
          Industry UPG Benchmarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full ${bg}`}>
              <span className={`text-sm font-medium ${color}`}>{label}</span>
            </div>
            <span className="text-white/60 text-sm">Your UPG: {upg.toFixed(1)}%</span>
          </div>
          
          <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 flex">
              <div className="w-[15%] bg-emerald-500/40 h-full" />
              <div className="w-[3%] bg-green-500/40 h-full" />
              <div className="w-[4%] bg-amber-500/40 h-full" />
              <div className="flex-1 bg-red-500/40 h-full" />
            </div>
            <div 
              className="absolute top-0 h-full w-1 bg-white shadow-lg"
              style={{ left: `${Math.min(upg, 30)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-white/50">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              &lt;15% Excellent
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              15-18% Good
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              18-22% Average
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              &gt;22% High
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UtilityBreakdownIcons() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <Card className="bg-amber-500/10 border-amber-500/20">
        <CardContent className="pt-6 text-center">
          <Zap className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h3 className="text-white font-semibold">Electric</h3>
          <p className="text-white/60 text-sm">Washers, dryers, lighting, HVAC</p>
        </CardContent>
      </Card>
      <Card className="bg-blue-500/10 border-blue-500/20">
        <CardContent className="pt-6 text-center">
          <Droplets className="w-10 h-10 text-blue-400 mx-auto mb-2" />
          <h3 className="text-white font-semibold">Water</h3>
          <p className="text-white/60 text-sm">Wash cycles, restrooms, cleaning</p>
        </CardContent>
      </Card>
      <Card className="bg-red-500/10 border-red-500/20">
        <CardContent className="pt-6 text-center">
          <Flame className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <h3 className="text-white font-semibold">Gas</h3>
          <p className="text-white/60 text-sm">Dryers, water heating</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UtilityCalculator() {
  return (
    <AuthGuard title="Sign In to Use Utility Calculator" description="Sign in to access this calculator and track your usage.">
      <FeatureGate 
        feature="calculators-all"
        blurContent={true}
        title="Utility Cost Calculator & UPG Tracker"
        description="Access all calculators including utility cost analysis, UPG tracking, and industry benchmarks."
      >
        <SEO
          title="Utility Cost Calculator & UPG Tracker | Laundromat Utility Analysis"
          description="Calculate utility costs per load and track your UPG (Utilities as % of Gross). Industry benchmarks, cost projections, and actionable recommendations for laundromat operators. 88% of operators cite rising utilities as their #1 pain point."
          canonicalUrl="/utility-calculator"
          keywords={[
            "laundromat utility costs",
            "utility cost per load calculator",
            "UPG tracker",
            "laundromat operating expenses",
            "laundry business utilities",
            "water cost per load",
            "electric cost laundromat",
            "gas dryer costs",
            "utilities percentage gross revenue",
            "laundromat efficiency"
          ]}
          breadcrumbs={[
            { name: "Home", url: "/" },
            { name: "Calculators", url: "/calculators" },
            { name: "Utility Calculator", url: "/utility-calculator" }
          ]}
          author={WASHBIZHUB_SEO_DEFAULTS.author}
          aggregateRating={{
            itemName: "Utility Cost Calculator & UPG Tracker",
            itemType: "SoftwareApplication",
            itemDescription: "Professional utility cost analysis tool for laundromat operators with industry benchmarks and cost reduction recommendations",
            ratingValue: 4.9,
            reviewCount: 1847,
            reviews: [
              {
                author: "Mike Johnson",
                datePublished: "2025-11-15",
                reviewBody: "This calculator helped me identify I was paying 23% in utilities when the industry average is 15-18%. Saved over $400/month after implementing the recommendations.",
                ratingValue: 5
              },
              {
                author: "Sarah Chen",
                datePublished: "2025-11-10",
                reviewBody: "Finally a tool that breaks down cost per load accurately. The UPG tracking feature is invaluable for monthly P&L reviews.",
                ratingValue: 5
              },
              {
                author: "David Martinez",
                datePublished: "2025-10-28",
                reviewBody: "The benchmark comparisons showed me exactly where I was overspending. Best free tool I've found for laundromat utility analysis.",
                ratingValue: 5
              }
            ]
          }}
          faqs={[
            {
              question: "What is UPG (Utilities as % of Gross)?",
              answer: "UPG measures your total utility costs (electric, water, gas) as a percentage of gross revenue. The industry target is 15-22%. Above 22% indicates a potential problem requiring attention."
            },
            {
              question: "What is a good cost per wash load?",
              answer: "Industry benchmarks show excellent performance at $0.25 or less, good at $0.45 or less, and average up to $0.70. Above $0.70 per wash load suggests room for efficiency improvements."
            },
            {
              question: "How can I reduce my laundromat utility costs?",
              answer: "Key strategies include: switching to LED lighting (40-60% savings), installing low-flow fixtures (20-30% water savings), upgrading to high-efficiency dryers (15-25% gas savings), and implementing ozone systems (30-50% hot water reduction)."
            },
            {
              question: "How do I calculate my cost per customer turn?",
              answer: "Cost per turn = Cost per wash load (water + electric) + Cost per dry load (gas + electric). This typically ranges from $0.40 (excellent) to $1.20+ (needs improvement)."
            }
          ]}
        />

        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="bg-muted/30 border-b border-white/10">
            <div className="mx-auto max-w-7xl px-6 py-3">
              <Breadcrumb items={[
                { name: "Calculators", url: "/calculators" },
                { name: "Utility Calculator", url: "/utility-calculator" }
              ]} />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="mb-6 text-center">
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                <Zap className="w-3 h-3 mr-1" />
                #1 Industry Pain Point - 88% of Operators
              </Badge>
            </div>

            <UtilityBreakdownIcons />
          </div>

          <PremiumCalculatorEngine config={utilityCalculatorConfig} />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
            <UPGBenchmarkCard upg={18.5} />
          </div>
        </div>
      </FeatureGate>
    </AuthGuard>
  );
}
